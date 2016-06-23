# -*- coding: utf-8 -*-
"""
:mod:`EdgarRenderer.IoManager`
~~~~~~~~~~~~~~~~~~~
Edgar(tm) Renderer was created by staff of the U.S. Securities and Exchange Commission.
Data and content created by government employees within the scope of their employment 
are not subject to domestic copyright protection. 17 U.S.C. 105.
"""

from os import getpid, remove, makedirs, getenv, listdir
from os.path import basename, isfile, abspath, isdir, dirname, exists, join, splitext, normpath
from io import IOBase
import json, re, shutil, sys, datetime, os, zipfile
import arelle.XbrlConst
from lxml.etree import tostring as treeToString
from . import Utils

jsonIndent = 1  # None for most compact, 0 for left aligned
  
def genpath(filename):
    if filename == '.':
        filename = basename(abspath(filename))
    return "{0}-{1}-{2:06d}".format(re.sub(r'[:\-\\.]', '', str(datetime.datetime.now())).replace(' ', '-')                                    
                                    # .translate(str.maketrans(" :.","---"))
                                    , splitext(basename(filename))[0], getpid())
    
def createNewFolder(controller,path,stubname="."):
    newpath = join(path, genpath(stubname))
    controller.createdFolders += [newpath]
    return newpath

def cleanupNewfolders(controller):
    for f in controller.createdFolders:
        shutil.rmtree(f,ignore_errors=True)
    
def absPathOnPythonPath(controller, filename):  # if filename is relative, find it on the PYTHONPATH, otherwise, just return it.
    if filename is None: return None
    if os.path.isabs(filename): return filename
    # for plugin configuration look in the plugin's own directory first
    pathdirs = [p
                for p in [os.path.dirname(__file__)] + sys.path
                if os.path.isdir(p)]
    for path in pathdirs:
        result = os.path.join(path, filename)
        if exists(result): return os.path.abspath(result)
    controller.logDebug("No such location {} found in sys path dirs {}.".format(filename, pathdirs))
    return None
    
def writeXmlDoc(etree, reportZip, reportFolder, filename):  
    if reportZip:
        reportZip.writestr(filename, treeToString(etree.getroottree(), method='xml', with_tail=False, pretty_print=True, encoding='utf-8', xml_declaration=True))  
    elif reportFolder is not None:
        etree.getroottree().write(os.path.join(reportFolder, filename), method='xml', with_tail=False, pretty_print=True, encoding='utf-8', xml_declaration=True)   
    
def writeHtmlDoc(root, reportZip, reportFolder, filename):  
    if reportZip:
        reportZip.writestr(filename, treeToString(root, method='html', with_tail=False, pretty_print=True, encoding='utf-8'))  
    elif reportFolder is not None:
        root.write(os.path.join(reportFolder, filename), method='html', with_tail=False, pretty_print=True, encoding='utf-8')
    
def writeJsonDoc(lines, pathOrStream):
    if isinstance(pathOrStream, str):
        with open(pathOrStream, mode='w') as f:
            json.dump(lines, f, sort_keys=True, indent=jsonIndent)
    elif isinstance(pathOrStream, IOBase): # path is an open file
        json.dump(lines, pathOrStream, sort_keys=True, indent=jsonIndent)

def moveToZip(zf, abspath, zippath):                        
    if isfile(abspath) and not isFileHidden(abspath):
        zf.write(abspath, zippath, zipfile.ZIP_DEFLATED)
        remove(abspath)

def move_clobbering_file(src, dst):  # this works across Windows drives, simple rename does not.
    if isdir(dst):  
        dstfolder = dst
        dstfile = basename(src)
    else:
        dstfolder = dirname(dst)
        dstfile = basename(dst)
    if not exists(dstfolder): makedirs(dstfolder, exist_ok=True)
    destination = join(dstfolder, dstfile)
    if exists(join(dstfolder, dstfile)): remove(destination)                     
    shutil.copy2(src, destination)
    try:
        remove(src)
    except OSError as err:
        # HF: fix msg in next release ("Non fatal Cleanup problem: {}".format(err))
        return None

    return destination


