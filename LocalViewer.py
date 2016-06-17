"""
:mod:`EdgarRenderer.LocalViewer`
~~~~~~~~~~~~~~~~~~~
Edgar(tm) Renderer was created by staff of the U.S. Securities and Exchange Commission.
Data and content created by government employees within the scope of their employment 
are not subject to domestic copyright protection. 17 U.S.C. 105.
"""

from arelle.webserver.bottle import Bottle, static_file, response
import os, threading, time, logging

port = None
reportsFolders = [os.path.join(os.path.dirname(__file__), 'ixviewer')] # 0 is ixviewer

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
        
        def getlocalfile(file=None):
            cntlr.addToLog(_("http://localhost:{}/{}").format(port,file), messageCode="localViewer:get",level=logging.DEBUG)
            #print ("GET file={}".format(file))
            if file == 'favicon.ico':
                return static_file("arelle.ico", root=cntlr.imagesDir, mimetype='image/vnd.microsoft.icon')
            _report, _sep, _file = file.partition("/")
            if _file.startswith("ix.html"): # although in ixviewer, it refers relatively to ixviewer/
                return static_file(_file, root=reportsFolders[0])              
            if _file.startswith("ixviewer/"): # really in ixviewer subtree
                return static_file(_file[9:], root=reportsFolders[0])              
            if _report.isnumeric(): # in reportsFolder folder
                return static_file(_file, root=reportsFolders[int(_report)],
                                   # extra_headers modification to py-bottle
                                   more_headers={'Cache-Control': 'no-cache, no-store, must-revalidate',
                                                 'Pragma': 'no-cache',
                                                 'Expires': '0'})
            return static_file(file, root="/") # probably can't get here unless path is wrong
        
        # start server
        localserver = Bottle()
        
        localserver.route('/<file:path>', 'GET', getlocalfile)
        # start local server on the port on a separate thread
        threading.Thread(target=localserver.run, 
                         kwargs=dict(server='cherrypy', host='localhost', port=port, quiet=True), 
                         daemon=True).start()
        time.sleep(2) # allow other thread to run and start up

    localhost = "http://localhost:{}/{}".format(port, len(reportsFolders))
    reportsFolders.append(reportsFolder)
    cntlr.addToLog(_("http://localhost:{}").format(port), messageCode="localViewer:listen",level=logging.DEBUG)
    #print ("localhost={}".format(localhost))
    return localhost
