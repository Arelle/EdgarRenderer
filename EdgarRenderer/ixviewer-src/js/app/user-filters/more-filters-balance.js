/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var UserFiltersMoreFiltersBalances = {
  clickEvent : function( event, element, index ) {
    
    var balance = (index === 0) ? 'debit' : 'credit';
    if ( event['target'] ) {
      if ( event['target'].checked ) {
        UserFiltersMoreFiltersBalances.addBalance(balance);
      }
      else {
        UserFiltersMoreFiltersBalances.removeBalance(balance);
      }
    }
  },
  
  addBalance : function( input ) {
    UserFiltersState.getBalance.push(input);
    UserFiltersState.filterUpdates();
  },
  
  removeBalance : function( input ) {
    if ( UserFiltersState.getBalance.indexOf(input) >= 0 ) {
      UserFiltersState.getBalance.splice(UserFiltersState.getBalance.indexOf(input), 1);
      UserFiltersState.filterUpdates();
    }
  }

};