def handleFolder(controller, folderName, mustBeEmpty, forceClean):  # return success
    if not exists(folderName):
        makedirs(folderName, exist_ok=True)
    else:
        fileList = listdir(folderName)
        if forceClean:
            for file in fileList: 
                fullfilepath = join(folderName , file)
                if isdir(fullfilepath):
                    shutil.rmtree(fullfilepath)
                else:
                    remove(fullfilepath)
        elif mustBeEmpty and len(fileList) > 0 :
            message = "Folder {} exists and is not empty.".format(folderName)
            controller.logError(message, file=basename(__file__))
            raise Exception(message)
        
def getConfigFile(controller, options):
    if options.configFile is None: return None
    _localConfigFile = os.path.join(os.getcwd(), options.configFile)
    if os.path.exists(_localConfigFile):
        return(_localConfigFile)
    configFile = absPathOnPythonPath(controller, options.configFile)
    return configFile

def logConfigFile(controller, options):
    configFileTemp = getConfigFile(controller, options)
    if configFileTemp:
        controller.logInfo("Contents of configuration file '{}':".format(configFileTemp), file=basename(__file__))
        with open(configFileTemp, "r") as ins:
            for line in ins:
                controller.logInfo(line.strip(), file=basename(__file__))
        controller.logInfo("sys.argv {}".format(sys.argv), file=basename(__file__))
        

def isFileHidden(p):
    p = basename(p)
    if p.startswith('.'):
        return True
    if sys.platform.startswith("win"):
        # import win32api, win32con
        # attribute = win32api.GetFileAttributes(p)
        # return attribute & (win32con.FILE_ATTRIBUTE_HIDDEN | win32con.FILE_ATTRIBUTE_SYSTEM)
        if p == "Thumbs.db":
            return True
    return False

    
def unpackInput(controller, options, filesource):  # success
    # with side effect on controller entrypointFolder, processingFolder, instanceList,otherXbrlList,inlineList,supplementList
    # Process options, setting self.entrypointFolder and figuring out whether it is:
    # 1. a zip file that may contain multiple instances
    # 2. a single instance file
    # 3. a folder that may contain multiple instances
    # and unpack (i.e, copy) that input to a processing folder.
    # return success (boolean)
    unpacked = 0
    controller.instanceList = []
    controller.inlineList = []
    controller.otherXbrlList = []
    controller.supplementList = []
    # an absolute path for processing folder root can be specified in the configuration file.
    # HF: controller.originalProcessingFolder = join(getenv("TEMP"), controller.processingFolder)    
    # HF: controller.processingFolder = createNewFolder(controller,controller.originalProcessingFolder, options.entrypoint)
    knownSingleInput = None                
    try:
        # Case 1: entry point is a zip file.
        if controller.processInZip:
            for base in filesource.dir:
                if not base.startswith('.'):
                    fileStream, _encoding = filesource.file(filesource.baseurl + "/" + base)
                    if isSurvivor(controller, "zip", base, None, fileStream):
                        unpacked += 1
                    fileStream.close()
        elif filesource.isZip:
            controller.logDebug(_("Extracting from zip file."), file=basename(__file__))
            zf = zipfile.ZipFile(options.entrypoint, 'r')
            for base in zf.namelist():
                if base.startswith('./'):  # prevent errors arising from windows file system foolishness
                    base = normpath(base)
                target = join(controller.processingFolder, base)               
                with open(target, 'wb') as fp:
                    fp.write(zf.read(base))  # unzip to the processing folder.
                if isSurvivor(controller, "zip", base, None, target):
                    unpacked += 1
        
        else:  # Not a zip file.

            # Case 2: Entry point is a single file.
            # Treat it as if the entrypoint were its parent folder.
            # This does create a problem if there are multiple instances, because it
            # will copy extra non-instance files for processing.
            # TODO: give a warning when XBRL files are copied to target but then not used in the DTS.
            if isfile(options.entrypoint) and not isdir(options.entrypoint):
                knownSingleInput = basename(options.entrypoint)
    
            # Case 1: Entry point is a folder.  Copy everything except unknown instances and inlines
            controller.logDebug(_("Copying from Input folder {}").format(controller.entrypointFolder), file=basename(__file__))
            for base in listdir(controller.entrypointFolder):
                if not base.startswith("."):
                    source = join(controller.entrypointFolder, base)
                    if isFileHidden(source) or isdir(source): continue
                    target = join(controller.processingFolder, base)
                    shutil.copy(source, target)
                    if isSurvivor(controller, "folder", base, knownSingleInput, target):
                        unpacked += 1         
                                   
    except Exception as e:
        unpacked = 0
        controller.logError(_("Exception raised during file unpacking: {}").format(e), file='IoManager.py')
        return False
    if len(controller.instanceList) == 0 and len(controller.inlineList) == 0:
        controller.entrypoint = basename(options.entrypoint)
        controller.logError(_("No instance or inline document found!"))
        return False
    controller.logDebug(_("{} Files copied to processing folder {}").format(unpacked, controller.processingFolder), file=basename(__file__))
    return True


