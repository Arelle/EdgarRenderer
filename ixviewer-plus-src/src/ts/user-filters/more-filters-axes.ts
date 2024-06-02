/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

import { FlexSearch } from "../flex-search/flex-search";
import { UserFiltersState } from "./state";

export const UserFiltersMoreFiltersAxes = {

    clickEvent: (input: string) => {
        const tempSet = new Set(UserFiltersState.getAxes);
        if (tempSet.has(input)) {
            (document.getElementById('user-filters-axis')?.querySelector(`[name='${input}']`) as HTMLInputElement).checked = false;
            tempSet.delete(input)
        } else {
            (document.getElementById('user-filters-axis')?.querySelector(`[name='${input}']`) as HTMLInputElement).checked = true;
            tempSet.add(input);
        }
        UserFiltersState.getAxes = [...tempSet];
        FlexSearch.filterFacts()
    },

    parentClick: (input: Array<{ type: string, value: string }>, element: HTMLInputElement) => {
        const addIfTrue = element.checked;
        const tempSet = new Set(UserFiltersState.getAxes);
        input.forEach((current) => {
            if (addIfTrue) {
                tempSet.add(current.value);
                (document.getElementById('user-filters-axis')?.querySelector(`[name='${current.value}']`) as HTMLInputElement).checked = true;
            } else {
                tempSet.delete(current.value);
                (document.getElementById('user-filters-axis')?.querySelector(`[name='${current.value}']`) as HTMLInputElement).checked = false;
            }
        });
        UserFiltersState.getAxes = [...tempSet];
        FlexSearch.filterFacts()
    },
};
