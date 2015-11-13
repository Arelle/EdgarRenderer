# -*- coding: utf-8 -*-
"""
:mod:`EdgarRenderer.Summary`
Edgar(tm) Renderer was created by staff of the U.S. Securities and Exchange Commission.
Data and content created by government employees within the scope of their employment 
are not subject to domestic copyright protection. 17 U.S.C. 105.
"""

import sys, traceback, os.path, re, math, io, logging
from collections import defaultdict
from lxml.etree import Element, SubElement
import arelle.ModelDtsObject, arelle.XbrlConst
from . import IoManager, Utils

metaversion = "2.0"
EJson = 'MetaLinks' + ".json"
SFile = 'FilingSummary' + ".xml"

def mergeCountDicts(iterable, dictAttribute=None, key=None):
    'Return a dictionary merged from a collection of dictionaries, with values summed.'
    newdict = defaultdict(int)    
    for thing in iterable:
        d = thing
        if (type(dictAttribute) == str             
            and hasattr(thing, dictAttribute)):
            d = getattr(thing, dictAttribute)
        for k, v in d.items():
            if (key is None or k == key): newdict[k] += v
    return newdict 

def analyzeFactsInCubes(filing): # void
    controller = filing.controller
    if not controller.auxMetadata: return
    factCubeCount = controller.factCubeCount = defaultdict(lambda:0)
    factHasHtmlAnchor = controller.factHasHtmlAnchor = defaultdict(set)
    roleHasHtmlAnchor = controller.roleHasHtmlAnchor = defaultdict(set)
    for cube in filing.cubeDict.values():
        for factMembership in cube.factMemberships:
            f = factMembership[0]
            factCubeCount[f] += 1 # count how many cubes each fact appeared in.
            if f.concept.isTextBlock:
                for e in f.iter('*'): # for some reason iter('a') does not work.
                    if e.localName=='a' and \
                        not 'href' in e.attrib and \
                        ('id' in e.attrib \
                            or 'name' in e.attrib):
                            atts = e.elementAttributesStr
                            roleHasHtmlAnchor[cube.linkroleUri].add((str(f.qname),f.contextID,f.xmlLang,atts))
                            factHasHtmlAnchor[f].add((f,cube,atts,e.sourceline))
    messages = []
    for s in factHasHtmlAnchor.values():
        for v in s:
            messages += [v]
    for v in sorted(messages,key=lambda x: x[3]): # Messages should be ordered by line number in source doc.
        (f,cube,atts,line) = v
        filing.modelXbrl.debug("debug", # NOTE FOR INLINE IMPLEMENTATION should be cascade of error detected by XhtmlValidate.py
                               _("Fact %(fact)s in context %(context)s "
                                 "in \"%(cube)s\" has an HTML anchor (%(anchor)s) that "
                                 "may restrict with usability of the Inline XBRL source document. "
                                 "Please move the HTML anchor outside of the ix:nonNumeric element."),
                               modelObject=f, fact=f.qname, context=f.contextID,
                               cube=cube.shortName, anchor=atts)

