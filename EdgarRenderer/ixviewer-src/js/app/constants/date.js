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
  },
        
        // HF: TR4 date constants
  getYr4 : function( arg ) {
    if (arg) {
        if (arg.length === 1) {
            return '200' + arg;
        } else if (arg.length === 2) {
            return '20' + arg;
        }
    }
    return arg;
  },
        
maxDayInMo : {"01": "31",
              "02": "29",
              "03": "31",
              "04": "30",
              "05": "31",
              "06": "30",
              "07": "31",
              "08": "31",
              "09": "30",
              "10": "31",
              "11": "30",
              "12":"31",
              1: "31",
              2: "29",
              3: "31",
              4: "30",
              5: "31",
              6: "30",
              7: "31",
              8: "31",
              9: "30"},
  
monthnumber : {
               "january":1,
              "february":2,
              "march":3,
              "april":4,
              "may":5,
              "june":6, 
               "july":7,
              "august":8,
              "september":9,
              "october":10,
              "november":11,
              "december":12, 
               "jan":1,
              "feb":2,
              "mar":3,
              "apr":4,
              "jun":6, 
               "jul":7,
              "aug":8,
              "sep":9,
              "oct":10,
              "nov":11,
              "dec":12, 
               // bulgarian
               "\u044f\u043d":1,
              "\u0444\u0435\u0432":2,
              "\u043c\u0430\u0440":3,
              "\u0430\u043f\u0440":4,
              "\u043c\u0430\u0439":5,
              "\u043c\u0430\u0438":5,
              "\u044e\u043d\u0438":6,
               "\u044e\u043b\u0438":7,
              "\u0430\u0432\u0433":8,
              "\u0441\u0435\u043f":9,
              "\u043e\u043a\u0442":10,
              "\u043d\u043e\u0435":11,
              "\u0434\u0435\u043a":12,
               // danish
               "maj":5, 
               "okt":10, 
               // de: german
               "j\xe4n":1,
              "jaen":1,
              "m\xe4r":3,
              "maer":3,
               "mai":5,
              "dez":12,
               // el: greek
               "\u03b9\u03b1\u03bd":1,
              "\u03af\u03b1\u03bd":1,
              "i\u03b1\u03bd":1,
              "\u03c6\u03b5\u03b2":2,
              "\u03bc\u03ac\u03c1":3,
              "\u03bc\u03b1\u03c1":3, 
               "\u03b1\u03c0\u03c1":4,
              "\u03ac\u03c0\u03c1":4,
              "a\u03c0\u03c1":4,
              "\u03b1\u03c1\u03af\u03bb":4,
              "\u03ac\u03c1\u03af\u03bb":4,
              "\u03b1\u03c1\u03b9\u03bb":4,
              "\u03ac\u03c1\u03b9\u03bb":4,
              "a\u03c1\u03af\u03bb":4,
              "a\u03c1\u03b9\u03bb":4, 
               "\u03bc\u03b1\u0390":5,
              "\u03bc\u03b1\u03b9":5,
              "\u03bc\u03ac\u03b9":5,
              "\u03bc\u03b1\u03ca":5,
              "\u03bc\u03ac\u03ca":5,
               "\u03b9\u03bf\u03cd\u03bd":6,
              "\u03af\u03bf\u03cd\u03bd":6,
              "\u03af\u03bf\u03c5\u03bd":6,
              "\u03b9\u03bf\u03c5\u03bd":6,
              "i\u03bf\u03cd\u03bd":6,
              "i\u03bf\u03c5\u03bd":6, 
               "\u03b9\u03bf\u03cd\u03bb":7,
              "\u03af\u03bf\u03cd\u03bb":7,
              "\u03af\u03bf\u03c5\u03bb":7,
              "\u03b9\u03bf\u03c5\u03bb":7,
              "i\u03bf\u03cd\u03bb":7,
              "i\u03bf\u03c5\u03bb":7, 
               "\u03b1\u03cd\u03b3":8,
              "\u03b1\u03c5\u03b3":8, 
               "\u03c3\u03b5\u03c0":9,
              "\u03bf\u03ba\u03c4":10,
              "\u03cc\u03ba\u03c4":10,
              "o\u03ba\u03c4":10,
              "\u03bd\u03bf\u03ad":11,
              "\u03bd\u03bf\u03b5":11,
              "\u03b4\u03b5\u03ba":12,
               // es: spanish (differences)
               "ene":1,
              "abr":4,
              "ago":8,
              "dic":12,
               // et: estonian (differences)
               "jaan":1,
              "veebr":2,
              "m\xe4rts":3,
              "marts":3,
              "juuni":6,
              "juuli":7,
              "sept":9,
              "dets":12,
               // fr: french (differences)
               "janv":1,
              "f\xe9vr":2,
              "fevr":2,
              "mars":3,
              "avr":4,
              "juin":6,
              "juil":7,
              "ao\xfbt":8,
              "aout":8,
              "d\xe9c":12, 
               // hu: hungary (differences)
               "m\xe1rc":3,
              "marc":3,
              "\xe1pr":4,
              "m\xe1j":5,
              "j\xfan":6,
              "j\xfal":7,
              "szept":9, 
               // it: italy (differences)
               "gen":1,
              "mag":5,
              "giu":6,
              "lug":7,
              "set":9,
              "ott":10, 
               // lv: latvian (differences)
               "febr":2,
              "maijs":5,
              "j\u016bn":6,
              "j\u016bl":7, 
               // nl: dutch (differences)
               "maa":3,
              "mrt":3,
              "mei":5, 
               // no: norway
               "des":12, 
               // pt: portugese (differences)
               "fev":2,
              "out":10, 
               // ro: romanian (differences)
               "ian":1,
              "iun":6,
              "iul":7,
              "noi":11,
               // sk: skovak (differences)
               // sl: sloveniabn
               "avg":8
               },

