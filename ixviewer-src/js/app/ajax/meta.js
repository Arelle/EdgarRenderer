/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

"use strict";

var AjaxMeta = {
  init: function (callback) {
    var startPerformance = performance.now();
    if (HelpersUrl.getAllParams) {
      var xhr = new XMLHttpRequest();

      xhr.onreadystatechange = function (event) {
        if (xhr["readyState"] === 4) {
          if (xhr["status"] === 200) {
            var response = JSON.parse(event["target"]["response"]);
            AjaxMeta.setInstance(
              response,
              event["target"]["responseURL"],
              function (result) {
                var endPerformance = performance.now();
                console.debug(
                  "AjaxMeta.init() completed in: " +
                    (endPerformance - startPerformance).toFixed(2) +
                    "(ms)."
                );
                callback(result);
              }
            );
          } else {
            document
              .getElementById("xbrl-form-loading")
              .classList.add("d-none");

            ErrorsMinor.metaLinksNotFound(event["target"]["responseURL"]);
            var endPerformance = performance.now();
            console.debug(
              "AjaxMeta.init() completed in: " +
                (endPerformance - startPerformance).toFixed(2) +
                "(ms)."
            );
            callback(false);
          }
        }
      };

      xhr.open("GET", HelpersUrl.getAllParams["metalinks"], true);
      xhr.send();
    } else {
      var endPerformance = performance.now();
      console.debug(
        "AjaxMeta.init() completed in: " +
          (endPerformance - startPerformance).toFixed(2) +
          "(ms)."
      );
      callback(false);
    }
  },

  setInstance: function (input, metaFileLink, callback) {
    if (
      HelpersUrl.getAllParams["doc-file"] &&
      Object.keys(input["instance"])[0].indexOf(
        HelpersUrl.getAllParams["doc-file"]
      ) > -1
    ) {
      // we are good to proceed
      ConstantsFunctions.setMetaVersion(input["version"]);
      ConstantsFunctions.setMetaSourceDocumentsThenFixLinks(
        Object.keys(input["instance"])[0]
      );
      ConstantsFunctions.setMetaTags(
        input["instance"][Object.keys(input["instance"])[0]]["tag"]
      );
      ConstantsFunctions.setMetaEntityCounts(
        input["instance"][Object.keys(input["instance"])[0]]
      );
      ConstantsFunctions.setMetaReports(
        input["instance"][Object.keys(input["instance"])[0]]["report"]
      );
      ConstantsFunctions.setMetaStandardReference(input["std_ref"]);
      ConstantsFunctions.setMetaCustomPrefix(
        input["instance"][Object.keys(input["instance"])[0]]
      );
      ConstantsFunctions.setMetaDts(
        input["instance"][Object.keys(input["instance"])[0]]["dts"]
      );
      ConstantsFunctions.setMetaHidden(
        input["instance"][Object.keys(input["instance"])[0]]["hidden"]
      );
      callback(true);
    } else {
      // MetaLinks.json does not have this file as a key, hence we have an issue
      ErrorsMinor.metaLinksInstance(metaFileLink);
      callback(false);
    }
  }
};
