/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

"use strict";

var Pagination = {
  init: function (
    paginaitonContent,
    selectorForPaginationControls,
    selectorForPaginationContent,
    modalAction
  ) {
    Pagination.reset();
    Pagination.getModalAction = modalAction;
    Pagination.getPaginationControlsSelector = selectorForPaginationControls;
    Pagination.getPaginationSelector = selectorForPaginationContent;
    Pagination.setArray(paginaitonContent);
    Pagination.getCurrentPage = 1;
    Pagination.getTotalPages = Math.ceil(
      Pagination.getArray.length / Constants.getPaginationPerPage
    );
    Pagination.getPaginationTemplate(Pagination.getCurrentPage);

    Pagination.setPageSelect();
  },

  reset: function () {
    Pagination.getModalAction = false;
    Pagination.setArray([]);
    Pagination.getPaginationControlsSelector = "";
    Pagination.getPaginationControlsSelector = "";
    Pagination.getPaginationSelector = "";
    Pagination.getCurrentPage = 1;
    Pagination.getTotalPages = 0;
  },

  getModalAction: false,

  getArray: [],

  setArray: function (input) {
    Pagination.getArray = input;
  },

  getPaginationControlsSelector: "",

  getPaginationSelector: "",

  getCurrentPage: 1,

  getTotalPages: 0,

  getPaginationTemplate: function (currentPage) {
    while (
      document.querySelector(Pagination.getPaginationControlsSelector)
        .firstChild
    ) {
      document
        .querySelector(Pagination.getPaginationControlsSelector)
        .firstChild.remove();
    }

    var divElement = document.createElement("div");
    divElement.setAttribute(
      "class",
      "w-100 d-flex justify-content-between py-2 px-1"
    );
    divElement.appendChild(Pagination.getPrevNextControls());
    divElement.appendChild(Pagination.getPaginationInfo());
    divElement.appendChild(Pagination.getPageControls());
    document
      .querySelector(Pagination.getPaginationControlsSelector)
      .appendChild(divElement);

    var elementToReturn = document.createDocumentFragment();
    var beginAt = (currentPage - 1) * Constants.getPaginationPerPage;
    var endAt = beginAt + Constants.getPaginationPerPage;

    var arrayForPage = Pagination.getArray.slice(beginAt, endAt);
    arrayForPage.forEach(function (current) {
      elementToReturn.appendChild(
        TaxonomiesGeneral.getTaxonomyListTemplate(
          current,
          Pagination.getModalAction
        )
      );
    });
    while (
      document.querySelector(Pagination.getPaginationSelector).firstChild
    ) {
      document
        .querySelector(Pagination.getPaginationSelector)
        .firstChild.remove();
    }

    document
      .querySelector(Pagination.getPaginationSelector)
      .setAttribute("style", "height: calc(100vh - 190px);");

    document
      .querySelector(Pagination.getPaginationSelector)
      .appendChild(elementToReturn);
    Pagination.setPageSelect();
  },

  firstPage: function () {
    Pagination.getCurrentPage = 1;
    Pagination.getPaginationTemplate(Pagination.getCurrentPage);
  },

  lastPage: function () {
    Pagination.getCurrentPage = Pagination.getTotalPages;
    Pagination.getPaginationTemplate(Pagination.getCurrentPage);
  },

  previousPage: function () {
    Pagination.getCurrentPage = Pagination.getCurrentPage - 1;
    Pagination.getPaginationTemplate(Pagination.getCurrentPage);
  },

  nextPage: function () {
    Pagination.getCurrentPage = Pagination.getCurrentPage + 1;
    Pagination.getPaginationTemplate(Pagination.getCurrentPage);
  },

  previousTaxonomy: function (event, element, trueIfHighlightLast) {
    var beginAt =
      (Pagination.getCurrentPage - 1) * Constants.getPaginationPerPage;
    var endAt = beginAt + Constants.getPaginationPerPage;

    var currentTaxonomies = Pagination.getArray.slice(beginAt, endAt);

    var selectedTaxonomy = currentTaxonomies
      .map(function (current, index) {
        var element = TaxonomiesGeneral.getMenuTaxonomyByDataID(current);
        if (element && element.getAttribute("selected-taxonomy") === "true") {
          return index;
        }
      })
      .filter(function (element) {
        return element >= 0;
      });

    if (selectedTaxonomy.length === 0) {
      if (trueIfHighlightLast) {
        var element = TaxonomiesGeneral.getMenuTaxonomyByDataID(
          currentTaxonomies[currentTaxonomies.length - 1]
        );
        TaxonomiesGeneral.goTo(event, element, true);
      } else {
        var element = TaxonomiesGeneral.getMenuTaxonomyByDataID(
          currentTaxonomies[0]
        );
        TaxonomiesGeneral.goTo(event, element, true);
      }
    } else {
      if (selectedTaxonomy[0] - 1 < 0) {
        if (Pagination.getCurrentPage - 1 > 0) {
          Pagination.previousPage();
          Pagination.previousTaxonomy(event, element, true);
        }
      } else {
        var element = TaxonomiesGeneral.getMenuTaxonomyByDataID(
          currentTaxonomies[selectedTaxonomy[0] - 1]
        );
        TaxonomiesGeneral.goTo(event, element, true);
      }
    }
  },

  nextTaxonomy: function (event, element) {
    var beginAt =
      (Pagination.getCurrentPage - 1) * Constants.getPaginationPerPage;
    var endAt = beginAt + Constants.getPaginationPerPage;
    var currentTaxonomies = Pagination.getArray.slice(beginAt, endAt);
    var selectedTaxonomy = currentTaxonomies
      .map(function (current, index) {
        var element = TaxonomiesGeneral.getMenuTaxonomyByDataID(current);
        if (element && element.getAttribute("selected-taxonomy") === "true") {
          return index;
        }
      })
      .filter(function (element) {
        return element >= 0;
      });
    if (selectedTaxonomy.length === 0) {
      var element = TaxonomiesGeneral.getMenuTaxonomyByDataID(
        currentTaxonomies[0]
      );
      TaxonomiesGeneral.goTo(event, element, true);
    } else {
      if (selectedTaxonomy[0] + 1 >= currentTaxonomies.length) {
        if (Pagination.getCurrentPage - 1 !== Pagination.getTotalPages - 1) {
          Pagination.nextPage();
          Pagination.nextTaxonomy(event, element);
        }
      } else {
        var element = TaxonomiesGeneral.getMenuTaxonomyByDataID(
          currentTaxonomies[selectedTaxonomy[0] + 1]
        );
        TaxonomiesGeneral.goTo(event, element, true);
      }
    }
  },

  getPrevNextControls: function () {
    var elementToReturn = document.createDocumentFragment();

    var divElement = document.createElement("div");


    var ulElement = document.createElement("ul");
    ulElement.setAttribute(
      "class",
      "pagination pagination-sm mb-0 mt-0"
    );

    var previousTaxonomyLiElement = document.createElement("li");
    previousTaxonomyLiElement.setAttribute("class", "page-item");

    var previousTaxonomyAElement = document.createElement("a");
    previousTaxonomyAElement.setAttribute(
      "class",
      "page-link no-trans text-body"
    );
    previousTaxonomyAElement.setAttribute("href", "#");
    previousTaxonomyAElement.setAttribute("tabindex", 13);
    previousTaxonomyAElement.addEventListener("click", function (e) {
      Pagination.previousTaxonomy(e, previousTaxonomyAElement);
    });

    var previousTaxonomyContent = document.createTextNode("Prev");

    previousTaxonomyAElement.appendChild(previousTaxonomyContent);
    previousTaxonomyLiElement.appendChild(previousTaxonomyAElement);
    ulElement.appendChild(previousTaxonomyLiElement);

    var nextTaxonomyLiElement = document.createElement("li");
    nextTaxonomyLiElement.setAttribute("class", "page-item");

    var nextTaxonomyAElement = document.createElement("a");
    nextTaxonomyAElement.setAttribute("class", "page-link no-trans text-body");
    nextTaxonomyAElement.setAttribute("href", "#");
    nextTaxonomyAElement.setAttribute("tabindex", 13);
    nextTaxonomyAElement.addEventListener("click", function (e) {
      Pagination.nextTaxonomy(e, nextTaxonomyAElement);
    });

    var nextTaxonomyContent = document.createTextNode("Next");

    nextTaxonomyAElement.appendChild(nextTaxonomyContent);
    nextTaxonomyLiElement.appendChild(nextTaxonomyAElement);
    ulElement.appendChild(nextTaxonomyLiElement);
    divElement.appendChild(ulElement);

    elementToReturn.appendChild(divElement);

    return elementToReturn;
  },

  // Page x of y
  getPaginationInfo: function () {
    var elementToReturn = document.createDocumentFragment();

    var paginationInfoDivElement = document.createElement("div");
    paginationInfoDivElement.setAttribute("class", "pagination-info text-body");

    var paginationInfoDivContent = document.createTextNode(
      Pagination.getCurrentPage + " of " + Pagination.getTotalPages
    );
    paginationInfoDivElement.appendChild(paginationInfoDivContent);

    elementToReturn.appendChild(paginationInfoDivElement);

    return elementToReturn;
  },

  getPageControls: function () {
    var firstPage = Pagination.getCurrentPage === 1 ? "disabled" : "";
    var previousPage = Pagination.getCurrentPage - 1 <= 0 ? "disabled" : "";
    var nextPage =
      Pagination.getCurrentPage + 1 > Pagination.getTotalPages
        ? "disabled"
        : "";
    var lastPage =
      Pagination.getCurrentPage === Pagination.getTotalPages ? "disabled" : "";

    var elementToReturn = document.createDocumentFragment();

    var navElement = document.createElement("nav");


    var ulElement = document.createElement("ul");
    ulElement.setAttribute(
      "class",
      "pagination pagination-sm mb-0 mt-0"
    );

    var firstPageLiElement = document.createElement("li");
    firstPageLiElement.setAttribute("class", "page-item " + firstPage);

    var firstPageAElement = document.createElement("a");
    firstPageAElement.setAttribute("class", "page-link no-trans text-body");
    firstPageAElement.setAttribute("href", "#");
    firstPageAElement.setAttribute("tabindex", 13);
    firstPageAElement.addEventListener("click", function () {
      Pagination.firstPage();
    });

    var firstPageContent = document.createElement("i");
    firstPageContent.setAttribute("class", "fas fa-lg fa-angle-double-left");

    firstPageAElement.appendChild(firstPageContent);
    firstPageLiElement.appendChild(firstPageAElement);
    ulElement.appendChild(firstPageLiElement);

    var previousPageLiElement = document.createElement("li");
    previousPageLiElement.setAttribute(
      "class",
      "page-item " + previousPage
    );

    var previousPageAElement = document.createElement("a");
    previousPageAElement.setAttribute("class", "page-link no-trans text-body");
    previousPageAElement.setAttribute("href", "#");
    previousPageAElement.setAttribute("tabindex", 13);
    previousPageAElement.addEventListener("click", function () {
      Pagination.previousPage();
    });

    var previousPageContent = document.createElement("i");
    previousPageContent.setAttribute("class", "fas fa-lg fa-angle-left");

    previousPageAElement.appendChild(previousPageContent);
    previousPageLiElement.appendChild(previousPageAElement);
    ulElement.appendChild(previousPageLiElement);

    var nextPageLiElement = document.createElement("li");
    nextPageLiElement.setAttribute("class", "page-item " + nextPage);

    var nextPageAElement = document.createElement("a");
    nextPageAElement.setAttribute("class", "page-link no-trans text-body");
    nextPageAElement.setAttribute("href", "#");
    nextPageAElement.setAttribute("tabindex", 13);
    nextPageAElement.addEventListener("click", function () {
      Pagination.nextPage();
    });

    var nextPageContent = document.createElement("i");
    nextPageContent.setAttribute("class", "fas fa-lg fa-angle-right");

    nextPageAElement.appendChild(nextPageContent);
    nextPageLiElement.appendChild(nextPageAElement);
    ulElement.appendChild(nextPageLiElement);

    var lastPageLiElement = document.createElement("li");
    lastPageLiElement.setAttribute("class", "page-item " + lastPage);

    var lastPageAElement = document.createElement("a");
    lastPageAElement.setAttribute("class", "page-link no-trans text-body");
    lastPageAElement.setAttribute("href", "#");
    lastPageAElement.setAttribute("tabindex", 13);
    lastPageAElement.addEventListener("click", function () {
      Pagination.lastPage();
    });

    var lastPageContent = document.createElement("i");
    lastPageContent.setAttribute(
      "class",
      "fas fa-lg fa-angle-double-right"
    );

    lastPageAElement.appendChild(lastPageContent);
    lastPageLiElement.appendChild(lastPageAElement);
    ulElement.appendChild(lastPageLiElement);

    navElement.appendChild(ulElement);
    elementToReturn.appendChild(navElement);
    return elementToReturn;
  },

  getControlsTemplate: function () {
    var firstPage = Pagination.getCurrentPage === 1 ? "disabled" : "";
    var previousPage = Pagination.getCurrentPage - 1 <= 0 ? "disabled" : "";
    var nextPage =
      Pagination.getCurrentPage + 1 > Pagination.getTotalPages
        ? "disabled"
        : "";
    var lastPage =
      Pagination.getCurrentPage === Pagination.getTotalPages ? "disabled" : "";

    var elementToReturn = document.createDocumentFragment();

    Pagination.setPageSelect();

    var divElement = document.createElement("div");
    divElement.setAttribute(
      "class",
      "w-100 d-flex justify-content-between py-2 px-1"
    );

    var divNestedElement = document.createElement("div");


    var divNestedElement = document.createElement("div");


    var navElement = document.createElement("nav");


    var ulElement = document.createElement("ul");
    ulElement.setAttribute("class", "pagination pagination-sm mb-0");

    var firstPageLiElement = document.createElement("li");
    firstPageLiElement.setAttribute("class", "page-item " + firstPage);

    var firstPageAElement = document.createElement("a");
    firstPageAElement.setAttribute("class", "page-link no-trans text-body");
    firstPageAElement.setAttribute("href", "#");
    firstPageAElement.setAttribute("tabindex", 13);
    firstPageAElement.addEventListener("click", function () {
      Pagination.firstPage();
    });

    var firstPageContent = document.createElement("i");
    firstPageContent.setAttribute(
      "class",
      "fas fa-lg fa-angle-double-left"
    );

    firstPageAElement.appendChild(firstPageContent);
    firstPageLiElement.appendChild(firstPageAElement);
    ulElement.appendChild(firstPageLiElement);

    var previousPageLiElement = document.createElement("li");
    previousPageLiElement.setAttribute(
      "class",
      "page-item " + previousPage
    );

    var previousPageAElement = document.createElement("a");
    previousPageAElement.setAttribute("class", "page-link no-trans text-body");
    previousPageAElement.setAttribute("href", "#");
    previousPageAElement.setAttribute("tabindex", 13);
    previousPageAElement.addEventListener("click", function () {
      Pagination.previousPage();
    });

    var previousPageContent = document.createElement("i");
    previousPageContent.setAttribute("class", "fas fa-lg fa-angle-left");

    previousPageAElement.appendChild(previousPageContent);
    previousPageLiElement.appendChild(previousPageAElement);
    ulElement.appendChild(previousPageLiElement);

    var nextPageLiElement = document.createElement("li");
    nextPageLiElement.setAttribute("class", "page-item " + nextPage);

    var nextPageAElement = document.createElement("a");
    nextPageAElement.setAttribute("class", "page-link no-trans text-body");
    nextPageAElement.setAttribute("href", "#");
    nextPageAElement.setAttribute("tabindex", 13);
    nextPageAElement.addEventListener("click", function () {
      Pagination.nextPage();
    });

    var nextPageContent = document.createElement("i");
    nextPageContent.setAttribute("class", "fas fa-lg fa-angle-right");

    nextPageAElement.appendChild(nextPageContent);
    nextPageLiElement.appendChild(nextPageAElement);
    ulElement.appendChild(nextPageLiElement);

    var lastPageLiElement = document.createElement("li");
    lastPageLiElement.setAttribute("class", "page-item " + lastPage);

    var lastPageAElement = document.createElement("a");
    lastPageAElement.setAttribute("class", "page-link no-trans text-body");
    lastPageAElement.setAttribute("href", "#");
    lastPageAElement.setAttribute("tabindex", 13);
    lastPageAElement.addEventListener("click", function () {
      Pagination.lastPage();
    });

    var lastPageContent = document.createElement("i");
    lastPageContent.setAttribute(
      "class",
      "fas fa-lg fa-angle-double-right"
    );

    lastPageAElement.appendChild(lastPageContent);
    lastPageLiElement.appendChild(lastPageAElement);
    ulElement.appendChild(lastPageLiElement);

    divNestedElement.appendChild(ulElement);
    divElement.appendChild(divNestedElement);

    elementToReturn.appendChild(divElement);

    return elementToReturn;
  },

  // page select dropdown
  setPageSelect: function () {
    var pageSelectHTML = '<option value="null">Select a Page</option>';

    for (var i = 0; i < Pagination.getTotalPages; i++) {
      if (i + 1 === Pagination.getCurrentPage) {
        pageSelectHTML +=
          '<option selected value="' +
          (i + 1) +
          '">Page ' +
          (i + 1) +
          "</option>";
      } else {
        pageSelectHTML +=
          '<option value="' +
          (i + 1) +
          '">Page ' +
          (i + 1) +
          "</option>";
      }
    }
    document.getElementById("taxonomies-menu-page-select").innerHTML =
      pageSelectHTML;
  },

  goToPage: function (event, element) {
    if (element && element.value && !isNaN(element.value)) {
      Pagination.getCurrentPage = parseInt(element.value);
      Pagination.getPaginationTemplate(Pagination.getCurrentPage);
    }
  },

  goToTaxonomy: function (event, element) {
    if (event.keyCode && !(event.keyCode === 13 || event.keyCode === 32)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();

    if (element && element.hasAttribute("data-id")) {
      if (MenusState.openMenu === "taxonomies-menu") {
        Pagination.findTaxonomyAndGoTo(element.getAttribute("data-id"));
      } else {
        MenusState.toggle("taxonomies-menu", true, function (openMenu) {
          if (openMenu) {
            document.getElementById("taxonomies-menu").addEventListener(
              "transitionend",
              function (event) {
                // our menu is now open
                // we populate the menu with associated data
                setTimeout(function () {
                  TaxonomiesMenu.prepareForPagination();
                  Pagination.findTaxonomyAndGoTo(
                    element.getAttribute("data-id")
                  );
                });
              },
              {
                once: true
              }
            );
          }
        });
      }
    }
  },

  findTaxonomyAndGoTo: function (elementID) {
    var index = -1;
    for (var i = 0; i < Pagination.getArray.length; i++) {
      if (Pagination.getArray[i] === elementID) {
        index = i;
        break;
      }
    }
    if (index >= 0) {
      var pageToGoTo = Math.ceil((index + 1) / Constants.getPaginationPerPage);
      Pagination.getCurrentPage = pageToGoTo;
      Pagination.getPaginationTemplate(pageToGoTo);
      Pagination.scrollToSelectedTaxonomy(index);
    } else {
      ErrorsMinor.factNotActive();
    }
  },

  scrollToSelectedTaxonomy: function (index) {
    var elementToScrollTo = document
      .getElementById("taxonomies-menu-list-pagination")
      .querySelector('[selected-taxonomy="true"]');
    if (elementToScrollTo) {
      elementToScrollTo.scrollIntoView({
        block: Constants.scrollPosition
      });
    }
  }
};
