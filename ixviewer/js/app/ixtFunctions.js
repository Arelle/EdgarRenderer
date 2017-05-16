/*
@author: Mark V Systems Limited (contributed to Arelle open source XBRL platform)
(c) Copyright 2011 Mark V Systems Limited, All rights reserved. 
Provided under the Apache-2 license (see http://arelle.org).
*/

function ixtTransform(ns, localName, text) {	
	var ixtFunctions = ixtNamespaceFunctions[ns];
	if (!ixtFunctions) {
		return "no transformations for namespace " + ns;
	} else {
		var ixtFunction = ixtFunctions[localName];
		if (!ixtFunction) {
			return localName + " transformation not implemented in namespace " + ns;
		} else {
			return ixtFunction(text);
		}
	}
}

var dateslashPattern = /^\s*(\d+)\/(\d+)\/(\d+)\s*$/;
var daymonthslashPattern = /^\s*([0-9]{1,2})\/([0-9]{1,2})\s*$/;
var monthdayslashPattern = /^\s*([0-9]{1,2})\/([0-9]{1,2})\s*$/;
var datedotPattern = /^\s*(\d+)\.(\d+)\.(\d+)\s*$/;
var daymonthPattern = /^\s*([0-9]{1,2})[^0-9]+([0-9]{1,2})\s*$/;
var monthdayPattern = /^\s*([0-9]{1,2})[^0-9]+([0-9]{1,2})[A-Za-z]*\s*$/;
var daymonthyearPattern = /^\s*([0-9]{1,2})[^0-9]+([0-9]{1,2})[^0-9]+([0-9]{4}|[0-9]{1,2})\s*$/;
var monthdayyearPattern = /^\s*([0-9]{1,2})[^0-9]+([0-9]{1,2})[^0-9]+([0-9]{4}|[0-9]{1,2})\s*$/;

var dateUsPattern = /^\s*(\w+)\s+(\d+),\s+(\d+)\s*$/;
var dateEuPattern = /^\s*(\d+)\s+(\w+)\s+(\d+)\s*$/;
var daymonthDkPattern = /^\s*([0-9]{1,2})[^0-9]+(jan|feb|mar|apr|maj|jun|jul|aug|sep|okt|nov|dec)([A-Za-z]*)([.]*)\s*$/i;
var daymonthEnPattern = /^\s*([0-9]{1,2})[^0-9]+(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)\s*$/;
var monthdayEnPattern = /^\s*(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)[^0-9]+([0-9]{1,2})[A-Za-z]{0,2}\s*$/;
var daymonthyearDkPattern = /^\s*([0-9]{1,2})[^0-9]+(jan|feb|mar|apr|maj|jun|jul|aug|sep|okt|nov|dec)([A-Za-z]*)([.]*)[^0-9]*([0-9]{4}|[0-9]{1,2})\s*$/i;
var daymonthyearEnPattern = /^\s*([0-9]{1,2})[^0-9]+(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)[^0-9]+([0-9]{4}|[0-9]{1,2})\s*$/;
var daymonthyearInPattern = /^\s*([0-9\u0966-\u096F]{1,2})\s([\u0966-\u096F]{2}|[^\s0-9\u0966-\u096F]+)\s([0-9\u0966-\u096F]{2}|[0-9\u0966-\u096F]{4})\s*$/;
var monthdayyearEnPattern = /^\s*(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)[^0-9]+([0-9]+)[^0-9]+([0-9]{4}|[0-9]{1,2})\s*$/;
var monthyearDkPattern = /^\s*(jan|feb|mar|apr|maj|jun|jul|aug|sep|okt|nov|dec)([A-Za-z]*)([.]*)[^0-9]*([0-9]{4}|[0-9]{1,2})\s*$/i
var monthyearEnPattern = /^\s*(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)[^0-9]+([0-9]{1,2}|[0-9]{4})\s*$/;
var monthyearInPattern = /^\s*([^\s0-9\u0966-\u096F]+)\s([0-9\u0966-\u096F]{4})\s*$/;
var yearmonthEnPattern = /^\s*([0-9]{1,2}|[0-9]{4})[^0-9]+(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)\s*$/;

