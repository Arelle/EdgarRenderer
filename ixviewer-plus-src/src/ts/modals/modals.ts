/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

import { ConstantsFunctions } from "../constants/functions";
import { FactMap } from "../facts/map";
import { Facts } from "../facts/facts";
import { ModalsCommon } from "./common";
import { ModalsFormInformation } from "./form-information";

export const Modals = {

  renderCarouselIndicators: (carouselId: string, indicatorId: string, carouselInformation: Array<{ 'dialog-title': string }>, currentSlide = 0) => {
    const elementToReturn = document.createDocumentFragment();
    if (currentSlide > 0) {
      currentSlide--;
    }
    carouselInformation.forEach((current, index) => {
      const activeSlide = (index === (currentSlide)) ? 'active' : '';

      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('class', `${activeSlide}`);
      button.setAttribute('data-bs-target', `#${carouselId}`);
      button.setAttribute('data-bs-slide-to', `${index}`);
      button.setAttribute('title', current['dialog-title']);
      button.setAttribute('tabindex', '16');

      elementToReturn.appendChild(button);
    });
    ConstantsFunctions.emptyHTMLByID(indicatorId);

    document.getElementById(indicatorId)?.appendChild(elementToReturn);
  },

  close: (event: Event | KeyboardEvent) => {

    if (Object.prototype.hasOwnProperty.call(event, 'key') && !((event as KeyboardEvent).key === 'Enter' || (event as KeyboardEvent).key === 'Space')) {
      return;
    }
    Facts.removeURLParam();
    document.getElementById('fact-copy-paste')?.classList.add('d-none');

    window.removeEventListener('keyup', ModalsFormInformation.keyboardEvents);
    window.removeEventListener('keyup', ModalsCommon.keyboardEvents);

    // to simplify things, we are going to go through and close every
    // dialog.
    const foundDialogs = document.querySelectorAll('.dialog-box');

    const foundDialogsArray = Array.prototype.slice.call(foundDialogs);

    foundDialogsArray.forEach((current) => {

      current.classList.remove('expand-modal');
      const viewPortWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      if (viewPortWidth >= 576) {
        document.getElementById('fact-modal-expand')?.classList.remove('d-none');
        document.getElementById('fact-nested-modal-expand')?.classList.remove('d-none');

      }
      document.getElementById('fact-modal-compress')?.classList.add('d-none');
      document.getElementById('fact-nested-modal-compress')?.classList.add('d-none');

      current.classList.add('d-none');
    });

    FactMap.setIsSelected();
  },

  copyContent: (event: MouseEvent | KeyboardEvent, elementIdToCopy: string, copyPasteElement: string) => {
    if (Object.prototype.hasOwnProperty.call(event, 'key') &&
      !((event as KeyboardEvent).key === 'Enter' || (event as KeyboardEvent).key === 'Space')) {
      return;
    }
    if (!document.getElementById(copyPasteElement)?.classList.contains('d-none')) {
      document.getElementById(copyPasteElement)?.classList.add('d-none');
    } else {
      const sectionToPopulate = '#' + copyPasteElement;
      document.getElementById(copyPasteElement)?.classList.remove('d-none');

      const foundCarouselPagesArray = Array.from(document.getElementById(elementIdToCopy)?.querySelectorAll('.carousel-item') || []);
      // TODO should we just put all of the innerText automatically into the
      // users clipboard?

      // th elements are the keys
      // td elements are the values
      let textToCopy = '';

      foundCarouselPagesArray.forEach((current) => {
        const foundInformation = current.querySelectorAll('table > * > tr');
        const foundInformationArray = Array.prototype.slice.call(foundInformation);

        foundInformationArray.forEach((nestedCurrent) => {

          if (nestedCurrent.querySelector('th') && nestedCurrent.querySelector('th').innerText) {
            textToCopy += nestedCurrent.querySelector('th').innerText.trim() + ' : ';
          }

          if (nestedCurrent.querySelector('td')) {

            if (nestedCurrent.querySelector('td #collapse-modal')) {
              const largeFactSelector = nestedCurrent.querySelector('td #collapse-modal');

              textToCopy += '\n';
              textToCopy += largeFactSelector.innerText.trim().replace(/(\r\n|\n|\r)/gm, '');
              textToCopy += '\n';

            } else if (nestedCurrent.querySelector('td').innerText) {
              textToCopy += nestedCurrent.querySelector('td').innerText.trim().replace(/(\r\n|\n|\r)/gm, '');
              textToCopy += '\n';
            }
          }
        });
      });
      const text = document.createTextNode(textToCopy.trim());
      document.querySelector(sectionToPopulate + ' textarea')!.append(text);
    }
  },

  closeCopy: (input: string) => {
    (document.getElementById(input) as HTMLElement).classList.add('d-none');
  },

  expandToggle: (
    event: MouseEvent | KeyboardEvent,
    idToTarget = 'fact-modal',
    idToExpand = 'fact-modal-expand',
    idToCompress = 'fact-modal-compress'
  ) => {
    if (
      Object.prototype.hasOwnProperty.call(event, 'key') &&
      !((event as KeyboardEvent).key === 'Enter' || (event as KeyboardEvent).key === 'Space')
    ) {
      return;
    }
    // idToTarget = idToTarget || 'fact-modal';
    // idToExpand = idToExpand || 'fact-modal-expand';
    // idToCompress = idToCompress || 'fact-modal-compress';

    const modalElement = document.getElementById(idToTarget);
    modalElement?.classList.toggle('expand-modal');
    if (modalElement?.classList.contains('expand-modal')) {

      document.getElementById(idToExpand)?.classList.add('d-none');
      document.getElementById(idToCompress)?.classList.remove('d-none');
      document.getElementById('fact-modal-drag')?.classList.add('d-none');
      document.getElementById(idToCompress)?.focus();

    } else {

      document.getElementById(idToExpand)?.classList.remove('d-none');
      document.getElementById(idToCompress)?.classList.add('d-none');
      document.getElementById('fact-modal-drag')?.classList.remove('d-none');
      document.getElementById(idToExpand)?.focus();
    }
  },

  initDrag: (element: HTMLElement) => {

    let selected: { offsetLeft: number; clientWidth: number; offsetTop: number; clientHeight: number; style: { left: string; top: string; }; offsetWidth: number; offsetHeight: number; } | null = null;
    let xPosition = 0;
    let yPosition = 0;
    let xElement = 0;
    let yElement = 0;

    const drag = (element: HTMLElement) => {
      selected = element;
      xElement = (xPosition - selected.offsetLeft) + (selected.clientWidth / 2);
      yElement = (yPosition - selected.offsetTop) + (selected.clientHeight / 2);
    }

    // Will be called when user dragging an element
    const dragElement = (event: MouseEvent) => {
      xPosition = document.all ? window.event?.clientX : event.pageX;
      yPosition = document.all ? window.event?.clientY : event.pageY;
      if (selected !== null) {
        selected.style.left = ((xPosition - xElement) + selected.offsetWidth / 2) + 'px';
        selected.style.top = ((yPosition - yElement) + selected.offsetHeight / 2) + 'px';
      }
    }

    // Destroy the object when we are done
    const destroyDrag = () => {
      selected = null;
    }

    document.onmousemove = dragElement;
    document.onmouseup = destroyDrag;

    element.onmousedown = function () {
      // not a fan of having all these .parentNode
      drag(this.parentNode.parentNode.parentNode);
      return false;
    };

  }

};
