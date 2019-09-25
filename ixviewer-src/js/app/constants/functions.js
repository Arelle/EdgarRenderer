/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var ConstantsFunctions = {
  
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
    } else {
      return null;
    }
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
        
        Constants.getHtmlPrefix = option.split(':')[1];
        break;
      }
    }
  },
  
  setMetaTags : function( input ) {
    
    if ( input && (typeof input === 'object') && !Array.isArray(input) ) {
      var tagsAsArray = [ ];
      for ( var i = 0; i < Object.keys(input).length; i++ ) {
        
        if ( Object.keys(input)[i] ) {
          input[Object.keys(input)[i]]['original-name'] = Object.keys(input)[i];
          tagsAsArray.push(input[Object.keys(input)[i]]);
        } else {
          return null;
        }
      }
      Constants.getMetaTags = tagsAsArray;
      ConstantsFunctions.setMetaCalculationsParentTags();
    } else {
      return null;
    }
  },
  
  setMetaCalculationsParentTags : function( ) {
    var tempMetaCalculation = [ ];
    Constants.getMetaTags.forEach(function( current ) {
      if ( current && current['calculation'] ) {
        tempMetaCalculation.push(current['original-name']);
      }
    });
    
    Constants.getMetaCalculationsParentTags = tempMetaCalculation.filter(function( element, index, array ) {
      return (array.indexOf(element) === index);
    });
    
  },
  
  setMetaEntityCounts : function( input ) {
    if ( input && (typeof input === 'object') && !Array.isArray(input) ) {
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
    if ( input && (typeof input === 'object') && !Array.isArray(input) ) {
      var reportsAsArray = [ ];
      for ( var i = 0; i < Object.keys(input).length; i++ ) {
        input[Object.keys(input)[i]]['original-name'] = Object.keys(input)[i];
        reportsAsArray.push(input[Object.keys(input)[i]]);
      }
      Constants.getMetaReports = reportsAsArray;
    } else {
      return null;
    }
  },
  
  setMetaStandardReference : function( input ) {
    if ( input && (typeof input === 'object') && !Array.isArray(input) ) {
      var referencesAsArray = [ ];
      for ( var i = 0; i < Object.keys(input).length; i++ ) {
        input[Object.keys(input)[i]]['original-name'] = Object.keys(input)[i];
        referencesAsArray.push(input[Object.keys(input)[i]]);
      }
      
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
    } else {
      return null;
    }
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
      }

      else {
        
        var warningMessage = 'File found was not a MetaLinks version 2.0 file or higher';
        if ( document.getElementById('app-warning') ) {
          document.getElementById('app-warning').textContent = warningMessage;
          document.getElementById('app-warning').classList.remove('d-none');
        } else {
          return null;
        }
      }
    } else {
      return null;
    }
    
  },
  
  setMetaCustomPrefix : function( input ) {
    if ( input && (typeof input === 'object') && !Array.isArray(input) && input['nsprefix'] ) {
      Constants.getMetaCustomPrefix = input['nsprefix'].toLowerCase();
    } else {
      return null;
    }
  },
  
  setMetaDts : function( input ) {
    if ( input && (typeof input === 'object') && !Array.isArray(input) ) {
      Constants.getMetaDts = input;
    } else {
      return null;
    }
  },
  
  setMetaHidden : function( input ) {
    if ( input && (typeof input === 'object') && !Array.isArray(input) ) {
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
  }
};
