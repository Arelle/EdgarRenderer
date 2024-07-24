/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var FiltersContextref = {
  
  getDimensions : function( contextref ) {
    if ( contextref && typeof contextref === 'string' ) {
      contextref = contextref.replace(/\./g, '\\\.');
      var foundDimensions = document.getElementById('dynamic-xbrl-form').querySelectorAll(
          '[id="' + contextref + '"] [dimension]');
      return Array.prototype.slice.call(foundDimensions);
    }
    return null;
  },
  
  getAxis : function( contextref, plainText ) {
    
    plainText = plainText || false;
    
    if ( contextref && typeof contextref === 'string' ) {
      contextref = contextref.replace(/\./g, '\\\.');
      
      var foundDimensions = document.getElementById('dynamic-xbrl-form').querySelectorAll(
          '[id="' + contextref + '"] [dimension]');
      var foundDimensionsArray = Array.prototype.slice.call(foundDimensions);
      
      var axis = foundDimensionsArray.map(function( current ) {
        if ( plainText ) {
          return current.getAttribute('dimension');
        }
        return FiltersName.getFormattedName(current.getAttribute('dimension'));
      }).filter(function( element, index, array ) {
        return array.indexOf(element) === index;
      });
      
      if ( plainText ) {
        
        return axis.join(' ');
      }
      
      var returnAxis = axis.reduce(function( acc, current, index, array ) {
        acc.push(current);
        if ( index < array.length - 1 ) {
          acc.push(document.createElement('br'));
        }
        return acc;
      }, [ ]);
      
      return returnAxis.length ? returnAxis : null;
    }
    return null;
  },
  
  getMember : function( contextref, plainText ) {
    plainText = plainText || false;
    
    if ( contextref && typeof contextref === 'string' ) {
      var foundDimensions = document.getElementById('dynamic-xbrl-form').querySelectorAll(
          '[id="' + contextref + '"] [dimension]');
      
      var foundDimensionsArray = Array.prototype.slice.call(foundDimensions);
      var member = foundDimensionsArray.map(function( current ) {
        if ( plainText ) {
          return current.innerText;
        }
        return FiltersName.getFormattedName(current.innerText);
      }).filter(function( element, index, array ) {
        return array.indexOf(element) === index;
      });
      
      if ( plainText ) {
        return member.join(' ');
      }
      var returnMember = member.reduce(function( acc, current, index, array ) {
        acc.push(current);
        if ( index < array.length - 1 ) {
          acc.push(document.createElement('br'));
        }
        return acc;
      }, [ ]).filter(function( element, index, array ) {
        return element;
      });

      return returnMember.length ? returnMember : null;
    }
    return null;
  },
  
  getTypedMember : function( contextref ) {
    
    if ( contextref && typeof contextref === 'string' ) {
      
      var nameSpace;
      for ( var ns in Constants.getHTMLAttributes ) {
        
        if ( Constants.getHTMLAttributes[ns] === 'http://xbrl.org/2006/xbrldi' ) {
          nameSpace = ns.split(':')[1];
        }
      }
      
      var foundDimensions = document.getElementById('dynamic-xbrl-form').querySelectorAll(
          '[id="' + contextref + '"] ' + nameSpace + '\\:typedmember');
      
      var foundDimensionsArray = Array.prototype.slice.call(foundDimensions);
      var returnMember = foundDimensionsArray.map(function( current, index, array ) {
        
        return current.textContent;
        
      }).join(', ');
      
      return returnMember ? returnMember : null;
    }
    return null;
  },
  
  getExplicitMember : function( contextref ) {
    
    if ( contextref && typeof contextref === 'string' ) {
      
      var nameSpace;
      for ( var ns in Constants.getHTMLAttributes ) {
        
        if ( Constants.getHTMLAttributes[ns] === 'http://xbrl.org/2006/xbrldi' ) {
          nameSpace = ns.split(':')[1];
        }
      }
      
      var foundDimensions = document.getElementById('dynamic-xbrl-form').querySelectorAll(
          '[id="' + contextref + '"] ' + nameSpace + '\\:explicitmember');
      
      var foundDimensionsArray = Array.prototype.slice.call(foundDimensions);
      var returnMember = foundDimensionsArray.map(function( current, index, array ) {
        
        return current.textContent;
        
      }).join(', ');
      
      return returnMember ? returnMember : null;
    }
    return null;
  },
  
  getPeriod : function( contextref ) {
    
    if ( contextref && typeof contextref === 'string' ) {
      contextref = contextref.replace(/\./g, '\\\.');
      if ( document.getElementById('dynamic-xbrl-form').querySelector('[id="' + contextref + '"]')
          && document.getElementById('dynamic-xbrl-form').querySelector('[id="' + contextref + '"]')['nodeName']
              .split(':')[0].toLowerCase() ) {
        var prefixParent = document.getElementById('dynamic-xbrl-form').querySelector('[id="' + contextref + '"]')['nodeName']
            .toLowerCase();
        var prefix = '';
        if ( prefixParent.split(':').length === 2 ) {
          prefix = prefixParent.split(':')[0] + '\\:';
        }
      }
      
      var startDateTag = prefix + 'startdate';
      var endDateTag = prefix + 'enddate';
      var instantDateTag = prefix + 'instant';
      
      var startDate;
      
      if ( document.getElementById('dynamic-xbrl-form').querySelector('[id="' + contextref + '"] ' + startDateTag) ) {
        
        startDate = moment(document.getElementById('dynamic-xbrl-form').querySelector(
            '[id="' + contextref + '"] ' + startDateTag).innerText, 'YYYY-MM-DD');
      }
      
      var endDate;
      if ( document.getElementById('dynamic-xbrl-form').querySelector('[id="' + contextref + '"] ' + endDateTag) ) {
        
        endDate = moment(document.getElementById('dynamic-xbrl-form').querySelector(
            '[id="' + contextref + '"] ' + endDateTag).innerText, 'YYYY-MM-DD');
      }
      
      var instantDate;
      if ( document.getElementById('dynamic-xbrl-form').querySelector('[id="' + contextref + '"] ' + instantDateTag) ) {
        
        instantDate = moment(document.getElementById('dynamic-xbrl-form').querySelector(
            '[id="' + contextref + '"] ' + instantDateTag).innerText, 'YYYY-MM-DD');
      }
      
      if ( (startDate && startDate.isValid()) && (endDate && endDate.isValid()) ) {
        
        var betweenDate;
        var monthsDifference = Math.round(endDate.diff(startDate, 'months', true));
        if ( monthsDifference !== 0 ) {
          betweenDate = monthsDifference + ' months ending ' + endDate.format('MM/DD/YYYY');
        } else {
          betweenDate = startDate.format('MM/DD/YYYY') + ' - ' + endDate.format('MM/DD/YYYY');
        }
        return betweenDate;
        
      } else if ( instantDate && instantDate.isValid() ) {
        return 'As of ' + instantDate.format('MM/DD/YYYY');
        // return 'As of ' + instantDate[1] + '/' + instantDate[2] + '/' +
        // instantDate[0];
      }
      return 'No period information.';
      
    }
    return 'No period information.';
    
  }

};
