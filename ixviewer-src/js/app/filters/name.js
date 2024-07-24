/*
 * Created by staff of the U.S. Securities and Exchange Commission. Data and
 * content created by government employees within the scope of their
 * employment are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var FiltersName = {
  
  getFormattedName : function( name ) {
    if ( name && typeof name === 'string' ) {
      if ( name.split(':').length > 1 ) {
        
        name = name.split(':');
        var element = document.createElement('p');
        element.setAttribute('class', 'mb-0');
        
        var contentBegin = document.createTextNode(name[0].toUpperCase());
        var elementBegin = document.createElement('span');
        elementBegin.setAttribute('class', 'fw-bold');
        elementBegin.appendChild(contentBegin);
        
        var contentEnd = document.createTextNode(name[1].replace(/([A-Z])/g, ' $1').trim());
        var elementEnd = document.createElement('span');
        elementEnd.setAttribute('class', 'ms-1');
        elementEnd.appendChild(contentEnd);
        
        element.appendChild(elementBegin);
        element.appendChild(elementEnd);
        return element;
      }
    }
    return '';
  },
  
  getFormattedType : function( name ) {
    if ( name && typeof name === 'string' ) {
      var foundTagInformation = Constants.getMetaTags.filter(function( element ) {
        if ( element['original-name'] === name.replace(':', '_') ) {
          return true;
        }
        return false;
      });
      if ( foundTagInformation && foundTagInformation[0] && foundTagInformation[0]['xbrltype'] ) {
        // we format
        var returnedType = foundTagInformation[0]['xbrltype'].replace(/([A-Z])/g, ' $1').trim();
        return returnedType.charAt(0).toUpperCase() + returnedType.slice(1);
      }
      return null;
    }
    return null;
  },
  
  getDefinition : function( name ) {
    if ( name && typeof name === 'string' ) {
      var foundTagInformation = Constants.getMetaTags.filter(function( element ) {
        if ( element['original-name'] === name.replace(':', '_') ) {
          return true;
        }
        return false;
      });
      if ( foundTagInformation && foundTagInformation[0] && foundTagInformation[0]['lang'] ) {
        var stringToReturn = '';
        Object.keys(foundTagInformation[0]['lang']).forEach(
            function( current, index ) {
              if ( foundTagInformation[0]['lang'][current]['role']
                  && foundTagInformation[0]['lang'][current]['role']['documentation'] ) {
                
                if ( Object.keys(foundTagInformation[0]['lang']).length === 1 ) {
                  stringToReturn = foundTagInformation[0]['lang'][current]['role']['documentation'];
                } else {
                  
                  stringToReturn += foundTagInformation[0]['lang'][current]['role']['documentation'] + ' ';
                }
              }
              
            });
        return stringToReturn;
      }
      return null;
    }
    return null;
  },
  
  getAllLabelObject : function( name ) {
    if ( name && typeof name === 'string' ) {
      var foundTagInformation = Constants.getMetaTags.filter(function( element ) {
        if ( element['original-name'] === name.replace(':', '_') ) {
          return true;
        }
        return false;
      });
      if ( foundTagInformation && foundTagInformation[0] && foundTagInformation[0]['lang'] ) {
        var objectToReturn = {};
        
        Object.keys(foundTagInformation[0]['lang']).forEach(function( current, index, array ) {
          var language = '';
          if ( array.length > 1 ) {
            language = '(' + current.toUpperCase() + ')';
          }
          if ( foundTagInformation[0]['lang'][current]['role'] ) {
            for ( var label in foundTagInformation[0]['lang'][current]['role'] ) {
              var updatedLabel = label.charAt(0).toUpperCase() + label.slice(1).replace(/([A-Z])/g, ' $1');
              
              if ( language ) {
                objectToReturn[updatedLabel + ' ' + language] = foundTagInformation[0]['lang'][current]['role'][label];
                
              } else {
                objectToReturn[updatedLabel] = foundTagInformation[0]['lang'][current]['role'][label];
              }
            }
          }
          
        });
        return objectToReturn;
      }
    }
    return null;
  },
  
  getAllLabels : function( name ) {
    if ( name && typeof name === 'string' ) {
      var foundTagInformation = Constants.getMetaTags.filter(function( element ) {
        if ( element['original-name'] === name.replace(':', '_') ) {
          return true;
        }
        return false;
      });
      if ( foundTagInformation && foundTagInformation[0] && foundTagInformation[0]['lang'] ) {
        var arrayToReturn = [ ];
        
        Object.keys(foundTagInformation[0]['lang']).forEach(function( current, index ) {
          
          if ( foundTagInformation[0]['lang'][current]['role'] ) {
            
            for ( var label in foundTagInformation[0]['lang'][current]['role'] ) {
              if ( label.toLowerCase().indexOf('label') >= 0 ) {
                arrayToReturn.push(foundTagInformation[0]['lang'][current]['role'][label]);
              }
            }
          }
        });
        return arrayToReturn;
      }
    }
    return [ ];
  },
  
  getLabel : function( name, includePossibleLanguages ) {
    
    includePossibleLanguages = includePossibleLanguages || false;
    if ( name && typeof name === 'string' ) {
      var foundTagInformation = Constants.getMetaTags.filter(function( element ) {
        if ( element['original-name'] === name.replace(':', '_') ) {
          return true;
        }
        return false;
      });
      if ( foundTagInformation && foundTagInformation[0] && foundTagInformation[0]['lang'] ) {
        var stringToReturn = '';
        
        Object.keys(foundTagInformation[0]['lang']).forEach(
            function( current, index ) {
              if ( foundTagInformation[0]['lang'][current]['role']
                  && foundTagInformation[0]['lang'][current]['role']['label'] ) {
                if ( !includePossibleLanguages ) {
                  stringToReturn = foundTagInformation[0]['lang'][current]['role']['label'];
                }

                else if ( Object.keys(foundTagInformation[0]['lang']).length === 1 ) {
                  stringToReturn = foundTagInformation[0]['lang'][current]['role']['label'];
                } else {
                  var element = document.createElement('span');
                  
                  var contentBegin = document.createTextNode(current.toUpperCase());
                  var elementBegin = document.createElement('span');
                  elementBegin.setAttribute('class', 'fw-bold');
                  elementBegin.appendChild(contentBegin);
                  
                  var contentEnd = document.createTextNode(': '
                      + foundTagInformation[0]['lang'][current]['role']['label']);
                  var elementEnd = document.createElement('span');
                  elementEnd.appendChild(contentEnd);
                  
                  element.appendChild(elementBegin);
                  element.appendChild(elementEnd);
                  
                  if ( index < Object.keys(foundTagInformation[0]['lang']).length ) {
                    var br = document.createElement('br');
                    element.appendChild(br);
                  }
                  stringToReturn += element.innerText;
                }
              }
              
            });
        return stringToReturn;
        
      }
      return null;
    }
    return null;
  },
  
  getTextOnlyLabel : function( name ) {
    
    if ( name && typeof name === 'string' ) {
      var foundTagInformation = Constants.getMetaTags.filter(function( element ) {
        if ( element['original-name'] === name.replace(':', '_') ) {
          return true;
        }
        return false;
      });
      
      if ( foundTagInformation && foundTagInformation[0] && foundTagInformation[0]['lang'] ) {
        if ( Object.keys(foundTagInformation[0]['lang']).length > 0 ) {
          return foundTagInformation[0]['lang'][Object.keys(foundTagInformation[0]['lang'])[0]]['role']['label'];
        }
        
      }
      return null;
    }
    return null;
  },
  
  getTerseLabelOnlyLabel : function( name ) {
    if ( name && typeof name === 'string' ) {
      var foundTagInformation = Constants.getMetaTags.filter(function( element ) {
        if ( element['original-name'] === name.replace(':', '_') ) {
          return true;
        }
        return false;
      });
      
      if ( foundTagInformation && foundTagInformation[0] && foundTagInformation[0]['lang'] ) {
        var stringToReturn = '';
        Object.keys(foundTagInformation[0]['lang']).forEach(
            function( current, index ) {
              if ( foundTagInformation[0]['lang'][current]['role']
                  && foundTagInformation[0]['lang'][current]['role']['terseLabel'] ) {
                stringToReturn += foundTagInformation[0]['lang'][current]['role']['terseLabel'];
              }
              
            });
        return stringToReturn;
      }
      return null;
    }
    return null;
  },
  
  getLabelForTitle : function( name ) {
    if ( name && typeof name === 'string' ) {
      var foundTagInformation = Constants.getMetaTags.filter(function( element ) {
        if ( element['original-name'] === name.replace(':', '_') ) {
          return true;
        }
        return false;
      });
      
      if ( foundTagInformation && foundTagInformation[0] && foundTagInformation[0]['lang'] ) {
        var stringToReturn = '';
        Object.keys(foundTagInformation[0]['lang']).forEach(
            function( current, index ) {
              if ( foundTagInformation[0]['lang'][current]['role']
                  && foundTagInformation[0]['lang'][current]['role']['label'] ) {
                stringToReturn += foundTagInformation[0]['lang'][current]['role']['label'];
              }
              
            });
        return stringToReturn;
      }
      return null;
    }
    return null;
  },
  
  getAuthRefs : function( name ) {
    
    if ( name && typeof name === 'string' ) {
      var foundTagInformation = Constants.getMetaTags.filter(function( element ) {
        if ( element['original-name'] === name.replace(':', '_') ) {
          return true;
        }
        return false;
      });
      if ( foundTagInformation && foundTagInformation[0] && foundTagInformation[0]['auth_ref'] ) {
        return foundTagInformation[0]['auth_ref'];
      }
      // return an empty array
      return [ ];
    }
    return [ ];
  },
  
  getTag : function( name ) {
    if ( name && typeof name === 'string' ) {
      return Constants.getMetaTags.filter(function( element ) {
        return element['original-name'] === name.replace(':', '_');
      });
    }
  },
  
  getCalculationsForModal : function( name ) {
    if ( (name && typeof name === 'string') ) {
      
      var foundTag = Constants.getMetaTags.filter(function( element ) {
        return element['original-name'] === name.replace(':', '_');
      });
      
      if ( foundTag && foundTag[0] && foundTag[0]['calculation'] ) {
        var returnArray = [ ];
        Object.keys(foundTag[0]['calculation']).forEach(
            function( current, index ) {
              Constants.getMetaReports.forEach(function( nestedCurrent ) {
                if ( nestedCurrent['role'] === current ) {
                  
                  returnArray.push({
                    'blank' : true
                  });
                  
                  returnArray.push({
                    'label' : 'Section',
                    'value' : nestedCurrent['longName']
                  });
                  
                  var weight = foundTag[0]['calculation'][current]['weight'] || null;
                  
                  if ( weight ) {
                    weight = weight > 0 ? 'Added to parent (' + weight.toFixed(2) + ')' : 'Substracted from parent ('
                        + weight.toFixed(2) + ')';
                  } else {
                    weight = 'Not Available.';
                  }
                  
                  returnArray.push({
                    'label' : 'Weight',
                    'value' : weight
                  });
                  
                  var parent = foundTag[0]['calculation'][current]['parentTag'] || null;
                  
                  if ( parent ) {
                    parent = FiltersName.getFormattedName(parent.replace('_', ':'));
                  } else {
                    var element = document.createDocumentFragment();
                    var text = document.createTextNode('Not Available.');
                    element.appendChild(text);
                    parent = element;
                  }
                  
                  returnArray.push({
                    'label' : 'Parent',
                    'value' : parent,
                    'html' : parent ? true : false
                  });
                }
              });
            });
        return returnArray;
      }
      return null;
    }
    return null;
    
  }

};
