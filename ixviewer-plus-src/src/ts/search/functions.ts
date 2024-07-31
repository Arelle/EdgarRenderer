/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */
import { ModalsNested } from "../modals/nested";
import { Facts } from "../facts/facts";

export const SearchFunctions = {

  getAllElementsForContent: [],



  elementNameForRegex: (element: HTMLElement) => {

    if (element && element.hasAttribute('name')) {
      return element.getAttribute('name') || '';
    }
    return '';
  },

  elementContentForRegex: (element: HTMLElement) => {

    if (element) {
      if (Facts.isElementContinued(element)) {
        const tempContinuedElements = ModalsNested.dynamicallyFindContinuedFacts(element, []);
        let continuedElementsInnerText = '';
        for (let i = 0; i < tempContinuedElements.length; i++) {
          if (tempContinuedElements[i].textContent) {
            continuedElementsInnerText += ' ' + tempContinuedElements[i].textContent.trim();
          }
        }
        return continuedElementsInnerText;
      }
      return element.textContent;
    }
  },


  elementDimensionsForRegex: (element: HTMLElement) => {
    if (element && element.hasAttribute('contextref')) {
      const dimensionContainer = document.getElementById(element.getAttribute('contextref'))?.querySelectorAll(
        '[dimension]');
      let dimensionContainerInnerText = '';

      for (let i = 0; i < dimensionContainer.length; i++) {
        if (dimensionContainer[i].innerText) {
          dimensionContainerInnerText += ' ' + dimensionContainer[i].innerText;
        }
      }
      return dimensionContainerInnerText;
    }
  },



  searchReferencesForAuthRef: (originalNameValue: string, standardReferenceArray: string | Array<string>) => {
    for (let i = 0; i < standardReferenceArray.length; i++) {

      if (standardReferenceArray[i]['original-name'] === originalNameValue) {
        return standardReferenceArray[i];
      }
    }
  },

  searchObjectOfSingleReferenceForRegex: (object: { [x: string]: string; }, searchOptions: { [x: string]: number[]; }) => {
    // we create a string of all the options the user has requested
    // then we regex that string
    let textToRegex = '';

    if (searchOptions['options'].indexOf(6) >= 0 && object['Topic']) {
      textToRegex += ' ' + object['Topic'];
    }

    if (searchOptions['options'].indexOf(7) >= 0 && object['SubTopic']) {
      textToRegex += ' ' + object['SubTopic'];
    }

    if (searchOptions['options'].indexOf(8) >= 0 && object['Paragraph']) {
      textToRegex += ' ' + object['Paragraph'];
    }

    if (searchOptions['options'].indexOf(9) >= 0 && object['Publisher']) {
      textToRegex += ' ' + object['Publisher'];
    }

    if (searchOptions['options'].indexOf(10) >= 0 && object['Section']) {
      textToRegex += ' ' + object['Section'];
    }

    return textToRegex;

  }

};
