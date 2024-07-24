/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

export const FiltersValue = {

    recursivelyFixHTMLTemp: (element: HTMLElement) => {

        // TODO add bootstrap classes?
        if (element.nodeName.toLowerCase() === 'table') {
            element.classList.add('table');
        }
        element.removeAttribute('contextref');
        element.removeAttribute('name');
        element.removeAttribute('id');
        element.removeAttribute('escape');
        element.removeAttribute('continued-fact');
        element.removeAttribute('continued-main-fact');
        element.removeAttribute('enabled-fact');
        element.removeAttribute('highlight-fact');
        element.removeAttribute('selected-fact');
        element.removeAttribute('hover-fact');
        element.removeAttribute('onclick');
        element.removeAttribute('onkeyup');
        element.removeAttribute('onmouseenter');
        element.removeAttribute('onmouseleave');
        element.removeAttribute('isamountsonly');
        element.removeAttribute('istextonly');
        element.removeAttribute('iscalculationsonly');
        element.removeAttribute('isnegativesonly');
        element.removeAttribute('isadditionalitemsonly');
        element.removeAttribute('isstandardonly');
        element.removeAttribute('iscustomonly');
        element.removeAttribute('tabindex');

        element.style.width = null;
        element.style.fontSize = null;
        element.style.lineHeight = null;
        // element.removeAttribute('style');
        if (element['children'].length > 0) {
            for (let i = 0; i < element['children'].length; i++) {
                FiltersValue.recursivelyFixHTMLTemp(element['children'][i]);
            }
        }
    },

    recursivelyFixHTML: (element: HTMLElement) => {

        // TODO add bootstrap classes?
        if (element.nodeName.toLowerCase() === 'table') {
            element.classList.add('table');
        }
        element.removeAttribute('style');
        if (element['children'].length > 0) {
            for (let i = 0; i < element['children'].length; i++) {
                FiltersValue.recursivelyFixHTML(element['children'][i]);
            }
        }
    }

};
