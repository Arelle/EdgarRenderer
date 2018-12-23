'use strict';
/*
 * Created by staff of the U.S. Securities and Exchange Commission. Data and
 * content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */
/*
 * Below are common polyfills that are required for this application From
 * https://github.com/zloirock/core-js
 */
/*
 * String Specific Polyfills
 */
(function (stringPrototype) {
  if (!stringPrototype.startsWith) {
    stringPrototype.startsWith = function (search, pos) {
      return this.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
    }
  }
})(String.prototype);

(function () {
  
  var loc, value;
  
  loc = window.location;
  
  if (loc.origin) {
    return;
  }
  
  value = loc.protocol + '//' + loc.hostname + (loc.port ? ':' + loc.port : '');
  
  try {
    Object.defineProperty(loc, 'origin', {
      value : value,
      enumerable : true
    });
  } catch (_error) {
    loc.origin = value;
  }
  
}).call(this);
