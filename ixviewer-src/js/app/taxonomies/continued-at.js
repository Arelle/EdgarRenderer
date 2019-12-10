/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var TaxonomiesContinuedAt = {
  
  addContinuedAtFunctionality : function( callback ) {
    
    var foundContinuedAtTotalElements = document.getElementById('dynamic-xbrl-form').querySelectorAll(
        '[continuedat], ' + Constants.getHTMLPrefix + '\\:continuation');
    
    var foundContinuedAtTotalElementsArray = Array.prototype.slice.call(foundContinuedAtTotalElements);
    
    var continuedAtParentIndex = 0;
    var order = 0;
    foundContinuedAtTotalElementsArray.forEach(function( current, index ) {
      if ( current.getAttribute('contextref') ) {
        // these are the parents
        current.setAttribute('continued-at-taxonomy', continuedAtParentIndex);
        current.setAttribute('continued-at-order', order);
        current.removeAttribute('enabled-taxonomy');
        current.setAttribute('continued-taxonomy', true);
        TaxonomiesContinuedAt.iterateDomForNestedContinuedAt(current.getAttribute('continuedat'),
            continuedAtParentIndex, order);
        continuedAtParentIndex++;
        order = 0;
        
      }
      current.setAttribute('onMouseEnter', 'TaxonomiesContinuedAt.enterElement(this);');
      current.setAttribute('onMouseLeave', 'TaxonomiesContinuedAt.leaveElement(this);');
      current.setAttribute('onClick',
          '(function(e) {e.preventDefault(); e.stopPropagation();})(event);ModalsContinuedAt.clickEvent(this);');
    });
    return callback();
  },
  
  addContinuedAtFunctionalityToSpecificElement : function( element ) {
    element.removeAttribute('enabled-taxonomy');
    element.setAttribute('continued-taxonomy', true);
    element.setAttribute('onMouseEnter', 'TaxonomiesContinuedAt.enterElement(this);');
    element.setAttribute('onMouseLeave', 'TaxonomiesContinuedAt.leaveElement(this);');
    element.setAttribute('onClick',
        '(function(e) {e.preventDefault(); e.stopPropagation();})(event);ModalsContinuedAt.clickEvent(this);');
  },
  
  iterateDomForNestedContinuedAt : function( idRef, parentId, order ) {
    order++;
    if ( idRef && document.getElementById(idRef) ) {
      document.getElementById(idRef).setAttribute('continued-at-taxonomy', parentId);
      document.getElementById(idRef).setAttribute('continued-at-order', order);
      if ( document.getElementById(idRef).getAttribute('continuedat') ) {
        order++;
        TaxonomiesContinuedAt.iterateDomForNestedContinuedAt(
            document.getElementById(idRef).getAttribute('continuedat'), parentId, order);
      }
    }
  },
  
  dynamicallyFindAllContinuedAtElements : function( idRef, continuedAtRef ) {
    
    var potentialSiblingOrParent = document.querySelector('[continuedat="' + idRef + '"]:not(.continued-taxonomy)');
    
    if ( potentialSiblingOrParent ) {
      potentialSiblingOrParent.classList.add('continued-taxonomy');
      TaxonomiesContinuedAt.dynamicallyFindAllContinuedAtElements(potentialSiblingOrParent.getAttribute('id'),
          potentialSiblingOrParent.getAttribute('continuedat'));
    }
    var potentialSibling = document.querySelector('#' + continuedAtRef + ':not(.continued-taxonomy)');
    
    if ( potentialSibling ) {
      potentialSibling.classList.add('continued-taxonomy');
      TaxonomiesContinuedAt.dynamicallyFindAllContinuedAtElements(potentialSibling.getAttribute('id'), potentialSibling
          .getAttribute('continuedat'));
    }
  },
  
  dynamicallyFindContextRefForHover : function( element, hover, parentElement ) {
    
    if ( element && element && element.hasAttribute('contextref') ) {
      TaxonomiesContinuedAt.updateHoverEffectOnAllChildren(element, hover);
    } else if ( element && element.hasAttribute('id') ) {
      TaxonomiesContinuedAt.dynamicallyFindContextRefForHover(document.getElementById('dynamic-xbrl-form')
          .querySelector('[continuedat="' + element.getAttribute('id') + '"]'), hover, parentElement);
      
    } else {
      ErrorsMinor.continuedAt();
      TaxonomiesContinuedAt.removeAttributes(parentElement);
    }
  },
  
  updateHoverEffectOnAllChildren : function( element, hover ) {
    // we always start at the top-level element
    
    if ( hover === true && (element && element.hasAttribute('continued-main-taxonomy')) ) {
      TaxonomiesGeneral.addPopover(element, true);
    }
    if ( element ) {
      element.setAttribute('hover-taxonomy', hover);
      
      if ( element.hasAttribute('continuedat') ) {
        TaxonomiesContinuedAt.updateHoverEffectOnAllChildren(document.getElementById('dynamic-xbrl-form')
            .querySelector('[id="' + element.getAttribute('continuedat') + '"]'), hover);
      }
    }
  },
  
  findContinuedMainTaxonomy : function( element ) {
    if ( element.hasAttribute('continued-main-taxonomy') && element.getAttribute('continued-main-taxonomy') === 'true' ) {
      return element;
    }
    return TaxonomiesContinuedAt.findContinuedMainTaxonomy(document.getElementById('dynamic-xbrl-form').querySelector(
        '[continuedat="' + element.getAttribute('id') + '"]'));
    
  },
  // element.hasAttribute('continued-main-taxonomy')
  enterElement : function( event, element ) {
    event.stopPropagation();
    event.preventDefault();
    TaxonomiesContinuedAt.dynamicallyFindContextRefForHover(element, true, element);
  },
  
  removeAttributes : function( element ) {
    element.removeAttribute('onclick');
    element.removeAttribute('onmouseenter');
    element.removeAttribute('onmouseleave');
    element.removeAttribute('enabled-taxonomy');
    element.removeAttribute('highlight-taxonomy');
    element.removeAttribute('selected-taxonomy');
    element.removeAttribute('hover-taxonomy');
  }

};
