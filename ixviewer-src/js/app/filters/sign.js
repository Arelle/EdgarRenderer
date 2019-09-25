/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var FiltersSign = {
  getSign : function( sign, tag ) {
    if ( tag && typeof tag === 'string' ) {
      var signOptions = {
        '-' : 'Negative',
        '+' : 'Positive'
      };
      if ( sign && typeof sign === 'string' ) {
        return signOptions[sign];
      } else if ( tag.toLowerCase().endsWith(':nonfraction') ) {
        return signOptions['+']
      } else {
        return null;
      }
    }
    return null;
  }
};
