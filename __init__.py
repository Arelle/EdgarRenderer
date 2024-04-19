# -*- coding: utf-8 -*-
"""
:mod:`EdgarRenderer.EdgarRenderer`
~~~~~~~~~~~~~~~~~~~
Edgar(tm) Renderer was created by staff of the U.S. Securities and Exchange Commission.
Data and content created by government employees within the scope of their employment
are not subject to domestic copyright protection. 17 U.S.C. 105.

This plug-in is an adaptation of the gitHub arelle/EdgarRenderer EdgarRenderer.py into
a plug-in of the Arelle environment, including RESTful web use.  It replaces main
program and daemon functionality of the referenced EdgarRenderer.py and has no use of any
file system objects.  It is thus adequately secure for deployment in a server environment
as no information from an invocation ever appears in the file system.  (It would require
kernel access within the operating system to access insider information within processor
memory of a running instance.)

Modifications to the original EdgarRenderer source code are done under the Arelle(r)
license and protected by usual Arelle copyright and license.  GitHub allows one to
inspect the changes log of the plugin branch from the SEC contributed branch to identify
modifications to the original.

This code is in gitHub/arelle/EdgarRenderer the edgr154 branch.

Installable applications are available with this module for Windows and MacOS on
http://arelle.org/download.  The GUI versions run this code after selecting the
EdgarRenderer plugin (help->manage plugins, click select, select EdgarRenderer).

For command line operation, install arelle somewhere, and on Windows run arelleCmdLine.
On MacOS, at Arelle.app, with terminal shell, cd /Applications/Arelle.app/Contents/MacOS/,
and type in ./arelleCmdLine --about (or other parameters as needed).

To run from source code, libraries required are the following or newer:

        pip install pytz-2014.10-py2.py3-none-any.whl
        pip install six-1.9.0-py2.py3-none-any.whl
        pip install python_dateutil-2.4.0-py2.py3-none-any.whl
        pip install pyparsing-2.0.3-py3-none-any.whl
        pip install numpy-1.9.1+mkl-cp34-none-win_amd64.whl
        pip install matplotlib-1.4.2-cp34-none-win_amd64.whl
        pip install jdcal-1.0-py2.py3-none-any.whl
        pip install openpyxl-2.1.4-py2.py3-none-any.whl

To debug under eclipse from a normal eclipse project of Arelle it is suggested to check out
EdgarRenderer[edgr154] from GitHub under the arelle plugin directory (e.g., this file would be
plugin/EdgarRenderer/__init__.py). Note that EdgarGenderer is not part of Arelle itself,
it is in .gitignore in the top level Arelle directory.

Alternatively on a Mac or linux system one may soft link to the eclipse project's plugin
directory from a different directory containing a local copy of the EdgarRenderer plugin
project.  Either way eclipse can debug and modify EdgarRenderer source code when debugging
and inspecting Arelle.  On a Mac or Linux the soft link command would be:

   ln -s ...EdgarRenderer (parent of this file) ...arelle/plugin (the eclipse project directory of plugin)
   add ...arelle/plugin/EdgarRenderer to your .gitignore file

To run under in a server mode, with a single input zip (all in memory, not unpacked to
the file system) and a single output zip (all in memory, not on the file system):

a) when invoking via arelleCmdLine.py:

   python3.4 arelleCmdLine.py (or arelleCmdLine, windows, or ./arelleCmdLine, Mac)
   -f "/mydir/test/filingInstanceXsdAndLinkbases.zip"
   -o "/mydir/test/out.zip"
   --plugins EdgarRenderer # if installed in plugins, else full path to it: /mydir/myplugins/EdgarRenderer"
   --disclosureSystem efm-pragmatic
   --logFile mylogfilename.xxx
   --debugMode

   Specifying --logFile mylogfilename.txt (or .xml, .json) captures the log output in the
   zip file with the specified file name.  The suffix should be .xml or .json to get detailed logging parameters in
   the respective format.

    Adding --debugMode allows uncaught exceptions to provide a trace-back to eclipse, remove that
    for production.  Internet connectivity is by default offline at SEC, so override in this case.

    If in a closed environment with all taxonomies in Taxonomy Packages or preloaded to cache, add
       --internetConnectivity offline


b) when invoking via REST interface (built in webserver or cgi-bin server):

    1) simple curl request or equivalent in code:

    curl -X POST "-HContent-type: application/zip"
        -T amd.zip
        -o out.zip
        "http://localhost:8080/rest/xbrl/validation?efm-pragmatic&media=zip&plugins=EdgarRenderer&logFile=log.xml"

        (-T specifies zip of the filing, -o the file to store rendering results)
        (use log.txt if a text log files is desired instead)

    2) to not load EdgarRenderer dynamically, it must be active in plugins.json (as set up by GUI)
    (sibling to the caches directoryexcept Mac where it's under ~/Library/Application Support/Arelle)

    then omit &plugins=EdgarRenderer

    the &logFile parameter specifies providing the log output in specified format in zip file (as noted above)

To run (as in EDGAR) with output report files added to the submission directory

   python3.4 arelleCmdLine.py  (or arelleCmdLine for Win/Mac apps)
   -f "/mydir/test/amd.zip"
   -r "/mydir/test"  <<- the submission + output reports directory
   --logFile logToBuffer or an specify an xml log file <<- required to save log messages into filing summary
   --plugins 'EdgarRenderer' # if installed in plugins, else full path to it: /mydir/myplugins/EdgarRenderer"
   --disclosureSystem efm-pragmatic

   Note that the -r "out" directory is cleared on each run to assure no prior run files get inter

The filename parameter (-f) may be a JSON structure (as used in EDGAR itself) to pass in
more information about the filing (see validate/EFM/__init__.py) such as:

   for a single instance filing, such as an SDR K form (without \n's pretty printed below):

      -f '[{"file": "/Users/joe/.../gpc_gd1-20130930.htm",
             "cik": "0000350001",
             "cikNameList": {"0001306276":"BIGS FUND TRUST CO"},
             "submissionType":"SDR-A",
             "attachmentDocumentType":"EX-99.K SDR.INS",
             "accessionNumber":"0001125840-15-000159"}]'

    for multiple instances (SDR-L's), add more of the {"file": ...} entries.

    for Windows called from Java, the JSON must be quoted as thus:
        -f "[{\"file\":\"z:\\Documents\\...\\gpc_gd1-20130930.htm\",
            \"cik\": \"0000350001\",
            \"cikNameList\": {\"0000350001\":\"BIG FUND TRUST CO\"},
            \"submissionType\":\"SDR-A\", \"attachmentDocumentType\":\"EX-99.K SDR.INS\"}]"

To build an installable cx_Freeze binary, (tested on Ubuntu), uncomment the entries in Arelle's
setup.py that are marked for EdgarRenderer.

Required if running under Java (using runtime.exec) on Windows, suggested always:

    if xdgConfigHome or environment variable XDG_CONFIG_HOME are set:
    please set environment variable MPLCONFIGDIR to same location as xdgConfigHome/XDG_CONFIG_HOME
    (to prevent matlib crash under runtime.exe with Java)

Language of labels:

    Multi-language labels will select first the label language, secondly en-US if different from label language, and lastly qname.
    Command line (and Web API) may override system language for labels with parameter --labelLang
    GUI may use tools->language labels setting to override system language for labels

"""
VERSION = '3.24.1.u1'

from collections import defaultdict
from arelle import PythonUtil
from arelle import (Cntlr, FileSource, ModelDocument, XmlUtil, Version, ModelValue, Locale, PluginManager, WebCache, ModelFormulaObject, Validate,
                    ViewFileFactList, ViewFileFactTable, ViewFileConcepts, ViewFileFormulae,
                    ViewFileRelationshipSet, ViewFileTests, ViewFileRssFeed, ViewFileRoleTypes)
from arelle.ModelInstanceObject import ModelFact, ModelInlineFootnote
from arelle.PluginManager import pluginClassMethods
from arelle.ValidateFilingText import elementsWithNoContent
from arelle.XhtmlValidate import xhtmlValidate
from arelle.XmlValidateConst import VALID, NONE, UNVALIDATED
from arelle.XmlValidate import validate as xmlValidate
from . import RefManager, IoManager, Inline, Utils, Filing, Summary
import datetime, zipfile, logging, shutil, gettext, time, shlex, sys, traceback, linecache, os, io, tempfile
import regex as re
from lxml import etree
from os import getcwd, remove, removedirs
from os.path import join, isfile, exists, dirname, basename, isdir
from optparse import OptionParser, SUPPRESS_HELP

MODULENAME = os.path.basename(os.path.dirname(__file__))

tagsWithNoContent = set(f"{{http://www.w3.org/1999/xhtml}}{t}" for t in elementsWithNoContent)
for t in ("schemaRef", "linkbaseRef", "roleRef", "arcroleRef", "loc", "arc"):
    tagsWithNoContent.add(f"{{http://www.xbrl.org/2003/linkbase}}{t}")
tagsWithNoContent.add("{http://www.xbrl.org/2013/inlineXBRL}relationship")

def uncloseSelfClosedTags(doc):
    doc.parser.set_element_class_lookup(None) # modelXbrl class features are already closed now, block class lookup
    for e in doc.xmlRootElement.iter():
        # check if no text, no children and not self-closable element for EDGAR
        if (e.text is None and (not e.getchildren())
            and e.tag not in tagsWithNoContent
            # also skip ix elements which are nil
            and not (e.get("{http://www.w3.org/2001/XMLSchema-instance}nil") in ("true","1") and e.tag.startswith("{http://www.xbrl.org/2013/inlineXBRL}"))):
            e.text = "" # prevents self-closing tag with etree.tostring for zip and dissem folders

def allowableBytesForEdgar(bytestr):
    # encode xml-legal ascii bytes not acceptable to EDGAR
    return re.sub(b"[\\^\x7F]", lambda m: b"&#x%X;" % ord(m[0]), bytestr)

def serializeXml(xmlRootElement):
    initialComment = b'' # tostring drops initial comments
    node = xmlRootElement
    while node.getprevious() is not None:
        node = node.getprevious()
        if isinstance(node, etree._Comment):
            initialComment = etree.tostring(node, encoding="ASCII") + b'\n' + initialComment
    serXml = etree.tostring(xmlRootElement, encoding="ASCII", xml_declaration=True)
    if initialComment and serXml and serXml.startswith(b"<?"):
        i = serXml.find(b"<html")
        if i:
            serXml = serXml[:i] + initialComment + serXml[i:]
    return allowableBytesForEdgar(serXml)


###############

logParamEscapePattern = re.compile("[{]([^}]*)[}](?![}])") # match a java {{xxx} pattern to connvert to python escaped {{xxx}}

def edgarRendererCmdLineOptionExtender(parser, *args, **kwargs):
    parser.add_option("-o", "--output", dest="zipOutputFile",
                      help=_("Zip the artifacts generated by the rendering process into a file with this name."))
    parser.add_option("-c", "--configFile", dest="configFile",
                      default=os.path.join(os.path.dirname(__file__), 'conf', 'config_for_instance.xml'),
                      help=_("Path of location of Edgar Renderer configuration file relative to CWD. Default is EdgarRenderer.xml."))
    parser.add_option("-r", "--reports", dest="reportsFolder",
                      help=_("Relative or absolute path and name of the reports folder."))
    parser.add_option("--noReportOutput", action="store_true", dest="noReportOutput",
                      help=_("Block production of reports (FilingSummary, R files, xslx, etc)."))
    parser.add_option("--resources", dest="resourcesFolder",
                      help=_("Relative path and name of the resources folder, which includes static xslt, css and js support files."))
    parser.add_option("--filings", dest="filingsFolder",
                      help=_("Relative path and name of the filings (input) folder."))
    parser.add_option("--processing", dest="processingFolder",
                      help=_("Relative path and name of the processing folder."))
    parser.add_option("--errors", dest="errorsFolder",
                      help=_("Relative path and name of the errors folder, where unprocessable filings are stored."))
    parser.add_option("--delivery", dest="deliveryFolder",
                      help=_("Relative path and name of the delivery folder, where all rendered artifacts are stored."))
    parser.add_option("--archive", dest="archiveFolder",
                      help=_("Relative path and name of the archive folder, where successfully-processed original filings are stored."))
    parser.add_option("--processingfrequency", dest="processingFrequency",
                      help=_("The sleep time for the RE3 daemon shell if no XBRL filing is present in the staging area."))
    parser.add_option("--renderingService", dest="renderingService",
                      help=_("Type of service...Instance: one time rendering, or Daemon: background processing."))
    parser.add_option("--totalClean", dest="totalClean", action="store_true",
                      help=_("Boolean to indicate if the shell should completely clean the archive, errors and delivery folders before processing."))
    parser.add_option("--deleteProcessedFilings", dest="deleteProcessedFilings", action="store_true",
                      help=_("Boolean to indicate if processed filings should be deleted or not."))
    parser.add_option("--htmlReportFormat", dest="htmlReportFormat",
                      help=_("Type of HTML report...Complete: asPage rendering = True, or Fragment: asPage rendering = False."))

    parser.add_option("--reportFormat", dest="reportFormat",
                      help=_("One of Xml, Html, HtmlAndXml or None."))

    parser.add_option("--failFile", dest="failFile", help=_("Relative path and name of fail file. "))

    parser.add_option("--reportXslt", dest="reportXslt", help=_("Path and name of Stylesheet for producing a report file."))
    parser.add_option("--reportXsltDissem", dest="reportXsltDissem", help=_("Path and name of Stylesheet for producing second report file for dissemination."))
    parser.add_option("--summaryXslt", dest="summaryXslt", help=_("Path and name of Stylesheet, if any, for producing filing summary html."))
    parser.add_option("--summaryXsltDissem", dest="summaryXsltDissem", help=_("Path and name of Stylesheet, if any, for producing second filing summary html for dissemination."))
    parser.add_option("--renderingLogsXslt", dest="renderingLogsXslt", help=_("Path and name of Stylesheet, if any, for producing filing rendering logs html."))
    parser.add_option("--excelXslt", dest="excelXslt", help=_("Path and name of Stylesheet, if any, for producing Excel 2007 xlsx output."))
    parser.add_option("--auxMetadata", action="store_true", dest="auxMetadata", help=_("Set flag to generate inline xbrl auxiliary files"))
    # saveTarget* parameters are added by inlineXbrlDocumentSet.py plugin
    parser.add_option("--sourceList", action="store", dest="sourceList", help=_("Comma-separated triples of instance file, doc type and source file."))
    parser.add_option("--copyInlineFilesToOutput", action="store_true", dest="copyInlineFilesToOutput", help=_("Set flag to copy all inline files to the output folder or zip."))
    parser.add_option("--copyXbrlFilesToOutput", action="store_true", dest="copyXbrlFilesToOutput", help=_("Set flag to copy all source xbrl files to the output folder or zip."))
    parser.add_option("--zipXbrlFilesToOutput", action="store_true", dest="zipXbrlFilesToOutput", help=_("Set flag to zip all source xbrl files to the an accession-number-xbrl.zip in reports folder or zip when an accession number parameter is available."))
    parser.add_option("--includeLogsInSummary", action="store_true", dest="includeLogsInSummary", help=_("Set flag to copy log entries into <logs> in FilingSummary.xml."))
    parser.add_option("--includeLogsInSummaryDissem", action="store_true", dest="includeLogsInSummaryDissem", help=_("Set flag to copy log entries into <logs> in FilingSummary.xml for dissemination."))
    parser.add_option("--noLogsInSummary", action="store_false", dest="includeLogsInSummary", help=_("Unset flag to copy log entries into <logs> in FilingSummary.xml."))
    parser.add_option("--noLogsInSummaryDissem", action="store_false", dest="includeLogsInSummaryDissem", help=_("Unset flag to copy log entries into <logs> in FilingSummary.xml for dissemination."))
    parser.add_option("--processXsltInBrowser", action="store_true", dest="processXsltInBrowser", help=_("Set flag to process XSLT transformation in browser (e.g., rendering logs)."))
    parser.add_option("--noXsltInBrowser", action="store_false", dest="processXsltInBrowser", help=_("Unset flag to process XSLT transformation in browser (e.g., rendering logs)."))
    parser.add_option("--noEquity", action="store_true", dest="noEquity", help=_("Set flag to suppress special treatment of Equity Statements. "))

    parser.add_option("--showErrors", action="store_true", dest="showErrors",
                      help=_("List all errors and warnings that may occur during RE3 processing."))
    parser.add_option("--debugMode", action="store_true", dest="debugMode", help=_("Let the debugger handle exceptions."))
    parser.add_option("--logMessageTextFile", action="store", dest="logMessageTextFile", help=_("Log message text file."))
    # always use a buffering log handler (even if file or std out)
    parser.add_option("--logToBuffer", action="store_true", dest="logToBuffer", default=True, help=SUPPRESS_HELP)
    parser.add_option("--noRenderingWithError", action="store_true", dest="noRenderingWithError", help=_("Prevent rendering action when exhibit instance validation encountered error(s), blocking R file and extracted xml instance generation for that exhibit instance."))
    parser.add_option("--keepFilingOpen", dest="keepFilingOpen", action="store_true", help=SUPPRESS_HELP) # block closing filing in filingEnd


