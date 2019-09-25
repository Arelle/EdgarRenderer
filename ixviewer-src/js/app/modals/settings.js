/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var ModalsSettings = {
  clickEvent : function( event, element ) {
    
    if ( event.keyCode && !(event.keyCode === 13 || event.keyCode === 32) ) {
      return;
    }
    Modals.close(event, element);
    
    document.getElementById('settings-modal').classList.remove('d-none');
    
    document.getElementById('settings-modal-drag').focus();
    // we add draggable
    Modals.initDrag(document.getElementById('settings-modal-drag'));
    
    // set correct selected value
    document.getElementById('scroll-position-select').value = Constants.scrollPosition;
  },
  
  scrollPosition : function( event, value ) {
    
    localStorage.setItem('scrollPosition', value);
    Constants.scrollPosition = value;
  },

};
