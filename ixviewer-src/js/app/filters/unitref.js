/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var FiltersUnitref = {
  getMeasure : function( unitref ) {
    if ( unitref && typeof unitref === 'string' ) {
      var nameSpace;
      for ( var ns in Constants.getHTMLAttributes ) {
        
        if ( Constants.getHTMLAttributes[ns] === 'http://www.xbrl.org/2003/instance' ) {
          nameSpace = ns.split(':')[1];
        }
      }
      var unitRefElement = document.querySelector('[id="' + unitref + '"]');
      
      if ( unitRefElement && nameSpace ) {
        if ( unitRefElement.querySelector(nameSpace + '\\:divide') ) {
          
          return unitRefElement.querySelector(nameSpace + '\\:divide ' + nameSpace + '\\:unitnumerator').innerText
              .split(':')[1].toUpperCase()
              + ' / '
              + unitRefElement.querySelector(nameSpace + '\\:divide ' + nameSpace + '\\:unitdenominator').innerText
                  .split(':')[1].toUpperCase();
          
        } else {
          
          return unitRefElement.querySelector(nameSpace + '\\:measure').innerText.split(':')[1].toUpperCase();
          
        }
      }
      
      return unitref.toUpperCase() || null;
    }
    return null;
  }
};
