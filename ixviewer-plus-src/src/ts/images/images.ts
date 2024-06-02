/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

import { HelpersUrl } from "../helpers/url";

export const Images = {

  updateLinks: () => {

    const foundImages = document.getElementById('dynamic-xbrl-form')?.querySelectorAll('img');

    const foundImagesArray = Array.prototype.slice.call(foundImages);

    foundImagesArray.forEach((current) => {
      // HF: support embedded images (ESEF), e.g. img src='data:..'
      if (current['src'].substr(0, 5) !== 'data:') {
        const imageSRC = current['src'].substr(current['src'].lastIndexOf('/') + 1);
        current.setAttribute('data-src', HelpersUrl.getFormAbsoluteURL + imageSRC);
        current.removeAttribute('src');
        const img = new Image();
        img.src = current.getAttribute('data-src');
        img.onload = () => {
          current.setAttribute('src', current.getAttribute('data-src'));
        };
      }
    });
  }
};
