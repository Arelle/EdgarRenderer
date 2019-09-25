/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var UserFiltersMoreFiltersMembers = {
  clickEvent : function( event, element, index ) {
    
    if ( event['target'] ) {
      if ( event['target'].checked ) {
        UserFiltersMoreFiltersMembers.addMembers(UserFiltersMoreFiltersMembersSetUp.membersOptions[index]);
      } else {
        UserFiltersMoreFiltersMembers.removeMembers(UserFiltersMoreFiltersMembersSetUp.membersOptions[index]);
      }
    }
  },
  
  addMembers : function( input ) {
    var newMembers = UserFiltersState.getMembers.filter(function( element ) {
      if ( input['name'] === element['name'] ) {
        return true;
      }
    });
    if ( newMembers.length === 0 ) {
      UserFiltersState.getMembers.push(input);
    }
    UserFiltersState.filterUpdates();
  },
  
  removeMembers : function( input ) {
    if ( UserFiltersState.getMembers.indexOf(input) >= 0 ) {
      UserFiltersState.getMembers.splice(UserFiltersState.getMembers.indexOf(input), 1);
      UserFiltersState.filterUpdates();
    }
  }

};
