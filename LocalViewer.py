"""
:mod:`EdgarRenderer.LocalViewer`
~~~~~~~~~~~~~~~~~~~
Edgar(tm) Renderer was created by staff of the U.S. Securities and Exchange Commission.
Data and content created by government employees within the scope of their employment 
are not subject to domestic copyright protection. 17 U.S.C. 105.
"""
from arelle.webserver.bottle import static_file
from arelle.LocalViewer import LocalViewer
import os, logging, sys

class _LocalViewer(LocalViewer):
    # plugin-specific local file handler
    def getLocalFile(self, file=None, relpath=None):
        if file == 'favicon.ico':
            return static_file("arelle.ico", root=self.cntlr.imagesDir, mimetype='image/vnd.microsoft.icon')
        _report, _sep, _file = file.partition("/")
        if (_file.startswith("ix.html") # although in ixviewer, it refers relatively to ixviewer/
            or _file.startswith("css/")
            or (_file.startswith("images/") and os.path.exists(os.path.join(self.reportsFolders[0], 'ixviewer', _file))) 
            or _file.startswith("js/")):
            return static_file(_file, root=os.path.join(self.reportsFolders[0], 'ixviewer')) 
        if _report == "include": # really in include subtree
            return static_file(_file, root=os.path.join(self.reportsFolders[0], 'include'))              
        if _file.startswith("include/"): # really in ixviewer subtree
            return static_file(_file[8:], root=os.path.join(self.reportsFolders[0], 'include'))              
        if _file.startswith("ixviewer/"): # really in ixviewer subtree
            return static_file(_file[9:], root=os.path.join(self.reportsFolders[0], 'ixviewer'))              
        if _report.isnumeric(): # in reportsFolder folder
            # is it an EDGAR workstation query parameter
            if _file == "DisplayDocument.do":
                try:
                    for i in range(100):
                        if "request" in sys._getframe(i).f_globals and hasattr(sys._getframe(i).f_globals["request"], "query"):
                            _file = sys._getframe(i).f_globals["request"].query["filename"]
                            cntlr.addToLog("  ?filename={}".format(_file), messageCode="localViewer:get",level=logging.DEBUG)
                            break
                except ValueError:
                    pass
            # check if file is in the current or parent directory (may bve
            _fileDir = self.reportsFolders[int(_report)]
            _fileExists = False
            if os.path.exists(os.path.join(_fileDir, _file)):
                _fileExists = True
            else:
                if os.path.exists(os.path.join(os.path.dirname(_fileDir), _file)):
                    _fileDir = os.path.dirname(_fileDir)
                    _fileExists = True
            if not _fileExists:
                cntlr.addToLog("http://localhost:{}/{}".format(self.port,file), messageCode="localViewer:fileNotFound",level=logging.DEBUG)
            return static_file(_file, root=_fileDir,
                               # extra_headers modification to py-bottle
                               more_headers={'Cache-Control': 'no-cache, no-store, must-revalidate',
                                             'Pragma': 'no-cache',
                                             'Expires': '0'})
        return static_file(file, root="/") # probably can't get here unless path is wrong

localViewer = _LocalViewer("SEC ix viewer", os.path.dirname(__file__)) # plugin singleton local viewer class

def init(cntlr, reportsFolder): # returns browser root
    return localViewer.init(cntlr, reportsFolder)
