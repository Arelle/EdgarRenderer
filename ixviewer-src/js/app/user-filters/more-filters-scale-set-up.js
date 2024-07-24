/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var UserFiltersMoreFiltersScaleSetUp = {
  filtersSet: false,

  scaleOptions: [],

  setScales: function (callback) {
    var foundScales = document.getElementById('dynamic-xbrl-form').querySelectorAll('[scale]');
    var foundScalesArray = Array.prototype.slice.call(foundScales);

    UserFiltersMoreFiltersScaleSetUp.scaleOptions = foundScalesArray.map(function (current) {
      return current.getAttribute('scale');
    }).filter(function (element, index, array) {
      return array.indexOf(element) === index;
    }).sort().reverse();

    document.getElementById('filters-scales-count').innerText = UserFiltersMoreFiltersScaleSetUp.scaleOptions.length;

    UserFiltersMoreFiltersScaleSetUp.populate();

    callback();
  },

  populate: function () {

    var innerHtml = '';
    UserFiltersMoreFiltersScaleSetUp.scaleOptions.forEach(function (current, index) {
      innerHtml += '<div class="d-flex justify-content-between align-items-center w-100 px-2">';
      innerHtml += '<div class="form-check">';
      innerHtml += '<input onclick="UserFiltersMoreFiltersScale.clickEvent(event, this, ' + index
        + ')" title="Select/Deselect this option." class="form-check-input" type="checkbox">';
      innerHtml += '<label class="form-check-label mb-0">' + FiltersScale.getScale(current) + '</label>';
      innerHtml += '</div></div>';
    });
    document.getElementById('user-filters-scales').innerHTML = innerHtml;

  }
};
