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

    // Because of the way this code is architected, and HTML string must be generated.
    // As such, we create a container element, construct the DOM safely, then pull out the innerHTML.
    // Ideally we would use <template>, but this is not supported in IE 11.
    
    var containerElem = document.createElement('div');

    var popoverDiv = document.createElement('div');
    popoverDiv.className = 'popover';
    popoverDiv.setAttribute('role', 'tooltip');
    containerElem.appendChild(popoverDiv);

    var arrow = document.createElement('div');
    arrow.className = 'arrow';
    popoverDiv.appendChild(arrow);

    // This header is empty. Perhaps it is being used as an ersatz-spacer?
    var popoverHeader = document.createElement('h3');
    popoverHeader.className = 'popover-header text-center text-popover-clamp-1 py-0';
    popoverDiv.appendChild(popoverHeader);

    var firstInnerDiv = document.createElement('div');
    firstInnerDiv.className = 'text-center text-popover-clamp-2 py-1';
    firstInnerDiv.innerHTML = FiltersValue.getFormattedValue(element);
    popoverDiv.appendChild(firstInnerDiv);

    var secondInnerDiv = document.createElement('div');
    secondInnerDiv.className = 'text-center p-2';
    secondInnerDiv.textContent = FiltersContextref.getPeriod(element.getAttribute('contextref'));
    popoverDiv.appendChild(secondInnerDiv);

    var innerP = document.createElement('p');
    innerP.className = 'text-center p-2';
    innerP.textContent = 'Click for additional information.';
    popoverDiv.appendChild(innerP);
    
    $(element).popover({
      'placement' : 'auto',
      'template' : containerElem.innerHTML,
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

    // Architecture requires we return an HTML string, so we construct it safely in a container and
    // return its innerHTML. Note that the original produced broken tags with unballanced quotes.
    // I've done my best to work out what the developers intended, and written that.
    var containerElem = document.createElement('div');

    var element = TaxonomiesGeneral.getTaxonomyById(elementID);
    element = (element instanceof Array) ? element[0] : element;

    var taxonomyLink = document.createElement('a');
    taxonomyLink.setAttribute('selected-taxonomy', element.getAttribute('selected-taxonomy'));
    taxonomyLink.setAttribute('contextref', element.getAttribute('contextref'));
    taxonomyLink.setAttribute('name', element.getAttribute('name'));
    taxonomyLink.setAttribute('onclick', 'TaxonomiesGeneral.goTo(event, this, ' + modalAction + ');');

    var elementId = element.getAttribute('id');
    if ( elementId ) {
      taxonomyLink.setAttribute('data-id', elementId);
      taxonomyLink.setAttribute('onkeyup','TaxonomiesGeneral.goTo(event, this, ' + modalAction + ');');
      taxonomyLink.className = 'click list-group-item list-group-item-action flex-column align-items-start px-2 py-2 w-100';
      taxonomyLink.tabIndex = 13;
    } else {
      taxonomyLink.className = 'click list-group-item list-group-item-action flex-column align-items-start px-2 py-2';
    }
    containerElem.appendChild(taxonomyLink);

    var containerDiv = document.createElement('div');
    containerDiv.className = 'd-flex w-100 justify-content-between';
    taxonomyLink.appendChild(containerDiv);

    var labelContent = FiltersName.getLabel(element.getAttribute('name'));
    var innerP = document.createElement('p');
    innerP.className = 'mb-1 font-weight-bold';
    if (labelContent) {
      innerP.innerHTML = labelContent;
    }
    containerDiv.appendChild(innerP);

    var badgeContent = TaxonomiesGeneral.getTaxonomyBadge(element);
    if (badgeContent) {
      var badgeNode = document.createElement('div');
      badgeNode.innerHTML = badgeContent;
      containerDiv.appendChild(badgeNode.firstChild);
    }

    var outerP = document.createElement('p');
    outerP.className = 'mb-1';
    outerP.textContent = FiltersContextref.getPeriod(element.getAttribute('contextref'));
    taxonomyLink.appendChild(outerP);

    var outerSmall = document.createElement('small');
    outerSmall.className = 'mb-1';
    outerSmall.innerHTML = FiltersValue.getFormattedValue(element, false);
    taxonomyLink.appendChild(outerSmall);

    return containerElem.innerHTML;
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
      // `title` and `label` are hard-coded values and are thus safe.
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
