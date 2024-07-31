/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var UserFiltersMoreFiltersMeasureSetUp = {
  filtersSet: false,

  measuresOptions: [],

  setMeasures: function (callback) {
    var foundMeasures = document.getElementById('dynamic-xbrl-form').querySelectorAll('[unitref]');
    var foundMeasuresArray = Array.prototype.slice.call(foundMeasures);

    UserFiltersMoreFiltersMeasureSetUp.measuresOptions = foundMeasuresArray.map(function (current) {
      return current.getAttribute('unitref');
    }).filter(function (element, index, array) {
      return array.indexOf(element) === index;
    }).sort();

    document.getElementById('filters-measures-count').innerText = UserFiltersMoreFiltersMeasureSetUp.measuresOptions.length;

    UserFiltersMoreFiltersMeasureSetUp.populate();
    callback();
  },

  populate: function () {
    var innerHtml = '';
    UserFiltersMoreFiltersMeasureSetUp.measuresOptions.forEach(function (current, index) {
      innerHtml += '<div class="d-flex justify-content-between align-items-center w-100 px-2">';
      innerHtml += '<div class="form-check">';
      innerHtml += '<input onclick="UserFiltersMoreFiltersMeasure.clickEvent(event, this, ' + index
        + ')" title="Select/Deselect this option." class="form-check-input" type="checkbox" tabindex="9">';
      innerHtml += '<label class="form-check-label mb-0"">' + FiltersUnitref.getMeasure(current) + '</label>';
      innerHtml += '</div></div>';
    });
    document.getElementById('user-filters-measures').innerHTML = innerHtml;
  }
};
