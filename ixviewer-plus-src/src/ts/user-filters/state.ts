/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

import { Constants } from "../constants/constants";
import { ErrorsMinor } from "../errors/minor";
import { SearchFunctions } from "../search/functions";
import { Facts } from "../facts/facts";

export const UserFiltersState = {
    getAxes: [],
    getMembers: [],
    getBalance: [],
    getMeasure: [],
    getPeriod: [],
    getScale: [],
    getType: [],
    getDataRadios: 0,

    setDataRadios: (input: number) => {
        if (input >= 0 && input <= 5) {
            UserFiltersState.getDataRadios = input;
        } else {
            ErrorsMinor.unknownError();
        }
    },

    getTagsRadios: 0,

    setTagsRadio: (input: number) => {
        if (input >= 0 && input <= 2) {
            UserFiltersState.getTagsRadios = input;
        } else {
            ErrorsMinor.unknownError();
        }
    },

    getUserSearch: {},

    setUserSearch: (input: object) => {
        UserFiltersState.getUserSearch = input;
    },

    tagRadios: (current: HTMLElement, enabledFact: boolean) => {
        // 0 = All
        // 1 = Standard Only
        // 2 = Custom Only
        if (UserFiltersState.getTagsRadios && enabledFact) {
            switch (UserFiltersState.getTagsRadios) {
                case 2: {
                    // Custom Only

                    if (!current.hasAttribute('isCustomOnly')) {
                        current.setAttribute('isCustomOnly',
                            (current.getAttribute('name').split(':')[0].toLowerCase() === Constants.getMetaCustomPrefix) ? true
                                : false);
                    }

                    if (current.hasAttribute('isCustomOnly') && current.getAttribute('isCustomOnly') === 'true') {
                        return true;
                    }
                    return false;
                }
                case 1: {
                    // Standard Only
                    if (!current.hasAttribute('isStandardOnly')) {
                        current.setAttribute('isStandardOnly',
                            (current.getAttribute('name').split(':')[0].toLowerCase() !== Constants.getMetaCustomPrefix) ? true
                                : false);
                    }

                    if (current.hasAttribute('isStandardOnly') && current.getAttribute('isStandardOnly') === 'true') {
                        return true;
                    }
                    return false;
                }
                default: {
                    // All
                    return true;
                }
            }
        }
        return enabledFact;
    },

    periods: (current: HTMLElement, enabledFact: boolean) => {

        if (UserFiltersState.getPeriod.length && enabledFact) {

            for (let i = 0; i < UserFiltersState.getPeriod.length; i++) {
                if (UserFiltersState.getPeriod[i]['contextref'].indexOf(current.getAttribute('contextref')) >= 0) {
                    return true;
                }
            }
            return false;
        }
        return enabledFact;
    },

    measures: (current: HTMLElement, enabledFact: boolean) => {

        if (UserFiltersState.getMeasure.length && enabledFact) {

            if (current.hasAttribute('unitref')) {
                for (let i = 0; i < UserFiltersState.getMeasure.length; i++) {
                    if (current.getAttribute('unitref') === UserFiltersState.getMeasure[i]) {
                        return true;
                    }
                }
            }
            return false;

        }
        return enabledFact;
    },

    axes: (current: HTMLElement, enabledFact: boolean) => {
        if (UserFiltersState.getAxes.length && enabledFact) {

            for (let i = 0; i < UserFiltersState.getAxes.length; i++) {
                if (document.querySelector('#dynamic-xbrl-form [id="' + current.getAttribute('contextref') + '"] [dimension="'
                    + UserFiltersState.getAxes[i]['name'] + '"]')) {
                    return true;
                }
            }
            return false;

        }
        return enabledFact;
    },

    members: (current: HTMLElement, enabledFact: boolean) => {

        if (UserFiltersState.getMembers.length && enabledFact) {
            for (let i = 0; i < UserFiltersState.getMembers.length; i++) {
                for (let k = 0; k < UserFiltersState.getMembers[i]['parentID'].length; k++) {
                    if (current.getAttribute('contextref') === UserFiltersState.getMembers[i]['parentID'][k]) {
                        return true;
                    }
                }
            }
            return false;

        }
        return enabledFact;
    },

    scales: (current: HTMLElement, enabledFact: boolean) => {
        if (UserFiltersState.getScale.length && enabledFact) {

            for (let i = 0; i < UserFiltersState.getScale.length; i++) {
                if (UserFiltersState.getScale[i] === current.getAttribute('scale')) {
                    return true;
                }
            }
            return false;

        }
        return enabledFact;
    },

    types: (current: HTMLElement, enabledFact: boolean) => {
        if (UserFiltersState.getType.length && enabledFact) {
            for (let i = 0; i < UserFiltersState.getType.length; i++) {
                if (current.hasAttribute('name') && current.getAttribute('name').split(':').length === 2) {
                    if (UserFiltersState.getType[i].toLowerCase() === current.getAttribute('name').split(':')[0].toLowerCase()) {
                        return true;
                    }
                }
            }
            return false;
        }
        return enabledFact;
    },


    search: (current: HTMLElement) => {
        let fullContentToRegexAgainst = '';
        let highlight = false;
        if ((Object.keys(UserFiltersState.getUserSearch).length === 2)) {

            if (UserFiltersState.getUserSearch['options'].indexOf(1) >= 0) {
                // include fact name
                fullContentToRegexAgainst += ' ' + SearchFunctions.elementNameForRegex(current);
            }

            if (UserFiltersState.getUserSearch['options'].indexOf(2) >= 0) {
                // include fact content
                fullContentToRegexAgainst += ' ' + SearchFunctions.elementContentForRegex(current);
            }

            if (UserFiltersState.getUserSearch['options'].indexOf(3) >= 0) {
                // include labels
                fullContentToRegexAgainst += ' ' + SearchFunctions.elementLabelForRegex(current);
            }

            if (UserFiltersState.getUserSearch['options'].indexOf(4) >= 0) {
                // include definitions
                fullContentToRegexAgainst += ' ' + SearchFunctions.elementDefinitionForRegex(current);
            }

            if (UserFiltersState.getUserSearch['options'].indexOf(5) >= 0) {
                // include dimensions
                fullContentToRegexAgainst += ' ' + SearchFunctions.elementDimensionsForRegex(current);
            }

            if (UserFiltersState.getUserSearch['options'].indexOf(6) >= 0
                || UserFiltersState.getUserSearch['options'].indexOf(7) >= 0
                || UserFiltersState.getUserSearch['options'].indexOf(9) >= 0
                || UserFiltersState.getUserSearch['options'].indexOf(10) >= 0) {
                // include references
                fullContentToRegexAgainst += ' '
                    + SearchFunctions.elementReferencesForRegex(current, UserFiltersState.getUserSearch);
            }
            highlight = UserFiltersState.getUserSearch.regex.test(fullContentToRegexAgainst);

        }

        if (Facts.isElementContinued(current)) {
            UserFiltersState.setContinuedAtHighlight(current, highlight);
        } else {
            current.setAttribute('highlight-fact', highlight);
        }

    },

    setContinuedAtHighlight: (current: HTMLElement, highlight: boolean) => {
        if (current) {
            current.setAttribute('highlight-fact', highlight.toString());
            if (current.hasAttribute('continuedat')) {

                UserFiltersState.setContinuedAtHighlight((document.getElementById('dynamic-xbrl-form')?.querySelector(
                    '[id="' + current.getAttribute('continuedat') + '"]') as HTMLElement), highlight);
            }
        }

    }

};
