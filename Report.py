# -*- coding: utf-8 -*-
"""
:mod:`re.Report`
~~~~~~~~~~~~~~~~~~~
Edgar(tm) Renderer was created by staff of the U.S. Securities and Exchange Commission.
Data and content created by government employees within the scope of their employment 
are not subject to domestic copyright protection. 17 U.S.C. 105.
"""

import os, re, datetime, decimal
from collections import defaultdict
from lxml.etree import Element, SubElement, XSLT, tostring as treeToString
import arelle.XbrlConst
from . import ErrorMgr, Utils
Filing = None


xlinkRole = '{' + arelle.XbrlConst.xlink + '}role' # constant belongs in XbrlConsts`headingList

class Report(object):
    def __init__(self, filing, cube, embedding):
        global Filing
        if Filing is None:
            from . import Filing
        self.filing = filing
        filing.numReports += 1

        self.factSetForFlowThroughSuppression = set()

        self.cube = cube
        self.embedding = embedding

        self.promotedAxes = set()
        self.rowList = []
        self.colList = []

        try:
            self.rowPrimaryPosition = [command.pseudoAxis for command in self.embedding.rowCommands].index('primary')
            self.columnPrimaryPosition = -1
        except ValueError:
            self.rowPrimaryPosition = -1
            self.columnPrimaryPosition = [command.pseudoAxis for command in self.embedding.colCommands].index('primary')

        self.isUnitsAxisOnRowsOrColumns = None
        if any(command.pseudoAxis == 'unit' for command in self.embedding.colCommands):
            self.isUnitsAxisOnRowsOrColumns = 'col'
        elif any(command.pseudoAxis == 'unit' for command in self.embedding.rowCommands):
            self.isUnitsAxisOnRowsOrColumns = 'row'

        self.isPeriodAxisOnRowsOrColumns = None
        if any(command.pseudoAxis == 'period' for command in self.embedding.colCommands):
            self.isPeriodAxisOnRowsOrColumns = 'col'
        elif any(command.pseudoAxis == 'period' for command in self.embedding.rowCommands):
            self.isPeriodAxisOnRowsOrColumns = 'row'

        self.numColumns = 0
        self.numRows = 0
        self.footnoteTextList = []

        self.RoundingOption = None

        self.rootETree = Element('InstanceReport', nsmap={'xsi' : 'http://www.w3.org/2001/XMLSchema-instance'})
        self.columnsETree = SubElement(self.rootETree, 'Columns') # children added later
        self.rowsETree = SubElement(self.rootETree, 'Rows') # children added later

        self.shortName = self.cube.shortName # each Report can edit its own shortName

        self.factToColDefaultDict = defaultdict(list)

        self.hasEmbeddedReports = False

        self.logList = []
        self.scalingFactorsQuantaSymbolTupleDict = {}


    def generateCellVector(self, rowOrColStr, index):
        cellVector = []
        if rowOrColStr == 'col':
            for row in self.rowList:
                if not row.isHidden:
                    cellVector += [row.cellList[index]]
            return (self.colList[index], cellVector)
        else:
            row = self.rowList[index]
            for i, cell in enumerate(row.cellList):
                if not self.colList[i].isHidden:
                    cellVector += [cell]
            return (row, cellVector)



    def generateRowsOrCols(self, rowOrColStr, sortedFactAxisMemberGroupList):
        previousRowOrCol = None
        for factAxisMemberGroup in sortedFactAxisMemberGroupList:

            # if primary on columns, then we have multiple primary elements per Row.
            # in that case, coordinateListWithoutPrimary == coordinateList so coordinateList is right
            # if primary on rows then one primary Element per Row, so we want coordinateList again
            # because same primary elements have same coordinates.
            coordinateList = []
            coordinateListWithoutPrimary = []
            coordinateListWithoutUnit = []
            coordinateListWithoutUnitPeriod = []
            coordinateListWithoutUnitPeriodPrimary = []
            groupedCoordinateList = []
            fact = factAxisMemberGroup.fact
            preferredLabel = factAxisMemberGroup.preferredLabel
            startEndContext = None

            if rowOrColStr == 'col':
                elementQnameMemberForColHidingSet = set()
                for factAxisMember in factAxisMemberGroup.factAxisMemberRowList + factAxisMemberGroup.factAxisMemberColList:
                    if factAxisMember.pseudoAxisName not in {'period', 'unit', 'primary'} and factAxisMember.member is not None:
                        elementQnameMemberForColHidingSet.add((fact.qname, factAxisMember.member))


            if rowOrColStr == 'row':
                factAxisMemberList = factAxisMemberGroup.factAxisMemberRowList
            else:
                factAxisMemberList = factAxisMemberGroup.factAxisMemberColList

            for factAxisMember in factAxisMemberList:
                pseudoAxisName = factAxisMember.pseudoAxisName
                axisMemberPositionTuple = factAxisMember.axisMemberPositionTuple

                if rowOrColStr == 'row' and pseudoAxisName in self.embedding.groupedAxisQnameSet:
                    groupedCoordinateList += [axisMemberPositionTuple]

                if pseudoAxisName == 'period':
                    startEndContext = factAxisMember.member

                coordinateList += [axisMemberPositionTuple]
                if pseudoAxisName != 'primary':
                    coordinateListWithoutPrimary += [axisMemberPositionTuple]
                if pseudoAxisName != 'unit':
                    coordinateListWithoutUnit += [axisMemberPositionTuple]
                    if pseudoAxisName != 'period':
                        coordinateListWithoutUnitPeriod += [axisMemberPositionTuple]
                        if pseudoAxisName != 'primary':
                            coordinateListWithoutUnitPeriodPrimary += [axisMemberPositionTuple]

            # if isElements, every single fact should have it's own row and altogether, there should be exactly one column.
            # it looks like 3 columns, but really the style sheet makes those columns.
            if previousRowOrCol is None or previousRowOrCol.coordinateList != coordinateList or self.cube.isElements:
                if rowOrColStr == 'row':
                    IsCalendarTitle = self.cube.isStatementOfEquity and preferredLabel in Utils.startEndRoles

                    # this is goofy, in handlePeriodStartEndLabel() we turn instant facts into durations
                    # for the purposes of layout, but now, we artificially make the rows instants again.
                    if IsCalendarTitle and startEndContext is not None:
                        # we kill the startTime, which makes it an instant
                        if startEndContext.startTime is not None and "Start" in preferredLabel:                            
                            startEndTuple = (None, startEndContext.startTime)
                        else:
                            startEndTuple = (None, startEndContext.endTime)
                        try: # if startEndContext exists, find it
                            startEndContext = self.filing.startEndContextDict[startEndTuple]
                        except KeyError: # if not, create one and add it to respective data structures
                            startEndContext = Filing.StartEndContext(fact.context, startEndTuple)
                            self.filing.startEndContextDict[startEndTuple] = startEndContext
                            self.cube.timeAxis.add(startEndContext)

                    rowOrCol = Row(self.filing, self, startEndContext=startEndContext, factAxisMemberGroup=factAxisMemberGroup,
                                    coordinateList=coordinateList,
                                    coordinateListWithoutPrimary=coordinateListWithoutPrimary,
                                    coordinateListWithoutUnit=coordinateListWithoutUnit,
                                    coordinateListWithoutUnitPeriod=coordinateListWithoutUnitPeriod,
                                    coordinateListWithoutUnitPeriodPrimary=coordinateListWithoutUnitPeriodPrimary,
                                    groupedCoordinateList=groupedCoordinateList, IsCalendarTitle=IsCalendarTitle, elementQname=fact.qname)
                    self.rowList += [rowOrCol]
                elif not self.cube.isElements or len(self.colList) == 0:
                    rowOrCol = Column(self.filing, self, startEndContext, factAxisMemberGroup,
                                    coordinateList, coordinateListWithoutUnit, coordinateListWithoutUnitPeriod)
                    self.colList  += [rowOrCol]
                previousRowOrCol = rowOrCol

            # now assign fact to columns.  possible to assign one fact to multiple columns because of periodStartLabel and periodEndLabel
            if rowOrColStr == 'row':
                for colNum in (self.factToColDefaultDict.get((fact, preferredLabel)) or []):
                    col = self.colList[colNum]

                    previousRowOrCol.cellList[colNum] = Cell(self.filing, previousRowOrCol, col, colNum, fact=fact, preferredLabel=preferredLabel)
                    if fact.unit is not None:
                        self.updateUnitTypeToFactSetDefaultDict(fact, col)
                if fact.unit is not None:
                    self.updateUnitTypeToFactSetDefaultDict(fact, rowOrCol)
                rowOrCol.factList += [fact]
                self.factSetForFlowThroughSuppression.add(fact)

            else:
                self.factToColDefaultDict[(fact, preferredLabel)].append(previousRowOrCol.index)
                rowOrCol.factList += [fact]
                rowOrCol.elementQnameMemberForColHidingSet.update(elementQnameMemberForColHidingSet)
        # return generateRowOrCols


    def promoteAxes(self):
        # unitStrCol and unitStrRow is just to put units at the end wrapped in parens, rather than with all the others
        unitStrCol = self.promoteAxesHelper('col', self.colList, [command.pseudoAxis for command in self.embedding.colCommands])
        unitStrRow = self.promoteAxesHelper('row', self.rowList, [command.pseudoAxis for command in self.embedding.rowCommands])

        if unitStrCol is not None:
            self.shortName += self.filing.titleSeparatorStr + unitStrCol
        if unitStrRow is not None:
            self.shortName += self.filing.titleSeparatorStr + unitStrRow



    def promoteAxesHelper(self, rowOrColStr, rowOrColList, pseudoAxisNameList):
        if len(rowOrColList) == 1: # don't promote axes if there's only one row or col
            return

        # this needs to be appended to end and wrapped in parens so we do some special stuff
        unitAndMaybeSymbolStr = None

        # loop through each axis and if len(memberSet) == 1 promote axis because all rows or cols have the same label,
        # no use repeating it for every row or col.   if memberSet bigger, don't promote.
        for i, pseudoAxisName in enumerate(pseudoAxisNameList):
            if pseudoAxisName == 'primary':
                continue
            if pseudoAxisName == 'unit':
                unitAndMaybeSymbolStr = self.promoteUnits(rowOrColList)
                continue

            memberLabel = None
            promoteThisAxis = True
            numMonthsSet = set()

            for rowOrCol in rowOrColList:
                if rowOrColStr == 'row':
                    factAxisMember = rowOrCol.factAxisMemberGroup.factAxisMemberRowList[i]
                else:
                    factAxisMember = rowOrCol.factAxisMemberGroup.factAxisMemberColList[i]

                tempMemberLabel = factAxisMember.memberLabel

                if tempMemberLabel is None:
                    promoteThisAxis = False
                    break
                elif memberLabel is None:
                    memberLabel = tempMemberLabel
                elif memberLabel != tempMemberLabel:
                    promoteThisAxis = False
                    break # there's more than one different member so can't promote axis

                if pseudoAxisName == 'period':
                    numMonthsSet.add(factAxisMember.member.numMonths)

            if promoteThisAxis and memberLabel is not None:
                self.promotedAxes.add(pseudoAxisName)

                # we do this because we want to promote the period if there's an instant and duration ending at the same time.
                # for the sake of promotion, we consider these two one member, even though they are different.  if we tack on the months
                # before we get to this stage, these two will seem different, even though for our purposes, they are the same.
                if len(numMonthsSet) == 1:
                    numMonths = numMonthsSet.pop()
                    if numMonths > 0:
                        memberLabel = '{!s} months ended {}'.format(numMonths, tempMemberLabel)
                self.shortName += self.filing.titleSeparatorStr + memberLabel

        return unitAndMaybeSymbolStr

    # this is complicated because we still might promote units even if there are multiple units.  for instance, if there are
    # USD, USD/Share and shares as the units, we still promote USD.  same for any pair of two from those three.  however, we won't promote
    # if we have ounces and barrels of oil for instance, or USD, JPY/Share and Share.
    def promoteUnits(self, rowOrColList):
        monetaryFact = perShareMonetaryFact = sharesFact = anotherKindOfFact = None

        for rowOrCol in rowOrColList:
            fact = rowOrCol.factAxisMemberGroup.fact
            if fact.unit is not None:
                if fact.concept.isMonetary:
                    if monetaryFact is not None and monetaryFact.unitID != fact.unitID:
                        return # can't have two different currencies
                    monetaryFact = fact
                elif Utils.isFactPerShareItemType(fact):
                    if perShareMonetaryFact is not None and perShareMonetaryFact.unitID != fact.unitID:
                        return # can't have two different currencies / share
                    perShareMonetaryFact = fact
                elif fact.concept.isShares:
                    if sharesFact is not None and sharesFact.unitID != fact.unitID:
                        return # can't have two different shares
                    sharesFact = fact
                else:
                    if anotherKindOfFact is not None and anotherKindOfFact.unitID != fact.unitID:
                        return # can't have two different types of units, like barrels and ounces
                    anotherKindOfFact = fact

        # boolean arithmetic
        numPossiblyCompatibleTypes = (perShareMonetaryFact is not None) + (monetaryFact is not None)
        allTypes = numPossiblyCompatibleTypes + (sharesFact is not None) + (anotherKindOfFact is not None)

        if numPossiblyCompatibleTypes > 0:
            if numPossiblyCompatibleTypes == 2 and perShareMonetaryFact.unit.measures[0][0].localName != monetaryFact.unit.measures[0][0].localName:
                return # this makes sure we don't have USD and JPY/share. makes sure both units have the same numerator.
            elif sharesFact is None:
                if allTypes > numPossiblyCompatibleTypes:
                    return # makes sure it doesn't have USD and Ounces, or USD, USD/Share and Ounces.
            elif allTypes > numPossiblyCompatibleTypes + 1:
                return # Makes sure we don't have USD, USD/Share, Shares and Ounces
        elif allTypes > 1:
            return # makes sure we don't have Ounces and Shares

        self.promotedAxes.add('unit')

        if anotherKindOfFact is not None:
            return Utils.getUnitAndSymbolStr(anotherKindOfFact)
        elif monetaryFact is not None:
            return Utils.getUnitAndSymbolStr(monetaryFact)
        elif perShareMonetaryFact is not None:
            return Utils.getUnitAndSymbolStr(perShareMonetaryFact)
        elif sharesFact is not None:
            return Utils.getUnitAndSymbolStr(sharesFact)
        

    def mergeRowsOrColsIfUnitsCompatible(self, rowOrColStr, rowOrColList):
        i = 0
        while i < len(rowOrColList):
            coordinateListWithoutUnitOfFirstRowOrCol = rowOrColList[i].coordinateListWithoutUnit
            monetarySet = set()
            perShareSet = set()
            nonMonetarySet = set()

            while i < len(rowOrColList) and rowOrColList[i].coordinateListWithoutUnit == coordinateListWithoutUnitOfFirstRowOrCol:
                rowOrCol = rowOrColList[i]

                # at this point, rows or cols only have one unit in them, so it's simple to break them up and combine them.
                if 'monetaryDerivedType' in rowOrCol.unitTypeToFactSetDefaultDict:
                    monetarySet.add(rowOrCol) # we might add more to this set next, but we separate it for speed, because it's unlikely
                elif 'perShareDerivedType' in rowOrCol.unitTypeToFactSetDefaultDict:
                    perShareSet.add(rowOrCol)
                else:
                    nonMonetarySet.add(rowOrCol)
                i += 1

            # in these two cases below, we mangle these three sets, and if either of these two conditions are satisfied,
            # in the below for loop, monetary might not be monetary anymore, and nonmonetary might not be nonmonetary either.
            if len(monetarySet) == 0:
                if len(perShareSet) == 0:
                    if len(nonMonetarySet) > 1:
                        # this can happen if adjacent columns are (say) strings and decimals
                        # they are still mergable, we just treat one of them as if it were the 'monetary'.
                        monetarySet.add(nonMonetarySet.pop())
                else:
                    monetarySet = perShareSet.copy()
                    perShareSet.clear()

            # see above comments, monetary and nonmonetary might not mean what they say, might have been mangled above.
            for monetaryRowOrCol in monetarySet:
                for perShareRowOrCol in perShareSet:
                    # if monetary, the numerator is the currency, if perShareDerivedType, numerator is also currency.
                    perShareNumerators = {fact.unit.measures[0][0].localName for fact in (perShareRowOrCol.unitTypeToFactSetDefaultDict.get('perShareDerivedType') or [])}
                    monetaryNumerators = {fact.unit.measures[0][0].localName for fact in (monetaryRowOrCol.unitTypeToFactSetDefaultDict.get('monetaryDerivedType') or [])}

                    if len(perShareNumerators.union(monetaryNumerators)) == 1:
                        self.deepCopyRowsOrCols(rowOrColStr, monetaryRowOrCol, perShareRowOrCol)

                for nonMonetaryRowOrCol in nonMonetarySet:
                    self.deepCopyRowsOrCols(rowOrColStr, monetaryRowOrCol, nonMonetaryRowOrCol)


    def mergeRowsOrColsInstantsIntoDurationsIfUnitsCompatible(self, rowOrColStr, rowOrColList):
        # if units are on rows and we're merging columns, there's no need to consider them, and vice versa.
        unitsAxisOnRowsOrCols = self.isUnitsAxisOnRowsOrColumns == rowOrColStr

        tempRowOrColList = sorted(rowOrColList, key = lambda thing : thing.coordinateListWithoutUnitPeriod)
        while len(tempRowOrColList) > 0:

            previousCoordinateListWithoutPeriodAndUnit = tempRowOrColList[0].coordinateListWithoutUnitPeriod
            instantRowOrColList = []
            durationRowOrColList = []
            while len(tempRowOrColList) > 0 and previousCoordinateListWithoutPeriodAndUnit == tempRowOrColList[0].coordinateListWithoutUnitPeriod:
                rowOrCol = tempRowOrColList.pop(0)
                if not rowOrCol.isHidden:
                    if rowOrCol.startEndContext.periodTypeStr == 'instant':
                        instantRowOrColList += [rowOrCol]
                    else:
                        durationRowOrColList += [rowOrCol]

            instantRowOrColList.sort (key = lambda thing : thing.startEndContext.endTime)
            durationRowOrColList.sort(key = lambda thing : thing.startEndContext.endTime)

            while len(instantRowOrColList) > 0 and len(durationRowOrColList) > 0:
                instantRowOrCol = instantRowOrColList[0]
                durationRowOrCol = durationRowOrColList[0]

                # compare instants to durations.  if not equal, throw one away and try again, else continue
                if   instantRowOrCol.startEndContext.endTime < durationRowOrCol.startEndContext.endTime:
                    del instantRowOrColList[0]
                elif instantRowOrCol.startEndContext.endTime > durationRowOrCol.startEndContext.endTime:
                    del durationRowOrColList[0]

                else:
                    # if we're doing the rows and units isn't on the rows (and vice versa), we don't check unit compatibility,
                    # otherwise we need the units to be compatible.
                    if not unitsAxisOnRowsOrCols or self.areFactsCompatableByUnits(instantRowOrCol, durationRowOrCol):
                        # test to make sure both rows or cols don't overlap -- unless the overlap is the same
                        flag = True
                        instantRowOrColCellVector = self.generateCellVector(rowOrColStr, instantRowOrCol.index)[1]
                        durationRowOrColCellVector = self.generateCellVector(rowOrColStr, durationRowOrCol.index)[1]
                        for i in range(len(instantRowOrColCellVector)): # both vectors are the same length
                            instantCell = instantRowOrColCellVector[i]
                            durationCell = durationRowOrColCellVector[i]
                            if instantCell is not None and durationCell is not None and instantCell.fact != durationCell.fact:
                                flag = False
                                break # vectors overlap, can't be combined
                        if flag:
                            self.deepCopyRowsOrCols(rowOrColStr, durationRowOrCol, instantRowOrCol)
                    del durationRowOrColList[0]


    def areFactsCompatableByUnits(self, colOrRowToBeMerged, colOrRowToBeMergedInto):
        colOrRowToBeMergedMonetaryUnitSet = {fact.unit for fact in (colOrRowToBeMerged.unitTypeToFactSetDefaultDict.get('monetaryDerivedType') or [])}
        colOrRowToBeMergedIntoMonetaryUnitSet = {fact.unit for fact in (colOrRowToBeMergedInto.unitTypeToFactSetDefaultDict.get('monetaryDerivedType') or [])}

        if len(colOrRowToBeMergedMonetaryUnitSet.union(colOrRowToBeMergedIntoMonetaryUnitSet)) > 1:
            return False # there are two different monetary units here

        # this makes sure we don't merge usd/share with jpy
        # if monetary, the numerator is the currency, if perShareDerivedType, numerator is also currency.
        colOrRowToBeMergedMonetaryPerShareNumeratorSet = {fact.unit.measures[0][0].localName for fact in (colOrRowToBeMerged.unitTypeToFactSetDefaultDict.get('perShareDerivedType') or [])}
        colOrRowToBeMergedIntoMonetaryPerShareNumeratorSet = {unit.measures[0][0].localName for unit in colOrRowToBeMergedIntoMonetaryUnitSet}
        unionSize = len(colOrRowToBeMergedMonetaryPerShareNumeratorSet.union(colOrRowToBeMergedIntoMonetaryPerShareNumeratorSet))
        if unionSize > 1:
            return False
        return True


    def deepCopyRowsOrCols(self, rowOrColStr, mergeIntoThisRowOrCol, mergeRowOrCol):
        mergeIntoThisRowOrColCellVector = self.generateCellVector(rowOrColStr, mergeIntoThisRowOrCol.index)[1]
        mergeRowOrColCellVector = self.generateCellVector(rowOrColStr, mergeRowOrCol.index)[1]

        for i in range(len(mergeIntoThisRowOrColCellVector)):
            mergeCell = mergeRowOrColCellVector[i]

            if mergeCell is not None: # do a deep copy
                fact = mergeCell.fact
                preferredLabel = mergeCell.preferredLabel
                if fact.unit is not None: # update unitTypeToFactSetDefaultDict with new cell
                    self.updateUnitTypeToFactSetDefaultDict(fact, mergeIntoThisRowOrCol)

                if rowOrColStr == 'col':
                    row = self.rowList[i]
                    col = mergeIntoThisRowOrCol
                    mergeIntoThisCell = row.cellList[col.index] = Cell(self.filing, row, col, col.index, fact=fact, preferredLabel=preferredLabel)
                else:
                    row = mergeIntoThisRowOrCol
                    col = self.colList[i]
                    mergeIntoThisCell = row.cellList[i] = Cell(self.filing, row, col, i, fact=fact, preferredLabel=preferredLabel)

                mergeIntoThisCell.currencySymbol =      mergeCell.currencySymbol
                mergeIntoThisCell.currencyCode =        mergeCell.currencyCode
                mergeIntoThisCell.unitID =              mergeCell.unitID
                mergeIntoThisCell.showCurrencySymbol =  mergeCell.showCurrencySymbol
        mergeRowOrCol.isHidden = True
        mergeIntoThisRowOrCol.factList += mergeRowOrCol.factList

    def hideRedundantColumns(self):
        factSets = {}
        for col in self.colList:
            if not col.isHidden:
                factSets[col] = set(col.factList) # fact objects are unique and not copied.
        for col1,facts1 in factSets.items():
            if not col1.isHidden:
                for col2,facts2 in factSets.items():
                    if not col1 is col2 and not col2.isHidden:
                        if facts2.issubset(facts1):
                            col2.isHidden = True

    def updateUnitTypeToFactSetDefaultDict(self, fact, rowOrCol):
        if fact.concept.isMonetary:
            # we manufacture an item type because there are a bunch that are monetary.  easier to check for one than a bunch each time.
            typeName = 'monetaryDerivedType'
        elif Utils.isFactPerShareItemType(fact):
            typeName = 'perShareDerivedType'
        else:
            typeName = fact.concept.type.name
        rowOrCol.unitTypeToFactSetDefaultDict[typeName].add(fact)





    # determine scaling factors for a certain currency, like USD.  scaling is done at intervals of three, -3, -6, -9, ... .
    #, which means that it's done in thousands.  a scaling value of 0 is not scaled.
    def scaleUnitGlobally(self): # so far currencies and shares.
        monetaryExampleFactSet = set()
        monetaryPerShareExampleFactSet = set()

        # first decide how much to scale each currency.  we only care if the value is below -3, otherwise it's not scaled.
        for unitID, factSet in self.embedding.unitsToScaleGloballySet.items():
            maxSoFar = Utils.minNumber
            symbol = None
            exampleFact = None
            for fact in factSet:
                if fact.decimals and not fact.isNil:
                    if exampleFact is None:
                        exampleFact = fact
                    if symbol is None:
                        symbol = Utils.getSymbolStr(fact) or unitID
                    if fact.decimals.casefold() == 'inf' or maxSoFar > -3:
                        maxSoFar = 0
                        break # to be scaled, every fact must have a decimals value of -3 or less.  inf inhibits scaling.
                    else:
                        maxSoFar = max(maxSoFar, int(fact.decimals))
            if exampleFact is not None:
                if exampleFact.concept.isMonetary:
                    monetaryExampleFactSet.add(exampleFact)
                elif Utils.isFactPerShareItemType(exampleFact):
                    monetaryPerShareExampleFactSet.add(exampleFact) # Treat it as a monetary.
            if maxSoFar <= -3:
                roundedMax = round(maxSoFar / 3) * 3
                self.scalingFactorsQuantaSymbolTupleDict[unitID] = (roundedMax, pow(2,(roundedMax - maxSoFar)), symbol)

        if len(self.scalingFactorsQuantaSymbolTupleDict) == 0:
            return # nothing to scale, we're done.

        # it could be confusing if a report has $ and $/share types, and the $ is scaled, but $/share isn't.  here we check if it has
        # both, and if the $ is scaled, and the $/share is not, and then we add the $/share into the scaling dict, with no scaling
        # so it will print out something less confusing like $ in Millions, $/share in Units.
        if self.cube.cubeType != 'statement':
            for moneyFact in monetaryExampleFactSet:
                matchingFact = None
                for moneyPerShareFact in monetaryPerShareExampleFactSet:
                    if moneyFact.unit.measures[0][0].localName == moneyPerShareFact.unit.measures[0][0].localName:
                        matchingFact = moneyPerShareFact
                        break
                if matchingFact is not None and matchingFact.unitID not in self.scalingFactorsQuantaSymbolTupleDict:
                    self.scalingFactorsQuantaSymbolTupleDict[matchingFact.unitID] = (0,
                                                                                     0,
                                                                                     Utils.getSymbolStr(moneyPerShareFact) or moneyPerShareFact.unitID)

        # now if a cell is scaled, change its cell.scalingFactor
        for row in self.rowList:
            if not row.isHidden:
                for cell in row.cellList:
                    if cell is not None and not cell.column.isHidden and not cell.fact.isNil:
                        try:
                            cell.scalingFactor, cell.quantum, ignore = self.scalingFactorsQuantaSymbolTupleDict[cell.fact.unitID]
                        except KeyError:
                            pass

        scalingFactorHeading = ''
        scalingWordDict = {0:'Units', -3:'Thousands', -6:'Millions', -9:'Billions', -12:'Trillions', -15:'Quadrillions', -18:'Quintillions'}

        # note: we just need to sort by scaling factor, but we additionally sort by unit because we don't want the user
        # to render a filing twice and have each run look different.  we want the orderings to be the same every time.
        for scalingFactor, ignore, unitSymbol in reversed(sorted(self.scalingFactorsQuantaSymbolTupleDict.values(), key = lambda thing : (thing[0], thing[2]))):
            try:
                scalingWord = scalingWordDict[scalingFactor]
            except KeyError:
                scalingWord = 'scaling factor is ' + str(scalingFactor)
            scalingFactorHeading += ' {} in {},'.format(unitSymbol, scalingWord)

        # removes the last comma
        if scalingFactorHeading != '':
            self.RoundingOption = scalingFactorHeading[:-1]






    def handleFootnotes(self):
        # here we look up each fact and dynamically build footnoteDict as we go
        footnoteDict = {}
        for row in self.rowList:
            if not row.isHidden and not set(row.factList).isdisjoint(self.filing.factFootnoteDict):
                for cell in row.cellList:
                    if cell is not None and not cell.column.isHidden:

                        #factFootnoteDict is a defaultdict, so returns [] not keyError
                        # we need to sort it, otherwise the ordering will change each time we run and filers will wonder why their footnotes are changing
                        footnoteListForThisCell = sorted((self.filing.factFootnoteDict.get(cell.fact) or []), key=lambda thing : thing[1])
                        for footnoteResource, footnoteText in footnoteListForThisCell: 
                            try: 
                                # if no exception, we have already added this footnote to footnoteDict, so we go and get it's index.
                                cell.footnoteNumberSet.add(footnoteDict[footnoteResource])
                            except KeyError:
                                # first time seeing this footnote, add it to footnoteDict
                                footnoteIndex = len(footnoteDict) + 1 # because footnote numbering starts at 1 not 0
                                footnoteDict[footnoteResource] = footnoteIndex
                                cell.footnoteNumberSet.add(footnoteIndex)
                                self.footnoteTextList += [footnoteText]

    def setAndMergeFootnoteRowsAndColumns(self, rowOrColStr, rowOrColList):
        for i, rowOrCol in enumerate(rowOrColList):
            if not rowOrCol.isHidden:

                cellVector = self.generateCellVector(rowOrColStr, i)[1]
                listOfFootnoteNumberSetsForNonEmptyCells = [cell.footnoteNumberSet for cell in cellVector if cell is not None]

                # intersection below can take many arguments, the * below spreads out the list into multiple arguments
                try:
                    rowOrColSet = set.intersection(*listOfFootnoteNumberSetsForNonEmptyCells)
                except TypeError:
                    rowOrColSet = set()

                if len(rowOrColSet) > 0:
                    rowOrCol.footnoteNumberSet = rowOrColSet # set attribute of row or col
                    
                    # go back through these sets and remove footnotes that have been promoted to rows or columns
                    for footnoteNumberSet in listOfFootnoteNumberSetsForNonEmptyCells:
                        footnoteNumberSet -= rowOrColSet


    def writeFootnoteIndexerEtree(self, footnoteNumberSet, etreeNode):
        if len(footnoteNumberSet) > 0:
            numberListForDisplayStr = ''
            for number in sorted(footnoteNumberSet):
                numberListForDisplayStr += '[{!s}],'.format(number)
            numberListForDisplayStr = numberListForDisplayStr[:-1] # "[:-1]" cuts off trailing comma from string
            SubElement(etreeNode, 'FootnoteIndexer').text = numberListForDisplayStr
        else:
            SubElement(etreeNode, 'FootnoteIndexer') # i think the stylesheet needs this, even if empty?


    def removeVerticalInteriorSymbols(self):
        for i, col in enumerate(self.colList):
            if len(col.unitTypeToFactSetDefaultDict) > 0 and not col.isHidden:

                previousCellCode = None
                previousCell = None

                for row in self.rowList:
                    cell = row.cellList[i]

                    if cell is not None and not row.isHidden:
                        currentCellUnitID = cell.unitID

                        if previousCellCode == currentCellUnitID:
                            cell.showCurrencySymbol = False
                        else:
                            if previousCell is not None:
                                previousCell.showCurrencySymbol = previousCellCode is not None
                            cell.showCurrencySymbol = currentCellUnitID is not None
                        
                        previousCellCode = currentCellUnitID
                        previousCell = cell
    
                if previousCell is not None:
                    previousCell.showCurrencySymbol = previousCellCode is not None


    def makeSegmentTitleRows(self):
        counter = 0
        prevRow = None
        while counter < len(self.rowList):

            row = self.rowList[counter]
            if      (not row.isHidden and
                     (prevRow == None or row.coordinateListWithoutUnitPeriodPrimary != prevRow.coordinateListWithoutUnitPeriodPrimary)):

                prevRow = self.rowList[counter]

                # build heading list
                headingList = []
                axisInSegmentTitleHeaderBoolList = []
                for factAxisMember in row.factAxisMemberGroup.factAxisMemberRowList:
                    if factAxisMember.pseudoAxisName not in {'primary', 'unit', 'period'} and not factAxisMember.memberIsDefault:
                        headingList += [factAxisMember.memberLabel]
                        axisInSegmentTitleHeaderBoolList += [True]
                    else:
                        axisInSegmentTitleHeaderBoolList += [False]

                # make new segment title row and insert into rowList
                if headingList != []:
                    headerRow = Row(self.filing, self, index=counter, isSegmentTitle=True)
                    headerRow.headingList = headingList
                    headerRow.axisInSegmentTitleHeaderBoolList = axisInSegmentTitleHeaderBoolList
                    self.rowList.insert(counter, headerRow)
                    counter += 1

            counter += 1


    def addAbstracts(self):
        # here we sort the abstracts under primary and we get their orders along the primary pseudoaxis that
        # we will compare with the other elements on the primary Axis.
        sortedListOfAbstractQnamePositionTuples = sorted(self.cube.abstractDict.items(), key = lambda thing: thing[1])

        sortedListOfAbstractFactsPosition = 0
        counter = 0
        while counter < len(self.rowList):

            row = self.rowList[counter]

            if row.isHidden:
                pass
            elif row.isSegmentTitle or row.IsCalendarTitle:
                sortedListOfAbstractFactsPosition = 0
            else:
                factPrimaryAxisPosition = row.coordinateList[self.rowPrimaryPosition][1]
                if      (sortedListOfAbstractFactsPosition < len(sortedListOfAbstractQnamePositionTuples) and
                         factPrimaryAxisPosition > sortedListOfAbstractQnamePositionTuples[sortedListOfAbstractFactsPosition][1]):

                    # we don't want to print two adjacent abstract rows.  so check to see if there are any adjacent and if so,
                    # then just print the last one.
                    while       (sortedListOfAbstractFactsPosition < len(sortedListOfAbstractQnamePositionTuples) - 1 and
                                 sortedListOfAbstractQnamePositionTuples[sortedListOfAbstractFactsPosition + 1][1] < factPrimaryAxisPosition):
                        sortedListOfAbstractFactsPosition += 1

                    # add a row
                    elementQname = sortedListOfAbstractQnamePositionTuples[sortedListOfAbstractFactsPosition][0]
                    if not( elementQname in self.filing.builtinLineItems):
                        abstractRow = Row(self.filing, self, index=counter, IsAbstractGroupTitle=True, elementQname=elementQname)
                        abstractRow.headingList = [self.cube.labelDict[elementQname]]
                        self.rowList.insert(counter, abstractRow)
                        counter += 1 # we add to the row counter twice, because we're adding a row
                    sortedListOfAbstractFactsPosition += 1
            counter += 1


    def generateRowAndOrColHeadings(self):
        if self.cube.isElements: # if isElements, we just need rows
            for row in self.rowList:
                if not (row.IsAbstractGroupTitle or row.isSegmentTitle):
                    for factAxisMember in row.factAxisMemberGroup.factAxisMemberRowList:
                        # since cube isElements, we know primary must be on the rows, we checked.
                        if factAxisMember.pseudoAxisName == 'primary':
                            row.headingList += [factAxisMember.memberLabel]
                            break
            return

        # axes to not generate headings for, cheaper to build this set only once and pass it in.
        noHeadingsForTheseAxesSet = self.promotedAxes.union(self.embedding.noDisplayAxesSet).union(self.embedding.groupedAxisQnameSet)

        # generate the column headings
        for col in self.colList:
            if not col.isHidden:
                self.generateRowOrColHeading('col', col, col.factAxisMemberGroup.factAxisMemberColList, noHeadingsForTheseAxesSet, None)

        # we keep track of the mostRecentSegmentTitleRow because we don't want to relist the same set of members in the rows beneath it, 
        # would be redundant.  so we keep track of the most recent segment title row, and the members it contains, and don't reprint those 
        # members when we're generating row headers.  since segment title rows are only on rows, this doesn't effect cols.
        mostRecentSegmentTitleRow = None
        rowUnitHeadingDefaultDict = defaultdict(list)
        for row in self.rowList:
            if not row.isHidden:
                if row.isSegmentTitle:
                    mostRecentSegmentTitleRow = row
                    if self.cube.isUnlabeled:
                        # this is because the heading column on the left gets killed with unlabeled
                        # so we have to move it over.
                        row.cellList[0] = Cell(self.filing, row, self.colList[0], 0, NonNumericText=row.headingList[0])
                elif not row.IsAbstractGroupTitle and row.headingList == []:
                    self.generateRowOrColHeading('row', row, row.factAxisMemberGroup.factAxisMemberRowList, noHeadingsForTheseAxesSet, mostRecentSegmentTitleRow)

                    if self.isUnitsAxisOnRowsOrColumns == 'col' and 'unit' not in self.promotedAxes and len(row.unitTypeToFactSetDefaultDict) == 1:
                        unitHeading = self.appendUnitsToRowsIfUnitsOnColsAndRowHasOnlyOneUnit(row)
                        if unitHeading is not None:
                            rowUnitHeadingDefaultDict[unitHeading].append(row)

        skipedFirstFlag = False
        # sorts by the length of the row list for each heading.  the flag will make it so that it doesn't print the
        # most popular unitHeading, only the rest.  we do this to prevent clutter, it looks ugly.
        for unitHeading, rowSet in reversed(sorted(rowUnitHeadingDefaultDict.items(), key=lambda thing : len(thing[1]))):
            if skipedFirstFlag:
                for row in rowSet:
                    row.headingList += [unitHeading]
            else:
                skipedFirstFlag = True




    def generateRowOrColHeading(self, rowOrColStr, rowOrCol, factAxisMemberList, noHeadingsForTheseAxesSet, mostRecentSegmentTitleRow):
        preferredLabel = getattr(rowOrCol, 'preferredLabel', None)
        isPeriodStartOrEnd = Utils.isRoleOrSuffix(preferredLabel, Utils.startEndRoles)
        monthsEndedText = None
        headingList = rowOrCol.headingList
        verboseHeadings = self.filing.verboseHeadingsForDebugging
        previousPseudoAxisNames = []
        strDate = None
        for i, factAxisMember in enumerate(factAxisMemberList):
            pseudoAxisName = factAxisMember.pseudoAxisName
            if (pseudoAxisName in noHeadingsForTheseAxesSet or
                (mostRecentSegmentTitleRow is not None  # do not repeat member information in previous segment title row.
                 and mostRecentSegmentTitleRow.axisInSegmentTitleHeaderBoolList[i])):
                pass
            # TODO: for grouped, if factAxisMember.member is None: continue
            elif pseudoAxisName == 'unit':
                self.generateAndAddUnitHeadings(rowOrCol, rowOrColStr)
            elif pseudoAxisName == 'period':
                numMonths = rowOrCol.startEndContext.numMonths
                if (numMonths > 0 and (True or rowOrColStr == 'col' or verboseHeadings)): 
                    monthsEndedText = '{!s} Months Ended'.format(numMonths)
                if self.isPeriodAxisOnRowsOrColumns == 'col':
                    headingList += [rowOrCol.startEndContext.label]
            elif isPeriodStartOrEnd and self.isPeriodAxisOnRowsOrColumns == rowOrColStr:
                strDate = (rowOrCol.context.endDatetime + datetime.timedelta(days=-1)).strftime('%b. %d, %Y')
                if len(headingList) > 0:
                    if headingList[-1] == strDate: 
                        headingList = headingList[:-1]  
                if factAxisMember.memberIsDefault:
                    headingList += [strDate]
                else:               
                    headingList += ['{} at {}'.format(factAxisMember.memberLabel, strDate)]
                isPeriodStartOrEnd = False  # Do not repeat the "...at..." phrase.
            elif verboseHeadings:
                headingList += [factAxisMember.memberLabel]
            elif not factAxisMember.memberIsDefault:
                if (len(headingList) > 0 and 'period' in previousPseudoAxisNames):
                    if factAxisMember.member.localName != 'ScenarioPreviouslyReportedMember':
                        headingList[-1] = headingList[-1].split(' at ')[0] # Don't repeat "...at..." phrase here.
                    if headingList[-1] == strDate:
                        headingList[-1] = factAxisMember.memberLabel+' at '+strDate
                    else:
                        headingList[-1] = headingList[-1] + " (" + factAxisMember.memberLabel + ")"
                else:
                    headingList += [factAxisMember.memberLabel]
            previousPseudoAxisNames += [pseudoAxisName]
        
        if monthsEndedText is not None and self.isPeriodAxisOnRowsOrColumns == 'col':
            headingList = [monthsEndedText] + headingList
        rowOrCol.headingList = headingList


    def generateAndAddUnitHeadings(self, rowOrCol, rowOrColStr):
        unitAndMaybeSymbolList = []

        # sorting by type, but monetary should always come first
        sortedListOfFactSets = []
        for unitType, factSet in sorted(rowOrCol.unitTypeToFactSetDefaultDict.items()):
            if unitType == 'monetaryDerivedType':
                sortedListOfFactSets = [factSet] + sortedListOfFactSets
            else:
                sortedListOfFactSets += [factSet]

        unitSet = set()
        for arelleFactSet in sortedListOfFactSets:
            # we need a fact for each unit, why?  because the type of the unit is actually in the element declaration
            # so we do all this just to pull the fact out and pass it to getUnitAndSymbolStr, which will probably call fact.unitSymbol()
            for fact in sorted(arelleFactSet, key = lambda thing : thing.unit.sourceline):
                if fact.unit not in unitSet:
                    unitSet.add(fact.unit)
                    unitSymbolStr = Utils.getUnitAndSymbolStr(fact)
                    if unitSymbolStr is not None:
                        unitAndMaybeSymbolList += [unitSymbolStr]

        # we handle rows and cols slightly differently because for rows, we don't want to put filing.rowSeparatorStr between
        # each of the units in the list of units for the row.  however, for column headings, it's done differently, so they should be
        # separated.  so for rows, we want a long string, for cols, we want to append each to the list.
        if rowOrColStr == 'row':
            rowOrCol.headingList += [', '.join(sorted(unitAndMaybeSymbolList))]
        else:
            rowOrCol.headingList += unitAndMaybeSymbolList


    # this function is used to append the unit to the end of a row if the units are on the columns and not promoted and
    # if all facts in the row are using the same unit. 
    def appendUnitsToRowsIfUnitsOnColsAndRowHasOnlyOneUnit(self, row):
        # the length is 1, so let's pull out the first in list.
        unitType, arelleFactSet = list(row.unitTypeToFactSetDefaultDict.items())[0]

        # there could be multiple currencies, like USD, JPY, make sure there are not.
        if len({fact.unit for fact in arelleFactSet}) == 1:
            return Utils.getSymbolStr(list(arelleFactSet)[0])

        # we have to do something special where the row is all perShare, but in different currencies.
        elif unitType == 'perShareDerivedType':
            row.headingList += ['(per share)']


    def HideAdjacentInstantRows(self):
        # Call only on statements of equity, in principle though, it should apply to any roll forward.
        # Rows are "adjacent" if they are
        # 1. the same qname (because you could have a monetary, a shares, a decimal...)
        # 2. previous is an end label and the next one a start label
        # 3. the same instant endtime (implied by condition 4 but faster to test)
        # 4. the same facts are displayed on both rows
        def tracer(row):
            self.addToLog("Hiding {} facts in redundant rows qname={} instant={} in ''{}''"
                          .format(len(row.factList),row.elementQnameStr,row.startEndContext.endTime,self.shortName)
                          ,messageCode='debug')
            return # from tracer
        mergeableRows = defaultdict(list)
        for row in self.rowList:
            if not row.isHidden and row.IsCalendarTitle:
                coordinateListWithoutPeriod = tuple([row.elementQnameStr]+row.coordinateListWithoutUnitPeriodPrimary) # TODO - pretend unit can't appear on rows
                mergeableRows[coordinateListWithoutPeriod] += [row]        
        for rowList in mergeableRows.values():
            for index, thisRow in enumerate(rowList):
                if index > 0:
                    prevRow = rowList[index-1]
                    if (prevRow.preferredLabel == 'periodEndLabel' and
                        thisRow.preferredLabel == 'periodStartLabel' and
                        prevRow.startEndContext.endTime==thisRow.startEndContext.endTime and
                        prevRow.factList==thisRow.factList):
                        tracer(thisRow)
                        thisRow.isHidden = True
        del mergeableRows



    def emitRFile(self):
        # we emit the cols and rows first and then plug them into the header and footer later.
        # this is because there are side effects of the col and row processing that the header and footer depend on.
        self.emitRFileCols()
        self.emitRFileRows()
        self.emitRFileHeaderAndFooter()

    def emitRFileCols(self):
        for index, col in enumerate(self.colList):
            if not col.isHidden:
                col.emitColumn(index)

    def emitRFileRows(self):
        for index, row in enumerate(self.rowList):
            if not row.isHidden:
                row.emitRow(index)

    def emitRFileHeaderAndFooter(self):
        SubElement(self.rootETree, 'Version').text = '3.0'
        SubElement(self.rootETree, 'ReportLongName').text = self.cube.definitionText
        SubElement(self.rootETree, 'DisplayLabelColumn').text = str(not self.cube.isUnlabeled).casefold()

        SubElement(self.rootETree, 'ShowElementNames').text = str(self.cube.isElements).casefold()
        
        if self.RoundingOption is None:
            SubElement(self.rootETree, 'RoundingOption')
        else:
            SubElement(self.rootETree, 'RoundingOption').text = self.RoundingOption

        SubElement(self.rootETree, 'HasEmbeddedReports').text = str(self.hasEmbeddedReports).casefold()

        self.rootETree.append(self.columnsETree)
        self.rootETree.append(self.rowsETree)

        footnotes = SubElement(self.rootETree, 'Footnotes')
        for i, footnoteText in enumerate(self.footnoteTextList):
            footnote = SubElement(footnotes, 'Footnote')
            SubElement(footnote, 'NoteId').text = str(i + 1) # +1 because it starts at 1 not zero
            SubElement(footnote, 'Note').text = footnoteText
        SubElement(self.rootETree, 'IsEquityReport').text = 'false'

        ReportName = self.shortName 
        if self.filing.verboseHeadingsForDebugging:
            ReportName += ' ---- {}'.format(self.cube.linkroleUri)
        SubElement(self.rootETree, 'ReportName').text = ReportName

        SubElement(self.rootETree, 'MonetaryRoundingLevel').text = 'UnKnown'
        SubElement(self.rootETree, 'SharesRoundingLevel').text = 'UnKnown'
        SubElement(self.rootETree, 'PerShareRoundingLevel').text = 'UnKnown'
        SubElement(self.rootETree, 'ExchangeRateRoundingLevel').text = 'UnKnown'
        SubElement(self.rootETree, 'HasCustomUnits').text = 'true'
        SubElement(self.rootETree, 'IsEmbedReport').text = 'false'
        SubElement(self.rootETree, 'IsMultiCurrency').text = 'false'
        SubElement(self.rootETree, 'ReportType').text = 'Sheet'
        SubElement(self.rootETree, 'RoleURI').text = self.cube.linkroleUri
        SubElement(self.rootETree, 'NumberOfCols').text = str(int(self.rootETree.xpath('count(/InstanceReport/Columns/Column)')))
        SubElement(self.rootETree, 'NumberOfRows').text = str(int(self.rootETree.xpath('count(/InstanceReport/Rows/Row)')))







    def emitContextRef(self, mcuETree, factAxisMemberList, context):
        contextRefETree = SubElement(mcuETree, 'contextRef')

        if context is not None:
            SubElement(contextRefETree, 'ContextID').text = context.id
            SubElement(contextRefETree, 'EntitySchema').text = context.entityIdentifier[0]
            SubElement(contextRefETree, 'EntityValue').text = context.entityIdentifier[1]
            startEndContext = self.filing.startEndContextDict[(context.startDatetime, context.endDatetime)]
            SubElement(contextRefETree, 'PeriodType').text = startEndContext.periodTypeStr
            if startEndContext.startTimePretty is not None:
                SubElement(contextRefETree, 'PeriodStartDate').text = startEndContext.startTimePretty
            SubElement(contextRefETree, 'PeriodEndDate').text = startEndContext.endTimePretty

        realAxisList = [factAxisMember for factAxisMember in factAxisMemberList if factAxisMember.pseudoAxisName not in {'primary', 'period', 'unit'}]
        if realAxisList != []:
            segmentsETree = SubElement(contextRefETree, 'Segments')
        for factAxisMember in realAxisList:
            SegmentETree = SubElement(segmentsETree, 'Segment')
            SubElement(SegmentETree, 'IsDefaultForEntity').text = str(factAxisMember.memberIsDefault).casefold()
            SubElement(SegmentETree, 'ValueName').text = factAxisMember.memberLabel
            SubElement(SegmentETree, 'ValueType').text = str(factAxisMember.pseudoAxisName)
            SubElement(SegmentETree, 'Namespace').text = factAxisMember.pseudoAxisName.prefix
            SubElement(SegmentETree, 'Schema').text = factAxisMember.pseudoAxisName.namespaceURI
            DimensionInfoETree = SubElement(SegmentETree, 'DimensionInfo')
            if factAxisMember.member is not None:
                SubElement(DimensionInfoETree, 'Id').text = str(factAxisMember.member)
            else:
                SubElement(DimensionInfoETree, 'Id')
            SubElement(DimensionInfoETree, 'dimensionId').text = str(factAxisMember.pseudoAxisName)
            SubElement(DimensionInfoETree, 'type').text = 'explicitMember'

    def emitUPS(self, mcuETree, unit):
        if len(unit.measures[0]) > 0:
            upsETree = SubElement(mcuETree, 'UPS')
            #unitPropertyETree = SubElement(upsETree, 'UnitProperty')
            SubElement(upsETree, 'UnitID').text = unit.id
            #SubElement(unitPropertyETree, 'UnitType').text = 'Standard' or divide or multiply etc.
            numeratorMeasureETree = SubElement(upsETree, 'NumeratorMeasure')
            for measure in unit.measures[0]:
                self.emitUPSHelper(numeratorMeasureETree, measure)
 
            if len(unit.measures[1]) > 0:
                denominatorMeasureETree = SubElement(upsETree, 'DenominatorMeasure')
                for measure in unit.measures[1]:
                    self.emitUPSHelper(denominatorMeasureETree, measure)

            try:
                SubElement(upsETree, 'Scale').text = str(self.scalingFactorsQuantaSymbolTupleDict[unit.id][0])
            except KeyError:
                pass

    def emitUPSHelper(self, tempETree, measure):
        measureETree = SubElement(tempETree, 'Measure')
        SubElement(measureETree, 'MeasureSchema').text = measure.namespaceURI
        SubElement(measureETree, 'MeasureValue').text = measure.localName
        SubElement(measureETree, 'MeasureNamespace').text = measure.prefix




    def createReportSummary(self, reportSummary):
        reportSummary.fileNumber = self.cube.fileNumber
        reportSummary.isDefault = False # This value will be altered during build of FilingSummary object.
        reportSummary.hasEmbeddedReports = self.hasEmbeddedReports
        reportSummary.longName = self.cube.definitionText
        reportSummary.shortName = self.cube.shortName # this is because the reports shortName can be polluted with proted axes
        reportSummary.role = self.cube.linkroleUri
        reportSummary.logList = self.logList
        reportSummary.isUncategorized = (self.cube.linkroleUri == 'http://xbrl.sec.gov/role/uncategorizedFacts')


    def writeHtmlAndOrXmlFiles(self, reportSummary):
        baseNameBeforeExtension = self.filing.fileNamePrefix + str(self.cube.fileNumber)
        tree = self.rootETree.getroottree()
        if self.filing.reportXmlFormat: self.writeXmlFile(baseNameBeforeExtension, tree, reportSummary)
        if self.filing.reportHtmlFormat: self.writeHtmlFile(baseNameBeforeExtension, tree, reportSummary)

    def writeXmlFile(self, baseNameBeforeExtension, tree, reportSummary):
        baseName = baseNameBeforeExtension + '.xml'
        reportSummary.xmlFileName = baseName

        if self.filing.fileNameBase:
            fileName = os.path.join(self.filing.fileNameBase, baseName)
            tree.write(fileName, xml_declaration=True, encoding='utf-8', pretty_print=True)
        elif self.filing.reportZip:
            self.filing.reportZip.writestr(baseName, 
                treeToString(tree, xml_declaration=True, encoding='utf-8', pretty_print=True));

    def writeHtmlFile(self, baseNameBeforeExtension, tree, reportSummary):
        baseName = baseNameBeforeExtension + '.htm'
        reportSummary.htmlFileName = baseName     

        self.addToLog('Starting XSLT transform on {}.'.format(baseNameBeforeExtension + '.xml'), messageCode='debug')              
        result = self.filing.transform(tree, asPage=XSLT.strparam('true'))
        self.addToLog('Finished XSLT transform.', messageCode='debug')
        if self.filing.fileNameBase:
            fileName = os.path.join(self.filing.fileNameBase, baseName)
            result.write(fileName,method='html',with_tail=False,pretty_print=True,encoding='us-ascii')
        elif self.filing.reportZip:
            self.filing.reportZip.writestr(baseName, 
                treeToString(result,method='html',with_tail=False,pretty_print=True,encoding='us-ascii'));


    def generateBarChart(self):
        # change rendering guide bar chart documentation
        # add isGood for bargraphs
        factList = []
        yMax = 0.0
        yMin = 0.0
        for row in self.rowList:
            for fact in row.factList:
                if      (re.compile('^http://xbrl\.(us/rr/2008-12-31|sec\.gov/rr/[0-9-]{10})$').match(fact.qname.namespaceURI) and
                         re.compile('^AnnualReturn[0-9]{4}$').match(fact.qname.localName)):
                    year = fact.qname.localName.casefold().partition('annualreturn')[2]
                    if fact.isNil: 
                        factValue = None # no special handling of zeroes in the bar chart generator
                    else:
                        factValue = float(fact.value) * 100
                        if yMax < factValue:
                            yMax = factValue
                        if yMin > factValue:
                            yMin = factValue
                    factList += [(year, factValue)]
        if len(factList) == 0:
            return None
        factList = sorted(factList, key=lambda thing: thing[0]) # sorts by year

        from matplotlib.pyplot import figure, cm

        # Determine array sizes depending on input data set    
        topOfGradientColor = cm.colors.hex2color('#B5DBEF')
        bottomOfGradientColor = wht = cm.colors.hex2color('#FFFFFF')
        blumd = cm.colors.hex2color('#6BC3DE')
        bludk = cm.colors.hex2color('#6396A5')
        redmd = cm.colors.hex2color('#F7B27B')
        reddk = cm.colors.hex2color('#E7754A')
        gradientColorMap = cm.colors.LinearSegmentedColormap.from_list('gradientColorMap', [bottomOfGradientColor, topOfGradientColor], 256)
        blugrd = cm.colors.LinearSegmentedColormap.from_list('blugrd',[blumd,bludk],256)
        blugrd_r = cm.colors.LinearSegmentedColormap.from_list('blugrd_r',[bludk,blumd],256)
        redgrd = cm.colors.LinearSegmentedColormap.from_list('redgrd',[redmd,reddk],256)
        redgrd_r = cm.colors.LinearSegmentedColormap.from_list('redgrd_r',[reddk,redmd],256)

        numYears = len(factList)
        if numYears > 20:
            raise Exception('Unreasonable to have {} Annual Return Facts'.format(numYears))
        xMin = -0.3
        xMax = numYears + 0.3
        xLim = (xMin, xMax)
        paddingFactor = max(abs(yMin), abs(yMax)) * 0.18
        if yMin < 0:
            yLim = (yMin - paddingFactor, yMax + paddingFactor)
        else:
            yLim = (yMin, yMax + paddingFactor)

        fig = figure(figsize = (numYears*0.5, 2.5))

        # Determine actual plot area and gradient and shading
        subplot = fig.add_subplot(111, xlim=xLim, ylim=yLim, autoscale_on=False ,axisbg=wht)
        subplot.imshow([[.7, .7],[.5,.5]], interpolation='bicubic', cmap=gradientColorMap, extent=(xLim[0], xLim[1], yLim[0], yLim[1]), alpha=1)

        xArray = [i + 0.25 for i in range(0, numYears)]
        width=0.5
        bottom = 0

        # Create bars and bar labels, adjusting for pos/neg values
        X = [[.6, .3],[.6,.3]]
        for left, (ignore, top) in zip(xArray, factList):
            right = left + width
            if top == None:
                continue
            strlab = "{0:.2f}".format(top) + '%'
            if top >= 0:
                subplot.imshow(X, interpolation='bicubic', cmap=blugrd, extent=(left, left+(width/2.0)+.01, bottom, top), alpha=1)
                subplot.imshow(X, interpolation='bicubic', cmap=blugrd_r, extent=(left+(width/2.0), right, bottom, top), alpha=1)
                subplot.text(left+width/2., top + (paddingFactor/5), strlab, ha='center', va='bottom', fontsize=5, family='serif')
            else:
                subplot.imshow(X, interpolation='bicubic', cmap=redgrd, extent=(left, left+(width/2.0)+.01, bottom, top), alpha=1)
                subplot.imshow(X, interpolation='bicubic', cmap=redgrd_r, extent=(left+(width/2.0), right, bottom, top), alpha=1)
                subplot.text(left+width/2., top - (paddingFactor/1.7), strlab, ha='center', va='bottom', fontsize=5, family='serif')

        subplot.set_xticks([i + width/2 for i in xArray]) #sets x ticks
        subplot.set_xticklabels(["'" + str(tup[0])[2:] for tup in factList], fontsize=5, family='serif') # sets x labels
        subplot.set_yticks([], minor=True) # minor=True means that it dynamically assigns tick values
        for lab in subplot.get_yticklabels(): # set_yticks doesn't accept font args, so we manually set them here
            lab.set_fontsize(5)
            lab.set_family('serif')

        subplot.hlines(0, -0.3, numYears + 0.3) # this is the horizontal line set to zero
        subplot.set_aspect('auto') # really no idea what this does.

        return fig

    def addToLog(self,message,messageArgs=(),messageCode='debug',file='Report.py'):
        self.filing.controller.addToLog(message, messageCode=messageCode, messageArgs=messageArgs, file=file)










