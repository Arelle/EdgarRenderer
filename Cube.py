# -*- coding: utf-8 -*-
"""
:mod:`EdgarRenderer.Cube`
~~~~~~~~~~~~~~~~~~~
Edgar(tm) Renderer was created by staff of the U.S. Securities and Exchange Commission.
Data and content created by government employees within the scope of their employment
are not subject to domestic copyright protection. 17 U.S.C. 105.
"""

import regex as re
from collections import defaultdict
import arelle.ModelObject
from . import Utils
Filing = None

class Cube(object):
    def __init__(self, filing, linkroleUri):
        global Filing
        if Filing is None:
            from . import Filing
        self.filing = filing
        self.controller = filing.controller
        self.noFactsOrAllFactsSuppressed = Utils.isNotRendered(linkroleUri)
        self.excludeFromNumbering = False
        self.linkroleUri = linkroleUri
        self.isBarChart = 'barchart' in linkroleUri.casefold()
        self.fileNumber = None
        self.hasAxes = {}
        self.hasMembers = set()
        self.hasElements = set()
        self.timeAxis = set()
        self.unitAxis = {}
        self.labelDict = {}
        self.factMemberships = []
        self.abstractDict = {}
        self.embeddingList = []
        self.isEmbedded = False
        self.presentationGroup = None
        self.isUncategorizedFacts = linkroleUri == 'http://xbrl.sec.gov/role/uncategorizedFacts'
        self.axisAndMemberOrderDict = {} # contains a tuple with an orderDict of members and the axes order relative to other axes
        self.defaultFilteredOutAxisSet = set()
        self.periodStartEndLabelDict = defaultdict(list) # populated by PresentationGroup.getLabelsRecursive
        self.hasDiscoveredDurations = False
        self.rootNodeToConceptSetDict = {}
        self.isStatementOfEquity = False
        self.isStatementOfCashFlows = False
        self.isRepurchasesDetail = linkroleUri in ('http://xbrl.sec.gov/shr/role/exh/IssrOrAfflRepurchsBySecurity',)
        self.forbidsDatesInSegmentTitleRows = not (self.isUncategorizedFacts or self.isRepurchasesDetail)
        self.sortPeriodAxisDescending = not self.isRepurchasesDetail

        modelRoleTypes = filing.modelXbrl.roleTypes[linkroleUri]
        if modelRoleTypes:
            self.definitionText = (modelRoleTypes[0].genLabel(strip=True) or modelRoleTypes[0].definition or linkroleUri).strip()
        else:
            self.definitionText = linkroleUri
        cNum, self.cubeType, self.shortName, self.isTransposed, self.isUnlabeled, self.isElements = self.getCubeInfo()

        # TO DO problem 2: searching from statement and equity, dumb
        lowerSN = self.shortName.casefold()
        # filing.controller.logDebug('The Linkrole {} is going to be checked for being a Statement of Equity {} {}.'.format(self.shortName,filing.usgaapNamespace,filing.ifrsNamespace))
        if      (self.cubeType == 'statement'
                 and 'parenthetical' not in lowerSN
                 and '(table' not in lowerSN
                 and '(detail' not in lowerSN
                 and '(polic' not in lowerSN
                 and not (filing.usgaapNamespace is None and filing.ifrsNamespace is None)):
            # filing.controller.logDebug('The Linkrole {} might be a Statement of Equity.'.format(self.shortName))
            if      ('148600' == cNum or
                     '148610' == cNum or
                     (('stockholder' in lowerSN or 'shareholder' in lowerSN or 'changes' in lowerSN) and ('equity' in lowerSN or 'deficit' in lowerSN)) or
                     (('partners' in lowerSN or 'accounts' in lowerSN) and 'capital' in lowerSN) or
                     #('statement' in lowerSN and 'capitalization' in lowerSN) or # TODO: do we want this for case WEC?
                     ('statement' in lowerSN and 'equity' in lowerSN)):
                self.isStatementOfEquity = True
                filing.controller.logDebug('The Linkrole {} is a Statement of Equity.'.format(self.shortName))
                if filing.controller.noEquity:
                    self.isStatementOfEquity = False
                    filing.controller.logDebug('But noEquity is True so it will not be treated specially.')
            elif 'cash' in lowerSN and 'flow' in lowerSN[lowerSN.index('cash'):] and not 'supplement' in lowerSN:
                self.isStatementOfCashFlows = True
                filing.controller.logDebug('The Linkrole {} is a Statement of Cash Flows'.format(self.shortName))


    def __str__(self):
        return "[Cube R{!s} {} {}]".format(self.fileNumber, self.cubeType, self.shortName)


    def getCubeInfo(self):
        if self.isUncategorizedFacts:
            return ('', '', '', False, False, False)

        cubeNumber, hyphen, rightOfHyphen = self.definitionText.partition('-')
        cubeType, secondHyphen, cubeName = rightOfHyphen.partition('-')
        cubeNumber = cubeNumber.strip() # don't need casefold, it's a number
        cubeType = cubeType.strip().casefold()
        cubeName = cubeName.strip()

        try:
            int(cubeNumber)
            cubeNumberIsANumber = True
        except ValueError:
            cubeNumberIsANumber = False

        if not cubeNumberIsANumber or '' in (hyphen, secondHyphen, cubeNumber, cubeType, cubeName):
            if not self.filing.validatedForEFM:
                self.filing.modelXbrl.error("EFM.6.07.12", # use identical EFM message & parameters as Arelle Filing validation
                    _("The definition ''%(definition)s'' of role %(roleType)s does not match the expected format. "
                      "Please check that the definition matches {number} - {type} - {text}."),
                    edgarCode="rq-0712-Role-Definition-Mismatch",
                    modelObject=self.filing.modelXbrl, roleType=self.linkroleUri, definition=self.definitionText)
            return ('', '', '', False, False, False)

        indexList = [99999, 99999, 99999] # in order transposed, unlabeled, elements

        def handleIndex(matchObj):
            if matchObj.group('t') is not None:
                indexList[0] = matchObj.start()
            elif matchObj.group('u') is not None:
                indexList[1] = matchObj.start()
            elif matchObj.group('e') is not None:
                indexList[2] = matchObj.start()
            return ''

        # gets rid of the curly brackets if it has transposed, unlabeled or elements inside.
        # there are examples (nils) that have other stuff inside of curly brackets, so we keep those.
        cubeName = re.sub(r'\s*\{\s*((?P<t>transposed)|(?P<u>unlabeled)|(?P<e>elements))\s*\}\s*', handleIndex, cubeName, flags=re.IGNORECASE)

        isTransposed = isUnlabeled = isElements = False
        if indexList[0] < 99999: # if transposed is present, the first one of the three mentioned wins
            lowestPosition = indexList.index(min(indexList))
            if lowestPosition == 0:
                isTransposed = True
            elif lowestPosition == 1:
                isUnlabeled = True
            elif lowestPosition == 2:
                isElements = True
        elif indexList[2] < 99999: # if elements is present, it beats unlabeled
            isElements = True
        elif indexList[1] < 99999: # if only unlabeled is present, it wins
            isUnlabeled = True

        return (cubeNumber, cubeType, cubeName, isTransposed, isUnlabeled, isElements)


    def areTherePhantomAxesInPGWithNoDefault(self):
        axesWithoutDefaultsThatAllFactsAreDefaultedOn = self.defaultFilteredOutAxisSet - set(self.axisAndMemberOrderDict)
        if len(axesWithoutDefaultsThatAllFactsAreDefaultedOn) > 0:
            # there were axes without defaults in the PG that weren't mentioned by the facts.  since they weren't mentioned by the facts,
            # they weren't found in our intelligent graph traversal, traverseToRootOrRoots(). since they weren't mentioned by the facts,
            # we know that all of the facts are defaulted on them. BUT, they have no defaults, so all the facts are filtered out.
            self.noFactsOrAllFactsSuppressed = True
            axesStr = ', '.join([str(axisQname) for axisQname in sorted(axesWithoutDefaultsThatAllFactsAreDefaultedOn)])
            self.filing.modelXbrl.warning("EFM.6.26.01",
                _("The presentation group \"%(linkroleName)s\" contains %(axisSet)s, which either has (have) no default member "
                  "in the presentation group. Since every fact is defaulted on this (these) axe(s), all facts have been filtered out."),
                 modelObject=self.filing.modelXbrl,
                 linkrole=self.linkroleUri, linkroleDefinition=self.definitionText,
                 linkroleName=self.shortName, axisSet=axesStr)


    def handlePeriodStartEndLabel(self,discoveredDurations=[]):
        # for facts presented with startLabel or end label, make new facts with matching contexts
        # and append them to the initial list of facts. Therefore, one fact may become many if
        # a periodStart(End)Label is used for an instant fact and there are many contexts that begin(end)
        # at that point in time.
        # references the cube.periodStartEndLabelDict
        # will side effect cube.periodStartEndLabelDict if there is a duration fact with period start/end label.
        # will generally side effect self.factMemberships by appending to it.

        initialDurationSet = set([x[1]['period'] for x in self.factMemberships if ('period' in x[1] and x[1]['period'].periodTypeStr=='duration')])

        def matchingDurationSet(iFxm,preferredLabel):
            # iFxm = instant Fact - axis - membership tuple.
            # return set of tuples consisting of start/end time tuple and start/end role
            _, iAxm, _ = iFxm # iAxm = instant AxisMembership
            iPeriod = iAxm['period'] # instant Period (Period is a synonym for StartEndContext)
            iTime = iPeriod.endTime # instant Time
            assert iPeriod.periodTypeStr == 'instant'
            preferredLabelIsStart = Utils.isPeriodStartLabel(preferredLabel)
            _durations = set() # set of Periods to collect
            listOfDurations = initialDurationSet
            if len(discoveredDurations) > 0:
                listOfDurations = discoveredDurations
            for dPeriod in listOfDurations:
                if preferredLabelIsStart:
                    dTimeToMatch = dPeriod.startTime
                else:
                    dTimeToMatch = dPeriod.endTime
                if dTimeToMatch == iTime:
                    _durations.add(dPeriod)
            return {((d.startTime,d.endTime),preferredLabel) for d in _durations}

        initialSize = len(self.factMemberships)
        self.controller.logDebug("factMembership at {} in {}".format(initialSize,self.definitionText))
        # list of new fact memberships (aka fact locations) to be created from instants.
        newFactMemberships= list()
        # set of instants with periodStart or periodEnd that could not be matched to a duration.
        skippedFactMembershipSet = set()

        for factMembership in self.factMemberships:
            fact, axisMemberLookupDict, role = factMembership
            # The startEndPreferredLabelList shows what label roles the presentation linkbase expected to be present.
            startEndPreferredLabelList = (self.periodStartEndLabelDict.get(fact.qname) or [])
            if len(startEndPreferredLabelList) > 0:
                startAndEndLabelsSet = set()  # the set of durations that the instant of this fact begins
                for preferredLabel in startEndPreferredLabelList:
                    if Utils.isPeriodStartOrEndLabel(preferredLabel):
                        startAndEndLabelsSet.update(matchingDurationSet(factMembership,preferredLabel))

                if len(startAndEndLabelsSet)==0:
                    for role in startEndPreferredLabelList:
                        skippedFactMembershipSet.add((fact,role,self,self.linkroleUri,self.shortName,self.definitionText))

                for startEndTuple, preferredLabel in startAndEndLabelsSet:
                    try: # if startEndContext exists, find it
                        newStartEndContext = self.filing.startEndContextDict[startEndTuple]
                    except KeyError: # if not, create one and add it to respective data structures
                        newStartEndContext = Filing.StartEndContext(fact.context, startEndTuple)
                        self.filing.startEndContextDict[startEndTuple] = newStartEndContext
                        self.timeAxis.add(newStartEndContext)
                    tempAxisMemberLookupDict = axisMemberLookupDict.copy()
                    tempAxisMemberLookupDict['period'] = newStartEndContext
                    newFactMemberships += [(fact, tempAxisMemberLookupDict, preferredLabel)]
        self.factMemberships += newFactMemberships
        self.controller.logDebug("factMembership now {} in {}".format(len(self.factMemberships),self.definitionText))
        skippedFactSet = {x[0] for x in skippedFactMembershipSet}
        if (len(skippedFactSet) == initialSize
            and len(discoveredDurations)==0):
            # if we skipped all the facts it means there were no durations.
            # go 'discover' the durations by comparing start and end instants.
            moments = sorted(list({fxm[1]['period'].endTime for fxm in self.factMemberships}))
            if len(moments) > 1:
                self.filing.modelXbrl.info("info",
                    _("In \"%(linkroleName)s\", no matching durations for %(numFacts)s instant facts presented with start or end "
                      "preferred labels. Now inferring durations to form columns. Simplify the presentation "
                      "to get a more compact layout."),
                    modelObject=self.filing.modelXbrl.modelDocument, linkroleName=self.shortName, numFacts=len(skippedFactSet))
                intervals = []
                for i,endTime in enumerate(moments[1:]):
                    startTime = moments[i]
                    intervals += [Filing.StartEndContext(None,(startTime,endTime))]
                self.hasDiscoveredDurations = True
                self.handlePeriodStartEndLabel(discoveredDurations=intervals)

        self.filing.skippedFactsList += list(skippedFactMembershipSet)


    def populateUnitPseudoaxis(self):
        giveMemGetPositionDict = {}
        for i, unit in enumerate(sorted(self.unitAxis.values(), key = lambda thing : thing.sourceline or 0)):
            giveMemGetPositionDict[unit.id] = i
        self.axisAndMemberOrderDict['unit'] = (giveMemGetPositionDict, None)


    def populatePeriodPseudoaxis(self):
        giveMemGetPositionDict = {}
        # here we sort this list by numMonths and then by reversed endTime.  python sorts are stable,
        # so first we sort by the secondary key, and then by the primary.  python does have a construct
        # where you can sort by multiple keys, by listing them in order in parentheses, but that construct
        # does not allow you to choose which ones are sorted in reverse order or not for non-numerical data
        # so we just do two separate sorts and rely on sort stability.

        sortedList = list(self.timeAxis)

        if self.isStatementOfEquity:
            sortedList.sort(key = lambda startEndContext : startEndContext.numMonths)
            sortedList.sort(key = lambda startEndContext : startEndContext.startOrInstantTime())
            sortedList = self.SurvivorsOfMovementAnalysis(sortedList)
            if len(sortedList)==0:
                #message = ErrorMgr.getError('STATEMENT_OF_EQUITY_NO_COMPLETE_MOVEMENTS_WARNING').format(self.shortName)
                self.filing.modelXbrl.warning("EFM.6.26.03",
                    _("The presentation group ''%(linkroleName)s'' is a statement of changes in equity, "
                      "but it has no duration-type facts matching the instant-type facts shown.  "
                      "Add duration-type facts that represent the changes from instant to instant, "
                      "or do not label the presentation group a statement of changes."),
                    edgarCode="rq-2603-No-Matching-Durations",
                    modelObject=self.filing.modelXbrl, linkrole=self.linkroleUri, linkroleDefinition=self.definitionText,
                    linkroleName=self.shortName)
                self.isStatementOfEquity = False # no movements, warn the user it is probably not what they wanted
                sortedList = list(self.timeAxis) # start over

        else:
            sortedList.sort(key = lambda startEndContext : startEndContext.endTime, reverse=self.sortPeriodAxisDescending)
            sortedList.sort(key = lambda startEndContext : startEndContext.numMonths)
            # this next step just orders by "duration" then by "instant" because d comes before i in the alphabet, corny.
            sortedList.sort(key = lambda startEndContext : startEndContext.periodTypeStr)

        for i, startEndContext in enumerate(sortedList): # then by endTime
            giveMemGetPositionDict[startEndContext] = i
        self.axisAndMemberOrderDict['period'] = (giveMemGetPositionDict, None)
        return # from populatePeriodPseudoaxis


    def SurvivorsOfMovementAnalysis(self,sortedList):
        # The statement of equity always has periods as the outermost row command, and never
        # shows facts except within a Movement.  A complete movement needs a beginning instant,
        # an activity duration, and an ending instant. Any instants or durations that appear
        # among the facts, but are not part of a Movement, are not shown.
        # There is one movement Candidate for each duration among the list of startEndContexts.
        movementCandidateList = [[None,d,None] for d in sortedList if d.periodTypeStr == 'duration']
        # Augment the triples in the candidate list with all the instants in the startEndContexts.
        for i in sortedList:
            if i.periodTypeStr == 'instant':
                instantTime = i.endTime
                for movement in movementCandidateList:
                    d = movement[1]
                    if instantTime == d.startTime:
                        movement[0] = i
                    if instantTime == d.endTime:
                        movement[2] = i
        pass # end for
        # Surviving movements are those which have a beginning, middle, and an end.
        # https://www.youtube.com/watch?v=hnoJwfnzmqA for more about this.
        movementList = [m for m in movementCandidateList if m[0] is not None and m[1] is not None and m[2] is not None]
        # build a dictionary to tell what movements a startEndContext belongs to, which could be more than one.
        giveContextGetMovementsDict = defaultdict(list)
        for c in sortedList: # this dictionary could probably be dispensed with.
            giveContextGetMovementsDict[c] += [m for m in movementList if c in m]
        self.controller.logDebug("Statement {} has {} Movements.".format(self.shortName, len(movementList)))
        for contextID, movements in giveContextGetMovementsDict.items():
            if len(movements)==0:
                # Contexts that aren't in a complete movement are removed (do not survive).
                sortedList.remove(contextID)
                self.controller.logDebug("Context {} was not part of a complete Movement".format(contextID))
        return sortedList # from SurvivorsOfMovementAnalysis


    def rearrangeGiveMemGetPositionDict(self,axisQname,giveMemGetPositionDict):
        memberList = [item[0] for item in sorted(giveMemGetPositionDict.items(),key=lambda item : item[1])]
        builtinAxisOrders = self.filing.builtinAxisOrders
        builtinAxisOrder = next((s for s in builtinAxisOrders if axisQname==s[0]),None)
        if builtinAxisOrder is not None:
            (axis,members,lastmembers) = builtinAxisOrder
            self.controller.logDebug("Special sort of {} {} needed".format(axisQname,giveMemGetPositionDict))
            prefix = axis.prefix
            nsuri = axis.namespaceURI
            ordering = [arelle.ModelValue.QName(prefix,nsuri,name) for name in members]
            overrideordering = [arelle.ModelValue.QName(prefix,nsuri,name) for name in lastmembers]
            memberList = Utils.heapsort(memberList,(lambda x,y: Utils.compareInOrdering(x,y,ordering,overrideordering)))
            giveMemGetPositionDict = dict([(x,i) for i,x in enumerate(memberList)])
            self.controller.logDebug("Resulted in {}".format(giveMemGetPositionDict))
        return giveMemGetPositionDict


    def printCube(self):
        self.controller.logTrace('\n\n**************** '+self.linkroleUri)
        self.controller.logTrace(self.definitionText)

        text = '\n\n\naxes and members from contexts:\n'
        for axisQname, axis in self.hasAxes.items():
            text += 'Axis: {!s}\n'.format(axisQname)
            for member in axis.hasMembers:
                if member in self.hasMembers:
                    text += '\tmember: {!s}\n'.format(member.memberValue)
        self.controller.logTrace(text)

        text = '\naxisAndMemberOrderDict:\n'
        for pseudoaxisQname in self.axisAndMemberOrderDict:
            text += '\t{!s}\n'.format(pseudoaxisQname)
        self.controller.logTrace(text)

        self.controller.logTrace('\ndefaultFilteredOutAxisSet\n')
        for c in self.defaultFilteredOutAxisSet:
            self.controller.logTrace('\t{!s}\n'.format(c))

        self.controller.logTrace('\n\npresentationGroup:')
        self.presentationGroup.printPresentationGroup()
