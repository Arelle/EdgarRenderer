/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var ConstantsDate = {
  
  eraStart : {
    '\u4EE4\u548C' : 2018,
    '\u4EE4' : 2018,
    '\u5E73\u6210' : 1988,
    '\u5E73' : 1988,
    '\u660E\u6CBB' : 1867,
    '\u660E' : 1867,
    '\u5927\u6B63' : 1911,
    '\u5927' : 1911,
    '\u662D\u548C' : 1925,
    '\u662D' : 1925
  },
  
  gregorianLastMoDay : [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ],
  
  sakaMonthLength : [ 30, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30 ],
  
  sakaMonthOffset : [
      [ 3, 22, 0 ],
      [ 4, 21, 0 ],
      [ 5, 22, 0 ],
      [ 6, 22, 0 ],
      [ 7, 23, 0 ],
      [ 8, 23, 0 ],
      [ 9, 23, 0 ],
      [ 10, 23, 0 ],
      [ 11, 22, 0 ],
      [ 12, 22, 0 ],
      [ 1, 21, 1 ],
      [ 2, 20, 1 ] ],
  
  getGregorianHindiMonthNumber : {
    '\u091C\u0928\u0935\u0930\u0940' : '01',
    '\u092B\u0930\u0935\u0930\u0940' : '02',
    '\u092E\u093E\u0930\u094D\u091A' : '03',
    '\u0905\u092A\u094D\u0930\u0948\u0932' : '04',
    '\u092E\u0908' : '05',
    '\u091C\u0942\u0928' : '06',
    '\u091C\u0941\u0932\u093E\u0908' : '07',
    '\u0905\u0917\u0938\u094D\u0924' : '08',
    '\u0938\u093F\u0924\u0902\u092C\u0930' : '09',
    '\u0905\u0915\u094D\u0924\u0942\u092C\u0930' : '10',
    '\u0928\u0935\u092E\u094D\u092C\u0930' : '11',
    '\u0926\u093F\u0938\u092E\u094D\u092C\u0930' : '12'
  },
  
  getSakaMonthNumber : {
    'Chaitra' : 1,
    '\u091A\u0948\u0924\u094D\u0930' : 1,
    'Vaisakha' : 2,
    'Vaishakh' : 2,
    'Vai\u015B\u0101kha' : 2,
    '\u0935\u0948\u0936\u093E\u0916' : 2,
    '\u092C\u0948\u0938\u093E\u0916' : 2,
    'Jyaishta' : 3,
    'Jyaishtha' : 3,
    'Jyaistha' : 3,
    'Jye\u1E63\u1E6Dha' : 3,
    '\u091C\u094D\u092F\u0947\u0937\u094D\u0920' : 3,
    'Asadha' : 4,
    'Ashadha' : 4,
    '\u0100\u1E63\u0101\u1E0Dha' : 4,
    '\u0906\u0937\u093E\u0922' : 4,
    '\u0906\u0937\u093E\u0922\u093C' : 4,
    'Sravana' : 5,
    'Shravana' : 5,
    '\u015Ar\u0101va\u1E47a' : 5,
    '\u0936\u094D\u0930\u093E\u0935\u0923' : 5,
    '\u0938\u093E\u0935\u0928' : 5,
    'Bhadra' : 6,
    'Bhadrapad' : 6,
    'Bh\u0101drapada' : 6,
    'Bh\u0101dra' : 6,
    'Pro\u1E63\u1E6Dhapada' : 6,
    '\u092D\u093E\u0926\u094D\u0930\u092A\u0926' : 6,
    '\u092D\u093E\u0926\u094B' : 6,
    'Aswina' : 7,
    'Ashwin' : 7,
    'Asvina' : 7,
    '\u0100\u015Bvina' : 7,
    '\u0906\u0936\u094D\u0935\u093F\u0928' : 7,
    'Kartiak' : 8,
    'Kartik' : 8,
    'Kartika' : 8,
    'K\u0101rtika' : 8,
    '\u0915\u093E\u0930\u094D\u0924\u093F\u0915' : 8,
    'Agrahayana' : 9,
    'Agrah\u0101ya\u1E47a' : 9,
    'Margashirsha' : 9,
    'M\u0101rga\u015B\u012Br\u1E63a' : 9,
    '\u092E\u093E\u0930\u094D\u0917\u0936\u0940\u0930\u094D\u0937' : 9,
    '\u0905\u0917\u0939\u0928' : 9,
    'Pausa' : 10,
    'Pausha' : 10,
    'Pau\u1E63a' : 10,
    '\u092A\u094C\u0937' : 10,
    'Magha' : 11,
    'Magh' : 11,
    'M\u0101gha' : 11,
    '\u092E\u093E\u0918' : 11,
    'Phalguna' : 12,
    'Phalgun' : 12,
    'Ph\u0101lguna' : 12,
    '\u092B\u093E\u0932\u094D\u0917\u0941\u0928' : 12
  },
  
  getDuration : function( input ) {
    var possibleFloat = parseFloat(input);
    
    if ( isNaN(possibleFloat) ) {
      return {
        negative : false,
        value : null,
        error : true
      };
    }
    var negative = false;
    if ( !isNaN(possibleFloat) && possibleFloat < 0 ) {
      negative = true;
    }
    return {
      negative : negative,
      value : Math.abs(possibleFloat),
      error : false
    };
  },
  
  getSakaYearPadding : function( year, month, day ) {
    // zero pad to 4 digits
    
    if ( year && typeof year !== 'boolean' && typeof year !== 'object' && (typeof year === 'string' || !isNaN(year)) ) {
      if ( typeof year === 'number' ) {
        year = year.toString();
      }
      if ( year.length === 2 ) {
        if ( year > '21' || (year === '21' && month >= 10 && day >= 11) ) {
          return '19' + year;
        }
        return '20' + year;
        
      }
      return year;
    }
    return null;
    
  },
  
  getSakaToGregorian : function( inputYear, inputMonth, inputDay ) {
    if ( typeof inputYear === 'number' && typeof inputMonth === 'number' && typeof inputDay === 'number' ) {
      
      // offset from Saka to Gregorian year
      var gregorianYear = inputYear + 78;
      // Saka year starts in leap year
      var sStartsInLeapYr = (gregorianYear % 4 === 0 && (gregorianYear % 100 !== 0 || gregorianYear % 400 === 0));
      if ( gregorianYear < 0 ) {
        return 'Saka calendar year not supported: ' + inputYear + ' ' + inputMonth + ' ' + inputDay;
      }
      if ( inputMonth < 1 || inputMonth > 12 ) {
        return 'Saka calendar month error: ' + inputYear + ' ' + inputMonth + ' ' + inputDay;
      }
      var inputMonthLength = ConstantsDate.sakaMonthLength[inputMonth - 1];
      if ( sStartsInLeapYr && inputMonth === 1 ) {
        // Chaitra has 1 extra day when starting in gregorian leap years
        inputMonthLength += 1;
      }
      if ( inputDay < 1 || inputDay > inputMonthLength ) {
        return 'Saka calendar day error: ' + inputYear + ' ' + inputMonth + ' ' + inputDay;
      }
      // offset Saka to Gregorian by Saka month
      var sakaMonthOffset = ConstantsDate.sakaMonthOffset[inputMonth - 1];
      var gregorianMonth = sakaMonthOffset[0];
      var gregorianDayOffset = sakaMonthOffset[1];
      var gregorianYearOffset = sakaMonthOffset[2];
      if ( sStartsInLeapYr && inputMonth === 1 ) {
        // Chaitra starts 1 day earlier when starting in Gregorian leap
        // years
        gregorianDayOffset -= 1;
      }
      // later Saka months offset into next Gregorian year
      gregorianYear += gregorianYearOffset;
      // month length (days in month)
      var gregorianMonthLength = ConstantsDate.gregorianLastMoDay[gregorianMonth - 1];
      // does Phalguna (Feb) end in a Gregorian leap year?
      if ( gregorianMonth === 2 && gregorianYear % 4 === 0 && (gregorianYear % 100 !== 0 || gregorianYear % 400 === 0) ) {
        // Phalguna (Feb) is in a Gregorian leap year (Feb has 29 days)
        gregorianMonthLength += 1;
      }
      var gregorianDay = gregorianDayOffset + inputDay - 1;
      if ( gregorianDay > gregorianMonthLength ) {
        // overflow from Gregorial month of start of Saka month to next
        // Gregorian
        // month
        gregorianDay -= gregorianMonthLength;
        gregorianMonth += 1;
        if ( gregorianMonth === 13 ) {
          // overflow from Gregorian year of start of Saka year to
          // following
          // Gregorian year
          gregorianMonth = 1;
          gregorianYear += 1;
        }
      }
      return gregorianYear + '-' + gregorianMonth + '-' + gregorianDay;
    }
    return null;
  }

};
