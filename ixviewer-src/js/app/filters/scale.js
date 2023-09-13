/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var FiltersScale = {
  getScale : function( scale ) {
    if ( scale && Constants.getScaleOptions[scale.toString()] ) {
      return Constants.getScaleOptions[scale.toString()];
    }
    return null;
    
  }
};
