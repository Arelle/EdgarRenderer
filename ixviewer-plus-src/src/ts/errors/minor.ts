/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

import { Errors } from "./errors";

export const ErrorsMinor = {

  unknownError: () => {

    const content = document.createTextNode('An Error has occured within the Inline XBRL Viewer.');

    const element = document.createElement('div');
    element.setAttribute('class', 'alert-height alert alert-warning alert-dismissable show mb-0');
    element.appendChild(content);

    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.setAttribute('class', 'btn-close float-end');
    button.setAttribute('data-bs-dismiss', 'alert');
    button.setAttribute('aria-label', 'Close');
    button.addEventListener('click', () => { Errors.updateMainContainerHeight(true); });

    element.appendChild(button);

    document.getElementById('error-container')?.appendChild(element);

    Errors.updateMainContainerHeight();
  },

  factNotFound: () => {
    const content = document.createTextNode('Inline XBRL can not locate the requested fact.');

    const element = document.createElement('div');
    element.setAttribute('class', 'alert-height alert alert-warning alert-dismissable show mb-0');
    element.appendChild(content);

    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.setAttribute('class', 'btn-close float-end');
    button.setAttribute('data-bs-dismiss', 'alert');
    button.setAttribute('aria-label', 'Close');
    button.addEventListener('click', () => { Errors.updateMainContainerHeight(true); });

    element.appendChild(button);

    document.getElementById('error-container')?.appendChild(element);

    Errors.updateMainContainerHeight();
  },

};
