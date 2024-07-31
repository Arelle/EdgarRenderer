/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

"use strict";

var UserFiltersMoreFiltersAxesSetUp = {
  filtersSet: false,

  axisOptions: [],

  setAxes: function (callback) {
    var foundDimensions = document
      .getElementById("dynamic-xbrl-form")
      .querySelectorAll('[dimension*="Axis"]');
    var foundDimensionsArray = Array.prototype.slice.call(foundDimensions);

    foundDimensionsArray.forEach(function (current) {
      var tempObject = {
        name: current.getAttribute("dimension"),
        label: current
          .getAttribute("dimension")
          .split(":")[1]
          .replace(/([A-Z])/g, " $1")
          .trim()
          .slice(0, -5),
        type: current.tagName.toLowerCase().includes("explicit")
          ? "explicit"
          : "typed"
      };

      var axisExists = UserFiltersMoreFiltersAxesSetUp.axisOptions.filter(
        function (element) {
          return element["name"] === tempObject["name"];
        }
      );

      if (axisExists.length === 0) {
        UserFiltersMoreFiltersAxesSetUp.axisOptions.push(tempObject);
      }
    });
    UserFiltersMoreFiltersAxesSetUp.axisOptions.sort(function (first, second) {
      if (first["label"] > second["label"]) {
        return 1;
      }
      if (first["label"] < second["label"]) {
        return -1;
      }
      return 0;
    });

    document.getElementById("filters-axis-count").innerText =
      UserFiltersMoreFiltersAxesSetUp.axisOptions.length;

    UserFiltersMoreFiltersAxesSetUp.populate();

    callback();
  },

  populate: function () {
    var typedCount = 0;
    var explicitCount = 0;
    var isContainerBuild = [false, false];
    UserFiltersMoreFiltersAxesSetUp.axisOptions.forEach(function (
      current,
      index
    ) {
      var indexType = current.type === "explicit" ? 0 : 1;
      current.type === "explicit" ? explicitCount++ : typedCount++;
      if (!isContainerBuild[indexType]) {
        var div = document.createElement("div");
        div.setAttribute("data-bs-parent", "#user-filters-axis");
        div.setAttribute("id", "axes-filters-accordion-" + indexType);
        div.classList.add("collapse");

        isContainerBuild[indexType] = true;

        document
          .getElementById("user-filters-axis")
          .children[indexType].append(div);
      }

      var div = document.createElement("div");
      div.classList.add("d-flex");
      div.classList.add("justify-content-between");
      div.classList.add("align-items-center");
      div.classList.add("w-100");
      div.classList.add("px-2");


      var div2 = document.createElement("div");
      div2.classList.add("form-check");


      var input = document.createElement("input");
      input.setAttribute("title", "Select/Deselect this option.");
      input.setAttribute("type", "checkbox");
      input.setAttribute("tabindex", "9");
      input.classList.add("form-check-input");


      input.addEventListener("click", function (event) {
        UserFiltersMoreFiltersAxes.clickEvent(event, index);
      });

      var label = document.createElement("label");
      label.classList.add("form-check-label");
      label.classList.add("mb-0");


      var text = document.createTextNode(current.label);
      label.append(text);
      div2.append(input);
      div2.append(label);
      div.append(div2);
      document
        .getElementById("axes-filters-accordion-" + indexType)
        .append(div);
    });
    // update typed / explitic counts
    if (typedCount > 0) {
      document
        .getElementById("user-filters-axis")
        .children[1].classList.remove("d-none");
      var typedNode = document.createTextNode(typedCount);
      document.getElementById("axis-typed-count").append(typedNode);
    }
    if (explicitCount > 0) {
      document
        .getElementById("user-filters-axis")
        .children[0].classList.remove("d-none");
      var explicitNode = document.createTextNode(explicitCount);
      document.getElementById("axis-explicit-count").append(explicitNode);
    }
    // add eventListener(s) to select all typed / explicit options
    document
      .getElementById("axes-all-0")
      .addEventListener("click", function (event) {
        UserFiltersMoreFiltersAxes.parentClick(
          document.getElementById("axes-all-0"),
          0
        );
      });
    document
      .getElementById("axes-all-1")
      .addEventListener("click", function (event) {
        UserFiltersMoreFiltersAxes.parentClick(
          document.getElementById("axes-all-1"),
          1
        );
      });
  }
};