monthnumbercs : {"ledna":1,
              "leden":1,
              "lednu":1,
              "\xfanora":2,
              "unora":2,
              "\xfanoru":2,
              "unoru":2,
              "\xfanor":2,
              "unor":2, 
                 "b\u0159ezna":3,
              "brezna":3,
              "b\u0159ezen":3,
              "brezen":3,
              "b\u0159eznu":3,
              "breznu":3,
              "dubna":4,
              "duben":4,
              "dubnu":4, 
                 "kv\u011btna":5,
              "kvetna":5,
              "kv\u011bten":5,
              "kveten":5,
              "kv\u011btnu":5,
              "kvetnu":5,
                "\u010dervna":6,
              "cervna":6,
              "\u010dervnu":6,
              "cervnu":6,
              "\u010dervence":7,
              "cervence":7, 
                "\u010derven":6,
              "cerven":6,
              "\u010dervenec":7,
              "cervenec":7,
              "\u010dervenci":7,
              "cervenci":7,
                "srpna":8,
              "srpen":8,
              "srpnu":8,
              "z\xe1\u0159\xed":9,
              "zari":9, 
                "\u0159\xedjna":10,
              "rijna":10,
              "\u0159\xedjnu":10,
              "rijnu":10,
              "\u0159\xedjen":10,
              "rijen":10,
              "listopadu":11,
              "listopad":11, 
                "prosince":12,
              "prosinec":12,
              "prosinci":12,
                "led":1,
              "\xfano":2,
              "uno":2,
              "b\u0159e":3,
              "bre":3,
              "dub":4,
              "kv\u011b":5,
              "kve":5,
                "\u010dvn":6,
              "cvn":6,
              "\u010dvc":7,
              "cvc":7,
              "srp":8,
              "z\xe1\u0159":9,
              "zar":9,
                "\u0159\xedj":10,
              "rij":10,
              "lis":11,
              "pro":12},

monthnumbercy : {"ion":1,
              "chwe":2,
              "maw":3,
              "ebr":4,
              "mai":5,
              "meh":6,
              "gor":7,
              "aws":8,
              "med":9,
              "hyd":10,
              "tach":11,
              "rhag":12,
              "ION":1,
              "CHWE":2,
              "MAW":3,
              "EBR":4,
              "MAI":5,
              "MEH":6,
              "GOR":7,
              "AWS":8,
              "MED":9,
              "HYD":10,
              "TACH":11,
              "RHAG":12,
              "Ion":1,
              "Chwe":2,
              "Maw":3,
              "Ebr":4,
              "Mai":5,
              "Meh":6,
              "Gor":7,
              "Aws":8,
              "Med":9,
              "Hyd":10,
              "Tach":11,
              "Rhag":12},

monthnumberfi : {"tam":1,
              "hel":2,
              "maa":3,
              "huh":4,
              "tou":5,
              "kes":6,
              "hei":7,
              "elo":8,
              "syy":9,
              "lok":10,
              "mar":11,
              "jou":12},

monthnumberhr : {"sij":1,
              "velj":2,
              "o\u017eu":3,
              "ozu":3,
              "tra":4,
              "svi":5,
              "lip":6,
              "srp":7,
              "kol":8,
              "ruj":9,
              "lis":10,
              "stu":11,
              "pro":12},

monthnumberlt : {"sau":1,
              "vas":2,
              "kov":3,
              "bal":4,
              "geg":5,
              "bir":6,
              "lie":7,
              "rugp":8,
              "rgp":8,
              "rugs":9,
              "rgs":9,
              "spa":10,
              "spl":10,
              "lap":11,
              "gru":12,
              "grd":12},

monthnumberpl : {"sty":1,
              "lut":2,
              "mar":3,
              "kwi":4,
              "maj":5,
              "cze":6,
              "lip":7,
              "sie":8,
              "wrz":9,
              "pa\u017a":10,
              "paz":10,
              "lis":11,
              "gru":12},

monthnumberroman : {"i":1,
              "ii":2,
              "iii":3,
              "iv":4,
              "v":5,
              "vi":6,
              "vii":7,
              "viii":8,
              "ix":9,
              "x":10,
              "xi":11,
              "xii":12}


};
