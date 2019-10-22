/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var UserFiltersMoreFiltersScaleSetUp = {
  filtersSet : false,
  
  scaleOptions : [ ],
  
  setScales : function( callback ) {
    var foundScales = document.getElementById('dynamic-xbrl-form').querySelectorAll('[scale]');
    var foundScalesArray = Array.prototype.slice.call(foundScales);
    
    UserFiltersMoreFiltersScaleSetUp.scaleOptions = foundScalesArray.map(function( current ) {
      return current.getAttribute('scale');
    }).filter(function( element, index, array ) {
      return array.indexOf(element) === index;
    }).sort().reverse();
    
    document.getElementById('filters-scales-count').innerText = UserFiltersMoreFiltersScaleSetUp.scaleOptions.length;
    
    UserFiltersMoreFiltersScaleSetUp.populate();
    
    callback();
  },
  
  populate : function( ) {

    var elem = document.getElementById('user-filters-scales');
    elem.innerHTML = '';

    UserFiltersMoreFiltersMeasureSetUp.scaleOptions.forEach(function( current, index ) {

      var outerDiv = document.createElement('div');
      outerDiv.className = 'd-flex justify-content-between align-items-center w-100 px-2';
      
      var innerDiv = document.createElement('div');
      innerDiv.className = 'form-check';
      outerDiv.appendChild(innerDiv);
      
      var input = document.createElement('input');
      input.className = 'form-check-input';
      input.type = 'checkbox';
      input.tabIndex = 9;
      input.title = 'Select/Deselect this option.';
      // index is guaranteed to be numeric by way of forEach construction
      input.setAttribute('onclick', 'UserFiltersMoreFiltersScale.clickEvent(event, this, ' + index + ')');
      innerDiv.appendChild(input);

      var label = document.createElement('label');
      label.className = 'form-check-label';
      label.textContent = FiltersScale.getScale(current);
      innerDiv.appendChild(label);

      elem.appendChild(outerDiv);

    });
  }
};