class EdgarRenderer(Cntlr.Cntlr):
    """
    .. class:: EdgarRenderer()

    Initialization sets up for platform via Cntlr.Cntlr.
    """

    def __init__(self, cntlr):
        self.VERSION = VERSION
        self.cntlr = cntlr
        self.webCache = cntlr.webCache
        self.preloadedPlugins = {}
        self.ErrorMsgs = []
        self.entrypoint = None  # Contains the absolute path of the instance, inline, zip, or folder.
        self.entrypointFolder = None  # Contains absolute folder of instance, inline, or zip; equal to entrypoint if a folder.
        self.nextFileNum = 1 # important for naming file numbers for multi-instance filings
        self.nextUncategorizedFileNum = 9999
        self.nextBarChartFileNum = 0
        self.xlWriter = None
        self.excelXslt = None
        self.createdFolders = []
        self.success = True
        self.labelLangs = ['en-US','en-GB'] # list by WcH 7/14/2017, priority of label langs, en-XX always falls back to en anyway
        if not hasattr(cntlr, "editedIxDocs"): # in GUI mode may be initialized in 'ModelDocument.Discover' before this class init
            cntlr.editedIxDocs = {}
            cntlr.editedModelXbrls = set()
            cntlr.redlineIxDocs = {}
            cntlr.redactTgtElts = set()
        # iXBRLViewer plugin is present if there's a generate method
        self.hasIXBRLViewer = any(True for generate in pluginClassMethods("iXBRLViewer.Generate"))

    # wrap controler properties as needed

    @property
    def modelManager(self):
        return self.cntlr.modelManager

    @property
    def logger(self):
        return self.cntlr.logger

    def processShowOptions(self, options):
        if options.showOptions:  # debug options
            for optName, optValue in sorted(options.__dict__.items(), key=lambda optItem: optItem[0]):
                self.logInfo(_("Option {0}={1}").format(optName, optValue))
            IoManager.logConfigFile(self, options, messageCode='info')




    def retrieveDefaultREConfigParams(self, options):
        # defaultValueDict contains the default strings for
        # when there are no config file and no command line arguments.
        self.defaultValueDict = defaultdict(lambda:None)
        self.defaultValueDict['abortOnMajorError'] = str(False)
        self.defaultValueDict['noRenderingWithError'] = str(False)
        self.defaultValueDict['archiveFolder'] = 'Archive'
        self.defaultValueDict['auxMetadata'] = str(False)
        self.defaultValueDict['copyInlineFilesToOutput'] = str(False)
        self.defaultValueDict['copyXbrlFilesToOutput'] = str(False)
        self.defaultValueDict['zipXbrlFilesToOutput'] = str(False)
        self.defaultValueDict['includeLogsInSummary'] = str(False)
        self.defaultValueDict['includeLogsInSummaryDissem'] = str(False)
        self.defaultValueDict['deleteProcessedFilings'] = str(True)
        self.defaultValueDict['deliveryFolder'] = 'Delivery'
        self.defaultValueDict['debugMode'] = str(False)
        self.defaultValueDict['errorsFolder'] = 'Errors'
        self.defaultValueDict['excelXslt'] = 'InstanceReport_XmlWorkbook.xslt'
        self.defaultValueDict['failFile'] = 'errorLog.log'
        self.defaultValueDict['filingsFolder'] = 'Filings'
        self.defaultValueDict['htmlReportFormat'] = 'Complete'
        self.defaultValueDict['internetConnectivity'] = 'online' # HF change to online default 'offline'
        self.defaultValueDict['noEquity'] = str(False)
        self.defaultValueDict['processingFolder'] = 'Processing'
        self.defaultValueDict['processingFrequency'] = '10'
        self.defaultValueDict['processXsltInBrowser'] = str(False)
        self.defaultValueDict['renderingLogsXslt'] = None
        self.defaultValueDict['renderingService'] = 'Instance'
        self.defaultValueDict['reportFormat'] = 'Html'
        self.defaultValueDict['reportsFolder'] = 'Reports'
        self.defaultValueDict['reportXslt'] = 'InstanceReport.xslt'
        self.defaultValueDict['reportXsltDissem'] = None
        self.defaultValueDict['resourcesFolder'] = "resources"
        self.defaultValueDict['saveTargetInstance'] = str(True)
        self.defaultValueDict['saveTargetFiling'] = str(False)
        self.defaultValueDict['sourceList'] = ''
        self.defaultValueDict['summaryXslt'] = None
        self.defaultValueDict['summaryXsltDissem'] = None
        self.defaultValueDict['totalClean'] = str(False)
        self.defaultValueDict['utrValidate'] = str(False)
        self.defaultValueDict['validate'] = str(False)
        self.defaultValueDict['validateEFM'] = str(False)
        self.defaultValueDict['zipOutputFile'] = None
        self.defaultValueDict['logMessageTextFile'] = None

        # The configDict holds the values as they were read from the config file.
        # Only options that appear with a value that is not None in defaultValueDict are recognized.
        self.configDict = defaultdict(lambda:None)
        configLocation = IoManager.getConfigFile(self,options)
        if configLocation is None: # Although it is odd not to have a config file, it is not an error.
            self.logDebug(_("No config file"))
        else:
            self.logDebug(_("Extracting info from config file {}".format(os.path.basename(configLocation))))
            tree = etree.parse(configLocation)
            for child in tree.iter():
                if child.tag is not etree.Comment and child.text is not None:
                    if child.tag in self.defaultValueDict:
                        value = child.text.strip()
                        if value == '': value = None
                        self.configDict[child.tag] = value
                    elif len(child.text.strip()) > 0: # Extra tags with no content are ignored
                        #message = ErrorMgr.getError('UNSUPPORTED_CONFIG_TAG').format(child.text, child.tag)
                        self.logWarn("Found value {} for unsupported configuration tag {}".format(child.text, child.tag))

    def initializeReOptions(self, options, setCntlrOptions=False):
        self.logDebug("General options:")

        def setProp(prop, init, rangeList=None, cs=False):
            value = next((x
                          for x in [init, self.configDict[prop], self.defaultValueDict[prop]]
                          if x is not None), None)
            if type(value)==str and not cs: value = value.casefold()
            setattr(self, prop, value)
            if rangeList is not None and value not in [x.casefold() for x in rangeList]:
                raise Exception("Unknown {} '{}' not in {} (case insensitive) on command line or config file.".format(prop,value,rangeList))
            self.logDebug("{}=\t{}".format(prop, value))
            return value

        # options applicable to rendering in either mode:
        options.renderingService = setProp('renderingService', options.renderingService, rangeList=['Instance','Daemon'])
        options.reportFormat = setProp('reportFormat', options.reportFormat, rangeList=['Html', 'Xml', 'HtmlAndXml', 'None'])
        options.htmlReportFormat = setProp('htmlReportFormat', options.htmlReportFormat, rangeList=['Complete','Fragment'])
        options.zipOutputFile = setProp('zipOutputFile', options.zipOutputFile,cs=True)
        options.sourceList = " ".join(setProp('sourceList', options.sourceList,cs=True).split()).split(',')
        self.sourceDict={}
        # Parse comma and colon separated list a:b b:c, d:e:f into a dictionary {'a': ('b b','c'), 'd': ('e','f') }:
        for source in options.sourceList:
            if (len(source) > 0):
                s = source.split(':') # we must accomodate spaces in tokens separated by colons
                if (len(s) != 3):
                    self.logWarn("Ignoring bad token {} in {}".format(s,options.sourceList))
                else: # we do not accomodate general URL's in the 'original' field.
                    instance = " ".join(s[0].split())
                    doctype = " ".join(s[1].split())
                    original = " ".join(s[2].split())
                    self.sourceDict[instance]=(doctype,original)

        # These options have to be passed back to arelle via the options object
        # HF, removed:     options.internetConnectivity = setProp('internetConnectivity',options.internetConnectivity, rangeList=['online','offline'])

        def setFlag(flag, init):
            setattr(self, flag, next((Utils.booleanFromString(x)
                                      for x in [init
                                          , self.configDict[flag], self.defaultValueDict[flag]]
                                      if x is not None), None))
            self.logDebug("{}=\t{}".format(flag, getattr(self, flag)))
            return getattr(self, flag)

        # inherited flag: options.abortOnMajorError = setFlag('abortOnMajorError', options.abortOnMajorError)
        setFlag('abortOnMajorError', options.abortOnMajorError)
        setFlag('noRenderingWithError', options.noRenderingWithError)
        options.totalClean = setFlag('totalClean', options.totalClean)
        options.noEquity = setFlag('noEquity', options.noEquity)
        options.auxMetadata = setFlag('auxMetadata', options.auxMetadata)
        options.copyInlineFilesToOutput = setFlag('copyInlineFilesToOutput', options.copyInlineFilesToOutput)
        options.copyXbrlFilesToOutput = setFlag('copyXbrlFilesToOutput', options.copyXbrlFilesToOutput)
        options.zipXbrlFilesToOutput = setFlag('zipXbrlFilesToOutput', options.zipXbrlFilesToOutput)
        options.includeLogsInSummary = setFlag('includeLogsInSummary', options.includeLogsInSummary)
        options.includeLogsInSummaryDissem = setFlag('includeLogsInSummaryDissem', options.includeLogsInSummaryDissem)
        options.processXsltInBrowser = setFlag('processXsltInBrowser', options.processXsltInBrowser)
        self.summaryHasLogEntries = False
        options.saveTargetInstance = setFlag('saveTargetInstance',options.saveTargetInstance)
        options.saveTargetFiling = setFlag('saveTargetFiling',options.saveTargetFiling)
        # note that delete processed filings is only relevant when the input had to be unzipped.
        options.deleteProcessedFilings = setFlag('deleteProcessedFilings', options.deleteProcessedFilings)
        options.debugMode = setFlag('debugMode', options.debugMode)

        # These flags have to be passed back to arelle via the options object.
        # inherited flag: options.validate = setFlag('validate', options.validate)
        setFlag('validate', options.validate)
        # inherited flag: options.utrValidate = setFlag('utrValidate', options.utrValidate)
        setFlag('utrValidate', options.utrValidate)
        # inherited flag: options.validateEFM = setFlag('validateEFM', options.validateEFM)
        setFlag('validateEFM', options.validateEFM)

        if setCntlrOptions:
            # cmd line mode, pass back flags as set here
            options.validate = self.validate
            options.utrValidate = self.utrValidate
            options.validateEFM = self.validateEFM

        def setFolder(folder, init, searchPythonPath=False):
            if searchPythonPath: # if the folder is not an absolute path, we want to look for it relative to the python path.
                value= next((IoManager.absPathOnPythonPath(self,x)
                             for x in [init, self.configDict[folder], self.defaultValueDict[folder]]
                             if x is not None), None)
            else: # otherwise interpret the folder as being relative to some subsequent processing location.
                value = next((x
                              for x in [init, self.configDict[folder], self.defaultValueDict[folder]]
                              if x is not None), None)
            setattr(self, folder, value)
            self.logDebug("{}=\t{}".format(folder, getattr(self, folder)))
            return getattr(self, folder)

        options.processingFolder = setFolder('processingFolder', options.processingFolder)
        self.processInZip = True # bool(options.processingFolder)
        if options.noReportOutput:
            options.reportsFolder = self.reportsFolder = self.initialReportsFolder = None
        else:
            options.reportsFolder = setFolder('reportsFolder', options.reportsFolder)
            # keep initial reports folder, may be relative, if so reset on each new filing
            self.initialReportsFolder = self.reportsFolder
            self.reportInZip = True # bool(options.reportsFolder)
        options.resourcesFolder = setFolder('resourcesFolder', options.resourcesFolder,searchPythonPath=True)


        def setResourceFile(file, init, errstr):
            setattr(self, file, None)
            value = next((x
                          for x in [init, self.configDict[file], self.defaultValueDict[file]]
                          if x is not None), None)
            if value is not None and type(value)==str and len(value)>0:
                if not isdir(self.resourcesFolder):
                    # It is possible to specify a bad resources folder, but then not actually need it;
                    # that is why the test for its presence is here and not earlier.
                    raise Exception("Cannot locate resources folder '{}'".format(self.resourcesFolder))
                value = os.path.join(self.resourcesFolder,value)
                setattr(self, file, value)
                if value is not None and not isfile(value):
                    raise Exception(_(errstr).format(value))
            self.logDebug("{}=\t{}".format(file, value))
            return value

        #setResourceFile('reportXslt', options.reportXslt, 'INVALID_CONFIG_REPORTXSLT')
        options.reportXslt = setResourceFile('reportXslt', options.reportXslt, "Cannot find report xslt {}")
        options.reportXsltDissem = setResourceFile('reportXsltDissem', options.reportXsltDissem, "Cannot find dissemination report xslt {}")
        # Report XSLT is required when reportFormat contains 'Html'.
        if self.reportXslt is None and 'html' in self.reportFormat.casefold():
            raise Exception('No {} specified when {}={} requires it.'.format('reportXslt', 'reportFormat', self.reportFormat))

        # Summary XSLT is optional, but do report if you can't find it.
        #setResourceFile('summaryXslt', options.summaryXslt, 'INVALID_CONFIG_SUMMARYXSLT')
        options.summaryXslt = setResourceFile('summaryXslt', options.summaryXslt, "Cannot find summary xslt {}")
        options.summaryXsltDissem = setResourceFile('summaryXsltDissem', options.summaryXsltDissem, "Cannot find dissemination summary xslt {}")
        options.renderingLogsXslt = setResourceFile('renderingLogsXslt', options.renderingLogsXslt, "Cannot find rendering logs xslt {}")

        # Excel XSLT is optional, but do report if you can't find it.
        #setResourceFile('excelXslt', options.excelXslt, 'INVALID_CONFIG_EXCELXSLT')
        # if options.excelXslt is "True" from web interface, it has no no string value, e.g., &excelXslt (looks like True here)
        options.excelXslt = setResourceFile('excelXslt', "" if options.excelXslt == True else options.excelXslt, "Cannot find excel xslt {}")

        # logMessageTextFile is optional resources file for messages text (SEC format)
        options.logMessageTextFile = setResourceFile('logMessageTextFile', options.logMessageTextFile, "Cannot find logMessageTextFile {}")

        _lang = options.labelLang or self.modelManager.defaultLang
        if _lang in self.labelLangs:
            self.labelLangs.remove(_lang)
        self.labelLangs.insert(0, _lang) # ensure system lang is at start of langs list (highest priority)

        # modelXbrl's must be closed by filingEnd
        options.keepOpen = True

    def copyReAttrOptions(self, options):
        # set EdgarRenderer options from prior processed options object
        self.renderingService = options.renderingService
        self.reportFormat = options.reportFormat
        self.htmlReportFormat = options.htmlReportFormat
        self.zipOutputFile = options.zipOutputFile
        self.sourceList = options.sourceList
        self.sourceDict={}
        # Parse comma and colon separated list a:b b:c, d:e:f into a dictionary {'a': ('b b','c'), 'd': ('e','f') }:
        for source in options.sourceList:
            if (len(source) > 0):
                s = source.split(':') # we must accomodate spaces in tokens separated by colons
                if (len(s) != 3):
                    self.logWarn("Ignoring bad token {} in {}".format(s,options.sourceList))
                else: # we do not accomodate general URL's in the 'original' field.
                    instance = " ".join(s[0].split())
                    doctype = " ".join(s[1].split())
                    original = " ".join(s[2].split())
                    self.sourceDict[instance]=(doctype,original)

        # These options have to be passed back to arelle via the options object
        # HF, removed:     options.internetConnectivity = setProp('internetConnectivity',options.internetConnectivity, rangeList=['online','offline'])

        # inherited flag: options.abortOnMajorError = setFlag('abortOnMajorError', options.abortOnMajorError)
        self.abortOnMajorError = options.abortOnMajorError
        self.noRenderingWithError = options.noRenderingWithError
        self.totalClean = options.totalClean
        self.noEquity = options.noEquity
        self.auxMetadata = options.auxMetadata
        self.copyInlineFilesToOutput = options.copyInlineFilesToOutput
        self.copyXbrlFilesToOutput = options.copyXbrlFilesToOutput
        self.zipXbrlFilesToOutput = options.zipXbrlFilesToOutput
        self.includeLogsInSummary = options.includeLogsInSummary
        self.includeLogsInSummaryDissem = options.includeLogsInSummaryDissem
        self.processXsltInBrowser = options.processXsltInBrowser
        self.summaryHasLogEntries = False
        self.saveTargetInstance = options.saveTargetInstance
        self.saveTargetFiling = options.saveTargetFiling
        # note that delete processed filings is only relevant when the input had to be unzipped.
        self.deleteProcessedFilings = options.deleteProcessedFilings
        self.debugMode = options.debugMode
        # These flags have to be passed back to arelle via the options object.
        # inherited flag: options.validate = setFlag('validate', options.validate)
        self.validate = options.validate
        # inherited flag: options.utrValidate = setFlag('utrValidate', options.utrValidate)
        self.utrValidate = options.utrValidate
        # inherited flag: options.validateEFM = setFlag('validateEFM', options.validateEFM)
        self.validateEFM = options.validateEFM

        self.processingFolder = options.processingFolder
        self.processInZip = True # bool(options.processingFolder)
        self.reportsFolder = options.reportsFolder # dynamically changed to relative of processing instance unless absolute
        # keep initial reports folder, may be relative, if so reset on each new filing
        self.initialReportsFolder = self.reportsFolder
        self.reportInZip = True # bool(options.reportsFolder)
        self.resourcesFolder = options.resourcesFolder

        #setResourceFile('reportXslt', options.reportXslt, 'INVALID_CONFIG_REPORTXSLT')
        self.reportXslt = options.reportXslt
        self.reportXsltDissem = options.reportXsltDissem
        # Report XSLT is required when reportFormat contains 'Html'.
        if self.reportXslt is None and 'html' in self.reportFormat.casefold():
            raise Exception('No {} specified when {}={} requires it.'.format('reportXslt', 'reportFormat', self.reportFormat))

        # Summary XSLT is optional, but do report if you can't find it.
        #setResourceFile('summaryXslt', options.summaryXslt, 'INVALID_CONFIG_SUMMARYXSLT')
        self.summaryXslt = options.summaryXslt
        self.summaryXsltDissem = options.summaryXsltDissem
        self.renderingLogsXslt = options.renderingLogsXslt

        # Excel XSLT is optional, but do report if you can't find it.
        #setResourceFile('excelXslt', options.excelXslt, 'INVALID_CONFIG_EXCELXSLT')
        self.excelXslt = options.excelXslt

        self.logMessageTextFile = options.logMessageTextFile

        if self.isDaemon:
            self.initializeReDaemonOptions(options)

    def initializeReSinglesOptions(self, options):
        # At the moment there are not any options relevant only for single-instance mode.
        return


    def initializeReDaemonOptions(self, options):
        self.logDebug("Daemon Options:")

        def setLocation(location, init, mustExist=False, isfile=False):
            value = next((os.path.join(os.getcwd(), x)
                          for x in [init
                              , self.configDict[location], self.defaultValueDict[location]]
                          if x is not None), None)
            setattr(self, location, value)
            self.logDebug("{}=\t{}".format(location, value))
            if mustExist and value is None:
                raise Exception('No {} specified for Daemon.'.format(location))
            if mustExist and not isfile and not isdir(value):
                raise Exception('No such {} as {}.'.format(location, value))
            return value

        setLocation('filingsFolder', options.filingsFolder)
        setLocation('deliveryFolder', options.deliveryFolder)
        setLocation('errorsFolder', options.errorsFolder)
        setLocation('archiveFolder', options.archiveFolder)
        setLocation('failFile', options.failFile)

        def setProp(prop, init, required=False):
            value = next((x
                          for x in [init, self.configDict[prop], self.defaultValueDict[prop]]
                          if x is not None), None)
            setattr(self, prop, value)
            if required and value is None:
                raise Exception('{} not set for daemon'.format(prop))
            self.logDebug("{}=\t{}".format(prop, getattr(self, prop)))
            return value

        setProp('processingFrequency', options.processingFrequency, required=True)

    @property
    def renderMode(self):
        return self.renderingService.casefold()
    @property
    def isSingles(self):
        return self.renderingService.casefold() == 'instance'
    @property
    def isDaemon(self):
        return self.renderingService.casefold() == 'daemon'


    def daemonDequeueInputZip(self, options):  # returns the location of zip ready to unpack
        # upon exit, options.entrypoint is set to absolute location of the zip file after the move,
        # and self.processingFolder is set to absolute location of where it should be processed.
        inputFileSource = None
        zipfound = False
        options.entrypointFile = None # no entrypoint file(s)
        # check for next filing in input folder
        # as usual, self.{some}Folder is absolute, while options.{some}Folder is what was specified in the input.
        self.originalProcessingFolder = os.path.join(getcwd(), self.processingFolder)
        self.logDebug(_("Checking for the oldest zip file in {}").format(self.filingsFolder))
        while not zipfound:
            for file in sorted(os.listdir(self.filingsFolder), key=lambda file: os.stat(join(self.filingsFolder, file)).st_mtime):
                if not zipfound and Utils.isZipFilename(file):
                    inputFileSource = join(self.filingsFolder, file)
                    self.processingFolder = IoManager.createNewFolder(self,self.originalProcessingFolder,file)
                    # reportsFolder = normpath(join(self.processingFolder,options.reportsFolder))
                    processingFileSource = join(self.processingFolder, file)
                    if not exists(inputFileSource): continue  # it got deleted before we could process it.
                    self.logDebug(_("Found a new zip file to process; moving {} to Processing folder ").format(inputFileSource))
                    try:
                        IoManager.move_clobbering_file(inputFileSource, processingFileSource)
                        options.entrypointFile = processingFileSource
                        zipfound = True
                    except IOError as err:
                        self.logError(str(err))
                        #self.logError(_(ErrorMgr.getError('FILING_MOVE_ERROR').format(self.processingFolder)))
                        self.logError(_("Could not remove {}").format(self.processingFolder))
                        try: removedirs(self.processingFolder)
                        except IOError: continue
                    # provide these parameters to FilingStart via options
                    options.zipOutputFile = join(self.processingFolder, "-out".join(os.path.splitext(file)))
                    options.doneFile = join(self.archiveFolder, file)
                    # self.failFile = join(self.errorsFolder,file)
                    if self.createdFolders: # pass to filing processing any created folders
                        options.daemonCreatedFolders = self.createdFolders
                    break
            # no more files.
            if not zipfound:
                sleep = self.processingFrequency
                self.logDebug(_("Sleeping for " + sleep + " seconds. "))
                time.sleep(float(sleep))
                self.cntlr.logHandler.flush() # flush log buffer (if any)
        return

    def setProcessingFolder(self, filesource, entryPointFile=None):
        if filesource and self.processingFolder == self.defaultValueDict['processingFolder']:
            if filesource.isOpen:
                self.processingFolder = os.path.dirname(filesource.basefile)
            else:
                _url = filesource.url
                #filesource.url may have an inline document set, trim it off
                for pluginXbrlMethod in pluginClassMethods("InlineDocumentSet.Url.Separator"):
                    inlineDocSetSeparator = pluginXbrlMethod()
                    _url = _url.partition(inlineDocSetSeparator)[0]
                self.processingFolder = os.path.dirname(_url)
        if entryPointFile and os.path.exists(entryPointFile): # for testcase, is different than filesource, which points to testcase
            if not (filesource and filesource.isOpen and filesource.isArchive and entryPointFile.startswith(filesource.basefile)):
                self.processingFolder = os.path.dirname(entryPointFile)

    def checkIfDaemonStartup(self, options):
        # startup (when in Deamon mode)
        self.retrieveDefaultREConfigParams(options)
        self.initializeReOptions(options, setCntlrOptions=True)
        # if isDaemon, wait for an input zip to process
        # if not isDaemon, then instance (or zip) is ready to process immediately
        if self.isDaemon:
            self.initializeReDaemonOptions(options)
            IoManager.handleFolder(self, self.filingsFolder, False, False)
            IoManager.handleFolder(self, self.deliveryFolder, False, self.totalClean)
            IoManager.handleFolder(self, self.archiveFolder, False, self.totalClean)
            if self.errorsFolder is not None:  # You might not have an errors folder.
                IoManager.handleFolder(self, self.errorsFolder, False, self.totalClean)
            self.daemonDequeueInputZip(options) # loop, waiting for an input to process, then returns and processes input as if --file specified the input

    def isRunningUnderTestcase(self):
        return (getattr(self.cntlr.modelManager.loadedModelXbrls[0], "modelDocument", None) is not None and
                self.cntlr.modelManager.loadedModelXbrls[0].modelDocument.type in ModelDocument.Type.TESTCASETYPES)

    def filingStart(self, cntlr, options, entrypointFiles, filing):
        # start a (mult-iinstance) filing
        filing.edgarRenderer = self
        self.reportZip = filing.reportZip
        self.writeFile = filing.writeFile
        # Set default config params; overwrite with command line args if necessary
        self.retrieveDefaultREConfigParams(options)
        # Initialize the folders and objects required in both modes.
        if options.sourceList is None: # options is none on first GUI run testcase variation
            self.initializeReOptions(options)
        else: # options previously initialized
            self.copyReAttrOptions(options)
        # Transfer daemonCreatedFilders to this EdgarRenderer to deal with at filingEnd
        if hasattr(options, "daemonCreatedFolders"):
            self.createdFolders.extend(options.daemonCreatedFolders)
            del options.daemonCreatedFolders # don't pass to any subsequent independent filing if any
        mdlMgr = cntlr.modelManager
        self.disclosureSystem = mdlMgr.disclosureSystem
        self.validatedForEFM = ("esef" in self.disclosureSystem.names or # prevent EFM validation messages for "esef" validations
                                (not cntlr.hasGui and mdlMgr.validateDisclosureSystem and getattr(mdlMgr.disclosureSystem, "EFMplugin", False))
                                )
        self.instanceSummaryList = []
        self.instanceList = []
        self.inlineList = []
        self.otherXbrlList = []
        self.supplementList = []
        self.supplementalFileList = []
        self.renderedFiles = filing.renderedFiles # filing-level rendered files
        self.setProcessingFolder(filing.filesource)
        self.abortedDueToMajorError = False
        if self.isDaemon:
            self.zipOutputFile = options.zipOutputFile
            self.doneFile = options.doneFile
        self.isWorkstationFirstPass = os.path.split(self.reportXslt or "")[-1] == "EdgarWorkstationInstanceReport.xslt"

    def processInstance(self, options, modelXbrl, filing, report):
        # skip rendering if major errors and abortOnMajorError
        # errorCountDuringValidation = len(Utils.xbrlErrors(modelXbrl))
        # won't work for all possible logHandlers (some emit immediately)
        attachmentDocumentType = getattr(modelXbrl, "efmAttachmentDocumentType", "(none)")
        # strip on error if preceding primary inline instance had no error and exhibitType strips on error
        stripExhibitOnError = self.success and bool(
                              filing.exhibitTypesStrippingOnErrorPattern.match(attachmentDocumentType))
        errorCountDuringValidation = sum(1 for e in modelXbrl.errors if isinstance(e, str) and not e.startswith("DQC.")) # don't count assertion results dict if formulas ran
        success = True
        if errorCountDuringValidation > 0:
            if self.abortOnMajorError: # HF renderer raises exception on major errors: self.modelManager.abortOnMajorError:
                self.logFatal(_("Not attempting to render after {} validation errors").format(
                    errorCountDuringValidation))
                self.abortedDueToMajorError = True
                return
            else:
                self.logInfo(_("Ignoring {} Validation errors because abortOnMajorError is not set.").format(errorCountDuringValidation))
                if not self.isRunningUnderTestcase():
                    success = False
        modelXbrl.profileActivity()
        self.setProcessingFolder(modelXbrl.fileSource, report.filepaths[0]) # use first of possibly multi-doc IXDS files
        # if not reportZip and reportsFolder is relative, make it relative to source file location (on first report)
        if (success or not self.noRenderingWithError) and not filing.reportZip and self.initialReportsFolder and len(filing.reports) == 1:
            if not os.path.isabs(self.initialReportsFolder):
                # try input file's directory
                if os.path.exists(self.processingFolder) and os.access(self.processingFolder, os.W_OK | os.X_OK):
                    self.reportsFolder = os.path.join(self.processingFolder, self.initialReportsFolder)
                else:
                    _dir = modelXbrl.modelManager.cntlr.webCache.urlToCacheFilepath(self.processingFolder)
                    # try cache directory locating reportsFolder where the entry point instance is in cache
                    if os.path.exists(_dir) and os.access(_dir, os.W_OK | os.X_OK):
                        self.reportsFolder = os.path.join(_dir, self.initialReportsFolder)
                    else: # a temp directory
                        self.reportsFolder = tempfile.mkdtemp(prefix="EdgarRenderer_") # Mac or Windows temp directory
            IoManager.handleFolder(self, self.reportsFolder, True, self.totalClean)
        self.renderedFiles = report.renderedFiles # report-level rendered files
        for basename in report.basenames:
            if report.isInline:
                if basename not in self.inlineList:
                    self.inlineList.append(basename)
            elif basename.endswith(".xml"):
                if basename not in self.instanceList:
                    self.instanceList.append(basename)
        for reportedFile in sorted(report.reportedFiles):
            if Utils.isImageFilename(reportedFile):
                self.supplementalFileList.append(reportedFile)
                self.supplementList.append(reportedFile)
            #elif reportedFile.endswith(".htm"): # the non-inline primary document isn't known to Arelle yet in EDGAR
            #    self.inlineList.append(reportedFile)
            elif reportedFile not in report.basenames:
                self.otherXbrlList.append(reportedFile)
        RefManager.RefManager(self.resourcesFolder).loadAddedUrls(modelXbrl, self)  # do this after validation.
        self.loopnum = getattr(self, "loopnum", 0) + 1
        try:
            if success or not self.noRenderingWithError: # no instance errors from prior validation workflow
                # recheck for errors
                if (stripExhibitOnError and sum(1 for e in modelXbrl.errors if isinstance(e, str)) > 0):
                    success = False
                    self.logDebug(_("Stripping filing due to {} preceding validation errors.").format(errorCountDuringValidation))
            if success or not self.noRenderingWithError:
                # add missing IDs to inline documents
                for ixdsHtmlRootElt in getattr(modelXbrl, "ixdsHtmlElements", ()):
                    doc = ixdsHtmlRootElt.modelDocument
                    hasIdAssignedFact = False
                    for e in ixdsHtmlRootElt.iter(doc.ixNStag + "nonNumeric", doc.ixNStag + "nonFraction", doc.ixNStag + "fraction"):
                        if getattr(e, "xValid", 0) >= VALID and not e.id: # id is optional on facts but required for ixviewer-plus and arelle inline viewers
                            id = f"ixv-{e.objectIndex}"
                            if id in doc.idObjects or id in modelXbrl.ixdsEltById:
                                for i in range(1000):
                                    uid = f"{id}_{i}"
                                    if uid not in doc.idObjects and uid not in modelXbrl.ixdsEltById:
                                        id = uid
                                        break
                            e.set("id", id)
                            doc.idObjects[id] = e
                            modelXbrl.ixdsEltById[id] = e
                            hasIdAssignedFact = True
                    if (hasIdAssignedFact or self.isWorkstationFirstPass) and self.reportsFolder:
                        self.cntlr.editedIxDocs[doc.basename] = doc # causes it to be rewritten out
                        self.cntlr.editedModelXbrls.add(modelXbrl)
                if self.isWorkstationFirstPass:
                    if modelXbrl in self.cntlr.editedModelXbrls:
                        suffix = "_ht2." # private extracted instance for workstation
                    else:
                        suffix = "_ht1." # non-private extracted instance for workstation
                else:
                    suffix = "_htm." # extracted instance if not workstation
                Inline.saveTargetDocumentIfNeeded(self, options, modelXbrl, filing, suffix=suffix)
        except Utils.RenderingException as ex:
            success = False # error message provided at source where exception was raised
            self.logDebug(_("RenderingException after {} validation errors: {}").format(errorCountDuringValidation, ex))
        except Exception as ex:
            success = False
            action = "complete validation" if options.noReportOutput else "produce output"
            if errorCountDuringValidation > 0:
                self.logWarn(_("The rendering engine was unable to {} after {} validation errors.").format(action, errorCountDuringValidation))
            else:
                self.logWarn(_("The rendering engine was unable to {} due to an internal error.  This is not considered an error in the filing.").format(action, errorCountDuringValidation))
            self.logDebug(_("Exception traceback: {}").format(traceback.format_exception(*sys.exc_info())))
        self.renderedFiles = filing.renderedFiles # filing-level rendered files
        if not success:
            if stripExhibitOnError:
                modelXbrl.log("INFO-RESULT",
                              "EFM.stripExhibit",
                              _("Attachment {} has errors requiring stripping its files").format(attachmentDocumentType),
                              modelXbrl=modelXbrl,
                              exhibitType=attachmentDocumentType,
                              files="|".join(sorted(report.reportedFiles)))
                filing.reports.remove(report) # remove stripped report from filing (so it won't be in zip)
            else:
                self.success = False
        # remove any inline invalid facts, assign and note if any missing IDs
        for ixdsHtmlRootElt in getattr(modelXbrl, "ixdsHtmlElements", ()):
            doc = ixdsHtmlRootElt.modelDocument
            _ixHidden = doc.ixNStag + "hidden"
            hasEditedFact = False
            elementsToRemove = []
            for e in ixdsHtmlRootElt.iter(doc.ixNStag + "nonNumeric", doc.ixNStag + "nonFraction", doc.ixNStag + "fraction"):
                if getattr(e, "xValid", 0) < VALID:
                    e.set("title", f"Removed invalid ix:{e.tag.rpartition('}')[2]} element, fact {e.qname} contextId {e.contextID}")
                    for attr in e.keys():
                        if attr not in ("id", "title"):
                            etree.strip_attributes(e, attr)
                    if e.getparent().tag == _ixHidden:
                        e.addprevious(etree.Comment(f"Removed invalid ix:{e.tag.rpartition('}')[2]} element, fact {e.qname} contextId {e.contextID}: \"{(e.text or '').replace('--','- -')}\""))
                        elementsToRemove.append(e)
                    elif (e.getparent().tag == "{http://www.w3.org/1999/xhtml}body" or
                        any(c.tag in ("{http://www.w3.org/1999/xhtml}table", "{http://www.w3.org/1999/xhtml}div")
                            for c in e.iterchildren())):
                        e.tag = "{http://www.w3.org/1999/xhtml}div"
                    else:
                        e.tag = "{http://www.w3.org/1999/xhtml}span"
                    hasEditedFact = True
            for e in elementsToRemove: # remove ix hidden invalid elements
                e.getparent().remove(e)
            if hasEditedFact:
                self.cntlr.editedIxDocs[doc.basename] = doc # causes it to be rewritten out
        # block closing filesource when modelXbrl closes because it's used by filingEnd (and may be an archive)
        modelXbrl.closeFileSource = False
        modelXbrl.profileStat(_("EdgarRenderer process instance {}").format(report.basenames[0]))

    def loadLogMessageText(self):
        self.logMessageText = {}
        if self.logMessageTextFile:
            try:
                for msgElt in etree.parse(self.logMessageTextFile).iter("message"):
                    self.logMessageText[msgElt.get("code")] = re.sub(
                        r"\$\((\w+)\)", r"%(\1)s", msgElt.text.strip())
            except Exception as ex:
                self.logDebug(_("Exception loading logMessageText file, traceback: {}").format(traceback.format_exception(*sys.exc_info())))
                self.logMessageText.clear() # don't leave possibly erroneous messages text entries

    def formatLogMessage(self, logRec):
        logHandler = self.cntlr.logHandler
        fileLines = defaultdict(set)
        for ref in logRec.refs:
            href = ref.get("href")
            if href:
                fileLines[href.partition("#")[0]].add(ref.get("sourceLine", 0))
        _text = logHandler.format(logRec) # sets logRec.file
        if hasattr(logHandler.formatter, "fileLines"):
            _fileLines = logHandler.formatter.fileLines(logRec)
            if _fileLines:
                _text += " - " + _fileLines # default if no {refSources} or other in the ArelleMessagesText
        try:
            # try edgarCode and if not there, try messageCode
            if isinstance(logRec.args,dict) and logRec.args.get("edgarCode") in self.logMessageText:
                _msgText = self.logMessageText[logRec.args.get("edgarCode")]
            elif logRec.messageCode in self.logMessageText:
                _msgText = self.logMessageText[logRec.messageCode]
            else:
                return _text
            _msgParams = logParamEscapePattern.findall(_msgText) # finds all parameters
            _msgArgs = logRec.args.copy() # duplicate functinoality of ArelleMessageWrapper.java
            _refNum = 0
            _fileLines = defaultdict(set)
            for _ref in logRec.refs:
                _href = _ref.get("href")
                if _href:
                    _hrefUrlParts = href.split("#")
                    if len(_hrefUrlParts) > 0:
                        _refNum += 1
                        _fileName = _hrefUrlParts[0].rpartition("/")[2]
                        _sourceLine = _ref.get("sourceLine")
                        if _sourceLine:
                            _source = "{} line {}".format(_fileName, _sourceLine)
                            if "refLine" not in _msgArgs:
                                _msgArgs["refLine"] = _sourceLine
                        else:
                            _source = _fileName
                        if "refSource" not in _msgArgs: # first only
                            _msgArgs["refSource"] = _source
                            _msgArgs["refUrl"] = _fileName
                        else:
                            _msgArgs["refSource{}".format(_refNum)] = _source
                            if "refSources2_n" in _msgArgs:
                                _msgArgs["refSources2_n"] = _msgArgs.get("refSources2_n") + ", " + _source
                            else:
                                _msgArgs["refSources2_n"] = _source
                        _fileLines[_fileName].add(_sourceLine)
            if logRec.refs:
                _msgArgs["refSources"] = Cntlr.logRefsFileLines(logRec.refs)
            _text = logParamEscapePattern.sub(r"{\1}", # substitute java {{x} into py {{x}}} but leave {{x}} as it was
                    _msgText
                    ).format(**_msgArgs) # now uses {...} parameters in arelleMessagesText
        except KeyError:
            pass # not replacable messageCode or a %(xxx)s format arg was not in the logRec arcs or it's a $() java function reference
        except ValueError as err: # error inn { ... } parameters specification
            self.logDebug("Message format string error {} in string {}".format(err, logRec.messageCode))
        return _text

    def transformFilingSummary(self, filing, rootETree, xsltFile, reportsFolder, htmFileName, includeLogs, title=None, zipDir=""):
        summary_transform = etree.XSLT(etree.parse(xsltFile))
        trargs = {"asPage": etree.XSLT.strparam('true'),
                  "accessionNumber": "'{}'".format(getattr(filing, "accessionNumber", "")),
                  "resourcesFolder": "'{}'".format(self.resourcesFolder.replace("\\","/")),
                  "processXsltInBrowser": etree.XSLT.strparam(str(self.processXsltInBrowser).lower()),
                  "includeLogs": etree.XSLT.strparam(str(includeLogs).lower()),
                  "includeExcel": etree.XSLT.strparam("true" if (self.excelXslt) else "false")}
        if title:
            trargs["title"] = etree.XSLT.strparam(title)
        result = summary_transform(rootETree, **trargs)
        IoManager.writeHtmlDoc(filing, result, self.reportZip, reportsFolder, htmFileName, zipDir);

    def filingEnd(self, cntlr, options, filesource, filing, sourceZipStream=None, *args, **kwargs):
        # note that filesource is None if there were no instances
        if self.abortedDueToMajorError:
            self.success = False # major errors detected

        # logMessageText needed for successful and unsuccessful termination
        self.loadLogMessageText()

        # GUI operation with redact or redline present requires dissem outputs without new suffixes
        hasPrivateData = bool(cntlr.redactTgtElts) or bool(cntlr.redlineIxDocs)
        isGUIprivateView = hasPrivateData and cntlr.hasGui

        if self.success or not self.noRenderingWithError:
            try:
                # transform XSLT files
                reportXslt = None
                if self.reportXslt:
                    _xsltStartedAt = time.time()
                    reportXslt = etree.XSLT(etree.parse(self.reportXslt))
                    if self.reportXsltDissem:
                        reportXsltDissem = etree.XSLT(etree.parse(self.reportXsltDissem))
                    else:
                        reportXsltDissem = None
                    self.logDebug("Excel XSLT transform {:.3f} secs.".format(time.time() - _xsltStartedAt))
                # R files can be produced after knowing if any instance had private data
                self.nextFileNum = 1 # important for naming file numbers for multi-instance filings
                self.nextUncategorizedFileNum = 9999
                self.nextBarChartFileNum = 0
                rFilePrefix="Private" if hasPrivateData and self.isWorkstationFirstPass else None
                for report in filing.reports:
                    Filing.mainFun(self, report.modelXbrl, self.reportsFolder, transform=reportXslt, rFilePrefix=rFilePrefix) # dissem suffix
                if self.xlWriter and self.hasXlout:
                    _startedAt = time.time()
                    self.xlWriter.save()
                    self.xlWriter.close()
                    self.xlWriter = None
                    self.logDebug("Excel saving complete {:.3f} secs.".format(time.time() - _startedAt))
                def copyResourceToReportFolder(filename):
                    source = join(self.resourcesFolder, filename)
                    if self.reportZip:
                        self.reportZip.write(source, filename)
                    elif self.reportsFolder is not None:
                        target = join(self.reportsFolder, filename)
                        if not exists(target) and filesource is not None:
                            os.makedirs(self.reportsFolder, exist_ok=True)
                            file = filesource.file(source, binary=True)[0]  # returned in a tuple
                            filing.writeFile(target, file.read()) # shutil.copyfile(source, target)
                            self.renderedFiles.add(filename)
                _startedAt = time.time()
                if 'html' in (self.reportFormat or "").casefold() or self.summaryXslt is not None:
                    copyResourceToReportFolder("Show.js")
                    copyResourceToReportFolder("report.css")
                if self.summaryXslt and len(self.summaryXslt) > 0 and self.processXsltInBrowser:
                    copyResourceToReportFolder("RenderingLogs.xslt")  # TODO: This will go away
                    self.renderedFiles.add("RenderingLogs.xslt")
                # TODO: At this point would be nice to call out any files not loaded in any instance DTS
                inputsToCopyToOutputList = self.supplementList
                if options.copyInlineFilesToOutput:
                    inputsToCopyToOutputList += self.inlineList
                if options.copyXbrlFilesToOutput:
                    for report in filing.reports:
                        inputsToCopyToOutputList += report.reportedFiles
                for filename, doc in cntlr.editedIxDocs.items():
                    uncloseSelfClosedTags(doc)
                    if filename not in inputsToCopyToOutputList:
                        inputsToCopyToOutputList.append(filename)
                if inputsToCopyToOutputList and filing.entrypointfiles: # filesource will be not None
                    # any redline containing files will still have the redline markups, as these files are for workstation or GUI viewing
                    _xbrldir = os.path.dirname(filing.entrypointfiles[0]["file"].partition('#')[0])  # strip any # or IXDS suffix
                    # files to copy are in zip archive
                    for filename in set(inputsToCopyToOutputList): # set() to deduplicate if multiple references
                        _filepath = os.path.join(_xbrldir, filename)
                        if filename in cntlr.editedIxDocs:
                            serializedDoc = serializeXml(cntlr.editedIxDocs[filename].xmlRootElement)
                            if self.isWorkstationFirstPass:
                                filename = filename.replace(".htm", "_ix2.htm" if hasPrivateData else "_ix1.htm")
                        elif sourceZipStream is not None:
                            with FileSource.openFileSource(_filepath, cntlr, sourceZipStream).file(_filepath, binary=True)[0] as fout:
                                serializedDoc = fout.read()
                        else:
                            if filesource.isArchive and filesource.baseurl == _xbrldir:
                                # filename may not include parent directories within the zip
                                for f in filesource.dir:
                                    if f.endswith(filename): # use this dir in the zip
                                        _filepath = os.path.join(_xbrldir, f)
                                        break
                            with filesource.file(_filepath, binary=True)[0] as fout:  # returned in a tuple
                                serializedDoc = fout.read()
                        if self.reportZip:
                            if filename not in self.reportZip.namelist():
                                self.reportZip.writestr(filename, serializedDoc)
                        elif self.reportsFolder is not None:
                            reportsFolderFilePath = join(self.reportsFolder, filename)
                            if exists(reportsFolderFilePath): remove(reportsFolderFilePath)
                            filing.writeFile(reportsFolderFilePath, serializedDoc)

                self.logDebug("Instance post-processing complete {:.3f} secs.".format(time.time() - _startedAt))

                # temporary work-around to create SDR summaryDict
                if not self.sourceDict and any(
                        report.deiDocumentType # HF: believe condition wrong: and report.documentType.endswith(" SDR")
                        for report in filing.reports): # filesource will not be None
                    for report in filing.reports:
                        for i, basename in enumerate(report.basenames): # has multiple entries for multi-document IXDS
                            filepath = report.filepaths[i]
                            if report.isInline:
                                self.sourceDict[basename] = (report.deiDocumentType, basename)
                            else:
                                for ext in (".htm", ".txt"):
                                    sourceFilepath = filepath.rpartition(".")[0] + ext
                                    if filesource.exists(sourceFilepath):
                                        self.sourceDict[basename] = (report.deiDocumentType, os.path.basename(sourceFilepath))
                                        break

                summary = Summary.Summary(self)
                rootETree = summary.buildSummaryETree()
                dissemReportsFolder = None
                if self.reportZip or self.reportsFolder is not None:
                    IoManager.writeXmlDoc(filing, rootETree, self.reportZip, self.reportsFolder, 'FilingSummary.xml')
                    # generate supplemental AllReports and other such outputs at this time
                    for supplReport in pluginClassMethods("EdgarRenderer.FilingEnd.SupplementalReport"):
                        supplReport(cntlr, filing, self.reportsFolder)
                    # if there's a dissem directory and no logs, remove summary logs
                    if (hasPrivateData or
                        self.summaryXslt and len(self.summaryXslt) > 0 and (self.summaryXsltDissem or self.reportXsltDissem)):
                        dissemReportsFolder = os.path.join(self.reportsFolder, "dissem")
                        os.makedirs(dissemReportsFolder, exist_ok=True)
                    if dissemReportsFolder:
                        redactTgtElts = dict((c.id, c) for c in cntlr.redactTgtElts) # id's assigned during report processing but not necessarily available at load time
                        removableCntxs = set()
                        removableUnits = set()
                        hasRedactedContinuation = False
                        revalidateXbrl = False
                        for f in redactTgtElts.values():
                            if isinstance(f, ModelFact):
                                if f.id in redactTgtElts:
                                    f.xValid = NONE # take out of active model
                                    removableCntxs.add(f.context)
                                    if f.unit is not None:
                                        removableUnits.add(f.unit)
                                    revalidateXbrl = True
                            elif f.tag == "{http://www.xbrl.org/2013/inlineXBRL}continuation":
                                hasRedactedContinuation = True
                        for report in filing.reports:
                            modelXbrl = report.modelXbrl
                            # bypass continuedAt's to redacted elements
                            if redactTgtElts: # if any redacted continued at elements
                                for ixdsHtmlRootElt in getattr(modelXbrl, "ixdsHtmlElements", ()):
                                    hasEditedCont = False
                                    for e in ixdsHtmlRootElt.getroottree().iterfind(".//{http://www.xbrl.org/2013/inlineXBRL}*[@continuedAt]"):
                                        contAt = e.get("continuedAt", None)
                                        while contAt in redactTgtElts: # may be multiple continuations in redacted sections
                                            nextContAtElt = redactTgtElts[contAt]
                                            if nextContAtElt is not None:
                                                contAt = nextContAtElt.get("continuedAt")
                                                if contAt:
                                                    e.set("continuedAt", contAt)
                                                else:
                                                    e.attrib.pop("continuedAt", None)
                                                e._continuationElement = getattr(nextContAtElt, "_continuationElement", None)
                                            else:
                                                e.attrib.pop("continuedAt", None)
                                                e._continuationElement = contAt = None
                                            hasEditedCont = True
                                    for e in ixdsHtmlRootElt.iter("{http://www.xbrl.org/2013/inlineXBRL}relationship"):
                                        if any(ref in cntlr.redactTgtElts
                                               for refsAttr in ("fromRefs", "toRefs")
                                               for refs in e.get(refsAttr)
                                               for ref in refs):
                                            hasEditedCont = True
                                            for refsAttr in ("fromRefs", "toRefs"):
                                                refs = (ref for refs in e.get(refsAttr) if ref not in cntlr.redactTgtElts)
                                                if refs: # any refs remain
                                                    e.set(' '.join(refs))
                                                else:
                                                    e.getparent().remove(e) # remove this relationship
                                                    break
                                    if removableCntxs: # check for orphaned contexts
                                        for e in ixdsHtmlRootElt.iter("{http://www.xbrl.org/2003/instance}context"):
                                            if e in removableCntxs and not any((f.id not in redactTgtElts) for f in modelXbrl.facts if isinstance(f, ModelFact) and f.context == e):
                                                e.getparent().remove(e) # remove this context
                                                e.modelXbrl.contexts.pop(e.id, None)
                                                hasEditedCont = True
                                    if removableUnits: # check for orphaned units
                                        for e in ixdsHtmlRootElt.iter("{http://www.xbrl.org/2003/instance}unit"):
                                            if e in removableUnits and not any((f.id not in redactTgtElts) for f in modelXbrl.facts and f.id not in redactTgtElts and isinstance(f, ModelFact) and f.unit == e):
                                                e.getparent().remove(e) # remove this context
                                                e.modelXbrl.units.pop(e.id, None)
                                                hasEditedCont = True
                                    if hasEditedCont:
                                        doc = ixdsHtmlRootElt.modelDocument
                                        cntlr.redlineIxDocs[doc.basename] = doc # causes it to be rewritten out
                                        cntlr.editedModelXbrls.add(report.modelXbrl)
                                        revalidateXbrl = True
                            # rebuild redacted continuation chains
                            if hasRedactedContinuation:
                                for f in modelXbrl.facts:
                                    if f.get("continuedAt") and hasattr(f, "_ixValue") and f.xValid >= VALID:
                                        del f._ixValue # force rebuilding continuation chain value
                                        f.xValid = UNVALIDATED
                                        xmlValidate(f.modelXbrl, f, ixFacts=True)
                                for rel in modelXbrl.relationshipSet("XBRL-footnotes").modelRelationships:
                                    f = rel.toModelObject
                                    if isinstance(f, ModelInlineFootnote):
                                        del f._ixValue # force rebuilding continuation chain value
                                        xmlValidate(f.modelXbrl, f, ixFacts=True)
                                revalidateXbrl = True

                        # redline-removed docs have self-closed <p> and other elements which must not be self-closed when saved
                        # inform user we are schema- and xbrl- revalidating
                        for reportedFile, doc in cntlr.redlineIxDocs.items():
                            edgarRendererRemoveRedlining(doc)
                            uncloseSelfClosedTags(doc)
                            cntlr.editedIxDocs[reportedFile] = doc # add to editedIxDocs for output in dissem zip and dissem folder
                        if cntlr.redlineIxDocs:
                            self.logInfo(f"Revalidating xhtml{', xbrl and EFM ' if revalidateXbrl else ' '}after redline removal or redaction")
                        for report in filing.reports:
                            for ixdsHtmlRootElt in getattr(report.modelXbrl, "ixdsHtmlElements", ()):
                                if ixdsHtmlRootElt.modelDocument.basename in cntlr.redlineIxDocs:
                                    # revalidate schema validation
                                    xhtmlValidate(report.modelXbrl, ixdsHtmlRootElt)
                            if revalidateXbrl:
                                # revalidate after redaction
                                Validate.validate(report.modelXbrl)
                    self.renderedFiles.add("FilingSummary.xml")
                    if self.renderingLogsXslt and self.summaryHasLogEntries and not self.processXsltInBrowser:
                        _startedAt = time.time()
                        logs_transform = etree.XSLT(etree.parse(self.renderingLogsXslt))
                        result = logs_transform(rootETree, asPage=etree.XSLT.strparam('true'))
                        self.logDebug("RenderingLogs XSLT transform {:.3f} secs.".format(time.time() - _startedAt))
                        IoManager.writeHtmlDoc(filing, result, self.reportZip, self.reportsFolder, 'RenderingLogs.htm')
                        self.renderedFiles.add("RenderingLogs.htm")
                    if self.summaryXslt and len(self.summaryXslt) > 0 :
                        _startedAt = time.time()
                        self.transformFilingSummary(filing, rootETree, self.summaryXslt, self.reportsFolder,
                                                    "PrivateFilingSummary.htm" if hasPrivateData and self.isWorkstationFirstPass else "FilingSummary.htm",
                                                    True,
                                                    "Private Filing Data" if hasPrivateData else None)
                        self.renderedFiles.add("FilingSummary.htm")
                        self.logDebug("FilingSummary XSLT transform {:.3f} secs.".format(time.time() - _startedAt))
                    if self.hasIXBRLViewer:
                        self.renderedFiles.add("ixbrlviewer.html")
                        _startedAt = time.time()
                        for generate in pluginClassMethods("iXBRLViewer.Generate"):
                            generate(cntlr, self.reportsFolder, "/ixviewer-arelle/ixbrlviewer-1.4.11.js", useStubViewer="ixbrlviewer.xhtml", saveStubOnly=True)
                        self.logDebug("Arelle viewer generated {:.3f} secs.".format(time.time() - _startedAt))
                        if self.isWorkstationFirstPass and not hasPrivateData:
                            _startedAt = time.time()
                            for generate in pluginClassMethods("iXBRLViewer.Generate"):
                                generate(cntlr, dissemReportsFolder, "/arelleViewer-1.4.11/ixbrlviewer.js", useStubViewer="ixbrlviewer.xhtml.dissem", saveStubOnly=True)
                            self.logDebug("Arelle viewer for dissemination generated {:.3f} secs.".format(time.time() - _startedAt))
                    self.logDebug("Write filing summary complete")
                    if self.auxMetadata or filing.hasInlineReport:
                        summary.writeMetaFiles()
                        self.logDebug("Write meta files complete")
                    if self.zipXbrlFilesToOutput and (hasattr(filing, "accessionNumber") or filing.entrypointfiles):
                        if hasattr(filing, "accessionNumber"):
                            _fileName = filing.accessionNumber + "-xbrl.zip"
                        elif filing.reports and filing.reports[0].basenames: # handles inline document set contents
                            _fileName = os.path.splitext(filing.reports[0].basenames[0])[0] + ".zip"
                        else:
                            _entrypoint = filing.entrypointfiles[0]
                            if "ixds" in _entrypoint:
                                _fileName = _entrypoint["ixds"][0]["file"]
                            else:
                                _fileName = _entrypoint["file"]
                            _fileName = os.path.splitext(os.path.basename(_fileName.partition('#')[0]))[0] + ".zip"
                        zipStream = io.BytesIO()
                        xbrlZip = zipfile.ZipFile(zipStream, 'w', zipfile.ZIP_DEFLATED, True)
                        for report in filing.reports:
                            for filepath in report.filepaths: # may be multi-document IXDS (even in different directories)
                                _xbrldir = os.path.dirname(filepath)
                                for reportedFile in sorted(report.reportedFiles):
                                    if reportedFile not in xbrlZip.namelist():
                                        if reportedFile in cntlr.editedIxDocs:
                                            doc = cntlr.editedIxDocs[reportedFile]
                                            # redline removed file is not readable in encoded version, create from dom in memory
                                            xbrlZip.writestr(reportedFile, serializeXml(doc.xmlRootElement).decode('utf-8'))
                                        else:
                                            if filesource.isArchive and reportedFile in filesource.dir:
                                                _filepath = os.path.join(filesource.baseurl, reportedFile)
                                            else:
                                                _filepath = os.path.join(_xbrldir, reportedFile)
                                            if sourceZipStream is not None:
                                                file = FileSource.openFileSource(_filepath, cntlr, sourceZipStream).file(_filepath, binary=True)[0]
                                            else:
                                                file = filesource.file(_filepath, binary=True)[0]  # returned in a tuple
                                            xbrlZip.writestr(reportedFile, file.read())
                                            file.close()
                        xbrlZip.close()
                        zipStream.seek(0)
                        if self.reportZip:
                            if dissemReportsFolder:
                                _fileName = "dissem/" + _fileName
                            self.reportZip.writestr(_fileName, zipStream.read())
                        else:
                            self.writeFile(os.path.join(self.reportsFolder, _fileName), zipStream.read())
                        zipStream.close()
                        self.logDebug("Write {} complete".format(_fileName))

                # save documents with removed redlines (only when saving dissemReportsFolder)
                if dissemReportsFolder:
                    dissemSuffix = ".dissem" if self.isWorkstationFirstPass else ""
                    inputsToCopyToOutput = set(inputsToCopyToOutputList) - cntlr.editedIxDocs.keys()
                    for reportedFile, modelDocument in cntlr.editedIxDocs.items():
                        ix = serializeXml(modelDocument.xmlRootElement)
                        if self.reportZip:
                            self.reportZip.writestr("dissem/" + reportedFile, ix)
                        else:
                            dissemFilePath = join(dissemReportsFolder, reportedFile) + dissemSuffix
                            filing.writeFile(dissemFilePath, ix)
                            if self.isWorkstationFirstPass: # save redacted as .ht1 for workstation
                                filePath = join(self.reportsFolder, reportedFile).replace(".htm", "_ix1.htm")
                                filing.writeFile(filePath, ix)
                        ix = None # dereference
                    if not self.isWorkstationFirstPass:
                        if self.reportZip:
                            self.reportZip.write(os.path.join(self.resourcesFolder, "report.css"), "dissem/report.css")
                        else:
                            shutil.copyfile(os.path.join(self.resourcesFolder, "report.css"), os.path.join(dissemReportsFolder, "report.css"))
                    for report in filing.reports:
                        modelXbrl = report.modelXbrl
                        if modelXbrl in cntlr.editedModelXbrls:
                            if self.isWorkstationFirstPass: # save redacted as .ht1 for workstation
                                Inline.saveTargetDocumentIfNeeded(self, options, modelXbrl, filing, suffix="_ht1.")
                                Inline.saveTargetDocumentIfNeeded(self, options, modelXbrl, filing) # EDGAR dissemination file goes in report folder so it gets into EDGAR database
                            else:
                                Inline.saveTargetDocumentIfNeeded(self, options, modelXbrl, filing, altFolder=dissemReportsFolder, suplSuffix=dissemSuffix, zipDir="dissem/")
                        elif hasattr(modelXbrl, "ixTargetFilename"):
                            inputsToCopyToOutput.add(modelXbrl.ixTargetFilename)
                    for filename in inputsToCopyToOutput:
                        if isGUIprivateView or filename.endswith("_ht2.xml") or filename.endswith("_ix2.htm"):
                            _filepath = os.path.join(self.reportsFolder, filename)
                            with FileSource.openFileSource(_filepath, cntlr, sourceZipStream).file(_filepath, binary=True)[0] as fout:
                                serializedDoc = fout.read()
                            if not isGUIprivateView:
                                _filepath.replace("_ht2.xml", "_ht1.xml").replace("_ix2.htm", "_ix1.htm")
                            if self.reportZip:
                                self.reportZip.writestr("dissem/" + filename, serializedDoc)
                            else:
                                filing.writeFile(os.path.join(dissemReportsFolder, os.path.basename(_filepath)), serializedDoc)


                    # reissue R files and excel after validation
                    if hasPrivateData:
                        # dissemination and Arelle GUI redacted R file
                        self.nextFileNum = 1 # important for naming file numbers for multi-instance filings
                        self.nextUncategorizedFileNum = 9999
                        self.nextBarChartFileNum = 0
                        self.instanceSummaryList = []
                        for report in filing.reports:
                            if self.isWorkstationFirstPass:
                                Filing.mainFun(self, report.modelXbrl, dissemReportsFolder, transform=reportXsltDissem, suplSuffix=dissemSuffix, # dissem suffix, Arelle GUI
                                               altFolder=self.reportsFolder, altTransform=reportXslt) # workstation redacted R file
                            else: # Arelle GUI operation
                                Filing.mainFun(self, report.modelXbrl, dissemReportsFolder, transform=reportXslt, zipDir="dissem/") # no suffix, Arelle GUI
                        summary = Summary.Summary(self)
                        rootETree = summary.buildSummaryETree()
                        summary.removeSummaryLogs() # produce filing summary without logs
                        if self.isWorkstationFirstPass: # workstation needs redacted filing summary
                            IoManager.writeXmlDoc(filing, rootETree, self.reportZip, dissemReportsFolder, 'FilingSummary.xml' + dissemSuffix)
                            if self.summaryXslt:
                                self.transformFilingSummary(filing, rootETree, self.summaryXslt, self.reportsFolder, "FilingSummary.htm", True, "Public Filing Data")
                        else:
                            IoManager.writeXmlDoc(filing, rootETree, self.reportZip, dissemReportsFolder, 'FilingSummary.xml' + dissemSuffix, zipDir="dissem/")
                            if self.summaryXslt:
                                self.transformFilingSummary(filing, rootETree, self.summaryXslt, dissemReportsFolder, "FilingSummary.htm" + dissemSuffix, True, "Public Filing Data", zipDir="dissem/")
                        if self.xlWriter and self.hasXlout:
                            _startedAt = time.time()
                            self.xlWriter.save(suffix=dissemSuffix, zipDir="dissem/")
                            self.xlWriter.close()
                            self.xlWriter = None
                            self.logDebug("Excel saving complete {:.3f} secs.".format(time.time() - _startedAt))
                        # generate supplemental AllReports and other such outputs at this time
                        for supplReport in pluginClassMethods("EdgarRenderer.FilingEnd.SupplementalReport"):
                            supplReport(cntlr, filing, dissemReportsFolder, zipDir="dissem/")
                        if self.hasIXBRLViewer:
                            _startedAt = time.time()
                            for generate in pluginClassMethods("iXBRLViewer.Generate"):
                                generate(cntlr, dissemReportsFolder, "/arelleViewer-1.4.11/ixbrlviewer.js",
                                         useStubViewer="ixbrlviewer.xhtml.dissem" if self.isWorkstationFirstPass else "ixbrlviewer.xhtml",
                                         saveStubOnly=True)
                            self.logDebug("Arelle viewer for dissemination generated {:.3f} secs.".format(time.time() - _startedAt))
                if "EdgarRenderer/__init__.py#filingEnd" in filing.arelleUnitTests:
                    raise arelle.PythonUtil.pyNamedObject(filing.arelleUnitTests["EdgarRenderer/__init__.py#filingEnd"], "EdgarRenderer/__init__.py#filingEnd")

                if self.isDaemon: # save file in Archives
                    try:
                        if self.reportZip:
                            self.reportZip.close() # must be closed before moving
                        result = IoManager.move_clobbering_file(self.zipOutputFile, # remove -out from output zip
                                                                os.path.join(self.deliveryFolder, os.path.basename(self.zipOutputFile)[:-8] + ".zip") )
                        IoManager.move_clobbering_file(options.entrypointFile, self.doneFile)
                        if self.deleteProcessedFilings:
                            for folder in self.createdFolders:
                                shutil.rmtree(folder,ignore_errors=True)
                            del self.createdFolders[:] # prevent any other use of created folders
                        self.logDebug(_("Successfully post-processed to {}.").format(result))
                    except OSError as err:
                        #self.logError(_(ErrorMgr.getError('POST_PROCESSING_ERROR').format(err)))
                        self.logError(_("Failure: Post-processing I/O or OS error: {}").format(err))
                        self.success = False
            except Exception as ex:
                action = "complete validation" if options.noReportOutput else "produce output"
                self.logWarn(_("The rendering engine was unable to {} due to an internal error.  This is not considered an error in the filing.").format(action))
                self.logDebug(_("Exception in filing end processing, traceback: {}").format(traceback.format_exception(*sys.exc_info())))
                self.success = False # force postprocessingFailure

        cntlr.editedIxDocs.clear() # deref modelXbrls even if unsuccessful
        cntlr.redlineIxDocs.clear()
        cntlr.editedModelXbrls.clear()
        cntlr.redactTgtElts.clear()

        # non-GUI (cmd line) options.keepOpen kept modelXbrls open, use keepFilingOpen to block closing here
        if not options.keepFilingOpen and not self.isRunningUnderTestcase():
            for report in filing.reports:
                self.modelManager.close(report.modelXbrl)

        # close filesource (which may have been an archive), regardless of success above
        filesource.close()

        if not self.success and self.isDaemon: # not successful
            self.postprocessFailure(filing.options)

    '''
    def postprocessInstance(self, options, modelXbrl):
        Inline.saveTargetDocumentIfNeeded(self,options,modelXbrl)
        del modelXbrl.duplicateFactSet
        xlWriter = self.xlWriter
        if xlWriter:
            xlWriter.save()
            xlWriter.close()
            del self.xlWriter
            self.logDebug("Excel rendering complete")
        modelXbrl.profileStat(_("total"), time.time() - self.firstStartedAt)
        if options.collectProfileStats and modelXbrl:
            modelXbrl.logProfileStats()
        def copyResourceToReportFolder(filename):
            source = join(self.resourcesFolder, filename)
            if self.reportZip:
                self.reportZip.write(source, filename)
            elif self.reportsFolder is not None:
                target = join(self.reportsFolder, filename)
                if not exists(target):
                    os.makedirs(self.reportsFolder, exist_ok=True)
                    shutil.copyfile(source, target)
        if 'html' in (self.reportFormat or "").casefold() or self.summaryXslt is not None:
            copyResourceToReportFolder("Show.js")
            copyResourceToReportFolder("report.css")
        if self.summaryXslt and len(self.summaryXslt) > 0 :
            copyResourceToReportFolder("RenderingLogs.xslt")
        # TODO: At this point would be nice to call out any files not loaded in any instance DTS
        inputsToCopyToOutputList = self.supplementList
        if options.copyInlineFilesToOutput: inputsToCopyToOutputList += self.inlineList
        for filename in inputsToCopyToOutputList:
            source = join(self.processingFolder, filename)
            if self.reportZip:
                self.reportZip.write(source, filename)
            elif self.reportsFolder is not None:
                target = join(self.reportsFolder, filename)
                if exists(target): remove(target)
                shutil.copyfile(source, target)
        self.modelManager.close(modelXbrl)
        self.logDebug("Instance post-processing complete")

        summary = Summary.Summary(self)
        rootETree = summary.buildSummaryETree()
        IoManager.writeXmlDoc(rootETree, self.reportZip, self.reportsFolder, 'FilingSummary.xml')
        if self.summaryXslt and len(self.summaryXslt) > 0 :
            summary_transform = etree.XSLT(etree.parse(self.summaryXslt))
            result = summary_transform(rootETree, asPage=etree.XSLT.strparam('true'))
            IoManager.writeHtmlDoc(result, self.reportZip, self.reportsFolder, 'FilingSummary.htm')
        if self.auxMetadata:
            summary.writeMetaFiles()

        if not self.reportZip and self.zipOutputFile:
            # The output must be zipped.
            zipdir = self.reportsFolder
            self.zipOutputFile = join(zipdir, self.zipOutputFile)
            if self.entrypoint == self.zipOutputFile:  # Check absolute path destinations
                #message = ErrorMgr.getError('INPUT_OUTPUT_SAME').format(self.zipOutputFile)
                self.logWarn("Input and output files are the same: {}".format(self.zipOutputFile))
            self.logDebug(_("Creating output {} containing rendering results and other input files."
                           ).format(self.zipOutputFile))
            try:
                zf = zipfile.ZipFile(self.zipOutputFile, 'w', allowZip64=False)
                for f in os.listdir(self.reportsFolder):
                    if not Utils.isZipFilename(f) and not isdir(f) and not IoManager.isFileHidden(f):
                        IoManager.moveToZip(zf, join(zipdir, f), basename(f))
                # shutil.rmtree(self.reportsFolder)
            finally:
                zf.close()
            self.logDebug(_("Rendering results zip file {} populated").format(self.zipOutputFile))
            if self.isDaemon:
                try:
                    result = IoManager.move_clobbering_file(self.zipOutputFile, self.deliveryFolder)
                    IoManager.move_clobbering_file(options.entrypoint, self.doneFile)
                    self.logDebug(_("Successfully post-processed to {}.").format(result))
                except OSError as err:
                    #self.logError(_(ErrorMgr.getError('POST_PROCESSING_ERROR').format(err)))
                    self.logError(_("Failure: Post-processing I/O or OS error: {}").format(err))
        if self.deleteProcessedFilings:
            for folder in self.createdFolders: shutil.rmtree(folder,ignore_errors=True)
    '''

    def postprocessFailure(self, options):
        if self.isSingles:
            #message = ErrorMgr.getError('CANNOT_PROCESS_INPUT_FILE').format(self.entrypoint)
            self.logError("Cannot process input file {}.".format(self.entrypoint), file=__file__ + ' postprocessFailure')
        else:
            try:
                if self.reportZip:
                    self.reportZip.close() # must be closed before moving
                # In daemon mode, write an error log file looking somewhat like the one from RE2 and named the same.
                # Separately, create a zero-length "fail file" for the sole purpose of signaling status.
                if self.failFile is not None:
                    open(self.failFile, 'w').close()
                errlogpath = join(self.deliveryFolder, os.path.basename(self.zipOutputFile)[:-8] + '_errorLog.txt')
                if isfile(errlogpath): os.remove(errlogpath)
                #self.logError(_(ErrorMgr.getError('CANNOT_PROCESS_ZIP_FILE')).format(options.entrypoint))
                self.logDebug(_("Cannot process zip file {}; moving to fail folder.").format(options.entrypointFile))
                IoManager.move_clobbering_file(options.entrypointFile, self.errorsFolder)
                print(self.deliveryFolder + " " + errlogpath)
                with open(errlogpath, 'w', encoding='utf-8') as f:
                    ''' get all messages from log, translate if required
                    for errmsg in self.ErrorMsgs:
                        message = "[" + errmsg.msgCode + "] " + errmsg.msg
                    '''
                    logHandler = self.cntlr.logHandler
                    logMessageText = self.logMessageText
                    for logRec in getattr(logHandler, "logRecordBuffer", ()): # non buffered handlers don't keep log records (e.g., log to print handler)
                        if logRec.levelno > logging.INFO:
                            print(self.formatLogMessage(logRec), file=f)
                    f.close()


            except OSError as err:
                #self.logError(_(ErrorMgr.getError('POST_PROCESSING_ERROR').format(err)))
                self.logError(_("Failure: Post-processing I/O or OS error: {}").format(err))



    def addToLog(self, message, messageArgs={}, messageCode='error', file=MODULENAME, level=logging.DEBUG):
        if self.entrypoint is not None and len(self.instanceList + self.inlineList) > 1:
            message += ' --' + (self.entrypoint.url if isinstance(self.entrypoint,FileSource.FileSource) else self.entrypoint)
        message = message.encode('utf-8', 'replace').decode('utf-8')
        if level >= logging.INFO:
            self.ErrorMsgs.append(Utils.Errmsg(messageCode, message))

        # dereference non-string messageArg values
        messageArgs = dict((k,str(v)) for k,v in messageArgs.items())

        if (self.modelManager and getattr(self.modelManager, 'modelXbrl', None)):
            self.modelManager.modelXbrl.log(logging.getLevelName(level), messageCode, message, *messageArgs)
        else:
            self.cntlr.addToLog(message, messageArgs=messageArgs, messageCode=messageCode, file=file, level=level)

    # Lowercase tokens apparently write to standard output??

    def logTrace(self, message, messageArgs={}, file=MODULENAME):
        self.addToLog(str(message), messageArgs=messageArgs, file=file, level=logging.NOTSET, messageCode='trace')

    def logDebug(self, message, messageArgs={}, file=MODULENAME, messageCode='debug'):
        self.addToLog(str(message), messageArgs=messageArgs, file=file, level=logging.DEBUG, messageCode=messageCode)

    def logInfo(self, message, messageArgs={}, file=None, messageCode='info'):
        self.addToLog(str(message), messageArgs=messageArgs, file=None, level=logging.INFO, messageCode=messageCode)

    def logWarn(self, message, messageArgs={}, file=None, messageCode='warn'):
        self.addToLog(str(message), messageArgs=messageArgs, file=None, level=logging.WARN, messageCode=messageCode)

    def logError(self, message, messageArgs={}, file=None, messageCode='error'):
        self.addToLog(str(message), messageArgs=messageArgs, file=None, level=logging.ERROR, messageCode=messageCode)

    def logFatal(self, message, messageArgs={}, file=None, messageCode='fatal'):
        self.addToLog(str(message), messageArgs=messageArgs, file=None, level=logging.FATAL, messageCode=messageCode)

