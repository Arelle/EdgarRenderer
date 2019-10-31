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
    var paginationControls = document.querySelector(Pagination.getPaginationControlsSelector);
    paginationControls.innerHTML = '';
    paginationControls.appendChild(Pagination.getControlsTemplate());

    var beginAt = ((currentPage - 1) * Constants.getPaginationPerPage);
    var endAt = beginAt + Constants.getPaginationPerPage;
    
    document.querySelector(Pagination.getPaginationControlsSelector + ' .pagination-info').innerHTML = currentPage
        + ' of ' + Pagination.getTotalPages;

    var paginationSelectorElement = document.querySelector(Pagination.getPaginationSelector);
    paginationSelectorElement.innerHTML = '';
    
    var arrayForPage = Pagination.getArray.slice(beginAt, endAt);
    arrayForPage.forEach(function( current ) {
      paginationSelectorElement.appendChild(
          TaxonomiesGeneral.getTaxonomyListTemplate(current, Pagination.getModalAction)
        );
    });
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
    
    Pagination.setPageSelect();

    var outerDiv = document.createElement('div');
    outerDiv.className = 'w-100 d-flex justify-content-between py-2 px-1';

    var pageItemDiv = document.createElement('div');
    outerDiv.appendChild(pageItemDiv);

    var paginationTaxonomyUl = document.createElement('ul');
    paginationTaxonomyUl.className = 'pagination pagination-sm mb-0';
    pageItemDiv.appendChild(paginationTaxonomyUl);

    var prevTaxonomyLi = document.createElement('li');
    prevTaxonomyLi.className = 'page-item';
    paginationTaxonomyUl.appendChild(prevTaxonomyLi);

    var prevTaxonomyLink = document.createElement('a');
    prevTaxonomyLink.textContent = 'Prev';
    prevTaxonomyLink.href = '#';
    prevTaxonomyLink.className = 'page-link';
    prevTaxonomyLink.tabIndex = 13;
    prevTaxonomyLink.addEventListener('click', function(e) {
      Pagination.previousTaxonomy(e, this);
      Pagination.firstPage();
    });
    prevTaxonomyLi.appendChild(prevTaxonomyLink);

    var nextTaxonomyLi = document.createElement('li');
    nextTaxonomyLi.className = 'page-item';
    paginationTaxonomyUl.appendChild(nextTaxonomyLi);

    var nextTaxonomyLink = document.createElement('a');
    nextTaxonomyLink.textContent = 'Next';
    nextTaxonomyLink.href = '#';
    nextTaxonomyLink.setAttribute('data-test', 'next-taxonomy');
    nextTaxonomyLink.className = 'page-link';
    nextTaxonomyLink.tabIndex = 13;
    nextTaxonomyLink.addEventListener('click', function(e) {
      Pagination.nextTaxonomy(e, this);
      Pagination.firstPage();   // firstPage? seems odd.
    });
    nextTaxonomyLi.appendChild(nextTaxonomyLink);

    var paginationDiv = document.createElement('div');
    paginationDiv.className = 'pagination-info';
    outerDiv.appendChild(paginationDiv);

    var nav = document.createElement('nav');
    outerDiv.appendChild(nav);

    var paginationUl = document.createElement('ul');
    paginationUl.className = 'pagination pagination-sm mb-0';
    nav.appendChild(paginationUl);

    // first
    var firstLi = document.createElement('li');
    firstLi.className = 'page-item ' + firstPage;
    paginationUl.appendChild(firstLi);

    var firstLink = document.createElement('a');
    firstLink.href = '#';
    firstLink.className = 'page-link';
    firstLink.tabIndex = 13;
    firstLink.addEventListener('click', function(e) {
      Pagination.firstPage();
    });
    firstLi.appendChild(firstLink);

    var firstIcon = document.createElement('i');
    firstIcon.className = 'fas fa-lg fa-angle-double-left';
    firstLink.appendChild(firstIcon);

    // previous
    var previousLi = document.createElement('li');
    previousLi.className = 'page-item ' + previousPage;
    paginationUl.appendChild(previousLi);

    var previousLink = document.createElement('a');
    previousLink.href = '#';
    previousLink.className = 'page-link';
    previousLink.tabIndex = 13;
    previousLink.addEventListener('click', function(e) {
      Pagination.previousPage();
    });
    previousLi.appendChild(previousLink);

    var previousIcon = document.createElement('i');
    previousIcon.className = 'fas fa-lg fa-angle-left';
    previousLink.appendChild(previousIcon);

    // next
    var nextLi = document.createElement('li');
    nextLi.className = 'page-item ' + nextPage;
    paginationUl.appendChild(nextLi);

    var nextLink = document.createElement('a');
    nextLink.href = '#';
    nextLink.className = 'page-link';
    nextLink.tabIndex = 13;
    nextLink.addEventListener('click', function(e) {
      Pagination.nextPage();
    });
    nextLi.appendChild(nextLink);

    var nextIcon = document.createElement('i');
    nextIcon.className = 'fas fa-lg fa-angle-right';
    nextLink.appendChild(nextIcon);

    // last
    var lastLi = document.createElement('li');
    lastLi.className = 'page-item ' + lastPage;
    paginationUl.appendChild(lastLi);

    var lastLink = document.createElement('a');
    lastLink.href = '#';
    lastLink.className = 'page-link';
    lastLink.tabIndex = 13;
    lastLink.addEventListener('click', function(e) {
      Pagination.lastPage();
    });
    lastLi.appendChild(lastLink);

    var lastIcon = document.createElement('i');
    lastIcon.className = 'fas fa-lg fa-angle-double-right';
    lastLink.appendChild(lastIcon);

    return outerDiv;
    
  },
  
  setPageSelect : function( ) {

    var pageSelect = document.getElementById('taxonomies-menu-page-select');
    pageSelect.innerHTML = '';

    var option = document.createElement('option');
    option.value = 'null';
    option.textContent = 'Select a Page';
    pageSelect.appendChild(option);

    for ( var i = 1; i <= Pagination.getTotalPages; i++ ) {
      option = document.createElement('option');
      option.value = i;
      option.textContent = 'Page ' + i;
      if ( i === Pagination.getCurrentPage ) {
        option.setAttribute('selected', '');
      }
      pageSelect.appendChild(option);
    }
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
