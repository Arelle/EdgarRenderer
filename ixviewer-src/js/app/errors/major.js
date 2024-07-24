/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var ErrorsMajor = {
  
  inactive : function( ) {
    ErrorsMinor.browserSuggestion();
    var content = document.createTextNode('Inline XBRL is not usable in this state.');
    
    var element = document.createElement('div');
    element.setAttribute('class', 'alert-height alert alert-danger show mb-0');
    element.appendChild(content);
    document.getElementById('error-container').appendChild(element);
    
    Errors.updateMainContainerHeight();
  },
  
  formLinksNotFound : function( ) {
    var content = document.createTextNode(HelpersUrl.getFormAbsoluteURL + HelpersUrl.getHTMLFileName);
    
    var element = document.createElement('div');
    element.setAttribute('class', 'alert-height alert alert-danger show mb-0');
    
    var link = document.createElement('a');
    
    link.setAttribute('href', HelpersUrl.getFormAbsoluteURL);
    
    link.appendChild(content);
    element.appendChild(link);
    document.getElementById('error-container').appendChild(element);
    
    window.location.assign(HelpersUrl.getFormAbsoluteURL + HelpersUrl.getHTMLFileName);
    Errors.updateMainContainerHeight();
  },
  
  urlParams : function( ) {
    var content = document
        .createTextNode('Inline XBRL requires a URL param (doc | file) that correlates to a Financial Report.');
    
    var element = document.createElement('div');
    element.setAttribute('class', 'alert-height alert alert-danger show mb-0');
    element.appendChild(content);
    document.getElementById('error-container').appendChild(element);
    
    Errors.updateMainContainerHeight();
  },
  
  cors : function( doc ) {
    var host = window.location.protocol + '//' + window.location.host;
    
    var content = document.createTextNode('The protocol, host name and port number of the "doc" field (' + doc.host
        + '), if provided, must be identical to that of the Inline XBRL viewer(' + host + ')');
    
    var element = document.createElement('div');
    element.setAttribute('class', 'alert-height alert alert-danger show mb-0');
    element.appendChild(content);
    document.getElementById('error-container').appendChild(element);
    
    Errors.updateMainContainerHeight();
  }
};
