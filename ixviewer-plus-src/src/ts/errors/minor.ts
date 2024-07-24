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

		const closeBtn = Errors.createBsCloseBtn();
		element.appendChild(closeBtn);

		document.getElementById('error-container')?.appendChild(element);

		Errors.updateMainContainerHeight();
	},

	factNotFound: () => {
		const content = document.createTextNode('Inline XBRL cannot locate the requested fact.');

		const element = document.createElement('div');
		element.setAttribute('class', 'alert-height alert alert-warning alert-dismissable show mb-0');
		element.appendChild(content);
		
		const closeBtn = Errors.createBsCloseBtn();
		element.appendChild(closeBtn);

		document.getElementById('error-container')?.appendChild(element);

		Errors.updateMainContainerHeight();
	},

};
