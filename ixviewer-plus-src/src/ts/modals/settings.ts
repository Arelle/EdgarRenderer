/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

import { Modals } from "./modals";
import { Constants } from "../constants/constants";

export const ModalsSettings = {

	clickEvent: (event: MouseEvent | KeyboardEvent) => {

		if (
			Object.prototype.hasOwnProperty.call(event, 'key') &&
			!((event as KeyboardEvent).key === 'Enter' || (event as KeyboardEvent).key === 'Space')
		) {
			return;
		}

		Modals.close(event);

		document.getElementById('settings-modal')?.classList.remove('d-none');

		document.getElementById('settings-modal-drag')?.focus();

		ModalsSettings.listeners();

		// set correct selected value
		(document.getElementById('scroll-position-select') as HTMLInputElement).value = Constants.scrollPosition;
		// set correct hover value
		(document.getElementById('hover-option-select') as HTMLInputElement).value = Constants.hoverOption.toString();
	},

	listeners: () => {
		// we add draggable
		Modals.initDrag(document.getElementById('settings-modal-drag') as HTMLElement);

		document.getElementById('settings-modal-close')?.addEventListener('click', (event: MouseEvent) => {
			Modals.close(event);
		});
		document.getElementById('settings-modal-close')?.addEventListener('keyup', (event: KeyboardEvent) => {
			Modals.close(event);
		});

	},

	scrollPosition: (event: Event) => {
		localStorage.setItem('scrollPosition', event.target.value);
		Constants.scrollPosition = event.target.value;
	},

	hoverOption: (event: Event) => {
		if (event?.target?.value === 'true') {

			localStorage.setItem('hoverOption', 'true');
			Constants.hoverOption = true;
		} else {

			localStorage.setItem('hoverOption', 'false');
			Constants.hoverOption = false;
		}
	}
};