def edgarRendererCheckIfDaemonStartup(cntlr, options, sourceZipStream=None, *args, **kwargs):
    """ starts up EdgarRenderer when run as a Deamon (no input files selected) """
    EdgarRenderer(cntlr).checkIfDaemonStartup(options)

def edgarRendererFilingStart(cntlr, options, entrypointFiles, filing, *args, **kwargs):
    """ prepares EdgarRenderer for a series of muiltple instances """
    EdgarRenderer(cntlr).filingStart(cntlr, options, entrypointFiles, filing)

def edgarRendererXbrlRun(cntlr, options, modelXbrl, filing, report, *args, **kwargs):
    """ processes a single instance """
    filing.edgarRenderer.processInstance(options, modelXbrl, filing, report)

def edgarRendererFilingEnd(cntlr, options, filesource, filing, *args, **kwargs):
    """ ends processing of a filing (after all intances have been processed) """
    filing.edgarRenderer.filingEnd(cntlr, options, filesource, filing, *args, **kwargs)

def edgarRendererGuiViewMenuExtender(cntlr, viewMenu, *args, **kwargs):
    # persist menu selections for showing filing data and tables menu
    from tkinter import Menu, BooleanVar # must only import if GUI present (no tkinter on GUI-less servers)
    erViewMenu = Menu(cntlr.menubar, tearoff=0)
    viewMenu.add_cascade(label=_("Edgar Renderer"), menu=erViewMenu, underline=0)
    def setShowFilingData(self, *args):
        cntlr.config["edgarRendererShowFilingData"] = cntlr.showFilingData.get()
        cntlr.saveConfig()
        erViewMenu.entryconfig("Show Redlining and Redactions", state="normal" if cntlr.showFilingData.get() else "disabled")
    def setRedlineMode(self, *args):
        cntlr.config["edgarRendererRedlineMode"] = cntlr.redlineMode.get()
        cntlr.saveConfig()
    def setShowTablesMenu(self, *args):
        cntlr.config["edgarRendererShowTablesMenu"] = cntlr.showTablesMenu.get()
        cntlr.saveConfig()
    def setValidateBeforeRendering(self, *args):
        cntlr.config["edgarRendererValidateBeforeRendering"] = cntlr.showTablesMenu.get()
        cntlr.saveConfig()
    cntlr.showFilingData = BooleanVar(value=cntlr.config.get("edgarRendererShowFilingData", True))
    cntlr.showFilingData.trace("w", setShowFilingData)
    erViewMenu.add_checkbutton(label=_("Show Filing Data"), underline=0, variable=cntlr.showFilingData, onvalue=True, offvalue=False)
    cntlr.redlineMode = BooleanVar(value=cntlr.config.get("edgarRendererRedlineMode", True))
    cntlr.redlineMode.trace("w", setRedlineMode)
    erViewMenu.add_checkbutton(label=_("Show Redlining and Redactions"), underline=0, variable=cntlr.redlineMode, onvalue=True, offvalue=False,
                                        state="normal" if cntlr.showFilingData.get() else "disabled")
    cntlr.showTablesMenu = BooleanVar(value=cntlr.config.get("edgarRendererShowTablesMenu", True))
    cntlr.showTablesMenu.trace("w", setShowTablesMenu)
    erViewMenu.add_checkbutton(label=_("Show Tables Menu"), underline=0, variable=cntlr.showTablesMenu, onvalue=True, offvalue=False)
    cntlr.validateBeforeRendering = BooleanVar(value=cntlr.config.get("edgarRendererValidateBeforeRendering", True))
    cntlr.validateBeforeRendering.trace("w", setShowTablesMenu)
    erViewMenu.add_checkbutton(label=_("Validate Before Rendering"), underline=0, variable=cntlr.validateBeforeRendering, onvalue=True, offvalue=False)

