/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

import { Sections } from "./sections";

export const SectionsSearch = {

  submit: () => {

    // 1 => All Sections
    // 2 => Show Current Instance Only
    // 3 => Show External Instance(s) Only

    const options = document.querySelectorAll('[name="sections-search-options"]');


    let valueToSearchFor = (document.getElementById("sections-search") as HTMLInputElement)?.value;

    // here we sanitize the users input to account for Regex patterns
    valueToSearchFor = valueToSearchFor.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");

    let optionsArray = Array.prototype.slice.call(options);
    optionsArray = optionsArray
      .map((current) => {
        if (current["checked"]) {
          return parseInt(current["value"]);
        }
      })
      .filter((element) => {
        return element;
      });

    const searchObject = {
      type: optionsArray[0],
      value: valueToSearchFor ? new RegExp(valueToSearchFor, "i") : null
    };
    Sections.populate(searchObject, null);
    return false;
  },

  clear: () => {
    (document.querySelector(
      'input[name="sections-search-options"]'
    ) as HTMLInputElement).checked = true;
    (document.getElementById("sections-search") as HTMLInputElement).value = "";
    Sections.populate({}, null);
  }
};
