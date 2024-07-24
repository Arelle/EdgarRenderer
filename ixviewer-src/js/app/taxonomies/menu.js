/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

// fact sidebar
var TaxonomiesMenu = {
  
  getCurrentPage : null,
  
  getLastPage : null,
  
  getGlobalSearch : false,
  
  toggle : function( event, element ) {
    
    if ( event.keyCode && !(event.keyCode === 13 || event.keyCode === 32) ) {
      return;
    }
    
    if ( element.classList && element.classList.contains('disabled') ) {
      return;
    }
    MenusState.toggle('taxonomies-menu', true, function( openMenu ) {
      if ( openMenu ) {
        document.getElementById('taxonomies-menu').addEventListener('transitionend', TaxonomiesMenu.transitionEvent);
      }
    });
    
  },
  
  transitionEvent : function( ) {
    setTimeout(function( ) {
      TaxonomiesMenu.prepareForPagination();
      document.getElementById('taxonomies-menu').removeEventListener('transitionend', Sections.transitionEvent);
    }, 300);
  },
  
  formChange : function( ) {
    if ( MenusState.openMenu === 'taxonomies-menu' ) {
      TaxonomiesMenu.prepareForPagination();
    }
  },
  
  prepareForPagination : function( ) {
    
    var enabledTaxonomies;
    
    if ( Object.keys(UserFiltersState.getUserSearch).length === 0 ) {
      enabledTaxonomies = document.getElementById('dynamic-xbrl-form').querySelectorAll(
          '[contextref][enabled-taxonomy="true"]');
    } else {
      enabledTaxonomies = document.getElementById('dynamic-xbrl-form').querySelectorAll(
          '[contextref][enabled-taxonomy="true"][highlight-taxonomy="true"]');
    }
    
    var enabledTaxonomiesArray = TaxonomiesGeneral.specialSort(Array.prototype.slice.call(enabledTaxonomies));
    
    Pagination.init(enabledTaxonomiesArray, ('#taxonomies-menu-list-pagination .pagination'),
        ('#taxonomies-menu-list-pagination .list-group'), true);
    
  }
};
