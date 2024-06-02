/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

import * as bootstrap from "bootstrap";
import { Modals } from "./modals";
import { Constants } from "../constants/constants";
import { FactMap } from "../facts/map";
import { ConstantsFunctions } from "../constants/functions";

export const ModalsFormInformation = {

	currentSlide: 0,

	carouselInformation: [{
		'dialog-title': 'Company and Document'
	}, {
		'dialog-title': 'Tags'
	}, {
		'dialog-title': 'Files'
	}, {
		'dialog-title': 'Additional Items'
	}],

	clickEvent: (event: Event | KeyboardEvent) => {
		if (
			Object.prototype.hasOwnProperty.call(event, 'key') &&
			!((event as KeyboardEvent).key === 'Enter' || (event as KeyboardEvent).key === 'Space')
		) {
			return;
		}
		Modals.close(event);

		document.getElementById('form-information-modal')?.classList.remove('d-none');

		document.getElementById('form-information-modal-drag')?.focus();

		ModalsFormInformation.listeners();

		ModalsFormInformation.carouselData();

		const span = document.createElement('span');
		const dialogTitle = document.createTextNode(`${ModalsFormInformation.carouselInformation[0]['dialog-title']}`);
		span.appendChild(dialogTitle);
		document.getElementById('form-information-modal-title')?.firstElementChild?.replaceWith(span);

		new bootstrap.Carousel(document.getElementById('form-information-modal-carousel') as HTMLElement, {});
		const thisCarousel = document.getElementById('form-information-modal-carousel');

		window.addEventListener('keyup', ModalsFormInformation.keyboardEvents);

		thisCarousel?.addEventListener('slide.bs.carousel', (event) => {
			ModalsFormInformation.currentSlide = (event['to']) + 1;
			const previousActiveIndicator = event['from'];
			const newActiveIndicator = event['to'];
			document.getElementById('form-information-carousel-indicators')?.querySelector(
				'[data-bs-slide-to="' + previousActiveIndicator + '"]')?.classList.remove('active');
			document.getElementById('form-information-carousel-indicators')?.querySelector(
				'[data-bs-slide-to="' + newActiveIndicator + '"]')?.classList.add('active');
			const span = document.createElement('span');
			const dialogTitle = document.createTextNode(`${ModalsFormInformation.carouselInformation[event['to']]['dialog-title']}`);
			span.appendChild(dialogTitle);
			document.getElementById('form-information-modal-title')?.firstElementChild?.replaceWith(span);
		});
	},

	listeners: () => {
		// we add draggable
		Modals.initDrag(document.getElementById('form-information-modal-drag') as HTMLElement);

		document.getElementById('dialog-box-copy-content')?.addEventListener('click', (event: MouseEvent) => {
			Modals.copyContent(event, 'form-information-modal-carousel', 'form-information-copy-paste');
		});
		document.getElementById('dialog-box-copy-content')?.addEventListener('keyup', (event: KeyboardEvent) => {
			Modals.copyContent(event, 'form-information-modal-carousel', 'form-information-copy-paste');
		});

		document.getElementById('dialog-content-copy-content')?.addEventListener('click', (event: MouseEvent) => {
			Modals.copyContent(event, 'form-information-modal-carousel', 'form-information-copy-paste');
		});
		document.getElementById('dialog-content-copy-content')?.addEventListener('keyup', (event: KeyboardEvent) => {
			Modals.copyContent(event, 'form-information-modal-carousel', 'form-information-copy-paste');
		});

		document.getElementById('dialog-box-close')?.addEventListener('click', (event: MouseEvent) => {
			Modals.close(event);
		});
		document.getElementById('dialog-box-close')?.addEventListener('keyup', (event: KeyboardEvent) => {
			Modals.close(event);
		});

	},

	focusOnContent: () => {

		document.getElementById('form-information-modal-carousel-page-' + ModalsFormInformation.currentSlide)?.focus();
	},

	keyboardEvents: (event: KeyboardEvent) => {
		const thisCarousel = bootstrap.Carousel.getInstance(document.getElementById('form-information-modal-carousel') as HTMLElement);

		if (event.key === '1') {
			thisCarousel?.to(0);
			ModalsFormInformation.focusOnContent();
			return false;
		}
		if (event.key === '2') {
			thisCarousel?.to(1);
			ModalsFormInformation.focusOnContent();
			return false;
		}
		if (event.key === '3') {
			thisCarousel?.to(2);
			ModalsFormInformation.focusOnContent();
			return false;
		}
		if (event.key === '4') {
			thisCarousel?.to(3);
			ModalsFormInformation.focusOnContent();
			return false;
		}
		if (event.key === 'ArrowLeft') {
			thisCarousel?.prev();
			ModalsFormInformation.focusOnContent();
			return false;
		}
		if (event.key === 'ArrowRight') {
			thisCarousel?.next();
			ModalsFormInformation.focusOnContent();
			return false;
		}

	},

	carouselData: () => {

		Modals.renderCarouselIndicators('form-information-modal-carousel', 'form-information-carousel-indicators',
			ModalsFormInformation.carouselInformation);

		// we now render one slide at a time!
		ModalsFormInformation.firstSlide();
		ModalsFormInformation.secondSlide();
		ModalsFormInformation.thirdSlide();
		ModalsFormInformation.fourthSlide();
	},

	firstSlide: () => {
		ConstantsFunctions.emptyHTMLByID('form-information-modal-carousel-page-1');
		const possibleLabels = [
			{
				'label': 'Company Name',
				'value': FactMap.getByName('dei:EntityRegistrantName')
			},
			{
				'label': 'Central Index Key',
				'value': FactMap.getByName('dei:EntityCentralIndexKey')
			},
			{
				'label': 'Document Type',
				'value': FactMap.getByName('dei:DocumentType')
			},
			{
				'label': 'Period End Date',
				'value': FactMap.getByName('dei:DocumentPeriodEndDate')
			},
			{
				'label': 'Fiscal Year/Period Focus',
				'value': FactMap.getByName('dei:DocumentFiscalYearFocus', 'dei:DocumentFiscalPeriodFocus')
			},
			{
				'label': 'Current Fiscal Year End',
				'value': FactMap.getByName('dei:CurrentFiscalYearEndDate')
			},
			{
				'label': 'Amendment/Description',
				'value': FactMap.getByName('dei:AmendmentFlag')
			}
		];
		possibleLabels.forEach((current, index) => {
			if (current['value']) {
				const tr = document.createElement('tr');
				const th = document.createElement('th');
				const td = document.createElement('td');
				th.textContent = current['label'];
				td.setAttribute('data-name', current['label']);
				td.textContent = current['value'];
				tr.appendChild(th);
				tr.appendChild(td);
				if (index === 0) {
					document.getElementById('form-information-modal-carousel-page-1')?.firstElementChild?.replaceWith(tr);
				} else {
					document.getElementById('form-information-modal-carousel-page-1')?.append(tr);
				}
			}
		});

	},

	secondSlide: () => {
		ConstantsFunctions.emptyHTMLByID('form-information-modal-carousel-page-2');

		const primaryTotal = Constants.getFormInformation.keyStandard + Constants.getFormInformation.keyCustom;

		const axisTotal = Constants.getFormInformation.axisStandard + Constants.getFormInformation.axisCustom;

		const memberTotal = Constants.getFormInformation.memberStandard + Constants.getFormInformation.memberCustom;

		const totalStandard = Constants.getFormInformation.keyStandard + Constants.getFormInformation.axisStandard
			+ Constants.getFormInformation.memberStandard;

		const totalCustom = Constants.getFormInformation.keyCustom + Constants.getFormInformation.axisCustom
			+ Constants.getFormInformation.memberCustom;

		const total = primaryTotal + axisTotal + memberTotal;

		const possibleLabels = [
			[{
				'label': 'Total Facts',
				'value': Constants.getHtmlOverallFactsCount
			}, {
				'label': 'Inline Version',
				'value': Constants.getFormInformation.version
			}],
			[{
				'label': 'Tags'
			}, {
				'label': 'Standard'
			}, {
				'label': 'Custom'
			}, {
				'label': 'Total'
			}],

			[{
				'label': 'Primary',
				'values': [
					Constants.getFormInformation.keyStandard,

					(primaryTotal > 0) ? Math.round((Constants.getFormInformation.keyStandard / primaryTotal) * 100)
						+ '%' : '0%',

					Constants.getFormInformation.keyCustom,

					(primaryTotal > 0) ? Math.round((Constants.getFormInformation.keyCustom / primaryTotal) * 100)
						+ '%' : '0%',

					primaryTotal]
			}],

			[{
				'label': 'Axis',
				'values': [
					Constants.getFormInformation.axisStandard,

					(axisTotal > 0) ? Math.round((Constants.getFormInformation.axisStandard / axisTotal) * 100) + '%'
						: '0%',

					Constants.getFormInformation.axisCustom,

					(axisTotal > 0) ? Math.round((Constants.getFormInformation.axisCustom / axisTotal) * 100) + '%'
						: '0%',

					axisTotal]
			}],

			[{
				'label': 'Member',
				'values': [
					Constants.getFormInformation.memberStandard,

					(memberTotal > 0) ? Math.round((Constants.getFormInformation.memberStandard / memberTotal) * 100)
						+ '%' : '0%',

					Constants.getFormInformation.memberCustom,

					(memberTotal > 0) ? Math.round((Constants.getFormInformation.memberCustom / memberTotal) * 100)
						+ '%' : '0%',

					memberTotal]
			}],

			[{
				'label': 'Total',
				'values': [
					Constants.getFormInformation.keyStandard + Constants.getFormInformation.axisStandard
					+ Constants.getFormInformation.memberStandard,

					(totalStandard > 0) ? Math.round((totalStandard / total) * 100) + '%' : '0%',

					Constants.getFormInformation.keyCustom + Constants.getFormInformation.axisCustom
					+ Constants.getFormInformation.memberCustom,

					(totalStandard > 0) ? Math.round((totalCustom / total) * 100) + '%' : '0%',

					total]
			}]

		];

		const table = document.createElement('table');
		possibleLabels.forEach((current, index) => {
			const tr = document.createElement('tr');
			tr.setAttribute('colspan', "8");
			// colspan on a tr element isn't a thing, but reproducing anyway...
			table.appendChild(tr);

			if (current instanceof Array) {

				current.forEach((nestedCurrent) => {
					const th = document.createElement('th');
					th.setAttribute('colspan', "2");
					th.textContent = nestedCurrent['label'];
					tr.appendChild(th);

					if (nestedCurrent['value']) {
						const td = document.createElement('td');
						td.setAttribute('data-name', nestedCurrent['label']);
						td.setAttribute('colspan', 2);
						td.textContent = nestedCurrent['value'];
						tr.appendChild(td);

					} else if (nestedCurrent['values']) {
						nestedCurrent['values'].forEach((finalCurrent: string | null, finalIndex: string) => {
							const td = document.createElement('td');
							td.setAttribute('data-name', nestedCurrent['label'] + '-' + finalIndex);
							td.setAttribute('colspan', '1');
							td.textContent = finalCurrent;
							tr.appendChild(td);
						});

					}
				});

			} else {
				if (current['value']) {
					const th = document.createElement('th');
					th.setAttribute('colspan', '1');
					th.textContent = current['label'];
					tr.appendChild(th);

					const td = document.createElement('td');
					td.setAttribute('colspan', '1');
					td.textContent = current['value'];
					tr.appendChild(td);
				}
			}
			if (index === 0) {
				document.getElementById('form-information-modal-carousel-page-2')?.firstElementChild?.replaceWith(tr);
			} else {
				document.getElementById('form-information-modal-carousel-page-2')?.append(tr);
			}
		});
	},

	thirdSlide: () => {
		ConstantsFunctions.emptyHTMLByID('form-information-modal-carousel-page-3');
		const nsPrefix = (Constants.getFormInformation.nsprefix) ? Constants.getFormInformation.nsprefix.toUpperCase() + ' ' : '';
		const possibleLabels = [
			{
				'label': 'Inline Document',
				'values': Constants.getFormInformation.dts?.inline?.local ? Constants.getFormInformation.dts?.inline?.local : ['Not Available.']
			},
			{
				'label': 'Custom Taxonomy',
				'values': ['']
			},
			{
				'label': nsPrefix + 'Schema',
				'values': Constants.getFormInformation?.dts?.schema?.local ? Constants.getFormInformation?.dts?.schema?.local : ['Not Available.']
			},
			{
				'label': nsPrefix + 'Label',
				'values': Constants.getFormInformation?.dts?.labelLink?.local ? Constants.getFormInformation?.dts?.labelLink?.local : ['Not Available.']
			},
			{
				'label': nsPrefix + 'Calculation',
				'values': Constants.getFormInformation?.dts?.calculationLink?.local ? Constants.getFormInformation?.dts?.calculationLink?.local : ['Not Available.']
			},
			{
				'label': nsPrefix + 'Presentation',
				'values': Constants.getFormInformation?.dts?.presentationLink?.local ? Constants.getFormInformation?.dts?.presentationLink?.local : ['Not Available.']
			},
			{
				'label': nsPrefix + 'Definition',
				'values': Constants.getFormInformation?.dts?.definitionLink?.local ? Constants.getFormInformation?.dts?.definitionLink?.local : ['Not Available.']
			}
		];

		const table = document.createElement('table');
		table.classList.add('table');
		table.classList.add('table-striped');
		table.classList.add('table-bordered');
		table.classList.add('table-sm');

		const tbody = document.createElement('tbody');
		possibleLabels.forEach((current) => {
			const tr = document.createElement('tr');

			if (current['values']) {
				tbody.appendChild(tr);

				const th = document.createElement('th');
				th.append(document.createTextNode(current['label']));
				tr.append(th);

				current['values'].forEach((nestedCurrent: string | null, nestedIndex: string | number) => {
					if (nestedIndex === 0) {
						const td = document.createElement('td');
						td.setAttribute('data-name', current['label'] + '-' + nestedIndex);
						td.append(document.createTextNode(nestedCurrent as string));
						tr.append(td);

					} else {
						const tr = document.createElement('tr');
						tr.append(document.createElement('td'));
						const td = document.createElement('td');
						td.setAttribute('data-name', current['label'] + '-' + nestedIndex);
						td.append(document.createTextNode(nestedCurrent as string));
						tr.append(td);
						tbody.append(tr);
					}

				});
			} else {
				const th = document.createElement('th');
				th.append(document.createTextNode(current['label'] as string));
				tbody.appendChild(th);
			}
		});
		table.append(tbody);
		ConstantsFunctions.emptyHTMLByID('form-information-modal-carousel-page-3');
		document.getElementById('form-information-modal-carousel-page-3')?.appendChild(table);
	},

	fourthSlide: () => {
		ConstantsFunctions.emptyHTMLByID('form-information-modal-carousel-page-4');
		const possibleLabels = [{
			'label': 'Taxonomy',
			'value': 'Count',
			'bold': true
		}];

		Object.keys(Constants.getFormInformation.hidden).forEach((current) => {
			const temp = {
				'label': (current === 'total') ? 'Total' : current,
				'value': Constants.getFormInformation.hidden[current]
			};
			possibleLabels.push(temp);
		});

		const table = document.createElement('table');
		possibleLabels.forEach((current, index) => {
			const tr = document.createElement('tr');
			table.appendChild(tr);
			if (current['bold']) {
				const th1 = document.createElement('th');
				th1.textContent = current['label'];
				tr.appendChild(th1);

				const th2 = document.createElement('th');
				th2.textContent = current['value'];
				tr.appendChild(th2);

			} else if (current['value']) {
				const th = document.createElement('th');
				th.setAttribute('data-name', 'Additional Items Label-' + (index - 1));
				th.textContent = current['label'];
				tr.appendChild(th);

				const td = document.createElement('td');
				td.setAttribute('data-name', 'Additional Items Value-' + (index - 1));
				td.textContent = current['value'];
				tr.appendChild(td);
			}
			if (index === 0) {
				document.getElementById('form-information-modal-carousel-page-4')?.firstElementChild?.replaceWith(tr);
			} else {
				document.getElementById('form-information-modal-carousel-page-4')?.append(tr);
			}
		});
	}
};
