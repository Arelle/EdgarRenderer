/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var AjaxMeta = {
  
  init : function( callback ) {
    if ( HelpersUrl.getAllParams ) {
      var xhr = new XMLHttpRequest();
      
      xhr.onreadystatechange = function( event ) {
        if ( xhr['readyState'] === 4 ) {
          if ( xhr['status'] === 200 ) {
            var response = JSON.parse(event['target']['response']);
            AjaxMeta.setInstance(response, event['target']['responseURL'], function( result ) {
              callback(result);
            });
          } else {
            
            document.getElementById('xbrl-form-loading').classList.add('d-none');
            
            ErrorsMinor.metaLinksNotFound(event['target']['responseURL']);
            
            callback(false);
          }
        }
      };
      
      xhr.open('GET', HelpersUrl.getAllParams['metalinks'], true);
      xhr.send();
    } else {
      callback(false);
    }
  },
  
  setInstance : function( input, metaFileLink, callback ) {
    if ( HelpersUrl.getAllParams['doc-file']
        && (Object.keys(input['instance'])[0].indexOf(HelpersUrl.getAllParams['doc-file']) > -1) ) {
      
      // we are good to proceed
      ConstantsFunctions.setMetaSourceDocumentsThenFixLinks(Object.keys(input['instance'])[0]);
      ConstantsFunctions.setMetaTags(input['instance'][Object.keys(input['instance'])[0]]['tag']);
      ConstantsFunctions.setMetaEntityCounts(input['instance'][Object.keys(input['instance'])[0]]);
      ConstantsFunctions.setMetaReports(input['instance'][Object.keys(input['instance'])[0]]['report']);
      ConstantsFunctions.setMetaStandardReference(input['std_ref']);
      ConstantsFunctions.setMetaVersion(input['version']);
      ConstantsFunctions.setMetaCustomPrefix(input['instance'][Object.keys(input['instance'])[0]]);
      ConstantsFunctions.setMetaDts(input['instance'][Object.keys(input['instance'])[0]]['dts']);
      ConstantsFunctions.setMetaHidden(input['instance'][Object.keys(input['instance'])[0]]['hidden']);
      callback(true);
    } else {
      // MetaLinks.json does not have this file as a key, hence we have an issue
      ErrorsMinor.metaLinksInstance(metaFileLink);
      callback(false);
    }
  }

};
