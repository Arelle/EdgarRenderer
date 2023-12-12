/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var UserFiltersMoreFiltersPeriod = {
  
  clickEvent : function( event, element ) {
    if ( (event['target'] && event['target'].getAttribute('data-filter')) ) {
      var dataFilter = JSON.parse(decodeURIComponent(event['target'].getAttribute('data-filter')));
      if ( dataFilter['all'] ) {
        UserFiltersMoreFiltersPeriod.parentClick(dataFilter, event['target']);
      }
      else {
        UserFiltersMoreFiltersPeriod.childClick(event, element, dataFilter);
      }
    }
  },
  
  parentClick : function( event, element, parentIndex ) {
    UserFiltersMoreFiltersPeriod.checkToggleAll(event, element, parentIndex);
  },
  
  childClick : function( event, element, parentIndex, childIndex ) {
    UserFiltersMoreFiltersPeriod.checkToggle(event, element, parentIndex, childIndex);
  },
  
  checkToggleAll : function( filter, element, parentIndex ) {
    var foundInputs = document.querySelectorAll('#period-filters-accordion-' + parentIndex + ' input[type=checkbox]');
    var foundInputsArray = Array.prototype.slice.call(foundInputs);
    if ( element.checked ) {
      // check all of the children
      foundInputsArray.forEach(function( current ) {
        current.checked = true;
      });
      UserFiltersMoreFiltersPeriod.setStateFromParent(parentIndex, true);
    }
    else {
      // uncheck all of the children
      foundInputsArray.forEach(function( current ) {
        current.checked = false;
      });
      UserFiltersMoreFiltersPeriod.setStateFromParent(parentIndex, false);
    }
  },
  
  checkToggle : function( filter, element, parentIndex, childIndex ) {
    if ( element.checked ) {
      // check this child
      UserFiltersMoreFiltersPeriod.setStateFromChild(parentIndex, childIndex, true);
    }
    else {
      // uncheck this child
      UserFiltersMoreFiltersPeriod.setStateFromChild(parentIndex, childIndex, false);
    }
  },
  
  setStateFromParent : function( parentIndex, addIsTrueRemoveIsFalse ) {
    if ( addIsTrueRemoveIsFalse ) {
      // we add to our state
      var newPeriods = UserFiltersMoreFiltersPeriodSetUp.periodsOptions[parentIndex]['options'].filter(function(
          element ) {
        if ( UserFiltersState.getPeriod.indexOf(element) === -1 ) {
          return true;
        }
      });
      UserFiltersState.getPeriod = UserFiltersState.getPeriod.concat(newPeriods);
    }
    else {
      // we remove from our state
      var removePeriods = UserFiltersMoreFiltersPeriodSetUp.periodsOptions[parentIndex]['options'].map(function(
          current, index ) {
        if ( UserFiltersState.getPeriod.indexOf(current) >= 0 ) {
          return current;
        }
      });
      UserFiltersState.getPeriod = UserFiltersState.getPeriod.filter(function( element ) {
        return removePeriods.indexOf(element) === -1;
      });
    }
    UserFiltersState.filterUpdates();
  },
  
  setStateFromChild : function( parentIndex, childIndex, addIsTrueRemoveIsFalse ) {
    if ( addIsTrueRemoveIsFalse ) {
      // we add to our state
      var newPeriod = UserFiltersState.getPeriod
          .filter(function( element ) {
            if ( UserFiltersMoreFiltersPeriodSetUp.periodsOptions[parentIndex]['options'][childIndex]['instanceDate'] === element['instanceDate'] ) {
              return true;
            }
          });
      if ( newPeriod.length === 0 ) {
        UserFiltersState.getPeriod
            .push(UserFiltersMoreFiltersPeriodSetUp.periodsOptions[parentIndex]['options'][childIndex]);
      }
      
    }
    else {
      // we remove from our state
      UserFiltersState.getPeriod = UserFiltersState.getPeriod
          .filter(function( element ) {
            if ( UserFiltersMoreFiltersPeriodSetUp.periodsOptions[parentIndex]['options'][childIndex]['instanceDate'] === element['instanceDate'] ) {
              return false;
            }
            return true;
          });
    }
    UserFiltersState.filterUpdates();
  }

};