// TR1-only patterns, only allow space separators, no all-CAPS month name, only 2 or 4 digit years
var daymonthShortEnTR1Pattern = /^\s*([0-9]{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*$/;
var monthdayShortEnTR1Pattern = /^\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+([0-9]{1,2})[A-Za-z]{0,2}\s*$/;
var monthyearShortEnTR1Pattern = /^\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+([0-9]{2}|[0-9]{4})\s*$/;
var monthyearLongEnTR1Pattern = /^\s*(January|February|March|April|May|June|July|August|September|October|November|December)\s+([0-9]{2}|[0-9]{4})\s*$/;
var yearmonthShortEnTR1Pattern = /^\s*([0-9]{2}|[0-9]{4})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*$/;
var yearmonthLongEnTR1Pattern = /^\s*([0-9]{2}|[0-9]{4})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s*$/;

var erayearmonthjpPattern = /^[\s\u00A0]*(\u660E\u6CBB|\u660E|\u5927\u6B63|\u5927|\u662D\u548C|\u662D|\u5E73\u6210|\u5E73)[\s\u00A0]*([0-9]{1,2}|\u5143)[\s\u00A0]*\u5E74[\s\u00A0]*([0-9]{1,2})[\s\u00A0]*\u6708[\s\u00A0]*$/;
var erayearmonthdayjpPattern = /^[\s\u00A0]*(\u660E\u6CBB|\u660E|\u5927\u6B63|\u5927|\u662D\u548C|\u662D|\u5E73\u6210|\u5E73)[\s\u00A0]*([0-9]{1,2}|\u5143)[\s\u00A0]*\u5E74[\s\u00A0]*([0-9]{1,2})[\s\u00A0]*\u6708[\s\u00A0]*([0-9]{1,2})[\s\u00A0]*\u65E5[\s\u00A0]*$/;
var yearmonthcjkPattern = /^[\s\u00A0]*([0-9]{4}|[0-9]{1,2})[\s\u00A0]*\u5E74[\s\u00A0]*([0-9]{1,2})[\s\u00A0]*\u6708\s*$/;
var yearmonthdaycjkPattern = /^[\s\u00A0]*([0-9]{4}|[0-9]{1,2})[\s\u00A0]*\u5E74[\s\u00A0]*([0-9]{1,2})[\s\u00A0]*\u6708[\s\u00A0]*([0-9]{1,2})[\s\u00A0]*\u65E5[\s\u00A0]*$/;

var monthyearPattern = /^[\s\u00A0]*([0-9]{1,2})[^0-9]+([0-9]{4}|[0-9]{1,2})[\s\u00A0]*$/;
var yearmonthdayPattern = /^[\s\u00A0]*([0-9]{4}|[0-9]{1,2})[^0-9]+([0-9]{1,2})[^0-9]+([0-9]{1,2})[\s\u00A0]*$/;

var zeroDashPattern = /^\s*([-]|\u002D|\u002D|\u058A|\u05BE|\u2010|\u2011|\u2012|\u2013|\u2014|\u2015|\uFE58|\uFE63|\uFF0D)\s*$/;
var numDotDecimalPattern = /^\s*[0-9]{1,3}([, \xA0]?[0-9]{3})*(\.[0-9]+)?\s*$/;
var numDotDecimalInPattern = /^(([0-9]{1,2}[, \xA0])?([0-9]{2}[, \xA0])*[0-9]{3})([.][0-9]+)?$|^([0-9]+)([.][0-9]+)?$/;
var numCommaDecimalPattern = /^\s*[0-9]{1,3}([. \xA0]?[0-9]{3})*(,[0-9]+)?\s*$/;
var numUnitDecimalPattern = /^([0]|([1-9][0-9]{0,2}([.,\uFF0C\uFF0E]?[0-9]{3})*))[^0-9,.\uFF0C\uFF0E]+([0-9]{1,2})[^0-9,.\uFF0C\uFF0E]*$/;
var numUnitDecimalInPattern = /^(([0-9]{1,2}[, \xA0])?([0-9]{2}[, \xA0])*[0-9]{3})([^0-9]+)([0-9]{1,2})([^0-9]*)$|^([0-9]+)([^0-9]+)([0-9]{1,2})([^0-9]*)$/;

var monthnumber = {
	           "January":1, "February":2, "March":3, "April":4, "May":5, "June":6, 
               "July":7, "August":8, "September":9, "October":10, "November":11, "December":12, 
               "Jan":1, "Feb":2, "Mar":3, "Apr":4, "May":5, "Jun":6, 
               "Jul":7, "Aug":8, "Sep":9, "Oct":10, "Nov":11, "Dec":12, 
               "JAN":1, "FEB":2, "MAR":3, "APR":4, "MAY":5, "JUN":6, 
               "JUL":7, "AUG":8, "SEP":9, "OCT":10, "NOV":12, "DEC":13, 
               "JANUARY":1, "FEBRUARY":2, "MARCH":3, "APRIL":4, "MAY":5, "JUNE":6, 
               "JULY":7, "AUGUST":8, "SEPTEMBER":9, "OCTOBER":10, "NOVEMBER":11, "DECEMBER":12,
               // danish
               "jan":1, "feb":2, "mar": 3, "apr":4, "maj":5, "jun":6,
               "jul":7, "aug":8, "sep":9, "okt":10, "nov":11, "dec":12
           };

var maxDayInMoTbl = {
	          "01": "30", "02": "29", "03": "31", "04": "30", "05": "31", "06": "30",
              "07": "31", "08": "31", "09": "30", "10": "31", "11": "30", "12":"31",
              1: "30", 2: "29", 3: "31", 4: "30", 5: "31", 6: "30",
              7: "31", 8: "31", 9: "30", 10: "31", 11: "30", 12:"31"};
function maxDayInMo(mo) {
	if (mo in maxDayInMoTbl)
		return maxDayInMoTbl[mo];
	return "00";
}

var gLastMoDay = [31,28,31,30,31,30,31,31,30,31,30,31];

var gregorianHindiMonthNumber = {
                "\u091C\u0928\u0935\u0930\u0940": "01",
                "\u092B\u0930\u0935\u0930\u0940": "02", 
                "\u092E\u093E\u0930\u094D\u091A": "03", 
                "\u0905\u092A\u094D\u0930\u0948\u0932": "04",
                "\u092E\u0908": "05", 
                "\u091C\u0942\u0928": "06",
                "\u091C\u0941\u0932\u093E\u0908": "07", 
                "\u0905\u0917\u0938\u094D\u0924": "08",
                "\u0938\u093F\u0924\u0902\u092C\u0930": "09",
                "\u0905\u0915\u094D\u0924\u0942\u092C\u0930": "10",
                "\u0928\u0935\u092E\u094D\u092C\u0930": "11",
                "\u0926\u093F\u0938\u092E\u094D\u092C\u0930": "12"
            };

var sakaMonthNumber = {
                "Chaitra":1, "\u091A\u0948\u0924\u094D\u0930":1,
                "Vaisakha":2, "Vaishakh":2, "Vai\u015B\u0101kha":2, "\u0935\u0948\u0936\u093E\u0916":2, "\u092C\u0948\u0938\u093E\u0916":2,
                "Jyaishta":3, "Jyaishtha":3, "Jyaistha":3, "Jye\u1E63\u1E6Dha":3, "\u091C\u094D\u092F\u0947\u0937\u094D\u0920":3,
                "Asadha":4, "Ashadha":4, "\u0100\u1E63\u0101\u1E0Dha":4, "\u0906\u0937\u093E\u0922":4, "\u0906\u0937\u093E\u0922\u093C":4,
                "Sravana":5, "Shravana":5, "\u015Ar\u0101va\u1E47a":5, "\u0936\u094D\u0930\u093E\u0935\u0923":5, "\u0938\u093E\u0935\u0928":5,
                "Bhadra":6, "Bhadrapad":6, "Bh\u0101drapada":6, "Bh\u0101dra":6, "Pro\u1E63\u1E6Dhapada":6, "\u092D\u093E\u0926\u094D\u0930\u092A\u0926":6, "\u092D\u093E\u0926\u094B":6,
                "Aswina":7, "Ashwin":7, "Asvina":7, "\u0100\u015Bvina":7, "\u0906\u0936\u094D\u0935\u093F\u0928":7, 
                "Kartiak":8, "Kartik":8, "Kartika":8, "K\u0101rtika":8, "\u0915\u093E\u0930\u094D\u0924\u093F\u0915":8, 
                "Agrahayana":9,"Agrah\u0101ya\u1E47a":9,"Margashirsha":9, "M\u0101rga\u015B\u012Br\u1E63a":9, "\u092E\u093E\u0930\u094D\u0917\u0936\u0940\u0930\u094D\u0937":9, "\u0905\u0917\u0939\u0928":9,
                "Pausa":10, "Pausha":10, "Pau\u1E63a":10, "\u092A\u094C\u0937":10,
                "Magha":11, "Magh":11, "M\u0101gha":11, "\u092E\u093E\u0918":11,
                "Phalguna":12, "Phalgun":12, "Ph\u0101lguna":12, "\u092B\u093E\u0932\u094D\u0917\u0941\u0928":12
            };
var sakaMonthPattern = /(C\S*ait|\u091A\u0948\u0924\u094D\u0930)|(Vai|\u0935\u0948\u0936\u093E\u0916|\u092C\u0948\u0938\u093E\u0916)|(Jy|\u091C\u094D\u092F\u0947\u0937\u094D\u0920)|(dha|\u1E0Dha|\u0906\u0937\u093E\u0922|\u0906\u0937\u093E\u0922\u093C)|(vana|\u015Ar\u0101va\u1E47a|\u0936\u094D\u0930\u093E\u0935\u0923|\u0938\u093E\u0935\u0928)|(Bh\S+dra|Pro\u1E63\u1E6Dhapada|\u092D\u093E\u0926\u094D\u0930\u092A\u0926|\u092D\u093E\u0926\u094B)|(in|\u0906\u0936\u094D\u0935\u093F\u0928)|(K\S+rti|\u0915\u093E\u0930\u094D\u0924\u093F\u0915)|(M\S+rga|Agra|\u092E\u093E\u0930\u094D\u0917\u0936\u0940\u0930\u094D\u0937|\u0905\u0917\u0939\u0928)|(Pau|\u092A\u094C\u0937)|(M\S+gh|\u092E\u093E\u0918)|(Ph\S+lg|\u092B\u093E\u0932\u094D\u0917\u0941\u0928)/;

var sakaMonthLength = [30,31,31,31,31,31,30,30,30,30,30,30]; // Chaitra has 31 days in Gregorian leap year
var sakaMonthOffset = [[3,22,0],[4,21,0],[5,22,0],[6,22,0],[7,23,0],[8,23,0],[9,23,0],[10,23,0],[11,22,0],[12,22,0],[1,21,1],[2,20,1]];

// common helper functions

function isValidDate(d) {
  if ( Object.prototype.toString.call(d) !== "[object Date]" )
    return false;
  return !isNaN(d.getTime());
}

function checkDate(y,m,d) {
	return isValidDate(new Date(Date.parse(yr(y) + "-" + z2(m) + "-" + z2(d))));
}

function z2(arg) {   // zero pad to 2 digits
	if (typeof(arg) == "number")
		arg = arg.toString();
    if (arg.length == 1)
        return '0' + arg;
    return arg;
}

function yr(arg) {   // zero pad to 4 digits
	if (typeof(arg) == "number")
		arg = arg.toString();
    if (arg.length == 1)
        return '200' + arg;
    else if (arg.length == 2)
        return '20' + arg;
    return arg;
}

function yrin(arg, _mo, _day) {   // zero pad to 4 digits
	if (typeof(arg) == "number")
		arg = arg.toString();
    if (arg.length == 2)
        if (arg > '21' || (arg == '21' && _mo >= 10 && _day >= 11))
            return '19' + arg;
        else
            return '20' + arg;
    return arg;
}

function devanagariDigitsToNormal(devanagariDigits) {
    var normal = '';
    for (var i=0; i<devanagariDigits.length; i++) {
    	var d = devanagariDigits[i];
        if ('\u0966' <= d && d <= '\u096F')	
            normal += String.fromCharCode( d.charCodeAt(0) - 0x0966 + '0'.charCodeAt(0) );
        else
            normal += d;
    }
    return normal
}

function jpDigitsToNormal(jpDigits) {
   normal = '';
    for (var i=0; i<jpDigits.length; i++) {
    	var d = jpDigits[i];
        if ('\uFF10' <= d && d <= '\uFF19')
            normal += String.fromCharCode( d.charCodeAt(0) - 0xFF10 + '0'.charCodeAt(0) );
        else
            normal += d;
	}
    return normal;
}
	
function sakaToGregorian(sYr, sMo, sDay) { 
    var gYr = sYr + 78;  // offset from Saka to Gregorian year
    var sStartsInLeapYr = (gYr % 4 == 0 && (gYr % 100 != 0 || gYr % 400 == 0)) // Saka yr starts in leap yr
    if (gYr < 0)
        return "Saka calendar year not supported: " + sYr + " " + sMo + " " + sDay;
    if  (sMo < 1 || sMo > 12)
        return "Saka calendar month error: " + sYr + " " + sMo + " " + sDay;
    var sMoLength = sakaMonthLength[sMo - 1];
    if (sStartsInLeapYr && sMo == 1)
        sMoLength += 1; // Chaitra has 1 extra day when starting in gregorian leap years
    if (sDay < 1 || sDay > sMoLength)
        return "Saka calendar day error: " + sYr + " " + sMo + " " +  sDay;
    var _mdy = sakaMonthOffset[sMo - 1]; // offset Saka to Gregorian by Saka month
    var gMo = _mdy[0], gDayOffset = _mdy[1], gYrOffset =_mdy[2];
    if (sStartsInLeapYr && sMo == 1)
        gDayOffset -= 1; // Chaitra starts 1 day earlier when starting in Gregorian leap years
    gYr += gYrOffset; // later Saka months offset into next Gregorian year
    var gMoLength = gLastMoDay[gMo - 1]; // month length (days in month)
    if (gMo == 2 && gYr % 4 == 0 && (gYr % 100 != 0 || gYr % 400 == 0)) // does Phalguna (Feb) end in a Gregorian leap year?
        gMoLength += 1; // Phalguna (Feb) is in a Gregorian leap year (Feb has 29 days)
    var gDay = gDayOffset + sDay - 1;
    if (gDay > gMoLength) { // overflow from Gregorial month of start of Saka month to next Gregorian month
        gDay -= gMoLength;
        gMo += 1;
        if (gMo == 13) { // overflow from Gregorian year of start of Saka year to following Gregorian year
            gMo = 1;
            gYr += 1;
        }
    }
    return [gYr, gMo, gDay];
}

// see: http://www.i18nguy.com/l10n/emperor-date.html        
eraStart = {'\u5E73\u6210': 1988, 
            '\u5E73': 1988,
            '\u660E\u6CBB': 1867,
            '\u660E': 1867,
            '\u5927\u6B63': 1911,
            '\u5927': 1911,
            '\u662D\u548C': 1925,
            '\u662D': 1925
            }

function eraYear(era,yr) {
    return eraStart[era] + (yr == '\u5143' ? 1 : parseInt(yr));
}

// transforms    

function booleanfalse(arg) {
    return "false";
}
    
function booleantrue(arg) {
    return 'true';
}

function dateslashus(arg) {
    var m = dateslashPattern.exec(arg);
    if (m)
        return yr(m[3]) + '-' + z2(m[1]) + '-' + z2(m[2]);
    return "ixt:dateError";
}
    
function dateslasheu(arg) {
    var m = dateslashPattern.exec(arg);
    if (m)
        return yr(m[3]) + '-' + z2(m[2]) + '-' + z2(m[1]);
    return "ixt:dateError";
}
    
function datedotus(arg) {
    var m = datedotPattern.exec(arg)
    if (m)
        return yr(m[3]) + '-' +  z2(m[1]) + '-' + z2(m[2]);
    return "ixt:dateError";
}
    
function datedoteu(arg) {
    var m = datedotPattern.exec(arg);
    if (m)
        return yr(m[3]) + '-' + z2(m[2]) + '-' + z2(m[1]);
    return "ixt:dateError";
}
    
function datelongus(arg) {
    var m = dateUsPattern.exec(arg);
    if (m)
        return yr(m[3]) + '-' +  z2(monthnumber[m[1]]) + '-' + z2(m[2]);
    return "ixt:dateError";
}
    
function datelongeu(arg) {
    var m = dateEuPattern.exec(arg);
    if (m)
        return yr(m[3]) + '-' + z2(monthnumber[m[2]]) + '-' + z2(m[1]);
    return "ixt:dateError";
}
    
function datedaymonth(arg) {
    var m = daymonthPattern.exec(arg);
    if (m) {
        var mo = z2(m[2]);
        var day = z2(m[1]);
        if ("01" <= day && day <= maxDayInMo(mo)) 
            return '--' + mo + '-' + day;
    }
    return "ixt:dateError";
}
    
function datemonthday(arg) {
    var m = monthdayPattern.exec(arg);
    if (m) {
        var mo = z2(m[1]);
        var day = z2(m[2]);
        if ("01" <= day && day <= maxDayInMo(mo))
            return '--' + mo + '-' + day;
    }
    return "ixt:dateError";
}
    
function datedaymonthSlashTR1(arg) {
    var m = daymonthslashPattern.exec(arg);
    if (m) {
        var mo = z2(m[2]);
        var day = z2(m[1]);
        return '--' + mo + '-' + day;
    }
    return "ixt:dateError";
}
    
function datemonthdaySlashTR1(arg) {
    var m = monthdayslashPattern.exec(arg);
    if (m) {
        var mo = z2(m[1]);
        var day = z2(m[2]);
        return '--' + mo + '-' + day;
    }
    return "ixt:dateError";
}
    
function datedaymonthdk(arg) {
    var m = daymonthDkPattern.exec(arg);
    if (m) {
        var day = z2(m[1]);
        var mon3 = m[2].toLowerCase();
        var mon3 = m[2].toLowerCase();
        var monEnd = m[3];
        var monPer = m[4];
        if (mon3 in monthnumber) {
            var mo = monthnumber[mon3];
            if (((!monEnd && !monPer) ||
                 (!monEnd && monPer) ||
                 (monEnd && !monPer)) &&
                "01" <= day && day <= maxDayInMo(mo))
                return '--' + z2(mo) + '-' + day;
        }
    }
    return "ixt:dateError";
}
    
function datedaymonthen(arg) {
    var m = daymonthEnPattern.exec(arg);
    if (m) {
        var _mo = monthnumber[m[2]];
        var _day = z2(m[1]);
        if ("01" <= _day && _day <= maxDayInMo(_mo))
            return '--' + z2(_mo) + '-' + _day;
    }
    return "ixt:dateError";
}
    
function datedaymonthShortEnTR1(arg) {
    var m = daymonthShortEnTR1Pattern.exec(arg);
    if (m) {
        var _mo = monthnumber[m[2]];
        var _day = z2(m[1]);
    	return "--" + z2(_mo) + "-" + _day;
    }
    return "ixt:dateError";
}
    
function datemonthdayen(arg) {
    var m = monthdayEnPattern.exec(arg);
    if (m) {
        var _mo = monthnumber[m[1]];
        var _day = z2(m[2]);
        if ("01" <= _day && _day <= maxDayInMo(_mo))
            return "--" + z2(_mo) + "-" + _day;
    }
    return "ixt:dateError";
}

function datemonthdayShortEnTR1(arg) {
    var m = monthdayShortEnTR1Pattern.exec(arg);
    if (m) {
        var _mo = monthnumber[m[1]];
        var _day = z2(m[2]);
        return "--" + z2(_mo) + "-" + _day;
    }
    return "ixt:dateError";
}

function datedaymonthyear(arg) {
    var m = daymonthyearPattern.exec(arg);
    if (m && checkDate(yr(m[3]), m[2], m[1]))
        return yr(m[3]) + '-' + z2(m[2]) + '-' + z2(m[1]);
    return "ixt:dateError";
}
    
function datemonthdayyear(arg) { 
   var  m = monthdayyearPattern.exec(arg);
    if (m) {
        var _yr = yr(m[3]);
        var _mo = z2(m[1]);
        var _day = z2(m[2]);
        if (checkDate(_yr, _mo, _day))
            return _yr + '-' + _mo + '-' + _day;
    }
    return "ixt:dateError";
}
    
function datemonthyear(arg) {
    var m = monthyearPattern.exec(arg); // "(M)M*(Y)Y(YY)", with non-numeric separator,
    if (m) {
        var _mo = z2(m[1]);
        if ("01" <= _mo && _mo <= "12")
            return yr(m[2]) + '-' + _mo;
    }
    return "ixt:dateError";
}
    
function datemonthyeardk(arg) {
    var m = monthyearDkPattern.exec(arg);
    if (m) {
        var mon3 = m[1].toLowerCase();
        var monEnd = m[2];
        var monPer = m[3];
        if (mon3 in monthnumber && ((!monEnd && !monPer) ||
                                    (!monEnd && monPer) ||
                                    (monEnd && !monPer)))
            return yr(m[4]) + '-' + z2(monthnumber[mon3]);
    }
    return "ixt:dateError";
}
    
function datemonthyearen(arg) {
    var m = monthyearEnPattern.exec(arg);
    if (m)
        return yr(m[2]) + '-' + z2(monthnumber[m[1]]);
    return "ixt:dateError";
}
    
function datemonthyearShortEnTR1(arg) {
    var m = monthyearShortEnTR1Pattern.exec(arg);
    if (m)
        return yr(m[2]) + '-' + z2(monthnumber[m[1]]);
    return "ixt:dateError";
}
    
function datemonthyearLongEnTR1(arg) {
    var m = monthyearLongEnTR1Pattern.exec(arg);
    if (m)
        return yr(m[2]) + '-' + z2(monthnumber[m[1]]);
    return "ixt:dateError";
}
    
function datemonthyearin(arg) {
    var m = monthyearInPattern.exec(arg);
    if (m[1] in gregorianHindiMonthNumber)
        return yr(devanagariDigitsToNormal(m[2])) + '-' + gregorianHindiMonthNumber[m[1]];
    return "ixt:dateError";
}
    
function dateyearmonthen(arg) {
    var m = yearmonthEnPattern.exec(arg);
    if (m)
        return yr(m[1]) + '-' + z2(monthnumber[m[2]]);
    return "ixt:dateError";
}

function dateyearmonthShortEnTR1(arg) {
    var m = yearmonthShortEnTR1Pattern.exec(arg);
    if (m)
        return yr(m[1]) + '-' + z2(monthnumber[m[2]]);
    return "ixt:dateError";
}

function dateyearmonthLongEnTR1(arg) {
    var m = yearmonthLongEnTR1Pattern.exec(arg);
    if (m)
        return yr(m[1]) + '-' + z2(monthnumber[m[2]])
    return "ixt:dateError";
}

function datedaymonthyeardk(arg) {
    var m = daymonthyearDkPattern.exec(arg);
    if (m) {
        var _yr = yr(m[5]);
        var _day = z2(m[1]);
        var _mon3 = m[2].toLowerCase();
        var _monEnd = m[3];
        var _monPer = m[4];
        if (_mon3 in monthnumber && ((!_monEnd && !_monPer) ||
                                     (!_monEnd && _monPer) ||
        					  		 (_monEnd && !_monPer))) {
            var _mo = monthnumber[_mon3]
            if (checkDate(_yr, _mo, _day))
                return _yr + '-' + z2(_mo) + '-' + _day;
        }
    }
    return "ixt:dateError";
}

function datedaymonthyearen(arg) {
    var m = daymonthyearEnPattern.exec(arg);
    if (m) {
        var _yr = yr(m[3]);
        var _mo = monthnumber[m[2]];
        var _day = z2(m[1]);
        if (checkDate(_yr, _mo, _day))
            return _yr + '-' + z2(_mo) + '-' + _day;
    }
    return "ixt:dateError";
}

function datedaymonthyearin(arg) {
    var m = daymonthyearInPattern.exec(arg);
    if (m) {
        var _yr = yr(devanagariDigitsToNormal(m[3]));
        var _mo = gregorianHindiMonthNumber.get(m[2], devanagariDigitsToNormal(m[2]));
        var _day = z2(devanagariDigitsToNormal(m[1]))
        if (checkDate(_yr, _mo, _day))
            return _yr + '-' + _mo + '-' + _day;
    }
    return "ixt:dateError";
}

function calindaymonthyear(arg) {
    var m = daymonthyearInPattern.exec(arg);
    // Transformation registry 3 requires use of pattern comparisons instead of exact transliterations
    //_mo = _INT(sakaMonthNumber[m[2]])
    // pattern approach
    var _mo = 0;
    var _match = sakaMonthPattern.exec(m[2])
    for (_mo=_match.length-1; _mo >= 0; _mo-=1)
    	if (_match[_mo])
    		break;
    var _day = parseInt(devanagariDigitsToNormal(m[1]))
    var _yr = parseInt(devanagariDigitsToNormal(yrin(m[3], _mo, _day)))
    //sakaDate = [_yr, _mo, _day]
    //for pluginMethod in pluginClassMethods("SakaCalendar.ToGregorian"):  // LGPLv3 plugin (moved to examples/plugin)
    //    gregorianDate = pluginMethod(sakaDate)
    //    return "{0}-{1:02}-{2:02}".format(gregorianDate[0], gregorianDate[1], gregorianDate[2])
    //raise NotImplementedError (_("ixt:calindaymonthyear requires plugin sakaCalendar.py, please install plugin.  "))
    gregorianDate = sakaToGregorian(_yr, _mo, _day); // native implementation for Arelle
    return gregorianDate[0] + "-" + z2(gregorianDate[1]) + "-" + z2(gregorianDate[2]);
}

function datemonthdayyearen(arg) {
    var m = monthdayyearEnPattern.exec(arg);
    if (m) {
        var _yr = yr(m[3]);
        var _mo = monthnumber[m[1]];
        var _day = z2(m[2]);
        if (checkDate(_yr, _mo, _day))
            return _yr + '-' + z2(_mo) + '-' + _day;
    }
    return "ixt:dateError";
}
    
function dateerayearmonthdayjp(arg) {
    var m = erayearmonthdayjpPattern.exec(jpDigitsToNormal(arg));
    if (m) {
        var _yr = eraYear(m[1], m[2]);
        var _mo = z2(m[3]);
        var _day = z2(m[4]);
        if (checkDate(_yr, _mo, _day))
            return _yr + '-' + _mo + '-' + _day;
    }
    return "ixt:dateError";
}

function dateyearmonthday(arg) {
    var m = yearmonthdayPattern.exec(jpDigitsToNormal(arg)); // (Y)Y(YY)*MM*DD with kangu full-width numerals
    if (m) {
        var _yr = yr(m[1]);
        var _mo = z2(m[2]);
        var _day = z2(m[3]);
        if (checkDate(_yr, _mo, _day))
            return _yr + "-" + _mo + "-" + _day;
    }
    return "ixt:dateError";
}

function dateerayearmonthjp(arg) {
    var m = erayearmonthjpPattern.exec(jpDigitsToNormal(arg))
    if (m) {
        var _yr = eraYear(m[1], m[2]);
        var _mo = z2(m[3]);
        if ("01" <= _mo && _mo <= "12")
            return _yr + '-' + _mo;
    }
    return "ixt:dateError";
}

function dateyearmonthdaycjk(arg) {
    var m = yearmonthdaycjkPattern.exec(jpDigitsToNormal(arg))
    if (m) {
        var _yr = yr(m[1]);
        var _mo = z2(m[2]);
        var _day = z2(m[3]);
        if (checkDate(_yr, _mo, _day))
            return _yr + "-" + _mo + "-" + _day;
    }
    return "ixt:dateError";
}

function dateyearmonthcjk(arg) {
    var m = yearmonthcjkPattern.exec(jpDigitsToNormal(arg));
    if (m) {
        var _mo =  z2(m[2]);
        if ("01" <= _mo && _mo <= "12")
            return yr(m[1]) + "-" + _mo;
    }
    return "ixt:dateError";
}

function nocontent(arg) {
    return ''
}

function numcommadecimal(arg) {
    if (numCommaDecimalPattern.exec(arg))
        return arg.replace('.', '').replace(',', '.').replace(' ', '').replace('\u00A0', '');
    return "ixt:numberPatternError";
}

function numcommadot(arg) {
    return arg.replace(',', '');
}

function numdash(arg) {
    return arg.replace('-','0');
}

function numspacedot(arg) {
    return arg.replace(' ', '');
}

function numdotcomma(arg) {
    return arg.replace('.', '').replace(',', '.');
}

function numspacecomma(arg) {
    return arg.replace(' ', '').replace(',', '.');
}

function zerodash(arg) {
    if (zeroDashPattern.exec(arg))
        return '0';
    return "ixt:numberPatternError";
}

function numdotdecimal(arg) {
    if (numDotDecimalPattern.exec(arg))
        return arg.replace(',', '').replace(' ', '').replace('\u00A0', '');
    return "ixt:numberPatternError";
}

function numdotdecimalin(arg) {
    var m = numDotDecimalInPattern.exec(arg), fract;
    if (m) {
    	var lastm = "", fract;
    	for (i=m.length-1; i>=0; i--) {
    		if (m[i]) {
    			lastm = m[i];
    			break;
    		}
    	}
        if (lastm && lastm.charAt(0) == ".")
            fract = m2[-1];
        else
            fract = "";
        return m2[0].replace(',','').replace(' ','').replace('\xa0','') + fract;
    }
    return "ixt:numberPatternError";
}

function numunitdecimal(arg) {
    // remove comma (normal), full-width comma, and stops (periods)
    var m = numUnitDecimalPattern.exec(jpDigitsToNormal(arg));
    if (m)
        return m[1].replace('.','').replace(',','').replace('\uFF0C','').replace('\uFF0E','') + '.' + z2(m[m.length-1]);
    return "ixt:numberPatternError";
}

function numunitdecimalin(arg) {
    var m = numUnitDecimalInPattern.exec(arg);
    if (m) {
        var m2 = [];
        for (var i=0; i<m.length; i++)
        	if (m[i])
	        	m2.push(m[i]);
        return m2[0].replace(',','').replace(' ','').replace('\xa0','') + '.' + z2(m2[m2.length - 2]);
    }
    return "ixt:numberPatternError";
}
    

tr1Functions = {
    // 2010-04-20 functions
    'dateslashus': dateslashus,
    'dateslasheu': dateslasheu,
    'datedotus': datedotus,
    'datedoteu': datedoteu,
    'datelongus': datelongus,
    'dateshortus': datelongus,
    'datelongeu': datelongeu,
    'dateshorteu': datelongeu,
    'datelonguk': datelongeu,
    'dateshortuk': datelongeu,
    'numcommadot': numcommadot,
    'numdash': numdash,
    'numspacedot': numspacedot,
    'numdotcomma': numdotcomma,
    'numcomma': numdotcomma,
    'numspacecomma': numspacecomma,
    'dateshortdaymonthuk': datedaymonthShortEnTR1,
    'dateshortmonthdayus': datemonthdayShortEnTR1,
    'dateslashdaymontheu': datedaymonthSlashTR1,
    'dateslashmonthdayus': datemonthdaySlashTR1,
    'datelongyearmonth': dateyearmonthLongEnTR1,
    'dateshortyearmonth': dateyearmonthShortEnTR1,
    'datelongmonthyear': datemonthyearLongEnTR1,
    'dateshortmonthyear': datemonthyearShortEnTR1
}

tr2Functions = {               
    // 2011-07-31 functions
    'booleanfalse': booleanfalse,
    'booleantrue': booleantrue,
    'datedaymonth': datedaymonth,
    'datedaymonthen': datedaymonthen,
    'datedaymonthyear': datedaymonthyear,
    'datedaymonthyearen': datedaymonthyearen,
    'dateerayearmonthdayjp': dateerayearmonthdayjp,
    'dateerayearmonthjp': dateerayearmonthjp,
    'datemonthday': datemonthday,
    'datemonthdayen': datemonthdayen,
    'datemonthdayyear': datemonthdayyear,
    'datemonthdayyearen': datemonthdayyearen,
    'datemonthyearen': datemonthyearen,
    'dateyearmonthdaycjk': dateyearmonthdaycjk,
    'dateyearmonthen': dateyearmonthen,
    'dateyearmonthcjk': dateyearmonthcjk,
    'nocontent': nocontent,
    'numcommadecimal': numcommadecimal,
    'zerodash': zerodash,
    'numdotdecimal': numdotdecimal,
    'numunitdecimal': numunitdecimal
}
    
    // transformation registry v-3 functions
tr3Functions = ({
    // same as v2: 'booleanfalse': booleanfalse,
    // same as v2: 'booleantrue': booleantrue,
    'calindaymonthyear': calindaymonthyear, // TBD: calindaymonthyear,
    //'calinmonthyear': nocontent, // TBD: calinmonthyear,
    // same as v2: 'datedaymonth': datedaymonth,
    'datedaymonthdk': datedaymonthdk,
    // same as v2: 'datedaymonthen': datedaymonthen,
    // same as v2: 'datedaymonthyear': datedaymonthyear,
    'datedaymonthyeardk': datedaymonthyeardk,
    // same as v2: 'datedaymonthyearen': datedaymonthyearen,
    'datedaymonthyearin': datedaymonthyearin,
    // same as v2: 'dateerayearmonthdayjp': dateerayearmonthdayjp,
    // same as v2: 'dateerayearmonthjp': dateerayearmonthjp,
    // same as v2: 'datemonthday': datemonthday,
    // same as v2: 'datemonthdayen': datemonthdayen,
    // same as v2: 'datemonthdayyear': datemonthdayyear, 
    // same as v2: 'datemonthdayyearen': datemonthdayyearen,
    'datemonthyear': datemonthyear,
    'datemonthyeardk': datemonthyeardk,
    // same as v2: 'datemonthyearen': datemonthyearen,
    'datemonthyearin': datemonthyearin,
    // same as v2: 'dateyearmonthcjk': dateyearmonthcjk,
    'dateyearmonthday': dateyearmonthday, // (Y)Y(YY)*MM*DD allowing kanji full-width numerals
    // same as v2: 'dateyearmonthdaycjk': dateyearmonthdaycjk,
    // same as v2: 'dateyearmonthen': dateyearmonthen,
    // same as v2: 'nocontent': nocontent,
    // same as v2: 'numcommadecimal': numcommadecimal,
    // same as v2: 'numdotdecimal': numdotdecimal,
    'numdotdecimalin': numdotdecimalin,
    // same as v2: 'numunitdecimal': numunitdecimal,
    'numunitdecimalin': numunitdecimalin
    // same as v2: 'zerodash': zerodash,
})
// tr3 starts with tr2 and adds more functions.
for (k in tr2Functions)	tr3Functions[k] = tr2Functions[k];  

deprecatedNamespaceURI = 'http://www.xbrl.org/2008/inlineXBRL/transformation' // the CR/PR pre-REC namespace

ixtNamespaceFunctions = {
    'http://www.xbrl.org/inlineXBRL/transformation/2010-04-20': tr1Functions, // transformation registry v1
    'http://www.xbrl.org/inlineXBRL/transformation/2011-07-31': tr2Functions, // transformation registry v2
    'http://www.xbrl.org/inlineXBRL/transformation/2015-02-26': tr3Functions, // transformation registry v3
    'http://www.xbrl.org/2008/inlineXBRL/transformation': tr1Functions // the CR/PR pre-REC namespace
}

////////

function getDurationValue(arg) {
    var n = parseFloat(arg);
    if (n == NaN) return {sign: null, value: null, error: 'ixt:durationTypeError'};
    var sign = '';
    if (n != NaN && n < 0) sign = '-';
    return {sign: sign, value: Math.abs(n), error: false};
}

function printDurationType(y, m, d, h, sign) {
    // preprocess each value so we don't print P0Y0M0D 
    // in this case, we should print P0Y, and leave out the months and days.
    var empty = true;	
    empty = empty && (y == null || y == 0);
    empty = empty && (m == null || m == 0);
    empty = empty && (d == null || d == 0);
    empty = empty && (h == null || h == 0);
    if (empty) { // zero is a special case.
	sign = '';  // don't need to print -P0Y, just print P0Y
	hitFirstZeroYet = false;
	if (y != null && y ==0) {
	    hitFirstZeroYet = true;
	}
	if (m != null && m == 0) {
	    if (hitFirstZeroYet) {
		m = null;
	    } else {
		hitFirstZeroYet = true;
	    }
	}
	if (d != null && d == 0) {
	    if (hitFirstZeroYet) {
		d = null;
	    } else {
		hitFirstZeroYet = true;
	    }
	}
	if (h != null && h == 0 && hitFirstZeroYet) {
	    if (hitFirstZeroYet) {
		h = null;
	    } else {
		hitFirstZeroYet = true;
	    }
	}
    }
    var output = sign + "P"
    if (y != null) output += y.toString() + 'Y'
    if (m != null) output += m.toString() + 'M'
    if (d != null) output += d.toString() + 'D'
    if (h != null) output += 'T' + h.toString() + 'H'
    return output;
}


//if arg is not an integer, the rest can spill into months and days, but nothing lower
function duryear(arg) {
    var n = getDurationValue(arg);
    if (n.error) return n.error;
    var years = Math.floor(n.value);
    var months =  (n.value - years) * 12;
    var days = Math.floor((months - Math.floor(months)) * 30.4375);
    var months = Math.floor(months);
    return printDurationType(years, months, days, null, n.sign);
}


//if arg is not an integer, the rest can spill into days, but nothing lower
function durmonth(arg) {
    var n = getDurationValue(arg);
    if (n.error) return n.error;
    var months = Math.floor(n.value);
    var days = Math.floor((n.value - months) * 30.4375);
    return printDurationType(null, months, days, null, n.sign);
}


//the output will only be in days, nothing lower
//xs:durationType doesn't have weeks, only years, months and days, so we display it all in days
function durweek(arg) {
    var n = getDurationValue(arg);
    if (n.error) return n.error;
    var days = Math.floor(n.value * 7);
    return printDurationType(null, null, days, null, n.sign);
}

//if arg is not an integer, the rest can spill into hours, but nothing lower
function durday(arg) {
    var n = getDurationValue(arg);
    if (n.error) return n.error;
    if (n.value) {
	days = Math.floor(n.value);
	hours = Math.floor((n.value - days) * 24);
    }
    else{
	days = Math.floor(n.value);
	hours = Math.floor((n.value - days) * 24);	
    }
    return printDurationType(null, null, days, hours, n.sign);
}

//the output will only be in hours, nothing lower
function durhour(arg) {
    var n = getDurationValue(arg);
    if (n.error) return n.error;
    hours = Math.floor(n.value)
    return printDurationType(null, null, null, hours, n.sign);
}

function numinf(arg) {
    return 'INF';
}

function numneginf(arg) {
    return '-INF';
}

function numnan(arg) {
    return 'NaN';
}

numwordsenPattern = /^\s*(((((([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)\s+[Hh]undred(\s+(and\s+)?(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)((-|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))?)|(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)((-|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))\s+[Qq]uintillion(\s*,\s*|\s+|$))?(((([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)\s+[Hh]undred(\s+(and\s+)?(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)((-|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))?)|(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)((-|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))\s+[Qq]uadrillion(\s*,\s*|\s+|$))?(((([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)\s+[Hh]undred(\s+(and\s+)?(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)((-|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))?)|(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)((-|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))\s+[Tt]rillion(\s*,\s*|\s+|$))?(((([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)\s+[Hh]undred(\s+(and\s+)?(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)((-|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))?)|(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)((-|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))\s+[Bb]illion(\s*,\s*|\s+|$))?(((([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)\s+[Hh]undred(\s+(and\s+)?(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)((-|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))?)|(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)((-|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))\s+[Mm]illion(\s*,\s*|\s+|$))?((((([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)\s+[Hh]undred(\s+(and\s+)?(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)((-|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))?)|(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)((-|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))\s+[Tt]housand((\s*,\s*|\s+)((([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)\s+[Hh]undred(\s+(and\s+)?(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)((-|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))?)|(and\s+)?(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)((-|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?)))?)|(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)\s+[Hh]undred(\s+(and\s+)?(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)((-|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))?)|(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)((-|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))?)|[Zz]ero|[Nn]o(ne)?)\s*$/ ;

numwordsNoPattern = /^\s*[Nn]o(ne)?\s*$/ ;

commaAndPattern = /,|\sand\s/ ; // substitute whitespace for comma or and
    
function numwordsen(arg) {
    if (numwordsNoPattern.exec(arg)) {
	return "0";
    } else if (arg.trim().length > 0) {
	var m = numwordsenPattern.exec(arg);
	if (arg.length >0 && m) {
	    var str = arg.trim().toLowerCase().replace(commaAndPattern," ");
	    return text2num(str).toString();	
	}
    }
    return 'Not a number: '+arg.toString();
}

durwordsenPattern = /^\s*((((([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)\s+[Hh]undred(\s+(and\s+)?(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)((-|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))?)|(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)((-|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))|[Zz]ero|[Nn]o|[0-9][0-9]{0,3})\s+[Yy]ears?(,?\s+(and\s+)?|$))?((((([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)\s+[Hh]undred(\s+(and\s+)?(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)((-|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))?)|(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)((-|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))|[Zz]ero|[Nn]o|[0-9][0-9]{0,3})\s+[Mm]onths?(,?\s+(and\s+)?|$))?((((([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)\s+[Hh]undred(\s+(and\s+)?(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)((-|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))?)|(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)((-|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))|[Zz]ero|[Nn]o|[0-9][0-9]{0,3})\s+[Dd]ays?)?\s*$/ ;

durwordZeroNoPattern = /^\s*([Zz]ero|[Nn]o(ne)?)\s*$/ ;

function durwordsen(arg) {
    var durWordsMatch = durwordsenPattern.exec(arg);
    if (durWordsMatch && arg.trim().length > 0) {
	var dur = 'P';
	var grp = [[1+1,'Y'],[61+1,'M'],[121+1,'D']];
	for (var i = 0; i < grp.length; i++) {
	    var groupIndex = grp[i][0];
	    var groupSuffix = grp[i][1];
	    var groupPart = durWordsMatch[groupIndex];
	    if (groupPart != null) {
		if (durwordZeroNoPattern.exec(groupPart) == null) {
		    if (isNaN(groupPart)) {
			var tmp = groupPart.trim().toLowerCase().replace(commaAndPattern," ");
			dur += text2num(tmp);
		    } else {
			dur += groupPart;
		    }
		    dur += groupSuffix;
		}
	    }
	}
	return (dur.length > 1)?dur:"P0D";
    }
    return 'Not a duration: '+arg.toString();
}


var Small = {
	'zero': 0,
	'one': 1,
	'two': 2,
	'three': 3,
	'four': 4,
	'five': 5,
	'six': 6,
	'seven': 7,
	'eight': 8,
	'nine': 9,
	'ten': 10,
	'eleven': 11,
	'twelve': 12,
	'thirteen': 13,
	'fourteen': 14,
	'fifteen': 15,
	'sixteen': 16,
	'seventeen': 17,
	'eighteen': 18,
	'nineteen': 19,
	'twenty': 20,
	'thirty': 30,
	'forty': 40,
	'fifty': 50,
	'sixty': 60,
	'seventy': 70,
	'eighty': 80,
	'ninety': 90
};


var Magnitude = {
	'thousand':     1000,
	'million':      1000000,
	'billion':      1000000000,
	'trillion':     1000000000000,
	'quadrillion':  1000000000000000,
	'quintillion':  1000000000000000000,
	'sextillion':   1000000000000000000000,
	'septillion':   1000000000000000000000000,
	'octillion':    1000000000000000000000000000,
	'nonillion':    1000000000000000000000000000000,
	'decillion':    1000000000000000000000000000000000,
};

function text2num(s) {
    var wordSplitPattern = /[\s-]+/;
    var a = s.toString().split(wordSplitPattern);
    var n = 0;
    var g = 0;
    for (var i=0;i < a.length; i++) {
	var w = a[i];
	var x = Small[w];
	if (x != null) {
	    g = g + x;
	}
	else if (w == "hundred") {
	    g = g * 100;
	}
	else {
	    x = Magnitude[w];
	    if (x != null) {
		n = n + g * x; 
		g = 0;
	    }
	    else { 
		return 'ixt:text2numError ' + w;
	    }
	}
    }
    return n + g;
}

edgarFunctions = {    
	    'duryear': duryear,
	    'durmonth': durmonth,
	    'durweek': durweek,
	    'durday': durday,
	    'durhour': durhour
	    ,'numinf': numinf
	    ,'numneginf': numneginf
	    ,'numnan': numnan
	    ,'numwordsen': numwordsen
	    ,'durwordsen': durwordsen
	    }

ixtNamespaceFunctions['http://www.sec.gov/inlineXBRL/transformation/2015-08-31'] = edgarFunctions;

