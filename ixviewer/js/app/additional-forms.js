'use strict';
/*
 * Created by staff of the U.S. Securities and Exchange Commission. Data and
 * content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */
var Additional_Forms = {
  
  initialURL : null,
  
  init : function (input, initial) {
    console.log('in the init!');
    Additional_Forms.initialURL = initial;
    Additional_Forms.fixLinks(input['local'], initial);
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
  
  quickLinkFixForSections : function (baseref, resultIndex) {
    // we remove the potentially original 'result-index' param
    var newUrl = window.location.href.split('&');
    if (newUrl[newUrl.length - 1].indexOf('result-index') >= 0) {
      newUrl.pop();
    }
    newUrl.join('');
    return newUrl[0].replace(Additional_Forms.initialURL, baseref) + '&result-index=' + resultIndex;
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
  
  fixLinks : function (input, initial) {
    var discoveredLinks = $('#app-inline-xbrl-doc').contents().find('a');
    var discoveredLinksArray = Array.prototype.slice.call(discoveredLinks);
    discoveredLinksArray.forEach(function (current) {
      if (current['href']) {
        var urlSegment = current['href'].substr(current['href'].lastIndexOf('/') + 1);
        var hrefLink = window.location.href.replace(initial, urlSegment);
        
        if (input.indexOf(urlSegment.split('#')[0]) >= 0) {
          // we want to keep the user in the viewer
          if (urlSegment.split('#')[0] === initial) {
            // we are just jumping to a specific anchor/some kind of url param,
            // no url change
            // for example <a href="#some-anchor">test</a>
          } else {
            if (current['href'].split('#').length > 1) {
              // we are just jumping to a specific anchor/some kind of url
              // param, url change
              current['href'] = hrefLink;
            } else {
              // we are jumping to another form
              current['href'] = hrefLink.split('#')[0];
            }
            // we add the onclick event to ensure the user stays in the viewer
            current.setAttribute('onClick', 'parent.Additional_Forms.clickEvent(event,this);');
          }
        } else {
          // we send the user to whatever the href is for example
          // https://www.google.com
          current.setAttribute('onClick', 'parent.Additional_Forms.clickEventExternal(event,this);');
        }
      }
      
    });
  },
  
  clickEvent : function (event, element) {
    var controlKey = event.ctrlKey || (event.which === 17);
    if (!controlKey) {
      event.preventDefault();
      window.location.href = element.getAttribute('href');
    }
  },
  
  clickEventExternal : function (event, element) {
    var controlKey = event.ctrlKey || (event.which === 17);
    if (!controlKey) {
      event.preventDefault();
      window.location.href = element.getAttribute('href');
    }
  },
  
  isBaseRefDifferentThanCurrent : function (input) {
    if (input) {
      var urlSegment = window.location.href.substr(window.location.href.lastIndexOf('/') + 1).replace('#', '').replace(
          new RegExp('[?&]result-index=[0-9]+'), '');
      var re = new RegExp(input, 'gi');
      var res = urlSegment.match(re);
      if (res)
        return false;
      else
        return true;
    }
    return false;
  },
  
  reloadApplicationWithTaxonomyInformation : function (input) {
    var newUrl = window.location.href.split('/');
    newUrl.pop();
    newUrl = newUrl.join('/') + '/' + input.getAttribute('baseref');
    newUrl += '&result-index=' + input.getAttribute('data-result-index');
    // return newUrl;
    // console.log(newUrl);
    // window.location.href = newUrl;
  },
  
  scrollLocalElementIntoView : function (input) {
    App_Find.TaggedSection.selectItem($(input).attr('data-result-index'), $(input));
  },
}