def isSurvivor(controller, original, base, entry, targetOrStream):  # return boolean
    oktocopy = Utils.isImageFilename(base) or Utils.isXmlFilename(base) or Utils.isInlineFilename(base)
    if not oktocopy:  # Found a file that doesn't fit
        controller.logInfo(_("Ignoring file {} of unknown type found in folder or zip.").format(base), file=basename(__file__))
        if isinstance(targetOrStream, str): # file name, not filesource
            remove(targetOrStream)
        return False
    if Utils.isImageFilename(base):
        controller.logDebug("Found Image in {0}: {1}".format(original, base), file=basename(__file__))
        controller.supplementList += [base]
        return True
    result = getQName(controller, targetOrStream)
    ns = ln = ixns = None
    if result is not None:
        ns, ln, ixns = result
    if (ns, ln, ixns) == (arelle.XbrlConst.xhtml, 'html', arelle.XbrlConst.ixbrl11):
        if entry is None or entry == base:
            controller.logDebug("Found Inline 1.1 Doc in {0}: {1}".format(original, base), file=basename(__file__))
            controller.inlineList += [base]
        else:
            controller.logDebug("Ignoring Inline 1.1 Doc in {0} not the specified entry {1}: {2}"
                           .format(original, entry, base), file=basename(__file__))
            return False
    elif (ns, ln) == (arelle.XbrlConst.xhtml, 'html') and ixns in arelle.XbrlConst.ixbrlAll:
        controller.logDebug("Only Inline 1.1 is supported, ignoring Inline 1.0 doc {0} in {1}".format(original,base),file=basename(__file__))
    elif (ns, ln) == (arelle.XbrlConst.xbrli, 'xbrl'):
        if entry is None or entry == base:
            controller.logDebug("Found Instance Doc in {0}: {1}".format(original, base), file=basename(__file__))
            controller.instanceList += [base]
        else:
            controller.logDebug("Ignoring Instance Doc in {0} not the specified entry {1}: {2}"
                           .format(original, entry, base), file=basename(__file__))
            return False
    elif (ns, ln) == (arelle.XbrlConst.link, 'linkbase'):
        controller.logDebug("Found Linkbase in {}: {}".format(original, base), file=basename(__file__))
        controller.otherXbrlList += [base]
    elif (ns, ln) == (arelle.XbrlConst.xsd, 'schema'):
        controller.logDebug("Found schema in {}: {}".format(original, base), file=basename(__file__))
        controller.otherXbrlList += [base]
    else:
        controller.logDebug("Ignoring unknown file {} in {}".format(base,original), file=basename(__file__))
        if isinstance(targetOrStream, str): # file name, not filesource
            remove(targetOrStream)
        return False
    return True  # you made it


def getQName(controller, pathname): # return ns, localname, and inline namespace if found
    from lxml import etree

    rootElement = rootNamespace = inlineNamespaceBound = None
    f = None
    try:
        if isinstance(pathname, str):
            f = open(pathname)
        else: # stream, already is open
            f = pathname
        for event, element in etree.iterparse(f.buffer, events=('start','start-ns')):
            if event == 'start-ns':
                ignore, uri = element
                if uri in arelle.XbrlConst.ixbrlAll:
                    inlineNamespaceBound = uri
            elif event == 'start':
                qname = etree.QName(element.tag)
                rootNamespace = qname.namespace
                rootElement = qname.localname
                break
    except Exception as e:
        controller.logDebug("EXCEPTION ON {}: {}".format(pathname, e))
    finally:
        if isinstance(f, str):
            f.close()
        sys.stderr.flush()
    return (rootNamespace, rootElement, inlineNamespaceBound)
