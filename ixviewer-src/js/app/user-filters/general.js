/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var UserFiltersGeneral = {
  
  moreFiltersClickEvent : function( event, element ) {
    if ( !UserFiltersMoreFiltersPeriodSetUp.filtersSet ) {
      document.getElementById('loading-more-filters').classList.remove('fa-filter');
      document.getElementById('loading-more-filters').classList.add('fa-spinner');
      document.getElementById('loading-more-filters').classList.add('fa-spin');
      document.getElementById('loading-more-filters').title = "Loading, this may take a few moments.";
      setTimeout(function( ) {
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
                          
                          document.getElementById('loading-more-filters').classList.remove('fa-spin');
                          document.getElementById('loading-more-filters').classList.remove('fa-spinner');
                          document.getElementById('loading-more-filters').classList.add('fa-filter');
                          document.getElementById('loading-more-filters').removeAttribute('title');
                          // the Balances are not dynamic, they are already in
                          // the html
                        });
                      }
                    });
                  }
                });
              }
            });
          }
        });
      });
    }
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
      var dropdownHtml = '<a onclick="UserFiltersGeneral.resetTagsFilter();" class="dropdown-item click">';
      dropdownHtml += '<label><i class="fas fa-times me-1"></i>';
      dropdownHtml += UserFiltersGeneral.getCurrentTagsFilter;
      dropdownHtml += '</label></a>';
      document.getElementById('current-filters-tags').innerHTML = dropdownHtml;
    }
    if ( !UserFiltersGeneral.getCurrentTagsFilter ) {
      document.getElementById('current-filters-tags').innerHTML = '';
    }
    
    if ( UserFiltersGeneral.getCurrentDataFilter ) {
      document.getElementById('current-filters-dropdown').classList.remove('d-none');
      var dropdownHtml = '<a onclick="UserFiltersGeneral.resetDataFilter();" class="dropdown-item click">';
      dropdownHtml += '<label><i class="fas fa-times me-1"></i>';
      dropdownHtml += UserFiltersGeneral.getCurrentDataFilter;
      dropdownHtml += '</label></a>';
      document.getElementById('current-filters-data').innerHTML = dropdownHtml;
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
  },
  
  emptyMoreFilters : function( ) {
    
    UserFiltersMoreFiltersPeriodSetUp.filtersSet = false;
    UserFiltersMoreFiltersMeasureSetUp.filtersSet = false;
    UserFiltersMoreFiltersAxesSetUp.filtersSet = false;
    UserFiltersMoreFiltersMembersSetUp.filtersSet = false;
    UserFiltersMoreFiltersScaleSetUp.filtersSet = false;
    
  }

};
