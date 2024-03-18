/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */
import * as bootstrap from "bootstrap";
import { Modals } from "./modals";
import { ModalsCommon } from "./common";
import { FactPages } from "./fact-pages";
import { Constants } from "../constants/constants";
import { FactMap } from "../facts/map";
import { ConstantsFunctions } from "../constants/functions";
import { Pagination } from "../pagination/pagination";

export const ModalsNested = {

  currentSlide: 0,

  carouselInformation: [{
    'dialog-title': 'Attributes'
  }, {
    'dialog-title': 'Labels'
  }, {
    'dialog-title': 'References'
  }, {
    'dialog-title': 'Calculation'
  }],

  getAllElementIDs: [],
  // const nestedFacts = Array.from(element.querySelectorAll('[id^="fact-identifier-"]'));
  // nestedFacts.unshift(element);
  dynamicallyFindContinuedFacts: (element: HTMLElement, elementsInArray: Array<HTMLElement>) => {
    if (element) {
      elementsInArray.push(element);
    }
    if (element && element.hasAttribute('continuedat')) {
      const continuedElement = document.getElementById('dynamic-xbrl-form')?.querySelector(
        '[id="' + element.getAttribute('continuedat') + '"]') as HTMLElement;
      return ModalsNested.dynamicallyFindContinuedFacts(continuedElement, elementsInArray);

    }
    return elementsInArray;

  },

  getAllNestedFacts: (element: HTMLElement) => {
    ModalsNested.getAllElementIDs = Array.from(element.querySelectorAll('[id^="fact-identifier-"]'));
    ModalsNested.getAllElementIDs.unshift(element);
  },

  getElementById: (id: string) => {
    const element = document.getElementById('dynamic-xbrl-form')?.querySelector('[id="' + id + '"]');
    if (element && element.hasAttribute('continued-main-fact')
      && element.getAttribute('continued-main-fact') === 'true') {
      return ModalsNested.dynamicallyFindContinuedFacts(element as HTMLElement, []);
    }
    return element;

  },

  createLabelCarousel: () => {
    const titleCarousel = document.createDocumentFragment();
    const span = document.createElement('span');
    const dialogTitle = document.createTextNode(`1`);
    span.appendChild(dialogTitle);
    document.getElementById('nested-page')?.firstElementChild?.replaceWith(span);

    const span1 = document.createElement('span');
    const dialogTitle1 = document.createTextNode(ModalsNested.getAllElementIDs.length.toString());
    span1.appendChild(dialogTitle1);
    document.getElementById('nested-count')?.firstElementChild?.replaceWith(span1);
    ModalsNested.getAllElementIDs.forEach((current) => {
      const factID = current.getAttribute('continued-main-fact-id') ? current.getAttribute('continued-main-fact-id') : current.getAttribute('id');
      const factInfo = FactMap.getByID(factID);

      const nestedFactName = ConstantsFunctions.getFactLabel(factInfo.labels);

      const divTitleElement = document.createElement('div');
      divTitleElement.setAttribute('class', 'carousel-item');

      const divTitleNestedElement = document.createElement('div');
      divTitleNestedElement.setAttribute('class', 'carousel-content');

      const pTitleElement = document.createElement('p');
      pTitleElement.setAttribute('class', 'text-center font-weight-bold');
      const pTitleContent = document.createTextNode(nestedFactName as string);

      pTitleElement.appendChild(pTitleContent);
      divTitleNestedElement.appendChild(pTitleElement);
      divTitleElement.appendChild(divTitleNestedElement);
      titleCarousel.appendChild(divTitleElement);

    });

    document.getElementById('modal-fact-nested-label-carousel')?.appendChild(titleCarousel);

    document.getElementById('modal-fact-nested-label-carousel')?.querySelector('.carousel-item')?.classList
      .add('active');

  },

  createContentCarousel: (index: string | number) => {

    const element = ModalsNested.getElementById((ModalsNested.getAllElementIDs[index].id));
    ModalsNested.carouselData(element);
  },

  clickEvent: (event: MouseEvent | KeyboardEvent, element: HTMLElement) => {
    if (
      Object.prototype.hasOwnProperty.call(event, 'key') &&
      !((event as KeyboardEvent).key === 'Enter' || (event as KeyboardEvent).key === 'Space')
    ) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();

    document.getElementById('fact-nested-modal')?.classList.remove('d-none');

    document.getElementById('fact-nested-modal-drag')?.focus();
    // we empty the ID Array
    ModalsNested.getAllElementIDs = [];
    // we load the ID Array
    ModalsNested.getAllNestedFacts(element);

    ModalsNested.createLabelCarousel();

    ModalsNested.createContentCarousel(0);

    ModalsNested.listeners();

    document.getElementById('nested-fact-modal-jump')?.setAttribute('data-id', (ModalsNested.getAllElementIDs[0] as HTMLElement).id);

    Modals.renderCarouselIndicators('modal-fact-nested-content-carousel',
      'fact-nested-modal-carousel-indicators', ModalsNested.carouselInformation);


    new bootstrap.Carousel(document.getElementById('modal-nested-fact-labels') as HTMLElement, {});
    const thisLabelCarousel = document.getElementById('modal-nested-fact-labels');

    new bootstrap.Carousel(document.getElementById('modal-fact-nested-content-carousel') as HTMLElement, {});
    const thisContentCarousel = document.getElementById('modal-fact-nested-content-carousel');

    thisLabelCarousel?.addEventListener('slide.bs.carousel', (event) => {

      const span = document.createElement('span');
      const dialogTitle = document.createTextNode(event['to'] + 1);
      span.appendChild(dialogTitle);
      document.getElementById('nested-page')?.firstElementChild?.replaceWith(span);

      ModalsNested.currentSlide = ModalsCommon.currentDetailTab;

      // we add something...
      document.getElementById('nested-fact-modal-jump')?.setAttribute('data-id', ModalsNested.getAllElementIDs[event['to']].id);

      // we hide the copy & paste area
      document.getElementById('fact-nested-copy-paste')?.classList.add('d-none');

      let selectedElement = ModalsNested.getElementById((ModalsNested.getAllElementIDs[event['to']] as HTMLElement).id);

      if (selectedElement instanceof Array) {
        selectedElement = selectedElement[0];
      }

      selectedElement.scrollIntoView({
        'block': Constants.scrollPosition
      });

      ModalsNested.createContentCarousel(event['to']);

      bootstrap.Carousel.getInstance(document.getElementById('modal-fact-nested-content-carousel') as HTMLElement)?.to(ModalsNested.currentSlide);

      ModalsCommon.currentDetailTab = ModalsNested.currentSlide;
    });


    thisContentCarousel?.addEventListener('slide.bs.carousel', (event) => {

      ModalsNested.currentSlide = event['to'] + 1;
      const previousActiveIndicator = event['from'];
      const newActiveIndicator = event['to'];
      document.getElementById('fact-nested-modal-carousel-indicators')?.querySelector(
        '[data-bs-slide-to="' + previousActiveIndicator + '"]')?.classList.remove('active');
      document.getElementById('fact-nested-modal-carousel-indicators')?.querySelector(
        '[data-bs-slide-to="' + newActiveIndicator + '"]')?.classList.add('active');
      ModalsCommon.currentDetailTab = newActiveIndicator;
    });
    bootstrap.Carousel.getInstance(document.getElementById('modal-fact-nested-content-carousel') as HTMLElement)?.to(0);
    ModalsCommon.currentDetailTab = ModalsNested.currentSlide;
  },

  listeners: () => {
    const oldActions = document.querySelector('#fact-nested-modal .dialog-header-actions');
    const newActions = (oldActions as HTMLElement).cloneNode(true);
    oldActions?.parentNode?.replaceChild(newActions, oldActions);

    // we add draggable
    Modals.initDrag(document.getElementById('fact-nested-modal-drag') as HTMLElement);

    document.getElementById('nested-fact-modal-jump')?.addEventListener('click', (event: MouseEvent) => {
      Pagination.goToFact(event);
    });
    document.getElementById('nested-fact-modal-jump')?.addEventListener('keyup', (event: KeyboardEvent) => {
      Pagination.goToFact(event);
    });

    document.getElementById('fact-nested-modal-copy-content')?.addEventListener('click', (event: MouseEvent) => {
      Modals.copyContent(event, 'modal-fact-nested-content-carousel', 'fact-nested-copy-paste');
    });
    document.getElementById('fact-nested-modal-copy-content')?.addEventListener('keyup', (event: KeyboardEvent) => {
      Modals.copyContent(event, 'modal-fact-nested-content-carousel', 'fact-nested-copy-paste');
    });

    document.getElementById('fact-nested-modal-compress')?.addEventListener('click', (event: MouseEvent) => {
      Modals.expandToggle(event, 'fact-nested-modal', 'fact-nested-modal-expand', 'fact-nested-modal-compress');
    });
    document.getElementById('fact-nested-modal-compress')?.addEventListener('keyup', (event: KeyboardEvent) => {
      Modals.expandToggle(event, 'fact-nested-modal', 'fact-nested-modal-expand', 'fact-nested-modal-compress');
    });

    document.getElementById('fact-nested-modal-expand')?.addEventListener('click', (event: MouseEvent) => {
      Modals.expandToggle(event, 'fact-nested-modal', 'fact-nested-modal-expand', 'fact-nested-modal-compress');
    });
    document.getElementById('fact-nested-modal-expand')?.addEventListener('keyup', (event: KeyboardEvent) => {
      Modals.expandToggle(event, 'fact-nested-modal', 'fact-nested-modal-expand', 'fact-nested-modal-compress');
    });

    document.getElementById('fact-nested-modal-close')?.addEventListener('click', (event: MouseEvent) => {
      Modals.close(event);
    });
    document.getElementById('fact-nested-modal-close')?.addEventListener('keyup', (event: KeyboardEvent) => {
      Modals.close(event);
    });

    window.addEventListener("keyup", ModalsNested.keyboardEvents);
  },

  keyboardEvents: (event: KeyboardEvent) => {
    const thisCarousel = bootstrap.Carousel.getInstance(document.getElementById('modal-fact-nested-content-carousel') as HTMLElement);

    if (event.key === '1') {
      thisCarousel?.to(0);
      ModalsNested.focusOnContent();
      return false;
    }
    if (event.key === '2') {
      thisCarousel?.to(1);
      ModalsNested.focusOnContent();
      return false;
    }
    if (event.key === '3') {
      thisCarousel?.to(2);
      ModalsNested.focusOnContent();
      return false;
    }
    if (event.key === '4') {
      thisCarousel?.to(3);
      ModalsNested.focusOnContent();
      return false;
    }
    if (event.key === 'ArrowLeft') {
      thisCarousel?.prev();
      ModalsNested.focusOnContent();
      return false;
    }
    if (event.key === 'ArrowRight') {
      thisCarousel?.next();
      ModalsNested.focusOnContent();
      return false;
    }
  },

  focusOnContent: () => {
    document.getElementById(`modal-fact-nested-content-carousel-page-${ModalsNested.currentSlide}`)?.focus();
  },

  carouselData: (element: HTMLElement) => {
    let factID;
    if (Array.isArray(element)) {
      factID = element[0].getAttribute('continued-main-fact-id') ? element[0].getAttribute('continued-main-fact-id') : element[0].getAttribute('id');
    } else {
      factID = element.getAttribute('continued-main-fact-id') ? element.getAttribute('continued-main-fact-id') : element.getAttribute('id');
    }
    const factInfo = FactMap.getByID(factID as string);
    FactPages.firstPage(factInfo, 'modal-fact-nested-content-carousel-page-1');
    FactPages.secondPage(factInfo, 'modal-fact-nested-content-carousel-page-2');
    FactPages.thirdPage(factInfo, 'modal-fact-nested-content-carousel-page-3');
    FactPages.fourthPage(factInfo, 'modal-fact-nested-content-carousel-page-4');
    ConstantsFunctions.getCollapseToFactValue();

  },

  dynamicallyAddControls: () => {
    Modals.renderCarouselIndicators('modal-fact-nested-content-carousel',
      'fact-nested-modal-carousel-indicators', ModalsNested.carouselInformation);
  }
};
