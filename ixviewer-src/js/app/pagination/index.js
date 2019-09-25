/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var Pagination = {
  init : function( paginaitonContent, selectorForPaginationControls, selectorForPaginationContent, modalAction ) {
    Pagination.reset();
    Pagination.getModalAction = modalAction;
    Pagination.getPaginationControlsSelector = selectorForPaginationControls;
    Pagination.getPaginationSelector = selectorForPaginationContent;
    Pagination.setArray(paginaitonContent);
    Pagination.getCurrentPage = 1;
    Pagination.getTotalPages = Math.ceil(Pagination.getArray.length / Constants.getPaginationPerPage);
    Pagination.getPaginationTemplate(Pagination.getCurrentPage);
    
    Pagination.setPageSelect();
    
  },
  
  reset : function( ) {
    Pagination.getModalAction = false;
    Pagination.setArray([ ]);
    Pagination.getPaginationControlsSelector = '';
    Pagination.getPaginationControlsSelector = '';
    Pagination.getPaginationSelector = '';
    Pagination.getCurrentPage = 1;
    Pagination.getTotalPages = 0;
  },
  
  getModalAction : false,
  
  getArray : [ ],
  
  setArray : function( input ) {
    Pagination.getArray = input;
  },
  
  getPaginationControlsSelector : '',
  
  getPaginationSelector : '',
  
  getCurrentPage : 1,
  
  getTotalPages : 0,
  
  getPaginationTemplate : function( currentPage ) {
    document.querySelector(Pagination.getPaginationControlsSelector).innerHTML = Pagination.getControlsTemplate();
    var listHtml = '';
    
    var beginAt = ((currentPage - 1) * Constants.getPaginationPerPage);
    var endAt = beginAt + Constants.getPaginationPerPage;
    
    document.querySelector(Pagination.getPaginationControlsSelector + ' .pagination-info').innerHTML = currentPage
        + ' of ' + Pagination.getTotalPages;
    
    var arrayForPage = Pagination.getArray.slice(beginAt, endAt);
    arrayForPage.forEach(function( current ) {
      listHtml += TaxonomiesGeneral.getTaxonomyListTemplate(current, Pagination.getModalAction);
    });
    document.querySelector(Pagination.getPaginationSelector).innerHTML = listHtml;
  },
  
  firstPage : function( ) {
    
    Pagination.getCurrentPage = 1;
    Pagination.getPaginationTemplate(Pagination.getCurrentPage);
  },
  
  lastPage : function( ) {
    
    Pagination.getCurrentPage = Pagination.getTotalPages;
    Pagination.getPaginationTemplate(Pagination.getCurrentPage);
  },
  
  previousPage : function( ) {
    
    Pagination.getCurrentPage = Pagination.getCurrentPage - 1;
    Pagination.getPaginationTemplate(Pagination.getCurrentPage);
  },
  
  nextPage : function( ) {
    
    Pagination.getCurrentPage = Pagination.getCurrentPage + 1;
    Pagination.getPaginationTemplate(Pagination.getCurrentPage);
  },
  
  previousTaxonomy : function( event, element, trueIfHighlightLast ) {
    
    var beginAt = ((Pagination.getCurrentPage - 1) * Constants.getPaginationPerPage);
    var endAt = beginAt + Constants.getPaginationPerPage;
    
    var currentTaxonomies = Pagination.getArray.slice(beginAt, endAt);
    
    var selectedTaxonomy = currentTaxonomies.map(function( current, index ) {
      
      var element = TaxonomiesGeneral.getMenuTaxonomyByDataID(current);
      if ( element && element.getAttribute('selected-taxonomy') === 'true' ) {
        return index;
      }
    }).filter(function( element ) {
      return element >= 0;
    });
    
    if ( selectedTaxonomy.length === 0 ) {
      if ( trueIfHighlightLast ) {
        
        var element = TaxonomiesGeneral.getMenuTaxonomyByDataID(currentTaxonomies[currentTaxonomies.length - 1]);
        TaxonomiesGeneral.goTo(event, element, true);
      } else {
        
        var element = TaxonomiesGeneral.getMenuTaxonomyByDataID(currentTaxonomies[0]);
        TaxonomiesGeneral.goTo(event, element, true);
      }
    } else {
      if ( (selectedTaxonomy[0] - 1) < 0 ) {
        if ( Pagination.getCurrentPage - 1 > 0 ) {
          Pagination.previousPage();
          Pagination.previousTaxonomy(event, element, true);
        }
      } else {
        
        var element = TaxonomiesGeneral.getMenuTaxonomyByDataID(currentTaxonomies[(selectedTaxonomy[0] - 1)]);
        TaxonomiesGeneral.goTo(event, element, true);
      }
    }
  },
  
  nextTaxonomy : function( event, element ) {
    var beginAt = ((Pagination.getCurrentPage - 1) * Constants.getPaginationPerPage);
    var endAt = beginAt + Constants.getPaginationPerPage;
    var currentTaxonomies = Pagination.getArray.slice(beginAt, endAt);
    var selectedTaxonomy = currentTaxonomies.map(function( current, index ) {
      
      var element = TaxonomiesGeneral.getMenuTaxonomyByDataID(current);
      if ( element && element.getAttribute('selected-taxonomy') === 'true' ) {
        
        return index;
      }
      
    }).filter(function( element ) {
      
      return element >= 0;
    });
    if ( selectedTaxonomy.length === 0 ) {
      
      var element = TaxonomiesGeneral.getMenuTaxonomyByDataID(currentTaxonomies[0]);
      TaxonomiesGeneral.goTo(event, element, true);
    } else {
      
      if ( (selectedTaxonomy[0] + 1) >= currentTaxonomies.length ) {
        
        if ( (Pagination.getCurrentPage - 1) !== (Pagination.getTotalPages - 1) ) {
          
          Pagination.nextPage();
          Pagination.nextTaxonomy(event, element);
        }
      } else {
        var element = TaxonomiesGeneral.getMenuTaxonomyByDataID(currentTaxonomies[selectedTaxonomy[0] + 1]);
        TaxonomiesGeneral.goTo(event, element, true);
      }
    }
  },
  
  getControlsTemplate : function( ) {
    
    var firstPage = (Pagination.getCurrentPage === 1) ? 'disabled' : '';
    var previousPage = (Pagination.getCurrentPage - 1 <= 0) ? 'disabled' : '';
    var nextPage = (Pagination.getCurrentPage + 1 > Pagination.getTotalPages) ? 'disabled' : '';
    var lastPage = (Pagination.getCurrentPage === Pagination.getTotalPages) ? 'disabled' : '';
    var template = '';
    
    Pagination.setPageSelect();
    
    template += '<div class="w-100 d-flex justify-content-between py-2 px-1">';
    
    template += '<div>';
    template += '<ul class="pagination pagination-sm mb-0">';
    
    template += '<li class="page-item">';
    template += '<a href="#" onclick="Pagination.previousTaxonomy(event, this);" class="page-link" onclick="Pagination.firstPage();" tabindex="13">';
    template += 'Prev';
    template += '</a>';
    template += '</li>';
    
    template += '<li class="page-item">';
    template += '<a href="#" data-test="next-taxonomy" onclick="Pagination.nextTaxonomy(event, this);" class="page-link" onclick="Pagination.firstPage();" tabindex="13">';
    template += 'Next';
    template += '</a>';
    template += '</li>';
    
    template += '</ul>';
    template += '</div>';
    template += '<div class="pagination-info"></div>';
    template += '<nav>';
    template += '<ul class="pagination pagination-sm mb-0">';
    template += '<li class="page-item ' + firstPage + '">';
    template += '<a href="#" class="page-link" onclick="Pagination.firstPage();" tabindex="13">';
    template += '<i class="fas fa-lg fa-angle-double-left"></i>';
    template += '</a>';
    template += '</li>';
    template += '<li class="page-item ' + previousPage + '">';
    template += '<a href="#" class="page-link" onclick="Pagination.previousPage();" tabindex="13">';
    template += '<i class="fas fa-lg fa-angle-left"></i>';
    template += '</a>';
    template += '</li>';
    template += '<li class="page-item ' + nextPage + '">';
    template += '<a href="#" class="page-link" onclick="Pagination.nextPage();" tabindex="13">';
    template += '<i class="fas fa-lg fa-angle-right"></i>';
    template += '</a>';
    template += '</li>';
    template += '<li class="page-item ' + lastPage + '">';
    template += '<a href="#" class="page-link" onclick="Pagination.lastPage();" tabindex="13">';
    template += '<i class="fas fa-lg fa-angle-double-right"></i>';
    template += '</a>';
    template += '</li>';
    template += '</ul>';
    template += '</nav>';
    template += '</div>';
    
    return template;
    
  },
  
  setPageSelect : function( ) {
    
    var pageSelectHTML = '<option value="null">Select a Page</option>';
    
    for ( var i = 0; i < Pagination.getTotalPages; i++ ) {
      if ( (i + 1) === Pagination.getCurrentPage ) {
        pageSelectHTML += '<option selected value="' + (i + 1) + '">Page ' + (i + 1) + '</option>';
        
      } else {
        pageSelectHTML += '<option value="' + (i + 1) + '">Page ' + (i + 1) + '</option>';
        
      }
    }
    document.getElementById('taxonomies-menu-page-select').innerHTML = pageSelectHTML;
  },
  
  goToPage : function( event, element ) {
    
    if ( element && element.value && !isNaN(element.value) ) {
      Pagination.getCurrentPage = parseInt(element.value);
      Pagination.getPaginationTemplate(Pagination.getCurrentPage);
    }
  },
  
  goToTaxonomy : function( event, element ) {
    
    if ( element && element.hasAttribute('data-id') ) {
      
      if ( MenusState.openMenu === 'taxonomies-menu' ) {
        
        Pagination.findTaxonomyAndGoTo(element.getAttribute('data-id'));
        
      } else {
        MenusState.toggle('taxonomies-menu', true, function( openMenu ) {
          if ( openMenu ) {
            document.getElementById('taxonomies-menu').addEventListener('transitionend', function( event ) {
              // our menu is now open
              // we populate the menu with associated data
              setTimeout(function( ) {
                TaxonomiesMenu.prepareForPagination();
                Pagination.findTaxonomyAndGoTo(element.getAttribute('data-id'));
              });
              
            }, {
              'once' : true
            });
          }
        });
      }
    }
  },
  
  findTaxonomyAndGoTo : function( elementID ) {
    var index = -1;
    for ( var i = 0; i < Pagination.getArray.length; i++ ) {
      if ( Pagination.getArray[i] === elementID ) {
        index = i;
        break;
      }
    }
    if ( index >= 0 ) {
      (index === 0) ? (index = 1) : (index = index);
      var pageToGoTo = Math.ceil(index / Constants.getPaginationPerPage);
      Pagination.getCurrentPage = pageToGoTo;
      Pagination.getPaginationTemplate(pageToGoTo);
      Pagination.scrollToSelectedTaxonomy(index);
    } else {
      ErrorsMinor.factNotActive();
    }
  },
  
  scrollToSelectedTaxonomy : function( index ) {
    var elementToScrollTo = document.getElementById('taxonomies-menu-list-pagination').querySelector(
        '[selected-taxonomy="true"]');
    if ( elementToScrollTo ) {
      elementToScrollTo.scrollIntoView({
        'block' : Constants.scrollPosition
      });
    }
  }

};