def edgarRendererGuiStartLogging(modelXbrl, mappedUri, normalizedUri, filepath, isEntry=False, namespace=None, **kwargs):
    """ start logging for EdgarRenderer when using GUI """
    if isEntry and modelXbrl.modelManager.cntlr.hasGui:
        modelXbrl.modelManager.cntlr.logHandler.startLogBuffering() # accumulate validation and rendering warnings and errors
    return False # called for class 'ModelDocument.IsPullLoadable'

def edgarRendererGuiRun(cntlr, modelXbrl, *args, **kwargs):
    """ run EdgarRenderer using GUI interactions for a single instance or testcases """
    if cntlr.hasGui and modelXbrl.modelDocument:
        from arelle.ValidateFilingText import referencedFiles
        parameters = modelXbrl.modelManager.formulaOptions.parameterValues
        _combinedReports = not cntlr.showTablesMenu.get() # use mustard menu
        if "summaryXslt" in parameters and "reportXslt" in parameters:
            _reportXslt = parameters["reportXslt"][1]
            _summaryXslt = parameters["summaryXslt"][1]
            _ixRedline = "ixRedline" in parameters and parameters["ixRedline"][1] == "true"
        else:
            _reportXslt =  ('InstanceReport.xslt', 'InstanceReportTable.xslt')[_combinedReports]
            _summaryXslt = ('Summarize.xslt', '')[_combinedReports] # no FilingSummary.htm for Rall.htm production
            _ixRedline = cntlr.redlineMode.get()
        if not hasattr(cntlr, "editedIxDocs"):
            cntlr.editedIxDocs = {}
            cntlr.editedModelXbrls = set()
            cntlr.redlineIxDocs = {}
            cntlr.redactTgtElts = set()
        isNonEFMorGFMinline = (not getattr(cntlr.modelManager.disclosureSystem, "EFMplugin", False) and
                               modelXbrl.modelDocument.type in (ModelDocument.Type.INLINEXBRL, ModelDocument.Type.INLINEXBRLDOCUMENTSET))
        # may use GUI mode to process a single instance or test suite
        options = PythonUtil.attrdict(# simulate options that CntlrCmdLine provides
            configFile = os.path.join(os.path.dirname(__file__), 'conf', 'config_for_instance.xml'),
            renderingService = 'Instance',
            reportFormat = "None" if isNonEFMorGFMinline else "Html", # for Rall temporarily override report format to force only xml file output
            htmlReportFormat = None,
            zipOutputFile = None,
            sourceList = None, # after initialization this is an iterable string, not a None
            internetConnectivity = None,
            totalClean = True, # force clean output folder
            noEquity = None,
            auxMetadata = None,
            copyInlineFilesToOutput = True, # needed for ixviewer
            copyXbrlFilesToOutput = None,
            zipXbrlFilesToOutput = None,
            includeLogsInSummary = (True if "includeLogsInSummary" in parameters else
                                    False if "noLogsInSummary" in parameters else
                                    True), # default for GUI logger now validates with log buffer
            includeLogsInSummaryDissem = True if "includeLogsInSummaryDissem" in parameters else False,
            processXsltInBrowser = False, # both options can work with GUI, unsure about future browser XSLT support
            saveTargetInstance = None,
            saveTargetFiling = None,
            deleteProcessedFilings = None,
            debugMode = None,
            validate = None,
            utrValidate = None,
            validateEFM = None,
            abortOnMajorError = False, # inherited
            noRenderingWithError = False,
            processingFolder = None,
            processInZip = None,
            reportsFolder = "out" if cntlr.showFilingData.get() else None, # default to reports subdirectory of source input
            noReportOutput = None if cntlr.showFilingData.get() else True,
            reportInZip = None,
            resourcesFolder = None,
            reportXslt = _reportXslt,
            reportXsltDissem = parameters["reportXsltDissem"][1] if "reportXsltDissem" in parameters else None,
            summaryXslt = _summaryXslt,
            summaryXsltDissem = parameters["summaryXslt"][1] if "summaryXslt" in parameters else None,
            renderingLogsXslt = ('RenderingLogs.xslt', None)[_combinedReports],
            excelXslt = ('InstanceReport_XmlWorkbook.xslt', None)[_combinedReports],
            logMessageTextFile = None,
            logFile = None, # from cntlrCmdLine but need to simulate for GUI operation
            labelLang = cntlr.labelLang, # emulate cmd line labelLang
            keepFilingOpen = True # closed by CntrlWinMain
        )
        if modelXbrl.modelDocument.type in ModelDocument.Type.TESTCASETYPES:
            modelXbrl.efmOptions = options  # save options in testcase's modelXbrl
        if modelXbrl.modelDocument.type not in (ModelDocument.Type.INLINEXBRL, ModelDocument.Type.INSTANCE, ModelDocument.Type.INLINEXBRLDOCUMENTSET):
            return
        reports = []
        multiInstanceModelXbrls = [modelXbrl] + getattr(modelXbrl, "supplementalModelXbrls", [])
        entrypointFiles = []
        hasInlineReport = False
        for instanceModelXbrl in multiInstanceModelXbrls:
            instanceModelDocument = instanceModelXbrl.modelDocument
            if instanceModelDocument.type == ModelDocument.Type.INLINEXBRLDOCUMENTSET:
                hasInlineReport = True
                _ixdsFiles = []
                for ixDoc in instanceModelDocument.referencesDocument.keys():
                    if ixDoc.type == ModelDocument.Type.INLINEXBRL:
                        _ixdsFiles.append({"file":instanceModelDocument.uri})
                entrypointFiles.append({"ixds":_ixdsFiles,
                                        "file":instanceModelDocument.uri}) # for filingEnd to find directory
                entrypointFiles.append({})
            else:
                if instanceModelDocument.type == ModelDocument.Type.INLINEXBRL:
                    hasInlineReport = True
                entrypointFiles.append({"file":instanceModelDocument.uri})
        def guiWriteFile(filepath, data):
            outdir = os.path.dirname(filepath)
            if not os.path.exists(outdir): # may be a subdirectory of out dir
                os.makedirs(outdir)
            with io.open(filepath, "wb" if isinstance(data, bytes) else "wt") as fh:
                fh.write(data)
        def guiReadFile(filepath, binary):
            return modelXbrl.fileSource.file(filepath, binary)
        filing = PythonUtil.attrdict( # simulate filing
            filesource = modelXbrl.fileSource,
            reportZip = None,
            entrypointfiles = entrypointFiles,
            renderedFiles = set(),
            reports = reports,
            hasInlineReport = hasInlineReport,
            arelleUnitTests = {},
            writeFile=guiWriteFile,
            readFile=guiReadFile,
            exhibitTypesStrippingOnErrorPattern=kwargs.get("exhibitTypesStrippingOnErrorPattern")
        )
        if "accessionNumber" in parameters:
            filing.accessionNumber = parameters["accessionNumber"][1]
        edgarRendererFilingStart(cntlr, options, {}, filing)
        for instanceModelXbrl in multiInstanceModelXbrls:
            instanceModelDocument = instanceModelXbrl.modelDocument
            reportedFiles = set()
            if instanceModelDocument.type == ModelDocument.Type.INLINEXBRLDOCUMENTSET:
                for ixDoc in instanceModelDocument.referencesDocument.keys():
                    if ixDoc.type == ModelDocument.Type.INLINEXBRL:
                        reportedFiles.add(ixDoc.basename)
            else:
                reportedFiles.add(instanceModelDocument.basename)
            reportedFiles |= referencedFiles(instanceModelXbrl)
            sourceDir = instanceModelDocument.filepathdir
            def addRefDocs(doc):
                if doc.type == ModelDocument.Type.INLINEXBRLDOCUMENTSET:
                    for ixDoc in doc.referencesDocument.keys():
                        if ixDoc.type == ModelDocument.Type.INLINEXBRL:
                            addRefDocs(ixDoc)
                for refDoc in doc.referencesDocument.keys():
                    if refDoc.filepath and refDoc.filepath.startswith(sourceDir):
                        reportedFile = refDoc.filepath[len(sourceDir)+1:]
                        if reportedFile not in reportedFiles:
                            reportedFiles.add(reportedFile)
                            addRefDocs(refDoc)
            addRefDocs(instanceModelDocument)
            instDocs = ([instanceModelDocument] if instanceModelDocument.type != ModelDocument.Type.INLINEXBRLDOCUMENTSET
                        else [])+ [ixDoc
                                   for ixDoc in sorted(instanceModelDocument.referencesDocument.keys(), key=lambda d: d.objectIndex)
                                   if ixDoc.type == ModelDocument.Type.INLINEXBRL]
            uri = instanceModelDocument.uri
            if instanceModelDocument.type == ModelDocument.Type.INLINEXBRLDOCUMENTSET:
                uri = instanceModelDocument.targetDocumentPreferredFilename.replace(".xbrl",".htm")
            report = PythonUtil.attrdict( # simulate report
                modelXbrl = instanceModelXbrl,
                isInline = instanceModelDocument.type in (ModelDocument.Type.INLINEXBRL, ModelDocument.Type.INLINEXBRLDOCUMENTSET),
                reportedFiles = reportedFiles,
                renderedFiles = set(),
                entryPoint = {"file": uri},
                url = uri,
                filepaths = [doc.filepath for doc in instDocs],
                basenames = [doc.basename for doc in instDocs],
                deiDocumentType = None
            )
            reports.append(report)
            del instDocs # dereference
            if "setReportAttrs" in kwargs:
                kwargs["setReportAttrs"](report, instanceModelXbrl)
            if cntlr.validateBeforeRendering.get():
                Validate.validate(instanceModelXbrl)
            edgarRendererXbrlRun(cntlr, options, instanceModelXbrl, filing, report)
        edgarRenderer = filing.edgarRenderer
        reportsFolder = edgarRenderer.reportsFolder
        hasRedactOrRedlineElts = bool(cntlr.redactTgtElts) or bool(cntlr.redlineIxDocs)

        edgarRendererFilingEnd(cntlr, options, modelXbrl.fileSource, filing)
        cntlr.logHandler.endLogBuffering() # block other GUI processes from using log buffer
        '''
        The usual "mustard menu" output uses jquery to locally load the R files.
        It does not seem to work in local browsers.
        Temporarily this function just does an Rall.htm for local viewing.
        '''
        if reportsFolder is not None and os.path.exists(os.path.join(reportsFolder, "FilingSummary.xml")):
            if _combinedReports:
                edgarRenderer.logDebug("Generate all-reports htm file")
                rAll = [b'''
<html>
  <head>
    <title>View Filing Data</title>
    <link rel="stylesheet" type="text/css" href="report.css"/>
    <script type="text/javascript" src="Show.js">/* Do Not Remove This Comment */</script>
    <script type="text/javascript">
                    function toggleNextSibling (e) {
                    if (e.nextSibling.style.display=='none') {
                    e.nextSibling.style.display='block';
                    } else { e.nextSibling.style.display='none'; }
                    }</script>
  </head>
  <body>
''']
                filingSummaryTree = etree.parse(os.path.join(edgarRenderer.reportsFolder, "FilingSummary.xml"))
                for htmlFileName in filingSummaryTree.iter(tag="HtmlFileName"):
                    rFile = htmlFileName.text.strip()
                    rFilePath = os.path.join(edgarRenderer.reportsFolder, rFile)
                    edgarRenderer.logDebug("Appending report file {}".format(rFile))
                    with open(rFilePath, mode='rb') as f:
                        rAll.append(f.read())
                    os.remove(rFilePath)
                rAll.append(b'''
  </body>
</html>
''')
                with open(os.path.join(edgarRenderer.reportsFolder, "Rall.htm"), mode='wb') as f:
                    f.write(b"".join(rAll))
                shutil.copyfile(os.path.join(edgarRenderer.resourcesFolder, "report.css"), os.path.join(edgarRenderer.reportsFolder, "report.css"))
                edgarRenderer.logDebug("Write {} complete".format("Rall.htm"))
            # display on web browser
            if cntlr.showFilingData.get():
                from . import LocalViewer
                _localhost = LocalViewer.init(cntlr, reportsFolder)
                if hasRedactOrRedlineElts:
                    _localhostDissem = LocalViewer.init(cntlr, reportsFolder + "/dissem")
                import webbrowser
                openingUrl = openingUrlDissem = None
                if isNonEFMorGFMinline: # for non-EFM/GFM open ix viewer directly
                    filingSummaryTree = etree.parse(os.path.join(edgarRenderer.reportsFolder, "FilingSummary.xml"))
                    for reportElt in filingSummaryTree.iter(tag="Report"):
                        if reportElt.get("instance"):
                            openingUrl = f"ix?doc=/{_localhost.rpartition('/')[2]}/{reportElt.get('instance')}&xbrl=true"
                            if hasRedactOrRedlineElts:
                                openingUrlDissem = f"ix?doc=/{_localhostDissem.rpartition('/')[2]}{reportElt.get('instance')}&xbrl=true"
                if not openingUrl: # open SEC Mustard Menu
                    openingUrl = ("FilingSummary.htm", "Rall.htm")[_combinedReports]
                    if hasRedactOrRedlineElts:
                        openingUrlDissem = ("FilingSummary.htm", "Rall.htm")[_combinedReports]
                webbrowser.open(url="{}/{}{}".format(_localhost, openingUrl,
                                                     "?redline=true" if (_ixRedline and hasRedactOrRedlineElts) else ""))
                if hasRedactOrRedlineElts:
                    webbrowser.open(url="{}/{}".format(_localhostDissem, openingUrlDissem))
                if filing.edgarRenderer.hasIXBRLViewer and filing.hasInlineReport:
                    webbrowser.open(url="{}/ixbrlviewer.xhtml{}".format(_localhost, _ixRedline))