class Row(object):
    def __init__(self, filing, report, startEndContext=None, index=None, factAxisMemberGroup=None,
                 coordinateList=[], coordinateListWithoutPrimary=[], coordinateListWithoutUnit=[],
                 coordinateListWithoutUnitPeriod=[], coordinateListWithoutUnitPeriodPrimary=[], groupedCoordinateList=[],
                 isSegmentTitle=False, IsCalendarTitle=False, IsAbstractGroupTitle=False, elementQname=None, level=0):
        self.filing = filing
        self.report = report
        if index is None:
            self.index = self.report.numRows
        self.report.numRows += 1
        self.factAxisMemberGroup = factAxisMemberGroup
        self.coordinateList = coordinateList
        self.coordinateListWithoutPrimary = coordinateListWithoutPrimary
        self.coordinateListWithoutUnit = coordinateListWithoutUnit
        self.coordinateListWithoutUnitPeriod = coordinateListWithoutUnitPeriod
        self.coordinateListWithoutUnitPeriodPrimary = coordinateListWithoutUnitPeriodPrimary
        self.groupedCoordinateList = groupedCoordinateList
        self.headingList = []
        self.axisInSegmentTitleHeaderBoolList = []
        self.isSegmentTitle = isSegmentTitle
        self.IsCalendarTitle = IsCalendarTitle
        self.IsAbstractGroupTitle = IsAbstractGroupTitle
        self.IsReverseSign = False
        self.IsTotalLabel = False
        self.factList = []
        self.level = level
        self.cellList = [None for ignore in range(self.report.numColumns)]
        self.footnoteNumberSet = set()
        self.originalElementQname = elementQname
        primaryPosition = report.rowPrimaryPosition

        # this argument is just to get abstract element qnames for cube.isElements
        if elementQname is not None and primaryPosition != -1: 
            self.elementQnameStr = str(elementQname).replace(':', '_')
        else:
            self.elementQnameStr = None

        self.preferredLabel = None
        if not (self.isSegmentTitle or self.IsAbstractGroupTitle or primaryPosition == -1 or self.factAxisMemberGroup.preferredLabel is None):
            self.preferredLabel = factAxisMemberGroup.preferredLabel.rpartition('/')[2]
        self.isHidden = False

        self.context = None
        self.startEndContext = startEndContext
        if not (self.isSegmentTitle or self.IsAbstractGroupTitle):
            self.context = factAxisMemberGroup.fact.context
            if self.context == None: # wch added this check.
                errorStr = Utils.printErrorStringToDisambiguateEmbeddedOrNot(self.report.embedding.factThatContainsEmbeddedCommand)
                message = ErrorMgr.getError('ROW_WITHOUT_CONTEXT_WARNING').format(self.report.cube.shortName, errorStr, self.index)
                self.addToLog(message, messageCode='warn')

        self.unitTypeToFactSetDefaultDict = defaultdict(set)


    def emitRow(self, index):
        rowETree = SubElement(self.report.rowsETree, 'Row', FlagID='0')
        self.emitRowHeader(rowETree, index)
        cellsETree = SubElement(rowETree, 'Cells')

        for i, col in enumerate(self.report.colList):
            if not col.isHidden:
                cell = self.cellList[i]
                if cell is None or cell.fact is None or cell.fact.isNil: # write an empty cell
                    # lots of stuff here just to maintain compatibility with re2
                    if cell is not None and cell.fact is not None and cell.fact.isNil:
                        isNil = True
                        contextID = cell.fact.contextID
                        ratio = 'Ratio'
                    else:
                        isNil = False
                        contextID = ratio = ''
                    cellETree = SubElement(cellsETree , 'Cell', FlagID='0', ContextID=contextID, UnitID=ratio)
                    SubElement(cellETree, 'Id').text = str(i+1)
                    SubElement(cellETree, 'IsNumeric').text = 'false'

                    if isNil:
                        SubElement(cellETree, 'IsRatio').text = 'true'
                        SubElement(cellETree, 'DisplayZeroAsNone').text = 'true'
                    else:
                        SubElement(cellETree, 'IsRatio').text = 'false'
                        SubElement(cellETree, 'DisplayZeroAsNone').text = 'false'

                    SubElement(cellETree, 'NumericAmount').text = '0'
                    SubElement(cellETree, 'RoundedNumericAmount').text = '0'

                    # this only happens if the row is a segment title and the cube is unlabeled
                    if cell is not None and cell.fact is None:
                        SubElement(cellETree, 'NonNumbericText').text = self.headingList[0]
                    else:
                        SubElement(cellETree, 'NonNumbericText')

                    SubElement(cellETree, 'FootnoteIndexer')
                    SubElement(cellETree, 'CurrencyCode')
                    SubElement(cellETree, 'CurrencySymbol')
                    SubElement(cellETree, 'IsIndependantCurrency').text = 'false'
                    SubElement(cellETree, 'ShowCurrencySymbol').text = 'false'
                    SubElement(cellETree, 'DisplayDateInUSFormat').text = 'false'
                else: # write a non-empty cell
                    cell.emitCell(cellsETree)
        self.emitRowFooter(rowETree)


    def emitRowHeader(self, rowETree, index):
        SubElement(rowETree, 'Id').text = str(index+1)
        SubElement(rowETree, 'IsAbstractGroupTitle').text = str(self.IsAbstractGroupTitle).casefold()
        SubElement(rowETree, 'LabelSeparator').text = ' '
        SubElement(rowETree, 'Level').text = str(self.level)

        elementPrefix = ''
        if self.elementQnameStr is not None and self.report.rowPrimaryPosition != -1:
            SubElement(rowETree, 'ElementName').text = self.elementQnameStr
            elementPrefix = self.elementQnameStr[:(self.elementQnameStr.find('_')+1)]
            SubElement(rowETree, 'ElementPrefix').text = elementPrefix
        elif len(self.factList) > 0      and self.report.rowPrimaryPosition != -1:
            elementQname = str(self.factList[0].qname).replace(':', '_')
            SubElement(rowETree, 'ElementName').text = elementQname
            elementPrefix = elementQname[:(elementQname.find('_')+1)]
            SubElement(rowETree, 'ElementPrefix').text = elementPrefix
        else:
            SubElement(rowETree, 'ElementName')
            SubElement(rowETree, 'ElementPrefix')
        SubElement(rowETree, 'IsBaseElement').text = str('us-gaap' in elementPrefix.casefold()).casefold()

        concept = None
        balance = 'na'
        periodType = 'duration'
        theRealQname = self.originalElementQname
        if theRealQname is not None:
            concept = self.filing.modelXbrl.qnameConcepts[theRealQname]
            if concept is not None:
                periodType = concept.periodType
                if concept.balance is not None:
                    balance = concept.balance

        SubElement(rowETree, 'BalanceType').text = balance
        SubElement(rowETree, 'PeriodType').text = periodType
        SubElement(rowETree, 'IsReportTitle').text = 'false'
        SubElement(rowETree, 'IsSegmentTitle').text = str(self.isSegmentTitle).casefold()
        SubElement(rowETree, 'IsCalendarTitle').text = str(self.IsCalendarTitle).casefold()
        SubElement(rowETree, 'IsEquityPrevioslyReportedAsRow').text = 'false'
        SubElement(rowETree, 'IsEquityAdjustmentRow').text = 'false'
        SubElement(rowETree, 'IsBeginningBalance').text = str(self.isBeginningBalance()).casefold()        
        SubElement(rowETree, 'IsEndingBalance').text = str(self.isEndingBalance()).casefold()

        if self.preferredLabel == 'totalLabel':
            self.IsTotalLabel = True
        elif self.preferredLabel == 'negatedTotal':
            self.IsTotalLabel = True
            self.IsReverseSign = True

        if self.preferredLabel is not None and re.compile('negated').match(self.preferredLabel):
            self.IsReverseSign = True

        SubElement(rowETree, 'IsReverseSign').text = str(self.IsReverseSign).casefold()
        if self.preferredLabel is not None:
            SubElement(rowETree, 'PreferredLabelRole').text = self.preferredLabel

        self.report.writeFootnoteIndexerEtree(self.footnoteNumberSet, rowETree)

    def isBeginningBalance(self):
        # TODO: Accomodate cases where startLabel is in not-fully-formed rollforward.
        return (self.preferredLabel is not None and 'periodStart' in self.preferredLabel)

    def isEndingBalance(self):
        # TODO: Accomodate cases where endLabel is in not-fully-formed rollforward.
        return (self.preferredLabel is not None and 'periodEnd' in self.preferredLabel)





    def emitRowFooter(self, rowETree):
        theRealQname = self.originalElementQname
        typeQname = ''
        simpleDataType = 'na'
        doclabel = 'No definition available.'
        referencesText = 'No definition available.' # Compatibility with RE2
        if theRealQname is not None:
            concept = self.filing.modelXbrl.qnameConcepts[theRealQname]
            if concept is not None:
                typeQname = str(concept.typeQname)
                simpleDataType = self.simpleDataType(concept)
                thedoclabel = concept.label(preferredLabel=arelle.XbrlConst.documentationLabel, fallbackToQname=False,lang='en-US',linkrole=arelle.XbrlConst.defaultLinkRole)
                if thedoclabel is not None:
                    doclabel = thedoclabel
                references = []
                relationshipList = concept.modelXbrl.relationshipSet(arelle.XbrlConst.conceptReference).fromModelObject(concept)
                def arbitrarykey(x):
                    return x.sourceline
                relationshipList.sort(key=arbitrarykey)
                for refrel in relationshipList:
                    ref = refrel.toModelObject
                    if ref is not None:
                        try:                     
                            references += [(ref.attrib[xlinkRole],ref)]
                        except KeyError:
                            pass
                if len(references)>0:
                    referencesText = ''
                    for (i,(role,ref)) in enumerate(references):
                        referencesText += 'Reference '+str(i+1)+': '+role+'\n\n\n\n'
                        for e in ref.iter():
                            if e.text is not None:
                                text = e.text.strip()                                
                                if len(text)>0:
                                    referencesText += ' -'+e.localName+' '+text+'\n\n\n\n'

        SubElement(rowETree, 'ElementDataType').text = typeQname
        SubElement(rowETree, 'SimpleDataType').text = simpleDataType
        SubElement(rowETree, 'ElementDefenition').text = doclabel
        SubElement(rowETree, 'ElementReferences').text = referencesText
        SubElement(rowETree, 'IsTotalLabel').text = str(self.IsTotalLabel).casefold()
        SubElement(rowETree, 'UnitID').text = '0' # really?
        SubElement(rowETree, 'Label').text = self.filing.rowSeparatorStr.join(self.headingList)

        if self.factAxisMemberGroup is not None: # could be an abstract row or something like that
            periodPseudoAxisOnRows = False
            primaryPseudoAxisOnRows = False
            otherAxisOnRows = False
            for factAxisMember in self.factAxisMemberGroup.factAxisMemberRowList:
                if factAxisMember.pseudoAxisName == 'period':
                    periodPseudoAxisOnRows = True
                elif factAxisMember.pseudoAxisName == 'primary':
                    primaryPseudoAxisOnRows = True
                elif factAxisMember.pseudoAxisName != 'unit':
                    otherAxisOnRows = True
    
            SubElement(rowETree, 'hasSegments').text = str(otherAxisOnRows).casefold()
            SubElement(rowETree, 'hasScenarios').text = 'false'
        
            # BEGIN MCU
            mcuETree = SubElement(rowETree, 'MCU')
            #SubElement(mcuETree, 'KeyName')

            if self.context is not None:
                if periodPseudoAxisOnRows:
                    self.report.emitContextRef(mcuETree, self.factAxisMemberGroup.factAxisMemberRowList, self.context)
                elif any(factAxisMember.pseudoAxisName not in {'primary', 'period', 'unit'} for factAxisMember in self.factAxisMemberGroup.factAxisMemberRowList):
                    self.report.emitContextRef(mcuETree, self.factAxisMemberGroup.factAxisMemberRowList, None)
    
            if primaryPseudoAxisOnRows and self.factAxisMemberGroup.fact.unit is not None:
                # the primary pseudoaxis is on the rows, so show the units for that fact
                self.report.emitUPS(mcuETree, self.factAxisMemberGroup.fact.unit)
            # END MCU


    def simpleDataType(self,concept): # Try to be compatible with RE2 limited notion of data type
        t = concept.baseXsdType.casefold()
        if t in ['boolean','token']:
            return 'na'
        if concept.isTextBlock:
            return 'na'
        return t


    def addToLog(self,message,messageArgs=(),messageCode='debug',file='Report.py -- Row'):
        self.filing.controller.addToLog(message, messageArgs=messageArgs, messageCode=messageCode, file=file)









