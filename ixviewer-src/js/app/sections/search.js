/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var SectionsSearch = {
  
  submit : function( event, element ) {
    
    // 1 => All Sections
    // 2 => Show Internal Sections Only
    // 3 => Show External Sections Only
    
    var options = document.querySelectorAll('[name="sections-search-options"]');
    
    var valueToSearchFor = document.getElementById('sections-search').value;
    
    // here we sanitize the users input to account for Regex patterns
    valueToSearchFor = valueToSearchFor.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
    
    var optionsArray = Array.prototype.slice.call(options);
    optionsArray = optionsArray.map(function( current ) {
      if ( current['checked'] ) {
        return parseInt(current['value']);
      }
    }).filter(function( element ) {
      return element;
    });
    
    var searchObject = {
      'type' : optionsArray[0],
      'value' : (valueToSearchFor) ? new RegExp(valueToSearchFor, 'i') : null
    };
    Sections.populate(searchObject);
    return false;
    
  },
  
  clear : function( event, element ) {
    
    document.querySelector('input[name="sections-search-options"]').checked = true;
    document.getElementById('sections-search').value = '';
    Sections.populate();
    
  }
};
