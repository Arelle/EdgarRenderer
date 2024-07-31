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
    
    // document.getElementById('sections-search-additional').classList.remove('d-none');
    document.getElementById('links-dropdown').classList.remove('d-none');
    
    Links.populate();
  },
  
  absoluteLinks : function( ) {
    var foundLinks = document.getElementById('dynamic-xbrl-form').querySelectorAll('[data-link],[href]');
    
    var foundLinksArray = Array.prototype.slice.call(foundLinks);
    
    foundLinksArray.forEach(function( current ) {
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
    
    var dropdownContent = document.getElementById('links-dropdown-content');
    // first we empty the dropdown element
    while (dropdownContent.firstChild) {
      dropdownContent.firstChild.remove();
    }
    
    Constants.getMetaSourceDocuments.forEach(function( current ) {
      var link = document.createElement('a');
      link.setAttribute('class', 'dropdown-item');
      if ( current !== HelpersUrl.getHTMLFileName ) {
        
        link.addEventListener('click', function(e) { Links.clickEventInternal(e, link); });
        link.setAttribute('href', current);
        link.setAttribute('data-link', current);
        
      } else {
        link.setAttribute('href', '#');
        link.setAttribute('aria-disabled', 'true');
        
        var icon = document.createElement('i');
        icon.setAttribute('title', 'Current Form');
        icon.setAttribute('class', 'fa fa-bookmark me-1');
        link.prepend(icon);
      }
      link.appendChild(document.createTextNode(current));
      dropdownContent.appendChild(link);
      
    });
    
  }

};
