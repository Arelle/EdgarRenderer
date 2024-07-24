/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

"use strict";

var ModalsCommon = {
  currentSlide: 0,
  currentDetailTab: 0,

  carouselInformation: [
    {
      "dialog-title": "Attributes"
    },
    {
      "dialog-title": "Labels"
    },
    {
      "dialog-title": "References"
    },
    {
      "dialog-title": "Calculation"
    }
  ],

  getAttributes: null,

  clickEvent: function (event, element) {
    var defaultTab = ModalsCommon.currentDetailTab;
    if (event.keyCode && !(event.keyCode === 13 || event.keyCode === 32)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    Modals.close(event, element);

    document.getElementById("taxonomy-modal").classList.remove("d-none");

    TaxonomiesGeneral.selectedTaxonomy(element);

    document.getElementById("taxonomy-modal-drag").focus();
    // we add draggable
    Modals.initDrag(document.getElementById("taxonomy-modal-drag"));

    ModalsCommon.carouselData(element);

    document.getElementById("taxonomy-modal-title").innerText =
      ModalsCommon.carouselInformation[0]["dialog-title"];

    document.getElementById("taxonomy-modal-subtitle").innerHTML =
      FiltersName.getLabel(element.getAttribute("name"), true);

    $("#taxonomy-modal-carousel").carousel(0);

    window.addEventListener("keyup", ModalsCommon.keyboardEvents);

    $("#taxonomy-modal-carousel").on("slide.bs.carousel", function (event) {
      ModalsCommon.currentSlide = event["to"] + 1;
      var previousActiveIndicator = event["from"];
      var newActiveIndicator = event["to"];
      document
        .getElementById("taxonomy-modal-carousel-indicators")
        .querySelector('[data-bs-slide-to="' + previousActiveIndicator + '"]')
        .classList.remove("active");
      document
        .getElementById("taxonomy-modal-carousel-indicators")
        .querySelector('[data-bs-slide-to="' + newActiveIndicator + '"]')
        .classList.add("active");
      document.getElementById("taxonomy-modal-title").innerText =
        ModalsCommon.carouselInformation[event["to"]]["dialog-title"];
      ModalsCommon.currentDetailTab = newActiveIndicator;
    });
    $("#taxonomy-modal-carousel").carousel(defaultTab);
    ModalsCommon.currentDetailTab = defaultTab;
  },

  focusOnContent: function () {
    document
      .getElementById(
        "taxonomy-modal-carousel-page-" + ModalsCommon.currentSlide
      )
      .focus();
  },

  keyboardEvents: function (event) {
    var key = event.keyCode ? event.keyCode : event.which;
    if (key === 49 || key === 97) {
      $("#taxonomy-modal-carousel").carousel(0);
      ModalsCommon.focusOnContent();
      return false;
    }
    if (key === 50 || key === 98) {
      $("#taxonomy-modal-carousel").carousel(1);
      ModalsCommon.focusOnContent();
      return false;
    }
    if (key === 51 || key === 99) {
      $("#taxonomy-modal-carousel").carousel(2);
      ModalsCommon.focusOnContent();
      return false;
    }
    if (key === 52 || key === 100) {
      $("#taxonomy-modal-carousel").carousel(3);
      ModalsCommon.focusOnContent();
      return false;
    }
    if (key === 37) {
      $("#taxonomy-modal-carousel").carousel("prev");
      ModalsCommon.focusOnContent();
      return false;
    }
    if (key === 39) {
      $("#taxonomy-modal-carousel").carousel("next");
      ModalsCommon.focusOnContent();
      return false;
    }
  },

  carouselData: function (element, returnElement) {
    returnElement = returnElement || false;

    if (!returnElement) {
      Modals.renderCarouselIndicators(
        "taxonomy-modal-carousel",
        "taxonomy-modal-carousel-indicators",
        ModalsContinuedAt.carouselInformation
      );
    }

    var elementToReturn = document.createDocumentFragment();

    TaxonomyPages.firstPage(element, function (page1Html) {
      if (returnElement) {
        var divElement = document.createElement("div");
        divElement.setAttribute(
          "class",
          "carousel-item table-responsive active"
        );

        var tableElement = document.createElement("table");
        tableElement.setAttribute(
          "class",
          "table table-striped table-sm"
        );
        tableElement.appendChild(page1Html);
        divElement.appendChild(tableElement);
        elementToReturn.appendChild(divElement);
      } else {
        while (
          document.getElementById("taxonomy-modal-carousel-page-1").firstChild
        ) {
          document
            .getElementById("taxonomy-modal-carousel-page-1")
            .firstChild.remove();
        }
        document
          .getElementById("taxonomy-modal-carousel-page-1")
          .appendChild(page1Html);
      }
      TaxonomyPages.secondPage(element, function (page2Html) {
        if (returnElement) {
          var divElement = document.createElement("div");
          divElement.setAttribute(
            "class",
            "carousel-item table-responsive"
          );

          var tableElement = document.createElement("table");
          tableElement.setAttribute(
            "class",
            "table table-striped table-sm"
          );

          tableElement.appendChild(page2Html);
          divElement.appendChild(tableElement);
          elementToReturn.appendChild(divElement);
        } else {
          while (
            document.getElementById("taxonomy-modal-carousel-page-2").firstChild
          ) {
            document
              .getElementById("taxonomy-modal-carousel-page-2")
              .firstChild.remove();
          }
          document
            .getElementById("taxonomy-modal-carousel-page-2")
            .appendChild(page2Html);
        }
        TaxonomyPages.thirdPage(element, function (page3Html) {
          if (returnElement) {
            var divElement = document.createElement("div");
            divElement.setAttribute(
              "class",
              "carousel-item table-responsive"
            );

            var tableElement = document.createElement("table");
            tableElement.setAttribute(
              "class",
              "table table-striped table-sm"
            );

            tableElement.appendChild(page3Html);
            divElement.appendChild(tableElement);
            elementToReturn.appendChild(divElement);
          } else {
            while (
              document.getElementById("taxonomy-modal-carousel-page-3")
                .firstChild
            ) {
              document
                .getElementById("taxonomy-modal-carousel-page-3")
                .firstChild.remove();
            }
            document
              .getElementById("taxonomy-modal-carousel-page-3")
              .appendChild(page3Html);
          }
          TaxonomyPages.fourthPage(element, function (page4Html) {
            if (returnElement) {
              var divElement = document.createElement("div");
              divElement.setAttribute(
                "class",
                "carousel-item table-responsive"
              );

              var tableElement = document.createElement("table");
              tableElement.setAttribute(
                "class",
                "table table-striped table-sm"
              );

              tableElement.appendChild(page4Html);
              divElement.appendChild(tableElement);
              elementToReturn.appendChild(divElement);
            } else {
              while (
                document.getElementById("taxonomy-modal-carousel-page-4")
                  .firstChild
              ) {
                document
                  .getElementById("taxonomy-modal-carousel-page-4")
                  .firstChild.remove();
              }
              document
                .getElementById("taxonomy-modal-carousel-page-4")
                .appendChild(page4Html);
            }
          });
        });
      });
    });
    return elementToReturn;
  }
};
