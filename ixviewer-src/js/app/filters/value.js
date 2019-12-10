/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var FiltersValue = {
  
  getFormattedValue : function( element, showCollapse ) {
    
    var popoverElement = element.querySelector('.popover');
    var format = element.getAttribute('format');
    
    if ( format && format.split(':')[1] ) {
      var namespace = format.split(':')[0].toLowerCase();
      
      format = format.split(':')[1].toLowerCase();
      if ( Constants.getFormattingObject[namespace] && Constants.getFormattingObject[namespace].indexOf(format) >= 0 ) {
        switch ( format ) {
          
          case 'booleanfalse' : {
            return FiltersNumber.numberFormatting(element, FiltersBoolean.booleanFalse(element));
            break;
          }
          case 'booleantrue' : {
            return FiltersNumber.numberFormatting(element, FiltersBoolean.booleanTrue(element));
            break;
          }
          case 'boolballotbox' : {
            return FiltersNumber.numberFormatting(element, FiltersBoolean.boolBallotBox(element));
            break;
          }
          case 'yesnoballotbox' : {
            return FiltersNumber.numberFormatting(element, FiltersBoolean.yesNoBallotBox(element));
            break;
          }
            
          case 'countrynameen' : {
            return FiltersNumber.numberFormatting(element, FiltersOther.countryNameEn(element));
            break;
          }
          case 'stateprovnameen' : {
            return FiltersNumber.numberFormatting(element, FiltersOther.stateProvNameEn(element));
            break;
          }
          case 'exchnameen' : {
            return FiltersNumber.numberFormatting(element, FiltersOther.exchNameEn(element));
            break;
          }
            
          case 'entityfilercategoryen' : {
            return FiltersNumber.numberFormatting(element, FiltersOther.entityFilerCategoryEn(element));
            break;
          }
            
          case 'edgarprovcountryen' : {
            return FiltersNumber.numberFormatting(element, FiltersOther.edgarProvCountryEn(element));
            break;
          }
            
          case 'calindaymonthyear' : {
            return FiltersNumber.numberFormatting(element, FiltersDate.calINDayMonthYear(element));
            break;
          }
          case 'datedaymonth' : {
            return FiltersNumber.numberFormatting(element, FiltersDate.dateDayMonth(element));
            break;
          }
          case 'datedaymonthdk' : {
            return FiltersNumber.numberFormatting(element, FiltersDate.dateDayMonthDK(element));
            break;
          }
          case 'datedaymonthen' : {
            return FiltersNumber.numberFormatting(element, FiltersDate.dateDayMonthEN(element));
            break;
          }
          case 'datedaymonthyear' : {
            return FiltersNumber.numberFormatting(element, FiltersDate.dateDayMonthYear(element));
            break;
          }
          case 'datedaymonthyeardk' : {
            return FiltersNumber.numberFormatting(element, FiltersDate.dateDayMonthYearDK(element));
            break;
          }
          case 'datedaymonthyearen' : {
            return FiltersNumber.numberFormatting(element, FiltersDate.dateDayMonthYearEN(element));
            break;
          }
          case 'datedaymonthyearin' : {
            return FiltersNumber.numberFormatting(element, FiltersDate.dateDayMonthYearIN(element));
            break;
          }
          case 'datedoteu' : {
            return FiltersNumber.numberFormatting(element, FiltersDate.dateDotEU(element));
            break;
          }
          case 'datedotus' : {
            return FiltersNumber.numberFormatting(element, FiltersDate.dateDotUS(element));
            break;
          }
          case 'dateerayearmonthdayjp' : {
            return FiltersNumber.numberFormatting(element, FiltersDate.dateEraYearMonthDayJP(element));
            break;
          }
          case 'dateerayearmonthjp' : {
            return FiltersNumber.numberFormatting(element, FiltersDate.dateEraYearMonthJP(element));
            break;
          }
          case 'datelongmonthyear' : {
            return FiltersNumber.numberFormatting(element, FiltersDate.dateLongMonthYear(element));
            break;
          }
          case 'datelonguk' : {
            return FiltersNumber.numberFormatting(element, FiltersDate.dateLongUK(element));
            break;
          }
          case 'datelongus' : {
            return FiltersNumber.numberFormatting(element, FiltersDate.dateLongUS(element));
            break;
          }
          case 'datelongyearmonth' : {
            return FiltersNumber.numberFormatting(element, FiltersDate.dateLongYearMonth(element));
            break;
          }
          case 'datemonthday' : {
            return FiltersNumber.numberFormatting(element, FiltersDate.dateMonthDay(element));
            break;
          }
          case 'datemonthdayen' : {
            return FiltersNumber.numberFormatting(element, FiltersDate.dateMonthDayEN(element));
            break;
          }
          case 'datemonthdayyear' : {
            return FiltersNumber.numberFormatting(element, FiltersDate.dateMonthDayYear(element));
            break;
          }
          case 'datemonthdayyearen' : {
            return FiltersNumber.numberFormatting(element, FiltersDate.dateMonthDayYearEN(element));
            break;
          }
          case 'datemonthyear' : {
            return FiltersNumber.numberFormatting(element, FiltersDate.dateMonthYear(element));
            break;
          }
          case 'datemonthyeardk' : {
            return FiltersNumber.numberFormatting(element, FiltersDate.dateMonthYearDK(element));
            break;
          }
          case 'datemonthyearen' : {
            return FiltersNumber.numberFormatting(element, FiltersDate.dateMonthYearEN(element));
            break;
          }
          case 'datemonthyearin' : {
            return FiltersNumber.numberFormatting(element, FiltersDate.dateMonthYearIN(element));
            break;
          }
          case 'dateshortdaymonthuk' : {
            return FiltersNumber.numberFormatting(element, FiltersDate.dateShortDayMonthUK(element));
            
            break;
          }
          case 'dateshorteu' : {
            return FiltersNumber.numberFormatting(element, FiltersDate.dateShortEU(element));
            
            break;
          }
          case 'dateshortmonthdayus' : {
            return FiltersNumber.numberFormatting(element, FiltersDate.dateShortMonthDayUS(element));
            break;
          }
          case 'dateshortmonthyear' : {
            return FiltersNumber.numberFormatting(element, FiltersDate.dateShortMonthYear(element));
            break;
          }
          case 'dateshortuk' : {
            return FiltersNumber.numberFormatting(element, FiltersDate.dateShortUK(element));
            break;
          }
          case 'dateshortus' : {
            return FiltersNumber.numberFormatting(element, FiltersDate.dateShortUS(element));
            break;
          }
          case 'dateshortyearmonth' : {
            return FiltersNumber.numberFormatting(element, FiltersDate.dateShortYearMonth(element));
            break;
          }
          case 'dateslashdaymontheu' : {
            return FiltersNumber.numberFormatting(element, FiltersDate.dateSlashDayMonthEU(element));
            break;
          }
          case 'dateslasheu' : {
            return FiltersNumber.numberFormatting(element, FiltersDate.dateSlashEU(element));
            break;
          }
          case 'dateslashmonthdayus' : {
            return FiltersNumber.numberFormatting(element, FiltersDate.dateSlashMonthDayUS(element));
            break;
          }
          case 'dateslashus' : {
            return FiltersNumber.numberFormatting(element, FiltersDate.dateSlashUS(element));
            break;
          }
            
          case 'datequarterend' : {
            return FiltersNumber.numberFormatting(element, FiltersDate.dateQuarterEnd(element));
            break;
          }
            
          case 'dateyearmonthcjk' : {
            return FiltersNumber.numberFormatting(element, FiltersDate.dateYearMonthCJK(element));
            break;
          }
          case 'dateyearmonthday' : {
            return FiltersNumber.numberFormatting(element, FiltersDate.dateYearMonthDay(element));
            break;
          }
          case 'dateyearmonthdaycjk' : {
            return FiltersNumber.numberFormatting(element, FiltersDate.dateYearMonthDayCJK(element));
            break;
          }
          case 'dateyearmonthen' : {
            return FiltersNumber.numberFormatting(element, FiltersDate.dateYearMonthEN(element));
            break;
          }
          case 'duryear' : {
            return FiltersNumber.numberFormatting(element, FiltersDate.durYear(element));
            break;
          }
          case 'durmonth' : {
            return FiltersNumber.numberFormatting(element, FiltersDate.durMonth(element));
            break;
          }
 case 'durweek' : {
            return FiltersNumber.numberFormatting(element, FiltersDate.durWeek(element));
            break;
          }
          case 'durday' : {
            return FiltersNumber.numberFormatting(element, FiltersDate.durDay(element));
            break;
          }
          case 'durhour' : {
            return FiltersNumber.numberFormatting(element, FiltersDate.durHour(element));
            break;
          }
          case 'durwordsen' : {
            return FiltersNumber.numberFormatting(element, FiltersDate.durWordsEn(element));
            break;
          }
          case 'nocontent' : {
            return FiltersNumber.numberFormatting(element, FiltersOther.noContent(element));
            break;
          }
          case 'numcomma' : {
            return FiltersNumber.numberFormatting(element, FiltersNumber.numComma(element));
            break;
          }
          case 'numcommadecimal' : {
            return FiltersNumber.numberFormatting(element, FiltersNumber.numCommaDecimal(element));
            break;
          }
          case 'numcommadot' : {
            return FiltersNumber.numberFormatting(element, FiltersNumber.numCommaDot(element));
            break;
          }
          case 'numdash' : {
            return FiltersNumber.numberFormatting(element, FiltersNumber.numDash(element));
            break;
          }
          case 'numdotcomma' : {
            return FiltersNumber.numberFormatting(element, FiltersNumber.numDotComma(element));
            break;
          }
          case 'numdotdecimal' : {
            return FiltersNumber.numberFormatting(element, FiltersNumber.numDotDecimal(element));
            break;
          }
          case 'numdotdecimalin' : {
            return FiltersNumber.numberFormatting(element, FiltersNumber.numDotDecimalIN(element));
            break;
          }
          case 'numspacecomma' : {
            return FiltersNumber.numberFormatting(element, FiltersNumber.numSpaceComma(element));
            break;
          }
          case 'numspacedot' : {
            return FiltersNumber.numberFormatting(element, FiltersNumber.numSpaceDot(element));
            break;
          }
          case 'numunitdecimal' : {
            return FiltersNumber.numberFormatting(element, FiltersNumber.numUnitDecimal(element));
            break;
          }
          case 'numunitdecimalin' : {
            return FiltersNumber.numberFormatting(element, FiltersNumber.numUnitDecimalIN(element));
            break;
          }
          case 'numwordsen' : {
            return FiltersNumber.numberFormatting(element, FiltersNumber.numWordsEn(element));
            break;
          }
          case 'zerodash' : {
            return FiltersNumber.numberFormatting(element, FiltersOther.zeroDash(element));
            break;
          }
          default : {
            return 'Format not found';
          }
        }
      } else {
        return 'Namespace not found';
      }
      
    } else {
      
      if ( element.hasAttribute('xsi:nil') && (element.getAttribute('xsi:nil') === true) ) {
        return 'nil';
      }
      
      var splitText = element.innerText.split(/(\r\n|\n|\r)/gm);
      var dataToReturn = '';
      if ( splitText.length > 1 && showCollapse ) {
        // we show accordion
        dataToReturn = '<div class="collapse d-block collapse-modal-partial" id="collapse-taxonomy">';
        dataToReturn += element.innerHTML;
        
        dataToReturn += '</div>';
        dataToReturn += '<button class="btn btn-primary btn-sm btn-block mt-1" type="button" data-toggle="collapse" data-target="#collapse-taxonomy">Contract / Expand</button>';
        
      } else if ( splitText.length > 1 && !showCollapse ) {
        dataToReturn = 'Click to see Fact';
      } else {
        
        dataToReturn = element.innerText;
        
      }
      return FiltersNumber.numberFormatting(element, dataToReturn);
      
    }
    
  },
  
  getFormattedValueForContinuedAt : function( element ) {
    var dataToReturn = '<div class="collapse d-block collapse-modal-partial" id="collapse-modal">';
    
    element.forEach(function( current ) {
      var duplicateNode = current.cloneNode(true);
      
      FiltersValue.recursivelyFixHTMLTemp(duplicateNode);
      
      dataToReturn += duplicateNode.outerHTML;
      
    });
    dataToReturn += '</div>';
    dataToReturn += '<button class="btn btn-primary btn-sm mt-1" type="button" data-toggle="collapse" data-target="#collapse-modal">Contract / Expand</button>';
    return dataToReturn;
  },
  
  recursivelyFixHTMLTemp : function( element ) {
    
    // TODO add bootstrap classes?
    if ( element.nodeName.toLowerCase() === 'table' ) {
      element.classList.add('table');
    }
    element.removeAttribute('contextref');
    element.removeAttribute('name');
    element.removeAttribute('id');
    element.removeAttribute('escape');
    element.removeAttribute('continued-taxonomy');
    element.removeAttribute('continued-main-taxonomy');
    element.removeAttribute('class');
    element.removeAttribute('enabled-taxonomy');
    element.removeAttribute('highlight-taxonomy');
    element.removeAttribute('selected-taxonomy');
    element.removeAttribute('hover-taxonomy');
    element.removeAttribute('onclick');
    element.removeAttribute('onmouseenter');
    element.removeAttribute('onmouseleave');
    element.removeAttribute('isamountsonly');
    element.removeAttribute('istextonly');
    element.removeAttribute('iscalculationsonly');
    element.removeAttribute('isnegativesonly');
    element.removeAttribute('isadditionalitemsonly');
    element.removeAttribute('isstandardonly');
    element.removeAttribute('iscustomonly');
    
    element.style.fontSize = null;
    element.style.lineHeight = null;
    // element.removeAttribute('style');
    if ( element['children'].length > 0 ) {
      for ( var i = 0; i < element['children'].length; i++ ) {
        FiltersValue.recursivelyFixHTMLTemp(element['children'][i]);
      }
    }
  },
  
  recursivelyFixHTML : function( element ) {
    
    // TODO add bootstrap classes?
    if ( element.nodeName.toLowerCase() === 'table' ) {
      element.classList.add('table');
    }
    element.removeAttribute('style');
    if ( element['children'].length > 0 ) {
      for ( var i = 0; i < element['children'].length; i++ ) {
        FiltersValue.recursivelyFixHTML(element['children'][i]);
      }
    }
  }

};