class Summary(object):
    def __init__(self, controller):
        self.controller = controller
        self.rootETree = None   
        self.reportFormat = controller.reportFormat
        self.instanceSummaryList = controller.instanceSummaryList
        self.reportsFolder = str(controller.reportsFolder)
        self.summaryList = controller.instanceSummaryList
        self.entrypoint = controller.entrypoint
        summaries = self.instanceSummaryList                
        self.contextCount = sum(s.contextCount for s in summaries)
        self.entityCount = sum(s.entityCount for s in summaries)
        self.segmentCount = sum(s.segmentCount for s in summaries)
        self.unitCountDict = mergeCountDicts(summaries, dictAttribute='unitCountDict')
        self.unitCount = sum(self.unitCountDict.values())
        self.keyStandard = sum([s.primaryCountDict[False] for s in summaries])
        self.keyCustom = sum([s.primaryCountDict[True] for s in summaries])
        self.axisStandard = sum([s.axisInUseCountDict[False] for s in summaries]) 
        self.axisCustom = sum([s.axisInUseCountDict[True] for s in summaries])
        self.memberStandard = sum([s.memberCountDict[False] for s in summaries])
        self.memberCustom = sum([s.memberCountDict[True] for s in summaries])
        self.footnotesReported = 0 < sum([s.footnoteCount for s in summaries])
        self.scenarioCount = sum([s.scenarioCount for s in summaries])
        self.hasRR = next((True for s in summaries if s.hasRR), False)
        dtsroots = []
        for s in summaries:  # collect a list in order, but skip duplicates if they should occur           
            for dtsroot in s.dtsroots:
                if dtsroot not in dtsroots:
                    dtsroots += [dtsroot]
        self.dtsroots = dtsroots
        qnameSet = set()
        refSet = set()  # all references, with key being the tuple itself.
        for s in summaries:  # Uniquify the references across all instances
            qnameSet = qnameSet.union(s.qnameInUseSet)
            refSet = refSet.union(s.refSet)
        self.elementCount = self.keyStandard+self.keyCustom
        self.qnameSet = qnameSet
        self.refSet = refSet
        self.referencePositionDict = dict()
        for i, r in enumerate(refSet):
            self.referencePositionDict[r] = i
            
    @property
    def menuStyle(self):
        if self.hasRR: return 'RiskReturn'
        return 'Other'
       
    def __str__(self):
        return "[Summary {} {}]".format(self.menuStyle, self.controller.entrypoint)

    def buildSummaryETree(self):
        try:
            nsmap = {}  # {'xsi' : 'http://www.w3.org/2001/XMLSchema-instance'}
            self.rootETree = Element('FilingSummary', nsmap=nsmap)
            self.appendSummaryHeader()
            self.myReportsETree = SubElement(self.rootETree, 'MyReports')
            isRR = self.menuStyle == 'RiskReturn'
            for i, instanceSummary in enumerate(self.instanceSummaryList):
                instanceSummary.appendToFilingSummary(self.myReportsETree, i == 1, isRR, False)
            for i, instanceSummary in enumerate(self.instanceSummaryList):
                instanceSummary.appendToFilingSummary(self.myReportsETree, i == 1, isRR, True)
            self.appendSummaryFooter()
            return self.rootETree
        except Exception as err:
            self.controller.logError(str(err) + str(traceback.format_tb(sys.exc_info()[2])))
    
    def appendSummaryHeader(self):
        rootETree = self.rootETree
        SubElement(rootETree, 'Version').text = self.controller.VERSION 
        SubElement(rootETree, 'ProcessingTime') 
        SubElement(rootETree, 'ReportFormat').text = self.controller.reportFormat
        SubElement(rootETree, 'ContextCount').text = str(self.contextCount)        
        SubElement(rootETree, 'ElementCount').text = str(self.elementCount)        
        SubElement(rootETree, 'EntityCount').text = str(self.entityCount)  
        SubElement(rootETree, 'FootnotesReported').text = str(self.footnotesReported).casefold()
        SubElement(rootETree, 'SegmentCount').text = str(self.segmentCount)
        SubElement(rootETree, 'ScenarioCount').text = str(self.scenarioCount)
        SubElement(rootETree, 'TuplesReported').text = str(False).casefold()        
        SubElement(rootETree, 'UnitCount').text = str(self.unitCount)

    def appendSummaryFooter(self):
        # The last Report is a placeholder for the concatenation of all reports
        # The concatenation is performed by a javascript function written by Summarize.xslt
        reportETree = SubElement(self.myReportsETree, 'Report')
        SubElement(reportETree, 'IsDefault').text = 'false'
        SubElement(reportETree, 'HasEmbeddedReports').text = 'false'
        SubElement(reportETree, 'LongName').text = 'All Reports'
        SubElement(reportETree, 'ReportType').text = 'Book'
        SubElement(reportETree, 'ShortName').text = 'All Reports'

        if self.controller.includeLogsInSummary:
            # only output 100 warnings or errors max, after that it's not helpful.
            ''' Replace with cntlr log buffer
            for i, errmsg in enumerate(self.controller.ErrorMsgs):
                if i == 0:
                    logs = SubElement(self.rootETree, 'Logs')
                if i == 100:
                    SubElement(logs, 'Log', type='Info').text = "There are more than 100 warnings or errors, only 100 will be displayed."
                    break
                SubElement(logs, 'Log', type=errmsg.msgCode.title()).text = errmsg.msg
            '''
            logHandler = self.controller.cntlr.logHandler
            numShownMessages = 0
            for logRec in getattr(logHandler, "logRecordBuffer", ()): # non buffered handlers don't keep log records (e.g., log to print handler)
                if logRec.levelno > logging.INFO:
                    if numShownMessages == 0:
                        logs = SubElement(self.rootETree, 'Logs')
                    if numShownMessages == 100:
                        SubElement(logs, 'Log', type='Info').text = "There are more than 100 warnings or errors, only 100 will be displayed."
                        break
                    _text = self.controller.formatLogMessage(logRec)
                    SubElement(logs, 'Log', type=logRec.levelname.title()).text = _text
                    numShownMessages += 1

        inputFilesEtree = SubElement(self.rootETree, 'InputFiles')
        sourceDict = self.controller.sourceDict
        for l in [self.controller.instanceList, self.controller.inlineList, self.controller.otherXbrlList]:
            for file in l:
                s = SubElement(inputFilesEtree, 'File')
                if file in sourceDict: 
                    (doctype, original) = sourceDict[file]
                    s.set('doctype', doctype)
                    s.set('original', original)
                elif file in self.controller.inlineList:
                    s.set('doctype','(Source)')
                    s.set('original', file)
                s.text = str(os.path.basename(file))
        supplementalFilesEtree = SubElement(self.rootETree, 'SupplementalFiles')
        for file in self.controller.supplementalFileList:
            SubElement(supplementalFilesEtree, 'File').text = str(file)
        SubElement(self.rootETree, 'BaseTaxonomies')
        hasPresentationLinkbase = next((True for s in self.instanceSummaryList
                                        if s.hasPresentationLinkbase), False)
        hasCalculationLinkbase = next((True for s in self.instanceSummaryList
                                        if s.hasCalculationLinkbase), False)
        SubElement(self.rootETree, 'HasPresentationLinkbase').text = str(hasPresentationLinkbase).casefold()
        SubElement(self.rootETree, 'HasCalculationLinkbase').text = str(hasCalculationLinkbase).casefold()


    def writeMetaFiles(self):
        def innerWriteMetaFiles():
            roots = {'version' : metaversion}            
            refs = roots['std_ref'] = {}
            pairs = [(i, ref) for ref, i in self.referencePositionDict.items()]  
            pairs.sort(key=lambda x: x[0]) 
            for pair in pairs:                
                i, ref = pair
                rDict = refs['r'+str(i)] = {}
                for (att, val) in ref:  rDict[att] = val        
            roots['instance'] = {}
            for s in self.summaryList:
                root = roots['instance'][' '.join(s.dtsroots)] = {}                
                if s.customPrefix is not None: root['nsprefix'] = s.customPrefix
                if s.customNamespace is not None: root['nsuri'] = s.customNamespace
                root['dts'] = s.dts
                root['keyStandard'] = s.primaryCountDict[False]
                root['keyCustom'] = s.primaryCountDict[True]
                root['axisStandard'] =s.axisInUseCountDict[False]
                root['axisCustom'] =s.axisInUseCountDict[True]
                root['memberStandard'] =s.memberCountDict[False]
                root['memberCustom'] =s.memberCountDict[True]
                root['hidden'] = {'total' : sum(s.hiddenCountDict.values())}                            
                for ns, n in s.hiddenCountDict.items(): root['hidden'][ns] = n
                root['contextCount'] = s.contextCount
                root['entityCount'] = s.entityCount
                root['segmentCount'] = s.segmentCount
                root['elementCount'] = len(s.conceptInUseSet)
                root['unitCount'] = sum(s.unitCountDict.values())                
                reportDict = root['report'] = {}
                isDefault = True
                for i,r in enumerate(s.reportSummaryList):
                    report = reportDict[r.htmlFileName[:-4]] = {}                    
                    report['role']=r.role
                    report['longName'] = r.longName
                    report['shortName'] = r.shortName
                    report['isDefault'] = str(isDefault).casefold()
                    isDefault = False
                    groupType = ''
                    if isDisclosure(r.longName): groupType = 'disclosure'
                    elif isStatement(r.longName): groupType = 'statement'
                    elif isDocument(r.longName): groupType = 'document'
                    report['groupType'] = groupType
                    subGroupType = ''
                    if isParenthetical(r.longName): subGroupType = 'parenthetical'
                    elif isPolicy(r.longName): subGroupType = 'policies'
                    elif isTable(r.longName): subGroupType = 'tables'
                    elif isDetail(r.longName): subGroupType = 'details'
                    elif isUncategorized(r.longName): subGroupType = 'Uncategorized'
                    report['subGroupType'] = subGroupType
                    report['firstAnchor'] = r.firstAnchor
                    report['uniqueAnchor'] = r.uniqueAnchor
                    for (qname,context,lang,atts) in r.htmlAnchors:
                        if ('htmlAnchors' not in report): report['htmlAnchors'] = []
                        report['htmlAnchors'] += [{'qname':qname,'context':context,'lang':lang,'attributes':atts}]
                        
                for tagAa in s.tagDict.values():
                    qname = '{' + tagAa['nsuri'] + '}' + tagAa['localname']
                    numList = []
                    for r in (s.qnameReferenceDict.get(qname) or []):
                        numList += [self.referencePositionDict[r]]
                    numList.sort()
                    tagAa['auth_ref'] = ['r'+str(num) for num in numList]
                root['tag'] = s.tagDict           
            if self.controller.reportZip:
                file = io.StringIO()
            else:
                file = os.path.join(self.controller.reportsFolder, EJson)
            IoManager.writeJsonDoc(roots,file)
            self.controller.renderedFiles.add(EJson)
            if self.controller.reportZip:
                file.seek(0)
                self.controller.reportZip.writestr(EJson, file.read().encode("utf-8"))
                file.close()
                del file  # dereference
        if self.controller.debugMode: innerWriteMetaFiles()
        else:
            try: innerWriteMetaFiles()
            except Exception as err: self.controller.logError(str(err) + str(traceback.format_tb(sys.exc_info()[2])))

