/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';
var MenusState = {
  toggle : function( menuId, rightIfTrue, callback ) {
    
    var whichSide = (rightIfTrue) ? 'right' : 'left';
    
    if ( MenusState.openMenu !== '' && MenusState.openMenu !== menuId ) {
      var whichSavedSide = (MenusState.openMenuSide) ? 'right' : 'left';
      document.getElementById(MenusState.openMenu).style[whichSavedSide] = '-100%';
      
      document.getElementById('dynamic-xbrl-form').classList.remove('col-sm-9');
      document.getElementById('dynamic-xbrl-form').classList.remove('offset-sm-3');
      document.getElementById('dynamic-xbrl-form').classList.add('col-sm-12');
      
      document.getElementById('error-container').classList.remove('offset-sm-3');
      document.getElementById('error-container').classList.remove('col-sm-9');
      
      MenusState.openMenu = '';
      MenusState.openMenuSide = null;
    }
    
    if ( document.getElementById(menuId).style[whichSide] === '0px' ) {
      // close the menu
      document.getElementById(menuId).classList.add('invisible');
      document.getElementById(menuId).style[whichSide] = '-100%';
      
      document.getElementById('dynamic-xbrl-form').classList.remove('col-sm-9');
      document.getElementById('dynamic-xbrl-form').classList.remove('offset-sm-3');
      document.getElementById('dynamic-xbrl-form').classList.add('col-sm-12');
      
      document.getElementById('error-container').classList.remove('offset-sm-3');
      document.getElementById('error-container').classList.remove('col-sm-9');
      
      MenusState.openMenu = '';
      MenusState.openMenuSide = null;
      callback(false);
      
    } else {
      
      $('#navbarSupportedContent').collapse('hide');
      
      // open the menu
      if ( rightIfTrue ) {
        document.getElementById(menuId).classList.remove('invisible');
        document.getElementById(menuId).style.right = '0px';
      } else {
        document.getElementById(menuId).classList.remove('invisible');
        document.getElementById(menuId).style.left = '0px';
      }
      document.getElementById('dynamic-xbrl-form').classList.remove('col-sm-12');
      document.getElementById('dynamic-xbrl-form').classList.add('col-sm-9');
      
      document.getElementById('error-container').classList.add('col-sm-9');
      if ( !rightIfTrue ) {
        
        document.getElementById('dynamic-xbrl-form').classList.add('offset-sm-3');
        document.getElementById('error-container').classList.add('offset-sm-3');
      }
      
      MenusState.openMenu = menuId;
      MenusState.openMenuSide = rightIfTrue;
      callback(true);
    }
  },
  
  openMenu : '',
  openMenuSide : null

};
