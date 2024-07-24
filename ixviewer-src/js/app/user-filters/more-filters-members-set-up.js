/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

"use strict";

var UserFiltersMoreFiltersMembersSetUp = {
  filtersSet: false,

  membersOptions: [],

  setMembers: function (callback) {
    var foundDimensions = document
      .getElementById("dynamic-xbrl-form")
      .querySelectorAll('[dimension*="Axis"]');
    var foundDimensionsArray = Array.prototype.slice.call(foundDimensions);
    var tempArray = [];
    foundDimensionsArray.forEach(function (current) {
      if (current && current["innerText"]) {
        if (current["innerText"].trim().split(":").length > 1) {
          var tempObject = {
            parentID: current.closest("[id]").getAttribute("id"),
            name: current["innerText"].trim(),
            label: current["innerText"].trim().split(":")[1].endsWith("Member")
              ? current["innerText"]
                  .trim()
                  .split(":")[1]
                  .replace(/([A-Z])/g, " $1")
                  .trim()
                  .slice(0, -7)
              : current["innerText"]
                  .trim()
                  .split(":")[1]
                  .replace(/([A-Z])/g, " $1")
                  .trim(),
            type: current.tagName.toLowerCase().includes("explicit")
              ? "explicit"
              : "typed"
          };
          tempArray.push(tempObject);
        } else if (!current.tagName.toLowerCase().includes("explicit")) {
          var children = Array.prototype.slice.call(current.children);
          children.forEach(function (current) {
            var name = current.tagName.toLowerCase();
            name = name.replace(":", "");
            if (name.endsWith(".domain")) {
              name = name.substring(0, name.length - 7);
            }
            if (current.innerText) {
              name = name + "_" + current.innerText;
            }

            var tempObject = {
              parentID: current.closest("[id]").getAttribute("id"),
              name: name,
              label: current["innerText"].trim().endsWith("Member")
                ? current["innerText"]
                    .trim()
                    .replace(/([A-Z])/g, " $1")
                    .trim()
                    .slice(0, -7)
                : current["innerText"]
                    .trim()
                    .replace(/([A-Z])/g, " $1")
                    .trim(),
              type: current.tagName.toLowerCase().includes("explicit")
                ? "explicit"
                : "typed"
            };
            tempArray.push(tempObject);
          });
        }
      }
    });
    tempArray.sort(function (first, second) {
      if (first["label"] > second["label"]) {
        return 1;
      }
      if (first["label"] < second["label"]) {
        return -1;
      }
      return 0;
    });
    var setAllParentIDS = function (
      currentName,
      finalized,
      tempArray,
      iterate
    ) {
      for (iterate = iterate || 0; iterate < tempArray.length; iterate++) {
        if (tempArray[iterate]["name"] === currentName) {
          finalized[finalized.length - 1]["parentID"].push(
            tempArray[iterate]["parentID"]
          );
        } else {
          finalized.push({
            parentID: [tempArray[iterate]["parentID"]],
            name: tempArray[iterate]["name"],
            label: tempArray[iterate]["label"],
            type: tempArray[iterate]["type"]
          });
          return setAllParentIDS(
            tempArray[iterate]["name"],
            finalized,
            tempArray,
            iterate
          );
        }
      }
      return finalized;
    };

    if (tempArray.length) {
      var currentName = tempArray[0]["name"];

      var finalized = [
        {
          parentID: [],
          name: tempArray[0]["name"],
          label: tempArray[0]["label"],
          type: tempArray[0]["type"]
        }
      ];
      UserFiltersMoreFiltersMembersSetUp.membersOptions = setAllParentIDS(
        currentName,
        finalized,
        tempArray,
        0
      );
      UserFiltersMoreFiltersMembersSetUp.populate();
      document.getElementById("filters-members-count").innerText =
        UserFiltersMoreFiltersMembersSetUp.membersOptions.length;
    } else {
      document.getElementById("filters-members-count").innerText = 0;
    }
    callback();
  },

  populate: function () {
    var typedCount = 0;
    var explicitCount = 0;
    var isContainerBuild = [false, false];
    UserFiltersMoreFiltersMembersSetUp.membersOptions.forEach(function (
      current,
      index
    ) {
      var indexType = current.type === "explicit" ? 0 : 1;
      current.type === "explicit" ? explicitCount++ : typedCount++;
      if (!isContainerBuild[indexType]) {
        var div = document.createElement("div");
        div.setAttribute("data-bs-parent", "#user-filters-members");
        div.setAttribute("id", "members-filters-accordion-" + indexType);
        div.classList.add("collapse");

        isContainerBuild[indexType] = true;

        document
          .getElementById("user-filters-members")
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
        UserFiltersMoreFiltersMembers.clickEvent(event, index);
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
        .getElementById("members-filters-accordion-" + indexType)
        .append(div);
    });
    // update typed / explitic counts
    if (typedCount > 0) {
      document
        .getElementById("user-filters-members")
        .children[1].classList.remove("d-none");
      var typedNode = document.createTextNode(typedCount);
      document.getElementById("members-typed-count").append(typedNode);
    }
    if (explicitCount > 0) {
      document
        .getElementById("user-filters-members")
        .children[0].classList.remove("d-none");
      var explicitNode = document.createTextNode(explicitCount);
      document.getElementById("members-explicit-count").append(explicitNode);
    }
    // add eventListener(s) to select all typed / explicit options
    document
      .getElementById("members-all-0")
      .addEventListener("click", function (event) {
        UserFiltersMoreFiltersMembers.parentClick(
          document.getElementById("members-all-0"),
          0
        );
      });
    document
      .getElementById("members-all-1")
      .addEventListener("click", function () {
        UserFiltersMoreFiltersMembers.parentClick(
          document.getElementById("members-all-1"),
          1
        );
      });
  }
};
