/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var ConstantsFunctions = {
  
  updateXHTMLDocumentStyleProperties : function( input ) {
    // this function specifically targets style="width:123;"
    // and replaces it with style="width:123px;"
    // because of IE wonky-ness this can't be fixed via a query selector
    return input.replace(/width:\s*(\d+);/g, function( match, token ) {
      var returnWidth = 'width: ' + token + 'px;';
      return returnWidth;
    });
  },
  
  setBrowserType : function( ) {
    
    Constants.getBrowserType = {
      'opera' : (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0,
      'firefox' : typeof InstallTrigger !== 'undefined',
      'safari' : /constructor/i.test(window.HTMLElement) || (function( p ) {
        return p.toString() === "[object SafariRemoteNotification]";
      })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification)),
      'ie' : false || !!document.documentMode,
      'edge' : !(false || !!document.documentMode) && !!window.StyleMedia,
      'chrome' : !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime)
    };
  },
  
  setParentContainerStyles : function( input ) {
    if ( typeof input === 'string' && input.length > 0 ) {
      var tempHTML = document.createElement('html');
      tempHTML.innerHTML = input;
      
      if ( tempHTML.querySelector('body').hasAttribute('style') ) {
        document.getElementById('dynamic-xbrl-form').setAttribute('style',
            tempHTML.querySelector('body').getAttribute('style'));
      }
      
    } else {
      return;
    }
    
  },
  
  setHTMLAttributes : function( input ) {
    if ( typeof input === 'string' && input.length > 0 ) {
      var temp = {};
      var arrayToLoopOver = input.split(' ');
      arrayToLoopOver.forEach(function( current ) {
        if ( current.indexOf('=') >= 0 ) {
          var nameSpaceArray = current.split('=');
          temp[nameSpaceArray[0].trim()] = nameSpaceArray[1].trim().replace('>', '').replace(/["']/g, '');
        }
      });
      Constants.getHTMLAttributes = temp;
      ConstantsFunctions.setFormattingObject(temp);
      return true;
    }
    return null;
    
  },
  
  setMetaSourceDocumentsThenFixLinks : function( input ) {
    if ( typeof input === 'string' ) {
      Constants.getMetaSourceDocuments = input.split(' ');
      
    } else {
      return null;
    }
  },
  
  setHTMLPrefix : function( ) {
    
    for ( var option in Constants.getHTMLAttributes ) {
      
      if ( Constants.getHTMLAttributes[option] === 'http://www.xbrl.org/2013/inlineXBRL' ) {
        
        Constants.getHTMLPrefix = option.split(':')[1];
        break;
      }
    }
  },
  
  setMetaTags : function( input ) {
    if ( input && (typeof input === 'object') && !Array.isArray(input) ) {
      var tagsAsArray = Object.keys(input).map(function( current, index, array ) {
        if ( current ) {
          input[current]['original-name'] = current;
          return input[current];
        }
      });
      Constants.getMetaTags = tagsAsArray;
      ConstantsFunctions.setMetaCalculationsParentTags();
    } else {
      return null;
    }
  },
  
  setMetaCalculationsParentTags : function( ) {
    Constants.getMetaCalculationsParentTags = Constants.getMetaTags.map(function( current, index, array ) {
      if ( current && current['calculation'] ) {
        return current['original-name'];
      }
    }).filter(function( element, index, array ) {
      return element && (array.indexOf(element) === index);
    });
  },
  
  setMetaEntityCounts : function( input ) {
    if ( input && (typeof input === 'object') && !(input instanceof Array) ) {
      var entityObject = {
        'keyStandard' : input['keyStandard'],
        'axisStandard' : input['axisStandard'],
        'memberStandard' : input['memberStandard'],
        'keyCustom' : input['keyCustom'],
        'axisCustom' : input['axisCustom'],
        'memberCustom' : input['memberCustom']
      };
      Constants.getMetaEntityCounts = entityObject;
    } else {
      return null;
    }
  },
  
  setMetaReports : function( input ) {
    if ( input && (typeof input === 'object') && !(input instanceof Array) ) {
      var reportsAsArray = Object.keys(input).map(function( current, index, array ) {
        input[current]['original-name'] = current;
        return input[current];
      });
      Constants.getMetaReports = reportsAsArray;
      
    } else {
      return null;
    }
  },
  
  setMetaStandardReference : function( input ) {
    if ( input && (typeof input === 'object') && !(input instanceof Array) ) {
      var referencesAsArray = Object.keys(input).map(function( current, index, array ) {
        input[current]['original-name'] = current;
        return input[current];
      });
      
      Constants.getMetaStandardReference = referencesAsArray;
    } else {
      return null;
    }
  },
  
  getSingleMetaStandardReference : function( ref ) {
    if ( ref && typeof ref === 'string' ) {
      return Constants.getMetaStandardReference.filter(function( element ) {
        return element['original-name'] === ref;
      });
    }
    return null;
    
  },
  
  setMetaVersion : function( input ) {
    if ( input && (typeof input === 'string') ) {
      Constants.getMetaVersion = input;
      if ( input >= '2.0' ) {
        
        var metaLinksElements = document.querySelectorAll('.meta-links-version');
        
        var metaLinksElementsArray = Array.prototype.slice.call(metaLinksElements);
        
        metaLinksElementsArray.forEach(function( current ) {
          current.textContent = input;
        });
      } else {
        ErrorsMinor.metaLinksVersion();
      }
    } else {
      return null;
    }
    
  },
  
  setMetaCustomPrefix : function( input ) {
    if ( input && (typeof input === 'object') && !(input instanceof Array) && input['nsprefix'] ) {
      Constants.getMetaCustomPrefix = input['nsprefix'].toLowerCase();
    } else {
      return null;
    }
  },
  
  setMetaDts : function( input ) {
    if ( input && (typeof input === 'object') && !(input instanceof Array) ) {
      Constants.getMetaDts = input;
    } else {
      return null;
    }
  },
  
  setMetaHidden : function( input ) {
    if ( input && (typeof input === 'object') && !(input instanceof Array) ) {
      Constants.getMetaHidden = input;
    } else {
      return null;
    }
  },
  
  setFormattingObject : function( input ) {
    var temp = {};
    for ( var option in input ) {
      if ( input[option] === 'http://www.xbrl.org/inlineXBRL/transformation/2010-04-20'
          || input[option] === 'http://www.xbrl.org/2008/inlineXBRL/transformation' ) {
        if ( option.split(':') && option.split(':')[1] ) {
          temp[option.split(':')[1]] = [
              'dateslashus',
              'dateslasheu',
              'datedotus',
              'datedoteu',
              'datelongus',
              'dateshortus',
              'datelongeu',
              'dateshorteu',
              'datelonguk',
              'dateshortuk',
              'numcommadot',
              'numdash',
              'numspacedot',
              'numdotcomma',
              'numcomma',
              'numspacecomma',
              'dateshortdaymonthuk',
              'dateshortmonthdayus',
              'dateslashdaymontheu',
              'dateslashmonthdayus',
              'datelongyearmonth',
              'dateshortyearmonth',
              'datelongmonthyear',
              'dateshortmonthyear' ];
        }
        
      }
      if ( input[option] === 'http://www.xbrl.org/inlineXBRL/transformation/2011-07-31' ) {
        if ( option.split(':') && option.split(':')[1] ) {
          temp[option.split(':')[1]] = [
              'booleanfalse',
              'booleantrue',
              'datedaymonth',
              'datedaymonthen',
              'datedaymonthyear',
              'datedaymonthyearen',
              'dateerayearmonthdayjp',
              'dateerayearmonthjp',
              'datemonthday',
              'datemonthdayen',
              'datemonthdayyear',
              'datemonthdayyearen',
              'datemonthyearen',
              'dateyearmonthdaycjk',
              'dateyearmonthen',
              'dateyearmonthcjk',
              'nocontent',
              'numcommadecimal',
              'zerodash',
              'numdotdecimal',
              'numunitdecimal' ];
        }
      }
      if ( input[option] === 'http://www.xbrl.org/inlineXBRL/transformation/2015-02-26' ) {
        if ( option.split(':') && option.split(':')[1] ) {
          temp[option.split(':')[1]] = [
              'booleanfalse',
              'booleantrue',
              'calindaymonthyear',
              'datedaymonth',
              'datedaymonthdk',
              'datedaymonthen',
              'datedaymonthyear',
              'datedaymonthyeardk',
              'datedaymonthyearen',
              'datedaymonthyearin',
              'dateerayearmonthdayjp',
              'dateerayearmonthjp',
              'datemonthday',
              'datemonthdayen',
              'datemonthdayyear',
              'datemonthdayyearen',
              'datemonthyear',
              'datemonthyeardk',
              'datemonthyearen',
              'datemonthyearin',
              'dateyearmonthcjk',
              'dateyearmonthday',
              'dateyearmonthdaycjk',
              'dateyearmonthen',
              'nocontent',
              'numcommadecimal',
              'numdotdecimal',
              'numdotdecimalin',
              'numunitdecimal',
              'numunitdecimalin',
              'zerodash' ];
        }
      }
      if ( input[option] === 'http://www.sec.gov/inlineXBRL/transformation/2015-08-31' ) {
        if ( option.split(':') && option.split(':')[1] ) {
          temp[option.split(':')[1]] = [
              'boolballotbox',
              'yesnoballotbox',
              'countrynameen',
              'stateprovnameen',
              'exchnameen',
              'edgarprovcountryen',
              'entityfilercategoryen',
              'duryear',
              'durmonth',
              'durweek',
              'durday',
              'durhour',
              'numinf',
              'numneginf',
              'numnan',
              'numwordsen',
              'durwordsen',
              'datequarterend' ];
        }
      }
    }
    Constants.getFormattingObject = temp;
  },
  
  getUrlVars : function( url ) {
    var vars = {};
    var parts = url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function( m, key, value ) {
      vars[key] = value;
    });
    return vars;
  },
  
  getStringBooleanValue : function( input ) {
    if ( typeof (input) === 'string' ) {
      input = input.trim().toLowerCase();
    }
    switch ( input ) {
      case true :
      case 'true' :
      case 1 :
      case '1' :
      case 'on' :
      case 'yes' :
        return true;
      default :
        return false;
    }
  },
  
  setModalFactAsTextBlock : function( element ) {
    // if element has a height of over 35px, we consider it a text block element
    // (they are not always labeled correctly)
    return element.getBoundingClientRect().height > 35;
  }

};
