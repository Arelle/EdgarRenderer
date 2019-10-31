/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var UserFiltersGeneral = {
  
  moreFiltersClickEvent : function( event, element ) {
    
    if ( !UserFiltersMoreFiltersPeriodSetUp.filtersSet ) {
      UserFiltersMoreFiltersPeriodSetUp.setPeriods(function( ) {
        UserFiltersMoreFiltersPeriodSetUp.filtersSet = true;
        
        if ( !UserFiltersMoreFiltersMeasureSetUp.filtersSet ) {
          UserFiltersMoreFiltersMeasureSetUp.setMeasures(function( ) {
            UserFiltersMoreFiltersMeasureSetUp.filtersSet = true;
            
            if ( !UserFiltersMoreFiltersAxesSetUp.filtersSet ) {
              UserFiltersMoreFiltersAxesSetUp.setAxes(function( ) {
                UserFiltersMoreFiltersAxesSetUp.filtersSet = true;
                
                if ( !UserFiltersMoreFiltersMembersSetUp.filtersSet ) {
                  UserFiltersMoreFiltersMembersSetUp.setMembers(function( ) {
                    UserFiltersMoreFiltersMembersSetUp.filtersSet = true;
                    
                    if ( !UserFiltersMoreFiltersScaleSetUp.filtersSet ) {
                      UserFiltersMoreFiltersScaleSetUp.setScales(function( ) {
                        UserFiltersMoreFiltersScaleSetUp.filtersSet = true;
                        
                        // the Balances are not dynamic, they are already in the
                        // html
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  },
  
  setAllFilteredDataTemp : function( dataFilter, tagsFilter ) {
    
    UserFiltersGeneral.resetAllFilteredData();
    if ( dataFilter ) {
      UserFiltersGeneral.setCurrentDataFilter(dataFilter);
      // 0 = All
      // 1 = Amounts Only
      // 2 = Text Only
      // 3 = Calculations Only
      // 4 = Negatives Only
      // 5 = Additional Items Only
      switch ( dataFilter ) {
        case 'Amounts Only' : {
          UserFiltersDataRadios.updateFacts('nonfraction');
          break;
        }
        case 'Text Only' : {
          UserFiltersDataRadios.updateFacts('nonnumeric');
          break;
        }
        case 'Calculations Only' : {
          UserFiltersDataRadios.updateCalculationsOnly();
          break;
        }
        case 'Negatives Only' : {
          UserFiltersDataRadios.updateFactsNegativesOnly();
          break;
        }
        case 'Additional Items Only' : {
          UserFiltersDataRadios.updateAdditionalItemsOnly();
          break;
        }
      }
    }
    if ( !dataFilter ) {
      UserFiltersDataRadios.all();
    }
    if ( tagsFilter ) {
      switch ( tagsFilter ) {
        case 'Standard Only' : {
          UserFiltersTagsRadios.updateFactsStandard();
          
          break;
        }
        case 'Custom Only' : {
          UserFiltersTagsRadios.updateFactsCustom();
          break;
        }
      }
    }
    if ( !tagsFilter ) {
      UserFiltersTagsRadios.all();
    }
    
    UserFiltersGeneral.setEnabledTaxonomies();
  },
  
  setEnabledTaxonomies : function( ) {
    
    var foundTaxonomies = document.getElementById('dynamic-xbrl-form').querySelectorAll('[contextref]');
    var foundTaxonomiesArray = Array.prototype.slice.call(foundTaxonomies);
    foundTaxonomies.forEach(function( current ) {
      if ( UserFiltersGeneral.getAllFilteredData.indexOf(current) >= 0 ) {
        current.setAttribute('enabled-taxonomy', true);
      } else {
        current.setAttribute('enabled-taxonomy', false);
      }
    });
    
  },
  
  resetAllFilteredData : function( ) {
    var foundTaxonomies = document.getElementById('dynamic-xbrl-form').querySelectorAll('[contextref]');
    
    var foundTaxonomiesArray = Array.prototype.slice.call(foundTaxonomies);
    
    UserFiltersGeneral.getAllFilteredData = foundTaxonomiesArray;
  },
  
  setAllFilteredData : function( input, dataFilter, tagsFilter ) {
    
    UserFiltersGeneral.getAllFilteredData = input;
    
    UserFiltersGeneral.updateTaxonomyCounts(input.length);
    if ( dataFilter ) {
      
      UserFiltersGeneral.setCurrentDataFilter(dataFilter);
    } else {
      UserFiltersGeneral.setCurrentTagsFilter(tagsFilter);
    }
  },
  
  getAllFilteredData : null,
  
  updateTaxonomyCounts : function( input ) {
    
    var taxonomyTotalElements = document.querySelectorAll('.taxonomy-total-count');
    
    var taxonomyTotalElementsArray = Array.prototype.slice.call(taxonomyTotalElements);
    
    taxonomyTotalElementsArray.forEach(function( current ) {
      current.textContent = input;
    });
    TaxonomiesMenu.prepareForPagination();
  },
  
  updateCurrentFiltersDropdown : function( ) {
    
    if ( UserFiltersGeneral.getCurrentTagsFilter ) {
      
      document.getElementById('current-filters-dropdown').classList.remove('d-none');
      var taglink = document.createElement('a');
      var taglabel = document.createElement('label');
      var tagicon = document.createElement('i');
      var tagtext = document.createTextNode(UserFilterGeneral.getCurrentTagsFilter);
      taglink.addEventListener('click', UserFiltersGeneral.resetTagsFilter);
      taglink.className = 'dropdown-item click';
      tagicon.className = 'fas fa-timer mr-1';

      taglabel.appendChild(tagicon);
      taglabel.appendChild(tagtext);
      taglink.appendChild(taglabel);

      var taglinkcontainer = document.getElementById('current-filters-tag');
      taglinkcontainer.innerHTML = '';
      taglinkcontainer.appendChild(taglink);
    }
    if ( !UserFiltersGeneral.getCurrentTagsFilter ) {
      
      document.getElementById('current-filters-tags').innerHTML = '';
    }
    
    if ( UserFiltersGeneral.getCurrentDataFilter ) {
      
      document.getElementById('current-filters-dropdown').classList.remove('d-none');

      var taglink = document.createElement('a');
      var taglabel = document.createElement('label');
      var tagicon = document.createElement('i');
      var tagtext = document.createTextNode(UserFilterGeneral.getCurrentDataFilter);
      taglink.addEventListener('click', UserFiltersGeneral.resetDataFilter);
      taglink.className = 'dropdown-item click';
      tagicon.className = 'fas fa-timer mr-1';

      taglabel.appendChild(tagicon);
      taglabel.appendChild(tagtext);
      taglink.appendChild(taglabel);

      var taglinkcontainer = document.getElementById('current-filters-data');
      taglinkcontainer.innerHTML = '';
      taglinkcontainer.appendChild(taglink);
    }
    if ( !UserFiltersGeneral.getCurrentDataFilter ) {
      
      document.getElementById('current-filters-data').innerHTML = '';
    }
    
    if ( !UserFiltersGeneral.getCurrentTagsFilter && !UserFiltersGeneral.getCurrentDataFilter ) {
      
      document.getElementById('current-filters-dropdown').classList.add('d-none');
    }
  },
  
  setCurrentDataFilter : function( input ) {
    if ( input ) {
      UserFiltersGeneral.getCurrentDataFilter = input;
    } else {
      UserFiltersGeneral.getCurrentDataFilter = null;
    }
    
    UserFiltersGeneral.updateCurrentFiltersDropdown();
  },
  
  getCurrentDataFilter : null,
  
  setCurrentTagsFilter : function( input ) {
    if ( input ) {
      UserFiltersGeneral.getCurrentTagsFilter = input;
    } else {
      UserFiltersGeneral.getCurrentTagsFilter = null;
    }
    
    UserFiltersGeneral.updateCurrentFiltersDropdown();
  },
  
  getCurrentTagsFilter : null,
  
  resetDataFilter : function( ) {
    var radios = document.querySelectorAll('[name="data-radios"]');
    var radiosArray = Array.prototype.slice.call(radios);
    UserFiltersGeneral.getCurrentDataFilter = null;
    
    radiosArray.forEach(function( current, index ) {
      if ( index === 0 ) {
        current['checked'] = true;
        UserFiltersDataRadios.all();
      } else {
        current['checked'] = false;
      }
    });
  },
  
  resetTagsFilter : function( ) {
    var radios = document.querySelectorAll('[name="tags-radios"]');
    var radiosArray = Array.prototype.slice.call(radios);
    UserFiltersGeneral.getCurrentTagsFilter = null;
    
    radiosArray.forEach(function( current, index ) {
      if ( index === 0 ) {
        current['checked'] = true;
        UserFiltersTagsRadios.all();
      } else {
        current['checked'] = false;
      }
    });
  },
  
  resetAllFilters : function( ) {
    UserFiltersGeneral.resetDataFilter();
    UserFiltersGeneral.resetTagsFilter();
  }
};
