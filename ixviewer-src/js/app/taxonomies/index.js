/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

"use strict";

var Taxonomies = {
  updateTaxonomyCount: function (includeHighlights, initialCountIfTrue) {
    initialCountIfTrue = initialCountIfTrue || false;
    var taxonomyTotalElements = document.querySelectorAll(
      ".taxonomy-total-count"
    );
    var taxonomyTotalElementsArray = Array.prototype.slice.call(
      taxonomyTotalElements
    );

    var foundTaxonomies = null;
    if (includeHighlights) {
      foundTaxonomies = document
        .getElementById("dynamic-xbrl-form")
        .querySelectorAll(
          '[contextref][enabled-taxonomy="true"][highlight-taxonomy="true"]'
        );
    } else {
      foundTaxonomies = document
        .getElementById("dynamic-xbrl-form")
        .querySelectorAll('[contextref][enabled-taxonomy="true"]');
    }

    var taxonomyCount = foundTaxonomies.length;
    Constants.getHtmlOverallTaxonomiesCount = taxonomyCount
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    taxonomyTotalElementsArray.forEach(function (current) {
      if (Constants.getHtmlOverallTaxonomiesCount === "0") {
        document.getElementById("facts-menu").setAttribute("disabled", true);
        document.getElementById("facts-menu").classList.add("disabled");
      } else {
        document.getElementById("facts-menu").removeAttribute("disabled");
        document.getElementById("facts-menu").classList.remove("disabled");
      }
      current.textContent = Constants.getHtmlOverallTaxonomiesCount;
    });

    if (!initialCountIfTrue) {
      TaxonomiesMenu.prepareForPagination();
    } else {
      Errors.checkPerformanceConcern(foundTaxonomies.length);
    }
    return taxonomyCount;
  },

  loadingTaxonomyCount: function (callback) {
    var taxonomyTotalElements = document.querySelectorAll(
      ".taxonomy-total-count"
    );
    var taxonomyTotalElementsArray = Array.prototype.slice.call(
      taxonomyTotalElements
    );
    document.getElementById("facts-menu").setAttribute("disabled", true);
    taxonomyTotalElementsArray.forEach(function (current) {
      current.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    });
    setTimeout(function () {
      callback();
    }, 50);
  },

  fixStyleString: function (input) {
    return input.split(";").reduce(function (accumulator, currentValue) {
      var rulePair = currentValue.split(":");
      if (rulePair[0] && rulePair[1]) {
        accumulator[rulePair[0].trim()] = rulePair[1].trim();
      }
      return accumulator;
    }, {});
  },

  updateStyleTaxonomies: function () {
    // TODO need more test cases
    var foundStyles = document
      .getElementById("dynamic-xbrl-form")
      .querySelectorAll('[style*="-ix-hidden"]');
    var foundStylesArray = Array.prototype.slice.call(foundStyles);

    foundStylesArray.forEach(function (current) {
      var updatedStyle = Taxonomies.fixStyleString(
        current
          .getAttribute("style")
          .replace("-esef-ix-hidden", "-sec-ix-hidden")
      );

      var hiddenElement = document
        .getElementById("dynamic-xbrl-form")
        .querySelector('[id="' + updatedStyle["-sec-ix-hidden"] + '"]');

      if (hiddenElement) {
        // we now create an entirely new element based on the innerHTML
        // of current, and the attributes of hiddenElement
        var newElement = '';
        
        newElement += '<' + hiddenElement.tagName.toLowerCase();
        // add all of the necessary attributes
        for ( var i = 0; i < hiddenElement.attributes.length; i++ ) {
          var attribute = hiddenElement.attributes[i];
          newElement += ' ' + attribute.name + '="' + attribute.value + '"';
        }
        
        newElement += ' isadditionalitemsonly="true"';
        newElement += ' ishiddenelement="true"';
        newElement += '>';
        newElement += current.innerHTML;
        // close the tag
        newElement += '</' + hiddenElement.tagName.toLowerCase() + '>';
        
        hiddenElement.removeAttribute('contextref');
        hiddenElement.removeAttribute('name');
        
        current.innerHTML = newElement;
        
      }
    });

    var foundRedlineStyles = document
      .getElementById("dynamic-xbrl-form")
      .querySelectorAll('[style*="-ix-redline"]');
    var foundRedlineStylesArray =
      Array.prototype.slice.call(foundRedlineStyles);

    if (
      HelpersUrl.getAllParams.hasOwnProperty("redline") &&
      HelpersUrl.getAllParams.redline
    ) {
      foundRedlineStylesArray.forEach(function (current) {
        var updatedStyle = Taxonomies.fixStyleString(
          current
            .getAttribute("style")
            .replace("-esef-ix-redline", "-sec-ix-redline")
        );

        if (updatedStyle["-sec-ix-redline"] === "true") {
          current.setAttribute("redline", true);
        }
      });
    }
  },

  addEventAttributes: function () {
    var startPerformance = performance.now();
    Taxonomies.updateStyleTaxonomies();
    
    var foundTaxonomies = document.getElementById('dynamic-xbrl-form').querySelectorAll(
        '[contextref], [continuedat], ' + Constants.getHTMLPrefix + '\\:continuation');
    var foundTaxonomiesArray = Array.prototype.slice.call(foundTaxonomies);
    var isChrome = window.chrome;
    foundTaxonomiesArray
        .forEach(function( current, index ) {
          
          if ( current.closest('table') ) {
            current.setAttribute('inside-table', true);
          } else {
            current.setAttribute('inside-table', false);
          }
          
          // we find all the facts prefix (for example: dei, us-gaap)
          if ( current.hasAttribute('name') && current.getAttribute('name').split(':').length === 2 ) {
            if ( Constants.getFactTypes.indexOf(current.getAttribute('name').split(':')[0].toUpperCase()) === -1 ) {
              Constants.getFactTypes.push(current.getAttribute('name').split(':')[0].toUpperCase());
            }
          }
          if ( current.tagName.toLowerCase().indexOf('continuation') === -1 && !current.hasAttribute('continuedat') ) {
            
            if ( current.hasAttribute('name') ) {
              
              // since the text block is not consistent with he end of the name
              // attribute, we also check for children
              var textBlock = current.getAttribute('name').trim().endsWith('TextBlock');
              if ( textBlock ) {
                
                current.setAttribute('text-block-taxonomy', true);
                
                var leftSpan = document.createElement('span');
                leftSpan.setAttribute('class', 'float-left text-block-indicator-left position-absolute');
                leftSpan.title = 'One or more textblock facts are between this symbol and the right side symbol.';
                current.parentNode.insertBefore(leftSpan, current);
                
                var rightSpan = document.createElement('span');
                rightSpan.setAttribute('class', 'float-right text-block-indicator-right position-absolute');
                rightSpan.title = 'One or more textblock facts are between this symbol and the left side symbol.';
                current.parentNode.insertBefore(rightSpan, current);
              }
            }
            if ( current.hasAttribute('id') ) {
              current.setAttribute('data-original-id', current.getAttribute('id'));
            }
            current.setAttribute('id', 'fact-identifier-' + index);
            current.setAttribute('continued-taxonomy', false);
          } else if ( current.tagName.toLowerCase().indexOf('continuation') === -1
              && current.hasAttribute('continuedat') ) {
            
            var leftSpan = document.createElement('span');
            leftSpan.setAttribute('class', 'float-left text-block-indicator-left position-absolute');
            leftSpan.title = 'One or more textblock facts are between this symbol and the right side symbol.';
            current.parentNode.insertBefore(leftSpan, current);
            
            var rightSpan = document.createElement('span');
            rightSpan.setAttribute('class', 'float-right text-block-indicator-right position-absolute');
            rightSpan.title = 'One or more textblock facts are between this symbol and the left side symbol.';
            current.parentNode.insertBefore(rightSpan, current);
            
            current.setAttribute('continued-main-taxonomy', true);
            if ( current.hasAttribute('id') ) {
              current.setAttribute('data-original-id', current.getAttribute('id'));
            }
            current.setAttribute('id', 'fact-identifier-' + index);
          } else if ( current.tagName.toLowerCase().indexOf('continuation') >= 0 ) {
            
            current.setAttribute('continued-taxonomy', true);
          }
          
          current.setAttribute('enabled-taxonomy', true);
          current.setAttribute('highlight-taxonomy', false);
          current.setAttribute('selected-taxonomy', false);
          current.setAttribute('hover-taxonomy', false);
          
          current.setAttribute('onClick', 'Taxonomies.clickEvent(event, this)');
          current.setAttribute('onKeyUp', 'Taxonomies.clickEvent(event, this)');
          
          current.setAttribute('onMouseEnter', 'Taxonomies.enterElement(event, this);');
          current.setAttribute('onMouseLeave', 'Taxonomies.leaveElement(event, this);');
          current.setAttribute('tabindex', '18');
          if ( current.hasAttribute('contextref') && isChrome && foundTaxonomiesArray.length < 7500 ) {
            Taxonomies.setFilterAttributes(current);
          } else {
            // we always want to set isAdditionalItemsOnly="boolean"
            if ( !current.hasAttribute('isAdditionalItemsOnly') ) {
              current.setAttribute('isAdditionalItemsOnly', TaxonomiesGeneral.isParentNodeHidden(current));
            }
          }
          
          // we want to wrap every fact with a common span
          var span = document.createElement('span');
          current.parentNode.insertBefore(span, current);
          span.appendChild(current);
          
        });
    
    Taxonomies.updateTaxonomyCount(null, true);
    var endPerformance = performance.now();
    console.debug(
      "Taxonomies.addEventAttributes() completed in: " +
        (endPerformance - startPerformance).toFixed(2) +
        "(ms)."
    );
  },

  setFilterAttributes: function (element) {
    if (element) {
      var elementIsCalculationsOnly = false;
      if (
        Constants.getMetaCalculationsParentTags.indexOf(
          element.getAttribute("name").replace(":", "_")
        ) >= 0
      ) {
        if (
          FiltersContextref.getDimensions(element.getAttribute("contextref"))
            .length === 0
        ) {
          elementIsCalculationsOnly = true;
        }
      }

      element.setAttribute(
        "isAmountsOnly",
        element["tagName"].split(":")[1].toLowerCase() === "nonfraction"
          ? true
          : false
      );

      element.setAttribute(
        "isTextOnly",
        element["tagName"].split(":")[1].toLowerCase() === "nonnumeric"
          ? true
          : false
      );

      element.setAttribute("isCalculationsOnly", elementIsCalculationsOnly);

      element.setAttribute(
        "isNegativesOnly",
        element.getAttribute("sign") === "-" ? true : false
      );

      if (!element.hasAttribute("isAdditionalItemsOnly")) {
        element.setAttribute(
          "isAdditionalItemsOnly",
          TaxonomiesGeneral.isParentNodeHidden(element)
        );
      }

      element.getAttribute("name").split(":")[0].toLowerCase() ===
        Constants.getMetaCustomPrefix;

      element.setAttribute(
        "isStandardOnly",
        element.getAttribute("name").split(":")[0].toLowerCase() !==
          Constants.getMetaCustomPrefix
          ? true
          : false
      );

      element.setAttribute(
        "isCustomOnly",
        element.getAttribute("name").split(":")[0].toLowerCase() ===
          Constants.getMetaCustomPrefix
          ? true
          : false
      );
    }
  },

  isElementContinued: function (element) {
    if (element) {
      if (element instanceof Array) {
        return true;
      }
      if (
        element.hasAttribute("continued-taxonomy") &&
        element.getAttribute("continued-taxonomy") === "true"
      ) {
        return true;
      }
      if (
        element.hasAttribute("continued-main-taxonomy") &&
        element.getAttribute("continued-main-taxonomy") === "true"
      ) {
        return true;
      }
    }
    return false;
  },

  isElementNested: function (element) {
    ModalsNested.getAllElementIDs = [];
    ModalsNested.recursielyFindAllNestedTaxonomies(element, true);

    return ModalsNested.getAllElementIDs.length > 1;
  },

  clickEvent: function (event, element) {
    if (event.keyCode && !(event.keyCode === 13 || event.keyCode === 32)) {
      return;
    }

    event.stopPropagation();
    event.preventDefault();

    if (Taxonomies.isElementNested(element)) {
      // clicked fact is nested
      ModalsNested.clickEvent(event, element);
    } else if (Taxonomies.isElementContinued(element)) {
      // clicked fact is continued
      ModalsContinuedAt.clickEvent(event, element);

      if (
        ModalsContinuedAt.getAllElements &&
        ModalsContinuedAt.getAllElements[0] &&
        ModalsContinuedAt.getAllElements[0].hasAttribute("id")
      ) {
        document
          .getElementById("taxonomy-modal-jump")
          .setAttribute(
            "data-id",
            ModalsContinuedAt.getAllElements[0].getAttribute("id")
          );
      }
    } else {
      // clicked fact is common and or a text-block
      if (element && element.hasAttribute("id")) {
        document
          .getElementById("taxonomy-modal-jump")
          .setAttribute("data-id", element.getAttribute("id"));
      }
      ModalsCommon.clickEvent(event, element);
    }
  },

  enterElement: function (event, element) {
    event.stopPropagation();
    event.preventDefault();

    Taxonomies.resetAllPopups(function () {
      Taxonomies.resetAllHoverAttributes();
      element.setAttribute("hover-taxonomy", true);
      if (Constants.hoverOption) {
        if (Taxonomies.isElementContinued(element)) {
          if (element.hasAttribute("continued-main-taxonomy")) {
            Taxonomies.addPopover(element);
          }
        } else {
          Taxonomies.addPopover(element);
        }
      }
    });
  },

  addPopover: function (element) {
    var terseLabelOnly = FiltersName.getLabelForTitle(
      element.getAttribute("name")
    )
      ? FiltersName.getLabelForTitle(element.getAttribute("name"))
      : "Not Available.";

    element.setAttribute("data-bs-toggle", "popover");
    element.setAttribute("data-title", terseLabelOnly);

    var popoverHtml = "";
    popoverHtml += '<div class="popover" role="tooltip">';
    popoverHtml += '<div class="arrow"></div>';
    popoverHtml +=
      '<h3 class="popover-header text-center text-popover-clamp-1 py-0"></h3>';
    popoverHtml +=
      '<div class="text-center text-popover-clamp-2 py-1">' +
      FiltersValue.getFormattedValue(element, true) +
      "</div>";
    popoverHtml +=
      '<div class="text-center p-2">' +
      FiltersContextref.getPeriod(element.getAttribute("contextref")) +
      "</div>";
    popoverHtml +=
      '<p class="text-center p-2">Click for additional information.</p>';
    popoverHtml += "</div>";

    $(element).popover({
      placement: "auto",
      template: popoverHtml,
      container: "body"
    });
    $(element).popover("show");
  },

  leaveElement: function (event, element) {
    event.stopPropagation();
    event.preventDefault();
    // hide them all!
    $(element).popover("hide");
    Taxonomies.resetAllPopups(function () {
      Taxonomies.resetAllHoverAttributes();
    });
  },

  resetAllPopups: function (callback) {
    var foundPopupClasses = document.querySelectorAll(".popover");
    var foundPopupClassesArray = Array.prototype.slice.call(foundPopupClasses);
    foundPopupClassesArray.forEach(function (current) {
      current.parentNode.removeChild(current);
    });

    callback();
  },

  resetAllHoverAttributes: function () {
    var foundHoverClasses = document
      .getElementById("dynamic-xbrl-form")
      .querySelectorAll('[hover-taxonomy="true"]');

    var foundHoverClassesArray = Array.prototype.slice.call(foundHoverClasses);

    foundHoverClassesArray.forEach(function (current) {
      current.setAttribute("hover-taxonomy", false);
    });
  }
};
