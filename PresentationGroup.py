# -*- coding: utf-8 -*-
"""
:mod:`EdgarRenderer.PresentationGroup`
~~~~~~~~~~~~~~~~~~~
Edgar(tm) Renderer was created by staff of the U.S. Securities and Exchange Commission.
Data and content created by government employees within the scope of their employment
are not subject to domestic copyright protection. 17 U.S.C. 105.
"""

from collections import defaultdict
from . import Utils
import arelle.XbrlConst


class PresentationGroupNode(object):
    def __init__(self, arelleConcept, arelleRelationship, mayBeUnitConcept, typedValue=None):
        self.arelleConcept = arelleConcept
        self.arelleRelationship =  arelleRelationship
        self.childrenList = [] # lists can be ordered and have duplicates, which is good

        # units can be ordered by the presentation group.  the reason that this particular node "MAY" or may not be a unit ordering is because at the time
        # we are traversing this graph, we don't yet have all of the facts that will be in this cube.  therefore, we can only check if this node references a
        # unit in the whole document, but not yet if it's a unit that is actually used in the cube.  so until we know, we say it may be for a unit ordering.
        self.mayBeUnitConcept = mayBeUnitConcept
        self.typedValue = typedValue

    def __str__(self):
        if self.TypedValue is not none:
            return "[typedValue: {} with {!s} children]".format(self.typedValue, self.arelleRelationship.preferredLabel, len(self.childrenList))
        return "[{} {} with {!s} children]".format(self.arelleConcept.qname, self.arelleRelationship.preferredLabel, len(self.childrenList))


