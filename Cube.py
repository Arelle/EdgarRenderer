# -*- coding: utf-8 -*-
"""
:mod:`EdgarRenderer.Cube`
~~~~~~~~~~~~~~~~~~~
Edgar(tm) Renderer was created by staff of the U.S. Securities and Exchange Commission.
Data and content created by government employees within the scope of their employment 
are not subject to domestic copyright protection. 17 U.S.C. 105.
"""

import re
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
        self.noFactsOrAllFactsSuppressed = False
        self.excludeFromNumbering = False
        self.linkroleUri = linkroleUri
        self.isBarChart = 'barchart' in linkroleUri.casefold()
        self.fileNumber = None
        self.hasAxes = {}
        self.hasMembers = {}
        self.hasElements = set()
        self.timeAxis = set()
        self.unitAxis = {}
        self.labelDict = {}
        self.factMemberships = []
        self.abstractDict = {}
        self.embeddingList = []
        self.isEmbedded = False
        self.presentationGroup = None
        self.isTransposed = False
        self.isUnlabeled = False
        self.isElements = False
        self.isUncategorizedFacts = linkroleUri == 'http://xbrl.sec.gov/role/uncategorizedFacts'
        self.axisAndMemberOrderDict = {} # contains a tuple with an orderDict of members and the axes order relative to other axes
        self.defaultFilteredOutAxisSet = set()
        self.periodStartEndLabelDict = defaultdict(list) # populated by PresentationGroup.getLabelsRecursive
        modelRoleTypes = filing.modelXbrl.roleTypes[linkroleUri]
        if modelRoleTypes:
            self.definitionText = (modelRoleTypes[0].genLabel(strip=True) or modelRoleTypes[0].definition or linkroleUri).strip()
        else:
            self.definitionText = linkroleUri
        self.shortName = self.getShortName()
        self.cubeType = self.getCubeType()
        self.hasDiscoveredDurations = False
        self.rootNodeToConceptSetDict = {}
        
        # TO DO problem 2: searching from statement and equity, dumb
        if self.definitionText is None or self.definitionText.strip(' ') == '':
            dt = self.linkroleUri
        else:
            dt = self.definitionText.casefold()
        self.isStatementOfEquity = False
        self.isStatementOfCashFlows = False
        if (self.cubeType == 'statement' 
            and 'parenthetical' not in dt 
            and '(table' not in dt
            and '(detail' not in dt
            and '(polic' not in dt
            and filing.stmNamespace is not None):
            if   ('148600' in dt or
                  '148610' in dt or
                (('stockholder' in dt or 'shareholder' in dt or 'changes' in dt) and ('equity' in dt or 'deficit' in dt)) or
                (('partners' in dt or 'accounts' in dt) and 'capital' in dt) or
                 #('statement' in dt and 'capitalization' in dt) or # TODO: do we want this for case WEC?
                 ('statement' in dt and 'equity' in dt)):
                self.isStatementOfEquity = True
                filing.controller.logDebug('The Linkrole {} is a Statement of Equity.'.format(self.shortName))
                if filing.controller.noEquity:
                    self.isStatementOfEquity = False
                    filing.controller.logDebug('But noEquity is True so it will not be treated specially.')
            if (('cash' in dt and 'flow' in dt[dt.index('cash'):] and not 'supplement' in dt)):
                self.isStatementOfCashFlows = True
                filing.controller.logDebug('The Linkrole {} is a Statement of Cash Flows'.format(self.shortName))
                

    def __str__(self):
        return "[Cube R{!s} {} {}]".format(self.fileNumber, self.cubeType, self.shortName)


    def areTherePhantomAxesInPGWithNoDefault(self):
        axesWithoutDefaultsThatAllFactsAreDefaultedOn = self.defaultFilteredOutAxisSet - set(self.axisAndMemberOrderDict)
        if len(axesWithoutDefaultsThatAllFactsAreDefaultedOn) > 0:
            # there were axes without defaults in the PG that weren't mentioned by the facts.  since they weren't mentioned by the facts,
            # they weren't found in our intelligent graph traversal, traverseToRootOrRoots(). since they weren't mentioned by the facts,
            # we know that all of the facts are defaulted on them. BUT, they have no defaults, so all the facts are filtered out.
            self.noFactsOrAllFactsSuppressed = True
            axesStr = ', '.join([str(axisQname) for axisQname in sorted(axesWithoutDefaultsThatAllFactsAreDefaultedOn)])
            self.modelXbrl.warning("er3:allFactsFiltered",
                                   _("The presentation group ''%(presentationGroup)s'' contains %(axes)s, which either has (have) no default member in the "
                                    "presentation group and/or the definition linkbase. Since every fact is defaulted on this (these) axe(s),"
                                    "all facts have been filtered out."),
                                    modelObject=self.modelXbrl.modelDocument, presentationGroup=self.shortName, axes=axesStr)


    def handlePeriodStartEndLabel(self,discoveredDurations=[]):
        # for facts presented with startLabel or end label, make new facts with matching contexts
        # and append them to the initial list of facts. Therefore, one fact may become many if 
        # a periodStart(End)Label is used for an instant fact and there are many contexts that begin(end)
        # at that point in time.
        # references the cube.periodStartEndLabelDict  
        # will side effect cube.periodStartEndLabelDict if there is a duration fact with period start/end label.
        # will generally side effect self.factMemberships by appending to it.

        def matchingDurationSet(iFxm,preferredLabel): 
            # iFxm = instant Fact - axis - membership tuple.
            # return set of tuples consisting of start/end time tuple and start/end role
            ignore, iAxm, ignore = iFxm # iAxm = instant AxisMembership
            iPeriod = iAxm['period'] # instant Period (Period is a synonym for StartEndContext)
            iTime = iPeriod.endTime # instant Time
            assert iPeriod.periodTypeStr == 'instant'
            durations = set() # set of Periods to return
            if len(discoveredDurations)==0:
                for dFxm in self.factMemberships: # dFxm = duration's fact axis-membership tuple
                    dAxm = dFxm[1] # duration's AxisMembership dictionary
                    dPeriod = dAxm['period'] # duration's startEndContext
                    if dPeriod.periodTypeStr == 'duration' and not dPeriod in durations:
                        if 'Start' in preferredLabel:
                            dTimeToMatch = dPeriod.startTime
                        else:
                            dTimeToMatch = dPeriod.endTime
                        if dTimeToMatch == iTime:
                            durations.add(dPeriod) 
            else:
                for dPeriod in discoveredDurations:
                    if not dPeriod in durations:
                        if 'Start' in preferredLabel:
                            dTimeToMatch = dPeriod.startTime
                        else:
                            dTimeToMatch = dPeriod.endTime
                        if dTimeToMatch == iTime:
                            durations.add(dPeriod)
            return {((d.startTime,d.endTime),preferredLabel) for d in durations} 

        initialSize = len(self.factMemberships)
        i = initialSize - 1

        # set of instants with periodStart or periodEnd that could not be matched to a duration.
        skippedFactMembershipSet = set() # TODO: this could could probably be a list, rather than a set, BC
        
        while i >= 0:
            factMembership = self.factMemberships[i]
            fact, axisMemberLookupDict, role = factMembership
            # The startEndPreferredLabelList shows what label roles the presentation linkbase expected to be present.
            startEndPreferredLabelList = (self.periodStartEndLabelDict.get(fact.qname) or [])
            if len(startEndPreferredLabelList) > 0:
                startTupleSet = set()  # the set of durations that the instant of this fact begins
                for startRole in Utils.startRoles:
                    if startRole in startEndPreferredLabelList:
                        startTupleSet.update(matchingDurationSet(factMembership,startRole))
                endTupleSet = set() # the set of durations that the instant of this fact ends
                for endRole in Utils.endRoles:
                    if endRole in startEndPreferredLabelList:
                        endTupleSet.update(matchingDurationSet(factMembership,endRole))
                setOfMatches = startTupleSet.union(endTupleSet)
                if len(setOfMatches)==0:
                    for role in startEndPreferredLabelList:
                        skippedFactMembershipSet.add((fact,role,self,self.linkroleUri,self.shortName))
                   
                for startEndTuple, preferredLabel in setOfMatches:
                    try: # if startEndContext exists, find it
                        newStartEndContext = self.filing.startEndContextDict[startEndTuple]
                    except KeyError: # if not, create one and add it to respective data structures
                        newStartEndContext = Filing.StartEndContext(fact.context, startEndTuple)
                        self.filing.startEndContextDict[startEndTuple] = newStartEndContext
                        self.timeAxis.add(newStartEndContext)
                    tempAxisMemberLookupDict = axisMemberLookupDict.copy()
                    tempAxisMemberLookupDict['period'] = newStartEndContext
                    #  append to the fact memberships list that we were counting down from the end of.
                    self.factMemberships += [(fact, tempAxisMemberLookupDict, preferredLabel)]
            i -= 1
        skippedFactSet = {x[0] for x in skippedFactMembershipSet}
        if (len(skippedFactSet) == initialSize
            and len(discoveredDurations)==0):
            # if we skipped all the facts it means there were no durations.
            # go 'discover' the durations by comparing start and end instants.
            moments = sorted(list({fxm[1]['period'].endTime for fxm in self.factMemberships}))
            if len(moments) > 1:
                self.modelXbrl.info("er3:inferringDurations",
                                    _("In ''%(presentationGroup)s'', no matching durations for %(numFacts)s instant facts presented with start or end " 
                                      "preferred labels. Now inferring durations to form columns. Simplify the presentation " 
                                      "to get a more compact layout."),
                                    modelObject=self.modelXbrl.modelDocument, presentationGroup=self.shortName, numFacts=len(skippedFactSet))
                intervals = []                
                for i,endTime in enumerate(moments[1:]):
                    startTime = moments[i]
                    intervals += [Filing.StartEndContext(None,(startTime,endTime))]
                self.hasDiscoveredDurations = True
                self.handlePeriodStartEndLabel(discoveredDurations=intervals)

        self.filing.skippedFactsList += list(skippedFactMembershipSet)


    def getShortName(self):
        shortname = self.definitionText.strip()
        # gets rid of the curly brackets if it has transposed, unlabeled or elements inside.
        # there are examples (nils) that have other stuff inside of curly brackets, so we keep those.
        shortname = re.sub('\{[ ]*(transposed|unlabeled|elements)[ ]*\}', '', shortname, flags=re.IGNORECASE)
        # the above might leave consecutive spaces, this kills them.
        shortname = re.sub('[ ]+', ' ', shortname)
        if ' - ' in shortname:
            shortname = shortname[shortname.index(' - ')+3:].strip()
            if ' - ' in shortname:
                shortname = shortname[shortname.index(' - ')+3:].strip()
        return shortname


    def getCubeType(self):
        ignore, hyphen, rightOfHyphen = self.definitionText.partition('-')
        if hyphen == '':
            return None
        cubeType, secondHyphen, ignore = rightOfHyphen.partition('-')
        if secondHyphen == '':
            return None
        return cubeType.strip().casefold()


    def populateUnitPseudoaxis(self):
        giveMemGetPositionDict = {}
        for i, unit in enumerate(sorted(self.unitAxis.values(), key = lambda thing : thing.sourceline)):
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
                self.controller.logWarn("The statement of equity, ''{}'', has no durations with matching beginning and " \
                                        "ending instants.".format(self.shortName))
                self.isStatementOfEquity = False # no movements, warn the user it is probably not what they wanted                
                sortedList = list(self.timeAxis) # start over

        else:
            sortedList.sort(key = lambda startEndContext : startEndContext.endTime, reverse=True)
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



    def checkForTransposedUnlabeledAndElements(self):
        lowercaseDefTextWithNoWhitespace = ''.join(self.definitionText.casefold().split())

        # gives us the lowest indexes of each of these strings.  we want to find the first one.
        transposedIndex = lowercaseDefTextWithNoWhitespace.find('{transposed}')
        unlabeledIndex  = lowercaseDefTextWithNoWhitespace.find('{unlabeled}')
        elementsIndex   = lowercaseDefTextWithNoWhitespace.find('{elements}')
        # find returns -1 if it finds nothing

        # if transposed is present, the first one of the three mentioned wins
        if transposedIndex != -1:
            indexList = [transposedIndex, unlabeledIndex, elementsIndex]
            lowestAboveZero = len(self.definitionText)
            lowestPosition = -1
            for index, current in enumerate(indexList):
                if current > -1 and current < lowestAboveZero:
                    lowestAboveZero = current
                    lowestPosition = index

            if lowestPosition == 0:
                self.isTransposed = True
            elif lowestPosition == 1:
                self.isUnlabeled = True
            elif lowestPosition == 2:
                self.isElements = True

        # if elements is present, it beats unlabeled
        elif elementsIndex != -1:
            self.isElements = True

        # if only unlabeled is present, it wins
        elif unlabeledIndex != -1:
            self.isUnlabeled = True
            
    def rearrangeGiveMemGetPositionDict(self,axisQname,giveMemGetPositionDict):
        memberList = [item[0] for item in sorted(giveMemGetPositionDict.items(),key=lambda item : item[1])]
        builtinAxisOrders = self.filing.builtinAxisOrders
        builtinAxisOrder = next((s for s in builtinAxisOrders if axisQname==s[0]),None)
        if builtinAxisOrder is not None:
            (axis,members,lastmembers) = builtinAxisOrder
            self.controller.logDebug("Special sort of {} {} needed".format(axisQname,giveMemGetPositionDict))
            prefix = axis.prefix
            nsuri = axis.namespaceURI
            ordering = [arelle.ModelObject.QName(prefix,nsuri,name) for name in members]   
            overrideordering = [arelle.ModelObject.QName(prefix,nsuri,name) for name in lastmembers]                        
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
            for memberQname in axis.hasMembers:
                if memberQname in self.hasMembers:
                    text += '\tmember: {!s}\n'.format(memberQname)
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
