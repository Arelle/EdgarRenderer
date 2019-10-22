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
    
    var table = document.createElement('table');
    possibleLabels.forEach(function( current, index, array ) {
      if ( current['value'] ) {
        var tr = document.createElement('tr');
        table.appendChild(tr);

        var th = document.createElement('th');
        th.textContent = current['label'];
        tr.appendChild(th);

        var td = document.createElement('td');
        tr.appendChild(td);

        var div = document.createElement('div');
        div.innerHTML = current['value'];
        td.appendChild(div);

        if ( current['label'] !== 'Fact' ) {
          div.className = 'w-100 word-break'
        }
        
      }
    });
    return callback(table.innerHTML);
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
    
    var table = document.createElement('table');
    possibleLabels.forEach(function( current, index, array ) {
      if ( current['value'] ) {
        var tr = document.createElement('tr');
        table.appendChild(tr);

        var th = document.createElement('th');
        th.textContent = current['label'];
        tr.appendChild(th);

        var td = document.createElement('td');
        td.textContent = current['value'];
        tr.appendChild(td);
      }
    });
    return callback(table.innerHTML);
  },
  
  thirdPage : function( element, callback ) {
    
    if ( element.length ) {
      element = element[0];
    }
    
    var allAuthRefs = FiltersName.getAuthRefs(element.getAttribute('name'));
    var table = document.createElement('table');
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
          
          // Note: some labels above contain HTML, so label fields need to use .innerHTML
          possibleLabels.forEach(function( current, index, array ) {
            if ( current['type'] === 'link' && current['value'] ) {
              var tr = document.createElement('tr');
              table.appendChild(tr);

              var th = document.createElement('th');
              th.innerHTML = current['label'];
              tr.appendChild(th);

              var td = document.createElement('td');
              tr.appendChild(td);

              var link = document.createElement('a');
              link.href = current['value'];
              link.setAttribute('target', '_blank');
              link.textContent = current['value'];
              td.appendChild(link);

            } else if ( current['value'] ) {
              var tr = document.createElement('tr');
              table.appendChild(tr);

              var th = document.createElement('th');
              th.innerHTML = current['label'];
              tr.appendChild(th);

              var td = document.createElement('td');
              td.textContent = current['value'];
              tr.appendChild(td);
            }
            if ( index === (possibleLabels.length - 1) ) {
              var tr = document.createElement('tr');
              table.appendChild(tr);
              var td = document.createElement('td');
              td.setAttribute('colspan', 3);
              td.className='blank-table-row';
              tr.appendChild(td);
            }
          });
        }
      });
    }
    return callback(table.innerHTML);
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
    

    var table = document.createElement('table');
    possibleLabels.forEach(function( current, index, array ) {
      if ( current['blank'] ) {
        var tr = document.createElement('tr');
        table.appendChild(tr);

        var td = document.createElement('td');
        td.setAttribute('colspan', 3);
        td.className = 'blank-table-row';
        tr.appendChild(td);
      }
      if ( current['value'] ) {
        var tr = document.createElement('tr');
        table.appendChild(tr);

        var th = document.createElement('th');
        th.textContent = current['label'];
        tr.appendChild(th);

        var td = document.createElement('td');
        td.textContent = current['value'];
        tr.appendChild(td);
      }
    });
    return callback(table.innerHTML);
  }

};
