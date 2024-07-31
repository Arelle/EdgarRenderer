/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var UserFiltersMoreFiltersPeriodSetUp = {
  filtersSet: false,

  periodsOptions: [],

  setPeriods: function (callback) {
    // we set <period> as a possible html tag, because older inline files don't
    // follow the <namespace:period> consistency.
    var nameSpace = 'period,';
    for (var ns in Constants.getHTMLAttributes) {

      if (Constants.getHTMLAttributes[ns] === 'http://www.xbrl.org/2003/instance') {
        nameSpace += ns.split(':')[1] + '\\:period,';
      }
    }

    if (nameSpace) {
      nameSpace = nameSpace.substring(0, nameSpace.length - 1);

      var foundPeriods = document.getElementById('dynamic-xbrl-form').querySelectorAll(nameSpace);

      var foundPeriodsArray = Array.prototype.slice.call(foundPeriods);
      foundPeriodsArray.forEach(function (current) {

        var periodDate = FiltersContextref.getPeriod(current.parentElement.getAttribute('id'));
        var contextRef = current.parentElement.getAttribute('id');
        var periodYear = moment(periodDate, ['MM/DD/YYYY', 'As of MM/DD/YYYY']).year();

        var yearExists = UserFiltersMoreFiltersPeriodSetUp.periodsOptions.filter(function (element, index) {
          if (element['year'] === periodYear) {
            return element;
          }
        });

        if (yearExists.length > 0) {
          UserFiltersMoreFiltersPeriodSetUp.periodsOptions.forEach(function (nestedCurrent) {
            if (nestedCurrent['year'] === periodYear) {

              var addNewOption = true;
              nestedCurrent['options'].forEach(function (finalCurrent, finalIndex, finalArray) {
                if (finalCurrent['instanceDate'] === periodDate) {
                  finalCurrent['contextref'].push(contextRef);
                  addNewOption = false;
                }
              });
              if (addNewOption) {
                var tempOptions = {
                  'contextref': [contextRef],
                  'instanceDate': periodDate
                };
                nestedCurrent['options'].push(tempOptions);
              }
            }
          });
        } else {
          var tempObj = {
            'year': periodYear,
            'options': [{
              'contextref': [contextRef],
              'instanceDate': periodDate
            }]
          };
          UserFiltersMoreFiltersPeriodSetUp.periodsOptions.push(tempObj);
        }
      });
    }
    var filtersPeriodsCount = 0;
    UserFiltersMoreFiltersPeriodSetUp.periodsOptions.forEach(function (current) {
      filtersPeriodsCount += current['options'].length;
    });

    document.getElementById('filters-periods-count').innerText = filtersPeriodsCount;

    UserFiltersMoreFiltersPeriodSetUp.periodsOptions = UserFiltersMoreFiltersPeriodSetUp.periodsOptions.sort(function (
      first, second) {
      if (first['year'] > second['year']) {
        return -1;
      }
      if (first['year'] < second['year']) {
        return 1;
      }
      return 0;
    });

    UserFiltersMoreFiltersPeriodSetUp.populateParentCollapse('user-filters-periods',
      UserFiltersMoreFiltersPeriodSetUp.periodsOptions);

    callback();
  },

  populateParentCollapse: function (parentId, arrayOfInfo) {
    var parentDiv = document.querySelector('#' + parentId + ' .list-group');
    parentDiv.innerHTML = '';
    arrayOfInfo.forEach(function (current, index) {
      var innerHtml = '';
      innerHtml += '<div class="d-flex justify-content-between align-items-center w-100 px-1">';
      innerHtml += '<div class="form-check">';

      innerHtml += '<input onclick="UserFiltersMoreFiltersPeriod.parentClick(event, this, ' + index
        + ')" title="Select/Deselect all options below." class="form-check-input" type="checkbox" tabindex="9">';
      innerHtml += '<label class="form-check-label mb-0">';
      innerHtml += '<a href="#period-filters-accordion-' + index + '" data-bs-toggle="collapse" tabindex="9">'
        + current['year'] + '</a>';
      innerHtml += '</label>';
      innerHtml += '</div>';
      innerHtml += '<span class="badge bg-secondary">';
      innerHtml += current['options'].length;
      innerHtml += '</span>';
      innerHtml += '</button>';
      innerHtml += '</div>';
      innerHtml += '<div data-bs-parent="#user-filters-periods" id="period-filters-accordion-' + index + '"';

      // we add all the individual 'options'
      current['options'].forEach(function (nestedCurrent, nestedIndex) {
        innerHtml += '<div class="d-flex justify-content-between align-items-center w-100 px-2">';
        innerHtml += '<div class="form-check">';

        innerHtml += '<input onclick="UserFiltersMoreFiltersPeriod.childClick(event, this, ' + index + ', '
          + nestedIndex
          + ')" title="Select/Deselect this option." class="form-check-input" type="checkbox" tabindex="9">';
        innerHtml += '<label class="form-check-label mb-0">';
        innerHtml += nestedCurrent['instanceDate'];
        innerHtml += '</label>';
        innerHtml += '</div>';
        innerHtml += '</div>';
      });
      innerHtml += '</div>';
      parentDiv.innerHTML += innerHtml;
    });
  }

};
