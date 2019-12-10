/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var ErrorsMajor = {
  
  inactive : function( ) {
    var messageToUser = 'Inline XBRL is not usable in this state.';
    document.getElementById('error-container').innerHTML += '<div class="alert-height alert alert-danger show mb-0">'
        + messageToUser + '</div>';
    Errors.updateMainContainerHeight();
  },
  
   formLinksNotFound: function () {
    var messageToUser = 'Inline XBRL form could not be found.';
    document.getElementById('error-container').innerHTML += '<div class="reboot alert-height alert alert-danger show mb-0">' +
      messageToUser + ' (<a class="reboot" href="' + HelpersUrl.getFormAbsoluteURL + '">' + HelpersUrl.getFormAbsoluteURL + HelpersUrl.getHTMLFileName + '</a>)</div>';
     window.location.assign(HelpersUrl.getFormAbsoluteURL + HelpersUrl.getHTMLFileName);
Errors.updateMainContainerHeight();
  },
  
  
  urlParams : function( ) {
    
    var messageToUser = 'Inline XBRL requires a URL param (doc | file) that coorelates to a Financial Report.';
    document.getElementById('error-container').innerHTML += '<div class="alert-height alert alert-danger show mb-0">'
        + messageToUser + '</div>';
    Errors.updateMainContainerHeight();
  },
  
  cors : function( doc ) {
    var host = window.location.protocol + '//' + window.location.host;
    var messageToUser = 'The protocol, host name and port number of the "doc" field (' + doc.host
        + '), if provided, must be identical to that of the Inline XBRL viewer(' + host + ')';
    document.getElementById('error-container').innerHTML += '<div class="alert-height alert alert-danger show mb-0">'
        + messageToUser + '</div>';
    Errors.updateMainContainerHeight();
  }
};
