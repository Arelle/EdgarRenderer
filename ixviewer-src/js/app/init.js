/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

"use strict";

var AppInit = {
  init: function (internalUrl, callback) {
    console.log('Version: '+Constants.version+' ('+Constants.featureSet+')');
    console.log("CSS Mode: " + (document.compatMode==="CSS1Compat"?"Standards 🎉":"Quirks 😢"));

    // we figure out what browser the user is using, and store it
    ConstantsFunctions.setBrowserType();
    AppInit.emptySidebars();


    internalUrl = internalUrl || false;

    HelpersUrl.init(internalUrl, function (result) {
      if (result) {
        AjaxForm.init(function (formLoaded) {
          if (formLoaded) {
            Images.updateLinks();
            // Links.init();

            // TODO maybe put this somewhere better
            if (HelpersUrl.getAnchorTag) {
              var elementToScrollTo = document
                .getElementById("dynamic-xbrl-form")
                .querySelector(HelpersUrl.getAnchorTag);

              if (elementToScrollTo) {
                elementToScrollTo.scrollIntoView({
                  block: Constants.scrollPosition
                });
              }
            }
            // we wait for the event loop to clear
            // this is to allow the form to be inserted into the application
            setTimeout(function () {
              callback(true);
            });
          } else {
            ErrorsMajor.formLinksNotFound();
            callback(false);
          }
        });
      } else {
        document.getElementById("xbrl-form-loading").classList.add("d-none");
        Taxonomies.updateTaxonomyCount();
        ErrorsMajor.urlParams();
        callback(false);
      }
    });
  },

  initialSetup: function () {
    AjaxMeta.init(function (result) {
      Taxonomies.addEventAttributes();
      Links.init();

      if (result) {
        var disabledNavs = document.querySelectorAll(
          ".navbar .disabled, [disabled]"
        );
        var disabledNavsArray = Array.prototype.slice.call(disabledNavs);

        disabledNavsArray.forEach(function (current) {
          current.classList.remove("disabled");
          current.removeAttribute("disabled");
        });
      } else {
        var disabledNavs = document.querySelectorAll(
          ".navbar .disabled:not(.meta-required), [disabled]:not(.meta-required) "
        );
        var disabledNavsArray = Array.prototype.slice.call(disabledNavs);

        document
          .querySelector('[name="search-options"][value="1"]')
          .removeAttribute("checked");

        disabledNavsArray.forEach(function (current) {
          current.classList.remove("disabled");
          current.removeAttribute("disabled");
        });
      }
    });
  },

  additionalSetup: function () {
    // we go here if a user changes forms (metalinks is already in memory)

    Taxonomies.addEventAttributes();
    Taxonomies.setFilterAttributes();
    Links.init();
    Sections.formChange();
    TaxonomiesMenu.formChange();
    UserFiltersGeneral.emptyMoreFilters();
  },

  emptySidebars: function () {
    UserFiltersMoreFiltersPeriodSetUp.filtersSet = false;
    UserFiltersMoreFiltersMeasureSetUp.filtersSet = false;
    UserFiltersMoreFiltersAxesSetUp.filtersSet = false;
    UserFiltersMoreFiltersScaleSetUp.filtersSet = false;

    document.getElementById("error-container").innerHTML = "";

    var taxonomyCount = document.querySelectorAll(".taxonomy-total-count");
    var taxonomyCountArray = Array.prototype.slice.call(taxonomyCount);

    taxonomyCountArray.forEach(function (current) {
      current.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    });

    var loadingHtml = '<span class="text-center py-5">Loading.</span>';

    document.querySelector(
      "#taxonomies-menu-list-pagination .pagination"
    ).innerHTML = "";
    document.querySelector(
      "#taxonomies-menu-list-pagination .list-group"
    ).innerHTML = loadingHtml;
  }
};

(function () {
  // the user has just loaded up the application
  var startPerformance = performance.now();
  AppInit.init("", function (formLoaded) {
    // alert("init complete!");
    if (formLoaded) {
      AppInit.initialSetup();
    } else {
      ErrorsMajor.inactive();
    }

    setTimeout(function()
    {
      function cancelClick(e)
      {
        e.stopPropagation();
        e.stopImmediatePropagation();
        // e.preventDefault();
        return false;
      }

      var arr1 = Array.from(document.querySelectorAll("ix\\:exclude"));
      var arr2 = Array.from(document.querySelectorAll("#dynamic-xbrl-form a"));
      var arr = arr1.concat(arr2);
      for (var i=0; i<arr.length; i++)
      {
        arr[i].addEventListener("click", cancelClick, true);
      }
    }, 1000);

    var endPerformance = performance.now();
    console.debug(
      "AppInit.init() completed in: " +
        (endPerformance - startPerformance).toFixed(2) +
        "(ms)."
    );
  });
})();
