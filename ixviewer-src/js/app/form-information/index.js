/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var FormInformation = {
  
  init : function( event, element ) {
    if ( event.type === 'keyup' && (event.keyCode === 13 || event.keyCode === 32) ) {
      $(element).dropdown('toggle');
    }
    FormInformation.xbrlInstance();
    FormInformation.xbrlZip();
    FormInformation.xbrlHtml();
    FormInformation.version();
  },
  
  xbrlInstance : function( ) {
    
    var instance = HelpersUrl.getExternalFile.substring(0, HelpersUrl.getExternalFile.lastIndexOf('.')) + '_htm.xml';
    
    document.getElementById('form-information-instance').setAttribute('href', instance);
    
  },
  
  xbrlZip : function( ) {
    
    var zip = HelpersUrl.getExternalFile.substring(0, HelpersUrl.getExternalFile.lastIndexOf('.')) + '.zip';
    
    document.getElementById('form-information-zip').setAttribute('href', zip);
    
  },
  
  xbrlHtml : function( ) {
    
    document.getElementById('form-information-html').setAttribute('href', HelpersUrl.getExternalFile);
    
  },
  
  version : function( ) {
    document.getElementById('form-information-version').innerText = 'Version: ' + Constants.version;
    
  }

};
