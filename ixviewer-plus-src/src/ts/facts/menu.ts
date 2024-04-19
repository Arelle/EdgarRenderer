/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

import { FactMap } from "../facts/map";
import { Pagination } from "../pagination/pagination";
import { UserFiltersState } from "../user-filters/state";
import { FactsGeneral } from "./general";

export const FactsMenu = {

  toggle: (event: MouseEvent | KeyboardEvent) => {

    if (
      Object.prototype.hasOwnProperty.call(event, 'key') &&
      !((event as KeyboardEvent).key === 'Enter' || (event as KeyboardEvent).key === 'Space')
    ) {
      return;
    }


    if (event.target && (event.target as HTMLElement).classList && (event.target as HTMLElement).classList.contains('disabled')) {
      return;
    }
    FactsMenu.prepareForPagination();

  },

  prepareForPagination: () => {
    let enabledFacts;
    if (Object.keys(UserFiltersState.getUserSearch).length === 0) {
      enabledFacts = FactMap.getEnabledFacts();
    } else {
      enabledFacts = FactMap.getEnabledHighlightedFacts();
    }
    const enabledFactsArray = FactsGeneral.specialSort(enabledFacts);
    Pagination.init(enabledFactsArray, ('#facts-menu-list-pagination .pagination'),
      ('#facts-menu-list-pagination .list-group'), true);

  }
};
