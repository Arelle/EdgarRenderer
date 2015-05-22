# -*- coding: utf-8 -*-
"""
:mod:`re.Embedding`
~~~~~~~~~~~~~~~~~~~
Edgar(tm) Renderer was created by staff of the U.S. Securities and Exchange Commission.
Data and content created by government employees within the scope of their employment 
are not subject to domestic copyright protection. 17 U.S.C. 105.
"""

from collections import defaultdict
import arelle.ModelValue
import Utils, ErrorMgr

class FactAxisMemberGroup(object):
    def __init__(self, fact, preferredLabel = None):
        self.fact = fact
        self.preferredLabel = preferredLabel
        self.factAxisMemberRowList = []
        self.axisMemberPositionTupleRowList = []  # for sorting
        self.factAxisMemberColList = []
        self.axisMemberPositionTupleColList = []  # for sorting

    def __str__(self):
        return "[{}='{}' w/{}Cx{}R]".format(self.fact.elementQname, self.fact.sValue, len(self.factAxisMemberColList), len(self.factAxisMemberRowList))

class FactAxisMember(object):
    def __init__(self, pseudoAxisName, member, axisMemberPositionTuple=None, memberLabel='None', memberIsDefault=False):
        self.pseudoAxisName = pseudoAxisName
        self.member = member  # either a qname or a startEndContext or a unitID object
        self.axisMemberPositionTuple = axisMemberPositionTuple
        self.memberLabel = memberLabel
        self.memberIsDefault = memberIsDefault
        
    def __str__(self):
        return "[{}={}]".format(self.pseudoAxisName, self.member)

