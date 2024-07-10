# -*- coding: utf-8 -*-
"""
:mod:`EdgarRenderer.Filing`
~~~~~~~~~~~~~~~~~~~
Edgar(tm) Renderer was created by staff of the U.S. Securities and Exchange Commission.
Data and content created by government employees within the scope of their employment
are not subject to domestic copyright protection. 17 U.S.C. 105.
"""

from gettext import gettext as _
from collections import defaultdict
import os, math, datetime, dateutil.relativedelta, lxml, sys, time
import regex as re
import arelle.ModelValue, arelle.XbrlConst
from arelle.ModelDtsObject import ModelConcept
from arelle.ModelObject import ModelObject
from arelle.XmlUtil import collapseWhitespace
from arelle.XmlValidateConst import VALID, VALID_NO_CONTENT
from lxml import etree

from . import Cube, Embedding, Report, PresentationGroup, Summary, Utils, Xlout

usGaapOrIfrsPattern = re.compile(".*/fasb[.]org/(us-gaap|srt)/20|.*/xbrl[.]ifrs[.]org/taxonomy/[0-9-]{10}/ifrs-full", re.I)
deiPattern = re.compile(".*/xbrl[.]sec[.]gov/dei/20", re.I)

def mainFun(controller, modelXbrl, outputFolderName, transform=None, suplSuffix=None, rFilePrefix=None, altFolder=None, altTransform=None, altSuffix=None, zipDir=None):
    if "EdgarRenderer/Filing.py#mainFun" in modelXbrl.arelleUnitTests:
        raise arelle.PythonUtil.pyNamedObject(modelXbrl.arelleUnitTests["EdgarRenderer/Filing.py#mainFun"], "EdgarRenderer/Filing.py#mainFun")
    _funStartedAt = time.time()
    filing = Filing(controller, modelXbrl, outputFolderName, transform, suplSuffix, rFilePrefix, altFolder, altTransform, altSuffix, zipDir)
    controller.logDebug("Filing initialized {:.3f} secs.".format(time.time() - _funStartedAt)); _funStartedAt = time.time()
    filing.populateAndLinkClasses()
    controller.logDebug("Filing populateAndLinkClasses {:.3f} secs.".format(time.time() - _funStartedAt)); _funStartedAt = time.time()

    sortedCubeList = sorted(filing.cubeDict.values(), key=lambda cube : cube.definitionText)

    for cube in sortedCubeList:
        filing.cubeDriverBeforeFlowThroughSuppression(cube)
        if not cube.isEmbedded and not cube.noFactsOrAllFactsSuppressed:
            embedding = Embedding.Embedding(filing, cube, [])
            cube.embeddingList = [embedding]
            filing.embeddingDriverBeforeFlowThroughSuppression(embedding)
    controller.logDebug("Filing cubes {:.3f} secs.".format(time.time() - _funStartedAt)); _funStartedAt = time.time()

    if not filing.hasEmbeddings:
        filing.filterOutColumnsWhereAllElementsAreInOtherReports(sortedCubeList) # otherwise known as flow through suppression
    controller.logDebug("Filing flow thru suppression {:.3f} secs.".format(time.time() - _funStartedAt)); _funStartedAt = time.time()

    # this complicated way to number files is all about maintaining re2 compatibility
    nextFileNum = controller.nextFileNum
    for cube in sortedCubeList:
        if not cube.excludeFromNumbering and len(cube.factMemberships) > 0:
            # even though there is embedding, and cubes might have more than one embedding and thus more than one report,
            # we still keep the fileNumber attribute on the cube and not the report, because if there are multiple embeddings
            # they all print in one file.
            cube.fileNumber = nextFileNum
            nextFileNum += 1
            modelXbrl.debug("debug",
                            _('File R%(cubeFileNumber)s is %(cubeFile)s %(cubeDefinition)s'),
                            modelObject=modelXbrl.modelDocument,
                            cubeFileNumber=cube.fileNumber, cubeFile=cube.linkroleUri, cubeDefinition=cube.definitionText)

            # we keep track of embedded cubes so that we know later if for some cubes, no embeddings were actually embedded.
            if cube.isEmbedded:
                filing.embeddedCubeSet.add(cube)
    controller.logDebug("Filing cube numbering {:.3f} secs.".format(time.time() - _funStartedAt)); _funStartedAt = time.time()

    # handle excel writing
    xlWriter = None
    if controller.excelXslt:
        if filing.hasEmbeddings:
            modelXbrl.debug("debug",
                            _("Excel XSLT is not applied to instance %(instance)s having embedded commands."),
                            modelObject=modelXbrl.modelDocument, instance=modelXbrl.modelDocument.basename)
        else:
            xlWriter = controller.xlWriter
            if not xlWriter:
                controller.xlWriter = xlWriter = Xlout.XlWriter(controller, outputFolderName)
    Summary.analyzeFactsInCubes(filing)
    controller.logDebug("Filing analyzeFactsInCubes {:.3f} secs.".format(time.time() - _funStartedAt)); _funStartedAt = time.time()

    #import win32process
    #print('memory '  + str(int(win32process.GetProcessMemoryInfo(win32process.GetCurrentProcess())['WorkingSetSize'] / (1024*1024))))

    # handle the steps after flow through and then emit all of the XML and write the files
    if outputFolderName is not None:
        modelXbrl.debug("debug",
                        _("Generating rendered reports in %(folder)s"),
                        modelObject=modelXbrl.modelDocument, folder=outputFolderName)
    else:
        modelXbrl.debug("debug",
                        _("Validating renderable reports"),
                        modelObject=modelXbrl.modelDocument)
    for cube in sortedCubeList:
        _funStartedAt = time.time()
        if cube.noFactsOrAllFactsSuppressed:
            for embedding in cube.embeddingList:
                Utils.embeddingGarbageCollect(embedding)
        elif cube.isEmbedded:
            continue # unless cube.noFactsOrAllFactsSuppressed we want to save it for later when we embed it
        else:
            embedding = cube.embeddingList[0]
            if not embedding.isEmbeddingOrReportBroken:
                filing.reportDriverAfterFlowThroughSuppression(embedding, xlWriter)
                filing.finishOffReportIfNotEmbedded(embedding)
            Utils.embeddingGarbageCollect(embedding)
        controller.logDebug("R{} total {:.3f} secs.".format(cube.fileNumber, time.time() - _funStartedAt))
        Utils.cubeGarbageCollect(cube)

    _funStartedAt = time.time()

    # now we make sure that every cube referenced by embedded command facts actually gets embedded.  this might not happen
    # if for example, the embedded command facts were all filtered out.  In that case, we make a generic embedding and
    # write it to a file, just like we would any other cube that isn't embedded anywhere by an embedding command fact.
    filing.disallowEmbeddings = True # this stops any more embeddings from happening

    for cube in filing.embeddedCubeSet:
        _funStartedAt = time.time()
        try:
            if cube.noFactsOrAllFactsSuppressed:
                continue
        except AttributeError: # may happen if it has been garbage collected above because cube.noFactsOrAllFactsSuppressed
            continue

        embedding = Embedding.Embedding(filing, cube, []) # make a generic embedding
        cube.embeddingList += [embedding]
        cube.isEmbedded = False
        filing.embeddingDriverBeforeFlowThroughSuppression(embedding)
        if not embedding.isEmbeddingOrReportBroken:
            # the second arg is None because we don't generate excel files for filings with embeddings.
            filing.reportDriverAfterFlowThroughSuppression(embedding, None)
            filing.finishOffReportIfNotEmbedded(embedding)

        # it might have other embeddings, but they didn't get embedded and we don't need them anymore.
        for embedding in cube.embeddingList:
            Utils.embeddingGarbageCollect(embedding)
        controller.logDebug("R{} total {:.3f} secs.".format(cube.fileNumber, time.time() - _funStartedAt))
        Utils.cubeGarbageCollect(cube)

    if len(filing.reportSummaryList) > 0:
        controller.nextFileNum = filing.reportSummaryList[-1].fileNumber + 1

    # have to do some massaging of filing.usedOrBrokenFactDefDict.  can't just do set(filing.usedOrBrokenFactDefDict).
    # that's because when you remove if you remove every thing in the set for one of the keys, the key still stays.
    # so we need to make sure they key has a nonempty set associated with it.
    filing.unusedFactSet = \
            set(modelXbrl.facts) - {fact for fact, embeddingSet in filing.usedOrBrokenFactDefDict.items() if len(embeddingSet) > 0}

    filing.strExplainSkippedFacts()

    if len(filing.unusedFactSet) > 0:
        filing.handleUncategorizedCube(xlWriter)
        controller.nextUncategorizedFileNum -= 1

    controller.instanceSummaryList += [Summary.InstanceSummary(filing, modelXbrl)]
    controller.logDebug("Filing finish {:.3f} secs.".format(time.time() - _funStartedAt)); _funStartedAt = time.time()
    return filing.reportSummaryList




