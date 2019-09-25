/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var UserFiltersDataRadios = {
  
  clickEvent : function( event, element ) {
    
    // 0 = All
    // 1 = Amounts Only
    // 2 = Text Only
    // 3 = Calculations Only
    // 4 = Negatives Only
    // 5 = Additional Items Only
    
    var radioValue = parseInt(element.querySelector('input[name="data-radios"]:checked').value);
    UserFiltersState.setDataRadios(radioValue);
    UserFiltersState.filterUpdates();
  }

};
