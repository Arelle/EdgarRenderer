/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

import { FlexSearch } from "../flex-search/flex-search";
import { UserFiltersState } from "./state";

export const UserFiltersDropdown = {

    filterActive: false,

    init: () => {
        UserFiltersDropdown.dataRadios();
        UserFiltersDropdown.tagsRadios();
        UserFiltersDropdown.moreFilters();
        UserFiltersDropdown.updateFilterActive();
        UserFiltersDropdown.activeFilters();
    },

    activeFilters: () => {
        if (UserFiltersDropdown.filterActive) {
            document.getElementById('current-filters-reset')?.classList.remove('d-none');
        } else {
            document.getElementById('current-filters-reset')?.classList.add('d-none');
        }
    },

    dataRadios: () => {
        if (UserFiltersState.getDataRadios > 0) {
            document.getElementById('nav-filter-data')?.setAttribute('title', 'This filter is in use.');
            document.getElementById('nav-filter-data')?.classList.add('text-warning');
            // UserFiltersDropdown.filterActive = true;
        } else {
            document.getElementById('nav-filter-data')?.removeAttribute('title');
            document.getElementById('nav-filter-data')?.classList.remove('text-warning');
        }
    },

    tagsRadios: () => {
        if (UserFiltersState.getTagsRadios > 0) {
            document.getElementById('nav-filter-tags')?.setAttribute('title', 'This filter is in use.');
            document.getElementById('nav-filter-tags')?.classList.add('text-warning');
            // UserFiltersDropdown.filterActive = true;
        } else {
            document.getElementById('nav-filter-tags')?.removeAttribute('title');
            document.getElementById('nav-filter-tags')?.classList.remove('text-warning');
        }
    },

    moreFilters: () => {
        let moreFiltersCount = 0;
        moreFiltersCount += UserFiltersState.getAxes.length;
        moreFiltersCount += UserFiltersState.getMembers.length;
        moreFiltersCount += UserFiltersState.getBalance.length;
        moreFiltersCount += UserFiltersState.getMeasure.length;
        moreFiltersCount += UserFiltersState.getPeriod.length;
        moreFiltersCount += UserFiltersState.getScale.length;

        if (moreFiltersCount > 0) {
            document.getElementById('nav-filter-more').querySelector('.badge').innerText = moreFiltersCount;
            document.getElementById('nav-filter-more')?.setAttribute('title', 'This filter is in use.');
            document.getElementById('nav-filter-more')?.classList.add('text-warning');
            UserFiltersDropdown.filterActive = true;
        } else {
            document.getElementById('nav-filter-more').querySelector('.badge').innerText = '';
            document.getElementById('nav-filter-more')?.removeAttribute('title');
            document.getElementById('nav-filter-more')?.classList.remove('text-warning');
        }
    },

    resetAll: () => {
        UserFiltersDropdown.filterActive = false;

        UserFiltersState.getDataRadios = 0;
        (document.querySelector('input[name="data-radios"]') as HTMLInputElement).checked = true;

        UserFiltersState.getTagsRadios = 0;
        (document.querySelector('input[name="tags-radios"]') as HTMLInputElement).checked = true;

        UserFiltersState.getAxes = [];
        const foundAxes = document.querySelectorAll('#user-filters-axis input');
        const foundAxesArray = Array.prototype.slice.call(foundAxes);
        foundAxesArray.forEach((current) => {
            current.checked = false;
        });

        UserFiltersState.getMembers = [];
        const foundMembers = document.querySelectorAll('#user-filters-members input');
        const foundMembersArray = Array.prototype.slice.call(foundMembers);
        foundMembersArray.forEach((current) => {
            current.checked = false;
        });

        UserFiltersState.getBalance = [];
        const foundBalances = document.querySelectorAll('#user-filters-balances input');
        const foundBalancesArray = Array.prototype.slice.call(foundBalances);
        foundBalancesArray.forEach((current) => {
            current.checked = false;
        });

        UserFiltersState.getMeasure = [];
        const foundMeasures = document.querySelectorAll('#user-filters-measures input');
        const foundMeasuresArray = Array.prototype.slice.call(foundMeasures);
        foundMeasuresArray.forEach((current) => {
            current.checked = false;
        });

        UserFiltersState.getPeriod = [];
        const foundPeriods = document.querySelectorAll('#user-filters-periods input');
        const foundPeriodsArray = Array.prototype.slice.call(foundPeriods);
        foundPeriodsArray.forEach((current) => {
            current.checked = false;
        });

        UserFiltersState.getScale = [];
        const foundScales = document.querySelectorAll('#user-filters-scales input');
        const foundScalesArray = Array.prototype.slice.call(foundScales);
        foundScalesArray.forEach((current) => {
            current.checked = false;
        });

        FlexSearch.filterFacts();
    },

    updateFilterActive: () => {
        let totalFiltersCount = 0;
        totalFiltersCount += UserFiltersState.getDataRadios;
        totalFiltersCount += UserFiltersState.getTagsRadios;
        totalFiltersCount += UserFiltersState.getAxes.length;
        totalFiltersCount += UserFiltersState.getMembers.length;
        totalFiltersCount += UserFiltersState.getBalance.length;
        totalFiltersCount += UserFiltersState.getMeasure.length;
        totalFiltersCount += UserFiltersState.getPeriod.length;
        totalFiltersCount += UserFiltersState.getScale.length;

        if (totalFiltersCount === 0) {
            UserFiltersDropdown.filterActive = false;
        } else {
            UserFiltersDropdown.filterActive = true;
        }
    }
};
