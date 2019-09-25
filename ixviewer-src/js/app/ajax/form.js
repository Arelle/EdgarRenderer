/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var AjaxForm = {
  
  init : function( callback ) {
    
    if ( HelpersUrl.getAllParams ) {
      var input = HelpersUrl.getAllParams['doc'];
      document.getElementById('dynamic-xbrl-form').innerHTML = '';
      document.getElementById('xbrl-form-loading').classList.remove('d-none');
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function( event ) {
        if ( xhr['readyState'] === 4 ) {
          if ( xhr['status'] === 200 ) {
            
            if ( (xhr.getResponseHeader('Content-Length') || xhr.getResponseHeader('Content-Encoding')) ) {
              Errors.checkFileSizeForLimits(xhr.response.length);
            }
            
            var regex = /<html[^>]*>/;
            
            var result = xhr.response.match(regex);
            
            if ( result && result[0] ) {
              
              ConstantsFunctions.setHTMLAttributes(result[0].replace(/(\r\n|\n|\r)/gm, ' ').trim());
            } else {
              ErrorsMinor.unknownError();
            }
            
            document.getElementById('dynamic-xbrl-form').innerHTML = event['currentTarget']['response'];
            
            ConstantsFunctions.setHTMLPrefix();
            
            document.getElementById('xbrl-form-loading').classList.add('d-none');
            
            callback(true);
          } else {
            document.getElementById('xbrl-form-loading').className += ' d-none';
            callback(false);
          }
          
        }
      };
      
      xhr.open('GET', input, true);
      xhr.send();
    } else {
      document.getElementById('xbrl-form-loading').className += ' d-none';
      callback(false);
    }
    
  }

};
