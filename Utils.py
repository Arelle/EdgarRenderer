# -*- coding: utf-8 -*-
"""
:mod:`EdgarRenderer.Utils`
~~~~~~~~~~~~~~~~~~~
Edgar(tm) Renderer was created by staff of the U.S. Securities and Exchange Commission.
Data and content created by government employees within the scope of their employment
are not subject to domestic copyright protection. 17 U.S.C. 105.
"""
import re, sys, math, logging
import arelle.XbrlConst

durationStartRoleError = "durationStartRoleError"  # fake role URI to indicate that a periodStart label role was put on a duration concept.
durationEndRoleError = "durationEndRoleError"  # fake role URI to indicate that a periodEnd label role was put on a duration concept.
durationStartEndRolesError = [durationStartRoleError, durationEndRoleError]

def isPeriodStartLabel(preferredLabel):
    if preferredLabel is None:
        return False
    return 'periodstart' in preferredLabel.casefold()
def isPeriodEndLabel(preferredLabel):
    if preferredLabel is None:
        return False
    return 'periodend' in preferredLabel.casefold()
def isPeriodStartOrEndLabel(preferredLabel):
    if preferredLabel is None:
        return False
    preferredLabelLower = preferredLabel.casefold()
    return 'periodstart' in preferredLabelLower or 'periodend' in preferredLabelLower
def isNegatedLabel(preferredLabel):
    if preferredLabel is None:
        return False
    return 'negated' in preferredLabel.casefold()
def isTotalLabel(preferredLabel):
    if preferredLabel is None:
        return False
    return 'total' in preferredLabel.casefold()

minNumber = -sys.maxsize - 1
efmStandardAuthorities = ["sec.gov", "fasb.org", "xbrl.org", "xbrl.us", "w3.org", "ifrs.org"]


def isRate(fact, filing):
    return   (isFactTypeEqualToOrDerivedFrom(fact, isPercentItemTypeQname) or
             (isFactTypeEqualToOrDerivedFrom(fact, isPureItemTypeQname) and
                (isEfmInvestNamespace(fact.qname.namespaceURI) or filing.isRRorOEF)) or
             (fact.unit is not None and fact.unit.isSingleMeasure and
              any(utrEntry.unitId == 'Rate' for utrEntry in fact.utrEntries.copy())))

def printErrorStringToDisambiguateEmbeddedOrNot(embeddedCommandFact):
    if embeddedCommandFact is None:
        return ''
    return ', in the embedded report created by the embedding textBlock fact {!s}, with the context {!s}'.format(
                                                    embeddedCommandFact.qname, embeddedCommandFact.contextID)

def printErrorStringToDiscribeEmbeddedTextBlockFact(embeddedCommandFact):
    if embeddedCommandFact is None:
        return ''
    return 'the embedded commands of the textBlock fact {!s}, with the context {!s}'.format(
                                                    embeddedCommandFact.qname, embeddedCommandFact.contextID)


def hideEmptyRows(rowList):
    for row in rowList:
        if not any(cell.fact.isNil or cell.fact.value != '' for cell in row.cellList if cell is not None and not cell.column.isHidden):
            row.hide()


def booleanFromString(x):
    if x is None:
        return False
    elif isinstance(x, bool):
        return x
    else:
        return (x.casefold() == "true")

isImageRegex = re.compile('.*\.(jpg|gif|png)$')
isXmlRegex = re.compile('.*\.x(ml|sd)')
isEfmRegex = re.compile('.*[0-9]{8}((_(cal|def|lab|pre))?\.xml|\.xsd)$')
isInlineRegex = re.compile('.*\.htm$')
isZipRegex = re.compile('.*\.zip$')
isHttpRegex = re.compile('^http(s)?://.*')
isSecNamespaceRegex = re.compile('^http(s)?://xbrl.sec.gov/.*')
isEfmStandardNamespaceRegex = re.compile('^http(s)?://.*(' + "|".join(efmStandardAuthorities) + ")/.*")
isEfmInvestNamespaceRegex = re.compile('^http(s)?://.*(' + "|".join(efmStandardAuthorities) + ")/invest.*")
isBarChartFactRegex = re.compile('^\{http://xbrl.sec.gov/(?P<family>rr|oef)/.*\}AnnualReturn(?P<year>[0-9]{4})')

def isImageFilename(path):
    return isImageRegex.match(path) and True

def isXmlFilename(path):
    return isXmlRegex.match(path) and True

