# -*- coding: utf-8 -*-
"""
:mod:`re.IoManager`
~~~~~~~~~~~~~~~~~~~
Edgar(tm) Renderer was created by staff of the U.S. Securities and Exchange Commission.
Data and content created by government employees within the scope of their employment 
are not subject to domestic copyright protection. 17 U.S.C. 105.
"""

from os import getpid, remove, makedirs, getenv, listdir
from os.path import basename, isfile, abspath, isdir, dirname, exists, join, splitext, normpath
import json, re, shutil, sys, datetime, os, zipfile
import arelle.XbrlConst
import RootElement, Utils, ErrorMgr

jsonIndent = 0  # None for most compact, 0 for left aligned
  
def genpath(filename):
    if filename == '.':
        filename = basename(abspath(filename))
    return "{0}-{1}-{2:06d}".format(re.sub(r'[:\-\\.]', '', str(datetime.datetime.now())).replace(' ', '-')                                    
                                    # .translate(str.maketrans(" :.","---"))
                                    , splitext(basename(filename))[0], getpid())
    
def createNewFolder(cntlr,path,stubname="."):
    newpath = join(path, genpath(stubname))
    cntlr.createdFolders += [newpath]
    return newpath

def cleanupNewfolders(cntlr):
    for f in cntlr.createdFolders:
        shutil.rmtree(f,ignore_errors=True)
    
def absPathOnPythonPath(cntlr, filename):  # if filename is relative, find it on the PYTHONPATH, otherwise, just return it.
    if filename is None: return None
    if os.path.isabs(filename): return filename
    pathdirs = [p for p in sys.path if os.path.isdir(p)]
    for path in pathdirs:
        result = os.path.join(path, filename)
        if exists(result): return os.path.abspath(result)
    cntlr.logDebug("No such location {} found in sys path dirs {}.".format(filename, pathdirs))
    return None
    
def writeXmlDoc(etree, path):  
    etree.getroottree().write(path, method='xml', with_tail=False, pretty_print=True, encoding='utf-8', xml_declaration=True)   
    
def writeHtmlDoc(root, path):      
    root.write(path, method='html', with_tail=False, pretty_print=True, encoding='utf-8')
    
def writeJsonDoc(lines, path):
    with open(path, mode='w') as f:
        json.dump(lines, f, sort_keys=True, indent=jsonIndent)


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
    remove(src)
    return destination


def handleFolder(cntlr, folderName, mustBeEmpty, forceClean):  # return success
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
            message = ErrorMgr.getError('FOLDER_MUST_BE_EMPTY').format(folderName)
            cntlr.logError(message, file=basename(__file__))
            raise Exception(message)
        
def getConfigFile(cntlr, options):
    if options.configFile is None: return None
    configFile = absPathOnPythonPath(cntlr, options.configFile)
    return configFile

