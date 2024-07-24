/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var SearchFunctions = {
  
  getAllElementsForContent : [ ],
  
  elementLabelFromRegex : function( element, regex, highlighted ) {
    
    if ( element && element.hasAttribute('name') ) {
      if ( !highlighted ) {
        return regex.test(FiltersName.getAllLabels(element.getAttribute('name')));
      }
      return highlighted;
    }
    
  },
  
  elementNameForRegex : function( element ) {
    
    if ( element && element.hasAttribute('name') ) {
      return element.getAttribute('name') || '';
    }
    return '';
  },
  
  elementContentForRegex : function( element ) {
    
    if ( element ) {
      if ( Taxonomies.isElementContinued(element) ) {
        var tempContinuedElements = ModalsNested.dynamicallyFindContinuedTaxonomies(element, [ ]);
        var continuedElementsInnerText = '';
        for ( var i = 0; i < tempContinuedElements.length; i++ ) {
          if ( tempContinuedElements[i].textContent ) {
            continuedElementsInnerText += ' ' + tempContinuedElements[i].textContent.trim();
          }
        }
        return continuedElementsInnerText;
      }
      return element.textContent;
    }
  },
  
  elementLabelForRegex : function( element ) {
    
    if ( element && element.hasAttribute('name') ) {
      return FiltersName.getAllLabels(element.getAttribute('name')).join(' ');
    }
  },
  
  elementDefinitionForRegex : function( element ) {
    
    if ( element && element.hasAttribute('name') ) {
      return FiltersName.getDefinition(element.getAttribute('name'));
    }
  },
  
  elementDimensionsForRegex : function( element ) {
    if ( element && element.hasAttribute('contextref') ) {
      var dimensionContainer = document.getElementById(element.getAttribute('contextref')).querySelectorAll(
          '[dimension]');
      var dimensionContainerInnerText = '';
      
      for ( var i = 0; i < dimensionContainer.length; i++ ) {
        if ( dimensionContainer[i].innerText ) {
          dimensionContainerInnerText += ' ' + dimensionContainer[i].innerText;
        }
      }
      return dimensionContainerInnerText;
    }
  },
  
  elementReferencesForRegex : function( element, searchOptions ) {
    if ( element && element.hasAttribute('contextref') ) {
      var allAuthRefs = FiltersName.getAuthRefs(element.getAttribute('name')) || [ ];
      var additionalRefs = [ ];
      var allAuthRefsViaDimension = FiltersContextref.getAxis(element.getAttribute('contextref'), true);
      if ( allAuthRefsViaDimension ) {
        allAuthRefsViaDimension = allAuthRefsViaDimension.split(' ');
        allAuthRefsViaDimension.forEach(function( current, index ) {
          FiltersName.getAuthRefs(current).forEach(function( nestedAuth, nestedIndex ) {
            additionalRefs.push(nestedAuth);
          });
        });
      }
      var allAuthRefsViaMember = FiltersContextref.getMember(element.getAttribute('contextref'), true);
      if ( allAuthRefsViaMember ) {
        allAuthRefsViaMember = allAuthRefsViaMember.split(' ');
        allAuthRefsViaMember.forEach(function( current, index ) {
          FiltersName.getAuthRefs(current).forEach(function( nestedAuth, nestedIndex ) {
            additionalRefs.push(nestedAuth);
          });
        });
      }
      var allRefs = allAuthRefs.concat(additionalRefs);
      
      var uniqueAuthRefs = allRefs.filter(function( element, index ) {
        return allAuthRefs.indexOf(element) === index;
      });
      
      var result = uniqueAuthRefs.map(function( current ) {
        var discoveredReference = ConstantsFunctions.getSingleMetaStandardReference(current);
        if ( discoveredReference[0] ) {
          return SearchFunctions.searchObjectOfSingleReferenceForRegex(discoveredReference[0], searchOptions);
        }
      });

      return result.join(' ');
    }
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
