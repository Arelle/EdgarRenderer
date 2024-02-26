/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

export const Errors: {
  updateMainContainerHeight: (removingWarning?: boolean | undefined) => void
} = {

  updateMainContainerHeight: (removingWarning = false) => {
    const errorElems = document.getElementById('error-container')?.children;

    const actualErrorsArr = Array.from(errorElems)
    let numOfErrors = actualErrorsArr.length || 0;
    if (removingWarning) numOfErrors--;
    // removingWarning ? numOfErrors-- : numOfErrors++;

    if (numOfErrors < 0) {
      numOfErrors = 0;
    }
    const dynamicXbrlForm: HTMLElement | null = document.querySelector('#dynamic-xbrl-form');

    if (dynamicXbrlForm) {
      dynamicXbrlForm.style.height = 'calc(100vh - ' + ((numOfErrors * 41.6) + 86) + 'px)';
      // container.style.height = '100vh';
    }
  }
};
