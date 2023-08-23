/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

export const Errors: {
  updateMainContainerHeight: (removingWarning: boolean) => void
} = {

  updateMainContainerHeight: (removingWarning = false) => {
    let numberOfChildrenInErrorContainer = document.getElementById('error-container')?.children.length || 0;
    removingWarning ? numberOfChildrenInErrorContainer-- : numberOfChildrenInErrorContainer++;

    if (numberOfChildrenInErrorContainer < 0) {
      numberOfChildrenInErrorContainer = 0;
    }
    const container: HTMLElement | null = document.querySelector('#dynamic-xbrl-form');
    if (container) {
      container.style.height = 'calc(100vh - ' + ((numberOfChildrenInErrorContainer * 45) + 45) + 'px)';
    }
  }
};
