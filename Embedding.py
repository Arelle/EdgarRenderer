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
from . import Utils
Filing = None

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
        global Filing
        if Filing is None:
            from . import Filing
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
                axisLabel = self.cube.hasAxes[pseudoaxisQname].arelleConcept.label(lang=self.controller.labelLangs)
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
        elif self.cube.linkroleUri in ('http://xbrl.sec.gov/rxp/role/Detail'# TODO: Wch first cut at customized rxp rendering, looks crummy
                                       # WcH the problem here is that only 'compact' keyword works right now.
                                       ,'http://xbrl.sec.gov/rxp/role/ByCategory'
                                       ,'http://xbrl.sec.gov/rxp/role/ByProject'
                                       ,'http://xbrl.sec.gov/rxp/role/ByGovernment'):
            leAxisQname = None
            for ignore, axisQname, ignore in orderedListOfOrderAxisQnameTuples:
                if axisQname.localName == 'LegalEntityAxis' and self.cube.linkroleUri.endswith('ByCategory'):
                    leAxisQname= axisQname
                    continue
                token = 'compact' # WcH experiments with this have unsatisfactory results
                self.commandTextListOfLists += [['row', axisQname, token, '*']]

            if len(self.cube.timeAxis) > 0:
                self.commandTextListOfLists += [['row', 'period', 'compact', '*']]

            if leAxisQname is not None:
                self.commandTextListOfLists += [['column', leAxisQname, 'compact', '*']]
                self.commandTextListOfLists += [['row', 'primary', 'compact', '*']]
            else:
                self.commandTextListOfLists += [['column', 'primary', 'compact', '*']]

            if len(self.cube.unitAxis) > 0:
                self.commandTextListOfLists += [['column', 'unit', 'compact', '*']]

            #print(self.commandTextListOfLists) # wch for debug

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
                        self.filing.modelXbrl.warning("EFM.6.26.06",
                                _("In ''%(linkroleName)s'', the embedded report created by the fact %(fact)s with context %(contextID)s, "
                                  "the axis %(axis)s was not given an order in the presentation group %(linkroleDefinition)s. "
                                  "The axes are being sorted by their labels."),
                                edgarCode="rq-2606-Axis-Has-No-Order",
                                modelObject=self.factThatContainsEmbeddedCommand,
                                fact=self.factThatContainsEmbeddedCommand.qname, contextID=self.factThatContainsEmbeddedCommand.contextID,
                                linkrole=self.cube.linkroleUri, linkroleDefinition=self.cube.definitionText, linkroleName=self.cube.shortName,
                                error=errorStr, axis=axisQname, embeddedCommand=printThisTextIfTrue)

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
            _msgCodes = ("EFM.6.26.05.embeddingCmdMissingIterator", "EFM.6.26.05.embeddingCmdMissingIteratorAfterTransposition")
            self.filing.modelXbrl.error(_msgCodes[self.cube.isTransposed],
                _("In \"%(linkroleName)s\", the embedded report created by the fact %(fact)s with the context %(contextID)s, "
                  "there are no valid %(roworcol)s commands%(iftransposed)s. Change one of the %(axes)s to a %(colorrow)s or add a %(roworcol)s "
                  "command with an additional axis."),
                modelObject=self.factThatContainsEmbeddedCommand,
                linkrole=self.cube.linkroleUri, linkroleDefinition=self.cube.definitionText, linkroleName=self.cube.shortName,
                fact=self.factThatContainsEmbeddedCommand.qname,
                contextID=self.factThatContainsEmbeddedCommand.contextID,
                iftransposed=("", " after transposition")[self.cube.isTransposed],
                roworcol=missingRowOrColStr, colorrow=presentRowOrColStr,
                axes=', '.join([str(command.pseudoAxis) for command in commandsToPrint]),
                messageCodes=_msgCodes)
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

        # if any typed dimensions, get values to order them
        for pseudoAxis, (giveMemGetPositionDict, ignore) in self.cube.axisAndMemberOrderDict.items():
            if isinstance(pseudoAxis, arelle.ModelValue.QName) and "!?isTypedDimensionAxis?!" in giveMemGetPositionDict:
                # get fact member values for this pseudo axis
                try: # try to sort by native value
                    for typedMember in sorted((getMemberOnAxisForFactDict[pseudoAxis]
                                               for fact, getMemberOnAxisForFactDict, periodStartEndLabel in self.cube.factMemberships
                                               if pseudoAxis in getMemberOnAxisForFactDict),
                                              key=lambda member: member.typedMemberSortKey):
                        if typedMember not in giveMemGetPositionDict:
                            giveMemGetPositionDict[typedMember] = len(giveMemGetPositionDict)

                except TypeError: # if unsortable members, try as string (but will be inconsistent on numbers)
                    for typedMember in sorted((getMemberOnAxisForFactDict[pseudoAxis]
                                               for fact, getMemberOnAxisForFactDict, periodStartEndLabel in self.cube.factMemberships
                                               if pseudoAxis in getMemberOnAxisForFactDict),
                                              key=lambda member: str(member.typedMemberSortKey)):
                        if typedMember not in giveMemGetPositionDict:
                            giveMemGetPositionDict[typedMember] = len(giveMemGetPositionDict)


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
                        if not self.filing.validatedForEFM:
                            self.filing.modelXbrl.warning("EFM.6.12.06",
                                _("Presentation group \"%(linkroleName)s\" has multiple (%(numberRootConcepts)s) root nodes. "
                                  "XBRL allows unordered root nodes, but rendering requires ordering.  They will instead be ordered by their labels.  "
                                  "To avoid undesirable ordering of axes and primary items across multiple root nodes, rearrange the presentation "
                                  "relationships to have only a single root node."),
                                modelObject=self.factThatContainsEmbeddedCommand, linkrole=self.cube.linkroleUri, linkroleDefinition=self.cube.definitionText,
                                linkroleName=self.cube.shortName, numberRootConcepts=numUsedRootNodes)
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
        factAxisMemberLabelList = []
        if 'primary' not in self.getMemberPositionsOnAxisDictOfDicts:
            return factAxisMemberLabelList
        getMemberPositionsOnAxisDict = self.getMemberPositionsOnAxisDictOfDicts['primary']
        for positionOnPrimaryAxis, labelRole in getMemberPositionsOnAxisDict[fact.qname]:
            mustMatch = (Utils.isPeriodStartOrEndLabel(labelRole)
                         or Utils.isPeriodStartOrEndLabel(periodStartEndLabel))
            if ((mustMatch and periodStartEndLabel == labelRole) # EDGARDEV-6871 5/5/21
                or not mustMatch):
                factAxisMember = FactAxisMember('primary', fact.qname)
                factAxisMember.axisMemberPositionTuple = (axisIndex, positionOnPrimaryAxis)

                if labelRole in Utils.durationStartEndRolesError:
                    labelStr = fact.qname.localName
                    # Issue warnings on every fact, because it applies to all the facts.
                    for linkroleUri, qname, originalLabelRole, shortName, parentQname in self.filing.ignoredPreferredLabels:
                        if (self.cube.linkroleUri == linkroleUri and
                            fact.concept.qname == qname and
                            ((Utils.durationStartRoleError == labelRole and Utils.isPeriodStartLabel(originalLabelRole)) or
                             (Utils.durationEndRoleError == labelRole and Utils.isPeriodEndLabel(originalLabelRole)))):
                            #errorStr = Utils.printErrorStringToDisambiguateEmbeddedOrNot(self.factThatContainsEmbeddedCommand)
                            #message = ErrorMgr.getError('INSTANT_DURATION_CONFLICT_WARNING').format(shortName, errorStr, str(qname), Utils.strFactValue(fact))
                            # TBD: not same as 6.12.7 test, do we replace anyway
                            self.filing.modelXbrl.debug("debug",
                                _("In \"%(linkroleName)s\", element %(conceptTo)s has period type 'duration' but is given a preferred label %(preferredLabelValue)s when shown under parent %(conceptFrom)s.  The preferred label will be ignored."),
                                modelObject=fact, conceptTo=qname, conceptFrom=parentQname, linkrole=linkroleUri,
                                linkroleDefinition=shortName, linkroleName=shortName,
                                preferredLabel=originalLabelRole, preferredLabelValue=originalLabelRole)
                else:
                    labelStr = fact.concept.label(preferredLabel=labelRole, fallbackToQname=True, lang=self.controller.labelLangs)

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
            isTypedDimension = ('!?isTypedDimensionAxis?!' in getMemberPositionsOnAxisDict)
            if pseudoAxisName in {'unit', 'period'} or isTypedDimension:
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
                        self.filing.modelXbrl.debug("debug",
                                _('In "%(cube)s"%(error)s, the fact %(element)s with context %(context)s was filtered because the '
                                  'axis %(axis)s has no default.'),
                                modelObject=self.factThatContainsEmbeddedCommand,
                                cube=self.cube.shortName, error=errorStr, element=fact.qname, context=fact.contextID,
                                axis=axis.arelleConcept.qname)
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

        elif isinstance(memberQname, Filing.Member): # typed dimension member
            # typed dim position is table
            filingMember = memberQname
            if filingMember not in getMemberPositionsOnAxisDict:
                getMemberPositionsOnAxisDict[filingMember] = len(getMemberPositionsOnAxisDict)
            memberPositionOnAxis = getMemberPositionsOnAxisDict[filingMember]
            memberLabel = "{}: {}".format(
                    self.cube.labelDict[pseudoAxisName],
                    "(nil)" if memberQname.typedMemberIsNil else memberQname.typedValue)
            memberIsDefault = False
        else: # explicit member is not a default
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
            unitOrderingsFromPGStr = ', '.join(sorted(list(unitOrderDict)))
            missingUnitOrderingsStr = ', '.join(sorted(list(set(self.unitsWeAreKeepingSet) - set(unitOrderDict))))
            #message = ErrorMgr.getError('PRESENTATION_LINKBASE_UNIT_ORDERING_INCOMPLETE_WARNING').format(self.cube.shortName, unitOrderingsFromPGStr, missingUnitOrderingsStr)
            self.filing.modelXbrl.warning("EFM.6.12.09",
                    _('Units of measure %(foundMeasureSet)s were found in "%(linkroleName)s" but the facts presented use '
                      'these additional units of measure: %(missingMeasureSet)s.  Add presentation relationships to provide '
                      'a definite ordering of these additional units in the output.'),
                    modelObject=self.factThatContainsEmbeddedCommand or self.filing.modelXbrl,
                    linkrole=self.cube.linkroleUri, linkroleDefinition=self.cube.definitionText,
                    linkroleName=self.cube.shortName,
                    foundMeasureSet=unitOrderingsFromPGStr, missingMeasureSet=missingUnitOrderingsStr)
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
            self.filing.modelXbrl.warning("EFM.6.26.09",
                    _("In ''%(linkroleName)s'' the embedded report created by the fact %(fact)s with context %(contextID)s "
                      "contains an iterator \"column primary\" even though the definition text of %(linkroleDefinition)s "
                      "contains the \"{Elements}\" qualifier. The primary axis will remain on the rows."),
                    edgarCode="rq-2609-Primary-Axis-On-Rows",
                    modelObject=self.embedding.factThatContainsEmbeddedCommand, fact=self.embedding.factThatContainsEmbeddedCommand, contextID=self.embedding.factThatContainsEmbeddedCommand.contextID,
                    linkrole=self.cube.linkroleUri, linkroleDefinition=self.cube.definitionText,
                    linkroleName=self.cube.shortName)

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
            invalidMems = []
            for mem in self.memberSelectorList:
                try:
                    filteredGiveMemGetPositionDict[mem] = giveMemGetPositionDict[mem]
                except KeyError:
                    invalidMems.append(mem)
            if invalidMems:
                errorStr = Utils.printErrorStringToDisambiguateEmbeddedOrNot(self.embedding.factThatContainsEmbeddedCommand)
                #message = ErrorMgr.getError('EMBEDDED_COMMAND_INVALID_MEMBER_NAME_ERROR').format(self.cube.shortName, errorStr, str(mem))
                self.filing.modelXbrl.error("EFM.6.26.04.embeddingCmdInvalidMember",
                        _('In "%(linkroleName)s", the embedded report created by the fact %(fact)s '
                          'with the context %(contextID)s, the domain members %(members)s are not presentation descendants of %(axis)s.'),
                        modelObject=self.embedding.factThatContainsEmbeddedCommand,
                        linkrole=self.cube.linkroleUri, linkroleDefinition=self.cube.definitionText,
                        linkroleName=self.cube.shortName,
                        fact=self.embedding.factThatContainsEmbeddedCommand.qname,
                        contextID=self.embedding.factThatContainsEmbeddedCommand.contextID,
                        members=", ".join(str(m) for m in invalidMems), axis=self.pseudoAxis)
                self.embedding.isEmbeddingOrReportBroken = True
                return

            giveMemGetPositionDict = filteredGiveMemGetPositionDict

        if len(giveMemGetPositionDict) > 0:
            self.embedding.getMemberPositionsOnAxisDictOfDicts[self.pseudoAxis] = giveMemGetPositionDict