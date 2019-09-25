/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var UserFiltersMoreFiltersAxes = {
  clickEvent : function( event, element, index ) {
    
    if ( event['target'] ) {
      if ( event['target'].checked ) {
        UserFiltersMoreFiltersAxes.addAxis(UserFiltersMoreFiltersAxesSetUp.axisOptions[index]);
      } else {
        UserFiltersMoreFiltersAxes.removeAxis(UserFiltersMoreFiltersAxesSetUp.axisOptions[index]);
      }
    }
  },
  
  addAxis : function( input ) {
    var newAxis = UserFiltersState.getAxes.filter(function( element ) {
      if ( input['name'] === element['name'] ) {
        return true;
      }
    });
    if ( newAxis.length === 0 ) {
      UserFiltersState.getAxes.push(input);
    }
    UserFiltersState.filterUpdates();
  },
  
  removeAxis : function( input ) {
    if ( UserFiltersState.getAxes.indexOf(input) >= 0 ) {
      UserFiltersState.getAxes.splice(UserFiltersState.getAxes.indexOf(input), 1);
      UserFiltersState.filterUpdates();
    }
  }

};
