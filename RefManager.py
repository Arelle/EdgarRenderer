# -*- coding: utf-8 -*-
"""
:mod:`EdgarRenderer.RefManager`
~~~~~~~~~~~~~~~~~~~
Edgar(tm) Renderer was created by staff of the U.S. Securities and Exchange Commission.
Data and content created by government employees within the scope of their employment
are not subject to domestic copyright protection. 17 U.S.C. 105.
"""

import os.path, re, lxml, time
import arelle.ModelDocument
from arelle.FileSource import openFileSource

taxonomyManagerFile = 'TaxonomyAddonManager.xml'

"""
The Add on manager is a hold over from RE2.  The purpose is to load standard taxonomy doc and ref
files without requiring them to be in the DTS during validation.  There is a configuration file that
maps schema file names to all associated documentation and reference file names. After a document
is loaded, then each schema in the dts is checked to see whether its associated doc and/or ref files
(there could be zero, one, or more of each) need to be loaded.
"""

class RefManager(object):

    def __init__(self,resources):
        managerPath = os.path.join(resources,taxonomyManagerFile)
        self.tree = lxml.etree.parse(managerPath)

    # method getUrls on CntlrAddOnManager
    # returns: set of strings representing additional linkbases to be loaded.
    # return the set of URLs that must be loaded due to the presence of schemas in the DTS.
    def getUrls(self,modelXbrl):
        urls = set()
        from urllib.parse import urlparse,urljoin
        namespacesInFacts = {f.qname.namespaceURI for f in modelXbrl.facts if f.qname is not None}
        for fileUri,doc in modelXbrl.urlDocs.items():
            if doc.targetNamespace in namespacesInFacts:
                parsedUri = urlparse(fileUri)
                fileBasename = os.path.basename(parsedUri.path)
                if re.compile('.*\.xsd$').match(fileBasename): # Assume we only care about urls ending in .xsd
                    xp = "/TaxonomyAddonManager/TaxonomyList/TaxonomyAddon[Taxonomy[.='" + fileBasename + "']]/*/string"
                    moreUrls = self.tree.xpath(xp)
                    for u in moreUrls:
                        urls.add(urljoin(fileUri,u.text))
        return urls

    def loadAddedUrls(self,modelXbrl,controller):
        validateDisclosureSystem = modelXbrl.modelManager.validateDisclosureSystem
        loadedAdditionalUrls = False
        _startedAt = time.time()
        _numUrls = 0
        try:
            modelXbrl.modelManager.validateDisclosureSystem = False
            for url in self.getUrls(modelXbrl):
                doc = None
                try: # isSupplemental is needed here to force the parsing of linkbase.
                    doc = arelle.ModelDocument.load(modelXbrl,url,isSupplemental=True)
                    loadedAdditionalUrls = True
                except (arelle.ModelDocument.LoadingException):
                    pass
                if doc is None:
                    #message = ErrorMgr.getError('UNABLE_TO_LOAD_ADDON_LINKBASE')
                    modelXbrl.info("info:unableToAddOnLinkbase",
                                  _("Unable to load add-on linkbase %(linkbase)s."),
                                  modelObject=modelXbrl.modelDocument, linkbase=url)
                _numUrls += 1
        finally:
            modelXbrl.modelManager.validateDisclosureSystem = validateDisclosureSystem
            if loadedAdditionalUrls:
                modelXbrl.relationshipSets.clear() # relationships have to be re-cached
        controller.logDebug("{} add on linkbases loaded {:.3f} secs.".format(_numUrls, time.time() - _startedAt))
        return
