/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var ErrorsMinor = {
  
  unknownError : function( ) {
    
    var content = document.createTextNode('An Error has occured within the Inline XBRL Viewer.');
    
    var element = document.createElement('div');
    element.setAttribute('class', 'alert-height alert alert-warning alert-dismissable show mb-0');
    element.appendChild(content);
    
    var button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.setAttribute('class', 'btn-close float-right');
    button.setAttribute('data-bs-dismiss', 'alert');
    button.addEventListener('click', function() { Errors.updateMainContainerHeight(true); });
    element.appendChild(button);
    
    document.getElementById('error-container').appendChild(element);
    
    Errors.updateMainContainerHeight();
  },
  
  browserSuggestion : function( ) {
    if ( !Constants.getBrowserType['chrome'] ) {
      var contentStart = document.createTextNode('Using ');
      
      var element = document.createElement('div');
      element.setAttribute('class', 'alert-height alert alert-warning alert-dismissable show mb-0');
      element.appendChild(contentStart);
      
      var linkContent = document.createTextNode('Google Chrome');
      var link = document.createElement('a');
      
      link.setAttribute('target', '_blank');
      link.setAttribute('href', 'https://www.google.com/chrome/');
      link.appendChild(linkContent);
      element.appendChild(link);
      
      var contentEnd = document.createTextNode(' can help alleviate some of these performance issues.');
      element.appendChild(contentEnd);
      
      var button = document.createElement('button');
      button.setAttribute('type', 'button');
      button.setAttribute('class', 'btn-close float-right');
      button.setAttribute('data-bs-dismiss', 'alert');
      button.addEventListener('click', function() { Errors.updateMainContainerHeight(true); });
      
      element.appendChild(button);
      
      document.getElementById('error-container').appendChild(element);
      
      Errors.updateMainContainerHeight();
    }
  },
  
  factNotFound : function( ) {
    var content = document.createTextNode('Inline XBRL can not locate the requested fact.');
    
    var element = document.createElement('div');
    element.setAttribute('class', 'alert-height alert alert-warning alert-dismissable show mb-0');
    element.appendChild(content);
    
    var button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.setAttribute('class', 'btn-close float-right');
    button.setAttribute('data-bs-dismiss', 'alert');
    button.addEventListener('click', function() { Errors.updateMainContainerHeight(true); });
    
    element.appendChild(button);
    
    document.getElementById('error-container').appendChild(element);
    
    Errors.updateMainContainerHeight();
  },
  
  continuedAt : function( ) {
    var content = document
        .createTextNode('Inline XBRL HTML Form is missing data to complete this action. This functionality has been removed.');
    
    var element = document.createElement('div');
    element.setAttribute('class', 'alert-height alert alert-warning alert-dismissable show mb-0');
    element.appendChild(content);
    
    var button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.setAttribute('class', 'btn-close float-right');
    button.setAttribute('data-bs-dismiss', 'alert');
    button.addEventListener('click', function() { Errors.updateMainContainerHeight(true); });
    
    element.appendChild(button);
    
    document.getElementById('error-container').appendChild(element);
    
    Errors.updateMainContainerHeight();
  },
  
  fileSize : function( ) {
    
    var content = document.createTextNode('Inline XBRL HTML Form is over ' + Constants.fileSizeError[1]
        + ', performance may be affected.');
    
    var element = document.createElement('div');
    element.setAttribute('class', 'alert-height alert alert-warning alert-dismissable show mb-0');
    element.appendChild(content);
    
    var button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.setAttribute('class', 'btn-close float-right');
    button.setAttribute('data-bs-dismiss', 'alert');
    button.addEventListener('click', function() { Errors.updateMainContainerHeight(true); });
    
    element.appendChild(button);
    
    document.getElementById('error-container').appendChild(element);
    
    Errors.updateMainContainerHeight();
    
    // ErrorsMinor.browserSuggestion();
  },
  
  metaLinksNotFound : function( fileName ) {
    var content = document
        .createTextNode('Inline XBRL viewing features are minimal because no supporting file was found.');
    
    var element = document.createElement('div');
    element.setAttribute('class', 'alert-height alert alert-warning alert-dismissable show mb-0');
    element.appendChild(content);
    
    var button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.setAttribute('class', 'btn-close float-right');
    button.setAttribute('data-bs-dismiss', 'alert');
    button.addEventListener('click', function() { Errors.updateMainContainerHeight(true); });
    
    element.appendChild(button);
    
    document.getElementById('error-container').appendChild(element);
    
    Errors.updateMainContainerHeight();
  },
  
  metaLinksInstance : function( fileName ) {
    
    var content = document
        .createTextNode('Inline XBRL viewing features are minimal because supporting file is not correct.');
    
    var element = document.createElement('div');
    element.setAttribute('class', 'alert-height alert alert-warning alert-dismissable show mb-0');
    element.appendChild(content);
    
    var button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.setAttribute('class', 'btn-close float-right');
    button.setAttribute('data-bs-dismiss', 'alert');
    button.addEventListener('click', function() { Errors.updateMainContainerHeight(true); });

    element.appendChild(button);
    
    document.getElementById('error-container').appendChild(element);
    
    Errors.updateMainContainerHeight();
  },
  
  metaLinksVersion : function( ) {
    
    var content = document.createTextNode('File found was not a MetaLinks version 2.0 file or higher.');
    
    var element = document.createElement('div');
    element.setAttribute('class', 'alert-height alert alert-warning alert-dismissable show mb-0');
    element.appendChild(content);
    
    var button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.setAttribute('class', 'btn-close float-right');
    button.setAttribute('data-bs-dismiss', 'alert');
    button.addEventListener('click', function() { Errors.updateMainContainerHeight(true); });
    
    element.appendChild(button);
    
    document.getElementById('error-container').appendChild(element);
    
    Errors.updateMainContainerHeight();
  },
  
  factNotActive : function( ) {
    
    var content = document
        .createTextNode('This fact is not apart of your active filter(s) and is not present in the Fact Menu.');
    
    var element = document.createElement('div');
    element.setAttribute('class', 'alert-height alert alert-warning alert-dismissable show mb-0');
    element.appendChild(content);
    
    var button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.setAttribute('class', 'btn-close float-right');
    button.setAttribute('data-bs-dismiss', 'alert');
    button.addEventListener('click', function() { Errors.updateMainContainerHeight(true); });
    
    element.appendChild(button);
    
    document.getElementById('error-container').appendChild(element);
    
    Errors.updateMainContainerHeight();
  }

};