class Column(object):
    def __init__(self, filing, report, startEndContext, factAxisMemberGroup, coordinateList, coordinateListWithoutUnit, coordinateListWithoutUnitPeriod):
        self.filing = filing
        self.report = report
        self.index = report.numColumns
        self.report.numColumns += 1
        self.factAxisMemberGroup = factAxisMemberGroup
        self.coordinateList = coordinateList
        self.coordinateListWithoutUnit = coordinateListWithoutUnit
        self.coordinateListWithoutUnitPeriod = coordinateListWithoutUnitPeriod
        self.footnoteNumberSet = set()
        self.isHidden = False
        self.headingList = []
        self.factList = []
        self.elementQnameMemberForColHidingSet = set()
        self.context = factAxisMemberGroup.fact.context
        if self.context == None: # wch added this check.
            errorStr = Utils.printErrorStringToDisambiguateEmbeddedOrNot(self.report.embedding.factThatContainsEmbeddedCommand)
            message = ErrorMgr.getError('COLUMN_WITHOUT_CONTEXT_WARNING').format(self.report.cube.shortName, errorStr, self.index)
            self.addToLog(message, messageCode='warn')
        #self.startEndContext = self.filing.startEndContextDict[(self.context.startDatetime, self.context.endDatetime)]
        self.startEndContext = startEndContext
        self.unitTypeToFactSetDefaultDict = defaultdict(set)
        self.preferredLabel = None
        primaryPosition = report.columnPrimaryPosition
        self.preferredLabel = None
        if not (primaryPosition == -1 or self.factAxisMemberGroup.preferredLabel is None):
            self.preferredLabel = self.factAxisMemberGroup.preferredLabel.rpartition('/')[2]

    def emitColumn(self, index):
        # this first clause of the if is because for the case of isUnlabeled, we have to move the value of the segment title row
        # into the first cell, in which case there is a cell with no fact, which will cause an attribute error.
        firstColOfAnUnlabeledCube = self.report.cube.isUnlabeled and index == 0

        colVector = self.report.generateCellVector('col', index)[1]

        #=======================================================================
        # if      (not firstColOfAnUnlabeledCube and
        #          all((not cell.fact.isNumeric and cell.fact.value == '') for cell in colVector if cell is not None)):
        #     self.isHidden = True # yes, i'm misusing this flag, but it works!
        #     return
        #=======================================================================

        columnETree = SubElement(self.report.columnsETree, 'Column', FlagID='0')
        SubElement(columnETree, 'Id').text = str(index+1)
        SubElement(columnETree, 'IsAbstractGroupTitle').text = 'false'
        SubElement(columnETree, 'LabelSeparator').text = ' '

        self.report.writeFootnoteIndexerEtree(self.footnoteNumberSet, columnETree)

        labelsETree = SubElement(columnETree, 'Labels')
        for index, header in enumerate(self.headingList):
            #SubElement(labelsETree, 'Label', Key='', Id=str(index), Label=str(header))
            SubElement(labelsETree, 'Label', Id=str(index), Label=str(header))

        periodPseudoAxisOnCols = False
        primaryPseudoAxisOnCols = False
        otherAxisOnCols = False
        for factAxisMember in self.factAxisMemberGroup.factAxisMemberColList:
            if factAxisMember.pseudoAxisName == 'period':
                periodPseudoAxisOnCols = True
            elif factAxisMember.pseudoAxisName == 'primary':
                primaryPseudoAxisOnCols = True
            elif factAxisMember.pseudoAxisName != 'unit':
                otherAxisOnCols = True

        SubElement(columnETree, 'hasSegments').text = str(otherAxisOnCols).casefold()
        SubElement(columnETree, 'hasScenarios').text = 'false'

        mcuETree = SubElement(columnETree, 'MCU')

        if self.context is not None and not firstColOfAnUnlabeledCube:
            if periodPseudoAxisOnCols:
                self.report.emitContextRef(mcuETree, self.factAxisMemberGroup.factAxisMemberColList, self.context)
            elif any(factAxisMember.pseudoAxisName not in {'primary', 'period', 'unit'} for factAxisMember in self.factAxisMemberGroup.factAxisMemberColList):
                self.report.emitContextRef(mcuETree, self.factAxisMemberGroup.factAxisMemberColList, None)

        if primaryPseudoAxisOnCols and self.factAxisMemberGroup.fact.unit is not None:
            # the primary pseudoaxis is on the cols, so show the units for that fact
            self.report.emitUPS(mcuETree, self.factAxisMemberGroup.fact.unit)

        if self.report.isUnitsAxisOnRowsOrColumns == 'col':
            # by design, there can only be one currency per column, if the unit axis is on the columns.
            for cell in colVector:
                if cell is not None and cell.showCurrencySymbol:
                    SubElement(columnETree, 'CurrencySymbol').text = cell.currencySymbol
                    break
                


    def addToLog(self,message,messageArgs=(),messageCode='debug',file='Report.py -- Column'):
        self.filing.controller.addToLog(message, messageArgs=messageArgs, messageCode=messageCode, file=file)

