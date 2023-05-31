# -*- coding: utf-8 -*-
"""
:mod:`EdgarRenderer.Report`
~~~~~~~~~~~~~~~~~~~
Edgar(tm) Renderer was created by staff of the U.S. Securities and Exchange Commission.
Data and content created by government employees within the scope of their employment
are not subject to domestic copyright protection. 17 U.S.C. 105.
"""

# must prevent EDGAR from writing into system directories, use environment variable:
# MPLCONFIGDIR= ... arelle's xdgConfigHome value
from matplotlib import use as matplotlib_use
# must initialize matplotlib to not use tkinter or $DISPLAY (before other imports)
matplotlib_use("Agg")

import os, re, datetime, decimal, io, time
from collections import defaultdict
from lxml.etree import Element, SubElement, XSLT, tostring as treeToString
import arelle.XbrlConst
from . import Utils
Filing = None
from arelle.XbrlConst import qnIXbrl11Hidden

xlinkRole = '{' + arelle.XbrlConst.xlink + '}role' # constant belongs in XbrlConsts`headingList

class Report(object):
    def __init__(self, filing, cube, embedding):
        global Filing
        if Filing is None:
            from . import Filing
        self.filing = filing
        self.controller = filing.controller
        filing.numReports += 1

        self.cube = cube
        self.embedding = embedding

        self.promotedAxes = []
        self.rowList = []
        self.colList = []

        self.numColumns = 0
        self.numVisibleColumns = 0
        self.numRows = 0
        self.numVisibleRows = 0
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
        self.repressPeriodHeadings = False


    def generateCellVector(self, rowOrColStr, index):
        if rowOrColStr == 'col':
            return (self.colList[index], [row.cellList[index] for row in self.rowList if not row.isHidden])
        else:
            row = self.rowList[index]
            return (row, [cell for i, cell in enumerate(row.cellList) if not self.colList[i].isHidden])


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
            #groupedCoordinateList = []
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

                #if rowOrColStr == 'row' and pseudoAxisName in self.embedding.groupedAxisQnameSet:
                #    groupedCoordinateList += [axisMemberPositionTuple]

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
                    isStart = Utils.isPeriodStartLabel(preferredLabel)
                    IsCalendarTitle = self.cube.isStatementOfEquity and (isStart or Utils.isPeriodEndLabel(preferredLabel))

                    # this is goofy, in handlePeriodStartEndLabel() we turn instant facts into durations
                    # for the purposes of layout, but now, we artificially make the rows instants again.
                    if IsCalendarTitle and startEndContext is not None:
                        # we kill the startTime, which makes it an instant
                        if startEndContext.startTime is not None and isStart:
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
                                    IsCalendarTitle=IsCalendarTitle, elementQname=fact.qname)
                                    #groupedCoordinateList=groupedCoordinateList, IsCalendarTitle=IsCalendarTitle, elementQname=fact.qname)
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

            else:
                self.factToColDefaultDict[(fact, preferredLabel)].append(previousRowOrCol.index)
                rowOrCol.factList += [fact]
                rowOrCol.elementQnameMemberForColHidingSet.update(elementQnameMemberForColHidingSet)
        # return generateRowOrCols



    def decideWhetherToRepressPeriodHeadings(self):
        # for risk return filings, if there is only one period (durations and instants ending at the same time are ok too) we don't
        # need to print the period everywhere.
        if self.embedding.rowPeriodPosition != -1:
            self.decideWhetherToSuppressPeriod('row', self.rowList, self.embedding.rowPeriodPosition)
        elif self.embedding.columnPeriodPosition != -1:
            self.decideWhetherToSuppressPeriod('col', self.colList, self.embedding.columnPeriodPosition)


    def decideWhetherToSuppressPeriod(self, rowOrColStr, rowOrColList, periodPosition):
        # returns if more than one period, otherwise represses period headings.  i use memberLabel, because it will treat an instant
        # and duration ending at the same time as the instant as the same.
        if rowOrColStr == 'row':
            first = rowOrColList[0].factAxisMemberGroup.factAxisMemberRowList[periodPosition].memberLabel
            for row in rowOrColList:
                if first != row.factAxisMemberGroup.factAxisMemberRowList[periodPosition].memberLabel:
                    return # we're done, there are two periods
        else:
            first = rowOrColList[0].factAxisMemberGroup.factAxisMemberColList[periodPosition].memberLabel
            for col in rowOrColList:
                if first != col.factAxisMemberGroup.factAxisMemberColList[periodPosition].memberLabel:
                    return # we're done, there are two periods
        self.repressPeriodHeadings = True # there's only one period, don't show it.


    def proposeAxisPromotions(self, rowOrColStr, rowOrColList, pseudoAxisNameList):
        # don't promote axes if there's only one row or col. true, some might be hidden, but we don't want to check
        # that hard yet because in the future more rows and cols may be hidden, so this is quick and dirty. we'll check
        #for real after all that is done.
        if len(rowOrColList) == 1:
            return

        # loop through each axis and if len(memberSet) == 1 promote axis because all rows or cols have the same label,
        # no use repeating it for every row or col.   if memberSet bigger, don't promote.
        for i, pseudoAxisName in enumerate(pseudoAxisNameList):
            if pseudoAxisName == 'unit':
                unitAndMaybeSymbolStr = self.proposeUnitAxisPromotion(rowOrColList)
                if unitAndMaybeSymbolStr is not None:
                    self.promotedAxes += [('unit', rowOrColStr, unitAndMaybeSymbolStr)]
                continue
            if pseudoAxisName == 'primary' or (self.repressPeriodHeadings and pseudoAxisName == 'period'):
                continue

            memberLabel = None
            startEndContextDuration = None

            for rowOrCol in rowOrColList:
                if rowOrColStr == 'row':
                    factAxisMember = rowOrCol.factAxisMemberGroup.factAxisMemberRowList[i]
                else:
                    factAxisMember = rowOrCol.factAxisMemberGroup.factAxisMemberColList[i]

                if memberLabel is None:
                    memberLabel = factAxisMember.memberLabel
                #second case if factAxisMember.memberLabel was None
                if memberLabel != factAxisMember.memberLabel or memberLabel == None or factAxisMember.memberIsDefault:
                    memberLabel = None
                    break # there's more than one different member so can't promote axis

                if pseudoAxisName == 'period' and factAxisMember.member.periodTypeStr == 'duration':
                    if startEndContextDuration is None:
                        startEndContextDuration = factAxisMember.member
                    elif startEndContextDuration != factAxisMember.member:
                        memberLabel = None # there is more than one duration, don't promote
                        break

            if memberLabel is not None:
                # we do this because we want to promote the period if there's an instant and duration ending at the same time.
                # for the sake of promotion, we consider these two one member, even though they are different.  if we tack on the months
                # before we get to this stage, these two will seem different, even though for our purposes, they are the same.
                if startEndContextDuration is not None and startEndContextDuration.numMonths > 0:
                    memberLabel = '{!s} months ended {}'.format(startEndContextDuration.numMonths, memberLabel)
                self.promotedAxes += [(pseudoAxisName, rowOrColStr, memberLabel)]


    # this is complicated because we still might promote units even if there are multiple units.  for instance, if there are
    # USD, USD/Share and shares as the units, we still promote USD.  same for any pair of two from those three.  however, we won't promote
    # if we have ounces and barrels of oil for instance, or USD, JPY/Share and Share.
    def proposeUnitAxisPromotion(self, rowOrColList):
        monetaryFact = perShareMonetaryFact = sharesFact = anotherKindOfFact = None

        for rowOrCol in rowOrColList:
            fact = rowOrCol.factAxisMemberGroup.fact
            if fact.unit is not None:
                if fact.concept.isMonetary:
                    if monetaryFact is not None and monetaryFact.unitID != fact.unitID:
                        return # can't have two different currencies
                    monetaryFact = fact
                elif Utils.isFactTypeEqualToOrDerivedFrom(fact, Utils.isPerShareItemTypeQname):
                    if perShareMonetaryFact is not None and perShareMonetaryFact.unitID != fact.unitID:
                        return # can't have two different currencies / share
                    perShareMonetaryFact = fact
                elif fact.concept.isShares:
                    if sharesFact is not None and sharesFact.unitID != fact.unitID:
                        return # can't have two different shares
                    sharesFact = fact
                elif Utils.isRate(fact, self.filing):
                    continue # it's essentially a pure fact, so we don't need to worry about it.
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

        if anotherKindOfFact is not None:
            return Utils.getUnitAndSymbolStr(anotherKindOfFact)
        elif monetaryFact is not None:
            return Utils.getUnitAndSymbolStr(monetaryFact)
        elif perShareMonetaryFact is not None:
            return Utils.getUnitAndSymbolStr(perShareMonetaryFact)
        elif sharesFact is not None:
            return Utils.getUnitAndSymbolStr(sharesFact)


    # now we know what rows and cols will be hidden, so we can now finalize the promotions.
    def finalizeProposedPromotions(self):
        if len(self.promotedAxes) == 0:
            return

        def dontPromoteUnlessMultipleNonHiddenRowsOrCols(rowOrColList, rowOrColStr):
            # if there's only one non-hidden row or col at this point, don't promote anything for it.
            if (rowOrColStr == 'row' and self.numVisibleRows == 1) or (rowOrColStr == 'col' and self.numVisibleColumns == 1):
                self.promotedAxes = [axisTriple for axisTriple in self.promotedAxes if axisTriple[1] != rowOrColStr]

        rowOrColStrs = [axisTriple[1] for axisTriple in self.promotedAxes]
        if 'row' in rowOrColStrs:
            dontPromoteUnlessMultipleNonHiddenRowsOrCols(self.rowList, 'row')
        if 'col' in rowOrColStrs:
            dontPromoteUnlessMultipleNonHiddenRowsOrCols(self.colList, 'col')

        unitStrToAppendToEnd = None
        for axis, ignore, s in self.promotedAxes:
            if axis == 'unit':
                unitStrToAppendToEnd = s
            else:
                self.shortName += self.filing.titleSeparatorStr + s
        if unitStrToAppendToEnd is not None:
            self.shortName += self.filing.titleSeparatorStr + unitStrToAppendToEnd


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

            # non-monetary rows or cols might overlap, in which case, call the whole thing off, don't merge this group.
            # the other sets can't overlap.
            if len(nonMonetarySet) > 1 and self.doVectorsOverlap(nonMonetarySet, rowOrColStr):
                continue

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
        # also, note that there might not be any units.
        if rowOrColStr == 'row':
            unitsAxisOnRowsOrCols = self.embedding.rowUnitPosition != -1
        else:
            unitsAxisOnRowsOrCols = self.embedding.columnUnitPosition != -1

        tempRowOrColList = sorted(rowOrColList, key = lambda thing : thing.coordinateListWithoutUnitPeriod)
        while len(tempRowOrColList) > 0:

            previousCoordinateListWithoutPeriodAndUnit = tempRowOrColList[0].coordinateListWithoutUnitPeriod
            instantRowOrColList = []
            durationRowOrColList = []
            while len(tempRowOrColList) > 0 and previousCoordinateListWithoutPeriodAndUnit == tempRowOrColList[0].coordinateListWithoutUnitPeriod:
                rowOrCol = tempRowOrColList.pop(0)
                if not rowOrCol.isHidden and rowOrCol.startEndContext is not None:
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
                    # otherwise we need the units to be compatible. Also make sure the vectors don't overlap.
                    if      ((not unitsAxisOnRowsOrCols or self.areFactsCompatableByUnits(instantRowOrCol, durationRowOrCol)) and
                             not self.doVectorsOverlap([instantRowOrCol, durationRowOrCol], rowOrColStr)):
                        self.deepCopyRowsOrCols(rowOrColStr, durationRowOrCol, instantRowOrCol)
                    del durationRowOrColList[0]


    def doVectorsOverlap(self, rowsOrCols, rowOrColStr):
        # zip takes multiple lists and zips them together and gives you tuples. the star character basically takes a list or
        # set of lists and makes each one an argument for zip(). The lists here are basically lists of true/false values,
        # where true means that the cell is occupied and false means it's empty. then i do some boolean math and since True == 1,
        # and false == 0, you can sum the tuple that zip provides and if the sum is greater than 1, you know that you that
        # for some position the vectors overlap, so you can't combine them.
        z = zip(*[[cell is not None for cell in self.generateCellVector(rowOrColStr, rowOrCol.index)[1]] for rowOrCol in rowsOrCols])
        return any(sum(trueFalseTuple) > 1 for trueFalseTuple in z)


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
        mergeRowOrCol.hide()
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
                            col2.hide()

    def updateUnitTypeToFactSetDefaultDict(self, fact, rowOrCol):
        if fact.concept.isMonetary:
            # we manufacture an item type because there are a bunch that are monetary.  easier to check for one than a bunch each time.
            typeName = 'monetaryDerivedType'
        elif Utils.isFactTypeEqualToOrDerivedFrom(fact, Utils.isPerShareItemTypeQname):
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
                elif Utils.isFactTypeEqualToOrDerivedFrom(exampleFact, Utils.isPerShareItemTypeQname):
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
        # if we're looking at rows and there is only one col, it doesn't make sense to promote footnotes to the rows,
        # only maybe the columns.
        if (rowOrColStr == 'row' and self.numVisibleColumns == 1) or (rowOrColStr == 'col' and self.numVisibleRows == 1):
            return

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
            SubElement(etreeNode, 'FootnoteIndexer') # the stylesheet needs this, even if empty?


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
        forbiddenAxisSet = {'primary', 'unit', 'period'}.union({axisTriple[0] for axisTriple in self.promotedAxes})

        while counter < len(self.rowList):

            row = self.rowList[counter]
            if      (not row.isHidden and
                     (prevRow == None or row.coordinateListWithoutUnitPeriodPrimary != prevRow.coordinateListWithoutUnitPeriodPrimary)):

                prevRow = self.rowList[counter]

                # build heading list
                headingList = []
                axisInSegmentTitleHeaderBoolList = []
                for factAxisMember in row.factAxisMemberGroup.factAxisMemberRowList:
                    if factAxisMember.pseudoAxisName not in forbiddenAxisSet and not factAxisMember.memberIsDefault:
                        headingList += [factAxisMember.memberLabel]
                        axisInSegmentTitleHeaderBoolList += [True]
                    else:
                        axisInSegmentTitleHeaderBoolList += [False]

                # make new segment title row and insert into rowList
                if headingList != []:
                    headerRow = Row(self.filing, self, index=counter, isSegmentTitle=True)
                    if self.cube.isUnlabeled:
                        # this is because the heading column on the left gets killed if the cube is "unlabeled" so we have to move the heading over
                        # into the first cell.
                        headerRow.cellList[0] = Cell(self.filing, headerRow, self.colList[0], 0, NonNumericText=self.filing.rowSeparatorStr.join(headingList))
                    # you'd think we didn't need to add heading list for isUnlabeled, since we're pushing the heading into the cell too,
                    # but unless it's in both the R-file row "Label" field, and the cell, the style sheet will hide the first row of each report,
                    # which it shouldn't.  so, because it works, we do both.
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
                factPrimaryAxisPosition = row.coordinateList[self.embedding.rowPrimaryPosition][1]
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


    def generateRowAndOrColHeadingsForElements(self):
        for row in self.rowList: # if isElements, we just need rows, don't need cols
            if not (row.IsAbstractGroupTitle or row.isSegmentTitle):
                for factAxisMember in row.factAxisMemberGroup.factAxisMemberRowList:
                    # since cube isElements, we know primary must be on the rows, we checked.
                    if factAxisMember.pseudoAxisName == 'primary':
                        row.headingList += [factAxisMember.memberLabel]
                        break


    def generateRowAndOrColHeadingsGeneralCase(self):
        # axes to not generate headings for, cheaper to build this set only once and pass it in.
        promotedAxesSet = {axisTriple[0] for axisTriple in self.promotedAxes}
        noHeadingsForTheseAxesSet = promotedAxesSet.union(self.embedding.noDisplayAxesSet) #.union(self.embedding.groupedAxisQnameSet)
        if self.repressPeriodHeadings:
            noHeadingsForTheseAxesSet.add('period')

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
                elif not row.IsAbstractGroupTitle and row.headingList == []:
                    self.generateRowOrColHeading('row', row, row.factAxisMemberGroup.factAxisMemberRowList, noHeadingsForTheseAxesSet, mostRecentSegmentTitleRow)

                    if self.embedding.columnUnitPosition != -1 and 'unit' not in promotedAxesSet and len(row.unitTypeToFactSetDefaultDict) == 1:
                        unitHeading = self.appendUnitsToRowsIfUnitsOnColsAndRowHasOnlyOneUnit(row)
                        if unitHeading is not None:
                            rowUnitHeadingDefaultDict[unitHeading].append(row)

        # don't print the most popular unitHeading, only the rest.  we do this to prevent clutter, it looks ugly.
        # however, if the most popular is a tie, we print all the most popular. since we're not printing the most popular, if
        # there's only 1, we just quit, only proceed if there are two or above.
        if len(rowUnitHeadingDefaultDict) < 2:
            return

        def addToRows(listOfUnitRowSetTuples):
            for unitHeading, rowSet in listOfUnitRowSetTuples:
                for row in rowSet:
                    row.headingList += [unitHeading]

        sortedList = sorted(rowUnitHeadingDefaultDict.items(), key=lambda thing : len(thing[1])) # sort by number of rows per unit
        addToRows(sortedList[:-1]) # do the first n-1 units, which are the ones with the least rows
        if len(sortedList[len(sortedList) - 1][1]) == len(sortedList[len(sortedList) - 2][1]):
            addToRows(sortedList[-1:]) # if the unit with the most rows, is tied with the second to last, do the last one too.


    def generateRowOrColHeading(self, rowOrColStr, rowOrCol, factAxisMemberList, noHeadingsForTheseAxesSet, mostRecentSegmentTitleRow):
        preferredLabel = getattr(rowOrCol, 'preferredLabel', None)
        monthsEndedText = None
        headingList = rowOrCol.headingList
        verboseHeadings = self.filing.verboseHeadingsForDebugging
        previousPseudoAxisNames = []
        noDateRepetitionFlag = False
        substituteForEmptyHeading = 'Total'
        for i, factAxisMember in enumerate(factAxisMemberList):
            pseudoAxisName = factAxisMember.pseudoAxisName
            if      (pseudoAxisName in noHeadingsForTheseAxesSet or
                     (mostRecentSegmentTitleRow is not None  # do not repeat member information in previous segment title row.
                      and mostRecentSegmentTitleRow.axisInSegmentTitleHeaderBoolList[i])):
                pass
            # TODO: for grouped, if factAxisMember.member is None: continue
            elif pseudoAxisName == 'unit':
                self.generateAndAddUnitHeadings(rowOrCol, rowOrColStr)
            elif pseudoAxisName == 'period':
                try:
                    numMonths = rowOrCol.startEndContext.numMonths
                    if (numMonths > 0):
                        monthsEndedText = '{!s} Months Ended'.format(numMonths)
                    if self.embedding.columnPeriodPosition != -1:
                        headingList += [rowOrCol.startEndContext.label]
                except AttributeError:
                    pass # incomplete or forever context
            elif verboseHeadings:
                headingList += [factAxisMember.memberLabel]
            elif not factAxisMember.memberIsDefault:
                if      (not isinstance(pseudoAxisName,str)
                         and Utils.isEfmStandardNamespace(pseudoAxisName.namespaceURI)
                         and pseudoAxisName.localName == 'CreationDateAxis'):
                    if headingList == []:
                        headingList = ['('+ factAxisMember.memberLabel + ')']
                    else:
                        headingList[-1] = headingList[-1] + ' ('+ factAxisMember.memberLabel + ')'
                else:
                    if      (not isinstance(pseudoAxisName,str)
                             and Utils.isEfmStandardNamespace(pseudoAxisName.namespaceURI)
                             and pseudoAxisName.localName == 'StatementScenarioAxis'
                             and Utils.isEfmStandardNamespace(factAxisMember.member.namespaceURI)
                             and factAxisMember.member.localName == 'RestatementAdjustmentMember'):
                        noDateRepetitionFlag = True
                    headingList += [factAxisMember.memberLabel]
            elif factAxisMember.memberIsDefault and self.cube.isTransposed:
                substituteForEmptyHeading = factAxisMember.memberLabel
            previousPseudoAxisNames += [pseudoAxisName]

        if rowOrColStr == 'row':
            thisLayoutDirectionHasPeriodAxis = self.embedding.rowPeriodPosition != -1
        else:
            thisLayoutDirectionHasPeriodAxis = self.embedding.columnPeriodPosition != -1

        if Utils.isPeriodStartOrEndLabel(preferredLabel) and thisLayoutDirectionHasPeriodAxis and headingList != []:
            strDate = (rowOrCol.context.endDatetime + datetime.timedelta(days=-1)).strftime('%b. %d, %Y')
            headingList = [x for x in headingList if x != strDate ]
            heading = ''
            if len(headingList) > 0:
                heading = headingList[0]
            if len(headingList) > 1:
                heading += ' (' + (', '.join(headingList[1:])) + ')'
            if noDateRepetitionFlag:
                headingList = [heading]
            else:
                headingList = [heading + ' at ' + strDate]

        if monthsEndedText is not None and self.embedding.columnPeriodPosition != -1:
            headingList = [monthsEndedText] + headingList
        if headingList == [] and 'primary' not in previousPseudoAxisNames:
            headingList = [substituteForEmptyHeading]
        rowOrCol.headingList = headingList


    def generateAndAddUnitHeadings(self, rowOrCol, rowOrColStr):
        # sorting by type, but monetary should always come first
        sortedListOfFactSets = []
        for unitType, factSet in sorted(rowOrCol.unitTypeToFactSetDefaultDict.items()):
            if unitType == 'monetaryDerivedType':
                sortedListOfFactSets = [factSet] + sortedListOfFactSets
            else:
                sortedListOfFactSets += [factSet]

        unitSet = set()
        unitAndMaybeSymbolList = []
        for arelleFactSet in sortedListOfFactSets:
            # we need a fact for each unit, why?  because the type of the unit is actually in the element declaration
            # so we do all this just to pull the fact out and pass it to getUnitAndSymbolStr, which will probably call fact.unitSymbol()
            for fact in sorted(arelleFactSet, key = lambda thing : thing.unit.sourceline or 0):
                if fact.unit not in unitSet:
                    unitSet.add(fact.unit)
                    unitSymbolStr = Utils.getUnitAndSymbolStr(fact)
                    if unitSymbolStr is not None:
                        unitAndMaybeSymbolList += [unitSymbolStr]

        # we handle rows and cols slightly differently because for rows, we don't want to put filing.rowSeparatorStr between
        # each of the units in the list of units for the row.  however, for column headings, it's done differently, so they should be
        # separated.  so for rows, we want a long string, for cols, we want to append each to the list.
        if len(unitAndMaybeSymbolList) > 0:
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
        # Rows are "adjacent" if they are
        # 1. the same qname (because you could have a monetary, a shares, a decimal...)
        # 2. previous is an end label and the next one a start label
        # 3. the same instant endtime (implied by condition 4 but faster to test)
        # 4. the same facts are displayed on both rows
        def tracer(row):
            self.controller.logDebug("In ''{}'', {} fact(s) in redundant rows will be hidden: qname={} instant={}".format(
                                    self.cube.shortName, len(row.factList), row.elementQnameStr, row.startEndContext.endTime))
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
                    if      (Utils.isPeriodEndLabel(prevRow.preferredLabel) and
                             Utils.isPeriodStartLabel(thisRow.preferredLabel) and
                             prevRow.startEndContext.endTime==thisRow.startEndContext.endTime and
                             prevRow.factList==thisRow.factList):
                        tracer(thisRow)
                        thisRow.hide()
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
        SubElement(self.rootETree, 'Version').text = self.filing.controller.VERSION
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

        if context is not None and not context.isForeverPeriod:
            SubElement(contextRefETree, 'ContextID').text = context.id
            SubElement(contextRefETree, 'EntitySchema').text = context.entityIdentifier[0]
            SubElement(contextRefETree, 'EntityValue').text = context.entityIdentifier[1]

            startEndContext = self.filing.startEndContextDict.get((context.startDatetime, context.endDatetime))
            if startEndContext is not None:
                SubElement(contextRefETree, 'PeriodType').text = startEndContext.periodTypeStr
                if startEndContext.startTimePretty is not None:
                    SubElement(contextRefETree, 'PeriodStartDate').text = startEndContext.startTimePretty
                SubElement(contextRefETree, 'PeriodEndDate').text = startEndContext.endTimePretty

        realAxisList = [factAxisMember for factAxisMember in factAxisMemberList if factAxisMember.pseudoAxisName not in {'primary', 'period', 'unit'}]
        if len(realAxisList) > 0:
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
        reportSummary.isUncategorized = self.cube.isUncategorizedFacts
        # run always (HF): if not self.controller.auxMetadata: return
        reportSummary.firstAnchor = None
        reportSummary.uniqueAnchor = None
        reportSummary.htmlAnchors = self.controller.roleHasHtmlAnchor[self.cube.linkroleUri]
        cubeCount = 0
        while cubeCount < 3: # if every fact appears in 3 or more reports, don't even bother.
            cubeCount += 1
            for row in self.rowList:
                for cell in row.cellList: # WcH 6/19/2016 do not consider facts in hidden cells
                    fact = None
                    if cell is not None and not getattr(cell.column,'isHidden',False): fact = cell.fact
                    if (fact is not None and fact.xValid and \
                        (qnIXbrl11Hidden not in fact.ancestorQnames)):
                        doc = fact.document
                        ref = None
                        if (doc is not None): ref = doc.basename
                        anchor = \
                        { 'contextRef':fact.contextID
                          ,'name':str(fact.qname)
                          ,'unitRef':fact.unitID
                          ,'xsiNil':fact.xsiNil
                          ,'lang':fact.xmlLang
                          ,'decimals':fact.decimals
                          ,'ancestors':[str(getattr(ancestor,"qname",ancestor.tag)) for ancestor in fact.iterancestors()]
                          ,'reportCount':cubeCount
                          ,'baseRef': ref
                          }
                        if reportSummary.firstAnchor is None:
                            reportSummary.firstAnchor = anchor
                            anchor['first'] = True # flag makes it easier later to see when first same as unique
                        if self.controller.factCubeCount[fact] == 1 and reportSummary.uniqueAnchor is None: # WcH 6/19/2016
                            reportSummary.uniqueAnchor = anchor
                            anchor['unique'] = True # flag makes it easier later to see when first same as unique
                            return


    def writeHtmlAndOrXmlFiles(self, reportSummary):
        baseNameBeforeExtension = self.filing.fileNamePrefix + str(self.cube.fileNumber)
        reportSummary.baseNameBeforeExtension = baseNameBeforeExtension
        tree = self.rootETree.getroottree()
        if self.filing.reportXmlFormat: self.writeXmlFile(baseNameBeforeExtension, tree, reportSummary)
        if self.filing.reportHtmlFormat: self.writeHtmlFile(baseNameBeforeExtension, tree, reportSummary)

    def writeXmlFile(self, baseNameBeforeExtension, tree, reportSummary):
        baseName = baseNameBeforeExtension + '.xml'
        reportSummary.xmlFileName = baseName
        xmlText = treeToString(tree, xml_declaration=True, encoding='utf-8', pretty_print=True)
        if self.filing.reportZip:
            self.filing.reportZip.writestr(baseName, xmlText)
            self.controller.renderedFiles.add(baseName)
        elif self.filing.fileNameBase is not None:
            self.controller.writeFile(os.path.join(self.filing.fileNameBase, baseName), xmlText)
            self.controller.renderedFiles.add(baseName)

    def writeHtmlFile(self, baseNameBeforeExtension, tree, reportSummary):
        baseName = baseNameBeforeExtension + '.htm'
        reportSummary.htmlFileName = baseName
        for _transform, _fileNameBase in (
            ((self.filing.transform, self.filing.fileNameBase),) + (
            ((self.filing.transformDissem, self.filing.dissemFileNameBase),) if self.filing.transformDissem else ())):
            _startedAt = time.time()
            result = _transform(tree, asPage=XSLT.strparam('true'))
            self.controller.logDebug("R{} htm XSLT {:.3f} secs.".format(self.cube.fileNumber, time.time() - _startedAt))
            htmlText = treeToString(result,method='html',with_tail=False,pretty_print=True,encoding='us-ascii')
            if self.filing.reportZip:
                self.filing.reportZip.writestr(baseName, htmlText)
                self.controller.renderedFiles.add(baseName)
            elif _fileNameBase is not None:
                self.controller.writeFile(os.path.join(_fileNameBase, baseName), htmlText)
                if _fileNameBase == self.filing.fileNameBase: # first non-dissem only
                    self.controller.renderedFiles.add(baseName)


    def generateBarChart(self):
        # change rendering guide bar chart documentation
        # add isGood for bargraphs
        factList = []
        yMax = 0.0
        yMin = 0.0
        isOefBarChartFact = re.compile('^\{http://xbrl.sec.gov/oef/.*\}AnnlRtrPct$') # WcH in a hurry 4/6/2023
        for row in self.rowList:
            for fact in row.factList:
                m = Utils.isBarChartFactRegex.match(fact.qname.clarkNotation)
                if m is not None:
                    year = m.group('year')
                    if fact.isNil:
                        factValue = None # no special handling of zeroes in the bar chart generator
                    else:
                        factValue = float(fact.value) * 100
                        if yMax < factValue:
                            yMax = factValue
                        if yMin > factValue:
                            yMin = factValue
                    factList += [(year, factValue)]
                    continue # WcH in a hurry 4/6/2023 starts here
                m = re.match(isOefBarChartFact,fact.qname.clarkNotation)
                if m is not None:
                    if fact.context.isInstantPeriod:
                        year = fact.context.instantDatetime.year
                    elif fact.context.isStartEndPeriod:
                        year = fact.context.endDatetime.year
                    else:
                        continue
                    if fact.isNil:
                        factValue = None # no special handling of zeroes in the bar chart generator
                    else:
                        factValue = float(fact.value) * 100
                        if yMax < factValue:
                            yMax = factValue
                        if yMin > factValue:
                            yMin = factValue
                    factList += [(year, factValue)]
                else:
                    try:
                        self.filing.usedOrBrokenFactDefDict[fact].remove(self.embedding)
                    except KeyError:
                        pass

        if len(factList) == 0:
            return None
        factList = sorted(factList, key=lambda thing: thing[0]) # sorts by year

        from matplotlib.pyplot import figure, cm
        from matplotlib import __version__ as matplotlib__version__

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
            errorStr = Utils.printErrorStringToDisambiguateEmbeddedOrNot(self.embedding.factThatContainsEmbeddedCommand)
            self.filing.modelXbrl.error("EFM.6.26.08",
                                    _("In ''%(linkroleName)s'', the embedded report created by the fact %(fact)s with context "
                                      "%(contextID)s, there are %(numYears)s Annual Return Facts, but there must not be more than 20."),
                                    edgarCode="rq-2608-Too-Many-Annual-Return-Facts",
                                    modelObject=self.embedding.factThatContainsEmbeddedCommand,
                                    linkrole=self.cube.linkroleUri, linkroleDefinition=self.cube.definitionText,
                                    linkroleName=self.cube.shortName,
                                    fact=self.embedding.factThatContainsEmbeddedCommand.qname, contextID=self.embedding.factThatContainsEmbeddedCommand.contextID,
                                    numYears=numYears)
            return 'tooManyFacts'
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
        subplot = fig.add_subplot(111, xlim=xLim, ylim=yLim, autoscale_on=False,
                                  **{("axisbg", "facecolor")[matplotlib__version__ >= "2"]: wht})
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