class InstanceSummary(object):
          
    def __init__(self, filing, modelXbrl):
        self.hasPresentationLinkbase = []
        self.hasCalculationLinkbase = []
        self.footnoteCount = 0
        
        contextSet = set(modelXbrl.contexts.values())
        contextsInUseSet = set()
        self.contextCount = 0
        
        entitySet = set()
        entityInUseSet = set()
        
        segmentSet = set()
        segmentsInUseSet = set()
        self.segmentCount = 0
        self.scenarioCount = 0
        
        unitSet = set(modelXbrl.units)
        unitsInUseSet = set()
        self.unitCountDict = defaultdict(int)        
        self.unitsInUseCountDict = defaultdict(int)
        
        conceptInUseSet = set()        
        primaryInUseSet = set()
        self.primaryCountDict = defaultdict(int) 
        memberInUseSet = set()
        self.memberCountDict = defaultdict(int) 
        axisInUseSet = set()
        self.axisInUseCountDict = defaultdict(int) 
        hiddenSet = set()
        self.hiddenCountDict = defaultdict(int)  # by Namespace
        
        self.threshold = 80
        self.level1PolicyNote = []  # Actually there can only be one but this makes code more symmetric.
        self.level1OtherNotes = []
        self.level2PolicyNotes = []
        self.level3TableNotes = []
        # the following three separate variables are collected for diagnostic reasons
        # even though they all go into the same list in the filing summary
        self.instanceFiles = []
        self.inlineFiles = []
        self.otherXbrlFiles = []
        
        self.customPrefix = None
        self.customNamespace = None
        self.roleDefinitionDict = dict()

        # do not hang on to filing or modelXbrl, just collect the statistics.        
        self.dts = defaultdict(lambda: defaultdict(list)) # self.dts['instance']['local'] returns a list
        self.hasRR = False
        for uri,doc in sorted(modelXbrl.urlDocs.items()):
            isLocal = uri.startswith(filing.controller.processingFolder)
            (f,rl) = (uri,'remote')
            if isLocal: (f,rl) = (os.path.basename(uri),'local')
            doctype = 'supplemental'
            if doc.xmlRootElement.localName == 'xbrl':
                doctype = 'instance'
                self.instanceFiles += [f]
            elif doc.xmlRootElement.localName == 'html':
                doctype = 'inline'
                self.inlineFiles += [f]
            elif doc.xmlRootElement.localName == 'schema':
                doctype = 'schema'
                self.otherXbrlFiles += [f]   
                ns = doc.targetNamespace
                if ns and 'http://xbrl.sec.gov/rr/' in ns: 
                    self.hasRR = True
                if (self.customPrefix is None 
                    and ns is not None 
                    and not Utils.isEfmStandardNamespace(ns)):
                    self.customNamespace = ns
                    for (prefix, namespace) in doc.xmlRootElement.nsmap.items():
                        if namespace == ns:
                            self.customPrefix = prefix
            elif doc.xmlRootElement.localName == 'linkbase':
                self.otherXbrlFiles += [f]   
                doctype = 'linkbase'
                for child in doc.xmlRootElement.iterchildren('{'+arelle.XbrlConst.link+'}*'):
                    if child.localName.endswith('Link'):
                        doctype = child.localName
                        if (isLocal):
                            if (doctype == 'presentationLink'):
                                self.hasPresentationLinkbase = True
                            elif (doctype == 'calculationLink'):
                                self.hasCalculationLinkbase = True
                        break # currently in EDGAR each file can have only kind of link. 
            else:
                modelXbrl.debug("debug",
                                  _("Unknown XML doctype %(doctype)s in file %(file)s."),
                                  modelObject=doc, doctype=doc.xmlRootElement.localName, file=uri)
            self.dts[doctype][rl] += [f]
        self.dtsroots = self.instanceFiles + self.inlineFiles
        

