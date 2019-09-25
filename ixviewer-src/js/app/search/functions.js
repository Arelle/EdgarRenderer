/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var SearchFunctions = {
  
  getAllElementsForContent : [ ],
  
  elementLabelFromRegex : function( element, regex, highlighted ) {
    if ( !highlighted ) {
      return regex.test(FiltersName.getAllLabels(element.getAttribute('name')));
    }
    return highlighted;
    
  },
  
  elementNameForRegex : function( element ) {
    return element.getAttribute('name') || '';
  },
  
  elementContentForRegex : function( element ) {
    if ( Taxonomies.isElementContinued(element) ) {
      var tempContinuedElements = ModalsNested.dynamicallyFindContinuedTaxonomies(element, [ ]);
      var continuedElementsInnerText = '';
      for ( var i = 0; i < tempContinuedElements.length; i++ ) {
        if ( tempContinuedElements[i].textContent ) {
          continuedElementsInnerText += ' ' + tempContinuedElements[i].textContent.trim();
        }
      }
      return continuedElementsInnerText;
    } else {
      return element.textContent;
    }
  },
  
  elementLabelForRegex : function( element ) {
    
    return FiltersName.getAllLabels(element.getAttribute('name')).join(' ');
    
  },
  
  elementDefinitionForRegex : function( element ) {
    return FiltersName.getDefinition(name);
  },
  
  elementDimensionsForRegex : function( element ) {
    var dimensionContainer = document.getElementById(element.getAttribute('contextref'))
        .querySelectorAll('[dimension]');
    var dimensionContainerInnerText = '';
    
    for ( var i = 0; i < dimensionContainer.length; i++ ) {
      if ( dimensionContainer[i].innerText ) {
        dimensionContainerInnerText += ' ' + dimensionContainer[i].innerText;
      }
    }
    return dimensionContainerInnerText;
  },
  
  elementReferencesForRegex : function( element, searchOptions ) {
    var name = element.getAttribute('name').replace(':', '_');
    
    var result = Constants.getMetaTags.map(
        function( element ) {
          if ( element['original-name'] === name && element['auth_ref'].length ) {
            var objectToSearch = SearchFunctions.searchReferencesForAuthRef(element['auth_ref'][0],
                Constants.getMetaStandardReference);
            
            if ( objectToSearch ) {
              return SearchFunctions.searchObjectOfSingleReferenceForRegex(objectToSearch, searchOptions);
            }
          }
        }).filter(function( element ) {
      return element;
    });
    return result.join(' ');
    
  },
  
  searchReferencesForAuthRef : function( originalNameValue, standardReferenceArray ) {
    for ( var i = 0; i < standardReferenceArray.length; i++ ) {
      
      if ( standardReferenceArray[i]['original-name'] === originalNameValue ) {
        return standardReferenceArray[i];
      }
    }
  },
  
  searchObjectOfSingleReferenceForRegex : function( object, searchOptions ) {
    // we create a string of all the options the user has requested
    // then we regex that string
    var textToRegex = '';
    
    if ( searchOptions['options'].indexOf(6) >= 0 && object['Topic'] ) {
      textToRegex += ' ' + object['Topic'];
    }
    
    if ( searchOptions['options'].indexOf(7) >= 0 && object['SubTopic'] ) {
      textToRegex += ' ' + object['SubTopic'];
    }
    
    if ( searchOptions['options'].indexOf(8) >= 0 && object['Paragraph'] ) {
      textToRegex += ' ' + object['Paragraph'];
    }
    
    if ( searchOptions['options'].indexOf(9) >= 0 && object['Publisher'] ) {
      textToRegex += ' ' + object['Publisher'];
    }
    
    if ( searchOptions['options'].indexOf(10) >= 0 && object['Section'] ) {
      textToRegex += ' ' + object['Section'];
    }
    
    return textToRegex;
    
  }

};
