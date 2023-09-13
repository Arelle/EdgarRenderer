/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var Images = {
  updateLinks : function( ) {
    
    var foundImages = document.getElementById('dynamic-xbrl-form').querySelectorAll('img');
    
    var foundImagesArray = Array.prototype.slice.call(foundImages);
    
    foundImagesArray.forEach(function( current ) {
     // HF: support embedded images (ESEF), e.g. img src='data:..'
     if (current['src'].substr(0, 5) !== 'data:') {
      var imageSRC = current['src'].substr(current['src'].lastIndexOf('/') + 1);
      current.setAttribute('data-src', HelpersUrl.getFormAbsoluteURL + imageSRC);
      current.removeAttribute('src');
      var img = new Image();
      img.src = current.getAttribute('data-src');
      img.onload = function( ) {
        current.setAttribute('src', current.getAttribute('data-src'));
      };
     }
    });
  }
};
