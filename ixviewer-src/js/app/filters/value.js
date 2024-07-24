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
          }
            
          case 'booleantrue' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersBoolean.booleanTrue(elementToFormat));
          }
            
          case 'boolballotbox' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersBoolean.boolBallotBox(elementToFormat));
          }
            
          case 'yesnoballotbox' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersBoolean.yesNoBallotBox(elementToFormat));
          }
            
          case 'countrynameen' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersOther.countryNameEn(elementToFormat));
          }
            
          case 'stateprovnameen' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersOther.stateProvNameEn(elementToFormat));
          }
            
          case 'exchnameen' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersOther.exchNameEn(elementToFormat));
          }
            
          case 'entityfilercategoryen' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersOther.entityFilerCategoryEn(elementToFormat));
          }
            
          case 'edgarprovcountryen' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersOther.edgarProvCountryEn(elementToFormat));
          }
            
          case 'calindaymonthyear' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.calINDayMonthYear(elementToFormat));
          }
            
          case 'datedaymonth' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateDayMonth(elementToFormat));
          }
            
          case 'datedaymonthdk' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateDayMonthDK(elementToFormat));
          }
            
          case 'datedaymonthen' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateDayMonthEN(elementToFormat));
          }
            
          case 'datedaymonthyear' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateDayMonthYear(elementToFormat));
          }
            
          case 'datedaymonthyeardk' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthyeardk(elementToFormat));
          }
            
          case 'datedaymonthyearen' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateDayMonthYearEN(elementToFormat));
          }
            
          case 'datedaymonthyearin' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthyearinTR3(elementToFormat));
          }
            
          case 'datedoteu' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateDotEU(elementToFormat));
          }
            
          case 'datedotus' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateDotUS(elementToFormat));
          }
            
          case 'dateerayearmonthdayjp' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateEraYearMonthDayJP(elementToFormat));
          }
            
          case 'dateerayearmonthjp' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateEraYearMonthJP(elementToFormat));
          }
            
          case 'datelongmonthyear' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateLongMonthYear(elementToFormat));
          }
            
          case 'datelonguk' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateLongUK(elementToFormat));
          }
            
          case 'datelongus' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateLongUS(elementToFormat));
          }
            
          case 'datelongyearmonth' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateLongYearMonth(elementToFormat));
          }
            
          case 'datemonthday' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateMonthDay(elementToFormat));
          }
            
          case 'datemonthdayen' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateMonthDayEN(elementToFormat));
          }
            
          case 'datemonthdayyear' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateMonthDayYear(elementToFormat));
          }
            
          case 'datemonthdayyearen' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateMonthDayYearEN(elementToFormat));
          }
            
          case 'datemonthyear' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateMonthYear(elementToFormat));
          }
            
          case 'datemonthyeardk' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datemonthyeardk(elementToFormat));
          }
            
          case 'datemonthyearen' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateMonthYearEN(elementToFormat));
          }
            
          case 'datemonthyearin' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateMonthYearIN(elementToFormat));
          }
            
          case 'dateshortdaymonthuk' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateShortDayMonthUK(elementToFormat));
          }
            
          case 'dateshorteu' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateShortEU(elementToFormat));
          }
            
          case 'dateshortmonthdayus' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateShortMonthDayUS(elementToFormat));
          }
            
          case 'dateshortmonthyear' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateShortMonthYear(elementToFormat));
          }
            
          case 'dateshortuk' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateShortUK(elementToFormat));
          }
            
          case 'dateshortus' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateShortUS(elementToFormat));
          }
            
          case 'dateshortyearmonth' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateShortYearMonth(elementToFormat));
            
          }
          case 'dateslashdaymontheu' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateSlashDayMonthEU(elementToFormat));
          }
            
          case 'dateslasheu' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateSlashEU(elementToFormat));
          }
            
          case 'dateslashmonthdayus' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateSlashMonthDayUS(elementToFormat));
          }
            
          case 'dateslashus' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateSlashUS(elementToFormat));
          }
            
          case 'datequarterend' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateQuarterEnd(elementToFormat));
          }
            
          case 'dateyearmonthcjk' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateYearMonthCJK(elementToFormat));
          }
            
          case 'dateyearmonthday' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateYearMonthDay(elementToFormat));
          }
            
          case 'dateyearmonthdaycjk' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateYearMonthDayCJK(elementToFormat));
          }
            
          case 'dateyearmonthen' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateYearMonthEN(elementToFormat));
          }
            
          case 'duryear' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.durYear(elementToFormat));
          }
            
          case 'durmonth' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.durMonth(elementToFormat));
          }
            
          case 'durweek' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.durWeek(elementToFormat));
          }
            
          case 'durday' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.durDay(elementToFormat));
          }
            
          case 'durhour' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.durHour(elementToFormat));
          }
            
          case 'durwordsen' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.durWordsEn(elementToFormat));
          }
            
          case 'nocontent' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersOther.noContent(elementToFormat));
          }
            
          case 'numcomma' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersNumber.numComma(elementToFormat));
          }
            
          case 'numcommadecimal' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersNumber.numCommaDecimal(elementToFormat));
          }
            
          case 'numcommadot' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersNumber.numCommaDot(elementToFormat));
          }
            
          case 'numdash' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersNumber.numDash(elementToFormat));
          }
            
          case 'numdotcomma' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersNumber.numDotComma(elementToFormat));
            
          }
            
          case 'numdotdecimal' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersNumber.numDotDecimal(elementToFormat));
          }
            
          case 'numdotdecimalin' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersNumber.numDotDecimalIN(elementToFormat));
          }
            
          case 'numspacecomma' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersNumber.numSpaceComma(elementToFormat));
          }
            
          case 'numspacedot' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersNumber.numSpaceDot(elementToFormat));
          }
            
          case 'numunitdecimal' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersNumber.numUnitDecimal(elementToFormat));
          }
            
          case 'numunitdecimalin' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersNumber.numUnitDecimalIN(elementToFormat));
          }
            
          case 'numwordsen' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersNumber.numWordsEn(elementToFormat));
          }
            
          case 'zerodash' : {
            return FiltersOther.zeroDash(elementToFormat);
          }
            
            // HF: TR4 functions
          case 'date-day-month' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateDayMonth(elementToFormat));
          }
          case 'date-day-monthname-bg' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthbg(elementToFormat));
          }
          case 'date-day-monthname-cs' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthcs(elementToFormat));
          }
          case 'date-day-monthname-da' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthdk(elementToFormat));
          }
          case 'date-day-monthname-de' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthde(elementToFormat));
          }
          case 'date-day-monthname-el' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthel(elementToFormat));
          }
          case 'date-day-monthname-en' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthen(elementToFormat));
          }
          case 'date-day-monthname-es' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthes(elementToFormat));
          }
          case 'date-day-monthname-et' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthet(elementToFormat));
          }
          case 'date-day-monthname-fi' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthfi(elementToFormat));
          }
          case 'date-day-monthname-fr' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthfr(elementToFormat));
          }
          case 'date-day-monthname-hr' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthhr(elementToFormat));
          }
          case 'date-day-monthname-it' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthit(elementToFormat));
          }
          case 'date-day-monthname-lv' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthlv(elementToFormat));
          }
          case 'date-day-monthname-nl' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthnl(elementToFormat));
          }
          case 'date-day-monthname-no' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthno(elementToFormat));
          }
          case 'date-day-monthname-pl' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthpl(elementToFormat));
          }
          case 'date-day-monthname-pt' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthpt(elementToFormat));
          }
          case 'date-day-monthname-ro' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthro(elementToFormat));
          }
          case 'date-day-monthname-sk' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthsk(elementToFormat));
          }
          case 'date-day-monthname-sl' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthsl(elementToFormat));
          }
          case 'date-day-monthname-sv' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthdk(elementToFormat));
          }
          case 'date-day-monthroman' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthroman(elementToFormat));
          }
          case 'date-day-month-year' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthyearTR4(elementToFormat));
          }
          case 'date-day-monthname-year-bg' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthyearbg(elementToFormat));
          }
          case 'date-day-monthname-year-cs' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthyearcs(elementToFormat));
          }
          case 'date-day-monthname-year-da' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthyeardk(elementToFormat));
          }
          case 'date-day-monthname-year-de' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthyearde(elementToFormat));
          }
          case 'date-day-monthname-year-el' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthyearel(elementToFormat));
          }
          case 'date-day-monthname-year-en' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthyearen(elementToFormat));
          }
          case 'date-day-monthname-year-es' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthyeares(elementToFormat));
          }
          case 'date-day-monthname-year-et' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthyearet(elementToFormat));
          }
          case 'date-day-monthname-year-fi' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthyearfi(elementToFormat));
          }
          case 'date-day-monthname-year-fr' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthyearfr(elementToFormat));
          }
          case 'date-day-monthname-year-hi' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthyearinTR4(elementToFormat));
          }
          case 'date-day-monthname-year-hr' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthyearhr(elementToFormat));
          }
          case 'date-day-monthname-year-it' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthyearit(elementToFormat));
          }
          case 'date-day-monthname-year-nl' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthyearnl(elementToFormat));
          }
          case 'date-day-monthname-year-no' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthyearno(elementToFormat));
          }
          case 'date-day-monthname-year-pl' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthyearpl(elementToFormat));
          }
          case 'date-day-monthname-year-pt' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthyearpt(elementToFormat));
          }
          case 'date-day-monthname-year-ro' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthyearro(elementToFormat));
          }
          case 'date-day-monthname-year-sk' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthyearsk(elementToFormat));
          }
          case 'date-day-monthname-year-sl' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthyearsl(elementToFormat));
          }
          case 'date-day-monthname-year-sv' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthyeardk(elementToFormat));
          }
          case 'date-day-monthroman-year' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthyearroman(elementToFormat));
          }
          case 'date-ind-day-monthname-year-hi' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.calINDayMonthYear(elementToFormat));
          }
          case 'date-jpn-era-year-month-day' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateEraYearMonthDayJP(elementToFormat));
          }
          case 'date-jpn-era-year-month' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateEraYearMonthJP(elementToFormat));
          }
          case 'date-monthname-day-en' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateMonthDayEN(elementToFormat));
          }
          case 'date-monthname-day-hu' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datemonthdayhu(elementToFormat));
          }
          case 'date-monthname-day-lt' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datemonthdaylt(elementToFormat));
          }
          case 'date-monthname-day-year-en' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateMonthDayYearEN(elementToFormat));
          }
          case 'date-month-day' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateMonthDay(elementToFormat));
          }
          case 'date-month-day-year' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateMonthDayYear(elementToFormat));
          }
          case 'date-month-year' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datemonthyear(elementToFormat));
          }
          case 'date-monthname-year-bg' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datemonthyearbg(elementToFormat));
          }
          case 'date-monthname-year-cs' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datemonthyearcs(elementToFormat));
          }
          case 'date-monthname-year-da' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datemonthyeardk(elementToFormat));
          }
          case 'date-monthname-year-de' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datemonthyearde(elementToFormat));
          }
          case 'date-monthname-year-el' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datemonthyearel(elementToFormat));
          }
          case 'date-monthname-year-en' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datemonthyearen(elementToFormat));
          }
          case 'date-monthname-year-es' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datemonthyeares(elementToFormat));
          }
          case 'date-monthname-year-et' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datemonthyearet(elementToFormat));
          }
          case 'date-monthname-year-fi' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datemonthyearfi(elementToFormat));
          }
          case 'date-monthname-year-fr' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datemonthyearfr(elementToFormat));
          }
          case 'date-monthname-year-hi' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datemonthyearin(elementToFormat));
          }
          case 'date-monthname-year-hr' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datemonthyearhr(elementToFormat));
          }
          case 'date-monthname-year-it' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datemonthyearit(elementToFormat));
          }
          case 'date-monthname-year-nl' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datemonthyearnl(elementToFormat));
          }
          case 'date-monthname-year-no' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datemonthyearno(elementToFormat));
            
          }
          case 'date-monthname-year-pl' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datemonthyearpl(elementToFormat));
            
          }
          case 'date-monthname-year-pt' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datemonthyearpt(elementToFormat));
            
          }
          case 'date-monthname-year-ro' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datemonthyearro(elementToFormat));
            
          }
          case 'date-monthname-year-sk' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datemonthyearsk(elementToFormat));
            
          }
          case 'date-monthname-year-sl' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datemonthyearsl(elementToFormat));
            
          }
          case 'date-monthname-year-sv' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datemonthyeardk(elementToFormat));
            
          }
          case 'date-monthroman-year' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datemonthyearroman(elementToFormat));
            
          }
          case 'date-year-day-monthname-lv' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateyeardaymonthlv(elementToFormat));
            
          }
          case 'date-year-month' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateyearmonthTR4(elementToFormat));
            
          }
          case 'date-year-month-day' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateYearMonthDay(elementToFormat));
            
          }
          case 'date-year-monthname-en' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateyearmonthen(elementToFormat));
            
          }
          case 'date-year-monthname-hu' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateyearmonthhu(elementToFormat));
            
          }
          case 'date-year-monthname-day-hu' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateyearmonthdayhu(elementToFormat));
            
          }
          case 'date-year-monthname-day-lt' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateyearmonthdaylt(elementToFormat));
            
          }
          case 'date-year-monthname-lt' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateyearmonthlt(elementToFormat));
            
          }
          case 'date-year-monthname-lv' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.dateyearmonthlv(elementToFormat));
            
          }
          case 'fixed-empty' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersOther.noContent(elementToFormat));
            
          }
          case 'fixed-false' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersBoolean.booleanFalse(elementToFormat));
            
          }
          case 'fixed-true' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersBoolean.booleanTrue(elementToFormat));
            
          }
          case 'fixed-zero' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersNumber.fixedZero(elementToFormat));
            
          }
          case 'num-comma-decimal' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersNumber.numCommaDecimalTR4(elementToFormat),
                true);
            
          }
          case 'num-dot-decimal' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersNumber.numDotDecimalTR4(elementToFormat),
                true);
            
          }
          case 'num-unit-decimal' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersNumber.numUnitDecimalTR4(elementToFormat),
                true);
            
          }
            
            // HF: TR5 functions
          case 'date-day-monthname-cy' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthcy(elementToFormat));
          }
          case 'date-day-monthname-year-cy' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datedaymonthyearcy(elementToFormat));
          }
          case 'date-monthname-year-cy' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersDate.datemonthyearcy(elementToFormat));
            
          }
          case 'num-comma-decimal-apos' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersNumber.numCommaDecimalAposTR5(elementToFormat),
                true);
            
          }
          case 'num-dot-decimal-apos' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersNumber.numDotDecimalAposTR5(elementToFormat),
                true);
            
          }
          case 'num-unit-decimal-apos' : {
            return FiltersNumber.numberFormatting(elementToFormat, FiltersNumber.numUnitDecimalAposTR5(elementToFormat),
                true);
            
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
        newElement.setAttribute('class', 'collapse d-block collapse-modal-partial');
        newElement.setAttribute('id', 'collapse-taxonomy');
        
        newElement.innerHTML = elementToFormat.innerHTML;
        containerElement.appendChild(newElement);
        
        var button = document.createElement('button');
        button.setAttribute('class', 'btn btn-primary btn-sm mt-1');
        button.setAttribute('type', 'button');
        button.setAttribute('data-bs-toggle', 'collapse');
        button.setAttribute('data-bs-target', '#collapse-taxonomy');
        var content = document.createTextNode('Contract / Expand');
        
        button.appendChild(content);
        containerElement.appendChild(button);
      } else {
        containerElement.textContent = elementToFormat.textContent;
      }
    }
    
    return FiltersNumber.numberFormatting(element, he.unescape(containerElement.innerHTML));
    
  },
  
  getFormattedValueForContinuedAt : function( element ) {
     
    var containerElement = document.createElement('div');
    var newElement = document.createElement('div');
    newElement.setAttribute('class', 'collapse d-block collapse-modal-partial text-break');
    newElement.setAttribute('id', 'collapse-modal');
    
    element.forEach(function( current ) {
      var duplicateNode = current.cloneNode(true);
      
      FiltersValue.recursivelyFixHTMLTemp(duplicateNode);
      newElement.appendChild(duplicateNode);
      
    });
    // dev for continue-at transformation issue
     if ( element[0].hasAttribute('format') ) {
        newElement.setAttribute('format', element[0].getAttribute('format'));
        return FiltersValue.getCorrectFormatBasedOnNamespace(newElement);
    }
    var button = document.createElement('button');
    button.setAttribute('class', 'btn btn-primary btn-sm mt-1');
    button.setAttribute('type', 'button');
    button.setAttribute('data-bs-toggle', 'collapse');
    button.setAttribute('data-bs-target', '#collapse-modal');
    
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
    newElement.setAttribute('class', 'collapse d-block collapse-modal-partial');
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
      // remove width attribute from the duplicated node(s)
      if ( duplicateNode && duplicateNode.style && duplicateNode.style.width ) {
        
        duplicateNode.style.width = null;
      }
      newElement.appendChild(duplicateNode);
    });
    var button = document.createElement('button');
    button.setAttribute('class', 'btn btn-primary btn-sm mt-1');
    button.setAttribute('type', 'button');
    button.setAttribute('data-bs-toggle', 'collapse');
    button.setAttribute('data-bs-target', '#collapse-modal');
    
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
    element.removeAttribute('enabled-taxonomy');
    element.removeAttribute('highlight-taxonomy');
    element.removeAttribute('selected-taxonomy');
    element.removeAttribute('hover-taxonomy');
    element.removeAttribute('onclick');
    element.removeAttribute('onkeyup');
    element.removeAttribute('onmouseenter');
    element.removeAttribute('onmouseleave');
    element.removeAttribute('isamountsonly');
    element.removeAttribute('istextonly');
    element.removeAttribute('iscalculationsonly');
    element.removeAttribute('isnegativesonly');
    element.removeAttribute('isadditionalitemsonly');
    element.removeAttribute('isstandardonly');
    element.removeAttribute('iscustomonly');
    element.removeAttribute('tabindex');
    
    element.style.width = null;
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
