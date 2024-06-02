/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

function ParsedUrl( url ) {
  var parser = document.createElement("a");
  parser.href = url;
  
  // IE 8 and 9 dont load the attributes "protocol" and "host" in case the
  // source URL
  // is just a pathname, that is, "/example" and not
  // "http://domain.com/example".
  parser.href = parser.href;
  
  // IE 7 and 6 wont load "protocol" and "host" even with the above workaround,
  // so we take the protocol/host from window.location and place them manually
  if ( parser.host === "" ) {
    var newProtocolAndHost = window.location.protocol + "//" + window.location.host;
    if ( url.charAt(1) === "/" ) {
      parser.href = newProtocolAndHost + url;
    }
    else {
      // the regex gets everything up to the last "/"
      // /path/takesEverythingUpToAndIncludingTheLastForwardSlash/thisIsIgnored
      // "/" is inserted before because IE takes it of from pathname
      var currentFolder = ("/" + parser.pathname).match(/.*\//)[0];
      parser.href = newProtocolAndHost + currentFolder + url;
    }
  }
  
  // copies all the properties to this object
  var properties = [ 'host', 'hostname', 'hash', 'href', 'port', 'protocol', 'search' ];
  for ( var i = 0, n = properties.length; i < n; i++ ) {
    this[properties[i]] = parser[properties[i]];
  }
  
  // pathname is special because IE takes the "/" of the starting of pathname
  this.pathname = (parser.pathname.charAt(0) !== "/" ? "/" : "") + parser.pathname;
}
