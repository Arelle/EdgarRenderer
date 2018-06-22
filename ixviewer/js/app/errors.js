'use strict';

/* Created by staff of the U.S. Securities and Exchange Commission.
* Data and content created by government employees within the scope of their employment 
* are not subject to domestic copyright protection. 17 U.S.C. 105.
*/

/* Below we are using the prototype functionality of JavaScript to extend the base Error function
 * Common practice, this will 'clean up' the console error(s) a user may have
 */
function CustomCORSError(message, hostName, fileHostName ) {
	this.name = 'CORS Error';
	this.message = (message || 'The Host name ('+hostName+') cannot be different from the file you are trying to retrieve ('+fileHostName+')');
}
CustomCORSError.prototype = Error.prototype;

function CustomNotFoundError(message, file) {
	this.name = '404 Not Found';
	this.message = (message || 'The file you are trying to retrieve ('+ file +') could not be located.')
}
CustomNotFoundError.prototype = Error.prototype;

/* Below we use the onerror function to output our above errors properly
 * AKA they are no longer 'Uncaught'
 */
window.onerror = function(message, filename, lineno, colno, error) {
	
	//TODO proper error checking application wide
	
	if(error.name === 'CORS Error') {
		console.error(error.message);
		return true;
	}	
	if(error.name === '404 Not Found') {
		console.error(error.message);
		return true;
	}
	return false;
};
