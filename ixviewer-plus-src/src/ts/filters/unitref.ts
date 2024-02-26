/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

import { Constants } from "../constants/constants";

export const FiltersUnitref = {

  getMeasure: (unitref: string) => {
    if (unitref && typeof unitref === 'string') {
      let nameSpace;
      for (const ns in Constants.getHTMLAttributes) {

        if (Constants.getHTMLAttributes[ns] === 'http://www.xbrl.org/2003/instance') {
          nameSpace = ns.split(':')[1];
        }
      }
      const unitRefElement = document.querySelector('[id="' + unitref + '"]');
      if (unitRefElement && nameSpace) {
        if (unitRefElement.querySelector(nameSpace + '\\:divide')) {

          if ((unitRefElement.querySelector(nameSpace + '\\:divide ' + nameSpace + '\\:unitnumerator') && unitRefElement?.querySelector(nameSpace + '\\:divide ' + nameSpace + '\\:unitnumerator')?.innerText?.split(':').length > 1)
            && (unitRefElement.querySelector(nameSpace + '\\:divide ' + nameSpace + '\\:unitdenominator') && unitRefElement?.querySelector(nameSpace + '\\:divide ' + nameSpace + '\\:unitdenominator')?.innerText?.split(':').length > 1)) {

            return unitRefElement.querySelector(nameSpace + '\\:divide ' + nameSpace + '\\:unitnumerator')?.innerText
              .split(':')[1].toUpperCase()
              + ' / '
              + unitRefElement.querySelector(nameSpace + '\\:divide ' + nameSpace + '\\:unitdenominator')?.innerText
                .split(':')[1].toUpperCase();
          }
        } else if (unitRefElement.querySelector('divide')) {
          if ((unitRefElement.querySelector('divide unitnumerator') && unitRefElement
            .querySelector('divide unitnumerator').innerText.split(':').length > 1)
            && (unitRefElement.querySelector('divide unitdenominator') && unitRefElement
              .querySelector('divide unitdenominator').innerText.split(':').length > 1)) {

            return unitRefElement.querySelector('divide unitnumerator').innerText.split(':')[1].toUpperCase() + ' / '
              + unitRefElement.querySelector('divide unitdenominator').innerText.split(':')[1].toUpperCase();
          }
        }

        const measureWithNamespace = unitRefElement.querySelector(nameSpace + '\\:measure');
        if (measureWithNamespace && measureWithNamespace.innerText
          && measureWithNamespace.innerText.split(':').length === 2) {
          return measureWithNamespace.innerText.split(':')[1].toUpperCase();
        }

        const measureWithoutNamespace = unitRefElement.querySelector('measure');
        if (measureWithoutNamespace && measureWithoutNamespace.innerText
          && measureWithoutNamespace.innerText.split(':').length === 2) {
          return measureWithoutNamespace.innerText.split(':')[1].toUpperCase();
        }

      }

      return unitref.toUpperCase() || null;
    }
    return null;
  }
};
