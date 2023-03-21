/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

"use strict";

var UserFiltersMoreFiltersAxes = {
  clickEvent: function (event, index) {
    if (event["target"]) {
      if (event["target"].checked) {
        UserFiltersMoreFiltersAxes.addAxis(
          UserFiltersMoreFiltersAxesSetUp.axisOptions[index]
        );
      } else {
        UserFiltersMoreFiltersAxes.removeAxis(
          UserFiltersMoreFiltersAxesSetUp.axisOptions[index]
        );
      }
    }
  },

  parentClick: function (element, parentIndex) {
    var foundInputs = document.querySelectorAll(
      "#axes-filters-accordion-" + parentIndex + " input[type=checkbox]"
    );
    var foundInputsArray = Array.prototype.slice.call(foundInputs);
    if (element.checked) {
      // check all of the children
      foundInputsArray.forEach(function (current) {
        current.checked = true;
        var event = new Event("click");
        current.dispatchEvent(event);
      });
    } else {
      // uncheck all of the children
      foundInputsArray.forEach(function (current) {
        current.checked = false;
        var event = new Event("click");
        current.dispatchEvent(event);
      });
    }
  },

  addAxis: function (input) {
    var newAxis = UserFiltersState.getAxes.filter(function (element) {
      if (input["name"] === element["name"]) {
        return true;
      }
    });
    if (newAxis.length === 0) {
      UserFiltersState.getAxes.push(input);
    }
    UserFiltersState.filterUpdates();
  },

  removeAxis: function (input) {
    if (UserFiltersState.getAxes.indexOf(input) >= 0) {
      UserFiltersState.getAxes.splice(
        UserFiltersState.getAxes.indexOf(input),
        1
      );
      UserFiltersState.filterUpdates();
    }
  }
};
