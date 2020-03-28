"""
:mod:`EdgarRenderer.LocalViewer`
~~~~~~~~~~~~~~~~~~~
Edgar(tm) Renderer was created by staff of the U.S. Securities and Exchange Commission.
Data and content created by government employees within the scope of their employment 
are not subject to domestic copyright protection. 17 U.S.C. 105.
"""
from arelle.webserver.bottle import static_file, redirect
from arelle.LocalViewer import LocalViewer
import os, logging, sys


class _LocalViewer(LocalViewer):
    # plugin-specific local file handler
    def getLocalFile(self, file, relpath, request):
        if file == 'favicon.ico':
            return static_file("arelle.ico", root=self.cntlr.imagesDir, mimetype='image/vnd.microsoft.icon')
        _report, _sep, _file = file.partition("/")
        if file == "---xbrl.zip" and "referer" in request.headers: # no report number, get from referer header
            refererPathParts = request.headers["referer"].split("/")
            if len(refererPathParts) >= 4 and refererPathParts[3].isnumeric():
                _report = refererPathParts[3]
                _file = file
        if (_file.startswith("ix.html") # although in ixviewer, it refers relatively to ixviewer/
            or _file.startswith("ix-dev.html")
            or _file.startswith("browser-error.html")
            or _file.startswith("css/")
            or (_file.startswith("images/") and os.path.exists(os.path.join(self.reportsFolders[0], 'ixviewer', _file))) 
            or _file.startswith("js/")):
            return static_file(_file, root=os.path.join(self.reportsFolders[0], 'ixviewer')) 
        if _report == "include": # really in include subtree
            return static_file(_file, root=os.path.join(self.reportsFolders[0], 'include'))              
        if _file.startswith("include/") or  _file.startswith("Images/"): # really in ixviewer subtree (Workstation Images are in distribution include)
            return static_file(_file[8:], root=os.path.join(self.reportsFolders[0], 'include'))              
        if _file.startswith("ixviewer/"): # really in ixviewer subtree
            return static_file(_file[9:], root=os.path.join(self.reportsFolders[0], 'ixviewer'))
        if _report.isnumeric(): # in reportsFolder folder
            # is it an EDGAR workstation query parameter
            if _file == "DisplayDocument.do" and "filename" in request.query:
                _file = request.query["filename"]
                self.cntlr.addToLog("  ?filename={}".format(_file), messageCode="localViewer:get",level=logging.DEBUG)
            # check if file is in the current or parent directory (may bve
            _fileDir = self.reportsFolders[int(_report)]
            _fileExists = False
            if os.path.exists(os.path.join(_fileDir, _file)):
                _fileExists = True
            elif os.path.exists(os.path.join(os.path.dirname(_fileDir), _file)):
                _fileDir = os.path.dirname(_fileDir)
                _fileExists = True
            elif file.endswith("---xbrl.zip"):
                # default zip produced for accession but local zip may have no accession number
                for f in os.listdir(_fileDir):
                    if f.endswith(".zip"):  
                        redirect("/{}/{}".format(_report,f))      
            if not _fileExists:
                self.cntlr.addToLog("http://localhost:{}/{}".format(self.port,file), messageCode="localViewer:fileNotFound",level=logging.DEBUG)
            return static_file(_file, root=_fileDir, more_headers=self.noCacheHeaders) # extra_headers modification to py-bottle
        return static_file(file, root="/") # probably can't get here unless path is wrong

localViewer = _LocalViewer("SEC ix viewer", os.path.dirname(__file__)) # plugin singleton local viewer class

def init(cntlr, reportsFolder): # returns browser root
    return localViewer.init(cntlr, reportsFolder)
