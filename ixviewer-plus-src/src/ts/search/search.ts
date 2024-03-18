/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

import { ConstantsFunctions } from "../constants/functions";
import { FactMap } from "../facts/map";
import { FactsGeneral } from "../facts/general";
import { FlexSearch } from "../flex-search/flex-search";
import { UserFiltersState } from "../user-filters/state";

export const Search = {

  clear: () => {
    ConstantsFunctions.emptyHTMLByID('suggestions');
    (document.getElementById('global-search') as HTMLInputElement).value = '';
    UserFiltersState.setUserSearch({});
    FlexSearch.searchFacts({});
  },

  submit: () => {
    // 1 => Include Fact Name
    // 2 => Include Fact Content
    // 3 => Include Labels
    // 4 => Include Definitions
    // 5 => Include Dimensions
    // 6 => Include References
    ConstantsFunctions.emptyHTMLByID('suggestions');
    let valueToSearchFor = (document.getElementById('global-search') as HTMLInputElement).value;
    if (valueToSearchFor.length > 1) {
      // here we sanitize the users input to account for Regex patterns
      valueToSearchFor = valueToSearchFor.replace(/[\\{}()[\]^$+*?.]/g, '\\$&');

      const options = document.querySelectorAll('[name="search-options"]');
      let optionsArray = Array.prototype.slice.call(options);
      optionsArray = optionsArray.map((current) => {
        if (current['checked']) {
          return parseInt(current['value']);
        }
      }).filter((element) => {
        return element;
      });

      valueToSearchFor = Search.createValueToSearchFor(valueToSearchFor);

      const objectForState = {
        value: [valueToSearchFor],
        'options': optionsArray
      };
      UserFiltersState.setUserSearch(objectForState);
      FlexSearch.searchFacts(objectForState);
    }
    return false;
  },

  createValueToSearchFor: (input: string) => {
    // AND template = (?=.*VARIABLE1)(?=.*VARIABLE2)
    // OR template = (VARIABLE1)|(VARIABLE2)

    // TODO this will require a second/third look
    const inputArray = input.replace(/ and /gi, ' & ').replace(/ or /gi, ' | ').split(' ');
    if (inputArray.length > 1) {
      let regex = '^';
      inputArray.forEach((current: string) => {
        if (current === '|') {
          regex += '|';
        } else if (current === '&') {
          // business as usual
        } else {
          regex += '(?=.*' + current + ')';
        }
      });
      return regex;
    }
    return input;
  },

  suggestions: () => {
    let valueToSearchFor = (document.getElementById('global-search') as HTMLInputElement).value;
    ConstantsFunctions.emptyHTMLByID('suggestions');
    if (valueToSearchFor.length > 1) {
      // here we sanitize the users input to account for Regex patterns
      valueToSearchFor = valueToSearchFor.replace(/[\\{}()[\]^$+*?.]/g, '\\$&');

      const options = document.querySelectorAll('[name="search-options"]');
      let optionsArray = Array.prototype.slice.call(options);
      optionsArray = optionsArray.map((current) => {
        if (current['checked']) {
          return parseInt(current['value']);
        }
      }).filter((element) => {
        return element;
      });

      valueToSearchFor = Search.createValueToSearchFor(valueToSearchFor);

      const objectForState = {
        value: [valueToSearchFor],
        'options': optionsArray
      };
      const results: Array<string> | undefined = FlexSearch.searchFacts(objectForState, true);
      const ul = document.getElementById('suggestions') as HTMLElement;
      results?.slice(0, 3).forEach((current: string) => {
        const template = FactsGeneral.getFactListTemplate(current);
        ul.append(template as unknown as HTMLElement);
      });

      if (results!.length > 5) {
        const li = document.createElement('li');
        li.classList.add('list-group-item');
        li.classList.add('not-numbered');
        li.classList.add('d-flex');
        li.classList.add('justify-content-between');
        li.classList.add('align-items-start');

        const div = document.createElement('div');
        div.classList.add('ms-2');
        div.classList.add('me-auto');

        const title = document.createTextNode(`More Facts`);
        div.append(title);
        li.append(div);
        ul.append(li);
      }
      document.getElementById('global-search-form')?.append(ul);
    }
  },

  suggestionsTemplate: (factID: string) => {
    const fact = FactMap.getByID(factID);
    if (fact) {
      const li = document.createElement('li');
      li.classList.add('list-group-item');
      li.classList.add('d-flex');
      li.classList.add('justify-content-between');
      li.classList.add('align-items-start');

      const div = document.createElement('div');
      div.classList.add('ms-2');
      div.classList.add('me-auto');

      const div1 = document.createElement('div');
      div1.classList.add('fw-bold');
      const title = document.createTextNode(ConstantsFunctions.getFactLabel(fact.labels));
      const period = document.createTextNode(fact.period);
      div1.append(title);
      div.append(div1);
      div.append(period);
      li.append(div);

      return li;
    }
  },

  suggestionsEmpty: () => {
    ConstantsFunctions.emptyHTMLByID('suggestions')
  },

}
