/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var UserFiltersMoreFiltersMeasure = {
  clickEvent : function( event, element, index ) {
    if ( event['target'] ) {
      if ( event['target'].checked ) {
        UserFiltersMoreFiltersMeasure.addMeasure(UserFiltersMoreFiltersMeasureSetUp.measuresOptions[index]);
      }
      else {
        UserFiltersMoreFiltersMeasure.removeMeasure(UserFiltersMoreFiltersMeasureSetUp.measuresOptions[index]);
      }
    }
  },
  
  addMeasure : function( input ) {
    UserFiltersState.getMeasure.push(input);
    UserFiltersState.filterUpdates();
  },
  
  removeMeasure : function( input ) {
    if ( UserFiltersState.getMeasure.indexOf(input) >= 0 ) {
      UserFiltersState.getMeasure.splice(UserFiltersState.getMeasure.indexOf(input), 1);
      UserFiltersState.filterUpdates();
    }
  }

};
