/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var ModalsCommon = {
  
  carouselInformation : [ {
    'dialog-title' : 'Attributes'
  }, {
    'dialog-title' : 'Labels'
  }, {
    'dialog-title' : 'References'
  }, {
    'dialog-title' : 'Calculation'
  } ],
  
  getAttributes : null,
  
  clickEvent : function( event, element ) {
    if ( event.keyCode && !(event.keyCode === 13 || event.keyCode === 32) ) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    Modals.close(event, element);
    
    document.getElementById('taxonomy-modal').classList.remove('d-none');
    
    TaxonomiesGeneral.selectedTaxonomy(element);
    
    document.getElementById('taxonomy-modal-drag').focus();
    // we add draggable
    Modals.initDrag(document.getElementById('taxonomy-modal-drag'));
    
    ModalsCommon.carouselData(element);
    
    document.getElementById('taxonomy-modal-title').innerText = ModalsCommon.carouselInformation[0]['dialog-title'];
    
    document.getElementById('taxonomy-modal-subtitle').innerHTML = FiltersName.getLabel(element.getAttribute('name'));
    
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
              document.getElementById('taxonomy-modal-title').innerText = ModalsCommon.carouselInformation[event['to']]['dialog-title'];
            });
    
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
  
  carouselData : function( element, returnString ) {
    returnString = returnString || false;
    if ( !returnString ) {
      Modals.renderCarouselIndicators('taxonomy-modal-carousel', 'taxonomy-modal-carousel-indicators',
          ModalsContinuedAt.carouselInformation);
    }

    // Because of the way this code is architected, we must assume `pageXHtml` variables are safe.
    // I'm not sure where they're generated, but if they are unsafe HTML constructions then this
    // function will produce vulnerable code, and cannot be made safe without breaking functionality

    var stringToReturn = '';
    TaxonomyPages
        .firstPage(
            element,
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
                      element,
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
                                element,
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
                                          element,
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
    if ( returnString ) {
      return stringToReturn;
    }
  }

};
