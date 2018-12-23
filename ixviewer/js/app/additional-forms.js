'use strict';
/*
 * Created by staff of the U.S. Securities and Exchange Commission. Data and
 * content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */
var Additional_Forms = {
  init : function (input, initial) {
    Additional_Forms.fixLinks(input['local']);
    initial = initial || null;
    $('#totalSourceDocumentsCount').html(input['local'].length);
    var additionalForms = '';
    input['local'].forEach(function (current, index, array) {
      
      var hrefLink = window.location.href.replace(initial, current);
      
      if (current === initial) {
        
        additionalForms += '<li>' + current + ' (Current Document)</li>';
        
      } else {
        additionalForms += '<li><a href="' + hrefLink + '">' + current + '</a></li>';
      }
    });
    
    $('#additionalFormsList').append(additionalForms);
    
    if (window.location.href.indexOf('result-index=') >= 0) {
      Additional_Forms.sendUserToResultIndex();
      
    }
  },
  
  anchorTag : function () {
    // if the application url has an anchortag, we send the user to that anchor
    
    var url = location.href;
    
    var urlSegment = url.substr(url.lastIndexOf('/') + 1);
    if (urlSegment.indexOf('#') >= 0 && urlSegment.split('#')[1].length) {
      $('#app-inline-xbrl-doc').contents().find('#' + urlSegment.split('#')[1])[0].scrollIntoView()
    }
    
  },
  
  sendUserToResultIndex : function () {
    var params = window.location.href.split('&')[1].split('=')[1];
    
    App_Find.TaggedSection.loadData();
    
    App_Find.TaggedSection.selectItem(params);
  },
  
  fixLinks : function (input) {
    var discoveredLinks = $('#app-inline-xbrl-doc').contents().find('a');
    var discoveredLinksArray = Array.prototype.slice.call(discoveredLinks);
    discoveredLinksArray.forEach(function (current) {
      if (current['href']) {
        var urlSegment = current['href'].substr(current['href'].lastIndexOf('/') + 1);
        if (input.indexOf(urlSegment) >= 0) {
          current.setAttribute('original-href', current.getAttribute('href'));
          current.setAttribute('onClick', 'parent.Additional_Forms.clickEvent(event,this);');
        } else {
          // we need to fix all the other links to take the user to wherever
          // they want to go
          
          // we want to avoid changing the anchor tags, unless necessary
          if (urlSegment.indexOf('#') >= 0) {
            var currentUrl = window.location.href.substr(window.location.href.lastIndexOf('/') + 1).replace(/\#$/, '');
            
            if (currentUrl === urlSegment.split('#')[0]) {
              // we leave this alone, to be a current file anchortag
            } else {
              current.setAttribute('original-href', current.getAttribute('href'));
              current.setAttribute('onClick', 'parent.Additional_Forms.clickEvent(event, this);');
              current.addEventListener('click', function (event) {
                event.preventDefault();
                return false;
              });
              current.style.cursor = 'pointer';
              current.style.textDecoration = 'underline';
              current.style.color = 'rgb(0, 0, 255)';
            }
          } else {
            current.setAttribute('original-href', current.getAttribute('href'));
            current.setAttribute('onClick', 'parent.Additional_Forms.clickEventExternal(event, this);');
          }
        }
      }
      
    });
  },
  
  clickEvent : function (event, element) {
    var controlKey = event.ctrlKey || (event.which === 17);
    if (!controlKey) {
      event.preventDefault();
      var newUrl = window.location.href.split('/');
      newUrl.pop();
      newUrl = newUrl.join('/') + '/' + element.getAttribute('original-href');
      window.location.href = newUrl;
    }
  },
  
  clickEventExternal : function (event, element) {
    var controlKey = event.ctrlKey || (event.which === 17);
    if (!controlKey) {
      event.preventDefault();
      window.location.href = element.getAttribute('original-href');
    }
  },
  
  isBaseRefDifferentThanCurrent : function (input) {
    if (input) {
      var urlSegment = window.location.href.substr(window.location.href.lastIndexOf('/') + 1).replace('#', '').replace(
          new RegExp('[?&]result-index=[0-9]+'), '');
      return (input !== urlSegment);
    }
    return false;
  },
  
  reloadApplicationWithTaxonomyInformation : function (input) {
    var newUrl = window.location.href.split('/');
    newUrl.pop();
    newUrl = newUrl.join('/') + '/' + input.getAttribute('baseref');
    newUrl += '&result-index=' + input.getAttribute('data-result-index');
    window.location.href = newUrl;
  },
  
  scrollLocalElementIntoView : function (input) {
    App_Find.TaggedSection.selectItem($(input).attr('data-result-index'), $(input));
  },
  
  sectionsClickEvent : function (event) {
    if (event.getAttribute('baseref') && event.getAttribute('baseref') !== 'undefined') {
      if (Additional_Forms.isBaseRefDifferentThanCurrent(event.getAttribute('baseref'))) {
        Additional_Forms.reloadApplicationWithTaxonomyInformation(event);
      } else {
        Additional_Forms.scrollLocalElementIntoView(event);
      }
    } else {
      Additional_Forms.scrollLocalElementIntoView(event);
    }
  },
  
  sectionsKeyUpEvent : function (event) {
    var code = event.keyCode || event.which;
    if ((code == 13) || (code == 32)) {
      if (Additional_Forms.isBaseRefDifferentThanCurrent(event.getAttribute('baseref'))) {
        Additional_Forms.reloadApplicationWithTaxonomyInformation(event);
      } else {
        Additional_Forms.scrollLocalElementIntoView(event);
      }
    }
  },
}