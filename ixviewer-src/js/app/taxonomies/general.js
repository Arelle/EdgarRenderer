/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var TaxonomiesGeneral = {
  
  enterElement : function( event, element ) {
    
    event.stopPropagation();
    
    if ( FiltersName.getLabel(element.getAttribute('name')) ) {
      
      TaxonomiesGeneral.addPopover(element);
    }
    element.setAttribute('hover-taxonomy', true);
  },
  
  addPopover : function( element, isContinued ) {
    isContinued = isContinued || false;
    
    var popoversDiscovered = document.querySelectorAll('.popover');
    var popoversDiscoveredArray = Array.prototype.slice.call(popoversDiscovered);
    
    popoversDiscoveredArray.forEach(function( current ) {
      current.parentNode.removeChild(current);
    });
    
    var terseLabelOnly = FiltersName.getTerseLabelOnlyLabel(element.getAttribute('name')) ? FiltersName
        .getLabel(element.getAttribute('name')) : 'Not Available.';
    
    element.setAttribute('data-bs-toggle', 'popover');
    element.setAttribute('data-title', terseLabelOnly);
    
    var popoverHtml = '';
    popoverHtml += '<div class="popover" role="tooltip">';
    popoverHtml += '<div class="arrow"></div>';
    popoverHtml += '<h3 class="popover-header text-center text-popover-clamp-1 py-0"></h3>';
    popoverHtml += '<div class="text-center text-popover-clamp-2 py-1">'
        + FiltersValue.getFormattedValue(element, true) + '</div>';
    popoverHtml += '<div class="text-center p-2">' + FiltersContextref.getPeriod(element.getAttribute('contextref'))
        + '</div>';
    popoverHtml += '<p class="text-center p-2">Click for additional information.</p>';
    popoverHtml += '</div>';
    
    $(element).popover({
      'placement' : 'auto',
      'template' : popoverHtml
    // 'container' : 'element'
    });
    $(element).popover('show');
  },
  
  removeAllSelectedTaxonomy : function( ) {
    var otherSelectedTaxonomies = document.querySelectorAll('[selected-taxonomy="true"]');
    
    var otherSelectedTaxonomiesArray = Array.prototype.slice.call(otherSelectedTaxonomies);
    
    otherSelectedTaxonomiesArray.forEach(function( current ) {
      current.setAttribute('selected-taxonomy', false);
    });
  },
  
  selectedTaxonomy : function( element ) {
    TaxonomiesGeneral.removeAllSelectedTaxonomy();
    
    var foundTaxonomies;
    
    if ( element instanceof Array ) {
      element.forEach(function( current, index ) {
        if ( index === 0 ) {
          var menuTaxonomy = document.querySelector('[data-id="' + current.getAttribute('id') + '"]');
          if ( menuTaxonomy ) {
            menuTaxonomy.setAttribute('selected-taxonomy', true);
          }
        }
        current.setAttribute('selected-taxonomy', true);
      });
    } else {
      
      if ( element.getAttribute('id') ) {
        foundTaxonomies = document.querySelectorAll('#' + element.getAttribute('id') + ' ,[data-id="'
            + element.getAttribute('id') + '"]');
      } else {
        
        foundTaxonomies = document.querySelectorAll('[contextref="' + element.getAttribute('contextref') + '"][name="'
            + element.getAttribute('name') + '"]');
      }
      
      var foundTaxonomiesArray = Array.prototype.slice.call(foundTaxonomies);
      
      foundTaxonomiesArray.forEach(function( current ) {
        
        if ( !Taxonomies.isElementContinued(current) ) {
          current.setAttribute('selected-taxonomy', true);
        }
        
      });
    }
  },
  
  getElementByNameContextref : function( name, contextref ) {
    return document.getElementById('dynamic-xbrl-form').querySelector(
        '[name="' + name + '"][contextref="' + contextref + '"]');
  },
  
  getTaxonomyById : function( id ) {
    var element = document.getElementById('dynamic-xbrl-form').querySelector('[id="' + id + '"]');
    if ( element.hasAttribute('continued-main-taxonomy') && element.getAttribute('continued-main-taxonomy') === 'true' ) {
      return ModalsNested.dynamicallyFindContinuedTaxonomies(element, [ ]);
    }
    return element;
    
  },
  
  getMenuTaxonomyByDataID : function( dataId ) {
    
    return document.getElementById('taxonomies-menu-list-pagination').querySelector('[data-id="' + dataId + '"]');
  },
  
  goTo : function( event, element, modalPopup ) {
    
    if ( event.keyCode && !(event.keyCode === 13 || event.keyCode === 32) ) {
      return;
    }
    var menuElementToScrollTo;
    var elementToScrollTo;
    
    if ( element.getAttribute('data-id') ) {
      elementToScrollTo = document.getElementById('dynamic-xbrl-form').querySelector(
          '#' + element.getAttribute('data-id'));
      
      menuElementToScrollTo = document.querySelector('[data-id="' + element.getAttribute('data-id') + '"]');
      
      document.getElementById("taxonomy-modal-jump").setAttribute("data-id", element.getAttribute('data-id'));
      
    } else if ( element.getAttribute('id') ) {
      
      elementToScrollTo = document.getElementById('dynamic-xbrl-form').querySelector('#' + element.getAttribute('id'));
      
      menuElementToScrollTo = document.querySelector('[data-id="' + element.getAttribute('id') + '"]');

      document.getElementById("taxonomy-modal-jump").setAttribute("data-id", element.getAttribute('data-id'));
      
    } else {
      
      elementToScrollTo = document.getElementById('dynamic-xbrl-form').querySelector(
          '[name="' + element.getAttribute('name') + '"][contextref="' + element.getAttribute('contextref') + '"]');
      
    }
    
    if ( menuElementToScrollTo ) {
      menuElementToScrollTo.scrollIntoView({
        'block' : Constants.scrollPosition
      });
    }
    
    if ( elementToScrollTo ) {
      TaxonomiesGeneral.selectedTaxonomy(elementToScrollTo);
      
      if ( modalPopup ) {
        
        if ( Taxonomies.isElementContinued(elementToScrollTo) ) {
          ModalsContinuedAt.clickEvent(event, elementToScrollTo);
        } else {
          ModalsCommon.clickEvent(event, elementToScrollTo);
        }
        
      }
      
      elementToScrollTo.scrollIntoView({
        'block' : Constants.scrollPosition
      });
      
    } else {
      // let user know it isn't going to work.
      ErrorsMinor.factNotFound();
    }
    
  },
  
  getTaxonomyListTemplate : function( elementID, modalAction ) {
    
    var template = '';
    var elementToReturn = document.createDocumentFragment();
    var elementContinueAt='';
    var element = TaxonomiesGeneral.getTaxonomyById(elementID);
    // dev 
    if (element instanceof Array ) {
        elementContinueAt = element;
        element = element[0];
      }
    
    var aElement = document.createElement('a');
    aElement
      .setAttribute('class',
        'text-body border-bottom click text-decoration-none click list-group-item list-group-item-action bg-light px-0 py-0 ');
    aElement.setAttribute('selected-taxonomy', element.getAttribute('selected-taxonomy'));
    aElement.setAttribute('contextref', element.getAttribute('contextref'));
    aElement.setAttribute('name', element.getAttribute('name'));
    if ( element.hasAttribute('id') ) {
      aElement.setAttribute('data-id', element.getAttribute('id'));
    }
    aElement.setAttribute('tabindex', 13);
    aElement.addEventListener('click', function(e) { TaxonomiesGeneral.goTo(e, aElement, modalAction); });
    aElement.addEventListener('keyup', function(e) { TaxonomiesGeneral.goTo(e, aElement, modalAction); });
    
    var divElement = document.createElement('div');
    divElement.setAttribute('class', 'd-flex w-100 justify-content-between');
    
    var pElement = document.createElement('p');
    pElement.setAttribute('class', 'mb-1 fw-bold');
    
    var pElementContent = document.createTextNode((FiltersName.getLabel(element.getAttribute('name')) || ''));
    pElement.appendChild(pElementContent);
    
    divElement.appendChild(pElement);
    divElement.appendChild(TaxonomiesGeneral.getTaxonomyBadge(element) || document.createTextNode(''));
    
    var pElement = document.createElement('p');
    pElement.setAttribute('class', 'mb-1');
    
    var pElementContent = document.createTextNode(FiltersContextref.getPeriod(element.getAttribute('contextref')));
    pElement.appendChild(pElementContent);
    
    var smallElement = document.createElement('small');
    smallElement.setAttribute('class', 'mb-1');
    
    var smallElementContent;
    
    if ((elementContinueAt instanceof Array) && (elementContinueAt[0].hasAttribute('format'))){
      
      smallElementContent = document.createTextNode(FiltersValue.getFormattedValueForContinuedAt(elementContinueAt, true));
    
    } else if ( element.hasAttribute('text-block-taxonomy') || ConstantsFunctions.setModalFactAsTextBlock(element) ) {
      
      smallElementContent = document.createTextNode('Click to see Fact.');

    } else if (element.innerText.length > 100 ){
      
      smallElementContent = document.createTextNode('Click to see Fact.');
      
    } else
    
   {
      smallElementContent = document.createTextNode(FiltersValue.getFormattedValue(element, true));
    }
     smallElement.appendChild(smallElementContent);
    
    aElement.appendChild(divElement);
    aElement.appendChild(pElement);
    aElement.appendChild(smallElement);
    elementToReturn.appendChild(aElement);
    
    return elementToReturn;
  },
  
  getTaxonomyBadge : function( element ) {
    
    var elementToReturn = document.createDocumentFragment();
    var label = '';
    var title = '';
    
    if ( element.hasAttribute('isAdditionalItemsOnly') && element.getAttribute('isAdditionalItemsOnly') === 'true' ) {
      label += 'A';
      title += 'Additional';
    }
    
    if ( !element.hasAttribute('isCustomOnly') ) {
      element.setAttribute('isCustomOnly',
          (element.getAttribute('name').split(':')[0].toLowerCase() === Constants.getMetaCustomPrefix) ? true : false);
    }
    // custom
    if ( element.hasAttribute('isCustomOnly') && element.getAttribute('isCustomOnly') === 'true' ) {
      if ( label ) {
        label += ' & C';
        title += ' & Custom';
      } else {
        label += 'C';
        title += 'Custom';
      }
    }
    
    // dimensions
    if ( FiltersContextref.getDimensions(element.getAttribute('contextref')).length > 0 ) {
      if ( label ) {
        label += ' & D';
        title += ' & Dimension';
      } else {
        label += 'D';
        title += 'Dimension';
      }
    }
    
    if ( label ) {
      var spanElement = document.createElement('span');
      var spanNestedElement = document.createElement('span');
      spanNestedElement.setAttribute('title', title);
      spanNestedElement.setAttribute('class', 'm-1 badge bg-dark');
      
      var spanNestedElementContent = document.createTextNode(label);
      
      spanNestedElement.appendChild(spanNestedElementContent);
      spanElement.appendChild(spanNestedElement);
      elementToReturn.appendChild(spanElement);
      return elementToReturn;
    }
    return;
  },
  
  isParentNodeHidden : function( element ) {
    if ( element && element.nodeName.toLowerCase().endsWith(':hidden') ) {
      return true;
    }
    if ( element && element.parentNode ) {
      return TaxonomiesGeneral.isParentNodeHidden(element.parentNode);
    }
    return false;
    
  },
  
  specialSort : function( unsortedArray ) {
    var hiddenTaxonomies = [ ];
    var returnedArray = unsortedArray.map(function( current, index ) {
      if ( current.hasAttribute('isAdditionalItemsOnly') && current.getAttribute('isAdditionalItemsOnly') === 'true' ) {
        hiddenTaxonomies.push(current.getAttribute('id'));
      } else {
        return current ? current.getAttribute('id') : null;
      }
      
    }).filter(function( element ) {
      return element;
    }).concat(hiddenTaxonomies);
    
    return returnedArray;
  }

};