class Filing(object):
    def __init__(self, controller, modelXbrl, outputFolderName, transform, suplSuffix, rFilePrefix, altFolder, altTransform, altSuffix, zipDir):
        self.modelXbrl = modelXbrl
        self.transform = transform
        self.suplSuffix = suplSuffix
        self.rFilePrefix = rFilePrefix
        self.altFolder = altFolder
        self.altTransform = altTransform
        self.altSuffix = altSuffix

        self.cubeDict = {}
        self.axisDict = {}
        self.memberDict = {}
        self.elementDict = {}
        self.factToQlabelsDict = {}
        self.symbolLookupDict = {}
        self.presentationUnitToConceptDict = {}

        self.embeddedCubeSet = set()
        self.usedOrBrokenFactDefDict = defaultdict(set)
        self.unusedFactSet = set()
        self.skippedFactsList = []

        self.hasEmbeddings = False
        self.disallowEmbeddings = True

        # These namespaces contain elements treated specially in some ways.
        # SEC and FASB namespaces have the same structure, IFRS namespaces not so much.
        self.stdNsTokens = set()
        self.ifrsNamespace = self.usgaapNamespace = self.deiNamespace = None
        nspattern = re.compile(r'.*((xbrl\.sec\.gov|fasb\.org)/(?P<prefix>[^/]+)/20.*|ifrs\.org/taxonomy/20[^/]*/(?P<other>ifrs)).*')
        for n in self.modelXbrl.namespaceDocs.keys():
            if n is None: continue
            m = nspattern.match(n)
            if m is None: continue
            tk = m.groupdict()['prefix']
            if tk is not None and len(tk) > 0:
                self.stdNsTokens.add(tk)
                if tk == 'us-gaap': self.usgaapNamespace = n
                elif tk == 'dei': self.deiNamespace = n
            tk = m.groupdict()['other']
            if tk is not None and len(tk) > 0:
                self.stdNsTokens.add(tk)
                self.ifrsNamespace = n

        self.isRR = 'rr' in self.stdNsTokens
        self.isOEF = 'oef' in self.stdNsTokens
        self.isRRorOEF = self.isRR or self.isOEF
        self.isVip = 'vip' in self.stdNsTokens
        self.isN3N4N6 = self.isVip
        self.isIfrs = 'ifrs' in self.stdNsTokens
        self.isUsgaap = 'us-gaap' in self.stdNsTokens
        self.isRxp = 'rxp' in self.stdNsTokens
        self.isShr = 'shr' in self.stdNsTokens

        self.edgarDocType = next((f.xValue for f in self.modelXbrl.factsByLocalName["DocumentType"]
                                      if (f.xValue is not None and f.context is not None and not f.context.hasSegment and f.xValid >= VALID)),None)

        self.isFeeExhibit = self.edgarDocType in ['EX-FILING FEES']

        n2_doc_pattern = r'497|N-2(/A|ASR|MEF| POSAR)?'
        self.isN2Prospectus = not(self.isRR) and self.edgarDocType is not None and bool(re.match(n2_doc_pattern,self.edgarDocType))

        ncsr_doc_pattern = r'N-CSRS?(/A)?'
        self.isNcsr = self.edgarDocType is not None and bool(re.match(ncsr_doc_pattern,self.edgarDocType))

        proxy_doc_pattern = r'DEF ?14.*'
        self.isProxy = self.edgarDocType is not None and bool(re.match(proxy_doc_pattern,self.edgarDocType))

        sdr_exh_pattern = r'EX-99.[KL] SDR.*'
        self.isSdr = self.edgarDocType is not None and bool(re.match(sdr_exh_pattern,self.edgarDocType))

        only_shr_pattern = r'EX-26|F-SR'
        self.isOnlyShr = self.edgarDocType is not None and bool(re.match(only_shr_pattern,self.edgarDocType))

        fs_doc_pattern = r'(10-[QK]|[24]0-F)(/A)?'
        self.isDefinitelyFs = self.edgarDocType is not None and re.match(fs_doc_pattern,self.edgarDocType) or self.isSdr
        self.isN1a = self.isRR or (self.isOEF and not self.isNcsr)
        self.isDefinitelyNotFs = not self.isDefinitelyFs and (self.isN1a or self.isVip or self.isN3N4N6 or self.isN2Prospectus or self.isProxy or self.isRxp or self.isOnlyShr)

        nsWithFacts = set(qn.namespaceURI for qn in modelXbrl.factsByQname.keys() if qn)
        self.isOnlyDei = all(deiPattern.match(ns) for ns in nsWithFacts)
        controller.hasXlout = getattr(controller,'hasXlout',False) or not self.isDefinitelyNotFs or self.isOnlyDei

        self.builtinEquityColAxes = [('dei',self.deiNamespace,'LegalEntityAxis'),
                                     ('ifrs-full',self.ifrsNamespace,'ComponentsOfEquityAxis'),
                                     ('us-gaap',self.usgaapNamespace,'StatementEquityComponentsAxis'),
                                     ('us-gaap',self.usgaapNamespace,'PartnerCapitalComponentsAxis'),
                                     ('us-gaap',self.usgaapNamespace,'StatementClassOfStockAxis')
                                     ]
        self.builtinEquityRowAxes = [('us-gaap',self.usgaapNamespace,'CreationDateAxis'), # us-gaap deprecated 2019 absent after 2021.
                                     ('ifrs-full',self.ifrsNamespace,'CreationDateAxis'),
                                     ('us-gaap',self.usgaapNamespace,'StatementScenarioAxis'),
                                     ('us-gaap',self.usgaapNamespace,'AdjustmentsForNewAccountingPronouncementsAxis'),
                                     ('us-gaap',self.usgaapNamespace,'AdjustmentsForChangeInAccountingPrincipleAxis'),
                                     ('us-gaap',self.usgaapNamespace,'ErrorCorrectionsAndPriorPeriodAdjustmentsRestatementByRestatementPeriodAndAmountAxis'),
                                     ('ifrs-full',self.ifrsNamespace,'RetrospectiveApplicationAndRetrospectiveRestatementAxis')
                                     ]
        self.builtinAxisOrders = [(arelle.ModelValue.QName('us-gaap',self.usgaapNamespace,'StatementScenarioAxis'),
                                   ['ScenarioPreviouslyReportedMember',
                                    'RestatementAdjustmentMember',
                                    'ChangeInAccountingPrincipleMember'],
                                   ['ScenarioUnspecifiedDomain']) # never deprecated, moved to srt in 2019
                                  ,(arelle.ModelValue.QName('ifrs-full',self.ifrsNamespace,'RetrospectiveApplicationAndRetrospectiveRestatementAxis')
                                   ,['PreviouslyStatedMember'
                                     ,'IncreaseDecreaseDueToChangesInAccountingPolicyAndCorrectionsOfPriorPeriodErrorsMember'
                                     ,'FinancialEffectOfChangesInAccountingPolicyMember'
                                     ,'IncreaseDecreaseDueToChangesInAccountingPolicyRequiredByIFRSsMember'
                                     ,'IncreaseDecreaseDueToVoluntaryChangesInAccountingPolicyMember'
                                     ,'FinancialEffectOfCorrectionsOfAccountingErrorsMember'
                                     ]
                                   ,['RestatedMember'])
                                  ]
        self.builtinLineItems = [arelle.ModelValue.QName('us-gaap',self.usgaapNamespace,'StatementLineItems')
                                 ,arelle.ModelValue.QName('ifrs-full',self.ifrsNamespace,'StatementOfChangesInEquityLineItems')
                                 ]
        self.segmentHeadingStopList = [arelle.ModelValue.QName(x,y,z) for x,y,z in self.builtinEquityRowAxes]

        self.factToEmbeddingDict = {}
        self.factFootnoteDict = defaultdict(list)
        self.startEndContextDict = {}

        self.numReports = 0

        self.controller = controller
        self.validatedForEFM = controller.validatedForEFM
        self.reportXmlFormat = 'xml' in controller.reportFormat.casefold()
        self.reportHtmlFormat = 'html' in controller.reportFormat.casefold()
        self.fileNamePrefix = 'R'
        if controller.reportZip:
            self.fileNameBase = None
            self.reportZip = controller.reportZip
            self.zipDir = zipDir or ""
        elif outputFolderName is not None:
            # self.fileNameBase = os.path.normpath(os.path.join(os.path.dirname(controller.webCache.normalizeUrl(modelXbrl.fileSource.basefile)) ,outputFolderName))
            self.fileNameBase = outputFolderName
            if not os.path.exists(self.fileNameBase):  # This is usually the Reports subfolder.
                os.mkdir(self.fileNameBase)
            self.reportZip = None
        else:
            self.fileNameBase = self.reportZip = None

        self.reportSummaryList = []

        self.rowSeparatorStr = ' | '
        self.titleSeparatorStr = ' - '
        self.verboseHeadingsForDebugging = False
        self.ignoredPreferredLabels = [] # locations where the preferred label role was incompatible with the concept type.
        self.entrypoint = modelXbrl.modelDocument.basename

    def __str__(self):
        return "[Filing {!s}]".format(self.entrypoint)



    def populateAndLinkClasses(self, uncategorizedCube = None):
        duplicateFacts = self.modelXbrl.duplicateFactSet = set()
        dupFactFootnoteOrigin = {} # original fact of duplicate

        if uncategorizedCube is not None:
            for fact in self.unusedFactSet:
                # we know these facts aren't broken, because broken facts weren't added to self.unusedFactSet.
                try:
                    element = self.elementDict[fact.qname]
                except KeyError:
                    element = Element(fact.concept)
                    self.elementDict[fact.qname] = element
                    element.linkCube(uncategorizedCube)
            uncategorizedCube.presentationGroup = PresentationGroup.PresentationGroup(self, uncategorizedCube)
            facts = self.unusedFactSet

        else:
            # build cubes
            for linkroleUri in self.modelXbrl.relationshipSet(arelle.XbrlConst.parentChild).linkRoleUris:
                cube = Cube.Cube(self, linkroleUri)
                self.cubeDict[linkroleUri] = cube
                cube.presentationGroup = PresentationGroup.PresentationGroup(self, cube)

            # handle axes across all cubes where defaults are missing in the definition or presentation linkbases
            # presentation linkbase
            parentChildRelationshipSet = self.modelXbrl.relationshipSet(arelle.XbrlConst.parentChild)
            parentChildRelationshipSet.loadModelRelationshipsTo()
            parentChildRelationshipSet.loadModelRelationshipsFrom()
            # Find the axes in presentation groups
            toDimensions = {c for c in parentChildRelationshipSet.modelRelationshipsTo.keys() if isinstance(c,ModelConcept) and c.isDimensionItem}
            fromDimensions = {c for c in parentChildRelationshipSet.modelRelationshipsFrom.keys() if isinstance(c,ModelConcept) and c.isDimensionItem}
            # definition linkbase
            dimensionDefaultRelationshipSet = self.modelXbrl.relationshipSet(arelle.XbrlConst.dimensionDefault)
            dimensionDefaultRelationshipSet.loadModelRelationshipsFrom()
            for concept in set.union(fromDimensions,toDimensions):
                defaultSet = {ddrel.toModelObject for ddrel in dimensionDefaultRelationshipSet.modelRelationshipsFrom[concept]}
                for linkroleUri in {pcrel.linkrole for pcrel in parentChildRelationshipSet.modelRelationshipsFrom[concept]}:
                    # although valid XBRL has at most one default, we don't assume it; instead we act like it's a set of defaults.
                    # check to see whether the defaults are all children of the axis in this presentation group.
                    defaultChildSet = {pcrel.toModelObject
                                       for pcrel in Utils.modelRelationshipsTransitiveFrom(parentChildRelationshipSet, concept, linkroleUri, set())
                                       if pcrel.toModelObject in defaultSet}
                    if (len(defaultSet)==0  # axis had no default at all
                            or defaultSet != defaultChildSet):
                        cube = self.cubeDict[linkroleUri]
                        cube.defaultFilteredOutAxisSet.add(concept.qname)

            # print warnings of missing defaults for each cube
            for cube in self.cubeDict.values():
                if len(cube.defaultFilteredOutAxisSet) > 0:
                    self.modelXbrl.debug("debug",
                                         _("In \"%(linkroleName)s\", the children of axes %(axes)s do not include their defaults."),
                                         modelObject=self.modelXbrl.modelDocument, linkroleName=cube.shortName,
                                         axes=cube.defaultFilteredOutAxisSet)

            footnoteRelationships = self.modelXbrl.relationshipSet('XBRL-footnotes')

            # initialize elements
            for qname, factSet in self.modelXbrl.factsByQname.items():
                # we are looking to see if we have "duplicate" facts.  a duplicate fact is one with the same qname, context and unit
                # as another fact.  Also, keep the first fact with an 'en-US' language, or if there is none, keep the first fact.
                # the others need to be proactively added to the set of unused facts.
                if len(factSet) > 1:
                    def factSortKey (fact):
                        if getattr(fact,"xValid", 0) < VALID:
                            return ("", "", "")
                        if fact.isNumeric:
                            if fact.isNil: discriminator = float("INF") # Null values always last
                            elif fact.decimals is None: discriminator = 0 # Can happen with invalid xbrl
                            else:  discriminator = 0 - float(fact.decimals) # Larger decimal values come first
                        else: # non-numeric
                            if fact.isNil: discriminator = '\uffff' # Null values always last (highest 2-byte unicode character)
                            elif fact.xmlLang in ('en-US','en-us'): discriminator = 'aa-AA' # en-US comes first.  en-us is canonical form
                            elif fact.xmlLang is None: discriminator = 'aa-AA' # no lang means en-US
                            else: discriminator = fact.xmlLang # followed by all others
                        return (fact.contextID,discriminator,fact.sourceline) # sourceLine is the tiebreaker
                    sortedFactList = sorted(factSet, key = factSortKey)
                    while len(sortedFactList) > 0:
                        firstFact = sortedFactList.pop(0)
                        if getattr(firstFact,"xValid", 0) < VALID:
                            continue
                        lineNumOfFactWeAreKeeping = firstFact.sourceline
                        discardedLineNumberList = []
                        discardedCounter = 0
                        discardedFactList = []
                        # finds facts with same qname, context and unit as firstFact
                        while (len(sortedFactList) > 0 and
                               getattr(sortedFactList[0],"xValid", 0) >= VALID and
                               sortedFactList[0].qname == firstFact.qname and
                               sortedFactList[0].context == firstFact.context and
                               sortedFactList[0].unitID == firstFact.unitID):
                            discardedCounter += 1
                            fact = sortedFactList.pop(0)
                            duplicateFacts.add(fact) # not keeping this fact
                            discardedFactList += [fact]
                            if footnoteRelationships.fromModelObject(fact): # does duplicate have any footnotes?
                                dupFactFootnoteOrigin[fact] = firstFact # track first fact for footnotes from duplicate
                            discardedLineNumberList += [str(fact.sourceline)] # these are added in sorted order by sourceline (should be an ordered set)

                        if discardedCounter > 0:
                            # start it off because we can assume that these facts have a qname and a context
                            qnameContextIDUnitStr = 'qname {!s}, context {}'.format(firstFact.qname, firstFact.contextID)
                            if firstFact.unit is not None:
                                qnameContextIDUnitStr += ', unit ' + firstFact.unitID
                            self.modelXbrl.debug("debug",
                                                 _("There are multiple facts with %(contextUnitIds)s. The first fact on line %(lineNumOfFactWeAreKeeping)s of the instance "
                                                   "document will be rendered, and the rest at line(s) %(linesDiscarded)s will not."),
                                                 modelObject=[firstFact]+discardedFactList, contextUnitIds=qnameContextIDUnitStr,
                                                 lineNumOfFactWeAreKeeping=lineNumOfFactWeAreKeeping,
                                                 linesDiscarded=', '.join(discardedLineNumberList))

                for fact in factSet: # we only want one thing, but we don't want to pop from the set so we "loop" and then break right away
                    if getattr(fact,"xValid", 0) < VALID:
                        continue
                    elif fact.concept is None:
                        if not self.validatedForEFM:
                            self.modelXbrl.error("xbrl:schemaImportMissing", # use standard Arelle message for this
                                    _("Instance fact missing schema definition: %(elements)s"),
                                    modelObject=fact, elements=fact.prefixedName)
                        break
                    elif fact.isTuple:
                        if not self.validatedForEFM:
                            self.modelXbrl.error("EFM.6.07.19", # use standard Arelle message for this
                                _("You provided an extension concept which is a tuple, %(concept)s.  "
                                  "Please remove tuples and check your submission."),
                                edgarCode="cp-0719-No-Tuple-Element",
                                modelObject=fact, concept=qname)
                        break
                    elif fact.concept.type is None:
                        if not self.validatedForEFM:
                            self.modelXbrl.warning("xbrl:typeDeclarationMissing",
                                                   _("The Type declaration for Element %(fact)s is either broken or missing. The "
                                                    "Element will be ignored."),
                                                   modelObject=fact, fact=qname)
                        break
                    elif fact.context is None or fact.xValid < VALID or (not fact.context.isForeverPeriod and fact.context.endDatetime is None):
                        continue # don't break, still might be good facts. we print the error if a context is broken later

                    self.elementDict[qname] = Element(fact.concept)
                    break # we don't need to look at more facts from the fact set, we're just trying to make elements.

            # build presentation groups
            for concept in self.modelXbrl.qnameConcepts.values():
                for relationship in self.modelXbrl.relationshipSet(arelle.XbrlConst.parentChild).toModelObject(concept):
                    cube = self.cubeDict[relationship.linkrole]
                    cube.presentationGroup.traverseToRootOrRoots(concept, None, None, None, []) # HF: path to roots has to be list for proper error reporting
                    try:
                        element = self.elementDict[concept.qname] # retrieve active Element
                        element.linkCube(cube) # link element to this cube.
                    except KeyError:
                        pass

            # footnotes from firstFact of possibly merged duplicates
            for relationship in footnoteRelationships.modelRelationships:
                # relationship.fromModelObject is a fact
                # relationship.toModelObject is a resource
                # make sure Element is active and that no Error is caught by relationshipErrorThrower()
                # if relationship.fromModelObject.qname in self.elementDict and not self.relationshipErrorThrower(relationship, 'Footnote'):
                #if relationship.fromModelObject.qname in self.elementDict:
                # HF: link footnote to first fact if a duplicate fact
                if relationship.fromModelObject not in dupFactFootnoteOrigin:
                    # only process firstFact footnotes on this pass
                    self.factFootnoteDict[relationship.fromModelObject].append((relationship.toModelObject, relationship.toModelObject.viewText()))

            # now the duplicates, if footnote not already in the firstFact footnotes list
            for relationship in footnoteRelationships.modelRelationships:
                dupFirstFact = dupFactFootnoteOrigin.get(relationship.fromModelObject)
                if dupFirstFact is not None:
                    _contentsDuplicated = False
                    _contents = collapseWhitespace(relationship.toModelObject.viewText())
                    # check that footnote isn't a complete duplicate of footnote already in footnoteDict
                    for _otherResource, _otherContents in self.factFootnoteDict[dupFirstFact]:
                        if _contents == collapseWhitespace(_otherContents): # compare as normalized string
                            _contentsDuplicated = True
                            break
                    if not _contentsDuplicated:
                        self.factFootnoteDict[dupFirstFact].append((relationship.toModelObject, relationship.toModelObject.viewText()))

            facts = self.modelXbrl.facts

        for context in self.modelXbrl.contexts.values():
            if context.scenario is not None and not self.validatedForEFM:
                _childTagNames = [child.prefixedName for child in context.scenario.iterchildren()
                                  if isinstance(child,ModelObject)]
                childTags = ", ".join(_childTagNames)
                self.modelXbrl.error("EFM.6.05.05", # use standard arelle message
                                _("There must be no segments with non-explicitDimension content, but %(count)s was(were) "
                                  "found: %(content)s."),
                                edgarCode="cp-0505-Segment-Child-Not-Explicit-Member",
                                modelObject=context, context=context.id, content=childTags, count=len(_childTagNames),
                                elementName="segment")

        for fact in facts:
            try:
                element = self.elementDict[fact.qname]
            except KeyError:
                self.usedOrBrokenFactDefDict[fact].add(None) #now bad fact won't come back to bite us when processing isUncategorizedFacts
                continue # fact was rejected in first loop of this function because of problem with the Element

            if getattr(fact,"xValid", 0) < VALID:
                self.usedOrBrokenFactDefDict[fact].add(None) #now bad fact won't come back to bite us when processing isUncategorizedFacts
                continue

            elif fact.unit is None and fact.unitID is not None: # to do a unitref that isn't a unit should be found by arelle, but isn't.
                if not self.validatedForEFM: # use Arelle validation message
                    self.modelXbrl.error("xbrl.4.6.2:numericUnit",
                         _("Fact %(fact)s context %(contextID)s is numeric and must have a unit"),
                         modelObject=fact, fact=fact.qname, contextID=fact.contextID)
                self.usedOrBrokenFactDefDict[fact].add(None) #now bad fact won't come back to bite us when processing isUncategorizedFacts
                continue

            elif fact.context is None:
                if not self.validatedForEFM: # use Arelle validation message
                    self.modelXbrl.error("xbrl.4.6.1:itemContextRef",
                        _("Item %(fact)s must have a context"),
                        modelObject=fact, fact=fact.qname)
                self.usedOrBrokenFactDefDict[fact].add(None) #now bad fact won't come back to bite us when processing isUncategorizedFacts
                continue

            # this is after we check for the bad stuff so that we make sure not to put those into usedOrBrokenFactDefDict
            # so that they don't break when processing isUncategorizedFacts
            elif fact in duplicateFacts:
                # actually, the duplication of a fact does not mean it is unused.
                self.usedOrBrokenFactDefDict[fact].add(None)
                continue

            elif Utils.isNotRendered(fact):
                self.usedOrBrokenFactDefDict[fact].add(None)

            # first see if fact's value is an embedded command, then check if it's a qlabel fact.
            if not fact.isNumeric:
                if fact.concept.isTextBlock:
                    isEmbeddedCommand = self.checkForEmbeddedCommandAndProcessIt(fact)
                else:
                    isEmbeddedCommand = False

                if not isEmbeddedCommand and re.compile('[^:]+:[^:]+').match(fact.value): # regex for exactly one colon.
                    try:
                        prefix, ignore, localName = fact.value.partition(':')
                        namespaceURI = self.modelXbrl.prefixedNamespaces[prefix]
                        qname = arelle.ModelValue.QName(prefix, namespaceURI, localName)
                        if qname in self.modelXbrl.qnameConcepts:
                            self.factToQlabelsDict[fact] = [qname]
                    except KeyError:
                        pass

                if (not isEmbeddedCommand
                    and fact.concept is not None
                    and fact.concept.isEnumeration2Item
                    and type(fact.xValue)==list):
                    self.factToQlabelsDict[fact] = []
                    for qname in fact.xValue:
                        if qname in self.modelXbrl.qnameConcepts:
                            self.factToQlabelsDict[fact] += [qname]

            axisMemberLookupDict = {}

            # add period and unit to axisMemberLookupDict
            startEndContext = None
            con = fact.context
            if fact.context is not None:
                if con.instantDatetime is not None: # is an instant
                    startEndTuple = (None, con.instantDatetime)
                else: # is a startEndContext
                    startEndTuple = (con.startDatetime, con.endDatetime)
                if startEndTuple[1] is not None: # updated to allow facts without dates to work (#835)
                    startEndContext = self.startEndContextDict.get(startEndTuple)
                    if startEndContext is None:
                        startEndContext = StartEndContext(con, startEndTuple)
                        self.startEndContextDict[startEndTuple] = startEndContext
                    axisMemberLookupDict['period'] = startEndContext

            if fact.unit is not None:
                axisMemberLookupDict['unit'] = fact.unit.id

            # add each axis to axisMemberLookupDict
            for arelleDimension in fact.context.qnameDims.values():
                dimensionConcept = arelleDimension.dimension
                memberConcept = arelleDimension.member
                if dimensionConcept is None:
                    if not self.validatedForEFM: # use Arelle validation message
                        self.modelXbrl.error("xbrldie:TypedMemberNotTypedDimensionError" if arelleDimension.isTyped else "xbrldie:ExplicitMemberNotExplicitDimensionError",
                            _("Context %(contextID)s %(dimension)s %(value)s is not an appropriate dimension item"),
                            modelObject=(arelleDimension,fact), contextID=fact.context.id,
                            dimension=arelleDimension.prefixedName, value=arelleDimension.dimensionQname,
                            messageCodes=("xbrldie:TypedMemberNotTypedDimensionError", "xbrldie:ExplicitMemberNotExplicitDimensionError"))

                elif arelleDimension.isExplicit and memberConcept is None:
                    if not self.validatedForEFM: # use Arelle validation message
                        self.modelXbrl.error("xbrldie:ExplicitMemberUndefinedQNameError",
                            _("Context %(contextID)s explicit dimension %(dimension)s member %(value)s is not a global member item"),
                            modelObject=(arelleDimension,fact), contextID=fact.context.id,
                            dimension=arelleDimension.dimensionQname, value=arelleDimension.memberQname)
                elif arelleDimension.isTyped and arelleDimension.typedMember.xValid < VALID:
                    self.modelXbrl.debug("debug",
                        _("Context %(contextID)s typed dimension %(dimension)s member %(value)s is not an xml schema validated value"),
                        modelObject=(arelleDimension,fact), contextID=fact.context.id,
                        dimension=arelleDimension.dimensionQname, value=arelleDimension.typedMember.text)
                else:
                    try:
                        axis = self.axisDict[dimensionConcept.qname]
                    except KeyError:
                        axis = Axis(dimensionConcept)
                        for relationship in self.modelXbrl.relationshipSet(arelle.XbrlConst.dimensionDefault).fromModelObject(dimensionConcept):
                            axis.defaultArelleConcept = relationship.toModelObject
                            break
                        self.axisDict[dimensionConcept.qname] = axis
                    if arelleDimension.isExplicit: # if true, Member exists, else None. there's also isTyped, for typed dims.
                        try:
                            member = self.memberDict[memberConcept.qname]
                        except KeyError:
                            member = Member(explicitMember=memberConcept)
                            self.memberDict[memberConcept.qname] = member
                        member.linkAxis(axis)
                        axis.linkMember(member)
                        axisMemberLookupDict[axis.arelleConcept.qname] = member.arelleConcept.qname
                    elif arelleDimension.isTyped:
                        member = Member(typedMember=arelleDimension.typedMember)
                        try: # replace with equivalent member, if there is one
                            member = self.memberDict[member] # use previous member object
                        except KeyError:
                            self.memberDict[member] = member
                        member.linkAxis(axis)
                        axis.linkMember(member)
                        axisMemberLookupDict[axis.arelleConcept.qname] = member

                    # while we're at it, do some other stuff
                    for cube in element.inCubes.values():
                        cube.hasAxes[axis.arelleConcept.qname] = axis
                        cube.hasMembers.add(member)
                        axis.linkCube(cube)

            for cube in element.inCubes.values():
                # the None in the tuple is only to handle periodStartLabels and periodEndLabels later on
                cube.factMemberships += [(fact, axisMemberLookupDict, None)]
                cube.hasElements.add(fact.concept)
                if fact.unit is not None:
                    cube.unitAxis[fact.unit.id] = fact.unit
                if startEndContext is not None:
                    cube.timeAxis.add(startEndContext)




    def checkForEmbeddedCommandAndProcessIt(self, fact):
        # partition('~') on a string breaks up a string into a tuple with before the first ~, the ~, and then after the ~.
        ignore, tilde, rightOfTilde = fact.value.partition('~')
        if tilde == '':
            return False
        leftOfTilde, tilde, ignore = rightOfTilde.partition('~')
        if not tilde or not leftOfTilde or leftOfTilde.isspace():
            return False
        commandText = leftOfTilde

        # we take out the URI first, because it might have double quotes in it and we want to cleanse the rest of the
        # command of double quotes since the separator command wraps the separator character in double quotes.
        commandTextList = commandText.split(maxsplit=1) # this is a list of length 1 or 2.
        if not commandTextList: # if no list contents, then it's not an embedded command
            return False
        linkroleUri = commandTextList.pop(0) # now commandTextList is a list of length 0 or 1
        try:
            cube = self.cubeDict[linkroleUri]
        except KeyError:
            return False # not a valid linkroleUri
        if len(commandTextList) > 0:
            commandTextList = commandTextList[0].replace('"', ' ')
            commandTextList = commandTextList.split()

        outputList = []
        tokenCounter = 1
        while len(commandTextList) > 0:
            listToAddToOutput = []

            token0 = commandTextList.pop(0)
            tokenCounter += 1
            token0Lower = token0.casefold()
            if token0Lower in {'row', 'column'}:
                listToAddToOutput += [token0Lower]
            else:
                errorStr = Utils.printErrorStringToDiscribeEmbeddedTextBlockFact(fact)
                #message = ErrorMgr.getError('EMBEDDED_COMMAND_TOKEN_NOT_ROW_OR_COLUMN_ERROR').format(token0, tokenCounter, errorStr)
                self.modelXbrl.error("EFM.6.26.04.embeddingCmdMalformedDirectionToken",
                                     _("In ''%(linkroleName)s'', the embedded report created by the fact %(fact)s with the context "
                                       "%(contextID)s, the token %(token)s, at position %(position)s in the list of tokens, is malformed. "
                                       "Each iterator can only start with 'row' or 'column'."),
                                     edgarCode="rq-2604-Embedding-Command-Malformed-Direction-Token",
                                     modelObject=fact, linkrole=linkroleUri, fact=fact.qname, contextID=fact.contextID,
                                     linkroleDefinition=self.modelXbrl.roleTypeDefinition(linkroleUri), linkroleName=self.modelXbrl.roleTypeName(linkroleUri),
                                     token=token0, position=tokenCounter)
                return False

            if len(commandTextList) > 0:
                token1 = commandTextList.pop(0)
            else:
                token1 = "missing" # token is issing
            tokenCounter += 1
            token1Lower = token1.casefold()
            _malformedAxis = False
            if token1Lower in {'period', 'unit', 'primary'}:
                listToAddToOutput += [token1Lower]
            elif '_' in token1:
                qn = arelle.ModelValue.qname(fact, token1.replace('_',':',1)) # only replace first _, because qnames can have _
                axisConcept = self.modelXbrl.qnameConcepts.get(qn)
                if axisConcept is not None and axisConcept.isDimensionItem:
                    listToAddToOutput += [qn]
                else:
                    _malformedAxis = True

            # separator is not supported, we just pop it off and ignore it
            elif token1Lower == 'separator':
                if commandTextList.pop(0).casefold() == 'segment':
                    commandTextList.pop(0)
                    tokenCounter += 1
                tokenCounter += 1
                errorStr = Utils.printErrorStringToDiscribeEmbeddedTextBlockFact(fact)
                #message = ErrorMgr.getError('EMBEDDED_COMMAND_SEPARATOR_USED_WARNING').format(token1, tokenCounter, errorStr)
                self.modelXbrl.info("info",
                                    _("The token at position %(position)s in the list of tokens in %(list)s, is separator. "
                                        "Currently, this keyword is not supported and was ignored."),
                                    modelObject=fact, position=tokenCounter, list=errorStr)
                continue

            else:
                _malformedAxis = True

            if _malformedAxis:
                errorStr = Utils.printErrorStringToDiscribeEmbeddedTextBlockFact(fact)
                #message = ErrorMgr.getError('EMBEDDED_COMMAND_INVALID_FIRST_TOKEN_ERROR').format(token1, tokenCounter, errorStr)
                self.modelXbrl.error("EFM.6.26.04.embeddingCmdMalformedAxis",
                                    _("In ''%(linkroleName)s'', the embedded report created by the fact %(fact)s with the context "
                                      "%(contextID)s, the token %(token)s, at position %(position)s in the list of tokens, is malformed. "
                                      "This token can only be 'period', 'unit', 'primary' or identify an Axis by its namespace prefix, "
                                      "underscore, and element name."),
                                    edgarCode="rq-2604-Embedding-Command-Malformed-Axis",
                                    modelObject=fact, linkrole=linkroleUri, fact=fact.qname, contextID=fact.contextID,
                                    linkroleDefinition=self.modelXbrl.roleTypeDefinition(linkroleUri), linkroleName=self.modelXbrl.roleTypeName(linkroleUri),
                                    token=token1, position=tokenCounter)
                return False

            token2 = commandTextList.pop(0)
            tokenCounter += 1
            token2Lower = token2.casefold()
            if token2Lower in {'compact', 'nodisplay'}:
                listToAddToOutput += [token2Lower]
            elif token2Lower == 'grouped':
                listToAddToOutput += ['compact']
                errorStr = Utils.printErrorStringToDiscribeEmbeddedTextBlockFact(fact)
                #message = ErrorMgr.getError('EMBEDDED_COMMAND_GROUPED_USED_WARNING').format(token2, tokenCounter, errorStr)
                self.modelXbrl.info("info",
                                    _("The token at position %(position)s in the list of tokens in %(list)s, is grouped. "
                                        "Currently, this keyword is not supported and was replaced with compact."),
                                    modelObject=fact, position=tokenCounter, list=errorStr)
            elif token2Lower == 'unitcell':
                listToAddToOutput += ['compact']
                errorStr = Utils.printErrorStringToDiscribeEmbeddedTextBlockFact(fact)
                #message = ErrorMgr.getError('EMBEDDED_COMMAND_UNITCELL_USED_WARNING').format(token2, tokenCounter, errorStr)
                self.modelXbrl.info("info",
                                    _("The token at position %(position)s in the list of tokens in %(list)s, is unitcell. "
                                        "Currently, this keyword is not supported and was replaced with compact."),
                                    modelObject=fact, position=tokenCounter, list=errorStr)
            else:
                errorStr = Utils.printErrorStringToDiscribeEmbeddedTextBlockFact(fact)
                #message = ErrorMgr.getError('EMBEDDED_COMMAND_INVALID_SECOND_TOKEN_ERROR').format(token2, tokenCounter, errorStr)
                self.modelXbrl.error("EFM.6.26.04.embeddingCmdMalformedStyleToken",
                                     _("In ''%(linkroleName)s'', the embedded report created by the fact %(fact)s, with the context "
                                       "%(contextID)s, the style keyword %(style)s is not one of 'compact' or 'nodisplay'."),
                                     edgarCode="rq-2604-Embedding-Command-Malformed-Style-Token",
                                     modelObject=fact, linkrole=linkroleUri, fact=fact.qname, contextID=fact.contextID,
                                     linkroleDefinition=self.modelXbrl.roleTypeDefinition(linkroleUri), linkroleName=self.modelXbrl.roleTypeName(linkroleUri),
                                     style=token2)
                return False

            # there could be multiple members, so grab them all here
            tempList = []
            while len(commandTextList) > 0 and commandTextList[0].casefold() not in {'row', 'column'}:
                tempList += [commandTextList.pop(0)]

            invalidTokens = []
            for tokenMember in tempList:
                tokenCounter += 1
                if '_' in tokenMember:
                    qn = arelle.ModelValue.qname(fact, tokenMember.replace('_',':',1))
                    memConcept = self.modelXbrl.qnameConcepts.get(qn)
                    if memConcept is not None and memConcept.type is not None and memConcept.type.isDomainItemType:
                        listToAddToOutput += [qn]
                    else:
                        invalidTokens.append(tokenMember)
                elif tokenMember == '*' and len(tempList) == 1:
                    listToAddToOutput += [tokenMember]
                else:
                    invalidTokens.append(tokenMember)

            if invalidTokens:
                errorStr = Utils.printErrorStringToDiscribeEmbeddedTextBlockFact(fact)
                #message = ErrorMgr.getError('EMBEDDED_COMMAND_INVALID_MEMBER_NAME_ERROR').format(tokenMember, tokenCounter, errorStr)
                self.modelXbrl.error("EFM.6.26.04.embeddingCmdMalformedMember",
                                     _("In ''%(linkroleName)s'', the embedded report created by the fact %(fact)s with the context "
                                       "%(contextID)s, the keyword(s) %(tokenlist)s is not '*', a valid member qname or list of "
                                       "valid member qnames."),
                                     edgarCode="rq-2604-Embedding-Command-Malformed-Member",
                                     modelObject=fact, linkrole=linkroleUri, fact=fact.qname, contextID=fact.contextID,
                                     linkroleDefinition=self.modelXbrl.roleTypeDefinition(linkroleUri), linkroleName=self.modelXbrl.roleTypeName(linkroleUri),
                                     tokenlist=", ".join(invalidTokens))
                return False

            outputList += [listToAddToOutput]

        cube.isEmbedded = True
        self.hasEmbeddings = True
        self.disallowEmbeddings = False

        embedding = Embedding.Embedding(self, cube, outputList, factThatContainsEmbeddedCommand = fact)
        cube.embeddingList += [embedding]
        self.factToEmbeddingDict[fact] = embedding
        return True





    def handleUncategorizedCube(self, xlWriter):
        # get a fresh start, kill all the old data structures that get built in populateAndLinkClasses()
        for element in self.elementDict.values():
            element.__dict__.clear()
            del element
        self.elementDict = {}

        for cube in self.cubeDict.values():
            cube.__dict__.clear()
            del cube
        self.cubeDict = {}

        for member in self.memberDict.values():
            member.__dict__.clear()
            del member
        self.memberDict = {}

        for axis in self.axisDict.values():
            axis.__dict__.clear()
            del axis
        self.axisDict = {}

        for startEndContext in self.startEndContextDict.values():
            startEndContext.__dict__.clear()
            del startEndContext
        self.startEndContextDict = {}

        uncategorizedCube = Cube.Cube(self, 'http://xbrl.sec.gov/role/uncategorizedFacts')
        uncategorizedCube.fileNumber = self.controller.nextUncategorizedFileNum
        uncategorizedCube.shortName = uncategorizedCube.definitionText = 'Uncategorized Items - ' + self.entrypoint
        uncategorizedCube.isElements = True

        # now run populateAndLinkClasses() again and let it re-populate and re-link everything from scratch but let it do so
        # only with filing.unusedFactSet as it's fact set and with only the uncategorizedCube, and no other cubes.
        self.cubeDict[uncategorizedCube.linkroleUri] = uncategorizedCube
        self.populateAndLinkClasses(uncategorizedCube = uncategorizedCube)

        self.cubeDriverBeforeFlowThroughSuppression(uncategorizedCube)
        embedding = Embedding.Embedding(self, uncategorizedCube, [])
        uncategorizedCube.embeddingList = [embedding]
        self.embeddingDriverBeforeFlowThroughSuppression(embedding)
        self.reportDriverAfterFlowThroughSuppression(embedding, xlWriter)
        self.finishOffReportIfNotEmbedded(embedding)
        Utils.embeddingGarbageCollect(embedding)
        Utils.cubeGarbageCollect(uncategorizedCube)




    def cubeDriverBeforeFlowThroughSuppression(self, cube):
        if cube.isUncategorizedFacts:
            cube.presentationGroup.generateUncategorizedFactsPresentationGroup()
        else:
            if len(cube.hasElements) == 0 or len(cube.factMemberships) == 0:
                cube.noFactsOrAllFactsSuppressed = True
                return
            cube.presentationGroup.startPreorderTraversal()
            if cube.noFactsOrAllFactsSuppressed:
                return
            cube.areTherePhantomAxesInPGWithNoDefault()
            if cube.noFactsOrAllFactsSuppressed:
                return

            if len(cube.periodStartEndLabelDict) > 0:
                cube.handlePeriodStartEndLabel() # needs preferred labels from the presentationGroup

        cube.populateUnitPseudoaxis()
        cube.populatePeriodPseudoaxis()

        if self.controller.debugMode:
            cube.printCube()


    def embeddingDriverBeforeFlowThroughSuppression(self, embedding):
        cube = embedding.cube

        embedding.generateStandardEmbeddedCommandsFromPresentationGroup()
        if cube.isTransposed:
            embedding.handleTransposedByModifyingCommandText()
        embedding.buildAndProcessCommands()
        if embedding.isEmbeddingOrReportBroken:
            return

        embedding.processOrFilterFacts()
        if embedding.isEmbeddingOrReportBroken:
            return

        embedding.possiblyReorderUnitsAfterTheFactAccordingToPresentationGroup()

        if self.controller.debugMode:
            embedding.printEmbedding()

        report = embedding.report = Report.Report(self, cube, embedding)
        report.generateRowsOrCols('col', sorted(embedding.factAxisMemberGroupList, key=lambda thing: thing.axisMemberPositionTupleColList))

        # this is because if the {Elements} view is used, then you might have lots of facts right next to each other with the same qname
        # this is fine, but each time you render, they might appear in a different order.  so this will sort the facts by source line
        # so that each run the same facts don't appear in different orders.
        if cube.isElements:
            sortedFAMGL = sorted(embedding.factAxisMemberGroupList, key=lambda thing: (thing.axisMemberPositionTupleRowList, thing.fact.sourceline))
        else:
            sortedFAMGL = sorted(embedding.factAxisMemberGroupList, key=lambda thing: thing.axisMemberPositionTupleRowList)
        report.generateRowsOrCols('row', sortedFAMGL)

        if not cube.isElements:
            if self.hasEmbeddings:
                report.decideWhetherToRepressPeriodHeadings()
            if not cube.isUnlabeled:
                report.proposeAxisPromotions('col', report.colList, [command.pseudoAxis for command in embedding.colCommands])
                report.proposeAxisPromotions('row', report.rowList, [command.pseudoAxis for command in embedding.rowCommands])
            if embedding.rowUnitPosition != -1:
                report.mergeRowsOrColsIfUnitsCompatible('row', report.rowList)
            elif embedding.columnUnitPosition != -1:
                report.mergeRowsOrColsIfUnitsCompatible('col', report.colList)

            if embedding.rowPeriodPosition != -1:
                report.mergeRowsOrColsInstantsIntoDurationsIfUnitsCompatible('row', report.rowList)
            elif embedding.columnPeriodPosition != -1:
                report.mergeRowsOrColsInstantsIntoDurationsIfUnitsCompatible('col', report.colList)

            report.hideRedundantColumns()


    def reportDriverAfterFlowThroughSuppression(self, embedding, xlWriter):
        report = embedding.report
        cube = embedding.cube
        _rStartedAt = time.time()

        if embedding.rowPeriodPosition != -1:
            report.HideAdjacentInstantRows()
        elif cube.isStatementOfCashFlows:
            self.RemoveStuntedCashFlowColumns(report)

        report.finalizeProposedPromotions()
        if not cube.isUncategorizedFacts: report.scaleUnitGlobally()

        if      (len(self.factFootnoteDict) > 0 and
                 not {factAxisMemberGroup.fact for factAxisMemberGroup in embedding.factAxisMemberGroupList}.isdisjoint(self.factFootnoteDict)):
            report.handleFootnotes()
            report.setAndMergeFootnoteRowsAndColumns('row', report.rowList)
            report.setAndMergeFootnoteRowsAndColumns('col', report.colList)

        report.removeVerticalInteriorSymbols()
        self.controller.logDebug("R{} cols, rows, footnotes {:.3f} secs.".format(cube.fileNumber, time.time() - _rStartedAt)); _rStartedAt = time.time()

        #if len(embedding.groupedAxisQnameSet) > 0:
        #    report.handleGrouped()

        if cube.isElements or not cube.isEmbedded:
            if      (embedding.columnPeriodPosition != -1 or
                     {command.pseudoAxis for command in embedding.rowCommands}.isdisjoint(self.segmentHeadingStopList)):
                report.makeSegmentTitleRows()

            # if embedding.rowPrimaryPosition != -1, then primary elements aren't on the rows, so no abstracts to add
            if embedding.rowPrimaryPosition != -1 and not cube.isUnlabeled:
                report.addAbstracts()
        self.controller.logDebug("R{} titles {:.3f} secs.".format(cube.fileNumber, time.time() - _rStartedAt)); _rStartedAt = time.time()

        if cube.isElements:
            report.generateRowAndOrColHeadingsForElements()
        else:
            report.generateRowAndOrColHeadingsGeneralCase()
        self.controller.logDebug("R{} headings {:.3f} secs.".format(cube.fileNumber, time.time() - _rStartedAt)); _rStartedAt = time.time()

        report.emitRFile()
        self.controller.logDebug("R{} emit RFile {:.3f} secs.".format(cube.fileNumber, time.time() - _rStartedAt))

        if xlWriter and self.controller.hasXlout: # not (self.isRR or self.isVip or self.isN2Prospectus or self.isFeeExhibit):
            # we pass the cube's shortname since it doesn't have units and stuff tacked onto the end.
            _rStartedAt = time.time()
            xlWriter.createWorkSheet(cube.fileNumber, cube.shortName)
            xlWriter.buildWorkSheet(report)
            self.controller.logDebug("R{} xlout total {:.3f} secs.".format(cube.fileNumber, time.time() - _rStartedAt))


    def finishOffReportIfNotEmbedded(self, embedding):
        _rStartedAt = time.time()
        reportSummary = ReportSummary()
        embedding.report.createReportSummary(reportSummary)
        embedding.report.writeHtmlAndOrXmlFiles(reportSummary)
        self.reportSummaryList += [reportSummary]
        self.controller.logDebug("R{} summary {:.3f} secs.".format(embedding.cube.fileNumber, time.time() - _rStartedAt))


    def RemoveStuntedCashFlowColumns(self,report):
        visibleColumns = [col for col in report.colList if (not col.isHidden and col.startEndContext is not None)]
        if not visibleColumns:
            return
        didWeHideAnyCols = False
        remainingVisibleColumns = visibleColumns.copy()
        maxMonths = max(col.startEndContext.numMonths for col in visibleColumns)
        minFacts = min(len(col.factList) for col in visibleColumns if col.startEndContext.numMonths==maxMonths)
        minToKeep = math.floor(.25*minFacts)
        for col in visibleColumns:
            if col.startEndContext.numMonths < maxMonths and len(col.factList) < minToKeep:
                self.modelXbrl.info("info",
                                    _("Columns in cash flow \"%(presentationGroup)s\" have maximum duration %(maxDuration)s months and at least %(minNumValues)s "
                                      "values. Shorter duration columns must have at least one fourth (%(minToKeep)s) as many values. "
                                      "Column \"%(startEndContext)s\" is shorter (%(months)s months) and has only %(numValues)s values, so it is being removed."),
                                    modelObject=self.modelXbrl.modelDocument, presentationGroup=report.shortName,
                                    maxDuration=maxMonths, minNumValues=minFacts, minToKeep=minToKeep, startEndContext=col.startEndContext,
                                    months=col.startEndContext.numMonths, numValues=len(col.factList))
                col.hide()
                didWeHideAnyCols = True
                remainingVisibleColumns.remove(col)
                for fact in col.factList:
                    appearsInOtherColumn = False
                    for otherCol in remainingVisibleColumns:
                        if fact in otherCol.factList:
                            appearsInOtherColumn = True
                            break
                    if not appearsInOtherColumn:
                        # first kick this fact out of report.embedding.factAxisMemberGroupList, our defacto list of facts
                        report.embedding.factAxisMemberGroupList = \
                                [FAMG for FAMG in report.embedding.factAxisMemberGroupList if FAMG.fact != fact]
                        try:
                            self.usedOrBrokenFactDefDict[fact].remove(report.embedding)
                        except KeyError:
                            pass

        if didWeHideAnyCols:
            Utils.hideEmptyRows(report.rowList)






    # this is only for financial reports, so we know that there are no embedded commands.  this means that for each cube,
    # there is only one embedding object, but we have to get that this way: cube.embeddingList[0].  also, always, in general
    # each embedding only ever has one and only one report.  so for financial reports, report is cube.embeddingList[0].report.
    def filterOutColumnsWhereAllElementsAreInOtherReports(self, sortedCubeList):
        # we separate nonStatementElementsAndElementMemberPairs from all of the cubes because we can do this just once and not run through them each time
        statementCubesList = []
        nonStatementElementsAndElementMemberPairs = set()
        for cube in sortedCubeList:
            if not cube.noFactsOrAllFactsSuppressed and len(cube.embeddingList) == 1 and not cube.embeddingList[0].isEmbeddingOrReportBroken:
                if cube.cubeType == 'statement' and not cube.isStatementOfEquity:
                    statementCubesList += [cube]
                else:
                    nonStatementElementsAndElementMemberPairs.update(cube.embeddingList[0].hasElementsAndElementMemberPairs)

        for i, cube in enumerate(statementCubesList):
            # initialize to all the non statement elements and non statement element member pairs
            elementQnamesInOtherReportsAndElementQnameMemberPairs = nonStatementElementsAndElementMemberPairs.copy()
            # now add other statements
            for j, otherStatement in enumerate(statementCubesList):
                if i != j:
                    elementQnamesInOtherReportsAndElementQnameMemberPairs.update(otherStatement.embeddingList[0].hasElementsAndElementMemberPairs)
            # now elementQnamesInOtherReportsAndElementQnameMemberPairs has all the qnames used in every other report except for the statement we're using

            report = cube.embeddingList[0].report # we know there's no embeddings, so the report is on the first and only embedding
            columnsToKill = []

            elementQnamesThatWillBeKeptProvidingThatWeHideTheseCols = set() # if we kill a few cols, we will want to update embedding.hasElements
            for col in report.colList:

                if not col.isHidden:
                    setOfElementQnamesInCol = {fact.qname for fact in col.factList}
                    setOfElementQnamesAndQnameMemberPairsForCol = setOfElementQnamesInCol.union(col.elementQnameMemberForColHidingSet)
                    # the operator <= means subset, not a proper subset.  so if all the facts in the column are elsewhere, then hide column.
                    if setOfElementQnamesAndQnameMemberPairsForCol <= elementQnamesInOtherReportsAndElementQnameMemberPairs:
                        columnsToKill += [col]
                    else:
                        elementQnamesThatWillBeKeptProvidingThatWeHideTheseCols.update(setOfElementQnamesInCol)

            if 0 < len(columnsToKill) < report.numVisibleColumns:
                cube.embeddingList[0].hasElements = elementQnamesThatWillBeKeptProvidingThatWeHideTheseCols # update hasElements, might have less now
                # TODO: that is a bug; subsequent flow through tests the following property, not just the .hasElements property. -wch
                cube.embeddingList[0].hasElementsAndElementMemberPairs = elementQnamesThatWillBeKeptProvidingThatWeHideTheseCols;
                for col in columnsToKill:
                    col.hide()
                    #print("cube {} removing col {}".format(cube.shortName,col.__dict__))

                self.modelXbrl.info("info",
                                    _("In \"%(presentationGroup)s\", column(s) %(columns)s are contained in other reports, so were removed by flow through suppression."),
                                    modelObject=self.modelXbrl.modelDocument, presentationGroup=cube.shortName,
                                    columns=', '.join([str(col.index + 1)+"("+col.context.id+")" for col in columnsToKill]))
                Utils.hideEmptyRows(report.rowList)


    def strExplainSkippedFacts(self):
        for fact, role, ignore1, linkroleUri, shortName, definitionText in self.skippedFactsList:
            if fact in self.unusedFactSet:
                # we skipped over this fact because it could not be placed
                # Produce a string explaining for this instant fact why it could not be presented
                # with a periodStart or periodEnd label in this presentation group.
                value = Utils.strFactValue(fact, preferredLabel=role)
                endTime = fact.context.period.stringValue.strip()
                if Utils.isPeriodStartLabel(role):
                    word = 'starting'
                elif Utils.isPeriodEndLabel(role):
                    word = 'ending'
                else:
                    word = 'Starting or Ending'
                self.modelXbrl.warning("EFM.6.26.02",
                               _('In "%(linkroleName)s", fact %(fact)s with value %(value)s and preferred label %(preferredLabelValue)s, '
                                 'was not shown because there are no facts in a duration %(startOrEnd)s at %(date)s. Change the preferred label role or add facts.'),
                                modelObject=fact, fact=fact.qname, value=value,  startOrEnd=word, date=endTime,
                                preferredLabel=role, preferredLabelValue=role,
                                linkrole=linkroleUri, linkroleDefinition=definitionText, linkroleName=shortName)