#         self.hasRR = next((True for n in modelXbrl.namespaceDocs.keys()
#                            if 'http://xbrl.sec.gov/rr/' in n), False)
#         for fileUri, doc in sorted(modelXbrl.urlDocs.items()):
#             if not matchHttp.match(fileUri):
#                 if matchPre.match(fileUri):
#                     self.hasPresentationLinkbase = True
#                 elif matchCal.match(fileUri):
#                     self.hasCalculationLinkbase = True
#                 f = os.path.basename(fileUri)
#                 if next((i for i in filing.controller.instanceList if os.path.basename(i) == f), False):
#                     self.instanceFiles += [f]
#                 elif next((i for i in filing.controller.inlineList if os.path.basename(i) == f), False):
#                     self.inlineFiles += [f]
#                 else:
#                     self.otherXbrlFiles += [f]      
#                 ns = doc.targetNamespace
#                 if (self.customPrefix is None 
#                     and ns is not None 
#                     and not Utils.isEfmStandardNamespace(ns)):
#                     self.customNamespace = ns
#                     for (prefix, namespace) in doc.xmlRootElement.nsmap.items():
#                         if namespace == ns:
#                             self.customPrefix = prefix       
#         self.dtsroots = self.instanceFiles + self.inlineFiles
        
        for qname, facts in modelXbrl.factsByQname.items():
            primaryInUseSet.add(qname)
            for fact in facts:
                if fact.concept is not None: conceptInUseSet.add(fact.concept)
                if fact.context is not None: contextsInUseSet.add(fact.context)
                if fact.unit is not None: unitsInUseSet.add(fact.unit)
                if arelle.XbrlConst.qnIXbrl11Hidden in fact.ancestorQnames: 
                    hiddenSet.add(fact)                    
                        
        for c in contextSet:
            segmentSet.update([(s.dimension,s.member) for s in c.segDimValues.values()])
            entitySet.update({itag.text for itag in c.iter(tag=arelle.XbrlConst.qnXbrliIdentifier.clarkNotation)})
        
        for context in contextsInUseSet:
            entityInUseSet.add(context.entityIdentifier)
            for segment in context.qnameDims.values():  # entity
                # TODO: This may assume all dimensions are explicit.
                segmentsInUseSet.add(segment)
                memberInUseSet.add(segment.memberQname)
                axisInUseSet.add(segment.dimensionQname)
        
        self.contextCount = len(contextSet)
        self.contextInUseCount = len(contextsInUseSet)
        self.segmentCount = len(segmentSet)
        self.segmentInUseCount = len(segmentsInUseSet)
        self.entityCount = len(entitySet)
        self.entityInUseCount = len(entityInUseSet)
        self.scenarioCount = 0  # in case scenarios ever allowed.        
        self.tupleCount = 0  # likewise
                
        for unit in unitsInUseSet:
            self.unitsInUseCountDict[Utils.hasCustomNamespace(unit)] += 1        
        for unit in unitSet: 
            self.unitCountDict[Utils.hasCustomNamespace(unit)] += 1
        for member in memberInUseSet: 
            self.memberCountDict[Utils.hasCustomNamespace(member)] += 1
        for axis in axisInUseSet: 
            self.axisInUseCountDict[Utils.hasCustomNamespace(axis)] += 1
        for primary in primaryInUseSet: 
            self.primaryCountDict[Utils.hasCustomNamespace(primary)] += 1
        for hidden in hiddenSet: 
            self.hiddenCountDict[hidden.qname.namespaceURI] += 1
        
        self.footnoteCount = len(modelXbrl.relationshipSet('XBRL-footnotes').modelRelationships) 
        self.reportSummaryList = filing.reportSummaryList
        for r in self.reportSummaryList: 
            self.roleDefinitionDict[r.role] = r.longName
            
        # Consider a concept in use if it appears as a fact or in a context explicitMember.
        summationItemRelationshipSet = modelXbrl.relationshipSet(arelle.XbrlConst.summationItem)
        summationItemRelationshipSet.loadModelRelationshipsTo()
        summationItemRelationshipSet.loadModelRelationshipsFrom()        
        
        # Assume for simplicity that every concept in the calculation link base connects eventually to some fact
        # TODO: use graph traversal instead.
        conceptInUseSet = conceptInUseSet.union({concept for concept in summationItemRelationshipSet.modelRelationshipsFrom.keys()})
        conceptInUseSet = conceptInUseSet.union({concept for concept in summationItemRelationshipSet.modelRelationshipsTo.keys()})
        
        parentChildRelationshipSet = modelXbrl.relationshipSet(arelle.XbrlConst.parentChild)
        parentChildRelationshipSet.loadModelRelationshipsTo()
        parentChildRelationshipSet.loadModelRelationshipsFrom()       
        
        # Assume for the moment that every concept in the presentation link base connects eventually to some fact  
        # TODO: use graph traversal instead.    
        conceptInUseSet = conceptInUseSet.union({concept for concept in parentChildRelationshipSet.modelRelationshipsFrom.keys() if concept is not None})
        conceptInUseSet = conceptInUseSet.union({concept for concept in parentChildRelationshipSet.modelRelationshipsTo.keys() if concept is not None})

        # Do not add a concept just because it has a label or a reference.
        conceptLabelRelationshipSet = modelXbrl.relationshipSet(arelle.XbrlConst.conceptLabel)
        conceptLabelRelationshipSet.loadModelRelationshipsFrom()        
                      
        conceptReferenceRelationshipSet = modelXbrl.relationshipSet(arelle.XbrlConst.conceptReference)
        conceptReferenceRelationshipSet.loadModelRelationshipsFrom()     
        conceptReferenceRelationshipSet.loadModelRelationshipsTo()

        self.refSet = set()
        self.qnameReferenceDict = defaultdict(set)
        for fromConcept, toRels in conceptReferenceRelationshipSet.modelRelationshipsFrom.items():
            if fromConcept in conceptInUseSet and len(toRels) > 0:
                for rel in toRels:
                    toReference = rel.toModelObject
                    if isinstance(toReference, arelle.ModelDtsObject.ModelResource):
                        r = []
                        for elt in toReference.iterchildren():
                            s = elt.text
                            if s is not None: # empty elts appear in us-gaap 2008 and 2011 refs
                                if len(s)>0:
                                    r += [(elt.localName,s)]
                        r = tuple(r) # make it immutable and suitable as a key                      
                        self.refSet.add(r)
                        self.qnameReferenceDict[fromConcept.qname.clarkNotation].add(r)
                
        # build a dictionary tree of the eventual JSON output.
        self.tagDict = {}
        for concept in conceptInUseSet:
            self.tagDict[concept.attrib['id']] = {'xbrltype' : (concept.typeQname).localName
                                                  ,'nsuri': concept.qname.namespaceURI
                                                  ,'localname': concept.qname.localName}
            tag = self.tagDict[concept.attrib['id']]
            roleDict = None
            if concept.balance is not None: tag['crdr'] = concept.balance
            calculations = summationItemRelationshipSet.modelRelationshipsTo[concept]
            if calculations is not None and len(calculations) > 0:
                roleDict = tag['calculation'] = {}
                for calculation in calculations:
                    role = calculation.linkrole
                    parentTag =  calculation.fromModelObject.attrib['id']
                    weight = calculation.weight
                    order = calculation.order
                    if order is None: order = 1
                    # here we assume that in a given role only one calc parent is allowed.
                    roleDict[role] = {'parentTag' : parentTag
                                        ,'weight' : weight
                                        ,'order' : order} 
            calculations = summationItemRelationshipSet.modelRelationshipsFrom[concept]
            if calculations is not None and len(calculations) > 0:
                for calculation in calculations:
                    role = calculation.linkrole
                    if roleDict is None:
                        roleDict = tag['calculation'] = {}
                    if role not in roleDict:
                        roleDict[role] = {'parentTag' : None, 'weight': None, 'order': None, 'root': True}
                                   
            presentations = parentChildRelationshipSet.modelRelationshipsTo[concept]
            if presentations is not None and len(presentations) > 0:                
                roleList = tag['presentation'] = []
                for presentation in presentations:                    
                    role =  presentation.linkrole 
                    if (role not in roleList): roleList += [role]                
            labels = conceptLabelRelationshipSet.modelRelationshipsFrom[concept]
            if labels is not None and len(labels) > 0:
                langDict = tag['lang'] = {}
                for rel in labels:
                    lang = rel.toModelObject.xmlLang 
                    label = rel.toModelObject
                    if label is not None:
                        labelrole = label.role.split('/')[-1:][0]
                        labeltext = ''
                        if label.text is not None:
                            labeltext = label.text.strip().replace("&", "&amp;").replace("<", "&lt;")
                        if (lang not in langDict): langDict[lang] = {'role': {}}
                        langDict[lang]['role'][labelrole] = labeltext
        self.qnameInUseSet = {concept.qname.clarkNotation for concept in conceptInUseSet}
        self.conceptInUseSet = {concept.qname for concept in conceptInUseSet}
        return  # from InstanceSummary initialization
   

    def appendToFilingSummary(self, myReportsEtree, isFirstInstance, isRR, includeUncategorized):
        startPosition = 1 + math.trunc(myReportsEtree.xpath('count(Report)'))
        parentRole = None
        state = ''
        for i, reportSummary in enumerate([r for r in self.reportSummaryList 
                                          if (includeUncategorized == r.isUncategorized)]):
            if not isRR: 
                state = self.classifyReportFiniteStateMachine(state, reportSummary.longName)
                parentRole = self.getReportParentIfExists(reportSummary, state)
            reportETree = SubElement(myReportsEtree, 'Report')
            reportETree.set('instance',(self.instanceFiles+self.inlineFiles)[0])
            SubElement(reportETree, 'IsDefault').text = str(isFirstInstance and i == 1).casefold()         
            SubElement(reportETree, 'HasEmbeddedReports').text = str(reportSummary.hasEmbeddedReports).casefold()
            if reportSummary.htmlFileName is not None:
                SubElement(reportETree, 'HtmlFileName').text = reportSummary.htmlFileName
            SubElement(reportETree, 'LongName').text = reportSummary.longName    
            if 'notes' in reportSummary.shortName.casefold(): reportType = 'Notes'
            else: reportType = 'Sheet'
            SubElement(reportETree, 'ReportType').text = reportType
            SubElement(reportETree, 'Role').text = reportSummary.role
            SubElement(reportETree, 'ShortName').text = reportSummary.shortName
            if reportSummary.xmlFileName is not None:
                SubElement(reportETree, 'XmlFileName').text = reportSummary.xmlFileName
            SubElement(reportETree, 'MenuCategory').text = state
            if parentRole is not None:
                SubElement(reportETree, 'ParentRole').text = parentRole
            SubElement(reportETree, 'Position').text = str(startPosition + i)

    # finds parent based on lexicographical similarity.  
    # For instance, "Significant Accounting Policies (Policies)" might
    # be the parent of "Significant Accounting Policies (Tables)".
    # there are four levels: 1,2,3,4.  a report's parent must be in a lower numbered level. 
    def getReportParentIfExists(self, reportSummary, state):
        shortName = reportSummary.shortName
        parentRole = None

        if state == 'Notes':
            if re.compile('.*Accounting.*').match(reportSummary.longName) and self.level1PolicyNote == []:
                self.level1PolicyNote = [reportSummary]  # This is the first note mentioning Accounting, can only be a list of one
            else:
                self.level1OtherNotes += [reportSummary]  # This is some other note

        elif state == 'Policies':  # All policy (level 2) notes have the same parent 
            self.level2PolicyNotes += [reportSummary]
            # if level1PolicyNote is not an empty list, it is the parent.
            for noteReportSummary in self.level1PolicyNote:  # this list can only ever be one long
                return noteReportSummary.role

        elif state == 'Tables':
            self.level3TableNotes += [reportSummary]  # This is some table
            # look for a parent in level1PolicyNote and then in level1OtherNotes
            orderedListToSearchForAParent = self.level1PolicyNote + self.level1OtherNotes
            parentRole = self.getReportParentIfExistsHelper(shortName, orderedListToSearchForAParent)

        elif state == 'Details':
            # look for a parent in level3TableNotes and then in level2PolicyNotes and then in level1OtherNotes
            orderedListToSearchForAParent = self.level3TableNotes + self.level2PolicyNotes + self.level1OtherNotes
            parentRole = self.getReportParentIfExistsHelper(shortName, orderedListToSearchForAParent)

        # else:
        #     pass # no other kind of reportSummary can have a parent.
        if parentRole is not None:
            return parentRole


    def getReportParentIfExistsHelper(self, shortName, levelList):
        for noteReportSummary in levelList:
            score = self.paternityScore(noteReportSummary.shortName, shortName)
            # self.addToLog('{} score {} vs {}'.format(score, noteReportSummary.shortName, shortName))
            if score >= self.threshold:
                return noteReportSummary.role
        return None

    # on a scale of 0 to 100 how similar are these short names?
    def paternityScore(self, parentReportShortName, childReportShortName):
        index = parentReportShortName.find(' (')
        if index != -1:
            parentReportShortName = parentReportShortName[:index]

        index = childReportShortName.find(' (')
        if index != -1:
            childReportShortName = childReportShortName[:index]

        return Utils.commonPrefix(parentReportShortName, childReportShortName) * 100 / (len(childReportShortName))



    def classifyReportFiniteStateMachine(self, currentState, longName): 
        Cover = 'Cover'
        Statements = 'Statements'
        Notes = 'Notes'
        Policies = 'Policies'
        Tables = 'Tables'
        Details = 'Details'
        Uncategorized = 'Uncategorized'
        if currentState == '':
            if isUncategorized(longName):
                return Uncategorized
            elif isParenthetical(longName):
                return Cover
            elif isStatement(longName):
                return Statements
            elif isPolicy(longName):
                return Notes
            elif isTable(longName):
                return Tables
            elif isDetail(longName):
                return Details
            else:
                return Cover
        elif currentState == Cover:
            if isUncategorized(longName):
                return Uncategorized
            elif isStatement(longName):
                return Statements
            elif isParenthetical(longName):
                return Cover
            elif isPolicy(longName):
                return Notes
            elif isTable(longName):
                return Tables
            elif isDetail(longName):
                return Details
            else:
                return Notes
        elif currentState == Statements:
            if isUncategorized(longName):
                return Uncategorized
            elif isStatement(longName):
                return Statements
            elif isParenthetical(longName):
                return Statements
            elif isPolicy(longName):
                return Notes
            elif isTable(longName):
                return Tables
            elif isDetail(longName):
                return Details
            else:
                return Notes
        elif currentState == Notes:
            if isPolicy(longName):
                return Policies
            elif isTable(longName):
                return Tables
            elif isDetail(longName):
                return Details
            elif isDisclosure(longName):
                return Notes
            else:
                return Uncategorized
        elif currentState == Policies:
            if isUncategorized(longName):
                return Uncategorized
            elif isTable(longName):
                return Tables
            elif isDetail(longName):
                return Details
            elif isParenthetical(longName):
                return Policies
            elif isPolicy(longName):
                return Policies
            else:
                return Uncategorized
        elif currentState == Tables:
            if isUncategorized(longName):
                return Uncategorized
            elif isDetail(longName):
                return Details
            elif isParenthetical(longName):
                return Tables
            elif isTable(longName):
                return Tables
            else:
                return Uncategorized
        elif currentState == Details:
            if isUncategorized(longName):
                return Uncategorized
            elif isParenthetical(longName):
                return Details
            elif isDetail(longName):
                return Details
            else:
                return Uncategorized
        else:
            return Uncategorized

matchStatement = re.compile('.* +\- +Statement +\- .*')
matchDisclosure = re.compile('.* +\- +Disclosure +\- +.*')
matchDocument = re.compile('.* +\- +Document +\- +.*')
matchParenthetical = re.compile('.*\-.+-.*Paren.+')
matchPolicy = re.compile('.*\(.*Polic.*\).*')
matchTable = re.compile('.*\(Table.*\).*')
matchDetail = re.compile('.*\(Detail.*\).*')
matchHttp = re.compile('^http://')
matchPre = re.compile('.*_pre.xml$')
matchCal = re.compile('.*_cal.xml$')

def isStatement(longName):
        return matchStatement.match(longName) is not None

def isDisclosure(longName):
    return matchDisclosure.match(longName) is not None

def isDocument(longName):
    return matchDocument.match(longName) is not None
    
def isParenthetical(longName):
    return matchParenthetical.match(longName) is not None
    
def isPolicy(longName):
    return matchPolicy.match(longName) is not None
    
def isTable(longName):
    return matchTable.match(longName) is not None
    
def isDetail(longName):
    return matchDetail.match(longName) is not None
    
def isUncategorized(longName):
    return longName == 'UncategorizedItems' 
