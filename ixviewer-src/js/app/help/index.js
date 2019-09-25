/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var Help = {
  
  toggle : function( event, element ) {
    
    if ( event.keyCode && !(event.keyCode === 13 || event.keyCode === 32) ) {
      return;
    }
    
    if ( element.classList && element.classList.contains('disabled') ) {
      return;
    }
    
    MenusState.toggle('help-menu', false, function( openMenu ) {
      if ( openMenu ) {
        document.getElementById('help-menu').addEventListener('transitionend', function( event ) {
          // our menu is now open
        }, {
          'once' : true
        });
      }
    });
  }
};