class Cell(object):
    def __init__(self, filing, row, column, index, fact=None, preferredLabel=None, NonNumericText=''):
        self.filing = filing
        self.row = row
        self.column = column
        self.index = index + 1
        self.fact = fact
        self.footnoteNumberSet = set()

        self.scalingFactor = None # set elsewhere
        self.quantum = 0
        self.currencySymbol = None
        self.unitID = None # we need to tell USD and USD/share apart.  otherwise they have the same currencySymbol and currencyCode.
        self.currencyCode = None
        self.showCurrencySymbol = False
        self.NonNumericText = NonNumericText
        self.preferredLabel=preferredLabel
        if preferredLabel is not None:
            self.preferredLabel=preferredLabel.rpartition('/')[2]

        if      (fact is not None and
                 fact.isNumeric and
                 not self.fact.isNil and
                 (fact.concept.isMonetary or Utils.isFactPerShareItemType(fact))):

            # we do this weird call here because we know the type is either perShareDerivedType or monetaryDerivedType.  either way, we know numerator is monetary.
            self.currencyCode = fact.unit.measures[0][0].localName
            self.unitID = fact.unitID
            currencySymbol = fact.unitSymbol() or self.currencyCode
            if Utils.isFactPerShareItemType(fact):
                left, ignore, right = currencySymbol.partition(' / ')
                if right == 'shares':
                    currencySymbol = left
            self.currencySymbol = currencySymbol
            self.showCurrencySymbol = True

    def emitCell(self, cellsETree):
        fact = self.fact
        report = self.row.report
        typeLocalName = fact.concept.typeQname.localName

        #########################################
        ContextID = fact.contextID
        UnitID = fact.unitID or ''
        cellETree = SubElement(cellsETree , 'Cell', FlagID='0', ContextID=ContextID, UnitID=UnitID)
        #########################################


        #########################################
        SubElement(cellETree, 'Id').text = str(self.index)
        #########################################


        #########################################
        IsNumeric = fact.isNumeric
        IsRatio = False
        NumericAmount = ''
        valueStr = self.handleFactValue()
        if IsNumeric:
            if      (Utils.isFactPercentItemType(fact) or 
                    (Utils.isFactPureAndInInvestNamespace(fact)) or
                    (self.filing.isRR and fact.concept.typeQname.localName
                      in {'NonNegativePure4Type', 'NonPositivePure4Type', 'pureItemType'}) or
                    (fact.unit.isSingleMeasure and any(utrEntry.unitId == 'Rate' for utrEntry in fact.utrEntries.copy()))):
                IsRatio = True  # Rename to DisplayAsPercent
            NumericAmount = valueStr
        else:
            self.NonNumericText = valueStr
        SubElement(cellETree, 'IsNumeric').text = str(IsNumeric).casefold()
        SubElement(cellETree, 'IsRatio').text = str(IsRatio).casefold()

        dataTypeSet = {'NonNegativePure4Type', 'NonPositivePure4Type', 'pureItemType', 'NonNegativeMonetaryType', 'NonPositiveMonetaryType'}
        SubElement(cellETree, 'DisplayZeroAsNone').text = str(self.filing.isRR and typeLocalName in dataTypeSet).casefold()

        # handle scaling
        numericAmount, roundedNumericAmount = self.handleScalingAndPrecision(IsNumeric, NumericAmount)
        SubElement(cellETree, 'NumericAmount').text = str(numericAmount)
        SubElement(cellETree, 'RoundedNumericAmount').text = str(roundedNumericAmount)
 
        # note the typo here, NonNumbericText not NonNumericText.  this is legacy and we can't change it.
        if self.NonNumericText == '':
            SubElement(cellETree, 'NonNumbericText')
        else:
            SubElement(cellETree, 'NonNumbericText').text = self.NonNumericText
        #########################################


        #########################################
        report.writeFootnoteIndexerEtree(self.footnoteNumberSet, cellETree)
        #########################################


        #########################################
        if self.currencyCode is not None:
            SubElement(cellETree, 'CurrencyCode').text = self.currencyCode
            SubElement(cellETree, 'CurrencySymbol').text = self.currencySymbol
        else:
            SubElement(cellETree, 'CurrencyCode')
            SubElement(cellETree, 'CurrencySymbol')

        SubElement(cellETree, 'ShowCurrencySymbol').text = str(self.showCurrencySymbol).casefold()
        #########################################


        #########################################
        # we check for isUncategorizedFacts because we don't want to actually render this embedding in that case.
        # also, if we were to render it, all the data structures it would rely on have all been freed at this point to save memory,
        # so it would crash.
        if fact.concept.isTextBlock and not report.cube.isUncategorizedFacts:
            try:
                embedding = self.filing.factToEmbeddingDict[fact]
                self.insertEmbeddingOrBarChartEmbeddingIntoETree(embedding, cellETree)
            except KeyError:
                pass
        #########################################


        #########################################
        if not re.compile('[0-9]{4}-[0-9]{2}-[0-9]{2}').match(self.NonNumericText) == None:
            SubElement(cellETree, 'DisplayDateInUSFormat').text = 'true'
        else:
            SubElement(cellETree, 'DisplayDateInUSFormat').text = 'false'







    def handleScalingAndPrecision(self, IsNumeric, NumericAmount):
        if IsNumeric and len(NumericAmount) > 0:
            if self.scalingFactor is not None:
                # note the rounding here.  ROUND_HALF_EVEN means:
                # 100500 with decimals =-3 gets rounded to 100
                # 101500 with decimals =-3 gets rounded to 102
                # 100501 with decimals =-3 gets rounded to 101
                # it doesn't round the 100500 up because it only rounds to an even.  in the case of 101500 it rounds it up
                # to 102 because 2 is even.  strange, but this is the new standard and is the way things are done these days.
                quantum = getattr(self,'quantum',1)
                scaledNumericAmount = str(decimal.Decimal(NumericAmount).scaleb(self.scalingFactor).quantize(decimal.Decimal(quantum), rounding=decimal.ROUND_HALF_EVEN))
                return (NumericAmount, scaledNumericAmount)
            else:
                return (NumericAmount, NumericAmount)
        else:
            return (0, 0) # re2 compatibility






    def handleFactValue(self):
        fact = self.fact
        valueStr = fact.value

        if fact.isNumeric:
            if self.preferredLabel is not None and 'negated' in self.preferredLabel:
                if valueStr[0] == '-': # we're making it a negative
                    return valueStr[1:] # already a negative, make it positive
                elif valueStr != '0': # we don't want a negtive zero.
                    return '-' + valueStr # positive, make it negative

        else:
            try:
                qnameToGetTheLabelOf = self.filing.factToQlabelDict[fact]
                return self.filing.modelXbrl.qnameConcepts[qnameToGetTheLabelOf].label(self.preferredLabel)
            except KeyError:
                if fact.concept.typeQname.localName == 'durationItemType':
                    return Utils.handleDurationItemType(valueStr)

        return valueStr

    def insertEmbeddingOrBarChartEmbeddingIntoETree(self, embedding, cellETree):
        # in mainFun, we run releaseUnneededMemory() on broken embeddings.  this would mean that embedding wouldn't have any attributes,
        # so it would throw an exception.  this implies that the embedding is broken.  since it's broken, we shouldn't insert it.
        try:
            #second check here makes sure an embedding isn't embedding itself.  it can happen.
            if embedding.isEmbeddingOrReportBroken or embedding == self.row.report.embedding:
                return
        except AttributeError:
            return
        
        report = self.row.report
        report.hasEmbeddedReports = True

        EmbeddedReport = SubElement(cellETree, 'EmbeddedReport')

        if embedding.cube.isBarChart:
            fig = embedding.report.generateBarChart()
            if fig is None:
                errorStr = Utils.printErrorStringToDisambiguateEmbeddedOrNot(embedding.factThatContainsEmbeddedCommand)
                message = ErrorMgr.getError('FIGURE_HAS_NO_FACTS_WARNING').format(embedding.cube.shortName, errorStr)
                self.addToLog(message, messageCode="warn")
            else:
                report.filing.numBarcharts += 1
                pngname = 'BarChart'+str(report.filing.numBarcharts) + '.png'
                self.filing.controller.supplementalFileList += [pngname]

                self.addToLog('Writing Figures= ' + pngname, messageCode='info')

                if self.filing.fileNameBase:
                    file = os.path.join(self.filing.fileNameBase, pngname)
                elif self.filing.reportZip:
                    file = io.BytesIO()
                fig.savefig(file, bbox_inches='tight', dpi=150)
                if self.filing.reportZip:
                    file.seek(0)
                    self.filing.reportZip.writestr(pngname, file.read())
                    file.close()
                    del file  # dereference
                from matplotlib import pyplot
                pyplot.close(fig)
                self.addToLog('Barchart {} inserted into {} Generated Figures={}'.format(embedding.cube.linkroleUri, report.cube.linkroleUri, report.filing.numBarcharts), messageCode='info')

                SubElement(EmbeddedReport, 'BarChartImageFileName').text = pngname
        else:
            SubElement(EmbeddedReport, 'BarChartImageFileName')

        SubElement(EmbeddedReport, 'EmbedInstruction')
        SubElement(EmbeddedReport, 'IsTransposed').text = str(self.row.report.cube.isTransposed).casefold()
        SubElement(EmbeddedReport, 'Role')
        EmbeddedReport.append(embedding.report.rootETree)

        Utils.releaseUnneededMemory(embedding)


    def addToLog(self, message, messageArgs=(), messageCode='debug', file='Report.py -- Cell'):
        self.filing.controller.addToLog(message, messageArgs=messageArgs, messageCode=messageCode, file=file)























