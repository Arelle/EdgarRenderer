/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

"use strict";

var FiltersContextref = {
  getDimensions: function (contextRef) {
    if (contextRef && typeof contextRef === "string") {
      contextRef = contextRef.replace(/\./g, "\\.");
      var foundDimensions = document
        .getElementById("dynamic-xbrl-form")
        .querySelectorAll('[id="' + contextRef + '"] [dimension]');
      return Array.prototype.slice.call(foundDimensions);
    }
    return null;
  },

  getAxis: function (contextRef, plainText) {
    plainText = plainText || false;

    if (contextRef && typeof contextRef === "string") {
      contextRef = contextRef.replace(/\./g, "\\.");

      var foundDimensions = document
        .getElementById("dynamic-xbrl-form")
        .querySelectorAll('[id="' + contextRef + '"] [dimension]');
      var foundDimensionsArray = Array.prototype.slice.call(foundDimensions);

      var axis = foundDimensionsArray
        .map(function (current) {
          if (plainText) {
            return current.getAttribute("dimension");
          }
          return FiltersName.getFormattedName(
            current.getAttribute("dimension")
          );
        })
        .filter(function (element, index, array) {
          return array.indexOf(element) === index;
        });

      if (plainText) {
        return axis.join(" ");
      }

      var returnAxis = axis.reduce(function (acc, current, index, array) {
        acc.push(current);
        if (index < array.length - 1) {
          acc.push(document.createElement("br"));
        }
        return acc;
      }, []);

      return returnAxis.length ? returnAxis : null;
    }
    return null;
  },

  getMember: function (contextRef, plainText) {
    plainText = plainText || false;

    if (contextRef && typeof contextRef === "string") {
      var foundDimensions = document
        .getElementById("dynamic-xbrl-form")
        .querySelectorAll('[id="' + contextRef + '"] [dimension]');

      var foundDimensionsArray = Array.prototype.slice.call(foundDimensions);
      var member = foundDimensionsArray
        .map(function (current) {
          if (plainText) {
            return current.innerHTML;
          }
          return FiltersName.getFormattedName(current.innerHTML);
        })
        .filter(function (element, index, array) {
          return array.indexOf(element) === index;
        });

      if (plainText) {
        return member.join(" ");
      }
      var returnMember = member
        .reduce(function (acc, current, index, array) {
          acc.push(current);
          if (index < array.length - 1) {
            acc.push(document.createElement("br"));
          }
          return acc;
        }, [])
        .filter(function (element, index, array) {
          return element;
        });

      return returnMember.length ? returnMember : null;
    }
    return null;
  },

  getTypedMember: function (contextRef) {
    if (contextRef && typeof contextRef === "string") {
      var nameSpace;
      for (var ns in Constants.getHTMLAttributes) {
        if (Constants.getHTMLAttributes[ns] === "http://xbrl.org/2006/xbrldi") {
          nameSpace = ns.split(":")[1];
        }
      }

      var foundDimensions = document
        .getElementById("dynamic-xbrl-form")
        .querySelectorAll(
          '[id="' + contextRef + '"] ' + nameSpace + "\\:typedmember"
        );

      var foundDimensionsArray = Array.prototype.slice.call(foundDimensions);
      var returnMember = foundDimensionsArray
        .map(function (current, index, array) {
          return current.textContent;
        })
        .join(", ");

      return returnMember ? returnMember : null;
    }
    return null;
  },

  getExplicitMember: function (contextRef) {
    if (contextRef && typeof contextRef === "string") {
      var nameSpace;
      for (var ns in Constants.getHTMLAttributes) {
        if (Constants.getHTMLAttributes[ns] === "http://xbrl.org/2006/xbrldi") {
          nameSpace = ns.split(":")[1];
        }
      }

      var foundDimensions = document
        .getElementById("dynamic-xbrl-form")
        .querySelectorAll(
          '[id="' + contextRef + '"] ' + nameSpace + "\\:explicitmember"
        );

      var foundDimensionsArray = Array.prototype.slice.call(foundDimensions);
      var returnMember = foundDimensionsArray
        .map(function (current, index, array) {
          return current.textContent;
        })
        .join(", ");

      return returnMember ? returnMember : null;
    }
    return null;
  },

  getPeriod: function (contextRef, currentElement) {
    currentElement = currentElement || false;
    if (!currentElement) {
      var nameSpace = "period,";
      for (var ns in Constants.getHTMLAttributes) {
        if (
          Constants.getHTMLAttributes[ns] ===
          "http://www.xbrl.org/2003/instance"
        ) {
          nameSpace += ns.split(":")[1] + "\\:period,";
        }
      }
      if (nameSpace) {
        nameSpace = nameSpace.substring(0, nameSpace.length - 1);
        currentElement = document
          .getElementById("dynamic-xbrl-form")
          .querySelector("#" + contextRef)
          .querySelector(nameSpace);
      }
    }
    if (contextRef && typeof contextRef === "string") {
      contextRef = contextRef.replace(/\./g, "\\.");
      if (
        document
          .getElementById("dynamic-xbrl-form")
          .querySelector('[id="' + contextRef + '"]') &&
        document
          .getElementById("dynamic-xbrl-form")
          .querySelector('[id="' + contextRef + '"]')
          .nodeName.split(":")[0]
          .toLowerCase()
      ) {
        var prefixParent = document
          .getElementById("dynamic-xbrl-form")
          .querySelector('[id="' + contextRef + '"]')
          .nodeName.toLowerCase();
        var prefix = "";
        if (prefixParent.split(":").length === 2) {
          prefix = prefixParent.split(":")[0] + ":";
        }
      }

      var startDateTag = prefix + "startDate";
      var endDateTag = prefix + "endDate";
      var instantDateTag = prefix + "instant";

      var dates = Array.prototype.slice.call(currentElement.children);

      var datesObject = dates.reduce(
        function (accumulator, element) {
          return {
            startDate:
              element.nodeName === startDateTag
                ? moment(element.textContent, "YYYY-MM-DD")
                : accumulator.startDate,
            endDate:
              element.nodeName === endDateTag
                ? moment(element.textContent, "YYYY-MM-DD")
                : accumulator.endDateTag,
            instantDate:
              element.nodeName === instantDateTag
                ? moment(element.textContent, "YYYY-MM-DD")
                : accumulator.instantDateTag
          };
        },
        {
          startDate: null,
          endDate: null,
          instantDate: null
        }
      );

      if (
        datesObject.startDate &&
        datesObject.startDate.isValid() &&
        datesObject.endDate &&
        datesObject.endDate.isValid()
      ) {
        var betweenDate;
        var monthsDifference = Math.round(
          datesObject.endDate.diff(datesObject.startDate, "months", true)
        );
        if (monthsDifference !== 0) {
          betweenDate =
            monthsDifference +
            " months ending " +
            datesObject.endDate.format("MM/DD/YYYY");
        } else {
          betweenDate =
            datesObject.startDate.format("MM/DD/YYYY") +
            " - " +
            datesObject.endDate.format("MM/DD/YYYY");
        }
        return betweenDate;
      } else if (datesObject.instantDate && datesObject.instantDate.isValid()) {
        return "As of " + datesObject.instantDate.format("MM/DD/YYYY");
      }
      return "No period information.";
    }
    return "No period information.";
  }
};
