/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

"use strict";

var FiltersDate = {
  eraYear: function (era, year) {
    if (
      era &&
      typeof era === "string" &&
      ConstantsDate.eraStart[era] &&
      year &&
      typeof year === "string"
    ) {
      return (
        ConstantsDate.eraStart[era] + (year === "\u5143" ? 1 : parseInt(year))
      );
    }
    return null;
  },

  dateQuarterEnd: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var year = element.innerText.match(/\d{4}/)[0];
      var month;
      var day;

      var quarter = element.innerText.match(
        /1st|1|first|q1|2nd|2|second|q2|3rd|3|third|q3|4th|4|fourth|last|q4/gi
      );

      if (quarter && quarter[0]) {
        switch (quarter[0].toLowerCase()) {
          case "1st": {
            month = "03";
            day = "31";
            break;
          }
          case "1": {
            month = "03";
            day = "31";
            break;
          }
          case "first": {
            month = "03";
            day = "31";
            break;
          }
          case "q1": {
            month = "03";
            day = "31";
            break;
          }
          case "2nd": {
            month = "06";
            day = "30";
            break;
          }
          case "2": {
            month = "06";
            day = "30";
            break;
          }
          case "second": {
            month = "06";
            day = "30";
            break;
          }
          case "q2": {
            month = "06";
            day = "30";
            break;
          }
          case "3rd": {
            month = "09";
            day = "30";
            break;
          }
          case "3": {
            month = "09";
            day = "30";
            break;
          }
          case "third": {
            month = "09";
            day = "30";
            break;
          }
          case "q3": {
            month = "09";
            day = "30";
            break;
          }
          case "4th": {
            month = "12";
            day = "31";
            break;
          }
          case "4": {
            month = "12";
            day = "31";
            break;
          }
          case "fourth": {
            month = "12";
            day = "31";
            break;
          }
          case "last": {
            month = "12";
            day = "31";
            break;
          }
          case "q4": {
            month = "12";
            day = "31";
            break;
          }
          default: {
            return "Format Error: Date Quarter End";
          }
        }
      } else {
        return "Format Error: Date Quarter End";
      }

      var result = moment(year + "-" + month + "-" + day, "YYYY-MM-DD");
      if (!result.isValid()) {
        return "Format Error: Date Quarter End";
      }
      return result.format("YYYY-MM-DD");
    }
    return "Format Error: Date Quarter End";
  },

  calINDayMonthYear: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var regex =
        /^\s*([0-9\u0966-\u096F]{1,2})\s([\u0966-\u096F]{2}|[^\s0-9\u0966-\u096F]+)\s([0-9\u0966-\u096F]{2}|[0-9\u0966-\u096F]{4})\s*$/;

      var regexSakaMonth =
        /(C\S*ait|\u091A\u0948\u0924\u094D\u0930)|(Vai|\u0935\u0948\u0936\u093E\u0916|\u092C\u0948\u0938\u093E\u0916)|(Jy|\u091C\u094D\u092F\u0947\u0937\u094D\u0920)|(dha|\u1E0Dha|\u0906\u0937\u093E\u0922|\u0906\u0937\u093E\u0922\u093C)|(vana|\u015Ar\u0101va\u1E47a|\u0936\u094D\u0930\u093E\u0935\u0923|\u0938\u093E\u0935\u0928)|(Bh\S+dra|Pro\u1E63\u1E6Dhapada|\u092D\u093E\u0926\u094D\u0930\u092A\u0926|\u092D\u093E\u0926\u094B)|(in|\u0906\u0936\u094D\u0935\u093F\u0928)|(K\S+rti|\u0915\u093E\u0930\u094D\u0924\u093F\u0915)|(M\S+rga|Agra|\u092E\u093E\u0930\u094D\u0917\u0936\u0940\u0930\u094D\u0937|\u0905\u0917\u0939\u0928)|(Pau|\u092A\u094C\u0937)|(M\S+gh|\u092E\u093E\u0918)|(Ph\S+lg|\u092B\u093E\u0932\u094D\u0917\u0941\u0928)/;

      var result = regex.exec(element.innerText);

      if (result) {
        var resultSaka = regexSakaMonth.exec(result[2]);

        if (resultSaka) {
          var month = 0;
          for (month = resultSaka.length - 1; month >= 0; month -= 1) {
            if (resultSaka[month]) {
              var day = parseInt(
                ConstantsNumber.getDevanagariDigitsToNormal(result[1])
              );

              var year = parseInt(
                ConstantsNumber.getDevanagariDigitsToNormal(
                  ConstantsDate.getSakaYearPadding(result[3], month, day)
                )
              );

              var result = moment(
                ConstantsDate.getSakaToGregorian(year, month, day),
                ["YYYY-MM-DD", "YYYY-M-D"],
                true
              );

              if (!result.isValid()) {
                return "Format Error: Cal IN Day Month Year";
              }
              return result.format("YYYY-MM-DD");
              break;
            }
          }
        }
      }
    }
    return "Format Error: Cal IN Day Month Year";
  },

  dateDayMonth: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var result = moment(element.innerText, "DDMM");
      if (!result.isValid()) {
        return "Format Error: Date Day Month";
      }
      return result.format("--MM-DD");
    }
    return "Format Error: Date Day Month";
  },

  dateDayMonthDK: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var regex =
        /^\s*([0-9]{1,2})[^0-9]+(jan|feb|mar|apr|maj|jun|jul|aug|sep|okt|nov|dec)([A-Za-z]*)([.]*)\s*$/i;

      var result = regex.exec(element.innerText);

      if (result && result.length === 5) {
        var month = result[2];
        var day = result[1];

        var monthEnd = result[3];
        var monthPer = result[4];

        if (
          ((!monthEnd && !monthPer) ||
            (!monthEnd && monthPer) ||
            (monthEnd && !monthPer)) &&
          "01" <= day &&
          day <= moment(month, "MMM").daysInMonth()
        ) {
          var dateResult = moment(day + "-" + month, "DD-MMM");

          if (!dateResult.isValid()) {
            return "Format Error: Date Day Month DK";
          }
          return dateResult.format("--MM-DD");
        }
      }
    }
    return "Format Error: Date Day Month DK";
  },

  dateDayMonthEN: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var regex =
        /^\s*([0-9]{1,2})[^0-9]+(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)\s*$/;
      var result = regex.exec(element.innerText);
      if (result) {
        var month = result[2];
        var day = result[1];
        var dateResult = moment(day + "-" + month, "DD-MMM");

        if (!dateResult.isValid()) {
          return "Format Error: Date Day Month EN";
        }
        return dateResult.format("--MM-DD");
      }
    }
    return "Format Error: Date Day Month EN";
  },

  dateDayMonthYear: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var regex =
        /^\s*([0-9]{1,2})[^0-9]+([0-9]{1,2})[^0-9]+([0-9]{4}|[0-9]{1,2})\s*$/;

      var result = regex.exec(element.innerText);

      if (result) {
        var dateResult = moment(
          element.innerText,
          [
            "DD MM YY",
            "DD.MM.YYYY",
            "DD.MM.Y",
            "DD.MM.YY",
            "D.M.YY",
            "D.M.YYYY",
            "DD/MM/YY",
            "DD/MM/YYYY"
          ],
          true
        );
        if (!dateResult.isValid()) {
          return "Format Error: Date Day Month Year";
        }

        if (dateResult.year().toString().length === 1) {
          dateResult.year(2000 + dateResult.year());
        }
        if (dateResult.year().toString().length === 2) {
          dateResult.year(2000 + dateResult.year());
        }

        if (
          dateResult.year().toString().length === 3 &&
          result[3].length === 3
        ) {
          return "Format Error: Date Day Month Year";
        }
        return dateResult.format("YYYY-MM-DD");
      }
    }
    return "Format Error: Date Day Month Year";
  },

  dateDayMonthYearDK: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var regex =
        /^\s*([0-9]{1,2})[^0-9]+(jan|feb|mar|apr|maj|jun|jul|aug|sep|okt|nov|dec)([A-Za-z]*)([.]*)[^0-9]*([0-9]{4}|[0-9]{1,2})\s*$/i;

      var result = regex.exec(element.innerText);

      if (result) {
        var year = result[5];
        var day = result[1];
        var month = moment().month(result[2]).format("M");

        var monthEnd = result[3];
        var monthPer = result[4];

        if (
          (month && ((!monthEnd && !monthPer) || (!monthEnd && monthPer))) ||
          (monthEnd && !monthPer)
        ) {
          var dateResult = moment();

          var dateResult = moment(day + "-" + month + "-" + year, "DD-M-YYYY");

          if (!dateResult.isValid()) {
            return "Format Error: Date Day Month DK";
          }

          if (dateResult.year().toString().length === 1) {
            dateResult.year(2000 + dateResult.year());
          }
          if (dateResult.year().toString().length === 2) {
            dateResult.year(2000 + dateResult.year());
          }

          return dateResult.format("YYYY-MM-DD");
        }
      }
    }
    return "Format Error: Date Day Month Year DK";
  },

  dateDayMonthYearEN: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var regex =
        /^\s*([0-9]{1,2})[^0-9]+(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)[^0-9]+([0-9]{4}|[0-9]{1,2})\s*$/;
      var result = regex.exec(element.innerText);
      if (result) {
        var month = result[2];
        var day = result[1];
        var year = result[3];
        var dateResult = moment(day + "-" + month + "-" + year, [
          "DD-MMM-YY",
          "DD-MMM-YYYY"
        ]);
        if (!dateResult.isValid()) {
          return "Format Error: Date Day Month Year EN";
        }

        if (dateResult.year().toString().length === 1) {
          dateResult.year(2000 + dateResult.year());
        }
        if (dateResult.year().toString().length === 2) {
          dateResult.year(2000 + dateResult.year());
        }

        return dateResult.format("YYYY-MM-DD");
      }
    }
    return "Format Error: Date Day Month Year EN";
  },

  datedaymonthyearin: function (arg, pattern) {
    var result = pattern.exec(arg);
    if (result) {
      var year = ConstantsNumber.getDevanagariDigitsToNormal(result[3]);

      var month;
      if (
        ConstantsDate.getGregorianHindiMonthNumber[
          ConstantsNumber.getDevanagariDigitsToNormal(result[2])
        ]
      ) {
        month =
          ConstantsDate.getGregorianHindiMonthNumber[
            ConstantsNumber.getDevanagariDigitsToNormal(result[2])
          ];
      } else {
        month = ConstantsNumber.getDevanagariDigitsToNormal(result[2]);
      }

      var day = ConstantsNumber.getDevanagariDigitsToNormal(result[1]);

      var dateResult = moment(day + "-" + month + "-" + year, "DD-MM-YYYY");

      if (!dateResult.isValid()) {
        return "Format Error (date value): Date Day Month Year IN";
      }
      return dateResult.format("YYYY-MM-DD");
    }
    return "Format Error (date pattern): Date Day Month Year IN";
  },

  datedaymonthyearinTR3: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonthyearin(
        element.innerText,
        /^\s*([0-9\u0966-\u096F]{1,2})\s([\u0966-\u096F]{2}|[^\s0-9\u0966-\u096F]+)\s([0-9\u0966-\u096F]{2}|[0-9\u0966-\u096F]{4})\s*$/
      );
    }
  },

  datedaymonthyearinTR4: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonthyearin(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2}|[\u0966-\u096f]{1,2})[^0-9\u0966-\u096f]+(\u091c\u0928\u0935\u0930\u0940|\u092b\u0930\u0935\u0930\u0940|\u092e\u093e\u0930\u094d\u091a|\u0905\u092a\u094d\u0930\u0948\u0932|\u092e\u0908|\u091c\u0942\u0928|\u091c\u0941\u0932\u093e\u0908|\u0905\u0917\u0938\u094d\u0924|\u0938\u093f\u0924\u0902\u092c\u0930|\u0905\u0915\u094d\u091f\u0942\u092c\u0930|\u0928\u0935\u0902\u092c\u0930|\u0926\u093f\u0938\u0902\u092c\u0930)[^0-9\u0966-\u096f]+([0-9]{2}|[0-9]{4}|[\u0966-\u096f]{2}|[\u0966-\u096f]{4})[ \t\n\r]*$/
      );
    }
  },

  dateDotEU: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var result = moment(element.innerText, "DD.MM.Y");
      if (!result.isValid()) {
        return "Format Error: Date Dot EU";
      }
      return result.format("YYYY-MM-DD");
    }
    return "Format Error: Date Dot EU";
  },

  dateDotUS: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var result = moment(element.innerText, "MM.DD.Y");
      if (!result.isValid()) {
        return "Format Error: Date Dot US";
      }
      return result.format("YYYY-MM-DD");
    }
    return "Format Error: Date Dot US";
  },

  dateEraYearMonthDayJP: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var regex =
        /^[\s ]*(\u660E\u6CBB|\u660E|\u5927\u6B63|\u5927|\u662D\u548C|\u662D|\u5E73\u6210|\u5E73|\u4EE4\u548C|\u4EE4)[\s ]*([0-9\uFF10-\uFF19]{1,2}|\u5143)[\s ]*(\u5E74)[\s ]*([0-9\uFF10-\uFF19]{1,2})[\s ]*(\u6708)[\s ]*([0-9\uFF10-\uFF19]{1,2})[\s ]*(\u65E5)[\s]*$/;

      var result = regex.exec(
        FiltersNumber.jpDigitsToNormal(element.innerText)
      );

      if (result) {
        var year = FiltersDate.eraYear(result[1], result[2]);
        var month = result[4];
        var day = result[6];

        var dateResult = moment(day + "-" + month + "-" + year, "DD-MM-Y");

        if (!dateResult.isValid()) {
          return "Format Error: Date Era Year Month Day JP";
        }
        return dateResult.format("YYYY-MM-DD");
      }
    }
    return "Format Error: Date Era Year Month Day JP";
  },

  dateEraYearMonthJP: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var regex =
        /^[\s ]*(\u660E\u6CBB|\u660E|\u5927\u6B63|\u5927|\u662D\u548C|\u662D|\u5E73\u6210|\u5E73|\u4EE4\u548C|\u4EE4)[\s ]*([0-9\uFF10-\uFF19]{1,2}|\u5143)[\s ]*(\u5E74)[\s ]*([0-9\uFF10-\uFF19]{1,2})[\s ]*(\u6708)[\s ]*$/;

      var result = regex.exec(
        FiltersNumber.jpDigitsToNormal(element.innerText)
      );
      if (result) {
        var year = FiltersDate.eraYear(result[1], result[2]);
        var month = result[4];

        var dateResult = moment(month + "-" + year, "MM-Y");
        if (!dateResult.isValid()) {
          return "Format Error: Date Era Year Month JP";
        }
        return dateResult.format("YYYY-MM");
      }
    }
    return "Format Error: Date Era Year Month JP";
  },

  dateLongMonthYear: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var result = moment(element.innerText, ["MMMM YY", "MMMM YYYY"], true);
      if (!result.isValid()) {
        return "Format Error: Date Long Month Year";
      }
      return result.format("YYYY-MM");
    }
    return "Format Error: Date Long Month Year";
  },

  dateLongUK: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var result = moment(element.innerText, "DD MMM YY");
      if (!result.isValid()) {
        return "Format Error: Date Long UK";
      }
      return result.format("YYYY-MM-DD");
    }
    return "Format Error: Date Long UK";
  },

  dateLongUS: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var result = moment(element.innerText, "MMM DD, YY");
      if (!result.isValid()) {
        return "Format Error: Date Long US";
      }
      return result.format("YYYY-MM-DD");
    }
    return "Format Error: Date Long US";
  },

  dateLongYearMonth: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var result = moment(element.innerText, "YY MMM");
      if (!result.isValid()) {
        return "Format Error: Date Long Year Month";
      }
      return result.format("YYYY-MM");
    }
    return "Format Error: Date Long Year Month";
  },

  dateMonthDay: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var result = moment(element.innerText, "MMDD");
      if (!result.isValid()) {
        return "Format Error: Date Month Day";
      }
      return result.format("--MM-DD");
    }
    return "Format Error: Date Month Day";
  },

  dateMonthDayEN: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var regex =
        /^\s*(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)[^0-9]+([0-9]{1,2})[A-Za-z]{0,2}\s*$/;

      var result = regex.exec(element.innerText);

      if (result) {
        var month = result[1];
        var day = result[2];

        var dateResult = moment(month + "-" + day, "MMM-DD");

        if (!dateResult.isValid()) {
          return "Format Error: Date Month Day EN";
        }

        return dateResult.format("--MM-DD");
      }
    }
    return "Format Error: Date Month Day EN";
  },

  dateMonthDayYear: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var regex =
        /^\s*([0-9]{1,2})[^0-9]+([0-9]{1,2})[^0-9]+([0-9]{4}|[0-9]{1,2})\s*$/;

      var result = regex.exec(element.innerText);

      if (result) {
        var year = result[3];
        var month = result[1];
        var day = result[2];
        // two-digit years are assumed to fall between 2000 and 2099
        if (year.length === 2) {
          year = "20" + year;
        }
        // one-digit years to fall between 2000 and 2009
        if (year.length === 1) {
          year = "200" + year;
        }

        var dateResult = moment(year + "-" + month + "-" + day, [
          "YY-MM-DD",
          "YYYY-MM-DD"
        ]);
        if (!dateResult.isValid()) {
          return "Format Error: Date Month Day Year";
        }
        return dateResult.format("YYYY-MM-DD");
      }
    }
    return "Format Error: Date Month Day Year";
  },

  dateMonthDayYearEN: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var regex =
        /^\s*(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)[^0-9]+([0-9]+)[^0-9]+([0-9]{4}|[0-9]{1,2})\s*$/;

      var result = regex.exec(element.innerText);

      if (result) {
        var year = result[3];
        var month = result[1];
        var day = result[2];

        var dateResult = moment(year + "-" + month + "-" + day, [
          "YY-MM-DD",
          "YYYY-MMM-DD"
        ]);
        if (!dateResult.isValid()) {
          return "Format Error: Date Month Day Year EN";
        }
        if (dateResult.year().toString().length === 1) {
          dateResult.year(2000 + dateResult.year());
        }
        if (dateResult.year().toString().length === 2) {
          dateResult.year(2000 + dateResult.year());
        }
        return dateResult.format("YYYY-MM-DD");
      }
    }
    return "Format Error: Date Month Day Year EN";
  },

  dateMonthYear: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var regex =
        /^[\s\u00A0]*([0-9]{1,2})[^0-9]+([0-9]{4}|[0-9]{1,2})[\s\u00A0]*$/;
      var result = regex.exec(element.innerText);

      if (result) {
        var year = result[2];
        var month = result[1];

        var dateResult = moment(year + "-" + month, ["YYYY-MM"]);
        if (!dateResult.isValid()) {
          return "Format Error: Date Month Year";
        }
        if (dateResult.year().toString().length === 1) {
          dateResult.year(2000 + dateResult.year());
        }
        if (dateResult.year().toString().length === 2) {
          dateResult.year(2000 + dateResult.year());
        }

        return dateResult.format("YYYY-MM");
      }
    }
    return "Format Error: Date Month Year";
  },

  dateMonthYearDK: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var regex =
        /^\s*(jan|feb|mar|apr|maj|jun|jul|aug|sep|okt|nov|dec)([A-Za-z]*)([.]*)[^0-9]*([0-9]{4}|[0-9]{1,2})\s*$/i;
      var result = regex.exec(element.innerText);
      if (result) {
        var year = result[4];
        var month = result[1];

        var dateResult = moment(
          year + "-" + month,
          ["YYYY-MMM", "YY-MMM", "Y-MMM"],
          true
        );

        if (!dateResult.isValid()) {
          return "Format Error: Date Month Year DK";
        }
        if (dateResult.year().toString().length === 1) {
          dateResult.year(2000 + dateResult.year());
        }
        if (dateResult.year().toString().length === 2) {
          dateResult.year(2000 + dateResult.year());
        }
        return dateResult.format("YYYY-MM");
      }
    }
    return "Format Error: Date Month Year DK";
  },

  dateMonthYearEN: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var regex =
        /^\s*(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)[^0-9]+([0-9]{1,2}|[0-9]{4})\s*$/;
      var result = regex.exec(element.innerText);

      if (result) {
        var year = result[2];
        var month = result[1];

        var dateResult = moment(year + "-" + month, ["YYYY-MMM"]);
        if (!dateResult.isValid()) {
          return "Format Error: Date Month Year EN";
        }
        if (dateResult.year().toString().length === 1) {
          dateResult.year(2000 + dateResult.year());
        }
        if (dateResult.year().toString().length === 2) {
          dateResult.year(2000 + dateResult.year());
        }
        return dateResult.format("YYYY-MM");
      }
    }
    return "Format Error: Date Month Year EN";
  },

  dateMonthYearIN: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var regex = /^\s*([^\s0-9\u0966-\u096F]+)\s([0-9\u0966-\u096F]{4})\s*$/;
      var result = regex.exec(element.innerText);
      if (result) {
        if (result[1] in ConstantsDate.getGregorianHindiMonthNumber) {
          var year = ConstantsNumber.getDevanagariDigitsToNormal(result[2]);
          var month = ConstantsDate.getGregorianHindiMonthNumber[result[1]];
          var dateResult = moment(month + "-" + year, "MM-YYYY");
          if (!dateResult.isValid()) {
            return "Format Error: Date Month Year IN";
          }
          return dateResult.format("YYYY-MM");
        }
      }
    }
    return "Format Error: Date Month Year IN";
  },

  dateShortDayMonthUK: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var result = moment(element.innerText, "DD MM");
      if (!result.isValid()) {
        return "Format Error: Date Short Day Month UK";
      }
      return result.format("--MM-DD");
    }
    return "Format Error: Date Short Day Month UK";
  },

  dateShortEU: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return "TODO";
    }

    return "Format Error: Date Short EU";
  },

  dateShortMonthDayUS: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var result = moment(element.innerText, "MMM DD");
      if (!result.isValid()) {
        return "Format Error: Date Short Month Day US";
      }
      return result.format("--MM-DD");
    }
    return "Format Error: Date Short Month Day US";
  },

  dateShortMonthYear: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var result = moment(element.innerText, "MMM YYYY");
      if (!result.isValid()) {
        return "Format Error: Date Short Month Year US";
      }
      return result.format("YYYY-MM");
    }
    return "Format Error: Date Short Month Year US";
  },

  dateShortUK: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var result = moment(element.innerText, ["DD MMM YY", "DD MMM YYYY"]);
      if (!result.isValid()) {
        return "Format Error: Date Short UK";
      }
      return result.format("YYYY-MM-DD");
    }
    return "Format Error: Date Short UK";
  },

  dateShortUS: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var result = moment(element.innerText, ["MMM DD, YY", "MMM DD, YYYY"]);
      if (!result.isValid()) {
        return "Format Error: Date Short US";
      }
      return result.format("YYYY-MM-DD");
    }
    return "Format Error: Date Short US";
  },

  dateShortYearMonth: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var result = moment(element.innerText, ["YY MMM", "YYYY MMM"]);
      if (!result.isValid()) {
        return "Format Error: Date Short Year Month";
      }
      return result.format("YYYY-MM");
    }
    return "Format Error: Date Short Year Month";
  },

  dateSlashDayMonthEU: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var result = moment(element.innerText, "DD/MM");
      if (!result.isValid()) {
        return "Format Error: Date Slash Day Month EU";
      }
      return result.format("--MM-DD");
    }
    return "Format Error: Date Slash Day Month EU";
  },

  dateSlashEU: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var result = moment(element.innerText, ["DD/MM/YY", "DD/MM/YYYY"]);
      if (!result.isValid()) {
        return "Format Error: Date Slash EU";
      }
      return result.format("YYYY-MM-DD");
    }
    return "Format Error: Date Slash EU";
  },

  dateSlashMonthDayUS: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var result = moment(element.innerText, "MM/DD");
      if (!result.isValid()) {
        return "Format Error: Date Slash Month Day US";
      }
      return result.format("--MM-DD");
    }
    return "Format Error: Date Slash Month Day US";
  },

  dateSlashUS: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var result = moment(element.innerText, ["MM/DD/YY", "MM/DD/YYYY"]);
      if (!result.isValid()) {
        return "Format Error: Date Slash EU";
      }
      return result.format("YYYY-MM-DD");
    }
    return "Format Error: Date Slash EU";
  },

  dateYearMonthCJK: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var regex =
        /^[\s\u00A0]*([0-9]{4}|[0-9]{1,2})[\s\u00A0]*\u5E74[\s\u00A0]*([0-9]{1,2})[\s\u00A0]*\u6708\s*$/;
      var result = regex.exec(
        FiltersNumber.jpDigitsToNormal(element.innerText)
      );
      if (result) {
        var month = result[2];
        var year = result[1];
        var dateResult = moment(year + "-" + month, "YYYY-MM");
        if (!dateResult.isValid()) {
          return "Format Error: Date Year Month CJK";
        }

        if (dateResult.year().toString().length === 1) {
          dateResult.year(2000 + dateResult.year());
        }
        if (dateResult.year().toString().length === 2) {
          dateResult.year(2000 + dateResult.year());
        }

        return dateResult.format("YYYY-MM");
      }
    }
    return "Format Error: Date Year Month CJK";
  },

  dateYearMonthDay: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var fromJP = FiltersNumber.jpDigitsToNormal(element.innerText);

      var regex =
        /^[\s\u00A0]*([0-9]{4}|[0-9]{1,2})[^0-9]+([0-9]{1,2})[^0-9]+([0-9]{1,2})[\s\u00A0]*$/;

      var result = regex.exec(fromJP);

      if (result) {
        var year = result[1];
        var month = result[2];
        var day = result[3];

        var dateResult = moment(
          year + "-" + month + "-" + day,
          ["YYYY-MM-DD", "YYYY-MM-D", "YYYY-M-DD", "YY-M-DD", "Y-M-DD"],
          true
        );

        if (!dateResult.isValid()) {
          return "Format Error: Date Year Month Day";
        }
        if (dateResult.year().toString().length === 1) {
          dateResult.year(2000 + dateResult.year());
        }
        if (dateResult.year().toString().length === 2) {
          dateResult.year(2000 + dateResult.year());
        }
        return dateResult.format("YYYY-MM-DD");
      }
    }
    return "Format Error: Date Year Month Day";
  },

  dateYearMonthDayCJK: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var regex =
        /^[\s\u00A0]*([0-9]{4}|[0-9]{1,2})[\s\u00A0]*\u5E74[\s\u00A0]*([0-9]{1,2})[\s\u00A0]*\u6708[\s\u00A0]*([0-9]{1,2})[\s\u00A0]*\u65E5[\s\u00A0]*$/;
      var result = regex.exec(
        FiltersNumber.jpDigitsToNormal(element.innerText)
      );
      if (result) {
        var year = result[1];
        var month = result[2];
        var day = result[3];
        var dateResult = moment(year + "-" + month + "-" + day, "YYYY-MM-DD");
        if (!dateResult.isValid()) {
          return "Format Error: Date Year Month Day CJK";
        }

        if (dateResult.year().toString().length === 1) {
          dateResult.year(2000 + dateResult.year());
        }
        if (dateResult.year().toString().length === 2) {
          dateResult.year(2000 + dateResult.year());
        }

        return dateResult.format("YYYY-MM-DD");
      }
    }
    return "Format Error: Date Year Month Day CJK";
  },

  dateYearMonthEN: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var regex =
        /^\s*([0-9]{1,2}|[0-9]{4})[^0-9]+(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)\s*$/;

      var result = regex.exec(element.innerText);
      if (result) {
        var month = result[2];
        var year = result[1];
        var dateResult = moment(month + "-" + year, "MMM-Y");
        if (!dateResult.isValid()) {
          return "Format Error: Date Year Month EN";
        }

        if (dateResult.year().toString().length === 1) {
          dateResult.year(2000 + dateResult.year());
        }
        if (dateResult.year().toString().length === 2) {
          dateResult.year(2000 + dateResult.year());
        }

        return dateResult.format("YYYY-MM");
      }
    }
    return "Format Error: Date Year Month EN";
  },

  // TR4 common functions
  datedaymonth: function (arg, pattern, moTblArg, dyArg, moArg, lastindexArg) {
    var moTbl = moTblArg;
    if (typeof moTblArg === "undefined") {
      moTbl = ConstantsDate.monthnumber;
    }
    var dy = dyArg || 1;
    var mo = moArg || 2;
    var lastindex = lastindexArg || 2;
    var m = pattern.exec(arg);
    if (m && ConstantsNumber.lastindex(m) === lastindex && dy in m) {
      dy = ConstantsNumber.zeroPadTwoDigits(m[dy]);
      mo = m[mo].toLowerCase();
      if (!moTbl || mo in moTbl) {
        mo = moTbl ? moTbl[mo] : parseInt(mo);
        if (
          mo in ConstantsDate.maxDayInMo &&
          "01" <= dy &&
          dy <= (ConstantsDate.maxDayInMo[mo] || "00")
        ) {
          return "--" + ConstantsNumber.zeroPadTwoDigits(mo) + "-" + dy;
        }
      }
    }
    return "Format Error: Date Day Month";
  },

  datemonthyear: function (arg, pattern, moTblArg, moArg, yrArg, lastindexArg) {
    var moTbl = moTblArg;
    if (typeof moTblArg === "undefined") {
      moTbl = ConstantsDate.monthnumber;
    }
    var mo = moArg || 1;
    var yr = yrArg || 2;
    var lastindex = lastindexArg || 2;
    var m = pattern.exec(arg);
    if (m && ConstantsNumber.lastindex(m) === lastindex && yr in m && mo in m) {
      yr = ConstantsDate.getYr4(m[yr]);
      mo = m[mo].toLowerCase();
      if (!moTbl || mo in moTbl) {
        mo = moTbl ? moTbl[mo] : parseInt(mo);
        return yr + "-" + ConstantsNumber.zeroPadTwoDigits(mo);
      }
    }
    return "Format Error: Month Year";
  },

  datedaymonthyear: function (
    arg,
    pattern,
    moTblArg,
    dyArg,
    moArg,
    yrArg,
    lastindexArg
  ) {
    var moTbl = moTblArg;
    if (typeof moTblArg === "undefined") {
      moTbl = ConstantsDate.monthnumber;
    }
    var dy = dyArg || 1;
    var mo = moArg || 2;
    var yr = yrArg || 3;
    var lastindex = lastindexArg || 3;
    var m = pattern.exec(arg);
    if (
      m &&
      ConstantsNumber.lastindex(m) === lastindex &&
      yr in m &&
      mo in m &&
      dy in m
    ) {
      yr = ConstantsDate.getYr4(m[yr]);
      dy = ConstantsNumber.zeroPadTwoDigits(m[dy]);
      mo = m[mo].toLowerCase();
      if (!moTbl || mo in moTbl) {
        mo = moTbl ? moTbl[mo] : parseInt(mo);
        mo = ConstantsNumber.zeroPadTwoDigits(mo);
        return yr + "-" + mo + "-" + dy;
      }
    }
    return "Format Error: Day Month Year";
  },

  // TR4 patterned calls
  datedaymonthbg: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonth(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2})[^0-9]+(\u044f\u043d|\u0444\u0435\u0432|\u043c\u0430\u0440|\u0430\u043f\u0440|\u043c\u0430\u0439|\u043c\u0430\u0438|\u044e\u043d\u0438|\u044e\u043b\u0438|\u0430\u0432\u0433|\u0441\u0435\u043f|\u043e\u043a\u0442|\u043d\u043e\u0435|\u0434\u0435\u043a|\u042f\u041d|\u0424\u0415\u0412|\u041c\u0410\u0420|\u0410\u041f\u0420|\u041c\u0410\u0419|\u041c\u0410\u0418|\u042e\u041d\u0418|\u042e\u041b\u0418|\u0410\u0412\u0413|\u0421\u0415\u041f|\u041e\u041a\u0422|\u041d\u041e\u0415|\u0414\u0415\u041a|\u042f\u043d|\u0424\u0435\u0432|\u041c\u0430\u0440|\u0410\u043f\u0440|\u041c\u0430\u0439|\u041c\u0430\u0438|\u042e\u043d\u0438|\u042e\u043b\u0438|\u0410\u0432\u0433|\u0421\u0435\u043f|\u041e\u043a\u0442|\u041d\u043e\u0435|\u0414\u0435\u043a)[^0-9]{0,6}[ \t\n\r]*$/
      );
    }
  },

  datedaymonthcs: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonth(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2})[^0-9]+(ledna|\xfanora|unora|b\u0159ezna|brezna|dubna|kv\u011btna|kvetna|\u010dervna|cervna|\u010dervence|cervence|srpna|z\xe1\u0159\xed|zari|\u0159\xedjna|rijna|listopadu|prosince|led|\xfano|uno|b\u0159e|bre|dub|kv\u011b|kve|\u010dvn|cvn|\u010dvc|cvc|srp|z\xe1\u0159|zar|\u0159\xedj|rij|lis|pro|LEDNA|\xdaNORA|UNORA|B\u0158EZNA|BREZNA|DUBNA|KV\u011aTNA|KVETNA|\u010cERVNA|CERVNA|\u010cERVENCE|CERVENCE|SRPNA|Z\xc1\u0158\xcd|ZARI|\u0158\xcdJNA|RIJNA|LISTOPADU|PROSINCE|LED|\xdaNO|UNO|B\u0158E|BRE|DUB|KV\u011a|KVE|\u010cVN|CVN|\u010cVC|CVC|SRP|Z\xc1\u0158|ZAR|\u0158\xcdJ|RIJ|LIS|PRO|Ledna|\xdanora|Unora|B\u0159ezna|Brezna|Dubna|Kv\u011btna|Kvetna|\u010cervna|Cervna|\u010cervence|Cervence|Srpna|Z\xe1\u0159\xed|Zari|\u0158\xedjna|Rijna|Listopadu|Prosince|Led|\xdano|Uno|B\u0159e|Bre|Dub|Kv\u011b|Kve|\u010cvn|Cvn|\u010cvc|Cvc|Srp|Z\xe1\u0159|Zar|\u0158\xedj|Rij|Lis|Pro)\.?[ \t\n\r]*$/,
        ConstantsDate.monthnumbercs
      );
    }
  },

  datedaymonthcy: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonth(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2})[^0-9a-zA-Z]+(ion|chwe|maw|ebr|mai|meh|gor|aws|med|hyd|tach|rhag|ION|CHWE|MAW|EBR|MAI|MEH|GOR|AWS|MED|HYD|TACH|RHAG|Ion|Chwe|Maw|Ebr|Mai|Meh|Gor|Aws|Med|Hyd|Tach|Rhag)[^0-9]{0,7}[ \t\n\r]*$/,
        ConstantsDate.monthnumbercy
      );
    }
  },

  datedaymonthde: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonth(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2})[^0-9]+(jan|j\xe4n|jaen|feb|m\xe4r|maer|mar|apr|mai|jun|jul|aug|sep|okt|nov|dez|JAN|J\xc4N|JAEN|FEB|M\xc4R|MAER|MAR|APR|MAI|JUN|JUL|AUG|SEP|OKT|NOV|DEZ|Jan|J\xe4n|Jaen|Feb|M\xe4r|Maer|Mar|Apr|Mai|Jun|Jul|Aug|Sep|Okt|Nov|Dez)[^0-9]{0,6}[ \t\n\r]*$/
      );
    }
  },

  datedaymonthdk: function (element) {
    var moTbl = ConstantsDate.monthnumber;
    var m =
      /^[ \t\n\r]*([0-9]{1,2})[^0-9]+(jan|feb|mar|apr|maj|jun|jul|aug|sep|okt|nov|dec)([A-Za-z]*)([.]*)[ \t\n\r]*$/i.exec(
        element.innerText
      );
    if (m && ConstantsNumber.lastindex(m) === 4) {
      var day = ConstantsNumber.zeroPadTwoDigits(m[1]);
      var mon3 = m[2].toLowerCase();
      var monEnd = m[3];
      var monPer = m[4];
      if (mon3 in moTbl) {
        var mo = moTbl[mon3];
        if (
          ((!monEnd && !monPer) ||
            (!monEnd && monPer) ||
            (monEnd && !monPer)) &&
          mo in ConstantsNumber.maxDayInMo &&
          "01" <= day &&
          day <= ConstantsNumber.maxDayInMo[mo]
        ) {
          return "--" + ConstantsNumber.zeroPadTwoDigits(mo) + "-" + day;
        }
      }
    }
    return "Format Error: Date Day Month";
  },

  datedaymonthel: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonth(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2})[^0-9]+(\u03b9\u03b1\u03bd|\u03af\u03b1\u03bd|\u03c6\u03b5\u03b2|\u03bc\u03ac\u03c1|\u03bc\u03b1\u03c1|\u03b1\u03c0\u03c1|\u03ac\u03c0\u03c1|\u03b1\u03c1\u03af\u03bb|\u03ac\u03c1\u03af\u03bb|\u03b1\u03c1\u03b9\u03bb|\u03ac\u03c1\u03b9\u03bb|\u03bc\u03b1\u0390|\u03bc\u03b1\u03b9|\u03bc\u03ac\u03b9|\u03bc\u03b1\u03ca|\u03bc\u03ac\u03ca|\u03b9\u03bf\u03cd\u03bd|\u03af\u03bf\u03cd\u03bd|\u03af\u03bf\u03c5\u03bd|\u03b9\u03bf\u03c5\u03bd|\u03b9\u03bf\u03cd\u03bb|\u03af\u03bf\u03cd\u03bb|\u03af\u03bf\u03c5\u03bb|\u03af\u03bf\u03c5\u03bb|\u03b9\u03bf\u03c5\u03bb|\u03b1\u03cd\u03b3|\u03b1\u03c5\u03b3|\u03c3\u03b5\u03c0|\u03bf\u03ba\u03c4|\u03cc\u03ba\u03c4|\u03bd\u03bf\u03ad|\u03bd\u03bf\u03b5|\u03b4\u03b5\u03ba|\u0399\u0391\u039d|\u038a\u0391\u039d|I\u0391\u039d|\u03a6\u0395\u0392|\u039c\u0386\u03a1|\u039c\u0391\u03a1|\u0391\u03a0\u03a1|\u0386\u03a0\u03a1|A\u03a0\u03a1|A\u03a1\u0399\u039b|\u0386\u03a1\u0399\u039b|\u0391\u03a1\u0399\u039b|\u039c\u0391\u03aa\u0301|\u039c\u0391\u0399|\u039c\u0386\u0399|\u039c\u0391\u03aa|\u039c\u0386\u03aa|\u0399\u039f\u038e\u039d|\u038a\u039f\u038e\u039d|\u038a\u039f\u03a5\u039d|I\u039f\u03a5\u039d|\u0399\u039f\u03a5\u039d|I\u039f\u03a5\u039d|\u0399\u039f\u038e\u039b|\u038a\u039f\u038e\u039b|\u038a\u039f\u03a5\u039b|I\u039f\u038e\u039b|\u0399\u039f\u03a5\u039b|I\u039f\u03a5\u039b|\u0391\u038e\u0393|\u0391\u03a5\u0393|\u03a3\u0395\u03a0|\u039f\u039a\u03a4|\u038c\u039a\u03a4|O\u039a\u03a4|\u039d\u039f\u0388|\u039d\u039f\u0395|\u0394\u0395\u039a|\u0399\u03b1\u03bd|\u038a\u03b1\u03bd|I\u03b1\u03bd|\u03a6\u03b5\u03b2|\u039c\u03ac\u03c1|\u039c\u03b1\u03c1|\u0391\u03c0\u03c1|\u0386\u03c0\u03c1|A\u03c0\u03c1|\u0391\u03c1\u03af\u03bb|\u0386\u03c1\u03af\u03bb|A\u03c1\u03af\u03bb|A\u03c1\u03b9\u03bb|\u0386\u03c1\u03b9\u03bb|\u0391\u03c1\u03b9\u03bb|\u039c\u03b1\u0390|\u039c\u03b1\u03b9|\u039c\u03ac\u03b9|\u039c\u03b1\u03ca|\u039c\u03ac\u03ca|\u0399\u03bf\u03cd\u03bd|\u038a\u03bf\u03cd\u03bd|\u038a\u03bf\u03c5\u03bd|I\u03bf\u03cd\u03bd|\u0399\u03bf\u03c5\u03bd|I\u03bf\u03c5\u03bd|\u0399\u03bf\u03cd\u03bb|\u038a\u03bf\u03cd\u03bb|\u038a\u03bf\u03c5\u03bb|I\u03bf\u03cd\u03bb|\u0399\u03bf\u03c5\u03bb|I\u03bf\u03c5\u03bb|\u0391\u03cd\u03b3|\u0391\u03c5\u03b3|\u03a3\u03b5\u03c0|\u039f\u03ba\u03c4|\u038c\u03ba\u03c4|O\u03ba\u03c4|\u039d\u03bf\u03ad|\u039d\u03bf\u03b5|\u0394\u03b5\u03ba)[^0-9]{0,8}[ \t\n\r]*$/
      );
    }
  },

  datedaymonthen: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonth(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2})[^0-9]+(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)[ \t\n\r]*$/
      );
    }
  },

  datemonthdayen: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonth(
        element.innerText,
        /^[ \t\n\r]*(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)[^0-9]+([0-9]{1,2})[A-Za-z]{0,2}[ \t\n\r]*$/,
        null,
        2,
        1
      );
    }
  },

  datedaymonthes: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonth(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2})[^0-9]+(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic|ENE|FEB|MAR|ABR|MAY|JUN|JUL|AGO|SEP|OCT|NOV|DIC|Ene|Feb|Mar|Abr|May|Jun|Jul|Ago|Sep|Oct|Nov|Dic)[^0-9]{0,7}[ \t\n\r]*$/
      );
    }
  },

  datedaymonthet: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonth(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2})[^0-9]+(jaan|veebr|m\xe4rts|marts|apr|mai|juuni|juuli|aug|sept|okt|nov|dets|JAAN|VEEBR|M\xc4RTS|MARTS|APR|MAI|JUUNI|JUULI|AUG|SEPT|OKT|NOV|DETS|Jaan|Veebr|M\xe4rts|Marts|Apr|Mai|Juuni|Juuli|Aug|Sept|Okt|Nov|Dets)[^0-9]{0,5}[ \t\n\r]*$/
      );
    }
  },

  datedaymonthfi: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonth(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2})[^0-9]*[^0-9a-zA-Z]+(tam|hel|maa|huh|tou|kes|hei|elo|syy|lok|mar|jou|TAM|HEL|MAA|HUH|TOU|KES|HEI|ELO|SYY|LOK|MAR|JOU|Tam|Hel|Maa|Huh|Tou|Kes|Hei|Elo|Syy|Lok|Mar|Jou)[^0-9]{0,8}[ \t\n\r]*$/,
        ConstantsDate.monthnumberfi
      );
    }
  },

  datedaymonthfr: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonth(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2})[^0-9]+(janv|f\xe9vr|fevr|mars|avr|mai|juin|juil|ao\xfbt|aout|sept|oct|nov|d\xe9c|dec|JANV|F\xc9VR|FEVR|MARS|AVR|MAI|JUIN|JUIL|AO\xdbT|AOUT|SEPT|OCT|NOV|D\xc9C|DEC|Janv|F\xe9vr|Fevr|Mars|Avr|Mai|Juin|Juil|Ao\xfbt|Aout|Sept|Oct|Nov|D\xe9c|Dec)[^0-9]{0,5}[ \t\n\r]*$/
      );
    }
  },

  datedaymonthhr: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonth(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2})[^0-9]+(sij|velj|o\u017eu|ozu|tra|svi|lip|srp|kol|ruj|lis|stu|pro|SIJ|VELJ|O\u017dU|OZU|TRA|SVI|LIP|SRP|KOL|RUJ|LIS|STU|PRO|Sij|Velj|O\u017eu|Ozu|Tra|Svi|Lip|Srp|Kol|Ruj|Lis|Stu|Pro)[^0-9]{0,6}[ \t\n\r]*$/,
        ConstantsDate.monthnumberhr
      );
    }
  },

  datemonthdayhu: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonth(
        element.innerText,
        /^[ \t\n\r]*(jan|feb|m\xe1rc|marc|\xe1pr|apr|m\xe1j|maj|j\xfan|jun|j\xfal|jul|aug|szept|okt|nov|dec|JAN|FEB|M\xc1RC|MARC|\xc1PR|APR|M\xc1J|MAJ|J\xdaN|JUN|J\xdaL|JUL|AUG|SZEPT|OKT|NOV|DEC|Jan|Feb|M\xe1rc|Marc|\xc1pr|Apr|M\xe1j|Maj|J\xfan|Jun|J\xfal|Jul|Aug|Szept|Okt|Nov|Dec)[^0-9]{0,7}[^0-9]+([0-9]{1,2})[ \t\n\r]*$/,
        null,
        2,
        1
      );
    }
  },

  datedaymonthit: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonth(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2})[^0-9]+(gen|feb|mar|apr|mag|giu|lug|ago|set|ott|nov|dic|GEN|FEB|MAR|APR|MAG|GIU|LUG|AGO|SET|OTT|NOV|DIC|Gen|Feb|Mar|Apr|Mag|Giu|Lug|Ago|Set|Ott|Nov|Dic)[^0-9]{0,6}[ \t\n\r]*$/
      );
    }
  },

  datemonthdaylt: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonth(
        element.innerText,
        /^[ \t\n\r]*(sau|vas|kov|bal|geg|bir|lie|rugp|rgp|rugs|rgs|spa|spl|lap|gru|grd|SAU|VAS|KOV|BAL|GEG|BIR|LIE|RUGP|RGP|RUGS|RGS|SPA|SPL|LAP|GRU|GRD|Sau|Vas|Kov|Bal|Geg|Bir|Lie|Rugp|Rgp|Rugs|Rgs|Spa|Spl|Lap|Gru|Grd)[^0-9]{0,6}[^0-9]+([0-9]{1,2})[^0-9]*[ \t\n\r]*$/,
        ConstantsDate.monthnumberlt,
        2,
        1
      );
    }
  },

  datedaymonthlv: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonth(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2})[^0-9]+(janv|febr|marts|apr|maijs|j\u016bn|jun|j\u016bl|jul|aug|sept|okt|nov|dec|JANV|FEBR|MARTS|APR|MAIJS|J\u016aN|JUN|J\u016aL|JUL|AUG|SEPT|OKT|NOV|DEC|Janv|Febr|Marts|Apr|Maijs|J\u016bn|Jun|J\u016bl|Jul|Aug|Sept|Okt|Nov|Dec)[^0-9]{0,6}[ \t\n\r]*$/
      );
    }
  },

  datedaymonthnl: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonth(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2})[^0-9]+(jan|feb|maa|mrt|apr|mei|jun|jul|aug|sep|okt|nov|dec|JAN|FEB|MAA|MRT|APR|MEI|JUN|JUL|AUG|SEP|OKT|NOV|DEC|Jan|Feb|Maa|Mrt|Apr|Mei|Jun|Jul|Aug|Sep|Okt|Nov|Dec)[^0-9]{0,6}[ \t\n\r]*$/
      );
    }
  },

  datedaymonthno: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonth(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2})[^0-9]+(jan|feb|mar|apr|mai|jun|jul|aug|sep|okt|nov|des|JAN|FEB|MAR|APR|MAI|JUN|JUL|AUG|SEP|OKT|NOV|DES|Jan|Feb|Mar|Apr|Mai|Jun|Jul|Aug|Sep|Okt|Nov|Des)[^0-9]{0,6}[ \t\n\r]*$/
      );
    }
  },

  datedaymonthpl: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonth(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2})[^0-9]*[^0-9a-zA-Z]+(sty|lut|mar|kwi|maj|cze|lip|sie|wrz|pa\u017a|paz|lis|gru|STY|LUT|MAR|KWI|MAJ|CZE|LIP|SIE|WRZ|PA\u0179|PAZ|LIS|GRU|Sty|Lut|Mar|Kwi|Maj|Cze|Lip|Sie|Wrz|Pa\u017a|Paz|Lis|Gru)[^0-9]{0,9}s*$/,
        ConstantsDate.monthnumberpl
      );
    }
  },

  datedaymonthpt: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonth(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2})[^0-9]+(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez|JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ|Jan|Fev|Mar|Abr|Mai|Jun|Jul|Ago|Set|Out|Nov|Dez)[^0-9]{0,6}[ \t\n\r]*$/
      );
    }
  },

  datedaymonthroman: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonth(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2})[^0-9]*[^XVIxvi]((I?(X|V|I)I{0,3})|(i?(x|v|i)i{0,3}))[ \t\n\r]*$/,
        ConstantsDate.monthnumberroman
      );
    }
  },

  datedaymonthro: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonth(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2})[^0-9]+(ian|feb|mar|apr|mai|iun|iul|aug|sep|oct|noi|nov|dec|IAN|FEB|MAR|APR|MAI|IUN|IUL|AUG|SEP|OCT|NOI|NOV|DEC|Ian|Feb|Mar|Apr|Mai|Iun|Iul|Aug|Sep|Oct|Noi|Nov|Dec)[^0-9]{0,7}[ \t\n\r]*$/
      );
    }
  },

  datedaymonthsk: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonth(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2})[^0-9]+(jan|feb|mar|apr|m\xe1j|maj|j\xfan|jun|j\xfal|jul|aug|sep|okt|nov|dec|JAN|FEB|MAR|APR|M\xc1J|MAJ|J\xdaN|JUN|J\xdaL|JUL|AUG|SEP|OKT|NOV|DEC|Jan|Feb|Mar|Apr|M\xe1j|Maj|J\xfan|Jun|J\xfal|Jul|Aug|Sep|Okt|Nov|Dec)[^0-9]{0,6}[ \t\n\r]*$/
      );
    }
  },

  datedaymonthsl: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonth(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2})[^0-9]+(jan|feb|mar|apr|maj|jun|jul|avg|sep|okt|nov|dec|JAN|FEB|MAR|APR|MAJ|JUN|JUL|AVG|SEP|OKT|NOV|DEC|Jan|Feb|Mar|Apr|Maj|Jun|Jul|Avg|Sep|Okt|Nov|Dec)[^0-9]{0,6}[ \t\n\r]*$/
      );
    }
  },

  datedaymonthyearTR4: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonthyear(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2})[^0-9]+([0-9]{1,2})[^0-9]+([0-9]{4}|[0-9]{1,2})[ \t\n\r]*$/,
        1,
        2,
        3
      );
    }
  },

  datedaymonthyearbg: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonthyear(
        element.innerText,
        /[ \t\n\r]*([0-9]{1,2})[^0-9]+(\u044f\u043d|\u0444\u0435\u0432|\u043c\u0430\u0440|\u0430\u043f\u0440|\u043c\u0430\u0439|\u043c\u0430\u0438|\u044e\u043d\u0438|\u044e\u043b\u0438|\u0430\u0432\u0433|\u0441\u0435\u043f|\u043e\u043a\u0442|\u043d\u043e\u0435|\u0434\u0435\u043a|\u042f\u041d|\u0424\u0415\u0412|\u041c\u0410\u0420|\u0410\u041f\u0420|\u041c\u0410\u0419|\u041c\u0410\u0418|\u042e\u041d\u0418|\u042e\u041b\u0418|\u0410\u0412\u0413|\u0421\u0415\u041f|\u041e\u041a\u0422|\u041d\u041e\u0415|\u0414\u0415\u041a|\u042f\u043d|\u0424\u0435\u0432|\u041c\u0430\u0440|\u0410\u043f\u0440|\u041c\u0430\u0439|\u041c\u0430\u0438|\u042e\u043d\u0438|\u042e\u043b\u0438|\u0410\u0432\u0433|\u0421\u0435\u043f|\u041e\u043a\u0442|\u041d\u043e\u0435|\u0414\u0435\u043a)[A-Za-z]*[^0-9]+([0-9]{1,2}|[0-9]{4})[^0-9]*[ \t\n\r]*$/
      );
    }
  },

  datedaymonthyearcs: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonthyear(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2})[^0-9]+(ledna|\xfanora|unora|b\u0159ezna|brezna|dubna|kv\u011btna|kvetna|\u010dervna|cervna|\u010dervence|cervence|srpna|z\xe1\u0159\xed|zari|\u0159\xedjna|rijna|listopadu|prosince|led|\xfano|uno|b\u0159e|bre|dub|kv\u011b|kve|\u010dvn|cvn|\u010dvc|cvc|srp|z\xe1\u0159|zar|\u0159\xedj|rij|lis|pro|LEDNA|\xdaNORA|UNORA|B\u0158EZNA|BREZNA|DUBNA|KV\u011aTNA|KVETNA|\u010cERVNA|CERVNA|\u010cERVENCE|CERVENCE|SRPNA|Z\xc1\u0158\xcd|ZARI|\u0158\xcdJNA|RIJNA|LISTOPADU|PROSINCE|LED|\xdaNO|UNO|B\u0158E|BRE|DUB|KV\u011a|KVE|\u010cVN|CVN|\u010cVC|CVC|SRP|Z\xc1\u0158|ZAR|\u0158\xcdJ|RIJ|LIS|PRO|Ledna|\xdanora|Unora|B\u0159ezna|Brezna|Dubna|Kv\u011btna|Kvetna|\u010cervna|Cervna|\u010cervence|Cervence|Srpna|Z\xe1\u0159\xed|Zari|\u0158\xedjna|Rijna|Listopadu|Prosince|Led|\xdano|Uno|B\u0159e|Bre|Dub|Kv\u011b|Kve|\u010cvn|Cvn|\u010cvc|Cvc|Srp|Z\xe1\u0159|Zar|\u0158\xedj|Rij|Lis|Pro)[^0-9a-zA-Z]+[^0-9]*([0-9]{1,2}|[0-9]{4})[ \t\n\r]*$/,
        ConstantsDate.monthnumbercs
      );
    }
  },

  datedaymonthyearcy: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonthyear(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2})[^0-9]+(ion|chwe|maw|ebr|mai|meh|gor|aws|med|hyd|tach|rhag|ION|CHWE|MAW|EBR|MAI|MEH|GOR|AWS|MED|HYD|TACH|RHAG|Ion|Chwe|Maw|Ebr|Mai|Meh|Gor|Aws|Med|Hyd|Tach|Rhag)[^0-9]+([0-9]{1,2}|[0-9]{4})[ \t\n\r]*$/,
        ConstantsDate.monthnumbercy
      );
    }
  },

  datedaymonthyearde: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonthyear(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2})[^0-9]+(jan|j\xe4n|jaen|feb|m\xe4r|maer|mar|apr|mai|jun|jul|aug|sep|okt|nov|dez|JAN|J\xc4N|JAEN|FEB|M\xc4R|MAER|MAR|APR|MAI|JUN|JUL|AUG|SEP|OKT|NOV|DEZ|Jan|J\xe4n|Jaen|Feb|M\xe4r|Maer|Mar|Apr|Mai|Jun|Jul|Aug|Sep|Okt|Nov|Dez)[^0-9]+([0-9]{1,2}|[0-9]{4})[ \t\n\r]*$/
      );
    }
  },

  datedaymonthyeardk: function (element) {
    var moTbl = ConstantsDate.monthnumber;
    var m =
      /^[ \t\n\r]*([0-9]{1,2})[^0-9]+(jan|feb|mar|apr|maj|jun|jul|aug|sep|okt|nov|dec)([A-Za-z]*)([.]*)[^0-9]*([0-9]{4}|[0-9]{1,2})[ \t\n\r]*$/i.exec(
        element.innerText
      );
    if (m && ConstantsNumber.lastindex(m) === 5) {
      var yr = ConstantsDate.getYr4(m[5]);
      var day = ConstantsNumber.zeroPadTwoDigits(m[1]);
      var mon3 = m[2].toLowerCase();
      var monEnd = m[3];
      var monPer = m[4];

      if (
        mon3 in moTbl &&
        ((!monEnd && !monPer) || (!monEnd && monPer) || (monEnd && !monPer))
      ) {
        var mo = moTbl[mon3];
        return yr + "-" + ConstantsNumber.zeroPadTwoDigits(mo) + "-" + day;
      }
    }
    return "Format Error: Day Month Year";
  },

  datedaymonthyearel: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonthyear(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2})[^0-9]+(\u03b9\u03b1\u03bd|\u03af\u03b1\u03bd|\u03c6\u03b5\u03b2|\u03bc\u03ac\u03c1|\u03bc\u03b1\u03c1|\u03b1\u03c0\u03c1|\u03ac\u03c0\u03c1|\u03b1\u03c1\u03af\u03bb|\u03ac\u03c1\u03af\u03bb|\u03b1\u03c1\u03b9\u03bb|\u03ac\u03c1\u03b9\u03bb|\u03bc\u03b1\u0390|\u03bc\u03b1\u03b9|\u03bc\u03ac\u03b9|\u03bc\u03b1\u03ca|\u03bc\u03ac\u03ca|\u03b9\u03bf\u03cd\u03bd|\u03af\u03bf\u03cd\u03bd|\u03af\u03bf\u03c5\u03bd|\u03b9\u03bf\u03c5\u03bd|\u03b9\u03bf\u03cd\u03bb|\u03af\u03bf\u03cd\u03bb|\u03af\u03bf\u03c5\u03bb|\u03af\u03bf\u03c5\u03bb|\u03b9\u03bf\u03c5\u03bb|\u03b1\u03cd\u03b3|\u03b1\u03c5\u03b3|\u03c3\u03b5\u03c0|\u03bf\u03ba\u03c4|\u03cc\u03ba\u03c4|\u03bd\u03bf\u03ad|\u03bd\u03bf\u03b5|\u03b4\u03b5\u03ba|\u0399\u0391\u039d|\u038a\u0391\u039d|I\u0391\u039d|\u03a6\u0395\u0392|\u039c\u0386\u03a1|\u039c\u0391\u03a1|\u0391\u03a0\u03a1|\u0386\u03a0\u03a1|A\u03a0\u03a1|A\u03a1\u0399\u039b|\u0386\u03a1\u0399\u039b|\u0391\u03a1\u0399\u039b|\u039c\u0391\u03aa\u0301|\u039c\u0391\u0399|\u039c\u0386\u0399|\u039c\u0391\u03aa|\u039c\u0386\u03aa|\u0399\u039f\u038e\u039d|\u038a\u039f\u038e\u039d|\u038a\u039f\u03a5\u039d|I\u039f\u038e\u039d|\u0399\u039f\u03a5\u039d|I\u039f\u03a5\u039d|\u0399\u039f\u038e\u039b|\u038a\u039f\u038e\u039b|\u038a\u039f\u03a5\u039b|I\u039f\u038e\u039b|\u0399\u039f\u03a5\u039b|I\u039f\u03a5\u039b|\u0391\u038e\u0393|\u0391\u03a5\u0393|\u03a3\u0395\u03a0|\u039f\u039a\u03a4|\u038c\u039a\u03a4|O\u039a\u03a4|\u039d\u039f\u0388|\u039d\u039f\u0395|\u0394\u0395\u039a|\u0399\u03b1\u03bd|\u038a\u03b1\u03bd|I\u03b1\u03bd|\u03a6\u03b5\u03b2|\u039c\u03ac\u03c1|\u039c\u03b1\u03c1|\u0391\u03c0\u03c1|\u0386\u03c0\u03c1|A\u03c0\u03c1|\u0391\u03c1\u03af\u03bb|\u0386\u03c1\u03af\u03bb|A\u03c1\u03af\u03bb|A\u03c1\u03b9\u03bb|\u0386\u03c1\u03b9\u03bb|\u0391\u03c1\u03b9\u03bb|\u039c\u03b1\u0390|\u039c\u03b1\u03b9|\u039c\u03ac\u03b9|\u039c\u03b1\u03ca|\u039c\u03ac\u03ca|\u0399\u03bf\u03cd\u03bd|\u038a\u03bf\u03cd\u03bd|\u038a\u03bf\u03c5\u03bd|I\u03bf\u03cd\u03bd|\u0399\u03bf\u03c5\u03bd|I\u03bf\u03c5\u03bd|\u0399\u03bf\u03cd\u03bb|\u038a\u03bf\u03cd\u03bb|\u038a\u03bf\u03c5\u03bb|I\u03bf\u03cd\u03bb|\u0399\u03bf\u03c5\u03bb|I\u03bf\u03c5\u03bb|\u0391\u03cd\u03b3|\u0391\u03c5\u03b3|\u03a3\u03b5\u03c0|\u039f\u03ba\u03c4|\u038c\u03ba\u03c4|O\u03ba\u03c4|\u039d\u03bf\u03ad|\u039d\u03bf\u03b5|\u0394\u03b5\u03ba)[^0-9]+([0-9]{1,2}|[0-9]{4})[ \t\n\r]*$/
      );
    }
  },

  datedaymonthyearen: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonthyear(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2})[^0-9]+(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)[^0-9]+([0-9]{4}|[0-9]{1,2})[ \t\n\r]*$/
      );
    }
  },

  datemonthdayyearen: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonthyear(
        element.innerText,
        /^[ \t\n\r]*(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)[^0-9]+([0-9]+)[^0-9]+([0-9]{4}|[0-9]{1,2})[ \t\n\r]*$/,
        null,
        2,
        1,
        3
      );
    }
  },

  datedaymonthyeares: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonthyear(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2})[^0-9]+(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic|ENE|FEB|MAR|ABR|MAY|JUN|JUL|AGO|SEP|OCT|NOV|DIC|Ene|Feb|Mar|Abr|May|Jun|Jul|Ago|Sep|Oct|Nov|Dic)[^0-9]+([0-9]{1,2}|[0-9]{4})[ \t\n\r]*$/
      );
    }
  },

  datedaymonthyearet: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonthyear(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2})[^0-9]+(jaan|veebr|m\xe4rts|marts|apr|mai|juuni|juuli|aug|sept|okt|nov|dets|JAAN|VEEBR|M\xc4RTS|MARTS|APR|MAI|JUUNI|JUULI|AUG|SEPT|OKT|NOV|DETS|Jaan|Veebr|M\xe4rts|Marts|Apr|Mai|Juuni|Juuli|Aug|Sept|Okt|Nov|Dets)[^0-9]+([0-9]{1,2}|[0-9]{4})[ \t\n\r]*$/
      );
    }
  },

  datedaymonthyearfi: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonthyear(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2})[^0-9]*[^0-9a-zA-Z]+(tam|hel|maa|huh|tou|kes|hei|elo|syy|lok|mar|jou|TAM|HEL|MAA|HUH|TOU|KES|HEI|ELO|SYY|LOK|MAR|JOU|Tam|Hel|Maa|Huh|Tou|Kes|Hei|Elo|Syy|Lok|Mar|Jou)[^0-9]+([0-9]{1,2}|[0-9]{4})[ \t\n\r]*$/,
        ConstantsDate.monthnumberfi
      );
    }
  },

  datedaymonthyearfr: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonthyear(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2})[^0-9]+(janv|f\xe9vr|fevr|mars|avr|mai|juin|juil|ao\xfbt|aout|sept|oct|nov|d\xe9c|dec|JANV|F\xc9VR|FEVR|MARS|AVR|MAI|JUIN|JUIL|AO\xdbT|AOUT|SEPT|OCT|NOV|D\xc9C|DEC|Janv|F\xe9vr|Fevr|Mars|Avr|Mai|Juin|Juil|Ao\xfbt|Aout|Sept|Oct|Nov|D\xe9c|Dec)[^0-9]+([0-9]{1,2}|[0-9]{4})[ \t\n\r]*$/
      );
    }
  },

  datedaymonthyearhr: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonthyear(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2})[^0-9]+(sij|velj|o\u017eu|ozu|tra|svi|lip|srp|kol|ruj|lis|stu|pro|SIJ|VELJ|O\u017dU|OZU|TRA|SVI|LIP|SRP|KOL|RUJ|LIS|STU|PRO|Sij|Velj|O\u017eu|Ozu|Tra|Svi|Lip|Srp|Kol|Ruj|Lis|Stu|Pro)[^0-9]+([0-9]{1,2}|[0-9]{4})[ \t\n\r]*$/,
        ConstantsDate.monthnumberhr
      );
    }
  },

  dateyearmonthdayhu: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonthyear(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2}|[0-9]{4})[^0-9]+(jan|feb|m\xe1rc|marc|\xe1pr|apr|m\xe1j|maj|j\xfan|jun|j\xfal|jul|aug|szept|okt|nov|dec|JAN|FEB|M\xc1RC|MARC|\xc1PR|APR|M\xc1J|MAJ|J\xdaN|JUN|J\xdaL|JUL|AUG|SZEPT|OKT|NOV|DEC|Jan|Feb|M\xe1rc|Marc|\xc1pr|Apr|M\xe1j|Maj|J\xfan|Jun|J\xfal|Jul|Aug|Szept|Okt|Nov|Dec)[^0-9]+([0-9]{1,2})[ \t\n\r]*$/,
        null,
        3,
        2,
        1
      );
    }
  },

  datedaymonthyearit: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonthyear(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2})[^0-9]+(gen|feb|mar|apr|mag|giu|lug|ago|set|ott|nov|dic|GEN|FEB|MAR|APR|MAG|GIU|LUG|AGO|SET|OTT|NOV|DIC|Gen|Feb|Mar|Apr|Mag|Giu|Lug|Ago|Set|Ott|Nov|Dic)[^0-9]+([0-9]{1,2}|[0-9]{4})[ \t\n\r]*$/
      );
    }
  },

  dateyeardaymonthlv: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonthyear(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2}|[0-9]{4})[^0-9]+([0-9]{1,2})[^0-9]+(janv|febr|marts|apr|maijs|j\u016bn|jun|j\u016bl|jul|aug|sept|okt|nov|dec|JANV|FEBR|MARTS|APR|MAIJS|J\u016aN|JUN|J\u016aL|JUL|AUG|SEPT|OKT|NOV|DEC|Janv|Febr|Marts|Apr|Maijs|J\u016bn|Jun|J\u016bl|Jul|Aug|Sept|Okt|Nov|Dec)[^0-9]*[ \t\n\r]*$/,
        null,
        2,
        3,
        1
      );
    }
  },

  dateyearmonthdaylt: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonthyear(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2}|[0-9]{4})[^0-9]*[^0-9a-zA-Z]+(sau|vas|kov|bal|geg|bir|lie|rugp|rgp|rugs|rgs|spa|spl|lap|gru|grd|SAU|VAS|KOV|BAL|GEG|BIR|LIE|RUGP|RGP|RUGS|RGS|SPA|SPL|LAP|GRU|GRD|Sau|Vas|Kov|Bal|Geg|Bir|Lie|Rugp|Rgp|Rugs|Rgs|Spa|Spl|Lap|Gru|Grd)[^0-9]+([0-9]{1,2})[^0-9]*[ \t\n\r]*$/,
        ConstantsDate.monthnumberlt,
        3,
        2,
        1
      );
    }
  },

  datedaymonthyearnl: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonthyear(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2})[^0-9]+(jan|feb|maa|mrt|apr|mei|jun|jul|aug|sep|okt|nov|dec|JAN|FEB|MAA|MRT|APR|MEI|JUN|JUL|AUG|SEP|OKT|NOV|DEC|Jan|Feb|Maa|Mrt|Apr|Mei|Jun|Jul|Aug|Sep|Okt|Nov|Dec)[^0-9]+([0-9]{1,2}|[0-9]{4})[ \t\n\r]*$/
      );
    }
  },

  datedaymonthyearno: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonthyear(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2})[^0-9]+(jan|feb|mar|apr|mai|jun|jul|aug|sep|okt|nov|des|JAN|FEB|MAR|APR|MAI|JUN|JUL|AUG|SEP|OKT|NOV|DES|Jan|Feb|Mar|Apr|Mai|Jun|Jul|Aug|Sep|Okt|Nov|Des)[^0-9]+([0-9]{1,2}|[0-9]{4})[ \t\n\r]*$/
      );
    }
  },

  datedaymonthyearpl: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonthyear(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2})[^0-9]*[^0-9a-zA-Z]+(sty|lut|mar|kwi|maj|cze|lip|sie|wrz|pa\u017a|paz|lis|gru|STY|LUT|MAR|KWI|MAJ|CZE|LIP|SIE|WRZ|PA\u0179|PAZ|LIS|GRU|Sty|Lut|Mar|Kwi|Maj|Cze|Lip|Sie|Wrz|Pa\u017a|Paz|Lis|Gru)[^0-9]+([0-9]{1,2}|[0-9]{4})[^0-9]*[ \t\n\r]*$/,
        ConstantsDate.monthnumberpl
      );
    }
  },

  datedaymonthyearpt: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonthyear(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2})[^0-9]+(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez|JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ|Jan|Fev|Mar|Abr|Mai|Jun|Jul|Ago|Set|Out|Nov|Dez)[^0-9]+([0-9]{1,2}|[0-9]{4})[ \t\n\r]*$/
      );
    }
  },

  datedaymonthyearroman: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonthyear(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2})[^0-9]*[^XVIxvi]((I?(X|V|I)I{0,3})|(i?(x|v|i)i{0,3}))[^XVIxvi][^0-9]*([0-9]{1,2}|[0-9]{4})[ \t\n\r]*$/,
        ConstantsDate.monthnumberroman,
        1,
        2,
        7,
        7
      );
    }
  },

  datedaymonthyearro: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonthyear(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2})[^0-9]+(ian|feb|mar|apr|mai|iun|iul|aug|sep|oct|noi|nov|dec|IAN|FEB|MAR|APR|MAI|IUN|IUL|AUG|SEP|OCT|NOI|NOV|DEC|Ian|Feb|Mar|Apr|Mai|Iun|Iul|Aug|Sep|Oct|Noi|Nov|Dec)[^0-9]+([0-9]{1,2}|[0-9]{4})[ \t\n\r]*$/
      );
    }
  },

  datedaymonthyearsk: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonthyear(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2})[^0-9]+(jan|feb|mar|apr|m\xe1j|maj|j\xfan|jun|j\xfal|jul|aug|sep|okt|nov|dec|JAN|FEB|MAR|APR|M\xc1J|MAJ|J\xdaN|JUN|J\xdaL|JUL|AUG|SEP|OKT|NOV|DEC|Jan|Feb|Mar|Apr|M\xe1j|Maj|J\xfan|Jun|J\xfal|Jul|Aug|Sep|Okt|Nov|Dec)[^0-9]+([0-9]{1,2}|[0-9]{4})[ \t\n\r]*$/
      );
    }
  },

  datedaymonthyearsl: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datedaymonthyear(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2})[^0-9]+(jan|feb|mar|apr|maj|jun|jul|avg|sep|okt|nov|dec|JAN|FEB|MAR|APR|MAJ|JUN|JUL|AVG|SEP|OKT|NOV|DEC|Jan|Feb|Mar|Apr|Maj|Jun|Jul|Avg|Sep|Okt|Nov|Dec)[^0-9]+([0-9]{1,2}|[0-9]{4})[ \t\n\r]*$/
      );
    }
  },

  datemonthyearbg: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datemonthyear(
        element.innerText,
        /^[ \t\n\r]*(\u044f\u043d|\u0444\u0435\u0432|\u043c\u0430\u0440|\u0430\u043f\u0440|\u043c\u0430\u0439|\u043c\u0430\u0438|\u044e\u043d\u0438|\u044e\u043b\u0438|\u0430\u0432\u0433|\u0441\u0435\u043f|\u043e\u043a\u0442|\u043d\u043e\u0435|\u0434\u0435\u043a|\u042f\u041d|\u0424\u0415\u0412|\u041c\u0410\u0420|\u0410\u041f\u0420|\u041c\u0410\u0419|\u041c\u0410\u0418|\u042e\u041d\u0418|\u042e\u041b\u0418|\u0410\u0412\u0413|\u0421\u0415\u041f|\u041e\u041a\u0422|\u041d\u041e\u0415|\u0414\u0415\u041a|\u042f\u043d|\u0424\u0435\u0432|\u041c\u0430\u0440|\u0410\u043f\u0440|\u041c\u0430\u0439|\u041c\u0430\u0438|\u042e\u043d\u0438|\u042e\u043b\u0438|\u0410\u0432\u0433|\u0421\u0435\u043f|\u041e\u043a\u0442|\u041d\u043e\u0435|\u0414\u0435\u043a)[^0-9]+([0-9]{1,2}|[0-9]{4})[^0-9]*[ \t\n\r]*$/
      );
    }
  },

  datemonthyearcs: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datemonthyear(
        element.innerText,
        /^[ \t\n\r]*(leden|ledna|lednu|\xfanor|unor|\xfanora|unora|\xfanoru|unoru|b\u0159ezen|brezen|b\u0159ezna|brezna|b\u0159eznu|breznu|duben|dubna|dubnu|kv\u011bten|kveten|kv\u011btna|kvetna|kv\u011btnu|kvetnu|\u010derven|cerven|\u010dervna|cervna|\u010dervnu|cervnu|\u010dervenec|cervenec|\u010dervence|cervence|\u010dervenci|cervenci|srpen|srpna|srpnu|z\xe1\u0159\xed|zari|\u0159\xedjen|rijen|\u0159\xedjna|rijna|\u0159\xedjnu|rijnu|listopad|listopadu|prosinec|prosince|prosinci|led|\xfano|uno|b\u0159e|bre|dub|kv\u011b|kve|\u010dvn|cvn|\u010dvc|cvc|srp|z\xe1\u0159|zar|\u0159\xedj|rij|lis|pro|LEDEN|LEDNA|LEDNU|\xdaNOR|UNOR|\xdaNORA|UNORA|\xdaNORU|UNORU|B\u0158EZEN|BREZEN|B\u0158EZNA|BREZNA|B\u0158EZNU|BREZNU|DUBEN|DUBNA|DUBNU|KV\u011aTEN|KVETEN|KV\u011aTNA|KVETNA|KV\u011aTNU|KVETNU|\u010cERVEN|CERVEN|\u010cERVNA|CERVNA|\u010cERVNU|CERVNU|\u010cERVENEC|CERVENEC|\u010cERVENCE|CERVENCE|\u010cERVENCI|CERVENCI|SRPEN|SRPNA|SRPNU|Z\xc1\u0158\xcd|ZARI|\u0158\xcdJEN|RIJEN|\u0158\xcdJNA|RIJNA|\u0158\xcdJNU|RIJNU|LISTOPAD|LISTOPADU|PROSINEC|PROSINCE|PROSINCI|LED|\xdaNO|UNO|B\u0158E|BRE|DUB|KV\u011a|KVE|\u010cVN|CVN|\u010cVC|CVC|SRP|Z\xc1\u0158|ZAR|\u0158\xcdJ|RIJ|LIS|PRO|Leden|Ledna|Lednu|\xdanor|Unor|\xdanora|Unora|\xdanoru|Unoru|B\u0159ezen|Brezen|B\u0159ezna|Brezna|B\u0159eznu|Breznu|Duben|Dubna|Dubnu|Kv\u011bten|Kveten|Kv\u011btna|Kvetna|Kv\u011btnu|Kvetnu|\u010cerven|Cerven|\u010cervna|Cervna|\u010cervnu|Cervnu|\u010cervenec|Cervenec|\u010cervence|Cervence|\u010cervenci|Cervenci|Srpen|Srpna|Srpnu|Z\xe1\u0159\xed|Zari|\u0158\xedjen|Rijen|\u0158\xedjna|Rijna|\u0158\xedjnu|Rijnu|Listopad|Listopadu|Prosinec|Prosince|Prosinci|Led|\xdano|Uno|B\u0159e|Bre|Dub|Kv\u011b|Kve|\u010cvn|Cvn|\u010cvc|Cvc|Srp|Z\xe1\u0159|Zar|\u0158\xedj|Rij|Lis|Pro)[^0-9a-zA-Z]+[^0-9]*([0-9]{1,2}|[0-9]{4})[ \t\n\r]*$/,
        ConstantsDate.monthnumbercs
      );
    }
  },

  datemonthyearcy: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datemonthyear(
        element.innerText,
        /^[ \t\n\r]*(ion|chwe|maw|faw|ebr|mai|fai|meh|feh|gor|ngor|aws|med|fed|hyd|tach|dach|nhach|thach|rhag|rag|ION|CHWE|MAW|FAW|EBR|MAI|FAI|MEH|FEH|GOR|NGOR|AWS|MED|FED|HYD|TACH|DACH|NHACH|THACH|RHAG|RAG|Ion|Chwe|Maw|Faw|Ebr|Mai|Fai|Meh|Feh|Gor|Ngor|Aws|Med|Fedi|Hyd|Tach|Dach|Nhach|Thach|Rhag|Rag)[^0-9]+([0-9]{1,2}|[0-9]{4})[ \t\n\r]*$/,
        ConstantsDate.monthnumbercy
      );
    }
  },

  datemonthyearde: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datemonthyear(
        element.innerText,
        /^[ \t\n\r]*(jan|j\xe4n|jaen|feb|m\xe4r|maer|mar|apr|mai|jun|jul|aug|sep|okt|nov|dez|JAN|J\xc4N|JAEN|FEB|M\xc4R|MAER|MAR|APR|MAI|JUN|JUL|AUG|SEP|OKT|NOV|DEZ|Jan|J\xe4n|Jaen|Feb|M\xe4r|Maer|Mar|Apr|Mai|Jun|Jul|Aug|Sep|Okt|Nov|Dez)[^0-9]+([0-9]{1,2}|[0-9]{4})[ \t\n\r]*$/
      );
    }
  },

  datemonthyeardk: function (element) {
    var moTbl = ConstantsDate.monthnumber;
    var m =
      /^[ \t\n\r]*(jan|feb|mar|apr|maj|jun|jul|aug|sep|okt|nov|dec)([A-Za-z]*)([.]*)[^0-9]*([0-9]{4}|[0-9]{1,2})[ \t\n\r]*$/i.exec(
        element.innerText
      );
    if (m && ConstantsNumber.lastindex(m) === 4) {
      var yr = ConstantsDate.getYr4(m[4]);
      var mon3 = m[1].toLowerCase();
      var monEnd = m[2];
      var monPer = m[3];
      if (
        mon3 in moTbl &&
        ((!monEnd && !monPer) || (!monEnd && monPer) || (monEnd && !monPer))
      ) {
        return yr + "-" + ConstantsNumber.zeroPadTwoDigits(moTbl[mon3]);
      }
    }
    return "Format Error: Month Year";
  },

  datemonthyearel: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datemonthyear(
        element.innerText,
        /^[ \t\n\r]*(\u03b9\u03b1\u03bd|\u03af\u03b1\u03bd|\u03c6\u03b5\u03b2|\u03bc\u03ac\u03c1|\u03bc\u03b1\u03c1|\u03b1\u03c0\u03c1|\u03ac\u03c0\u03c1|\u03b1\u03c1\u03af\u03bb|\u03ac\u03c1\u03af\u03bb|\u03b1\u03c1\u03b9\u03bb|\u03ac\u03c1\u03b9\u03bb|\u03bc\u03b1\u0390|\u03bc\u03b1\u03b9|\u03bc\u03ac\u03b9|\u03bc\u03b1\u03ca|\u03bc\u03ac\u03ca|\u03b9\u03bf\u03cd\u03bd|\u03af\u03bf\u03cd\u03bd|\u03af\u03bf\u03c5\u03bd|\u03b9\u03bf\u03c5\u03bd|\u03b9\u03bf\u03cd\u03bb|\u03af\u03bf\u03cd\u03bb|\u03af\u03bf\u03c5\u03bb|\u03af\u03bf\u03c5\u03bb|\u03b9\u03bf\u03c5\u03bb|\u03b1\u03cd\u03b3|\u03b1\u03c5\u03b3|\u03c3\u03b5\u03c0|\u03bf\u03ba\u03c4|\u03cc\u03ba\u03c4|\u03bd\u03bf\u03ad|\u03bd\u03bf\u03b5|\u03b4\u03b5\u03ba|\u0399\u0391\u039d|\u038a\u0391\u039d|I\u0391\u039d|\u03a6\u0395\u0392|\u039c\u0386\u03a1|\u039c\u0391\u03a1|\u0391\u03a0\u03a1|\u0386\u03a0\u03a1|A\u03a0\u03a1|A\u03a1\u0399\u039b|\u0386\u03a1\u0399\u039b|\u0391\u03a1\u0399\u039b|\u039c\u0391\u03aa\u0301|\u039c\u0391\u0399|\u039c\u0386\u0399|\u039c\u0391\u03aa|\u039c\u0386\u03aa|\u0399\u039f\u038e\u039d|\u038a\u039f\u038e\u039d|\u038a\u039f\u03a5\u039d|I\u039f\u038e\u039d|\u0399\u039f\u03a5\u039d|I\u039f\u03a5\u039d|\u0399\u039f\u038e\u039b|\u038a\u039f\u038e\u039b|\u038a\u039f\u03a5\u039b|I\u039f\u038e\u039b|\u0399\u039f\u03a5\u039b|I\u039f\u03a5\u039b|\u0391\u038e\u0393|\u0391\u03a5\u0393|\u03a3\u0395\u03a0|\u039f\u039a\u03a4|\u038c\u039a\u03a4|O\u039a\u03a4|\u039d\u039f\u0388|\u039d\u039f\u0395|\u0394\u0395\u039a|\u0399\u03b1\u03bd|\u038a\u03b1\u03bd|I\u03b1\u03bd|\u03a6\u03b5\u03b2|\u039c\u03ac\u03c1|\u039c\u03b1\u03c1|\u0391\u03c0\u03c1|\u0386\u03c0\u03c1|A\u03c0\u03c1|\u0391\u03c1\u03af\u03bb|\u0386\u03c1\u03af\u03bb|A\u03c1\u03af\u03bb|A\u03c1\u03b9\u03bb|\u0386\u03c1\u03b9\u03bb|\u0391\u03c1\u03b9\u03bb|\u039c\u03b1\u0390|\u039c\u03b1\u03b9|\u039c\u03ac\u03b9|\u039c\u03b1\u03ca|\u039c\u03ac\u03ca|\u0399\u03bf\u03cd\u03bd|\u038a\u03bf\u03cd\u03bd|\u038a\u03bf\u03c5\u03bd|I\u03bf\u03cd\u03bd|\u0399\u03bf\u03c5\u03bd|I\u03bf\u03c5\u03bd|\u0399\u03bf\u03cd\u03bb|\u038a\u03bf\u03cd\u03bb|\u038a\u03bf\u03c5\u03bb|I\u03bf\u03cd\u03bb|\u0399\u03bf\u03c5\u03bb|I\u03bf\u03c5\u03bb|\u0391\u03cd\u03b3|\u0391\u03c5\u03b3|\u03a3\u03b5\u03c0|\u039f\u03ba\u03c4|\u038c\u03ba\u03c4|O\u03ba\u03c4|\u039d\u03bf\u03ad|\u039d\u03bf\u03b5|\u0394\u03b5\u03ba)[^0-9]+([0-9]{1,2}|[0-9]{4})[ \t\n\r]*$/
      );
    }
  },

  datemonthyearen: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datemonthyear(
        element.innerText,
        /^[ \t\n\r]*(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)[^0-9]+([0-9]{1,2}|[0-9]{4})[ \t\n\r]*$/,
        1,
        2
      );
    }
  },

  datemonthyeares: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datemonthyear(
        element.innerText,
        /^[ \t\n\r]*(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic|ENE|FEB|MAR|ABR|MAY|JUN|JUL|AGO|SEP|OCT|NOV|DIC|Ene|Feb|Mar|Abr|May|Jun|Jul|Ago|Sep|Oct|Nov|Dic)[^0-9]+([0-9]{1,2}|[0-9]{4})[ \t\n\r]*$/
      );
    }
  },

  dateyearmonthen: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datemonthyear(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2}|[0-9]{4})[^0-9]+(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)[ \t\n\r]*$/,
        2,
        1
      );
    }
  },

  datemonthyearet: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datemonthyear(
        element.innerText,
        /^[ \t\n\r]*(jaan|veebr|m\xe4rts|marts|apr|mai|juuni|juuli|aug|sept|okt|nov|dets|JAAN|VEEBR|M\xc4RTS|MARTS|APR|MAI|JUUNI|JUULI|AUG|SEPT|OKT|NOV|DETS|Jaan|Veebr|M\xe4rts|Marts|Apr|Mai|Juuni|Juuli|Aug|Sept|Okt|Nov|Dets)[^0-9]+([0-9]{1,2}|[0-9]{4})[ \t\n\r]*$/
      );
    }
  },

  datemonthyearfi: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datemonthyear(
        element.innerText,
        /^[ \t\n\r]*(tam|hel|maa|huh|tou|kes|hei|elo|syy|lok|mar|jou|TAM|HEL|MAA|HUH|TOU|KES|HEI|ELO|SYY|LOK|MAR|JOU|Tam|Hel|Maa|Huh|Tou|Kes|Hei|Elo|Syy|Lok|Mar|Jou)[^0-9]+([0-9]{1,2}|[0-9]{4})[ \t\n\r]*$/,
        ConstantsDate.monthnumberfi
      );
    }
  },

  datemonthyearfr: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datemonthyear(
        element.innerText,
        /^[ \t\n\r]*(janv|f\xe9vr|fevr|mars|avr|mai|juin|juil|ao\xfbt|aout|sept|oct|nov|d\xe9c|dec|JANV|F\xc9VR|FEVR|MARS|AVR|MAI|JUIN|JUIL|AO\xdbT|AOUT|SEPT|OCT|NOV|D\xc9C|DEC|Janv|F\xe9vr|Fevr|Mars|Avr|Mai|Juin|Juil|Ao\xfbt|Aout|Sept|Oct|Nov|D\xe9c|Dec)[^0-9]+([0-9]{1,2}|[0-9]{4})[ \t\n\r]*$/
      );
    }
  },

  datemonthyearhr: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datemonthyear(
        element.innerText,
        /^[ \t\n\r]*(sij|velj|o\u017eu|ozu|tra|svi|lip|srp|kol|ruj|lis|stu|pro|SIJ|VELJ|O\u017dU|OZU|TRA|SVI|LIP|SRP|KOL|RUJ|LIS|STU|PRO|Sij|Velj|O\u017eu|Ozu|Tra|Svi|Lip|Srp|Kol|Ruj|Lis|Stu|Pro)[^0-9]+([0-9]{1,2}|[0-9]{4})[ \t\n\r]*$/,
        ConstantsDate.monthnumberhr
      );
    }
  },

  datemonthyearit: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datemonthyear(
        element.innerText,
        /^[ \t\n\r]*(gen|feb|mar|apr|mag|giu|lug|ago|set|ott|nov|dic|GEN|FEB|MAR|APR|MAG|GIU|LUG|AGO|SET|OTT|NOV|DIC|Gen|Feb|Mar|Apr|Mag|Giu|Lug|Ago|Set|Ott|Nov|Dic)[^0-9]+([0-9]{1,2}|[0-9]{4})[ \t\n\r]*$/
      );
    }
  },

  datemonthyearnl: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datemonthyear(
        element.innerText,
        /^[ \t\n\r]*(jan|feb|maa|mrt|apr|mei|jun|jul|aug|sep|okt|nov|dec|JAN|FEB|MAA|MRT|APR|MEI|JUN|JUL|AUG|SEP|OKT|NOV|DEC|Jan|Feb|Maa|Mrt|Apr|Mei|Jun|Jul|Aug|Sep|Okt|Nov|Dec)[^0-9]+([0-9]{1,2}|[0-9]{4})[ \t\n\r]*$/
      );
    }
  },

  datemonthyearno: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datemonthyear(
        element.innerText,
        /^[ \t\n\r]*(jan|feb|mar|apr|mai|jun|jul|aug|sep|okt|nov|des|JAN|FEB|MAR|APR|MAI|JUN|JUL|AUG|SEP|OKT|NOV|DES|Jan|Feb|Mar|Apr|Mai|Jun|Jul|Aug|Sep|Okt|Nov|Des)[^0-9]+([0-9]{1,2}|[0-9]{4})[ \t\n\r]*$/
      );
    }
  },

  datemonthyearpl: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datemonthyear(
        element.innerText,
        /^[ \t\n\r]*(sty|lut|mar|kwi|maj|cze|lip|sie|wrz|pa\u017a|paz|lis|gru|STY|LUT|MAR|KWI|MAJ|CZE|LIP|SIE|WRZ|PA\u0179|PAZ|LIS|GRU|Sty|Lut|Mar|Kwi|Maj|Cze|Lip|Sie|Wrz|Pa\u017a|Paz|Lis|Gru)[^0-9]+([0-9]{1,2}|[0-9]{4})[^0-9]*[ \t\n\r]*$/,
        ConstantsDate.monthnumberpl
      );
    }
  },

  datemonthyearpt: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datemonthyear(
        element.innerText,
        /^[ \t\n\r]*(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez|JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ|Jan|Fev|Mar|Abr|Mai|Jun|Jul|Ago|Set|Out|Nov|Dez)[^0-9]+([0-9]{1,2}|[0-9]{4})[ \t\n\r]*$/
      );
    }
  },

  datemonthyearroman: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datemonthyear(
        element.innerText,
        monthyearRomanPattern,
        ConstantsDate.monthnumberroman,
        1,
        6,
        6
      );
    }
  },

  datemonthyearro: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datemonthyear(
        element.innerText,
        /^[ \t\n\r]*(ian|feb|mar|apr|mai|iun|iul|aug|sep|oct|noi|nov|dec|IAN|FEB|MAR|APR|MAI|IUN|IUL|AUG|SEP|OCT|NOI|NOV|DEC|Ian|Feb|Mar|Apr|Mai|Iun|Iul|Aug|Sep|Oct|Noi|Nov|Dec)[^0-9]+([0-9]{1,2}|[0-9]{4})[ \t\n\r]*$/
      );
    }
  },

  datemonthyearsk: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datemonthyear(
        element.innerText,
        /^[ \t\n\r]*(jan|feb|mar|apr|m\xe1j|maj|j\xfan|jun|j\xfal|jul|aug|sep|okt|nov|dec|JAN|FEB|MAR|APR|M\xc1J|MAJ|J\xdaN|JUN|J\xdaL|JUL|AUG|SEP|OKT|NOV|DEC|Jan|Feb|Mar|Apr|M\xe1j|Maj|J\xfan|Jun|J\xfal|Jul|Aug|Sep|Okt|Nov|Dec)[^0-9]+([0-9]{1,2}|[0-9]{4})[ \t\n\r]*$/
      );
    }
  },

  datemonthyearsl: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datemonthyear(
        element.innerText,
        /^[ \t\n\r]*(jan|feb|mar|apr|maj|jun|jul|avg|sep|okt|nov|dec|JAN|FEB|MAR|APR|MAJ|JUN|JUL|AVG|SEP|OKT|NOV|DEC|Jan|Feb|Mar|Apr|Maj|Jun|Jul|Avg|Sep|Okt|Nov|Dec)[^0-9]+([0-9]{1,2}|[0-9]{4})[ \t\n\r]*$/
      );
    }
  },

  dateyearmonthhu: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datemonthyear(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2}|[0-9]{4})[^0-9]+(jan|feb|m\xe1rc|marc|\xe1pr|apr|m\xe1j|maj|j\xfan|jun|j\xfal|jul|aug|szept|okt|nov|dec|JAN|FEB|M\xc1RC|MARC|\xc1PR|APR|M\xc1J|MAJ|J\xdaN|JUN|J\xdaL|JUL|AUG|SZEPT|OKT|NOV|DEC|Jan|Feb|M\xe1rc|Marc|\xc1pr|Apr|M\xe1j|Maj|J\xfan|Jun|J\xfal|Jul|Aug|Szept|Okt|Nov|Dec)[^0-9]{0,7}[ \t\n\r]*$/,
        null,
        2,
        1
      );
    }
  },

  dateyearmonthlt: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datemonthyear(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2}|[0-9]{4})[^0-9]*[^0-9a-zA-Z]+(sau|vas|kov|bal|geg|bir|lie|rugp|rgp|rugs|rgs|spa|spl|lap|gru|grd|SAU|VAS|KOV|BAL|GEG|BIR|LIE|RUGP|RGP|RUGS|RGS|SPA|SPL|LAP|GRU|GRD|Sau|Vas|Kov|Bal|Geg|Bir|Lie|Rugp|Rgp|Rugs|Rgs|Spa|Spl|Lap|Gru|Grd)[^0-9]*[ \t\n\r]*$/,
        ConstantsDate.monthnumberlt,
        2,
        1
      );
    }
  },

  dateyearmonthlv: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      return FiltersDate.datemonthyear(
        element.innerText,
        /^[ \t\n\r]*([0-9]{1,2}|[0-9]{4})[^0-9]+(janv|febr|marts|apr|maijs|j\u016bn|jun|j\u016bl|jul|aug|sept|okt|nov|dec|JANV|FEBR|MARTS|APR|MAIJS|J\u016aN|JUN|J\u016aL|JUL|AUG|SEPT|OKT|NOV|DEC|Janv|Febr|Marts|Apr|Maijs|J\u016bn|Jun|J\u016bl|Jul|Aug|Sept|Okt|Nov|Dec)[^0-9]{0,7}[ \t\n\r]*$/,
        null,
        2,
        1
      );
    }
  },

  printDurationType: function (y, m, d, h, negative) {
    // preprocess each value so we don't print P0Y0M0D
    // in this case, we should print P0Y, and leave out the months and days.
    var sign = "";
    if (negative) {
      sign = "-";
    }
    var empty = true;
    empty = empty && (y === null || y === 0);
    empty = empty && (m === null || m === 0);
    empty = empty && (d === null || d === 0);
    empty = empty && (h === null || h === 0);
    // zero is a special case.
    // don't need to print -P0Y, just print P0Y
    if (empty) {
      sign = "";
      var hitFirstZeroYet = false;
      if (y !== null && y === 0) {
        hitFirstZeroYet = true;
      }
      if (m !== null && m === 0) {
        if (hitFirstZeroYet) {
          m = null;
        } else {
          hitFirstZeroYet = true;
        }
      }
      if (d !== null && d === 0) {
        if (hitFirstZeroYet) {
          d = null;
        } else {
          hitFirstZeroYet = true;
        }
      }
      if (h !== null && h === 0 && hitFirstZeroYet) {
        if (hitFirstZeroYet) {
          h = null;
        } else {
          hitFirstZeroYet = true;
        }
      }
    }
    var output = sign + "P";
    if (y !== null) {
      output += y.toString() + "Y";
    }
    if (m !== null) {
      output += m.toString() + "M";
    }
    if (d !== null) {
      output += d.toString() + "D";
    }
    if (h !== null) {
      output += "T" + h.toString() + "H";
    }
    return output;
  },

  durYear: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var durationObj = ConstantsDate.getDuration(element.innerText);

      if (durationObj.error) {
        return "Format Error: Dur Year";
      }

      var years = Math.floor(durationObj.value);
      var months = (durationObj.value - years) * 12;
      var days = (months - Math.floor(months)) * 30.4375;
      if (months === 0) {
        months = null;
      }
      if (days === 0) {
        days = null;
      }
      var toReturn = FiltersDate.printDurationType(
        years,
        months !== null ? Math.floor(months) : null,
        days !== null ? Math.floor(days) : null,
        null,
        durationObj.negative
      );
      return toReturn;
    }
    return "Format Error: Dur Year";
  },

  durMonth: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var durationObj = ConstantsDate.getDuration(element.innerText);
      if (durationObj.error) {
        return "Format Error: Dur Month";
      }
      var months = Math.floor(durationObj.value);
      var days = Math.floor((durationObj.value - months) * 30.4375);
      if (days === 0) {
        days = null;
      }
      var toReturn = FiltersDate.printDurationType(
        null,
        months,
        days !== null ? Math.floor(days) : null,
        null,
        durationObj.negative
      );
      return toReturn;
    }
    return "Format Error: Dur Month";
  },

  durWeek: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var durationObj = ConstantsDate.getDuration(element.innerText);
      if (durationObj.error) {
        return "Format Error: Dur Week";
      }
      var days = Math.floor(durationObj.value * 7);
      var toReturn = FiltersDate.printDurationType(
        null,
        null,
        Math.floor(days),
        null,
        durationObj.negative
      );
      return toReturn;
    }
    return "Format Error: Dur Month";
  },

  durDay: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var durationObj = ConstantsDate.getDuration(element.innerText);
      if (durationObj.error) {
        return "Format Error: Dur Day";
      }
      var days;
      var hours;
      if (durationObj.value) {
        days = Math.floor(durationObj.value);
        hours = Math.floor((durationObj.value - days) * 24);
      } else {
        days = Math.floor(durationObj.value);
        hours = Math.floor((durationObj.value - days) * 24);
      }

      if (hours === 0) {
        hours = null;
      }

      /* if ( hours ) {
        return durationObj.negative ? '-P' + Math.floor(days) + 'D' + Math.floor(hours) + 'H' : 'P' + Math.floor(days)
            + 'D' + Math.floor(hours) + 'H';
      }
      return durationObj.negative ? '-P' + Math.floor(days) + 'D' : 'P' + Math.floor(days) + 'D'; */
      return FiltersDate.printDurationType(
        null,
        null,
        days,
        hours,
        durationObj.negative
      );
    }
    return "Format Error: Dur Day";
  },

  durHour: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var durationObj = ConstantsDate.getDuration(element.innerText);
      if (durationObj.error) {
        return "Format Error: Dur Hour";
      }

      var hours = Math.floor(durationObj.value);

      // return durationObj.negative ? '-PT' + Math.floor(hours) + 'H' : 'PT' + Math.floor(hours) + 'H';
      return FiltersDate.printDurationType(
        null,
        null,
        null,
        hours,
        durationObj.negative
      );
    }
    return "Format Error: Dur Hour";
  },

  durWordsEn: function (element) {
    if (element && typeof element === "object" && element["innerText"]) {
      var regex =
        /^\s*((((([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)([\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D\-]|\s+)+[Hh]undred([\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D\s-]+(and[\s]+)?(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)(([\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D-]|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))?)|(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)(([\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D-]|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))|[Zz]ero|[Nn]o|[0-9][0-9]{0,3})[\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D\s-]+[Yy]ears?(,?[\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D\s-]+(and[\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D\s-]+)?|$))?((((([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)[\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D\s-]+[Hh]undred([\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D\s-]+(and[\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D\s-]+)?(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)(([\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D-]|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))?)|(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)(([\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D-]|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))|[Zz]ero|[Nn]o|[0-9][0-9]{0,3})[\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D\s-]+[Mm]onths?(,?[\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D\s-]+(and[\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D\s-]+)?|$))?((((([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)[\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D\s-]+[Hh]undred([\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D\s-]+(and[\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D\s-]+)?(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)(([\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D-]|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))?)|(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)(([\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D-]|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))|[Zz]ero|[Nn]o|[0-9][0-9]{0,3})[\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D\s-]+[Dd]ays?)?\s*$/;
      var secondRegex =
        /^\s*[\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D-]?([Zz]ero|[Nn]o(ne)?)[\u058A\u05BE\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D-]?\s*$/;
      var thirdRegex = /,|\sand\s/g;
      var result = regex.exec(element.innerText);
      if (result && element.innerText.trim().length > 0) {
        var dur = "P";
        var grp = [
          [1 + 1, "Y"],
          [62 + 1, "M"],
          [122 + 1, "D"]
        ];
        for (var i = 0; i < grp.length; i++) {
          var groupIndex = grp[i][0];
          var groupSuffix = grp[i][1];
          var groupPart = result[groupIndex];
          if (groupPart && groupPart !== null) {
            if (secondRegex.exec(groupPart) === null) {
              if (isNaN(groupPart)) {
                var tmp = groupPart
                  .trim()
                  .toLowerCase()
                  .replace(thirdRegex, " ");
                dur += ConstantsNumber.textToNumber(tmp);
              } else {
                dur += groupPart;
              }
              dur += groupSuffix;
            }
          }
        }
        return dur.length > 1 ? dur : "P0D";
      }
    }
    return "Format Error: Dur Words EN";
  }
};