# this is broken.
#===============================================================================
#     def handleGrouped(self):
# 
#         #[(r.level, r.coordinateList, r.IsAbstractGroupTitle) for r in self.rowList if not r.isHidden]
#         #[(str(fam.member), fam.memberLabel, fam.pseudoAxisName, fam.pseudoAxisName in self.embedding.groupedAxisQnameSet) for fam in row.factAxisMemberGroup.factAxisMemberRowList]
#         #row.index
#         #memberStack
# 
#         counter = 0
#         prevRow = None
#         memberStack = []
# 
#         while counter < len(self.rowList):
# 
#             row = self.rowList[counter]
#             #             nextRow = None
#             #             if counter + 1 < len(self.rowList):
#             #                 nextRow = self.rowList[counter + 1]
# 
#             if row.isHidden:
#                 counter += 1
#                 continue
# 
#             if prevRow is None or row.groupedCoordinateList != prevRow.groupedCoordinateList:
#                 for i, factAxisMember in enumerate(row.factAxisMemberGroup.factAxisMemberRowList):
#                     if factAxisMember.pseudoAxisName not in self.embedding.groupedAxisQnameSet:
#                         continue
# 
#                     # if we're about to push a new abstract row onto the stack, but first we might need to close some open
#                     # axes with some dummy rows.
#                     while len(memberStack) > i > 0:
#                         counter = self.groupedHelperForMissingTotalRow(memberStack, counter)
#                     #===========================================================
#                     # if      (prevRow is not None and len(memberStack) > 0 and
#                     #          (nextRow is None or row.coordinateList[i] != nextRow.coordinateList[i])):
#                     #     member, totalLabel = memberStack.pop()
#                     #     if not (member == totalLabel == None):
#                     #         emptyTotalAbstractRow = Row(self.filing, self, index=counter, IsAbstractGroupTitle=True, level=len(memberStack))
#                     #         emptyTotalAbstractRow.headingList = [totalLabel]
#                     #         self.rowList.insert(counter, emptyTotalAbstractRow)
#                     #         counter += 1
#                     #===========================================================
# 
#                     if prevRow is None or row.coordinateList[i] != prevRow.coordinateList[i]:
#                         # we push nothing to the stack because there's still a level there.
#                         if factAxisMember.member is None:
#                             memberStack += [(None, None)]
# 
#                         # we create an abstract row and push to the stack, later we will close.
#                         else:
#                             openingAbstractRow = Row(self.filing, self, index=counter, IsAbstractGroupTitle=True, level=len(memberStack))
#                             openingAbstractRow.headingList = [factAxisMember.memberLabel]
#                             self.rowList.insert(counter, openingAbstractRow)
#                             counter += 1
# 
#                             totalLabel = self.filing.memberDict[factAxisMember.member].arelleConcept.label(preferredLabel = Utils.totalRole)
#                             memberStack += [(factAxisMember.member, totalLabel)]
# 
#                     # if we haven't written a sequence of rows with the same groupedCoordinateList, we close anyways.
#                     elif factAxisMember.member is None and len(memberStack) > 0:
#                         member, totalLabel = memberStack.pop()
#                         if not (member == totalLabel == None):
#                             row.headingList = [totalLabel]
# 
#             # if we enter check below, we've already written a sequence of rows with the same groupedCoordinateList, now
#             # we have to be on the lookout for the total row to close it.
#             elif    (len(row.factAxisMemberGroup.factAxisMemberRowList) > len(memberStack) > 0 and
#                      row.factAxisMemberGroup.factAxisMemberRowList[ len(memberStack) ].member is None):
#                 member, totalLabel = memberStack.pop()
#                 if not (member == totalLabel == None):
#                     row.headingList = [totalLabel]
# 
#             row.level = len(memberStack)
#             prevRow = self.rowList[counter]
#             counter += 1
# 
#         # if we go through all the rows, but the stack isn't empty yet, then there are missing total rows, so pop them and make rows.
#         while len(memberStack) > 0:
#             counter = self.groupedHelperForMissingTotalRow(memberStack, counter)
# 
# 
#     def groupedHelperForMissingTotalRow(self, memberStack, counter):
#         member, totalLabel = memberStack.pop()
#         if member == totalLabel == None:
#             return counter
#         else:
#             emptyTotalAbstractRow = Row(self.filing, self, index=counter, IsAbstractGroupTitle=True, level=len(memberStack))
#             emptyTotalAbstractRow.headingList = [totalLabel]
#             self.rowList.insert(counter, emptyTotalAbstractRow)
#             return counter + 1
#===============================================================================