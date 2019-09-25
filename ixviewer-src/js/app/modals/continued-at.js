/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var ModalsContinuedAt = {
  
  carouselInformation : [ {
    'dialog-title' : 'Attributes'
  }, {
    'dialog-title' : 'Labels'
  }, {
    'dialog-title' : 'References'
  }, {
    'dialog-title' : 'Calculation'
  } ],
  
  getAllElements : [ ],
  
  dynamicallyFindContextRefForModal : function( element ) {
    if ( element && element.hasAttribute('contextref') ) {
      ModalsContinuedAt.setAllElements(element);
    } else if ( element && element.hasAttribute('id') ) {
      
      ModalsContinuedAt.dynamicallyFindContextRefForModal(document.getElementById('dynamic-xbrl-form').querySelector(
          '[continuedat="' + element.getAttribute('id') + '"]'));
    } else {
      ErrorsMinor.unknownError();
    }
  },
  
  setAllElements : function( element ) {
    // we always start at the top-level element
    if ( element ) {
      element.setAttribute('selected-taxonomy', true);
      ModalsContinuedAt.getAllElements.push(element);
      
      if ( element.hasAttribute('continuedat') ) {
        
        ModalsContinuedAt.setAllElements(document.getElementById('dynamic-xbrl-form').querySelector(
            '[id="' + element.getAttribute('continuedat') + '"]'));
      }
    }
  },
  
  clickEvent : function( event, element ) {
    
    if ( event.keyCode && !(event.keyCode === 13 || event.keyCode === 32) ) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    ModalsContinuedAt.getAllElements = [ ];
    
    Modals.close(event, element);
    
    document.getElementById('taxonomy-modal').classList.remove('d-none');
    
    ModalsContinuedAt.dynamicallyFindContextRefForModal(element);
    
    if ( ModalsContinuedAt.getAllElements[0] && ModalsContinuedAt.getAllElements[0].getAttribute('id') ) {
      
      TaxonomiesGeneral.selectedTaxonomy(ModalsContinuedAt.getAllElements);
      
      document.getElementById('taxonomy-modal-drag').focus();
      // we add draggable
      Modals.initDrag(document.getElementById('taxonomy-modal-drag'));
      ModalsContinuedAt.carouselData();
      
      document.getElementById('taxonomy-modal-title').innerText = ModalsContinuedAt.carouselInformation[0]['dialog-title'];
      
      document.getElementById('taxonomy-modal-subtitle').innerHTML = FiltersName
          .getLabel(ModalsContinuedAt.getAllElements[0].getAttribute('name'));
      
      $('#taxonomy-modal-carousel').carousel(0);
      
      window.addEventListener('keyup', ModalsCommon.keyboardEvents);
      
      $('#taxonomy-modal-carousel')
          .on(
              'slide.bs.carousel',
              function( event ) {
                var previousActiveIndicator = event['from'];
                var newActiveIndicator = event['to'];
                document.getElementById('taxonomy-modal-carousel-indicators').querySelector(
                    '[data-slide-to="' + previousActiveIndicator + '"]').classList.remove('active');
                document.getElementById('taxonomy-modal-carousel-indicators').querySelector(
                    '[data-slide-to="' + newActiveIndicator + '"]').classList.add('active');
                document.getElementById('taxonomy-modal-title').innerText = ModalsContinuedAt.carouselInformation[event['to']]['dialog-title'];
              });
    }
  },
  
  carouselData : function( element, returnString ) {
    
    returnString = returnString || false;
    if ( !returnString ) {
      Modals.renderCarouselIndicators('taxonomy-modal-carousel', 'taxonomy-modal-carousel-indicators',
          ModalsContinuedAt.carouselInformation);
    } else {
      var stringToReturn = '';
      ModalsContinuedAt.getAllElements = element;
    }
    
    TaxonomyPages
        .firstPage(
            ModalsContinuedAt.getAllElements,
            function( page1Html ) {
              page1Html = page1Html || 'No Data.';
              
              if ( returnString ) {
                stringToReturn += '<div class="carousel-item table-responsive active"><table class="table table-striped table-sm">'
                    + page1Html + '</table></div>';
              } else {
                document.getElementById('taxonomy-modal-carousel-page-1').innerHTML = page1Html;
              }
              
              TaxonomyPages
                  .secondPage(
                      ModalsContinuedAt.getAllElements[0],
                      function( page2Html ) {
                        page2Html = page2Html || 'No Data.';
                        
                        if ( returnString ) {
                          stringToReturn += '<div class="carousel-item table-responsive"><table class="table table-striped table-sm">'
                              + page2Html + '</table></div>';
                        } else {
                          document.getElementById('taxonomy-modal-carousel-page-2').innerHTML = page2Html;
                        }
                        
                        TaxonomyPages
                            .thirdPage(
                                ModalsContinuedAt.getAllElements[0],
                                function( page3Html ) {
                                  page3Html = page3Html || 'No Data.';
                                  
                                  if ( returnString ) {
                                    stringToReturn += '<div class="carousel-item table-responsive"><table class="table table-striped table-sm">'
                                        + page3Html + '</table></div>';
                                  } else {
                                    document.getElementById('taxonomy-modal-carousel-page-3').innerHTML = page3Html;
                                  }
                                  
                                  TaxonomyPages
                                      .fourthPage(
                                          ModalsContinuedAt.getAllElements[0],
                                          function( page4Html ) {
                                            page4Html = page4Html || 'No Data.';
                                            
                                            if ( returnString ) {
                                              stringToReturn += '<div class="carousel-item table-responsive"><table class="table table-striped table-sm">'
                                                  + page4Html + '</table></div>';
                                            } else {
                                              document.getElementById('taxonomy-modal-carousel-page-4').innerHTML = page4Html;
                                            }
                                            
                                          });
                                });
                      });
            });
    return stringToReturn;
    
  }

};