def testcaseVariationExpectedSeverity(modelTestcaseVariation, *args, **kwargs):
    # allow severity to appear on any variation sub-element (such as result)
    _severity = XmlUtil.descendantAttr(modelTestcaseVariation, None, "error", "severity")
    if _severity is not None:
        return _severity.upper()
    return None

def savesTargetInstance(*args, **kwargs): # EdgarRenderer implements its own target instance saver
    return True

redliningPattern = re.compile(r"(.*;)?\s*-sec-ix-(redline|redact)\s*:\s*true(?:\s*;)?\s*([\w.-].*)?$")
def edgarRendererDetectRedlining(modelDocument, *args, **kwargs):
    cntlr = modelDocument.modelXbrl.modelManager.cntlr
    foundMatchInDoc = False
    if modelDocument.type == ModelDocument.Type.INLINEXBRL and (not cntlr.hasGui or cntlr.redlineMode.get()):
        for e in modelDocument.xmlRootElement.getroottree().iterfind(".//{http://www.w3.org/1999/xhtml}*[@style]"):
            rlMatch = redliningPattern.match(e.get("style",""))
            if rlMatch:
                if not hasattr(cntlr, "editedIxDocs"):
                    cntlr.editedIxDocs = {}
                    cntlr.editedModelXbrls = set()
                    cntlr.redlineIxDocs = {}
                    cntlr.redactTgtElts = set()
                if not foundMatchInDoc:
                    cntlr.redlineIxDocs[modelDocument.basename] = modelDocument
                    foundMatchInDoc = True
                if rlMatch.group(2) == "redact":
                    for c in e.iter("{http://www.xbrl.org/2013/inlineXBRL}*"):
                        cntlr.redactTgtElts.add(c)