class PresentationGroup(object):
    def __init__(self, filing, cube):
        self.filing = filing
        self.cube = cube
        self.rootNodeList = []
        self.linkRelationshipSet = self.filing.modelXbrl.relationshipSet(arelle.XbrlConst.parentChild, self.cube.linkroleUri)
        self.unitOrdering = []
        self.relationshipToChildNodeDict = {}

    def __str__(self):
        return "[{} has {!s} relationships]".format(self.cube.linkroleUri, len(self.linkRelationshipSet))


    def sortRootNodeListByLabel(self):
        if len(self.rootNodeList) == 1:
            return
        # it helps to have a canonical root node order, even if it is arbitrary.
        # the "or ''" at the end of the below statement is in case the concept doesn't have a label and returns None, can't sort like that.
        self.rootNodeList = sorted(self.rootNodeList, key = lambda thing : thing.arelleConcept.label(lang=self.filing.controller.labelLangs) or '')


    # this function builds a graph of all the uncategorized facts and all of their respective axes and members.
    def generateUncategorizedFactsPresentationGroup(self):
        # add all the axes and all their members below them, order isn't important
        for axis in self.cube.hasAxes.values():
            axisConcept = axis.arelleConcept
            rn = PresentationGroupNode(axisConcept, None, False)
            self.rootNodeList += [rn]
            self.buildLabel(axisConcept)

            giveMemGetPositionDict = {}
            default = axis.defaultArelleConcept
            if default is not None:
                rn.childrenList += [PresentationGroupNode(default, None, False)]
                self.buildLabel(default)
                giveMemGetPositionDict[default.qname] = 0 # put default first by giving it lowest order

            # sort the axes members by their Member object (built-in) sort order
            for i, member in enumerate(sorted(axis.hasMembers)):
                if member.arelleConcept is not None: # explicit
                    concept = member.arelleConcept
                    rn.childrenList += [PresentationGroupNode(concept, None, False)]
                    self.buildLabel(concept)
                    giveMemGetPositionDict[member.memberValue] = i + 1 # add one to be bigger than the zero for the default
                else:
                    rn.childrenList += [PresentationGroupNode(None, None, False, member.memberValue)]
                    giveMemGetPositionDict[member.memberValue] = i + 1
            self.cube.axisAndMemberOrderDict[axisConcept.qname] = (giveMemGetPositionDict, Utils.minNumber)

        # add all the elements too
        giveMemGetPositionDict = defaultdict(list)
        for i, (qname, element) in enumerate(self.filing.elementDict.items()):
            self.rootNodeList += [PresentationGroupNode(element.arelleConcept, None, False)]
            giveMemGetPositionDict[qname].append((i, None))

        self.cube.axisAndMemberOrderDict['primary'] = (giveMemGetPositionDict, None)

        self.sortRootNodeListByLabel()



    # here we aim to build a subgraph of the presentation graph we are given.  this is because the given graph might be sparsely used.
    # by going directly only to the concepts we know we need, and then traversing up to the root to make a connected subgraph, we can
    # minimize the exploration of uneeded nodes.
    def traverseToRootOrRoots(self, concept, relationship, childConcept, passUpNode, localRelationshipSet):
        if relationship is not None:
            # this is to catch directed cycles.  each time filing calls this function it will have an empty
            # localRelationshipSet.  we can't use a global repository of relationships like relationshipToChildNodeDict
            # because the way this function is called by the filing class, it is ok if it goes over the same relationship
            # twice.  however, if it goes over the same relationship twice on it's way to the root, then there is a cycle.
            # in fact, this will catch every possible cycle in our subgraph, we don't care about cycles outside of our subgraph.
            if relationship in localRelationshipSet and concept is not None:
                if not self.filing.validatedForEFM:
                    #message = ErrorMgr.getError('PRESENTATION_GROUP_DIRECTED_CYCLE_ERROR').format(self.cube.shortName)
                    self.filing.modelXbrl.error("xbrl.5.2.4.2",
                        _("Relationships have a %(cycle)s cycle in arcrole %(arcrole)s \nlink role %(linkrole)s \nlink %(linkname)s, \narc %(arcname)s, \npath %(path)s"),
                        modelObject=relationship, cycle="directed", arcrole=arelle.XbrlConst.parentChild, arcname=arelle.XbrlConst.qnLinkPresentationArc, linkname=arelle.XbrlConst.qnLinkPresentationLink,
                        path = str(concept.qname) + " " + " - ".join(
                            "{0}:{1} {2}".format(rel.modelDocument.basename, rel.sourceline, rel.toModelObject.qname)
                            for rel in reversed(localRelationshipSet)
                            if rel.toModelObject is not None),
                        linkrole=self.cube.linkroleUri)
                raise Utils.RenderingException("xbrl.5.2.4.2", "Presentation group {} contains a directed cycle".format(self.cube.shortName))
            localRelationshipSet.append(relationship)

            try:
                # let's see if we've already visited this relationship
                nodeFromDict = self.relationshipToChildNodeDict[relationship]
                # if we get here, we have already vistied this relationship, in which case we'll maybe add
                # a child to an existing node and then return.
                if passUpNode is not None:
                    self.maybeAddChild(nodeFromDict, passUpNode, passUpNode.arelleRelationship)
                return
            except KeyError:
                # we haven't already visited this relationship, so let's make a new node and maybe add a child.
                if childConcept is not None:
                    mayBeUnitConcept = childConcept.name in self.filing.modelXbrl.units
                    childNode = PresentationGroupNode(childConcept, relationship, mayBeUnitConcept)
                    if passUpNode is not None:
                        self.maybeAddChild(childNode, passUpNode, passUpNode.arelleRelationship)
                    passUpNode = childNode
        else:
            childNode = None

        childrenList = self.linkRelationshipSet.toModelObject(concept)
        if len(childrenList) == 0 and concept is not None:
            # a concept can have multiple nodes in the presentation group, but it can't have multiple roots.
            # therefore, if we want to see if we've already visited this root concept, we can just look
            # through root nodes that we've already visited.
            for node in self.rootNodeList:
                if node.arelleConcept == concept:
                    rootNode = node # we have already made a root node for this concept
                    break
            else: # if the above for loop doesn't break, we fall into the else
                # we have not already made a root concept for this node, so let's make one.
                # note the relationship is None, root nodes don't have a relationship pointing at them.
                mayBeUnitConcept = concept.name in self.filing.modelXbrl.units
                rootNode = PresentationGroupNode(concept, None, mayBeUnitConcept)
                self.rootNodeList += [rootNode]

            self.maybeAddChild(rootNode, childNode, relationship)

        copy = localRelationshipSet.copy()
        for newRelationship in childrenList:
            self.traverseToRootOrRoots(newRelationship.fromModelObject, newRelationship, concept, passUpNode, copy)




    def maybeAddChild(self, parentNode, childNode, relationship):
        if childNode is not None:
            parentNode.childrenList += [childNode]
            self.relationshipToChildNodeDict[relationship] = childNode







    def startPreorderTraversal(self):
        visited = set()
        giveMemGetPositionDictPrimary = defaultdict(list) # gets populated by recursive call

        self.sortRootNodeListByLabel()

        if len(self.rootNodeList) == 1:
            self.doPreorderTraversal(self.rootNodeList[0], giveMemGetPositionDictPrimary, {}, False, False, visited)
        else:
            for rootNode in self.rootNodeList:
                # later on we're going to need to decide whether to print a warning about if multiple root nodes are being used, so here we keep track of
                # everything under each root node.  the idea is that if multiple root nodes are being used, the ordering is arbitrary by label, not controlled
                # in an intentional way by the filer.
                setOfConcepts = set()
                self.doPreorderTraversal(rootNode, giveMemGetPositionDictPrimary, {}, False, setOfConcepts, visited)
                self.cube.rootNodeToConceptSetDict[rootNode] = setOfConcepts

        # we searched the whole graph and got back giveMemGetPositionDictPrimary which contains all of the primary elements
        # in the graph and their ordering.
        self.cube.axisAndMemberOrderDict['primary'] = (giveMemGetPositionDictPrimary, None)


    # as we do our preorder traversal of the graph, the size of the visited set will increases one by one. therefore,
    # we can use len(visited) for ordering.  if later we sort all of the axes by their order, it will
    # in the order of a preorder traversal of the presentation group.  the order won't be simple like 1,2,3, it might
    # be 5, 20, 53, ... but sorting in increasing order will order axes in the order of a preorder traversal.  we do
    # this trick several times below too.
    def doPreorderTraversal(self, node, giveMemGetPositionDictPrimary, giveMemGetPositionDictAxis, parentIsAnAxis, setOfConcepts, visited):
        if self.cube.noFactsOrAllFactsSuppressed:
            return
        preferredLabel = None
        relationship = node.arelleRelationship
        if relationship is not None: # root nodes have no relationship
            if relationship in visited:
                return
            visited.add(relationship)
            preferredLabel = relationship.preferredLabel
        concept = node.arelleConcept

        # making giveMemGetPositionDict's
        nodeIsAnAxis = concept is not None and concept.isDimensionItem
        if nodeIsAnAxis:
            if concept in visited or concept.qname not in self.cube.hasAxes:
                # first, make sure we don't visit an axis twice, could happen if it has multiple parents
                # then, make sure it's an axis for this cube
                return
            visited.add(concept) # yes, we are sort of misusing visited for this, but it's ok
            if relationship is None:
                axisOrder = Utils.minNumber
            else:
                axisOrder = relationship.order
            parentIsAnAxis = True
        elif parentIsAnAxis: # only members can be under axes
            giveMemGetPositionDictAxis[concept.qname] = len(visited)
        elif not parentIsAnAxis: # we're not on an axis or below an axis, so it's a primary item.
            try:
                isStart = Utils.isPeriodStartLabel(preferredLabel)
                if isStart or Utils.isPeriodEndLabel(preferredLabel):
                    if concept.periodType == 'duration':
                        self.filing.ignoredPreferredLabels += [(relationship.linkrole,concept.qname,preferredLabel,self.cube.shortName, relationship.fromModelObject.qname)]
                        if isStart:
                            preferredLabel = Utils.durationStartRoleError # not a role.
                        else:
                            preferredLabel = Utils.durationEndRoleError # not a real role.
                    else:
                        self.cube.periodStartEndLabelDict[concept.qname].append(preferredLabel)
            except AttributeError:
                pass
            # see note earlier about len(visited) for an explanation
            giveMemGetPositionDictPrimary[concept.qname].append((len(visited), preferredLabel))

            # axes and members are abstract too, but nodeIsAnAxis and parentIsAnAxis are false, so we don't have to worry about them here.
            if concept.isAbstract:
                self.cube.abstractDict[concept.qname] = len(visited)

        # if it's false, then there is only one root and there's no possibility of ever needing to print a warning message.  otherwise, keep track of what's under
        # each root node so that if nodes under multiple roots are being used, we can warn that the ordering between them might be unexpected.
        if setOfConcepts != False and (nodeIsAnAxis or not parentIsAnAxis):
            setOfConcepts.add(concept)

        # units -- note that a member or element can be used for something else and still be used for unit ordering.
        if node.mayBeUnitConcept:
            self.unitOrdering += [(len(visited), concept.name)] # see note earlier about len(visited) for an explanation

        # labels
        self.buildLabel(concept, preferredLabel)

        # sort children, we are doing this as we go.
        node.childrenList = sorted(node.childrenList, key = lambda thing : thing.arelleRelationship.order)

        # recurse
        for childNode in node.childrenList:
            if parentIsAnAxis:
                self.doPreorderTraversal(childNode, giveMemGetPositionDictPrimary, giveMemGetPositionDictAxis, parentIsAnAxis, setOfConcepts, visited)
            else:
                self.doPreorderTraversal(childNode, giveMemGetPositionDictPrimary, {}, parentIsAnAxis, setOfConcepts, visited)

        if nodeIsAnAxis:
            if concept.isTypedDimension: # designate this as a typed dimension axis
                giveMemGetPositionDictAxis["!?isTypedDimensionAxis?!"] = True
            # now we've already recursed on all of the axes children, so we have their ordering, so we can add to axisAndMemberOrderDict
            if len(giveMemGetPositionDictAxis) > 0:
                if self.cube.isStatementOfEquity:
                    giveMemGetPositionDictAxis = self.cube.rearrangeGiveMemGetPositionDict(concept.qname,giveMemGetPositionDictAxis)
                self.cube.axisAndMemberOrderDict[concept.qname] = (giveMemGetPositionDictAxis, axisOrder)
            else:
                # every member on this axis is filtered out, this kills the whole cube.
                #message = ErrorMgr.getError('PRESENTATION_GROUP_CHILDLESS_AXIS_FILTERS_OUT_ALL_FACTS_WARNING').format(self.cube.shortName)
                self.filing.modelXbrl.debug("debug", # now detected by EFM.6.12.08 in EFM/Filing.py
                                              ("The presentation group \"%(linkroleName)s\" contains an axis %(axis)s with no domain element children, which effectively filters out every fact"),
                                              modelObject=concept, axis=concept.qname,
                                              linkrole=self.cube.linkroleUri, linkroleDefinition=self.cube.definitionText, linkroleName=self.cube.shortName)
                self.cube.noFactsOrAllFactsSuppressed = True






    def buildLabel(self, concept, preferredLabel = None):
        # if preferredLabel is None, it outputs the standard labelStr
        labelStr = concept.label(preferredLabel=preferredLabel, fallbackToQname=False, lang=self.filing.controller.labelLangs)
        if labelStr is None: # if no labelStr, labelStr function with fallbackToQname=False returns None
            labelStr = Utils.prettyPrintQname(concept.qname.localName)
        self.cube.labelDict[concept.qname] = labelStr

    def printPresentationGroup(self):
        for rn in self.rootNodeList:
            self.filing.controller.logTrace(str(rn.arelleConcept.qname))
            self.recursivePrint(rn, '\t')
        self.filing.controller.logTrace('\n\n')

    def recursivePrint(self, presentationGroupNode, tabString):
        for kid in presentationGroupNode.childrenList:
            if kid.arelleRelationship is not None:
                self.filing.modelXbrl.debug("debug",
                                          _('%(tabs)s%(concept)s    order: %(order)s    preferred label: %(label)s'),
                                          modelObject=kid.arelleConcept, tabs=tabString,
                                          concept=kid.arelleConcept.qname, order=kid.arelleRelationship.order, label=kid.arelleRelationship.preferredLabel)
            else: # it's a Member or default
                self.filing.controller.logTrace(tabString + (str(kid.arelleConcept.qname) if kid.arelleConcept is not None else "(missing concept)"))
            self.recursivePrint(kid, tabString + '\t')