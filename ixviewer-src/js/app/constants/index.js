/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

"use strict";

var Constants = {
  version: "24.2.u1", // release quarter
  featureSet: "legacy",

  fileSizeError: [7500000, "7.5MB"],

  scrollPosition: localStorage.getItem("scrollPosition") || "start",

  hoverOption: localStorage.getItem("hoverOption") === "true" || false,

  getBrowserType: {},

  getHTMLAttributes: {},

  getPaginationPerPage: 10,

  getHtmlOverallTaxonomiesCount: null,

  getMetaSourceDocuments: [],

  getFactTypes: [],

  getScaleOptions: {
    0: "Zero",
    1: "Tens",
    2: "Hundreds",
    3: "Thousands", 
    4: "Ten thousands",
    5: "Hundred thousands",
    6: "Millions",
    7: "Ten Millions",
    8: "Hundred Millions",
    9: "Billions",
    10: "Ten Billions",
    11: "Hundred Billions",
    12: "Trillions",
    "-1": "Tenths",
    "-2": "Hundredths",
    "-3": "Thousandths",
    "-4": "Ten Thousandths",
    "-5": "Hundred Thousandths",
    "-6": "Millionths"
  },

  getDecimalOptions: {
    "-1": "Tens",
    "-2": "Hundreds",
    "-3": "Thousands",
    "-4": "Ten thousands",
    "-5": "Hundred thousands",
    "-6": "Millions",
    "-7": "Ten Millions",
    "-8": "Hundred Millions",
    "-9": "Billions",
    "-10": "Ten Billions",
    "-11": "Hundred Billions",
    "-12": "Trillions",
    1: "Tenths",
    2: "Hundredths",
    3: "Thousandths",
    4: "Ten Thousandths",
    5: "Hundred Thousandths",
    6: "Millionths"
  },

  getHTMLPrefix: null,

  getMetaTags: [],

  getMetaCalculationsParentTags: [],

  getMetaCalculations: [],

  getMetaEntityCounts: null,

  getMetaReports: [],

  getMetaStandardReference: [],

  getMetaVersion: null,

  getMetaCustomPrefix: null,

  getMetaHidden: null,

  getMetaDts: null,

  getMetaDocuments: function (input) {
    if (input && typeof input === "string") {
      return Constants.getMetaDts && Constants.getMetaDts[input]
        ? Constants.getMetaDts[input]
        : null;
    }
    return null;
  },

  getFormattingObject: {}
};
