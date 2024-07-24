/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */
import * as bootstrap from "bootstrap";
import { Constants } from "../constants/constants";
import { FactMap } from "../facts/map";
import { ModalsCommon } from "../modals/common";
import { ModalsNested } from "../modals/nested";

import { FactsMenu } from "./menu";
import { FactsTable } from "./table";
import { SingleFact } from "../interface/fact";
import { Logger, ILogObj } from "tslog";
import { ConstantsFunctions } from "../constants/functions";

export const Facts = {
	updateFactCount: () => {
		const factCount = FactMap.getFactCount();
		FactsTable.update();
		const factTotalElementsArray = Array.from(document.querySelectorAll(
			".fact-total-count"
		));
		Constants.getHtmlOverallFactsCount = factCount;

		factTotalElementsArray.forEach((current) => {
			if (Constants.getHtmlOverallFactsCount === "0") {
				document.getElementById("facts-menu")?.setAttribute("disabled", 'true');
				document.getElementById("facts-menu")?.classList.add("disabled");
			} else {
				document.getElementById("facts-menu")?.removeAttribute("disabled");
				document.getElementById("facts-menu")?.classList.remove("disabled");
			}
			current.textContent = Constants.getHtmlOverallFactsCount;
		});

		// do the slugs too:
		const factSlugsElementsArray = Array.from(document.querySelectorAll(
			"[filing-slug]"
		));
		factSlugsElementsArray.forEach((current) => {
			if (current) {
				const filingLoaded = Constants.getInlineFiles.find(element => {
					if (element.slug === current.getAttribute('filing-slug')) {
						return element;
					}
				});
				if (filingLoaded.loaded) {
					current.innerHTML = FactMap.getFactCountForFile(current.getAttribute('filing-slug'), true);
				}
			}
		});

		if (document.getElementById('facts-menu')?.classList.contains('show')) {
			FactsMenu.prepareForPagination();
		}
		return factCount;
	},

	fixStyleString: (input: string) => {
		return input.split(";").reduce((accumulator: { [x: string]: string; }, currentValue: string) => {
			const rulePair = currentValue.split(":");
			if (rulePair[0] && rulePair[1]) {
				accumulator[rulePair[0].trim()] = rulePair[1].trim();
			}
			return accumulator;
		}, {});
	},

	addEventAttributes: () => {
		const startPerformance = performance.now();
		Facts.inViewPort();
		const endPerformance = performance.now();
		if (LOGPERFORMANCE) {
			const log: Logger<ILogObj> = new Logger();
			log.debug(`Facts.addEventAttributes() completed in: ${(endPerformance - startPerformance).toFixed(2)}ms`);
		}
	},

	setListeners(element: HTMLElement) {
		element.addEventListener("click", (event: MouseEvent) => {
			event.stopPropagation();
			event.preventDefault();
			Facts.clickEvent(event, element);
		});

		element.addEventListener("keyup", (event: KeyboardEvent) => {
			event.stopPropagation();
			event.preventDefault();
			Facts.clickEvent(event, element);
		});

		element.addEventListener("mouseenter", (event: MouseEvent) => {
			Facts.enterElement(event, element);
		});

		element.addEventListener("mouseleave", (event: MouseEvent) => {
			Facts.leaveElement(event, element);
		});
		element.setAttribute('listeners', 'true');
	},

	inViewPort: (unobserveAfter = false) => {
		const factSelector = '[id^=fact-identifier-], [continued-main-fact-id], [data-link], [xhtml-change]'
		const allFactIdentifiers = Array.from(document?.getElementById('dynamic-xbrl-form')?.querySelectorAll(factSelector) || []);

		const observer = new IntersectionObserver(entries => {
			entries.forEach(({ target, isIntersecting }) => {
				if (isIntersecting) {
					if (target.hasAttribute('xhtml-change')) {
						const file = (href: string) => {
							return document.getElementById(href.slice(1))?.closest(`[filing-url]`);
						}
						const fileToChangeTo = file(target.getAttribute('href') as string);
						if (fileToChangeTo && fileToChangeTo.getAttribute('filing-url')) {
							target.addEventListener('click', () => {
								ConstantsFunctions.changeInlineFiles(fileToChangeTo.getAttribute('filing-url') as string);
							});
							target.addEventListener('keyup', () => {
								ConstantsFunctions.changeInlineFiles(fileToChangeTo.getAttribute('filing-url') as string);
							});
						}

					} else if (target.hasAttribute('data-link')) {
						target.addEventListener('click', () => {
							ConstantsFunctions.changeInlineFiles(target.getAttribute('data-link') as string);
						});
						target.addEventListener('keyup', () => {
							ConstantsFunctions.changeInlineFiles(target.getAttribute('data-link') as string);
						});
					} else {
						if (!target.getAttribute('listeners')) {
							Facts.setListeners(target as HTMLElement);
						}
						const fact = FactMap.getByID(target.getAttribute('continued-main-fact-id') || target.getAttribute('id') as string) as unknown as SingleFact;

						target.setAttribute('tabindex', `18`);
						target.setAttribute('enabled-fact', `${fact.isEnabled}`);
						target.setAttribute('highlight-fact', `${fact.isHighlight}`);
						target.setAttribute("text-block-fact", 'false');

						if (fact.xbrltype === 'textBlockItemType') {
							// text block fact is on the screen
							target.setAttribute("text-block-fact", 'true');

							const leftSpan = document.createElement("span");
							leftSpan.setAttribute(
								"class",
								"float-left text-block-indicator-left position-absolute"
							);
							leftSpan.title = "One or more textblock facts are between this symbol and the right side symbol.";
							target.parentNode?.insertBefore(leftSpan, target);

							const rightSpan = document.createElement("span");
							rightSpan.setAttribute(
								"class",
								"float-right text-block-indicator-right position-absolute"
							);
							rightSpan.title = "One or more textblock facts are between this symbol and the left side symbol.";
							target.parentNode?.insertBefore(rightSpan, target);
						}

						if (target.hasAttribute("continued-main-fact")) {
							const getContinuedIDs = (id: string, mainID: string) => {
								// let's ensure we haven't already added the necessary html attributes to the element
								if (fact.continuedIDs && !fact.continuedIDs.includes(id)) {
									Facts.setListeners(document.querySelector(`[id="${id}"]`) as HTMLElement);
									document.querySelector(`[id="${id}"]`)?.setAttribute("continued-main-fact-id", mainID);
									document.querySelector(`[id="${id}"]`)?.setAttribute("continued-fact", "true");
									target.setAttribute('tabindex', `18`);
									fact.continuedIDs.push(id);
									if (document.querySelector(`[id="${id}"]`)?.hasAttribute("continuedat")) {
										getContinuedIDs(document.querySelector(`[id="${id}"]`)?.getAttribute("continuedat") as string, mainID);
									}
								}
							};
							getContinuedIDs(target.getAttribute("continuedat") as string, target.getAttribute("id") as string);
						}
					}
				}
				unobserveAfter ? observer.unobserve(target) : null;
			});
		});

		allFactIdentifiers.forEach((current) => {
			observer.observe(current);
		});
	},

	isElementContinued: (element: HTMLElement) => {
		if (element) {

			if (
				element.hasAttribute("continued-fact") &&
				element.getAttribute("continued-fact") === "true"
			) {
				return true;
			}
			if (
				element.hasAttribute("continued-main-fact") &&
				element.getAttribute("continued-main-fact") === "true"
			) {
				return true;
			}
		}
		return false;
	},

	isElementNested: (element: HTMLElement) => {
		ModalsNested.getAllElementIDs = [];
		ModalsNested.getAllNestedFacts(element);

		return ModalsNested.getAllElementIDs.length > 1;
	},

	clickEvent: (event: MouseEvent | KeyboardEvent, element: HTMLElement) => {
		event.stopPropagation();
		event.preventDefault();
		if (
			Object.prototype.hasOwnProperty.call(event, 'key') &&
			!((event as KeyboardEvent).key === 'Enter' || (event as KeyboardEvent).key === 'Space')
		) {
			return;
		}
		document.getElementById("fact-modal")?.classList.add("d-none");
		document.getElementById("fact-nested-modal")?.classList.add("d-none");
		const elementRecursion = (element: HTMLElement): { href: string, _target: string } | null => {
			if (element.hasAttribute('href')) {
				return {
					href: element.getAttribute('href') as string,
					_target: element.getAttribute('target') as string
				};
			}
			if (!element.parentElement) {
				return null;
			} else {
				return elementRecursion(element.parentElement)
			}
		}
		const isLink = elementRecursion(event.target as HTMLElement);
		if (isLink) {
			window.open(
				isLink.href,
				isLink._target === '_blank' ? '_blank' : '_self'
			);
			return false;
		} else {
			const id = element.hasAttribute('continued-main-fact-id') ? element.getAttribute('continued-main-fact-id') : element.getAttribute('id');
			FactMap.setIsSelected(id as string);
			Facts.addURLParam(id as string);
			if (Facts.isElementNested(element)) {
				ModalsNested.nestedClickEvent(event, element);
			} else {
				ModalsCommon.clickEvent(event, element);
			}
		}
	},

	enterElement: (event: MouseEvent, element: HTMLElement) => {
		event.stopPropagation();
		event.preventDefault();
		Facts.resetAllPopups(() => {
			Facts.resetAllHoverAttributes();
			element.setAttribute("hover-fact", 'true');
			if (Constants.hoverOption) {
				if (Facts.isElementContinued(element)) {
					if (element.hasAttribute("continued-main-fact")) {
						Facts.addPopover(element);
					}
				} else {
					Facts.addPopover(element);
				}
			} else {
				if (Facts.isElementContinued(element)) {
					// get this facts info
					const fact = FactMap.getByID(element.getAttribute('continued-main-fact-id') || element.getAttribute('id') as string);
					if (fact) {
						fact.continuedIDs.forEach((current) => {
							document.getElementById(current)?.setAttribute('hover-fact', 'true');
						});
					}
				}
			}
		});
	},

	addPopover: (element: HTMLElement) => {
		const fact = FactMap.getByID(element.getAttribute('id') as string);
		if (fact) {
			element.parentElement?.setAttribute("data-bs-toggle", "popover");
			element.parentElement?.setAttribute("data-bs-placement", "auto");
			// element.parentElement?.setAttribute("data-bs-title", ConstantsFunctions.getFactLabel(fact.labels) as string);
			element.parentElement?.setAttribute("data-bs-content", fact.isHTML ? `Click to see Fact.\n${fact.period}` : ` ${fact.value}\n${fact.period}`);
			element.parentElement?.setAttribute("data-bs-trigger", "focus");
			element.classList.add('elevated');
			const popoverHTML = document.createElement('div');
			popoverHTML.classList.add('m-1');
			popoverHTML.classList.add('text-center');
			const value = document.createElement('div');
			const labelAndValue = `${ConstantsFunctions.getFactLabel(fact.labels) as string}: ${(fact.value as unknown as string)}`;
			const valueText = document.createTextNode(fact.isHTML ? 'Click to see Fact.' : labelAndValue);
			value.append(valueText);
			popoverHTML.append(value);
			const period = document.createElement('div');
			const periodText = document.createTextNode(fact.period);
			period.append(periodText);
			popoverHTML.append(period);
			const info = document.createElement('div');
			const infoText = document.createTextNode('Click for additional information.');
			info.append(infoText);
			popoverHTML.append(info);
			const popover = new bootstrap.Popover(element.parentElement as HTMLElement, { html: true, content: popoverHTML });
			popover.show();
		}
	},

	leaveElement: (event: MouseEvent, element: HTMLElement) => {
		event.stopPropagation();
		event.preventDefault();
		// hide them all!
		const thisCarousel = bootstrap.Popover.getInstance(element as HTMLElement);
		thisCarousel?.hide();
		Facts.resetAllPopups(() => {
			Facts.resetAllHoverAttributes();
		});
	},

	resetAllPopups: (callback: () => void) => {
		const foundPopupClassesArray = Array.from(document.querySelectorAll(".popover"));
		foundPopupClassesArray.forEach((current) => {
			current.parentNode?.removeChild(current);
		});

		callback();
	},

	resetAllHoverAttributes: () => {
		const foundHoverClasses = document.getElementById("dynamic-xbrl-form")?.querySelectorAll('[hover-fact="true"]');

		const foundHoverClassesArray = Array.prototype.slice.call(foundHoverClasses);

		foundHoverClassesArray.forEach((current) => {
			current.setAttribute("hover-fact", "false");
		});
	},

	addURLParam: (input: string) => {
		const url = new URL(window.location.href);
		url.searchParams.set('fact', input);
		window.history.pushState(null, '', decodeURIComponent(url.toString()));
	},

	removeURLParam: () => {
		const url = new URL(window.location.href);
		url.searchParams.delete('fact');
		window.history.pushState(null, '', decodeURIComponent(url.toString()));
	},
};
