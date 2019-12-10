/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var FiltersDate = {
  
  eraYear : function( era, year ) {
    if ( (era && typeof era === 'string' && ConstantsDate.eraStart[era]) && (year && typeof year === 'string') ) {
      return ConstantsDate.eraStart[era] + (year === '\u5143' ? 1 : parseInt(year));
    }
    return null;
  },
  
  dateQuarterEnd : function( element ) {
    if ( element && typeof element === 'object' && element['innerText'] ) {
      
      var year = element.innerText.match(/\d{4}/)[0];
      var month;
      var day;
      
      var quarter = element.innerText.match(/1st|first|q1|2nd|second|q2|3rd|third|q3|4th|fourth|last|q4/gi);
      
      if ( quarter && quarter[0] ) {
        
        switch ( quarter[0].toLowerCase() ) {
          case ('1st') : {
            month = "03";
            day = "31";
            break;
          }
          case ('first') : {
            month = "03";
            day = "31";
            break;
          }
          case ('q1') : {
            month = "03";
            day = "31";
            break;
          }
          case ('2nd' || 'second' || 'q2') : {
            month = "06";
            day = "30";
            break;
          }
          case ('second') : {
            month = "06";
            day = "30";
            break;
          }
          case ('q2') : {
            month = "06";
            day = "30";
            break;
          }
          case ('3rd') : {
            month = "09";
            day = "30";
            break;
          }
          case ('third') : {
            month = "09";
            day = "30";
            break;
          }
          case ('q3') : {
            month = "09";
            day = "30";
            break;
          }
          case ('4th') : {
            month = "12";
            day = "31";
            break;
          }
          case ('fourth') : {
            month = "12";
            day = "31";
            break;
          }
          case ('last') : {
            month = "12";
            day = "31";
            break;
          }
          case ('q4') : {
            month = "12";
            day = "31";
            break;
          }
          default : {
            return 'Format Error: Date Quarter End';
          }
        }
      } else {
        return 'Format Error: Date Quarter End';
      }
      
      var result = moment(year + '-' + month + '-' + day, 'YYYY-MM-DD');
      if ( !result.isValid() ) {
        return 'Format Error: Date Quarter End';
      }
      return result.format('YYYY-MM-DD');
      
    }
    return 'Format Error: Date Quarter End';
    
  },
  
  calINDayMonthYear : function( element ) {
    
    if ( element && typeof element === 'object' && element['innerText'] ) {
      
      var regex = /^\s*([0-9\u0966-\u096F]{1,2})\s([\u0966-\u096F]{2}|[^\s0-9\u0966-\u096F]+)\s([0-9\u0966-\u096F]{2}|[0-9\u0966-\u096F]{4})\s*$/;
      
      var regexSakaMonth = /(C\S*ait|\u091A\u0948\u0924\u094D\u0930)|(Vai|\u0935\u0948\u0936\u093E\u0916|\u092C\u0948\u0938\u093E\u0916)|(Jy|\u091C\u094D\u092F\u0947\u0937\u094D\u0920)|(dha|\u1E0Dha|\u0906\u0937\u093E\u0922|\u0906\u0937\u093E\u0922\u093C)|(vana|\u015Ar\u0101va\u1E47a|\u0936\u094D\u0930\u093E\u0935\u0923|\u0938\u093E\u0935\u0928)|(Bh\S+dra|Pro\u1E63\u1E6Dhapada|\u092D\u093E\u0926\u094D\u0930\u092A\u0926|\u092D\u093E\u0926\u094B)|(in|\u0906\u0936\u094D\u0935\u093F\u0928)|(K\S+rti|\u0915\u093E\u0930\u094D\u0924\u093F\u0915)|(M\S+rga|Agra|\u092E\u093E\u0930\u094D\u0917\u0936\u0940\u0930\u094D\u0937|\u0905\u0917\u0939\u0928)|(Pau|\u092A\u094C\u0937)|(M\S+gh|\u092E\u093E\u0918)|(Ph\S+lg|\u092B\u093E\u0932\u094D\u0917\u0941\u0928)/;
      
      var result = regex.exec(element.innerText);
      
      if ( result ) {
        var resultSaka = regexSakaMonth.exec(result[2]);
        
        if ( resultSaka ) {
          var month = 0;
          for ( month = resultSaka.length - 1; month >= 0; month -= 1 ) {
            if ( resultSaka[month] ) {
              var day = parseInt(ConstantsNumber.getDevanagariDigitsToNormal(result[1]));
              
              var year = parseInt(ConstantsNumber.getDevanagariDigitsToNormal(ConstantsDate.getSakaYearPadding(
                  result[3], month, day)));
              
              var result = moment(ConstantsDate.getSakaToGregorian(year, month, day), [ 'YYYY-MM-DD', 'YYYY-M-D' ],
                  true);
              
              if ( !result.isValid() ) {
                return 'Format Error: Cal IN Day Month Year';
              }
              return result.format('YYYY-MM-DD');
              break;
            }
          }
        }
      }
    }
    return 'Format Error: Cal IN Day Month Year';
    
  },
  
  dateDayMonth : function( element ) {
    if ( element && typeof element === 'object' && element['innerText'] ) {
      var result = moment(element.innerText, 'DDMM');
      if ( !result.isValid() ) {
        return 'Format Error: Date Day Month';
      }
      return result.format('--MM-DD');
    }
    return 'Format Error: Date Day Month';
    
  },
  
  dateDayMonthDK : function( element ) {
    if ( element && typeof element === 'object' && element['innerText'] ) {
      var regex = /^\s*([0-9]{1,2})[^0-9]+(jan|feb|mar|apr|maj|jun|jul|aug|sep|okt|nov|dec)([A-Za-z]*)([.]*)\s*$/i;
      
      var result = regex.exec(element.innerText);
      
      if ( result && result.length === 5 ) {
        
        var month = result[2];
        var day = result[1];
        
        var monthEnd = result[3];
        var monthPer = result[4];
        
        if ( ((!monthEnd && !monthPer) || (!monthEnd && monthPer) || (monthEnd && !monthPer)) && '01' <= day
            && day <= moment(month, 'MMM').daysInMonth() ) {
          var dateResult = moment(day + '-' + month, 'DD-MMM');
          
          if ( !dateResult.isValid() ) {
            return 'Format Error: Date Day Month DK';
          }
          return dateResult.format('--MM-DD');
        }
      }
    }
    return 'Format Error: Date Day Month DK';
  },
  
  dateDayMonthEN : function( element ) {
    if ( element && typeof element === 'object' && element['innerText'] ) {
      var regex = /^\s*([0-9]{1,2})[^0-9]+(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)\s*$/;
      var result = regex.exec(element.innerText);
      if ( result ) {
        var month = result[2];
        var day = result[1];
        var dateResult = moment(day + '-' + month, 'DD-MMM');
        
        if ( !dateResult.isValid() ) {
          return 'Format Error: Date Day Month EN';
        }
        return dateResult.format('--MM-DD');
      }
    }
    return 'Format Error: Date Day Month EN';
    
  },
  
  dateDayMonthYear : function( element ) {
    if ( element && typeof element === 'object' && element['innerText'] ) {
      var regex = /^\s*([0-9]{1,2})[^0-9]+([0-9]{1,2})[^0-9]+([0-9]{4}|[0-9]{1,2})\s*$/;
      
      var result = regex.exec(element.innerText);
      
      if ( result ) {
        
        var dateResult = moment(element.innerText, [
            'DD MM YY',
            'DD.MM.YYYY',
            'DD.MM.Y',
            'DD.MM.YY',
            'D.M.YY',
            'DD/MM/YY' ], true);
        if ( !dateResult.isValid() ) {
          return 'Format Error: Date Day Month Year';
        }
        
        if ( dateResult.year().toString().length === 1 ) {
          dateResult.year(2000 + dateResult.year());
        }
        if ( dateResult.year().toString().length === 2 ) {
          dateResult.year(2000 + dateResult.year());
        }
        
        if ( dateResult.year().toString().length === 3 && result[3].length === 3 ) {
          return 'Format Error: Date Day Month Year';
        }
        return dateResult.format('YYYY-MM-DD');
      }
      
    }
    return 'Format Error: Date Day Month Year';
  },
  
  dateDayMonthYearDK : function( element ) {
    if ( element && typeof element === 'object' && element['innerText'] ) {
      
      var regex = /^\s*([0-9]{1,2})[^0-9]+(jan|feb|mar|apr|maj|jun|jul|aug|sep|okt|nov|dec)([A-Za-z]*)([.]*)[^0-9]*([0-9]{4}|[0-9]{1,2})\s*$/i;
      
      var result = regex.exec(element.innerText);
      
      if ( result ) {
        var year = result[5];
        var day = result[1];
        var month = moment().month(result[2]).format('M');
        
        var monthEnd = result[3];
        var monthPer = result[4];
        
        if ( month && ((!monthEnd && !monthPer) || (!monthEnd && monthPer)) || (monthEnd && !monthPer) ) {
          var dateResult = moment();
          
          var dateResult = moment(day + '-' + month + '-' + year, 'DD-M-YYYY');
          
          if ( !dateResult.isValid() ) {
            return 'Format Error: Date Day Month DK';
          }
          
          if ( dateResult.year().toString().length === 1 ) {
            dateResult.year(2000 + dateResult.year());
          }
          if ( dateResult.year().toString().length === 2 ) {
            dateResult.year(2000 + dateResult.year());
          }
          
          return dateResult.format('YYYY-MM-DD');
        }
      }
    }
    return 'Format Error: Date Day Month Year DK';
  },
  
  dateDayMonthYearEN : function( element ) {
    if ( element && typeof element === 'object' && element['innerText'] ) {
      
      var regex = /^\s*([0-9]{1,2})[^0-9]+(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)[^0-9]+([0-9]{4}|[0-9]{1,2})\s*$/;
      var result = regex.exec(element.innerText);
      if ( result ) {
        var month = result[2];
        var day = result[1];
        var year = result[3];
        var dateResult = moment(day + '-' + month + '-' + year, 'DD-MMM-Y');
        if ( !dateResult.isValid() ) {
          return 'Format Error: Date Day Month Year EN';
        }
        
        if ( dateResult.year().toString().length === 1 ) {
          dateResult.year(2000 + dateResult.year());
        }
        if ( dateResult.year().toString().length === 2 ) {
          dateResult.year(2000 + dateResult.year());
        }
        
        return dateResult.format('YYYY-MM-DD');
      }
    }
    return 'Format Error: Date Day Month Year EN';
  },
  
  dateDayMonthYearIN : function( element ) {
    if ( element && typeof element === 'object' && element['innerText'] ) {
      
      var regex = /^\s*([0-9\u0966-\u096F]{1,2})\s([\u0966-\u096F]{2}|[^\s0-9\u0966-\u096F]+)\s([0-9\u0966-\u096F]{2}|[0-9\u0966-\u096F]{4})\s*$/;
      var result = regex.exec(element.innerText);
      if ( result ) {
        var year = ConstantsNumber.getDevanagariDigitsToNormal(result[3]);
        
        var month;
        if ( ConstantsDate.getGregorianHindiMonthNumber[ConstantsNumber.getDevanagariDigitsToNormal(result[2])] ) {
          month = ConstantsDate.getGregorianHindiMonthNumber[ConstantsNumber.getDevanagariDigitsToNormal(result[2])];
        } else {
          month = ConstantsNumber.getDevanagariDigitsToNormal(result[2]);
        }
        
        var day = ConstantsNumber.getDevanagariDigitsToNormal(result[1]);
        
        var dateResult = moment(day + '-' + month + '-' + year, 'DD-MM-YYYY');
        
        if ( !dateResult.isValid() ) {
          return 'Format Error: Date Day Month Year IN';
        }
        return dateResult.format('YYYY-MM-DD');
      }
    }
    return 'Format Error: Date Day Month Year IN';
    
  },
  
  dateDotEU : function( element ) {
    if ( element && typeof element === 'object' && element['innerText'] ) {
      var result = moment(element.innerText, 'DD.MM.Y');
      if ( !result.isValid() ) {
        return 'Format Error: Date Dot EU';
      }
      return result.format('YYYY-MM-DD');
    }
    return 'Format Error: Date Dot EU';
  },
  
  dateDotUS : function( element ) {
    if ( element && typeof element === 'object' && element['innerText'] ) {
      var result = moment(element.innerText, 'MM.DD.Y');
      if ( !result.isValid() ) {
        return 'Format Error: Date Dot US';
      }
      return result.format('YYYY-MM-DD');
    }
    return 'Format Error: Date Dot US';
  },
  
  dateEraYearMonthDayJP : function( element ) {
    if ( element && typeof element === 'object' && element['innerText'] ) {
      
      var regex = /^[\s ]*(\u660E\u6CBB|\u660E|\u5927\u6B63|\u5927|\u662D\u548C|\u662D|\u5E73\u6210|\u5E73|\u4EE4\u548C|\u4EE4)[\s ]*([0-9\uFF10-\uFF19]{1,2}|\u5143)[\s ]*(\u5E74)[\s ]*([0-9\uFF10-\uFF19]{1,2})[\s ]*(\u6708)[\s ]*([0-9\uFF10-\uFF19]{1,2})[\s ]*(\u65E5)[\s]*$/;
      
      var result = regex.exec(FiltersNumber.jpDigitsToNormal(element.innerText));
      
      if ( result ) {
        var year = FiltersDate.eraYear(result[1], result[2]);
        var month = result[4];
        var day = result[6];
        
        var dateResult = moment(day + '-' + month + '-' + year, 'DD-MM-Y');
        
        if ( !dateResult.isValid() ) {
          return 'Format Error: Date Era Year Month Day JP';
        }
        return dateResult.format('YYYY-MM-DD');
      }
    }
    return 'Format Error: Date Era Year Month Day JP';
  },
  
  dateEraYearMonthJP : function( element ) {
    if ( element && typeof element === 'object' && element['innerText'] ) {
      
      var regex = /^[\s ]*(\u660E\u6CBB|\u660E|\u5927\u6B63|\u5927|\u662D\u548C|\u662D|\u5E73\u6210|\u5E73|\u4EE4\u548C|\u4EE4)[\s ]*([0-9\uFF10-\uFF19]{1,2}|\u5143)[\s ]*(\u5E74)[\s ]*([0-9\uFF10-\uFF19]{1,2})[\s ]*(\u6708)[\s ]*$/;
      
      var result = regex.exec(FiltersNumber.jpDigitsToNormal(element.innerText));
      if ( result ) {
        
        var year = FiltersDate.eraYear(result[1], result[2]);
        var month = result[4];
        
        var dateResult = moment(month + '-' + year, 'MM-Y');
        if ( !dateResult.isValid() ) {
          return 'Format Error: Date Era Year Month JP';
        }
        return dateResult.format('YYYY-MM');
      }
    }
    return 'Format Error: Date Era Year Month JP';
    
  },
  
  dateLongMonthYear : function( element ) {
    if ( element && typeof element === 'object' && element['innerText'] ) {
      var result = moment(element.innerText, [ 'MMMM YY', 'MMMM YYYY' ], true);
      if ( !result.isValid() ) {
        return 'Format Error: Date Long Month Year';
      }
      return result.format('YYYY-MM');
    }
    return 'Format Error: Date Long Month Year';
  },
  
  dateLongUK : function( element ) {
    if ( element && typeof element === 'object' && element['innerText'] ) {
      var result = moment(element.innerText, 'DD MMM YY');
      if ( !result.isValid() ) {
        return 'Format Error: Date Long UK';
      }
      return result.format('YYYY-MM-DD');
    }
    return 'Format Error: Date Long UK';
  },
  
  dateLongUS : function( element ) {
    if ( element && typeof element === 'object' && element['innerText'] ) {
      var result = moment(element.innerText, 'MMM DD, YY');
      if ( !result.isValid() ) {
        return 'Format Error: Date Long US';
      }
      return result.format('YYYY-MM-DD');
    }
    return 'Format Error: Date Long US';
  },
  
  dateLongYearMonth : function( element ) {
    if ( element && typeof element === 'object' && element['innerText'] ) {
      
      var result = moment(element.innerText, 'YY MMM');
      if ( !result.isValid() ) {
        return 'Format Error: Date Long Year Month';
      }
      return result.format('YYYY-MM');
    }
    return 'Format Error: Date Long Year Month';
    
  },
  
  dateMonthDay : function( element ) {
    if ( element && typeof element === 'object' && element['innerText'] ) {
      
      var result = moment(element.innerText, 'MMDD');
      if ( !result.isValid() ) {
        return 'Format Error: Date Month Day';
      }
      return result.format('--MM-DD');
    }
    return 'Format Error: Date Month Day';
    
  },
  
  dateMonthDayEN : function( element ) {
    if ( element && typeof element === 'object' && element['innerText'] ) {
      
      var regex = /^\s*(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)[^0-9]+([0-9]{1,2})[A-Za-z]{0,2}\s*$/;
      
      var result = regex.exec(element.innerText);
      
      if ( result ) {
        var month = result[1];
        var day = result[2];
        
        var dateResult = moment(month + '-' + day, 'MMM-DD');
        
        if ( !dateResult.isValid() ) {
          return 'Format Error: Date Month Day EN';
        }
        
        return dateResult.format('--MM-DD');
      }
    }
    return 'Format Error: Date Month Day EN';
    
  },
  
  dateMonthDayYear : function( element ) {
    if ( element && typeof element === 'object' && element['innerText'] ) {
      
      var regex = /^\s*([0-9]{1,2})[^0-9]+([0-9]{1,2})[^0-9]+([0-9]{4}|[0-9]{1,2})\s*$/;
      
      var result = regex.exec(element.innerText);
      
      if ( result ) {
        var year = result[3];
        var month = result[1];
        var day = result[2];
        
        var dateResult = moment(year + '-' + month + '-' + day, [ 'YY-MM-DD', 'YYYY-MM-DD' ]);
        if ( !dateResult.isValid() ) {
          return 'Format Error: Date Month Day Year';
        }
        return dateResult.format('YYYY-MM-DD');
      }
    }
    return 'Format Error: Date Month Day Year';
    
  },
  
  dateMonthDayYearEN : function( element ) {
    if ( element && typeof element === 'object' && element['innerText'] ) {
      
      var regex = /^\s*(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)[^0-9]+([0-9]+)[^0-9]+([0-9]{4}|[0-9]{1,2})\s*$/;
      
      var result = regex.exec(element.innerText);
      
      if ( result ) {
        var year = result[3];
        var month = result[1];
        var day = result[2];
        
        var dateResult = moment(year + '-' + month + '-' + day, [ 'YY-MM-DD', 'YYYY-MMM-DD' ]);
        if ( !dateResult.isValid() ) {
          return 'Format Error: Date Month Day Year EN';
        }
        if ( dateResult.year().toString().length === 1 ) {
          dateResult.year(2000 + dateResult.year());
        }
        if ( dateResult.year().toString().length === 2 ) {
          dateResult.year(2000 + dateResult.year());
        }
        return dateResult.format('YYYY-MM-DD');
      }
    }
    return 'Format Error: Date Month Day Year EN';
  },
  
  dateMonthYear : function( element ) {
    if ( element && typeof element === 'object' && element['innerText'] ) {
      
      var regex = /^[\s\u00A0]*([0-9]{1,2})[^0-9]+([0-9]{4}|[0-9]{1,2})[\s\u00A0]*$/;
      var result = regex.exec(element.innerText);
      
      if ( result ) {
        var year = result[2];
        var month = result[1];
        
        var dateResult = moment(year + '-' + month, [ 'YYYY-MM' ]);
        if ( !dateResult.isValid() ) {
          return 'Format Error: Date Month Year';
        }
        if ( dateResult.year().toString().length === 1 ) {
          dateResult.year(2000 + dateResult.year());
        }
        if ( dateResult.year().toString().length === 2 ) {
          dateResult.year(2000 + dateResult.year());
        }
        
        return dateResult.format('YYYY-MM');
      }
    }
    return 'Format Error: Date Month Year';
    
  },
  
  dateMonthYearDK : function( element ) {
    if ( element && typeof element === 'object' && element['innerText'] ) {
      
      var regex = /^\s*(jan|feb|mar|apr|maj|jun|jul|aug|sep|okt|nov|dec)([A-Za-z]*)([.]*)[^0-9]*([0-9]{4}|[0-9]{1,2})\s*$/i;
      var result = regex.exec(element.innerText);
      
      if ( result ) {
        var year = result[4];
        var month = result[1];
        
        var dateResult = moment(year + '-' + month, [ 'YYYY-MMM', 'YY-MMM', 'Y-MMM' ], true);
        
        if ( !dateResult.isValid() ) {
          return 'Format Error: Date Month Year DK';
        }
        if ( dateResult.year().toString().length === 1 ) {
          dateResult.year(2000 + dateResult.year());
        }
        if ( dateResult.year().toString().length === 2 ) {
          dateResult.year(2000 + dateResult.year());
        }
        return dateResult.format('YYYY-MM');
        
      }
    }
    return 'Format Error: Date Month Year DK';
    
  },
  
  dateMonthYearEN : function( element ) {
    if ( element && typeof element === 'object' && element['innerText'] ) {
      
      var regex = /^\s*(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)[^0-9]+([0-9]{1,2}|[0-9]{4})\s*$/;
      var result = regex.exec(element.innerText);
      
      if ( result ) {
        var year = result[2];
        var month = result[1];
        
        var dateResult = moment(year + '-' + month, [ 'YYYY-MMM' ]);
        if ( !dateResult.isValid() ) {
          return 'Format Error: Date Month Year EN';
        }
        if ( dateResult.year().toString().length === 1 ) {
          dateResult.year(2000 + dateResult.year());
        }
        if ( dateResult.year().toString().length === 2 ) {
          dateResult.year(2000 + dateResult.year());
        }
        return dateResult.format('YYYY-MM');
        
      }
    }
    return 'Format Error: Date Month Year EN';
    
  },
  
  dateMonthYearIN : function( element ) {
    if ( element && typeof element === 'object' && element['innerText'] ) {
      
      var regex = /^\s*([^\s0-9\u0966-\u096F]+)\s([0-9\u0966-\u096F]{4})\s*$/;
      var result = regex.exec(element.innerText);
      if ( result ) {
        if ( result[1] in ConstantsDate.getGregorianHindiMonthNumber ) {
          var year = ConstantsNumber.getDevanagariDigitsToNormal(result[2]);
          var month = ConstantsDate.getGregorianHindiMonthNumber[result[1]];
          var dateResult = moment(month + '-' + year, 'MM-YYYY');
          if ( !dateResult.isValid() ) {
            return 'Format Error: Date Month Year IN';
          }
          return dateResult.format('YYYY-MM');
        }
      }
    }
    return 'Format Error: Date Month Year IN';
  },
  
  dateShortDayMonthUK : function( element ) {
    if ( element && typeof element === 'object' && element['innerText'] ) {
      var result = moment(element.innerText, 'DD MM');
      if ( !result.isValid() ) {
        return 'Format Error: Date Short Day Month UK';
      }
      return result.format('--MM-DD');
    }
    return 'Format Error: Date Short Day Month UK';
    
  },
  
  dateShortEU : function( element ) {
    if ( element && typeof element === 'object' && element['innerText'] ) {
      return 'TODO';
    }
    
    return 'Format Error: Date Short EU';
  },
  
  dateShortMonthDayUS : function( element ) {
    if ( element && typeof element === 'object' && element['innerText'] ) {
      var result = moment(element.innerText, 'MMM DD');
      if ( !result.isValid() ) {
        return 'Format Error: Date Short Month Day US';
      }
      return result.format('--MM-DD');
    }
    return 'Format Error: Date Short Month Day US';
  },
  
  dateShortMonthYear : function( element ) {
    if ( element && typeof element === 'object' && element['innerText'] ) {
      
      var result = moment(element.innerText, 'MMM YYYY');
      if ( !result.isValid() ) {
        return 'Format Error: Date Short Month Year US';
      }
      return result.format('YYYY-MM');
    }
    return 'Format Error: Date Short Month Year US';
    
  },
  
  dateShortUK : function( element ) {
    if ( element && typeof element === 'object' && element['innerText'] ) {
      
      var result = moment(element.innerText, [ 'DD MMM YY', 'DD MMM YYYY' ]);
      if ( !result.isValid() ) {
        return 'Format Error: Date Short UK';
      }
      return result.format('YYYY-MM-DD');
    }
    return 'Format Error: Date Short UK';
    
  },
  
  dateShortUS : function( element ) {
    if ( element && typeof element === 'object' && element['innerText'] ) {
      
      var result = moment(element.innerText, [ 'MMM DD, YY', 'MMM DD, YYYY' ]);
      if ( !result.isValid() ) {
        return 'Format Error: Date Short US';
      }
      return result.format('YYYY-MM-DD');
    }
    return 'Format Error: Date Short US';
    
  },
  
  dateShortYearMonth : function( element ) {
    if ( element && typeof element === 'object' && element['innerText'] ) {
      
      var result = moment(element.innerText, [ 'YY MMM', 'YYYY MMM' ]);
      if ( !result.isValid() ) {
        return 'Format Error: Date Short Year Month';
      }
      return result.format('YYYY-MM');
    }
    return 'Format Error: Date Short Year Month';
    
  },
  
  dateSlashDayMonthEU : function( element ) {
    if ( element && typeof element === 'object' && element['innerText'] ) {
      
      var result = moment(element.innerText, 'DD/MM');
      if ( !result.isValid() ) {
        return 'Format Error: Date Slash Day Month EU';
      }
      return result.format('--MM-DD');
    }
    return 'Format Error: Date Slash Day Month EU';
  },
  
  dateSlashEU : function( element ) {
    if ( element && typeof element === 'object' && element['innerText'] ) {
      
      var result = moment(element.innerText, [ 'DD/MM/YY', 'DD/MM/YYYY' ]);
      if ( !result.isValid() ) {
        return 'Format Error: Date Slash EU';
      }
      return result.format('YYYY-MM-DD');
    }
    return 'Format Error: Date Slash EU';
    
  },
  
  dateSlashMonthDayUS : function( element ) {
    if ( element && typeof element === 'object' && element['innerText'] ) {
      
      var result = moment(element.innerText, 'MM/DD');
      if ( !result.isValid() ) {
        return 'Format Error: Date Slash Month Day US';
      }
      return result.format('--MM-DD');
    }
    return 'Format Error: Date Slash Month Day US';
  },
  
  dateSlashUS : function( element ) {
    if ( element && typeof element === 'object' && element['innerText'] ) {
      
      var result = moment(element.innerText, [ 'MM/DD/YY', 'MM/DD/YYYY' ]);
      if ( !result.isValid() ) {
        return 'Format Error: Date Slash EU';
      }
      return result.format('YYYY-MM-DD');
    }
    return 'Format Error: Date Slash EU';
    
  },
  
  dateYearMonthCJK : function( element ) {
    if ( element && typeof element === 'object' && element['innerText'] ) {
      
      var regex = /^[\s\u00A0]*([0-9]{4}|[0-9]{1,2})[\s\u00A0]*\u5E74[\s\u00A0]*([0-9]{1,2})[\s\u00A0]*\u6708\s*$/;
      var result = regex.exec(FiltersNumber.jpDigitsToNormal(element.innerText));
      if ( result ) {
        var month = result[2];
        var year = result[1];
        var dateResult = moment(year + '-' + month, 'YYYY-MM');
        if ( !dateResult.isValid() ) {
          return 'Format Error: Date Year Month CJK';
        }
        
        if ( dateResult.year().toString().length === 1 ) {
          dateResult.year(2000 + dateResult.year());
        }
        if ( dateResult.year().toString().length === 2 ) {
          dateResult.year(2000 + dateResult.year());
        }
        
        return dateResult.format('YYYY-MM');
      }
    }
    return 'Format Error: Date Year Month CJK';
    
  },
  
  dateYearMonthDay : function( element ) {
    if ( element && typeof element === 'object' && element['innerText'] ) {
      
      var fromJP = FiltersNumber.jpDigitsToNormal(element.innerText);
      
      var regex = /^[\s\u00A0]*([0-9]{4}|[0-9]{1,2})[^0-9]+([0-9]{1,2})[^0-9]+([0-9]{1,2})[\s\u00A0]*$/;
      
      var result = regex.exec(fromJP);
      
      if ( result ) {
        var year = result[1];
        var month = result[2];
        var day = result[3];
        
        var dateResult = moment(year + '-' + month + '-' + day, [
            'YYYY-MM-DD',
            'YYYY-MM-D',
            'YYYY-M-DD',
            'YY-M-DD',
            'Y-M-DD' ], true);
        
        if ( !dateResult.isValid() ) {
          return 'Format Error: Date Year Month Day';
        }
        if ( dateResult.year().toString().length === 1 ) {
          dateResult.year(2000 + dateResult.year());
        }
        if ( dateResult.year().toString().length === 2 ) {
          dateResult.year(2000 + dateResult.year());
        }
        return dateResult.format('YYYY-MM-DD');
      }
    }
    return 'Format Error: Date Year Month Day';
    
  },
  
  dateYearMonthDayCJK : function( element ) {
    if ( element && typeof element === 'object' && element['innerText'] ) {
      
      var regex = /^[\s\u00A0]*([0-9]{4}|[0-9]{1,2})[\s\u00A0]*\u5E74[\s\u00A0]*([0-9]{1,2})[\s\u00A0]*\u6708[\s\u00A0]*([0-9]{1,2})[\s\u00A0]*\u65E5[\s\u00A0]*$/;
      var result = regex.exec(FiltersNumber.jpDigitsToNormal(element.innerText));
      if ( result ) {
        var year = result[1];
        var month = result[2];
        var day = result[3];
        var dateResult = moment(year + '-' + month + '-' + day, 'YYYY-MM-DD');
        if ( !dateResult.isValid() ) {
          return 'Format Error: Date Year Month Day CJK';
        }
        
        if ( dateResult.year().toString().length === 1 ) {
          dateResult.year(2000 + dateResult.year());
        }
        if ( dateResult.year().toString().length === 2 ) {
          dateResult.year(2000 + dateResult.year());
        }
        
        return dateResult.format('YYYY-MM-DD');
      }
    }
    return 'Format Error: Date Year Month Day CJK';
  },
  
  dateYearMonthEN : function( element ) {
    if ( element && typeof element === 'object' && element['innerText'] ) {
      
      var regex = /^\s*([0-9]{1,2}|[0-9]{4})[^0-9]+(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)\s*$/;
      
      var result = regex.exec(element.innerText);
      if ( result ) {
        var month = result[2];
        var year = result[1];
        var dateResult = moment(month + '-' + year, 'MMM-Y');
        if ( !dateResult.isValid() ) {
          return 'Format Error: Date Year Month EN';
        }
        
        if ( dateResult.year().toString().length === 1 ) {
          dateResult.year(2000 + dateResult.year());
        }
        if ( dateResult.year().toString().length === 2 ) {
          dateResult.year(2000 + dateResult.year());
        }
        
        return dateResult.format('YYYY-MM');
        
      }
    }
    return 'Format Error: Date Year Month EN';
  },
  
 printDurationType : function ( y, m, d, h, negative ){
  // preprocess each value so we don't print P0Y0M0D
  // in this case, we should print P0Y, and leave out the months and days.
  var sign="";
  if (negative){
sign="-"; }
 var empty = true;
  empty = empty && (y === null || y === 0);
  empty = empty && (m === null || m === 0);
  empty = empty && (d === null || d === 0);
  empty = empty && (h === null || h === 0);
  // zero is a special case.
  // don't need to print -P0Y, just print P0Y
  if ( empty ) { 
    sign = ""; 
    var hitFirstZeroYet = false;
    if ( y !== null && y === 0 ) {
      hitFirstZeroYet = true;
    }
    if ( m !== null && m === 0 ) {
      if ( hitFirstZeroYet ) {
        m = null;
      } else {
        hitFirstZeroYet = true;
      }
    }
    if ( d !== null && d === 0 ) {
      if ( hitFirstZeroYet ) {
        d = null;
      } else {
        hitFirstZeroYet = true;
      }
    }
    if ( h !== null && h === 0 && hitFirstZeroYet ) {
      if ( hitFirstZeroYet ) {
        h = null;
      } else {
        hitFirstZeroYet = true;
      }
    }
}
  var output = sign + "P";
  if ( y !== null){
  output += y.toString() + "Y"; }
  if ( m !== null){
  output += m.toString() + "M"; }
  if ( d !== null){
  output += d.toString() + "D"; }
  if ( h !== null){
  output += "T" + h.toString() + "H"; }
  return output;
},

  durYear : function( element ) {

    if ( element && typeof element === 'object' && element['innerText'] ) {
      
      var durationObj = ConstantsDate.getDuration(element.innerText);
    
      if ( durationObj.error ) {
        return 'Format Error: Dur Year';
      }
    
      var years = Math.floor(durationObj.value);
      var months = ((durationObj.value - years) * 12);
      var days = ((months - Math.floor(months)) * 30.4375);
if (months === 0){
(months = null); }
if (days === 0){
(days = null); }
var toReturn = FiltersDate.printDurationType(years, months!==null?Math.floor(months):null, days!==null?Math.floor(days):null, null, durationObj.negative);
    return toReturn;
    }
    return 'Format Error: Dur Year';
  }, 
  
  durMonth : function( element ) {
    if ( element && typeof element === 'object' && element['innerText'] ) {
      var durationObj = ConstantsDate.getDuration(element.innerText);
      if ( durationObj.error ) {
        return 'Format Error: Dur Month';
      }
      var months = Math.floor(durationObj.value);
      var days = Math.floor((durationObj.value - months) * 30.4375);
if (days === 0) {
(days = null); }
var toReturn = FiltersDate.printDurationType(null, months, days!==null?Math.floor(days):null, null, durationObj.negative);
    return toReturn;
      
    }
    return 'Format Error: Dur Month';
    
  },
  
  durWeek : function( element ) {
    if ( element && typeof element === 'object' && element['innerText'] ) {
      var durationObj = ConstantsDate.getDuration(element.innerText);
      if ( durationObj.error ) {
        return 'Format Error: Dur Week';
      }
var days = Math.floor(durationObj.value * 7);
var toReturn = FiltersDate.printDurationType(null, null, Math.floor(days), null, durationObj.negative);
    return toReturn;
     
    }
    return 'Format Error: Dur Month';
    
  },
  
  durDay : function( element ) {
    if ( element && typeof element === 'object' && element['innerText'] ) {
      var durationObj = ConstantsDate.getDuration(element.innerText);
      if ( durationObj.error ) {
        return 'Format Error: Dur Day';
      }
      var days;
      var hours;
      if ( durationObj.value ) {
        days = Math.floor(durationObj.value);
        hours = Math.floor((durationObj.value - days) * 24);
      } else {
        days = Math.floor(durationObj.value);
        hours = Math.floor((durationObj.value - days) * 24);
      } 
      
      if ( hours === 0 ) {
        hours = null;
      }
      
      /* if ( hours ) {
        return durationObj.negative ? '-P' + Math.floor(days) + 'D' + Math.floor(hours) + 'H' : 'P' + Math.floor(days)
            + 'D' + Math.floor(hours) + 'H';
      }
      return durationObj.negative ? '-P' + Math.floor(days) + 'D' : 'P' + Math.floor(days) + 'D'; */
      return FiltersDate.printDurationType(null, null, days, hours, durationObj.negative);
    }
    return 'Format Error: Dur Day';
  },
  
  durHour : function( element ) {
    if ( element && typeof element === 'object' && element['innerText'] ) {
      var durationObj = ConstantsDate.getDuration(element.innerText);
      if ( durationObj.error ) {
        return 'Format Error: Dur Hour';
      }
      
      var hours = Math.floor(durationObj.value);
      
      // return durationObj.negative ? '-PT' + Math.floor(hours) + 'H' : 'PT' + Math.floor(hours) + 'H';
return FiltersDate.printDurationType(null, null, null, hours, durationObj.negative);
      
    }
    return 'Format Error: Dur Hour';
  },
  
  durWordsEn : function( element ) {
    if ( element && typeof element === 'object' && element['innerText'] ) {
      
      var regex = /^\s*((((([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)([\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D\-]|\s+)+[Hh]undred([\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D\s-]+(and[\s]+)?(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)(([\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D-]|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))?)|(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)(([\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D-]|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))|[Zz]ero|[Nn]o|[0-9][0-9]{0,3})[\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D\s-]+[Yy]ears?(,?[\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D\s-]+(and[\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D\s-]+)?|$))?((((([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)[\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D\s-]+[Hh]undred([\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D\s-]+(and[\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D\s-]+)?(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)(([\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D-]|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))?)|(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)(([\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D-]|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))|[Zz]ero|[Nn]o|[0-9][0-9]{0,3})[\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D\s-]+[Mm]onths?(,?[\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D\s-]+(and[\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D\s-]+)?|$))?((((([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)[\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D\s-]+[Hh]undred([\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D\s-]+(and[\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D\s-]+)?(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)(([\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D-]|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))?)|(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)(([\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D-]|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))|[Zz]ero|[Nn]o|[0-9][0-9]{0,3})[\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D\s-]+[Dd]ays?)?\s*$/;
      var secondRegex = /^\s*[\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D-]?([Zz]ero|[Nn]o(ne)?)[\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D-]?\s*$/;
      var thirdRegex = /,|\sand\s/g;
      var result = regex.exec(element.innerText);
      if ( result && element.innerText.trim().length > 0 ) {
        var dur = 'P';
        var grp = [ [ 1 + 1, 'Y' ], [ 62 + 1, 'M' ], [ 122 + 1, 'D' ] ];
        for ( var i = 0; i < grp.length; i++ ) {
          var groupIndex = grp[i][0];
          var groupSuffix = grp[i][1];
          var groupPart = result[groupIndex];
          if ( groupPart && groupPart !== null ) {
            if ( secondRegex.exec(groupPart) === null ) {
              if ( isNaN(groupPart) ) {
                var tmp = groupPart.trim().toLowerCase().replace(thirdRegex, ' ');
                dur += ConstantsNumber.textToNumber(tmp);
              } else {
                dur += groupPart;
              }
              dur += groupSuffix;
            }
          }
        }
        return (dur.length > 1) ? dur : "P0D";
      }
      
    }
    return 'Format Error: Dur Words EN';
  }
};
