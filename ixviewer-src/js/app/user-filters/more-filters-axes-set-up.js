/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var UserFiltersMoreFiltersAxesSetUp = {
  filtersSet : false,
  
  axisOptions : [ ],
  
  setAxes : function( callback ) {
    var foundDimensions = document.getElementById('dynamic-xbrl-form').querySelectorAll('[dimension*="Axis"]');
    var foundDimensionsArray = Array.prototype.slice.call(foundDimensions);
    
    foundDimensionsArray.forEach(function( current ) {
      var tempObject = {
        'name' : current.getAttribute('dimension'),
        'label' : current.getAttribute('dimension').split(':')[1].replace(/([A-Z])/g, ' $1').trim().slice(0, -5)
      };
      
      var axisExists = UserFiltersMoreFiltersAxesSetUp.axisOptions.filter(function( element ) {
        return element['name'] === tempObject['name'];
      });
      
      if ( axisExists.length === 0 ) {
        UserFiltersMoreFiltersAxesSetUp.axisOptions.push(tempObject);
        
      }
      
    });
    UserFiltersMoreFiltersAxesSetUp.axisOptions.sort(function( first, second ) {
      if ( first['label'] > second['label'] ) {
        return 1;
      }
      if ( first['label'] < second['label'] ) {
        return -1;
      }
      return 0;
    });
    
    document.getElementById('filters-axis-count').innerText = UserFiltersMoreFiltersAxesSetUp.axisOptions.length;
    
    UserFiltersMoreFiltersAxesSetUp.populate();
    
    callback();
  },
  
  populate : function( ) {
    var innerHtml = '';
    UserFiltersMoreFiltersAxesSetUp.axisOptions.forEach(function( current, index ) {
      innerHtml += '<div class="d-flex justify-content-between align-items-center w-100 px-2">';
      innerHtml += '<div class="form-check">';
      innerHtml += '<input  onclick="UserFiltersMoreFiltersAxes.clickEvent(event, this, ' + index
          + ')" title="Select/Deselect this option." class="form-check-input" type="checkbox" tabindex="9">';
      innerHtml += '<label class="form-check-label">' + current['label'] + '</label>';
      innerHtml += '</div></div>';
    });
    document.getElementById('user-filters-axis').innerHTML = innerHtml;
  }
};
