/* Created by staff of the U.S. Securities and Exchange Commission.ParsedUrl
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

import { ErrorsMinor } from "../errors/minor";
import { FactMap } from "../facts/map";
import { ModalsCommon } from "../modals/common";
import { ConstantsFunctions } from "../constants/functions";
import { Pagination } from "../pagination/sideBarPagination";
import { Constants } from "../constants/constants";

export const FactsGeneral = {
	getElementByNameContextref: (name: string, contextref: string) => {
		return document.getElementById('dynamic-xbrl-form')?.querySelector(
			'[name="' + name + '"][contextref="' + contextref + '"]');
	},

	getMenuFactByDataID: (dataId: string) => {
		return document.getElementById('facts-menu-list-pagination')?.querySelector('[data-id="' + dataId + '"]');
	},

	/**
	 * Description
	 * @info handles clickevent from fact sidebar
	 * @param {any} event:MouseEvent|KeyboardEvent|Event
	 * @param {any} element:HTMLElement
	 * @returns {any} => 
	 */
	goToInlineFact: (event: MouseEvent | KeyboardEvent | Event, element: HTMLElement) => {
		if (
			Object.prototype.hasOwnProperty.call(event, 'key') &&
			!((event as KeyboardEvent).key === 'Enter' || (event as KeyboardEvent).key === 'Space')
		) {
			return;
		}
		const fact = FactMap.getByID(element.getAttribute('data-id') as string);
		if (fact) {
			FactMap.setIsSelected(fact.id);
			const currentInstance = Constants.getInstanceFiles.find(element => element.current);
			const currentXHTML = currentInstance?.xhtmls.find(element => element.current);
			if (fact.file) {
				if (currentXHTML?.slug !== fact.file) {
					ConstantsFunctions.changeInlineFiles(fact.file);
				} else {
					Pagination.setSelectedFact(element, fact);
				}
			} else {
				ErrorsMinor.factNotFound();
			}
			const tempDiv = document.createElement('div');
			tempDiv.setAttribute('id', fact.id);
			ModalsCommon.clickEvent(event, tempDiv);
		}
	},

	// fact in fact sidebar
	getFactListTemplate: (elementID: string) => {
		const factInfo = FactMap.getByID(elementID as string);
		const elementToReturn = document.createDocumentFragment();

		const aElement = document.createElement('a');
		aElement
			.setAttribute('class',
				'text-body sidebar-fact border-bottom click text-decoration-none click list-group-item list-group-item-action p-1');
		aElement.setAttribute('selected-fact', `${factInfo?.isSelected}`);
		if (factInfo?.id) {
			aElement.setAttribute('data-id', factInfo?.id);
			aElement.setAttribute('data-href', factInfo?.file);
		}
		aElement.setAttribute('tabindex', '13');

		aElement.addEventListener('click', (e) => {
			FactsGeneral.goToInlineFact(e, aElement);
		});
		aElement.addEventListener('keyup', (e) => {
			FactsGeneral.goToInlineFact(e, aElement);
		});

		const conceptElem = document.createElement('div');
		conceptElem.setAttribute('class', 'd-flex w-100 justify-content-between');
		const pElement = document.createElement('p');
		pElement.setAttribute('class', 'mb-0 font-weight-bold word-break');
		const pElementContent = document.createTextNode(ConstantsFunctions.getFactLabel(factInfo?.labels));
		pElement.appendChild(pElementContent);
		const badge = FactsGeneral.getFactBadge(factInfo);
		conceptElem.appendChild(pElement);
		conceptElem.appendChild(badge);

		const factValElem = document.createElement('p');
		factValElem.setAttribute('class', 'mb-0');
		const pElement3Content = document.createTextNode(factInfo?.isHTML || factInfo?.isContinued ? 'Click to see Fact.' : factInfo.value);
		factValElem.appendChild(pElement3Content);

		const periodElem = document.createElement('p');
		periodElem.setAttribute('class', 'mb-0 lighter-text');
		const pElementContent2 = document.createTextNode(factInfo?.period as string);
		periodElem.appendChild(pElementContent2);

		const docNameElem = document.createElement('small');
		const currentInstance = Constants.getInstanceFiles.find(element => element.current);
		const currentXHTML = currentInstance?.xhtmls.find(element => element.current);
		docNameElem.setAttribute('class', `${currentXHTML?.slug === factInfo?.file ? 'text-primary' : 'text-success'}`);
		if (factInfo.name == "us-gaap:AssetsCurrent") {
			console.log('factInfo', factInfo)
		}
		const docNameText = document.createTextNode(factInfo?.file ? factInfo.file : 'Unknown Location');
		docNameElem.appendChild(docNameText);

		aElement.appendChild(conceptElem);
		aElement.appendChild(factValElem);
		aElement.appendChild(periodElem);
		aElement.appendChild(docNameElem);
		elementToReturn.appendChild(aElement);

		return elementToReturn;
	},

	getFactBadge: (factInfo) => {
		const dimensions = factInfo.segment?.some(element => element.dimension);

		const spanElement = document.createElement('span');
		const nestedSpanElement = document.createElement('span');

		const title = `${factInfo.isAdditional ? ' Additional' : ''}${factInfo.isCustom ? ' Custom' : ''}${dimensions ? ' Dimension' : ''}`.trim();
		const label = `${factInfo.isAdditional ? ' A' : ''}${factInfo.isCustom ? ' C' : ''}${dimensions ? ' D' : ''}`.trim();
		nestedSpanElement.setAttribute('title', title.split(' ').join(' & '));
		nestedSpanElement.setAttribute('class', 'mx-1 my-0 badge text-bg-dark');

		const spanNestedElementContent = document.createTextNode(label.split(' ').join(' & '));

		nestedSpanElement.appendChild(spanNestedElementContent);
		spanElement.appendChild(nestedSpanElement);
		return spanElement;
	},

	specialSort: (unsortedArray: Array<{ id: string, isAdditional: boolean }>) => {
		const hiddenFacts: Array<string> = [];
		return unsortedArray.map((current) => {
			if (current.isAdditional) {
				hiddenFacts.push(current.id);
			} else {
				return current.id;
			}

		}).filter(Boolean).concat(hiddenFacts);
	}

};
