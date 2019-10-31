/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var UserFiltersMoreFiltersPeriodSetUp = {
  filtersSet : false,
  
  periodsOptions : [ ],
  
  setPeriods : function( callback ) {
    
    var nameSpace = '';
    for ( var ns in Constants.getHTMLAttributes ) {
      
      if ( Constants.getHTMLAttributes[ns] === 'http://www.xbrl.org/2003/instance' ) {
        nameSpace += ns.split(':')[1] + '\\:period,';
      }
    }
    
    if ( nameSpace ) {
      
      nameSpace = nameSpace.substring(0, nameSpace.length - 1);
      
      var foundPeriods = document.getElementById('dynamic-xbrl-form').querySelectorAll(nameSpace);
      
      var foundPeriodsArray = Array.prototype.slice.call(foundPeriods);
      foundPeriodsArray.forEach(function( current ) {
        
        var periodDate = FiltersContextref.getPeriod(current.parentElement.getAttribute('id'));
        var contextRef = current.parentElement.getAttribute('id');
        var periodYear = moment(periodDate, [ 'MM/DD/YYYY', 'As of MM/DD/YYYY' ]).year();
        
        var yearExists = UserFiltersMoreFiltersPeriodSetUp.periodsOptions.filter(function( element, index ) {
          if ( element['year'] === periodYear ) {
            return element;
          }
        });
        
        if ( yearExists.length > 0 ) {
          UserFiltersMoreFiltersPeriodSetUp.periodsOptions.forEach(function( nestedCurrent ) {
            if ( nestedCurrent['year'] === periodYear ) {
              
              var addNewOption = true;
              nestedCurrent['options'].forEach(function( finalCurrent, finalIndex, finalArray ) {
                if ( finalCurrent['instanceDate'] === periodDate ) {
                  finalCurrent['contextref'].push(contextRef);
                  addNewOption = false;
                }
              });
              if ( addNewOption ) {
                var tempOptions = {
                  'contextref' : [ contextRef ],
                  'instanceDate' : periodDate
                };
                nestedCurrent['options'].push(tempOptions);
              }
            }
          });
        } else {
          var tempObj = {
            'year' : periodYear,
            'options' : [ {
              'contextref' : [ contextRef ],
              'instanceDate' : periodDate
            } ]
          };
          UserFiltersMoreFiltersPeriodSetUp.periodsOptions.push(tempObj);
        }
      });
    }
    var filtersPeriodsCount = 0;
    UserFiltersMoreFiltersPeriodSetUp.periodsOptions.forEach(function( current ) {
      filtersPeriodsCount += current['options'].length;
    });
    
    document.getElementById('filters-periods-count').innerText = filtersPeriodsCount;
    
    UserFiltersMoreFiltersPeriodSetUp.periodsOptions = UserFiltersMoreFiltersPeriodSetUp.periodsOptions.sort(function(
        first, second ) {
      if ( first['year'] > second['year'] ) {
        return -1;
      }
      if ( first['year'] < second['year'] ) {
        return 1;
      }
      return 0;
    });
    
    UserFiltersMoreFiltersPeriodSetUp.populateParentCollapse('user-filters-periods',
        UserFiltersMoreFiltersPeriodSetUp.periodsOptions);
    
    callback();
  },
  
  populateParentCollapse : function( parentId, arrayOfInfo ) {
    var parentDiv = document.querySelector('#' + parentId + ' .list-group');
    parentDiv.innerHTML = '';
    arrayOfInfo.forEach(function( current, index ) {

      var firstOuterDiv = document.createElement('div');
      firstOuterDiv.className = 'd-flex justify-content-between align-items-center w-100 px-1';

      var innerDiv = document.createElement('div');
      innerDiv.className = 'form-check';
      firstOuterDiv.appendChild(innerDiv);

      var input = document.createElement('input');
      input.addEventListener('click', function(e) {UserFiltersMoreFiltersPeriod.parentClick(e, this, index)});
      input.title = 'Select/Deselect all options below.';
      input.className = 'form-check-input';
      input.type = 'checkbox';
      input.tabIndex = 9;
      innerDiv.appendChild(input);

      var label = document.createElement('label');
      label.className = 'form-check-label';
      innerDiv.appendChild(label);

      var accordionLink = document.createElement('a');
      // index is guaranteed to be numeric by way of forEach construction
      accordionLink.href = '#period-filters-accordion-' + index;
      accordionLink.setAttribute('data-toggle', 'collapse');
      accordionLink.tabIndex = 9; // two elements with the same tab-index? likely a UI bug
      accordionLink.textContent = current['year'];
      label.appendChild(accordionLink);

      var badgeSpan = document.createElement('span');
      badgeSpan.className = 'badge badge-secondary';
      badgeSpan.textContent = current['options'].length;
      // the original had an errant </button> here which cannot be replecated using safe DOM construction
      firstOuterDiv.appendChild(badgeSpan);

      var optionDiv = document.createElement('div');
      optionDiv.id = 'period-filters-accordion-' + index;
      optionDiv.className = 'collapse';
      optionDiv.setAttribute('data-parent', '#user-filters-periods');

      current['options'].forEach(function( nestedCurrent, nestedIndex ) {
        var optionOuterDiv = document.createElement('div');
        optionOuterDiv.className = 'd-flex justify-content-between align-items-center w-100 px-2';

        var optionInnerDiv = document.createElement('div');
        optionInnerDiv.className = 'form-check';

        var optionInput = document.createElement('input');
        optionInput.addEventListener('click', function(e) {UserFiltersMoreFiltersPeriod.childClick(e, this, index, nestedIndex)});
        optionInput.title = 'Select/Deselect this option.';
        optionInput.className = 'form-check-input';
        optionInput.type = 'checkbox';
        optionInput.tabIndex = 9; // same tabIndex as the other elements above
        optionInnerDiv.appendChild(optionInput);

        var optionLabel = document.createElement('label');
        optionLabel.className = 'form-check-label';
        optionLabel.textContent = nestedCurrent['instanceDate'];
        optionInnerDiv.appendChild(optionLabel);

        optionDiv.appendChild(optionOuterDiv);
      });

      parentDiv.appendChild(firstOuterDiv);
      parentDiv.appendChild(optionDiv);
    });
  }

};