def edgarRendererRemoveRedlining(modelDocument, *args, **kwargs):
    # strip redlining from modelDocument
    matchedElts = []
    for e in modelDocument.xmlRootElement.getroottree().iterfind(".//{http://www.w3.org/1999/xhtml}*[@style]"):
        rlMatch = redliningPattern.match(e.get("style",""))
        if rlMatch:
            matchedElts.append(e) # can't prune tree while iterating through it
    for e in matchedElts:
        rlMatch = redliningPattern.match(e.get("style",""))
        if rlMatch:
            isRedact = rlMatch.group(2) == "redact"
            cleanedStyle = (rlMatch.group(1) or "") + (rlMatch.group(3) or "")
            if cleanedStyle and not isRedact:
                e.set("style", cleanedStyle)
            else:
                e.attrib.pop("style")
                # if no remaining attributes on <span> remove it
                if isRedact or (not e.attrib and e.tag == "{http://www.w3.org/1999/xhtml}span"):
                    e0 = e.getprevious()
                    prop = "tail"
                    if e0 is None:
                        e0 = e.getparent()
                        prop = "text"
                    if not isRedact: # redline - move children to parent
                        if e.text:
                            setattr(e0, prop, (getattr(e0, prop) or "") + e.text)
                        for eChild in e.getchildren():
                            e.addprevious(eChild)
                            e0 = eChild
                            prop = "tail"
                    if e.tail:
                        setattr(e0, prop, (getattr(e0, prop) or "") + e.tail)
                    e.getparent().remove(e)

