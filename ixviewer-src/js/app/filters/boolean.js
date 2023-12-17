/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var FiltersBoolean = {
  booleanFalse : function( element ) {
    return 'false';
  },
  
  booleanTrue : function( element ) {
    return 'true';
  },
  
  boolBallotBox : function( element ) {
    if ( element && typeof element === 'object' && element['innerText'] ) {
      
      switch ( element['innerText'].trim() ) {
        case '&#x2610;' : {
          return 'false';
          break;
        }
        case '&#9744;' : {
          return 'false';
          break;
        }
        case '\u2610' : {
          return 'false';
          break;
        }
          
        case '&#x2611;' : {
          return 'true';
          break;
        }
        case '&#9745;' : {
          return 'true';
          break;
        }
        case '\u2611' : {
          return 'true';
          break;
        }
          
        case '&#x2612;' : {
          return 'true';
          break;
        }
        case '&#9746;' : {
          return 'true';
          break;
        }
        case '\u2612' : {
          return 'true';
          break;
        }
          
        default : {
          return 'Format Error: Bool Ballot Box';
        }
      }
      
    }
    return 'Format Error: Bool Ballot Box';
  },
  
  yesNoBallotBox : function( element ) {
    if ( element && typeof element === 'object' && element['innerText'] ) {
      switch ( element['innerText'].trim() ) {
        case '&#x2610;' : {
          return 'No';
          break;
        }
        case '&#9744;' : {
          return 'No';
          break;
        }
        case '\u2610' : {
          return 'No';
          break;
        }
          
        case '&#x2611;' : {
          return 'Yes';
          break;
        }
        case '&#9745;' : {
          return 'Yes';
          break;
        }
        case '\u2611' : {
          return 'Yes';
          break;
        }
          
        case '&#x2612;' : {
          return 'Yes';
          break;
        }
        case '&#9746;' : {
          return 'Yes';
          break;
        }
        case '\u2612' : {
          return 'Yes';
          break;
        }
          
        default : {
          return 'Format Error: Yes No Ballot Box';
        }
      }
    }
    return 'Format Error: Yes No Ballot Box';
  }
};
