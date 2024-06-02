/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

import { FlexSearch } from "../flex-search/flex-search";
import { UserFiltersState } from "./state";

export const UserFiltersDataRadios = {

    clickEvent: (event: Event) => {

        // 0 = All
        // 1 = Amounts Only
        // 2 = Text Only
        // 3 = Calculations Only
        // 4 = Negatives Only
        // 5 = Additional Items Only

        const radioValue = parseInt((event.target as HTMLInputElement).value);
        UserFiltersState.getDataRadios = radioValue;
        FlexSearch.filterFacts();
    }

};
