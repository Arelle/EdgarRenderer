/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var Errors = {
  
  checkPerformanceConcern : function( totalTaxonomies ) {
    if ( totalTaxonomies && typeof totalTaxonomies === 'number' ) {
      if ( (!Constants.getBrowserType['chrome'] && totalTaxonomies > 1000)
          || (Constants.getBrowserType['chrome'] && totalTaxonomies >= 7500) ) {
        var performanceConcern = document.querySelectorAll('.performance-concern');
        var performanceConcernArray = Array.prototype.slice.call(performanceConcern);
        performanceConcernArray.forEach(function( current ) {
          current.classList.remove('d-none');
          current.classList.remove('fa-clock');
        });
      }
      return;
    }
    return null;
    
  },
  
  checkFileSizeForLimits : function( fileSize ) {
    if ( fileSize && typeof fileSize === 'number' ) {
      // fileSize is in bytes
      if ( fileSize > Constants.fileSizeError[0] ) {
        
        ErrorsMinor.fileSize();
        return;
      }
      return;
    }
    return;
    
  },
  
  updateMainContainerHeight : function( removingWarning ) {
    removingWarning = removingWarning || false;
    
    var numberOfChildrenInErrorContainer = document.getElementById('error-container').children.length;
    numberOfChildrenInErrorContainer++;
    
    var container = document.querySelector('.main-container');
    container.style.height = 'calc(100vh - ' + (numberOfChildrenInErrorContainer * 45) + 'px)';
  }
};
