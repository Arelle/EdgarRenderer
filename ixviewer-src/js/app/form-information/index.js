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
    var zip = "";
    var zipFileName;
    var adsh;
    var url = HelpersUrl.getExternalFile;
    if ( HelpersUrl.getAllParams.hostName.indexOf("edgar.sec.gov") !== -1 ) {
      adsh = ConstantsFunctions.getUrlVars(url)["accessionNumber"];
      zipFileName = adsh + '-xbrl.zip';
      var lastIndexOfEqual = url.lastIndexOf("=");
      zip = url.substring(0, lastIndexOfEqual) + "=" + zipFileName;
    } else {
      var index = url.lastIndexOf("/");
      var tempHold = url.substring(index, index - 18);
      adsh = tempHold.substring(0, 10) + "-" + tempHold.substring(10, 12) + "-" + tempHold.substring(12, 18);
      zipFileName = adsh + '-xbrl.zip';
      zip = url.substring(0, index) + "/" + zipFileName;
    }

    document.getElementById('form-information-zip').setAttribute('href', zip);
  },
  
  xbrlHtml : function( ) {
    document.getElementById('form-information-html').setAttribute('href', HelpersUrl.getExternalFile);
  },
  
  version : function( ) {
    document.getElementById('form-information-version').innerText = 'Version: ' + Constants.version + ' (' + Constants.featureSet + ')';
  }

};
