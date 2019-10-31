/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var Taxonomies = {
  
  updateTaxonomyCount : function( includeHighlights, initialCountIfTrue ) {
    initialCountIfTrue = initialCountIfTrue || false;
    var taxonomyTotalElements = document.querySelectorAll('.taxonomy-total-count');
    var taxonomyTotalElementsArray = Array.prototype.slice.call(taxonomyTotalElements);
    
    var foundTaxonomies = null;
    if ( includeHighlights ) {
      foundTaxonomies = document.getElementById('dynamic-xbrl-form').querySelectorAll(
          '[contextref][enabled-taxonomy="true"][highlight-taxonomy="true"]');
    } else {
      foundTaxonomies = document.getElementById('dynamic-xbrl-form').querySelectorAll(
          '[contextref][enabled-taxonomy="true"]');
    }
    
    var taxonomyCount = foundTaxonomies.length;
    Constants.getHtmlOverallTaxonomiesCount = taxonomyCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    taxonomyTotalElementsArray.forEach(function( current ) {
      if ( Constants.getHtmlOverallTaxonomiesCount === '0' ) {
        document.getElementById('facts-menu').setAttribute('disabled', true);
        document.getElementById('facts-menu').classList.add('disabled');
      } else {
        document.getElementById('facts-menu').removeAttribute('disabled');
        document.getElementById('facts-menu').classList.remove('disabled');
      }
      current.textContent = Constants.getHtmlOverallTaxonomiesCount;
    });
    
    if ( !initialCountIfTrue ) {
      TaxonomiesMenu.prepareForPagination();
    } else {
      
      Errors.checkPerformanceConcern(foundTaxonomies.length);
    }
    return taxonomyCount;
  },
  
  loadingTaxonomyCount : function( callback ) {
    var taxonomyTotalElements = document.querySelectorAll('.taxonomy-total-count');
    var taxonomyTotalElementsArray = Array.prototype.slice.call(taxonomyTotalElements);
    document.getElementById('facts-menu').setAttribute('disabled', true);
    taxonomyTotalElementsArray.forEach(function( current ) {
      current.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    });
    setTimeout(function( ) {
      callback();
    }, 50);
  },
  
  fixStyleString : function( input ) {
    return input.split(';').reduce(function( accumulator, currentValue ) {
      var rulePair = currentValue.split(':');
      if ( rulePair[0] && rulePair[1] ) {
        accumulator[rulePair[0].trim()] = rulePair[1].trim();
      }
      return accumulator;
    }, {});
  },
  
  updateStyleTaxonomies : function( ) {
    
    // TODO need more test cases
    var foundStyles = document.getElementById('dynamic-xbrl-form').querySelectorAll('[style*="-sec-ix-hidden"]');
    var foundStylesArray = Array.prototype.slice.call(foundStyles);
    
    foundStylesArray.forEach(function( current ) {
      var updatedStyle = Taxonomies.fixStyleString(current.getAttribute('style'));
      
      var hiddenElement = document.getElementById('dynamic-xbrl-form').querySelector(
          '[id="' + updatedStyle['-sec-ix-hidden'] + '"]');
      
      if ( hiddenElement && !hiddenElement.getAttribute('xsi:nil') ) {
        // we now create an entirely new element based on the innerHTML
        // of current, and the attributes of hiddenElement
        var newElement = '';
        
        newElement += '<' + hiddenElement.tagName.toLowerCase();
        // add all of the necessary attributes
        for ( var i = 0; i < hiddenElement.attributes.length; i++ ) {
          var attribute = hiddenElement.attributes[i];
          newElement += ' ' + attribute.name + '="' + attribute.value + '"';
        }
        
        newElement += ' isadditionalitemsonly="true"';
        
        newElement += '>';
        newElement += current.innerHTML;
        // close the tag
        newElement += '</' + hiddenElement.tagName.toLowerCase() + '>';
        
        hiddenElement.removeAttribute('contextref');
        hiddenElement.removeAttribute('name');
        
        current.innerHTML = newElement;
        
      }
      
    });
  },
  
  addEventAttributes : function( ) {
    
    Taxonomies.updateStyleTaxonomies();
    
    var foundTaxonomies = document.getElementById('dynamic-xbrl-form').querySelectorAll(
        '[contextref], [continuedat], ' + Constants.getHtmlPrefix + '\\:continuation');
    var foundTaxonomiesArray = Array.prototype.slice.call(foundTaxonomies);
    var isChrome = window.chrome;
    foundTaxonomiesArray
        .forEach(function( current, index ) {
          if ( current.tagName.toLowerCase().indexOf('continuation') === -1 && !current.hasAttribute('continuedat') ) {
            
            if ( current.hasAttribute('name') && current.getAttribute('name').toLowerCase().indexOf('textblock') >= 0 ) {
              current.setAttribute('text-block-taxonomy', true);
              
              var leftSpan = document.createElement('span');
              leftSpan.setAttribute('class', 'float-left text-block-indicator-left position-absolute');
              leftSpan.title = 'One or more textblock facts are between this symbol and the right side symbol.';
              current.parentNode.insertBefore(leftSpan, current);
              
              var rightSpan = document.createElement('span');
              rightSpan.setAttribute('class', 'float-right text-block-indicator-right position-absolute');
              rightSpan.title = 'One or more textblock facts are between this symbol and the left side symbol.';
              current.parentNode.insertBefore(rightSpan, current);
            }
            if ( current.hasAttribute('id') ) {
              current.setAttribute('data-original-id', current.getAttribute('id'))
            }
            current.setAttribute('id', 'fact-identifier-' + index);
            current.setAttribute('continued-taxonomy', false);
          } else if ( current.tagName.toLowerCase().indexOf('continuation') === -1
              && current.hasAttribute('continuedat') ) {
            
            var leftSpan = document.createElement('span');
            leftSpan.setAttribute('class', 'float-left text-block-indicator-left position-absolute');
            leftSpan.title = 'One or more textblock facts are between this symbol and the right side symbol.';
            current.parentNode.insertBefore(leftSpan, current);
            
            var rightSpan = document.createElement('span');
            rightSpan.setAttribute('class', 'float-right text-block-indicator-right position-absolute');
            rightSpan.title = 'One or more textblock facts are between this symbol and the left side symbol.';
            current.parentNode.insertBefore(rightSpan, current);
            
            current.setAttribute('continued-main-taxonomy', true);
            if ( current.hasAttribute('id') ) {
              current.setAttribute('data-original-id', current.getAttribute('id'))
            }
            current.setAttribute('id', 'fact-identifier-' + index);
          } else if ( current.tagName.toLowerCase().indexOf('continuation') >= 0 ) {
            
            current.setAttribute('continued-taxonomy', true);
            // current.classList.add('d-inherit');
          }
          
          current.setAttribute('enabled-taxonomy', true);
          current.setAttribute('highlight-taxonomy', false);
          current.setAttribute('selected-taxonomy', false);
          current.setAttribute('hover-taxonomy', false);

          current.addEventListener('click', function(e) {Taxonomies.clickEvent(e, this)});
          current.addEventListener('keyup', function(e) {Taxonomies.clickEvent(e, this)});
          current.addEventListener('mouseenter', function(e) {Taxonomies.enterElement(e, this)});
          current.addEventListener('mouseleave', function(e) {Taxonomies.leaveElement(e, this)});

          current.setAttribute('tabindex', '18');
          if ( current.hasAttribute('contextref') && isChrome && foundTaxonomiesArray.length < 7500 ) {
            Taxonomies.setFilterAttributes(current);
          } else {
            // we always want to set isAdditionalItemsOnly="boolean"
            if ( !current.hasAttribute('isAdditionalItemsOnly') ) {
              current.setAttribute('isAdditionalItemsOnly', TaxonomiesGeneral.isParentNodeHidden(current));
            }
          }
          
          // we want to wrap every fact with a common span
          var span = document.createElement('span');
          current.parentNode.insertBefore(span, current);
          span.appendChild(current);
          
        });
    Taxonomies.updateTaxonomyCount(null, true);
  },
  
  setFilterAttributes : function( element ) {
    if ( element ) {
      var elementIsCalculationsOnly = false;
      if ( Constants.getMetaCalculationsParentTags.indexOf(element.getAttribute('name').replace(':', '_')) >= 0 ) {
        if ( FiltersContextref.getDimensions(element.getAttribute('contextref')).length === 0 ) {
          elementIsCalculationsOnly = true;
        }
      }
      
      element.setAttribute('isAmountsOnly', ((element['tagName'].split(':')[1].toLowerCase() === 'nonfraction') ? true
          : false));
      
      element.setAttribute('isTextOnly', ((element['tagName'].split(':')[1].toLowerCase() === 'nonnumeric') ? true
          : false));
      
      element.setAttribute('isCalculationsOnly', elementIsCalculationsOnly);
      
      element.setAttribute('isNegativesOnly', ((element.getAttribute('sign') === '-') ? true : false));
      
      if ( !element.hasAttribute('isAdditionalItemsOnly') ) {
        element.setAttribute('isAdditionalItemsOnly', TaxonomiesGeneral.isParentNodeHidden(element));
      }
      
      element.getAttribute('name').split(':')[0].toLowerCase() === Constants.getMetaCustomPrefix;
      
      element.setAttribute('isStandardOnly',
          (element.getAttribute('name').split(':')[0].toLowerCase() !== Constants.getMetaCustomPrefix) ? true : false);
      
      element.setAttribute('isCustomOnly',
          (element.getAttribute('name').split(':')[0].toLowerCase() === Constants.getMetaCustomPrefix) ? true : false);
    }
  },
  
  isElementContinued : function( element ) {
    
    if ( element ) {
      if ( element instanceof Array ) {
        return true;
      }
      if ( element.hasAttribute('continued-taxonomy') && element.getAttribute('continued-taxonomy') === 'true' ) {
        return true;
      }
      if ( element.hasAttribute('continued-main-taxonomy')
          && element.getAttribute('continued-main-taxonomy') === 'true' ) {
        return true;
      }
    }
    return false;
  },
  
  isElementNested : function( element ) {
    ModalsNested.getAllElementIDs = [ ];
    ModalsNested.recursielyFindAllNestedTaxonomies(element, true);
    
    return (ModalsNested.getAllElementIDs.length > 1);
  },
  
  clickEvent : function( event, element ) {
    
    if ( event.keyCode && !(event.keyCode === 13 || event.keyCode === 32) ) {
      return;
    }
    
    event.stopPropagation();
    event.preventDefault();
    
    if ( Taxonomies.isElementNested(element) ) {
      
      ModalsNested.clickEvent(event, element);
      
    } else if ( Taxonomies.isElementContinued(element) ) {
      
      ModalsContinuedAt.clickEvent(event, element);
      
      if ( ModalsContinuedAt.getAllElements && ModalsContinuedAt.getAllElements[0]
          && ModalsContinuedAt.getAllElements[0].hasAttribute('id') ) {
        document.getElementById('taxonomy-modal-jump').setAttribute('data-id',
            ModalsContinuedAt.getAllElements[0].getAttribute('id'));
        
      }
      
    } else {
      if ( element && element.hasAttribute('id') ) {
        document.getElementById('taxonomy-modal-jump').setAttribute('data-id', element.getAttribute('id'));
        
      }
      ModalsCommon.clickEvent(event, element);
      if ( element && element.hasAttribute('id') ) {
        document.getElementById('taxonomy-modal-jump').setAttribute('data-id', element.getAttribute('id'));
        
      }
    }
  },
  
  enterElement : function( event, element ) {
    
    event.stopPropagation();
    event.preventDefault();
    
    Taxonomies.resetAllPopups(function( ) {
      Taxonomies.resetAllHoverAttributes();
      element.setAttribute('hover-taxonomy', true);
      if ( Taxonomies.isElementContinued(element) ) {
        if ( element.hasAttribute('continued-main-taxonomy') ) {
          Taxonomies.addPopover(element);
        }
      } else {
        Taxonomies.addPopover(element);
      }
    });
    
  },
  
  addPopover : function( element ) {
    var terseLabelOnly = FiltersName.getLabelForTitle(element.getAttribute('name')) ? FiltersName
        .getLabelForTitle(element.getAttribute('name')) : 'Not Available.';
    
    element.setAttribute('data-toggle', 'popover');
    element.setAttribute('data-title', terseLabelOnly);

    // Note: this code is *identical* to the code in taxonomies/general.js. The same comments
    // apply.
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
      'container' : 'body'
    });
    $(element).popover('show');
  },
  
  leaveElement : function( event, element ) {
    event.stopPropagation();
    event.preventDefault();
    // hide them all!
    $(element).popover('hide');
    Taxonomies.resetAllPopups(function( ) {
      Taxonomies.resetAllHoverAttributes();
    });
  },
  
  resetAllPopups : function( callback ) {
    var foundPopupClasses = document.getElementById('dynamic-xbrl-form').querySelectorAll('.popover');
    var foundPopupClassesArray = Array.prototype.slice.call(foundPopupClasses);
    foundPopupClassesArray.forEach(function( current ) {
      current.parentNode.removeChild(current);
      
    });
    
    callback();
  },
  
  resetAllHoverAttributes : function( ) {
    var foundHoverClasses = document.getElementById('dynamic-xbrl-form').querySelectorAll('[hover-taxonomy="true"]');
    
    var foundHoverClassesArray = Array.prototype.slice.call(foundHoverClasses);
    
    foundHoverClassesArray.forEach(function( current ) {
      
      current.setAttribute('hover-taxonomy', false);
    });
  }
};
