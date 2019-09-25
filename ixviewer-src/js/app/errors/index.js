/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var Errors = {
  
  checkPerformanceConcern : function( totalTaxonomies ) {
    if ( totalTaxonomies && typeof totalTaxonomies === 'number' ) {
      var isChrome = window.chrome;
      
      if ( (!isChrome && totalTaxonomies > 1000) || (isChrome && totalTaxonomies >= 7500) ) {
        var performanceConcern = document.querySelectorAll('.performance-concern');
        var performanceConcernArray = Array.prototype.slice.call(performanceConcern);
        performanceConcernArray.forEach(function( current ) {
          current.classList.remove('d-none');
        });
      }
      return;
    } else {
      return null;
    }
  },
  
  checkFileSizeForLimits : function( fileSize ) {
    if ( fileSize && typeof fileSize === 'number' ) {
      // fileSize is in bytes
      if ( fileSize > Constants.fileSizeError[0] ) {
        
        ErrorsMinor.fileSize();
        return;
      }
      return;
    } else {
      return;
    }
  },
  
  updateMainContainerHeight : function( removingWarning ) {
    
    removingWarning = removingWarning || false;
    
    var numberOfChildrenInErrorContainer = document.getElementById('error-container').children.length;
    
    if ( !removingWarning ) {
      numberOfChildrenInErrorContainer++;
    }
    
    var container = document.querySelector('.main-container');
    
    container.style.height = 'calc(100vh - ' + (numberOfChildrenInErrorContainer * 45) + 'px)';
    
  }
};
