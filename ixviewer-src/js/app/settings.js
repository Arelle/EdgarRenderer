/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

function setCustomCSS( ) {
  
  var taggedData = localStorage.getItem('taggedData') || 'FF6600';
  var searchResults = localStorage.getItem('searchResults') || 'FFD700';
  var selectedFact = localStorage.getItem('selectedFact') || '003768';
  var tagShading = localStorage.getItem('tagShading') || 'rgba(255,0,0,0.3)';
  var cssObject = {
    
    '#dynamic-xbrl-form [enabled-taxonomy="true"][continued-taxonomy="false"]' : {
      'border-top' : '2px solid #' + taggedData,
      'border-bottom' : '2px solid #' + taggedData,
      'display' : 'inline',
    },
    
    '#dynamic-xbrl-form [enabled-taxonomy="true"][continued-main-taxonomy="true"]' : {
      'border-left' : '2px solid #' + taggedData,
      'border-right' : '2px solid #' + taggedData,
    },
    
    '#dynamic-xbrl-form [enabled-taxonomy="true"][text-block-taxonomy="true"]' : {
      'border-left' : '2px solid #' + taggedData,
      'border-right' : '2px solid #' + taggedData,
      'border-top' : 'none',
      'border-bottom' : 'none'
    },
    
    '#dynamic-xbrl-form [highlight-taxonomy="true"]' : {
      'background-color' : '#' + searchResults + ' !important',
    },
    
    '#dynamic-xbrl-form [highlight-taxonomy="true"] > *' : {
      'background-color' : '#' + searchResults + ' !important',
    },
    
    '#dynamic-xbrl-form [selected-taxonomy="true"][continued-main-taxonomy="true"]' : {
      'border-left' : '2px solid #' + selectedFact,
      'border-right' : '2px solid #' + selectedFact,
    },
    
    '#dynamic-xbrl-form [selected-taxonomy="true"][text-block-taxonomy="true"]' : {
      'border-left' : '2px solid #' + selectedFact,
      'border-right' : '2px solid #' + selectedFact,
    },
    
    '#dynamic-xbrl-form [selected-taxonomy="true"][continued-taxonomy="false"]' : {
      'border' : '3px solid #' + selectedFact + ' !important',
      'display' : 'inline',
    },
    
    '#dynamic-xbrl-form [hover-taxonomy="true"]' : {
      'background-color' : tagShading,
    },
    
    '.tagged-data-example-1' : {
      'border-top' : '2px solid #' + taggedData,
      'border-bottom' : '2px solid #' + taggedData,
    },
    
    '.search-results-example-1' : {
      'background-color' : '#' + searchResults,
    },
    
    '.tag-shading-exmple-1:hover' : {
      'background-color' : tagShading,
    },
    
    '.selected-fact-example-1' : {
      'border' : '3px solid #' + selectedFact + ' !important',
    },
  
  };
  
  var cssString = '';
  
  for ( var key in cssObject ) {
    cssString += ' ' + key + '{';
    for ( var nestedKey in cssObject[key] ) {
      cssString += nestedKey + ':' + cssObject[key][nestedKey] + ';';
    }
    cssString += '}';
  }
  var head = document.head || document.getElemtsByTagName('head')[0];
  var style = document.getElementById('customized-styles') || document.createElement('style');
  
  head.appendChild(style);
  
  style.type = 'text/css';
  style.id = 'customized-styles';
  
  style.appendChild(document.createTextNode(cssString));
  
}
(function( ) {
  setCustomCSS();
  var taggedData = localStorage.getItem('taggedData') || 'FF6600';
  var searchResults = localStorage.getItem('searchResults') || 'FFD700';
  var selectedFact = localStorage.getItem('selectedFact') || '003768';
  var tagShading = localStorage.getItem('tagShading') || 'rgba(255,0,0,0.3)';
  
  var pickrOptions = [ {
    'selector' : '#tagged-data-color-picker',
    'default' : taggedData
  }, {
    'selector' : '#search-results-color-picker',
    'default' : searchResults
  }, {
    'selector' : '#selected-fact-color-picker',
    'default' : selectedFact
  }, {
    'selector' : '#tag-shading-color-picker',
    'default' : tagShading
  } ];
  
  pickrOptions.forEach(function( current, index ) {
    Pickr.create({
      'el' : current['selector'],
      'default' : current['default'],
      'components' : {
        preview : true,
        hue : true,
        opacity : (index === 3),
        interaction : {
          save : true,
          cancel : true,
        },
      },
      strings : {
        save : 'Set',
        cancel : 'Reset'
      }
    }).on('save', function( color, instance ) {
      if ( color ) {
        // set as new color
        switch ( index ) {
          case 0 : {
            localStorage.setItem('taggedData', color.toHEXA().toString().replace('#', ''));
            setCustomCSS();
            break;
          }
          case 1 : {
            localStorage.setItem('searchResults', color.toHEXA().toString().replace('#', ''));
            setCustomCSS();
            break;
          }
          case 2 : {
            localStorage.setItem('selectedFact', color.toHEXA().toString().replace('#', ''));
            setCustomCSS();
            break;
          }
          case 3 : {
            localStorage.setItem('tagShading', color.toRGBA().toString(0));
            setCustomCSS();
            break;
          }
          default : {
            ErrorsMinor.unknownError();
          }
        }
      }
      
    }).on('cancel', function( instance ) {
      // reset back to the original value(s)
      switch ( index ) {
        case 0 : {
          instance.setColor('FF6600');
          localStorage.setItem('taggedData', 'FF6600');
          setCustomCSS();
          break;
        }
        case 1 : {
          instance.setColor('FFD700');
          localStorage.setItem('searchResults', 'FFD700');
          setCustomCSS();
          break;
        }
        case 2 : {
          instance.setColor('003768');
          localStorage.setItem('selectedFact', '003768');
          setCustomCSS();
          break;
        }
        case 3 : {
          instance.setColor('rgba(255,0,0,0.3)');
          localStorage.setItem('tagShading', 'rgba(255,0,0,0.3)');
          setCustomCSS();
          break;
        }
        default : {
          ErrorsMinor.unknownError();
        }
      }
    });
  });
})();
