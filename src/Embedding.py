# -*- coding: utf-8 -*-
"""
:mod:`EdgarRenderer.Embedding`
~~~~~~~~~~~~~~~~~~~
Edgar(tm) Renderer was created by staff of the U.S. Securities and Exchange Commission.
Data and content created by government employees within the scope of their employment 
are not subject to domestic copyright protection. 17 U.S.C. 105.
"""

from collections import defaultdict
import arelle.ModelValue
import Utils

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
        self.controller = filing.controller
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
        #self.groupedAxisQnameSet = set()
        self.factAxisMemberGroupList = []
        self.hasElementsAndElementMemberPairs = set()
        self.isEmbeddingOrReportBroken = False
        self.hasDiscoveredDurations = False

        self.rowPrimaryPosition = None
        self.columnPrimaryPosition = None
        self.rowUnitPosition = None
        self.columnUnitPosition = None
        self.rowPeriodPosition = None
        self.columnPeriodPosition = None


    def handleTransposedByModifyingCommandText(self):
        for i in range(len(self.commandTextListOfLists)):
            if self.commandTextListOfLists[i][0] == 'row':
                self.commandTextListOfLists[i][0] = 'column'
            else:
                self.commandTextListOfLists[i][0] = 'row'


    def generateStandardEmbeddedCommandsFromPresentationGroup(self):
        axes = set()
        # we make this orderedListOfOrderAxisQnameTuples, instead of sorting the dict, just to remove period, unit and primary
        # which order = None.
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

            if self.controller.debugMode:  # when in debug mode elevate this to the Filing Summary log.
                self.controller.logDebug("In''{}'', moved {} to Columns and {} to rows.".format(self.cube.shortName, 
                                        self.localnamesMovedToColumns, self.localnamesMovedToRows))

            self.controller.logDebug("Equity Command List {}".format(self.commandTextListOfLists))

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
                        #message = ErrorMgr.getError('DIMENSION_AXIS_ORDER_WARNING').format(self.cube.shortName, errorStr, str(axisQname), printThisTextIfTrue)
                        self.controller.logWarn("In ''{}''{}, the axis {!s} was not given an order in the presentation linkbase{}. " \
                                                "We arbitrarily chose an order by sorting on its label.".format(self.cube.shortName, 
                                                errorStr, axisQname, printThisTextIfTrue))

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
                    if command.pseudoAxis == 'primary':
                        self.rowPrimaryPosition = len(self.rowCommands) - 1
                        self.columnPrimaryPosition = -1
                    elif command.pseudoAxis == 'period':
                        self.rowPeriodPosition = len(self.rowCommands) - 1
                        self.columnPeriodPosition = -1
                    elif command.pseudoAxis == 'unit':
                        self.rowUnitPosition = len(self.rowCommands) - 1
                        self.columnUnitPosition = -1
                else:
                    self.colCommands += [command]
                    if command.pseudoAxis == 'primary':
                        self.rowPrimaryPosition = -1
                        self.columnPrimaryPosition = len(self.colCommands) - 1
                    elif command.pseudoAxis == 'period':
                        self.rowPeriodPosition = -1
                        self.columnPeriodPosition = len(self.colCommands) - 1
                    elif command.pseudoAxis == 'unit':
                        self.rowUnitPosition = -1
                        self.columnUnitPosition = len(self.colCommands) - 1

        # make sure there are some row commands and column commands, else kill embedding.
        missingRowOrColStr = None
        presentRowOrColStr = None
        if len(self.rowCommands) == 0:
            if len(self.colCommands) == 0:
                self.isEmbeddingOrReportBroken = True
                return
            missingRowOrColStr = 'row'
            presentRowOrColStr = 'column'
            commandsToPrint = self.colCommands
        elif len(self.colCommands) == 0:
            missingRowOrColStr = 'column'
            presentRowOrColStr = 'row'
            commandsToPrint = self.rowCommands

        if missingRowOrColStr is not None:
            errorStr = Utils.printErrorStringToDisambiguateEmbeddedOrNot(self.factThatContainsEmbeddedCommand)
            #beginMessage = ErrorMgr.getError('EMBEDDED_COMMANDS_ALL_ROWS_OR_ALL_COLUMNS_ERROR').format(self.cube.shortName, errorStr, missingRowOrColStr)
            if self.cube.isTransposed:
                self.controller.logError("In ''{}''{}, the group of embedded commands after the transpose, has no valid {} command. " \
                                         "At least one of the valid {} commands: {}, (after the transpose) must be given as a {} in " \
                                         "the embedding textblock fact. This group of embedded commands will not be rendered.".format(
                                         self.cube.shortName, errorStr, missingRowOrColStr, presentRowOrColStr, 
                                         ', '.join([str(command.pseudoAxis) for command in commandsToPrint]), presentRowOrColStr))
            else:
                self.controller.logError("In ''{}''{}, the group of embedded commands has no valid {} command. At least one of the valid " \
                                         "{} commands: {}, must be given as a {} in the embedding textblock fact. This group of embedded " \
                                         "commands will not be rendered.".format(self.cube.shortName, errorStr, missingRowOrColStr,
                                         presentRowOrColStr, ', '.join([str(command.pseudoAxis) for command in commandsToPrint]),
                                         missingRowOrColStr))
            self.isEmbeddingOrReportBroken = True




    # this function makes a factAxisMemberGroup for each fact we're keeping, and does some housekeeping too.
    def processOrFilterFacts(self):
        pseudoAxisRowColStrTuples = [(command.pseudoAxis, command.rowOrColumn) for command in self.rowCommands + self.colCommands]
        pseudoAxisSet = {pseudoAxisRowColStrTuple[0] for pseudoAxisRowColStrTuple in pseudoAxisRowColStrTuples}

        if self.rowPrimaryPosition != -1:
            primaryRowOrColStr = 'row'
            primaryIndex = self.rowPrimaryPosition
        else:
            primaryRowOrColStr = 'col'
            primaryIndex = len(self.rowCommands) + self.columnPrimaryPosition

        for fact, getMemberOnAxisForFactDict, periodStartEndLabel in self.cube.factMemberships:
            factAxisMemberGroupList = self.buildFactAxisMemberGroupsForFactOrFilter(pseudoAxisRowColStrTuples, pseudoAxisSet, fact, getMemberOnAxisForFactDict,
                                                                                    periodStartEndLabel, primaryIndex, primaryRowOrColStr)

            if len(factAxisMemberGroupList) == 0:
                if fact in self.filing.factToEmbeddingDict:
                    self.controller.logDebug(("In ''{}'', the fact {!s} with context {}, which contains an embedded command, " \
                                             "was filtered out.").format(self.cube.shortName, fact.qname, fact.contextID))
                continue  # we are filtering fact

            self.factAxisMemberGroupList += factAxisMemberGroupList

            # general house keeping because this is the place where we finally know that we're keeping this fact
            if fact.unitID is not None:
                self.unitsWeAreKeepingSet.add(fact.unitID)
            self.hasElementsAndElementMemberPairs.add(fact.qname)
            self.filing.usedOrBrokenFactDefDict[fact].add(self)
            if (fact.concept.isMonetary or fact.concept.isShares or fact.unitSymbol() != '') and not fact.isNil:
                self.unitsToScaleGloballySet[fact.unitID].add(fact)  # default dict

        # if all facts were all filtered out, we don't bother making a report
        if len(self.factAxisMemberGroupList) == 0:
            errorStr = Utils.printErrorStringToDisambiguateEmbeddedOrNot(self.factThatContainsEmbeddedCommand)
            #message = ErrorMgr.getError('LINKROLE_HAS_NO_FACTS').format(self.cube.shortName, errorStr)
            self.controller.logDebug(("In ''{}'', all of the facts have been filtered out. Therefore, it will " \
                                      "not be rendered.").format(self.cube.shortName, errorStr))
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
                        #message = ErrorMgr.getError('PRESENTATION_GROUP_MULTIPLE_ROOT_NODES_WARNING').format(self.cube.shortName)

                        self.controller.logWarn("Presentation group ''{}'', has multiple root nodes. XBRL allows unordered root nodes, "\
                                                "but rendering requires ordering.  They will instead be ordered by their labels.  To "\
                                                "avoid undesirable ordering of axes and primary items across multiple root nodes, "\
                                                "rearrange the presentation group to have only a single root node.".format(
                                                self.cube.shortName))
                        break





    def buildFactAxisMemberGroupsForFactOrFilter(self, pseudoAxisRowColStrTuples, pseudoAxisSet, fact, getMemberOnAxisForFactDict,
                                                 periodStartEndLabel, primaryIndex, primaryRowOrColStr):
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
        # getMemberPositionsOnAxisDict is a defaultdict(list) for primary, for the other axes it's not.
        # since this function is only for primary,  we get a list of tuples with a lookup. this is all
        # because periodStartLabel and periodEndLabel can have facts that expand into multiple facts, hence
        # the list.  this lookup has to work.
        getMemberPositionsOnAxisDict = self.getMemberPositionsOnAxisDictOfDicts['primary']
        factAxisMemberLabelList = []
        for positionOnPrimaryAxis, labelRole in getMemberPositionsOnAxisDict[fact.qname]:
            if (labelRole not in Utils.startEndRoles or periodStartEndLabel == labelRole):
                factAxisMember = FactAxisMember('primary', fact.qname)
                factAxisMember.axisMemberPositionTuple = (axisIndex, positionOnPrimaryAxis)

                if labelRole in Utils.durationStartEndRoles:
                    labelStr = fact.qname.localName
                    # Issue warnings on every fact, because it applies to all the facts.
                    for linkroleUri, qname, originalLabelRole, shortName in self.filing.ignoredPreferredLabels:
                        if      (self.cube.linkroleUri == linkroleUri and
                                 fact.concept.qname == qname and
                                 Utils.matchedDurationRoles(originalLabelRole,labelRole)):
                            errorStr = Utils.printErrorStringToDisambiguateEmbeddedOrNot(self.factThatContainsEmbeddedCommand)
                            #message = ErrorMgr.getError('INSTANT_DURATION_CONFLICT_WARNING').format(shortName, errorStr, str(qname), Utils.strFactValue(fact))
                            self.controller.logWarn(("In ''{}''{}, ".format(shortName, errorStr)
                                                      +"element {!s} with value {} ".format(qname, Utils.strFactValue(fact))
                                                      +"has label {}, but the context is a duration, not an instant. "
                                                        .format(originalLabelRole.split("/")[-1])
                                                      +"It will be treated as if it had no label."))
                else:
                    labelStr = fact.concept.label(preferredLabel=labelRole, fallbackToQname=True)

                factAxisMember.memberLabel = labelStr
                factAxisMemberLabelList += [(factAxisMember, labelRole)]
        return factAxisMemberLabelList


    # this builds a factAxisMember and sets the memberLabel and axisMemberPositionTuple attributes.
    # it also decides whether to filter the fact.
    def generateFactAxisMemberForNonPrimary(self, fact, axisIndex, periodStartEndLabel, pseudoAxisName, getMemberOnAxisForFactDict):
        getMemberPositionsOnAxisDict = self.getMemberPositionsOnAxisDictOfDicts[pseudoAxisName]
        memberLabel = None
        memberQname = getMemberOnAxisForFactDict.get(pseudoAxisName)

        if pseudoAxisName == 'period' and self.cube.hasDiscoveredDurations:
            substituteInstant = memberQname.endTime
            memberQname = self.filing.startEndContextDict[(None, substituteInstant)]

        if memberQname is None: # member is a default
            if pseudoAxisName in {'unit', 'period'}:
                memberPositionOnAxis = Utils.minNumber  # has no order from PG, so put at beginning
            else:
                if pseudoAxisName in self.cube.defaultFilteredOutAxisSet:
                    return None # this fact is on a real axis with the default filtered out, so it's filtered too
                axis = self.cube.hasAxes[pseudoAxisName]
                try:
                    axisDefaultQname = axis.defaultArelleConcept.qname
                except AttributeError:
                    axisDefaultQname = None
                    # we dont want to filter uncategorized facts.  it is possible that fact is defaulted on an axis with no default
                    # in which case we don't want to filter it if it's an uncategorized fact, we want to print it to show the filer
                    # that it wasn't in any other report.  so, in this case, we manufacture a label.
                    if not self.cube.isUncategorizedFacts:
                        errorStr = Utils.printErrorStringToDisambiguateEmbeddedOrNot(self.factThatContainsEmbeddedCommand)
                        #message = ErrorMgr.getError('AXIS_HAS_NO_DEFAULT').format(self.cube.shortName, errorStr, fact.qname, fact.contextID, axis.arelleConcept.qname)
                        self.controller.logWarn(("In ''{}''{}, the fact {!s} with context {} was filtered because the " \
                                                 "axis {!s} has no default.").format(self.cube.shortName, errorStr, fact.qname,
                                                 fact.contextID, axis.arelleConcept.qname))
                        return None
                if pseudoAxisName in self.cube.defaultFilteredOutAxisSet:  # this isn't checked earlier to give the above warning a chance to be issued
                    return None

                try:
                    memberLabel = self.cube.labelDict[axisDefaultQname]
                except KeyError: # this can happen when the axis default did not appear in the presentation group.
                    memberLabel = axisDefaultQname

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

        else: # member is not a default
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
            memberIsDefault = False

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
            #message = ErrorMgr.getError('PRESENTATION_LINKBASE_UNIT_ORDERING_INCOMPLETE_WARNING').format(self.cube.shortName, unitOrderingsFromPGStr, missingUnitOrderingsStr)
            self.controller.logWarn(("In ''{}'', the unit ordering {} was detected in the presentation group. " \
                                     "However, the ordering is incomplete since it does not order these " \
                                     "units as well: {}. Therefore, this partial ordering will be ignored " \
                                     "and the default unit ordering will be used, which is the order the " \
                                     "units are given in the instance document.").format(self.cube.shortName,
                                     unitOrderingsFromPGStr, missingUnitOrderingsStr))
            return

        rowUnitPosition = self.rowUnitPosition
        columnUnitPosition = self.columnUnitPosition

        # go through each fact and change the order of the unit axis.
        # we have to change FactAxisMember's axisMemberPositionTuple attribute, but this attribute is also copied to FactAxisMemberGroups's
        # axisMemberPositionTupleRowOrColList attribute, so we have to change them both together.
        if rowUnitPosition != -1:
            for factAxisMemberGroup in self.factAxisMemberGroupList:
                if factAxisMemberGroup.fact.unit is not None:
                    self.reorderUnitHelper(factAxisMemberGroup.factAxisMemberRowList[rowUnitPosition], factAxisMemberGroup.axisMemberPositionTupleRowList, rowUnitPosition, unitOrderDict)
        else:
            for factAxisMemberGroup in self.factAxisMemberGroupList:
                if factAxisMemberGroup.fact.unit is not None:
                    self.reorderUnitHelper(factAxisMemberGroup.factAxisMemberColList[columnUnitPosition], factAxisMemberGroup.axisMemberPositionTupleColList, columnUnitPosition, unitOrderDict)

    def reorderUnitHelper(self, factAxisMember, axisMemberPositionTupleRowOrColList, unitAxisIndex, unitOrderDict):
        axisOrderFromTuple = factAxisMember.axisMemberPositionTuple[0]
        newUnitOrderForUnit = unitOrderDict[factAxisMember.member]
        factAxisMember.axisMemberPositionTuple = axisMemberPositionTupleRowOrColList[unitAxisIndex] = (axisOrderFromTuple, newUnitOrderForUnit)



    def printEmbedding(self):
        self.controller.logTrace('\n\n\n****************************************************************')
        self.controller.logTrace('getMemberPositionsOnAxisDictOfDicts:')
        for c in self.getMemberPositionsOnAxisDictOfDicts.items():
            self.controller.logTrace('\t{}'.format(c))

        self.controller.logTrace('isEmbedded: {}'.format(self.cube.isEmbedded))
        try:
            embeddedCommandText = self.factThatContainsEmbeddedCommand.value
        except AttributeError:
            embeddedCommandText = ''
        self.controller.logTrace('embedding command textblock: ' + embeddedCommandText)

        self.controller.logTrace('rowCommands:')
        for c in self.rowCommands:
            self.controller.logTrace('\t{}'.format(c.commandTextList))

        self.controller.logTrace('columnCommands:')
        for c in self.colCommands:
            self.controller.logTrace('\t{}'.format(c.commandTextList))

        self.controller.logTrace('noDisplayAxesSet')
        self.controller.logTrace('\t{}'.format(self.noDisplayAxesSet))

        self.controller.logTrace('****************************************************************\n\n\n')