def logConfigFile(cntlr, options):
    configFileTemp = getConfigFile(cntlr, options)
    if configFileTemp:
        cntlr.logInfo("Contents of configuration file '{}':".format(configFileTemp), file=basename(__file__))
        with open(configFileTemp, "r") as ins:
            for line in ins:
                cntlr.logInfo(line.strip(), file=basename(__file__))
        cntlr.logInfo("sys.argv {0}".format(sys.argv), file=basename(__file__))
        

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

    
def unpackInput(cntlr, options):  # success
    # with side effect on cntlr entrypointFolder, processingFolder, instanceList,otherXbrlList,inlineList,supplementList
    # Process options, setting self.entrypointFolder and figuring out whether it is:
    # 1. a zip file that may contain multiple instances
    # 2. a single instance file
    # 3. a folder that may contain multiple instances
    # and unpack (i.e, copy) that input to a processing folder.
    # return success (boolean)
    unpacked = 0
    cntlr.instanceList = []
    cntlr.inlineList = []
    cntlr.otherXbrlList = []
    cntlr.supplementList = []
    if not cntlr.entrypointFolder: cntlr.entrypointFolder = abspath(options.entrypoint)
    if not isdir(cntlr.entrypointFolder): cntlr.entrypointFolder = dirname(cntlr.entrypointFolder)
    # an absolute path for processing folder root can be specified in the configuration file.
    cntlr.originalProcessingFolder = join(getenv("TEMP"), cntlr.processingFolder)    
    cntlr.processingFolder = createNewFolder(cntlr,cntlr.originalProcessingFolder, options.entrypoint)
    knownSingleInput = None                
    try:
        handleFolder(cntlr, cntlr.processingFolder, True, True)    
        # Case 1: entry point is a zip file.
        if zipfile.is_zipfile(options.entrypoint):
            cntlr.logInfo(_("Extracting from zip file. "), file=basename(__file__))
            zf = zipfile.ZipFile(options.entrypoint, 'r')
            for base in zf.namelist():
                if base.startswith('./'):  # prevent errors arising from windows file system foolishness
                    base = normpath(base)
                target = join(cntlr.processingFolder, base)               
                with open(target, 'wb') as fp:
                    fp.write(zf.read(base))  # unzip to the processing folder.
                if isSurvivor(cntlr, "zip", base, None, target):
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
            cntlr.logInfo(_("Copying from Input folder {}").format(cntlr.entrypointFolder), file=basename(__file__))
            for base in listdir(cntlr.entrypointFolder):
                source = join(cntlr.entrypointFolder, base)
                if isFileHidden(source) or isdir(source): continue
                target = join(cntlr.processingFolder, base)
                shutil.copy(source, target)
                if isSurvivor(cntlr, "folder", base, knownSingleInput, target):
                    unpacked += 1         
                                   
    except Exception as e:
        unpacked = 0
        cntlr.logError(_("Exception raised during file unpacking: {}").format(e), file='IoManager.py')
        return False
    if len(cntlr.instanceList) == 0 and len(cntlr.inlineList) == 0:
        cntlr.entrypoint = basename(options.entrypoint)
        cntlr.logError(_("No instance or inline document found!"))
        return False
    cntlr.logInfo(_("{} Files copied to processing folder {}").format(unpacked, cntlr.processingFolder), file=basename(__file__))
    return True



def isSurvivor(cntlr, original, base, entry, target):  # return boolean
    oktocopy = Utils.isImageFilename(base) or Utils.isXmlFilename(base) or Utils.isInlineFilename(base)
    if not oktocopy:  # Found a file that doesn't fit
        message = _(ErrorMgr.getError('IGNORE_OTHER_FILE')).format(base)
        cntlr.logWarn(message, file=basename(__file__))
        remove(target)
        return False
    if Utils.isImageFilename(base):
        cntlr.logDebug("Found Image in {0}: {1}".format(original, base), file=basename(__file__))
        cntlr.supplementList += [base]
        return True
    result = RootElement.RootElement().getQName(cntlr, target)
    ns = ln = ixns = None
    if result is not None:
        ns, ln, ixns = result
    if (ns, ln, ixns) == (arelle.XbrlConst.xhtml, 'html', arelle.XbrlConst.ixbrl11):
        if entry is None or entry == base:
            cntlr.logDebug("Found Inline 1.1 Doc in {0}: {1}".format(original, base), file=basename(__file__))
            cntlr.inlineList += [base]
        else:
            cntlr.logDebug("Ignoring Inline 1.1 Doc in {0} not the specified entry {1}: {2}"
                           .format(original, entry, base), file=basename(__file__))
            return False
    elif (ns, ln) == (arelle.XbrlConst.xbrli, 'xbrl'):
        if entry is None or entry == base:
            cntlr.logDebug("Found Instance Doc in {0}: {1}".format(original, base), file=basename(__file__))
            cntlr.instanceList += [base]
        else:
            cntlr.logDebug("Ignoring Instance Doc in {0} not the specified entry {1}: {2}"
                           .format(original, entry, base), file=basename(__file__))
            return False
    elif (ns, ln) == (arelle.XbrlConst.link, 'linkbase'):
        cntlr.logDebug("Found Linkbase in {}: {}".format(original, base), file=basename(__file__))
        cntlr.otherXbrlList += [base]
    elif (ns, ln) == (arelle.XbrlConst.xsd, 'schema'):
        cntlr.logDebug("Found schema in {}: {}".format(original, base), file=basename(__file__))
        cntlr.otherXbrlList += [base]
    else:
        cntlr.logDebug("Ignoring unknown file {} in {}".format(original, base), file=basename(__file__))
        remove(target)
        return False
    return True  # you made it

        
        
        
        
