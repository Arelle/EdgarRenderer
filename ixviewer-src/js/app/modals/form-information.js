/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var ModalsFormInformation = {
  
  currentSlide : 0,
  
  carouselInformation : [ {
    'dialog-title' : 'Company and Document'
  }, {
    'dialog-title' : 'Tags'
  }, {
    'dialog-title' : 'Files'
  }, {
    'dialog-title' : 'Additional Items'
  } ],
  
  clickEvent : function( event, element ) {
    
    if ( event && event.keyCode && !(event.keyCode === 13 || event.keyCode === 32) ) {
      return;
    }
    
    Modals.close(event, element);
    
    document.getElementById('form-information-modal').classList.remove('d-none');
    
    document.getElementById('form-information-modal-drag').focus();
    
    // we add draggable
    Modals.initDrag(document.getElementById('form-information-modal-drag'));
    
    ModalsFormInformation.carouselData();
    
    document.getElementById('form-information-modal-title').innerText = ModalsFormInformation.carouselInformation[0]['dialog-title'];
    
    $('#form-information-modal-carousel').carousel(0);
    
    window.addEventListener('keyup', ModalsFormInformation.keyboardEvents);
    
    $('#form-information-modal-carousel')
        .on(
            'slide.bs.carousel',
            function( event ) {
              
              ModalsFormInformation.currentSlide = event['to'] + 1;
              var previousActiveIndicator = event['from'];
              var newActiveIndicator = event['to'];
              document.getElementById('form-information-carousel-indicators').querySelector(
                  '[data-bs-slide-to="' + previousActiveIndicator + '"]').classList.remove('active');
              document.getElementById('form-information-carousel-indicators').querySelector(
                  '[data-bs-slide-to="' + newActiveIndicator + '"]').classList.add('active');
              document.getElementById('form-information-modal-title').innerText = ModalsFormInformation.carouselInformation[event['to']]['dialog-title'];
            });
  },
  
  focusOnContent : function( ) {
    
    document.getElementById('form-information-modal-carousel-page-' + ModalsFormInformation.currentSlide).focus();
  },
  
  keyboardEvents : function( event ) {
    
    var key = event.keyCode ? event.keyCode : event.which;
    
    if ( key === 49 || key === 97 ) {
      $('#form-information-modal-carousel').carousel(0);
      ModalsFormInformation.focusOnContent();
      return false;
    }
    if ( key === 50 || key === 98 ) {
      $('#form-information-modal-carousel').carousel(1);
      ModalsFormInformation.focusOnContent();
      return false;
    }
    if ( key === 51 || key === 99 ) {
      $('#form-information-modal-carousel').carousel(2);
      ModalsFormInformation.focusOnContent();
      return false;
    }
    if ( key === 52 || key === 100 ) {
      $('#form-information-modal-carousel').carousel(3);
      ModalsFormInformation.focusOnContent();
      return false;
    }
    if ( key === 37 ) {
      $('#form-information-modal-carousel').carousel('prev');
      ModalsFormInformation.focusOnContent();
      return false;
    }
    if ( key === 39 ) {
      $('#form-information-modal-carousel').carousel('next');
      ModalsFormInformation.focusOnContent();
      return false;
    }
    
  },
  
  carouselData : function( ) {
    
    Modals.renderCarouselIndicators('form-information-modal-carousel', 'form-information-carousel-indicators',
        ModalsFormInformation.carouselInformation);
    
    // we now render one slide at a time!
    ModalsFormInformation.firstSlide(function( slide1Html ) {
      
      slide1Html = slide1Html || 'No Data.';
      document.getElementById('form-information-modal-carousel-page-1').innerHTML = slide1Html;
      ModalsFormInformation.secondSlide(function( slide2Html ) {
        
        slide2Html = slide2Html || 'No Data.';
        document.getElementById('form-information-modal-carousel-page-2').innerHTML = slide2Html;
        ModalsFormInformation.thirdSlide(function( slide3Html ) {
          
          slide3Html = slide3Html || 'No Data.';
          document.getElementById('form-information-modal-carousel-page-3').innerHTML = slide3Html;
          
          ModalsFormInformation.fourthSlide(function( slide4Html ) {
            
            slide4Html = slide4Html || 'No Data.';
            document.getElementById('form-information-modal-carousel-page-4').innerHTML = slide4Html;
          });
        });
      });
      
    });
  },
  
  firstSlide : function( callback ) {
    var possibleLabels = [
        
        {
          'label' : 'Company Name',
          'value' : document.getElementById('dynamic-xbrl-form').querySelector('[name="dei:EntityRegistrantName"]') ? document
              .getElementById('dynamic-xbrl-form').querySelector('[name="dei:EntityRegistrantName"]').textContent
              : 'Not Available.'
        },
        {
          'label' : 'Central Index Key',
          'value' : document.getElementById('dynamic-xbrl-form').querySelector('[name="dei:EntityCentralIndexKey"]') ? document
              .getElementById('dynamic-xbrl-form').querySelector('[name="dei:EntityCentralIndexKey"]').textContent
              : 'Not Available.'
        },
        {
          'label' : 'Document Type',
          'value' : document.getElementById('dynamic-xbrl-form').querySelector('[name="dei:DocumentType"]') ? document
              .getElementById('dynamic-xbrl-form').querySelector('[name="dei:DocumentType"]').textContent
              : 'Not Available.'
        },
        {
          'label' : 'Period End Date',
          'value' : document.getElementById('dynamic-xbrl-form').querySelector('[name="dei:DocumentPeriodEndDate"]') ? document
              .getElementById('dynamic-xbrl-form').querySelector('[name="dei:DocumentPeriodEndDate"]').textContent
              : 'Not Available.'
        },
        {
          'label' : 'Fiscal Year/Period Focus',
          'value' : (document.getElementById('dynamic-xbrl-form').querySelector('[name="dei:DocumentFiscalYearFocus"]') && document
              .getElementById('dynamic-xbrl-form').querySelector('[name="dei:DocumentFiscalPeriodFocus"]')) ? document
              .getElementById('dynamic-xbrl-form').querySelector('[name="dei:DocumentFiscalYearFocus"]').textContent
              + ' / '
              + document.getElementById('dynamic-xbrl-form').querySelector('[name="dei:DocumentFiscalPeriodFocus"]').textContent
              : 'Not Available.'
        },
        {
          'label' : 'Current Fiscal Year End',
          'value' : document.getElementById('dynamic-xbrl-form').querySelector('[name="dei:CurrentFiscalYearEndDate"]') ? document
              .getElementById('dynamic-xbrl-form').querySelector('[name="dei:CurrentFiscalYearEndDate"]').textContent
              : 'Not Available.'
        },
        {
          'label' : 'Amendment/Description',
          'value' : document.getElementById('dynamic-xbrl-form').querySelector('[name="dei:AmendmentFlag"]') ? document
              .getElementById('dynamic-xbrl-form').querySelector('[name="dei:AmendmentFlag"]').textContent
              : 'Not Available.'
        } ];
    
    var table = document.createElement('table');
    possibleLabels.forEach(function( current, index, array ) {
      if ( current['value'] ) {
        var tr = document.createElement('tr');
        var th = document.createElement('th');
        var td = document.createElement('td');
        th.textContent = current['label'];
        td.setAttribute('data-name', current['label']);
        td.textContent = current['value'];
        tr.appendChild(th);
        tr.appendChild(td);
        table.appendChild(tr);
      }
    });
    return callback(table.innerHTML);
    
  },
  
  secondSlide : function( callback ) {
    if ( Constants.getMetaEntityCounts ) {
      
      var primaryTotal = Constants.getMetaEntityCounts['keyStandard'] + Constants.getMetaEntityCounts['keyCustom'];
      
      var axisTotal = Constants.getMetaEntityCounts['axisStandard'] + Constants.getMetaEntityCounts['axisCustom'];
      
      var memberTotal = Constants.getMetaEntityCounts['memberStandard'] + Constants.getMetaEntityCounts['memberCustom'];
      
      var totalStandard = Constants.getMetaEntityCounts['keyStandard'] + Constants.getMetaEntityCounts['axisStandard']
          + Constants.getMetaEntityCounts['memberStandard'];
      
      var totalCustom = Constants.getMetaEntityCounts['keyCustom'] + Constants.getMetaEntityCounts['axisCustom']
          + Constants.getMetaEntityCounts['memberCustom'];
      
      var total = primaryTotal + axisTotal + memberTotal;
      
      var possibleLabels = [
          [ {
            'label' : 'Total Facts',
            'value' : Constants.getHtmlOverallTaxonomiesCount
          }, {
            'label' : 'Inline Version',
            'value' : Constants.getMetaVersion
          } ],
          [ {
            'label' : 'Tags'
          }, {
            'label' : 'Standard'
          }, {
            'label' : 'Custom'
          }, {
            'label' : 'Total'
          } ],
          
          [ {
            'label' : 'Primary',
            'values' : [
                Constants.getMetaEntityCounts['keyStandard'],
                
                (primaryTotal > 0) ? Math.round((Constants.getMetaEntityCounts['keyStandard'] / primaryTotal) * 100)
                    + '%' : '0%',
                
                Constants.getMetaEntityCounts['keyCustom'],
                
                (primaryTotal > 0) ? Math.round((Constants.getMetaEntityCounts['keyCustom'] / primaryTotal) * 100)
                    + '%' : '0%',
                
                primaryTotal ]
          } ],
          
          [ {
            'label' : 'Axis',
            'values' : [
                Constants.getMetaEntityCounts['axisStandard'],
                
                (axisTotal > 0) ? Math.round((Constants.getMetaEntityCounts['axisStandard'] / axisTotal) * 100) + '%'
                    : '0%',
                
                Constants.getMetaEntityCounts['axisCustom'],
                
                (axisTotal > 0) ? Math.round((Constants.getMetaEntityCounts['axisCustom'] / axisTotal) * 100) + '%'
                    : '0%',
                
                axisTotal ]
          } ],
          
          [ {
            'label' : 'Member',
            'values' : [
                Constants.getMetaEntityCounts['memberStandard'],
                
                (memberTotal > 0) ? Math.round((Constants.getMetaEntityCounts['memberStandard'] / memberTotal) * 100)
                    + '%' : '0%',
                
                Constants.getMetaEntityCounts['memberCustom'],
                
                (memberTotal > 0) ? Math.round((Constants.getMetaEntityCounts['memberCustom'] / memberTotal) * 100)
                    + '%' : '0%',
                
                memberTotal ]
          } ],
          
          [ {
            'label' : 'Total',
            'values' : [
                Constants.getMetaEntityCounts['keyStandard'] + Constants.getMetaEntityCounts['axisStandard']
                    + Constants.getMetaEntityCounts['memberStandard'],
                
                (totalStandard > 0) ? Math.round((totalStandard / total) * 100) + '%' : '0%',
                
                Constants.getMetaEntityCounts['keyCustom'] + Constants.getMetaEntityCounts['axisCustom']
                    + Constants.getMetaEntityCounts['memberCustom'],
                
                (totalStandard > 0) ? Math.round((totalCustom / total) * 100) + '%' : '0%',
                
                total ]
          } ]

      ];
      
      var table = document.createElement('table');
      possibleLabels.forEach(function( current, index, array ) {
        var tr = document.createElement('tr');
        tr.setAttribute('colspan', 8);
        // colspan on a tr element isn't a thing, but reproducing anyway...
        table.appendChild(tr);
        
        if ( current instanceof Array ) {
          
          current.forEach(function( nestedCurrent, nestedIndex ) {
            var th = document.createElement('th');
            th.setAttribute('colspan', 2);
            th.textContent = nestedCurrent['label'];
            tr.appendChild(th);
            
            if ( nestedCurrent['value'] ) {
              var td = document.createElement('td');
              td.setAttribute('data-name', nestedCurrent['label']);
              td.setAttribute('colspan', 2);
              td.textContent = nestedCurrent['value'];
              tr.appendChild(td);
              
            } else if ( nestedCurrent['values'] ) {
              nestedCurrent['values'].forEach(function( finalCurrent, finalIndex ) {
                var td = document.createElement('td');
                td.setAttribute('data-name', nestedCurrent['label'] + '-' + finalIndex);
                td.setAttribute('colspan', 1);
                td.textContent = finalCurrent;
                tr.appendChild(td);
              });
              
            }
          });
          
        } else {
          if ( current['value'] ) {
            var th = document.createElement('th');
            th.setAttribute('colspan', 1);
            th.textContent = current['label'];
            tr.appendChild(th);
            
            var td = document.createElement('td');
            td.setAttribute('colspan', 1);
            td.textContent = current['value'];
            tr.appendChild(td);
          }
        }
      });
      
      return callback(table.innerHTML);
      
    }
    return callback();
  },
  
  thirdSlide : function( callback ) {
    
    var nsPrefix = (Constants.getMetaCustomPrefix) ? Constants.getMetaCustomPrefix.toUpperCase() + ' ' : '';
    
    var possibleLabels = [
        {
          'label' : 'Inline Document',
          'values' : (Constants.getMetaDocuments('inline') && Constants.getMetaDocuments('inline')['local']) ? Constants
              .getMetaDocuments('inline')['local']
              : [ 'Not Available.' ]
        },
        {
          'label' : 'Custom Taxonomy',
          'values' : [ '' ]
        },
        {
          'label' : nsPrefix + 'Schema',
          'values' : (Constants.getMetaDocuments('schema') && Constants.getMetaDocuments('schema')['local']) ? Constants
              .getMetaDocuments('schema')['local']
              : [ 'Not Available.' ]
        },
        {
          'label' : nsPrefix + 'Label',
          'values' : (Constants.getMetaDocuments('labelLink') && Constants.getMetaDocuments('labelLink')['local']) ? Constants
              .getMetaDocuments('labelLink')['local']
              : [ 'Not Available.' ]
        },
        {
          'label' : nsPrefix + 'Calculation',
          'values' : (Constants.getMetaDocuments('calculationLink') && Constants.getMetaDocuments('calculationLink')['local']) ? Constants
              .getMetaDocuments('calculationLink')['local']
              : [ 'Not Available.' ]
        },
        {
          'label' : nsPrefix + 'Presentation',
          'values' : (Constants.getMetaDocuments('presentationLink') && Constants.getMetaDocuments('presentationLink')['local']) ? Constants
              .getMetaDocuments('presentationLink')['local']
              : [ 'Not Available.' ]
        },
        {
          'label' : nsPrefix + 'Definition',
          'values' : (Constants.getMetaDocuments('definitionLink') && Constants.getMetaDocuments('definitionLink')['local']) ? Constants
              .getMetaDocuments('definitionLink')['local']
              : [ 'Not Available.' ]
        
        } ];
    
    var table = document.createElement('td');
    possibleLabels.forEach(function( current, index, array ) {
      if ( current['values'] ) {
        var tr = document.createElement('tr');
        
        table.appendChild(tr);
        
        var th = document.createElement('th');
        
        th.textContent = current['label'];
        tr.appendChild(th);
        
        current['values'].forEach(function( nestedCurrent, nestedIndex ) {
          if ( nestedIndex === 0 ) {
            var td = document.createElement('td');
            td.setAttribute('data-name', current['label'] + '-' + nestedIndex);
            td.textContent = nestedCurrent;
            tr.appendChild(td);
            
          } else {
            
            tr = document.createElement('tr');
            
            table.appendChild(tr);
            tr.appendChild(document.createElement('td'));
            var td = document.createElement('td');

            td.setAttribute('data-name', current['label'] + '-' + nestedIndex);
            td.textContent = nestedCurrent;
            tr.appendChild(td);
          }
          
        });
      } else {
        var tr = document.createElement('tr');
        
        var th = document.createElement('th');
        
        th.textContent = current['label'];
        table.appendChild(tr);
      }
    });
    return callback(table.innerHTML);
    
  },
  
  fourthSlide : function( callback ) {
    
    if ( Constants.getMetaHidden ) {
      var possibleLabels = [ {
        'label' : 'Taxonomy',
        'value' : 'Count',
        'bold' : true
      } ];
      
      Object.keys(Constants.getMetaHidden).forEach(function( current ) {
        var temp = {
          'label' : (current === 'total') ? 'Total' : current,
          'value' : Constants.getMetaHidden[current]
        };
        possibleLabels.push(temp);
      });
      
      var table = document.createElement('table');
      possibleLabels.forEach(function( current, index, array ) {
        var tr = document.createElement('tr');
        
        table.appendChild(tr);
        if ( current['bold'] ) {
          var th1 = document.createElement('th');
          th1.textContent = current['label'];

          tr.appendChild(th1);
          
          var th2 = document.createElement('th');
          th2.textContent = current['value'];

          tr.appendChild(th2);
          
        } else if ( current['value'] ) {
          var th = document.createElement('th');
          th.setAttribute('data-name', 'Additional Items Label-' + (index - 1));
          th.textContent = current['label'];
          tr.appendChild(th);
          
          var td = document.createElement('td');
          td.setAttribute('data-name', 'Additional Items Value-' + (index - 1));
          td.textContent = current['value'];
          tr.appendChild(td);
        }
      });
      return callback(table.innerHTML);
    }
    return callback();
  }
};
