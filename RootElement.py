# -*- coding: utf-8 -*-
"""
:mod:`re.RootElement`
~~~~~~~~~~~~~~~~~~~
Edgar(tm) Renderer was created by staff of the U.S. Securities and Exchange Commission.
Data and content created by government employees within the scope of their employment 
are not subject to domestic copyright protection. 17 U.S.C. 105.
"""

import xml.sax.handler, sys
from . import ErrorMgr
import arelle.XbrlConst

class RootElement(object):
    def __init__(self):
        pass
    
    def getLocalName(self,pathname):
        return self.getQName(pathname)[0]
    
    def getQName(self, controller, pathname): # return ns, localname, and inline namespace if found
        parser=xml.sax.make_parser()
        handler = RootElementHandler()
        parser.setContentHandler(handler)
        parser._namespaces = True
        try:
            parser.parse(pathname)
        except OSError as e:      
            message = ErrorMgr.getError('OS_ERROR').format(pathname, e)
            self.addToLog(controller, message, messageCode='error')
            sys.stderr.flush() 
            return None
        except xml.sax.SAXException as e:
            message = ErrorMgr.getError('XML_EXCEPTION').format(pathname, e)
            self.addToLog(controller, message, messageCode='error')
            sys.stderr.flush()
            return None
        except RootElementFound:
            return (handler.rootNamespace,handler.rootElement,handler.inlineNamespaceBound)
        
    def isInstance(self, controller, pathname):
        qname = self.getQName(controller, pathname)
        return ((qname is not None) and (qname[1]=='xbrl') and (qname[0]==arelle.XbrlConst.xbrli))
    
    def isLinkbase(self,controller,pathname):
        qname = self.getQName(controller,pathname)
        return ((qname is not None) and (qname[1]=='linkbase') and (qname[0]==arelle.XbrlConst.link))
    
    def isSchema(self,controller,pathname):
        qname = self.getQName(controller,pathname)
        return ((qname is not None) and (qname[1]=='schema') and (qname[0]==arelle.XbrlConst.xsd))
    
    def isXhtml(self,controller,pathname):
        qname = self.getQName(controller, pathname)
        # TODO: It is possible to get an XHTML document that is not inline XBRL and this will go wrong.
        return ((qname is not None) and (qname[1]=='html') and (qname[0]==arelle.XbrlConst.xhtml))
    
    def addToLog(self,controller,message,messageCode='debug',messageArgs=(),file='RootElement.py'):
        controller.addToLog(message, messageCode=messageCode, messageArgs=messageArgs, file=file)
 
class RootElementHandler(xml.sax.handler.ContentHandler):
    def __init__(self):
        self.rootElement = None
        self.rootNamespace = None
        self.inlineNamespaceBound = None
 
    def startElementNS(self, qname, x, attributes):
        self.rootNamespace = qname[0]
        self.rootElement = qname[1]
        raise RootElementFound
    
    def startPrefixMapping(self, prefix, uri):
        if uri in arelle.XbrlConst.ixbrlAll: 
            self.inlineNamespaceBound = uri


class RootElementFound (Exception):
    pass

