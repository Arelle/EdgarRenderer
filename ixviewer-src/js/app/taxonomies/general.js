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
    
    element.setAttribute('data-toggle', 'popover');
    element.setAttribute('data-title', terseLabelOnly);
    
    var popoverHtml = '';
    popoverHtml += '<div class="popover" role="tooltip">';
    popoverHtml += '<div class="arrow"></div>';
    popoverHtml += '<h3 class="popover-header text-center text-popover-clamp-1 py-0"></h3>';
    popoverHtml += '<div class="text-center text-popover-clamp-2 py-1">' + FiltersValue.getFormattedValue(element)
        + '</div>';
    popoverHtml += '<div class="text-center p-2">' + FiltersContextref.getPeriod(element.getAttribute('contextref'))
        + '</div>';
    popoverHtml += '<p class="text-center p-2">Click for additional information.</p>';
    popoverHtml += '</div>';
    
    $(element).popover({
      'placement' : 'auto',
      'template' : popoverHtml,
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
    } else {
      return element;
    }
    
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
      
    } else if ( element.getAttribute('id') ) {
      
      elementToScrollTo = document.getElementById('dynamic-xbrl-form').querySelector('#' + element.getAttribute('id'));
      
      menuElementToScrollTo = document.querySelector('[data-id="' + element.getAttribute('id') + '"]');
      
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
    var element = TaxonomiesGeneral.getTaxonomyById(elementID);
    element = (element instanceof Array) ? element[0] : element;
    
    if ( element.getAttribute('id') ) {
      template += '<a selected-taxonomy="'
          + element.getAttribute('selected-taxonomy')
          + '" contextref="'
          + element.getAttribute('contextref')
          + '" name="'
          + element.getAttribute('name')
          + '" data-id="'
          + element.getAttribute('id')
          + '" onclick="TaxonomiesGeneral.goTo(event, this, '
          + modalAction
          + ');"'
          + element.getAttribute('id')
          + '" onkeyup="TaxonomiesGeneral.goTo(event, this, '
          + modalAction
          + ');"'
          + 'class="click list-group-item list-group-item-action flex-column align-items-start px-2 py-2 w-100" tabindex="13">';
      
    } else {
      
      template += '<a selected-taxonomy="' + element.getAttribute('selected-taxonomy') + '" contextref="'
          + element.getAttribute('contextref') + '" name="' + element.getAttribute('name')
          + '" onclick="TaxonomiesGeneral.goTo(event, this, ' + modalAction
          + ');" class="click list-group-item list-group-item-action flex-column align-items-start px-2 py-2">';
    }
    template += '<div class="d-flex w-100 justify-content-between">';
    template += '<p class="mb-1 font-weight-bold">' + (FiltersName.getLabel(element.getAttribute('name')) || '')
        + '</p>';
    template += TaxonomiesGeneral.getTaxonomyBadge(element) || '';
    template += '</div>';
    template += '<p class="mb-1">' + FiltersContextref.getPeriod(element.getAttribute('contextref')) + '</p>';
    // template += '<hr>';
    template += '<small class="mb-1">' + FiltersValue.getFormattedValue(element, false) + '</small>';
    template += '</a>';
    
    return template;
  },
  
  getTaxonomyBadge : function( element ) {
    
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
      return '<span><span title="' + title + '" class="m-1 badge badge-dark">' + label + '</span></span>';
    }
    return;
  },
  
  isParentNodeHidden : function( element ) {
    if ( element && element.nodeName.toLowerCase().endsWith(':hidden') ) {
      return true;
    }
    if ( element && element.parentNode ) {
      return TaxonomiesGeneral.isParentNodeHidden(element.parentNode);
    } else {
      return false;
    }
    
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
