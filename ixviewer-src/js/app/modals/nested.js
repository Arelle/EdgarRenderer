/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var ModalsNested = {
  
  currentSlide : 0,
  
  carouselInformation : [ {
    'dialog-title' : 'Attributes'
  }, {
    'dialog-title' : 'Labels'
  }, {
    'dialog-title' : 'References'
  }, {
    'dialog-title' : 'Calculation'
  } ],
  
  getAllElementIDs : [ ],
  
  dynamicallyFindContinuedTaxonomies : function( element, elementsInArray ) {
    
    if ( element ) {
      elementsInArray.push(element);
    }
    if ( element && element.hasAttribute('continuedat') ) {
      var continuedElement = document.getElementById('dynamic-xbrl-form').querySelector(
          '[id="' + element.getAttribute('continuedat') + '"]');
      return ModalsNested.dynamicallyFindContinuedTaxonomies(continuedElement, elementsInArray);
      
    }
    return elementsInArray;
    
  },
  
  recursielyFindAllNestedTaxonomies : function( element, firstIteration ) {
    firstIteration = firstIteration || false;
    
    if ( firstIteration ) {
      
      if ( (element.hasAttribute('continued-taxonomy') && element.getAttribute('continued-taxonomy') === 'true')
          || (element.tagName.split(':')[1].toLowerCase() === 'continuation') ) {
        ModalsNested.recursielyFindAllNestedTaxonomies(TaxonomiesContinuedAt.findContinuedMainTaxonomy(element));
        
      } else if ( element.hasAttribute('text-block-taxonomy') && element.getAttribute('text-block-taxonomy') === 'true' ) {
        ModalsNested.getAllElementIDs.push({
          id : element.getAttribute('id'),
          'text-block' : true
        });
      } else {
        ModalsNested.getAllElementIDs.push({
          id : element.getAttribute('id'),
          'text-block' : false
        });
      }
    }
    
    var nestedTaxonomies = element.querySelectorAll('[contextref]');
    var nestedTaxonomiesArray = Array.prototype.slice.call(nestedTaxonomies);
    
    if ( nestedTaxonomiesArray.length ) {
      nestedTaxonomiesArray.forEach(function( current ) {
        ModalsNested.recursielyFindAllNestedTaxonomies(current, true);
      });
      
    } else {
      
      if ( element.hasAttribute('continued-main-taxonomy')
          && element.getAttribute('continued-main-taxonomy') === 'true' ) {
        // we are at the beginning of the continued fact
        var uniqueElement = ModalsNested.getAllElementIDs.filter(function( current ) {
          return current.id === element.getAttribute('id');
        });
        if ( uniqueElement.length === 0 ) {
          
          // unique id, so we can add it to our big array of nested ids
          ModalsNested.getAllElementIDs.push({
            id : element.getAttribute('id'),
            'text-block' : element.hasAttribute('text-block-taxonomy')
          });
          
          var tempContinuedElements = ModalsNested.dynamicallyFindContinuedTaxonomies(element, [ ]);
          tempContinuedElements.shift(element);
          tempContinuedElements.forEach(function( current, index, array ) {
            ModalsNested.recursielyFindAllNestedTaxonomies(current);
          });
          
        }
        
      } else if ( element.hasAttribute('continued-taxonomy') && element.getAttribute('continued-taxonomy') === 'true'
          || (element.tagName.split(':')[1].toLowerCase() === 'continuation') ) {
        // we ignore the continued facts, as they are already accounted for
      } else {
        var uniqueElement = ModalsNested.getAllElementIDs.filter(function( current ) {
          return current.id === element.getAttribute('id');
        });
        if ( uniqueElement.length === 0 ) {
          ModalsNested.getAllElementIDs.push({
            id : element.getAttribute('id'),
            'text-block' : element.hasAttribute('text-block-taxonomy')
          });
        }
      }
    }
  },
  
  getElementById : function( id ) {
    var element = document.getElementById('dynamic-xbrl-form').querySelector('[id="' + id + '"]');
    if ( element && element.hasAttribute('continued-main-taxonomy')
        && element.getAttribute('continued-main-taxonomy') === 'true' ) {
      return ModalsNested.dynamicallyFindContinuedTaxonomies(element, [ ]);
    }
    return element;
    
  },
  
  createLabelCarousel : function( ) {
    var titleCarousel = document.createDocumentFragment();
    
    document.getElementById('nested-page').innerText = 1;
    document.getElementById('nested-count').innerText = ModalsNested.getAllElementIDs.length;
    
    ModalsNested.getAllElementIDs.forEach(function( current, index ) {
      
      var element = ModalsNested.getElementById(current.id);
      var nestedTaxonomyName;
      if ( element instanceof Array ) {
        
        nestedTaxonomyName = FiltersName.getLabel(element[0].getAttribute([ 'name' ]), true);
        
      } else {
        
        nestedTaxonomyName = FiltersName.getLabel(element.getAttribute([ 'name' ]), true);
        
      }
      var divTitleElement = document.createElement('div');
      divTitleElement.setAttribute('class', 'reboot carousel-item');
      
      var divTitleNestedElement = document.createElement('div');
      divTitleNestedElement.setAttribute('class', 'reboot carousel-content');
      
      var pTitleElement = document.createElement('p');
      pTitleElement.setAttribute('class', 'reboot text-center font-weight-bold');
      var pTitleContent = document.createTextNode(nestedTaxonomyName);
      
      pTitleElement.appendChild(pTitleContent);
      divTitleNestedElement.appendChild(pTitleElement);
      divTitleElement.appendChild(divTitleNestedElement);
      titleCarousel.appendChild(divTitleElement);
      
    });
    
    document.getElementById('modal-taxonomy-nested-label-carousel').appendChild(titleCarousel);
    
    document.getElementById('modal-taxonomy-nested-label-carousel').querySelector('.carousel-item').classList
        .add('active');
    
  },
  
  createContentCarousel : function( index ) {
    
    var element = ModalsNested.getElementById((ModalsNested.getAllElementIDs[index].id));
    ModalsNested.carouselData(element, Taxonomies.isElementContinued(element));
  },
  
  clickEvent : function( event, element ) {
    event.preventDefault();
    event.stopPropagation();
    
    Modals.close(event, element);
    
    ModalsNested.getAllElementIDs = [ ];
    
    document.getElementById('taxonomy-nested-modal').classList.remove('d-none');
    
    document.getElementById('modal-taxonomy-nested-label-carousel').innerHTML = '';
    
    ModalsNested.recursielyFindAllNestedTaxonomies(element, true);
    
    ModalsNested.getAllElementIDs.sort(function( a, b ) {
      (a['text-block'] > b['text-block']) ? 1 : -1;
    });
    
    ModalsNested.createLabelCarousel();
    
    ModalsNested.createContentCarousel(0);
    
    TaxonomiesGeneral.selectedTaxonomy(ModalsNested.getElementById(ModalsNested.getAllElementIDs[0].id));
    
    document.getElementById('nested-taxonomy-modal-jump').setAttribute('data-id', ModalsNested.getAllElementIDs[0].id);
    
    Modals.renderCarouselIndicators('modal-taxonomy-nested-content-carousel',
        'taxonomy-nested-modal-carousel-indicators', ModalsNested.carouselInformation);
    
    document.getElementById('taxonomy-nested-modal-drag').focus();
    // we add draggable
    Modals.initDrag(document.getElementById('taxonomy-nested-modal-drag'));
    
    $('#modal-nested-fact-labels').on(
        'slide.bs.carousel',
        function( event ) {
          
          ModalsNested.currentSlide = 0;
          // we add something...
          document.getElementById('nested-taxonomy-modal-jump').setAttribute('data-id',
              ModalsNested.getAllElementIDs[event['to']].id);
          
          // we hide the copy & paste area
          document.getElementById('taxonomy-nested-copy-paste').classList.add('d-none');
          
          var selectedElement = ModalsNested.getElementById(ModalsNested.getAllElementIDs[event['to']].id);
          
          TaxonomiesGeneral.selectedTaxonomy(selectedElement);
          
          if ( selectedElement instanceof Array ) {
            selectedElement = selectedElement[0];
          }
          
          selectedElement.scrollIntoView({
            'block' : Constants.scrollPosition
          });
          
          $('#modal-taxonomy-nested-content-carousel').carousel(0);
          
          document.getElementById('nested-page').innerText = (event['to'] + 1);
          ModalsNested.createContentCarousel(event['to']);
        });
    
    $('#modal-taxonomy-nested-content-carousel').on(
        'slide.bs.carousel',
        function( event ) {
          
          ModalsNested.currentSlide = event['to'] + 1;
          var previousActiveIndicator = event['from'];
          var newActiveIndicator = event['to'];
          document.getElementById('taxonomy-nested-modal-carousel-indicators').querySelector(
              '[data-slide-to="' + previousActiveIndicator + '"]').classList.remove('active');
          document.getElementById('taxonomy-nested-modal-carousel-indicators').querySelector(
              '[data-slide-to="' + newActiveIndicator + '"]').classList.add('active');
        });
    
  },
  
  createCarousel : function( element, index, isContinued ) {
    
    var elementsToReturn = document.createDocumentFragment();
    
    var divElement = document.createElement('div');
    divElement.setAttribute('id', 'taxonomy-nested-modal-carousel-' + index);
    divElement.setAttribute('class', 'reboot carousel');
    divElement.setAttribute('data-interval', false);
    divElement.setAttribute('data-keyboard', true);
    
    var divNestedElement = document.createElement('div');
    divNestedElement.setAttribute('class', 'reboot carousel-inner');
    divNestedElement.setAttribute('data-interval', false);
    divNestedElement.setAttribute('data-keyboard', true);
    
    if ( isContinued ) {
      divNestedElement.appendChild(ModalsContinuedAt.carouselData(element, true));
      divElement.appendChild(divNestedElement);
      
      elementsToReturn.appendChild(divElement);
      return elementsToReturn;
      
    }
    
    divNestedElement.appendChild(ModalsCommon.carouselData(element));
    divElement.appendChild(divNestedElement);
    
    elementsToReturn.appendChild(divElement);
    
    return elementsToReturn;
    
  },
  
  focusOnContent : function( ) {
    document.getElementById('modal-taxonomy-nested-content-carousel-page-' + ModalsNested.currentSlide).focus();
  },
  
  keyboardEvents : function( event ) {
    
    var key = event.keyCode ? event.keyCode : event.which;
    
    if ( key === 49 || key === 97 ) {
      $('#taxonomy-modal-carousel').carousel(0);
      ModalsNested.focusOnContent();
      return false;
    }
    if ( key === 50 || key === 98 ) {
      $('#taxonomy-modal-carousel').carousel(1);
      ModalsNested.focusOnContent();
      return false;
    }
    if ( key === 51 || key === 99 ) {
      $('#taxonomy-modal-carousel').carousel(2);
      ModalsNested.focusOnContent();
      return false;
    }
    if ( key === 52 || key === 100 ) {
      $('#taxonomy-modal-carousel').carousel(3);
      ModalsNested.focusOnContent();
      return false;
    }
    if ( key === 37 ) {
      $('#taxonomy-modal-carousel').carousel('prev');
      ModalsNested.focusOnContent();
      return false;
    }
    if ( key === 39 ) {
      $('#taxonomy-modal-carousel').carousel('next');
      ModalsNested.focusOnContent();
      return false;
    }
    
  },
  
  carouselData : function( element, isContinued ) {
    
    TaxonomyPages.firstPage(element, function( page1Html ) {
      while (document.getElementById('modal-taxonomy-nested-content-carousel-page-1').firstChild) {
        document.getElementById('modal-taxonomy-nested-content-carousel-page-1').firstChild.remove();
      }
      
      document.getElementById('modal-taxonomy-nested-content-carousel-page-1').appendChild(page1Html);
      
      TaxonomyPages.secondPage(element, function( page2Html ) {
        
        while (document.getElementById('modal-taxonomy-nested-content-carousel-page-2').firstChild) {
          document.getElementById('modal-taxonomy-nested-content-carousel-page-2').firstChild.remove();
        }
        
        document.getElementById('modal-taxonomy-nested-content-carousel-page-2').appendChild(page2Html);
        
        TaxonomyPages.thirdPage(element, function( page3Html ) {
          
          while (document.getElementById('modal-taxonomy-nested-content-carousel-page-3').firstChild) {
            document.getElementById('modal-taxonomy-nested-content-carousel-page-3').firstChild.remove();
          }
          
          document.getElementById('modal-taxonomy-nested-content-carousel-page-3').appendChild(page3Html);
          
          TaxonomyPages.fourthPage(element, function( page4Html ) {
            
            while (document.getElementById('modal-taxonomy-nested-content-carousel-page-4').firstChild) {
              document.getElementById('modal-taxonomy-nested-content-carousel-page-4').firstChild.remove();
            }
            
            document.getElementById('modal-taxonomy-nested-content-carousel-page-4').appendChild(page4Html);
            
          });
        });
      });
    });
  },
  
  dynamicallyAddControls : function( ) {
    Modals.renderCarouselIndicators('modal-taxonomy-nested-content-carousel',
        'taxonomy-nested-modal-carousel-indicators', ModalsNested.carouselInformation);
    
  }
};
