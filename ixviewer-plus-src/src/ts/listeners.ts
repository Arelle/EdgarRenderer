/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

import { FactsChart } from "./facts/chart";
import { FactsMenu } from "./facts/menu";
import { FactsTable } from "./facts/table";
import { FormInformation } from "./form-information/form-information";
import { Modals } from "./modals/modals";
import { ModalsFormInformation } from "./modals/form-information";
import { ModalsSettings } from "./modals/settings";
import { Scroll } from "./scroll/scroll";
import { Search } from "./search/search";
import { Sections } from "./sections/sections";
import { SectionsSearch } from "./sections/search";
import { UserFiltersDataRadios } from "./user-filters/data-radios";
import { UserFiltersDropdown } from "./user-filters/dropdown";
import { UserFiltersGeneral } from "./user-filters/general";
import { UserFiltersMoreFiltersBalances } from "./user-filters/more-filters-balance";
import { UserFiltersTagsRadios } from "./user-filters/tags-radios";

export class Listeners {
    constructor() {
        this.init();
    }
    init() {

        document.getElementById('menu-dropdown-information')?.addEventListener('click', (event: MouseEvent) => {
            ModalsFormInformation.clickEvent(event);
        });
        document.getElementById('menu-dropdown-information')?.addEventListener('keyup', (event: KeyboardEvent) => {
            ModalsFormInformation.clickEvent(event);
        });

        document.getElementById('menu-dropdown-link')?.addEventListener('click', () => {
            FormInformation.init();
        });
        document.getElementById('menu-dropdown-link')?.addEventListener('keyup', () => {
            FormInformation.init();
        });

        document.getElementById('menu-dropdown-settings')?.addEventListener('click', (event: MouseEvent) => {
            ModalsSettings.clickEvent(event);
        });
        document.getElementById('menu-dropdown-settings')?.addEventListener('keyup', (event: KeyboardEvent) => {
            ModalsSettings.clickEvent(event);
        });

        document.getElementById('sections-menu-toggle')?.addEventListener('click', (event: MouseEvent) => {
            Sections.toggle(event);
        });
        document.getElementById('sections-menu-toggle')?.addEventListener('keyup', (event: KeyboardEvent) => {
            Sections.toggle(event);
        });

        document.getElementById('nav-filter-more')?.addEventListener('click', () => {
            UserFiltersGeneral.moreFiltersClickEvent();
        });
        document.getElementById('nav-filter-more')?.addEventListener('keyup', () => {
            UserFiltersGeneral.moreFiltersClickEvent();
        });

        document.getElementById("user-filters-balances-credit")?.addEventListener("click", (event: MouseEvent) => {
            UserFiltersMoreFiltersBalances.clickEvent(event, 1);
        });
        document.getElementById("user-filters-balances-credit")?.addEventListener("keyup", (event: KeyboardEvent) => {
            UserFiltersMoreFiltersBalances.clickEvent(event, 1);
        });
        document.getElementById("user-filters-balances-debit")?.addEventListener("click", (event: MouseEvent) => {
            UserFiltersMoreFiltersBalances.clickEvent(event, 0);
        });
        document.getElementById("user-filters-balances-debit")?.addEventListener("keyup", (event: KeyboardEvent) => {
            UserFiltersMoreFiltersBalances.clickEvent(event, 0);
        });

        document.getElementById("current-filters-reset-all")?.addEventListener("click", () => {
            UserFiltersDropdown.resetAll();
        });
        document.getElementById("current-filters-reset-all")?.addEventListener("keyup", () => {
            UserFiltersDropdown.resetAll();
        });

        document.getElementById("fact-menu-secondary-toggle")?.addEventListener("click", (event: MouseEvent) => {
            FactsMenu.toggle(event);
        });
        document.getElementById("fact-menu-secondary-toggle")?.addEventListener("keyup", (event: KeyboardEvent) => {
            FactsMenu.toggle(event);
        });

        document.getElementById('nav-filter-dropdown')?.addEventListener('change', (event) => {
            UserFiltersDataRadios.clickEvent(event);
        });
        document.getElementById('nav-filter-tags-dropdown')?.addEventListener('change', (event) => {
            UserFiltersTagsRadios.clickEvent(event);
        });

        document.getElementById('sections-menu-search-submit')?.addEventListener('submit', (event) => {
            event.preventDefault();
            SectionsSearch.submit();
            return false;
        });

        document.getElementById('section-menu-search-btn-clear')?.addEventListener('click', () => {
            SectionsSearch.clear();
        });

        document.getElementById('section-menu-search-btn-clear')?.addEventListener('keyup', () => {
            SectionsSearch.clear();
        });

        document.getElementById('global-search-form')?.addEventListener('submit', (event) => {
            event.preventDefault();
            Search.submit();
            return false;
        });

        let globalSearchTimeout: string | number | NodeJS.Timeout | null | undefined = null;
        document.getElementById('global-search')?.addEventListener('keyup', () => {
            if (globalSearchTimeout) {
                clearTimeout(globalSearchTimeout);
            }
            globalSearchTimeout = setTimeout(() => {
                Search.suggestions();
            }, 500)
        });

        document.getElementById('global-search')?.addEventListener('blur', () => {
            Search.suggestionsEmpty();
        });

        document.getElementById('search-btn-clear')?.addEventListener("click", () => {
            Search.clear();
        });

        document.getElementById('search-btn-clear')?.addEventListener("keyup", () => {
            Search.clear();
        });


        document.getElementById('to-top-btn')?.addEventListener("click", () => {
            Scroll.toTop();
        });

        document.getElementById('to-top-btn')?.addEventListener("keyup", () => {
            Scroll.toTop();
        });

        document.getElementById('to-prev-btn')?.addEventListener("click", () => {
            Scroll.toPrev();
        });

        document.getElementById('to-prev-btn')?.addEventListener("keyup", () => {
            Scroll.toPrev();
        });

        document.getElementById('to-next-btn')?.addEventListener("click", () => {
            Scroll.toNext();
        });

        document.getElementById('to-next-btn')?.addEventListener("keyup", () => {
            Scroll.toNext();
        });

        document.getElementById('to-bottom-btn')?.addEventListener("click", () => {
            Scroll.toBottom();
        });

        document.getElementById('to-bottom-btn')?.addEventListener("keyup", () => {
            Scroll.toBottom();
        });

        document.getElementById('hover-option-select')?.addEventListener("change", (event: Event) => {
            ModalsSettings.hoverOption(event);
        });

        document.getElementById('scroll-position-select')?.addEventListener("change", (event: Event) => {
            if (!PRODUCTION) console.log('scroll-position-select')
            ModalsSettings.scrollPosition(event);
        });

        document.getElementById('fact-copy-content-close')?.addEventListener('click', (event: MouseEvent) => {
            Modals.copyContent(event, 'fact-modal-carousel', 'fact-copy-content');
        });

        document.getElementById('fact-copy-content-close')?.addEventListener('keyup', (event: KeyboardEvent) => {
            Modals.copyContent(event, 'fact-modal-carousel', 'fact-copy-content');
        });

        document.getElementById('fact-nested-copy-content')?.addEventListener('click', (event: MouseEvent) => {
            Modals.copyContent(event, 'modal-fact-nested-content-carousel', 'fact-nested-copy-paste');
        });

        document.getElementById('fact-nested-copy-content')?.addEventListener('keyup', (event: KeyboardEvent) => {
            Modals.copyContent(event, 'modal-fact-nested-content-carousel', 'fact-nested-copy-paste');
        });
        // scroll-position-select
        // scrollPosition

        const closeOtherSideBars = (barToOpenId: string) => {
            const sidebars = document.getElementsByClassName('sidebar');
            for (const elem in sidebars) {
                const sidebarElem = sidebars[elem]
                if (sidebarElem?.id?.length && sidebarElem?.id != barToOpenId) {
                    if (sidebarElem.classList) {
                        sidebarElem?.classList?.remove('show')
                    }
                }
            }
        }

        // help menu
        const helpMenu = document.getElementById('help-menu');
        helpMenu?.addEventListener('show.bs.collapse', (event: Event) => {
            closeOtherSideBars(event!.target!.id)
        })
        
        // help sidebar section - prevent propagation
        const helpSidebarCollapsableSections = document.querySelectorAll('#help-sections .collapse');
        helpSidebarCollapsableSections?.forEach(helpSection => {
            helpSection?.addEventListener('show.bs.collapse', (event: Event) => {
                event.stopPropagation(); // so that the sidebar doesn't close
            })
        })

        // sections menu
        const sectionsMenu = document.getElementById('sections-menu');
        sectionsMenu?.addEventListener('show.bs.collapse', (event: Event) => {
            Sections.toggle(event as MouseEvent | KeyboardEvent); // needed to populate sections content for some reason
            closeOtherSideBars('sections-menu')
        })

        // facts-menu-button
        const factsMenu = document.getElementById('facts-menu');
        factsMenu?.addEventListener('show.bs.collapse', () => {
            // FactsMenu.toggle(event as MouseEvent | KeyboardEvent); // not needed
            closeOtherSideBars('facts-menu')
        })

        // fact-table
        const factTableMenu = document.getElementById('fact-table-container');
        factTableMenu?.addEventListener('shown.bs.offcanvas', () => FactsTable.toggle(true));
        factTableMenu?.addEventListener('hidden.bs.offcanvas', () => FactsTable.toggle(false));

        // facts-breakdown-button
        const factsBreakdownMenu = document.getElementById('facts-breakdown-container');
        factsBreakdownMenu?.addEventListener('shown.bs.offcanvas', () => FactsChart.toggle(true));
        factsBreakdownMenu?.addEventListener('hidden.bs.offcanvas', () => FactsChart.toggle(false));
    }
}