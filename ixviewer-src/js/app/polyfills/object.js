/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

if ( typeof Object.assign !== 'function' ) {
  // Must be writable: true, enumerable: false, configurable: true
  Object.defineProperty(Object, "assign", {
    value : function assign( target, varArgs ) {
      // .length of function is 2
      'use strict';
      if ( target === null ) {
        // TypeError if undefined or null
        throw new TypeError('Cannot convert undefined or null to object');
      }
      
      var to = Object(target);
      
      for ( var index = 1; index < arguments.length; index++ ) {
        var nextSource = arguments[index];
        
        if ( nextSource !== null ) {
          // Skip over if undefined or null
          for ( var nextKey in nextSource ) {
            // Avoid bugs when hasOwnProperty is shadowed
            if ( Object.prototype.hasOwnProperty.call(nextSource, nextKey) ) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    },
    writable : true,
    configurable : true
  });
}

(function( arr ) {
  arr.forEach(function( item ) {
    if ( item.hasOwnProperty('remove') ) {
      return;
    }
    Object.defineProperty(item, 'remove', {
      configurable : true,
      enumerable : true,
      writable : true,
      value : function remove( ) {
        if ( this.parentNode === null ) {
          return;
        }
        this.parentNode.removeChild(this);
      }
    });
  });
})([ Element.prototype, CharacterData.prototype, DocumentType.prototype ]);

(function( arr ) {
  arr.forEach(function( item ) {
    if ( item.hasOwnProperty('append') ) {
      return;
    }
    Object.defineProperty(item, 'append', {
      configurable : true,
      enumerable : true,
      writable : true,
      value : function append( ) {
        var argArr = Array.prototype.slice.call(arguments);
        var docFrag = document.createDocumentFragment();
        
        argArr.forEach(function( argItem ) {
          var isNode = argItem instanceof Node;
          docFrag.appendChild(isNode ? argItem : document.createTextNode(String(argItem)));
        });
        
        this.appendChild(docFrag);
      }
    });
  });
})([ Element.prototype, Document.prototype, DocumentFragment.prototype ]);

(function( arr ) {
  arr.forEach(function( item ) {
    if ( item.hasOwnProperty('prepend') ) {
      return;
    }
    Object.defineProperty(item, 'prepend', {
      configurable : true,
      enumerable : true,
      writable : true,
      value : function prepend( ) {
        var argArr = Array.prototype.slice.call(arguments);
        var docFrag = document.createDocumentFragment();
        
        argArr.forEach(function( argItem ) {
          var isNode = argItem instanceof Node;
          docFrag.appendChild(isNode ? argItem : document.createTextNode(String(argItem)));
        });
        
        this.insertBefore(docFrag, this.firstChild);
      }
    });
  });
})([ Element.prototype, Document.prototype, DocumentFragment.prototype ]);
