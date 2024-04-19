/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

import { FlexSearch } from "../flex-search/flex-search";
import { UserFiltersState } from "./state";

export const UserFiltersMoreFiltersBalances = {


  clickEvent: (event: MouseEvent | KeyboardEvent, index: number) => {
    const balance = (index === 0) ? 'debit' : 'credit';
    const tempSet = new Set(UserFiltersState.getBalance);
    if (tempSet.has(balance)) {
      tempSet.delete(balance)
    } else {
      tempSet.add(balance);
    }
    UserFiltersState.getBalance = [...tempSet];
    FlexSearch.filterFacts()
  },

};
