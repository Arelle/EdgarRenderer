/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var FiltersValue = {
  
  getCorrectFormatBasedOnNamespace : function( element ) {
    var elementToFormat = element;
    if ( element.hasAttribute('ishiddenelement') && element.hasAttribute('data-original-id') ) {
      
      var hiddenElement = document.getElementById('dynamic-xbrl-form').querySelector(
          '[id="' + element.getAttribute('data-original-id') + '"]');
      elementToFormat = hiddenElement;
    }
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
    }
  },
  
  getFormattedValue : function( element, contentForSideBarOrPopOver ) {
    
    if ( element.hasAttribute('format') ) {
      
      return FiltersValue.getCorrectFormatBasedOnNamespace(element);
    }
    
    var elementToFormat = element;
    if ( element.hasAttribute('ishiddenelement') && element.hasAttribute('data-original-id') ) {
      
      var hiddenElement = document.getElementById('dynamic-xbrl-form').querySelector(
          '[id="' + element.getAttribute('data-original-id') + '"]');
      elementToFormat = hiddenElement;
    }
    
    if ( elementToFormat.hasAttribute('xsi:nil') && (elementToFormat.getAttribute('xsi:nil') === true) ) {
      
      return 'nil';
    }
    
    var containerElement = document.createElement('div');
    var showCollapseIfApplicable = (element.offsetHeight > 30) ? true : false;
    
    if ( contentForSideBarOrPopOver ) {
      
      if ( (element.hasAttribute('continued-main-taxonomy') && ConstantsFunctions.getStringBooleanValue(element
          .getAttribute('continued-main-taxonomy')))
          || element.hasAttribute('text-block-taxonomy') ) {
        
        showCollapseIfApplicable = true;
      } else {
        
        showCollapseIfApplicable = false;
      }
      
      if ( showCollapseIfApplicable ) {
        
        containerElement.textContent = 'Click to see Fact';
      } else {
        
        containerElement.textContent = elementToFormat.textContent;
      }
    } else {
      
      if ( showCollapseIfApplicable ) {
        // we show accordion
        var newElement = document.createElement('div');
        newElement.setAttribute('class', 'reboot collapse d-block collapse-modal-partial');
        newElement.setAttribute('id', 'collapse-taxonomy');
        
        newElement.innerHTML = elementToFormat.innerHTML;
        containerElement.appendChild(newElement);
        
        var button = document.createElement('button');
        button.setAttribute('class', 'reboot btn btn-primary btn-sm mt-1');
        button.setAttribute('type', 'button');
        button.setAttribute('data-toggle', 'collapse');
        button.setAttribute('data-target', '#collapse-taxonomy');
        var content = document.createTextNode('Contract / Expand');
        
        button.appendChild(content);
        containerElement.appendChild(button);
      } else {
        containerElement.textContent = elementToFormat.textContent;
      }
    }
    
    // if ( !contentForSideBarOrPopOver && showCollapseIfApplicable ) {
    // // we show accordion
    // var newElement = document.createElement('div');
    // newElement.setAttribute('class', 'reboot collapse d-block
    // collapse-modal-partial');
    // newElement.setAttribute('id', 'collapse-taxonomy');
    //      
    // newElement.innerHTML = elementToFormat.innerHTML;
    // containerElement.appendChild(newElement);
    //      
    // var button = document.createElement('button');
    // button.setAttribute('class', 'reboot btn btn-primary btn-sm mt-1');
    // button.setAttribute('type', 'button');
    // button.setAttribute('data-toggle', 'collapse');
    // button.setAttribute('data-target', '#collapse-taxonomy');
    // var content = document.createTextNode('Contract / Expand');
    //      
    // button.appendChild(content);
    // containerElement.appendChild(button);
    //      
    // } else if ( contentForSideBarOrPopOver && showCollapseIfApplicable ) {
    // containerElement.textContent = 'Click to see Fact';
    // } else {
    //      
    // containerElement.textContent = elementToFormat.textContent;
    // }
    return FiltersNumber.numberFormatting(element, he.unescape(containerElement.innerHTML));
    
  },
  
  getFormattedValueForContinuedAt : function( element ) {
    
    var containerElement = document.createElement('div');
    var newElement = document.createElement('div');
    newElement.setAttribute('class', 'reboot collapse d-block collapse-modal-partial');
    newElement.setAttribute('id', 'collapse-modal');
    
    element.forEach(function( current ) {
      var duplicateNode = current.cloneNode(true);
      
      FiltersValue.recursivelyFixHTMLTemp(duplicateNode);
      newElement.appendChild(duplicateNode);
      
    });
    
    var button = document.createElement('button');
    button.setAttribute('class', 'reboot btn btn-primary btn-sm mt-1');
    button.setAttribute('type', 'button');
    button.setAttribute('data-toggle', 'collapse');
    button.setAttribute('data-target', '#collapse-modal');
    
    var content = document.createTextNode('Contract / Expand');
    button.appendChild(content);
    
    containerElement.appendChild(newElement);
    containerElement.appendChild(button);
    return [ containerElement ];
  },
  
  getFormattedValueForTextBlock : function( element ) {
    if ( element.hasAttribute('format') ) {
      
      return FiltersValue.getCorrectFormatBasedOnNamespace(element);
    }
    
    var containerElement = document.createElement('div');
    var newElement = document.createElement('div');
    newElement.setAttribute('class', 'reboot collapse d-block collapse-modal-partial');
    newElement.setAttribute('id', 'collapse-modal');
    var elementChildren = [ ];
    if ( element.childNodes.length ) {
      
      elementChildren = Array.prototype.slice.call(element.childNodes);
      
    } else {
      var simpleSpan = document.createElement('div');
      var simpleSpanContent = document.createTextNode(element.innerText);
      simpleSpan.appendChild(simpleSpanContent);
      elementChildren.push(simpleSpan);
    }
    
    elementChildren.forEach(function( current ) {
      
      var duplicateNode = current.cloneNode(true);
      newElement.appendChild(duplicateNode);
    });
    var button = document.createElement('button');
    button.setAttribute('class', 'reboot btn btn-primary btn-sm mt-1');
    button.setAttribute('type', 'button');
    button.setAttribute('data-toggle', 'collapse');
    button.setAttribute('data-target', '#collapse-modal');
    
    var content = document.createTextNode('Contract / Expand');
    button.appendChild(content);
    
    containerElement.appendChild(newElement);
    containerElement.appendChild(button);
    return containerElement;
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
