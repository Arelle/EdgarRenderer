/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

import { UserFiltersDataRadios } from "./data-radios";
import { UserFiltersMoreFiltersAxesSetUp } from "./more-filters-axes-set-up";
import { UserFiltersMoreFiltersMeasureSetUp } from "./more-filters-measure-set-up";
import { UserFiltersMoreFiltersMembersSetUp } from "./more-filters-members-set-up";
import { UserFiltersMoreFiltersPeriodSetUp } from "./more-filters-period-set-up";
import { UserFiltersMoreFiltersScaleSetUp } from "./more-filters-scale-set-up";
import { UserFiltersTagsRadios } from "./tags-radios";

export const UserFiltersGeneral = {

    filterSetup: false,

    moreFiltersClickEvent: () => {
        if (!UserFiltersGeneral.filtersSetup) {
            UserFiltersMoreFiltersPeriodSetUp.setPeriods();
            UserFiltersMoreFiltersMeasureSetUp.setMeasures();
            UserFiltersMoreFiltersAxesSetUp.setAxes();
            UserFiltersMoreFiltersMembersSetUp.setMembers();
            UserFiltersMoreFiltersScaleSetUp.setScales()
            UserFiltersGeneral.filtersSetup = true;
        }
    },

    setEnabledFacts: () => {

        const foundFactsArray = Array.from(document.getElementById('dynamic-xbrl-form')!.querySelectorAll('[contextref]'));
        foundFactsArray.forEach((current) => {
            if (UserFiltersGeneral.getAllFilteredData.indexOf(current) >= 0) {
                current.setAttribute('enabled-fact', 'true');
            } else {
                current.setAttribute('enabled-fact', 'false');
            }
        });

    },

    resetAllFilteredData: () => {
        const foundFacts = document.getElementById('dynamic-xbrl-form')!.querySelectorAll('[contextref]');

        const foundFactsArray = Array.prototype.slice.call(foundFacts);

        UserFiltersGeneral.getAllFilteredData = foundFactsArray;
    },

    getAllFilteredData: null,

    updateCurrentFiltersDropdown: () => {

        if (UserFiltersGeneral.getCurrentTagsFilter) {

            document.getElementById('current-filters-dropdown')?.classList.remove('d-none');
            const div = document.createElement('div');
            const a = document.createElement('a');
            a.classList.add('dropdown-item');
            a.classList.add('click');
            a.addEventListener('click', () => {
                UserFiltersGeneral.resetTagsFilter();
            });
            a.addEventListener('keyup', () => {
                UserFiltersGeneral.resetTagsFilter();
            });
            const label = document.createElement('label');
            const i = document.createElement('i');
            i.classList.add('fas');
            i.classList.add('fa-times');
            i.classList.add('mr-1');

            const text = document.createTextNode(UserFiltersGeneral.getCurrentTagsFilter);
            label.appendChild(text);
            label.appendChild(i);
            a.appendChild(label);
            div.appendChild(a)

            let dropdownHtml = '<a onclick="UserFiltersGeneral.resetTagsFilter();" class="dropdown-item click">';
            dropdownHtml += '<label><i class="fas fa-times mr-1"></i>';
            dropdownHtml += UserFiltersGeneral.getCurrentTagsFilter;
            dropdownHtml += '</label></a>';
            document.getElementById('current-filters-tags')!.innerHTML = dropdownHtml;
        }
        if (!UserFiltersGeneral.getCurrentTagsFilter) {

            document.getElementById('current-filters-tags')!.innerHTML = '';
        }

        if (UserFiltersGeneral.getCurrentDataFilter) {

            document.getElementById('current-filters-dropdown')?.classList.remove('d-none');
            let dropdownHtml = '<a onclick="UserFiltersGeneral.resetDataFilter();" class="dropdown-item click">';
            dropdownHtml += '<label><i class="fas fa-times mr-1"></i>';
            dropdownHtml += UserFiltersGeneral.getCurrentDataFilter;
            dropdownHtml += '</label></a>';
            document.getElementById('current-filters-data')!.innerHTML = dropdownHtml;
        }
        if (!UserFiltersGeneral.getCurrentDataFilter) {

            document.getElementById('current-filters-data')!.innerHTML = '';
        }

        if (!UserFiltersGeneral.getCurrentTagsFilter && !UserFiltersGeneral.getCurrentDataFilter) {

            document.getElementById('current-filters-dropdown')?.classList.add('d-none');
        }
    },

    setCurrentDataFilter: (input: null) => {
        if (input) {
            UserFiltersGeneral.getCurrentDataFilter = input;
        } else {
            UserFiltersGeneral.getCurrentDataFilter = null;
        }

        UserFiltersGeneral.updateCurrentFiltersDropdown();
    },

    getCurrentDataFilter: null,

    setCurrentTagsFilter: (input: null) => {
        if (input) {
            UserFiltersGeneral.getCurrentTagsFilter = input;
        } else {
            UserFiltersGeneral.getCurrentTagsFilter = null;
        }

        UserFiltersGeneral.updateCurrentFiltersDropdown();
    },

    getCurrentTagsFilter: null,

    resetDataFilter: () => {
        const radios = document.querySelectorAll('[name="data-radios"]');
        const radiosArray = Array.prototype.slice.call(radios);
        UserFiltersGeneral.getCurrentDataFilter = null;

        radiosArray.forEach((current, index) => {
            if (index === 0) {
                current['checked'] = true;
                UserFiltersDataRadios.all();
            } else {
                current['checked'] = false;
            }
        });
    },

    resetTagsFilter: () => {
        const radios = document.querySelectorAll('[name="tags-radios"]');
        const radiosArray = Array.prototype.slice.call(radios);
        UserFiltersGeneral.getCurrentTagsFilter = null;

        radiosArray.forEach((current, index) => {
            if (index === 0) {
                current['checked'] = true;
                UserFiltersTagsRadios.all();
            } else {
                current['checked'] = false;
            }
        });
    },

    resetAllFilters: () => {
        UserFiltersGeneral.resetDataFilter();
        UserFiltersGeneral.resetTagsFilter();
    },

    emptyMoreFilters: () => {

        UserFiltersMoreFiltersPeriodSetUp.filtersSet = false;
        UserFiltersMoreFiltersMeasureSetUp.filtersSet = false;
        UserFiltersMoreFiltersAxesSetUp.filtersSet = false;
        UserFiltersMoreFiltersMembersSetUp.filtersSet = false;
        UserFiltersMoreFiltersScaleSetUp.filtersSet = false;

    }

};
