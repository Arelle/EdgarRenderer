/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var Sections = {
  
  currentlyOpenChildMenu : {},
  
  searchObject : {},
  
  clickEvent : function( event, element ) {
    
    if ( event.keyCode && !(event.keyCode === 13 || event.keyCode === 32) ) {
      return;
    }
    
    if ( element.getAttribute('baseref') && (element.getAttribute('baseref') !== HelpersUrl.getHTMLFileName) ) {
      
      // we load it, then send the user to the correct spot
      
      AppInit.init(element.getAttribute('baseref'), function( ) {
        AppInit.additionalSetup();
        Sections.fallbackElementScroll(event, element);
      });
    } else {
      Sections.fallbackElementScroll(event, element);
      
    }
    
  },
  
  fallbackElementScroll : function( event, element ) {
    Sections.setSelectedAttributes(element);
    var taxonomyElement = TaxonomiesGeneral.getElementByNameContextref(element.getAttribute('name'), element
        .getAttribute('contextref'));
    
    if ( taxonomyElement ) {
      taxonomyElement.scrollIntoView({
        'block' : Constants.scrollPosition
      });
    } else {
      ErrorsMinor.factNotFound();
    }
  },
  
  toggle : function( event, element ) {
    
    if ( event.keyCode && !(event.keyCode === 13 || event.keyCode === 32) ) {
      return;
    }
    
    if ( element.classList && element.classList.contains('disabled') ) {
      return;
    }
    
    MenusState.toggle('sections-menu', false, function( openMenu ) {
      if ( openMenu ) {
        document.getElementById('sections-menu').addEventListener('transitionend', function( event ) {
          // our menu is now open
          // we populate the menu with associated data
          Sections.populate();
        }, {
          'once' : true
        });
      }
    });
    
  },
  
  formChange : function( ) {
    
    if ( MenusState.openMenu === 'sections-menu' ) {
      if ( Sections.currentlyOpenChildMenu.hasOwnProperty('id')
          && Sections.currentlyOpenChildMenu.hasOwnProperty('group') ) {
        Sections.populateChildCollapse(Sections.currentlyOpenChildMenu['id'], Sections.currentlyOpenChildMenu['group']);
      }
    }
    
  },
  
  populate : function( searchObject ) {
    
    searchObject = searchObject || {};
    
    Sections.searchObject = searchObject;
    
    Sections.populateParentCollapse('tagged-sections-0', 'collapseDocumentEntityTypesBadge', 'document',
        'collapseDocumentEntityTypes');
    
    Sections.populateParentCollapse('tagged-sections-1', 'collapseFinancialStatementsBadge', 'statement',
        'collapseFinancialStatements');
    
    Sections.populateParentCollapse('tagged-sections-2', 'collapseNotesToTheFinancialsBadge', 'disclosure',
        'collapseNotesToTheFinancials');
    
    Sections.populateParentCollapse('tagged-sections-3', 'collapseRRSummariesBadge', 'RR_Summaries',
        'collapseRRSummaries');
    
    Sections.formChange();
  },
  
  populateParentCollapse : function( parentId, badgeId, groupType, containerId ) {
    
    var discoveredGroupType = Sections.filterGroupType(groupType);
    
    if ( discoveredGroupType.length === 0 ) {
      document.getElementById(parentId).classList.add('d-none');
    } else {
      document.getElementById(parentId).classList.remove('d-none');
      var collapseButton = document.querySelector('#' + parentId + ' button');
      
      collapseButton.addEventListener('click', function(e) {Sections.prepareChildCollapse(this, groupType)});
      
      document.getElementById(badgeId).textContent = discoveredGroupType.length;
    }
    
  },
  
  filterGroupType : function( groupType ) {
    var discoveredGroupType = FiltersReports.getReportsByGroupType(groupType);
    var discoveredGroupTypeArray = Array.prototype.slice.call(discoveredGroupType);
    // we sort by Long Name to put it in the correct order.
    discoveredGroupTypeArray.sort(function( first, second ) {
      return (first['longName']).localeCompare(second['longName']);
    });
    
    if ( Object.keys(Sections.searchObject).length === 0
        || (Object.keys(Sections.searchObject).length === 1 && Sections.searchObject['type'] && Sections.searchObject['type'] === 1) ) {
      
      return discoveredGroupTypeArray;
      
    } else {
      var filteredDiscoveredGroupTypeArray = discoveredGroupTypeArray.filter(function( element ) {
        var keepElement = true;
        if ( Sections.searchObject['type'] ) {
          if ( Sections.searchObject['type'] === 2 ) {
            // return true if baseref is same as current url
            if ( element['firstAnchor'] && element['firstAnchor']['baseRef'] ) {
              
              keepElement = (element['firstAnchor']['baseRef'] === HelpersUrl.getExternalFile
                  .substr(HelpersUrl.getExternalFile.lastIndexOf('/') + 1));
              
            } else if ( element['uniqueAnchor'] && element['uniqueAnchor']['baseRef'] ) {
              
              keepElement = (element['uniqueAnchor']['baseRef'] === HelpersUrl.getExternalFile
                  .substr(HelpersUrl.getExternalFile.lastIndexOf('/') + 1));
              
            }
          }
          if ( Sections.searchObject['type'] === 3 ) {
            // return true if baseref is NOT same as current url
            if ( element['firstAnchor'] && element['firstAnchor']['baseRef'] ) {
              
              keepElement = (element['firstAnchor']['baseRef'] !== HelpersUrl.getExternalFile
                  .substr(HelpersUrl.getExternalFile.lastIndexOf('/') + 1));
              
            } else if ( element['uniqueAnchor'] && element['uniqueAnchor']['baseRef'] ) {
              
              keepElement = (element['uniqueAnchor']['baseRef'] !== HelpersUrl.getExternalFile
                  .substr(HelpersUrl.getExternalFile.lastIndexOf('/') + 1));
              
            }
          }
        }
        if ( Sections.searchObject['value'] ) {
          
          if ( keepElement ) {
            
            keepElement = Sections.searchObject['value'].test(element['shortName']);
            
          }
          
        }
        
        return keepElement;
      });
      
      return filteredDiscoveredGroupTypeArray;
    }
    
  },
  
  prepareChildCollapse : function( event, groupType ) {
    // TODO small error handling to ensure we have our HTML correct
    var idToPopulate = event.dataset['target'].substring(1);
    if ( document.getElementById(idToPopulate).classList.contains('show') ) {
      Sections.currentlyOpenChildMenu = {};
      Sections.emptyChildCollapse(idToPopulate);
    } else {
      
      Sections.currentlyOpenChildMenu = {
        'id' : '#' + idToPopulate,
        'group' : groupType
      };
      
      Sections.populateChildCollapse(event.dataset['target'], groupType);
    }
  },

  populateChildCollapse : function( idToPopulate, groupType ) {

    idToPopulate = idToPopulate.substring(1);
    var firstListGroup = document.getElementById(idToPopulate).getElementsByClassName('list-group')[0];
    firstListGroup.innerHTML = '';
    var discoveredGroupType = Sections.filterGroupType(groupType);
    discoveredGroupType
        .forEach(function( current, index ) {

          var name = '';
          var contextref = '';
          var baseref = '';
          var sameBaseRef = true;

          if ( current['firstAnchor'] ) {

            name = current['firstAnchor']['name'];
            contextref = current['firstAnchor']['contextRef'];
            baseref = current['firstAnchor']['baseRef'];
            if ( current['firstAnchor']['baseRef'] ) {

              sameBaseRef = HelpersUrl.getHTMLFileName === current['firstAnchor']['baseRef'];
            }

          } else if ( current['uniqueAnchor'] ) {

            name = current['uniqueAnchor']['name'];
            contextref = current['uniqueAnchor']['contextRef'];
            baseref = current['uniqueAnchor']['baseRef'];
            if ( current['uniqueAnchor']['baseRef'] ) {

              sameBaseRef = HelpersUrl.getHTMLFileName === current['uniqueAnchor']['baseRef'];
            }

          }

          var li = document.createElement('li');
          li.setAttribute('name', name);
          li.setAttribute('contextref', contextref);
          li.setAttribute('selected-taxonomy', 'false');
          li.addEventListener('click', function(e) {Sections.clickEvent(e, this)});
          li.addEventListener('keyup', function(e) {Sections.clickEvent(e, this)});
          li.className = 'click list-group-item list-group-item-action d-flex align-items-center';
          li.tabIndex = 2;

          if ( !sameBaseRef ) {
            li.setAttribute('baseref', baseref);
            var icon = document.createElement('i');
            icon.className = 'fas fa-external-link-alt mr-3';
            li.appendChild(icon);
          }

          li.textContent = current['shortName'];
          firstListGroup.appendChild(li);

        });
    $('#' + idToPopulate).collapse('show');
  },

  emptyChildCollapse : function( idToEmpty ) {
    $('#' + idToEmpty).collapse('hide');
    document.getElementById(idToEmpty).getElementsByClassName('list-group')[0].innerHTML = '';
  },
  
  setSelectedAttributes : function( element ) {
    
    var selected = document.getElementById('tagged-sections').querySelectorAll('[selected-taxonomy]');
    var selectedArray = Array.prototype.slice.call(selected);
    selectedArray.forEach(function( current ) {
      current.setAttribute('selected-taxonomy', false);
    });
    element.setAttribute('selected-taxonomy', true);
  }
};
