/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var FiltersCredit = {

  getBalance: function (element) {
    if (element && typeof element === 'object') {
      var tagInformation = FiltersName.getTag(element.getAttribute('name'));

      if (tagInformation && tagInformation.length && tagInformation[0]['crdr']) {
        return tagInformation[0]['crdr'].charAt(0).toUpperCase() + tagInformation[0]['crdr'].substring(1);
      }
    }
    return null;
  },

  getDecimals: function (decimals) {
    if (decimals && typeof decimals === 'string' && Constants.getDecimalOptions[decimals]) {
      return Constants.getDecimalOptions[decimals];
    }
    return null;
  }
};
