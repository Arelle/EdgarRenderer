/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

if ( !String.prototype.endsWith ) {
  String.prototype.endsWith = function( search, thisLength ) {
    if ( thisLength === undefined || thisLength > this.length ) {
      thisLength = this.length;
    }
    return this.substring(thisLength - search.length, thisLength) === search;
  };
}

if ( !String.prototype.startsWith ) {
  String.prototype.startsWith = function( search, thisLength ) {
    thisLength = thisLength || 0;
    return this.indexOf(search, thisLength) === thisLength;
  };
}

if ( !String.prototype.padEnd ) {
  String.prototype.padEnd = function padEnd( targetLength, padString ) {
    targetLength = targetLength >> 0;
    // floor if number or convert non-number to 0;
    padString = String((typeof padString !== 'undefined' ? padString : ' '));
    if ( this.length > targetLength ) {
      return String(this);
    }
    targetLength = targetLength - this.length;
    if ( targetLength > padString.length ) {
      padString += padString.repeat(targetLength / padString.length);
      // append to original to ensure we are longer than needed
    }
    return String(this) + padString.slice(0, targetLength);
    
  };
}

if ( !String.prototype.repeat ) {
  String.prototype.repeat = function( count ) {
    'use strict';
    count = count || 0;
    if ( this === null ) {
      throw new TypeError('can\'t convert ' + this + ' to object');
    }
    var str = '' + this;
    count = +count;
    
    if ( count < 0 ) {
      throw new RangeError('repeat count must be non-negative');
    }
    if ( count === Infinity ) {
      throw new RangeError('repeat count must be less than infinity');
    }
    count = Math.floor(count);
    if ( str.length === 0 || count === 0 ) {
      return '';
    }
    // Ensuring count is a 31-bit integer allows us to heavily optimize the
    // main part. But anyway, most current (August 2014) browsers can't handle
    // strings 1 << 28 chars or longer, so:
    if ( str.length * count >= 1 << 28 ) {
      throw new RangeError('repeat count must not overflow maximum string size');
    }
    var maxCount = str.length * count;
    count = Math.floor(Math.log(count) / Math.log(2));
    while (count) {
      str += str;
      count--;
    }
    str += str.substring(0, maxCount - str.length);
    return str;
  };
}