class Embedding(object):
    def __init__(self, filing, cube, commandTextListOfLists, factThatContainsEmbeddedCommand=None):
        self.filing = filing
        self.cube = cube
        self.commandTextListOfLists = commandTextListOfLists
        self.setOfGivenAxes = set()
        self.factThatContainsEmbeddedCommand = factThatContainsEmbeddedCommand
        self.report = None
        self.getMemberPositionsOnAxisDictOfDicts = {}
        self.noDisplayAxesSet = set()
        self.unitsToScaleGloballySet = defaultdict(set)
        self.unitsWeAreKeepingSet = set()
        self.rowCommands = []
        self.colCommands = []
        self.groupedAxisQnameSet = set()
        self.factAxisMemberGroupList = []
        self.hasElementsAndElementMemberPairs = set()
        self.isEmbeddingOrReportBroken = False
        self.hasDiscoveredDurations = False


    def handleTransposedByModifyingCommandText(self):
        for i in range(len(self.commandTextListOfLists)):
            if self.commandTextListOfLists[i][0] == 'row':
                self.commandTextListOfLists[i][0] = 'column'
            else:
                self.commandTextListOfLists[i][0] = 'row'


    def generateStandardEmbeddedCommandsFromPresentationGroup(self):
        axes = set()
        # we make this orderedListOfOrderAxisQnameTuples, instead of sorting the dict, just to remove period, unit and primary which order = None.
        orderedListOfOrderAxisQnameTuples = []
        for pseudoaxisQname, (ignore, presentationGroupOrderForAxis) in self.cube.axisAndMemberOrderDict.items():
            axes.add(pseudoaxisQname)
            if presentationGroupOrderForAxis is not None:  # unit, period and primary don't have a presentationGroup order
                axisLabel = self.cube.hasAxes[pseudoaxisQname].arelleConcept.label()
                if axisLabel is None:
                    axisLabel = ''
                orderedListOfOrderAxisQnameTuples += [(presentationGroupOrderForAxis, pseudoaxisQname, axisLabel)]

        # here we sort by presentationGroup order, and if they are the same because the axes were all roots, then sort by axis label
        orderedListOfOrderAxisQnameTuples = sorted(orderedListOfOrderAxisQnameTuples, key=lambda thing : (thing[0], thing[2]))

        if self.cube.isStatementOfEquity:
            self.localnamesMovedToColumns = []
            self.localnamesMovedToRows = []   
          
            if len(self.cube.timeAxis) > 0:
                self.commandTextListOfLists += [['row', 'period', 'compact', '*']]

            self.commandTextListOfLists += [['row', 'primary', 'compact', '*']]

            for parts in self.filing.builtinEquityRowAxes:
                (prefix, namespaceuri, localname) = parts
                qname = arelle.ModelValue.QName(prefix, namespaceuri, localname)
                if qname in axes:
                    self.commandTextListOfLists += [['row', qname, 'compact', '*']]
                    self.localnamesMovedToRows += [localname]
                    axes.discard(qname)

            for ignore, axisQname, ignore in orderedListOfOrderAxisQnameTuples:
                if axisQname in axes:  # the axes that have not been moved to rows already
                    self.localnamesMovedToColumns += [axisQname.localName]
                    self.commandTextListOfLists += [['column', axisQname, 'compact', '*']]
            
            if len(self.cube.unitAxis) > 0:
                self.commandTextListOfLists += [['column', 'unit', 'compact', '*']]

            if self.filing.controller.debugMode:  # when in debug mode elevate this to the Filing Summary log.
                self.filing.controller.logInfo("''{}'' moved {} to Columns and {} to rows."
                                               .format(self.cube.shortName, self.localnamesMovedToColumns, self.localnamesMovedToRows))

            self.filing.controller.logInfo("Equity Command List {}".format(self.commandTextListOfLists))

        elif self.cube.cubeType == 'statement' or self.filing.hasEmbeddings or self.cube.isElements:
            generatedCommandTextListOfLists = []

            if self.cube.isEmbedded:
                rowOrCol = 'column'
            else:
                rowOrCol = 'row'
            for ignore, axisQname, ignore in orderedListOfOrderAxisQnameTuples:
                generatedCommandTextListOfLists += [[rowOrCol, axisQname, 'compact', '*']]

            generatedCommandTextListOfLists += [['row', 'primary', 'compact', '*']]

            if len(self.cube.unitAxis) > 0:
                generatedCommandTextListOfLists += [['column', 'unit', 'compact', '*']]

            # if there were commands given for this embedding
            if len(self.commandTextListOfLists) > 0:
                self.setOfGivenAxes = set(commandsTextList[1] for commandsTextList in self.commandTextListOfLists)

                for axisQname, (ignore, presentationGroupOrderForAxis) in self.cube.axisAndMemberOrderDict.items():
                    if presentationGroupOrderForAxis == Utils.minNumber and axisQname not in self.setOfGivenAxes:
                        errorStr = Utils.printErrorStringToDisambiguateEmbeddedOrNot(self.factThatContainsEmbeddedCommand)
                        printThisTextIfTrue = ''
                        if self.cube.isEmbedded:
                            printThisTextIfTrue = ' or by an embedded command'
                        message = ErrorMgr.getError('DIMENSION_AXIS_ORDER_WARNING').format(self.cube.shortName, errorStr, str(axisQname), printThisTextIfTrue)
                        self.addToLog(message, messageCode='warn')

                # simply append the generated axes that were not in the embedded command onto the end of the given commands.
                for commandsTextList in generatedCommandTextListOfLists:
                    if commandsTextList[1] not in self.setOfGivenAxes:
                        self.commandTextListOfLists += [commandsTextList]
            else:
                self.commandTextListOfLists = generatedCommandTextListOfLists

            # period always goes first, unless it's already in the embedded command.
            if len(self.cube.timeAxis) > 0 and 'period' not in self.setOfGivenAxes:
                self.commandTextListOfLists = [['column', 'period', 'compact', '*']] + self.commandTextListOfLists

            # this is a special case added so that in case bar charts are all rows or cols, we will fix it so that it has both
            # by relocating the primary axis.
            if self.cube.isBarChart:
                rowAndColSet = {commandsTextList[0] for commandsTextList in self.commandTextListOfLists}
                if len(rowAndColSet) == 1:
                    rowOrCol = rowAndColSet.pop()
                    if rowOrCol == 'row':
                        opposite = 'column'
                    else:
                        opposite = 'row'
                    for i in range(len(self.commandTextListOfLists)):
                        if self.commandTextListOfLists[i][1] == 'primary':
                            self.commandTextListOfLists[i][0] = opposite
                            break

        else:
            for ignore, axisQname, ignore in orderedListOfOrderAxisQnameTuples:
                self.commandTextListOfLists += [['row', axisQname, 'compact', '*']]

            self.commandTextListOfLists += [['row', 'primary', 'compact', '*']]

            if len(self.cube.timeAxis) > 0:
                self.commandTextListOfLists += [['column', 'period', 'compact', '*']]

            if len(self.cube.unitAxis) > 0:
                self.commandTextListOfLists += [['column', 'unit', 'compact', '*']]




    def buildAndProcessCommands(self):
        for commandTextList in self.commandTextListOfLists:
            command = Command(self.filing, self.cube, self, commandTextList)
            if command.processCommandBuildgetMemberPositionsOnAxisDictOfDicts() != 'broken':
                if command.rowOrColumn == 'row':
                    self.rowCommands += [command]
                else:
                    self.colCommands += [command]

        # make sure there are some row commands and column commands, else kill embedding.
        errorStr1 = None
        if len(self.rowCommands) == 0:
            errorStr1 = 'row'
        elif len(self.colCommands) == 0:
            errorStr1 = 'column'
        if errorStr1 is not None:
            errorStr2 = Utils.printErrorStringToDisambiguateEmbeddedOrNot(self.factThatContainsEmbeddedCommand)
            beginMessage = ErrorMgr.getError('EMBEDDED_COMMANDS_ALL_ROWS_OR_ALL_COLUMNS_ERROR').format(self.cube.shortName, errorStr2, errorStr1)
            self.addToLog(beginMessage, messageCode='error')
            self.isEmbeddingOrReportBroken = True




    # this function makes a factAxisMemberGroup for each fact we're keeping, and does some housekeeping too.
    def processOrFilterFacts(self):
        pseudoAxisRowColStrTuples = [(command.pseudoAxis, command.rowOrColumn) for command in self.rowCommands + self.colCommands]
        pseudoAxisSet = {pseudoAxisRowColStrTuple[0] for pseudoAxisRowColStrTuple in pseudoAxisRowColStrTuples}

        # simply get the index of the primary axis and whether it's on the rows or cols
        for axisIndex, (pseudoAxisName, rowOrColStr) in enumerate(pseudoAxisRowColStrTuples):
            if pseudoAxisName == 'primary':  # there is always a primary
                primaryIndex = axisIndex
                primaryRowOrColStr = rowOrColStr
                break

        for fact, getMemberOnAxisForFactDict, periodStartEndLabel in self.cube.factMemberships:
            factAxisMemberGroupList = self.buildFactAxisMemberGroupsForFactOrFilter(pseudoAxisRowColStrTuples, pseudoAxisSet, fact, getMemberOnAxisForFactDict, periodStartEndLabel, primaryIndex, primaryRowOrColStr)

            if len(factAxisMemberGroupList) == 0:
                self.addToLog('Filtered fact {} in {}'.format(fact, self.cube.shortName), messageCode='debug')
                continue  # we are filtering fact

            self.factAxisMemberGroupList += factAxisMemberGroupList

            # general house keeping because this is the place where we finally know that we're keeping this fact
            if fact.unitID is not None:
                self.unitsWeAreKeepingSet.add(fact.unitID)
            self.hasElementsAndElementMemberPairs.add(fact.qname)
            self.filing.usedOrBrokenFactSet.add(fact)
            if fact.concept.isMonetary or fact.concept.isShares or fact.unitSymbol() != '':
                self.unitsToScaleGloballySet[fact.unitID].add(fact)  # default dict

        # if all facts were all filtered out, we don't bother making a report
        if len(self.factAxisMemberGroupList) == 0:
            errorStr = Utils.printErrorStringToDisambiguateEmbeddedOrNot(self.factThatContainsEmbeddedCommand)
            message = ErrorMgr.getError('LINKROLE_HAS_NO_FACTS').format(self.cube.shortName, errorStr)
            self.addToLog(message, messageCode='debug')
            self.isEmbeddingOrReportBroken = True
            self.cube.excludeFromNumbering = True
            return

        # if there are multiple root nodes, and we are actually using the nodes under more than one of them, print a warning to tell filers that the ordering
        # of nodes between both root nodes might be unexpected (root nodes will be ordered by label).
        if len(self.cube.presentationGroup.rootNodeList) > 1:
            usedConceptsSet = {factAxisMemberGroup.fact.concept for factAxisMemberGroup in self.factAxisMemberGroupList}
            usedConceptsSet.update(pseudoAxisSet - self.setOfGivenAxes - {'unit', 'primary', 'period'})

            numUsedRootNodes = 0
            for rootNodeConceptSet in self.cube.rootNodeToConceptSetDict.values():
                if not rootNodeConceptSet.isdisjoint(usedConceptsSet):
                    numUsedRootNodes += 1
                    if numUsedRootNodes == 2:  # we've used two different root nodes, so we issue the multiple root node warning
                        message = ErrorMgr.getError('PRESENTATION_GROUP_MULTIPLE_ROOT_NODES_WARNING').format(self.cube.shortName)
                        self.addToLog(message, messageCode='warn')
                        break





    def buildFactAxisMemberGroupsForFactOrFilter(self, pseudoAxisRowColStrTuples, pseudoAxisSet, fact, getMemberOnAxisForFactDict, periodStartEndLabel, primaryIndex, primaryRowOrColStr):
        # if fact has an axis that's filtered out or that isn't associated with any facts, filter fact
        if len(set(getMemberOnAxisForFactDict) - pseudoAxisSet) > 0:
            return []

        # loop through each axis other than primary and make a factAxisMember for each axis
        factAxisMemberTupleList = []
        for axisIndex, (pseudoAxisName, rowOrColStr) in enumerate(pseudoAxisRowColStrTuples):
            if pseudoAxisName != 'primary':
                factAxisMember = self.generateFactAxisMemberForNonPrimary(fact, axisIndex, periodStartEndLabel, pseudoAxisName, getMemberOnAxisForFactDict)
                if factAxisMember is None:
                    return []
                factAxisMemberTupleList += [(factAxisMember, rowOrColStr)] 

        # the same element can be listed by the presentationGroup multiple times, even with the same label, so generateFactAxisMemberLabelListForPrimary()
        # returns a list, but if it's empty, generateFactAxisMemberLabelListForPrimary() found no matches and we won't enter the for loop, so it is
        # effectively filtered. In this loop we make factAxisMemberGroup objects
        factAxisMemberGroupList = []
        for factAxisMemberForPrimary, label in self.generateFactAxisMemberLabelListForPrimary(fact, primaryIndex, periodStartEndLabel):
            factAxisMemberGroup = FactAxisMemberGroup(fact)
            factAxisMemberGroup.preferredLabel = label

            # finally insert primary factAxisMember
            factAxisMemberTupleListCopy = factAxisMemberTupleList.copy()
            factAxisMemberTupleListCopy.insert(primaryIndex, (factAxisMemberForPrimary, primaryRowOrColStr))

            for factAxisMember, rowOrColStr in factAxisMemberTupleListCopy:
                if rowOrColStr == 'row':
                    factAxisMemberGroup.factAxisMemberRowList += [factAxisMember]
                    factAxisMemberGroup.axisMemberPositionTupleRowList += [factAxisMember.axisMemberPositionTuple]
                else:
                    factAxisMemberGroup.factAxisMemberColList += [factAxisMember]
                    factAxisMemberGroup.axisMemberPositionTupleColList += [factAxisMember.axisMemberPositionTuple]

            factAxisMemberGroupList += [factAxisMemberGroup]

        return factAxisMemberGroupList





    # this builds a factAxisMember and sets the memberLabel and axisMemberPositionTuple attributes.
    # it also decides whether to filter the fact.
    def generateFactAxisMemberLabelListForPrimary(self, fact, axisIndex, periodStartEndLabel):
        # getMemberPositionsOnAxisDict is a defaultdict(list) for primary, for the other axes it's not.  so we get a list of tuples with
        # a lookup. this is all because periodStartLabel and periodEndLabel can have facts that expand into multiple facts, hence the list.
        getMemberPositionsOnAxisDict = self.getMemberPositionsOnAxisDictOfDicts['primary']  # this lookup has to work, dict entry only made if it's a command
        factAxisMemberLabelList = []
        for positionOnPrimaryAxis, labelRole in getMemberPositionsOnAxisDict[fact.qname]:
            if (labelRole not in Utils.startEndRoles or periodStartEndLabel == labelRole):
                factAxisMember = FactAxisMember('primary', fact.qname)
                factAxisMember.axisMemberPositionTuple = (axisIndex, positionOnPrimaryAxis)

                if labelRole in Utils.durationStartEndRoles:
                    labelStr = fact.qname.localName
                    # Issue warnings on every fact, because it applies to all the facts.
                    errorStr = Utils.printErrorStringToDisambiguateEmbeddedOrNot(self.factThatContainsEmbeddedCommand)
                    message = ErrorMgr.getError('INSTANT_DURATION_CONFLICT_WARNING')
                    for linkroleUri, qname, originalLabelRole, shortName in self.filing.ignoredPreferredLabels:
                        if      (self.cube.linkroleUri == linkroleUri and
                                 fact.concept.qname == qname and
                                 Utils.matchedDurationRoles(originalLabelRole,labelRole)):
                            message = message.format(shortName, errorStr, str(qname), Utils.strFactValue(fact))            
                            self.addToLog(message, messageCode='warn')                                           

                else:
                    labelStr = fact.concept.label(preferredLabel=labelRole, fallbackToQname=True)

                factAxisMember.memberLabel = labelStr
                factAxisMemberLabelList += [(factAxisMember, labelRole)]
        return factAxisMemberLabelList


    # this builds a factAxisMember and sets the memberLabel and axisMemberPositionTuple attributes.
    # it also decides whether to filter the fact.
    def generateFactAxisMemberForNonPrimary(self, fact, axisIndex, periodStartEndLabel, pseudoAxisName, getMemberOnAxisForFactDict):
        getMemberPositionsOnAxisDict = self.getMemberPositionsOnAxisDictOfDicts[pseudoAxisName]

        memberQname = getMemberOnAxisForFactDict.get(pseudoAxisName)
        if pseudoAxisName == 'period' and self.cube.hasDiscoveredDurations:
            substituteInstant = memberQname.endTime
            memberQname = self.filing.startEndContextDict[(None, substituteInstant)]

        memberLabel = None
        memberPositionOnAxis = None
        memberIsDefault = False

        if memberQname is None:
            if pseudoAxisName in {'unit', 'period'}:
                memberPositionOnAxis = Utils.minNumber  # has no order from PG, so put at beginning
            else:
                axis = self.cube.hasAxes[pseudoAxisName]
                axisDefaultQname = None
                try:
                    axisDefaultQname = axis.defaultArelleConcept.qname
                except AttributeError:
                    # we dont want to filter uncategorized facts.  it is possible that fact is defaulted on an axis with no default
                    # in which case we don't want to filter it if it's an uncategorized fact, we want to print it to show the filer
                    # that it wasn't in any other report.  so, in this case, we manufacture a label.
                    if not self.cube.isUncategorizedFacts:
                        errorStr = Utils.printErrorStringToDisambiguateEmbeddedOrNot(self.factThatContainsEmbeddedCommand)
                        message = ErrorMgr.getError('AXIS_HAS_NO_DEFAULT').format(axis.arelleConcept.qname, fact.qname, fact.contextID, errorStr)
                        self.addToLog(message, messageCode='warn')
                        return None
                if pseudoAxisName in self.cube.defaultFilteredOutAxisSet:  # this isn't checked earlier to give the above warning a chance to be issued
                    return None

                if axisDefaultQname is None:
                    memberLabel = '{!s} has no default member'.format(pseudoAxisName)
                else:
                    memberLabel = self.cube.labelDict[axisDefaultQname]

                try:
                    # if this lookup fails, domain was filtered out by command, but is in presentationGroup
                    memberPositionOnAxis = getMemberPositionsOnAxisDict[axisDefaultQname]
                except KeyError:
                    # see note above about not filtering uncategorized facts.  below, we manufacture an ordering for this
                    # manufactured member.  we just pick an ordering that is guaranteed to be after all of the other members
                    # that actually do exist.
                    if self.cube.isUncategorizedFacts:
                        memberPositionOnAxis = len(getMemberPositionsOnAxisDict)
                    else:
                        return None
            memberIsDefault = True

        else:
            try:
                memberPositionOnAxis = getMemberPositionsOnAxisDict[memberQname]  # look up memberQname order
            except KeyError:
                return None  # if this lookup fails, memberQname was filtered out by command, but is in presentationGroup

            if pseudoAxisName == 'period':
                memberLabel = memberQname.label  # memberQname is a StartEndContext object
            else:
                if pseudoAxisName != 'unit':
                    self.hasElementsAndElementMemberPairs.add((fact.qname, memberQname))

                try:
                    memberLabel = self.cube.labelDict[memberQname]
                except KeyError:
                    if pseudoAxisName == 'unit':
                        memberLabel, ignore = Utils.getUnitStr(fact)
                    else:
                        memberLabel = Utils.prettyPrintQname(memberQname.localName)

        return FactAxisMember(pseudoAxisName, memberQname, axisMemberPositionTuple = (axisIndex, memberPositionOnAxis),
                              memberLabel = memberLabel, memberIsDefault = memberIsDefault)



    # it is uncomfortable to go back and order the unit axis at this point, it would be easier to do it in Cube's populateUnitPseudoaxis(),
    # however, we do it only because we don't what units will actually be used by this embedding until we've decided which facts we're
    # filtering out. this is the first time we actually know that, so if we do detect that the user was trying to order units with the PG,
    # and that the ordering is complete, we will go back and reorder the unit axis.
    def possiblyReorderUnitsAfterTheFactAccordingToPresentationGroup(self):
        if len(self.cube.presentationGroup.unitOrdering) == 0 or len(self.unitsWeAreKeepingSet) == 0:
            return

        # if units are in the PG we construct the unit pseudo axis with their PG ordering.  However, we first need to make sure that the unit is actually
        # used in this cube -- before we could only tell if it's a unit in the entire instance, because we didn't have the cube yet.  then we insist that
        # the units given by the graph form a total ordering, if we are only given a partial ordering, we throw a warning.
        unitOrderDict = {}
        for order, unitId in sorted(self.cube.presentationGroup.unitOrdering, key=lambda thing : thing[0]):
            if unitId in self.unitsWeAreKeepingSet:
                unitOrderDict[unitId] = order

        if len(unitOrderDict) == 0:
            return  # none of the units we picked up from the PG are actually being used in this embedding.

        # tests to see if unit ordering from graph is complete or not, if not, print warning and return.
        if len(unitOrderDict) < len(self.unitsWeAreKeepingSet):
            unitOrderingsFromPGStr = ', '.join(list(unitOrderDict))
            missingUnitOrderingsStr = ', '.join(list(set(self.unitsWeAreKeepingSet) - set(unitOrderDict)))
            message = ErrorMgr.getError('PRESENTATION_LINKBASE_UNIT_ORDERING_INCOMPLETE_WARNING').format(self.cube.shortName, unitOrderingsFromPGStr, missingUnitOrderingsStr)
            self.addToLog(message, messageCode='warn')
            return

        # ok, now we're going to reorder the unit axis fact by fact.
        # first find the unit axis, is it on the rows or the cols, and what index is it?
        tempFactAxisMemberGroup = self.factAxisMemberGroupList[0]
        unitAxisOnColsOrRows = ''
        unitAxisIndex = 0
        for i, factAxisMember in enumerate(tempFactAxisMemberGroup.factAxisMemberColList):
            if factAxisMember.pseudoAxisName == 'unit':
                unitAxisIndex = i
                unitAxisOnColsOrRows = 'cols'
                break
        if unitAxisOnColsOrRows == '':  # look on the rows now for unit.
            for i, factAxisMember in enumerate(tempFactAxisMemberGroup.factAxisMemberRowList):
                if factAxisMember.pseudoAxisName == 'unit':
                    unitAxisIndex = i
                    unitAxisOnColsOrRows = 'rows'
                    break

        # go through each fact and change the order of the unit axis.
        # we have to change FactAxisMember's axisMemberPositionTuple attribute, but this attribute is also copied to FactAxisMemberGroups's
        # axisMemberPositionTupleRowOrColList attribute, so we have to change them both together.
        if unitAxisOnColsOrRows == 'rows':
            for factAxisMemberGroup in self.factAxisMemberGroupList:
                if factAxisMemberGroup.fact.unit is not None:
                    self.reorderUnitHelper(factAxisMemberGroup.factAxisMemberRowList[unitAxisIndex], factAxisMemberGroup.axisMemberPositionTupleRowList, unitAxisIndex, unitOrderDict)
        else:
            for factAxisMemberGroup in self.factAxisMemberGroupList:
                if factAxisMemberGroup.fact.unit is not None:
                    self.reorderUnitHelper(factAxisMemberGroup.factAxisMemberColList[unitAxisIndex], factAxisMemberGroup.axisMemberPositionTupleColList, unitAxisIndex, unitOrderDict)

    def reorderUnitHelper(self, factAxisMember, axisMemberPositionTupleRowOrColList, unitAxisIndex, unitOrderDict):
        axisOrderFromTuple = factAxisMember.axisMemberPositionTuple[0]
        newUnitOrderForUnit = unitOrderDict[factAxisMember.member]
        factAxisMember.axisMemberPositionTuple = axisMemberPositionTupleRowOrColList[unitAxisIndex] = (axisOrderFromTuple, newUnitOrderForUnit)



    def printEmbedding(self):
        self.addToLog('\n\n\n****************************************************************')
        self.addToLog('getMemberPositionsOnAxisDictOfDicts:')
        for c in self.getMemberPositionsOnAxisDictOfDicts.items():
            self.addToLog('\t{}'.format(c))

        self.addToLog('isEmbedded: {}'.format(self.cube.isEmbedded))
        try:
            embeddedCommandText = self.factThatContainsEmbeddedCommand.value
        except AttributeError:
            embeddedCommandText = ''
        self.addToLog('embedding command textblock: ' + embeddedCommandText)

        self.addToLog('rowCommands:')
        for c in self.rowCommands:
            self.addToLog('\t{}'.format(c.commandTextList))

        self.addToLog('columnCommands:')
        for c in self.colCommands:
            self.addToLog('\t{}'.format(c.commandTextList))

        self.addToLog('noDisplayAxesSet')
        self.addToLog('\t{}'.format(self.noDisplayAxesSet))

        self.addToLog('****************************************************************\n\n\n')

    def addToLog(self, message, messageCode='debug', messageArgs=(), file='Embedding.py'):
        self.filing.controller.addToLog(message, messageCode=messageCode, messageArgs=messageArgs, file=file)



