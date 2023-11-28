/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var Search = {
  
  clear : function( event, element ) {
    
    document.getElementById('global-search').value = '';
    UserFiltersState.setUserSearch({});
    UserFiltersState.filterUpdates();
  },
  
  submit : function( event, element ) {
    // 1 => Include Fact Name
    // 2 => Include Fact Content
    // 3 => Include Labels
    // 4 => Include Definitions
    // 5 => Include Dimensions
    // 6 => Include References Topic
    // 7 => Include References Sub Topic
    // 8 => Match References Paragraph
    // 9 => Match References Publisher
    // 10 => Match References Section
    // 11 => Match Case
    
    var valueToSearchFor = document.getElementById('global-search').value;
    
    // here we sanitize the users input to account for Regex patterns
    valueToSearchFor = valueToSearchFor.replace(/[\\{}()[\]^$+*?.]/g, '\\$&');
    
    var options = document.querySelectorAll('[name="search-options"]');
    var optionsArray = Array.prototype.slice.call(options);
    optionsArray = optionsArray.map(function( current ) {
      if ( current['checked'] ) {
        return parseInt(current['value']);
      }
    }).filter(function( element ) {
      return element;
    });
    
    var matchCase = optionsArray.indexOf(11) >= 0;
    
    // we don't use the global
    var regexOptions = 'm';
    if ( !matchCase ) {
      regexOptions += 'i';
    }
    
    valueToSearchFor = Search.createValueToSearchFor(valueToSearchFor);
    
    var regex = new RegExp(valueToSearchFor, regexOptions);
    
    var objectForState = {
      'regex' : regex,
      'options' : optionsArray
    };
    UserFiltersState.setUserSearch(objectForState);
    UserFiltersState.filterUpdates();
    
    return false;
  },
  
  createValueToSearchFor : function( input ) {
    // AND template = (?=.*VARIABLE1)(?=.*VARIABLE2)
    // OR template = (VARIABLE1)|(VARIABLE2)
    
    // TODO this will require a second/third look
    var inputArray = input.replace(/ and /gi, ' & ').replace(/ or /gi, ' | ').split(' ');
    
    if ( inputArray.length > 1 ) {
      var regex = '^';
      inputArray.forEach(function( current, index, array ) {
        if ( current === '|' ) {
          regex += '|';
        } else if ( current === '&' ) {
          // business as usual
        } else {
          regex += '(?=.*' + current + ')';
        }
      });
      return regex;
    }
    return input;
    
  }
};
