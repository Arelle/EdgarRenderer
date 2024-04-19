/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

import { Modals } from "./modals";
import { ErrorsMinor } from "../errors/minor";
import { FactPages } from "./fact-pages";
import { FactMap } from "../facts/map";

export const ModalsContinuedAt = {

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

  dynamicallyFindContextRefForModal: (element: HTMLElement) => {
    if (element && element.hasAttribute("contextref")) {
      ModalsContinuedAt.setAllElements(element);
    } else if (element && element.hasAttribute("id")) {
      ModalsContinuedAt.dynamicallyFindContextRefForModal(
        document.getElementById("dynamic-xbrl-form")?.querySelector('[continuedat="' + element.getAttribute("id") + '"]') as HTMLElement
      );
    } else {
      ErrorsMinor.unknownError();
    }
  },

  setAllElements: (element: HTMLElement) => {
    // we always start at the top-level element
    if (element) {
      element.setAttribute("selected-fact", "true");
      ModalsContinuedAt.getAllElements.push(element);

      if (element.hasAttribute("continuedat")) {
        ModalsContinuedAt.setAllElements(
          document
            .getElementById("dynamic-xbrl-form")?.querySelector('[id="' + element.getAttribute("continuedat") + '"]') as HTMLElement
        );
      }
    }
  },

  carouselData: (element: Array<HTMLElement>) => {

    Modals.renderCarouselIndicators(
      "fact-modal-carousel",
      "fact-modal-carousel-indicators",
      ModalsContinuedAt.carouselInformation
    );

    const factInfo = FactMap.getByID(element[0].getAttribute('id') as string);
    // we now render one slide at a time!
    FactPages.firstPage(factInfo, 'fact-modal-carousel-page-1');
    FactPages.secondPage(factInfo, 'fact-modal-carousel-page-2');
    FactPages.thirdPage(factInfo, 'fact-modal-carousel-page-3');
    FactPages.fourthPage(factInfo, 'fact-modal-carousel-page-4');


  }
};