def isEfmFilename(path):
    return isEfmRegex.match(path) and True

def isInlineFilename(path):
    return isInlineRegex.match(path) and True

def isZipFilename(path):
    return isZipRegex.match(path) and True

def isHttpFilename(path):
    return isHttpRegex.match(path) and True

def isEfmStandardNamespace(namespaceUri):
    return isEfmStandardNamespaceRegex.match(namespaceUri) and True

def isEfmInvestNamespace(namespaceUri):
    return isEfmInvestNamespaceRegex.match(namespaceUri) and True

def matchedDurationRoles(role1, role2):  # True if the roles are both period start or are both period end roles.
    if 'Start' in role1 and 'Start' in role2:
        return True
    if 'End' in role1 and 'End' in role2:
        return True
    return False

def hasCustomNamespace(thing):
    if type(thing) == str:
        return not isEfmStandardNamespace(thing)
    elif type(thing) in [list, tuple]:
        return next((True for x in thing if hasCustomNamespace(x)), False) and True
    elif thing is not None:
        for a in ('measures', 'namespaceURI', 'namespaceUri'):
            if hasattr(thing, a):
                return hasCustomNamespace(getattr(thing, a))
    return False

def xbrlErrors(modelXbrl):
    """Returns the list of messages in modelXbrl whose levelno is at least ERROR, assuming there is a buffer handler present."""
    try:
        handler =  modelXbrl.logger.handlers[-1]
        return [r for r in handler.logRecordBuffer if r.levelno >= logging.ERROR]
    except: return []

def getUnitStr(fact):
    if fact.unit is None:
        return ('', False)
    if (fact.unit.value).find(':') == -1:  # if unit.value doesn't give a qname
        unitStr = fact.unit.value
    else:  # if unit.value does give a qname, use something else
        unitStr = fact.unitSymbol()
    return (unitStr, 'pure' in unitStr.casefold())

def getUnitAndSymbolStr(fact):
    if fact is not None and fact.unit is not None:
        if not fact.unit.isSingleMeasure:
            symbolStr = fact.unitSymbol()
            if symbolStr != '':
                return symbolStr
        unitStr, pureBool = getUnitStr(fact)
        if not pureBool:
            symbolStr = fact.unitSymbol()
            if unitStr == symbolStr:
                return unitStr
            if symbolStr != '':
                return '{} ({})'.format(unitStr, symbolStr)

def getSymbolStr(fact):
    if fact is not None and fact.unit is not None:
        symbolStr = fact.unitSymbol() or fact.unitID
        if 'pure' not in symbolStr:
            return symbolStr


