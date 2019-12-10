/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var Modals = {
  
  renderCarouselIndicators : function( carouselId, indicatorId, carouselInformation ) {
    var indicatorHtml = '';
    
    carouselInformation.forEach(function( current, index ) {
      var activeSlide = (index === 0) ? 'active' : '';
      indicatorHtml += '<li data-target="#' + carouselId + '" data-slide-to="' + index + '" class="' + activeSlide
          + '" title="' + current['dialog-title'] + '" href="#" tabindex="14"></li>';
    });
    document.getElementById(indicatorId).innerHTML = indicatorHtml;
  },
  
  close : function( event, element ) {
    
    if ( event.keyCode && !(event.keyCode === 13 || event.keyCode === 32) ) {
      return;
    }
    
    document.getElementById('taxonomy-copy-paste').classList.add('d-none');
    
    window.removeEventListener('keyup', ModalsFormInformation.keyboardEvents);
    window.removeEventListener('keyup', ModalsCommon.keyboardEvents);
    
    // to simplify things, we are going to go through and close every
    // dialog.
    var foundDialogs = document.querySelectorAll('.dialog-box');
    
    var foundDialogsArray = Array.prototype.slice.call(foundDialogs);
    
    foundDialogsArray.forEach(function( current ) {
      
      current.classList.remove('expand-modal');
      var viewPortWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      if ( viewPortWidth >= 576 ) {
        document.getElementById('taxonomy-modal-expand').classList.remove('d-none');
      }
      document.getElementById('taxonomy-modal-compress').classList.add('d-none');
      
      current.classList.add('d-none');
    });
    
    TaxonomiesGeneral.removeAllSelectedTaxonomy();
    
  },
  
  copyContent : function( event, element, elementIdToCopy, copyPasteElement ) {
    
    if ( event.keyCode && !(event.keyCode === 13 || event.keyCode === 32) ) {
      return;
    }
    
    if ( !document.getElementById(copyPasteElement).classList.contains('d-none') ) {
      document.getElementById(copyPasteElement).classList.add('d-none');
    } else {
      var sectionToPopulate = '#' + copyPasteElement;
      document.getElementById(copyPasteElement).classList.remove('d-none');
      
      var foundCarouselPages = document.getElementById(elementIdToCopy).querySelectorAll(
          '.carousel-item > table > tbody > tr');
      var foundCarouselPagesArray = Array.prototype.slice.call(foundCarouselPages);
      // TODO should we just put all of the innerText automatically into the
      // users clipboard?
      
      // th elements are the keys
      // td elements are the values
      var textToCopy = '';
      
      foundCarouselPagesArray.forEach(function( current ) {
        if ( current.querySelector('th') && current.querySelector('th').innerText ) {
          textToCopy += current.querySelector('th').innerText.trim() + ' : ';
        }
        
        if ( current.querySelector('td') ) {
          
          if ( current.querySelector('td #collapse-modal') ) {
            var largeTaxonomySelector = current.querySelector('td #collapse-modal');
            
            textToCopy += '\n';
            textToCopy += largeTaxonomySelector.innerText.trim();
            textToCopy += '\n';
            
          } else if ( current.querySelector('td').innerText ) {
            textToCopy += current.querySelector('td').innerText;
            textToCopy += '\n';
          }
        }
      });
      document.querySelector(sectionToPopulate + ' textarea').innerHTML = textToCopy;
    }
  },
  
  closeCopy : function( input ) {
    document.getElementById(input).classList.add('d-none');
  },
  
  expandToggle : function( event, element, idToTarget, idToExpand, idToCompress ) {
    
    if ( event.keyCode && !(event.keyCode === 13 || event.keyCode === 32) ) {
      return;
    }
    idToTarget = idToTarget || 'taxonomy-modal';
    idToExpand = idToExpand || 'taxonomy-modal-expand';
    idToCompress = idToCompress || 'taxonomy-modal-compress';
    
    var modalElement = document.getElementById(idToTarget);
    modalElement.classList.toggle('expand-modal');
    if ( modalElement.classList.contains('expand-modal') ) {
      
      document.getElementById(idToExpand).classList.add('d-none');
      document.getElementById(idToCompress).classList.remove('d-none');
      document.getElementById('taxonomy-modal-drag').classList.add('d-none');
      document.getElementById(idToCompress).focus();
      
    } else {
      
      document.getElementById(idToExpand).classList.remove('d-none');
      document.getElementById(idToCompress).classList.add('d-none');
      document.getElementById('taxonomy-modal-drag').classList.remove('d-none');
      document.getElementById(idToExpand).focus();
    }
  },
  
  initDrag : function( element ) {
    
    var selected = null;
    var xPosition = 0;
    var yPosition = 0;
    var xElement = 0;
    var yElement = 0;
    
    function drag( element ) {
      selected = element;
      xElement = (xPosition - selected.offsetLeft) + (selected.clientWidth / 2);
      yElement = (yPosition - selected.offsetTop) + (selected.clientHeight / 2);
    }
    
    // Will be called when user dragging an element
    function dragElement( event ) {
      xPosition = document.all ? window.event.clientX : event.pageX;
      yPosition = document.all ? window.event.clientY : event.pageY;
      if ( selected !== null ) {
        selected.style.left = ((xPosition - xElement) + selected.offsetWidth / 2) + 'px';
        selected.style.top = ((yPosition - yElement) + selected.offsetHeight / 2) + 'px';
      }
    }
    
    // Destroy the object when we are done
    function destroyDrag( ) {
      selected = null;
    }
    
    document.onmousemove = dragElement;
    document.onmouseup = destroyDrag;
    
    element.onmousedown = function( ) {
      // not a fan of having all these .parentNode
      drag(this.parentNode.parentNode.parentNode);
      return false;
    };
    
  }

};
