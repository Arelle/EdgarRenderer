/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';
var ConstantsNumber = {
  
  getSmallNumber : {
    'zero' : 0,
    'one' : 1,
    'two' : 2,
    'three' : 3,
    'four' : 4,
    'five' : 5,
    'six' : 6,
    'seven' : 7,
    'eight' : 8,
    'nine' : 9,
    'ten' : 10,
    'eleven' : 11,
    'twelve' : 12,
    'thirteen' : 13,
    'fourteen' : 14,
    'fifteen' : 15,
    'sixteen' : 16,
    'seventeen' : 17,
    'eighteen' : 18,
    'nineteen' : 19,
    'twenty' : 20,
    'thirty' : 30,
    'forty' : 40,
    'fifty' : 50,
    'sixty' : 60,
    'seventy' : 70,
    'eighty' : 80,
    'ninety' : 90
  },
  
  getMagnitude : {
    'thousand' : 1000,
    'million' : 1000000,
    'billion' : 1000000000,
    'trillion' : 1000000000000,
    'quadrillion' : 1000000000000000,
    'quintillion' : 1000000000000000000,
    'sextillion' : 1000000000000000000000,
    'septillion' : 1000000000000000000000000,
    'octillion' : 1000000000000000000000000000,
    'nonillion' : 1000000000000000000000000000000,
    'decillion' : 1000000000000000000000000000000000
  },
  
  getDevanagariDigitsToNormal : function( input ) {
    
    if ( input && typeof input === 'string' ) {
      
      var normal = '';
      for ( var i = 0; i < input.length; i++ ) {
        var d = input[i];
        if ( '\u0966' <= d && d <= '\u096F' ) {
          normal += String.fromCharCode(d.charCodeAt(0) - 0x0966 + '0'.charCodeAt(0));
        } else {
          normal += d;
        }
      }
      return normal;
    }
    return '09';
    
  },
  
  textToNumber : function( input ) {
    
    var wordSplitPattern = /[\s|-|\u002D\u002D\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D]+/g;
    var a = input.toString().split(wordSplitPattern);
    var n = new BigNumber(0);
    var g = new BigNumber(0);
    
    for ( var i = 0; i < a.length; i++ ) {
      var w = a[i];
      var x = ConstantsNumber.getSmallNumber[w];
      if ( x && x !== null ) {
        g = g.plus(x);
      } else if ( w === 'hundred' ) {
        g = g.times(100);
      } else {
        x = ConstantsNumber.getMagnitude[w];
        
        if ( x && x !== null ) {
          
          var tempMagnitude = new BigNumber(x);
          var tempAddition = g.times(tempMagnitude);
          n = n.plus(tempAddition);
          g = new BigNumber(0);
        } else {
          return 'ixt:text2numError ' + w;
        }
      }
    }
    return n.plus(g);
  },
  
 lastindex : function( m ) { 
    // HF: python match result .lastindex, match group number
    var mLastindex = 0;
    if (m) {
        for ( var i = 0; i < m.length; i++ ) {
          if ( m[i] ) {
            mLastindex = i;
        }
      }
    }
    return mLastindex;
 },
  
  zeroPadTwoDigits : function( input ) {
    if ( input.toString().length === 1 ) {
      return '0' + input.toString();
    }
    return input;
  }
};
