/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var Links = {
  
  init : function( ) {
    
    if ( (Constants.getMetaSourceDocuments.length > 1) && (Constants.getMetaVersion >= 2.1) ) {
      Links.updateLinks();
    }
    
    Links.absoluteLinks();
  },
  
  updateLinks : function( ) {
    
    document.getElementById('sections-search-additional').classList.remove('d-none');
    document.getElementById('links-dropdown').classList.remove('d-none');
    
    Links.populate();
  },
  
  absoluteLinks : function( ) {
    var foundLinks = document.getElementById('dynamic-xbrl-form').querySelectorAll('[data-link],[href]');
    
    var foundLinksArray = Array.prototype.slice.call(foundLinks);
    
    foundLinksArray.forEach(function( current ) {
      // console.log(current);
      HelpersUrl.addLinkattributes(current);
      
    });
    
  },
  
  clickEventInternal : function( event, element ) {
    // all element hrefs will be an absolute url
    // all element data-link will be the form url
    event.preventDefault();
    
    if ( element.getAttribute('href') && element.getAttribute('href') !== '#' && element.getAttribute('data-link') ) {
      AppInit.init(element.getAttribute('data-link'), function( ) {
        AppInit.additionalSetup();
      });
    }
  },
  
  populate : function( ) {
    
    var innerHtml = '';
    Constants.getMetaSourceDocuments
        .forEach(function( current ) {
          if ( current !== HelpersUrl.getHTMLFileName ) {
            
            innerHtml += '<a onclick="Links.clickEventInternal(event, this)" href="' + current + '" data-link="'
                + current + '" class="dropdown-item">' + current + '</a>';
          } else {
            
            innerHtml += '<a class="dropdown-item" href="#" aria-disabled="true"><i title="Current Form" class="fa fa-bookmark"></i> '
                + current;
          }
        });
    document.getElementById('links-dropdown-content').innerHTML = innerHtml;
  }

};
