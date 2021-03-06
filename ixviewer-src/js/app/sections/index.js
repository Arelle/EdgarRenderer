/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

'use strict';

var Sections = {

  currentlyOpenChildMenu: {},

  searchObject: {},

  clickEvent: function (event, element) {

    if (event.keyCode && !(event.keyCode === 13 || event.keyCode === 32)) {
      return;
    }

    if (element.getAttribute('baseref') && (element.getAttribute('baseref') !== HelpersUrl.getHTMLFileName)) {

      // we load it, then send the user to the correct spot

      AppInit.init(element.getAttribute('baseref'), function () {
        AppInit.additionalSetup();
        Sections.fallbackElementScroll(event, element);
      });
    } else {
      Sections.fallbackElementScroll(event, element);

    }

  },

  fallbackElementScroll: function (event, element) {
    Sections.setSelectedAttributes(element);
    var taxonomyElement = TaxonomiesGeneral.getElementByNameContextref(element.getAttribute('name'), element
      .getAttribute('contextref'));

    if (taxonomyElement) {
      taxonomyElement.scrollIntoView({
        'block': Constants.scrollPosition
      });
    } else {
      ErrorsMinor.factNotFound();
    }
  },

  toggle: function (event, element) {
    if (event.keyCode && !(event.keyCode === 13 || event.keyCode === 32)) {
      return;
    }

    if (element.classList && element.classList.contains('disabled')) {
      return;
    }
    MenusState.toggle('sections-menu', false, function (openMenu) {
      if (openMenu) {
        document.getElementById('sections-menu').addEventListener('transitionend', Sections.transitionEvent);
      }
    });

  },

  transitionEvent: function () {
    setTimeout(function () {
      Sections.populate();
      document.getElementById('sections-menu').removeEventListener('transitionend', Sections.transitionEvent);
    });
  },

  formChange: function () {

    if (MenusState.openMenu === 'sections-menu') {
      if (Sections.currentlyOpenChildMenu.hasOwnProperty('id') &&
        Sections.currentlyOpenChildMenu.hasOwnProperty('group')) {
        Sections.populateChildCollapse(Sections.currentlyOpenChildMenu['id'], Sections.currentlyOpenChildMenu['group']);
      }
    }

  },

  populate: function (searchObject) {

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

  populateParentCollapse: function (parentId, badgeId, groupType, containerId) {

    var discoveredGroupType = Sections.filterGroupType(groupType);

    if (discoveredGroupType.length === 0) {
      document.getElementById(parentId).classList.add('d-none');
    } else {
      document.getElementById(parentId).classList.remove('d-none');
      var collapseButton = document.querySelector('#' + parentId + ' button');

      collapseButton.setAttribute('onClick', 'Sections.prepareChildCollapse(this, "' + groupType + '");');

      document.getElementById(badgeId).textContent = discoveredGroupType.length;
    }

  },

  filterGroupType: function (groupType) {
    var discoveredGroupType = FiltersReports.getReportsByGroupType(groupType);
    var discoveredGroupTypeArray = Array.prototype.slice.call(discoveredGroupType);
    // we sort by Long Name to put it in the correct order.
    discoveredGroupTypeArray.sort(function (first, second) {
      return (first['longName']).localeCompare(second['longName']);
    });

    if (Object.keys(Sections.searchObject).length === 0 ||
      (Object.keys(Sections.searchObject).length === 1 && Sections.searchObject['type'] && Sections.searchObject['type'] === 1)) {

      return discoveredGroupTypeArray;

    }
    var filteredDiscoveredGroupTypeArray = discoveredGroupTypeArray.filter(function (element) {
      var keepElement = true;
      if (Sections.searchObject['type']) {
        if (Sections.searchObject['type'] === 2) {
          // return true if baseref is same as current url
          if (element['firstAnchor'] && element['firstAnchor']['baseRef']) {

            keepElement = (element['firstAnchor']['baseRef'] === HelpersUrl.getExternalFile
              .substr(HelpersUrl.getExternalFile.lastIndexOf('/') + 1));

          } else if (element['uniqueAnchor'] && element['uniqueAnchor']['baseRef']) {

            keepElement = (element['uniqueAnchor']['baseRef'] === HelpersUrl.getExternalFile
              .substr(HelpersUrl.getExternalFile.lastIndexOf('/') + 1));

          }
        }
        if (Sections.searchObject['type'] === 3) {
          // return true if baseref is NOT same as current url
          if (element['firstAnchor'] && element['firstAnchor']['baseRef']) {

            keepElement = (element['firstAnchor']['baseRef'] !== HelpersUrl.getExternalFile
              .substr(HelpersUrl.getExternalFile.lastIndexOf('/') + 1));

          } else if (element['uniqueAnchor'] && element['uniqueAnchor']['baseRef']) {

            keepElement = (element['uniqueAnchor']['baseRef'] !== HelpersUrl.getExternalFile
              .substr(HelpersUrl.getExternalFile.lastIndexOf('/') + 1));

          }
        }
      }
      if (Sections.searchObject['value']) {

        if (keepElement) {

          keepElement = Sections.searchObject['value'].test(element['shortName']);

        }

      }

      return keepElement;
    });

    return filteredDiscoveredGroupTypeArray;

  },

  prepareChildCollapse: function (event, groupType) {
    // TODO small error handling to ensure we have our HTML correct

    var idToPopulate = event.getAttribute('data-target').substring(1);
    if (document.getElementById(idToPopulate).classList.contains('show')) {
      Sections.currentlyOpenChildMenu = {};
      Sections.emptyChildCollapse(idToPopulate);
    } else {

      Sections.currentlyOpenChildMenu = {
        'id': '#' + idToPopulate,
        'group': groupType
      };

      Sections.populateChildCollapse(idToPopulate, groupType);
    }
  },

  populateChildCollapse: function (idToPopulate, groupType) {

    var discoveredGroupType = Sections.filterGroupType(groupType);

    var listHtml = '';
    discoveredGroupType
      .forEach(function (current, index) {

        var name = '';
        var contextref = '';
        var baseref = '';
        var sameBaseRef = true;

        if (current['firstAnchor']) {

          name = current['firstAnchor']['name'];
          contextref = current['firstAnchor']['contextRef'];
          baseref = current['firstAnchor']['baseRef'];
          if (current['firstAnchor']['baseRef']) {

            sameBaseRef = HelpersUrl.getHTMLFileName === current['firstAnchor']['baseRef'];
          }

        } else if (current['uniqueAnchor']) {

          name = current['uniqueAnchor']['name'];
          contextref = current['uniqueAnchor']['contextRef'];
          baseref = current['uniqueAnchor']['baseRef'];
          if (current['uniqueAnchor']['baseRef']) {

            sameBaseRef = HelpersUrl.getHTMLFileName === current['uniqueAnchor']['baseRef'];
          }

        }

        // listHtml += '<small>';
        if (sameBaseRef) {
          listHtml += '<li name="' +
            name +
            '" contextref="' +
            contextref +
            '" selected-taxonomy="false" onclick="Sections.clickEvent(event, this);" onkeyup="Sections.clickEvent(event, this);" class="reboot click list-group-item list-group-item-action d-flex align-items-center" tabindex="2">';
        } else {
          listHtml += '<li name="' +
            name +
            '" contextref="' +
            contextref +
            '" baseref="' +
            baseref +
            '" onclick="Sections.clickEvent(event, this);" onkeyup="Sections.clickEvent(event, this);" class="reboot click list-group-item list-group-item-action d-flex align-items-center" tabindex="2">';
          listHtml += '<i class="fas fa-external-link-alt mr-3"></i>';
        }
        listHtml += current['shortName'];
        listHtml += '</li>';
        // listHtml += '</small>';

      });

    if (idToPopulate && idToPopulate.startsWith('#')) {
      document.getElementById(idToPopulate.substring(1)).getElementsByClassName('list-group')[0].innerHTML = listHtml;
      $(idToPopulate.substring(1)).collapse('show');
    } else if (idToPopulate && !idToPopulate.startsWith('#')) {
      document.getElementById(idToPopulate).getElementsByClassName('list-group')[0].innerHTML = listHtml;
      $('#' + idToPopulate).collapse('show');
    }
  },

  emptyChildCollapse: function (idToEmpty) {
    $('#' + idToEmpty).collapse('hide');
    document.getElementById(idToEmpty).getElementsByClassName('list-group')[0].innerHTML = '';
  },

  setSelectedAttributes: function (element) {

    var selected = document.getElementById('tagged-sections').querySelectorAll('[selected-taxonomy]');
    var selectedArray = Array.prototype.slice.call(selected);
    selectedArray.forEach(function (current) {
      current.setAttribute('selected-taxonomy', false);
    });
    element.setAttribute('selected-taxonomy', true);
  }
};
