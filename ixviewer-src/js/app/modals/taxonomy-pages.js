/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

"use strict";

var TaxonomyPages = {
  firstPage: function (element, callback) {
    var factValue;
    var factValueIsHTML = false;
    if (element instanceof Array) {
      factValue = FiltersValue.getFormattedValueForContinuedAt(element);
      element = element[0];
      factValueIsHTML = true;
    } else if (
      element.hasAttribute("text-block-taxonomy") ||
      ConstantsFunctions.setModalFactAsTextBlock(element)
    ) {
      factValue = FiltersValue.getFormattedValueForTextBlock(element);
      factValueIsHTML = true;
    } else {
      factValue = FiltersValue.getFormattedValue(element, true);
    }

    var possibleLabels = [
      {
        label: "Tag",
        value: element.getAttribute("name")
      },
      {
        label: "Fact",
        value: factValue,
        html: factValueIsHTML
      },
      {
        label: "Fact Language",
        value: FiltersOther.getLanguage(element.getAttribute("xml:lang"))
      },
      {
        label: "Period",
        value: FiltersContextref.getPeriod(element.getAttribute("contextref"))
      },
      {
        label: "Axis",
        value: FiltersContextref.getAxis(element.getAttribute("contextref")),
        html: true
      },
      {
        label: "Member",
        value: FiltersContextref.getMember(element.getAttribute("contextref")),
        html: true
      },
      {
        label: "Typed Member",
        value: FiltersContextref.getTypedMember(
          element.getAttribute("contextref")
        )
      },
      {
        label: "Explicit Member",
        value: FiltersContextref.getExplicitMember(
          element.getAttribute("contextref")
        )
      },
      {
        label: "Measure",
        value: FiltersUnitref.getMeasure(element.getAttribute("unitref"))
      },
      {
        label: "Scale",
        value: FiltersScale.getScale(element.getAttribute("scale"))
      },
      {
        label: "Decimals",
        value: FiltersCredit.getDecimals(element.getAttribute("decimals"))
      },
      {
        label: "Balance",
        value: FiltersCredit.getBalance(element)
      },
      {
        label: "Sign",
        value: FiltersSign.getSign(
          element.getAttribute("sign"),
          element["tagName"]
        )
      },
      {
        label: "Type",
        value: FiltersName.getFormattedType(element.getAttribute("name"))
      },
      {
        label: "Format",
        value: FiltersFormat.getFormattedFormat(element.getAttribute("format"))
      },
      {
        label: "Footnote",
        value: FiltersOther.getFootnote(
          element.getAttribute("data-original-id")
        )
      }
    ];

    // please note we are not using document.createDocumentFragment()
    // here because of an odd issue with IE
    var elementsToReturn = document.createElement("tbody");


    possibleLabels.forEach(function (current, index, array) {
      if (current["value"]) {
        var trElement = document.createElement("tr");


        var thElement = document.createElement("th");


        var thContent = document.createTextNode(current["label"]);
        thElement.appendChild(thContent);

        var tdElement = document.createElement("td");


        var divElement = document.createElement("div");
        divElement.setAttribute("class", "w-100 word-break");
        if (current["html"]) {
          if (current["value"] instanceof Array) {
            current.value.forEach(function (currentHTML) {
              if (currentHTML.firstElementChild) {
                divElement.appendChild(currentHTML);
              }
            });
            tdElement.appendChild(divElement);
          } else {
            if (current["value"] instanceof HTMLElement) {
              tdElement.appendChild(current["value"]);
            } else {
              divElement.innerHTML = current["value"];
              tdElement.appendChild(divElement);
            }
          }
        } else {
          divElement.innerHTML = current["value"];
          tdElement.appendChild(divElement);
        }
        trElement.appendChild(thElement);
        trElement.appendChild(tdElement);
        elementsToReturn.append(trElement);
      }
    });
    return callback(
      elementsToReturn.firstElementChild
        ? elementsToReturn
        : TaxonomyPages.noDataCarousel()
    );
  },

  secondPage: function (element, callback) {
    if (element.length) {
      element = element[0];
    }
    var allLabels = FiltersName.getAllLabelObject(element.getAttribute("name"));
    var possibleLabels = [];
    for (var current in allLabels) {
      var tempObject = {
        label: current,
        value: allLabels[current].replaceAll("&amp;", "&")
      };
      possibleLabels.push(tempObject);
    }

    // please note we are not using document.createDocumentFragment()
    // here because of an odd issue with IE
    var elementsToReturn = document.createElement("tbody");

    possibleLabels.forEach(function (current, index, array) {
      if (current["value"]) {
        var trElement = document.createElement("tr");


        var thElement = document.createElement("th");


        var thContent = document.createTextNode(current["label"]);
        thElement.appendChild(thContent);

        var tdElement = document.createElement("td");


        var divElement = document.createElement("div");


        var divContent = document.createTextNode(current["value"]);
        divElement.appendChild(divContent);
        tdElement.appendChild(divElement);

        trElement.appendChild(thElement);
        trElement.appendChild(tdElement);

        elementsToReturn.appendChild(trElement);
      }
    });
    return callback(
      elementsToReturn.firstElementChild
        ? elementsToReturn
        : TaxonomyPages.noDataCarousel()
    );
  },

  thirdPage: function (element, callback) {
    if (element.length) {
      element = element[0];
    }
    var allAuthRefs =
      FiltersName.getAuthRefs(element.getAttribute("name")) || [];
    var additionalRefs = [];
    var allAuthRefsViaDimension =
      FiltersContextref.getAxis(element.getAttribute("contextref"), true) ||
      null;
    if (allAuthRefsViaDimension) {
      var allAuthRefsViaDimensionArray = allAuthRefsViaDimension.split(" ");
      allAuthRefsViaDimensionArray.forEach(function (current, index) {
        FiltersName.getAuthRefs(current).forEach(function (
          nestedAuth,
          nestedIndex
        ) {
          additionalRefs.push(nestedAuth);
        });
      });
    }
    var allAuthRefsViaMember =
      FiltersContextref.getMember(element.getAttribute("contextref"), true) ||
      null;
    if (allAuthRefsViaMember) {
      var allAuthRefsViaMemberArray = allAuthRefsViaMember.split(" ");
      allAuthRefsViaMemberArray.forEach(function (current, index) {
        FiltersName.getAuthRefs(current).forEach(function (
          nestedAuth,
          nestedIndex
        ) {
          additionalRefs.push(nestedAuth);
        });
      });
    }

    var allRefs = allAuthRefs.concat(additionalRefs);
    var uniqueAuthRefs = allRefs.filter(function (element, index) {
      return allRefs.indexOf(element) === index;
    });

    // please note we are not using document.createDocumentFragment()
    // here because of an odd issue with IE
    var elementsToReturn = document.createElement("tbody");


    if (uniqueAuthRefs) {
      uniqueAuthRefs.forEach(function (current) {
        var discoveredReference =
          ConstantsFunctions.getSingleMetaStandardReference(current);
        if (discoveredReference[0]) {
          var possibleLabels = [];
          for (var property in discoveredReference[0]) {
            if (property !== "original-name") {
              var tempObject = {
                label: property,
                value: discoveredReference[0][property]
              };
              if (property === "URI") {
                tempObject.type = "link";
              }
              possibleLabels.push(tempObject);
            }
          }

          possibleLabels.forEach(function (current, index, array) {
            if (current["value"]) {
              var trElement = document.createElement("tr");


              var thElement = document.createElement("th");

              var thContent = document.createTextNode(current["label"]);
              thElement.appendChild(thContent);

              if (current["type"] === "link") {
                var additionalSmall = document.createElement("small");
                var additionalSmallContent = document.createTextNode(
                  " (Will Leave SEC Website)"
                );
                additionalSmall.appendChild(additionalSmallContent);
                thElement.appendChild(additionalSmall);
              }

              var tdElement = document.createElement("td");


              if (current["type"] === "link") {
                var aElement = document.createElement("a");

                aElement.setAttribute("href", current["value"]);
                aElement.setAttribute("target", "_blank");

                var aContent = document.createTextNode(current["value"]);
                aElement.appendChild(aContent);
                tdElement.appendChild(aElement);
              } else {
                var tdContent = document.createTextNode(current["value"]);
                tdElement.appendChild(tdContent);
              }

              trElement.appendChild(thElement);
              trElement.appendChild(tdElement);
              elementsToReturn.appendChild(trElement);
            }
            if (index === possibleLabels.length - 1) {
              var trElement = document.createElement("tr");


              var tdElement = document.createElement("td");
              tdElement.setAttribute("class", "blank-table-row");
              tdElement.setAttribute("colspan", "3");
              trElement.appendChild(tdElement);
              elementsToReturn.appendChild(trElement);
            }
          });
        }
      });
    }

    return callback(
      elementsToReturn.firstElementChild
        ? elementsToReturn
        : TaxonomyPages.noDataCarousel()
    );
  },

  fourthPage: function (element, callback) {
    if (element.length) {
      element = element[0];
    }

    var possibleLabels =
      FiltersName.getCalculationsForModal(element.getAttribute("name")) || [];

    possibleLabels.unshift({
      label: "Balance",
      value: FiltersCredit.getBalance(element) || "N/A"
    });

    // please note we are not using document.createDocumentFragment()
    // here because of an odd issue with IE
    var elementsToReturn = document.createElement("tbody");

    possibleLabels.forEach(function (current, index, array) {
      var trElement = document.createElement("tr");


      if (current.hasOwnProperty("blank")) {
        var tdElement = document.createElement("td");
        tdElement.setAttribute("class", "blank-table-row");
        tdElement.setAttribute("colspan", "3");

        trElement.appendChild(tdElement);
      }

      if (current.hasOwnProperty("value")) {
        var thElement = document.createElement("th");


        var thContent = document.createTextNode(current["label"]);
        thElement.appendChild(thContent);

        var tdElement = document.createElement("td");

        if (current["html"]) {
          tdElement.appendChild(current["value"]);
        } else {
          var tdContent = document.createTextNode(current["value"]);
          tdElement.appendChild(tdContent);
        }
        trElement.appendChild(thElement);
        trElement.appendChild(tdElement);
      }

      elementsToReturn.appendChild(trElement);
    });

    return callback(
      elementsToReturn.firstElementChild
        ? elementsToReturn
        : TaxonomyPages.noDataCarousel()
    );
  },

  noDataCarousel: function () {
    var trElement = document.createElement("tr");


    var tdElement = document.createElement("td");


    var tdContent = document.createTextNode("No Data.");
    tdElement.appendChild(tdContent);

    trElement.appendChild(tdElement);

    return trElement;
  }
};
