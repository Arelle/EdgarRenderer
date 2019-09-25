/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var Scroll = {
  
  toTop : function( ) {
    var formElement = document.getElementById('dynamic-xbrl-form');
    formElement.scrollTop = 0;
    Scroll.removeAnchorTag();
  },
  
  scroll : function( event, element ) {
    if ( element.scrollTop === 0 ) {
      document.getElementById('back-to-top').classList.add('d-none');
      
    }
    else {
      document.getElementById('back-to-top').classList.remove('d-none');
    }
  },
  
  removeAnchorTag : function( ) {
    location.hash = '';
  }
};