class Command(object):
    def __init__(self, filing, cube, embedding, commandTextList):
        self.filing = filing
        self.cube = cube
        self.embedding = embedding
        self.commandTextList = commandTextList
        self.rowOrColumn = commandTextList[0]
        self.pseudoAxis = commandTextList[1]
        self.formattingType = commandTextList[2]
        self.memberSelectorList = commandTextList[3:]

    def processCommandBuildgetMemberPositionsOnAxisDictOfDicts(self):
        if self.cube.isElements and self.pseudoAxis == 'primary' and self.rowOrColumn == 'column':
            self.rowOrColumn = 'row' # we will fix it for them
            errorStr = Utils.printErrorStringToDisambiguateEmbeddedOrNot(self.embedding.factThatContainsEmbeddedCommand)
            message = ErrorMgr.getError('ELEMENTS_USED_PRIMARY_ON_COLUMNS_WARNING').format(self.cube.shortName, errorStr)
            self.addToLog(message, messageCode='warn')

        if self.formattingType == 'nodisplay':
            self.embedding.noDisplayAxesSet.add(self.pseudoAxis)

        #elif self.formattingType == 'grouped':
            #===================================================================
            # if self.pseudoAxis == 'primary':
            #     errorStr = Utils.printErrorStringToDisambiguateEmbeddedOrNot(self.factThatContainsEmbeddedCommand)
            #     message = ErrorMgr.getError('EMBEDDED_COMMAND_WARNING2_GROUPED_USED_FOR_PRIMARY').format(errorStr)
            #     self.addToLog(message, messageCode='warn')
            #     self.formattingType ='compact'
            # elif self.pseudoAxis not in {'period', 'unit'} and self.filing.axisDict[self.pseudoAxis].defaultArelleConcept is None:
            #     errorStr = Utils.printErrorStringToDisambiguateEmbeddedOrNot(self.factThatContainsEmbeddedCommand)
            #     message = ErrorMgr.getError('EMBEDDED_COMMAND_GROUPED_USED_WARNING_FOR_INVALID_AXIS').format(errorStr)
            #     self.addToLog(message, messageCode='warn')
            #     self.formattingType ='compact'
            # if self.rowOrColumn == 'column':
            #     errorStr = Utils.printErrorStringToDisambiguateEmbeddedOrNot(self.factThatContainsEmbeddedCommand)
            #     message = ErrorMgr.getError('EMBEDDED_COMMAND_WARNING3_GROUPED_USED_FOR_COLUMN').format(errorStr)
            #     self.addToLog(message, messageCode='warn')
            #     self.formattingType ='compact'
            #===================================================================

        try:
            giveMemGetPositionDict = self.cube.axisAndMemberOrderDict[self.pseudoAxis][0]
        except KeyError:
            return 'broken'  # this command is broken, it's for an axis that isn't in the PG, ignore the command.

        if self.memberSelectorList[0] != '*':  # memberSelectorList is either "*" or a list of members
            filteredGiveMemGetPositionDict = {}
            for mem in self.memberSelectorList:
                try:
                    filteredGiveMemGetPositionDict[mem] = giveMemGetPositionDict[mem]
                except KeyError:
                    errorStr = Utils.printErrorStringToDisambiguateEmbeddedOrNot(self.embedding.factThatContainsEmbeddedCommand)
                    message = ErrorMgr.getError('EMBEDDED_COMMAND_INVALID_MEMBER_NAME_ERROR').format(self.cube.shortName, errorStr, str(mem))
                    self.addToLog(message,  messageCode='error')
                    self.embedding.isEmbeddingOrReportBroken = True
                    return

            giveMemGetPositionDict = filteredGiveMemGetPositionDict

        if len(giveMemGetPositionDict) > 0:
            self.embedding.getMemberPositionsOnAxisDictOfDicts[self.pseudoAxis] = giveMemGetPositionDict


    def addToLog(self,message,messageCode='debug',messageArgs=(),file='Embedding.py -- Command'):
        self.filing.controller.addToLog(message, messageCode=messageCode, messageArgs=messageArgs, file=file)