class Command(object):
    def __init__(self, filing, cube, embedding, commandTextList):
        self.filing = filing
        self.cube = cube
        self.controller = filing.controller
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
            #message = ErrorMgr.getError('ELEMENTS_USED_PRIMARY_ON_COLUMNS_WARNING').format(self.cube.shortName, errorStr)
            self.controller.logWarn(("In ''{}''{}, an embedded command places the primary pseudo axis on the columns, " \
                                      "even though the definition text contains the {{Elements}} qualifier. This " \
                                      "command has been changed so that primary is on the rows.").format(
                                      self.cube.shortName, errorStr))

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
                    #message = ErrorMgr.getError('EMBEDDED_COMMAND_INVALID_MEMBER_NAME_ERROR').format(self.cube.shortName, errorStr, str(mem))
                    self.controller.logError(("In ''{}''{}, the keyword {!s} is not a valid member qname. Therefore, " \
                                              "this group of embedded commands will not be rendered.").format(
                                              self.cube.shortName, errorStr, mem))
                    self.embedding.isEmbeddingOrReportBroken = True
                    return

            giveMemGetPositionDict = filteredGiveMemGetPositionDict

        if len(giveMemGetPositionDict) > 0:
            self.embedding.getMemberPositionsOnAxisDictOfDicts[self.pseudoAxis] = giveMemGetPositionDict