/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

import { FlexSearch } from "../flex-search";
import { UserFiltersState } from "./state";

export const UserFiltersMoreFiltersAxes = {

  clickEvent: (input: string) => {
    const tempSet = new Set(UserFiltersState.getAxes);
    if (tempSet.has(input)) {
      tempSet.delete(input)
    } else {
      tempSet.add(input);
    }
    UserFiltersState.getAxes = [...tempSet];
    FlexSearch.filterFacts()
  },

  parentClick: (input: Array<{ type: string, value: string }>, element: HTMLInputElement) => {
    const addIfTrue = element.checked;
    const tempSet = new Set(UserFiltersState.getAxes);
    input.forEach((current) => {
      addIfTrue ? tempSet.add(current.value) : tempSet.delete(current.value);
    });
    UserFiltersState.getAxes = [...tempSet];
    FlexSearch.filterFacts()
  },
};
