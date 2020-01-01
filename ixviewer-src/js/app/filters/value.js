/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var FiltersValue = {
  
  getFormattedValue : function( element, showCollapse ) {
    
    var elementToFormat = element;
    if ( element.hasAttribute('ishiddenelement') && element.hasAttribute('data-original-id') ) {
      
      var hiddenElement = document.getElementById('dynamic-xbrl-form').querySelector(
          '[id="' + element.getAttribute('data-original-id') + '"]');
      elementToFormat = hiddenElement;
    }
    var popoverElement = element.querySelector('.popover');
    var format = element.getAttribute('format');
    
    if ( format && format.split(':')[1] ) {
      var namespace = format.split(':')[0].toLowerCase();
      
      format = format.split(':')[1].toLowerCase();
      if ( Constants.getFormattingObject[namespace] && Constants.getFormattingObject[namespace].indexOf(format) >= 0 ) {
        switch ( format ) {
          
          case 'booleanfalse' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersBoolean.booleanFalse(elementToFormat));
            break;
          }
          case 'booleantrue' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersBoolean.booleanTrue(elementToFormat));
            break;
          }
          case 'boolballotbox' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersBoolean.boolBallotBox(elementToFormat));
            break;
          }
          case 'yesnoballotbox' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersBoolean.yesNoBallotBox(elementToFormat));
            break;
          }
            
          case 'countrynameen' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersOther.countryNameEn(elementToFormat));
            break;
          }
          case 'stateprovnameen' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersOther.stateProvNameEn(elementToFormat));
            break;
          }
          case 'exchnameen' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersOther.exchNameEn(elementToFormat));
            break;
          }
            
          case 'entityfilercategoryen' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersOther.entityFilerCategoryEn(elementToFormat));
            break;
          }
            
          case 'edgarprovcountryen' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersOther.edgarProvCountryEn(elementToFormat));
            break;
          }
            
          case 'calindaymonthyear' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.calINDayMonthYear(elementToFormat));
            break;
          }
          case 'datedaymonth' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateDayMonth(elementToFormat));
            break;
          }
          case 'datedaymonthdk' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateDayMonthDK(elementToFormat));
            break;
          }
          case 'datedaymonthen' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateDayMonthEN(elementToFormat));
            break;
          }
          case 'datedaymonthyear' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateDayMonthYear(elementToFormat));
            break;
          }
          case 'datedaymonthyeardk' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateDayMonthYearDK(elementToFormat));
            break;
          }
          case 'datedaymonthyearen' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateDayMonthYearEN(elementToFormat));
            break;
          }
          case 'datedaymonthyearin' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateDayMonthYearIN(elementToFormat));
            break;
          }
          case 'datedoteu' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateDotEU(elementToFormat));
            break;
          }
          case 'datedotus' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateDotUS(elementToFormat));
            break;
          }
          case 'dateerayearmonthdayjp' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateEraYearMonthDayJP(elementToFormat));
            break;
          }
          case 'dateerayearmonthjp' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateEraYearMonthJP(elementToFormat));
            break;
          }
          case 'datelongmonthyear' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateLongMonthYear(elementToFormat));
            break;
          }
          case 'datelonguk' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateLongUK(elementToFormat));
            break;
          }
          case 'datelongus' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateLongUS(elementToFormat));
            break;
          }
          case 'datelongyearmonth' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateLongYearMonth(elementToFormat));
            break;
          }
          case 'datemonthday' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateMonthDay(elementToFormat));
            break;
          }
          case 'datemonthdayen' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateMonthDayEN(elementToFormat));
            break;
          }
          case 'datemonthdayyear' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateMonthDayYear(elementToFormat));
            break;
          }
          case 'datemonthdayyearen' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateMonthDayYearEN(elementToFormat));
            break;
          }
          case 'datemonthyear' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateMonthYear(elementToFormat));
            break;
          }
          case 'datemonthyeardk' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateMonthYearDK(elementToFormat));
            break;
          }
          case 'datemonthyearen' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateMonthYearEN(elementToFormat));
            break;
          }
          case 'datemonthyearin' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateMonthYearIN(elementToFormat));
            break;
          }
          case 'dateshortdaymonthuk' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateShortDayMonthUK(elementToFormat));
            
            break;
          }
          case 'dateshorteu' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateShortEU(elementToFormat));
            
            break;
          }
          case 'dateshortmonthdayus' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateShortMonthDayUS(elementToFormat));
            break;
          }
          case 'dateshortmonthyear' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateShortMonthYear(elementToFormat));
            break;
          }
          case 'dateshortuk' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateShortUK(elementToFormat));
            break;
          }
          case 'dateshortus' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateShortUS(elementToFormat));
            break;
          }
          case 'dateshortyearmonth' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateShortYearMonth(elementToFormat));
            break;
          }
          case 'dateslashdaymontheu' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateSlashDayMonthEU(elementToFormat));
            break;
          }
          case 'dateslasheu' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateSlashEU(elementToFormat));
            break;
          }
          case 'dateslashmonthdayus' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateSlashMonthDayUS(elementToFormat));
            break;
          }
          case 'dateslashus' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateSlashUS(elementToFormat));
            break;
          }
            
          case 'datequarterend' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateQuarterEnd(elementToFormat));
            break;
          }
            
          case 'dateyearmonthcjk' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateYearMonthCJK(elementToFormat));
            break;
          }
          case 'dateyearmonthday' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateYearMonthDay(elementToFormat));
            break;
          }
          case 'dateyearmonthdaycjk' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateYearMonthDayCJK(elementToFormat));
            break;
          }
          case 'dateyearmonthen' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateYearMonthEN(elementToFormat));
            break;
          }
          case 'duryear' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.durYear(elementToFormat));
            break;
          }
          case 'durmonth' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.durMonth(elementToFormat));
            break;
          }
          case 'durweek' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.durWeek(elementToFormat));
            break;
          }
          case 'durday' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.durDay(elementToFormat));
            break;
          }
          case 'durhour' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.durHour(elementToFormat));
            break;
          }
          case 'durwordsen' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.durWordsEn(elementToFormat));
            break;
          }
          case 'nocontent' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersOther.noContent(elementToFormat));
            break;
          }
          case 'numcomma' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersNumber.numComma(elementToFormat));
            break;
          }
          case 'numcommadecimal' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersNumber.numCommaDecimal(elementToFormat));
            break;
          }
          case 'numcommadot' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersNumber.numCommaDot(elementToFormat));
            break;
          }
          case 'numdash' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersNumber.numDash(elementToFormat));
            break;
          }
          case 'numdotcomma' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersNumber.numDotComma(elementToFormat));
            break;
          }
          case 'numdotdecimal' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersNumber.numDotDecimal(elementToFormat));
            break;
          }
          case 'numdotdecimalin' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersNumber.numDotDecimalIN(elementToFormat));
            break;
          }
          case 'numspacecomma' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersNumber.numSpaceComma(elementToFormat));
            break;
          }
          case 'numspacedot' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersNumber.numSpaceDot(elementToFormat));
            break;
          }
          case 'numunitdecimal' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersNumber.numUnitDecimal(elementToFormat));
            break;
          }
          case 'numunitdecimalin' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersNumber.numUnitDecimalIN(elementToFormat));
            break;
          }
          case 'numwordsen' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersNumber.numWordsEn(elementToFormat));
            break;
          }
          case 'zerodash' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersOther.zeroDash(elementToFormat));
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
      var splitText = elementToFormat.innerText.split(/(\r\n|\n|\r)/gm);
var containerElement = document.createElement('div');
      var dataToReturn = '';
      if ( splitText.length > 1 && showCollapse ) {
        // we show accordion
       var div = document.createElement('div');
          div.className = 'collapse d-block collapse-modal-partial';
          div.id = 'collapse-taxonomy';
          div.innerHTML = element.innerHTML;
          containerElement.appendChild(div);

          var button = document.createElement('button');
          button.className = 'btn btn-primary btn-sm btn-block mt-1';
          button.type = 'button';
          button.setAttribute('data-toggle', 'collapse');
          button.setAttribute('data-target', '#collapse-taxonomy');
          button.textContent = 'Contract / Expand';
          containerElement.appendChild(button);
        
      } else if ( splitText.length > 1 && !showCollapse ) {
         containerElement.textContent = 'Click to see Fact';
      } else {
          containerElement.textContent = element.textContent; 
        }
        return FiltersNumber.numberFormatting(element, containerElement.innerHTML);
      
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
