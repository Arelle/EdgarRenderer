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

This code is in gitHub/arelle/EdgarRenderer the plugin branch.

To debug under eclipse from a normal eclipse project of Arelle it is suggested to check out
EdgarRenderer from GitHub under the arelle plugin directory (e.g., this file would be 
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

   python3.4 arelleCmdLine.py 
   -f "/mydir/test/filingInstanceXsdAndLinkbases.zip" 
   -o "/mydir/test/out.zip" 
   --plugins 'EdgarRenderer|validate/EFM|transforms/SEC.py' # if installed in plugins, else full path to it: /mydir/myplugins/EdgarRenderer" 
   --disclosureSystem efm-pragmatic 
   --debugMode
   
    Adding --debugMode allows uncaught exceptions to provide a trace-back to eclipse, remove that
    for production.  Internet connectivity is by default offline at SEC, so override in this case.
    
    If in a closed environment with all taxonomies in Taxonomy Packages or preloaded to cache, add
       --internetConnectivity offline 


b) when invoking via REST interface (built in webserver or cgi-bin server):

    1) simple curl request or equivalent in code:
    
    curl -X POST "-HContent-type: application/zip" 
        -T amd.zip 
        -o out.zip 
        --logFile log.xml  # specifies name of log file to return in zip and whether .txt or .xml
        "http://localhost:8080/rest/xbrl/validation?efm-pragmatic&media=zip&plugins=EdgarRenderer|validate/EFM|transforms/SEC"
        
    2) to not load EdgarRenderer dynamically, it must be active in plugins.json (as set up by GUI)
    (sibling to the caches directoryexcept Mac where it's under ~/Library/Application Support/Arelle)
    
    then omit &plugins=EdgarRenderer
    
To run (as in EDGAR) with output report files added to the submission directory

   python3.4 arelleCmdLine.py 
   -f "/mydir/test/amd.zip" 
   -r "/mydir/test"  <<- the submission + output reports directory 
   --logFile logToBuffer or an specify an xml log file <<- required to save log messages into filing summary
   --plugins 'EdgarRenderer|validate/EFM|transforms/SEC.py' # if installed in plugins, else full path to it: /mydir/myplugins/EdgarRenderer" 
   --disclosureSystem efm-pragmatic 
   
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
    
At this moment, Xlout.py requires openpyxl 2.1.4, it does not work right on openpyxl 2.2.x

Required if running under Java (using runtime.exec) on Windows, suggested always:

    if xdgConfigHome or environment variable XDG_CONFIG_HOME are set:
    please set environment variable MPLCONFIGDIR to same location as xdgConfigHome/XDG_CONFIG_HOME
    (to prevent matlib crash under runtime.exe with Java)
        
"""
VERSION = '3.3.0.814'

from collections import defaultdict
from arelle import PythonUtil  # define 2.x or 3.x string types
PythonUtil.noop(0)  # Get rid of warning on PythonUtil import
from arelle import (Cntlr, FileSource, ModelDocument, XmlUtil, Version, ModelValue, Locale, PluginManager, WebCache, ModelFormulaObject,
                    ViewFileFactList, ViewFileFactTable, ViewFileConcepts, ViewFileFormulae,
                    ViewFileRelationshipSet, ViewFileTests, ViewFileRssFeed, ViewFileRoleTypes)
from . import RefManager, IoManager, Inline, Utils, Filing, Summary
import datetime, zipfile, logging, shutil, gettext, time, shlex, sys, traceback, linecache, os
from lxml import etree
from os import getcwd, remove, removedirs
from os.path import join, isfile, exists, dirname, basename, isdir
from optparse import OptionParser, SUPPRESS_HELP

# Helper functions

# def linenum():
    # Returns the current line number in the .py file
    # return inspect.currentframe().f_back.f_lineno


###############

def edgarRendererCmdLineOptionExtender(parser):
    parser.add_option("-o", "--output", dest="zipOutputFile",
                      help=_("Zip the artifacts generated by the rendering process into a file with this name."))
    parser.add_option("-c", "--configFile", dest="configFile", 
                      default=os.path.join(os.path.dirname(__file__), 'conf', 'config_for_instance.xml'),
                      help=_("Path of location of Edgar Renderer configuration file relative to CWD. Default is EdgarRenderer.xml."))
    parser.add_option("-r", "--reports", dest="reportsFolder",
                     help=_("Relative or absolute path and name of the reports folder."))
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
    parser.add_option("--noEquity", action="store_true", dest="noEquity", help=_("Set flag to suppress special treatment of Equity Statements. "))
        
    parser.add_option("--showErrors", action="store_true", dest="showErrors",
                      help=_("List all errors and warnings that may occur during RE3 processing."))
    parser.add_option("--debugMode", action="store_true", dest="debugMode", help=_("Let the debugger handle exceptions."))



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
        self.defaultValueDict['abortOnMajorError'] = str(True)
        self.defaultValueDict['archiveFolder'] = 'Archive'
        self.defaultValueDict['auxMetadata'] = str(True) # HF change to true default str(False)
        self.defaultValueDict['copyInlineFilesToOutput'] = str(False)
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
        self.defaultValueDict['resourcesFolder'] = os.path.normpath(os.path.join(os.path.dirname(__file__), "resources"))
        self.defaultValueDict['saveTargetInstance'] = str(True)
        self.defaultValueDict['saveTargetFiling'] = str(True)
        self.defaultValueDict['sourceList'] = ''
        self.defaultValueDict['summaryXslt'] = None
        self.defaultValueDict['totalClean'] = str(False)
        self.defaultValueDict['utrValidate'] = str(False)
        self.defaultValueDict['validate'] = str(False)
        self.defaultValueDict['validateEFM'] = str(False)
        self.defaultValueDict['zipOutputFile'] = None
        
        # The configDict holds the values as they were read from the config file.
        # Only options that appear with a value that is not None in defaultValueDict are recognized.
        self.configDict = defaultdict(lambda:None)
        configLocation = IoManager.getConfigFile(self,options)
        if configLocation is None: # Although it is odd not to have a config file, it is not an error.
            self.logDebug(_("No config file"))
        else:
            self.logDebug(_("Extracting info from config file {}".format(configLocation)))
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

    def initializeReOptions(self, options):
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
        options.zipOutputFile = setProp('zipOutputFile', self.webCache.normalizeUrl(options.zipOutputFile),cs=True) 
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
        options.totalClean = setFlag('totalClean', options.totalClean)
        options.noEquity = setFlag('noEquity', options.noEquity)
        options.auxMetadata = setFlag('auxMetadata', options.auxMetadata)
        options.copyInlineFilesToOutput = setFlag('copyInlineFilesToOutput', options.copyInlineFilesToOutput)
        options.saveTargetInstance = setFlag('saveTargetInstance',options.saveTargetInstance)
        options.saveTargetFiling = setFlag('saveTargetFiling',options.saveTargetFiling)      
        # note that delete processed filings is only relevant when the input had to be unzipped.
        options.deleteProcessedFilings = setFlag('deleteProcessedFilings', options.deleteProcessedFilings)
        options.debugMode = setFlag('debugMode', options.debugMode)        
        # These flags have to be passed back to arelle via the options object.
        # inherited flag: options.validate = setFlag('validate', options.validate)
        # inherited flag: options.utrValidate = setFlag('utrValidate', options.utrValidate)
        # inherited flag: options.validateEFM = setFlag('validateEFM', options.validateEFM)
    
        
        def setFolder(folder, init, searchPythonPath=False):
            if searchPythonPath: # if the folder is not an absolute path, we want to look for it relative to the python path.
                value= next((IoManager.absPathOnPythonPath(self,x)
                            for x in [init, self.configDict[folder], self.defaultValueDict[folder]]
                                 if x is not None), None)
            else: # otherwise interpret the folder as being relative to some subsequent processing location.
                value = next((x
                                 for x in [init, self.configDict[folder], self.defaultValueDict[folder]]
                                 if x is not None), None)
            # HF PATCH???
            if value is None and self.defaultValueDict[folder]:
                value = self.defaultValueDict[folder]
            setattr(self, folder, value)
            self.logDebug("{}=\t{}".format(folder, getattr(self, folder)))
            return getattr(self, folder)
        
        options.processingFolder = setFolder('processingFolder', self.webCache.normalizeUrl(options.processingFolder))
        self.processInZip = True # bool(options.processingFolder)
        options.reportsFolder = setFolder('reportsFolder', self.webCache.normalizeUrl(options.reportsFolder))
        self.reportInZip = True # bool(options.reportsFolder)
        options.resourcesFolder = setFolder('resourcesFolder', self.webCache.normalizeUrl(options.resourcesFolder),searchPythonPath=True)


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
                if getattr(self, file) is not None and not isfile(getattr(self, file)):
                    raise Exception(_(errstr).format(self.reportXslt))
            self.logDebug("{}=\t{}".format(file, value))            
            return value
       
        #setResourceFile('reportXslt', options.reportXslt, 'INVALID_CONFIG_REPORTXSLT')
        setResourceFile('reportXslt', options.reportXslt, "Cannot find report xslt {}")
        # Report XSLT is required when reportFormat contains 'Html'.     
        if self.reportXslt is None and 'html' in self.reportFormat.casefold():
            raise Exception('No {} specified when {}={} requires it.'.format('reportXslt', 'reportFormat', self.reportFormat))

        # Summary XSLT is optional, but do report if you can't find it.
        #setResourceFile('summaryXslt', options.summaryXslt, 'INVALID_CONFIG_SUMMARYXSLT')
        setResourceFile('summaryXslt', options.summaryXslt, "Cannot find summary xslt {}")

        # Excel XSLT is optional, but do report if you can't find it.
        #setResourceFile('excelXslt', options.excelXslt, 'INVALID_CONFIG_EXCELXSLT')  
        setResourceFile('excelXslt', options.excelXslt, "Cannot find excel xslt {}")
        
    def initializeReSinglesOptions(self, options):
        # At the moment there are not any options relevant only for single-instance mode.
        return
    
    
        
       
    
    @property
    def renderMode(self):
        return self.renderingService.casefold()
    @property
    def isSingles(self):
        return self.renderingService.casefold() == 'instance'
    @property
    def isDaemon(self):
        return self.renderingService.casefold() == 'daemon'
    
    
    
    def validateInstance(self, options, modelXbrl, formulaOptions):
        success = True
        try:          
            self.logDebug("Loading modelXbrl Formulae (if any) and performing validation")
            modelXbrl = self.modelManager.modelXbrl
            hasFormulae = modelXbrl.hasFormulae
            if self.validate:
                from arelle.Cntlr import LogToBufferHandler
                xbrlErrorLogger = LogToBufferHandler()
                modelXbrl.logger.addHandler(xbrlErrorLogger)
                startedAt = time.time()
                if options.formulaAction:  # don't automatically run formulas
                    modelXbrl.hasFormulae = False
                errorCountBeforeValidation = len(Utils.xbrlErrors(modelXbrl))
                self.modelManager.validate() 
                errorCountAfterValidation = len(Utils.xbrlErrors(modelXbrl))
                errorCountDuringValidation = errorCountAfterValidation - errorCountBeforeValidation
                if errorCountDuringValidation > 0:
                    for record in xbrlErrorLogger.logRecordBuffer.copy(): # copy the list so that errors here do not append to it.
                        try: href = record.refs[0]['href']
                        except: href = ''
                        try: sourceLine = record.refs[0]['sourceLine']
                        except: sourceLine = ''
                        if record.levelno >= logging.ERROR:
                            self.logError(_("[{}] {} - {} {}".format(record.messageCode
                                                                         ,record.getMessage()
                                                                         ,href.split('#')[0]
                                                                         ,sourceLine)))
                    if self.modelManager.abortOnMajorError:
                        success = False
                        self.logFatal(_("Not attempting to render after {} validation errors").format(
                                        errorCountDuringValidation))
                    else:
                        self.logInfo(_("Ignoring {} Validation errors because abortOnMajorError is not set.").format(errorCountDuringValidation))
    
                if options.formulaAction:  # restore setting
                    modelXbrl.hasFormulae = hasFormulae
                self.logInfo(Locale.format_string(self.modelManager.locale,
                                        _("validated in %.2f secs"),
                                        time.time() - startedAt))
                
            if success:
                if options.formulaAction in ("validate", "run"):  # do nothing here if "none"
                    from arelle import ValidateXbrlDimensions, ValidateFormula
                    startedAt = time.time()
                    if not self.validate:
                        ValidateXbrlDimensions.loadDimensionDefaults(modelXbrl)
                    # setup fresh parameters from formula optoins
                    modelXbrl.parameters = formulaOptions.typedParameters()
                    ValidateFormula.validate(modelXbrl, compileOnly=(options.formulaAction != "run"))
                    self.infoLog(Locale.format_string(self.modelManager.locale,
                                        _("formula validation and execution in %.2f secs")
                                        if options.formulaAction == "run"
                                        else _("formula validation only in %.2f secs"),
                                        time.time() - startedAt))
            
                if options.testReport:
                    ViewFileTests.viewTests(modelXbrl, options.testReport, options.testReportCols)
            
                if options.rssReport:
                    ViewFileRssFeed.viewRssFeed(modelXbrl, options.rssReport, options.rssReportCols)
            
                # if options.DTSFile:
                    # ViewFileDTS.viewDTS(modelXbrl, options.DTSFile)
                if options.factsFile:
                    ViewFileFactList.viewFacts(modelXbrl, options.factsFile, labelrole=options.labelRole, lang=options.labelLang, cols=options.factListCols)
                if options.factTableFile:
                    ViewFileFactTable.viewFacts(modelXbrl, options.factTableFile, labelrole=options.labelRole, lang=options.labelLang)
                if options.conceptsFile:
                    ViewFileConcepts.viewConcepts(modelXbrl, options.conceptsFile, labelrole=options.labelRole, lang=options.labelLang)
                if options.preFile:
                    ViewFileRelationshipSet.viewRelationshipSet(modelXbrl, options.preFile, "Presentation Linkbase", "http://www.xbrl.org/2003/arcrole/parent-child", labelrole=options.labelRole, lang=options.labelLang)
                if options.calFile:
                    ViewFileRelationshipSet.viewRelationshipSet(modelXbrl, options.calFile, "Calculation Linkbase", "http://www.xbrl.org/2003/arcrole/summation-item", labelrole=options.labelRole, lang=options.labelLang)
                if options.dimFile:
                    ViewFileRelationshipSet.viewRelationshipSet(modelXbrl, options.dimFile, "Dimensions", "XBRL-dimensions", labelrole=options.labelRole, lang=options.labelLang)
                if options.formulaeFile:
                    ViewFileFormulae.viewFormulae(modelXbrl, options.formulaeFile, "Formulae", lang=options.labelLang)
                if options.viewArcrole and options.viewFile:
                    ViewFileRelationshipSet.viewRelationshipSet(modelXbrl, options.viewFile, basename(options.viewArcrole), options.viewArcrole, labelrole=options.labelRole, lang=options.labelLang)
                if options.roleTypesFile:
                    ViewFileRoleTypes.viewRoleTypes(modelXbrl, options.roleTypesFile, "Role Types", isArcrole=False, lang=options.labelLang)
                if options.arcroleTypesFile:
                    ViewFileRoleTypes.viewRoleTypes(modelXbrl, options.arcroleTypesFile, "Arcrole Types", isArcrole=True, lang=options.labelLang)
                for pluginXbrlMethod in PluginManager.pluginClassMethods("CntlrCmdLine.Xbrl.Run"):
                    pluginXbrlMethod(self, options, modelXbrl)
    
        except (IOError, EnvironmentError) as err:
            #self.logError(ErrorMgr.getError('SAVE_OUTPUT_ERROR').format(err))
            self.logError("Failed to save output: {}".format(err))
            success = False
        except Exception as err:
            success = False
            tb = sys.exc_info()[2]  # t,v,tb tuple
            listOfFrames = []
            n = 0
            while tb is not None: 
                f = tb.tb_frame     
                lineno = tb.tb_lineno     
                co = f.f_code     
                filename = co.co_filename     
                name = co.co_name     
                if filename in linecache.cache:     
                    lines = linecache.cache[filename][2] 
                else:
                    try:
                        lines = linecache.updatecache(filename, f.f_globals)
                    except:
                        lines = []
                if 1 <= lineno <= len(lines):
                    line = lines[lineno - 1]   
                else:
                    line = ''                    
                if line: 
                    line = line.strip()     
                else: 
                    line = "(source not available)"    
                listOfFrames.append((filename, lineno, name, line))     
                tb = tb.tb_next     
                n = n + 1
            text = "Stack trace, most recent frame last:\n"
            for (filename, lineno, name, line) in listOfFrames:
                try:
                    text += "{0}".format(name)
                    text += "\t({0}".format(lineno)
                    text += " in {0})".format(filename)
                    text += "\n\t{0}\n".format(line)
                except:
                    text += "(UNPRINTABLE STACK FRAME)\n"
            #self.logError(_(ErrorMgr.getError('RE3_STACK_FRAME_ERROR')).format(err, text))
            self.logError(_('[Exception] Failed to complete request: {} {}').format(err, text))
        return success, modelXbrl 
    
    
    
    def runRenderer(self, options, sourceZipStream=None, responseZipStream=None):
        """Process command line arguments or web service request, such as to load and validate an XBRL document, or start web server.        
        When a web server has been requested, this method may be called multiple times, once for each web service (REST) request that requires processing.
        Otherwise (when called for a command line request) this method is called only once for the command line arguments request.
                   
        :param options: OptionParser options from parse_args of main argv arguments (when called from command line) or corresponding arguments from web service (REST) request.
        :type options: optparse.Values
        """
        self.logDebug("Starting "+VERSION)
        self.logDebug("Command line arguments: {!s}".format(sys.argv))
        # Process command line options
        self.processShowOptions(options)
    
        # set the filesource (input zip file if any)
        filesource = FileSource.openFileSource(options.entrypoint, self.cntlr, sourceZipStream)
        
        if responseZipStream:
            self.reportZip = zipfile.ZipFile(responseZipStream, 'w', zipfile.ZIP_DEFLATED, True)
        elif options.zipOutputFile:
            self.reportZip = zipfile.ZipFile(options.zipOutputFile, 'w', zipfile.ZIP_DEFLATED, True)
        else:
            self.reportZip = None
      
        # Set default config params; overwrite with command line args if necessary
        self.retrieveDefaultREConfigParams(options)
        # Initialize the folders and objects required in both modes.
        self.initializeReOptions(options)
        
        def innerRunRenderer():
            if self.isSingles: # Single mode folders are relative to source file and TEMP if not absolute.
                self.initializeReSinglesOptions(options)
            else:
                # Daemon mode must have at least input, processing, and output folders,
                # but the entrypointFolder and the reportsFolder are created as temporary locations.
                self.initializeReDaemonOptions(options)
                IoManager.handleFolder(self, self.filingsFolder, False, False) 
                IoManager.handleFolder(self, self.deliveryFolder, False, self.totalClean)
                IoManager.handleFolder(self, self.archiveFolder, False, self.totalClean)
                if self.errorsFolder is not None:  # You might not have an errors folder.
                    IoManager.handleFolder(self, self.errorsFolder, False, self.totalClean)             
                self.dequeueInputZip(options)
            if options.entrypoint is None and not sourceZipStream:
                self.logInfo("No filing specified. Exiting renderer.")
                return False
            print(options.entrypoint) # write filename to stdout so user can see what is processed; not needed in the log.
            if not IoManager.unpackInput(self, options, filesource): return False
            if filesource.isZip and self.zipOutputFile is None and not self.reportZip: 
                # Output zip name same as input by default
                self.zipOutputFile = basename(options.entrypoint)            
            modelXbrl = None        
            self.supplementalFileList = [basename(f) for f in self.supplementList]
            self.instanceSummaryList = []
            if self.reportsFolder and os.path.isabs(self.reportsFolder):
                self.reportsFolder = join(self.entrypointFolder, self.reportsFolder)
                IoManager.handleFolder(self, self.reportsFolder, True, self.totalClean)
            elif self.entrypointFolder and self.reportsFolder:
                self.reportsFolder = join(self.entrypointFolder, self.reportsFolder)
                IoManager.handleFolder(self, self.reportsFolder, True, self.totalClean)
            loopnum = 0
            success = True
            self.logDebug(_("Pre-rendering stats: NumInstance: {!s}; NumInline: {!s}; NumSupplemental: {!s} "
                           ).format(len(self.instanceList), len(self.inlineList), len(self.supplementList)))
            for inputFileSource in sorted(self.instanceList + self.inlineList):
                if success: 
                    loopnum += 1
                    if filesource.isZip:
                        filesource.select(inputFileSource)
                        inputFileSource = filesource
                    else:
                        inputFileSource = join(self.processingFolder, inputFileSource)
                    self.entrypoint = inputFileSource
                    (success, modelXbrl, firstStartedAt, fo
                     ) = self.loadModel(options, inputFileSource)
                    self.firstStartedAt = firstStartedAt
                    if modelXbrl is not None and self.validate: 
                        (success, modelXbrl) = self.validateInstance(options, modelXbrl, fo)     
                    if success and modelXbrl is not None: 
                        RefManager.RefManager(self.resourcesFolder).loadAddedUrls(modelXbrl, self)  # do this after validation.
                        self.logDebug(_("Start the rendering process on {}, filing loop {!s}.").format(inputFileSource, loopnum))
                        Inline.markFactLocations(modelXbrl)
                        success = Filing.mainFun(self, modelXbrl, self.reportsFolder)
                        self.logDebug(_("End of rendering on {}.").format(inputFileSource))
            
            if success and modelXbrl:                
                self.postprocessInstance(options, modelXbrl)
                self.logDebug("Post-processing complete")
            return success # from innerRunRenderer
                
        if self.debugMode:
            success = innerRunRenderer()
        else:
            try:
                success = innerRunRenderer()
            except Exception as err:
                self.logError("{} {}".format(err, "")) # traceback.format_tb(sys.exc_info()[2]))) # This takes us into infinite recursion.
                success = False
        if not success:
            self.postprocessFailure(options) 
            self.logDebug("Filing processing complete")
            
        if self.reportZip:
            if responseZipStream:
                if options.logFile:
                    if options.logFile.endswith(".xml"):
                        self.reportZip.writestr(options.logFile, self.cntlr.logHandler.getXml())
                    else:
                        self.reportZip.writestr(options.logFile, self.cntlr.logHandler.getText())
                else:
                    self.reportZip.writestr("log.txt", self.cntlr.logHandler.getText())
            self.reportZip.close()
        return success
    
    
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
            if not self.reportZip:
                target = join(self.reportsFolder, filename)
                if not exists(target):
                    os.makedirs(self.reportsFolder, exist_ok=True)
                    shutil.copyfile(source, target)                
            else:
                self.reportZip.write(source, filename)
        if 'html' in (self.reportFormat or "").casefold() or self.summaryXslt is not None:
            copyResourceToReportFolder("Show.js")
            copyResourceToReportFolder("report.css")
        if self.summaryXslt is not None:
            copyResourceToReportFolder("RenderingLogs.xslt")
        # TODO: At this point would be nice to call out any files not loaded in any instance DTS
        inputsToCopyToOutputList = self.supplementList
        if options.copyInlineFilesToOutput: inputsToCopyToOutputList += self.inlineList
        for filename in inputsToCopyToOutputList:
            source = join(self.processingFolder, filename)
            if not self.reportZip:
                target = join(self.reportsFolder, filename)
                if exists(target): remove(target)
                shutil.copyfile(source, target)                
            else:
                self.reportZip.write(source, filename)
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
            # In daemon mode, write an error log file looking somewhat like the one from RE2 and named the same.
            # Separately, create a zero-length "fail file" for the sole purpose of signaling status.
            if self.failFile is not None: 
                open(self.failFile, 'w').close()
            if self.entrypoint is None:
                #message = _(ErrorMgr.getError('CANNOT_PROCESS_INPUT_FILE')).format(self.entrypoint)
                self.logError(_("Cannot process input file {}.").format(self.entrypoint))
            else:
                errlogpath = join(self.deliveryFolder, os.path.splitext(self.zipOutputFile)[0] + '_errorLog.txt')
                if isfile(errlogpath): os.remove(errlogpath)
                #self.logError(_(ErrorMgr.getError('CANNOT_PROCESS_ZIP_FILE')).format(options.entrypoint))
                self.logError(_("Cannot process zip file {}; moving to fail folder.").format(options.entrypoint))
                IoManager.move_clobbering_file(options.entrypoint, self.errorsFolder)
                print(self.deliveryFolder + " " + errlogpath)
                with open(errlogpath, 'w', encoding='utf-8') as f:
                    for errmsg in self.ErrorMsgs:
                        message = "[" + errmsg.msgCode + "] " + errmsg.msg
                        print(message, file=f)
                    f.close() 


    
    def addToLog(self, message, messageArgs=(), messageCode='error', file=basename(__file__), level=logging.DEBUG):
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
            self.ErrorMsgs.append(Errmsg(messageCode, message))

        if (self.modelManager and getattr(self.modelManager, 'modelXbrl', None)):
            self.modelManager.modelXbrl.logger.messageLevelFilter = None
            self.modelManager.modelXbrl.log(messageLevel, messageCode, message, *messageArgs)
        else:
            self.cntlr.addToLog(message, messageArgs=messageArgs, messageCode=messageCode, file=file, level=messageLevel)
            
    # Lowercase tokens apparently write to standard output??
    
    def logTrace(self, message, messageArgs=(), file=basename(__file__)):
        self.addToLog(str(message), messageArgs=messageArgs, file=file, level=logging.NOTSET, messageCode='trace')

    def logDebug(self, message, messageArgs=(), file=basename(__file__)):
        self.addToLog(str(message), messageArgs=messageArgs, file=file, level=logging.DEBUG, messageCode='debug')

    def logInfo(self, message, messageArgs=(), file=None):
        self.addToLog(str(message), messageArgs=messageArgs, file=None, level=logging.INFO, messageCode='info')

    def logWarn(self, message, messageArgs=(), file=None):
        self.addToLog(str(message), messageArgs=messageArgs, file=None, level=logging.WARN, messageCode='warn')

    def logError(self, message, messageArgs=(), file=None):
        self.addToLog(str(message), messageArgs=messageArgs, file=None, level=logging.ERROR, messageCode='error')

    def logFatal(self, message, messageArgs=(), file=None):
        self.addToLog(str(message), messageArgs=messageArgs, file=None, level=logging.FATAL, messageCode='fatal')

def edgarRendererCmdLineRun(cntlr, options, sourceZipStream=None, responseZipStream=None, **kwargs):
    # adjust for Arelle CntlrCmdLine to EdgarRenderer options names
    options.entrypoint = options.entrypointFile
    # prevent cntrlCmdLine from running normal xbrl load after this plugin
    options.entrypointFile = None
    
    EdgarRenderer(cntlr).runRenderer(options, sourceZipStream, responseZipStream)
    
    
# Arelle plugin integrations for validate/EFM
def setProcessingFolder(edgarRenderer, filesource):
    if filesource and edgarRenderer.processingFolder == edgarRenderer.defaultValueDict['processingFolder']:
        if filesource.isOpen:
            if filesource.isArchive:
                edgarRenderer.processingFolder = filesource.basefile
            else:
                edgarRenderer.processingFolder = os.path.dirname(filesource.basefile)
        else:
            edgarRenderer.processingFolder = os.path.dirname(filesource.url)
    
def edgarRendererFilingStart(cntlr, options, entrypointFiles, filing):
    filing.edgarRenderer = edgarRenderer = EdgarRenderer(cntlr)
    edgarRenderer.reportZip = filing.reportZip
    # Set default config params; overwrite with command line args if necessary
    edgarRenderer.retrieveDefaultREConfigParams(options)
    # Initialize the folders and objects required in both modes.
    edgarRenderer.initializeReOptions(options)
    edgarRenderer.instanceSummaryList = []
    edgarRenderer.instanceList = []
    edgarRenderer.inlineList = []
    edgarRenderer.otherXbrlList = []
    edgarRenderer.supplementList = []
    edgarRenderer.supplementalFileList = []
    edgarRenderer.renderedFiles = filing.renderedFiles # filing-level rendered files
    if not filing.reportZip and edgarRenderer.reportsFolder:
        IoManager.handleFolder(edgarRenderer, edgarRenderer.reportsFolder, True, edgarRenderer.totalClean)
    setProcessingFolder(edgarRenderer, filing.filesource)

def edgarRendererXbrlRun(cntlr, options, modelXbrl, filing, report):
    edgarRenderer = filing.edgarRenderer
    setProcessingFolder(edgarRenderer, modelXbrl.fileSource)
    edgarRenderer.renderedFiles = report.renderedFiles # report-level rendered files
    if report.basename.endswith(".xml"):
        edgarRenderer.instanceList.append(report.basename)
    elif report.basename.endswith(".htm"):
        edgarRenderer.inlineList.append(report.basename)
    edgarRenderer.supplementalFileList += sorted(report.reportedFiles)
    RefManager.RefManager(edgarRenderer.resourcesFolder).loadAddedUrls(modelXbrl, edgarRenderer)  # do this after validation.
    edgarRenderer.loopnum = getattr(edgarRenderer, "loopnum", 0) + 1
    edgarRenderer.logDebug(_("Start the rendering process on {}, filing loop {!s}.").format(modelXbrl.modelDocument.basename, edgarRenderer.loopnum))
    Inline.markFactLocations(modelXbrl)
    Inline.saveTargetDocumentIfNeeded(edgarRenderer,options,modelXbrl)
    success = Filing.mainFun(edgarRenderer, modelXbrl, edgarRenderer.reportsFolder)
    edgarRenderer.renderedFiles = filing.renderedFiles # filing-level rendered files

def edgarRendererFilingEnd(cntlr, options, filing):
    edgarRenderer = filing.edgarRenderer
    if edgarRenderer.xlWriter:
        edgarRenderer.xlWriter.save()
        edgarRenderer.xlWriter.close()
        del edgarRenderer.xlWriter 
        edgarRenderer.logDebug("Excel rendering complete")
    def copyResourceToReportFolder(filename):
        source = join(edgarRenderer.resourcesFolder, filename)
        if not edgarRenderer.reportZip:
            target = join(edgarRenderer.reportsFolder, filename)
            if not exists(target):
                os.makedirs(edgarRenderer.reportsFolder, exist_ok=True)
                shutil.copyfile(source, target)
                edgarRenderer.renderedFiles.add(filename)             
        else:
            edgarRenderer.reportZip.write(source, filename)
    if 'html' in (edgarRenderer.reportFormat or "").casefold() or edgarRenderer.summaryXslt is not None:
        copyResourceToReportFolder("Show.js")
        copyResourceToReportFolder("report.css")
    if edgarRenderer.summaryXslt is not None:
        copyResourceToReportFolder("RenderingLogs.xslt")  # TODO: This will go away
        edgarRenderer.renderedFiles.add("RenderingLogs.xslt")
    # TODO: At this point would be nice to call out any files not loaded in any instance DTS
    inputsToCopyToOutputList = edgarRenderer.supplementList
    if options.copyInlineFilesToOutput: inputsToCopyToOutputList += self.inlineList
    for filename in inputsToCopyToOutputList:
        source = join(edgarRenderer.processingFolder, filename)
        if not edgarRenderer.reportZip:
            target = join(edgarRenderer.reportsFolder, filename)
            if exists(target): remove(target)
            shutil.copyfile(source, target)                
        else:
            self.reportZip.write(source, filename)
    edgarRenderer.logDebug("Instance post-processing complete")
    
    
    
    summary = Summary.Summary(edgarRenderer)  
    rootETree = summary.buildSummaryETree()
    IoManager.writeXmlDoc(rootETree, edgarRenderer.reportZip, edgarRenderer.reportsFolder, 'FilingSummary.xml')
    edgarRenderer.renderedFiles.add("FilingSummary.xml")
    if edgarRenderer.summaryXslt and len(edgarRenderer.summaryXslt) > 0 :
        summary_transform = etree.XSLT(etree.parse(edgarRenderer.summaryXslt))
        result = summary_transform(rootETree, asPage=etree.XSLT.strparam('true'),
                                   accessionNumber="'{}'".format(getattr(filing, "accessionNumber", "")))
        IoManager.writeHtmlDoc(result, edgarRenderer.reportZip, edgarRenderer.reportsFolder, 'FilingSummary.htm')
        edgarRenderer.renderedFiles.add("FilingSummary.htm")
    edgarRenderer.logDebug("Write filing summary complete")
    if edgarRenderer.auxMetadata and filing.hasInlineReport: 
        summary.writeMetaFiles()
    edgarRenderer.logDebug("Write meta files complete")
    

'''
Errors and Logging
'''
    
class Errmsg(object):
    def __init__(self, messageCode, message):
        self.msgCode = messageCode
        self.msg = message


__pluginInfo__ = {
    'name': 'Edgar Renderer',
    'version': '3.3.0.814',
    'description': "This plug-in implements U.S. SEC Edgar Renderer.  ",
    'license': 'Apache-2',
    'author': 'U.S. SEC Employees and Mark V Systems Limited',
    'copyright': '(c) Portions by SEC Employees not subject to domestic copyright, otherwise (c) Copyright 2015 Mark V Systems Limited, All rights reserved.',
    # classes of mount points (required)
    'CntlrCmdLine.Options': edgarRendererCmdLineOptionExtender,
    #'CntlrCmdLine.Utility.Run': edgarRendererCmdLineRun,
    'EdgarRenderer.Filing.Start': edgarRendererFilingStart,
    'EdgarRenderer.Xbrl.Run': edgarRendererXbrlRun,
    'EdgarRenderer.Filing.End': edgarRendererFilingEnd
}
