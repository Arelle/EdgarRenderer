/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

"use strict";

var FiltersNumber = {
  fixedZero: function (element) {
    return "0";
  },

  numberFormatting: function (element, input, canonicalize) {
    // return 0 if No|None...etc
    var regex = /^\s*([Nn]o(ne)?|[Nn]il|[Zz]ero)\s*$/;
    if (regex.exec(element.innerText)) {
      return "0";
    }

    if (element.hasAttribute("xsi:nil")) {
      return "nil";
    }

    if (
      element.nodeName.split(":")[1] &&
      element.nodeName.split(":")[1].toLowerCase() === "nonfraction"
    ) {
      if (
        element.hasAttribute("xsi:nil") &&
        element.getAttribute("xsi:nil") === true
      ) {
        return "nil";
      } else if (element.innerHTML === "\u2014") {
        return input;
      }
      var scale =
        element.hasAttribute("scale") && parseInt(element.getAttribute("scale"))
          ? parseInt(element.getAttribute("scale"))
          : 0;
      if (scale > 1) {
        var periodIndex = input.indexOf(".");
        if (periodIndex !== -1) {
          var inputArray = input.split(".");
          scale = scale - inputArray[1].length;
        }
        input = input.padEnd(input.length + Math.abs(scale), 0);
        input = input.replace(".", "");
        input = [input.slice(0, scale), input.slice(scale)].join("");
      } else if (scale === 1) {
        // we move the decimal point one position to the right
        // example: 1.00000 => 10.0000
        var inputArray = input.split(".");
        input = (input * 10).toFixed(inputArray[1].length);
      } else if (scale < 0) {
        var absScale = Math.abs(scale);
        var divScale = "1";
        divScale = divScale.padEnd(absScale + 1, 0);
        var canSplit = input.indexOf(".") !== -1;
        if (canSplit) {
          var precision = input.split(".")[1].length + absScale;
          input = (input / divScale).toFixed(precision);
        } else {
          var precision = absScale;
          input = (input / divScale).toFixed(precision);
        }
      }

      // must be valid decimal number
      if (canonicalize && /^[+-]?([0-9]+(\.[0-9]*)?|\.[0-9]+)$/.exec(input)) {
        // HF: return xml canonical xs:decimal lexical number
        var m =
          /^[ \t\n\r]*0*([1-9][0-9]*)?(([.]0*)[ \t\n\r]*$|([.][0-9]*[1-9])0*[ \t\n\r]*$|[ \t\n\r]*$)/.exec(
            input
          );
        if (m) {
          input = (m[1] ? m[1] : "0") + (m[4] ? m[4] : "");
        }
      }

      if (element.hasAttribute("sign")) {
        input = element.getAttribute("sign") + input;
      }

      // remove ALL leading zeros from string of number(s)
      input = input.replace(/^0+/, "");
      // adding commas when necessary
      input = input.toString().replace(/,/g, "");
      var arraySplitByPeriod = input.toString().split(".");
      if (arraySplitByPeriod.length > 0) {
        arraySplitByPeriod[0] = arraySplitByPeriod[0]
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        if (arraySplitByPeriod[1] && arraySplitByPeriod[1].match(/^0+$/)) {
          arraySplitByPeriod[1] = "";
          input = arraySplitByPeriod.join("");
        } else {
          input = arraySplitByPeriod.join(".");
        }
      } else {
        input = input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      }
    }
    return input;
  },

  jpDigitsToNormal: function (jpDigits) {
    if (jpDigits && typeof jpDigits === "string") {
      var normal = "";
      for (var i = 0; i < jpDigits.length; i++) {
        var d = jpDigits[i];
        if ("\uFF10" <= d && d <= "\uFF19") {
          normal += String.fromCharCode(
            d.charCodeAt(0) - 0xff10 + "0".charCodeAt(0)
          );
        } else {
          normal += d;
        }
      }
      return normal;
    }
    return null;
  },

  numComma: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      if (isNaN(element.innerText)) {
        return "Format Error: Num Comma";
      }
      return parseInt(element.innerText).toLocaleString();
    }
    return "Format Error: Num Comma";
  },

  numDotDecimal: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var regex = /^\s*[0-9]{1,3}([, \xA0]?[0-9]{3})*(\.[0-9]+)?\s*$/;

      if (regex.exec(element.innerText)) {
        return element.innerText
          .replace(/\,/g, "")
          .replace(/ /g, "")
          .replace("/\u00A0/g", "");
        return FiltersNumber.numberFormatting(
          element,
          element.innerText
            .replace(/\,/g, "")
            .replace(/ /g, "")
            .replace("/\u00A0/g", "")
        );
      }
    }
    return "Format Error: Num Dot Decimal";
  },

  numDotDecimalTR4: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      if (
        /^[ \t\n\r]*[, \xA00-9]*(\.[ \xA00-9]+)?[ \t\n\r]*$/.exec(
          element.innerText
        )
      ) {
        return element.innerText
          .replace(/\,/g, "")
          .replace(/ /g, "")
          .replace("/\u00A0/g", "");
      }
    }
    return "Format Error: Num Dot Decimal";
  },

  numDotDecimalAposTR5: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      if (
        /^[ \t\n\r]*[,\x27\x60\xB4\u2019\u2032 \xA00-9]*(\.[ \xA00-9]+)?[ \t\n\r]*$/.exec(
          element.innerText
        )
      ) {
        return element.innerText
          .replace(/\,/g, "")
          .replace("/\x27/g", "")
          .replace("/\x60/g", "")
          .replace("/\xB4/g", "")
          .replace("/\u2019/g", "")
          .replace("/\u2032/g", "")
          .replace(/ /g, "")
          .replace("/\u00A0/g", "");
      }
    }
    return "Format Error: Num Dot Decimal";
  },

  textToNumber: function (numberAsString) {
    // if ( numberAsString && typeof element === 'string' ) {
    var wordSplitPattern = /[\s-]+/;
    var a = numberAsString.toString().split(wordSplitPattern);
    var n = 0;
    var g = 0;
    for (var i = 0; i < a.length; i++) {
      var w = a[i];
      var x = ConstantsNumber.getSmallNumber[w];
      if (x) {
        g = g + x;
      } else if (w === "hundred") {
        g = g * 100;
      } else {
        x = ConstantsNumber.getMagnitude[w];
        if (x !== null) {
          n = n + g * x;
          g = 0;
        } else {
          return "ixt:text2numError " + w;
        }
      }
    }
    return n + g;
  },

  numCommaDecimal: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var regex = /^\s*[0-9]{1,3}([. \xA0]?[0-9]{3})*(,[0-9]+)?\s*$/;

      if (regex.exec(element.innerText)) {
        return element.innerText
          .replace(/\./g, "")
          .replace(/\,/g, ".")
          .replace(/ /g, "")
          .replace("/\u00A0/g", "");
      }
    }
    return "Format Error: Num Comma Decimal";
  },

  numCommaDecimalTR4: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      if (
        /^[ \t\n\r]*[\. \xA00-9]*(,[ \xA00-9]+)?[ \t\n\r]*$/.exec(
          element.innerText
        )
      ) {
        return element.innerText
          .replace(/\./g, "")
          .replace(/\,/g, ".")
          .replace(/ /g, "")
          .replace("/\u00A0/g", "");
      }
    }
    return "Format Error: Num Comma Decimal";
  },

  numCommaDecimalAposTR5: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      if (
        /^[ \t\n\r]*[\.\x27\x60\xB4\u2019\u2032 \xA00-9]*(,[ \xA00-9]+)?[ \t\n\r]*$/.exec(
          element.innerText
        )
      ) {
        return element.innerText
          .replace(/\./g, "")
          .replace(/\,/g, ".")
          .replace("/\x27/g", "")
          .replace("/\x60/g", "")
          .replace("/\xB4/g", "")
          .replace("/\u2019/g", "")
          .replace("/\u2032/g", "")
          .replace(/ /g, "")
          .replace("/\u00A0/g", "");
      }
    }
    return "Format Error: Num Comma Decimal";
  },

  numCommaDot: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      if (isNaN(element.innerText.replace(",", ""))) {
        return "Format Error: Num Comma Dot";
      }
      return element.innerText.replace(",", "");
    }
    return "Format Error: Num Comma Dot";
  },

  numDash: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return element.innerText.replace("-", "0");
    }
    return "Format Error: Num Dash";
  },

  numDotComma: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return element.innerText.replace(".", "").replace(",", ".");
    }
    return "Format Error: Num Dot Comma";
  },

  numDotDecimalIN: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var regex =
        /^(([0-9]{1,2}[, \xA0])?([0-9]{2}[, \xA0])*[0-9]{3})([.][0-9]+)?$|^([0-9]+)([.][0-9]+)?$/;
      var result = regex.exec(element.innerText);
      if (result) {
        var lastM = "";
        var fraction;
        var arrayResult = result.filter(function (element) {
          return element;
        });

        for (var i = result.length - 1; i >= 0; i--) {
          if (result[i]) {
            lastM = result[i];
            break;
          }
        }
        if (lastM && lastM.charAt(0) === ".") {
          fraction = arrayResult[-1];
        } else {
          fraction = "";
        }

        return (
          arrayResult[0]
            .replace(/\,/g, "")
            .replace(/ /g, "")
            .replace(/\xa0/g, "") + (fraction ? fraction : "")
        );
      }
    }
    return "Format Error: Num Dot Decimal IN";
  },

  numSpaceComma: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return element.innerText.replace(" ", "").replace(",", ".");
    }
    return "Format Error: Num Space Comma";
  },

  numSpaceDot: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return element.innerText.replace(" ", "");
    }
    return "Format Error: Num Space Dot";
  },

  numUnitDecimal: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var regex =
        /^([0]|([1-9][0-9]{0,2}([.,\uFF0C\uFF0E]?[0-9]{3})*))[^0-9,.\uFF0C\uFF0E]+([0-9]{1,2})[^0-9,.\uFF0C\uFF0E]*$/;

      var result = regex.exec(
        FiltersNumber.jpDigitsToNormal(element.innerText)
      );
      if (result) {
        return (
          result[1]
            .replace(/\./g, "")
            .replace(/\,/g, "")
            .replace("/\uFF0C/g", "")
            .replace("/\uFF0E/g", "")
            .replace(/\\uff0c/g, "") +
          "." +
          ConstantsNumber.zeroPadTwoDigits(result[result.length - 1])
        );
      }
    }

    return "Format Error: Num Unit Decimal";
  },

  numUnitDecimalIN: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var regex =
        /^(([0-9]{1,2}[, \xA0])?([0-9]{2}[, \xA0])*[0-9]{3})([^0-9]+)([0-9]{1,2})([^0-9]*)$|^([0-9]+)([^0-9]+)([0-9]{1,2})([^0-9]*)$/;
      var result = regex.exec(element.innerText);
      if (result) {
        var m2 = [];
        for (var i = 0; i < result.length; i++) {
          if (result[i]) {
            m2.push(result[i]);
          }
        }
        return (
          m2[1].replace(/\,/g, "").replace(/ /g, "").replace("/\xa0/g", "") +
          "." +
          ConstantsNumber.zeroPadTwoDigits(m2[m2.length - 2])
        );
      }
    }
    return "Format Error: Num Unit Decimal IN";
  },

  numUnitDecimalTR4: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var m =
        /^([0-9\uff10-\uff19\.,\uff0c]+)([^0-9\uff10-\uff19\.,\uff0c][^0-9\uff10-\uff19]*)([0-9\uff10-\uff19]{1,2})[^0-9\uff10-\uff19]*$/.exec(
          element.innerText
        );
      if (m && ConstantsNumber.lastindex(m) > 1) {
        var majorValue = m[1]
          .replace(".", "")
          .replace(",", "")
          .replace("\uFF0C", "")
          .replace("\uFF0E", "");
        var fractValue = ConstantsNumber.zeroPadTwoDigits(
          m[ConstantsNumber.lastindex(m)]
        );
        if (majorValue.length > 0 && fractValue.length > 0) {
          return majorValue + "." + fractValue;
        }
      }
    }

    return "Format Error: Num Unit Decimal";
  },

  numUnitDecimalAposTR5: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var m =
        /^([0-9\uff10-\uff19\.,\uff0c\x27\x60\xB4\u2019\u2032\uFF07]+)([^0-9\uff10-\uff19\.,\uff0c\x27\x60\xB4\u2019\u2032\uFF07][^0-9\uff10-\uff19]*)([0-9\uff10-\uff19]{1,2})[^0-9\uff10-\uff19]*$/.exec(
          element.innerText
        );
      if (m && ConstantsNumber.lastindex(m) > 1) {
        var majorValue = m[1]
          .replace(".", "")
          .replace(",", "")
          .replace("\uFF0C", "")
          .replace("\x27", "")
          .replace("\x60", "")
          .replace("\xB4", "")
          .replace("\u2019", "")
          .replace("\u2032", "")
          .replace("\uFF07", "");
        var fractValue = ConstantsNumber.zeroPadTwoDigits(
          m[ConstantsNumber.lastindex(m)]
        );
        if (majorValue.length > 0 && fractValue.length > 0) {
          return majorValue + "." + fractValue;
        }
      }
    }

    return "Format Error: Num Unit Decimal";
  },

  numWordsEn: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var regex = /^\s*([Nn]o(ne)?|[Nn]il|[Zz]ero)\s*$/;

      if (regex.exec(element.innerText)) {
        return "0";
      } else if (element.innerText.trim().length > 0) {
        var secondRegex =
          /^\s*(((((([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)\s+[Hh]undred(\s+(and\s+)?(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)(([\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D-]|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))?)|(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)(([\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D-]|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))\s+[Qq]uintillion(\s*,\s*|\s+|$))?(((([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)\s+[Hh]undred(\s+(and\s+)?(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)(([\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D-]|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))?)|(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)(([\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D-]|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))\s+[Qq]uadrillion(\s*,\s*|\s+|$))?(((([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)\s+[Hh]undred(\s+(and\s+)?(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)(([\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D-]|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))?)|(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)(([\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D-]|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))\s+[Tt]rillion(\s*,\s*|\s+|$))?(((([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)\s+[Hh]undred(\s+(and\s+)?(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)(([\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D-]|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))?)|(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)(([\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D-]|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))\s+[Bb]illion(\s*,\s*|\s+|$))?(((([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)\s+[Hh]undred(\s+(and\s+)?(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)(([\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D-]|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))?)|(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)(([\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D-]|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))\s+[Mm]illion(\s*,\s*|\s+|$))?((((([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)\s+[Hh]undred(\s+(and\s+)?(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)(([\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D-]|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))?)|(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)(([\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D-]|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))\s+[Tt]housand((\s*,\s*|\s+)((([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)\s+[Hh]undred(\s+(and\s+)?(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)(([\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D-]|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))?)|(and\s+)?(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)(([\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D-]|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?)))?)|(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)\s+[Hh]undred(\s+(and\s+)?(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)(([\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D-]|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))?)|(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)(([\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D-]|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))?)|[Zz]ero|[Nn]o(ne)?|[Nn]il)\s*$/;
        var result = secondRegex.exec(element.innerText);
        if (element.innerText.length > 0 && result) {
          var thirdRegex = /,|\sand\s/g;

          var returnString = element.innerText
            .trim()
            .toLowerCase()
            .replace(thirdRegex, " ");

          return ConstantsNumber.textToNumber(returnString).toString();
        }
      }
    }
    return "Format Error: Num Words EN";
  }
};
