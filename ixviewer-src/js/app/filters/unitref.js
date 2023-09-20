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
          
          if ( (unitRefElement.querySelector(nameSpace + '\\:divide ' + nameSpace + '\\:unitnumerator') && unitRefElement
              .querySelector(nameSpace + '\\:divide ' + nameSpace + '\\:unitnumerator').innerHTML.split(':').length > 1)
              && (unitRefElement.querySelector(nameSpace + '\\:divide ' + nameSpace + '\\:unitdenominator') && unitRefElement
                  .querySelector(nameSpace + '\\:divide ' + nameSpace + '\\:unitdenominator').innerHTML.split(':').length > 1) ) {
            
            return unitRefElement.querySelector(nameSpace + '\\:divide ' + nameSpace + '\\:unitnumerator').innerHTML
                .split(':')[1].toUpperCase()
                + ' / '
                + unitRefElement.querySelector(nameSpace + '\\:divide ' + nameSpace + '\\:unitdenominator').innerHTML
                    .split(':')[1].toUpperCase();
          }
        } else if ( unitRefElement.querySelector('divide') ) {
          if ( (unitRefElement.querySelector('divide unitnumerator') && unitRefElement
              .querySelector('divide unitnumerator').innerHTML.split(':').length > 1)
              && (unitRefElement.querySelector('divide unitdenominator') && unitRefElement
                  .querySelector('divide unitdenominator').innerHTML.split(':').length > 1) ) {
            
            return unitRefElement.querySelector('divide unitnumerator').innerHTML.split(':')[1].toUpperCase() + ' / '
                + unitRefElement.querySelector('divide unitdenominator').innerHTML.split(':')[1].toUpperCase();
          }
        }
        
        var measureWithNamespace = unitRefElement.querySelector(nameSpace + '\\:measure');
        if ( measureWithNamespace && measureWithNamespace.innerHTML
            && measureWithNamespace.innerHTML.split(':').length === 2 ) {
          return measureWithNamespace.innerHTML.split(':')[1].toUpperCase();
        }
        
        var measureWithoutNamespace = unitRefElement.querySelector('measure');
        if ( measureWithoutNamespace && measureWithoutNamespace.innerHTML
            && measureWithoutNamespace.innerHTML.split(':').length === 2 ) {
          return measureWithoutNamespace.innerHTML.split(':')[1].toUpperCase();
        }
        
      }
      
      return unitref.toUpperCase() || null;
    }
    return null;
  }
};
