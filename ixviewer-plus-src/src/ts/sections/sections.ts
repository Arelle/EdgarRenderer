/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

import { Constants } from "../constants/constants";
import { ConstantsFunctions } from "../constants/functions";
import { ErrorsMinor } from "../errors/minor";
import { ErrorsMajor } from "../errors/major";
import { FactMap } from "../facts/map";
import { HelpersUrl } from "../helpers/url";
import { Section } from "../interface/meta";
import { convertToSelector, elemWithinOneVHofBtm } from "../helpers/utils";
import { toBottomOfInlineDoc } from "../pagination/inlineDocPagination";

export const Sections = {

    init: () => {
        const sections = Constants.sections.sort((a, b) => {
            if (a.order) {
                return Number(a.order) - Number(b.order);
            } else {
                // metalinks version 2.1 doesn't have order prop
                // TODO: group section menucats together at least
                // read first, splice others that match it behind it.
                return 0;
            }
        });
        Sections.buildSectionsDom(sections);

        // hide search
        const sectionSearch = document.querySelector('#sections-menu-search-submit');
        sectionSearch?.classList.add('d-none');

        return sections;
    },

    scrollToSection: (sectionData: Section) => {
        if (sectionData?.inlineFactSelector) {
            const sectionElem = (document.querySelector(sectionData.inlineFactSelector) as HTMLElement);
            if (!sectionElem) {
                ErrorsMajor.message("Could not find inline section.");
                console.error(`Could not find the chosen Section: ${sectionData.inlineFactSelector}`);
                return;
            }
            if (elemWithinOneVHofBtm(sectionElem)) {
                toBottomOfInlineDoc();
            } else {
                sectionElem?.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
            }
        } else {
            console.error('no inline section selector');
        }
    },

    highlightActiveInSidebar: () => {
        const sectionElems = Array.from(document.querySelectorAll('#tagged-sections .accordion-item'));
        sectionElems.forEach(sectionElem => {
            if (sectionElem.getAttribute('data-instance') === HelpersUrl.getHTMLFileName) {
                sectionElem.classList.add('section-active')
                sectionElem.classList.remove('section-not-active')
                const expandablesOfCurrent = Array.from(sectionElem.querySelectorAll('.collapse'));
                expandablesOfCurrent.forEach(expandable => {
                    expandable.classList.add('show');
                })
            } else {
                sectionElem.classList.remove('section-active');
                sectionElem.classList.add('section-not-active');
            }
        })
    },

    handleSectionLinkClick: (event: MouseEvent | KeyboardEvent) => {
        const changeInstanceThenScrollToSection = (section: Section) => {
            ConstantsFunctions.changeInstance(
                +(event.target as HTMLElement).getAttribute('fact-instance-index') as number,
                (event.target as HTMLElement).getAttribute('fact-file'),
                () => {
                    Sections.scrollToSection(section);
                    Sections.highlightActiveInSidebar();
                    Sections.hightlightInlineSection(targetSectionData);
                }
            );
        };

        const keyButNotSpaceOrEnter = Object.prototype.hasOwnProperty.call(event, 'key')
            && !((event as KeyboardEvent).key === 'Enter' || (event as KeyboardEvent).key === 'Space');
        if (keyButNotSpaceOrEnter) return;

        const sections = Constants.getSectionsFromSessionStorage();

        let targetSectionData: Section;

        if (sections[0].order) {
            [targetSectionData] = sections.filter((sect: Section) => {
                const elemSectOrder = (event.target as HTMLElement)?.getAttribute('order');
                return sect.order == Number(elemSectOrder);
            });
        } else {
            // metalinks version 2.1 lacks order data
            [targetSectionData] = sections.filter((sect: Section) => {
                const selectorForInlineFact = (event.target as HTMLElement)?.getAttribute('inline-fact-selector');
                return sect.inlineFactSelector == selectorForInlineFact;
            });
        }

        const sectionInCurrentInstance = (event.target as HTMLElement).getAttribute('fact-file') === HelpersUrl.getHTMLFileName;
        if (sectionInCurrentInstance) {
            if (targetSectionData) {
                Sections.scrollToSection(targetSectionData);
                Sections.hightlightInlineSection(targetSectionData);
            } else {
                Sections.scrollToSectionOld({
                    id: (event.target as HTMLElement)?.getAttribute('fact-id') as string,
                });
            }
        } else {
            if (targetSectionData) {
                changeInstanceThenScrollToSection(targetSectionData);
            } else {
                ConstantsFunctions.changeInstance(
                    +(event.target as HTMLElement).getAttribute('fact-instance-index') as number,
                    (event.target as HTMLElement).getAttribute("fact-file") as string,
                    () => {
                        setTimeout(() => {
                            // Sections.formChange();
                            Sections.scrollToSectionOld({
                                name: (event.target as HTMLElement)?.getAttribute('fact-name') as string,
                                contextRef: (event.target as HTMLElement)?.getAttribute('fact-contextRef') as string,
                            });
                            Sections.setSelectedAttributes(event.target as HTMLElement);
                            Sections.highlightActiveInSidebar();
                        });
                    }
                );
            }
        }
    },

    hightlightInlineSection: (section: Section) => {
        const inlineSectionElem = document.querySelector(section.inlineFactSelector);
        const defFactColor = localStorage.getItem("taggedData") || "FF6600";

        const highlightKeyframesDefault = [
            {
                // from            h    v
                boxShadow: `inset  0px  2px #7dcee2,
                            inset  3px  0px #7dcee2, 
                            inset  0px -2px #7dcee2,
                            inset -3px  0px #7dcee2`,
                backgroundColor: '#9ed8e6'
            },
            {
                boxShadow: `inset  0px  2px #${defFactColor},
                            inset  3px  0px transparent, 
                            inset  0px -2px #${defFactColor},
                            inset -3px  0px transparent`,
                backgroundColor: 'transparent'
            },
        ];
        const highlightKeyframesBg = [
            { backgroundColor: '#9ed8e6' },
            { backgroundColor: 'transparent' },
        ];

        if (inlineSectionElem?.children.length === 1) {
            inlineSectionElem?.animate(highlightKeyframesBg, 2000);
            inlineSectionElem.children[0]?.animate(highlightKeyframesBg, 2000);
        } else if (inlineSectionElem && inlineSectionElem?.children.length > 1) {
            Array.from(inlineSectionElem?.children).forEach(childElem => {
                childElem?.animate(highlightKeyframesBg, 2000);
            });
        } else {
            // simple fact elem, no children
            inlineSectionElem?.animate(highlightKeyframesDefault, 2000);
        }
    },

    // maybe deprecated
    setSelectedAttributes: (element: HTMLElement) => {
        const selected = document.getElementById("tagged-sections")?.querySelectorAll("[selected-fact]");
        const selectedArray = Array.prototype.slice.call(selected);
        selectedArray.forEach((current) => {
            current.setAttribute("selected-fact", 'false');
        });
        element.setAttribute("selected-fact", 'true');
    },

    scrollToSectionOld: (factInput: {
        id?: string,
        name?: string;
        contextRef?: string;
    }) => {
        let factFromMap = null;
        if (factInput.id) {
            factFromMap = FactMap.getByID(factInput.id);
        } else if (factInput.name && factInput.contextRef) {
            factFromMap = FactMap.getByNameContextRef(factInput.name, factInput.contextRef);
        }

        if (factFromMap) {
            const factElement = document.querySelector(`#dynamic-xbrl-form #${factFromMap.id}`);
            factElement?.scrollIntoView({
                // block: Constants.scrollPosition as ScrollLogicalPosition
                block: 'nearest', // fixes content shift ouf of viewport.
            });
        } else {
            ErrorsMinor.factNotFound();
        }
    },

    addRadioListeners: () => {
        const sectionsSearchRadios = document.querySelectorAll('[name="sections-filter"]')
        sectionsSearchRadios.forEach(searchRadioOption => {
            searchRadioOption?.addEventListener('click', () => {
                Sections.applyFilterRadios();
            })
        })
    },

    /**
     * Description
     * @param {any} filter:string ('all', 'current', 'other')
     * @returns {any}
     */
    applyFilterRadios: () => {
        const allSectionAccordionItems = Array.from(document.querySelectorAll('#tagged-sections > div.accordion-item'));
        const filter = document.querySelector('[name="sections-filter"]:checked')?.value;

        if (filter === 'all') {
            allSectionAccordionItems.forEach(sectElem => {
                sectElem.classList.remove('d-none');
            })
        } else if (filter === 'current') {
            allSectionAccordionItems.forEach(sectElem => {
                if (HelpersUrl.getHTMLFileName && sectElem.getAttribute('data-instance') === (HelpersUrl.getHTMLFileName)) {
                    sectElem.classList.remove('d-none');
                } else {
                    sectElem.classList.add('d-none');
                }
            })
        } else if (filter === 'other') {
            allSectionAccordionItems.forEach(sectElem => {
                if (HelpersUrl.getHTMLFileName && sectElem.getAttribute('data-instance') !== (HelpersUrl.getHTMLFileName)) {
                    sectElem.classList.remove('d-none');
                } else {
                    sectElem.classList.add('d-none');
                }
            })
        }
    },

    /**
     * Description
     * @param {any} sections:Array<Section>
     * @description iterates over each 'report' in metalinksFlat, buildings headers for instance and menuCats as needed.
     * @returns {any} => builds sections dom
     */
    buildSectionsDom: (sections: Array<Section>) => {
        let prevDocName = '';

        if (sections.length === 0) {
            const htmlString = `<div style="text-align: center; width: 100%;">No Reports Data</div>`;
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlString, 'text/html')
            const elem = doc.querySelector('body > div') as HTMLElement
            document.getElementById("tagged-sections")?.appendChild(elem);
        }

        sections.forEach((section: Section, index: number) => {
            // dom ids
            const sectionSelector = convertToSelector(section.domId);

            section.instanceSectionId = sectionSelector;
            section.instanceSectionHeaderId = (`instance-header-${sectionSelector}`);
            section.instanceSectionBodyId = (`instance-body-${sectionSelector}`);
            section.menuCatClean = (`${section.instanceSectionId}--${convertToSelector(section.menuCatMapped)}`)
            section.menuCatHeaderId = (`cat-header-${convertToSelector(section.menuCat)}-${sectionSelector}`);
            section.menuCatBodyId = (`cat-body-${convertToSelector(section.menuCat)}-${sectionSelector}`);

            const newDoc = section.instanceDocName !== prevDocName;

            if (newDoc) {
                const sectionsInInstanceCount = sections.filter(sect => {
                    return sect.instanceDocName === section.instanceDocName
                }).length;
                Sections.createInstanceAccordionHeader(section, index, sectionsInInstanceCount);
            }
            prevDocName = section.instanceDocName;

            const menuCatElem = document.querySelector(`div[id="${section.menuCatClean}"]`);
            if (!menuCatElem) {
                const linksInMenuCatCount = sections.filter(sect => {
                    return sect.menuCat === section.menuCat && sect.instanceDocName === section.instanceDocName
                }).length;
                Sections.createMenuCatCollapsable(section, index, linksInMenuCatCount);
            }

            Sections.createSectionItemLink(section);
        });

        Sections.addRadioListeners();
        Sections.addMenuCatCollapseListeners();
    },

    createInstanceAccordionHeader: (sectionItem: Section, instInd: number, sectionsInInstanceCount: number) => {
        const isCurrent = sectionItem.instanceHtm.includes(HelpersUrl.getHTMLFileName);
        const instanceCollapseString =
            `<div 
                id="${sectionItem.instanceSectionId}"
                data-instance="${sectionItem.instanceHtm}"
                class="accordion-item mb-2 ${isCurrent ? 'section-active' : 'section-not-active'}"
            >

                <!-- header -->
                <div class="accordion-header px-0 py-0">
                    <h5 class="mb-0">
                        <button 
                            id="${sectionItem.instanceSectionHeaderId}"
                            data-cy="${sectionItem.instanceSectionHeaderId}"
                            class="section-instance-header accordion-button btn d-flex justify-content-between align-items-center w-100"
                            type="button"
                            tabindex="2"
                            data-bs-toggle="collapse"
                            aria-expanded="true"
                            data-bs-target="#${sectionItem.instanceSectionBodyId}"
                        >
                            <span class="font-size-1">${sectionItem.instanceDocName}</span>
                            <span id="sectionLinkCount" data-cy="sectionLinkCount" class="badge">
                                [${sectionsInInstanceCount}]
                            </span>
                        </button>
                    </h5>
                </div>

                <!-- body -->
                <div 
                    id="${sectionItem.instanceSectionBodyId}"
                    class="section-doc-body accordion-collapse collapse ${isCurrent ? 'show' : ''}" 
                    aria-labelledby="menu category"
                >
                    <div class="accordion-body">
                        <!-- Cat Headers and emtpy mentCat body dynamically populated by createMenuCatCollapsable -->
                    </div>
                </div>
            </div>`;
        const headerParser = new DOMParser();
        const headerDoc = headerParser.parseFromString(instanceCollapseString, 'text/html')
        const instanceHeader = headerDoc.querySelector('body > div') as HTMLElement

        document.getElementById("tagged-sections")?.classList.add('accordion');
        document.getElementById("tagged-sections")?.appendChild(instanceHeader);
    },

    createMenuCatCollapsable: (sectionItem: Section, index: number, linksInMenuCatCount: number) => {
        // const menuCatClean = DOMPurify.sanitize(sectionItem.menuCatMapped)
        const expandMenuCat = sectionItem.instanceHtm === HelpersUrl.getHTMLFileName || linksInMenuCatCount < 7;

        const cardHeaderString =
            `<div id="${sectionItem.menuCatClean}" class="menu-cat px-0 py-0">
                <div class="menu-cat-header ">
                    <h6 class="mb-0">
                        <button 
                            id="section-header-${sectionItem.menuCatMapped}"
                            class="btn d-flex justify-content-between align-items-center"
                            type="button"
                            tabindex="2"
                            data-bs-toggle="collapse"
                            aria-expanded="true"
                            data-bs-target="#${sectionItem.menuCatBodyId}"
                        >
                            <span class="font-size-1 menu-cat-name">${sectionItem.menuCatMapped}</span>
                            <span class="fa-solid open-indicator fa-chevron-${expandMenuCat ? 'down' : 'right'}"></span>
                        </button>
                    </h6>
                </div>
                <div 
                    id="${sectionItem.menuCatBodyId}"
                    class="menu-cat-body collapse ${expandMenuCat ? 'show' : ''}" 
                    aria-labelledby="menu category"
                >
                    <!-- Section Links dynamically populated by createSectionItemLink -->
                </div>
            </div>`;
        const domParser = new DOMParser();
        const menuCatDoc = domParser.parseFromString(cardHeaderString, 'text/html')
        const menuCatElem = menuCatDoc.querySelector('body > div') as HTMLElement

        document.querySelector(`#${sectionItem.instanceSectionBodyId} div.accordion-body`)?.appendChild(menuCatElem);
    },

    createSectionItemLink: (sectionItem: Section) => {
        const instanceCollapseString =
            `<li 
                xmlns="http://www.w3.org/1999/xhtml"
                order="${sectionItem.order}"
                inline-fact-selector='${sectionItem.inlineFactSelector}'
                fact-file="${sectionItem.fact?.file}"
                fact-name="${sectionItem.fact?.name}"
                class="click section-link list-group-item list-group-item-action d-flex align-items-center" 
                selected-fact="false"
                tabindex="2"
                contextRef="${sectionItem.fact?.contextRef}"
                fact-instance-index="${sectionItem.instanceIndex}"
            >
                ${sectionItem.shortName}
            </li>`;
        const parser = new DOMParser();
        const doc = parser.parseFromString(instanceCollapseString, 'text/html')
        const sectionFactLink = doc.querySelector('li') as HTMLElement

        ['click', 'keyup'].forEach((eType) => {
            sectionFactLink.addEventListener(eType, (eventElem) => {
                Sections.handleSectionLinkClick(eventElem);
            });
        });

        document.getElementById(sectionItem.menuCatBodyId)?.appendChild(sectionFactLink);
    },

    addMenuCatCollapseListeners: () => {
        const menuCats = Array.from(document.querySelectorAll('.menu-cat'));
        menuCats.forEach(menuCat => {
            const chevron = menuCat.querySelector(`span.open-indicator`);
            const collapsibleBody = menuCat.querySelector('.collapse');

            collapsibleBody?.addEventListener('show.bs.collapse', () => {
                chevron?.classList.add('fa-chevron-down')
                chevron?.classList.remove('fa-chevron-right')
            });
            collapsibleBody?.addEventListener('hide.bs.collapse', () => {
                chevron?.classList.add('fa-chevron-right');
                chevron?.classList.remove('fa-chevron-down');
            });
        })
    },
};
