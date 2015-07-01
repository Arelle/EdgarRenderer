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

startRoles = ['http://www.xbrl.org/2003/role/periodStartLabel', 'http://www.xbrl.org/2009/role/negatedPeriodStartLabel']
endRoles = ['http://www.xbrl.org/2003/role/periodEndLabel', 'http://www.xbrl.org/2009/role/negatedPeriodEndLabel']
startEndRoles = startRoles + endRoles
totalRole = 'http://www.xbrl.org/2003/role/totalLabel'
durationStartRole = "durationStartRoleError"  # fake role URI to indicate that a periodStart label role was put on a duration concept.
durationEndRole = "durationEndRoleError"  # fake role URI to indicate that a periodEnd label role was put on a duration concept.
durationStartEndRoles = [durationStartRole, durationEndRole]
minNumber = -sys.maxsize - 1
efmStandardAuthorities = ["sec.gov", "fasb.org", "xbrl.org", "xbrl.us", "w3.org"]


def isRate(fact, filing):
    return   (isFactTypeEqualToOrDerivedFrom(fact, isPercentItemTypeQname) or
             (isFactTypeEqualToOrDerivedFrom(fact, isPureItemTypeQname) and
                (isEfmInvestNamespace(fact.qname.namespaceURI) or filing.isRR)) or
             (fact.unit.isSingleMeasure and any(utrEntry.unitId == 'Rate' for utrEntry in fact.utrEntries.copy())))

def isRoleOrSuffix(s,roles):
    return ((s in roles
            or next((True for role in roles if s == role[(role.rfind("/") + 1):]), False))
            and True)


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
        if not any(cell.fact.value != '' or cell.fact.isNil for cell in row.cellList if cell is not None and not cell.column.isHidden):
            row.isHidden = True


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
isEfmStandardNamespaceRegex = re.compile('^http(s)?://.*(' + "|".join(efmStandardAuthorities) + ")/.*")
isEfmInvestNamespaceRegex = re.compile('^http(s)?://.*(' + "|".join(efmStandardAuthorities) + ")/invest.*")

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
    for a in ('measures', 'namespaceURI', 'namespaceUri'):
        if hasattr(thing, a):
            return hasCustomNamespace(getattr(thing, a))
    raise "Unexpected object {} type {}.".format(thing, type(thing))
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

def handleDurationItemType(fact):
    # we are assuming that this value is xml valid, if it's not, there will be a validation error.
    if fact.isNil:
        return ''
    outStr = ''
    valueStr = fact.value.strip() # TODO, if we use fact.xValue, we probably don't need to strip it?
    if valueStr[0] == '-':
        valueStr = valueStr[1:]  # get rid of leading -
        outStr = 'minus '
    valueStr = valueStr[1:]  # get rid of leading 'P'

    beforeT, ignore, afterT = valueStr.partition('T')

    if beforeT != '':
        beforeT, outStr = handleDurationItemTypeHelper(beforeT, outStr, 'Y', 'year')
        beforeT, outStr = handleDurationItemTypeHelper(beforeT, outStr, 'M', 'month')
        beforeT, outStr = handleDurationItemTypeHelper(beforeT, outStr, 'D', 'day')

    if afterT != '':
        afterT, outStr = handleDurationItemTypeHelper(afterT, outStr, 'H', 'hour')
        afterT, outStr = handleDurationItemTypeHelper(afterT, outStr, 'M', 'minute')
        afterT, outStr = handleDurationItemTypeHelper(afterT, outStr, 'S', 'second')

    return outStr[:-1]  # remove trailing space

def handleDurationItemTypeHelper(valueStr, outStr, separator, printStr):
    duration, separator, remainder = valueStr.partition(separator)
    if separator != '':
        if int(duration) > 1:
            return (remainder, '{}{} {}s '.format(outStr, duration, printStr))
        elif int(duration) == 1:
            return (remainder, '{}{} {} '.format(outStr, duration, printStr))
        else:  # durationInt == 0
            return (remainder, outStr)
    return (valueStr, outStr)  # the string didn't contain the separator.


def strFactValue(fact, preferredLabel=None):
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
    elif fact.concept.typeQname.localName == 'durationItemType':
        return handleDurationItemType(fact)
    else:  # don't try to handle qnames here.
        return valueStr

def prettyPrintQname(localName):
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

def modelRelationshipsTransitiveFrom(relationshipSet, concept, linkroleUri, result=set()):
    """Return the subset of a relationship set in the transitive closure starting from concept, limited to linkroleUri."""
    for r in relationshipSet.modelRelationshipsFrom[concept]:
        if r.linkrole == linkroleUri and r not in result:
            result.add(r)
            modelRelationshipsTransitiveFrom(relationshipSet,r.toModelObject,linkroleUri,result)
    return result


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
