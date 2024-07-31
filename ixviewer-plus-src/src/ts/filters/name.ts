/*
 * Created by staff of the U.S. Securities and Exchange Commission. Data and
 * content created by government employees within the scope of their
 * employment are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

import { Constants } from "../constants/constants";

export const FiltersName = {

    getDefinition: (name: string) => {
        if (name && typeof name === 'string') {
            const foundTagInformation = Constants.getMetaTags.filter((element: { [x: string]: string; }) => {
                if (element['original-name'] === name.replace(':', '_')) {
                    return true;
                }
                return false;
            });
            if (foundTagInformation && foundTagInformation[0] && foundTagInformation[0]['lang']) {
                let stringToReturn = '';
                Object.keys(foundTagInformation[0]['lang']).forEach(
                    (current) => {
                        if (foundTagInformation[0]['lang'][current]['role']
                            && foundTagInformation[0]['lang'][current]['role']['documentation']) {

                            if (Object.keys(foundTagInformation[0]['lang']).length === 1) {
                                stringToReturn = foundTagInformation[0]['lang'][current]['role']['documentation'];
                            } else {

                                stringToReturn += foundTagInformation[0]['lang'][current]['role']['documentation'] + ' ';
                            }
                        }

                    });
                return stringToReturn;
            }
            return null;
        }
        return null;
    },

    getAllLabels: (name: string) => {
        if (name && typeof name === 'string') {
            const foundTagInformation = Constants.getMetaTags.filter((element: { [x: string]: string; }) => {
                if (element['original-name'] === name.replace(':', '_')) {
                    return true;
                }
                return false;
            });
            if (foundTagInformation && foundTagInformation[0] && foundTagInformation[0]['lang']) {
                const arrayToReturn: Array<string> = [];

                Object.keys(foundTagInformation[0]['lang']).forEach((current) => {

                    if (foundTagInformation[0]['lang'][current]['role']) {

                        for (const label in foundTagInformation[0]['lang'][current]['role']) {
                            if (label.toLowerCase().indexOf('label') >= 0) {
                                arrayToReturn.push(foundTagInformation[0]['lang'][current]['role'][label]);
                            }
                        }
                    }
                });
                return arrayToReturn;
            }
        }
        return [];
    },

    getTag: (name: string) => {
        if (name && typeof name === 'string') {
            return Constants.getMetaTags.filter((element: { [x: string]: string; }) => {
                return element['original-name'] === name.replace(':', '_');
            });
        }
    },

};
