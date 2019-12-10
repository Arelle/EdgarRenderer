/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var FiltersFormat = {
  getFormattedFormat : function( format ) {
    if ( format && typeof format === 'string' ) {
      if ( format.split(':').length > 1 ) {
        return format.split(':')[1];
      }
      return null;
    }
    return null;
  }
};