def iXBRLViewerGenerateOnCall(*args, **kwargs):
    return True

__pluginInfo__ = {
    'name': 'Edgar Renderer',
    'version': VERSION,
    'description': "This plug-in implements U.S. SEC Edgar Renderer.  ",
    'license': 'Apache-2',
    'author': 'U.S. SEC Employees and Mark V Systems Limited',
    'copyright': '(c) Portions by SEC Employees not subject to domestic copyright, otherwise (c) Copyright 2015 Mark V Systems Limited, All rights reserved.',
    'import': ('validate/EFM', 'inlineXbrlDocumentSet'), # import dependent modules
    # add Edgar Renderer options to command line & web service options
    'CntlrCmdLine.Options': edgarRendererCmdLineOptionExtender,
    # startup for Daemon mode (polls for filings folder's oldest input zip file)
    'CntlrCmdLine.Utility.Run': edgarRendererCheckIfDaemonStartup,
    # prepare to process a filing of multiple instances
    'EdgarRenderer.Filing.Start': edgarRendererFilingStart,
    # process a single instance of a filing
    'EdgarRenderer.Xbrl.Run': edgarRendererXbrlRun,
    # finish processing a filing after instances have been processed
    'EdgarRenderer.Filing.End': edgarRendererFilingEnd,
    # GUI operation start log buffering
    'ModelDocument.IsPullLoadable': edgarRendererGuiStartLogging,
    # detect if any redline markups when appropriate
    'ModelDocument.Discover': edgarRendererDetectRedlining,
    # GUI operation startup (renders all reports of an input instance or test suite)
    'EdgarRenderer.Gui.Run': edgarRendererGuiRun,
    # GUI operation, add View -> EdgarRenderer submenu for GUI options
    'CntlrWinMain.Menu.View': edgarRendererGuiViewMenuExtender,
    # identify expected severity of test cases for EdgarRenderer testcases processing
    'ModelTestcaseVariation.ExpectedSeverity': testcaseVariationExpectedSeverity,
    # handles IXDS target saving
    'InlineDocumentSet.SavesTargetInstance': savesTargetInstance,
    # iXBRLViewer should only generate when called, not on loading by cmd line or GUI
    'iXBRLViewer.GenerateOnCall': iXBRLViewerGenerateOnCall,
}