class ReportSummary(object):
    def __init__(self):
        self.order = None
        self.isDefault = None
        self.hasEmbeddedReports = None
        self.longName = None
        self.shortName = None
        self.role = None
        self.logList = None
        self.xmlFileName = None
        self.htmlFileName = None
        self.isUncategorized = False

class StartEndContext(object):
    def __init__(self, context, startEndTuple):
        # be really careful when using this context.  many contexts from the instance can share this object,
        # probably not the right one.
        self.context = context
        self.startTime = startEndTuple[0]
        self.endTime = startEndTuple[1]
        if context is not None and context.isForeverPeriod:
            self.label = "forever"
            self.periodTypeStr = 'forever'
            self.startTimePretty = None
            self.numMonths = 0
            self.endTimePretty = None
            self.startTime = datetime.datetime.min
            self.endTime = datetime.datetime.max
        else:
            endDateTime = self.endTime - datetime.timedelta(days=1)
            abbr= '.'
            if endDateTime.month == 5: abbr = ''
            self.label = endDateTime.strftime('%b'+abbr+' %d, %Y')
            if self.startTime == None:
                self.periodTypeStr = 'instant'
                self.startTimePretty = None
                self.numMonths = 0
            else:
                self.periodTypeStr = 'duration'
                self.startTimePretty = (self.startTime).strftime('%Y-%m-%dT%H:%M:%S')
                self.numMonths = self.startEndContextInMonths()
            self.endTimePretty = endDateTime.strftime('%Y-%m-%dT%H:%M:%S')

    def startEndContextInMonths(self):
        modifiedEndTime = self.endTime
        try:
            modifiedEndTime = self.endTime + datetime.timedelta(days=15) # we add to it because it rounds down
        except OverflowError:
            modifiedEndTime = datetime.datetime(datetime.MAXYEAR,12,31,0,0)
        delta = dateutil.relativedelta.relativedelta(modifiedEndTime, self.startTime)
        return delta.years * 12 + delta.months

    def startOrInstantTime(self):
        if self.startTime is None:
            return self.endTime
        return self.startTime

    def __str__(self):
        if self.periodTypeStr=='instant':
            return "[{}]".format(self.endTimePretty[:10])
        else:
            return "[{} {}m {}]".format(self.startTimePretty[:10],self.numMonths,self.endTimePretty[:10])

