# -*- coding: utf-8 -*-
"""
:mod:`re.Cube`
~~~~~~~~~~~~~~~~~~~
Edgar(tm) Renderer was created by staff of the U.S. Securities and Exchange Commission.
Data and content created by government employees within the scope of their employment 
are not subject to domestic copyright protection. 17 U.S.C. 105.
"""

import re
from collections import defaultdict
import arelle.ModelObject
from . import ErrorMgr, Utils
Filing = None

class Cube(object):
    def __init__(self, filing, linkroleUri):
        global Filing
        if Filing is None:
            from . import Filing
        self.filing = filing
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
        self.numGarbageCollectedEmbeddigns = 0
        self.hasDiscoveredDurations = False
        self.rootNodeToConceptSetDict = {}
        self.skippedFactMembershipSet = set() # set of instants with periodStart or periodEnd that could not be matched to a duration.
        
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
            and self.filing.stmNamespace is not None):
            if   ('148600' in dt or
                  '148610' in dt or
                (('stockholder' in dt or 'shareholder' in dt or 'changes' in dt) and ('equity' in dt or 'deficit' in dt)) or
                (('partners' in dt or 'accounts' in dt) and 'capital' in dt) or
                 #('statement' in dt and 'capitalization' in dt) or # TODO: do we want this for case WEC?
                 ('statement' in dt and 'equity' in dt)):
                self.isStatementOfEquity = True
                self.addToLog('The Linkrole {} is a Statement of Equity.'.format(linkroleUri), messageCode='info')
                if self.filing.controller.noEquity:
                    self.isStatementOfEquity = False
                    self.addToLog('But noEquity is True so it will not be treated specially.',messageCode='info')
            if (('cash' in dt and 'flow' in dt[dt.index('cash'):] and not 'supplement' in dt)):
                self.isStatementOfCashFlows = True
                self.addToLog('The Linkrole {} is a Statement of Cash Flows'.format(linkroleUri),messageCode='info')
                

    def __str__(self):
        return "[Cube R{!s} {} {}]".format(self.fileNumber, self.cubeType, self.shortName)



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
                        self.skippedFactMembershipSet.add((fact,role,self,self.linkroleUri,self.shortName))
                   
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
        skippedFactSet = {x[0] for x in self.skippedFactMembershipSet}
        if (len(skippedFactSet) == initialSize
            and len(discoveredDurations)==0):
            # if we skipped all the facts it means there were no durations.
            # go 'discover' the durations by comparing start and end instants.
            moments = sorted(list({fxm[1]['period'].endTime for fxm in self.factMemberships}))
            if len(moments) > 1:
                self.addToLog(("No matching durations in ''{}'' for {} instant facts presented with start or end preferred labels. "
                               +"Now inferring durations to form columns.  "
                               +"Simplify the presentation to get a more compact layout."
                              ).format(self.shortName,len(skippedFactSet))
                              ,messageCode='Info')
                intervals = []                
                for i,endTime in enumerate(moments[1:]):
                    startTime = moments[i]
                    intervals += [Filing.StartEndContext(None,(startTime,endTime))]
                self.hasDiscoveredDurations = True
                self.handlePeriodStartEndLabel(discoveredDurations=intervals)
        return
    
    
    def strExplainSkippedFact(self,fact,role,shortName):
        # we skipped over this fact because it could not be placed
        # Produce a string explaining for this instant fact why it could not be presented 
        # with a periodStart or periodEnd label in this presentation group.
        qname = fact.qname
        value = Utils.strFactValue(fact, preferredLabel=role)
        context = fact.context.id
        endTime = fact.context.period.stringValue.strip()
        word = 'Starting or Ending'
        if role is not None:
            role = role.rsplit('/')[-1]
            if 'Start' in role:
                word = 'starting'
            elif 'End' in role:
                word = 'ending'
        message = ErrorMgr.getError('SKIPPED_FACT_WARNING').format(shortName,qname,value,context,role,word,endTime)
        return message       
                       



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
                message = ErrorMgr.getError('STATEMENT_OF_EQUITY_NO_COMPLETE_MOVEMENTS_WARNING').format(self.shortName)
                self.addToLog(message, messageCode='warn')
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
        self.addToLog('Statement {} has {} Movements.'.format(self.shortName,len(movementList)))
        for context,movements in giveContextGetMovementsDict.items():
            if len(movements)==0:
                # Contexts that aren't in a complete movement are removed (do not survive).
                sortedList.remove(context)
                self.addToLog('Context {} was not part of a complete Movement'.format(context),messageCode='debug')
        return sortedList # from SurvivorsOfMovementAnalysis





    def DetermineAxesWhereDefaultFilteredOut(self):
        for pseudoaxisQname, (orderDict, ignore) in self.axisAndMemberOrderDict.items():
            try:
                axis = self.hasAxes[pseudoaxisQname] # this means we ignore primary, unit and period
                if axis.defaultArelleConcept is None or axis.defaultArelleConcept.qname not in orderDict:
                    self.defaultFilteredOutAxisSet.add(pseudoaxisQname)
            except KeyError:
                pass

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
            self.addToLog("Special sort of {} {} needed".format(axisQname,giveMemGetPositionDict), messageCode='debug')
            prefix = axis.prefix
            nsuri = axis.namespaceURI
            ordering = [arelle.ModelObject.QName(prefix,nsuri,name) for name in members]   
            overrideordering = [arelle.ModelObject.QName(prefix,nsuri,name) for name in lastmembers]                        
            memberList = Utils.heapsort(memberList,(lambda x,y: Utils.compareInOrdering(x,y,ordering,overrideordering)))
            giveMemGetPositionDict = dict([(x,i) for i,x in enumerate(memberList)])
            self.addToLog("Resulted in {}".format(giveMemGetPositionDict), messageCode='debug')                                                        
        return giveMemGetPositionDict
       

    def printCube(self):
        self.addToLog('\n\n**************** '+self.linkroleUri)
        self.addToLog(self.definitionText)

        text = '\n\n\naxes and members from contexts:\n'
        for axisQname, axis in self.hasAxes.items():
            text += 'Axis: ' + str(axisQname) + '\n'
            for memberQname in axis.hasMembers:
                if memberQname in self.hasMembers:
                    text += '\tmember: ' + str(memberQname) + '\n'
        self.addToLog(text)
  
        text = '\naxisAndMemberOrderDict:\n'
        for pseudoaxisQname in self.axisAndMemberOrderDict:
            text += '\t{!s}\n'.format(pseudoaxisQname)
        self.addToLog(text)
  
        self.addToLog('\ndefaultFilteredOutAxisSet\n')
        for c in self.defaultFilteredOutAxisSet:
            self.addToLog('\t{}\n'.format(str(c)))
 
        self.addToLog('\n\npresentationGroup:')
        self.presentationGroup.printPresentationGroup()


    def addToLog(self,message,messageCode='debug',messageArgs=(),file='Cube.py'):
        self.filing.controller.addToLog(message, messageCode=messageCode, messageArgs=messageArgs, file=file)