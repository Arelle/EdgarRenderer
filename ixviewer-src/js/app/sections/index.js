/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

"use strict";

var Sections = {
  currentlyOpenChildMenu: {},

  searchObject: {},

  populatedSections: false,

  clickEvent: function (event, element) {
    if (event.keyCode && !(event.keyCode === 13 || event.keyCode === 32)) {
      return;
    }

    if (
      element.getAttribute("baseref") &&
      element.getAttribute("baseref") !== HelpersUrl.getHTMLFileName
    ) {
      // we load it, then send the user to the correct spot

      AppInit.init(element.getAttribute("baseref"), function () {
        AppInit.additionalSetup();
        Sections.fallbackElementScroll(event, element);
      });
    } else {
      Sections.fallbackElementScroll(event, element);
    }
  },

  fallbackElementScroll: function (event, element) {
    Sections.setSelectedAttributes(element);
    var taxonomyElement = TaxonomiesGeneral.getElementByNameContextref(
      element.getAttribute("name"),
      element.getAttribute("contextref")
    );

    if (taxonomyElement) {
      taxonomyElement.scrollIntoView({
        block: Constants.scrollPosition
      });
    } else {
      ErrorsMinor.factNotFound();
    }
  },

  toggle: function (event, element) {
    if (event.keyCode && !(event.keyCode === 13 || event.keyCode === 32)) {
      return;
    }

    if (element.classList && element.classList.contains("disabled")) {
      return;
    }
    MenusState.toggle("sections-menu", false, function (openMenu) {
      if (openMenu) {
        document
          .getElementById("sections-menu")
          .addEventListener("transitionend", Sections.transitionEvent);
      }
    });
  },

  transitionEvent: function (event) {
    if (event.propertyName === "visibility") {
      setTimeout(function () {
        if (!Sections.populatedSections) {
          Sections.populate();
          document
            .getElementById("sections-menu")
            .removeEventListener("transitionend", Sections.transitionEvent);
          Sections.populatedSections = true;
        }
      });
    }
  },

  formChange: function () {
    if (MenusState.openMenu === "sections-menu") {
      if (
        Sections.currentlyOpenChildMenu.hasOwnProperty("id") &&
        Sections.currentlyOpenChildMenu.hasOwnProperty("group")
      ) {
        // we now want to re-paint all sections, keeping Sections.currentlyOpenChildMenu open
        while (document.querySelector("#tagged-sections").firstChild) {
          document.querySelector("#tagged-sections").firstChild.remove();
        }
        Sections.populatedSections = false;
        Sections.populate(
          Sections.searchObject,
          Sections.currentlyOpenChildMenu.id
        );
      }
    }
  },

  populate: function (searchObject, idToKeepOpen) {
    searchObject = searchObject || {};

    Sections.searchObject = searchObject;
    var setupArray = [
      {
        // this will only be available for MetaLinks Version 2.2 or higher
        groupType: "Cover",
        label: "Cover"
      },
      {
        groupType: "document",
        label: "Document & Entity Information"
      },
      {
        groupType: "statement",
        label: "Financial Statements"
      },
      {
        // this will only be available for MetaLinks Version 2.2 or higher
        groupType: "Statements",
        label: "Financial Statements"
      },
      {
        groupType: "disclosure",
        label: "Notes to the Financial Statements"
      },
      {
        // this will only be available for MetaLinks Version 2.2 or higher
        groupType: "Notes",
        label: "Notes to Financial Statements"
      },
      {
        // this will only be available for MetaLinks Version 2.2 or higher
        groupType: "Policies",
        label: "Accounting Policies"
      },
      {
        // this will only be available for MetaLinks Version 2.2 or higher
        groupType: "Tables",
        label: "Notes Tables"
      },
      {
        // this will only be available for MetaLinks Version 2.2 or higher
        groupType: "Details",
        label: "Notes Details"
      },
      {
        groupType: "RR_Summaries",
        label: "RR Summaries"
      },
      {
        groupType: "Prospectus",
        label: "Prospectus"
      },
      {
        groupType: "Fee_Exhibit",
        label: "RR Summaries"
      }
    ];
    setupArray.forEach(function (current, index) {
      current.parentId = "tagged-sections-" + index;
      current.badgeId = "tagged-sections-badge-" + index;
      current.containerId = "tagged-sections-container-" + index;
      if (current.containerId === idToKeepOpen) {
        current.open = true;
      } else {
        current.open = false;
      }
      if (!Sections.populatedSections) {
        Sections.populateParentCollapse(current);
      }
      Sections.filterParentCollapse(Sections.searchObject, setupArray);

      Sections.updateBadgeCount(setupArray);
    });
  },

  filterParentCollapse: function (searchObject, setupArray) {
    setupArray.forEach(function (current) {
      var liElements = document.querySelectorAll(
        "#" + current.containerId + " li"
      );
      var liElementsArray = Array.prototype.slice.call(liElements);

      if (searchObject.hasOwnProperty("value")) {
        if (document.getElementById(current.containerId)) {
          liElementsArray.forEach(function (li) {
            if (searchObject.type === 1) {
              // search all sections
              if (
                Sections.searchObject.value &&
                !Sections.searchObject.value.test(li.textContent)
              ) {
                li.classList.remove("d-flex");
                li.classList.add("d-none");
              } else {
                li.classList.add("d-flex");
                li.classList.remove("d-none");
              }
            } else if (searchObject.type === 2 && !li.hasAttribute("baseref")) {
              // search internal sections ONLY
              if (
                !li.hasAttribute("baseref") &&
                li.textContent &&
                Sections.searchObject.value &&
                !Sections.searchObject.value.test(li.textContent)
              ) {
                li.classList.remove("d-flex");
                li.classList.add("d-none");
              } else {
                li.classList.add("d-flex");
                li.classList.remove("d-none");
              }
            } else if (searchObject.type === 3 && li.hasAttribute("baseref")) {
              // search external sections ONLY
              if (
                li.textContent &&
                Sections.searchObject.value &&
                !Sections.searchObject.value.test(li.textContent)
              ) {
                li.classList.remove("d-flex");
                li.classList.add("d-none");
              } else {
                li.classList.add("d-flex");
                li.classList.remove("d-none");
              }
            } else {
              li.classList.remove("d-flex");
              li.classList.add("d-none");
            }
          });
        }
      }

      if (
        !searchObject.hasOwnProperty("type") &&
        !searchObject.hasOwnProperty("value")
      ) {
        liElementsArray.forEach(function (li) {
          li.classList.add("d-flex");
          li.classList.remove("d-none");
        });
      }
    });
  },

  updateBadgeCount: function (setupArray) {
    setupArray.forEach(function (current) {
      var badgeCount = 0;
      var liElements = document.querySelectorAll(
        "#" + current.containerId + " li"
      );
      var liElementsArray = Array.prototype.slice.call(liElements);
      liElementsArray.forEach(function (li) {
        if (li.classList.contains("d-flex")) {
          badgeCount++;
        }
      });
      var badge = document.getElementById(current.badgeId);
      if (badge) {
        if (badgeCount > 0) {
          document.getElementById(current.parentId).classList.remove("d-none");
          badge.innerHTML = badgeCount;
        } else {
          document.getElementById(current.parentId).classList.add("d-none");
        }
      }
    });
  },

  populateParentCollapse: function (input) {
    var discoveredGroupType = Sections.filterGroupType(input.groupType);

    if (discoveredGroupType.length > 0) {
      // we generate the HTML for this section
      Sections.generateParentCollapseHTML(input, discoveredGroupType.length);
      Sections.generateChildCollapseHTML(input, discoveredGroupType);
    }
  },

  generateParentCollapseHTML: function (input, badgeCount) {
    var card = document.createElement("div");
    card.classList.add("reboot");
    card.classList.add("card");
    card.setAttribute("id", input.parentId);
    card.setAttribute("data-test", input.parentId);

    var headerContainer = document.createElement("div");
    headerContainer.classList.add("reboot");
    headerContainer.classList.add("card-header");
    headerContainer.classList.add("mb-0");
    headerContainer.classList.add("px-0");
    headerContainer.classList.add("py-0");

    var header = document.createElement("h5");
    header.classList.add("reboot");
    header.classList.add("mb-0");

    var button = document.createElement("button");
    button.classList.add("reboot");
    button.classList.add("btn");
    button.classList.add("d-flex");
    button.classList.add("justify-content-between");
    button.classList.add("align-items-center");
    button.classList.add("align-items-center");
    button.classList.add("w-100");
    button.setAttribute("type", "button");
    button.setAttribute("data-target", "#" + input.containerId);
    button.setAttribute("tabindex", "2");
    button.setAttribute("data-toggle", "collapse");
    button.addEventListener("click", function () {
      // eslint-disable-next-line no-invalid-this
      Sections.captureChildCollapse(this, "#" + input.parentId);
    });

    var span = document.createElement("span");
    span.classList.add("reboot");
    span.classList.add("font-size-1");

    var text = document.createTextNode(input.label);

    var span2 = document.createElement("span");
    span2.classList.add("reboot");
    span2.classList.add("badge");
    span2.classList.add("badge-secondary");
    span2.setAttribute("id", input.badgeId);
    var text2 = document.createTextNode(badgeCount);

    span.appendChild(text);
    button.appendChild(span);

    span2.appendChild(text2);
    button.appendChild(span2);
    header.appendChild(button);

    headerContainer.appendChild(header);
    card.appendChild(headerContainer);
    document.getElementById("tagged-sections").appendChild(card);
  },

  generateChildCollapseHTML: function (input, objectOfInfo) {
    var card = document.getElementById(input.parentId);
    var collapseContainer = document.createElement("div");
    collapseContainer.classList.add("reboot");
    collapseContainer.classList.add("collapse");
    if (input.open) {
      collapseContainer.classList.add("show");
    }
    collapseContainer.setAttribute("data-parent", "#tagged-sections");
    collapseContainer.setAttribute("id", input.containerId);

    var listGroup = document.createElement("div");
    listGroup.classList.add("reboot");
    listGroup.classList.add("list-group");
    listGroup.classList.add("list-group-flush");
    objectOfInfo.forEach(function (current) {
      var name = "";
      var contextref = "";
      var baseref = "";
      var sameBaseRef = true;

      if (current["firstAnchor"]) {
        name = current["firstAnchor"]["name"];
        contextref = current["firstAnchor"]["contextRef"];
        baseref = current["firstAnchor"]["baseRef"];
        if (current["firstAnchor"]["baseRef"]) {
          sameBaseRef =
            HelpersUrl.getHTMLFileName === current["firstAnchor"]["baseRef"];
        }
      } else if (current["uniqueAnchor"]) {
        name = current["uniqueAnchor"]["name"];
        contextref = current["uniqueAnchor"]["contextRef"];
        baseref = current["uniqueAnchor"]["baseRef"];
        if (current["uniqueAnchor"]["baseRef"]) {
          sameBaseRef =
            HelpersUrl.getHTMLFileName === current["uniqueAnchor"]["baseRef"];
        }
      }
      var list = document.createElement("li");
      list.setAttribute("name", name);
      list.setAttribute("contextref", contextref);
      list.classList.add("reboot");
      list.classList.add("click");
      list.classList.add("list-group-item");
      list.classList.add("list-group-item-action");
      list.classList.add("d-flex");
      list.classList.add("align-items-center");
      list.addEventListener("click", function () {
        // eslint-disable-next-line no-invalid-this
        Sections.clickEvent(event, this);
      });
      list.addEventListener("onkeyup", function () {
        // eslint-disable-next-line no-invalid-this
        Sections.clickEvent(event, this);
      });
      list.setAttribute("tabindex", "2");

      var text = document.createTextNode(current["shortName"]);

      if (!sameBaseRef) {
        list.setAttribute("baseref", baseref);
        var icon = document.createElement("i");
        icon.classList.add("fas");
        icon.classList.add("fa-external-link-alt");
        icon.classList.add("mr-3");
        list.appendChild(icon);
      }
      list.appendChild(text);

      listGroup.appendChild(list);
    });
    collapseContainer.appendChild(listGroup);
    card.appendChild(collapseContainer);
  },

  filterGroupType: function (groupType) {
    var discoveredGroupType = FiltersReports.getReportsByGroupType(groupType);

    var discoveredGroupTypeArray =
      Array.prototype.slice.call(discoveredGroupType);
    // we sort by Long Name to put it in the correct order.
    discoveredGroupTypeArray.sort(function (first, second) {
      return first["longName"].localeCompare(second["longName"]);
    });

    return discoveredGroupTypeArray;
  },

  captureChildCollapse: function (event, groupType) {
    var idToPopulate = event.getAttribute("data-target").substring(1);
    if (document.getElementById(idToPopulate).classList.contains("show")) {
      Sections.currentlyOpenChildMenu = {};
    } else {
      Sections.currentlyOpenChildMenu = {
        id: idToPopulate,
        group: groupType
      };
    }
  },

  setSelectedAttributes: function (element) {
    var selected = document
      .getElementById("tagged-sections")
      .querySelectorAll("[selected-taxonomy]");
    var selectedArray = Array.prototype.slice.call(selected);
    selectedArray.forEach(function (current) {
      current.setAttribute("selected-taxonomy", false);
    });
    element.setAttribute("selected-taxonomy", true);
  }
};
