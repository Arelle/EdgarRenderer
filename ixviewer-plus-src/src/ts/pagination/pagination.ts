/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

import * as bootstrap from "bootstrap";
import { Constants } from "../constants/constants";
import { ErrorsMinor } from "../errors/minor";
import { FactsGeneral } from "../facts/general";
import { ConstantsFunctions } from "../constants/functions";
import { SingleFact } from "../interface/fact";

export const Pagination = {

  init: (paginaitonContent: Array<string>, selectorForPaginationControls: string, selectorForPaginationContent: string, modalAction: boolean) => {
    Pagination.reset();
    Pagination.getModalAction = modalAction;
    Pagination.getPaginationControlsSelector = selectorForPaginationControls;
    Pagination.getPaginationSelector = selectorForPaginationContent;
    Pagination.setArray(paginaitonContent);
    Pagination.getCurrentPage = 1;
    Pagination.getTotalPages = Math.ceil(Pagination.getArray.length / Constants.getPaginationPerPage);
    Pagination.getPaginationTemplate(Pagination.getCurrentPage);
    Pagination.setPageSelect();
  },

  reset: () => {
    Pagination.getModalAction = false;
    Pagination.setArray([]);
    Pagination.getPaginationControlsSelector = '';
    Pagination.getPaginationControlsSelector = '';
    Pagination.getPaginationSelector = '';
    Pagination.getCurrentPage = 1;
    Pagination.getTotalPages = 0;
  },

  getModalAction: false,

  getArray: [],

  setArray: (input: never[]) => {
    Pagination.getArray = input;
  },

  getPaginationControlsSelector: '',

  getPaginationSelector: '',

  getCurrentPage: 1,

  getTotalPages: 0,

  getPaginationTemplate: (currentPage: number) => {

    while (document.querySelector(Pagination.getPaginationControlsSelector)?.firstChild) {
      document.querySelector(Pagination.getPaginationControlsSelector)?.firstChild?.remove();
    }

    const divElement = document.createElement('div');
    divElement.setAttribute('class', 'w-100 d-flex justify-content-between py-2 px-1');
    divElement.appendChild(Pagination.getPrevNextControls());
    divElement.appendChild(Pagination.getPaginationInfo());
    divElement.appendChild(Pagination.getPageControls());
    document.querySelector(Pagination.getPaginationControlsSelector)?.appendChild(divElement);

    const elementToReturn = document.createDocumentFragment();
    const beginAt = ((currentPage - 1) * Constants.getPaginationPerPage);
    const endAt = beginAt + Constants.getPaginationPerPage;

    const arrayForPage = Pagination.getArray.slice(beginAt, endAt);
    arrayForPage.forEach((current) => {
      elementToReturn.appendChild(FactsGeneral.getFactListTemplate(current));
    });

    while (document.querySelector(Pagination.getPaginationSelector)?.firstChild) {
      document.querySelector(Pagination.getPaginationSelector)?.firstChild?.remove();
    }

    document.querySelector(Pagination.getPaginationSelector)?.appendChild(elementToReturn);

    ConstantsFunctions.emptyHTMLByID(`facts-menu-page-select`);
    Pagination.setPageSelect();
  },

  firstPage: () => {

    Pagination.getCurrentPage = 1;
    Pagination.getPaginationTemplate(Pagination.getCurrentPage);
  },

  lastPage: () => {

    Pagination.getCurrentPage = Pagination.getTotalPages;
    Pagination.getPaginationTemplate(Pagination.getCurrentPage);
  },

  previousPage: () => {

    Pagination.getCurrentPage = Pagination.getCurrentPage - 1;
    Pagination.getPaginationTemplate(Pagination.getCurrentPage);
  },

  nextPage: () => {
    Pagination.getCurrentPage = Pagination.getCurrentPage + 1;
    Pagination.getPaginationTemplate(Pagination.getCurrentPage);
  },

  previousFact: (event: MouseEvent | KeyboardEvent, element: HTMLElement, trueIfHighlightLast: boolean) => {

    const beginAt = ((Pagination.getCurrentPage - 1) * Constants.getPaginationPerPage);
    const endAt = beginAt + Constants.getPaginationPerPage;

    const currentFacts = Pagination.getArray.slice(beginAt, endAt);

    const selectedFact = currentFacts.map((current, index) => {

      const element = FactsGeneral.getMenuFactByDataID(current);
      if (element && element.getAttribute('selected-fact') === 'true') {
        return index;
      }
    }).filter((element) => {
      return element >= 0;
    });

    if (selectedFact.length === 0) {
      if (trueIfHighlightLast) {

        const element = FactsGeneral.getMenuFactByDataID(currentFacts[currentFacts.length - 1]);
        FactsGeneral.goTo(event, element, true);
      } else {

        const element = FactsGeneral.getMenuFactByDataID(currentFacts[0]);
        FactsGeneral.goTo(event, element, true);
      }
    } else {
      if ((selectedFact[0] - 1) < 0) {
        if (Pagination.getCurrentPage - 1 > 0) {
          Pagination.previousPage();
          Pagination.previousFact(event, element, true);
        }
      } else {

        const element = FactsGeneral.getMenuFactByDataID(currentFacts[(selectedFact[0] - 1)]);
        FactsGeneral.goTo(event, element, true);
      }
    }
  },

  nextFact: (event: MouseEvent | KeyboardEvent, element: HTMLElement) => {

    const beginAt = ((Pagination.getCurrentPage - 1) * Constants.getPaginationPerPage);
    const endAt = beginAt + Constants.getPaginationPerPage;
    const currentFacts = Pagination.getArray.slice(beginAt, endAt);
    const selectedFact = currentFacts.map((current, index) => {

      const element = FactsGeneral.getMenuFactByDataID(current);
      if (element && element.getAttribute('selected-fact') === 'true') {

        return index;
      }

    }).filter((element) => {

      return element >= 0;
    });
    if (selectedFact.length === 0) {
      const element = FactsGeneral.getMenuFactByDataID(currentFacts[0]);
      FactsGeneral.goTo(event, element as HTMLElement);
    } else {
      if ((selectedFact[0] + 1) >= currentFacts.length) {
        if ((Pagination.getCurrentPage - 1) !== (Pagination.getTotalPages - 1)) {
          Pagination.nextPage();
          Pagination.nextFact(event, element);
        }
      } else {
        const element = FactsGeneral.getMenuFactByDataID(currentFacts[selectedFact[0] + 1]);
        FactsGeneral.goTo(event, element as HTMLElement);
      }
    }
  },

  getPrevNextControls: () => {

    const elementToReturn = document.createDocumentFragment();

    const divElement = document.createElement('div');

    const ulElement = document.createElement('ul');
    ulElement.setAttribute('class', 'pagination pagination-sm mb-0');

    const previousFactLiElement = document.createElement('li');
    previousFactLiElement.setAttribute('class', 'page-item');

    const previousFactAElement = document.createElement('a');
    previousFactAElement.setAttribute('class', 'page-link text-body');
    previousFactAElement.setAttribute('href', '#');
    previousFactAElement.setAttribute('tabindex', '13');
    previousFactAElement.addEventListener('click', (e) => { Pagination.previousFact(e, previousFactAElement); });

    const previousFactContent = document.createTextNode('Prev');

    previousFactAElement.appendChild(previousFactContent);
    previousFactLiElement.appendChild(previousFactAElement);
    ulElement.appendChild(previousFactLiElement);

    const nextFactLiElement = document.createElement('li');
    nextFactLiElement.setAttribute('class', 'page-item');

    const nextFactAElement = document.createElement('a');
    nextFactAElement.setAttribute('class', 'page-link text-body');
    nextFactAElement.setAttribute('href', '#');
    nextFactAElement.setAttribute('tabindex', '13');
    nextFactAElement.addEventListener('click', (e) => { Pagination.nextFact(e, nextFactAElement); });

    const nextFactContent = document.createTextNode('Next');

    nextFactAElement.appendChild(nextFactContent);
    nextFactLiElement.appendChild(nextFactAElement);
    ulElement.appendChild(nextFactLiElement);
    divElement.appendChild(ulElement);

    elementToReturn.appendChild(divElement);

    return elementToReturn;
  },

  getPaginationInfo: () => {

    const elementToReturn = document.createDocumentFragment();

    const paginationInfoDivElement = document.createElement('div');
    paginationInfoDivElement.setAttribute('class', 'pagination-info text-body');

    const paginationInfoDivContent = document.createTextNode(Pagination.getCurrentPage + ' of '
      + Pagination.getTotalPages);
    paginationInfoDivElement.appendChild(paginationInfoDivContent);

    elementToReturn.appendChild(paginationInfoDivElement);

    return elementToReturn;
  },

  getPageControls: () => {

    const firstPage = (Pagination.getCurrentPage === 1) ? 'disabled' : '';
    const previousPage = (Pagination.getCurrentPage - 1 <= 0) ? 'disabled' : '';
    const nextPage = (Pagination.getCurrentPage + 1 > Pagination.getTotalPages) ? 'disabled' : '';
    const lastPage = (Pagination.getCurrentPage === Pagination.getTotalPages) ? 'disabled' : '';

    const elementToReturn = document.createDocumentFragment();

    const navElement = document.createElement('nav');

    const ulElement = document.createElement('ul');
    ulElement.setAttribute('class', 'pagination pagination-sm mb-0');

    const firstPageLiElement = document.createElement('li');
    firstPageLiElement.setAttribute('class', `page-item ${firstPage}`);

    const firstPageAElement = document.createElement('a');
    firstPageAElement.setAttribute('class', 'page-link text-body');
    firstPageAElement.setAttribute('href', '#');
    firstPageAElement.setAttribute('tabindex', '13');
    firstPageAElement.addEventListener('click', () => { Pagination.firstPage(); });

    const firstPageContent = document.createElement('i');
    firstPageContent.setAttribute('class', 'fas fa-lg fa-angle-double-left');

    firstPageAElement.appendChild(firstPageContent);
    firstPageLiElement.appendChild(firstPageAElement);
    ulElement.appendChild(firstPageLiElement);

    const previousPageLiElement = document.createElement('li');
    previousPageLiElement.setAttribute('class', `page-item ${previousPage}`);

    const previousPageAElement = document.createElement('a');
    previousPageAElement.setAttribute('class', 'page-link text-body');
    previousPageAElement.setAttribute('href', '#');
    previousPageAElement.setAttribute('tabindex', '13');
    previousPageAElement.addEventListener('click', () => { Pagination.previousPage(); });

    const previousPageContent = document.createElement('i');
    previousPageContent.setAttribute('class', 'fas fa-lg fa-angle-left');

    previousPageAElement.appendChild(previousPageContent);
    previousPageLiElement.appendChild(previousPageAElement);
    ulElement.appendChild(previousPageLiElement);

    const nextPageLiElement = document.createElement('li');
    nextPageLiElement.setAttribute('class', `page-item ${nextPage}`);

    const nextPageAElement = document.createElement('a');
    nextPageAElement.setAttribute('class', 'page-link text-body');
    nextPageAElement.setAttribute('href', '#');
    nextPageAElement.setAttribute('tabindex', '13');
    nextPageAElement.addEventListener('click', () => { Pagination.nextPage(); });

    const nextPageContent = document.createElement('i');
    nextPageContent.setAttribute('class', 'fas fa-lg fa-angle-right');

    nextPageAElement.appendChild(nextPageContent);
    nextPageLiElement.appendChild(nextPageAElement);
    ulElement.appendChild(nextPageLiElement);

    const lastPageLiElement = document.createElement('li');
    lastPageLiElement.setAttribute('class', `page-item ${lastPage}`);

    const lastPageAElement = document.createElement('a');
    lastPageAElement.setAttribute('class', 'page-link text-body');
    lastPageAElement.setAttribute('href', '#');
    lastPageAElement.setAttribute('tabindex', '13');
    lastPageAElement.addEventListener('click', () => { Pagination.lastPage(); });

    const lastPageContent = document.createElement('i');
    lastPageContent.setAttribute('class', 'fas fa-lg fa-angle-double-right');

    lastPageAElement.appendChild(lastPageContent);
    lastPageLiElement.appendChild(lastPageAElement);
    ulElement.appendChild(lastPageLiElement);

    navElement.appendChild(ulElement);
    elementToReturn.appendChild(navElement);
    return elementToReturn;

  },

  getControlsTemplate: () => {

    const firstPage = (Pagination.getCurrentPage === 1) ? 'disabled' : '';
    const previousPage = (Pagination.getCurrentPage - 1 <= 0) ? 'disabled' : '';
    const nextPage = (Pagination.getCurrentPage + 1 > Pagination.getTotalPages) ? 'disabled' : '';
    const lastPage = (Pagination.getCurrentPage === Pagination.getTotalPages) ? 'disabled' : '';

    const elementToReturn = document.createDocumentFragment();

    const divElement = document.createElement('div');
    divElement.setAttribute('class', 'w-100 d-flex justify-content-between py-2 px-1');

    const divNestedElement = document.createElement('div');

    const ulElement = document.createElement('ul');
    ulElement.setAttribute('class', ' pagination pagination-sm mb-0');

    const firstPageLiElement = document.createElement('li');
    firstPageLiElement.setAttribute('class', `page-item ${firstPage}`);

    const firstPageAElement = document.createElement('a');
    firstPageAElement.setAttribute('class', ' page-link text-body');
    firstPageAElement.setAttribute('href', '#');
    firstPageAElement.setAttribute('tabindex', '13');
    firstPageAElement.addEventListener('click', () => { Pagination.firstPage(); });

    const firstPageContent = document.createElement('i');
    firstPageContent.setAttribute('class', 'fas fa-lg fa-angle-double-left');

    firstPageAElement.appendChild(firstPageContent);
    firstPageLiElement.appendChild(firstPageAElement);
    ulElement.appendChild(firstPageLiElement);

    const previousPageLiElement = document.createElement('li');
    previousPageLiElement.setAttribute('class', `page-item ${previousPage}`);

    const previousPageAElement = document.createElement('a');
    previousPageAElement.setAttribute('class', 'page-link text-body');
    previousPageAElement.setAttribute('href', '#');
    previousPageAElement.setAttribute('tabindex', '13');
    previousPageAElement.addEventListener('click', () => { Pagination.previousPage(); });

    const previousPageContent = document.createElement('i');
    previousPageContent.setAttribute('class', 'fas fa-lg fa-angle-left');

    previousPageAElement.appendChild(previousPageContent);
    previousPageLiElement.appendChild(previousPageAElement);
    ulElement.appendChild(previousPageLiElement);

    const nextPageLiElement = document.createElement('li');
    nextPageLiElement.setAttribute('class', `page-item ${nextPage}`);

    const nextPageAElement = document.createElement('a');
    nextPageAElement.setAttribute('class', 'page-link text-body');
    nextPageAElement.setAttribute('href', '#');
    nextPageAElement.setAttribute('tabindex', '13');
    nextPageAElement.addEventListener('click', () => { Pagination.nextPage(); });

    const nextPageContent = document.createElement('i');
    nextPageContent.setAttribute('class', 'fas fa-lg fa-angle-right');

    nextPageAElement.appendChild(nextPageContent);
    nextPageLiElement.appendChild(nextPageAElement);
    ulElement.appendChild(nextPageLiElement);

    const lastPageLiElement = document.createElement('li');
    lastPageLiElement.setAttribute('class', `page-item ${lastPage}`);

    const lastPageAElement = document.createElement('a');
    lastPageAElement.setAttribute('class', ' page-link text-body');
    lastPageAElement.setAttribute('href', '#');
    lastPageAElement.setAttribute('tabindex', '13');
    lastPageAElement.addEventListener('click', () => { Pagination.lastPage(); });

    const lastPageContent = document.createElement('i');
    lastPageContent.setAttribute('class', 'fas fa-lg fa-angle-double-right');

    lastPageAElement.appendChild(lastPageContent);
    lastPageLiElement.appendChild(lastPageAElement);
    ulElement.appendChild(lastPageLiElement);

    divNestedElement.appendChild(ulElement);
    divElement.appendChild(divNestedElement);

    elementToReturn.appendChild(divElement);

    return elementToReturn;
  },

  setPageSelect: () => {
    const select = document.getElementById('facts-menu-page-select');
    const option = document.createElement('option');
    option.setAttribute('value', 'null');
    const optionText = document.createTextNode('Select a Page');
    option.append(optionText);
    for (let i = 0; i < Pagination.getTotalPages; i++) {
      const option = document.createElement('option');
      option.setAttribute('value', `${i + 1}`);
      const optionText = document.createTextNode(`Page ${i + 1}`);
      option.append(optionText);
      if ((i + 1) === Pagination.getCurrentPage) {
        option.setAttribute('selected', 'true');
      }
      select!.append(option);
    }
    if (!select?.hasAttribute('listener')) {
      select?.setAttribute('listener', 'true');
      select?.addEventListener('change', (event) => {
        Pagination.goToPage(event?.target?.value as number);
      });
    }


  },

  goToPage: (pageNumber: number) => {
    if (!isNaN(pageNumber)) {
      Pagination.getCurrentPage = +pageNumber;

      Pagination.getPaginationTemplate(Pagination.getCurrentPage);
    }
  },

  goToFact: (event: MouseEvent | KeyboardEvent) => {
    if (
      Object.prototype.hasOwnProperty.call(event, 'key') &&
      !((event as KeyboardEvent).key === 'Enter' || (event as KeyboardEvent).key === 'Space')
    ) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    if ((event.target as HTMLElement) && (event.target as HTMLElement).hasAttribute('data-id')) {
      if (document.getElementById('facts-menu')?.classList.contains('show')) {
        Pagination.findFactAndGoTo((event.target as HTMLElement).getAttribute('data-id') as string);
      } else {
        // TODO: not tested - not sure how to get here
        const factsMenuElem = document.getElementById('facts-menu');
        const collapse = new bootstrap.Collapse('#facts-menu');
        collapse.toggle();
        factsMenuElem?.addEventListener('shown.bs.collapse', () => {
          Pagination.findFactAndGoTo((event.target as HTMLElement).getAttribute('data-id') as string)
        });
      }
    }
  },

  findFactAndGoTo: (elementID: string) => {
    let index = -1;
    for (let i = 0; i < Pagination.getArray.length; i++) {
      if (Pagination.getArray[i] === elementID) {
        index = i;
        break;
      }
    }
    if (index >= 0) {
      (index === 0) ? (index = 1) : null;
      const pageToGoTo = Math.ceil(index / Constants.getPaginationPerPage);
      Pagination.getCurrentPage = pageToGoTo;
      Pagination.getPaginationTemplate(pageToGoTo);
      Pagination.scrollToSelectedFactInSidebar(index);
    } else {
      ErrorsMinor.factNotActive();
    }
  },

  setSelectedFact: (element: HTMLElement, fact: SingleFact) => {
    const allFactsInMenu = Array.from(document.querySelectorAll(`#facts-menu-list-pagination .list-group-item`));
    allFactsInMenu.forEach(current => {
      current.setAttribute('selected-fact', 'false');
    });
    element.setAttribute('selected-fact', 'true');

    const factElement = document.querySelector(`#dynamic-xbrl-form [filing-url="${fact.file}"] #${fact.id}`);
    factElement?.scrollIntoView({
      behavior: 'smooth',
      // block: "start", fixes
      block: "nearest", // previously set to Constants.scrollPosition - not sure why.
      inline: "start"
    });
  },

  scrollToSelectedFactInSidebar: () => {
    const elementToScrollTo = document.getElementById('facts-menu-list-pagination')?.querySelector(
      '[selected-fact="true"]');
    if (elementToScrollTo) {
      elementToScrollTo.scrollIntoView({
        behavior: 'smooth',
        // block: "nearest" is needed to prevent content from shifting out of viewport.
        block: "nearest", // if item is above viewport resolves to start or top, if below resolves to end or bottom
        inline: "start"
      });
    }
  }

};
