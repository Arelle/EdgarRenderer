/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var TaxonomyPages = {
  
  firstPage : function( element, callback ) {
    
    var factValue;
    if ( element.length ) {
      factValue = FiltersValue.getFormattedValueForContinuedAt(element, true);
      element = element[0];
      
    } else {
      
      factValue = FiltersValue.getFormattedValue(element, true);
      
    }
    var possibleLabels = [ {
      'label' : 'Tag',
      'value' : element.getAttribute('name')
    }, {
      'label' : 'Fact',
      'value' : factValue
    }, {
      'label' : 'Fact Language',
      'value' : FiltersOther.getLanguage(element.getAttribute('xml:lang'))
    }, {
      'label' : 'Period',
      'value' : FiltersContextref.getPeriod(element.getAttribute('contextref'))
    }, {
      'label' : 'Axis',
      'value' : FiltersContextref.getAxis(element.getAttribute('contextref'))
    }, {
      'label' : 'Member',
      'value' : FiltersContextref.getMember(element.getAttribute('contextref'))
    }, {
      'label' : 'Measure',
      'value' : FiltersUnitref.getMeasure(element.getAttribute('unitref'))
    }, {
      'label' : 'Scale',
      'value' : FiltersScale.getScale(element.getAttribute('scale'))
    }, {
      'label' : 'Decimals',
      'value' : FiltersCredit.getDecimals(element.getAttribute('decimals'))
    }, {
      'label' : 'Balance',
      'value' : FiltersCredit.getBalance(element)
    }, {
      'label' : 'Sign',
      'value' : FiltersSign.getSign(element.getAttribute('sign'), element['tagName'])
    }, {
      'label' : 'Type',
      'value' : FiltersName.getFormattedType(element.getAttribute('name'))
    }, {
      'label' : 'Format',
      'value' : FiltersFormat.getFormattedFormat(element.getAttribute('format'))
    }, {
      'label' : 'Footnote',
      'value' : FiltersOther.getFootnote(element.getAttribute('data-original-id'))
    } ];
    
    var tableHtml = '';
    possibleLabels.forEach(function( current, index, array ) {
      if ( current['value'] ) {
        if ( current['label'] === 'Fact' ) {
          
          tableHtml += '<tr><th>' + current['label'] + '</th><td><div>' + current['value'] + '</div></td></tr>';
          
        } else {
          
          tableHtml += '<tr><th>' + current['label'] + '</th><td><div class="w-100 word-break">' + current['value']
              + '</div></td></tr>';
        }
        
      }
    });
    return callback(tableHtml);
  },
  
  secondPage : function( element, callback ) {
    
    if ( element.length ) {
      element = element[0];
    }
    var allLabels = FiltersName.getAllLabelObject(element.getAttribute('name'));
    var possibleLabels = [ ];
    for ( var current in allLabels ) {
      
      var tempObject = {
        'label' : current,
        'value' : allLabels[current],
      };
      possibleLabels.push(tempObject);
    }
    var tableHtml = '';
    possibleLabels.forEach(function( current, index, array ) {
      if ( current['value'] ) {
        tableHtml += '<tr><th>' + current['label'] + '</th><td>' + current['value'] + '</td></tr>';
      }
    });
    return callback(tableHtml);
  },
  
  thirdPage : function( element, callback ) {
    
    if ( element.length ) {
      element = element[0];
    }
    
    var allAuthRefs = FiltersName.getAuthRefs(element.getAttribute('name'));
    var tableHtml = '';
    if ( allAuthRefs ) {
      allAuthRefs.forEach(function( current ) {
        var discoveredReference = ConstantsFunctions.getSingleMetaStandardReference(current);
        if ( discoveredReference[0] ) {
          
          var possibleLabels = [ {
            'label' : 'Name',
            'value' : discoveredReference[0]['Name']
          }, {
            'label' : 'Paragraph',
            'value' : discoveredReference[0]['Paragraph']
          }, {
            'label' : 'Publisher',
            'value' : discoveredReference[0]['Publisher']
          }, {
            'label' : 'Section',
            'value' : discoveredReference[0]['Section']
          }, {
            'label' : 'Sub Topic',
            'value' : discoveredReference[0]['SubTopic']
          }, {
            'label' : 'Sub Paragraph',
            'value' : discoveredReference[0]['Subparagraph']
          }, {
            'label' : 'Topic',
            'value' : discoveredReference[0]['Topic']
          }, {
            'label' : 'Subtopic',
            'value' : discoveredReference[0]['Subtopic']
          }, {
            'label' : 'URL <small>(Will Leave SEC Website)</small>',
            'type' : 'link',
            'value' : discoveredReference[0]['URI']
          }, ];
          
          possibleLabels.forEach(function( current, index, array ) {
            if ( current['type'] === 'link' && current['value'] ) {
              
              tableHtml += '<tr><th>' + current['label'] + '</th><td><a href="' + current['value']
                  + '" target="_blank">' + current['value'] + '</a></td></tr>';
            } else if ( current['value'] ) {
              
              tableHtml += '<tr><th>' + current['label'] + '</th><td>' + current['value'] + '</td></tr>';
            }
            if ( index === (possibleLabels.length - 1) ) {
              tableHtml += '<tr><td colspan="3" class="blank-table-row"></td></tr>';
            }
          });
        }
      });
    }
    return callback(tableHtml);
  },
  
  fourthPage : function( element, callback ) {
    
    if ( element.length ) {
      element = element[0];
    }
    
    var possibleLabels = FiltersName.getCalculationsForModal(element.getAttribute('name')) || [ ];
    
    possibleLabels.unshift({
      'label' : 'Balance',
      'value' : FiltersCredit.getBalance(element) || 'N/A'
    });
    
    var tableHtml = '';
    possibleLabels.forEach(function( current, index, array ) {
      if ( current['blank'] ) {
        tableHtml += '<tr><td colspan="3" class="blank-table-row"></td></tr>';
      }
      if ( current['value'] ) {
        tableHtml += '<tr><th>' + current['label'] + '</th><td>' + current['value'] + '</td></tr>';
      }
    });
    return callback(tableHtml);
  }

};
