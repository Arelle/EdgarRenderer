/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var UserFiltersTagsRadios = {
  
  clickEvent : function( event, element ) {
    
    // 0 = All
    // 1 = Standard Only
    // 2 = Custom Only
    
    var radioValue = parseInt(element.querySelector('input[name="tags-radios"]:checked').value);
    UserFiltersState.setTagsRadio(radioValue);
    UserFiltersState.filterUpdates();
  }

};
