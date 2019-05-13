/*
 * Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

/*
 * App_Find
 * The Find object handles everything in the left pane that is used to find things. (Highlight, Filter, Search etc)
 * */
var _filterList = [];
var _dataList = [ 'Amounts Only', 'Text Only', 'Calculations Only', 'Negatives Only', 'Additional Items Only' ];
var _tagList = [ 'Standard Only', 'Custom Only' ];
var _htmlHover = {
  id : "",
  xbrlValue : "",
  html : ""
};

function getImagePath () {
  var _find_js_url = $('script[src*="find.js"]').attr('src').split('?')[0].split('find.js')[0];
  var a = document.createElement('a');
  a.href = _find_js_url + '../../images/';
  return a.href;
}

var _lazyLoadTaggedSection = false;
var _lazyLoadResults = false;

var App_Find = {
  init : function () {
    
    /*
     * $(document).ready(function(){ if(screen.width>=768 &&
     * ((window.orientation) || (window.orientation=='0') ||
     * (window.orientation=='180'))){ $("html,body").animate({scrollTop: 0},
     * 100); } if(screen.width>=768 && (((window.orientation=='90') ||
     * (window.orientation=='-90')))){ $("html,body").animate({scrollTop: 0},
     * 100); } });
     */

    $('.dropdown-submenu > a').submenupicker();
    
    $("#settings-modal").draggable({
      handle : ".modal-header"
    });
    $("#highlight-data-modal").draggable({
      handle : ".modal-header"
    });
    $("#highlight-concept-modal").draggable({
      handle : ".modal-header"
    });
    $("#selection-detail-container").draggable({
      handle : ".selection-detail-header"
    });
    $("#filter-period-modal").draggable({
      handle : ".modal-header"
    });
    $("#filter-unit-modal").draggable({
      handle : ".modal-header"
    });
    $("#filter-axis-modal").draggable({
      handle : ".modal-header"
    });
    $("#filter-scale-modal").draggable({
      handle : ".modal-header"
    });
    $("#filter-balance-modal").draggable({
      handle : ".modal-header"
    });
    
    $("#about-modal").draggable({
      handle : ".about-header"
    });
    
    $("#copyAllCoAndDoc").mouseover(function () {
      $("#copyAllCoAndDoc").attr("title", "Copy All");
    });
    
    $("#closeCoAndDoc").mouseover(function () {
      $("#closeCoAndDoc").attr("title", "Close");
    });
    
    $("#copyAllFRW").mouseover(function () {
      $("#copyAllFRW").attr("title", "Copy All");
    });
    
    $("#closeFRW").mouseover(function () {
      $("#closeFRW").attr("title", "Close");
    });
    
    $("#nextCarousel").mouseover(function () {
      $("#nextCarousel").attr("title", "Next");
    });
    
    $("#prevCarousel").mouseover(function () {
      $("#prevCarousel").attr("title", "Prev");
    });
    
    $("#nextCarousel1").mouseover(function () {
      $("#nextCarousel1").attr("title", "Next");
    });
    
    $("#prevCarousel1").mouseover(function () {
      $("#prevCarousel1").attr("title", "Prev");
    });
    
    App_Find.Highlight.init();
    App_Find.Filter.init();
    App_Find.Search.init();
    App_Find.TaggedSection.init();
    // App_Find.Results.init();
    App_Find.Element.init();
    App_Find.Settings.init();
    $("#selection-detail-container").dialog({
      autoOpen : false
    });
    
    $("#about-modal").dialog({
      autoOpen : false
    });
  },
  resetUI : function () {
    
    App_Find.Highlight.resetUI();
    App_Find.Filter.resetUI();
    App_Find.Search.resetUI();
    App_Find.Breadcrumb.resetUI();
    App_Find.Results.resetUI();
    App_Find.Element.resetUI();
  },
  removeHighlightFilter : function () {
    
    App.frame.contents().find('.sec-cbe-highlight-filter').removeClass('sec-cbe-highlight-filter');
  },
  Highlight : {
    cachedResults : {
      both : $(),
      amount : $(),
      text : $(),
      calculation : $(),
      negative : $(),
      sign : $(),
      hidden : $(),
      relationship : $(),
      footnote : $(),
      continuedAt : $(),
      allData : $(),
      nonnumericnodes : $(),
      linkedHiddenNodes : null,
      arrayOfImages : $(),
    },
    init : function () {
      
      // change highlight type or concept type
      $('#highlight-data-modal').find('input[type="radio"]').on('change', function () {
        
        App.showSpinner($('.modal-header'), function () {
          
          App_Find.Highlight.refresh();
          App.hideSpinner();
        });
      });
      // change highlight type or concept type
      $('#highlight-concept-modal').find('input[type="radio"]').on('change', function () {
        
        App.showSpinner($('.modal-header'), function () {
          
          App_Find.Highlight.refresh();
          App.hideSpinner();
        });
      });
      
    },
    
    initLinkedHiddenNodes : function () {
      App_Find.Highlight.cachedResults.linkedHiddenNodes = $();
      App.frame.contents().find('*[style*="-sec-ix-hidden"]').each(function (index) {
        var elt = this.nodeName.split(':');
        if (elt.length < 2) {
          var style = this.getAttribute("style");
          style = style.substring(style.indexOf("-sec-ix-hidden"));
          var id = style.substring(style.indexOf(":") + 1).trim();
          if (id.indexOf(";") > -1) {
            id = id.substring(0, id.indexOf(";"));
          }
          var specialNode = [];
          specialNode.push(id, [ this ]);
          App_Find.Highlight.cachedResults.linkedHiddenNodes.push(specialNode);
        }
      });
    },
    
    resetUI : function () {
      
      App_Find.Highlight.cachedResults.both = $();
      App_Find.Highlight.cachedResults.amount = $();
      App_Find.Highlight.cachedResults.text = $();
      App_Find.Highlight.cachedResults.calculation = $();
      App_Find.Highlight.cachedResults.negative = $();
      App_Find.Highlight.cachedResults.sign = $();
      App_Find.Highlight.cachedResults.hidden = $();
      
      // reset radio buttons
      var modal = $('#highlight-data-modal');
      modal.find('input[name="highlight-elements"]:first').prop('checked', true);
      var modal1 = $('#highlight-concept-modal');
      modal1.find('input[name="highlight-concepts"]:first').prop('checked', true);
    },
    reset : function () {
      
      var modal = $('#highlight-data-modal');
      modal.find('input[name="highlight-elements"]:first').prop('checked', true);
      var modal1 = $('#highlight-concept-modal');
      modal1.find('input[name="highlight-concepts"]:first').prop('checked', true);
    },
    resetData : function () {
      
      var modal = $('#highlight-data-modal');
      modal.find('input[name="highlight-elements"]:first').prop('checked', true);
    },
    resetConcepts : function () {
      
      var modal = $('#highlight-concept-modal');
      modal.find('input[name="highlight-concepts"]:first').prop('checked', true);
    },
    highlight : function () {
      App.frame.contents().find('.sec-cbe-highlight-dashed, .sec-cbe-highlight-dashed_block').removeClass(
          'sec-cbe-highlight-dashed sec-cbe-highlight-dashed_block');
      var highlightType = App_Find.Highlight.getSelected().value;
      var results = App_Find.Highlight.getResults();
      var instance = App.InlineDoc.getMetaData();
      var node = "";
      var nodes = "";
      if (highlightType != 'none') {
        
        if (results.length == 0) {
          if (highlightType == 'calculation') {
            if (instance) {
              tags = instance.tag;
              for (id in tags) {
                tag = tags[id];
                if (tag.calculation) {
                  nodes = App.InlineDoc.getElementByName(id.replace('_', ':'));
                  for (var i = 0; i < nodes.length; i++) {
                    node = $(nodes[i]);
                    if (!node.hasDimensions()) {
                      results.push(node);
                    }
                  }
                }
              }
            }
            App_Find.Highlight.cachedResults[highlightType] = results;
          } else {
            
            var inlineHighlightTypes;
            switch (highlightType) {
              case 'both':
                inlineHighlightTypes = [ 'nonFraction', 'nonNumeric' ];
                break;
              case 'amount':
                inlineHighlightTypes = [ 'nonFraction' ];
                break;
              case 'text':
                inlineHighlightTypes = [ 'nonNumeric' ];
                break;
              case 'hidden':
                inlineHighlightTypes = [ 'hidden' ];
                break;
              case 'negative':
                inlineHighlightTypes = [ 'negative' ];
                break;
              case 'sign':
                inlineHighlightTypes = [ 'sign' ];
                break;
            }
            App_Find.Highlight.cachedResults[highlightType] = App.InlineDoc.getElementsByType(inlineHighlightTypes,
                true);
            results = App_Find.Highlight.cachedResults[highlightType];
          }
        }
        App_Find.Results.load();
        /*
         * if(!App_Find.TaggedSection.isInitialized){
         * App_Find.TaggedSection.load(); }
         */
      }
    },
    getResults : function () {
      
      var selected = App_Find.Highlight.getSelected();
      return selected.value == 'none' ? $() : App_Find.Highlight.cachedResults[selected.value];
    },
    getSelected : function () {
      
      var modal1 = $('#highlight-data-modal');
      var highlightRadio = modal1.find('input[name="highlight-elements"]:checked');
      var modal2 = $('#highlight-concept-modal');
      var conceptsRadio = modal2.find('input[name="highlight-concepts"]:checked');
      return {
        value : highlightRadio.val(),
        label : highlightRadio.parent().text().trim(),
        conceptValue : conceptsRadio.val(),
        conceptLabel : conceptsRadio.parent().text().trim()
      }
    },
    refresh : function () {
      
      App_Find.Filter.updateSelectedCounts();
      App_Find.Breadcrumb.refresh();
      App_Find.Highlight.highlight();
    },
    refreshData : function () {
      
      App_Find.Filter.updateSelectedCounts();
      App_Find.Breadcrumb.refresh();
      App_Find.Highlight.highlight();
    },
    refreshConcepts : function () {
      
      App_Find.Filter.updateSelectedCounts();
      App_Find.Breadcrumb.refresh();
      App_Find.Highlight.highlight();
    },
    refreshPeriod : function () {
      
      App_Find.Filter.updateSelectedCounts();
      App_Find.Breadcrumb.refresh();
      App_Find.Highlight.highlight();
    },
    refreshUnits : function () {
      
      App_Find.Filter.updateSelectedCounts();
      App_Find.Breadcrumb.refresh();
      App_Find.Highlight.highlight();
    },
    refreshAxis : function () {
      
      App_Find.Filter.updateSelectedCounts();
      App_Find.Breadcrumb.refresh();
      App_Find.Highlight.highlight();
    },
    refreshScale : function () {
      
      App_Find.Filter.updateSelectedCounts();
      App_Find.Breadcrumb.refresh();
      App_Find.Highlight.highlight();
    },
    refreshBalance : function () {
      
      App_Find.Filter.updateSelectedCounts();
      App_Find.Breadcrumb.refresh();
      App_Find.Highlight.highlight();
    }
  },
  Filter : {
    init : function () {
      
      var modal = $('#filter-period-modal');
      modal.on('shown.bs.modal', function (e) {
        
        var content = $(e.currentTarget);
        if (content.attr('data-contents-loaded') == 'false') {
          
          content.attr('data-contents-loaded', 'true');
          App_Find.Filter.loadCalendars();
          
          // hide all the years except for the first year
          content.find('div[data-calendar-year]').each(function (index, element) {
            
            var year = $(element).attr('data-calendar-year');
            if (index == 0) {
              
              App_Find.Filter.showCalendarTree(year);
            } else {
              
              App_Find.Filter.hideCalendarTree(year);
            }
          });
          
          // wire up the checkboxes
          content.find('input[type=checkbox]').on(
              'change',
              function () {
                
                var checkbox = $(this);
                var checkboxContainer = checkbox.parents('div[class="checkbox"]');
                
                var modal1 = $('#settings-modal');
                
                if (checkboxContainer.attr('data-calendar-year')) {
                  
                  var checked = checkboxContainer.find('input').prop('checked');
                  content.find('div[data-calendar-item="' + checkboxContainer.attr('data-calendar-year') + '"]').each(
                      function (index, element) {
                        
                        $(element).find('input').prop('checked', checked);
                      });
                } else {
                  
                  var year = checkboxContainer.attr('data-calendar-item');
                  if (checkbox.is(':checked')) {
                    
                    var allChecked = true;
                    content.find('div[data-calendar-item="' + year + '"]').each(function () {
                      
                      if (!$(this).find('input').is(':checked')) {
                        
                        allChecked = false;
                        return false;
                      }
                    });
                    
                    if (allChecked) {
                      
                      var containerParent = content.find('div[data-calendar-year="' + year + '"]');
                      containerParent.find('input').prop('checked', true);
                    }
                  } else {
                    
                    var containerParent = content.find('div[data-calendar-year="' + year + '"]');
                    containerParent.find('input').prop('checked', false);
                  }
                }
                App.showSpinner($('.modal-header'), function () {
                  
                  App_Find.Filter.updateSelectedCounts();
                  App_Find.Breadcrumb.refresh();
                  App_Find.Highlight.highlight();
                  App.hideSpinner();
                });
              });
          
          // wire up the expand/collapse icons
          content.find('div[data-calendar-year] span').on('click', function () {
            
            var node = $(this);
            var year = node.parents('div[data-calendar-year]');
            year = year.attr('data-calendar-year');
            if (node.hasClass('icon-plus-black')) {
              
              App_Find.Filter.showCalendarTree(year);
            } else {
              
              App_Find.Filter.hideCalendarTree(year);
            }
          });
          
          content.find('div[data-calendar-year] span').bind('keyup', function (e) {
            var code = e.keyCode || e.which;
            if ((code == 13) || (code == 32)) { // Enter keycode
              // toggle icon
              e.preventDefault();
              $(this).click();
            }
          });
          
        }
      });
      
      var modalAxis = $('#filter-axis-modal');
      modalAxis.on('shown.bs.modal', function (e) {
        
        var content = $(e.currentTarget);
        if (content.attr('data-contents-loaded') == 'false') {
          
          content.attr('data-contents-loaded', 'true');
          App_Find.Filter.loadAxis();
          // wire up the checkboxes
          content.find('input[type=checkbox]').on('change', function () {
            var checkbox = $(this);
            var checkboxContainer = checkbox.parents('div[class="checkbox"]');
            App.showSpinner($('.modal-header'), function () {
              
              App_Find.Filter.updateSelectedCounts();
              App_Find.Breadcrumb.refresh();
              App_Find.Highlight.highlight();
              App.hideSpinner();
            });
          });
          
          // wire up the expand/collapse icons
          content.find('div[data-calendar-year] span').on('click', function () {
            
            var node = $(this);
            var year = node.parents('div[data-calendar-year]');
            year = year.attr('data-calendar-year');
            if (node.hasClass('icon-plus-black')) {
              
              App_Find.Filter.showCalendarTree(year);
            } else {
              
              App_Find.Filter.hideCalendarTree(year);
            }
          });
        }
      });
      
      var modalScale = $('#filter-scale-modal');
      modalScale.on('shown.bs.modal', function (e) {
        
        var content = $(e.currentTarget);
        if (content.attr('data-contents-loaded') == 'false') {
          
          content.attr('data-contents-loaded', 'true');
          App_Find.Filter.loadScale();
          
          // wire up the checkboxes
          content.find('input[type=checkbox]').on('change', function () {
            
            var checkbox = $(this);
            var checkboxContainer = checkbox.parents('div[class="checkbox"]');
            
            App.showSpinner($('.modal-header'), function () {
              
              App_Find.Filter.updateSelectedCounts();
              App_Find.Breadcrumb.refresh();
              App_Find.Highlight.highlight();
              App.hideSpinner();
            });
            
          });
          
          // wire up the expand/collapse icons
          content.find('div[data-calendar-year] span').on('click', function () {
            
            var node = $(this);
            var year = node.parents('div[data-calendar-year]');
            year = year.attr('data-calendar-year');
            if (node.hasClass('icon-plus-black')) {
              
              App_Find.Filter.showCalendarTree(year);
            } else {
              
              App_Find.Filter.hideCalendarTree(year);
            }
          });
        }
      });
      
      var modalBalance = $('#filter-balance-modal');
      modalBalance.on('shown.bs.modal', function (e) {
        
        var content = $(e.currentTarget);
        
        // wire up the checkboxes
        content.find('input[type=checkbox]').on('change', function () {
          
          var checkbox = $(this);
          var checkboxContainer = checkbox.parents('div[class="checkbox"]');
          
          App.showSpinner($('.modal-header'), function () {
            App_Find.Filter.updateSelectedCounts();
            App_Find.Breadcrumb.refresh();
            App_Find.Highlight.refresh();
            App.hideSpinner();
          });
        });
        
        // wire up the expand/collapse icons
        content.find('div[data-calendar-year] span').on('click', function () {
          
          var node = $(this);
          var year = node.parents('div[data-calendar-year]');
          year = year.attr('data-calendar-year');
          if (node.hasClass('icon-plus-black')) {
            
            App_Find.Filter.showCalendarTree(year);
          } else {
            
            App_Find.Filter.hideCalendarTree(year);
          }
        });
      });
      
      var modalUnit = $('#filter-unit-modal');
      modalUnit.on('shown.bs.modal', function (e) {
        
        var content = $(e.currentTarget);
        if (content.attr('data-contents-loaded') == 'false') {
          
          content.attr('data-contents-loaded', 'true');
          App_Find.Filter.loadUnits();
          
          // wire up the checkboxes
          content.find('input[type=checkbox]').on('change', function () {
            
            var checkbox = $(this);
            var checkboxContainer = checkbox.parents('div[class="checkbox"]');
            
            App.showSpinner($('.modal-header'), function () {
              
              App_Find.Filter.updateSelectedCounts();
              App_Find.Breadcrumb.refresh();
              App_Find.Highlight.highlight();
              App.hideSpinner();
            });
          });
          
          // wire up the expand/collapse icons
          content.find('div[data-calendar-year] span').on('click', function () {
            
            var node = $(this);
            var year = node.parents('div[data-calendar-year]');
            year = year.attr('data-calendar-year');
            if (node.hasClass('icon-plus-black')) {
              
              App_Find.Filter.showCalendarTree(year);
            } else {
              
              App_Find.Filter.hideCalendarTree(year);
            }
          });
        }
      });
    },
    resetUI : function () {
      
      var modal = $('#filter-period-modal');
      modal.attr('data-contents-loaded', 'false');
      modal.attr('data-prev-highlight-type', '');
      modal.find('span[data-calendars-showing]').html('0');
      modal.find('span[data-calendars-total-items]').html('0');
      modal.find('div[data-calendars-content]').html('');
      
      var modal = $('#filter-unit-modal');
      modal.attr('data-contents-loaded', 'false');
      modal.attr('data-prev-highlight-type', '');
      modal.find('span[data-units-showing]').html('0');
      modal.find('span[data-units-total-items]').html('0');
      modal.find('div[data-units-content]').html('');
      
      var modal = $('#filter-axis-modal');
      modal.attr('data-contents-loaded', 'false');
      modal.attr('data-prev-highlight-type', '');
      modal.find('span[data-axis-showing]').html('0');
      modal.find('span[data-axis-total-items]').html('0');
      modal.find('div[data-axis-content]').html('');
      
      var modal = $('#filter-scale-modal');
      modal.attr('data-contents-loaded', 'false');
      modal.attr('data-prev-highlight-type', '');
      modal.find('span[data-scale-showing]').html('0');
      modal.find('span[data-scale-total-items]').html('0');
      modal.find('div[data-scale-content]').html('');
    },
    reset : function () {
      
      // uncheck periods
      App_Find.Filter.getCalendarItemsChecked(true).each(function (index, element) {
        
        $(element).prop('checked', false);
      });
      
      // uncheck units
      App_Find.Filter.getUnitItemsChecked().each(function (index, element) {
        
        $(element).prop('checked', false);
      });
      
      // uncheck axis
      App_Find.Filter.getAxisItemsChecked().each(function (index, element) {
        
        $(element).prop('checked', false);
      });
      
      // uncheck scale
      App_Find.Filter.getScaleItemsChecked().each(function (index, element) {
        
        $(element).prop('checked', false);
      });
      
      // uncheck balance
      App_Find.Filter.getBalanceItemsChecked().each(function (index, element) {
        
        $(element).prop('checked', false);
      });
    },
    resetPeriod : function () {
      
      // uncheck periods
      App_Find.Filter.getCalendarItemsChecked(true).each(function (index, element) {
        
        $(element).prop('checked', false);
      });
      
    },
    resetUnits : function () {
      
      // uncheck units
      App_Find.Filter.getUnitItemsChecked().each(function (index, element) {
        
        $(element).prop('checked', false);
      });
    },
    loadUnits : function () {
      
      var totalFound = 0;
      var modal = $('#filter-unit-modal');
      var content = modal.find('div[data-units-content]');
      var items = App.InlineDoc.getUnits();
      content.attr('data-units-content', 'true');
      content.html('');
      
      var idAndMeasureName = [];
      items.each(function (index, element) {
        
        var ele = $(element);
        var isAmount = false;
        var isText = false;
        totalFound++;
        var tempArray = [];
        tempArray.push(ele.prop('id'), ele.unitFriendlyName().toLowerCase(), ele.unitFriendlyName(), ele.attr('id'));
        idAndMeasureName.push(tempArray);
      });
      
      idAndMeasureName.sort(compareMeasureName);
      function compareMeasureName (a, b) {
        if (a[1] === b[1]) {
          return 0;
        } else {
          return (a[1] < b[1]) ? -1 : 1;
        }
      }
      
      for (index = 0; index < idAndMeasureName.length; index++) {
        content.append('<div class="checkbox">' + '<label>' + '<input type="checkbox" value="'
            + idAndMeasureName[index][0] + '" friendlyName="' + idAndMeasureName[index][3] + '">'
            + '<span style="text-transform: capitalize;">' + idAndMeasureName[index][2] + '</span>' + '</label>'
            + '</div>');
      }
      
      // update the total items found
      modal.find('span[data-units-total-items]').first().html(totalFound);
    },
    getUnitItems : function () {
      
      return $('#filter-unit-modal').find('div[data-units-content] input[type="checkbox"]');
    },
    getUnitItemsChecked : function () {
      
      return $('#filter-unit-modal').find('div[data-units-content] input[type="checkbox"]:checked');
    },
    
    resetScale : function () {
      
      // uncheck units
      App_Find.Filter.getScaleItemsChecked().each(function (index, element) {
        
        $(element).prop('checked', false);
      });
    },
    
    resetBalance : function () {
      
      // uncheck balance
      App_Find.Filter.getBalanceItemsChecked().each(function (index, element) {
        
        $(element).prop('checked', false);
      });
    },
    loadScale : function () {
      
      var totalFound = 0;
      var modal = $('#filter-scale-modal');
      var content = modal.find('div[data-scale-content]');
      var items = App.InlineDoc.getElementsByType([ 'nonFraction' ], true);
      content.attr('data-scale-content', 'true');
      content.html('');
      var resultscales = {};
      var resultScalesArr = [];
      
      items.each(function (index, element) {
        if (element.attr('scale')) {
          var scaleValue = element.attr('scale');
          var scaleValueName = element.scaleFriendlyName();
          if ($.inArray(scaleValue, resultScalesArr) == -1) {
            resultscales[scaleValue] = scaleValueName;
            resultScalesArr.push(scaleValue);
            totalFound++;
          }
        }
      });
      resultScalesArr.sort(function (a, b) {
        return b - a;
      });
      for (var i = 0; i < resultScalesArr.length; i++) {
        content.append('<div class="checkbox">' + '<label>' + '<input type="checkbox" value="' + resultScalesArr[i]
            + '" isAmount="' + '" friendlyName="' + resultscales[resultScalesArr[i]] + '">' + '<span class="scale">'
            + resultscales[resultScalesArr[i]] + " " + '</span>' + '</label>' + '</div>');
      }
      
      // update the total items found
      modal.find('span[data-scale-total-items]').first().html(totalFound);
    },
    getScaleItems : function () {
      
      return $('#filter-scale-modal').find('div[data-scale-content] input[type="checkbox"]');
    },
    getScaleItemsChecked : function () {
      
      return $('#filter-scale-modal').find('div[data-scale-content] input[type="checkbox"]:checked');
    },
    getBalanceItems : function () {
      
      return $('#filter-balance-modal').find('input[type="checkbox"]');
    },
    getBalanceItemsChecked : function () {
      
      return $('#filter-balance-modal').find('input[type="checkbox"]:checked');
    },
    
    // For Axis
    resetAxis : function () {
      
      // uncheck units
      App_Find.Filter.getAxisItemsChecked().each(function (index, element) {
        
        $(element).prop('checked', false);
      });
    },
    
    loadAxis : function () {
      
      var totalFound = 0;
      var modal = $('#filter-axis-modal');
      var content = modal.find('div[data-axis-content]');
      var items = App.InlineDoc.getAxis();
      content.attr('data-axis-content', 'true');
      content.html('');
      
      var dimensionValues = [];
      var dimensionNameAndValue = [];
      items.each(function (index, element) {
        
        var ele = $(element);
        var pele = $(ele.parents()[2]);
        
        var dimensionName = ele.attr('dimension');
        App.InlineDoc.updateContextAxis(pele.attr('id'), dimensionName);
        if ($.inArray(dimensionName, dimensionValues) == -1) {
          totalFound++;
          dimensionValues.push(dimensionName);
          var dimensionNameMatch = dimensionName.split(":")[1].split(/(?=[A-Z])/).join(" ").replace("Axis", " ");
          var dimensionValuestemp = [];
          dimensionValuestemp.push(dimensionName, dimensionNameMatch.toLowerCase(), dimensionNameMatch);
          dimensionNameAndValue.push(dimensionValuestemp);
        }
      });
      
      dimensionNameAndValue.sort(compareDimensionName);
      function compareDimensionName (a, b) {
        if (a[1] === b[1]) {
          return 0;
        } else {
          return (a[1] < b[1]) ? -1 : 1;
        }
      }
      
      for (index = 0; index < dimensionNameAndValue.length; index++) {
        content.append('<div class="checkbox">' + '<label>' + '<input type="checkbox" value="'
            + dimensionNameAndValue[index][0] + '" friendlyName="' + dimensionNameAndValue[index][0].split(':')[1]
            + '">' + '<span>' + dimensionNameAndValue[index][2] + '</span>' + '</label>' + '</div>');
      }
      
      // update the total items found
      modal.find('span[data-axis-total-items]').first().html(totalFound);
    },
    
    filterAxisByHighlight : function () {
      
    },
    getAxisItems : function () {
      
      return $('#filter-axis-modal').find('div[data-axis-content] input[type="checkbox"]');
    },
    getAxisItemsChecked : function () {
      
      return $('#filter-axis-modal').find('div[data-axis-content] input[type="checkbox"]:checked');
    },
    loadCalendars : function () {
      
      var modal = $('#filter-period-modal');
      var content = modal.find('div[data-calendars-content]');
      var items = App.InlineDoc.getContexts();
      var periodresult = [];
      var periodhash = {};
      
      content.attr('data-calendars-content', 'true');
      content.html('');
      // get all the years
      var years = [];
      items.each(function (index, element) {
        
        var node = $(element);
        var friendlyName = node.calendarFriendlyName();
        var year = friendlyName.match(/\b\d{4}\b/gi);
        if (year) {
          year = year[year.length - 1]; // if there are multiple years take the
          // last one
        }
        var idx = $.inArray(year, years);
        if (idx == -1) {
          
          years.push(year);
        }
      });
      
      // sort years and add the year checkboxes
      years.sort(function (a, b) {
        return b - a
      });
      for (var i = 0; i < years.length; i++) {
        
        var year = years[i];
        var yearNode = $('<div class="checkbox" data-calendar-year="' + year + '">'
            + '<span class="icon-as-img icon-minus-black"></span>' + '<label><input type="checkbox" />' + year
            + '</label>' + '</div>');
        content.append(yearNode);
      }
      
      // create the calendar checkboxes
      var calendars = [];
      var totalFound = 0;
      items
          .each(function (index, element) {
            
            var node = $(element);
            var friendlyName = node.calendarFriendlyName();
            var normalizedPeriod = node.normalizedPeriodString();
            var foundCalendar = false;
            
            if ($.inArray(friendlyName, calendars) == -1) {
              
              calendars.push(friendlyName);
              totalFound++;
            } else {
              
              foundCalendar = true;
            }
            
            var contextid = node.prop('id');
            var flatcontext = [ normalizedPeriod ];
            App.InlineDoc.updateContextPeiod(contextid, flatcontext);
            
            // if we found a calendar append the id to the value
            if (!foundCalendar) {
              
              var year = friendlyName.match(/\b\d{4}\b/gi);
              if (year) {
                year = year[year.length - 1];
              }
              content.find('div[data-calendar-year="' + year + '"]').after(
                  '<div class="checkbox" data-calendar-item="' + year + '">' + '<label><input type="checkbox" value="'
                      + normalizedPeriod + '" friendlyName="' + friendlyName + '">' + friendlyName + '</label>'
                      + '</div>');
            }
          });
      
      // update the total items found
      modal.find('span[data-calendars-total-items]').first().html(totalFound);
    },
    getCalendarItems : function () {
      
      return $('#filter-period-modal').find('div[data-calendars-content] input[type="checkbox"]');
    },
    getCalendarItemsChecked : function (includeParent) {
      
      includeParent = includeParent ? true : false;
      
      return $('#filter-period-modal').find('div[data-calendars-content] input[type="checkbox"]:checked').filter(
          function () {
            
            return includeParent || !includeParent && $(this).parents('div[data-calendar-year]').length == 0;
          });
    },
    updateCalendarTreeState : function (year) {
      
      var isCollapsed = true;
      var modal = $('#filter-period-modal');
      
      modal.find('div[data-calendar-item="' + year + '"]').each(function (index, element) {
        
        if ($(this).css('display') == 'block') {
          
          return isCollapsed = false;
        }
      });
      
      var divYear = modal.find('div[data-calendar-year="' + year + '"]');
      var span = divYear.find('span');
      if (isCollapsed) {
        
        span.removeClass('icon-minus-black');
        span.addClass('icon-plus-black');
        span.attr("tabindex", "0");
        span.attr("aria-label", "Expand");
      } else {
        
        span.removeClass('icon-plus-black');
        span.addClass('icon-minus-black');
        span.attr("tabindex", "0");
        span.attr("aria-label", "Collapse");
      }
    },
    hideCalendarTree : function (year) {
      
      if (year) {
        
        $('#filter-period-modal').find('div[data-calendar-item="' + year + '"]').each(function (index, element) {
          
          $(element).hide();
        });
        App_Find.Filter.updateCalendarTreeState(year);
      }
    },
    showCalendarTree : function (year) {
      
      $('#filter-period-modal').find('div[data-calendar-item="' + year + '"]').each(function (index, element) {
        
        var e = $(element);
        var checkbox = e.find('input[type="checkbox"]');
        e.show();
      });
      App_Find.Filter.updateCalendarTreeState(year);
    },
    refreshCalendarTree : function () {
      
      $('#filter-period-modal').find('div[data-calendar-year]').each(function (index, element) {
        
        App_Find.Filter.showCalendarTree($(element).attr('data-calendar-year'));
      });
    },
    updateSelectedCounts : function () {
      
      var calendarsChecked = 0;
      App_Find.Filter.getCalendarItemsChecked().each(function (index, element) {
        
        calendarsChecked++;
      });
      
      var modal = $('#filter-period-modal');
      modal.find('span[data-calendars-checked]').html(calendarsChecked);
      var modal1 = $('#filter-unit-modal');
      modal1.find('span[data-units-checked]').html(App_Find.Filter.getUnitItemsChecked().length);
      var modal2 = $('#filter-axis-modal');
      modal2.find('span[data-axis-checked]').html(App_Find.Filter.getAxisItemsChecked().length);
      var modal3 = $('#filter-scale-modal');
      modal3.find('span[data-scale-checked]').html(App_Find.Filter.getScaleItemsChecked().length);
      var modal4 = $('#filter-balance-modal');
      modal4.find('span[data-balance-checked]').html(App_Find.Filter.getBalanceItemsChecked().length);
    },
    getSelected : function () {
      
      var filter = {
        conceptType : $('input[name="highlight-concepts"]:checked').val(),
        joinType : $('#settings-modal').find('input[type="radio"]:checked').val(),
        units : App_Find.Filter.getUnitItems(),
        unitsChecked : App_Find.Filter.getUnitItemsChecked(),
        unitsAreFiltered : false,
        axis : App_Find.Filter.getAxisItems(),
        axisChecked : App_Find.Filter.getAxisItemsChecked(),
        axisAreFiltered : false,
        scale : App_Find.Filter.getScaleItems(),
        scaleChecked : App_Find.Filter.getScaleItemsChecked(),
        scaleAreFiltered : false,
        balance : App_Find.Filter.getBalanceItems(),
        balanceChecked : App_Find.Filter.getBalanceItemsChecked(),
        balanceAreFiltered : false,
        calendars : App_Find.Filter.getCalendarItems(),
        calendarsChecked : App_Find.Filter.getCalendarItemsChecked(),
        calendarsAreFiltered : false,
        isFiltered : function () {
          
          return (this.conceptType != 'both' || this.unitsAreFiltered || this.calendarsAreFiltered
              || this.axisAreFiltered || this.scaleAreFiltered || this.balanceAreFiltered);
        }
      };
      
      if (filter.unitsChecked.length > 0) {
        
        filter.unitsAreFiltered = true;
      }
      
      if (filter.calendarsChecked.length > 0 && filter.calendars.length != filter.calendarsChecked.length) {
        
        filter.calendarsAreFiltered = true;
      }
      
      if (filter.axisChecked.length > 0) {
        
        filter.axisAreFiltered = true;
      }
      
      if (filter.scaleChecked.length > 0) {
        
        filter.scaleAreFiltered = true;
      }
      
      if (filter.balanceChecked.length > 0) {
        
        filter.balanceAreFiltered = true;
      }
      
      return filter;
    }
  },
  Breadcrumb : {
    resetUI : function () {
      
      App_Find.Breadcrumb.refresh();
    },
    replaceNeeded : function (array, letter, str) {
      for ( var i in array) {
        if (array[i].indexOf(letter) > -1) {
          array[i] = str;
        }
      }
    },
    searchFor : function (array, letter) {
      for ( var i in array) {
        if (array[i].indexOf(letter) > -1) {
          _filterList.splice(_filterList.indexOf(array[i]), 1);
        }
      }
    },
    doesExist : function (array, letter) {
      for ( var i in array) {
        if (array[i].indexOf(letter) > -1) {
          return true;
        }
      }
      return false;
    },
    refresh : function () {
      
      var breadcrumb = $('.breadcrumb-container');
      var highlight = App_Find.Highlight.getSelected();
      
      // update highlight
      var label = highlight.label;
      breadcrumb.find('span[data-breadcrumb-highlight]').html(label);
      
      if (label == "All") {
        // $("#dataDiv").css("display", "none");
        for (var i = 0; i < _dataList.length; i++) {
          if (_filterList.indexOf(_dataList[i]) != -1)
            _filterList.splice(_filterList.indexOf(_dataList[i]), 1);
        }
      } else {
        // $("#dataDiv").css("display", "block");
        if (_filterList.indexOf(label) == -1) {
          for (var i = 0; i < _dataList.length; i++) {
            if (_filterList.indexOf(_dataList[i]) != -1)
              _filterList.splice(_filterList.indexOf(_dataList[i]), 1);
          }
          _filterList.push(label);
        }
      }
      
      // update concepts
      var conceptLabel = highlight.conceptLabel;
      breadcrumb.find('span[data-breadcrumb-concepts]').html(conceptLabel);
      
      if (conceptLabel == "All") {
        // $("#conceptsDiv").css("display", "none");
        for (var i = 0; i < _tagList.length; i++) {
          if (_filterList.indexOf(_tagList[i]) != -1)
            _filterList.splice(_filterList.indexOf(_tagList[i]), 1);
        }
      } else {
        // $("#conceptsDiv").css("display", "block");
        if (_filterList.indexOf(conceptLabel) == -1) {
          for (var i = 0; i < _tagList.length; i++) {
            if (_filterList.indexOf(_tagList[i]) != -1)
              _filterList.splice(_filterList.indexOf(_tagList[i]), 1);
          }
          _filterList.push(conceptLabel);
        }
      }
      
      // update calendar
      var calItemsText = 'All';
      var calItems = App_Find.Filter.getCalendarItemsChecked();
      
      if (calItems.length == 1) {
        
        calItemsText = calItems.parent().text().trim();
      } else if (calItems.length > 1) {
        
        calItemsText = '1+';
      }
      breadcrumb.find('span[data-breadcrumb-periods]').html(calItemsText);
      if (calItemsText == "All") {
        // $("#periodsDiv").css("display", "none");
        App_Find.Breadcrumb.searchFor(_filterList, "Periods (");
      } else {
        // $("#periodsDiv").css("display", "block");
        App_Find.Breadcrumb.replaceNeeded(_filterList, 'Periods', 'Periods (' + calItemsText + ')');
        if (!App_Find.Breadcrumb.doesExist(_filterList, "Periods"))
          _filterList.push('Periods (' + calItemsText + ')');
      }
      
      // update units
      var unitItemsText = 'All';
      var unitItems = App_Find.Filter.getUnitItemsChecked();
      if (unitItems.length == 1) {
        
        unitItemsText = unitItems.parent().text().trim();
      } else if (unitItems.length > 1) {
        
        unitItemsText = '1+';
      }
      breadcrumb.find('span[data-breadcrumb-units]').html(unitItemsText);
      if (unitItemsText == "All") {
        // $("#unitsDiv").css("display", "none");
        App_Find.Breadcrumb.searchFor(_filterList, "Measures (");
      } else {
        // $("#unitsDiv").css("display", "block");
        App_Find.Breadcrumb.replaceNeeded(_filterList, 'Measures', 'Measures (' + unitItemsText + ')');
        if (!App_Find.Breadcrumb.doesExist(_filterList, "Measures"))
          _filterList.push('Measures (' + unitItemsText + ')');
      }
      if ((label == "All") && (conceptLabel == "All") && (calItemsText == "All") && (unitItemsText == "All")) {
        $("#app-panel-breadcrum-container").css("display", "none");
        $("#app-inline-xbrl-doc").css("top", "0px");
        $("#app-panel").css("top", "25px");
        $("#app-panel1").css("top", "25px");
        $("#app-panel2").css("top", "25px");
        $("#app-container").css("height", "95%");
      } else {
        $("#app-panel-breadcrum-container").css("display", "block");
        if ($("#filterDataDiv").height() == 23) {
          $("#app-panel").css("top", "55px");
          $("#app-panel1").css("top", "55px");
          $("#app-panel2").css("top", "55px");
          $("#app-inline-xbrl-doc").css("top", "25px");
          $("#app-container").css("height", "90%");
          $("#app-panel-breadcrum-container").css("height", "25px");
        } else if ($("#filterDataDiv").height() == 46) {
          $("#app-panel-breadcrum-container").css("height", "50px");
          $("#app-inline-xbrl-doc").css("top", "50px");
          $("#app-panel").css("top", "80px");
          $("#app-panel1").css("top", "80px");
          $("#app-panel2").css("top", "80px");
          $("#app-container").css("height", "85%");
        } else if ($("#filterDataDiv").height() == 69) {
          $("#app-panel-breadcrum-container").css("height", "75px");
          $("#app-inline-xbrl-doc").css("top", "75px");
          $("#app-panel").css("top", "105px");
          $("#app-panel1").css("top", "105px");
          $("#app-panel2").css("top", "105px");
          $("#app-container").css("height", "80%");
        } else if ($("#filterDataDiv").height() == 92) {
          $("#app-panel-breadcrum-container").css("height", "100px");
          $("#app-inline-xbrl-doc").css("top", "100px");
          $("#app-panel").css("top", "130px");
          $("#app-panel1").css("top", "130px");
          $("#app-panel2").css("top", "130px");
          $("#app-container").css("height", "75%");
        } else if ($("#filterDataDiv").height() == 115) {
          $("#app-panel-breadcrum-container").css("height", "125px");
          $("#app-inline-xbrl-doc").css("top", "125px");
          $("#app-panel").css("top", "155px");
          $("#app-panel1").css("top", "155px");
          $("#app-panel2").css("top", "155px");
          $("#app-container").css("height", "70%");
        } else {
          $("#app-panel").css("top", "55px");
          $("#app-panel1").css("top", "55px");
          $("#app-panel2").css("top", "55px");
          $("#app-inline-xbrl-doc").css("top", "25px");
          $("#app-container").css("height", "90%");
          $("#app-panel-breadcrum-container").css("height", "25px");
        }
      }
      
      // update axis
      var axisItemsText = 'All';
      var axisItems = App_Find.Filter.getAxisItemsChecked();
      if (axisItems.length == 1) {
        
        axisItemsText = axisItems.parent().text().trim();
      } else if (axisItems.length > 1) {
        
        axisItemsText = '1+';
      }
      breadcrumb.find('span[data-breadcrumb-axis]').html(axisItemsText);
      if (axisItemsText == "All") {
        // $("#axisDiv").css("display", "none");
        App_Find.Breadcrumb.searchFor(_filterList, "Axes (");
      } else {
        // $("#axisDiv").css("display", "block");
        App_Find.Breadcrumb.replaceNeeded(_filterList, 'Axes', 'Axes (' + axisItemsText + ')');
        if (!App_Find.Breadcrumb.doesExist(_filterList, "Axes"))
          _filterList.push('Axes (' + axisItemsText + ')');
      }
      if ((label == "All") && (conceptLabel == "All") && (calItemsText == "All") && (unitItemsText == "All")
          && (axisItemsText == "All")) {
        $("#app-panel-breadcrum-container").css("display", "none");
        $("#app-inline-xbrl-doc").css("top", "0px");
        $("#app-panel").css("top", "25px");
        $("#app-panel1").css("top", "25px");
        $("#app-panel2").css("top", "25px");
        $("#app-container").css("height", "95%");
      } else {
        $("#app-panel-breadcrum-container").css("display", "block");
        if ($("#filterDataDiv").height() == 23) {
          $("#app-panel").css("top", "55px");
          $("#app-panel1").css("top", "55px");
          $("#app-panel2").css("top", "55px");
          $("#app-inline-xbrl-doc").css("top", "25px");
          $("#app-container").css("height", "90%");
          $("#app-panel-breadcrum-container").css("height", "25px");
        } else if ($("#filterDataDiv").height() == 46) {
          $("#app-panel-breadcrum-container").css("height", "50px");
          $("#app-inline-xbrl-doc").css("top", "50px");
          $("#app-panel").css("top", "80px");
          $("#app-panel1").css("top", "80px");
          $("#app-panel2").css("top", "80px");
          $("#app-container").css("height", "85%");
        } else if ($("#filterDataDiv").height() == 69) {
          $("#app-panel-breadcrum-container").css("height", "75px");
          $("#app-inline-xbrl-doc").css("top", "75px");
          $("#app-panel").css("top", "105px");
          $("#app-panel1").css("top", "105px");
          $("#app-panel2").css("top", "105px");
          $("#app-container").css("height", "80%");
        } else if ($("#filterDataDiv").height() == 92) {
          $("#app-panel-breadcrum-container").css("height", "100px");
          $("#app-inline-xbrl-doc").css("top", "100px");
          $("#app-panel").css("top", "130px");
          $("#app-panel1").css("top", "130px");
          $("#app-panel2").css("top", "130px");
          $("#app-container").css("height", "75%");
        } else if ($("#filterDataDiv").height() == 115) {
          $("#app-panel-breadcrum-container").css("height", "125px");
          $("#app-inline-xbrl-doc").css("top", "125px");
          $("#app-panel").css("top", "155px");
          $("#app-panel1").css("top", "155px");
          $("#app-panel2").css("top", "155px");
          $("#app-container").css("height", "70%");
        } else {
          $("#app-panel").css("top", "55px");
          $("#app-panel1").css("top", "55px");
          $("#app-panel2").css("top", "55px");
          $("#app-inline-xbrl-doc").css("top", "25px");
          $("#app-container").css("height", "90%");
          $("#app-panel-breadcrum-container").css("height", "25px");
        }
      }
      
      // update scale
      var scaleItemsText = 'All';
      var scaleItems = App_Find.Filter.getScaleItemsChecked();
      if (scaleItems.length == 1) {
        
        scaleItemsText = scaleItems.parent().text().trim();
      } else if (scaleItems.length > 1) {
        
        scaleItemsText = '1+';
      }
      breadcrumb.find('span[data-breadcrumb-scale]').html(scaleItemsText);
      if (scaleItemsText == "All") {
        // $("#scaleDiv").css("display", "none");
        App_Find.Breadcrumb.searchFor(_filterList, "Scale (");
      } else {
        // $("#scaleDiv").css("display", "block");
        App_Find.Breadcrumb.replaceNeeded(_filterList, 'Scale', 'Scale (' + scaleItemsText + ')');
        if (!App_Find.Breadcrumb.doesExist(_filterList, "Scale"))
          _filterList.push('Scale (' + scaleItemsText + ')');
      }
      
      // update balance
      var balanceItemsText = 'All';
      var balanceItems = App_Find.Filter.getBalanceItemsChecked();
      if (balanceItems.length == 1) {
        
        balanceItemsText = balanceItems.parent().text().trim();
      } else if (balanceItems.length > 1) {
        
        balanceItemsText = '1+';
      }
      breadcrumb.find('span[data-breadcrumb-balance]').html(balanceItemsText);
      if (balanceItemsText == "All") {
        // $("#balanceDiv").css("display", "none");
        App_Find.Breadcrumb.searchFor(_filterList, "Balance (");
      } else {
        // $("#balanceDiv").css("display", "block");
        App_Find.Breadcrumb.replaceNeeded(_filterList, 'Balance (', 'Balance (' + balanceItemsText + ')');
        if (!App_Find.Breadcrumb.doesExist(_filterList, "Balance ("))
          _filterList.push('Balance (' + balanceItemsText + ')');
      }
      if ((label == "All") && (conceptLabel == "All") && (calItemsText == "All") && (unitItemsText == "All")
          && (axisItemsText == "All") && (scaleItemsText == "All") && (balanceItemsText == "All")) {
        $("#app-panel-breadcrum-container").css("display", "none");
        $("#app-inline-xbrl-doc").css("top", "0px");
        $("#app-panel").css("top", "25px");
        $("#app-panel1").css("top", "25px");
        $("#app-panel2").css("top", "25px");
        $("#app-container").css("height", "95%");
      } else {
        $("#app-panel-breadcrum-container").css("display", "block");
        if ($("#filterDataDiv").height() == 23) {
          $("#app-panel").css("top", "55px");
          $("#app-panel1").css("top", "55px");
          $("#app-panel2").css("top", "55px");
          $("#app-inline-xbrl-doc").css("top", "25px");
          $("#app-container").css("height", "90%");
          $("#app-panel-breadcrum-container").css("height", "25px");
        } else if ($("#filterDataDiv").height() == 46) {
          $("#app-panel-breadcrum-container").css("height", "50px");
          $("#app-inline-xbrl-doc").css("top", "50px");
          $("#app-panel").css("top", "80px");
          $("#app-panel1").css("top", "80px");
          $("#app-panel2").css("top", "80px");
          $("#app-container").css("height", "85%");
        } else if ($("#filterDataDiv").height() == 69) {
          $("#app-panel-breadcrum-container").css("height", "75px");
          $("#app-inline-xbrl-doc").css("top", "75px");
          $("#app-panel").css("top", "105px");
          $("#app-panel1").css("top", "105px");
          $("#app-panel2").css("top", "105px");
          $("#app-container").css("height", "80%");
        } else if ($("#filterDataDiv").height() == 92) {
          $("#app-panel-breadcrum-container").css("height", "100px");
          $("#app-inline-xbrl-doc").css("top", "100px");
          $("#app-panel").css("top", "130px");
          $("#app-panel1").css("top", "130px");
          $("#app-panel2").css("top", "130px");
          $("#app-container").css("height", "75%");
        } else if ($("#filterDataDiv").height() == 115) {
          $("#app-panel-breadcrum-container").css("height", "125px");
          $("#app-inline-xbrl-doc").css("top", "125px");
          $("#app-panel").css("top", "155px");
          $("#app-panel1").css("top", "155px");
          $("#app-panel2").css("top", "155px");
          $("#app-container").css("height", "70%");
        } else {
          $("#app-panel").css("top", "55px");
          $("#app-panel1").css("top", "55px");
          $("#app-panel2").css("top", "55px");
          $("#app-inline-xbrl-doc").css("top", "25px");
          $("#app-container").css("height", "90%");
          $("#app-panel-breadcrum-container").css("height", "25px");
        }
      }
      
      var modalFilter = $('#app-container');
      var contentFilter = modalFilter.find('div[data-filter-content]');
      contentFilter.attr('data-filter-content', 'false');
      contentFilter.html('');
      if (_filterList.length > 1) {
        // DE451
        var clearfilterNodeOnUI;
        var clearfilterNodeName = '<span style="display: block;float: left;clear: right;vertical-align: middle;"><span>Clear All &nbsp;</span>';
        clearfilterNodeName = $(clearfilterNodeName);
        
        clearfilterNode = '<span class="icon-as-img icon-close-circle-white" title="Clear All Filters" tabindex="8">'
            + '</span></span></span>';
        var clearAllObj = $(clearfilterNode);
        clearAllObj.bind('keypress', function (e) {
          var code = e.keyCode || e.which;
          if ((code == 13) || (code == 32)) { // Enter keycode
            App.showSpinner1($('#mainDiv'), function () {
              App_Find.Highlight.resetData();
              App_Find.Highlight.resetConcepts();
              App_Find.Filter.resetPeriod();
              App_Find.Filter.resetUnits();
              App_Find.Filter.resetAxis();
              App_Find.Filter.resetScale();
              App_Find.Filter.resetBalance();
              App_Find.Highlight.refresh();
              App.hideSpinner();
            });
          }
        });
        clearAllObj.on('click', function () {
          App.showSpinner1($('#mainDiv'), function () {
            App_Find.Highlight.resetData();
            App_Find.Highlight.resetConcepts();
            App_Find.Filter.resetPeriod();
            App_Find.Filter.resetUnits();
            App_Find.Filter.resetAxis();
            App_Find.Filter.resetScale();
            App_Find.Filter.resetBalance();
            App_Find.Highlight.refresh();
            App.hideSpinner();
          });
        });
        // contentFilter.append(clearAllObj);
        // DE451
        clearfilterNodeOnUI = clearfilterNodeName.append(clearAllObj);
        contentFilter.append(clearfilterNodeOnUI);
      }
      
      for (var _index = 0; _index < _filterList.length; _index++) {
        // DE451
        var filterTagNameNode = '<span id="filterDiv" style="display: block;float: left;clear: right;vertical-align: middle;margin-right: -10px;">>&nbsp;&nbsp;'
            + '<span>' + _filterList[_index] + '&nbsp;</span>';
        filterTagNameNode = $(filterTagNameNode);
        var filterNodeNew;
        
        var filterNodeObj;
        var button = '';
        if (_dataList.indexOf(_filterList[_index]) != -1) {
          // DE451
          filterNode = '<span class="icon-as-img icon-close-circle-white" title="Clear Data Filter" data-btn-removeHighlight>'
              + '</span>&nbsp;&nbsp;</span>';
          filterNodeObj = $(filterNode);
          filterNodeObj.on('click', function () {
            App.showSpinner1($('#mainDiv'), function () {
              App_Find.Highlight.resetData();
              App_Find.Highlight.refresh();
              App.hideSpinner();
            });
          });
        } else if (_tagList.indexOf(_filterList[_index]) != -1) {
          // DE451
          filterNode = '<span class="icon-as-img icon-close-circle-white" title="Clear Tags Filter" data-btn-removeConcepts>'
              + '</span>&nbsp;&nbsp;</span>';
          filterNodeObj = $(filterNode);
          filterNodeObj.on('click', function () {
            App.showSpinner1($('#mainDiv'), function () {
              App_Find.Highlight.resetConcepts();
              App_Find.Highlight.refresh();
              App.hideSpinner();
            });
            
          });
        } else if (_filterList[_index].match("Periods") == "Periods") {
          // DE451
          filterNode = '<span class="icon-as-img icon-close-circle-white" title="Clear Periods Filter" data-btn-removePeriods>'
              + '</span>&nbsp;&nbsp;</span>';
          filterNodeObj = $(filterNode);
          filterNodeObj.on('click', function () {
            App.showSpinner1($('#mainDiv'), function () {
              App_Find.Filter.resetPeriod();
              App_Find.Highlight.refresh();
              App.hideSpinner();
            });
            
          });
        } else if (_filterList[_index].match("Measures") == "Measures") {
          // DE451
          filterNode = '<span class="icon-as-img icon-close-circle-white" title="Clear Measures Filter" data-btn-removeUnits>'
              + '</span>&nbsp;&nbsp;</span>';
          filterNodeObj = $(filterNode);
          filterNodeObj.on('click', function () {
            App.showSpinner1($('#mainDiv'), function () {
              App_Find.Filter.resetUnits();
              App_Find.Highlight.refresh();
              App.hideSpinner();
            });
          });
        } else if (_filterList[_index].match("Axes") == "Axes") {
          // DE451
          filterNode = '<span class="icon-as-img icon-close-circle-white" title="Clear Axes Filter" data-btn-removeAxis>'
              + '</span>&nbsp;&nbsp;</span>';
          filterNodeObj = $(filterNode);
          filterNodeObj.on('click', function () {
            App.showSpinner1($('#mainDiv'), function () {
              App_Find.Filter.resetAxis();
              App_Find.Highlight.refresh();
              App.hideSpinner();
            });
          });
        } else if (_filterList[_index].match("Scale") == "Scale") {
          // DE451
          filterNode = '<span class="icon-as-img icon-close-circle-white" title="Clear Scale Filter" data-btn-removeScale>'
              + '</span>&nbsp;&nbsp;</span>';
          filterNodeObj = $(filterNode);
          filterNodeObj.on('click', function () {
            App.showSpinner1($('#mainDiv'), function () {
              App_Find.Filter.resetScale();
              App_Find.Highlight.refresh();
              App.hideSpinner();
            });
            
          });
        } else if (_filterList[_index].match("Balance") == "Balance") {
          // DE451
          filterNode = '<span class="icon-as-img icon-close-circle-white" title="Clear Balance Filter" data-btn-removeBalance>'
              + '</span>&nbsp;&nbsp;</span>';
          filterNodeObj = $(filterNode);
          filterNodeObj.on('click', function () {
            App.showSpinner1($('#mainDiv'), function () {
              App_Find.Filter.resetBalance();
              App_Find.Highlight.refresh();
              App.hideSpinner();
            });
          });
        }
        // contentFilter.append(filterNodeObj);
        // DE451
        filterNodeNew = filterTagNameNode.append(filterNodeObj);
        contentFilter.append(filterNodeNew);
        
      }
      if ($("#filterDataDiv").height() == 0) {
        $("#app-panel-breadcrum-container").css("display", "none");
        $("#app-inline-xbrl-doc").css("top", "0px");
        $("#app-panel").css("top", "25px");
        $("#app-panel1").css("top", "25px");
        $("#app-panel2").css("top", "25px");
        $("#app-container").css("height", "95%");
      } else if ($("#filterDataDiv").height() == 23) {
        $("#app-panel").css("top", "55px");
        $("#app-panel1").css("top", "55px");
        $("#app-panel2").css("top", "55px");
        $("#app-inline-xbrl-doc").css("top", "25px");
        $("#app-container").css("height", "90%");
        $("#app-panel-breadcrum-container").css("height", "25px");
      } else if ($("#filterDataDiv").height() == 46) {
        $("#app-panel-breadcrum-container").css("height", "50px");
        $("#app-inline-xbrl-doc").css("top", "50px");
        $("#app-panel").css("top", "80px");
        $("#app-panel1").css("top", "80px");
        $("#app-panel2").css("top", "80px");
        $("#app-container").css("height", "85%");
      } else if ($("#filterDataDiv").height() == 69) {
        $("#app-panel-breadcrum-container").css("height", "75px");
        $("#app-inline-xbrl-doc").css("top", "75px");
        $("#app-panel").css("top", "105px");
        $("#app-panel1").css("top", "105px");
        $("#app-panel2").css("top", "105px");
        $("#app-container").css("height", "80%");
      } else if ($("#filterDataDiv").height() == 92) {
        $("#app-panel-breadcrum-container").css("height", "100px");
        $("#app-inline-xbrl-doc").css("top", "100px");
        $("#app-panel").css("top", "130px");
        $("#app-panel1").css("top", "130px");
        $("#app-panel2").css("top", "130px");
        $("#app-container").css("height", "75%");
      } else if ($("#filterDataDiv").height() == 115) {
        $("#app-panel-breadcrum-container").css("height", "125px");
        $("#app-inline-xbrl-doc").css("top", "125px");
        $("#app-panel").css("top", "155px");
        $("#app-panel1").css("top", "155px");
        $("#app-panel2").css("top", "155px");
        $("#app-container").css("height", "70%");
      } else {
        $("#app-panel").css("top", "55px");
        $("#app-panel1").css("top", "55px");
        $("#app-panel2").css("top", "55px");
        $("#app-inline-xbrl-doc").css("top", "25px");
        $("#app-container").css("height", "90%");
        $("#app-panel-breadcrum-container").css("height", "25px");
      }
      
    }
  
  },
  Settings : {
    init : function () {
      
      var modal = $('#settings-modal');
      modal.find('input[type="radio"]').on('change', function () {
        
        App_Find.Filter.getUnitItemsChecked().each(function () {
          // DE511: Reverseing False to True
          $(this).prop('checked', true);
        });
        App_Find.Filter.getCalendarItemsChecked(true).each(function () {
          // DE511: Reverseing False to True
          $(this).prop('checked', true);
        });
        App_Find.Filter.getAxisItemsChecked(true).each(function () {
          // DE511: Reverseing False to True
          $(this).prop('checked', true);
        });
        App_Find.Filter.getScaleItemsChecked(true).each(function () {
          // DE511: Reverseing False to True
          $(this).prop('checked', true);
        });
        App_Find.Filter.getBalanceItemsChecked(true).each(function () {
          // DE511: Reverseing False to True
          $(this).prop('checked', true);
        });
        App_Find.Filter.updateSelectedCounts();
        App_Find.Breadcrumb.refresh();
        App_Find.Results.load();
      });
      
      $('#settings-modal').on('shown.bs.modal', function () {
        $('#settings-modal').focus();
      });
      
      var isClicked = false;
      if (!isClicked) {
        var modal = $('#settings-modal');
        if (modal.find('#search-include-dimensions').is(':checked')) {
          // modal.find('#search-include-dimensions').on('click', function() {
          App.showSpinner($('.modal-header'), function () {
            
            isClicked = true;
            var items = "";
            if (App.InlineDoc) {
              items = App.InlineDoc.getAxis();
              
              var contextValues = [];
              items.each(function (index, element) {
                var ele = $(element);
                var pele = $(ele.parents()[2]);
                var contextId = pele.attr('id');
                // if($.inArray(contextId,contextValues) == -1){
                // contextValues.push(contextId);
                var axisLabel = ele.attr('dimension');
                var axislval = App.InlineDoc.getSelectedLabel(App_Utils.convertToXBRLId(axisLabel), this, null,
                    function (value) {
                      
                      axisLabel = value + ' - ' + axisLabel;
                      return false;
                      
                    });
                
                // member label
                var memberLabel = ele.html();
                var memberlval = App.InlineDoc.getSelectedLabel(App_Utils.convertToXBRLId(memberLabel), this, null,
                    function (value) {
                      
                      memberLabel = value + ' - ' + memberLabel;
                      return false;
                      
                    });
                var dimensionLabel = axisLabel + " &nbsp;&nbsp;" + memberLabel;
                App.InlineDoc.updateContextAxisForSearch(contextId, dimensionLabel);
                // }
              });
            }
            App.hideSpinner();
          });
          // });
        }
        // if (modal.find('#search-include-dimensions').is(':checked')) {
        modal.find('#search-include-dimensions').on(
            'click',
            function () {
              App.showSpinner($('.modal-header'), function () {
                
                isClicked = true;
                var items = "";
                if (App.InlineDoc) {
                  items = App.InlineDoc.getAxis();
                  
                  var contextValues = [];
                  items.each(function (index, element) {
                    var ele = $(element);
                    var pele = $(ele.parents()[2]);
                    var contextId = pele.attr('id');
                    // if($.inArray(contextId,contextValues) == -1){
                    // contextValues.push(contextId);
                    var axisLabel = ele.attr('dimension');
                    var axislval = App.InlineDoc.getSelectedLabel(App_Utils.convertToXBRLId(axisLabel), this, null,
                        function (value) {
                          
                          axisLabel = value + ' - ' + axisLabel;
                          return false;
                          
                        });
                    
                    // member label
                    var memberLabel = ele.html();
                    var memberlval = App.InlineDoc.getSelectedLabel(App_Utils.convertToXBRLId(memberLabel), this, null,
                        function (value) {
                          
                          memberLabel = value + ' - ' + memberLabel;
                          return false;
                          
                        });
                    var dimensionLabel = axisLabel + " &nbsp;&nbsp;" + memberLabel;
                    App.InlineDoc.updateContextAxisForSearch(contextId, dimensionLabel);
                    // }
                  });
                }
                App.hideSpinner();
              });
            });
        // }
      }
    }
  },
  TaggedSection : {
    results : $(),
    totalPages : 0,
    currentPage : 1,
    resultsPerPage : 15,
    _cachescrollDestination : $(),
    isInitialized : false,
    prevItem : null,
    resetUI : function () {
      
      App_Find.TaggedSection.results = $();
    },
    goToPage : function (pageNumber, selector) {
      
      $('#results-reports').html('');
      App_Find.TaggedSection.currentPage = pageNumber;
      App_Find.TaggedSection.show();
      if (selector) {
        
        App_Find.TaggedSection.selectItem($('#results-reports').children(selector).attr('data-result-index'));
      }
    },
    prevPage : function (selector) {
      
      var page = App_Find.TaggedSection.currentPage - 1;
      if (page > 0) {
        
        App_Find.TaggedSection.goToPage(page, selector);
      }
    },
    nextPage : function (selector) {
      
      var page = App_Find.TaggedSection.currentPage + 1;
      if (page <= App_Find.TaggedSection.totalPages) {
        
        App_Find.TaggedSection.goToPage(page, selector);
      }
    },
    prevItem : function () {
      
      var results = $('#results-reports');
      var selectedItem = results.find('[data-is-selected="true"]');
      if (selectedItem.length == 1 && selectedItem.prev().length == 1) {
        
        App_Find.TaggedSection.selectItem(selectedItem.prev().attr('data-result-index'));
      } else {
        
        App_Find.TaggedSection.prevPage(':last-child');
      }
    },
    nextItem : function () {
      
      var results = $('#results-reports');
      var selectedItem = results.find('[data-is-selected="true"]');
      if (selectedItem.length == 1) {
        
        if (selectedItem.next().length == 1) {
          
          App_Find.TaggedSection.selectItem(selectedItem.next().attr('data-result-index'));
        } else {
          
          App_Find.TaggedSection.nextPage(':first');
        }
      } else {
        
        App_Find.TaggedSection.selectItem(results.children(':first').attr('data-result-index'));
      }
    },
    selectItem : function (index, showElementDetail) {
      
      var report = App_Find.TaggedSection.results[index];
      
      var docContent = App.InlineDoc.getDocumentContent();
      var firstAnchor = report.firstAnchor;
      var hasFirstAnchor = firstAnchor && firstAnchor.name && firstAnchor.contextRef && true;
      var uniqueAnchor = report.uniqueAnchor;
      var hasUniqueAnchor = uniqueAnchor && uniqueAnchor.name && uniqueAnchor.contextRef && true;
      function retrieve (node, fact) {
       
        var query = '[name="'+ fact.name + '"]';
        var query1 = '[contextref="' + fact.contextRef + '"]';
        var found = node.find(query);
        found = found.filter(query1);
        
        return found;
      }
      var found = null;
      var best = null;
      if (firstAnchor && uniqueAnchor && firstAnchor.unique && uniqueAnchor.first) { // have
        // just
        // one
        best = found = retrieve((docContent), firstAnchor);
      } else if (firstAnchor && !uniqueAnchor) { // have only a first anchor
        // that is not unique
        // you may take the user to the wrong place in the document, warn them.
        found = retrieve((docContent), firstAnchor);
      } else { // we have two. use the unique to locate the part of the
        // document, then scan for first.
        found = retrieve((docContent), uniqueAnchor);
        if (!(found && found[0])) {
          found = retrieve(ancestor, firstAnchor);
        } else {
          var ancestors = found.parents();
          for (var i = 0; i < ancestors.length; i++) {
            var ancestor = ancestors[i];
            if (found[0] == ancestor)
              continue;
            var node = retrieve($(ancestor), firstAnchor);
            if (node && node[0]) {
              best = node;
            } else { // look at previous siblings, in reverse order, for the
              // descendant.
              var prevs = $(ancestor).prevAll();
              for (var j = 0; j < prevs.length; j++) {
                var prev = prevs[j];
                if (found[0] == prev)
                  continue;
                node = retrieve($(prev), firstAnchor);
                if (node && node[0]) {
                  best = node;
                  break;
                }
              }
            }
            if (best) {
              break;
            }
          }
        }
      }
      if (!found) {
        App.showMessage('Could not locate \n' + report.shortName + '.');
        return;
      } else if ((found && !best) || (best)) {
        if (best) {
          App.hideMessage();
          found = best;
        } else {
          App.showMessage('Data tagged for ' + report.shortName + ' not in expected location.', {
            'hideAfter' : '3000'
          });
        }
        
        // found.selectionHighlight();
        var ancestors = found.parents();
        var scrollDestination = found[0];
        
        for (var i = 0; i < ancestors.length; i++) {
          var ancestor = ancestors[i];
          var display = $(ancestor).css('display');
          if (display == 'table') { // rely on the fact that EDGAR does not
            // allow nested table elements
            scrollDestination = ancestor;
            break;
          }
        }
        if (screen.width < 641) {
          $('#app-panel-reports-container').hide('slide');
          $('#app-panel2').removeClass('visible').animate({
            'margin-left' : '-100%'
          });
          $('#app-inline-xbrl-doc').css({
            'width' : '100%'
          });
          App_Find.TaggedSection._cachescrollDestination = null;
        }
        
        App_Find.TaggedSection._cachescrollDestination = scrollDestination;
        
        if (scrollDestination) {
          scrollDestination.scrollIntoView();
          if (navigator.userAgent.match(/iPad/i)) {
            setTimeout(function () {
              $(window).scrollTop(($(scrollDestination)[0].offsetTop) * 0.70);
            }, 0);
          }
        }
        
        if (showElementDetail) {
          App_Find.TaggedSection.highlightItemOperatingCo(index, showElementDetail);
        } else {
          App_Find.TaggedSection.highlightItem(index);
        }
        
      } else {
        App.showMessage('Internal error locating ' + report.shortName + '.');
      }
    },
    highlightItem : function (index) {
      
      var results = $('#results-reports');
      results.find('[data-is-selected="true"]').each(function (index, element) {
        
        var node = $(element);
        node.attr('data-is-selected', 'false');
        var resultItemDiv = node.find('[class="rightNavLinks"]');
        resultItemDiv.css('border', '2px solid #7B7B7B');
        
      });
      var resultItem = results.find('[data-result-index="' + index + '"]');
      if (resultItem.length == 1) {
        
        resultItem.attr('data-is-selected', 'true');
        var resultItemDiv = resultItem.find('[class="rightNavLinks"]');
        resultItemDiv.css('border', '4px solid ' + App_Settings.get('focusHighlightColor'));
      }
    },
    highlightItemOperatingCo : function (index, showElementDetail) {
      var report = App_Find.TaggedSection.results[index];
      var results = $('#usGaapTaggedSection');
      results.find('[data-is-selected="true"]').each(function (index, element) {
        
        var node = $(element);
        node.attr('data-is-selected', 'false');
        if (prevItem) {
          prevItem.css('border', '0px solid ' + App_Settings.get('focusHighlightColor'));
        }
        
      });
      var resultItem = results.find('[data-result-index="' + index + '"]');
      if (resultItem.length == 1) {
        prevItem = showElementDetail;
        resultItem.attr('data-is-selected', 'true');
        showElementDetail.css('border', '4px solid ' + App_Settings.get('focusHighlightColor'));
      }
    },
    init : function () {
      $('[data-toggle=collapse]').click(function () {
        // toggle icon-image
        $(this).find('.icon-as-img').toggleClass('icon-expand-less-black icon-expand-more-black');
      });
      
      $('[data-toggle=collapse]').bind('keypress', function (e) {
        var code = e.keyCode || e.which;
        if ((code == 13) || (code == 32)) { // Enter keycode
          // toggle icon-image
          e.preventDefault();
          $(this).click();
        }
      });
      
      $('#menuBtn-reports').on('click', function () {
        App_Find.TaggedSection.lazyLoadData();
        $('#about-modal').dialog("close");
        $('#app-panel-reports-container').show('slide');
        App_Find.TaggedSection.loadData();
        $(window).resize();
        
      });
      
      $('#menuBtn-reports').bind('keypress', function (e) {
        var code = e.keyCode || e.which;
        if ((code == 13) || (code == 32)) { // Enter keycode
          App_Find.TaggedSection.lazyLoadData();
          $('#about-modal').dialog("close");
          $('#app-panel-reports-container').show('slide');
          App_Find.TaggedSection.loadData();
        }
      });
      
    },
    
    lazyLoadData : function () {
      if (!_lazyLoadTaggedSection) {
        _lazyLoadTaggedSection = true;
        
        var section = $('#results-header-report-mutualFund');
        
        // wire up the next/prev item buttons
        section.find('a').each(function (index, element) {
          
          if (index == 0) {
            
            // prev item
            $(element).on('click', function () {
              
              App_Find.TaggedSection.prevItem();
            });
          } else {
            
            // next item
            $(element).on('click', function () {
              
              App_Find.TaggedSection.nextItem();
            });
          }
        });
        
        // wire up the paging buttons
        section.find('.btn-container button').each(function (index, element) {
          
          switch (index) {
            
            case 0:
              // Page To Beginning
              $(element).on('click', function () {
                
                App_Find.TaggedSection.goToPage(1, ':first');
              });
              break;
            case 1:
              // Prev Page
              $(element).on('click', function () {
                
                App_Find.TaggedSection.prevPage(':first');
              });
              break;
            case 2:
              // Next Page
              $(element).on('click', function () {
                
                App_Find.TaggedSection.nextPage(':first');
              });
              break;
            case 3:
              // Page To End
              $(element).on('click', function () {
                
                App_Find.TaggedSection.goToPage(App_Find.TaggedSection.totalPages, ':first');
              });
              break;
          }
        });
        
        var section = $('#results-header-report-operating');
        
        // wire up the paging buttons
        section.find('.btn-container button').each(function (index, element) {
          
          switch (index) {
            
            case 0:
              // Page To Beginning
              $(element).on('click', function () {
                
                App_Find.TaggedSection.goToPage(1, ':first');
              });
              break;
            case 1:
              // Prev Page
              $(element).on('click', function () {
                
                App_Find.TaggedSection.prevPage(':first');
              });
              break;
            case 2:
              // Next Page
              $(element).on('click', function () {
                
                App_Find.TaggedSection.nextPage(':first');
              });
              break;
            case 3:
              // Page To End
              $(element).on('click', function () {
                
                App_Find.TaggedSection.goToPage(App_Find.TaggedSection.totalPages, ':first');
              });
              break;
          }
        });
        
        $('#app-panel-reports-container').find('[data-btn-remove]').on('click', function () {
          if (screen.width < 641) {
            $('#app-panel-reports-container').hide('slide');
            $('#app-panel2').removeClass('visible').animate({
              'margin-left' : '-100%'
            });
            $('#app-inline-xbrl-doc').css({
              'width' : '100%'
            });
          } else {
            $('#app-panel-reports-container').hide('slide');
            $('#app-panel2').removeClass('visible').animate({
              'margin-left' : '-30%'
            });
            $('#app-inline-xbrl-doc').css({
              'width' : '100%'
            });
          }
          if ((App_Find.TaggedSection._cachescrollDestination != null)) {
            App_Find.TaggedSection._cachescrollDestination.scrollIntoView();
            App_Find.TaggedSection._cachescrollDestination = null;
          }
        });
        
      }
    },
    
    getReportData : function () {
      var reports = "";
      if (App.InlineDoc.getMetaData()) {
        reports = App.InlineDoc.getMetaData().report;
      }
      var results = [];
      for (index in reports) {
        var report = reports[index];
        if (report.groupType.length > 0 && report.firstAnchor) {
          results.push(report);
          
        }
      }
      return results;
    },
    
    loadData : function () {
      
      var results = App_Find.TaggedSection.getReportData();
      results.sort(function (a, b) {
        return (a.longName).localeCompare(b.longName);
      })

      var remoteElements = App.InlineDoc.getRemoteFileDetails();
      var containsUsGaap = false;
      for (key in remoteElements) {
        if (remoteElements[key].indexOf(App.InlineDoc.standardTaxonomy) > 0) {
          containsUsGaap = true;
          break;
        }
      }
      if (containsUsGaap) {
        App_Find.TaggedSection.showNew(results, false);
      } else {
        App_Find.TaggedSection.show(results);
      }
      // App_Find.TaggedSection.show(results);
    },
    
    load : function () {
      var results = App_Find.TaggedSection.getReportData();
      $('#results-count-reports-badge').html('' + results.length + '');
      
      App_Find.TaggedSection.isInitialized = true;
    },
    
    refreshTaggedSection : function (searchInputVal) {
      var reports = App.InlineDoc.getMetaData().report;
      var results = [];
      for (index in reports) {
        var report = reports[index];
        if (searchInputVal != null && searchInputVal.length > 0) {
          if (report.groupType.length > 0 && report.firstAnchor
              && (report.shortName.toLowerCase().indexOf(searchInputVal.toLowerCase()) > -1)) {
            results.push(report);
          }
        } else {
          if (report.groupType.length > 0 && report.firstAnchor) {
            results.push(report);
          }
        }
      }
      results.sort(function (a, b) {
        return (a.longName).localeCompare(b.longName);
      })

      var remoteElements = App.InlineDoc.getRemoteFileDetails();
      var containsUsGaap = false;
      for (key in remoteElements) {
        if (remoteElements[key].indexOf(App.InlineDoc.standardTaxonomy) > 0) {
          containsUsGaap = true;
          break;
        }
      }
      if (containsUsGaap) {
        if (searchInputVal != null && searchInputVal.length > 0) {
          App_Find.TaggedSection.showNew(results, true);
        } else {
          App_Find.TaggedSection.showNew(results, false);
        }
      } else {
        App_Find.TaggedSection.show(results);
      }
      
      // App_Find.TaggedSection.show(results);
    },
    
    show : function (results) {
      
      $("#operatingCompanyTaggedSection").css({
        'display' : 'none'
      });
      $("#results-header-report-operating").css({
        'display' : 'none'
      });
      var documentTypeIfrs = $('#documentTypeIfrs');
      var statementTypeIfrs = $('#statementTypeIfrs');
      var disclosureTypeIfrs = $('#disclosureTypeIfrs');
      var disclosureTypeExpandedIfrs = $('#disclosureTypeExpandedIfrs');
      
      var RR_SummariesIfrs = $('#RR_SummariesIfrs');
      
      if (results) {
        documentTypeIfrs.html('');
        statementTypeIfrs.html('');
        disclosureTypeIfrs.html('');
        disclosureTypeExpandedIfrs.html('');
        RR_SummariesIfrs.html('');
        
        $("#documentTypeSingleLIDivIfrs").html('');
        $("#documentTypeMainLIDivIfrs").css({
          'display' : 'block'
        })
        $("#documentTypeSingleLIDivIfrs").css({
          'display' : 'block'
        })
        $("#statementLiIfrs").css({
          'display' : 'block'
        })
        $("#disclosureLiIfrs").css({
          'display' : 'block'
        })
        $("#disclosureLiDupIfrs").css({
          'display' : 'block'
        })

        $("#rrLiIfrs").css({
          'display' : 'block'
        })

        App_Find.TaggedSection.results = null;
        App_Find.TaggedSection.results = $(results); // load
        
      }
      $('#results-count-reports').html('' + App_Find.TaggedSection.results.length + '');
      
      var countDocumentType = 0;
      var countStatementType = 0;
      var countDisclosureType = 0;
      var countRR = 0;
      
      var resultHtmlObjs = [];
      
      for ( var index in App_Find.TaggedSection.results) {
        var groupType = App_Find.TaggedSection.results[index].groupType;
        if (groupType != null && groupType.length > 0) {
          
          var label = App_Find.TaggedSection.results[index].shortName;
          var baseref = App_Find.TaggedSection.results[index]['firstAnchor']['baseRef'];
          
          var clickingWillReloadApp = Additional_Forms.isBaseRefDifferentThanCurrent(baseref);
          
          var resultHtml = '<li class="result-item" baseref="' + baseref
              + '"data-is-selected="false" tabindex="3" data-result-index="' + index + '" aria-label="' + label
              + '" style="list-style-type: none;text-decoration: underline;cursor:pointer;" >';
          if (clickingWillReloadApp) {
            resultHtml += '<span title="Select to open an associated source document." class="mr-3 icon-as-img icon-reload-form-black"></span>';
            resultHtml += '<a href="' + Additional_Forms.quickLinkFixForSections(baseref, index) + '">'
                + $('<div/>').html(label).text() + '</a></li>';
          } else {
            resultHtml += $('<div/>').html(label).text() + '</li>';
          }
          
          var resultHtmlObj = $(resultHtml);
          if (!clickingWillReloadApp) {
            resultHtmlObj.on('click', function () {
              App_Find.TaggedSection.selectItem($(this).attr('data-result-index'), $(this));
            });
            
            resultHtmlObj.on('keyup', function (e) {
              var code = e.keyCode || e.which;
              if ((code == 13) || (code == 32)) {
                App_Find.TaggedSection.selectItem($(this).attr('data-result-index'), $(this));
              }
            });
          }
          
          if (groupType == "document") {
            countDocumentType++;
            resultHtmlObjs.push(resultHtmlObj);
            
          } else if (groupType == "statement") {
            statementTypeIfrs.append(resultHtmlObj);
            countStatementType++;
            
          } else if (groupType == "RR_Summaries") {
            
            RR_SummariesIfrs.append(resultHtmlObj);
            countRR++;
            
          } else if (groupType == "disclosure") {
            
            disclosureTypeIfrs.append(resultHtmlObj);
            countDisclosureType++;
            $("#disclosureLiDupIfrs").css({
              'display' : 'none'
            });
            
          }
        }
      }
      
      if (countRR > 0) {
        countDocumentType = 0;
        countStatementType = 0;
        countDisclosureType = 0;
      }
      
      if (countDocumentType > 1) {
        
        for (var i = 0; i < resultHtmlObjs.length; i++) {
            $("#documentTypeSingleLIDivIfrs").append(resultHtmlObjs[i])
        }
          $("#documentTypeMainLIDivIfrs").css({
          'display' : 'none'
        })
      } else if ((countDocumentType == 1) && (resultHtmlObjs[0].html() == "Document and Entity Information")) {
        $("#documentTypeSingleLIDivIfrs").append(resultHtmlObjs[0]);
        // $("#documentTypeSingleLIDiv").css({'font-weight':'bold'});
        $("#documentTypeMainLIDivIfrs").css({
          'display' : 'none'
        });
      } else if ((countDocumentType == 1) && (resultHtmlObjs[0].html() != "Document and Entity Information")) {
        documentTypeIfrs.append(resultHtmlObjs[0])
        $("#documentTypeSingleLIDivIfrs").css({
          'display' : 'none'
        });
      } else if (countDocumentType < 1) {
        $("#documentTypeMainLIDivIfrs").css({
          'display' : 'none'
        });
        $("#documentTypeSingleLIDivIfrs").css({
          'display' : 'none'
        });
      }
      if (countStatementType == 0) {
        $("#statementLiIfrs").css({
          'display' : 'none'
        });
      }
      
      if (countRR == 0) {
        $("#rrLiIfrs").css({
          'display' : 'none'
        });
      }
      
      if (countDisclosureType == 0) {
        $("#disclosureLiIfrs").css({
          'display' : 'none'
        });
      }
      
    },
    
    showNew : function (results, isFinanceExpand) {
      
      $("#vcrControls").css({
        'display' : 'none'
      });
      $("#mutualFundTaggedSection").css({
        'display' : 'none'
      });
      $("#results-header-report-mutualFund").css({
        'display' : 'none'
      });
      $("#prevButton").css({
        'display' : 'none'
      });
      $("#nextButton").css({
        'display' : 'none'
      });
      
      var documentType = $('#documentType');
      var statementType = $('#statementType');
      var disclosureType = $('#disclosureType');
      var disclosureTypeExpanded = $('#disclosureTypeExpanded');
      
      var RR_Summaries = $('#RR_Summaries');
      
      if (results) {
        documentType.html('');
        statementType.html('');
        disclosureType.html('');
        disclosureTypeExpanded.html('');
        $("#documentTypeSingleLIDiv").html('');
        
        RR_Summaries.html('');
        
        $("#documentTypeMainLIDiv").css({
          'display' : 'block'
        })
        $("#documentTypeSingleLIDiv").css({
          'display' : 'block'
        })
        $("#statementLi").css({
          'display' : 'block'
        })
        $("#disclosureLi").css({
          'display' : 'block'
        })

		$("#disclosureLiDup").css({'display':'block'})
		
        $("#rrLi").css({
          'display' : 'block'
        })

        App_Find.TaggedSection.results = null;
        App_Find.TaggedSection.results = $(results); // load
        
      }
      $('#results-count-reports').html('' + App_Find.TaggedSection.results.length + '');
      
      var countDocumentType = 0;
      var countStatementType = 0;
      var countDisclosureType = 0;
      var countRR = 0;
      var resultHtmlObjs = [];
      
      for ( var index in App_Find.TaggedSection.results) {
        
        var groupType = App_Find.TaggedSection.results[index].groupType;
        
        if (groupType != null && groupType.length > 0) {
          
          var label = App_Find.TaggedSection.results[index].shortName;
          var baseref = App_Find.TaggedSection.results[index]['firstAnchor']['baseRef'];
          
          var clickingWillReloadApp = Additional_Forms.isBaseRefDifferentThanCurrent(baseref);
          
          var resultHtml = '<li class="result-item" baseref="' + baseref
              + '"data-is-selected="false" tabindex="3" data-result-index="' + index + '" aria-label="' + label
              + '" style="list-style-type: none;text-decoration: underline;cursor:pointer;" >';
          if (clickingWillReloadApp) {
            resultHtml += '<span title="Select to open an associated source document." class="mr-3 icon-as-img icon-reload-form-black"></span>';
            resultHtml += '<a href="' + Additional_Forms.quickLinkFixForSections(baseref, index) + '">'
                + $('<div/>').html(label).text() + '</a></li>';
          } else {
            resultHtml += $('<div/>').html(label).text() + '</li>';
          }
          
          var resultHtmlObj = $(resultHtml);
          if (!clickingWillReloadApp) {
            resultHtmlObj.on('click', function () {
              App_Find.TaggedSection.selectItem($(this).attr('data-result-index'), $(this));
            });
            
            resultHtmlObj.on('keyup', function (e) {
              var code = e.keyCode || e.which;
              if ((code == 13) || (code == 32)) {
                App_Find.TaggedSection.selectItem($(this).attr('data-result-index'), $(this));
              }
            });
          }
          
          if (groupType == "document") {
            countDocumentType++;
            resultHtmlObjs.push(resultHtmlObj);
            
          } else if (groupType == "statement") {
            
            statementType.append(resultHtmlObj);
            countStatementType++;
            
          } else if (groupType == "RR_Summaries") {
            
            RR_Summaries.append(resultHtmlObj);
            countRR++;
            
          } else if (groupType == "disclosure") {
            if (isFinanceExpand) {
              disclosureTypeExpanded.append(resultHtmlObj);
              countDisclosureType++;
              $("#disclosureLi").css({
                'display' : 'none'
              });
            } else {
              disclosureType.append(resultHtmlObj);
              countDisclosureType++;
			  $("#disclosureLiDup").css({'display':'none'});
            }
            
          }
        }
      }
      
      if (countRR > 0) {
        countDocumentType = 0;
        countStatementType = 0;
        countDisclosureType = 0;
      }
      if (countDocumentType > 1) {
        
        for (var i = 0; i < resultHtmlObjs.length; i++) {
          documentType.append(resultHtmlObjs[i])
        }
        $("#documentTypeSingleLIDiv").css({
          'display' : 'none'
        })
      } else if ((countDocumentType == 1) && (resultHtmlObjs[0].html() == "Document and Entity Information")) {
        $("#documentTypeSingleLIDiv").append(resultHtmlObjs[0]);
        // $("#documentTypeSingleLIDiv").css({'font-weight':'bold'});
        $("#documentTypeMainLIDiv").css({
          'display' : 'none'
        });
      } else if ((countDocumentType == 1) && (resultHtmlObjs[0].html() != "Document and Entity Information")) {
        documentType.append(resultHtmlObjs[0])
        $("#documentTypeSingleLIDiv").css({
          'display' : 'none'
        });
      } else if (countDocumentType < 1) {
        $("#documentTypeMainLIDiv").css({
          'display' : 'none'
        });
        $("#documentTypeSingleLIDiv").css({
          'display' : 'none'
        });
      }
      
      if (countStatementType == 0) {
        $("#statementLi").css({
          'display' : 'none'
        });
      }
      
      if (countRR == 0) {
        $("#rrLi").css({
          'display' : 'none'
        });
      }
      
      if (countDisclosureType == 0) {
        $("#disclosureLi").css({
          'display' : 'none'
        });
		 $("#disclosureLiDup").css({'display':'none'});
      }
    }
  },
  Search : {
    init : function () {
      
      $('#search-btn').on('click', function () {
        App.showSpinner1($('#mainDiv'), function () {
          App_Find.Results.load();
          if ($('#app-panel-reports-container').css('display') == 'block') {
            App_Find.TaggedSection.refreshTaggedSection($('#search-input').val());
          }
          App.hideSpinner();
        });
        
      });
      
      $('#search-input').on('blur', function () {
        
        if ($(this).val() == '') {
          
        }
      }).on('keypress', function (e) {
        
        if (e.which == 13) {
          
          e.preventDefault();
          
          App.showSpinner1($('#mainDiv'), function () {
            App_Find.Results.load();
            if ($('#app-panel-reports-container').css('display') == 'block') {
              App_Find.TaggedSection.refreshTaggedSection($('#search-input').val());
            }
            App.hideSpinner();
          });
        }
      });
    },
    resetUI : function () {
      
      $('#search-input').val('');
      $('#search-options').find('input[type="checkbox"]').each(function (index, element) {
        
        $(element).prop('checked', false);
      });
    },
    getSelected : function () {
      
      return {
        searchStr : $('#search-input').val(),
        xbrlOnly : $('#search-xbrl-only').is(':checked'),
        matchCase : $('#search-match-case').is(':checked'),
        includeDefs : $('#search-include-definitions').is(':checked'),
        includeLabels : $('#search-include-labels').is(':checked'),
        includeDimensions : $('#search-include-dimensions').is(':checked'),
        includeReferences : $('#search-include-references').is(':checked')
      };
    }
  },
  Results : {
    results : $(),
    totalPages : 0,
    currentPage : 1,
    resultsPerPage : 10,
    units : [],
    scale : [],
    calendars : [],
    _cachescrollDestination : $(),
    init : function () {
      if (!_lazyLoadResults) {
        _lazyLoadResults = true;
        var section = $('#panel-section-results');
        
        // wire up the next/prev item buttons
        section.find('span').each(function (index, element) {
          if (index == 1) {
            
            // prev item
            $(element).on('click', function () {
              
              App_Find.Results.prevItem();
              
            });
            
            $(element).on('keypress', function (e) {
              var code = e.keyCode || e.which;
              if ((code == 13) || (code == 32)) { // Enter keycode
                App_Find.Results.prevItem();
              }
            });
          } else if (index == 2) {
            
            // next item
            $(element).on('click', function () {
              
              App_Find.Results.nextItem();
            });
            
            $(element).on('keypress', function (e) {
              var code = e.keyCode || e.which;
              if ((code == 13) || (code == 32)) { // Enter keycode
                App_Find.Results.nextItem();
              }
            });
          }
        });
        
        // wire up the paging buttons
        section.find('.btn-container button').each(function (index, element) {
          
          switch (index) {
            
            case 0:
              // Page To Beginning
              $(element).on('click', function () {
                
                App_Find.Results.goToPage(1, ':first');
              });
              break;
            case 1:
              // Prev Page
              $(element).on('click', function () {
                
                App_Find.Results.prevPage(':first');
              });
              break;
            case 2:
              // Next Page
              $(element).on('click', function () {
                
                App_Find.Results.nextPage(':first');
              });
              break;
            case 3:
              // Page To End
              $(element).on('click', function () {
                
                App_Find.Results.goToPage(App_Find.Results.totalPages, ':first');
              });
              break;
          }
        });
      }
      
    },
    resetUI : function () {
      
      App_Find.Results.results = $();
      App_Find.Results.units = [];
      App_Find.Results.axis = [];
      App_Find.Results.scale = [];
      App_Find.Results.balance = [];
      App_Find.Results.calendars = [];
      App_Find.Results.load();
    },
    goToPage : function (pageNumber, selector) {
      
      $('#results').html('');
      App_Find.Results.currentPage = pageNumber;
      App_Find.Results.show();
      if (selector) {
        
        App_Find.Results.selectItem($('#results').children(selector).attr('data-result-index'));
      }
    },
    prevPage : function (selector) {
      
      var page = App_Find.Results.currentPage - 1;
      if (page > 0) {
        
        App_Find.Results.goToPage(page, selector);
      }
    },
    nextPage : function (selector) {
      
      var page = App_Find.Results.currentPage + 1;
      if (page <= App_Find.Results.totalPages) {
        
        App_Find.Results.goToPage(page, selector);
      }
    },
    prevItem : function () {
      
      var results = $('#results');
      var selectedItem = results.find('[data-is-selected="true"]');
      if (selectedItem.length == 1 && selectedItem.prev().length == 1) {
        
        App_Find.Results.selectItem(selectedItem.prev().attr('data-result-index'));
      } else {
        
        App_Find.Results.prevPage(':last-child');
      }
    },
    nextItem : function () {
      
      var results = $('#results');
      var selectedItem = results.find('[data-is-selected="true"]');
      if (selectedItem.length == 1) {
        
        if (selectedItem.next().length == 1) {
          
          App_Find.Results.selectItem(selectedItem.next().attr('data-result-index'));
        } else {
          
          App_Find.Results.nextPage(':first');
        }
      } else {
        
        App_Find.Results.selectItem(results.children(':first').attr('data-result-index'));
      }
    },
    selectItem : function (index, showElementDetail) {
      
      var ele = App_Find.Results.results[index];
      if (ele && !ele.jquery) {
        
        ele = $(ele);
      }
      App_Find.Results.highlightItem(index);
      if (ele) {
        App.frame
            .contents()
            .find(
                '.sec-cbe-highlight-content-selected, .sec-cbe-highlight-filter-block-content-selected, .sec-cbe-highlight-filter-content-selected, .sec-cbe-highlight-filter-selected-block')
            .removeClass(
                'sec-cbe-highlight-content-selected sec-cbe-highlight-filter-block-content-selected sec-cbe-highlight-filter-content-selected sec-cbe-highlight-filter-selected-block');
        App_Find.Highlight.cachedResults.arrayOfImages = App.frame.contents().find('img');
        imagePath = getImagePath();
        var arrayOfImagesLength = App_Find.Highlight.cachedResults.arrayOfImages.length;
        for (var i = 0; i < arrayOfImagesLength; i++) {
          var elementAtIthPositionOfArrayOfImages = App_Find.Highlight.cachedResults.arrayOfImages[i];
          if (elementAtIthPositionOfArrayOfImages.getAttribute('src') == imagePath
              + App_Settings.get('focusHighlightSelectionColorCode') + "_img.png") {
            elementAtIthPositionOfArrayOfImages.setAttribute("src", imagePath
                + App_Settings.get('elementBorderColorCode') + "_img.png");
          }
        }
        ele.selectionHighlight();
        var nodeName = $(ele)[0].nodeName.toLowerCase();
        if (nodeName == App.InlineDoc.inlinePrefix + ':nonnumeric') {
          
          if ($(ele).attr('continuedat') != null) {
            allLinkedNodes = App_Find.Element.groupIxContinuation($(ele));
            
            selectionHighlightClickNodes(allLinkedNodes);
            var imageId = ele.attr('id') + "imageid";
            imageNode = getAlreadyExistingImage(imageId);
            if (imageNode) {
              imageNode.setAttribute("src", imagePath + App_Settings.get('focusHighlightSelectionColorCode')
                  + "_img.png");
            }
          } else if ($(ele).parent().hasClass('sec-cbe-highlight-block')) {
            App.frame.contents().find('.sec-cbe-highlight-filter-selected').removeClass(
                'sec-cbe-highlight-filter-selected');
            $(ele).selectionHighlightForBlock();
            var imageId = ele.attr('id') + "imageid";
            imageNode = getAlreadyExistingImage(imageId);
            if (imageNode) {
              imageNode.setAttribute("src", imagePath + App_Settings.get('focusHighlightSelectionColorCode')
                  + "_img.png");
            }
          }
        }
        if (ele.attr('id')) {
          
          // var spanNodes = App.InlineDoc.getLinkedHiddenElements();
          var spanNodes = App_Find.Highlight.cachedResults.linkedHiddenNodes;
          if (spanNodes) {
            for (var i = 0; i < spanNodes.length; i++) {
              if (spanNodes[i][0] == ele.attr('id')) {
                var spanNode = spanNodes[i][1][0];
                if (spanNode) {
                  $(spanNode).selectionHighlightHiddenNodes();
                  App_Find.Results._cachescrollDestination = spanNode;
                  spanNode.scrollIntoView();
                }
              }
            }
          }
        }
        /*
         * if((window.orientation) || (window.orientation=='0')){ if
         * ((screen.width > 640) && (screen.width < 769) &&
         * ($("#filterDataDiv").height()==0)) { ele.css({"padding-top":
         * "30px"}); } else if ((screen.width > 640) && (screen.width < 769) &&
         * ($("#filterDataDiv").height()==23)) { ele.css({"padding-top":
         * "53px"}); } else if ((screen.width > 640) && (screen.width < 769) &&
         * ($("#filterDataDiv").height()==46)) { ele.css({"padding-top":
         * "76px"}); } else if ((screen.width > 640) && (screen.width < 769) &&
         * ($("#filterDataDiv").height()==69)) { ele.css({"padding-top":
         * "99px"}); } else if ((screen.width > 640) && (screen.width < 769) &&
         * ($("#filterDataDiv").height()==92)) { ele.css({"padding-top":
         * "122px"}); } else if ((screen.width > 640) && (screen.width < 769) &&
         * ($("#filterDataDiv").height()==115)) { ele.css({"padding-top":
         * "145px"}); } }
         */
        App_Find.Results._cachescrollDestination = ele[0];
        ele[0].scrollIntoView();
        if (navigator.userAgent.match(/iPad/i)) {
          setTimeout(function () {
            $(window).scrollTop(
                ($('#app-inline-xbrl-doc').contents().find('body').find($(ele[0])).position().top) * 0.70);
          }, 0);
        }
      }
      if (showElementDetail || $('#selection-detail-container').parent().css('display') == 'block') {
        App_Find.Element.showSelectionDetail(ele);
      }
    },
    highlightItem : function (index) {
      
      var results = $('#results');
      results.find('[data-is-selected="true"]').each(function (index, element) {
        
        var node = $(element);
        node.attr('data-is-selected', 'false');
        var resultItemDiv = node.find('[class="rightNavLinks"]');
        resultItemDiv.css('border', '2px solid #7B7B7B');
        
      });
      var resultItem = results.find('[data-result-index="' + index + '"]');
      if (resultItem.length == 1) {
        
        resultItem.attr('data-is-selected', 'true');
        var resultItemDiv = resultItem.find('[class="rightNavLinks"]');
        resultItemDiv.css('border', '4px solid ' + App_Settings.get('focusHighlightColor'));
      }
    },
    resetHighlightColor : function (index) {
      
      var results = $('#results');
      results.find('[data-is-selected="true"]').each(function (index, element) {
        
        var node = $(element);
        node.attr('data-is-selected', 'false');
        var resultItemDiv = node.find('[class="rightNavLinks"]');
        resultItemDiv.css('border', '2px solid #7B7B7B');
        
      });
    },
    refreshHighlightColor : function () {
      
      $('#results').find('[data-is-selected="true"]').each(function (index, element) {
        var resultItemDiv = $(element).find('[class="rightNavLinks"]');
        resultItemDiv.css('border', '4px solid ' + App_Settings.get('focusHighlightColor'));
      });
    },
    load : function () {
      var frameContentObject = App.frame.contents();
      var srcImg = getImagePath() + App_Settings.get('elementBorderColorCode') + "_img.png";
      var filter = App_Find.Filter.getSelected();
      var search = App_Find.Search.getSelected();
      
      var results = App_Find.Highlight.getResults();
      var instance = App.InlineDoc.getMetaData();
      var instanceTag = "";
      
      if (!App_Find.Highlight.cachedResults.linkedHiddenNodes) {
        App_Find.Highlight.initLinkedHiddenNodes();
      }
      
      App_Find.removeHighlightFilter();
      
      if (instance) {
        instanceTag = instance.tag;
      }
      selectionHighlightNodes = function (allLinkedNodes) {
        var nonNumericNode = App.InlineDoc.inlinePrefix + ':nonnumeric';
        var continuationNode = App.InlineDoc.inlinePrefix + ':continuation';
        if (allLinkedNodes) {
          var allLinkedNodesLength = allLinkedNodes.length;
          var cls = 'sec-cbe-highlight-content-selected';
          for (var i = 0; i < allLinkedNodesLength; i++) {
            var allLinkedNodesLocal = allLinkedNodes[i];
            var allLinkedNodesLocalNodeName = allLinkedNodesLocal[0].nodeName.toLowerCase();
            var allLinkedNodesLocalNode = $(allLinkedNodesLocal);
            var firstLevelChildren = allLinkedNodesLocalNode.children();
            var secondLevelChildren = allLinkedNodesLocalNode.children().children();
            var fourthLevelChildren = allLinkedNodesLocalNode.children().children().children().children();
            var fifthLevelChildren = allLinkedNodesLocalNode.children().children().children().children().children();
            if (allLinkedNodesLocalNodeName == nonNumericNode) {
              allLinkedNodesLocalNode.addClass(cls);
            }
            if (firstLevelChildren.length > 0) {
              firstLevelChildren.addClass(cls);
              if (secondLevelChildren.length > 0) {
                if ((secondLevelChildren[0].nodeName.toLowerCase() == "span")) {
                  secondLevelChildren.addClass(cls);
                }
                if ((secondLevelChildren[0].nodeName.toLowerCase() == "div")) {
                  secondLevelChildren.addClass(cls);
                }
                fifthLevelChildren.addClass(cls);
                fourthLevelChildren.addClass(cls);
                secondLevelChildren.addClass(cls);
              }
            } else if (allLinkedNodesLocalNodeName == continuationNode) {
              allLinkedNodesLocalNode.addClass(cls);
            }
            
          }
          ;
          
          if (allLinkedNodes[0]) {
            if (allLinkedNodes[0].children()) {
              var lastNodeChildren = allLinkedNodes[0].children();
              var lastNodeChildrenLength = lastNodeChildren.length;
              if (lastNodeChildrenLength > 0) {
                var lastNodeChildrenNodeName = lastNodeChildren[0].nodeName.toLowerCase();
                if (lastNodeChildrenNodeName == "br") {
                  var elem = document.createElement("br");
                  lastNodeChildren.wrap('<div id="wrapBr" class="sec-cbe-highlight-content-selected"></div>');
                  if (($.browser.msie)) {
                    lastNodeChildren = allLinkedNodes[0].children();
                    lastNodeChildren.append(elem);
                  }
                  $(allLinkedNodes[0]).children().addClass(cls);
                }
              }
            }
          }
          if (allLinkedNodes[allLinkedNodesLength - 1]) {
            
            if (allLinkedNodes[allLinkedNodesLength - 1].children()) {
              var lastNodeChildren = allLinkedNodes[allLinkedNodesLength - 1].children();
              var lastNodeChildrenLength = lastNodeChildren.length;
              while (lastNodeChildrenLength >= 1) {
                if ($(lastNodeChildren[lastNodeChildrenLength - 1]).children()) {
                  lastNodeChildren = $(lastNodeChildren[lastNodeChildrenLength - 1]).children();
                  lastNodeChildrenLength = lastNodeChildren.length;
                } else
                  break;
              }
              if (lastNodeChildren) {
                var lastNodeChildrenNodeName = lastNodeChildren.context.nodeName.toLowerCase();
                if (lastNodeChildrenNodeName == "br") {
                  var elem = document.createElement("br");
                  var lastNodeChildrenContext = $(lastNodeChildren.context);
                  var lastNodeChildrenContextParent = $(lastNodeChildren.context).parent();
                  var lastNodeChildrenContextParentNodeName = $(lastNodeChildren.context).parent()[0].nodeName
                      .toLowerCase();
                  if (lastNodeChildrenContextParent.attr('id') != "wrapBr") {
                    if (lastNodeChildrenContextParentNodeName == nonNumericNode
                        || lastNodeChildrenContextParentNodeName == continuationNode) {
                      lastNodeChildrenContext
                          .wrap('<div id="wrapBr" class="sec-cbe-highlight-content-selected wordBreakDiv" style="white-space: nowrap;  "></div>');
                      lastNodeChildrenContextParent = $(lastNodeChildren.context).parent();
                      if (($.browser.msie)) {
                        if ($(lastNodeChildren.context).parent().parent()[0].nodeName.toLowerCase() != nonNumericNode) {
                          lastNodeChildrenContextParent.append(elem);
                        }
                      }
                    }
                  } else {
                    lastNodeChildrenContextParent.addClass('sec-cbe-highlight-content-selected');
                  }
                }
              }
            }
          }
        }
      };
      selectionHighlightClickNodes = function (allLinkedNodes) {
        var allLinkedNodesLength = allLinkedNodes.length;
        frameContentObject.find('.sec-cbe-highlight-filter-selected').removeClass('sec-cbe-highlight-filter-selected');
        var nonNumericNode = App.InlineDoc.inlinePrefix + ':nonnumeric';
        var continuationNode = App.InlineDoc.inlinePrefix + ':continuation';
        for (var i = 0, max = allLinkedNodes.length; i < max; i++) {
          var cls = 'sec-cbe-highlight-filter-content-selected';
          var allLinkedNodesLocal = allLinkedNodes[i];
          var allLinkedNodesLocalNodeName = allLinkedNodesLocal[0].nodeName.toLowerCase();
          var allLinkedNodesLocalNode = $(allLinkedNodesLocal);
          var firstLevelChildren = allLinkedNodesLocalNode.children();
          var secondLevelChildren = allLinkedNodesLocalNode.children().children();
          var fourthLevelChildren = allLinkedNodesLocalNode.children().children().children().children();
          var fifthLevelChildren = allLinkedNodesLocalNode.children().children().children().children().children();
          if (allLinkedNodesLocalNodeName == nonNumericNode) {
            allLinkedNodesLocalNode.addClass(cls);
          }
          if (firstLevelChildren.length > 0) {
            firstLevelChildren.addClass(cls);
            if (secondLevelChildren.length > 0) {
              if ((secondLevelChildren[0].nodeName.toLowerCase() == "span")) {
                secondLevelChildren.addClass(cls);
              }
              if ((secondLevelChildren[0].nodeName.toLowerCase() == "div")) {
                secondLevelChildren.addClass(cls);
              }
              fifthLevelChildren.addClass(cls);
              fourthLevelChildren.addClass(cls);
              secondLevelChildren.addClass(cls);
            }
            
          } else if (allLinkedNodesLocalNodeName == continuationNode) {
            allLinkedNodesLocalNode.addClass(cls);
          }
        }
        ;
        if (allLinkedNodes[allLinkedNodesLength - 1]) {
          if (allLinkedNodes[allLinkedNodesLength - 1].children()) {
            var lastNodeChildren = allLinkedNodes[allLinkedNodesLength - 1].children();
            var lastNodeChildrenLength = lastNodeChildren.length;
            while (lastNodeChildrenLength >= 1) {
              if ($(lastNodeChildren[lastNodeChildrenLength - 1]).children()) {
                lastNodeChildren = $(lastNodeChildren[lastNodeChildrenLength - 1]).children();
                lastNodeChildrenLength = lastNodeChildren.length;
              } else
                break;
            }
            if (lastNodeChildren) {
              var lastNodeChildrenNodeName = lastNodeChildren.context.nodeName.toLowerCase();
              if (lastNodeChildrenNodeName == "br") {
                var elem = document.createElement("br");
                var lastNodeChildrenContext = $(lastNodeChildren.context);
                var lastNodeChildrenContextParent = $(lastNodeChildren.context).parent();
                var lastNodeChildrenContextParentNodeName = $(lastNodeChildren.context).parent()[0].nodeName
                    .toLowerCase();
                if (lastNodeChildrenContextParent.attr('id') != "wrapBr") {
                  if (lastNodeChildrenContextParentNodeName == nonNumericNode
                      || lastNodeChildrenContextParentNodeName == continuationNode) {
                    lastNodeChildrenContext
                        .wrap('<div id="wrapBr" class="sec-cbe-highlight-filter-content-selected wordBreakDiv" style="white-space: nowrap;  "></div>');
                    lastNodeChildrenContextParent = $(lastNodeChildren.context).parent();
                    if (($.browser.msie)) {
                      lastNodeChildrenContextParent.append(elem);
                    }
                  }
                } else {
                  $(lastNodeChildren.context).parent().addClass('sec-cbe-highlight-filter-content-selected');
                }
              }
            }
          }
        }
      };
      checkIfImageAlreadyExists = function (imageId) {
        App_Find.Highlight.cachedResults.arrayOfImages = frameContentObject.find('img');
        var arrayOfImagesLength = App_Find.Highlight.cachedResults.arrayOfImages.length;
        var arrImageId = "";
        for (var i = 0; i < arrayOfImagesLength; i++) {
          if (App_Find.Highlight.cachedResults.arrayOfImages[i].getAttribute('id') == imageId) {
            arrImageId = App_Find.Highlight.cachedResults.arrayOfImages[i].getAttribute('id');
            break;
          }
          
        }
        if (arrImageId != "") {
          return true;
        } else
          return false;
        
      };
      getAlreadyExistingImage = function (imageId) {
        App_Find.Highlight.cachedResults.arrayOfImages = frameContentObject.find('img');
        var arrayOfImagesLength = App_Find.Highlight.cachedResults.arrayOfImages.length;
        var arrImageId = "";
        for (var i = 0; i < arrayOfImagesLength; i++) {
          if (App_Find.Highlight.cachedResults.arrayOfImages[i].getAttribute('id') == imageId) {
            arrImageId = App_Find.Highlight.cachedResults.arrayOfImages[i];
            break;
          }
          
        }
        if (arrImageId != "") {
          return arrImageId;
        }
        
      };
      findParentIxNonnumericNode = function (eCatId, found, parentNode) {
        var parentNode = "";
        var appFindHighlighCachedResults = App_Find.Highlight.cachedResults;
        var nonnumericnodesLength = appFindHighlighCachedResults.nonnumericnodes.length;
        var continuedNodesLength = appFindHighlighCachedResults.continuedAt.length;
        if (found == false) {
          for (var k = 0; k < nonnumericnodesLength; k++) {
            if (eCatId == appFindHighlighCachedResults.nonnumericnodes[k].attr('continuedat')) {
              parentNode = appFindHighlighCachedResults.nonnumericnodes[k];
              found = true;
              break;
            }
            
          }
        }
        if (found == false) {
          for (var l = 0; l < continuedNodesLength; l++) {
            if (eCatId == appFindHighlighCachedResults.continuedAt[l].attr('continuedat')) {
              parentNode = findParentIxNonnumericNode(appFindHighlighCachedResults.continuedAt[l].attr('id'), found);
            }
          }
        }
        return parentNode;
      };
      
      findingParentNode = function (nodeNew, parentNode, found) {
        var appInlineDoc = App.InlineDoc.inlinePrefix;
        var nonNumericNode = appInlineDoc + ':nonnumeric';
        var continuationNode = appInlineDoc + ':continuation';
        var nonFractionNode = appInlineDoc + ':nonfraction';
        continuedNodeId = $(nodeNew).attr('id');
        parentnodeId = findParentIxNonnumericNode(continuedNodeId, found, parentNode);
        parentnodeIdCached = parentnodeId;
        var parentNodeIdParent = parentnodeId.parent();
        var parentNodeIdSecondParentNode = $(parentnodeId).parent().parent()[0];
        var parentNodeIdSecondParentNodeName = $(parentnodeId).parent().parent()[0].nodeName.toLowerCase();
        var nodeNewParent = $(nodeNew).parent();
        nodeNewParentParentnodeId = findParentIxNonnumericNode(nodeNewParent.attr('id'), found, parentNode);
        var nodeNewSecondLevelParent = $(nodeNew).parent().parent();
        var nodeNewParentNodeName = $(nodeNew).parent()[0].nodeName.toLowerCase();
        if (parentnodeId) {
          if (parentNodeIdParent) {
            if (parentNodeIdSecondParentNode) {
              if (parentNodeIdSecondParentNodeName != continuationNode) {
                parentNodeParent = parentNodeIdParent;
                var parentNodeIdParentNode = $(parentnodeId).parent();
                if (parentNodeIdParentNode[0]) {
                  parentNodeParentNodeName = parentNodeIdParentNode[0].nodeName.toLowerCase();
                }
                while (parentNodeParentNodeName != continuationNode) {
                  parentNodeParent = parentNodeParent.parent();
                  var parentNodeParentParentNode = $(parentNodeParent).parent()[0];
                  if (parentNodeParentParentNode) {
                    parentNodeParentNodeName = parentNodeParentParentNode.nodeName.toLowerCase();
                  } else {
                    break;
                  }
                }
                if (parentNodeParentNodeName != continuationNode) {
                  if ((nodeNewParentNodeName == continuationNode)) {
                    parentNodeParent = parentnodeId.parent();
                    var parentnodeIdParentNode = $(parentnodeId).parent()[0];
                    if (parentnodeIdParentNode) {
                      parentNodeParentNodeName = parentnodeIdParentNode.nodeName.toLowerCase();
                    }
                    while (parentNodeParentNodeName != nonNumericNode) {
                      parentNodeParent = parentNodeParent.parent();
                      var parentNodeParentNode = $(parentNodeParent)[0];
                      if (parentNodeParentNode) {
                        parentNodeParentNodeName = parentNodeParentNode.nodeName.toLowerCase();
                      } else {
                        break;
                      }
                    }
                    
                    if (parentNodeParentNodeName != nonNumericNode) {
                      parentnodeId = nodeNewParentParentnodeId;
                    }
                  } else if ((nodeNewSecondLevelParent[0].nodeName.toLowerCase() == continuationNode)) {
                    continuedNodeId = nodeNewSecondLevelParent.attr('id');
                    parentnodeId = findParentIxNonnumericNode(continuedNodeId, found, parentNode);
                  }
                  
                } else {
                  if (nodeNewParentNodeName == continuationNode && nodeNewParent.children().length == 1) {
                    var childNodes = nodeNewParent.children();
                    var childNodeLength = childNodes.length;
                    var childNodeName = "";
                    for (var j = 0; j < childNodeLength; j++) {
                      var jthChildNode = childNodes[j][0];
                      if (jthChildNode) {
                        childNodeName = jthChildNode.nodeName.toLowerCase();
                      }
                      while (childNodeName != nonNumericNode) {
                        childNodes[j] = $(childNodes[j]).children();
                        if ($(childNodes[j])[0]) {
                          childNodeName = childNodes[j][0].nodeName.toLowerCase();
                        } else {
                          break;
                        }
                      }
                    }
                    if (childNodeName.toLowerCase() == nonNumericNode || childNodeName.toLowerCase() == nonFractionNode
                        || childNodeName.toLowerCase() == "") {
                      parentnodeId = parentnodeIdCached;
                      if (childNodeName.toLowerCase() == nonFractionNode) {
                        var parentOfNodeNew = nodeNewParent;
                        var parentOfNodeNewNodeName = parentOfNodeNew[0].nodeName.toLowerCase();
                        while (parentOfNodeNewNodeName != "div") {
                          parentOfNodeNew = parentOfNodeNew.parent();
                          var parentOfNodeNewNode = parentOfNodeNew[0];
                          if (parentOfNodeNewNode) {
                            parentOfNodeNewNodeName = parentOfNodeNewNode.nodeName.toLowerCase();
                          } else {
                            break;
                          }
                        }
                        if (parentOfNodeNewNodeName == "div") {
                          var parentOfNodeNewParentNode = parentOfNodeNew.parent()[0];
                          var parentOfNodeNewParentNodeNodeName = parentOfNodeNew.parent()[0].nodeName.toLowerCase();
                          if (parentOfNodeNewParentNode) {
                            if (parentOfNodeNewParentNodeNodeName != "body"
                                && parentOfNodeNewParentNodeNodeName != "div") {
                              parentnodeId = nodeNewParentParentnodeId;
                            }
                          }
                        }
                        
                      }
                      var childNodeOfCurrentNonNumericNode = parentnodeId.children();
                      var childNodeOfCurrentNonNumeric = childNodeOfCurrentNonNumericNode[0];
                      var childNodeOfCurrentNonNumericNodeNodeName = "";
                      if (childNodeOfCurrentNonNumeric) {
                        childNodeOfCurrentNonNumericNodeNodeName = childNodeOfCurrentNonNumeric.nodeName.toLowerCase();
                      }
                      while (childNodeOfCurrentNonNumericNodeNodeName != "img") {
                        childNodeOfCurrentNonNumericNode = childNodeOfCurrentNonNumericNode.children();
                        childNodeOfCurrentNonNumeric = childNodeOfCurrentNonNumericNode[0];
                        if (childNodeOfCurrentNonNumeric) {
                          childNodeOfCurrentNonNumericNodeNodeName = childNodeOfCurrentNonNumeric.nodeName
                              .toLowerCase();
                        } else
                          break;
                      }
                      if (childNodeOfCurrentNonNumericNodeNodeName == "img") {
                        parentnodeId = childNodeOfCurrentNonNumericNode.next();
                      }
                    } else {
                      parentnodeId = nodeNewParentParentnodeId;
                    }
                  }
                  
                }
                
              }
            }
          }
        }
        allLinkedNodes = App_Find.Element.groupIxContinuation(parentnodeId);
        var positionOfElementsNew = [];
        var allLinkedNodesLength = allLinkedNodes.length;
        for (var i = 0; i < allLinkedNodesLength; i++) {
          positionOfElementsNew.push($(allLinkedNodes[i]).position().top);
        }
        return {
          allLinkedNodes : allLinkedNodes,
          parentnodeId : parentnodeId,
          positionOfElementsNew : positionOfElementsNew
        };
        
      };
      
      function wrapInDashesForContinuationArray (nodeNew, blueImagePath, continuedNodeId, found, parentNode,
          parentnodeId, parentNodeOfContinuation, positionOfElementsNew, parentNodeParent, parentNodeParentNodeName) {
        $(nodeNew)
            .on(
                'click',
                function (event) {
                  
                  frameContentObject
                      .find(
                          '.sec-cbe-highlight-content-selected, .sec-cbe-highlight-filter-content-selected, .sec-cbe-highlight-filter-selected, .sec-cbe-highlight-filter-selected-block, .sec-cbe-highlight-filter-block-content-selected')
                      .removeClass(
                          'sec-cbe-highlight-content-selected sec-cbe-highlight-filter-content-selected sec-cbe-highlight-filter-selected sec-cbe-highlight-filter-selected-block sec-cbe-highlight-filter-block-content-selected');
                  App_Find.Highlight.cachedResults.arrayOfImages = frameContentObject.find('img');
                  // DE462
                  var continuationNode = App.InlineDoc.inlinePrefix + ':continuation';
                  
                  var arrayOfImagesLength = App_Find.Highlight.cachedResults.arrayOfImages.length;
                  for (var j = 0; j < arrayOfImagesLength; j++) {
                    var elementAtJthPositionOfArrayOfImages = App_Find.Highlight.cachedResults.arrayOfImages[j];
                    if (elementAtJthPositionOfArrayOfImages.getAttribute('src') == blueImagePath) {
                      elementAtJthPositionOfArrayOfImages.setAttribute("src", srcImg);
                    }
                  }
                  var findingParentNodeNew = findingParentNode(nodeNew, parentNode, found);
                  allLinkedNodes = findingParentNodeNew.allLinkedNodes;
                  parentnodeId = findingParentNodeNew.parentnodeId;
                  positionOfElementsNew = findingParentNodeNew.positionOfElementsNew;
                  selectionHighlightClickNodes(allLinkedNodes);
                  App_Find.Element.showSelectionDetail(parentnodeId);
                  var positionTop = (allLinkedNodes[0][0]).offsetTop;
                  for (var i = 0, max = allLinkedNodes.length; i < max; i++) {
                    var allLinkedNodesLocal = allLinkedNodes[i];
                    parentNodeOfContinuation = allLinkedNodesLocal.parent();
                    nodeN = parentNodeOfContinuation[0].nodeName.toLowerCase();
                    parentNodeOfContinuation1 = allLinkedNodesLocal.parent();
                    nodeN1 = parentNodeOfContinuation[0].nodeName.toLowerCase();
                    if (positionTop == '0' || positionTop == '1' || positionTop == '2') {
                      var childNode = "";
                      while (nodeN1.toLowerCase() != "td") {
                        parentNodeOfContinuation1 = parentNodeOfContinuation1.parent();
                        if ($(parentNodeOfContinuation1).parent()[0]) {
                          nodeN1 = $(parentNodeOfContinuation1).parent()[0].nodeName.toLowerCase();
                        } else
                          break;
                      }
                      if ($(parentNodeOfContinuation1.parent()).prev()[0]) {
                        if ($(parentNodeOfContinuation1.parent()).prev()[0].nodeName.toLowerCase() == "td") {
                          parentNodeOfContinuation1 = $(parentNodeOfContinuation1.parent().prev()).children().next();
                          while ($(parentNodeOfContinuation1)[0].nodeName.toLowerCase() != "div") {
                            parentNodeOfContinuation1 = $(parentNodeOfContinuation1).next();
                          }
                          // DE565
                          childNode = parentNodeOfContinuation1;
                        }
                      }
                      /*
                       * if($(parentNodeOfContinuation1)[0].nodeName.toLowerCase()=="div"){
                       * childNode=parentNodeOfContinuation1; }
                       */
                      else {
                        while (nodeN.toLowerCase() != "body") {
                          parentNodeOfContinuation = parentNodeOfContinuation.parent();
                          var parentNodeOfContinuationParentNode = $(parentNodeOfContinuation).parent()[0];
                          if (parentNodeOfContinuationParentNode) {
                            nodeN = parentNodeOfContinuationParentNode.nodeName.toLowerCase();
                          } else {
                            break;
                          }
                        }
                        var childNode = parentNodeOfContinuation;
                        if ($(childNode)[0].nodeName.toLowerCase() == continuationNode) {
                          parentNodeOfContinuation = allLinkedNodesLocal.parent();
                          nodeN = parentNodeOfContinuation[0].nodeName.toLowerCase();
                          while (nodeN.toLowerCase() != continuationNode) {
                            parentNodeOfContinuation = parentNodeOfContinuation.parent();
                            var parentNodeOfContinuationParentNode = $(parentNodeOfContinuation).parent()[0];
                            if (parentNodeOfContinuationParentNode) {
                              nodeN = parentNodeOfContinuationParentNode.nodeName.toLowerCase();
                            } else {
                              break;
                            }
                          }
                          childNode = parentNodeOfContinuation;
                        }
                      }
                      var previousOfChildNode = $(childNode).prev()[0];
                      if ((previousOfChildNode)) {
                        if (previousOfChildNode.nodeName.toLowerCase() == "img") {
                          previousOfChildNode.setAttribute("src", blueImagePath);
                        }
                      }
                    } else {
                      var positionTopRearranged = "";
                      for (i = 0, outMax = positionOfElementsNew.length; i < outMax; i++) {
                        for (j = i + 1, inMax = positionOfElementsNew.length; j < inMax; j++) {
                          var positionOfElementsNewJthElement = positionOfElementsNew[j];
                          if (positionOfElementsNewJthElement <= positionOfElementsNew[i]) {
                            positionTopRearranged = positionOfElementsNewJthElement;
                            
                          }
                        }
                      }
                      
                      if (positionTopRearranged != "") {
                        
                        var min_of_array = Math.min.apply(Math, positionOfElementsNew);
                        var newTopPositionNode = "";
                        var occurances = positionOfElementsNew.filter(function (val) {
                          return val === min_of_array;
                        }).length;
                        
                        if (occurances > 1 && min_of_array == $(allLinkedNodes[0]).position().top) {
                          for (var j = 0, max = allLinkedNodes.length; j < max; j++) {
                            var allLinkedNodesForJthLoop = $(allLinkedNodes[j]);
                            if (allLinkedNodesForJthLoop.position().top == min_of_array) {
                              newTopPositionNode = allLinkedNodesForJthLoop;
                            }
                          }
                        } else {
                          for (var j = 0, max = allLinkedNodes.length; j < max; j++) {
                            var allLinkedNodesForJthLoop = $(allLinkedNodes[j]);
                            if (allLinkedNodesForJthLoop.position().top == min_of_array) {
                              newTopPositionNode = allLinkedNodesForJthLoop;
                              break;
                            }
                          }
                        }
                        
                        var prevNodeOfNewTopPositionNode = $(newTopPositionNode[0]).prev()[0];
                        if ((prevNodeOfNewTopPositionNode)) {
                          if ((prevNodeOfNewTopPositionNode.nodeName.toLowerCase() == "img")) {
                            prevNodeOfNewTopPositionNode.setAttribute("src", blueImagePath);
                          }
                        }
                      }
                      var prevNodeOfParentOfParentNodeId = $(parentnodeId).parent().prev()[0];
                      var prevNodeOfParentNodeId = $(parentnodeId).prev()[0];
                      if ((prevNodeOfParentOfParentNodeId)) {
                        if ((prevNodeOfParentOfParentNodeId.nodeName.toLowerCase() == "img")) {
                          prevNodeOfParentOfParentNodeId.setAttribute("src", blueImagePath);
                        }
                      }
                      if ((prevNodeOfParentNodeId)) {
                        if ((prevNodeOfParentNodeId.nodeName.toLowerCase() == "img")) {
                          prevNodeOfParentNodeId.setAttribute("src", blueImagePath);
                        }
                      }
                    }
                  }
                  event.stopPropagation();
                  
                }).on('mousemove', function (event) {
              
              var findingParentNodeNew = findingParentNode(nodeNew, parentNode, found);
              allLinkedNodes = findingParentNodeNew.allLinkedNodes;
              parentnodeId = findingParentNodeNew.parentnodeId;
              positionOfElementsNew = findingParentNodeNew.positionOfElementsNew;
              var flag = true;
              var positionTop = (allLinkedNodes[0][0]).offsetTop;
              selectionHighlightNodes(allLinkedNodes);
              for (var i = 0, max = allLinkedNodes.length; i < max; i++) {
                var allLinkedNodesLocal = allLinkedNodes[i];
                parentNodeOfContinuation = allLinkedNodesLocal.parent();
                nodeN = parentNodeOfContinuation[0].nodeName.toLowerCase();
                if (positionTop == '0' || positionTop == '1' || positionTop == '2') {
                  while (nodeN.toLowerCase() != "body") {
                    parentNodeOfContinuation = parentNodeOfContinuation.parent();
                    var parentNodeOfContinuationParentNode = $(parentNodeOfContinuation).parent()[0];
                    if (parentNodeOfContinuationParentNode) {
                      nodeN = parentNodeOfContinuationParentNode.nodeName.toLowerCase();
                    } else {
                      break;
                    }
                  }
                  var childNode = parentNodeOfContinuation;
                  var previousOfChildNode = $(childNode).prev()[0];
                  if ((previousOfChildNode)) {
                    if (previousOfChildNode.nodeName.toLowerCase() == "img") {
                      if (previousOfChildNode.style.visibility == "hidden") {
                        flag = false;
                      }
                    }
                  }
                } else {
                  var positionTopRearranged = "";
                  for (i = 0, outMax = positionOfElementsNew.length; i < outMax; i++) {
                    for (j = i + 1, inMax = positionOfElementsNew.length; j < inMax; j++) {
                      var positionOfElementsNewJthElement = positionOfElementsNew[j];
                      if (positionOfElementsNewJthElement < positionOfElementsNew[i]) {
                        positionTopRearranged = positionOfElementsNewJthElement;
                        
                      }
                    }
                  }
                  
                  if (positionTopRearranged != "") {
                    var min_of_array = Math.min.apply(Math, positionOfElementsNew);
                    var newTopPositionNode = "";
                    for (var j = 0, max = allLinkedNodes.length; j < max; j++) {
                      var allLinkedNodesForJthLoop = $(allLinkedNodes[j]);
                      if (allLinkedNodesForJthLoop.position().top == min_of_array) {
                        newTopPositionNode = allLinkedNodesForJthLoop;
                        break;
                      }
                    }
                    var prevNodeOfNewTopPositionNode = $(newTopPositionNode[0]).prev()[0];
                    if ((prevNodeOfNewTopPositionNode)) {
                      if ((prevNodeOfNewTopPositionNode.nodeName.toLowerCase() == "img")) {
                        if (prevNodeOfNewTopPositionNode.style.visibility == "hidden") {
                          flag = false;
                        }
                      }
                    }
                    
                  }
                  var prevNodeOfParentOfParentNodeId = $(parentnodeId).parent().prev()[0];
                  var prevNodeOfParentNodeId = $(parentnodeId).prev()[0];
                  if ((prevNodeOfParentOfParentNodeId)) {
                    if ((prevNodeOfParentOfParentNodeId.nodeName.toLowerCase() == "img")) {
                      if (prevNodeOfParentOfParentNodeId.style.visibility == "hidden") {
                        flag = false;
                      }
                    }
                  }
                  if ((prevNodeOfParentNodeId)) {
                    if ((prevNodeOfParentNodeId.nodeName.toLowerCase() == "img")) {
                      if (prevNodeOfParentNodeId.style.visibility == "hidden") {
                        flag = false;
                      }
                    }
                  }
                }
              }
              if (flag == true) {
                if (App_Find.Element.enableTooltip == "enable") {
                  getMouseOverDiv(parentnodeId, null, true);
                  placeMouseOverDiv(event);
                }
              }
              event.stopPropagation();
              
            }).on('mouseout', function (event) {
              var findingParentNodeNew = findingParentNode(nodeNew, parentNode, found);
              allLinkedNodes = findingParentNodeNew.allLinkedNodes;
              $(this).removeHighlightNodes(allLinkedNodes);
              var container = $('#selection-detail-container-mouseOver');
              container.hide();
              event.stopPropagation();
            });
      }
      
      function getHTMLfromCache (xbrId, xbrlValue) {
        if (_htmlHover) {
          if (xbrId == _htmlHover.id && xbrlValue == _htmlHover.xbrlValue) {
            return _htmlHover.html;
          } else {
            return "";
          }
        }
        
      }
      
      function savehtmlDetailsForMouseOver (xbrId, xbrlValue, html) {
        _htmlHover.id = xbrId;
        _htmlHover.xbrlValue = xbrlValue;
        _htmlHover.html = html;
      }
      
      function getMouseOverDiv (ele, node, isContinuedAt) {
        var id = ele.attr('name');
        var xbrId = App_Utils.convertToXBRLId(id);
        
        var container = $('#selection-detail-container-mouseOver');
        var maxValueTextLength = 50;
        
        container.find('[data-content="label"]').html('');
        // xbrl value
        var xbrlValue = 'N/A';
        var nodeName = ele[0].nodeName.toLowerCase();
        if (nodeName == App.InlineDoc.inlinePrefix + ':nonfraction') {
          
          xbrlValue = ele.getXbrlValue();
          xbrlValue = App_Utils.addCommas(xbrlValue);
        } else if (nodeName == App.InlineDoc.inlinePrefix + ':nonnumeric') {
          
          xbrlValue = ele.htmlDecode(ele.text());
          if (ele.attr('format')) {
            xbrlValue = App_Utils.applyFormat(ele);
          }
          if (xbrlValue.length > maxValueTextLength) {
            
            xbrlValue = xbrlValue.trim().substring(0, maxValueTextLength) + '...';
          }
        }
        
        if (!xbrlValue) {
          var selectedlabelval = App.InlineDoc.getSelectedLabel(xbrId, this, null, function (value) {
            
            container.find('[data-content="label"]').html(value);
          });
        } else if (xbrlValue.length < 15) {
          if (!isContinuedAt) {
            if (node.attr('continuedat') != null) {
              var continuedAt = ele.attr('continuedAt');
              for (var i = 0, max = App_Find.Highlight.cachedResults.continuedAt.length; i < max; i++) {
                
                if (continuedAt == App_Find.Highlight.cachedResults.continuedAt[i].attr('id')) {
                  xbrlValue = xbrlValue + " " + App_Find.Highlight.cachedResults.continuedAt[i].text();
                  xbrlValue = xbrlValue.trim().substring(0, maxValueTextLength) + '...';
                  break;
                }
                
              }
            } else {
              container.find('[data-content="label"]').html(xbrlValue);
            }
          } else {
            var continuedAt = ele.attr('continuedAt');
            for (var i = 0, max = App_Find.Highlight.cachedResults.continuedAt.length; i < max; i++) {
              
              if (continuedAt == App_Find.Highlight.cachedResults.continuedAt[i].attr('id')) {
                xbrlValue = xbrlValue + " " + App_Find.Highlight.cachedResults.continuedAt[i].text();
                xbrlValue = xbrlValue.trim().substring(0, maxValueTextLength) + '...';
                container.find('[data-content="label"]').html(xbrlValue);
                break;
              }
              
            }
          }
          
        } else {
          container.find('[data-content="label"]').html(xbrlValue);
        }
        var html = getHTMLfromCache(xbrId, xbrlValue);
        if (!html) {
          html = '<table class="table-framed-onHover">';
          if (!id) {
            
            id = 'N/A';
          }
          var tag = ele.htmlDecode(id);
          if (tag.substring(0, 8) == App.InlineDoc.standardTaxonomy) {
            tag = "<span style='white-space:nowrap;'>" + App.InlineDoc.standardTaxonomy + ":" + "</span>"
                + tag.substring(8);
          }
          html += '<tr><td width="55px">Tag:</td><td><div class="wordBreakDiv">' + tag + '</div></td></tr>';
          
          // calendar
          var contextRef = ele.attr('contextRef');
          if (!contextRef) {
            
            contextRef = 'N/A';
          } else {
            
            var context = App.InlineDoc.getContext(contextRef);
            if (context) {
              if (context.length == 1) {
                
                contextRef = context.calendarFriendlyName();
              }
            }
          }
          html += '<tr><td width="55px">Period:</td><td><div class="wordBreakDiv">' + ele.htmlDecode(contextRef)
              + '</div></td></tr>';
          
          // unit
          var unit = 'N/A';
          var unitRef = ele.attr('unitRef');
          if (unitRef) {
            var u = App.InlineDoc.getUnitById(unitRef);
            if (u.length > 0) {
              unit = u.unitFriendlyName();
            }
          }
          if (unit != 'N/A') {
            html += '<tr><td width="55px">Measure:</td><td><div class="wordBreakDiv">' + unit + '</div></td></tr>';
          }
          if (ele.scaleFriendlyName() != 'N/A') {
            html += '<tr><td width="55px">Scale:</td><td><div class="wordBreakDiv">' + ele.scaleFriendlyName()
                + '</div></td></tr>';
          }
          if (ele.precisionFriendlyName() != 'N/A') {
            html += '<tr><td width="55px">Decimals:</td><td><div class="wordBreakDiv">' + ele.precisionFriendlyName()
                + '</div></td></tr>';
          }
          // type
          var typeHTML = '';
          html += '</table>';
          
          savehtmlDetailsForMouseOver(xbrId, xbrlValue, html);
          
        }
        
        $('#selection-detail-container-mouseOver').find('[data-content="attributes"]').html(html);
        container.show();
        
      }
      
      function placeMouseOverDiv (event) {
        var container = $('#selection-detail-container-mouseOver');
        var panel = $('#app-panel1');
        var panel2 = $('#app-panel2');
        var marginLeft = event.clientX;
        var marginTop = event.clientY + 35;
        var panelWidth = 0;
        
        if (panel.hasClass("visible") || panel2.hasClass("visible")) {
          panelWidth = (30 / 100) * (screen.width);
        }
        
        if (screen.width > 1600 && screen.width < 1921) {
          if (event.clientX > (screen.width - 1400)) {
            var marginLeft = (event.clientX - container.width()) + panelWidth - 5;
          } else {
            if (panel.hasClass("visible") || panel2.hasClass("visible")) {
              var marginLeft = (event.clientX - container.width()) + panelWidth;
            }
          }
        }
        if (screen.width > 1440 && screen.width < 1601) {
          if (event.clientX > (screen.width - 1200)) {
            var marginLeft = (event.clientX - container.width()) + panelWidth - 5;
          } else {
            if (panel.hasClass("visible") || panel2.hasClass("visible")) {
              var marginLeft = (event.clientX - container.width()) + panelWidth;
            }
          }
          
        }
        if (screen.width > 1366 && screen.width < 1441) {
          
          if (event.clientX > (screen.width - 1000)) {
            var marginLeft = (event.clientX - container.width()) + panelWidth - 5;
          } else {
            if (panel.hasClass("visible") || panel2.hasClass("visible")) {
              var marginLeft = (event.clientX - container.width()) + panelWidth;
            }
          }
        }
        if (screen.width > 1280 && screen.width < 1367) {
          if (event.clientX > (screen.width - 900)) {
            var marginLeft = (event.clientX - container.width()) + panelWidth - 5;
          } else {
            if (panel.hasClass("visible") || panel2.hasClass("visible")) {
              var marginLeft = (event.clientX - container.width()) + panelWidth;
            }
          }
        }
        if (screen.width > 1024 && screen.width < 1281) {
          if (event.clientX > (screen.width - 800)) {
            var marginLeft = (event.clientX - container.width()) + panelWidth - 5;
          } else {
            if (panel.hasClass("visible") || panel2.hasClass("visible")) {
              var marginLeft = (event.clientX - container.width()) + panelWidth;
            }
          }
        }
        if (screen.width < 1025) {
          if (event.clientX > (screen.width - 600)) {
            var marginLeft = (event.clientX - container.width()) + panelWidth - 5;
          } else {
            if (panel.hasClass("visible") || panel2.hasClass("visible")) {
              var marginLeft = (event.clientX - container.width()) + panelWidth;
            }
          }
        }
        
        if ($('#filterDataDiv').height() > 0) {
          if (event.clientY > (screen.height - 500)) {
            var marginTop = ((event.clientY) - container.height()) + $('#filterDataDiv').height() + 25;
          } else {
            var marginTop = ((event.clientY + $('#filterDataDiv').height())) + 35;
          }
        } else {
          if (event.clientY > (screen.height - 500)) {
            var marginTop = (event.clientY - container.height()) + 25;
          }
        }
        
        container.css('margin-left', marginLeft + 'px');
        container.css('margin-top', marginTop + 'px');
      }
      
      function wrapLinkedHidden (ele, node, cls, spanNode) {
        if (App_Find.Highlight.cachedResults.linkedHiddenNodes.length > 0) {
          var id = "";
          // var spanNodes = App.InlineDoc.getLinkedHiddenElements();
          spanNodes = App_Find.Highlight.cachedResults.linkedHiddenNodes;
          var spanNodesLength = spanNodes.length;
          if (spanNodes) {
            for (var i = 0; i < spanNodesLength; i++) {
              if (spanNodes[i][0].trim() == node.attr('id')) {
                $(spanNodes[i][1][0]).addClass(cls);
                $(spanNodes[i][1][0]).addClass('sec-cbe-highlight-dashed');
                $(spanNodes[i][1][0]).on(
                    'click',
                    function (evt) {
                      
                      $('#about-modal').dialog("close");
                      frameContentObject.find('.sec-cbe-highlight-filter-selected').removeClass(
                          'sec-cbe-highlight-filter-selected');
                      
                      $(spanNode).addClass('sec-cbe-highlight-dashed');
                      if ($(spanNode).hasClass('sec-cbe-highlight-dashed')
                          || $(spanNode).hasClass('sec-cbe-highlight-filter')) {
                        var index = $(spanNode).attr('data-result-index');
                        App_Find.Results.highlightItem(index); // highlight the
                        // result item
                        
                        $($(this)[0]).selectionHighlightHiddenNodes();
                        
                        $(spanNode).children(':first').each(function () {
                          App_Find.Element.showSelectionDetail(node);
                        });
                        evt.stopPropagation();
                      }
                      
                    }).on(
                    'mousemove',
                    function (event) {
                      $(this).addClass('sec-cbe-highlight-content-selected');
                      if (App_Find.Element.enableTooltip == "enable") {
                        if ($(spanNode).hasClass('sec-cbe-highlight-dashed')
                            || $(spanNode).hasClass('sec-cbe-highlight-dashed-highlight')
                            || $(spanNode).hasClass('sec-cbe-highlight-filter')) {
                          $(spanNode).children(':first').each(function () {
                            getMouseOverDiv(ele, node, false);
                            
                          });
                        }
                        placeMouseOverDiv(event);
                      }
                      event.stopPropagation();
                    }).on('mouseout', function () {
                  $(this).removeClass('sec-cbe-highlight-content-selected');
                  var container = $('#selection-detail-container-mouseOver');
                  container.hide();
                });
                
              }
            }
          }
        }
      }
      function identical (array) {
        var arraylength = array.length;
        for (var i = 0; i < arraylength - 1; i++) {
          if (array[i] !== array[i + 1]) {
            return false;
          }
        }
        return true;
      }
      function applyBackgroundcolrOnallChildNodes (node) {
        var childnodes = $(node).children();
        var childrenLength = childnodes.length;
        for (var i = 0; i < childrenLength; i++) {
          var ithChildNode = $(childnodes[i]);
          ithChildNode.addClass('sec-cbe-highlight-content-selected');
          applyBackgroundcolrOnallChildNodes(ithChildNode);
        }
      }
      function applyBackgroundcolrOnallChildNodesOnClick (node) {
        var childnodes = $(node).children();
        var childrenLength = childnodes.length;
        for (var i = 0; i < childrenLength; i++) {
          var ithChildNode = $(childnodes[i]);
          ithChildNode.addClass('sec-cbe-highlight-filter-block-content-selected');
          applyBackgroundcolrOnallChildNodesOnClick(ithChildNode);
        }
      }
      function removeBackgroundcolrFromallChildNodes (node) {
        var childnodes = $(node).children();
        var childrenLength = childnodes.length;
        for (var i = 0; i < childrenLength; i++) {
          var ithChildNode = $(childnodes[i]);
          ithChildNode.removeClass('sec-cbe-highlight-content-selected');
          removeBackgroundcolrFromallChildNodes(ithChildNode);
        }
      }
      function wrapInDashesTraditional (elem, blueImagePath, highlightType, index, ele, node, nodeName, spanNode, cls,
          nonNumericNode, xbrId, instanceXbrlType) {
        // var spanNodeTraditional=$(spanNode);
        var nodeTraditional = node[0];
        var nonNumericNodeElement = App.InlineDoc.inlinePrefix + ':nonnumeric';
        if (!node.parent().hasClass('sec-cbe-highlight-dashed')) {
          if (nonNumericNode) {
            if (instance && instanceXbrlType) { // it was a textBlock
              cls = 'sec-cbe-highlight-block';
            } else { // does it have element descendants
              $(nodeTraditional).find('*').each(function () { // and there was a
                // display:block
                // in there
                if ($(this).css('display') == 'block') {
                  cls = 'sec-cbe-highlight-block';
                  return false;
                }
              });
              if (cls == 'sec-cbe-highlight-inline') { // last ditch effort
                // based on current
                // display only
                var text = " ";
                var children = $(node).children();
                var childrenLength = children.length;
                if (childrenLength > 0) {
                  var x = children[childrenLength - 1].textContent;
                  if (x == '\xa0') { // Non-breakable space is char 0xa0 (160
                    // dec)
                    var x = nodeTraditional.lastChild;
                    nodeTraditional.removeChild(x);
                  }
                }
                /*
                 * else{ text = $(node)[0].textContent; } var match =
                 * /\n/.exec(text); if(match){ cls ==
                 * 'sec-cbe-highlight-inline'; } else{
                 */
                rects = (nodeTraditional).getClientRects();
                var top = [];
                var bottom = [];
                for (i = 0; i < rects.length; i++) {
                  var rect = rects[i];
                  top.push(rect.top);
                  bottom.push(rect.bottom);
                }
                if (rects.length > 1 && !identical(top) && !identical(bottom)) { // it
                  // is
                  // drawn
                  // in
                  // two
                  // rectangles,
                  // it
                  // had
                  // to
                  // be a
                  // block.
                  cls = 'sec-cbe-highlight-block';
                }
                // }
              }
            }
          }
          var parentNode = node.parent()[0];
          if (parentNode.nodeName.toLowerCase() == 'span') // .search(App.InlineDoc.inlinePrefix)!=0
          {
            var isonly = parentNode.childNodes.length == 1;
            if (isonly) {
              spanNode = parentNode;
            } // no need to wrap.
          }
          if (spanNode == null) {
            var nilPadding = '&#160;';
            node.wrap('<span>' + ((node.attr('xsi:nil') == 'true') ? nilPadding : '') + '</span>');
            spanNode = node.parent()[0];
          }
          if (navigator.userAgent.match(/iPhone/i)) {
            setTimeout(function () {
              $(spanNode).addClass('sec-cbe-highlight-dashed');
            }, 0);
            if (cls === 'sec-cbe-highlight-block') {
              setTimeout(function () {
                $(spanNode).addClass('sec-cbe-highlight-block');
              }, 0);
            } else {
              setTimeout(function () {
                $(spanNode).addClass('sec-cbe-highlight-inline');
              }, 0);
            }
            if (nonNumericNode) {
              if (cls === 'sec-cbe-highlight-block') {
                setTimeout(function () {
                  $(spanNode).addClass('sec-cbe-highlight-dashed_block');
                }, 0);
              }
            }
            
          } else {
            setTimeout(function () {
              $(spanNode).addClass('sec-cbe-highlight-dashed');
            }, 10);
            if (cls === 'sec-cbe-highlight-block') {
              setTimeout(function () {
                $(spanNode).addClass('sec-cbe-highlight-block');
              }, 10);
            } else {
              $(spanNode).addClass('sec-cbe-highlight-inline');
            }
            if (highlightType == "calculation" || highlightType == "amount" || highlightType == "sign"
                || highlightType == "hidden") {
              App_Find.Highlight.cachedResults.arrayOfImages = frameContentObject.find('img');
              var arrayOfImagesLength = App_Find.Highlight.cachedResults.arrayOfImages.length;
              for (var i = 0; i < arrayOfImagesLength; i++) {
                var elementAtIthPositionOfArrayOfImages = App_Find.Highlight.cachedResults.arrayOfImages[i];
                if ((elementAtIthPositionOfArrayOfImages.getAttribute('src') == srcImg)
                    || (elementAtIthPositionOfArrayOfImages.getAttribute('src') == blueImagePath)) {
                  elementAtIthPositionOfArrayOfImages.style.visibility = "hidden";
                }
              }
            } else {
              if (nonNumericNode) {
                if (cls === 'sec-cbe-highlight-block') {
                  setTimeout(function () {
                    $(spanNode).addClass('sec-cbe-highlight-dashed_block');
                    var imageId = ele.attr('id') + "imageid";
                    if (!checkIfImageAlreadyExists(imageId)) {
                      elem.setAttribute("src", srcImg);
                      elem.setAttribute("id", imageId);
                      elem.setAttribute("width", "3");
                      elem.setAttribute("height", "13");
                      elem.setAttribute("align", "left");
                      $(elem).insertBefore(node);
                    }
                  }, 10);
                }
              }
            }
          }
          setTimeout(function () {
            if (nodeName == nonNumericNodeElement) {
              if (cls === 'sec-cbe-highlight-block') {
                if ($(ele).children()) {
                  element = $(ele).children();
                  var elementLength = element.length;
                  for (j = 0; j < elementLength; j++) {
                    var jthElementNode = $(element[j])[0];
                    nodeNew = jthElementNode.nodeName;
                    jthElementNode.style.clear = "none";
                    jthElementNode.style.textIndent = "0pt";
                    while (nodeNew.toLowerCase() != "body") {
                      element[j] = $(element[j]).parent();
                      jthElementNode = $(element[j])[0];
                      jthElementNode.style.textIndent = "0pt";
                      jthElementNode.style.clear = "none";
                      if ($(element[j]).parent()[0]) {
                        nodeNew = $(element[j]).parent()[0].nodeName;
                        
                      }
                    }
                  }
                }
              }
            }
          }, 10);
          $(elem).on(
              'click',
              function (evt) {
                $('#about-modal').dialog("close");
                frameContentObject.find('.sec-cbe-highlight-filter-selected').removeClass(
                    'sec-cbe-highlight-filter-selected');
                App_Find.Highlight.cachedResults.arrayOfImages = frameContentObject.find('img');
                var arrayOfImagesLength = App_Find.Highlight.cachedResults.arrayOfImages.length;
                for (var i = 0; i < arrayOfImagesLength; i++) {
                  var elementAtIthPositionOfArrayOfImages = App_Find.Highlight.cachedResults.arrayOfImages[i];
                  if (elementAtIthPositionOfArrayOfImages.getAttribute('src') == blueImagePath) {
                    elementAtIthPositionOfArrayOfImages.setAttribute("src", srcImg);
                  }
                }
                
                if (nodeName == nonNumericNodeElement) {
                  if ($(spanNode).hasClass('sec-cbe-highlight-block')) {
                    $(spanNode).addClass('sec-cbe-highlight-dashed_block');
                  }
                }
                if ($(spanNode).hasClass('sec-cbe-highlight-dashed')
                    || $(spanNode).hasClass('sec-cbe-highlight-filter')) {
                  var index = $(this).attr('data-result-index');
                  App_Find.Results.highlightItem(index); // highlight the
                  // result item
                  // var allLinkedNodes=[];
                  if (nodeName == nonNumericNodeElement) {
                    if ($(spanNode).hasClass('sec-cbe-highlight-block')) {
                      $(elem).attr("src",
                          getImagePath + App_Settings.get('focusHighlightSelectionColorCode') + "_img.png");
                      elem.setAttribute("src", blueImagePath);
                      $(spanNode).children(':first').selectionHighlightNodesOnClick();
                      frameContentObject.find(
                          '.sec-cbe-highlight-content-selected, .sec-cbe-highlight-filter-content-selected')
                          .removeClass('sec-cbe-highlight-content-selected sec-cbe-highlight-filter-content-selected');
                      $(spanNode).addClass('sec-cbe-highlight-filter-content-selected');
                    } else {
                      $(spanNode).children(':first').selectionHighlight();
                    }
                    
                    $(spanNode).children(':first').each(function () {
                      App_Find.Element.showSelectionDetail(node);
                    });
                  }
                  
                  evt.stopPropagation();
                }
              }).on(
              'mousemove',
              function (event) {
                if (App_Find.Element.enableTooltip == "enable") {
                  if (nodeName == nonNumericNodeElement) {
                    if ($(spanNode).hasClass('sec-cbe-highlight-block')) {
                      $(spanNode).addClass('sec-cbe-highlight-dashed_block');
                    }
                  }
                  if ($(spanNode).hasClass('sec-cbe-highlight-dashed')
                      || $(spanNode).hasClass('sec-cbe-highlight-filter')) {
                    $(spanNode).children(':first').each(function () {
                      getMouseOverDiv(ele, node, false);
                    });
                  }
                  
                  placeMouseOverDiv(event);
                  event.stopPropagation();
                }
                
              }).on('mouseout', function () {
            var container = $('#selection-detail-container-mouseOver');
            container.hide();
          });
          if (App_Find.Highlight.cachedResults.linkedHiddenNodes.length > 0) {
            if (node.attr('id') && ele.isHidden()) {
              wrapLinkedHidden(ele, node, cls, spanNode);
            }
          }
          $(spanNode)
              .attr('data-result-index', index)
              .on(
                  'click',
                  function (evt) {
                    $('#about-modal').dialog("close");
                    App_Find.Highlight.cachedResults.arrayOfImages = App.frame.contents().find('img');
                    var arrayOfImagesLength = App_Find.Highlight.cachedResults.arrayOfImages.length;
                    // var srcImg =
                    // getImagePath()+App_Settings.get('elementBorderColorCode')+"_img.png";
                    for (var i = 0; i < arrayOfImagesLength; i++) {
                      if (App_Find.Highlight.cachedResults.arrayOfImages[i].getAttribute('src') == blueImagePath) {
                        App_Find.Highlight.cachedResults.arrayOfImages[i].setAttribute("src", srcImg);
                      }
                    }
                    var currentNode = $(this);
                    if (currentNode.hasClass('sec-cbe-highlight-dashed')
                        || currentNode.hasClass('sec-cbe-highlight-dashed-highlight')
                        || currentNode.hasClass('sec-cbe-highlight-filter')) {
                      
                      frameContentObject
                          .find(
                              '.sec-cbe-highlight-filter-selected, .sec-cbe-highlight-filter-selected-block, .sec-cbe-highlight-filter-block-content-selected')
                          .removeClass(
                              'sec-cbe-highlight-filter-selected sec-cbe-highlight-filter-selected-block sec-cbe-highlight-filter-block-content-selected');
                      var index = currentNode.attr('data-result-index');
                      App_Find.Results.highlightItem(index); // highlight the
                      // result item
                      if (nodeName == App.InlineDoc.inlinePrefix + ':nonnumeric') {
                        if (currentNode.hasClass('sec-cbe-highlight-block')) {
                          currentNode.children(':first').selectionHighlightForBlock();
                          var str1 = null;
                          if ($(node).prev().attr('src')) {
                            str1 = $(node).prev().attr('src');
                            if (str1) {
                              $(node).prev()[0].setAttribute("src", blueImagePath);
                            }
                          } else {
                            str1 = $(node).parent().prev().attr('src');
                            if (str1) {
                              $(node).parent().prev()[0].setAttribute("src", blueImagePath);
                            }
                          }
                        } else if (currentNode.hasClass('sec-cbe-highlight-inline')) {
                          frameContentObject.find('.sec-cbe-highlight-filter-content-selected').removeClass(
                              'sec-cbe-highlight-filter-content-selected');
                          currentNode.addClass('sec-cbe-highlight-filter-content-selected');
                          currentNode.children(':first').selectionHighlight();
                        }
                        currentNode.children(':first').each(function () {
                          App_Find.Element.showSelectionDetail($(node));
                        });
                      } else {
                        frameContentObject
                            .find('.sec-cbe-highlight-content-selected, .sec-cbe-highlight-filter-content-selected')
                            .removeClass('sec-cbe-highlight-content-selected sec-cbe-highlight-filter-content-selected');
                        currentNode.addClass('sec-cbe-highlight-filter-content-selected');
                        currentNode.children(':first').selectionHighlight();
                        currentNode.children(':first').each(function () {
                          App_Find.Element.showSelectionDetail($(this));
                        });
                      }
                      evt.stopPropagation();
                    }
                  }).on(
                  'mousemove',
                  function (event) {
                    var nonNumericNodeElement = App.InlineDoc.inlinePrefix + ':nonnumeric';
                    var currentNode = $(this);
                    if (nodeName == nonNumericNodeElement) {
                      if (currentNode.hasClass('sec-cbe-highlight-block')) {
                        currentNode.addClass('sec-cbe-highlight-content-selected');
                      } else {
                        currentNode.addClass('sec-cbe-highlight-content-selected');
                        applyBackgroundcolrOnallChildNodes(this);
                      }
                    } else {
                      currentNode.addClass('sec-cbe-highlight-content-selected');
                      applyBackgroundcolrOnallChildNodes(this);
                    }
                    if (App_Find.Element.enableTooltip == "enable") {
                      
                      if (currentNode.hasClass('sec-cbe-highlight-dashed')
                          || currentNode.hasClass('sec-cbe-highlight-dashed-highlight')
                          || currentNode.hasClass('sec-cbe-highlight-filter')) {
                        currentNode.children(':first').each(function () {
                          getMouseOverDiv(ele, node, false);
                          
                        });
                      }
                      
                      placeMouseOverDiv(event);
                      
                    }
                    event.stopPropagation();
                    
                  }).on('mouseout', function () {
                var currentNode = $(this);
                var nonNumericNodeElement = App.InlineDoc.inlinePrefix + ':nonnumeric';
                if (nodeName == nonNumericNodeElement) {
                  if (node.attr('continuedAt') != null) {
                    currentNode.removeHighlightNodes(allLinkedNodes);
                  } else if (currentNode.hasClass('sec-cbe-highlight-block')) {
                    currentNode.removeClass('sec-cbe-highlight-content-selected');
                    removeBackgroundcolrFromallChildNodes(this);
                  } else {
                    currentNode.removeClass('sec-cbe-highlight-content-selected');
                    removeBackgroundcolrFromallChildNodes(this);
                  }
                } else {
                  currentNode.removeClass('sec-cbe-highlight-content-selected');
                  removeBackgroundcolrFromallChildNodes(this);
                }
                
                var container = $('#selection-detail-container-mouseOver');
                container.hide();
              }).on(
                  'mouseenter',
                  function (event) {
                    var currentNode = $(this);
                    var nonNumericNodeElement = App.InlineDoc.inlinePrefix + ':nonnumeric';
                    if (nodeName == nonNumericNodeElement) {
                      if (ele.attr('continuedat') != null) {
                        ele.removeClass('sec-cbe-highlight-dashed');
                        ele.removeClass('sec-cbe-highlight-dashed_block');
                        selectionHighlightNodes(allLinkedNodes);
                      } else if (currentNode.hasClass('sec-cbe-highlight-block')) {
                        currentNode.addClass('sec-cbe-highlight-content-selected');
                      }
                    }
                    if (App_Find.Element.enableTooltip == "enable") {
                      
                      if (currentNode.hasClass('sec-cbe-highlight-dashed')
                          || currentNode.hasClass('sec-cbe-highlight-filter')) {
                        currentNode.children(':first')
                            .each(
                                function () {
                                  
                                  var container = $('#selection-detail-container-mouseOver');
                                  var maxValueTextLength = 50;
                                  var id = ele.attr('name');
                                  var xbrId = App_Utils.convertToXBRLId(id);
                                  var container = $('#selection-detail-container-mouseOver');
                                  container.find('[data-content="label"]').html('');
                                  html = '<table class="table-framed-onHover">';
                                  
                                  // xbrl value
                                  var xbrlValue = 'N/A';
                                  var nodeName = ele[0].nodeName.toLowerCase();
                                  if (nodeName == App.InlineDoc.inlinePrefix + ':nonfraction') {
                                    xbrlValue = ele.getXbrlValue();
                                    if (ele.attr('format') && xbrlValue == "-") {
                                      xbrlValue = App_Utils.applyFormat(ele);
                                    }
                                    xbrlValue = App_Utils.addCommas(xbrlValue);
                                  } else if (nodeName == nonNumericNode) {
                                    
                                    xbrlValue = ele.htmlDecode(ele.text());
                                    if (ele.attr('format')) {
                                      xbrlValue = App_Utils.applyFormat(ele);
                                    }
                                    if (xbrlValue.length > maxValueTextLength) {
                                      
                                      xbrlValue = xbrlValue.trim().substring(0, maxValueTextLength) + '...';
                                    }
                                  }
                                  if (!xbrlValue) {
                                    var selectedlabelval = App.InlineDoc.getSelectedLabel(xbrId, this, null, function (
                                        value) {
                                      
                                      container.find('[data-content="label"]').html(value);
                                    });
                                  } else if (xbrlValue.length < 15) {
                                    if (node.attr('continuedat') != null) {
                                      var continuedAt = ele.attr('continuedAt');
                                      for (var i = 0; i < App_Find.Highlight.cachedResults.continuedAt.length; i++) {
                                        
                                        if (continuedAt == App_Find.Highlight.cachedResults.continuedAt[i].attr('id')) {
                                          xbrlValue = xbrlValue + " "
                                              + App_Find.Highlight.cachedResults.continuedAt[i].text();
                                          xbrlValue = xbrlValue.trim().substring(0, maxValueTextLength) + '...';
                                          container.find('[data-content="label"]').html(xbrlValue);
                                          break;
                                        }
                                        
                                      }
                                    } else {
                                      container.find('[data-content="label"]').html(xbrlValue);
                                    }
                                    
                                  } else {
                                    container.find('[data-content="label"]').html(xbrlValue);
                                  }
                                  if (!id) {
                                    
                                    id = 'N/A';
                                  }
                                  var tag = ele.htmlDecode(id);
                                  if (tag.substring(0, 8) == App.InlineDoc.standardTaxonomy) {
                                    tag = "<span style='white-space:nowrap;'>" + App.InlineDoc.standardTaxonomy + ":"
                                        + "</span>" + tag.substring(8);
                                  }
                                  html += '<tr><td width="55px">Tag</td><td><div class="wordBreakDiv">' + tag
                                      + '</div></td></tr>';
                                  
                                  // calendar
                                  var contextRef = ele.attr('contextRef');
                                  if (!contextRef) {
                                    
                                    contextRef = 'N/A';
                                  } else {
                                    
                                    var context = App.InlineDoc.getContext(contextRef);
                                    if (context) {
                                      if (context.length == 1) {
                                        
                                        contextRef = context.calendarFriendlyName();
                                      }
                                    }
                                  }
                                  html += '<tr><td width="55px">Period</td><td><div class="wordBreakDiv">'
                                      + ele.htmlDecode(contextRef) + '</div></td></tr>';
                                  
                                  // unit
                                  var unit = 'N/A';
                                  var unitRef = ele.attr('unitRef');
                                  if (unitRef) {
                                    var u = App.InlineDoc.getUnitById(unitRef);
                                    if (u.length > 0) {
                                      unit = u.unitFriendlyName();
                                    }
                                  }
                                  if (unit != 'N/A') {
                                    html += '<tr><td width="55px">Measure</td><td><div class="wordBreakDiv">' + unit
                                        + '</div></td></tr>';
                                  }
                                  if (ele.scaleFriendlyName() != 'N/A') {
                                    html += '<tr><td width="55px">Scale</td><td><div class="wordBreakDiv">'
                                        + ele.scaleFriendlyName() + '</div></td></tr>';
                                  }
                                  if (ele.precisionFriendlyName() != 'N/A') {
                                    html += '<tr><td width="55px">Decimals</td><td><div class="wordBreakDiv">'
                                        + ele.precisionFriendlyName() + '</div></td></tr>';
                                  }
                                  // type
                                  var typeHTML = '';
                                  html += '</table>';
                                  $('#selection-detail-container-mouseOver').find('[data-content="attributes"]').html(
                                      html);
                                  container.show();
                                  
                                  // App_Find.Element.showSelectionDetailOnHover($(this),event);
                                });
                      }
                      placeMouseOverDiv(event);
                      event.stopPropagation();
                    }
                    
                  });
        }
      }
      function childrenOfLastNodeFunction (node) {
        var childnodes = $(node).children();
        var childrenLength = childnodes.length;
        if (childrenLength > "1") {
          childnodes = childrenOfLastNodeFunction((childnodes[childrenLength - 1]));
        } else {
          return childnodes;
        }
        return childnodes;
      }
      function insertImageForNonNumericNodes (imageId, difference, elem, nodeNew, positionOfElementsNew, element,
          positionTop, parentNodeOfContinuation, childNode, positionTopRearranged, lengthofContinuedNodes,
          childrenOfsecondNode, childrenOfsecondNodelength, childrenOfTopNode, childrenOfTopNodelength, allLinkedNodes,
          count, intId, timeout, userAgent, documentWidth, tdCount) {
        var hiddenNode = App.InlineDoc.inlinePrefix + ':hidden';
        var continuationNode = App.InlineDoc.inlinePrefix + ':continuation';
        var allLinkedNodesZerothElementLocal = $(allLinkedNodes[0]);
        var parentNodeOfCurrentNode = allLinkedNodesZerothElementLocal.parent();
        if (parentNodeOfCurrentNode[0]) {
          parentNodeOfCurrentNodeName = parentNodeOfCurrentNode[0].nodeName.toLowerCase();
        }
        while (parentNodeOfCurrentNodeName != "div") {
          parentNodeOfCurrentNode = parentNodeOfCurrentNode.parent();
          if (parentNodeOfCurrentNode[0]) {
            parentNodeOfCurrentNodeName = parentNodeOfCurrentNode[0].nodeName.toLowerCase();
          } else
            break;
        }
        if (allLinkedNodesZerothElementLocal.parent()[0].nodeName.toLowerCase() != "img"
            && parentNodeOfCurrentNodeName == "div") {
          if ($(parentNodeOfCurrentNode)) {
            $(parentNodeOfCurrentNode)[0].style.paddingLeft = "0px";
            $(parentNodeOfCurrentNode)[0].style.textIndent = "0pt";
          }
        }
        for (var i = 0; i < lengthofContinuedNodes; i++) {
          var allLinkedNodesLocal = $(allLinkedNodes[i]);
          if (allLinkedNodesLocal[0].nodeName.toLowerCase() == continuationNode) {
            if (allLinkedNodesLocal.children()[0]) {
              if (allLinkedNodesLocal.children()[0].nodeName.toLowerCase() == "div") {
                allLinkedNodesLocal.children()[0].style.textIndent = "0pt";
              }
            }
            if (allLinkedNodesLocal.parent()[0]) {
              if (allLinkedNodesLocal.parent()[0].nodeName.toLowerCase() == "div") {
                allLinkedNodesLocal.parent()[0].style.textIndent = "0pt";
              }
            }
          }
          
          if (userAgent.match(/iPhone/i)) {
            positionOfElementsNew.push($(allLinkedNodes[i]).offsetTop);
          } else {
            positionOfElementsNew.push($(allLinkedNodes[i]).position().top);
          }
        }
        parentNodeOfContinuationNode = allLinkedNodes[0].parent();
        nodeNameparentNodeOfContinuationNode = parentNodeOfContinuationNode[0].nodeName.toLowerCase();
        while (nodeNameparentNodeOfContinuationNode != hiddenNode) {
          parentNodeOfContinuationNode = parentNodeOfContinuationNode.parent();
          var parentNodeOfContinuation = $(parentNodeOfContinuationNode)[0];
          if (parentNodeOfContinuation) {
            nodeNameparentNodeOfContinuationNode = parentNodeOfContinuation.nodeName.toLowerCase();
          } else
            break;
        }
        if (nodeNameparentNodeOfContinuationNode != hiddenNode) {
          // var allLinkedNodesArrayLength=allLinkedNodes.length;
          for (var i = 0; i < lengthofContinuedNodes; i++) {
            var allLinkedNodesLocal = allLinkedNodes[i];
            var allLinkedNodesLocalParent = allLinkedNodesLocal.parent();
            var allLinkedNodesLocalParentNodeName = allLinkedNodesLocalParent[0].nodeName.toLowerCase();
            parentNodeOfContinuation1 = allLinkedNodesLocalParent;
            parentNodeOfContinuation = allLinkedNodesLocalParent;
            nodeN1 = allLinkedNodes[i].parent()[0].nodeName.toLowerCase();
            nodeN = allLinkedNodes[i].parent()[0].nodeName.toLowerCase();
            if ($(allLinkedNodes[lengthofContinuedNodes - 1])[0].nodeName.toLowerCase() == continuationNode) {
              if ($(allLinkedNodes[lengthofContinuedNodes - 1])[0].textContent == "") {
                lengthofContinuedNodes = lengthofContinuedNodes - 1;
              }
            }
            if (positionTop == '0' || positionTop == '1' || positionTop == '2' || positionTop == '12'
                || positionTop == '13') {
              
              while (nodeN1.toLowerCase() != "td") {
                parentNodeOfContinuation1 = parentNodeOfContinuation1.parent();
                if ($(parentNodeOfContinuation1).parent()[0]) {
                  nodeN1 = $(parentNodeOfContinuation1).parent()[0].nodeName.toLowerCase();
                } else
                  break;
              }
              if ($(parentNodeOfContinuation1.parent()).prev()[0]) {
                if ($(parentNodeOfContinuation1.parent()).prev()[0].nodeName.toLowerCase() == "td") {
                  parentNodeOfContinuation1 = $(parentNodeOfContinuation1.parent().prev()).children();
                  parentNodeOfContinuation1NodeName = $(parentNodeOfContinuation1)[0].nodeName.toLowerCase();
                  while (parentNodeOfContinuation1NodeName != "div") {
                    parentNodeOfContinuation1 = parentNodeOfContinuation1.children();
                    if ($(parentNodeOfContinuation1)[0]) {
                      parentNodeOfContinuation1NodeName = $(parentNodeOfContinuation1)[0].nodeName.toLowerCase();
                    } else
                      break;
                  }
                  // DE565
                  childNode = parentNodeOfContinuation1;
                }
              }
              /*
               * if(parentNodeOfContinuation1NodeName=="div"){
               * childNode=parentNodeOfContinuation1; }
               */
              else {
                while (nodeN.toLowerCase() != "body") {
                  parentNodeOfContinuation = parentNodeOfContinuation.parent();
                  if ($(parentNodeOfContinuation).parent()[0]) {
                    nodeN = $(parentNodeOfContinuation).parent()[0].nodeName.toLowerCase();
                  } else
                    break;
                }
                childNode = parentNodeOfContinuation;
                if ($(childNode)[0].nodeName.toLowerCase() == continuationNode) {
                  parentNodeOfContinuation = allLinkedNodesLocalParent;
                  nodeN = allLinkedNodesLocalParentNodeName;
                  while (nodeN != continuationNode) {
                    parentNodeOfContinuation = parentNodeOfContinuation.parent();
                    if ($(parentNodeOfContinuation).parent()[0]) {
                      nodeN = $(parentNodeOfContinuation).parent()[0].nodeName.toLowerCase();
                    }
                  }
                  childNode = parentNodeOfContinuation;
                }
              }
              if (!checkIfImageAlreadyExists(imageId)) {
                setTimeout(function () {
                  elem.setAttribute("src", srcImg);
                  elem.setAttribute("height", "13px");
                  $(elem).insertBefore(childNode);
                }, 10);
              }
              break;
            } else {
              if ($(allLinkedNodes[0]).parent().parent().parent()[0]) {
                if ($(allLinkedNodes[0]).parent().parent().parent()[0].nodeName.toLowerCase() == 'div'
                    && $(allLinkedNodes[0]).parent().parent().parent().parent()
                    && $(allLinkedNodes[0]).parent().parent().parent().parent().prev()
                    && $(allLinkedNodes[0]).parent().parent().parent().parent().prev()[0]
                    && $(allLinkedNodes[0]).parent().parent().parent().parent().prev()[0].nodeName.toLowerCase() != 'div'
                    && $(allLinkedNodes[0]).parent().parent()[0].nodeName.toLowerCase() == 'span') {
                  $(allLinkedNodes[0]).parent()[0].style.display = 'inline';
                }
              }
              var positionOfElementsNewLength = positionOfElementsNew.length;
              for (i = 0; i < positionOfElementsNewLength; i++) {
                for (var j = i + 1; j < positionOfElementsNewLength; j++) {
                  var positionOfElementsNewAtJthPosition = positionOfElementsNew[j];
                  if (positionOfElementsNewAtJthPosition < positionOfElementsNew[i]) {
                    positionTopRearranged = positionOfElementsNewAtJthPosition;
                    
                  }
                }
              }
              
              if (positionTopRearranged != "") {
                var min_of_array = Math.min.apply(Math, positionOfElementsNew);
                var newTopPositionNode = "";
                
                var allLinkedNodesOfRecentArray = [];
                for (var i = 0; i < lengthofContinuedNodes; i++) {
                  var allLinkedNodesLocalElement = $(allLinkedNodes[i]);
                  if (userAgent.match(/iPhone/i) || ($.browser.msie)) {
                    if (allLinkedNodesLocalElement.offsetTop) {
                      allLinkedNodesOfRecentArray.push(allLinkedNodesLocalElement.offsetTop);
                    } else {
                      allLinkedNodesOfRecentArray.push(allLinkedNodesLocalElement.position().top);
                    }
                  } else {
                    allLinkedNodesOfRecentArray.push(allLinkedNodesLocalElement.position().top);
                  }
                }
                for (var j = 0; j < lengthofContinuedNodes; j++) {
                  var allLinkedNodesLocalElement = $(allLinkedNodes[j]);
                  min_of_array = Math.min.apply(Math, allLinkedNodesOfRecentArray);
                  if (allLinkedNodesLocalElement.position().top == min_of_array) {
                    newTopPositionNode = allLinkedNodesLocalElement;
                    break;
                  }
                }
                
                if (!checkIfImageAlreadyExists(imageId)) {
                  if (newTopPositionNode != "") {
                    elem.setAttribute("src", srcImg);
                    elem.setAttribute("height", "13px");
                    elem.setAttribute("position", "fixed");
                    $(elem).insertBefore(newTopPositionNode);
                  } else {
                    elem.setAttribute("src", srcImg);
                    elem.setAttribute("height", "13px");
                    $(elem).insertBefore($(allLinkedNodes[0]));
                  }
                }
              } else {
                if (!checkIfImageAlreadyExists(imageId)) {
                  setTimeout(function () {
                    if ($(allLinkedNodes[0]).parent().hasClass('sec-cbe-highlight-block')) {
                      $(allLinkedNodes[0]).parent().removeClass('sec-cbe-highlight-block');
                      $(allLinkedNodes[0]).parent().addClass('sec-cbe-highlight-block-continuation');
                    }
                    elem.setAttribute("height", "13px");
                    elem.setAttribute("src", srcImg);
                    $(elem).insertBefore(($(allLinkedNodes[0])));
                  }, 10);
                }
              }
              
            }
            break;
          }
        }
        
        // return elem;
      }
      function wrapInDashes (index, ele, highlightType, blueImagePath, node, nodeName, allLinkedNodes, elem, cls,
          spanNode, nonNumericNode, xbrId, xbrlArray, userAgent, documentWidth, tdCount) {
        // var spanNodeContinuation=$(spanNode);
        var nonNumericNodeElement = App.InlineDoc.inlinePrefix + ':nonnumeric';
        var continuationNode = App.InlineDoc.inlinePrefix + ':continuation';
        var nodeContinuation = node[0];
        var nodeContinuationElement = $(nodeContinuation);
        // DE453
        var parentNodeCheck = nodeContinuationElement.parent();
        if (!node.parent().hasClass('sec-cbe-highlight-dashed')
            && !node.parent().hasClass('sec-cbe-highlight-dashed-highlight')) {
          // var nodeName = node[0].nodeName.toLowerCase();
          // var cls = 'sec-cbe-highlight-inline'; // assume display:inline,
          // work hard to make sure not a block
          if (nonNumericNode) {
            // xbrId = node.attr('name').split(':').join('_');
            if (instance && instance.tag[xbrId].xbrlType == 'textBlockItemType') { // it
              // was
              // a
              // textBlock
              cls = 'sec-cbe-highlight-block';
            } else if (instance.tag[xbrId].xbrltype == 'textBlockItemType') {
              
              cls = 'sec-cbe-highlight-block';
              var parentNode = nodeContinuationElement.parent();
              var parentNodeName = parentNode[0].nodeName.toLowerCase();
              while (parentNodeName != continuationNode) {
                parentNode = parentNode.parent();
                var parentNodeElement = $(parentNode)[0];
                if (parentNodeElement) {
                  parentNodeName = parentNodeElement.nodeName.toLowerCase();
                } else
                  break;
              }
              if (parentNodeName == continuationNode) {
                cls = 'sec-cbe-highlight-block';
              }
              // DE453 fix
              else if (parentNodeCheck[0].nodeName.toLowerCase() == 'p') {
                // this if block is fix for DE453 issue 1
                cls = 'sec-cbe-highlight-block';
              } else {
                var parentNode = nodeContinuationElement.parent();
                var parentNodeName = parentNode[0].nodeName.toLowerCase();
                while (parentNodeName != "div") {
                  parentNode = parentNode.parent();
                  var parentNodeElement = $(parentNode)[0];
                  if (parentNodeElement) {
                    parentNodeName = parentNodeElement.nodeName.toLowerCase();
                  } else
                    break;
                }
                if (parentNodeName == "div" && nodeContinuationElement.children().length == 0) {
                  cls = 'sec-cbe-highlight-inline';
                } else if (parentNodeName == "div" && nodeContinuationElement.children().length >= 1) {
                  if (nodeContinuationElement.children()[0]) {
                    if ((nodeContinuationElement).children()[0].nodeName.toLowerCase() == "span") {
                      // cls='sec-cbe-highlight-inline';
                      // this change has been made for DE538,539,540.
                      cls = 'sec-cbe-highlight-block';
                    }
                  }
                } else if (parentNodeName == "div" && $(node)[0].textContent.trim().length == "0") {
                  cls = 'sec-cbe-highlight-inline';
                }
                
              }
              
            } else { // does it have element descendants
              nodeContinuationElement.find('*').each(function () { // and there
                // was a
                // display:block
                // in there
                if ($(this).css('display') == 'block') {
                  cls = 'sec-cbe-highlight-block';
                  return false;
                }
              });
              if (cls == 'sec-cbe-highlight-inline') { // last ditch effort
                // based on current
                // display only
                var text = " ";
                var children = $(node).children();
                var childrenLength = children.length;
                if (childrenLength > 0) {
                  var x = children[childrenLength - 1].textContent;
                  if (x == '\xa0') { // Non-breakable space is char 0xa0 (160
                    // dec)
                    var x = nodeContinuation.lastChild;
                    nodeContinuation.removeChild(x);
                  }
                }
                /*
                 * else{ text = $(node)[0].textContent; } var match =
                 * /\n/.exec(text); if(match){ cls ==
                 * 'sec-cbe-highlight-inline'; } else{
                 */
                if (xbrlArray.indexOf(instance.tag[xbrId].xbrltype) < 0) {
                  rects = (nodeContinuation).getClientRects();
                  var top = [];
                  var bottom = [];
                  for (i = 0; i < rects.length; i++) {
                    var rect = rects[i];
                    top.push(rect.top);
                    bottom.push(rect.bottom);
                  }
                  if (rects.length > 1 && !identical(top) && !identical(bottom)) { // it
                    // is
                    // drawn
                    // in
                    // two
                    // rectangles,
                    // it
                    // had
                    // to
                    // be a
                    // block.
                    cls = 'sec-cbe-highlight-block';
                  }
                  /*
                   * if($(node[0]).parent().prev()[0] &&
                   * $(node).parent().prev().prev()[0]){
                   * if(($(node.context).parent().prev()[0].nodeName.toLowerCase()=="span" &&
                   * !$(node.context).children()[0]) &&
                   * ($(node)[0].textContent.trim().length !="0" &&
                   * $(node).parent()[0].textContent.trim().substring(0,1)==".") &&
                   * ($(node).parent().prev().prev()[0].nodeName.toLowerCase()
                   * =="span")){
                   * if($(node[0]).parent()[0].getClientRects().length>1){ cls =
                   * 'sec-cbe-highlight-block'; } } }
                   */
                  // }
                }
              }
            }
          }
          
          if (cls === 'sec-cbe-highlight-block') {
            setTimeout(function () {
              $(spanNode).addClass('sec-cbe-highlight-block');
              if (nonNumericNode) {
                if (ele.attr('continuedat') == null) {
                  var imageId = ele.attr('id') + "imageid";
                  if (!checkIfImageAlreadyExists(imageId)) {
                    elem.setAttribute("src", srcImg);
                    elem.setAttribute("id", imageId);
                    elem.setAttribute("width", "3");
                    elem.setAttribute("height", "13");
                    elem.setAttribute("align", "left");
                    $(elem).insertBefore(node);
                  }
                }
              }
            }, 10);
          } else {
            setTimeout(function () {
              $(spanNode).addClass('sec-cbe-highlight-inline');
            }, 10);
          }
          
          if (App_Find.Highlight.cachedResults.linkedHiddenNodes.length > 0) {
            if (node.attr('id') && ele.isHidden()) {
              wrapLinkedHidden(ele, node, cls, spanNode);
            }
          }
          
          if (highlightType == "calculation" || highlightType == "amount" || highlightType == "sign"
              || highlightType == "hidden") {
            App_Find.Highlight.cachedResults.arrayOfImages = frameContentObject.find('img');
            var arrayOfImagesLength = App_Find.Highlight.cachedResults.arrayOfImages.length;
            for (var i = 0; i < arrayOfImagesLength; i++) {
              var elementAtIthPositionOfArrayOfImages = App_Find.Highlight.cachedResults.arrayOfImages[i];
              if ((elementAtIthPositionOfArrayOfImages.getAttribute('src') == srcImg)
                  || (elementAtIthPositionOfArrayOfImages.getAttribute('src') == blueImagePath)) {
                elementAtIthPositionOfArrayOfImages.style.visibility = "hidden";
              }
            }
          } else {
            
            if (nonNumericNode) {
              if (ele.attr('continuedat') != null) {
                
                // var imageId=$(ele).attr('continuedat')+"imageid";
                var imageId = ele.attr('id') + "imageid";
                var difference = 0;
                elem.setAttribute("id", imageId);
                elem.setAttribute("width", "3");
                elem.setAttribute("align", "left");
                var nodeNew = "";
                var positionOfElementsNew = [];
                var element = " ";
                var positionTop = (allLinkedNodes[0][0]).offsetTop;
                var parentNodeOfContinuation = " ";
                var childNode = "";
                var positionTopRearranged = "";
                var lengthofContinuedNodes = allLinkedNodes.length;
                var childrenOfsecondNode = " ";
                var childrenOfsecondNodelength = " ";
                var childrenOfTopNode = " ";
                var childrenOfTopNodelength = " ";
                var count = 0;
                var intId = 0;
                var timeout = 0;
                $(document).ready(
                    function () {
                      
                      insertImageForNonNumericNodes(imageId, difference, elem, nodeNew, positionOfElementsNew, element,
                          positionTop, parentNodeOfContinuation, childNode, positionTopRearranged,
                          lengthofContinuedNodes, childrenOfsecondNode, childrenOfsecondNodelength, childrenOfTopNode,
                          childrenOfTopNodelength, allLinkedNodes, count, intId, timeout, userAgent, documentWidth,
                          tdCount);
                      
                      $(window).resize(
                          function () {
                            var positionTop = (allLinkedNodes[0][0]).offsetTop;
                            var positionOfElementsNew = [];
                            insertImageForNonNumericNodes(imageId, difference, elem, nodeNew, positionOfElementsNew,
                                element, positionTop, parentNodeOfContinuation, childNode, positionTopRearranged,
                                lengthofContinuedNodes, childrenOfsecondNode, childrenOfsecondNodelength,
                                childrenOfTopNode, childrenOfTopNodelength, allLinkedNodes, count, intId, timeout,
                                userAgent, documentWidth, tdCount);
                          });
                    });
              }
              /*
               * else{ if($(spanNode).hasClass('sec-cbe-highlight-block')){ var
               * imageId=ele.attr('id')+"imageid"; elem.setAttribute("src",
               * srcImg); elem.setAttribute("id", imageId);
               * elem.setAttribute("width", "3"); elem.setAttribute("height",
               * "13"); elem.setAttribute("align", "left");
               * $(elem).insertBefore(spanNode); } }
               */

            }
            
          }
          $(elem).on(
              'click',
              function (evt) {
                $('#about-modal').dialog("close");
                frameContentObject.find('.sec-cbe-highlight-filter-selected').removeClass(
                    'sec-cbe-highlight-filter-selected');
                App_Find.Highlight.cachedResults.arrayOfImages = frameContentObject.find('img');
                var arrayOfImagesLength = App_Find.Highlight.cachedResults.arrayOfImages.length;
                for (var i = 0; i < arrayOfImagesLength; i++) {
                  var elementAtIthPositionOfArrayOfImages = App_Find.Highlight.cachedResults.arrayOfImages[i];
                  if (elementAtIthPositionOfArrayOfImages.getAttribute('src') == blueImagePath) {
                    elementAtIthPositionOfArrayOfImages.setAttribute("src", srcImg);
                  }
                }
                
                if (nodeName == nonNumericNodeElement) {
                  if (node.attr('continuedat') != null) {
                    $(spanNode).addClass('sec-cbe-highlight-dashed');
                  } else {
                    if ($(spanNode).hasClass('sec-cbe-highlight-block')) {
                      $(spanNode).addClass('sec-cbe-highlight-dashed');
                      $(spanNode).addClass('sec-cbe-highlight-dashed_block');
                    }
                  }
                }
                if ($(spanNode).hasClass('sec-cbe-highlight-dashed')
                    || $(spanNode).hasClass('sec-cbe-highlight-filter')) {
                  var index = $(this).attr('data-result-index');
                  App_Find.Results.highlightItem(index); // highlight the
                  // result item
                  // var allLinkedNodes=[];
                  if (nodeName == nonNumericNodeElement) {
                    var imagePath = getImagePath();
                    if ((node).attr('continuedat') != null) {
                      $(spanNode).children(':first').selectionHighlightNodesOnClick();
                      var allLinkedNodesLength = allLinkedNodes.length;
                      for (var i = 0; i < allLinkedNodesLength; i++) {
                        
                        $(elem).attr("src",
                            imagePath + App_Settings.get('focusHighlightSelectionColorCode') + "_img.png");
                        elem.setAttribute("src", blueImagePath);
                      }
                      frameContentObject.find(
                          '.sec-cbe-highlight-content-selected, .sec-cbe-highlight-filter-content-selected')
                          .removeClass('sec-cbe-highlight-content-selected sec-cbe-highlight-filter-content-selected');
                      selectionHighlightClickNodes(allLinkedNodes);
                    }

                    else if ($(spanNode).hasClass('sec-cbe-highlight-block')) {
                      $(spanNode).children(':first').selectionHighlightNodesOnClick();
                      $(elem)
                          .attr("src", imagePath + App_Settings.get('focusHighlightSelectionColorCode') + "_img.png");
                      elem.setAttribute("src", blueImagePath);
                      frameContentObject.find(
                          '.sec-cbe-highlight-content-selected, .sec-cbe-highlight-filter-content-selected')
                          .removeClass('sec-cbe-highlight-content-selected sec-cbe-highlight-filter-content-selected');
                      $(spanNode).addClass('sec-cbe-highlight-filter-content-selected');
                      selectionHighlightClickNodes(allLinkedNodes);
                    } else {
                      $(spanNode).children(':first').selectionHighlight();
                    }
                    
                    $(spanNode).children(':first').each(function () {
                      App_Find.Element.showSelectionDetail(node);
                    });
                  }
                  
                  evt.stopPropagation();
                }
              }).on(
              'mousemove',
              function (event) {
                var allLinkedNodes = [];
                if (nodeName == nonNumericNodeElement) {
                  if (node.attr('continuedat') != null) {
                    node.removeClass('sec-cbe-highlight-dashed sec-cbe-highlight-dashed_block');
                    selectionHighlightNodes(allLinkedNodes);
                  }
                }
                if (App_Find.Element.enableTooltip == "enable") {
                  if (nodeName == nonNumericNodeElement) {
                    if (node.attr('continuedat') != null) {
                      $(spanNode).addClass('sec-cbe-highlight-dashed');
                    } else {
                      if ($(spanNode).hasClass('sec-cbe-highlight-block')) {
                        // $(spanNode).addClass('sec-cbe-highlight-dashed_block');
                      }
                    }
                  }
                  if ($(spanNode).hasClass('sec-cbe-highlight-dashed')
                      || $(spanNode).hasClass('sec-cbe-highlight-filter')) {
                    $(spanNode).children(':first').each(function () {
                      getMouseOverDiv(ele, node, false);
                    });
                  }
                  
                  placeMouseOverDiv(event);
                  event.stopPropagation();
                }
                
              }).on('mouseout', function () {
            if (nodeName == nonNumericNodeElement) {
              if (node.attr('continuedAt') != null) {
                allLinkedNodes = App_Find.Element.groupIxContinuation(node);
                $(this).removeHighlightNodes(allLinkedNodes);
                
              }
              
            }
            var container = $('#selection-detail-container-mouseOver');
            container.hide();
          });
          setTimeout(function () {
            $(spanNode).addClass('sec-cbe-highlight-dashed');
          }, 10);
          if (nonNumericNode) {
            
            if (node.attr('continuedat') != null) {
              
              setTimeout(function () {
                $(spanNode).addClass('sec-cbe-highlight-dashed-highlight');
              }, 10);
            } else {
              
              if (cls == 'sec-cbe-highlight-block') {
                setTimeout(function () {
                  $(spanNode).addClass('sec-cbe-highlight-dashed_block');
                }, 10);
              }
              
            }
          }
          
          $(spanNode)
              .attr('data-result-index', index)
              .on(
                  'click',
                  function (evt) {
                    $('#about-modal').dialog("close");
                    App_Find.Highlight.cachedResults.arrayOfImages = frameContentObject.find('img');
                    var arrayOfImagesLength = App_Find.Highlight.cachedResults.arrayOfImages.length;
                    for (var i = 0; i < arrayOfImagesLength; i++) {
                      var elementAtIthPositionOfArrayOfImages = App_Find.Highlight.cachedResults.arrayOfImages[i];
                      if (elementAtIthPositionOfArrayOfImages.getAttribute('src') == blueImagePath) {
                        elementAtIthPositionOfArrayOfImages.setAttribute("src", srcImg);
                      }
                    }
                    var currentNode = $(this);
                    if (currentNode.hasClass('sec-cbe-highlight-dashed')
                        || currentNode.hasClass('sec-cbe-highlight-dashed-highlight')
                        || currentNode.hasClass('sec-cbe-highlight-filter')) {
                      frameContentObject
                          .find(
                              '.sec-cbe-highlight-content-selected, .sec-cbe-highlight-filter-selected, .sec-cbe-highlight-filter-selected-block, .sec-cbe-highlight-filter-block-content-selected, .sec-cbe-highlight-filter-content-selected')
                          .removeClass(
                              'sec-cbe-highlight-content-selected sec-cbe-highlight-filter-selected sec-cbe-highlight-filter-selected-block sec-cbe-highlight-filter-block-content-selected sec-cbe-highlight-filter-content-selected');
                      var index = currentNode.attr('data-result-index');
                      applyBackgroundcolrOnallChildNodesOnClick(currentNode);
                      App_Find.Results.highlightItem(index); // highlight the
                      // result item
                      if (nodeName == nonNumericNodeElement) {
                        if (node.attr('continuedat') != null) {
                          currentNode.children(':first').selectionHighlightNodesOnClick();
                          var allLinkedNodesLength = allLinkedNodes.length;
                          for (var i = 0; i < allLinkedNodesLength; i++) {
                            var allLinkedNodesLocalElement = allLinkedNodes[i];
                            parentNodeOfContinuation = allLinkedNodesLocalElement.parent();
                            nodeN = parentNodeOfContinuation[0].nodeName.toLowerCase();
                            if (positionTop == '0' || positionTop == '1' || positionTop == '2') {
                              while (nodeN.toLowerCase() != "body") {
                                parentNodeOfContinuation = parentNodeOfContinuation.parent();
                                var parentOfParentNodeOfContinuation = $(parentNodeOfContinuation).parent()[0];
                                if (parentOfParentNodeOfContinuation) {
                                  nodeN = parentOfParentNodeOfContinuation.nodeName.toLowerCase();
                                } else {
                                  break;
                                }
                              }
                              var childNode = parentNodeOfContinuation;
                              var prevOfChildNode = $(childNode).prev()[0];
                              if ((prevOfChildNode)) {
                                if (prevOfChildNode.nodeName.toLowerCase() == "img") {
                                  prevOfChildNode.setAttribute("src", blueImagePath);
                                }
                              }
                            }
                            
                            str = $(elem).attr('src');
                            if (str) {
                              elem.setAttribute("src", blueImagePath);
                            }
                          }
                          frameContentObject.find(
                              '.sec-cbe-highlight-content-selected, .sec-cbe-highlight-filter-content-selected')
                              .removeClass(
                                  'sec-cbe-highlight-content-selected sec-cbe-highlight-filter-content-selected');
                          selectionHighlightClickNodes(allLinkedNodes);
                        } else {
                          if (currentNode.hasClass('sec-cbe-highlight-block')) {
                            currentNode.children(':first').selectionHighlightForBlock();
                            var str1 = null;
                            if ($(node).prev().attr('src')) {
                              str1 = $(node).prev().attr('src');
                              if (str1) {
                                $(node).prev()[0].setAttribute("src", blueImagePath);
                              }
                            } else {
                              str1 = $(node).parent().prev().attr('src');
                              if (str1) {
                                $(node).parent().prev()[0].setAttribute("src", blueImagePath);
                              }
                            }
                            
                          } else if (currentNode.hasClass('sec-cbe-highlight-inline')) {
                            App.frame.contents().find('.sec-cbe-highlight-filter-content-selected').removeClass(
                                'sec-cbe-highlight-filter-content-selected');
                            currentNode.addClass('sec-cbe-highlight-filter-content-selected');
                            currentNode.children(':first').selectionHighlight();
                          }
                        }
                        currentNode.children(':first').each(function () {
                          App_Find.Element.showSelectionDetail($(node));
                        });
                      } else {
                        frameContentObject.find('.sec-cbe-highlight-filter-content-selected').removeClass(
                            'sec-cbe-highlight-filter-content-selected');
                        currentNode.addClass('sec-cbe-highlight-filter-content-selected');
                        currentNode.children(':first').selectionHighlight();
                        currentNode.children(':first').each(function () {
                          App_Find.Element.showSelectionDetail($(node));
                        });
                      }
                      evt.stopPropagation();
                    }
                  }).on(
                  'mousemove',
                  function (event) {
                    var flag = true;
                    var currentNode = $(this);
                    if (nodeName == nonNumericNodeElement) {
                      if (node.attr('continuedat') != null) {
                        node.removeClass('sec-cbe-highlight-dashed sec-cbe-highlight-dashed_block');
                        selectionHighlightNodes(allLinkedNodes);
                        var imageId = node.attr('id') + "imageid";
                        imageNode = getAlreadyExistingImage(imageId);
                        if (imageNode) {
                          if (imageNode.style.visibility == "hidden") {
                            flag = false;
                          }
                        }
                      } else if ((currentNode.hasClass('sec-cbe-highlight-block'))
                          && !(currentNode.hasClass('sec-cbe-highlight-content-selected'))) {
                        currentNode.addClass('sec-cbe-highlight-content-selected');
                        applyBackgroundcolrOnallChildNodes($(this));
                      } else {
                        currentNode.addClass('sec-cbe-highlight-content-selected');
                        applyBackgroundcolrOnallChildNodes($(this));
                      }
                    } else {
                      currentNode.addClass('sec-cbe-highlight-content-selected');
                      applyBackgroundcolrOnallChildNodes($(this));
                    }
                    if (flag == true) {
                      if (App_Find.Element.enableTooltip == "enable") {
                        if (nodeName == nonNumericNodeElement) {
                          if (node.attr('continuedat') != null) {
                            currentNode.addClass('sec-cbe-highlight-dashed-highlight');
                          }
                        }
                        if (currentNode.hasClass('sec-cbe-highlight-dashed')
                            || currentNode.hasClass('sec-cbe-highlight-dashed-highlight')
                            || currentNode.hasClass('sec-cbe-highlight-filter')) {
                          currentNode.children(':first').each(function () {
                            getMouseOverDiv(ele, node, false);
                          });
                        }
                        
                        placeMouseOverDiv(event);
                      }
                    }
                    event.stopPropagation();
                    
                  }).on('mouseout', function () {
                var currentNode = $(this);
                if (nodeName == nonNumericNodeElement) {
                  if (node.attr('continuedAt') != null) {
                    currentNode.removeHighlightNodes(allLinkedNodes);
                  } else if (currentNode.hasClass('sec-cbe-highlight-block')) {
                    currentNode.removeClass('sec-cbe-highlight-content-selected');
                    removeBackgroundcolrFromallChildNodes($(this));
                  } else {
                    currentNode.removeClass('sec-cbe-highlight-content-selected');
                    removeBackgroundcolrFromallChildNodes($(this));
                  }
                } else {
                  currentNode.removeClass('sec-cbe-highlight-content-selected');
                  removeBackgroundcolrFromallChildNodes($(this));
                }
                var container = $('#selection-detail-container-mouseOver');
                container.hide();
              }).on(
                  'mouseenter',
                  function (event) {
                    var currentNode = $(this);
                    var flag = true;
                    if (nodeName == nonNumericNodeElement) {
                      if (ele.attr('continuedat') != null) {
                        ele.removeClass('sec-cbe-highlight-dashed sec-cbe-highlight-dashed_block');
                        selectionHighlightNodes(allLinkedNodes);
                        var imageId = node.attr('id') + "imageid";
                        imageNode = getAlreadyExistingImage(imageId);
                        if (imageNode) {
                          if (imageNode.style.visibility == "hidden") {
                            flag = false;
                          }
                        }
                      } else if (currentNode.hasClass('sec-cbe-highlight-block')) {
                        currentNode.addClass('sec-cbe-highlight-content-selected');
                      }
                    }
                    if (flag == true) {
                      if (App_Find.Element.enableTooltip == "enable") {
                        
                        if (currentNode.hasClass('sec-cbe-highlight-dashed')
                            || currentNode.hasClass('sec-cbe-highlight-filter')) {
                          currentNode.children(':first').each(function () {
                            getMouseOverDiv(ele, node, false);
                          });
                        }
                        placeMouseOverDiv(event);
                      }
                    }
                    event.stopPropagation();
                  });
        }
      }
      function calTotalRelationshipNodes () {
        App_Find.Highlight.cachedResults.relationship = App.InlineDoc.getRelationships();
      }
      function calTotalFootNoteNodes () {
        App_Find.Highlight.cachedResults.footnote = App.InlineDoc.getFootnoteElements();
      }
      function calTotalContinuedNodes (index, element) {
        App_Find.Highlight.cachedResults.continuedAt = App.InlineDoc.getContinuations();
      }
      // if we have no filters or search filters then just show the results
      if (!filter.isFiltered() && search.searchStr == '') {
        calTotalContinuedNodes();
        calTotalRelationshipNodes();
        calTotalFootNoteNodes();
        var count = 0;
        results.each(function (index, element) {
          var node = $(element);
          var nodeName = node[0].nodeName.toLowerCase();
          
          if (nodeName == App.InlineDoc.inlinePrefix + ':nonnumeric') {
            App_Find.Highlight.cachedResults.nonnumericnodes.push(node);
            var att = document.createAttribute("id");
            // if(node.attr('continuedat')!=null){
            if (element.attr('id') == null) {
              att.value = count + "imageId";
              $(element)[0].setAttributeNode(att);
              count++;
            }
            // }
          }
        });
        var blueImagePath = getImagePath() + App_Settings.get('focusHighlightSelectionColorCode') + "_img.png";
        if (App_Find.Highlight.cachedResults.continuedAt.length > 0) {
          
          results.each(function (index, element) {
            var node = $(element);
            var spanNode = null;
            var nilPadding = '&#160;';
            var parentNode = node.parent()[0];
            var isonly = parentNode.childNodes.length == 1;
            var parentNodeName = parentNode.nodeName.toLowerCase();
            if (!node.parent().hasClass('sec-cbe-highlight-dashed')
                && !node.parent().hasClass('sec-cbe-highlight-dashed-highlight')) {
              if (parentNodeName === 'span') //
              {
                if (isonly) {
                  spanNode = parentNode;
                } // no need to wrap.
              }
              if (spanNode === null) {
                node.wrap('<span>' + ((node.attr('xsi:nil') === 'true') ? nilPadding : '') + '</span>');
                spanNode = node.parent()[0];
              }
            }
          });
          var highlightType = App_Find.Highlight.getSelected().value;
          
          App_Find.Highlight.cachedResults.arrayOfImages = frameContentObject.find('img');
          var arrayOfImagesLength = App_Find.Highlight.cachedResults.arrayOfImages.length;
          if (highlightType == "both" || highlightType == "text") {
            for (var i = 0; i < arrayOfImagesLength; i++) {
              var elementAtIthPositionOfArrayOfImages = App_Find.Highlight.cachedResults.arrayOfImages[i];
              if (elementAtIthPositionOfArrayOfImages.getAttribute('src') == srcImg
                  || elementAtIthPositionOfArrayOfImages.getAttribute('src') == blueImagePath) {
                elementAtIthPositionOfArrayOfImages.style.visibility = "visible";
              }
            }
          }
          var xbrlArray = [
              "booleanItemType",
              "centralIndexKeyItemType",
              "dateItemType",
              "durationItemType",
              "filerCategoryItemType",
              "fiscalPeriodItemType",
              "gMonthDayItemType",
              "gYearItemType",
              "normalizedStringItemType",
              "submissionTypeItemType",
              "yesNoItemType" ];
          var time = 0;
          var tdCount = 0;
          var userAgent = navigator.userAgent;
          var documentWidth = $(document).width();
          var incrementCount = 0;
          if (($.browser.msie)) {
            incrementCount = 10;
          } else
            incrementCount = 0;
          if (highlightType == "both" && !$('#filter-period-modal').hasClass('in')
              && !$('#filter-unit-modal').hasClass('in') && !$('#filter-axis-modal').hasClass('in')
              && !$('#filter-scale-modal').hasClass('in') && !$('#filter-balance-modal').hasClass('in')) {
            results.each(function (index, element) {
              setTimeout(function () {
                var node = $(element);
                var nodeName = node[0].nodeName.toLowerCase();
                var allLinkedNodes = [];
                var elem = document.createElement("img");
                var cls = 'sec-cbe-highlight-inline';
                var spanNode = null;
                var xbrId = "";
                var nonNumericNode = false;
                var nonNumericNodeElement = App.InlineDoc.inlinePrefix + ':nonnumeric';
                var parentNode = node.parent()[0];
                if (nodeName == nonNumericNodeElement) {
                  App_Find.Highlight.cachedResults.nonnumericnodes.push(node);
                }
                if (nodeName == nonNumericNodeElement) {
                  nonNumericNode = true;
                  xbrId = node.attr('name').split(':').join('_');
                  if (node.attr('continuedat') != null) {
                    allLinkedNodes = App_Find.Element.groupIxContinuation(node);
                    App_Find.Highlight.cachedResults.allData.push(allLinkedNodes);
                  }
                }
                spanNode = parentNode;
                wrapInDashes(index, element, highlightType, blueImagePath, node, nodeName, allLinkedNodes, elem, cls,
                    spanNode, nonNumericNode, xbrId, xbrlArray, userAgent, documentWidth, tdCount);
              }, time);
              
              time += incrementCount;
            });
          } else {
            results.each(function (index, element) {
              var node = $(element);
              var nodeName = node[0].nodeName.toLowerCase();
              var allLinkedNodes = [];
              var elem = document.createElement("img");
              var cls = 'sec-cbe-highlight-inline';
              var spanNode = null;
              var xbrId = "";
              var nonNumericNode = false;
              var nonNumericNodeElement = App.InlineDoc.inlinePrefix + ':nonnumeric';
              var parentNode = node.parent()[0];
              if (nodeName == nonNumericNodeElement) {
                App_Find.Highlight.cachedResults.nonnumericnodes.push(node);
              }
              if (nodeName == nonNumericNodeElement) {
                nonNumericNode = true;
                xbrId = node.attr('name').split(':').join('_');
                if (node.attr('continuedat') != null) {
                  allLinkedNodes = App_Find.Element.groupIxContinuation(node);
                  App_Find.Highlight.cachedResults.allData.push(allLinkedNodes);
                }
              }
              spanNode = parentNode;
              wrapInDashes(index, element, highlightType, blueImagePath, node, nodeName, allLinkedNodes, elem, cls,
                  spanNode, nonNumericNode, xbrId, xbrlArray, userAgent, documentWidth, tdCount);
            });
          }
          App_Find.Results.show(App_Find.Highlight.getResults());
          
          var continuedNodeId = " ";
          var found = false;
          var parentNode = " ";
          var parentnodeId = " ";
          var parentNodeOfContinuation = " ";
          var positionOfElementsNew = [];
          var parentNodeParent = "";
          var parentNodeParentNodeName = " ";
          var nodeNew = " ";
          for (var j = 0; j < App_Find.Highlight.cachedResults.continuedAt.length; j++) {
            nodeNew = $(App_Find.Highlight.cachedResults.continuedAt[j]);
            wrapInDashesForContinuationArray(nodeNew, blueImagePath, continuedNodeId, found, parentNode, parentnodeId,
                parentNodeOfContinuation, positionOfElementsNew, parentNodeParent, parentNodeParentNodeName);
          }
          // frameContentObject.find('hr[style*="width"]').each(
          // function (index) {
          // $(this).addClass('applyhrstyles'); // WcH: Why?
          //
          // });
          frameContentObject.find('div[style*="clear"], div[style*="line-height"], div[style*="CLEAR"]').each(
              function (index) {
                // $(this).addClass('applydivstyles'); // WcH: Why?
                if (this.style.lineHeight == "120%")
                  this.style.lineHeight = '130%';
              });
          // added this code for fix of DE541
          frameContentObject.find('p[style*="text-indent"]').each(
              function (index) {
                if (this.style.textIndent == "-153pt" || this.style.textIndent == "-153.35pt"
                    || this.style.textIndent == "-99pt") {
                  this.style.marginLeft = '0pt';
                  this.style.textIndent = '0pt';
                }
                //	
                
              });
          // end DE541
          
          /*
           * tabletags = frameContentObject.find('table[style*="width"]').each(
           * function (index) { if(this.style.width=="100%"){
           * this.style.marginLeft = "0"; if (userAgent.match(/iPhone/i) ||
           * userAgent.match(/android/i)) { this.style.width = "88%"; } else if
           * (userAgent.match(/iPad/i)) { this.style.width = "82%"; } else { if
           * (documentWidth >= 1681) { this.style.width = "92%"; } else if
           * (documentWidth >= 1601 && documentWidth <= 1680) { this.style.width =
           * "90%"; } else if (documentWidth >= 1441 && documentWidth <= 1600) {
           * this.style.width = "88%"; } else if (documentWidth >= 1152 &&
           * documentWidth <= 1440) { this.style.width = "86%"; } else if
           * (documentWidth >= 1024 && documentWidth < 1152) { this.style.width =
           * "84%"; } else if (documentWidth < 1024) { this.style.width = "76%"; } } }
           * });
           */
          // setTimeout(function() {
          $(".fixedMenuBar").css('pointer-events', 'all');
          $(".fixedMenuBar").css('opacity', '1');
          App.hideToolbarSpinner();
          // },time);
          
        } else {
          var highlightType = App_Find.Highlight.getSelected().value;
          
          App_Find.Highlight.cachedResults.arrayOfImages = frameContentObject.find('img');
          var arrayOfImagesLength = App_Find.Highlight.cachedResults.arrayOfImages.length;
          if (highlightType == "both" || highlightType == "text") {
            for (var i = 0; i < arrayOfImagesLength; i++) {
              var elementAtIthPositionOfArrayOfImages = App_Find.Highlight.cachedResults.arrayOfImages[i];
              if (elementAtIthPositionOfArrayOfImages.getAttribute('src') == srcImg
                  || elementAtIthPositionOfArrayOfImages.getAttribute('src') == blueImagePath) {
                elementAtIthPositionOfArrayOfImages.style.visibility = "visible";
              }
            }
          }
          var time = 0;
          if (highlightType == "both") {
            results.each(function (index, element) {
              
              setTimeout(function () {
                var node = $(element);
                var nodeName = node[0].nodeName.toLowerCase();
                var spanNode = null;
                var cls = 'sec-cbe-highlight-inline';
                var elem = document.createElement("img");
                // var parentNode = node.parent()[0];
                var nonNumericNode = false;
                var instanceXbrlType = false;
                var xbrId = "";
                if (nodeName == App.InlineDoc.inlinePrefix + ':nonnumeric') {
                  nonNumericNode = true;
                  xbrId = node.attr('name').split(':').join('_');
                  if (instanceTag) {
                    if (instanceTag[xbrId].xbrlType == 'textBlockItemType'
                        || instanceTag[xbrId].xbrltype == 'textBlockItemType') {
                      instanceXbrlType = true;
                    }
                  }
                }
                wrapInDashesTraditional(elem, blueImagePath, highlightType, index, element, node, nodeName, spanNode,
                    cls, nonNumericNode, xbrId, instanceXbrlType);
              }, time);
              time += 10;
            });
          } else {
            results.each(function (index, element) {
              
              var node = $(element);
              var nodeName = node[0].nodeName.toLowerCase();
              var spanNode = null;
              var cls = 'sec-cbe-highlight-inline';
              var elem = document.createElement("img");
              // var parentNode = node.parent()[0];
              var nonNumericNode = false;
              var instanceXbrlType = false;
              var xbrId = "";
              if (nodeName == App.InlineDoc.inlinePrefix + ':nonnumeric') {
                nonNumericNode = true;
                xbrId = node.attr('name').split(':').join('_');
                if (instanceTag) {
                  if (instanceTag[xbrId].xbrlType == 'textBlockItemType'
                      || instanceTag[xbrId].xbrltype == 'textBlockItemType') {
                    instanceXbrlType = true;
                  }
                }
              }
              wrapInDashesTraditional(elem, blueImagePath, highlightType, index, element, node, nodeName, spanNode,
                  cls, nonNumericNode, xbrId, instanceXbrlType);
            });
          }
          // setTimeout(function() {
          App_Find.Results.show(App_Find.Highlight.getResults());
          $(".fixedMenuBar").css('pointer-events', 'all');
          $(".fixedMenuBar").css('opacity', '1');
          App.hideToolbarSpinner();
          // },time);
          
        }
      } else {
        if (App_Find.Highlight.cachedResults.continuedAt.length > 0) {
          var xbrlArray = [
              "booleanItemType",
              "centralIndexKeyItemType",
              "dateItemType",
              "durationItemType",
              "filerCategoryItemType",
              "fiscalPeriodItemType",
              "gMonthDayItemType",
              "gYearItemType",
              "normalizedStringItemType",
              "submissionTypeItemType",
              "yesNoItemType" ];
          var userAgent = navigator.userAgent;
          var tdCount = 0;
          var documentWidth = $(document).width();
          App_Find.Highlight.cachedResults.arrayOfImages = frameContentObject.find('img');
          var blueImagePath = getImagePath() + App_Settings.get('focusHighlightSelectionColorCode') + "_img.png";
          var arrayOfImagesLength = App_Find.Highlight.cachedResults.arrayOfImages.length;
          var highlightType = App_Find.Highlight.getSelected().value;
          if (highlightType == "both" || highlightType == "text") {
            for (var i = 0; i < arrayOfImagesLength; i++) {
              var elementAtIthPositionOfArrayOfImages = App_Find.Highlight.cachedResults.arrayOfImages[i];
              if (elementAtIthPositionOfArrayOfImages.getAttribute('src') == srcImg
                  || elementAtIthPositionOfArrayOfImages.getAttribute('src') == blueImagePath) {
                elementAtIthPositionOfArrayOfImages.style.visibility = "visible";
              }
            }
          }
          // DE573
          else if (highlightType == "hidden" || highlightType == "sign") {
            for (var i = 0; i < arrayOfImagesLength; i++) {
              var elementAtIthPositionOfArrayOfImages = App_Find.Highlight.cachedResults.arrayOfImages[i];
              if (elementAtIthPositionOfArrayOfImages.getAttribute('src') == srcImg
                  || elementAtIthPositionOfArrayOfImages.getAttribute('src') == blueImagePath) {
                elementAtIthPositionOfArrayOfImages.style.visibility = "hidden";
              }
            }
          }
          
          if (!filter.isFiltered() && (highlightType != 'none')) {
            results.each(function (index, element) {
              var node = $(element);
              var nodeName = node[0].nodeName.toLowerCase();
              var allLinkedNodes = [];
              var elem = document.createElement("img");
              var cls = 'sec-cbe-highlight-inline';
              var parentNode = node.parent()[0];
              var spanNode = null;
              var xbrId = "";
              var nonNumericNode = false;
              if (nodeName == App.InlineDoc.inlinePrefix + ':nonnumeric') {
                nonNumericNode = true;
                xbrId = node.attr('name').split(':').join('_');
                if (node.attr('continuedat') != null) {
                  allLinkedNodes = App_Find.Element.groupIxContinuation(node);
                }
              }
              spanNode = parentNode;
              wrapInDashes(index, element, highlightType, blueImagePath, node, nodeName, allLinkedNodes, elem, cls,
                  spanNode, nonNumericNode, xbrId, xbrlArray, userAgent, documentWidth, tdCount);
            });
          }
          var results = [];
          App_Find.Highlight.getResults().each(
              function (index, element) {
                
                var isMatch = false;
                var ele = $(element);
                var node = $(element);
                var nodeName = node[0].nodeName.toLowerCase();
                var allLinkedNodes = [];
                var cls = 'sec-cbe-highlight-inline';
                var imageNode = "";
                var parentNode = node.parent()[0];
                var spanNode = null;
                var xbrId = "";
                var nonNumericNode = false;
                if (nodeName == App.InlineDoc.inlinePrefix + ':nonnumeric') {
                  nonNumericNode = true;
                  xbrId = node.attr('name').split(':').join('_');
                  if (node.attr('continuedat') != null) {
                    allLinkedNodes = App_Find.Element.groupIxContinuation(node);
                  }
                }
                var elem = document.createElement("img");
                if (filter.isFiltered()) {
                  
                  if (ele.matchesFilter(filter, ele)) {
                    spanNode = parentNode;
                    wrapInDashes(index, element, highlightType, blueImagePath, node, nodeName, allLinkedNodes, elem,
                        cls, spanNode, nonNumericNode, xbrId, xbrlArray, userAgent, documentWidth, tdCount);
                    if (search.searchStr != '' && ele.matchesSearch(search, ele)) {
                      isMatch = true;
                    } else if (search.searchStr == '') {
                      
                      isMatch = true;
                    }
                  } else {
                    if (nodeName == App.InlineDoc.inlinePrefix + ':nonnumeric') {
                      // if($(ele).attr('continuedat')!=null){
                      // imageId=$(ele).attr('continuedat')+"imageid";
                      var imageId = ele.attr('id') + "imageid";
                      imageNode = getAlreadyExistingImage(imageId);
                      if (imageNode) {
                        imageNode.style.visibility = "hidden";
                      }
                      // }
                    }
                  }
                } else if (search.searchStr != '' && ele.matchesSearch(search, ele)) {
                  var searchstring = search.searchStr;
                  isMatch = true;
                  
                }
                if (isMatch) {
                  results.push(ele);
                  if ($('#search-input').val() != "") {
                    ele.filterHighlight(results.length - 1);
                    if (nodeName == App.InlineDoc.inlinePrefix + ':nonnumeric') {
                      if ($(ele).attr('continuedat') != null) {
                        for (var i = 0; i < allLinkedNodes.length; i++) {
                          allLinkedNodes[i].filterHighlightLinkedNodes(allLinkedNodes[i]);
                        }
                      }
                    }
                  }
                  spanNode = parentNode;
                  wrapInDashes(index, element, highlightType, blueImagePath, node, nodeName, allLinkedNodes, elem, cls,
                      spanNode, nonNumericNode, xbrId, xbrlArray, userAgent, documentWidth, tdCount);
                  
                }
              });
          App_Find.Results.show(results);
        } else {
          App_Find.Highlight.cachedResults.arrayOfImages = frameContentObject.find('img');
          var blueImagePath = getImagePath() + App_Settings.get('focusHighlightSelectionColorCode') + "_img.png";
          var arrayOfImagesLength = App_Find.Highlight.cachedResults.arrayOfImages.length;
          var highlightType = App_Find.Highlight.getSelected().value;
          
          if (highlightType == "both" || highlightType == "text") {
            for (var i = 0; i < arrayOfImagesLength; i++) {
              var elementAtIthPositionOfArrayOfImages = App_Find.Highlight.cachedResults.arrayOfImages[i];
              if (elementAtIthPositionOfArrayOfImages.getAttribute('src') == srcImg
                  || elementAtIthPositionOfArrayOfImages.getAttribute('src') == blueImagePath) {
                elementAtIthPositionOfArrayOfImages.style.visibility = "visible";
              }
            }
          }
          if (!filter.isFiltered() && (highlightType != 'none')) {
            results.each(function (index, element) {
              var node = $(element);
              var nodeName = node[0].nodeName.toLowerCase();
              var spanNode = null;
              var cls = 'sec-cbe-highlight-inline';
              var parentNode = node.parent()[0];
              var nonNumericNode = false;
              var instanceXbrlType = false;
              var xbrId = "";
              var elem = document.createElement("img");
              var blueImagePath = getImagePath() + App_Settings.get('focusHighlightSelectionColorCode') + "_img.png";
              if (nodeName == App.InlineDoc.inlinePrefix + ':nonnumeric') {
                nonNumericNode = true;
                xbrId = node.attr('name').split(':').join('_');
                
                if (instanceTag[xbrId].xbrlType == 'textBlockItemType'
                    || instanceTag[xbrId].xbrltype == 'textBlockItemType') {
                  instanceXbrlType = true;
                }
              }
              
              spanNode = parentNode;
              wrapInDashesTraditional(elem, blueImagePath, highlightType, index, element, node, nodeName, spanNode,
                  cls, nonNumericNode, xbrId, instanceXbrlType);
              // wrapInDashe(index,element,highlightType,blueImagePath,node,nodeName,allLinkedNodes,elem);
            });
          }
          var results = [];
          
          App_Find.Highlight.getResults().each(
              function (index, element) {
                var elem = document.createElement("img");
                var blueImagePath = getImagePath() + App_Settings.get('focusHighlightSelectionColorCode') + "_img.png";
                var isMatch = false;
                var ele = $(element);
                var node = $(element);
                var nodeName = node[0].nodeName.toLowerCase();
                var spanNode = null;
                var cls = 'sec-cbe-highlight-inline';
                var parentNode = node.parent()[0];
                var nonNumericNode = false;
                var instanceXbrlType = false;
                var xbrId = "";
                if (nodeName == App.InlineDoc.inlinePrefix + ':nonnumeric') {
                  nonNumericNode = true;
                  xbrId = node.attr('name').split(':').join('_');
                  
                  if (instanceTag[xbrId].xbrlType == 'textBlockItemType'
                      || instanceTag[xbrId].xbrltype == 'textBlockItemType') {
                    instanceXbrlType = true;
                  }
                }
                spanNode = parentNode;
                if (filter.isFiltered()) {
                  
                  if (ele.matchesFilter(filter, ele)) {
                    wrapInDashesTraditional(elem, blueImagePath, highlightType, index, element, node, nodeName,
                        spanNode, cls, nonNumericNode, xbrId, instanceXbrlType);
                    if (search.searchStr != '' && ele.matchesSearch(search, ele)) {
                      isMatch = true;
                    } else if (search.searchStr == '') {
                      
                      isMatch = true;
                    }
                  } else {
                    if (nodeName == App.InlineDoc.inlinePrefix + ':nonnumeric') {
                      var imageId = ele.attr('id') + "imageid";
                      imageNode = getAlreadyExistingImage(imageId);
                      if (imageNode) {
                        imageNode.style.visibility = "hidden";
                      }
                    }
                  }
                } else if (search.searchStr != '' && ele.matchesSearch(search, ele)) {
                  var searchstring = search.searchStr;
                  isMatch = true;
                  
                }
                if (isMatch) {
                  results.push(ele);
                  ele.filterHighlight(results.length - 1);
                  wrapInDashesTraditional(elem, blueImagePath, highlightType, index, element, node, nodeName, spanNode,
                      cls, nonNumericNode, xbrId, instanceXbrlType);
                  
                }
              });
          App_Find.Results.show(results);
        }
      }
    },
    jsonlocation : function () {
      var cnamejsonparse = undefined;
      var uri = URI(window.location.href);
      if (uri.hasQuery('file')) {
        // cnamejsonparse = "../documents/"+uri.query(true).file.split('/')[0];
        cnamejsonparse = uri.query(true).file.split('/')[0];
      } else if (uri.hasQuery('doc')) {
        cnamejsonparse = URI(uri.query(true).doc).filename("").toString();
      }
      return cnamejsonparse;
    },
    
    show : function (results) {
      var maxValueTextLength = 100;
      var searchResults = $('#results');
      if (results) {
        App.frame.contents().find('.sec-cbe-highlight-filter-selected')
            .removeClass('sec-cbe-highlight-filter-selected');
        if ($('#search-input').val() == "") {
          App.frame.contents().find('.sec-cbe-highlight-filter').removeClass('sec-cbe-highlight-filter');
        }
        searchResults.html('');
        App_Find.Results.currentPage = 1;
        App_Find.Results.totalPages = 0;
        App_Find.Results.results = null;
        App_Find.Results.results = $(results); // load
        App_Find.Results.totalPages = Math.ceil(App_Find.Results.results.length / App_Find.Results.resultsPerPage);
        if (results.length == 0) {
          App_Find.Results.currentPage = 0;
        }
      }
      if (App_Find.Results.totalPages == 0) {
        App_Find.Results.currentPage = 0;
      }
      $('#results-pages').html(App_Find.Results.currentPage + ' of ' + App_Find.Results.totalPages);
      if (App_Find.Results.results.length == 0) {
        
        var panel = $('#app-panel');
        if (panel.hasClass("visible")) {
          if (screen.width < 641) {
            $('#opener').removeClass('icon-expand-more').addClass('icon-expand-less');
            $('#opener').attr("title", "Expand Facts");
            panel.removeClass('visible').animate({
              'margin-right' : '-100%',
              'width' : '100%'
            });
            $('#app-inline-xbrl-doc').css({
              'width' : '100%'
            });
          } else {
            $('#opener').removeClass('icon-expand-more').addClass('icon-expand-less');
            $('#opener').attr("title", "Expand Facts");
            panel.removeClass('visible').animate({
              'margin-right' : '-30%',
              'width' : '30%'
            });
            panel.css({
              'width' : '100%'
            });
            $('#app-inline-xbrl-doc').css({
              'width' : '100%'
            });
          }
        }
      }
      $('#results-count').html('' + App_Find.Results.results.length + '');
      App.InlineDoc
          .getStandardLabels(
              this,
              function (labels) {
                
                App_Find.Results.results
                    .each(function (index, element) {
                      if (index < (App_Find.Results.currentPage * App_Find.Results.resultsPerPage)
                          && index >= ((App_Find.Results.currentPage * App_Find.Results.resultsPerPage) - App_Find.Results.resultsPerPage)) {
                        var e = $(element);
                        var xbrlValue = 'N/A';
                        var nodeName = e[0].nodeName.toLowerCase();
                        if (nodeName == App.InlineDoc.inlinePrefix + ':nonfraction') {
                          xbrlValue = e.getXbrlValue();
                          // if (e.attr('format') && xbrlValue=="-") { xbrlValue
                          // = App_Utils.formatAsNumber(e); }
                          xbrlValue = App_Utils.addCommas(xbrlValue);
                        } else if (nodeName == App.InlineDoc.inlinePrefix + ':nonnumeric') {
                          xbrlValue = e.htmlDecode(e.text());
                          if (e.attr('format')) {
                            xbrlValue = App_Utils.applyFormat(e);
                          }
                          if (xbrlValue.length > maxValueTextLength) {
                            // some of the hidden items contain html entities
                            // which is being seen as text
                            // therefore in order to get the text we have to
                            // re-parse it as html and grab the text
                            // xbrlValue = xbrlValue.trim().substring(0,
                            // maxValueTextLength) + '...';
                            // This will remove extra white spaces. Will
                            // uncomment this if required in future
                            // xbrlValue = xbrlValue.replace(/\s{2,}/g,' ');
                          }
                        }
                        var contextRef = e.attr('contextRef');
                        if (!contextRef) {
                          contextRef = 'N/A';
                        } else {
                          var context = App.InlineDoc.getContext(contextRef);
                          if (context) {
                            if (context.length == 1) {
                              contextRef = context.calendarFriendlyName();
                            }
                          }
                        }
                        var resultHtml = '<div class="result-item" data-is-selected="false" data-result-index="'
                            + index + '">'
                        // resultHtml += '<div class="rightNavLinks">';
                        resultHtml += '<div tabindex="0" class="rightNavLinks" style="float:none;font-weight:normal;">';
                        var id = App_Utils.convertToXBRLId(e.attr('name'));
                        var label = labels[id];
                        if (!label)
                          label = id;
                        finallabelresult = e.htmlDecode(label);
                        var dimensions = App_Find.Element.getDimensionsForElement(e);
                        
                        if (!(e.isHidden()) && (!(e.isCustom())) && (dimensions.length <= 0)) {
                          
                          resultHtml += '<span id="labelWithoutButtons"><b>' + finallabelresult + '</b></span>';
                          
                        } else if ((e.isHidden()) && ((e.isCustom())) && (dimensions.length > 0)) {
                          
                          resultHtml += '<span id="labelWithThreeButton"><b>' + finallabelresult + '</b></span>';
                          resultHtml += '<div style="float:right;margin-left:2px;margin-top:2px;"> <button class="customButton" title="Additional | Custom | Dimension">A | C | D</button> </div>';
                          
                        } else if ((e.isHidden()) && (e.isCustom()) && (dimensions.length <= 0)) {
                          
                          resultHtml += '<span id="labelWithBothButtons"><b>' + finallabelresult + '</b></span>';
                          resultHtml += '<div style="float:right;margin-left:2px;margin-top:2px;"> <button class="customButton" title="Additional | Custom">A | C</button> </div>';
                          
                        } else if ((!e.isHidden() && e.isCustom()) && (dimensions.length > 0)) {
                          
                          resultHtml += '<span id="labelWithBothButtons"><b>' + finallabelresult + '</b></span>';
                          resultHtml += '<div style="float:right;margin-left:2px;margin-top:2px;"> <button class="customButton" title="Custom | Dimension">C | D</button> </div>';
                          
                        } else if ((e.isHidden()) && ((!e.isCustom())) && (dimensions.length > 0)) {
                          
                          resultHtml += '<span id="labelWithBothButtons"><b>' + finallabelresult + '</b></span>';
                          resultHtml += '<div style="float:right;margin-left:2px;margin-top:2px;"> <button class="customButton" title="Additional | Dimension">A | D</button> </div>';
                          
                        } else {
                          
                          resultHtml += '<span id="labelWithOneButton"><b>' + finallabelresult + '</b></span>';
                          if (e.isCustom()) {
                            resultHtml += '<div style="float:right;margin-left:2px;margin-top:2px;"> <button class="customButton" title="Custom">C</button> </div>';
                          }
                          if (e.isHidden()) {
                            resultHtml += '<div style="float:right;margin-left:2px;margin-top:2px;"><button class="customButton" title="Additional">A</button> </div>';
                          }
                          
                          if (dimensions.length > 0) {
                            
                            resultHtml += '<div style="float:right;margin-left:2px;margin-top:2px;"> <button class="customButton" title="Dimension">D</button> </div>';
                          }
                          
                        }
                        
                        resultHtml += '<br/> ' + contextRef + '<br/><span id="xbrlValueSpan">' + xbrlValue + '</span>';
                        resultHtml += '</div></div>';
                        var resultHtmlObj = $(resultHtml);
                        resultHtmlObj.on('click', function () {
                          var allLinkedNodes = [];
                          if (nodeName == App.InlineDoc.inlinePrefix + ':nonnumeric') {
                            if ($(e).attr('continuedat') != null) {
                              // allLinkedNodes=App_Find.Element.groupIxContinuation($(e));
                              App.frame.contents().find(
                                  '.sec-cbe-highlight-content-selected, .sec-cbe-highlight-filter-content-selected')
                                  .removeClass(
                                      'sec-cbe-highlight-content-selected sec-cbe-highlight-filter-content-selected');
                              selectionHighlightClickNodes(allLinkedNodes);
                            }
                          }
                          App_Find.Results.selectItem($(this).attr('data-result-index'), true);
                        });
                        resultHtmlObj.on('keyup', function (e) {
                          var code = e.keyCode || e.which;
                          if ((code == 13) || (code == 32)) {
                            App_Find.Results.selectItem($(this).attr('data-result-index'), true);
                          }
                        });
                        
                        searchResults.append(resultHtmlObj);
                      } // end if
                    }); // end function // end reseults.each
              }); // end getStandardLabels
    }, // end Results.show
  }, // end Results
  
  Element : {
    labels : null,
    element : null,
    enableTooltip : 'disable',
    carouselItems : [ {
      subTitle : 'Attributes'
    }, {
      subTitle : 'Labels'
    }, {
      subTitle : 'References'
    }, {
      subTitle : 'Calculation'
    }, {
      subTitle : 'Additional Guidance'
    } ],
    init : function () {
      
      $('#selection-detail-carousel').carousel({
        interval : false
      }).on('slide.bs.carousel', function (event) {
        
        var index = $(event.relatedTarget).attr('data-slide-index');
        App_Find.Element.carouselGoTo(index);
      });
      
      $("#copyAllFRW").on('click', function () {
        App_Find.Element.copyToClipboard();
      });
      
      $("#closeFRW")
          .on(
              'click',
              function () {
                App_Find.Highlight.cachedResults.arrayOfImages = App.frame.contents().find('img');
                var arrayOfImagesLength = App_Find.Highlight.cachedResults.arrayOfImages.length;
                var blueImagePath = getImagePath() + App_Settings.get('focusHighlightSelectionColorCode') + "_img.png";
                var srcImg = getImagePath() + App_Settings.get('elementBorderColorCode') + "_img.png";
                for (var i = 0; i < arrayOfImagesLength; i++) {
                  if (App_Find.Highlight.cachedResults.arrayOfImages[i].getAttribute('src') == blueImagePath) {
                    App_Find.Highlight.cachedResults.arrayOfImages[i].setAttribute("src", srcImg);
                  }
                }
                /*
                 * if(screen.width>=768 && ((window.orientation) ||
                 * (window.orientation=='0') || (window.orientation=='180'))){
                 * 
                 * 
                 * 
                 * $(".fixedMenuBar").css('position', 'absolute'); } else
                 * if(screen.width>=768 && (((window.orientation=='90') ||
                 * (window.orientation=='-90')))){
                 * 
                 * $(".fixedMenuBar").css('position', 'absolute'); }
                 */
                App.frame
                    .contents()
                    .find(
                        '.sec-cbe-highlight-content-selected, .sec-cbe-highlight-filter-content-selected, .sec-cbe-highlight-filter-selected, .sec-cbe-highlight-filter-selected-block, .sec-cbe-highlight-filter-block-content-selected')
                    .removeClass(
                        'sec-cbe-highlight-content-selected sec-cbe-highlight-filter-content-selected sec-cbe-highlight-filter-selected sec-cbe-highlight-filter-selected-block sec-cbe-highlight-filter-block-content-selected');
                $(this).parents('.selection-detail-container').dialog("close");
                App_Find.Results.resetHighlightColor();
              });
      
      // change highlight type or concept type
      $('#tagTooltip').find('input[type="radio"]').on('change', function () {
        var selected = $("input[type='radio'][name='toolTip']:checked");
        if (selected.length > 0) {
          App_Find.Element.enableTooltip = selected.val();
        }
      });
      if (screen.width < 641) {
        App_Find.Element.enableTooltip = "disable";
        $('#tagTooltip').css({
          'display' : 'none'
        });
      }
      if ((screen.width) <= 768 && (window.orientation) && (window.orientation == 90 || window.orientation == -90)) {
        App_Find.Element.enableTooltip = "disable";
        $('#tagTooltip').css({
          'display' : 'none'
        });
      }
      if ((screen.width) <= 768 && (window.orientation == 0 || window.orientation == 180)) {
        App_Find.Element.enableTooltip = "disable";
        $('#tagTooltip').css({
          'display' : 'none'
        });
      }
    },
    groupIxContinuation : function (node) {
      if (node) {
        var continuedAt = node.attr('continuedAt');
        var allContinuedDependents = [];
        var newContinuedAt = "";
        
        allContinuedDependents.push(node);
        return App_Find.Element.findRelatedNodeAndUpdateMantainedList(continuedAt, allContinuedDependents,
            newContinuedAt);
      }
    },
    findRelatedNodeAndUpdateMantainedList : function (continuedAt, allContinuedDependents, newContinuedAt) {
      var continuedAtLength = App_Find.Highlight.cachedResults.continuedAt.length;
      for (var i = 0; i < continuedAtLength; i++) {
        var ithElementOfContinuedAtArray = App_Find.Highlight.cachedResults.continuedAt[i];
        if (continuedAt == ithElementOfContinuedAtArray.attr('id')) {
          allContinuedDependents.push(ithElementOfContinuedAtArray);
          if (null != ithElementOfContinuedAtArray.attr('continuedAt')) {
            newContinuedAt = ithElementOfContinuedAtArray.attr('continuedAt');
            break;
          }
          
        }
        // recursive call for finding all the related node
      }
      
      if (newContinuedAt != continuedAt) {
        App_Find.Element.findRelatedNodeAndUpdateMantainedList(newContinuedAt, allContinuedDependents, newContinuedAt);
      }
      return allContinuedDependents;
    },
    resetUI : function () {
      
      App_Find.Element.labels = null;
      $('#selection-detail-container').find('[data-content]').each(function (index, element) {
        
        $(element).html('');
      });
    },
    showSelectionDetail : function (ele) {
      
      App_Find.Element.element = ele;
      App_Find.Element.resetUI();
      var container = $('#selection-detail-container');
      
      $('#selection-detail-carousel').carousel(0);
      App_Find.Element.carouselGoTo(0);
      container.dialog("open");
      
      /* Added to handle pop up drag out of parent window */
      var draggableParams = {
        containment : '#app-container',
        zIndex : 1500,
        appendTo : '#page'
      }
      container.draggable(draggableParams);
      
    },
    
    carouselGoTo : function (index) {
      
      index = parseInt(index);
      if ((App.InlineDoc.getMetaMoreData() == "Not Found")) {
        App_Find.Element.carouselItems.length = 4;
        $("#lnk5,#div5").remove();
      }
      if (index >= 0 && index < App_Find.Element.carouselItems.length) {
        
        var nextIndex = index + 1;
        var prevIndex = index - 1;
        if (index == 0) {
          
          nextIndex = 1;
          prevIndex = App_Find.Element.carouselItems.length - 1;
        } else if (index >= (App_Find.Element.carouselItems.length - 1)) {
          
          nextIndex = 0;
          prevIndex = App_Find.Element.carouselItems.length - 2;
        }
        
        var currentItem = App_Find.Element.carouselItems[index];
        var nextItem = App_Find.Element.carouselItems[nextIndex];
        var prevItem = App_Find.Element.carouselItems[prevIndex];
        
        var carousel = $('#selection-detail-carousel');
        carousel.find('.carousel-label.left').html(prevItem.subTitle);
        carousel.find('.carousel-label.right').html(nextItem.subTitle);
        
        var container = $('#selection-detail-container');
        container.find('span[data-content="subtitle"]').html(currentItem.subTitle);
        /*
         * if(App.InlineDoc.getMetaMoreData() =="Not Found"){
         * $("#lnk5,#div5").remove(); }
         */
        switch (parseInt(index)) {
          case 0:
            App_Find.Element.updateSelectionDetail();
            break;
          case 1:
            if (container.find('[data-content="labels"]').html() == '') {
              
              App_Find.Element.updateDefinition();
            }
            break;
          case 2:
            if (container.find('[data-content="reference"]').html() == '') {
              App_Find.Element.updateReference();
            }
            break;
          case 3:
            App_Find.Element.updateCalculation();
            break;
          /*
           * Fifth review window code case 4: if
           * (container.find('[data-content="custom"]').html() == '') {
           * App_Find.Element.updateCustomDetail(); } break;
           */
        }
      }
    },
    typeHTML : '',
    updateSelectionDetail : function () {
      var maxValueTextLength = 256;
      var ele = App_Find.Element.element;
      var id = ele.attr('name');
      var xbrId = App_Utils.convertToXBRLId(id);
      
      var container = $('#selection-detail-container');
      html = '<table class="table-framed">';
      
      var selectedlabelval = App.InlineDoc.getSelectedLabel(xbrId, this, null, function (value) {
        
        container.find('[data-content="label"]').html(value);
      });
      
      if (!id) {
        
        id = 'N/A';
      }
      var tag = ele.htmlDecode(id);
      if (tag.substring(0, 8) == App.InlineDoc.standardTaxonomy) {
        tag = "<span style='white-space:nowrap;'>" + App.InlineDoc.standardTaxonomy + ":" + "</span>"
            + tag.substring(8);
      }
      if (tag != 'N/A') {
        html += '<tr><td width="35%">Tag</td><td width="65%"><div class="wordBreakDiv">' + tag + '</div></td></tr>';
      }
      // html += '<tr><td width="35%">Tag</td><td width="65%"><div
      // class="wordBreakDiv">'+ele.htmlDecode(id)+'</div></td></tr>';
      
      // xbrl value
      var xbrlValue = 'N/A';
      var nodeName = ele[0].nodeName.toLowerCase();
      if (nodeName == App.InlineDoc.inlinePrefix + ':nonfraction') {
        xbrlValue = ele.getXbrlValue();
        if (ele.attr('format') && xbrlValue == "-") {
          xbrlValue = App_Utils.applyFormat(ele);
        } else if (ele.attr('format') == "ixt:zerodash" && xbrlValue == "NaN") {
          xbrlValue = App_Utils.applyFormat(ele);
        }
        xbrlValue = App_Utils.addCommas(xbrlValue);
      } else if (nodeName == App.InlineDoc.inlinePrefix + ':nonnumeric') {
        if (ele.attr('continuedAt') != null) {
          var allLinkedNodes = [];
          allLinkedNodes = App_Find.Element.groupIxContinuation(ele);
          var xbrlValue = " ";
          for (var l = 0; l < allLinkedNodes.length; l++) {
            xbrlValue = xbrlValue.concat(allLinkedNodes[l].text());
            
          }
          if (xbrlValue.length > maxValueTextLength) {
            xbrlValue = xbrlValue.trim().substring(0, maxValueTextLength) + '...';
          }
        } else {
          xbrlValue = ele.htmlDecode(ele.text());
          if (ele.attr('format')) {
            xbrlValue = App_Utils.applyFormat(ele);
          }
          if (xbrlValue.length > maxValueTextLength) {
            
            // some of the hidden items contain html entities which is being
            // seen as text
            // therefore in order to get the text we have to re-parse it as html
            // and grab the text
            xbrlValue = xbrlValue.trim().substring(0, maxValueTextLength) + '...';
            
            // This will remove extra white spaces. Will uncomment this if
            // required in future
            // xbrlValue = xbrlValue.replace(/\s{2,}/g,' ');
          }
        }
      }
      if (xbrlValue != 'N/A') {
        html += '<tr><td width="35%">Fact</td><td width="65%"><div class="wordBreakDiv">' + xbrlValue
            + '</div></td></tr>';
      }
      var dimensions = App_Find.Element.getDimensionsForElement(ele);
      
      if (dimensions.length > 0) {
        
        for ( var k in dimensions) {
          if (ele.htmlDecode(dimensions[k].axis) != 'N/A') {
            html += '<tr><td width="35%">Axis</td><td width="65%"><div class="wordBreakDiv">'
                + ele.htmlDecode(dimensions[k].axis) + '</div></td></tr>';
          }
          if (ele.htmlDecode(dimensions[k].member) != 'N/A') {
            html += '<tr><td width="35%">Member</td><td width="65%"><div class="wordBreakDiv">'
                + ele.htmlDecode(dimensions[k].member) + '</div></td></tr>';
          }
        }
      }
      
      // calendar
      var contextRef = ele.attr('contextRef');
      if (!contextRef) {
        
        contextRef = 'N/A';
      } else {
        
        var context = App.InlineDoc.getContext(contextRef);
        if (context) {
          if (context.length == 1) {
            
            contextRef = context.calendarFriendlyName();
          }
        }
      }
      if (ele.htmlDecode(contextRef) != 'N/A') {
        html += '<tr><td width="35%">Period</td><td width="65%"><div class="wordBreakDiv">'
            + ele.htmlDecode(contextRef) + '</div></td></tr>';
      }
      // unit
      var unit = 'N/A';
      var unitRef = ele.attr('unitRef');
      
      if (unitRef) {
        var u = App.InlineDoc.getUnitById(unitRef);
        if (u.length > 0) {
          unit = u.unitFriendlyName();
        }
      }
      if (unit != 'N/A') {
        html += '<tr><td width="35%">Measure</td><td width="65%"><div class="wordBreakDiv">' + unit
            + '</div></td></tr>';
      }
      if (ele.scaleFriendlyName() != 'N/A') {
        html += '<tr><td width="35%">Scale</td><td width="65%"><div class="wordBreakDiv">' + ele.scaleFriendlyName()
            + '</div></td></tr>';
      }
      if (ele.precisionFriendlyName() != 'N/A') {
        html += '<tr><td width="35%">Decimals</td><td width="65%"><div class="wordBreakDiv">'
            + ele.precisionFriendlyName() + '</div></td></tr>';
      }
      if (App.InlineDoc.getMetaData()) {
        if (App.InlineDoc.getMetaData().tag[xbrId]) {
          balance = App.InlineDoc.getMetaData().tag[xbrId].crdr;
          if (balance) {
            html += '<tr><td width="35%">Balance</td><td width="65%"><div class="wordBreakDiv" style="text-transform: capitalize">'
                + balance + '</div></td></tr>';
          }/*
             * else{ html += '<tr><td width="35%">Balance</td><td width="65%"><div
             * class="wordBreakDiv">N/A</div></td></tr>'; }
             */
        }
      }
      
      // footnote
      var signHtml = 'N/A';
      if (nodeName == App.InlineDoc.inlinePrefix + ':nonfraction') {
        if (ele.attr('sign') == '-') {
          signHtml = "Negative";
        } else {
          signHtml = "Positive";
        }
      }
      if (signHtml != 'N/A') {
        html += '<tr><td width="35%">Sign</td><td width="65%"><div class="wordBreakDiv">' + signHtml
            + '</div></td></tr>';
      }
      
      // footnote
      var footnoteHtml = 'N/A';
      
      if (ele.attr('id')) {
        var footnote = ele.htmlDecode(App.InlineDoc.getFootnote(ele.attr('id')));
        if (footnote.length != '') {
          
          footnoteHtml = footnote.substring(0, maxValueTextLength) + '...';
        } else {
          var relationshipArrayLength = App_Find.Highlight.cachedResults.relationship.length;
          var footnoteArrayLength = App_Find.Highlight.cachedResults.footnote.length;
          if (relationshipArrayLength > 1) {
            for (var i = 0; i < relationshipArrayLength; i++) {
              var ithElementOfRelationshipArray = App_Find.Highlight.cachedResults.relationship[i];
              var fromRefs = ithElementOfRelationshipArray.attr('fromRefs').split(" ");
              for (var k = 0; k < fromRefs.length; k++) {
                if (fromRefs[k] == ele.attr('id')) {
                  var toRefs = ithElementOfRelationshipArray.attr('toRefs');
                  for (var j = 0; j < footnoteArrayLength; j++) {
                    var jthElementOfFootNoteArray = App_Find.Highlight.cachedResults.footnote[j];
                    if (jthElementOfFootNoteArray.attr('id') == toRefs) {
                      if (jthElementOfFootNoteArray.attr('continuedAt') != null) {
                        var allLinkedNodes = [];
                        allLinkedNodes = App_Find.Element.groupIxContinuation(jthElementOfFootNoteArray);
                        var footnoteHtmlContinued = " ";
                        for (var l = 0; l < allLinkedNodes.length; l++) {
                          footnoteHtmlContinued = footnoteHtmlContinued.concat(allLinkedNodes[l].text());
                          
                        }
                        footnoteHtml = footnoteHtmlContinued.substring(0, maxValueTextLength) + '...';
                        break;
                      }
                      break;
                    }
                  }
                  break;
                }
              }
              
            }
            
          }
        }
        
      }
      if (footnoteHtml != 'N/A') {
        html += '<tr><td width="35%">Fact Footnote</td><td width="65%"><div class="wordBreakDiv">' + footnoteHtml
            + '</div></td></tr>';
      }
      // type
      var typeHTML = '';
      var type = App.InlineDoc.getIdTypes(xbrId, this, null, function (value, callback) {
        html += '<tr><td width="35%">Type</td><td width="65%">' + ele.htmlDecode(value) + '</td></tr>';
        if (ele.attr('format')) {
          formatAry = ele.attr('format').split(':').slice(-1);
          html += '<tr><td width="35%">Format</td><td width="65%">' + ele.htmlDecode(formatAry[0]) + '</td></tr>';
        }
        ;
        if (callback) {
          callback.apply(value, [ html ]);
        }
        ;
      });
      html += '</table>';
      $('.selection-detail-container').find('[data-content="attributes"]').html(html);
    },
    
    labelDocHTML : '',
    labelsJSON : {},
    updateDefinition : function (parent, callback) {
      if (!App.InlineDoc.getMetaData())
        return;
      var ele = App_Find.Element.element;
      var xbrlId = App_Utils.convertToXBRLId(ele.attr('name'));
      var rows = "";
      var definition = null;
      var roles = null;
      var languages = [ 'en-US', 'en' ];
      for (var i = 0; i < languages.length; i++) {
        l = languages[i];
        roleset = App.InlineDoc.getMetaData().tag[xbrlId].lang[l];
        if (roleset) {
          roleset = roleset['role'];
          if (roleset && definition == null) {
            definition = roleset['documentation']
          }
          if (l == 'en-US') {
            roles = roleset
          }
        }
      }
      if (definition) {
        rows += '<tr><td width="35%">Definition</td><td width="65%"><div class="wordBreakDiv">'
            + ele.htmlDecode(definition) + '</div></td></tr>';
        html = '<table class="table-framed">' + rows + '</table>';
        $('.selection-detail-container').find('[data-content="labels"]').html(html);
        // if(callback) callback.apply(parent,[html]);
      }
      for (role in roles) {
        if (role != "documentation") {
          var label = roles[role];
          rows += '<tr><td width="35%">' + role + '</td><td width="65%"><div class="wordBreakDiv">'
              + ele.htmlDecode(label) + '</div></td></tr>';
        }
      }
      html = '<table class="table-framed">' + rows + '</table><br/>';
      $('.selection-detail-container').find('[data-content="labels"]').html(html);
      if (callback)
        callback.apply(parent, [ html ]);
    },
    CalculationValuesJSON : {},
    updateCalculation : function (parent, callback) {
      var ele = App_Find.Element.element;
      var xbrlId = ele.convertNameToXBRLId();
      var container = $('.selection-detail-container');
      // var dimensions = App_Find.Element.getDimensionsForElement(ele);
      var result = App.InlineDoc.getMetaLinks();
      if (!result) {
        var token = App.loadStatuses.failed;
        this.CalculationValuesJSON.section = token;
        this.CalculationValuesJSON.parent = token;
        this.CalculationValuesJSON.weight = token;
        this.CalculationValuesJSON.balance = token;
      } else {
        var token = 'N/A';
        this.CalculationValuesJSON.section = token;
        this.CalculationValuesJSON.parent = token;
        this.CalculationValuesJSON.weight = token;
        this.CalculationValuesJSON.balance = token;
        container.find('[data-content="section"]').html(this.CalculationValuesJSON.section);
        container.find('[data-content="parent"]').html(this.CalculationValuesJSON.parent);
        container.find('[data-content="weight"]').html(this.CalculationValuesJSON.weight);
        container.find('[data-content="balance"]').html(this.CalculationValuesJSON.balance);
        App.InlineDoc.getCalculationJSON(xbrlId, this, function (value) {
          this.CalculationValuesJSON = value;
          container.find('[data-content="section"]').html(this.CalculationValuesJSON.section);
          container.find('[data-content="parent"]').html(this.CalculationValuesJSON.parent);
          container.find('[data-content="weight"]').html(this.CalculationValuesJSON.weight);
          container.find('[data-content="balance"]').html(this.CalculationValuesJSON.balance);
          
        });
        if (callback)
          callback.apply(parent, [ this.CalculationValuesJSON ]);
      }
    },
    
    reference : {},
    refnum : [],
    updateReference : function (parent, callback) {
      
      var result = App.InlineDoc.getMetaLinks();
      if (!result)
        return;
      var ele = App_Find.Element.element;
      var xbrlId = ele.convertNameToXBRLId();
      var auth_refArrayNew = App.InlineDoc.getMetaData().tag[xbrlId].auth_ref;
      var auth_refArray = [];
      var auth_refArrayNew1 = [];
      var contextRef = ele.attr('contextRef');
      var elementNew = App.InlineDoc.getContext(contextRef);
      items = elementNew.find('*').filter(function () {
        
        var xbrlchek = (this.nodeName.toLowerCase()).replace('member', 'Member');
        
        return xbrlchek == "xbrldi" + ":explicitMember";
      });
      var axisLabel = "";
      var memberLabel = "";
      items.each(function (index, element) {
        var ele = $(element);
        axisLabel = ele.attr('dimension').replace(':', ('_'));
        auth_refArrayNew.push(App.InlineDoc.getMetaData().tag[axisLabel].auth_ref);
        memberLabel = ele.html().replace(':', ('_'));
        auth_refArrayNew.push(App.InlineDoc.getMetaData().tag[memberLabel].auth_ref);
        
      });
      for (var i = 0; i < auth_refArrayNew.length; i++) {
        if (auth_refArrayNew[i].length != 0) {
          auth_refArrayNew1.push(auth_refArrayNew[i]);
        }
      }
      for (var index = 0; index <= auth_refArrayNew1.length - 1; index++) {
        
        if (Object.prototype.toString.call(auth_refArrayNew1[index]) !== '[object Array]') {
          pushtonewArr(auth_refArrayNew1[index]);
        } else/*
               * if( Object.prototype.toString.call( auth_refArray[index] ) ==
               * '[object Array]' )
               */{
          var inArr = auth_refArrayNew1[index];
          for (var j = 0; j <= inArr.length - 1; j++) {
            pushtonewArr(inArr[j]);
          }
        }
        
      }
      function pushtonewArr (element) {
        var found = false;
        for (var i = 0, max = auth_refArray.length; i <= max; i++) {
          if (auth_refArray[i] == element) {
            found = true;
            break;
          }
        }
        if (!found) {
          auth_refArray.push(element)
        }
      }
      var std_refs = App.InlineDoc.getMetaRefs();
      var count = 0, rows = "";
      for ( var ref_idx in auth_refArray) {
        if (count > 0) {
          rows += "<tr style='empty-cells: hide;'><td colspan='2'></td></tr>";
        }
        count++;
        ref_id = auth_refArray[ref_idx];
        ref_parts = std_refs[ref_id];
        for (ref_key in ref_parts) {
          ref_value = ref_parts[ref_key];
          
          if (ref_key != "URI") {
            rows += '<tr>' + '<td width="35%">' + ele.htmlDecode(ref_key) + '</td>'
                + '<td width="65%"><div class="wordBreakDiv">';
          } else {
            rows += '<tr>' + '<td width="35%">' + ele.htmlDecode(ref_key)
                + '<br><p style="font-size:10px">(Will Leave SEC Website)' + '</td>'
                + '<td width="65%"><div class="wordBreakDiv">';
          }
          
          if (ref_key == "URI") {
            ref_value = '<a href = ' + encodeURI(ref_value) + ' target="_blank">' + ref_value + '</a>';
          }
          rows += ref_value + '</div></td>' + '</tr>';
        }
      }
      var html = "";
      if (count == 0) {
        html = "No Data";
      } else {
        html = "<table class = 'table-framed'>" + rows + "</table><br/>";
      }
      $('.selection-detail-container').find('[data-content="reference"]').html(html);
      if (callback)
        callback.apply(this, [ html ]);
    },
    typeHTML : '',
    CustomJSON : {},
    updateCustomDetail : function (parent, callback) {
      
      var result = App.InlineDoc.getMetaLinks();
      if (!result)
        return;
      var ele = App_Find.Element.element;
      var xbrlId = ele.convertNameToXBRLId();
      var custom_refArray = App.InlineDoc.getMetaData().tag[xbrlId].custom;
      var customLinks = App.InlineDoc.getMetaMoreData();
      var count = 0;
      var rows1 = "";
      var html1 = "";
      var container = $('#selection-detail-container');
      for ( var custom_idx in custom_refArray) {
        if (count > 0) {
          rows1 += "<tr style='empty-cells: hide;'><td colspan='2'></td></tr>";
        }
        count++;
        custom_id = custom_refArray[custom_idx];
        custom_parts = customLinks[custom_id];
        var customLink = App.InlineDoc.getSelectedCustomData(xbrId, this, null, function (value) {
        });
        for (custom_key in custom_parts) {
          custom_value = custom_parts[custom_key];
          var customValue = custom_value;
          for (var i = 0; i < customValue.length; i++) {
            if (customValue[i] == "2") {
              arr1 = customValue.splice(i + 1, customValue.length);
              arr2 = arr1.splice(i + 1, arr1.length);
              for (var n = 0; n < arr1.length; n++) {
                rows1 += '<tr>' + '<td width="35%">' + arr1[n] + '</td>' + '<td width="65%"> ' + arr1[n + 1] + '</td>';
                n = n + 1;
              }
              arr3 = arr2.splice(i, arr2.length);
              for (var j = 0; j < arr3.length; j++) {
                rows1 += '<tr>' + '<td width="35%">' + arr3[j] + '</td>' + '<td width="65%"> ' + arr3[j + 1] + '</td>';
                j = j + 1;
              }
            }
          }
        }
      }
      
      if (count == 0) {
        html1 = "No Data";
      } else {
        html1 = "<table class = 'table-framed'>" + rows1 + "</table><br/>";
      }
      container.find('[data-content="custom"]').html(html1);
      if (callback)
        callback.apply(this, [ html1 ]);
    },
    getLabelFromLabels : function (labels) {
      
      var labelHTML = null;
      if (labels && labels.length > 0) {
        
        labels.each(function (index, element) {
          
          var node = $(element);
          var prefix = App.InlineDoc.nsLookupByValue(App.InlineDoc.namespaces.xlink, true);
          if (node.attr(prefix + ':role') == App.XBRLDoc.namespaces.label.label) {
            
            labelHTML = node.text();
            if (node.attr(prefix + ':label').split('_')[0] == App.InlineDoc.customPrefix) {
              
              labelHTML = '*' + labelHTML;
            }
            return false;
          }
        });
      }
      return labelHTML;
    },
    getDimensionsForElement : function (ele) {
      
      var dimensions = [];
      var contextRef = ele.attr('contextRef');
      var segments = App.InlineDoc.getSegmentsForContext(contextRef);
      if (segments) {
        segments.each(function (index, element) {
          
          $(element).children().each(
              function (index, element) {
                
                var node = $(element);
                
                // axis label
                var axisLabel = node.attr('dimension');
                var axislval = App.InlineDoc.getSelectedLabel(App_Utils.convertToXBRLId(axisLabel), this, null,
                    function (value) {
                      
                      axisLabel = value + ' - ' + axisLabel;
                      return false;
                      
                    });
                
                // member label
                var memberLabel = node.html();
                var memberlval = App.InlineDoc.getSelectedLabel(App_Utils.convertToXBRLId(memberLabel), this, null,
                    function (value) {
                      
                      memberLabel = value + ' - ' + memberLabel;
                      return false;
                      
                    });
                
                dimensions.push({
                  axis : axisLabel,
                  member : memberLabel
                });
              });
        });
      }
      return dimensions;
    },
    copyToClipboard : function () {
      
      var clipboardText = '';
      var container = $('#selection-detail-container');
      
      // get attributes
      clipboardText += "ATTRIBUTES \n";
      
      container.find('div[data-slide-index="0"] tr').each(function (index, element) {
        var x = 0;
        $(this).find('td').each(function (index, element) {
          var node = $(element);
          
          var myStr = node.text();
          
          if (node.text().indexOf('...') > -1) {
            myStr = myStr.replace(/\s{2,}/g, ' ');
          }
          
          if (x < 1) {
            clipboardText += myStr;
          } else {
            if (node.text() == "debit") {
              clipboardText += ":&nbsp;&nbsp;" + "Debit";
            } else if (node.text() == "credit") {
              clipboardText += ":&nbsp;&nbsp;" + "Credit";
            } else {
              clipboardText += ":&nbsp;&nbsp;" + myStr;
            }
            
          }
          x++;
        });
        
        clipboardText += "\n";
      });
      
      // get definition and label information
      App_Find.Element.updateDefinition(this, function (value) {
        clipboardText += "\nLABELS \n";
        $('#selection-detail-container').find('div[data-slide-index="1"]').find('tr').each(function (index, element) {
          var x = 0;
          $(this).find('td').each(function (index, element) {
            var node = $(element);
            if (x < 1) {
              clipboardText += node.text() + ":&nbsp;&nbsp;";
            } else {
              clipboardText += node.text();
            }
            x++;
          });
          clipboardText += "\n";
          
        });
        
      });
      
      // get references
      App_Find.Element.updateReference(this, function (value) {
        clipboardText += "\nREFERENCES \n";
        if ($('#selection-detail-container').find('div[data-slide-index="2"]').text() != "No Data") {
          $('#selection-detail-container').find('div[data-slide-index="2"]').find('tr').each(function (index, element) {
            var x = 0;
            $(this).find('td').each(function (index, element) {
              var node = $(element);
              if (node.text()) {
                if (x < 1) {
                  clipboardText += node.text() + ":&nbsp;&nbsp;";
                } else {
                  clipboardText += node.text();
                }
              }
              x++;
            });
            clipboardText += "\n";
          });
        } else {
          clipboardText += " No Data\n";
        }
        
      });
      
      // get calculation
      
      App_Find.Element.updateCalculation(this, function (value) {
        clipboardText += "\nCALCULATION \n";
        $('#selection-detail-container').find('div[data-slide-index="3"]').find('tr').each(function (index, element) {
          var x = 0;
          $(this).find('td').each(function (index, element) {
            var node = $(element);
            if (x < 1) {
              clipboardText += node.text() + ":&nbsp;&nbsp;";
            } else {
              if (node.text().trim() == "debit") {
                clipboardText += "Debit";
              } else if (node.text().trim() == "credit") {
                clipboardText += "Credit";
              } else {
                clipboardText += node.text().replace(/\s+/g, " ").replace(/^\s|\s$/g, "");
              }
            }
            x++;
          });
          clipboardText += "\n";
        });
      });
      
      var myWindow = window.open("", "MsgWindow",
          "toolbar=no, scrollbars=yes, resizable=yes, top=200, left=500, width=400, height=400");
      
      // myWindow.document.write("<html><head><title>Copy
      // All</title></head><body><textarea id='popTxtArea' rows='25'
      // cols='50'>"+clipboardText+"</textarea></body></html>");
      // DE560 IE FIX
      if ($.browser.msie) {
        myWindow.document
            .write("<html><head><title>Copy All</title></head><body><textarea id='popTxtArea' rows='25' cols='50' style='width:98.7%'>"
                + clipboardText + "</textarea></body></html>");
      } else {
        myWindow.document
            .write("<html><head><title>Copy All</title></head><body><textarea id='popTxtArea' rows='25' cols='50'>"
                + clipboardText + "</textarea></body></html>");
      }
      
      myWindow.focus();
      myWindow.document.getElementById("popTxtArea").focus();
      myWindow.document.getElementById("popTxtArea").select();
    }
  }
};