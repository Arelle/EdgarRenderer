/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

import { FlexSearch } from "../flex-search/flex-search";
import { UserFiltersState } from "./state";

export const UserFiltersMoreFiltersMeasure = {

    clickEvent: (input: string) => {
        const tempSet = new Set(UserFiltersState.getMeasure);
        if (tempSet.has(input)) {
            tempSet.delete(input)
        } else {
            tempSet.add(input);
        }
        UserFiltersState.getMeasure = [...tempSet];
        FlexSearch.filterFacts();
    },

};