class Row(object):
    # note that grouped has been removed
    #===========================================================================
    # def __init__(self, filing, report, startEndContext=None, index=None, factAxisMemberGroup=None,
    #              coordinateList=[], coordinateListWithoutPrimary=[], coordinateListWithoutUnit=[],
    #              coordinateListWithoutUnitPeriod=[], coordinateListWithoutUnitPeriodPrimary=[], groupedCoordinateList=[],
    #              isSegmentTitle=False, IsCalendarTitle=False, IsAbstractGroupTitle=False, elementQname=None, level=0):
    #===========================================================================
    def __init__(self, filing, report, startEndContext=None, index=None, factAxisMemberGroup=None,
                 coordinateList=[], coordinateListWithoutPrimary=[], coordinateListWithoutUnit=[],
                 coordinateListWithoutUnitPeriod=[], coordinateListWithoutUnitPeriodPrimary=[],
                 isSegmentTitle=False, IsCalendarTitle=False, IsAbstractGroupTitle=False, elementQname=None, level=0):
        self.filing = filing
        self.report = report
        if index is None:
            self.index = report.numRows
        self.report.numRows += 1
        self.report.numVisibleRows += 1
        self.factAxisMemberGroup = factAxisMemberGroup
        self.coordinateList = coordinateList
        self.coordinateListWithoutPrimary = coordinateListWithoutPrimary
        self.coordinateListWithoutUnit = coordinateListWithoutUnit
        self.coordinateListWithoutUnitPeriod = coordinateListWithoutUnitPeriod
        self.coordinateListWithoutUnitPeriodPrimary = coordinateListWithoutUnitPeriodPrimary
        #self.groupedCoordinateList = groupedCoordinateList
        self.headingList = []
        self.axisInSegmentTitleHeaderBoolList = []
        self.isSegmentTitle = isSegmentTitle
        self.IsCalendarTitle = IsCalendarTitle
        self.IsAbstractGroupTitle = IsAbstractGroupTitle
        self.factList = []
        self.level = level
        self.cellList = [None for ignore in range(report.numColumns)]
        self.footnoteNumberSet = set()
        self.originalElementQname = elementQname

        # this argument is just to get abstract element qnames for cube.isElements
        if elementQname is not None and report.embedding.rowPrimaryPosition != -1:
            self.elementQnameStr = str(elementQname).replace(':', '_')
        else:
            self.elementQnameStr = None

        self.preferredLabel = None
        if not (isSegmentTitle or IsAbstractGroupTitle or report.embedding.rowPrimaryPosition == -1 or factAxisMemberGroup.preferredLabel is None):
            self.preferredLabel = factAxisMemberGroup.preferredLabel
        self.isHidden = False
        self.startEndContext = startEndContext

        self.context = None
        if not (isSegmentTitle or IsAbstractGroupTitle):
            self.context = factAxisMemberGroup.fact.context
            if self.context == None and not validatedForEFM: # use Arelle validation message
                filing.modelXbrl.error("xbrl.4.6.1:itemContextRef",
                    _("Item %(fact)s in presentation group \"$(linkroleName)s\" must have a context"),
                    modelObject=factAxisMemberGroup.fact, fact=factAxisMemberGroup.fact.qname,
                    linkroleName=report.cube.shortName)

        self.unitTypeToFactSetDefaultDict = defaultdict(set)


    def hide(self):
        self.isHidden = True
        self.report.numVisibleRows -= 1


    def emitRow(self, index):
        rowETree = SubElement(self.report.rowsETree, 'Row', FlagID='0')
        self.emitRowHeader(rowETree, index)
        cellsETree = SubElement(rowETree, 'Cells')
        unlabeledSegmentTitle = self.isSegmentTitle and self.report.cube.isUnlabeled

        for i, col in enumerate(self.report.colList):
            if not col.isHidden:
                cell = self.cellList[i]
                # there are three possibilities. cell is None, cell is Nil, or the row is segment title and cube is unLabeled
                # in each of these three cases, we want to print a basically empty cell, with some caveats.
                # the third case is the weird case where unlabeled cuts off the Header of the row, so we have to put the header
                # into the first cell.  it's already there, we just have to print it.
                if cell is None or cell.fact is None or cell.fact.isNil: # write an empty cell
                    try:
                        # if cell is None or unlabeledSegmentTitle (cell.fact is None), then cell.fact.contextID will throw attribute error.
                        # only in third case, if there's a fact and it's nil, will it not throw an exception
                        contextID = cell.fact.contextID
                        isNil = True
                        unitId = cell.fact.unitID
                    except AttributeError:
                        isNil = False
                        contextID = unitId = ''

                    # lots of stuff here just to maintain compatibility with re2
                    cellETree = SubElement(cellsETree , 'Cell', FlagID='0', ContextID=contextID)
                    if unitId is not None and len(unitId) > 0: cellETree.set('UnitID',unitId)
                    SubElement(cellETree, 'Id').text = str(i+1)
                    SubElement(cellETree, 'IsNumeric').text = 'false'
                    SubElement(cellETree, 'IsRatio').text = str(isNil).casefold()
                    SubElement(cellETree, 'DisplayZeroAsNone').text = str(isNil).casefold()
                    SubElement(cellETree, 'NumericAmount').text = '0'
                    SubElement(cellETree, 'RoundedNumericAmount').text = '0'
                    if isNil:
                        SubElement(cellETree, 'NonNumbericText').text = ' ' # style sheet quirk
                    elif unlabeledSegmentTitle and i == 0:
                        SubElement(cellETree, 'NonNumbericText').text = cell.NonNumericText
                    else:
                        SubElement(cellETree, 'NonNumbericText')
                    if isNil:
                        self.report.writeFootnoteIndexerEtree(cell.footnoteNumberSet, cellETree)
                    else:
                        SubElement(cellETree, 'FootnoteIndexer')
                    if cell is not None and cell.fact is not None: # WCH 6/17/2016 nil numeric facts have units.
                        SubElement(cellETree, 'CurrencyCode').text = cell.currencyCode
                        SubElement(cellETree, 'CurrencySymbol').text = cell.currencySymbol
                    else:
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
        if self.elementQnameStr is not None and self.report.embedding.rowPrimaryPosition != -1:
            SubElement(rowETree, 'ElementName').text = self.elementQnameStr
            elementPrefix = self.elementQnameStr[:(self.elementQnameStr.find('_')+1)]
            SubElement(rowETree, 'ElementPrefix').text = elementPrefix
        elif len(self.factList) > 0         and self.report.embedding.rowPrimaryPosition != -1:
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

        # TODO: Accomodate cases where startLabel and endLabel are in not-fully-formed rollforward.
        SubElement(rowETree, 'IsBeginningBalance').text = str(Utils.isPeriodStartLabel(self.preferredLabel)).casefold()
        SubElement(rowETree, 'IsEndingBalance').text    = str(Utils.isPeriodEndLabel(self.preferredLabel)).casefold()
        SubElement(rowETree, 'IsReverseSign').text      = str(Utils.isNegatedLabel(self.preferredLabel)).casefold()
        if self.preferredLabel is not None:
            SubElement(rowETree, 'PreferredLabelRole').text = self.preferredLabel

        self.report.writeFootnoteIndexerEtree(self.footnoteNumberSet, rowETree)


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
                thedoclabel = concept.label(preferredLabel=arelle.XbrlConst.documentationLabel, fallbackToQname=False,lang=self.report.controller.labelLangs,linkrole=arelle.XbrlConst.defaultLinkRole)
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
                        if referencesText:
                            referencesText += '\n' # double space multiple references
                        referencesText += 'Reference '+str(i+1)+': '+role+'\n'
                        for e in ref.iter():
                            if e.text is not None:
                                text = e.text.strip()
                                if len(text)>0:
                                    referencesText += ' -'+e.localName+' '+text+'\n'

        SubElement(rowETree, 'ElementDataType').text = typeQname
        SubElement(rowETree, 'SimpleDataType').text = simpleDataType
        SubElement(rowETree, 'ElementDefenition').text = doclabel
        SubElement(rowETree, 'ElementReferences').text = referencesText
        SubElement(rowETree, 'IsTotalLabel').text = str(Utils.isTotalLabel(self.preferredLabel)).casefold()
        SubElement(rowETree, 'UnitID').text = '0' # really?
        SubElement(rowETree, 'Label').text = self.filing.rowSeparatorStr.join(self.headingList)

        if self.factAxisMemberGroup is not None: # could be an abstract row or something like that
            otherAxisOnRows = any(fam.pseudoAxisName not in {'period', 'unit', 'primary'} for fam in self.factAxisMemberGroup.factAxisMemberRowList)

            SubElement(rowETree, 'hasSegments').text = str(otherAxisOnRows).casefold()
            SubElement(rowETree, 'hasScenarios').text = 'false'

            # BEGIN MCU
            mcuETree = SubElement(rowETree, 'MCU')
            #SubElement(mcuETree, 'KeyName')

            if self.context is not None:
                if self.report.embedding.rowPeriodPosition != -1:
                    self.report.emitContextRef(mcuETree, self.factAxisMemberGroup.factAxisMemberRowList, self.context)
                elif otherAxisOnRows:
                    self.report.emitContextRef(mcuETree, self.factAxisMemberGroup.factAxisMemberRowList, None)

            if self.report.embedding.rowPrimaryPosition != -1 and self.factAxisMemberGroup.fact.unit is not None:
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











