/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

"use strict";

var ModalsContinuedAt = {
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

  getAllElements: [],

  dynamicallyFindContextRefForModal: function (element) {
    if (element && element.hasAttribute("contextref")) {
      ModalsContinuedAt.setAllElements(element);
    } else if (element && element.hasAttribute("id")) {
      ModalsContinuedAt.dynamicallyFindContextRefForModal(
        document
          .getElementById("dynamic-xbrl-form")
          .querySelector('[continuedat="' + element.getAttribute("id") + '"]')
      );
    } else {
      ErrorsMinor.unknownError();
    }
  },

  setAllElements: function (element) {
    // we always start at the top-level element
    if (element) {
      element.setAttribute("selected-taxonomy", true);
      ModalsContinuedAt.getAllElements.push(element);

      if (element.hasAttribute("continuedat")) {
        ModalsContinuedAt.setAllElements(
          document
            .getElementById("dynamic-xbrl-form")
            .querySelector('[id="' + element.getAttribute("continuedat") + '"]')
        );
      }
    }
  },

  clickEvent: function (event, element) {
    var defaultTab = ModalsCommon.currentDetailTab;
    if (event.keyCode && !(event.keyCode === 13 || event.keyCode === 32)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    ModalsContinuedAt.getAllElements = [];

    Modals.close(event, element);

    document.getElementById("taxonomy-modal").classList.remove("d-none");

    ModalsContinuedAt.dynamicallyFindContextRefForModal(element);

    if (
      ModalsContinuedAt.getAllElements[0] &&
      ModalsContinuedAt.getAllElements[0].getAttribute("id")
    ) {
      TaxonomiesGeneral.selectedTaxonomy(ModalsContinuedAt.getAllElements);

      document.getElementById("taxonomy-modal-drag").focus();
      // we add draggable
      Modals.initDrag(document.getElementById("taxonomy-modal-drag"));
      ModalsContinuedAt.carouselData();

      document.getElementById("taxonomy-modal-title").innerText =
        ModalsContinuedAt.carouselInformation[0]["dialog-title"];

      document.getElementById("taxonomy-modal-subtitle").innerHTML =
        FiltersName.getLabel(
          ModalsContinuedAt.getAllElements[0].getAttribute("name")
        );

      $("#taxonomy-modal-carousel").carousel(0);

      window.addEventListener("keyup", ModalsCommon.keyboardEvents);

      $("#taxonomy-modal-carousel").on("slide.bs.carousel", function (event) {
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
          ModalsContinuedAt.carouselInformation[event["to"]]["dialog-title"];
        ModalsCommon.currentDetailTab = newActiveIndicator;
      });
      $("#taxonomy-modal-carousel").carousel(defaultTab);
      ModalsCommon.currentDetailTab = defaultTab;
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
    } else {
      var elementToReturn = document.createDocumentFragment();
      ModalsContinuedAt.getAllElements = element;
    }

    TaxonomyPages.firstPage(
      ModalsContinuedAt.getAllElements,
      function (page1Html) {
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

        TaxonomyPages.secondPage(
          ModalsContinuedAt.getAllElements[0],
          function (page2Html) {
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
                document.getElementById("taxonomy-modal-carousel-page-2")
                  .firstChild
              ) {
                document
                  .getElementById("taxonomy-modal-carousel-page-2")
                  .firstChild.remove();
              }

              document
                .getElementById("taxonomy-modal-carousel-page-2")
                .appendChild(page2Html);
            }

            TaxonomyPages.thirdPage(
              ModalsContinuedAt.getAllElements[0],
              function (page3Html) {
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

                TaxonomyPages.fourthPage(
                  ModalsContinuedAt.getAllElements[0],
                  function (page4Html) {
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
                        document.getElementById(
                          "taxonomy-modal-carousel-page-4"
                        ).firstChild
                      ) {
                        document
                          .getElementById("taxonomy-modal-carousel-page-4")
                          .firstChild.remove();
                      }

                      document
                        .getElementById("taxonomy-modal-carousel-page-4")
                        .appendChild(page4Html);
                    }
                  }
                );
              }
            );
          }
        );
      }
    );
    return elementToReturn;
  }
};
