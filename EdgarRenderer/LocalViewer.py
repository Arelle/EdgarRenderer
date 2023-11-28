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
import regex as re

ixviewerDirFilesPattern = re.compile(r"^ix(-dev)?.x?html|^browser-error.html|^css/|^images/|^js/|^[a-z0-9.-]+min\.(js|css)(\.map)?$|^[a-z0-9]+\.(ttf|woff2)$")
extMimeType = {
    ".xhtml": "application/xhtml+xml",
    ".html":  "text/html",
    ".htm":   "text/html",
    ".js":    "text/javascript",
    ".css":    "text/css",
    ".gif":    "image/gif",
    ".jpg":    "image/jpeg",
    ".json":   "application/json"
    }

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
        if _report == "include": # really in include subtree
            return static_file(_file, root=os.path.join(self.reportsFolders[0], 'include'))
        if ixviewerDirFilesPattern.match(_file): # although in ixviewer, it refers relatively to ixviewer/
            return static_file(_file, root=os.path.join(self.reportsFolders[0], 'ixviewer'),
                               mimetype=extMimeType.get(os.path.splitext(file)[1], None))
        if _file.startswith("/ixviewer"): # ops gateway
            return static_file(_file, root=self.reportsFolders[0][:-1])
        if _file.startswith("include/"): # really in ixviewer subtree (Workstation Images are in distribution include)
            return static_file(_file[8:], root=os.path.join(self.reportsFolders[0], 'include'))
        if _file.startswith("images/") or  _file.startswith("Images/"): # really in ixviewer subtree (Workstation Images are in distribution include)
            return static_file(_file[7:], root=os.path.join(self.reportsFolders[0], 'include'))
        if _report == "images": # really in ixviewer subtree (Workstation Images are in distribution include)
            return static_file(_file, root=os.path.join(self.reportsFolders[0], 'include'))
        if _file.startswith("ixviewer/"): # really in ixviewer subtree
            return static_file(_file[9:], root=os.path.join(self.reportsFolders[0], 'ixviewer'))
        if _report.isnumeric(): # in reportsFolder folder
            # is it an EDGAR workstation query parameter
            if _file == "DisplayDocument.do":
                if "filename" in request.query:
                    _file = request.query["filename"]
                    self.cntlr.addToLog("  ?filename={}".format(_file), messageCode="localViewer:get",level=logging.DEBUG)
                else:
                    self.cntlr.addToLog("  ?" + ", ".join([f"{k}={v}" for k,v in request.query.items()]),level=logging.DEBUG)
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
                queryParams = ", ".join([f"{k}={v}" for k,v in request.query.items()])
                if queryParams:
                    queryParams = "?" + queryParams
                self.cntlr.addToLog("http://localhost:{}/{}{}".format(self.port,file,queryParams), messageCode="localViewer:fileNotFound",level=logging.DEBUG)
            return static_file(_file, root=_fileDir, headers=self.noCacheHeaders) # extra_headers modification to py-bottle
        return static_file(file, root="/") # probably can't get here unless path is wrong

localViewer = _LocalViewer("SEC ix viewer", os.path.dirname(__file__)) # plugin singleton local viewer class

def init(cntlr, reportsFolder): # returns browser root
    return localViewer.init(cntlr, reportsFolder)
