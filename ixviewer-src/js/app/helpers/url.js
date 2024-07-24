/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var HelpersUrl = {
  
  init : function( internalUrl, callback ) {
    callback(HelpersUrl.setParams(internalUrl));
  },
  
  makeAbsoluteUrlUnlessSimpleAnchorTag : function( element ) {
    var url = new ParsedUrl(element.getAttribute('href'));
    if ( element.getAttribute('href').indexOf('http://') === 0
        || element.getAttribute('href').indexOf('https://') === 0 ) {
      // already absolute URL
      element.setAttribute('tabindex', '18');
    } else {
      if ( element.getAttribute('href').startsWith('#') ) {
        element.setAttribute('tabindex', '18');
        // already simple anchortag
        
      } else {
        element.setAttribute('tabindex', '18');
        element.setAttribute('href', HelpersUrl.getFormAbsoluteURL + element.getAttribute('href'));
      }
    }
  },
  
  fullURL : null,
  
  addLinkattributes : function( element ) {
    var attribute = null;
    if ( element ) {
      if ( element.getAttribute('data-link') ) {
        attribute = 'data-link';
      } else if ( element.getAttribute('href') ) {
        attribute = 'href';
      }
    }
    
    if ( attribute && element.getAttribute(attribute).charAt(0) !== '#' ) {
      var absoluteLinkOfElementAttribute = decodeURIComponent(HelpersUrl
          .getAbsoluteUrl(element.getAttribute(attribute)));
      var url = new ParsedUrl(absoluteLinkOfElementAttribute);
      if ( url.search ) {
        var urlParams = HelpersUrl.returnURLParamsAsObject(url.search.substring(1));
        if ( urlParams.hasOwnProperty('doc-file')
            && Constants.getMetaSourceDocuments.indexOf(urlParams['doc-file']) >= 0 ) {
          element.setAttribute('data-link', urlParams['doc-file']);
          element.setAttribute('href', urlParams['doc-file']);
          element.setAttribute('onclick', 'Links.clickEventInternal(event, this)');
        } else {
          HelpersUrl.makeAbsoluteUrlUnlessSimpleAnchorTag(element);
        }
      } else {
        if ( url.hash ) {
          var urlParams = element.getAttribute(attribute).split('#')[0];
          if ( element.getAttribute(attribute).split('#')[0]
              && Constants.getMetaSourceDocuments.indexOf(element.getAttribute(attribute).split('#')[0]) >= 0 ) {
            element.setAttribute('data-link', element.getAttribute(attribute));
            element.setAttribute('href', element.getAttribute(attribute));
            element.setAttribute('onclick', 'Links.clickEventInternal(event, this)');
          }
           else {
            HelpersUrl.makeAbsoluteUrlUnlessSimpleAnchorTag(element);
          }
        } else {
          var index = Constants.getMetaSourceDocuments.indexOf(element.getAttribute(attribute));
          if ( index >= 0 ) {
            // here we add the necessary attributes for multi-form
            element.setAttribute('data-link', Constants.getMetaSourceDocuments[index]);
            element.setAttribute('href', Constants.getMetaSourceDocuments[index]);
            element.setAttribute('onclick', 'Links.clickEventInternal(event, this)');
          } else {
            HelpersUrl.makeAbsoluteUrlUnlessSimpleAnchorTag(element);
          }
        }
      }
    } else {
      HelpersUrl.makeAbsoluteUrlUnlessSimpleAnchorTag(element);
    }
  },
  
  returnURLParamsAsObject : function( url ) {
    
    // HF: urlRedline=true when redline specified in non-workstation mode
    var urlRedline = url.indexOf('redline=true') >= 0; 
    var urlSplit = url.split(/doc=|file=|metalinks=|xbrl=true|xbrl=false/).filter(function( e ) {
      return e;
    });
    
    var obj = urlSplit.map(
        function( current ) {
          var lastChar = current.slice(-1);
          if ( lastChar === '&' ) {
            current = current.slice(0, -1);
          }
          if ( current.endsWith('.htm') || current.endsWith('.html') || current.endsWith('.xhtml') ) {
            
            current = decodeURIComponent(current);
            var docFile = current.split('filename=')[1] ? current.split('filename=')[1] : current.substring(current
                .lastIndexOf('/') + 1);
            // HF: redline in normal or workstation mode
            var redline = urlRedline || current.indexOf('redline=true') >= 0; 
            return {
              'doc' : current,
              'doc-file' : docFile,
              'redline' : redline
            };
          } else if ( current.slice(-5) === '.json' ) {
            
            current = decodeURIComponent(current);
            current = current.replace('interpretedFormat=true', 'interpretedFormat=false');
            // HF: redline in normal or workstation mode
            var redline = urlRedline || current.indexOf('redline=true') >= 0;
            return {
              'metalinks' : current,
              'metalinks-file' : 'MetaLinks.json',
              'redline' : redline
            };
          }
        }).filter(function( element ) {
      return element;
    });
    var objectToReturn = {};
    for ( var i = 0; i < obj.length; i++ ) {
      var single = obj[i];
      if ( !single.hasOwnProperty('metalinks') ) {
        var metalinks = single['doc'].replace(single['doc-file'], 'MetaLinks.json');
        single['metalinks'] = metalinks;
        single['metalinks-file'] = 'MetaLinks.json';
      }
      
      Object.assign(objectToReturn, single);
    }
    return objectToReturn;
    
  },
  
  getFormAbsoluteURL : null,
  
  getURL : null,
  
  getExternalFile : null,
  
  getExternalMeta : null,
  
  getHTMLFileName : null,
  
  getAnchorTag : null,
  
  getAllParams : null,
  
  setParams : function( internalUrl ) {
    
    if ( (internalUrl && typeof internalUrl === 'string') && (internalUrl !== HelpersUrl.getHTMLFileName) ) {
      HelpersUrl.fullURL = HelpersUrl.fullURL.replace(HelpersUrl.getHTMLFileName, internalUrl);
      HelpersUrl.updateURLWithoutReload();
      HelpersUrl.getHTMLFileName = null;
    }
    
    var url = new ParsedUrl(window.location.href);
    // here we check for cors
    var tempUrl = new ParsedUrl(url.search.substring(1).replace(/doc=|file=/, ''));
    var tempUrlHost = tempUrl.protocol + '//' + tempUrl.host;
    var host = url.protocol + '//' + url.host;
    if ( tempUrlHost !== host ) {
      ErrorsMajor.cors(tempUrl);
      return false;
    }
    
    HelpersUrl.fullURL = url.href;
    // we are going to set all of the URL Params as a simple object
    if ( url.search ) {
      HelpersUrl.getAllParams = HelpersUrl.returnURLParamsAsObject(url.search.substring(1));
      HelpersUrl.getAllParams.hostName = window.location.hostname;
      
      if ( HelpersUrl.getAllParams.hasOwnProperty('metalinks') ) {
        HelpersUrl.getExternalMeta = decodeURIComponent(HelpersUrl.getAllParams['metalinks']);
        HelpersUrl.getExternalMeta = HelpersUrl.getExternalMeta.replace('interpretedFormat=true',
            'interpretedFormat=false');
      }
      
      if ( HelpersUrl.getAllParams.hasOwnProperty('doc-file') ) {
        HelpersUrl.getHTMLFileName = HelpersUrl.getAllParams['doc-file'];
      }
      
      if ( url['hash'] ) {
        if ( url['hash'].endsWith('#') ) {
          
          url['hash'] = url['hash'].substring(0, url['hash'].length - 1);
        }
        HelpersUrl.getAnchorTag = url['hash'];
      }
      HelpersUrl.getExternalFile = HelpersUrl.getAllParams['doc'];
      if ( !HelpersUrl.getHTMLFileName && HelpersUrl.getExternalFile ) {
        var splitFormURL = HelpersUrl.getExternalFile.split('/');
        HelpersUrl.getHTMLFileName = splitFormURL[splitFormURL.length - 1];
      }
      
      if ( !HelpersUrl.getExternalMeta && HelpersUrl.getExternalFile ) {
        
        var tempMetaLink = HelpersUrl.getExternalFile.replace(HelpersUrl.getHTMLFileName, 'MetaLinks.json');
        
        HelpersUrl.getExternalMeta = tempMetaLink;
      }
    }
    if ( !HelpersUrl.getExternalFile ) {
      
      return false;
    }
    
    var formUrl = HelpersUrl.getAbsoluteUrl(HelpersUrl.getExternalFile);
    var absoluteURL = formUrl.substr(0, formUrl.lastIndexOf('/') + 1);
    
    HelpersUrl.getFormAbsoluteURL = absoluteURL;
    
    return true;
    
  },
  
  getAbsoluteUrl : function( url ) {
    var a = document.createElement('a');
    a.href = url;
    return a.href;
  },
  
  getParamsFromString : function( name, url ) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    var results = regex.exec(url);
    
    if ( !results ) {
      
      return null;
    }
    if ( !results[3] ) {
      
      return '';
    }
    return decodeURIComponent(results[3].replace(/\+/g, ' '));
  },
  
  updateURLWithoutReload : function( ) {
    window.history.pushState('Next Link', 'Inline XBRL Viewer', HelpersUrl.fullURL);
  }
};
