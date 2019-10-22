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
        
        var returnedName = document.createElement('div');
        name = name.split(':');
        
        var span1 = document.createElement('span');
        span1.className = 'font-weight-bold';
        span1.textContent = name[0].toUpperCase();
        returnedName.appendChild(span1);

        var span2 = document.createElement('span');
        span2.className = 'ml-1';
        span2.textContent = name[1].replace(/([A-Z])/g, ' $1').trim();
        returnedName.appendChild(span2);

        return returnedName.innerHTML;
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

        var containerElem = document.createElement('div');

        Object.keys(foundTagInformation[0]['lang']).forEach(
            function( current, index ) {
              if ( foundTagInformation[0]['lang'][current]['role']
                  && foundTagInformation[0]['lang'][current]['role']['documentation'] ) {

                if ( Object.keys(foundTagInformation[0]['lang']).length === 1 ) {
                  containerElem.appendChild(document.createTextNode(
                    foundTagInformation[0]['lang'][current]['role']['documentation']));
                } else {
                  
                  var span = document.createElement('span');
                  span.className = 'font-weight-bold';
                  span.textContent = current.toUpperCase();
                  containerElem.appendChild(span);

                  containerElem.appendChild(document.createTextNode(
                    ': ' + foundTagInformation[0]['lang'][current]['role']['documentation']));
                  
                  if ( index < Object.keys(foundTagInformation[0]['lang']).length ) {
                    containerElem.appendChild(document.createElement('br'));
                  }
                }
              }
              
            });
        return containerElem.innerHTML;
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
    return null;
  },
  
  getLabel : function( name ) {
    if ( name && typeof name === 'string' ) {
      var foundTagInformation = Constants.getMetaTags.filter(function( element ) {
        if ( element['original-name'] === name.replace(':', '_') ) {
          return true;
        }
        return false;
      });
      
      if ( foundTagInformation && foundTagInformation[0] && foundTagInformation[0]['lang'] ) {
        
        var containerElem = document.createElement('div');
        
        Object.keys(foundTagInformation[0]['lang']).forEach(
            function( current, index ) {
              if ( foundTagInformation[0]['lang'][current]['role']
                  && foundTagInformation[0]['lang'][current]['role']['label'] ) {
                if ( Object.keys(foundTagInformation[0]['lang']).length === 1 ) {
                  containerElem.appendChild(document.createTextNode(
                    foundTagInformation[0]['lang'][current]['role']['label']));
                } else {
                  var span = document.createElement('span');
                  span.className = 'font-weight-bold';
                  span.textContent = current.toUpperCase();
                  containerElem.appendChild(span);
                  containerElem.appendChild(document.createTextNode(
                    foundTagInformation[0]['lang'][current]['role']['label']));
                  
                  if ( index < Object.keys(foundTagInformation[0]['lang']).length ) {
                    containerElem.appendChild(document.createElement('br'));
                  }
                }
              }
              
            });
        return containerElem.innerHTML;
        
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
  
  getTerseLabel : function( name ) {
    if ( name && typeof name === 'string' ) {
      var foundTagInformation = Constants.getMetaTags.filter(function( element ) {
        if ( element['original-name'] === name.replace(':', '_') ) {
          return true;
        }
        return false;
      });
      
      if ( foundTagInformation && foundTagInformation[0] && foundTagInformation[0]['lang'] ) {
        
        var containerElem = document.createElement('div');
        Object.keys(foundTagInformation[0]['lang']).forEach(
            function( current, index ) {
              if ( foundTagInformation[0]['lang'][current]['role']
                  && foundTagInformation[0]['lang'][current]['role']['terseLabel'] ) {
                var span = document.createElement('span');
                span.className = 'font-weight-bold';
                span.textContent = current.toUpperCase();
                containerElem.appendChild(span);
                containerElem.appendChild(document.createTextNode(
                  foundTagInformation[0]['lang'][current]['role']['terseLabel']));
                
                if ( index < Object.keys(foundTagInformation[0]['lang']).length ) {
                  containerElem.appendChild(document.createElement('br'));
                }
              }
              
            });
        return containerElem.innerHTML;
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
      return null;
    }
    return null;
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
                    'blank' : true,
                  });
                  
                  returnArray.push({
                    'label' : 'Section',
                    'value' : nestedCurrent['longName'],
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
                    'value' : weight,
                  });
                  
                  var parent = foundTag[0]['calculation'][current]['parentTag'] || null;
                  
                  if ( parent ) {
                    parent = FiltersName.getFormattedName(parent.replace('_', ':'));
                  } else {
                    parent = 'Not Available.';
                  }
                  
                  returnArray.push({
                    'label' : 'Parent',
                    'value' : parent,
                  });
                }
              });
            });
        return returnArray;
      }
      return null;
    } else {
      return null;
    }
  }

};