class Axis(object):
    def __init__(self, arelleConcept):
        self.inCubes = {}
        self.hasMembers = set()
        self.arelleConcept = arelleConcept
        self.defaultArelleConcept = None
    def linkCube(self, cubeObj):
        self.inCubes[cubeObj.linkroleUri] = cubeObj
    def linkMember(self, memObj):
        self.hasMembers.add(memObj)
    def __repr__(self):
        return "axis(arelleConcept={}, default={})".format(self.arelleConcept, self.defaultArelleConcept)

class Member(object):
    def __init__(self, explicitMember=None, typedMember=None):
        self.hasMembers = set() # HF: now set of Member objects (was list of expl dim QNames before)
        self.arelleConcept = explicitMember
        self.typedValue = self.typedKey = typedHash = self.typedMemberIsNil = None
        if typedMember is not None:
            self.typedValue = []
            self.typedKey = []
            for typedElt in typedMember.iter(etree.Element): # restrict to elements only
                self.initTypedElt(typedElt)
            self.typedValue = ", ".join(self.typedValue) # for printing
            typedHash = tuple(self.typedKey) # can only hash a tuple
            if len(self.typedKey) == 1:
                self.typedKey = self.typedKey[0] # non-complex typed dimension
        self.axis = None
        self.parent = None
        self.memberHash = hash((hash(self.arelleConcept), hash(typedHash)))
    def initTypedElt(self, typedElt):
        if VALID <= getattr(typedElt, "xValid") < VALID_NO_CONTENT:
            if typedElt.get("{http://www.w3.org/2001/XMLSchema-instance}nil") in ("true", "1"):
                self.typedMemberIsNil = True
            typedValue = getattr(typedElt, "xValue", None)
            try:
                self.typedKey.append(typedElt.modelXbrl.qnameConcepts[typedElt.qname].type.facets["enumeration"][typedElt.xValue].objectIndex)
            except (AttributeError, IndexError, KeyError, TypeError):
                self.typedKey.append(typedValue)
            if isinstance(typedValue, arelle.ModelValue.IsoDuration):
                self.typedValue.append(typedValue.viewText()) # duration in words instead of lexical notation
            else:
                self.typedValue.append(str(typedValue)) # displayable typed value
    @property
    def memberValue(self):
        if self.arelleConcept is not None:
            return self.arelleConcept.qname
        else:
            return self.typedValue
    @property
    def typedMemberSortKey(self):
        return self.typedKey or self.typedValue

    def linkAxis(self, axisObj):
        self.axis = axisObj
    def linkParent(self, parentObj):
        self.parent = parentObj
    def __repr__(self):
        return str(self.memberValue)
    # functions required for dict key and value comparison of Member
    def __hash__(self):
        return self.memberHash
    def __eq__(self,other):
        if not isinstance(other, Member):
            return False
        if (self.arelleConcept is None) ^ (other.arelleConcept is None):
            return False # both must be typed or explicit
        if self.arelleConcept is not None:
            # explicit dimension
            return self.arelleConcept.prefixedName == other.arelleConcept.prefixedName
        # typed dimension
        return self.typedMemberIsNil == other.typedMemberIsNil and self.typedValue == other.typedValue
    def __ne__(self,other):
        return not self.__eq__(other)
    def __lt__(self,other):
        if not isinstance(other, Member):
            return False
        if self.arelleConcept is not None:
            if other.arelleConcept is not None:
                return self.arelleConcept.prefixedName < other.arelleConcept.prefixedName
            return True
        if self.typedMemberIsNil:
            return not other.typedMemberIsNil
        if other.typedMemberIsNil:
            return False
        try:
            return self.typedValue < other.typedValue
        except TypeError: # might be int vs string
            return str(self.typedValue) < str(other.typedValue)
    def __le__(self,other):
        if not isinstance(other, Member):
            return False
        if self.arelleConcept is not None:
            if other.arelleConcept is not None:
                return self.arelleConcept.prefixedName <= other.arelleConcept.prefixedName
            return True
        if self.typedMemberIsNil:
            return not other.typedMemberIsNil
        if other.typedMemberIsNil:
            return True
        try:
            return self.typedValue <= other.typedValue
        except TypeError: # might be int vs string
            return str(self.typedValue) <= str(other.typedValue)
    def __gt__(self,other):
        if not isinstance(other, Member):
            return True
        if self.arelleConcept is not None:
            if other.arelleConcept is not None:
                return self.arelleConcept.prefixedName > other.arelleConcept.prefixedName
            return False
        if self.typedMemberIsNil:
            return other.typedMemberIsNil
        if other.typedMemberIsNil:
            return True
        try:
            return self.typedValue > other.typedValue
        except TypeError: # might be int vs string
            return str(self.typedValue) > str(other.typedValue)
    def __ge__(self,other):
        if not isinstance(other, Member):
            return True
        if self.arelleConcept is not None:
            if other.arelleConcept is not None:
                return self.arelleConcept.prefixedName >= other.arelleConcept.prefixedName
            return False
        if self.typedMemberIsNil:
            return other.typedMemberIsNil
        if other.typedMemberIsNil:
            return True
        try:
            return self.typedValue >= other.typedValue
        except TypeError: # might be int vs string
            return str(self.typedValue) >= str(other.typedValue)
    def __bool__(self):
        if self.arelleConcept is not None:
            return bool(self.arelleConcept)
        # typed member
        if self.typedMemberIsNil:
            return True
        return bool(self.typedValue)

class Element(object):
    def __init__(self, arelleConcept):
        self.inCubes = {}
        self.arelleConcept = arelleConcept
    def linkCube(self, cube):
        self.inCubes[cube.linkroleUri] = cube