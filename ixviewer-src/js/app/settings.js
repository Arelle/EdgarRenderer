/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

"use strict";

function setCustomCSS() {
  var taggedData = localStorage.getItem("taggedData") || "FF6600";
  var searchResults = localStorage.getItem("searchResults") || "FFD700";
  var selectedFact = localStorage.getItem("selectedFact") || "003768";
  var tagShading = localStorage.getItem("tagShading") || "rgba(255,0,0,0.3)";
  var textBlock = localStorage.getItem("textBlock") || "#003768";
  var cssObject = {
    '#dynamic-xbrl-form [enabled-taxonomy="true"][continued-taxonomy="false"]':
      {
        "border-top": "2px solid #" + taggedData,
        "border-bottom": "2px solid #" + taggedData,
        display: "inline"
      },

    '#dynamic-xbrl-form [enabled-taxonomy="true"][continued-main-taxonomy="true"]':
      {
        "box-shadow":
          "-2px 0px 0px 0px #" + taggedData + ", 2px 0px 0px 0px #" + taggedData
      },

    '#dynamic-xbrl-form [enabled-taxonomy="true"][text-block-taxonomy="true"]':
      {
        "box-shadow":
          "-2px 0px 0px 0px #" +
          taggedData +
          ", 2px 0px 0px 0px #" +
          taggedData,
        "border-top": "none",
        "border-bottom": "none"
      },

    '#dynamic-xbrl-form [highlight-taxonomy="true"]': {
      "background-color": "#" + searchResults + " !important"
    },

    '#dynamic-xbrl-form [highlight-taxonomy="true"] > *': {
      "background-color": "#" + searchResults + " !important"
    },

    '#dynamic-xbrl-form [selected-taxonomy="true"][continued-main-taxonomy="true"]':
      {
        "box-shadow":
          "-2px 0px 0px 0px #" +
          selectedFact +
          ", 2px 0px 0px 0px #" +
          selectedFact
      },

    '#dynamic-xbrl-form [selected-taxonomy="true"][text-block-taxonomy="true"]':
      {
        "box-shadow":
          "-2px 0px 0px 0px #" +
          selectedFact +
          ", 2px 0px 0px 0px #" +
          selectedFact
      },

    '#dynamic-xbrl-form [selected-taxonomy="true"][continued-taxonomy="false"]':
      {
        border: "3px solid #" + selectedFact + " !important",
        display: "inline"
      },

    '#dynamic-xbrl-form [hover-taxonomy="true"]': {
      "background-color": tagShading
    },

    "#dynamic-xbrl-form .text-block-indicator-left": {
      "border-left": ".75rem solid #" + textBlock
    },

    "#dynamic-xbrl-form .text-block-indicator-right": {
      "border-right": ".75rem solid #" + textBlock
    },

    ".tagged-data-example-1": {
      "border-top": "2px solid #" + taggedData,
      "border-bottom": "2px solid #" + taggedData
    },

    ".search-results-example-1": {
      "background-color": "#" + searchResults
    },

    ".tag-shading-exmple-1:hover": {
      "background-color": tagShading
    },

    ".selected-fact-example-1": {
      border: "3px solid #" + selectedFact + " !important"
    }
  };

  var cssString = "";

  for (var key in cssObject) {
    cssString += " " + key + "{";
    for (var nestedKey in cssObject[key]) {
      cssString += nestedKey + ":" + cssObject[key][nestedKey] + ";";
    }
    cssString += "}";
  }
  var head = document.head || document.getElemtsByTagName("head")[0];
  var style =
    document.getElementById("customized-styles") ||
    document.createElement("style");

  head.appendChild(style);

  style.type = "text/css";
  style.id = "customized-styles";

  style.appendChild(document.createTextNode(cssString));
}
(function () {
  setCustomCSS();
  var taggedData = localStorage.getItem("taggedData") || "FF6600";
  var searchResults = localStorage.getItem("searchResults") || "FFD700";
  var selectedFact = localStorage.getItem("selectedFact") || "003768";
  var tagShading = localStorage.getItem("tagShading") || "rgba(255,0,0,0.3)";
  var textBlock = localStorage.getItem("textBlock") || "#003768";
  var pickrOptions = [
    {
      selector: "#tagged-data-color-picker",
      default: taggedData,
      storage: "taggedData",
      reset: "FF6600"
    },
    {
      selector: "#search-results-color-picker",
      default: searchResults,
      storage: "searchResults",
      reset: "FFD700"
    },
    {
      selector: "#selected-fact-color-picker",
      default: selectedFact,
      storage: "selectedFact",
      reset: "003768"
    },
    {
      selector: "#tag-shading-color-picker",
      default: tagShading,
      storage: "tagShading",
      reset: "rgba(255,0,0,0.3)"
    },
    {
      selector: "#text-block-color-picker",
      default: textBlock,
      storage: "textBlock",
      reset: "003768"
    }
  ];

  pickrOptions.forEach(function (current, index) {
    var picker = new Picker({
      parent: document.querySelector(current["selector"]),
      popup: false,
      color: current["default"],
      editorFormat: "hex",
      alpha: index === 3 ? true : false,
      editor: false,
      cancelButton: true,
      onDone: function (color) {
        if (index === 3) {
          localStorage.setItem(
            current["storage"],
            "rgba(" + color.rgba.join(",") + ")"
          );
          setCustomCSS();
        } else {
          var hex = color.hex.replace("#", "").substring(0, 6);
          localStorage.setItem(current["storage"], hex);
          setCustomCSS();
        }
      }
    });
    document.querySelector(
      current["selector"] + " .picker_done button"
    ).innerText = "Save";
    document.querySelector(
      current["selector"] + " .picker_cancel button"
    ).innerText = "Reset";
    document.querySelector(
      current["selector"] + " .picker_cancel button"
    ).onclick = function () {
      localStorage.setItem(current["storage"], current["reset"]);
      picker.setColor(current["reset"]);
      setCustomCSS();
    };
  });
})();
