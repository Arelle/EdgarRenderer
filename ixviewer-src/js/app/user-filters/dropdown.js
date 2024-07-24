/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var UserFiltersDropdown = {
  
  filterActive : false,
  
  init : function( ) {
    
    UserFiltersDropdown.dataRadios();
    UserFiltersDropdown.tagsRadios();
    UserFiltersDropdown.moreFilters();
    UserFiltersDropdown.updateFilterActive();
    UserFiltersDropdown.activeFilters();
  },
  
  activeFilters : function( ) {
    if ( UserFiltersDropdown.filterActive ) {
      document.getElementById('current-filters-reset').classList.remove('d-none');
    } else {
      document.getElementById('current-filters-reset').classList.add('d-none');
    }
  },
  
  dataRadios : function( ) {
    if ( UserFiltersState.getDataRadios > 0 ) {
      document.getElementById('nav-filter-data').setAttribute('title', 'This filter is in use.');
      document.getElementById('nav-filter-data').classList.add('text-warning');
      // UserFiltersDropdown.filterActive = true;
    } else {
      document.getElementById('nav-filter-data').removeAttribute('title');
      document.getElementById('nav-filter-data').classList.remove('text-warning');
    }
  },
  
  tagsRadios : function( ) {
    if ( UserFiltersState.getTagsRadios > 0 ) {
      document.getElementById('nav-filter-tags').setAttribute('title', 'This filter is in use.');
      document.getElementById('nav-filter-tags').classList.add('text-warning');
      // UserFiltersDropdown.filterActive = true;
    } else {
      document.getElementById('nav-filter-tags').removeAttribute('title');
      document.getElementById('nav-filter-tags').classList.remove('text-warning');
    }
  },
  
  moreFilters : function( ) {
    var moreFiltersCount = 0;
    moreFiltersCount += UserFiltersState.getAxes.length;
    moreFiltersCount += UserFiltersState.getMembers.length;
    moreFiltersCount += UserFiltersState.getBalance.length;
    moreFiltersCount += UserFiltersState.getMeasure.length;
    moreFiltersCount += UserFiltersState.getPeriod.length;
    moreFiltersCount += UserFiltersState.getScale.length;
    
    if ( moreFiltersCount > 0 ) {
      document.getElementById('nav-filter-more').querySelector('.badge').innerText = moreFiltersCount;
      document.getElementById('nav-filter-more').setAttribute('title', 'This filter is in use.');
      document.getElementById('nav-filter-more').classList.add('text-warning');
      // UserFiltersDropdown.filterActive = true;
    } else {
      document.getElementById('nav-filter-more').querySelector('.badge').innerText = '';
      document.getElementById('nav-filter-more').removeAttribute('title');
      document.getElementById('nav-filter-more').classList.remove('text-warning');
    }
  },
  
  resetAll : function( ) {
    UserFiltersDropdown.filterActive = false;
    
    UserFiltersState.getDataRadios = 0;
    document.querySelector('input[name="data-radios"]').checked = true;
    
    UserFiltersState.getTagsRadios = 0;
    document.querySelector('input[name="tags-radios"]').checked = true;
    
    UserFiltersState.getAxes = [ ];
    var foundAxes = document.querySelectorAll('#user-filters-axis input');
    var foundAxesArray = Array.prototype.slice.call(foundAxes);
    foundAxesArray.forEach(function( current ) {
      current.checked = false;
    });
    
    UserFiltersState.getMembers = [ ];
    var foundMembers = document.querySelectorAll('#user-filters-members input');
    var foundMembersArray = Array.prototype.slice.call(foundMembers);
    foundMembersArray.forEach(function( current ) {
      current.checked = false;
    });
    
    UserFiltersState.getBalance = [ ];
    var foundBalances = document.querySelectorAll('#user-filters-balances input');
    var foundBalancesArray = Array.prototype.slice.call(foundBalances);
    foundBalancesArray.forEach(function( current ) {
      current.checked = false;
    });
    
    UserFiltersState.getMeasure = [ ];
    var foundMeasures = document.querySelectorAll('#user-filters-measures input');
    var foundMeasuresArray = Array.prototype.slice.call(foundMeasures);
    if (foundMeasuresArray.length === 0) {
      var measuresCollapse = document.querySelector('#user-filters-measures');
      measuresCollapse.addClass('ix-disabled');
    }
    foundMeasuresArray.forEach(function( current ) {
      current.checked = false;
    });
    
    UserFiltersState.getPeriod = [ ];
    var foundPeriods = document.querySelectorAll('#user-filters-periods input');
    var foundPeriodsArray = Array.prototype.slice.call(foundPeriods);
    foundPeriodsArray.forEach(function( current ) {
      current.checked = false;
    });
    
    UserFiltersState.getScale = [ ];
    var foundScales = document.querySelectorAll('#user-filters-scales input');
    var foundScalesArray = Array.prototype.slice.call(foundScales);
    foundScalesArray.forEach(function( current ) {
      current.checked = false;
    });
    
    
    UserFiltersState.filterUpdates();
    
  },
  
  updateFilterActive : function( ) {
    var totalFiltersCount = 0;
    totalFiltersCount += UserFiltersState.getDataRadios;
    totalFiltersCount += UserFiltersState.getTagsRadios;
    totalFiltersCount += UserFiltersState.getAxes.length;
    totalFiltersCount += UserFiltersState.getMembers.length;
    totalFiltersCount += UserFiltersState.getBalance.length;
    totalFiltersCount += UserFiltersState.getMeasure.length;
    totalFiltersCount += UserFiltersState.getPeriod.length;
    totalFiltersCount += UserFiltersState.getScale.length;
    
    if ( totalFiltersCount === 0 ) {
      UserFiltersDropdown.filterActive = false;
    } else {
      UserFiltersDropdown.filterActive = true;
    }
  }
};
