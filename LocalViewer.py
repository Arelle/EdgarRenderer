"""
:mod:`EdgarRenderer.LocalViewer`
~~~~~~~~~~~~~~~~~~~
Edgar(tm) Renderer was created by staff of the U.S. Securities and Exchange Commission.
Data and content created by government employees within the scope of their employment 
are not subject to domestic copyright protection. 17 U.S.C. 105.
"""

from arelle.webserver.bottle import Bottle, static_file
import os, threading, time, logging, sys

port = None
reportsFolders = [os.path.dirname(__file__)] # 0 is root of include and ixviewer

def init(cntlr, reportsFolder): # returns browser root
    global port
    if port is None: # already initialized
    
        # find available port
        import socket
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.bind(("",0))
        s.listen(1)
        port = s.getsockname()[1]
        s.close()
        #port = 8080 # test with fixed port
        
        def getlocalfile(file=None, relpath=None):
            cntlr.addToLog("http://localhost:{}/{}".format(port,file), messageCode="localViewer:get",level=logging.DEBUG)
            # print ("GET file={}".format(file))
            if file == 'favicon.ico':
                return static_file("arelle.ico", root=cntlr.imagesDir, mimetype='image/vnd.microsoft.icon')
            _report, _sep, _file = file.partition("/")
            if (_file.startswith("ix.html") # although in ixviewer, it refers relatively to ixviewer/
                or _file.startswith("css/")
                or (_file.startswith("images/") and os.path.exists(os.path.join(reportsFolders[0], 'ixviewer', _file))) 
                or _file.startswith("js/")):
                return static_file(_file, root=os.path.join(reportsFolders[0], 'ixviewer')) 
            if _report == "include": # really in include subtree
                # print(os.path.join(os.path.join(reportsFolders[0], 'include'), _file))
                return static_file(_file, root=os.path.join(reportsFolders[0], 'include'))              
            if _file.startswith("include/"): # really in ixviewer subtree
                # print(os.path.join(os.path.join(reportsFolders[0], 'ixviewer'),_file[9:]))
                return static_file(_file[8:], root=os.path.join(reportsFolders[0], 'include'))              
            if _file.startswith("ixviewer/"): # really in ixviewer subtree
                # print(os.path.join(os.path.join(reportsFolders[0], 'ixviewer'),_file[9:]))
                return static_file(_file[9:], root=os.path.join(reportsFolders[0], 'ixviewer'))              
            if _report.isnumeric(): # in reportsFolder folder
                # print (os.path.join(reportsFolders[int(_report)], _file))
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
                return static_file(_file, root=reportsFolders[int(_report)],
                                   # extra_headers modification to py-bottle
                                   more_headers={'Cache-Control': 'no-cache, no-store, must-revalidate',
                                                 'Pragma': 'no-cache',
                                                 'Expires': '0'})
            return static_file(file, root="/") # probably can't get here unless path is wrong
        
        # start server
        localserver = Bottle()
        
        localserver.route('/<file:path>', 'GET', getlocalfile)
        localserver.route('<relpath:path>', 'GET', getlocalfile)
        # start local server on the port on a separate thread
        threading.Thread(target=localserver.run, 
                         # The wsgi server part of cherrypy was split into a new 'cheroot'
                         #kwargs=dict(server='cherrypy', host='localhost', port=port, quiet=True), 
                         kwargs=dict(server='cheroot', host='localhost', port=port, quiet=True), 
                         daemon=True).start()
        time.sleep(2) # allow other thread to run and start up

    localhost = "http://localhost:{}/{}".format(port, len(reportsFolders))
    reportsFolders.append(reportsFolder)
    cntlr.addToLog(_("http://localhost:{}").format(port), messageCode="localViewer:listen",level=logging.DEBUG)
    #print ("localhost={}".format(localhost))
    return localhost
