/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

"use strict";

var UserFiltersMoreFiltersMembers = {
  clickEvent: function (event, index) {
    if (event["target"]) {
      if (event["target"].checked) {
        UserFiltersMoreFiltersMembers.addMembers(
          UserFiltersMoreFiltersMembersSetUp.membersOptions[index]
        );
      } else {
        UserFiltersMoreFiltersMembers.removeMembers(
          UserFiltersMoreFiltersMembersSetUp.membersOptions[index]
        );
      }
    }
  },

  parentClick: function (element, parentIndex) {
    var foundInputs = document.querySelectorAll(
      "#members-filters-accordion-" + parentIndex + " input[type=checkbox]"
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

  addMembers: function (input) {
    var newMembers = UserFiltersState.getMembers.filter(function (element) {
      if (input["name"] === element["name"]) {
        return true;
      }
    });
    if (newMembers.length === 0) {
      UserFiltersState.getMembers.push(input);
    }
    UserFiltersState.filterUpdates();
  },

  removeMembers: function (input) {
    if (UserFiltersState.getMembers.indexOf(input) >= 0) {
      UserFiltersState.getMembers.splice(
        UserFiltersState.getMembers.indexOf(input),
        1
      );
      UserFiltersState.filterUpdates();
    }
  }
};