def handleDuration(valueStr):
    # if value "P10Y" it will output "10 years".
    # if value "P10Y to P12Y", we output "10 years to 12 years"

    def durationPrettyPrint(matchObj):
        from decimal import Decimal
        orderedList = [(None if matchObj.group('y') is None else Decimal(matchObj.group('y')), 'year'), \
                       (None if matchObj.group('mon') is None else Decimal(matchObj.group('mon')), 'month'), \
                       (None if matchObj.group('d') is None else Decimal(matchObj.group('d')), 'day'), \
                       (None if matchObj.group('h') is None else Decimal(matchObj.group('h')), 'hour'), \
                       (None if matchObj.group('min') is None else Decimal(matchObj.group('min')), 'minute'), \
                       (None if matchObj.group('s') is None else Decimal(matchObj.group('s')), 'second')]

        # this section is to inteligently handle zeros.  if a duration has a zero and other numbers, ignore the zeros.
        # So, P0Y1M is just one month.  if they're all zeros, just print the biggest so P0Y0M and P0Y both print 0 years.
        numStrsSet = {tup[0] for tup in orderedList}
        allZeroOrNone = numStrsSet <= {Decimal(0), None}
        someZeroSomeNot = not allZeroOrNone and Decimal(0) in numStrsSet
        if allZeroOrNone or someZeroSomeNot:
            startChangingZeroToNone = someZeroSomeNot
            for i, (num, text) in enumerate(orderedList):
                if num == Decimal(0):
                    if startChangingZeroToNone:
                        orderedList[i] = (None, text)
                    else:
                        startChangingZeroToNone = True

        if matchObj.group('minus') == '-':
            output = 'minus '
        else:
            output = ''
        for num, text in orderedList:
            if num is not None:
                output += '{} {}{} '.format(str(num), text, '' if num == Decimal(1) else 's')
        return output[:-1]  # remove trailing space

    # this huge regex parses an xs:duration type, and pulls out what we want by name.

    # first notice that years, months, days, hours, minutes are all integers, but seconds can have a decimal place.
    # makes sense, since the remainder of the prior can all spill down the waterfall, but seconds is as low as you
    # can go. so we have to treat seconds specially.

    # look-ahead's don't "consume" characters like regular regex's.  they basically start at the current position
    # of the consumption and check that a condition ahead is satisfied, so pay special attention to where they are inserted.

    # lookAhead1 makes sure we can't have just 'P' or '-P', because otherwise the regex allows that, since everything in the
    # regex besides 'P' has a '?' after it, meaning that it may or may not actually be there.  so, lookAhead1 says that
    # something needs to follow P.

    # lookAhead2 makes sure that something comes after T, because again in the non-look-ahead part of the regex,
    # everything after T is optional.

    # so lookahead 1 and 2 are basically conditions, and the rest of the regex actually consumes the xs:duration pattern.

    lookAhead1 = '(?=(\d+Y|\d+M|\d+D|T\d+H|T\d+M|T(\d+|\d+\.\d+)S))'
    lookAhead2 = '(?=(\d+H|\d+M|(\d+|\d+\.\d+)S))'
    beforeT = '(?P<minus>-?)P' + lookAhead1 + '((?P<y>\d+)Y)?((?P<mon>\d+)M)?((?P<d>\d+)D)?'
    TAndAfter = '(T' + lookAhead2 + '((?P<h>\d+)H)?((?P<min>\d+)M)?((?P<s>\d+|\d+\.\d+)S)?)?'

    # probably don't need to strip with fact.xValue?
    return re.sub(re.compile(beforeT + TAndAfter), durationPrettyPrint, valueStr.strip())


def strFactValue(fact, preferredLabel=None, filing=None, report=None):
    if fact.isNil:
        return ''
    valueStr = fact.value

    if fact.isNumeric:
        if preferredLabel is not None and 'negated' in preferredLabel:
            if valueStr == '':
                return ''
            if valueStr[0] == '-':  # we're making it a negative
                return valueStr[1:]  # already a negative, make it positive
            elif valueStr != '0':  # we don't want a negative zero.
                return '-' + valueStr  # positive, make it negative
        else:
            return valueStr

    # handle labels of one or more qname values in a fact.
    if filing is not None and report is not None:
        try:
            labels = []
            qnamesToGetTheLabelOf = filing.factToQlabelsDict[fact]
            for qname in qnamesToGetTheLabelOf:
                label = None
                if qname in report.cube.labelDict:
                    label = report.cube.labelDict[qname]
                else:
                    concept = filing.modelXbrl.qnameConcepts[qname]
                    label = None
                    if preferredLabel: # first look for a prefferred label, if specified
                        label = concept.label(preferredLabel, fallbackToQname=False, lang=filing.controller.labelLangs)
                    if not label: # find standard label or qname if none
                        label = concept.label(lang=filing.controller.labelLangs)
                labels.append(label)
            return ", ".join(labels)
        except KeyError:
            pass

    if     (isFactTypeEqualToOrDerivedFrom(fact, isDurationItemTypeQname) or
            isFactTypeEqualToOrDerivedFrom(fact, isDurationStringItemTypeQname)):
        return handleDuration(valueStr)

    return valueStr


def prettyPrintQname(localName):
    # \g<1> will match to the char that matched ([a-z]) and similarly for \g<2>.
    return re.sub('([a-z])([A-Z0-9])', '\g<1> \g<2>', localName)


def isTypeQnameDerivedFrom(modelXbrl, typeQname, predicate):
    if typeQname is None: return False
    if predicate(typeQname): return True
    if typeQname not in modelXbrl.qnameTypes: return False  # we reached the root
    modelType = modelXbrl.qnameTypes[typeQname]
    qnamesDerivedFrom = modelType.qnameDerivedFrom  # can be single qname or list of qnames if union
    if qnamesDerivedFrom is None: return False
    if isinstance(qnamesDerivedFrom, list):  # union
        return next((True for q in qnamesDerivedFrom if predicate(q)), False)
    return isTypeQnameDerivedFrom(modelXbrl, qnamesDerivedFrom, predicate)

