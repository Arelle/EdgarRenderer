/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var UserFiltersMoreFiltersScale = {
  
  clickEvent : function( event, element, index ) {
    
    if ( event['target'] ) {
      if ( event['target'].checked ) {
        UserFiltersMoreFiltersScale.addScale(UserFiltersMoreFiltersScaleSetUp.scaleOptions[index]);
      }
      else {
        UserFiltersMoreFiltersScale.removeScale(UserFiltersMoreFiltersScaleSetUp.scaleOptions[index]);
      }
    }
  },
  
  addScale : function( input ) {
    UserFiltersState.getScale.push(input);
    UserFiltersState.filterUpdates();
  },
  
  removeScale : function( input ) {
    if ( UserFiltersState.getScale.indexOf(input) >= 0 ) {
      UserFiltersState.getScale.splice(UserFiltersState.getScale.indexOf(input), 1);
      UserFiltersState.filterUpdates();
    }
  }

};
