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
             "exhibitType":"EX-99.K SDR.INS", 
             "accessionNumber":"0001125840-15-000159"}]' 
    
    for multiple instances (SDR-L's), add more of the {"file": ...} entries.
    
    for Windows called from Java, the JSON must be quoted as thus:
        -f "[{\"file\":\"z:\\Documents\\...\\gpc_gd1-20130930.htm\", 
            \"cik\": \"0000350001\", 
            \"cikNameList\": {\"0000350001\":\"BIG FUND TRUST CO\"},
            \"submissionType\":\"SDR-A\", \"exhibitType\":\"EX-99.K SDR.INS\"}]"  
               
To build an installable cx_Freeze binary, (tested on Ubuntu), uncomment the entries in Arelle's
setup.py that are marked for EdgarRenderer.
    
Required if running under Java (using runtime.exec) on Windows, suggested always:

    if xdgConfigHome or environment variable XDG_CONFIG_HOME are set:
    please set environment variable MPLCONFIGDIR to same location as xdgConfigHome/XDG_CONFIG_HOME
    (to prevent matlib crash under runtime.exe with Java)
        
"""
VERSION = '3.8.0.1'

from collections import defaultdict
from arelle import PythonUtil  # define 2.x or 3.x string types
PythonUtil.noop(0)  # Get rid of warning on PythonUtil import
from arelle import (Cntlr, FileSource, ModelDocument, XmlUtil, Version, ModelValue, Locale, PluginManager, WebCache, ModelFormulaObject,
                    ViewFileFactList, ViewFileFactTable, ViewFileConcepts, ViewFileFormulae,
                    ViewFileRelationshipSet, ViewFileTests, ViewFileRssFeed, ViewFileRoleTypes)
from . import RefManager, IoManager, Inline, Utils, Filing, Summary
import datetime, zipfile, logging, shutil, gettext, time, shlex, sys, traceback, linecache, os, re, io, tempfile
from lxml import etree
from os import getcwd, remove, removedirs
from os.path import join, isfile, exists, dirname, basename, isdir
from optparse import OptionParser, SUPPRESS_HELP

MODULENAME = os.path.basename(os.path.dirname(__file__))

# Helper functions

# def linenum():
    # Returns the current line number in the .py file
    # return inspect.currentframe().f_back.f_lineno


###############

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
                      help=_("One of Xml, Html, or HtmlAndXml."))
        
    parser.add_option("--failFile", dest="failFile", help=_("Relative path and name of fail file. "))
    
    parser.add_option("--reportXslt", dest="reportXslt", help=_("Path and name of Stylesheet for producing a report file."))
    parser.add_option("--summaryXslt", dest="summaryXslt", help=_("Path and name of Stylesheet, if any, for producing filing summary html."))
    parser.add_option("--excelXslt", dest="excelXslt", help=_("Path and name of Stylesheet, if any, for producing Excel 2007 xlsx output."))
    parser.add_option("--auxMetadata", action="store_true", dest="auxMetadata", help=_("Set flag to generate inline xbrl auxiliary files"))
    Inline.saveTargetDocumentCommandLineOptionExtender(parser)
    parser.add_option("--sourceList", action="store", dest="sourceList", help=_("Comma-separated triples of instance file, doc type and source file."))
    parser.add_option("--copyInlineFilesToOutput", action="store_true", dest="copyInlineFilesToOutput", help=_("Set flag to copy all inline files to the output folder or zip."))
    parser.add_option("--copyXbrlFilesToOutput", action="store_true", dest="copyXbrlFilesToOutput", help=_("Set flag to copy all source xbrl files to the output folder or zip."))
    parser.add_option("--zipXbrlFilesToOutput", action="store_true", dest="zipXbrlFilesToOutput", help=_("Set flag to zip all source xbrl files to the an accession-number-xbrl.zip in reports folder or zip when an accession number parameter is available."))
    parser.add_option("--includeLogsInSummary", action="store_true", dest="includeLogsInSummary", help=_("Set flag to copy log entries into <logs> in FilingSummary.xml."))    
    parser.add_option("--noLogsInSummary", action="store_false", dest="includeLogsInSummary", help=_("Unset flag to copy log entries into <logs> in FilingSummary.xml."))    
    parser.add_option("--noEquity", action="store_true", dest="noEquity", help=_("Set flag to suppress special treatment of Equity Statements. "))
        
    parser.add_option("--showErrors", action="store_true", dest="showErrors",
                      help=_("List all errors and warnings that may occur during RE3 processing."))
    parser.add_option("--debugMode", action="store_true", dest="debugMode", help=_("Let the debugger handle exceptions."))
    parser.add_option("--logMessageTextFile", action="store", dest="logMessageTextFile", help=_("Log message text file."))
    # always use a buffering log handler (even if file or std out)
    parser.add_option("--logToBuffer", action="store_true", dest="logToBuffer", default=True, help=SUPPRESS_HELP)



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
        self.defaultValueDict['archiveFolder'] = 'Archive'
        self.defaultValueDict['auxMetadata'] = str(False)
        self.defaultValueDict['copyInlineFilesToOutput'] = str(False)
        self.defaultValueDict['copyXbrlFilesToOutput'] = str(False)
        self.defaultValueDict['zipXbrlFilesToOutput'] = str(False)
        self.defaultValueDict['includeLogsInSummary'] = str(False)
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
        self.defaultValueDict['renderingService'] = 'Instance'
        self.defaultValueDict['reportFormat'] = 'Html'
        self.defaultValueDict['reportsFolder'] = 'Reports'
        self.defaultValueDict['reportXslt'] = 'InstanceReport.xslt'
        self.defaultValueDict['resourcesFolder'] = "resources"
        self.defaultValueDict['saveTargetInstance'] = str(True)
        self.defaultValueDict['saveTargetFiling'] = str(False)
        self.defaultValueDict['sourceList'] = ''
        self.defaultValueDict['summaryXslt'] = None
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
        options.reportFormat = setProp('reportFormat', options.reportFormat, rangeList=['Html', 'Xml', 'HtmlAndXml'])               
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
        options.totalClean = setFlag('totalClean', options.totalClean)
        options.noEquity = setFlag('noEquity', options.noEquity)
        options.auxMetadata = setFlag('auxMetadata', options.auxMetadata)
        options.copyInlineFilesToOutput = setFlag('copyInlineFilesToOutput', options.copyInlineFilesToOutput)
        options.copyXbrlFilesToOutput = setFlag('copyXbrlFilesToOutput', options.copyXbrlFilesToOutput)
        options.zipXbrlFilesToOutput = setFlag('zipXbrlFilesToOutput', options.zipXbrlFilesToOutput)
        options.includeLogsInSummary = setFlag('includeLogsInSummary', options.includeLogsInSummary)
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
        # Report XSLT is required when reportFormat contains 'Html'.     
        if self.reportXslt is None and 'html' in self.reportFormat.casefold():
            raise Exception('No {} specified when {}={} requires it.'.format('reportXslt', 'reportFormat', self.reportFormat))

        # Summary XSLT is optional, but do report if you can't find it.
        #setResourceFile('summaryXslt', options.summaryXslt, 'INVALID_CONFIG_SUMMARYXSLT')
        options.summaryXslt = setResourceFile('summaryXslt', options.summaryXslt, "Cannot find summary xslt {}")

        # Excel XSLT is optional, but do report if you can't find it.
        #setResourceFile('excelXslt', options.excelXslt, 'INVALID_CONFIG_EXCELXSLT')  
        options.excelXslt = setResourceFile('excelXslt', options.excelXslt, "Cannot find excel xslt {}")
        
        # logMessageTextFile is optional resources file for messages text (SEC format)
        options.logMessageTextFile = setResourceFile('logMessageTextFile', options.logMessageTextFile, "Cannot find logMessageTextFile {}")     

        
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
        self.totalClean = options.totalClean
        self.noEquity = options.noEquity
        self.auxMetadata = options.auxMetadata
        self.copyInlineFilesToOutput = options.copyInlineFilesToOutput
        self.copyXbrlFilesToOutput = options.copyXbrlFilesToOutput
        self.zipXbrlFilesToOutput = options.zipXbrlFilesToOutput
        self.includeLogsInSummary = options.includeLogsInSummary
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
        # Report XSLT is required when reportFormat contains 'Html'.     
        if self.reportXslt is None and 'html' in self.reportFormat.casefold():
            raise Exception('No {} specified when {}={} requires it.'.format('reportXslt', 'reportFormat', self.reportFormat))

        # Summary XSLT is optional, but do report if you can't find it.
        #setResourceFile('summaryXslt', options.summaryXslt, 'INVALID_CONFIG_SUMMARYXSLT')
        self.summaryXslt = options.summaryXslt

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
                self.processingFolder = os.path.dirname(filesource.url)
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
            
    def filingStart(self, cntlr, options, entrypointFiles, filing):
        # start a (mult-iinstance) filing
        filing.edgarRenderer = self
        self.reportZip = filing.reportZip
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
        self.validatedForEFM = not cntlr.hasGui and mdlMgr.validateDisclosureSystem and getattr(mdlMgr.disclosureSystem, "EFMplugin", False)
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
            
    def processInstance(self, options, modelXbrl, filing, report):
        # skip rendering if major errors and abortOnMajorError
        # errorCountDuringValidation = len(Utils.xbrlErrors(modelXbrl))
        # won't work for all possible logHandlers (some emit immediately)
        errorCountDuringValidation = sum(1 for e in modelXbrl.errors if isinstance(e, str)) # don't count assertion results dict if formulas ran
        if errorCountDuringValidation > 0:
            if self.abortOnMajorError: # HF renderer raises exception on major errors: self.modelManager.abortOnMajorError:
                    self.logFatal(_("Not attempting to render after {} validation errors").format(
                                           errorCountDuringValidation))
                    self.abortedDueToMajorError = True
                    return
            else:
                    self.logInfo(_("Ignoring {} Validation errors because abortOnMajorError is not set.").format(errorCountDuringValidation))
        modelXbrl.profileActivity()
        self.setProcessingFolder(modelXbrl.fileSource, report.entryPoint.get("file"))
        # if not reportZip and reportsFolder is relative, make it relative to source file location (on first report)
        if not filing.reportZip and self.initialReportsFolder and len(filing.reports) == 1:
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
        if report.isInline:
            if report.basename not in self.inlineList:
                self.inlineList.append(report.basename)
        elif report.basename.endswith(".xml"):
            if report.basename not in self.instanceList:          
                self.instanceList.append(report.basename)
        for reportedFile in sorted(report.reportedFiles):
            if Utils.isImageFilename(reportedFile):
                self.supplementalFileList.append(reportedFile)
                self.supplementList.append(reportedFile)
            #elif reportedFile.endswith(".htm"): # the non-inline primary document isn't known to Arelle yet in EDGAR
            #    self.inlineList.append(reportedFile)
            elif reportedFile != report.basename:
                self.otherXbrlList.append(reportedFile)
        RefManager.RefManager(self.resourcesFolder).loadAddedUrls(modelXbrl, self)  # do this after validation.
        self.loopnum = getattr(self, "loopnum", 0) + 1
        try:
            Inline.saveTargetDocumentIfNeeded(self,options,modelXbrl)
            success = Filing.mainFun(self, modelXbrl, self.reportsFolder)
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
            self.success = False   
        modelXbrl.profileStat(_("EdgarRenderer process instance {}").format(report.basename))
            
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
        try:
            _text = self.logMessageText[logRec.messageCode] % logRec.args
        except KeyError:
            pass # not replacable messageCode or a %(xxx)s format arg was not in the logRec arcs or it's a $() java function reference
        if hasattr(logHandler.formatter, "fileLines"):
            _fileLines = logHandler.formatter.fileLines(logRec)
            if _fileLines:
                _text += " - " + _fileLines
        return _text
                
    def filingEnd(self, cntlr, options, filesource, filing, sourceZipStream=None, *args, **kwargs):
        if self.abortedDueToMajorError:
            self.success = False # major errors detected
        
        # logMessageText needed for successful and unsuccessful termination
        self.loadLogMessageText()
        
        if self.success:
            try:
                if self.xlWriter:
                    _startedAt = time.time()
                    self.xlWriter.save()
                    self.xlWriter.close()
                    del self.xlWriter 
                    self.logDebug("Excel saving complete {:.3f} secs.".format(time.time() - _startedAt))
                def copyResourceToReportFolder(filename):
                    source = join(self.resourcesFolder, filename)
                    if self.reportZip:
                        self.reportZip.write(source, filename)
                    elif self.reportsFolder is not None:
                        target = join(self.reportsFolder, filename)
                        if not exists(target):
                            os.makedirs(self.reportsFolder, exist_ok=True)
                            shutil.copyfile(source, target)
                            self.renderedFiles.add(filename)
                _startedAt = time.time()
                if 'html' in (self.reportFormat or "").casefold() or self.summaryXslt is not None:
                    copyResourceToReportFolder("Show.js")
                    copyResourceToReportFolder("report.css")
                if self.summaryXslt and len(self.summaryXslt) > 0 :
                    copyResourceToReportFolder("RenderingLogs.xslt")  # TODO: This will go away
                    self.renderedFiles.add("RenderingLogs.xslt")
                # TODO: At this point would be nice to call out any files not loaded in any instance DTS
                inputsToCopyToOutputList = self.supplementList
                if options.copyInlineFilesToOutput:
                    inputsToCopyToOutputList += self.inlineList
                if options.copyXbrlFilesToOutput:
                    for report in filing.reports:
                        inputsToCopyToOutputList += report.reportedFiles                
                if inputsToCopyToOutputList and filing.entrypointfiles:
                    _xbrldir = os.path.dirname(filing.entrypointfiles[0]["file"])
                    # files to copy are in zip archive
                    for filename in set(inputsToCopyToOutputList): # set() to deduplicate if multiple references
                        _filepath = os.path.join(_xbrldir, filename)
                        if sourceZipStream is not None:
                            file = FileSource.openFileSource(_filepath, cntlr, sourceZipStream).file(_filepath, binary=True)[0]      
                        else:
                            file = filesource.file(_filepath, binary=True)[0]  # returned in a tuple
                        if self.reportZip:
                            if filename not in self.reportZip.namelist():
                                self.reportZip.writestr(filename, file.read())
                        elif self.reportsFolder is not None:
                            target = join(self.reportsFolder, filename)
                            if exists(target): remove(target)
                            with open(target, 'wb') as f:
                                f.write(file.read())
            
                self.logDebug("Instance post-processing complete {:.3f} secs.".format(time.time() - _startedAt))
                
                # temporary work-around to create SDR summaryDict
                if not self.sourceDict and any(
                        report.documentType # HF: believe condition wrong: and report.documentType.endswith(" SDR") 
                        for report in filing.reports):
                    for report in filing.reports:
                        if report.isInline:
                            self.sourceDict[report.basename] = (report.documentType, report.basename)
                        else:
                            for ext in (".htm", ".txt"):
                                sourceFilepath = report.filepath.rpartition(".")[0] + ext
                                if filesource.exists(sourceFilepath):
                                    self.sourceDict[report.basename] = (report.documentType, os.path.basename(sourceFilepath))
                                    break
                
                summary = Summary.Summary(self)  
                rootETree = summary.buildSummaryETree()
                if self.reportZip or self.reportsFolder is not None:
                    IoManager.writeXmlDoc(rootETree, self.reportZip, self.reportsFolder, 'FilingSummary.xml')
                    self.renderedFiles.add("FilingSummary.xml")
                    if self.summaryXslt and len(self.summaryXslt) > 0 :
                        _startedAt = time.time()
                        summary_transform = etree.XSLT(etree.parse(self.summaryXslt))
                        result = summary_transform(rootETree, asPage=etree.XSLT.strparam('true'),
                                                   accessionNumber="'{}'".format(getattr(filing, "accessionNumber", "")),
                                                   resourcesFolder="'{}'".format(self.resourcesFolder.replace("\\","/")))
                        self.logDebug("FilingSummary XSLT transform {:.3f} secs.".format(time.time() - _startedAt))
                        IoManager.writeHtmlDoc(result, self.reportZip, self.reportsFolder, 'FilingSummary.htm')
                        self.renderedFiles.add("FilingSummary.htm")
                    self.logDebug("Write filing summary complete")
                    if self.auxMetadata or filing.hasInlineReport: 
                        summary.writeMetaFiles()
                        self.logDebug("Write meta files complete")
                    if self.zipXbrlFilesToOutput and (hasattr(filing, "accessionNumber") or filing.entrypointfiles):
                        if hasattr(filing, "accessionNumber"):
                            _fileName = filing.accessionNumber + "-xbrl.zip"
                        else:
                            _fileName = os.path.splitext(os.path.basename(filing.entrypointfiles[0]["file"]))[0] + ".zip"
                        if not self.reportZip:
                            xbrlZip = zipfile.ZipFile(os.path.join(self.reportsFolder, _fileName), mode='w', compression=zipfile.ZIP_DEFLATED, allowZip64=False)
                        else:
                            zipStream = io.BytesIO()
                            xbrlZip = zipfile.ZipFile(zipStream, 'w', zipfile.ZIP_DEFLATED, True)
                        for report in filing.reports:
                            _xbrldir = os.path.dirname(report.filepath)
                            for reportedFile in sorted(report.reportedFiles):
                                if reportedFile not in xbrlZip.namelist():
                                    _filepath = os.path.join(_xbrldir, reportedFile)
                                    if sourceZipStream is not None:
                                        file = FileSource.openFileSource(_filepath, cntlr, sourceZipStream).file(_filepath, binary=True)[0]      
                                    else:
                                        file = filesource.file(_filepath, binary=True)[0]  # returned in a tuple
                                    xbrlZip.writestr(reportedFile, file.read())
                                    file.close()
                            filesource.close()
                        xbrlZip.close()
                        if self.reportZip:
                            zipStream.seek(0)
                            self.reportZip.writestr(_fileName, zipStream.read())
                            zipStream.close()
                        self.logDebug("Write {} complete".format(_fileName))
                
                if "EdgarRenderer/__init__.py#filingEnd" in filing.arelleUnitTests:
                    raise arelle.PythonUtil.pyNamedObject(filing.arelleUnitTests["EdgarRenderer/__init__.py#filingEnd"])
                
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
                    
        if not self.success and self.isDaemon: # not successful
            self.postprocessFailure(filing.options)
    
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
        # Master log and error/warning msg handler            
        messageDict = {'fatal':logging.FATAL
                       , 'error':logging.ERROR
                       , 'warn':logging.WARN
                       , 'info':logging.INFO
                       , 'debug':logging.DEBUG
                       , 'trace':logging.NOTSET}
        # find a level that agrees with the code
        if messageCode not in messageDict: messageLevel = logging.CRITICAL
        else:  messageLevel = messageDict[messageCode.casefold()]
        # if both level and code were given, err on the side of more logging:
        messageLevel = max(level, messageLevel)
        if self.entrypoint is not None and len(self.instanceList + self.inlineList) > 1:
            message += ' --' + (self.entrypoint.url if isinstance(self.entrypoint,FileSource.FileSource) else self.entrypoint)
        message = message.encode('utf-8', 'replace').decode('utf-8')
        if messageLevel >= logging.INFO:
            self.ErrorMsgs.append(Utils.Errmsg(messageCode, message))
            
        # dereference non-string messageArg values
        messageArgs = dict((k,str(v)) for k,v in messageArgs.items())

        if (self.modelManager and getattr(self.modelManager, 'modelXbrl', None)):
            self.modelManager.modelXbrl.log(logging.getLevelName(messageLevel), messageCode, message, *messageArgs)
        else:
            self.cntlr.addToLog(message, messageArgs=messageArgs, messageCode=messageCode, file=file, level=messageLevel)
            
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
    def setShowFilingData(self, *args):
        cntlr.config["edgarRendererShowFilingData"] = cntlr.showFilingData.get()
        cntlr.saveConfig()
    def setShowTablesMenu(self, *args):
        cntlr.config["edgarRendererShowTablesMenu"] = cntlr.showTablesMenu.get()
        cntlr.saveConfig()
    erViewMenu = Menu(cntlr.menubar, tearoff=0)
    viewMenu.add_cascade(label=_("Edgar Renderer"), menu=erViewMenu, underline=0)
    cntlr.showFilingData = BooleanVar(value=cntlr.config.get("edgarRendererShowFilingData", True))
    cntlr.showFilingData.trace("w", setShowFilingData)
    erViewMenu.add_checkbutton(label=_("Show Filing Data"), underline=0, variable=cntlr.showFilingData, onvalue=True, offvalue=False)
    cntlr.showTablesMenu = BooleanVar(value=cntlr.config.get("edgarRendererShowTablesMenu", True))
    cntlr.showTablesMenu.trace("w", setShowTablesMenu)
    erViewMenu.add_checkbutton(label=_("Show Tables Menu"), underline=0, variable=cntlr.showTablesMenu, onvalue=True, offvalue=False)

        
def edgarRendererGuiRun(cntlr, modelXbrl, attach, *args, **kwargs):
    """ run EdgarRenderer using GUI interactions for a single instance or testcases """
    if cntlr.hasGui:
        from arelle.ValidateFilingText import referencedFiles
        _combinedReports = not cntlr.showTablesMenu.get() # use mustard menu
        # may use GUI mode to process a single instance or test suite
        options = PythonUtil.attrdict(# simulate options that CntlrCmdLine provides
            configFile = os.path.join(os.path.dirname(__file__), 'conf', 'config_for_instance.xml'),
            renderingService = 'Instance',
            reportFormat = 'Html', # for Rall temporarily override report format to force only xml file output
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
            includeLogsInSummary = None, # for GUI logger does not have buffered messages available, always no logs in output
            saveTargetInstance = None,
            saveTargetFiling = None,
            deleteProcessedFilings = None,
            debugMode = None,
            validate = None,
            utrValidate = None,
            validateEFM = None,
            abortOnMajorError = False, # inherited
            processingFolder = None,
            processInZip = None,
            reportsFolder = "out" if cntlr.showFilingData.get() else None, # default to reports subdirectory of source input
            noReportOutput = None if cntlr.showFilingData.get() else True,
            reportInZip = None,
            resourcesFolder = None,
            reportXslt = ('InstanceReport.xslt', 'InstanceReportTable.xslt')[_combinedReports],
            summaryXslt = ('Summarize.xslt', '')[_combinedReports], # no FilingSummary.htm for Rall.htm production
                              # "LocalSummarize.xslt", # takes resources parameter for include dir
            excelXslt = ('InstanceReport_XmlWorkbook.xslt', None)[_combinedReports],
            logMessageTextFile = None,
            logFile = None # from cntlrCmdLine but need to simulate for GUI operation
            )
        if modelXbrl.modelDocument.type in ModelDocument.Type.TESTCASETYPES:
            modelXbrl.efmOptions = options  # save options in testcase's modelXbrl
        if modelXbrl.modelDocument.type not in (ModelDocument.Type.INLINEXBRL, ModelDocument.Type.INSTANCE):
            return
        reportedFiles = {modelXbrl.modelDocument.basename} | referencedFiles(modelXbrl)
        sourceDir = modelXbrl.modelDocument.filepathdir
        def addRefDocs(doc):
            for refDoc in doc.referencesDocument.keys():
                if refDoc.filepath and refDoc.filepath.startswith(sourceDir):
                    reportedFile = refDoc.filepath[len(sourceDir)+1:]
                    if reportedFile not in reportedFiles:
                        reportedFiles.add(reportedFile)
                        addRefDocs(refDoc)
        addRefDocs(modelXbrl.modelDocument)
        report = PythonUtil.attrdict( # simulate report
            isInline = modelXbrl.modelDocument.type == ModelDocument.Type.INLINEXBRL,
            reportedFiles = reportedFiles,
            renderedFiles = set(),
            entryPoint = {"file": modelXbrl.modelDocument.uri},
            url = modelXbrl.modelDocument.uri,
            filepath = modelXbrl.modelDocument.filepath,
            basename = modelXbrl.modelDocument.basename,
            documentType = None
            )
        for concept in modelXbrl.nameConcepts["DocumentType"]:
            for f in modelXbrl.factsByQname[concept.qname]:
                cntx = f.context
                if cntx is not None and not cntx.hasSegment and f.xValue:
                    report.documentType = f.xValue # find document type for mustard menu
                    break
        filing = PythonUtil.attrdict( # simulate filing
            filesource = modelXbrl.fileSource,
            reportZip = None,
            entrypointfiles = [{"file":modelXbrl.modelDocument.uri}],
            renderedFiles = set(),
            reports = [report],
            hasInlineReport = report.isInline,
            arelleUnitTests = {}
            )
        edgarRendererFilingStart(cntlr, options, {}, filing)
        edgarRenderer = filing.edgarRenderer
        edgarRendererXbrlRun(cntlr, options, modelXbrl, filing, report)
        reportsFolder = edgarRenderer.reportsFolder
        edgarRendererFilingEnd(cntlr, options, modelXbrl.fileSource, filing)
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
                import webbrowser
                webbrowser.open(url="{}/{}".format(_localhost,
                                      ("FilingSummary.htm", "Rall.htm")[_combinedReports]))

def testcaseVariationExpectedSeverity(modelTestcaseVariation, *args, **kwargs):
    # allow severity to appear on any variation sub-element (such as result)
    _severity = XmlUtil.descendantAttr(modelTestcaseVariation, None, "error", "severity")
    if _severity is not None:
        return _severity.upper()
    return None


__pluginInfo__ = {
    'name': 'Edgar Renderer',
    'version': VERSION, 
    'description': "This plug-in implements U.S. SEC Edgar Renderer.  ",
    'license': 'Apache-2',
    'author': 'U.S. SEC Employees and Mark V Systems Limited',
    'copyright': '(c) Portions by SEC Employees not subject to domestic copyright, otherwise (c) Copyright 2015 Mark V Systems Limited, All rights reserved.',
    'import': ('validate/EFM', ), # import dependent modules
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
    # GUI operation startup (renders all reports of an input instance or test suite)
    'CntlrWinMain.Xbrl.Loaded': edgarRendererGuiRun,
    # GUI operation, add View -> EdgarRenderer submenu for GUI options
    'CntlrWinMain.Menu.View': edgarRendererGuiViewMenuExtender,
    # identify expected severity of test cases for EdgarRenderer testcases processing
    'ModelTestcaseVariation.ExpectedSeverity': testcaseVariationExpectedSeverity
}
