/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var ModalsNested = {
  
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
      
    } else {
      return elementsInArray

    }
  },
  
  recursielyFindAllNestedTaxonomies : function( element, firstIteration ) {
    firstIteration = firstIteration || false;
    
    if ( firstIteration ) {
      
      if ( (element.hasAttribute('continued-taxonomy') && element.getAttribute('continued-taxonomy') === 'true')
          || (element.tagName.split(':')[1].toLowerCase() === 'continuation') ) {
        
        ModalsNested.recursielyFindAllNestedTaxonomies(TaxonomiesContinuedAt.findContinuedMainTaxonomy(element));
      }
    }
    
    var nestedTaxonomies = element.querySelectorAll('[contextref]');
    var nestedTaxonomiesArray = Array.prototype.slice.call(nestedTaxonomies);
    if ( nestedTaxonomiesArray.length ) {
      
      nestedTaxonomiesArray.forEach(function( current, index, array ) {
        ModalsNested.recursielyFindAllNestedTaxonomies(current);
      });
      
    } else {
      
      if ( element.hasAttribute('continued-main-taxonomy')
          && element.getAttribute('continued-main-taxonomy') === 'true' ) {
        // we are at the beginning of the continued fact
        
        if ( ModalsNested.getAllElementIDs.indexOf(element.getAttribute('id')) === -1 ) {
          // unique id, so we can add it to our big array of nested ids
          ModalsNested.getAllElementIDs.push(element.getAttribute('id'));
          
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
        
        if ( ModalsNested.getAllElementIDs.indexOf(element.getAttribute('id')) === -1 ) {
          ModalsNested.getAllElementIDs.push(element.getAttribute('id'));
        }
        
      }
      
    }
  },
  
  getElementById : function( id ) {
    var element = document.getElementById('dynamic-xbrl-form').querySelector('[id="' + id + '"]');
    if ( element.hasAttribute('continued-main-taxonomy') && element.getAttribute('continued-main-taxonomy') === 'true' ) {
      return ModalsNested.dynamicallyFindContinuedTaxonomies(element, [ ]);
    } else {
      return element;
    }
    
  },
  
  createLabelCarousel : function( ) {
    var titleCarousel = '';
    var contents = '';
    
    document.getElementById('nested-page').innerText = 1;
    document.getElementById('nested-count').innerText = ModalsNested.getAllElementIDs.length;
    
    ModalsNested.getAllElementIDs
        .forEach(function( current, index ) {
          var element = ModalsNested.getElementById(current);
          
          if ( element instanceof Array ) {
            var nestedTaxonomyName = FiltersName.getLabel(element[0].getAttribute([ 'name' ]));
            
            titleCarousel += '<div class="carousel-item"><div class="carousel-content"><p class="text-center font-weight-bold">'
                + nestedTaxonomyName + '</p></div></div>';
            
            contents += '<div class="tab-pane fade" id="nested-taxonomy-' + index + '" role="tabpanel">'
                + ModalsNested.createCarousel(element, index, true) + '</div>';
            
          } else {
            var nestedTaxonomyName = FiltersName.getLabel(element.getAttribute([ 'name' ]));
            
            titleCarousel += '<div class="carousel-item"><div class="carousel-content"><p class="text-center font-weight-bold">'
                + nestedTaxonomyName + '</p></div></div>';
            
            contents += '<div class="tab-pane fade" id="nested-taxonomy-' + index + '" role="tabpanel">'
                + ModalsNested.createCarousel(element, index, false) + '</div>';
          }
        });
    
    document.getElementById('modal-taxonomy-nested-label-carousel').innerHTML += titleCarousel;
    
    document.getElementById('modal-taxonomy-nested-label-carousel').querySelector('.carousel-item').classList
        .add('active');
    
  },
  
  createContentCarousel : function( index ) {
    
    var element = ModalsNested.getElementById((ModalsNested.getAllElementIDs[index]));
    
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
    
    ModalsNested.createLabelCarousel();
    
    ModalsNested.createContentCarousel(0);
    
    TaxonomiesGeneral.selectedTaxonomy(ModalsNested.getElementById(ModalsNested.getAllElementIDs[0]));
    
    document.getElementById('nested-taxonomy-modal-jump').setAttribute('data-id', ModalsNested.getAllElementIDs[0]);
    
    Modals.renderCarouselIndicators('modal-taxonomy-nested-content-carousel',
        'taxonomy-nested-modal-carousel-indicators', ModalsNested.carouselInformation);
    
    // we add draggable
    Modals.initDrag(document.getElementById('taxonomy-nested-modal-drag'));
    
    $('#modal-nested-fact-labels').on(
        'slide.bs.carousel',
        function( event ) {
          
          // we add something...
          document.getElementById('nested-taxonomy-modal-jump').setAttribute('data-id',
              ModalsNested.getAllElementIDs[event['to']]);
          
          // we hide the copy & paste area
          document.getElementById('taxonomy-nested-copy-paste').classList.add('d-none');
          
          var selectedElement = ModalsNested.getElementById(ModalsNested.getAllElementIDs[event['to']]);
          
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
          
          var previousActiveIndicator = event['from'];
          var newActiveIndicator = event['to'];
          document.getElementById('taxonomy-nested-modal-carousel-indicators').querySelector(
              '[data-slide-to="' + previousActiveIndicator + '"]').classList.remove('active');
          document.getElementById('taxonomy-nested-modal-carousel-indicators').querySelector(
              '[data-slide-to="' + newActiveIndicator + '"]').classList.add('active');
        });
    
  },
  
  createCarousel : function( element, index, isContinued ) {
    
    if ( isContinued ) {
      return '<div id="taxonomy-nested-modal-carousel-' + index
          + '" class="carousel" data-interval="false" data-keyboard="true"><div class="carousel-inner">'
          + ModalsContinuedAt.carouselData(element, true) + '</div></div>';
    } else {
      return '<div id="taxonomy-nested-modal-carousel-' + index
          + '" class="carousel" data-interval="false" data-keyboard="true"><div class="carousel-inner">'
          + ModalsCommon.carouselData(element, false) + '</div></div>';
      
    }
  },
  
  keyboardEvents : function( event ) {
    
    var key = event.keyCode ? event.keyCode : event.which;
    
    if ( key === 49 || key === 97 ) {
      $('#taxonomy-modal-carousel').carousel(0);
      return false;
    }
    if ( key === 50 || key === 98 ) {
      $('#taxonomy-modal-carousel').carousel(1);
      return false;
    }
    if ( key === 51 || key === 99 ) {
      $('#taxonomy-modal-carousel').carousel(2);
      return false;
    }
    if ( key === 52 || key === 100 ) {
      $('#taxonomy-modal-carousel').carousel(3);
      return false;
    }
    if ( key === 37 ) {
      $('#taxonomy-modal-carousel').carousel('prev');
      return false;
    }
    if ( key === 39 ) {
      $('#taxonomy-modal-carousel').carousel('next');
      return false;
    }
    
  },
  
  carouselData : function( element, isContinued ) {
    
    TaxonomyPages.firstPage(element, function( page1Html ) {
      
      page1Html = page1Html || 'No Data.';
      document.getElementById('modal-taxonomy-nested-content-carousel-page-1').innerHTML = page1Html;
      TaxonomyPages.secondPage(element, function( page2Html ) {
        
        page2Html = page2Html || 'No Data.';
        document.getElementById('modal-taxonomy-nested-content-carousel-page-2').innerHTML = page2Html;
        
        TaxonomyPages.thirdPage(element, function( page3Html ) {
          
          page3Html = page3Html || 'No Data.';
          document.getElementById('modal-taxonomy-nested-content-carousel-page-3').innerHTML = page3Html;
          
          TaxonomyPages.fourthPage(element, function( page4Html ) {
            
            page4Html = page4Html || 'No Data.';
            document.getElementById('modal-taxonomy-nested-content-carousel-page-4').innerHTML = page4Html;
            
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