def isFactTypeEqualToOrDerivedFrom(fact, predicate):
    if fact is None or fact.concept is None: return False
    conceptTypeQname = fact.concept.typeQname
    return (predicate(conceptTypeQname) or isTypeQnameDerivedFrom(fact.modelXbrl, conceptTypeQname, predicate))


def isPerShareItemTypeQname(typeQname):
    """(bool) -- True if the type qname is {standard namespace}perShareItemType"""
    return typeQname.localName == 'perShareItemType' and isEfmStandardNamespace(typeQname.namespaceURI)

def isPercentItemTypeQname(typeQname):
    """(bool) -- True if the type qname is {standard namespace}percentItemType"""
    return typeQname.localName == 'percentItemType' and isEfmStandardNamespace(typeQname.namespaceURI)

def isDurationStringItemTypeQname(typeQname):
    """(bool) -- True if the type qname is xbrli:durationStringItemType"""
    return typeQname.localName == 'durationStringItemType' and isEfmStandardNamespace(typeQname.namespaceURI)

def isPureItemTypeQname(typeQname):
    """(bool) -- True if the type qname is xbrli:perShareItemType"""
    return typeQname.localName == 'pureItemType' and typeQname.namespaceURI == arelle.XbrlConst.xbrli

def isDurationItemTypeQname(typeQname):
    """(bool) -- True if the type qname is xbrli:durationItemType"""
    return typeQname.localName == 'durationItemType' and typeQname.namespaceURI == arelle.XbrlConst.xbrli

def modelRelationshipsTransitiveFrom(relationshipSet, concept, linkroleUri, resultSet):
    """Return the subset of a relationship set in the transitive closure starting from concept, limited to linkroleUri."""
    for r in relationshipSet.modelRelationshipsFrom[concept]:
        if r.linkrole == linkroleUri and r not in resultSet:
            resultSet.add(r)
            modelRelationshipsTransitiveFrom(relationshipSet,r.toModelObject,linkroleUri,resultSet)
    return resultSet


def heapsort(l, cmp):  # l is a list, cmp is a two-argument fn
    n = len(l)
    if n < 2:
        return l
    m = math.floor(n / 2)
    ll = heapsort(l[:m], cmp)
    ul = heapsort(l[m:], cmp)
    nl = []  # New list
    i = 0
    j = 0
    while True:  # merge the sublists known to be sorted
        c = cmp(ll[i], ul[j])
        if c < 0:  # ul is before ll, consume one from ul
            nl += [ul[j]]
            j += 1
        elif c == 0:  # ll equals ul, preserve their relative order
            nl += [ll[i], ul[j]]
            i += 1
            j += 1
        else:  # ll is before ul, consume one from ll
            nl += [ll[i]]
            i += 1
        if i == len(ll):  # at the end of ll, append rest of ul
            nl += ul[j:]
            break
        if j == len(ul):  # at the end of ul, append rest of ll
            nl += ll[i:]
            break
    return nl

def compareInOrdering(x, y, l, o):
    if x in o:
        return -1
    try:  # return -1 if x comes after y in list l, otherwise return 0
        tail = l[l.index(y) + 1:]  # tail is what comes after y
        if x in tail:
            return -1
    except:
        pass
    return 0

def commonPrefix(str1, str2):  # count characters that form the prefix of both str1 and str2
    i = 0
    for c in str1:
        if len(str2) > i:
            if str2[i] == c:
                i += 1
            else:
                break
        else:
            break
    return i

def cubeGarbageCollect(cube):
    # all of the cube's embeddings are gone already, so we can kill the cube and presentationGroup.
    cube.presentationGroup.__dict__.clear()
    cube.__dict__.clear()


def embeddingGarbageCollect(embedding):
    try:
        report = embedding.report
    except AttributeError:
        return # it's already been garbage collected.
    if report is not None:  # could be if broken
        for row in report.rowList:
            for cell in row.cellList:
                if cell is not None:
                    cell.__dict__.clear()
            row.__dict__.clear()
        for col in report.colList:
            col.__dict__.clear()
        report.__dict__.clear()
    embedding.__dict__.clear()

class RenderingException(Exception):
    def __init__(self, code, message):
        self.code = str(code)  # called with qname or string, qname -> prefixed name string
        self.message = message
        self.args = ( self.__repr__(), )
    def __repr__(self):
        return _('[{0}] exception {1}').format(self.code, self.message)

class Errmsg(object):
    def __init__(self, messageCode, message):
        self.msgCode = messageCode
        self.msg = message


