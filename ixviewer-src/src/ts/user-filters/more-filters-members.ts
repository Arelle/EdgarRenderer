/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

import { FlexSearch } from "../flex-search";
import { UserFiltersState } from "./state";

export const UserFiltersMoreFiltersMembers = {

  clickEvent: (input: string) => {
    const tempSet = new Set(UserFiltersState.getMembers);
    if (tempSet.has(input)) {
      tempSet.delete(input)
    } else {
      tempSet.add(input);
    }
    UserFiltersState.getMembers = [...tempSet];

    FlexSearch.filterFacts();
  },

  parentClick: (input: Array<{ type: string, value: string }>, element: HTMLInputElement) => {
    const addIfTrue = element.checked;
    const tempSet = new Set(UserFiltersState.getMembers);
    input.forEach((current) => {
      addIfTrue ? tempSet.add(current.value) : tempSet.delete(current.value);
    });
    UserFiltersState.getMembers = [...tempSet];
    FlexSearch.filterFacts();
  },
};
