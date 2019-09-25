/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var FiltersReports = {
  getReportsByGroupType : function( input ) {
    if ( input && typeof input === 'string' ) {
      return Constants.getMetaReports.filter(function( element ) {
        
        if ( element['groupType'] === input && (element['firstAnchor'] || element['uniqueAnchor']) ) {
          return true;
        }
      });
    }
    return null;
  }
};
