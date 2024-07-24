/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var UserFiltersState = {
  
  getAxes : [ ],
  
  getMembers : [ ],
  
  getBalance : [ ],
  
  getMeasure : [ ],
  
  getPeriod : [ ],
  
  getScale : [ ],
  
  getType : [ ],
  
  getDataRadios : 0,
  
  setDataRadios : function( input ) {
    if ( input >= 0 && input <= 5 ) {
      UserFiltersState.getDataRadios = input;
    } else {
      ErrorsMinor.unknownError();
    }
  },
  
  getTagsRadios : 0,
  
  setTagsRadio : function( input ) {
    if ( input >= 0 && input <= 2 ) {
      UserFiltersState.getTagsRadios = input;
    } else {
      ErrorsMinor.unknownError();
    }
  },
  
  getSectionsRadios : 0,
  
  setSectionsRadios : function( input ) {
    if ( input >= 0 && input <= 4 ) {
      UserFiltersState.getSectionsRadios = input;
    } else {
      ErrorsMinor.unknownError();
    }
  },
  
  getUserSearch : {},
  
  setUserSearch : function( input ) {
    UserFiltersState.getUserSearch = input;
  },
  
  filterUpdates : function( ) {
    var startPerformance = performance.now();
    UserFiltersDropdown.init();
    
    Taxonomies.loadingTaxonomyCount(function( ) {
      
      var foundTaxonomies = document.getElementById('dynamic-xbrl-form').querySelectorAll('[contextref]');
      var foundTaxonomiesArray = Array.prototype.slice.call(foundTaxonomies);
      
      foundTaxonomiesArray.forEach(function( current ) {
        
        var enabledTaxonomy = true;
        
        // special highlight
        UserFiltersState.search(current, enabledTaxonomy);
        
        enabledTaxonomy = UserFiltersState.dataRadios(current, enabledTaxonomy);
        
        enabledTaxonomy = UserFiltersState.tagRadios(current, enabledTaxonomy);
        
        enabledTaxonomy = UserFiltersState.periods(current, enabledTaxonomy);
        
        enabledTaxonomy = UserFiltersState.measures(current, enabledTaxonomy);
        
        enabledTaxonomy = UserFiltersState.axes(current, enabledTaxonomy);
        
        enabledTaxonomy = UserFiltersState.members(current, enabledTaxonomy);
        
        enabledTaxonomy = UserFiltersState.scales(current, enabledTaxonomy);
        
        enabledTaxonomy = UserFiltersState.types(current, enabledTaxonomy);
        
        enabledTaxonomy = UserFiltersState.balances(current, enabledTaxonomy);
        
        current.setAttribute('enabled-taxonomy', enabledTaxonomy);
        
      });
      
      Taxonomies.updateTaxonomyCount(Object.keys(UserFiltersState.getUserSearch).length === 2);
      var endPerformance = performance.now();
      console.debug('UserFiltersState.filterUpdates() completed in: ' + (endPerformance - startPerformance).toFixed(2)
          + '(ms).');
    });
    
  },
  
  dataRadios : function( current, enabledTaxonomy ) {
    // 0 = All
    // 1 = Amounts Only
    // 2 = Text Only
    // 3 = Calculations Only
    // 4 = Negatives Only
    // 5 = Additional Items Only
    if ( UserFiltersState.getDataRadios && enabledTaxonomy ) {
      switch ( UserFiltersState.getDataRadios ) {
        case 5 : {
          // Additional Items Only
          if ( !current.hasAttribute('isAdditionalItemsOnly') ) {
            current.setAttribute('isAdditionalItemsOnly', TaxonomiesGeneral.isParentNodeHidden(current));
          }
          if ( current.hasAttribute('isAdditionalItemsOnly')
              && current.getAttribute('isAdditionalItemsOnly') === 'true' ) {
            return true;
          }
          return false;
          
          break;
        }
        case 4 : {
          // Negatives Only
          if ( !current.hasAttribute('isNegativesOnly') ) {
            current.setAttribute('isNegativesOnly', ((current.getAttribute('sign') === '-') ? true : false));
          }
          if ( current.hasAttribute('isNegativesOnly') && current.getAttribute('isNegativesOnly') === 'true' ) {
            return true;
          }
          return false;
          
          break;
        }
        case 3 : {
          // Calculations Only
          if ( !current.hasAttribute('isCalculationsOnly') ) {
            var elementIsCalculationsOnly = false;
            if ( Constants.getMetaCalculationsParentTags.indexOf(current.getAttribute('name').replace(':', '_')) >= 0 ) {
              if ( FiltersContextref.getDimensions(current.getAttribute('contextref')).length === 0 ) {
                elementIsCalculationsOnly = true;
              }
            }
            
            current.setAttribute('isCalculationsOnly', elementIsCalculationsOnly);
          }
          if ( current.hasAttribute('isCalculationsOnly') && current.getAttribute('isCalculationsOnly') === 'true' ) {
            return true;
          }
          return false;
          
          break;
        }
        case 2 : {
          // Text Only
          if ( !current.hasAttribute('isTextOnly') ) {
            current.setAttribute('isTextOnly',
                ((current['tagName'].split(':')[1].toLowerCase() === 'nonnumeric') ? true : false));
          }
          if ( current.hasAttribute('isTextOnly') && current.getAttribute('isTextOnly') === 'true' ) {
            return true;
          }
          return false;
          
          break;
        }
        case 1 : {
          // Amounts Only
          if ( !current.hasAttribute('isAmountsOnly') ) {
            current.setAttribute('isAmountsOnly',
                ((current['tagName'].split(':')[1].toLowerCase() === 'nonfraction') ? true : false));
          }
          if ( current.hasAttribute('isAmountsOnly') && current.getAttribute('isAmountsOnly') === 'true' ) {
            return true;
          }
          return false;
          
          break;
        }
        default : {
          // All
          return true;
        }
      }
    }
    return enabledTaxonomy;
  },
  
  tagRadios : function( current, enabledTaxonomy ) {
    // 0 = All
    // 1 = Standard Only
    // 2 = Custom Only
    if ( UserFiltersState.getTagsRadios && enabledTaxonomy ) {
      switch ( UserFiltersState.getTagsRadios ) {
        case 2 : {
          // Custom Only
          
          if ( !current.hasAttribute('isCustomOnly') ) {
            current.setAttribute('isCustomOnly',
                (current.getAttribute('name').split(':')[0].toLowerCase() === Constants.getMetaCustomPrefix) ? true
                    : false);
          }
          
          if ( current.hasAttribute('isCustomOnly') && current.getAttribute('isCustomOnly') === 'true' ) {
            return true;
          }
          return false;
          
          break;
        }
        case 1 : {
          // Standard Only
          if ( !current.hasAttribute('isStandardOnly') ) {
            current.setAttribute('isStandardOnly',
                (current.getAttribute('name').split(':')[0].toLowerCase() !== Constants.getMetaCustomPrefix) ? true
                    : false);
          }
          
          if ( current.hasAttribute('isStandardOnly') && current.getAttribute('isStandardOnly') === 'true' ) {
            return true;
          }
          return false;
          
          break;
        }
        default : {
          // All
          return true;
        }
      }
    }
    return enabledTaxonomy;
  },
  
  periods : function( current, enabledTaxonomy ) {
    
    if ( UserFiltersState.getPeriod.length && enabledTaxonomy ) {
      
      for ( var i = 0; i < UserFiltersState.getPeriod.length; i++ ) {
        if ( UserFiltersState.getPeriod[i]['contextref'].indexOf(current.getAttribute('contextref')) >= 0 ) {
          return true;
        }
      }
      return false;
    }
    return enabledTaxonomy;
  },
  
  measures : function( current, enabledTaxonomy ) {
    
    if ( UserFiltersState.getMeasure.length && enabledTaxonomy ) {
      
      if ( current.hasAttribute('unitref') ) {
        for ( var i = 0; i < UserFiltersState.getMeasure.length; i++ ) {
          if ( current.getAttribute('unitref') === UserFiltersState.getMeasure[i] ) {
            return true;
          }
        }
      }
      return false;
      
    }
    return enabledTaxonomy;
  },
  
  axes : function( current, enabledTaxonomy ) {
    if ( UserFiltersState.getAxes.length && enabledTaxonomy ) {
      
      for ( var i = 0; i < UserFiltersState.getAxes.length; i++ ) {
        if ( document.querySelector('#dynamic-xbrl-form [id="' + current.getAttribute('contextref') + '"] [dimension="'
            + UserFiltersState.getAxes[i]['name'] + '"]') ) {
          return true;
        }
      }
      return false;
      
    }
    return enabledTaxonomy;
  },
  
  members : function( current, enabledTaxonomy ) {
    
    if ( UserFiltersState.getMembers.length && enabledTaxonomy ) {
      for ( var i = 0; i < UserFiltersState.getMembers.length; i++ ) {
        for ( var k = 0; k < UserFiltersState.getMembers[i]['parentID'].length; k++ ) {
          if ( current.getAttribute('contextref') === UserFiltersState.getMembers[i]['parentID'][k] ) {
            return true;
          }
        }
      }
      return false;
      
    }
    return enabledTaxonomy;
  },
  
  scales : function( current, enabledTaxonomy ) {
    if ( UserFiltersState.getScale.length && enabledTaxonomy ) {
      
      for ( var i = 0; i < UserFiltersState.getScale.length; i++ ) {
        if ( UserFiltersState.getScale[i] === current.getAttribute('scale') ) {
          return true;
        }
      }
      return false;
      
    }
    return enabledTaxonomy;
  },
  
  types : function( current, enabledTaxonomy ) {
    if ( UserFiltersState.getType.length && enabledTaxonomy ) {
      for ( var i = 0; i < UserFiltersState.getType.length; i++ ) {
        if ( current.hasAttribute('name') && current.getAttribute('name').split(':').length === 2 ) {
          if ( UserFiltersState.getType[i].toLowerCase() === current.getAttribute('name').split(':')[0].toLowerCase() ) {
            return true;
          }
        }
      }
      return false;
    }
    return enabledTaxonomy;
  },
  
  balances : function( current, enabledTaxonomy ) {
    if ( UserFiltersState.getBalance.length && enabledTaxonomy ) {
      
      var tagInformation = FiltersName.getTag(current.getAttribute('name'));
      
      if ( tagInformation.length && tagInformation[0]['crdr'] ) {
        if ( UserFiltersState.getBalance.indexOf(tagInformation[0]['crdr']) >= 0 ) {
          return true;
        }
      }
      return false;
    }
    return enabledTaxonomy;
  },
  
  search : function( current, enabledTaxonomy ) {
    var fullContentToRegexAgainst = '';
    var highlight = false;
    if ( (Object.keys(UserFiltersState.getUserSearch).length === 2) ) {
      
      if ( UserFiltersState.getUserSearch['options'].indexOf(1) >= 0 ) {
        // include fact name
        fullContentToRegexAgainst += ' ' + SearchFunctions.elementNameForRegex(current);
      }
      
      if ( UserFiltersState.getUserSearch['options'].indexOf(2) >= 0 ) {
        // include fact content
        fullContentToRegexAgainst += ' ' + SearchFunctions.elementContentForRegex(current);
      }
      
      if ( UserFiltersState.getUserSearch['options'].indexOf(3) >= 0 ) {
        // include labels
        fullContentToRegexAgainst += ' ' + SearchFunctions.elementLabelForRegex(current);
      }
      
      if ( UserFiltersState.getUserSearch['options'].indexOf(4) >= 0 ) {
        // include definitions
        fullContentToRegexAgainst += ' ' + SearchFunctions.elementDefinitionForRegex(current);
      }
      
      if ( UserFiltersState.getUserSearch['options'].indexOf(5) >= 0 ) {
        // include dimensions
        fullContentToRegexAgainst += ' ' + SearchFunctions.elementDimensionsForRegex(current);
      }
      
      if ( UserFiltersState.getUserSearch['options'].indexOf(6) >= 0
          || UserFiltersState.getUserSearch['options'].indexOf(7) >= 0
          || UserFiltersState.getUserSearch['options'].indexOf(9) >= 0
          || UserFiltersState.getUserSearch['options'].indexOf(10) >= 0 ) {
        // include references
        fullContentToRegexAgainst += ' '
            + SearchFunctions.elementReferencesForRegex(current, UserFiltersState.getUserSearch);
      }
      highlight = UserFiltersState.getUserSearch.regex.test(fullContentToRegexAgainst);
      
    }
    
    if ( Taxonomies.isElementContinued(current) ) {
      UserFiltersState.setContinuedAtHighlight(current, highlight);
    } else {
      current.setAttribute('highlight-taxonomy', highlight);
    }
    
  },
  
  setContinuedAtHighlight : function( current, highlight ) {
    if ( current ) {
      current.setAttribute('highlight-taxonomy', highlight);
      if ( current.hasAttribute('continuedat') ) {
        
        UserFiltersState.setContinuedAtHighlight(document.getElementById('dynamic-xbrl-form').querySelector(
            '[id="' + current.getAttribute('continuedat') + '"]'), highlight);
      }
    }
    
  }

};
