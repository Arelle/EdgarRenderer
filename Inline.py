''' 
Inline XBRL Document Set (formerly a) plug-in.

Supports opening manifest file that identifies inline documents of a document set.

Saves extracted instance document.

(Does not currently support multiple target instance documents in a document set.)

(c) Copyright 2013 Mark V Systems Limited, All rights reserved.
'''
from arelle import ModelXbrl, ValidateXbrlDimensions, XbrlConst
from arelle.PluginManager import pluginClassMethods
from arelle.PrototypeDtsObject import LocPrototype, ArcPrototype
from arelle.ModelDocument import ModelDocument, ModelDocumentReference, Type, load
from arelle.ModelInstanceObject import ModelInlineFootnote
from arelle.XmlUtil import addChild, copyIxFootnoteHtml, elementChildSequence
from arelle.UrlUtil import isHttpUrl
from arelle.ValidateFilingText import CDATApattern
import os, zipfile, io
from optparse import SUPPRESS_HELP
from lxml.etree import XML, XMLSyntaxError
from collections import defaultdict

MANIFEST_NAMESPACE = "http://disclosure.edinet-fsa.go.jp/2013/manifest"
DEFAULT_INSTANCE_EXT = ".xml"  # the extension on the instance to be saved
DEFAULT_DISTINGUISHING_SUFFIX = "_htm."  # suffix tacked onto the base name of the source inline document
USUAL_INSTANCE_EXTS = {"xml", "xbrl"}

def saveTargetDocumentIfNeeded(cntlr, options, modelXbrl, filing, suffix="_htm.", iext=".xml"):  
    if (modelXbrl is None): return
    if modelXbrl.modelDocument.type not in (Type.INLINEXBRL, Type.INLINEXBRLDOCUMENTSET):
        cntlr.logTrace(_("No Inline XBRL document."))
        return
    modelDocument = modelXbrl.modelDocument
    saveTargetPath = None
    if ((options.saveTargetFiling or options.saveTargetInstance) and
        (cntlr.reportZip or cntlr.reportsFolder is not None)):
        if options.saveTargetFiling:
            (path, ignore) = os.path.splitext(modelDocument.filepath)
            if cntlr.reportZip:
                saveTargetPath = os.path.basename(path) + suffix + 'zip'
            elif cntlr.reportsFolder is not None:
                saveTargetPath = os.path.join(cntlr.reportsFolder, os.path.basename(path) + suffix + 'zip')
    else: return       
    if modelDocument.type == Type.INLINEXBRLDOCUMENTSET:
        targetBasename = os.path.basename(modelDocument.targetDocumentPreferredFilename)
        targetSchemaRefs = modelDocument.targetDocumentSchemaRefs
    else:
        targetBasename = modelDocument.basename
        targetSchemaRefs = set(modelDocument.relativeUri(referencedDoc.uri)
                               for referencedDoc in modelDocument.referencesDocument.keys()
                               if referencedDoc.type == Type.SCHEMA)
    filepath, fileext = os.path.splitext(os.path.join(cntlr.reportsFolder or "", targetBasename))
    if fileext not in USUAL_INSTANCE_EXTS: fileext = iext
    targetFilename = filepath + fileext

    filingZip = None
    filingFiles = None
    if options.saveTargetFiling:
        targetFilename = os.path.basename(targetFilename)
        if cntlr.reportZip:
            zipStream = io.BytesIO()
            filingZip = zipfile.ZipFile(zipStream, 'w', zipfile.ZIP_DEFLATED, True)
        elif cntlr.reportsFolder is not None and saveTargetPath:
            filingZip = zipfile.ZipFile(saveTargetPath, mode='w', compression=zipfile.ZIP_DEFLATED, allowZip64=False)

        filingFiles = set()
        # copy referencedDocs to two levels.
        # TODO: this looks fully recursive, not stopping at two.
        def addRefDocs(doc):
            for refDoc in doc.referencesDocument.keys():
                if refDoc.uri not in filingFiles:
                    filingFiles.add(refDoc.uri)
                    addRefDocs(refDoc)
        addRefDocs(modelDocument) 
    
    else:
         if cntlr.reportZip:
             filingZip = cntlr.reportZip

    saveTargetDocument(filing, modelXbrl, targetFilename, targetSchemaRefs,
                       outputZip=filingZip, filingFiles=filingFiles, suffix=suffix, iext=iext)
        
    if options.saveTargetFiling:
        instDir = os.path.dirname(modelDocument.uri)  # TODO: will this work if the modelDocument was remote?
        for refFile in filingFiles:
            if refFile.startswith(instDir):
                fileStream = filing.readFile(refFile, binary=True)[0]  # returned in a tuple
                filingZip.writestr(modelDocument.relativeUri(refFile), fileStream.read())
                fileStream.close()
     
    if options.saveTargetFiling and filingZip:          
        filingZip.close()
    if cntlr.reportZip and saveTargetPath:
        zipStream.seek(0)
        cntlr.reportZip.writestr(saveTargetPath, zipStream.read())
        zipStream.close()
     
def saveTargetDocument(filing, modelXbrl, targetDocumentFilename, targetDocumentSchemaRefs,
                       outputZip=None, filingFiles=None,
                       suffix=DEFAULT_DISTINGUISHING_SUFFIX, iext=DEFAULT_INSTANCE_EXT):
    sourceDir = os.path.dirname(modelXbrl.modelDocument.filepath)
    targetUrlParts = targetDocumentFilename.rpartition(".")
    targetUrl = targetUrlParts[0] + suffix + targetUrlParts[2]
    modelXbrl.modelManager.showStatus(_("Extracting instance ") + os.path.basename(targetUrl))
    for pluginXbrlMethod in pluginClassMethods("InlineDocumentSet.CreateTargetInstance"):
        targetInstance = pluginXbrlMethod(modelXbrl, targetUrl, targetDocumentSchemaRefs, filingFiles,
                                          # no lang on xbrl:xbrl, specific xml:lang on elements which aren't en-US
                                          baseXmlLang=None, defaultXmlLang="en-US")
        if outputZip:
            targetInstance.saveInstance(overrideFilepath=targetUrl, outputZip=outputZip, updateFileHistory=False, xmlcharrefreplace=True)
        else:
            fh = io.StringIO();
            targetInstance.saveInstance(overrideFilepath=targetUrl, outputFile=fh, updateFileHistory=False, xmlcharrefreplace=True)
            fh.seek(0)
            filing.writeFile(targetUrl, fh.read())
            fh.close()
        if getattr(modelXbrl, "isTestcaseVariation", False):
            modelXbrl.extractedInlineInstance = True # for validation comparison
        modelXbrl.modelManager.showStatus(_("Saved extracted instance"), clearAfter=5000)
        return # there can only be one "InlineDocumentSet.CreateTargetInstance" but just to be sure 
    cntlr.logTrace(_("Unable to save extracted document, missing plugin class \"InlineDocumentSet.CreateTargetInstance\"."))