class Column(object):
    def __init__(self, filing, report, startEndContext, factAxisMemberGroup, coordinateList, coordinateListWithoutUnit, coordinateListWithoutUnitPeriod):
        self.filing = filing
        self.report = report
        self.index = report.numColumns
        self.report.numColumns += 1
        self.report.numVisibleColumns += 1
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
        if self.context is None: # wch added this check.
            errorStr = Utils.printErrorStringToDisambiguateEmbeddedOrNot(report.embedding.factThatContainsEmbeddedCommand)
            #message = ErrorMgr.getError('COLUMN_WITHOUT_CONTEXT_WARNING').format(report.cube.shortName, errorStr, self.index)
            filing.modelXbrl.debug("debug",
                                   _('In "%(cube)s%(error)s, column %(column)s has no context.'),
                                    modelObject=factAxisMemberGroup.fact,
                                    cube=report.cube.shortName, error=errorStr, column=self.index)
        self.startEndContext = startEndContext
        if self.startEndContext is None:
            errorStr = Utils.printErrorStringToDisambiguateEmbeddedOrNot(report.embedding.factThatContainsEmbeddedCommand)
            #message = ErrorMgr.getError('COLUMN_WITHOUT_CONTEXT_WARNING').format(report.cube.shortName, errorStr, self.index)
            filing.modelXbrl.debug("debug",
                                   _('In "%(cube)s%(error)s, column %(column)s has no startEndContext.'),
                                    modelObject=factAxisMemberGroup.fact,
                                    cube=report.cube.shortName, error=errorStr, column=self.index)
        self.unitTypeToFactSetDefaultDict = defaultdict(set)
        if report.embedding.columnPrimaryPosition != -1 and factAxisMemberGroup.preferredLabel is not None:
            self.preferredLabel = factAxisMemberGroup.preferredLabel
        else:
            self.preferredLabel = None


    def hide(self):
        self.isHidden = True
        self.report.numVisibleColumns -= 1


    def emitColumn(self, index):
        # this first clause of the if is because for the case of isUnlabeled, we have to move the value of the segment title row
        # into the first cell, in which case there is a cell with no fact, which will cause an attribute error.
        firstColOfAnUnlabeledCube = self.report.cube.isUnlabeled and index == 0

        colVector = self.report.generateCellVector('col', index)[1]

        columnETree = SubElement(self.report.columnsETree, 'Column', FlagID='0')
        SubElement(columnETree, 'Id').text = str(index+1)
        SubElement(columnETree, 'IsAbstractGroupTitle').text = 'false'
        SubElement(columnETree, 'LabelSeparator').text = ' '

        self.report.writeFootnoteIndexerEtree(self.footnoteNumberSet, columnETree)

        labelsETree = SubElement(columnETree, 'Labels')
        for index, header in enumerate(self.headingList):
            #SubElement(labelsETree, 'Label', Key='', Id=str(index), Label=str(header))
            SubElement(labelsETree, 'Label', Id=str(index), Label=str(header))

        otherAxisOnCols = any(fam.pseudoAxisName not in {'period', 'unit', 'primary'} for fam in self.factAxisMemberGroup.factAxisMemberColList)
        SubElement(columnETree, 'hasSegments').text = str(otherAxisOnCols).casefold()
        SubElement(columnETree, 'hasScenarios').text = 'false'

        mcuETree = SubElement(columnETree, 'MCU')

        if self.context is not None and not firstColOfAnUnlabeledCube:
            if self.report.embedding.columnPeriodPosition != -1:
                self.report.emitContextRef(mcuETree, self.factAxisMemberGroup.factAxisMemberColList, self.context)
            elif otherAxisOnCols:
                self.report.emitContextRef(mcuETree, self.factAxisMemberGroup.factAxisMemberColList, None)

        if self.report.embedding.columnPrimaryPosition != -1 and self.factAxisMemberGroup.fact.unit is not None:
            # the primary pseudoaxis is on the cols, so show the units for that fact
            self.report.emitUPS(mcuETree, self.factAxisMemberGroup.fact.unit)

        if self.report.embedding.columnUnitPosition != -1:
            # by design, there can only be one currency per column, if the unit axis is on the columns.
            for cell in colVector:
                if cell is not None and cell.showCurrencySymbol:
                    SubElement(columnETree, 'CurrencySymbol').text = cell.currencySymbol
                    break




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
        self.NonNumericText = NonNumericText
        if preferredLabel is None:
            self.preferredLabel = None
        else:
            self.preferredLabel = preferredLabel

        if      (fact is not None and
                 fact.isNumeric and
                 # not fact.isNil and # WCH 6/17/2016 numeric nil facts have units
                 fact.unit is not None and # unit can be none if there are xbrl2.1 or inline issues
                 (fact.concept.isMonetary or Utils.isFactTypeEqualToOrDerivedFrom(fact, Utils.isPerShareItemTypeQname))):

            # we do this weird call here because we know the type is either perShareDerivedType or monetaryDerivedType.  either way, we know numerator is monetary.
            numeratorMeasures = fact.unit.measures[0]
            if numeratorMeasures: # unit may be improperly formed
                self.currencyCode = numeratorMeasures[0].localName
            else:
                self.currencyCode = "" # unit may be improperly formed
            self.unitID = fact.unitID
            currencySymbol = fact.unitSymbol() or self.currencyCode
            if Utils.isFactTypeEqualToOrDerivedFrom(fact, Utils.isPerShareItemTypeQname):
                left, ignore, right = currencySymbol.partition(' / ')
                if right == 'shares':
                    currencySymbol = left
            self.currencySymbol = currencySymbol
            self.showCurrencySymbol = not fact.isNil # WCH 2016-06-17 numeric nil facts have units
        else:
            self.currencyCode = None
            self.unitID = None # we need to tell USD and USD/share apart.  otherwise they have the same currencySymbol and currencyCode.
            self.currencySymbol = None
            self.showCurrencySymbol = False


    def emitCell(self, cellsETree):
        fact = self.fact
        report = self.row.report
        ContextID = fact.contextID
        UnitID = fact.unitID or ''
        cellETree = SubElement(cellsETree , 'Cell', FlagID='0', ContextID=ContextID, UnitID=UnitID)
        SubElement(cellETree, 'Id').text = str(self.index)


        #########################################
        IsNumeric = fact.isNumeric
        IsRatio = False
        NumericAmount = ''
        valueStr = Utils.strFactValue(fact, preferredLabel=self.preferredLabel, filing=self.filing, report=report)
        if IsNumeric:
            IsRatio = Utils.isRate(fact, self.filing) # Rename to DisplayAsPercent
            NumericAmount = valueStr
        elif fact.concept.isTextBlock:
            self.NonNumericText = valueStr
        else: # don't allow anything else to look like tags.
            self.NonNumericText = valueStr.replace('<','&lt;')
        SubElement(cellETree, 'IsNumeric').text = str(IsNumeric).casefold()
        SubElement(cellETree, 'IsRatio').text = str(IsRatio).casefold()

        dataTypeSet = {'NonNegativePure4Type', 'NonPositivePure4Type', 'pureItemType', 'NonNegativeMonetaryType', 'NonPositiveMonetaryType'}
        SubElement(cellETree, 'DisplayZeroAsNone').text = str(self.filing.isRRorOEF and fact.concept.typeQname.localName in dataTypeSet).casefold()

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
        self.handleEmbeddedReport(report, cellETree)
        #########################################


        #########################################
        displayDateInUSFormatBool = re.compile('[0-9]{4}-[0-9]{2}-[0-9]{2}').match(self.NonNumericText) is not None
        SubElement(cellETree, 'DisplayDateInUSFormat').text = str(displayDateInUSFormatBool).casefold()



    def handleEmbeddedReport(self, report, cellETree):
        # we check for cube.isElements because we don't want to actually render this embedding in that case.  also, if the fact is
        # uncategorized, it's isElements, and again we don't want to actually embed this report into the R9999 file.
        if self.filing.disallowEmbeddings or not self.fact.concept.isTextBlock or report.cube.isElements:
            return
        try:
            embedding = self.filing.factToEmbeddingDict[self.fact]
            # first check makes sure an embedding isn't embedding itself.  it can happen.  The second check
            # could throw AttributeError if any of it has been garbage collected already
            if embedding.cube == report.cube or embedding.cube.noFactsOrAllFactsSuppressed:
                return
        except (KeyError, AttributeError):
            return

        # now we process this embedding and stick it in where it belongs
        # since embedding is not report.embedding, we know embedding.cube is not report.cube, it's the cube
        # that this embedding belongs to and report.cube is the report that embedding.report will be embedded into.

        self.filing.embeddingDriverBeforeFlowThroughSuppression(embedding)
        if not embedding.isEmbeddingOrReportBroken:
            # the second arg is None because we don't generate excel files for filings with embeddings.
            self.filing.reportDriverAfterFlowThroughSuppression(embedding, None)
            self.insertEmbeddingOrBarChartEmbeddingIntoETree(embedding, cellETree)
            # we've embedded this cube, so we're good, but if this cube was never embedded, we need to
            # print it out later, so we have this set of cubes.
            try:
                self.filing.embeddedCubeSet.remove(embedding.cube)
            except KeyError:
                pass
        # here we garbage collect the embedding and leave the cube alone, we still might need it, not worth it to handle.
        Utils.embeddingGarbageCollect(embedding)



    def handleScalingAndPrecision(self, IsNumeric, NumericAmount):
        if IsNumeric and len(NumericAmount) > 0:
            if self.scalingFactor is not None and self.scalingFactor != 0:
                # note the rounding here.  ROUND_HALF_EVEN means:
                # 100500 with decimals =-3 gets rounded to 100
                # 101500 with decimals =-3 gets rounded to 102
                # 100501 with decimals =-3 gets rounded to 101
                # it doesn't round the 100500 up because it only rounds to an even.  in the case of 101500 it rounds it up
                # to 102 because 2 is even.  strange, but this is the new standard and is the way things are done these days.
                quantum = getattr(self,'quantum',1)
                amount = None
                try:
                    amount = decimal.Decimal(NumericAmount)
                    scaledNumericAmount = str(amount.scaleb(self.scalingFactor).quantize(decimal.Decimal(quantum), rounding=decimal.ROUND_HALF_EVEN))
                except decimal.InvalidOperation:
                    self.filing.modelXbrl.debug("debug",
                                           _('Unable to scale value "%(value)s" by scaling factor %(scalingFactor)s.'),
                                            modelObject=self.fact, value=NumericAmount, scalingFactor=self.scalingFactor)
                    return (NumericAmount,float('nan'))
                return (NumericAmount, scaledNumericAmount)
            else:
                return (NumericAmount, NumericAmount)
        else:
            return (0, 0) # re2 compatibility


    def insertEmbeddingOrBarChartEmbeddingIntoETree(self, embedding, cellETree):
        report = self.row.report
        report.hasEmbeddedReports = True

        EmbeddedReport = SubElement(cellETree, 'EmbeddedReport')

        if embedding.cube.isBarChart:
            fig = embedding.report.generateBarChart()
            if fig == 'tooManyFacts':
                pass
            elif fig is None:
                errorStr = Utils.printErrorStringToDisambiguateEmbeddedOrNot(embedding.factThatContainsEmbeddedCommand)
                #message = ErrorMgr.getError('FIGURE_HAS_NO_FACTS_WARNING').format(embedding.cube.shortName, errorStr)
                self.filing.modelXbrl.warning("EFM.6.26.07",
                                        _("In ''%(linkroleName)s'', the embedded report created by the fact %(fact)s with context %(contextID)s, "
                                          "is a bar chart figure that has zero facts. If a bar chart figure is not wanted here, "
                                          "consider removing the text block fact; otherwise, determine why all its facts are being filtered out."),
                                        edgarCode="rq-2607-Bar-Chart-Has-No-Facts",
                                        modelObject=embedding.factThatContainsEmbeddedCommand,
                                        linkrole=embedding.cube.linkroleUri, linkroleDefinition=embedding.cube.definitionText,
                                        linkroleName=embedding.cube.shortName, fact=embedding.factThatContainsEmbeddedCommand.qname,
                                        contextID=embedding.factThatContainsEmbeddedCommand.contextID)
            else:
                report.controller.nextBarChartFileNum += 1
                pngname = 'BarChart{!s}.png'.format(report.controller.nextBarChartFileNum)
                self.filing.controller.supplementalFileList += [pngname]

                self.filing.controller.logDebug('Writing Figures= ' + pngname)

                if self.filing.reportZip or self.filing.fileNameBase is not None:
                    file = io.BytesIO()
                    self.filing.controller.renderedFiles.add(pngname)
                    fig.savefig(file, bbox_inches='tight', dpi=150)
                    file.seek(0)
                    if self.filing.reportZip:
                        self.filing.reportZip.writestr(pngname, file.read())
                    else:
                        self.filing.controller.writeFile(os.path.join(self.filing.fileNameBase, pngname), file.read())
                    file.close()
                    del file  # dereference
                from matplotlib import pyplot
                pyplot.close(fig)
                self.filing.controller.logDebug('Barchart {} inserted into {} Generated Figures={}'.format(
                                         embedding.cube.linkroleUri, report.cube.linkroleUri, report.controller.nextBarChartFileNum))

                SubElement(EmbeddedReport, 'BarChartImageFileName').text = pngname
        else:
            SubElement(EmbeddedReport, 'BarChartImageFileName')

        SubElement(EmbeddedReport, 'EmbedInstruction')
        SubElement(EmbeddedReport, 'IsTransposed').text = str(self.row.report.cube.isTransposed).casefold()
        SubElement(EmbeddedReport, 'Role')
        EmbeddedReport.append(embedding.report.rootETree)






















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
#                             totalLabel = self.filing.memberDict[factAxisMember.member].arelleConcept.label(preferredLabel = Utils.totalRole,lang=self.filing.controller.labelLangs)
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