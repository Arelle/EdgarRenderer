/*
 * Primary Application Object
 * The App object initializes the application and provides
 * standard functionality to the rest of the application pieces (App_Find, App_About etc)
 * Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 * */
var App = {
    Version: '1.0.0.91',
    InlineDoc:null,
    XMLInlineDoc:null,
    XBRLDoc:null,
    frame:null,
    fileNames:{
        filing: {
            inline: '',
            schema: '',
            label: '',
            calculation: ''
        },
        refs:{
            schema:'',
            label:'',
            documentation:''

        }
    },
    fileSelect:{
        inlineLoaded:false,
        customLoaded:false,
        refLoaded:false
    },
    loadStatuses: {
        loading:'[loading]',
        loaded:'[not provided]',
        failed:'[not available]'
    },
    init:function() {
	    $(".fixedMenuBar").css('pointer-events', 'none');
    	$(".fixedMenuBar").css('opacity', '0.5');
        $("#version").text("Inline XBRL Viewer "+App.Version);
		(function(doc) {
			var viewport = document.getElementById('viewport');
			if ( navigator.userAgent.match(/iPhone/i)) {
				viewport.setAttribute("content", "initial-scale=0.20");
                document.getElementById("dataFilter").classList.add("hidden-md");
				document.getElementById("dataFilter").classList.add("hidden-lg");
				document.getElementById("tags").classList.add("hidden-md");
				document.getElementById("tags").classList.add("hidden-lg");
				document.getElementById("menu").classList.add("hidden-md");
				document.getElementById("menu").classList.add("hidden-lg");
				document.getElementById("taggedSections").classList.add("hidden-md");
				document.getElementById("taggedSections").classList.add("hidden-lg");
				document.getElementById("moreFilters").classList.add("hidden-md");
				document.getElementById("moreFilters").classList.add("hidden-lg");
				document.getElementById("factList").classList.add("hidden-md");
				document.getElementById("factList").classList.add("hidden-lg");
                document.getElementById("taggedSectionsReport").classList.remove("hidden-md");
				document.getElementById("taggedSectionsReport").classList.remove("hidden-lg");
				document.getElementById("taggedSectionsReport").classList.add("visible-md");
				document.getElementById("taggedSectionsReport").classList.add("visible-lg");
				document.getElementById("dataFilterLink").classList.remove("hidden-md");
				document.getElementById("dataFilterLink").classList.remove("hidden-lg");
				document.getElementById("dataFilterLink").classList.add("visible-md");
				document.getElementById("dataFilterLink").classList.add("visible-lg");
				document.getElementById("tagsFilterLink").classList.remove("hidden-md");
				document.getElementById("tagsFilterLink").classList.remove("hidden-lg");
				document.getElementById("tagsFilterLink").classList.add("visible-md");
				document.getElementById("tagsFilterLink").classList.add("visible-lg");

			} else if ( navigator.userAgent.match(/iPad/i) ) {
				viewport.setAttribute("content", "initial-scale=0.90");
			}
		}(document));
        App.showLoadingDialog({
            message:"loading document...",
            percent:100
        }, function() {

            // listen for setting changes
            $("body").on("settingChanged", function(e) {

                App.updateDocStyle();
                if (e.settingKey == "focusHighlightColor") {

                    App_Find.Results.refreshHighlightColor();
                }
            });

            // remove toolbar buttons for phones and tablets
            if (/iPhone|iPod|iPad/.test(navigator.userAgent)) {

                $('#toolbar-btns-container').css('display', 'none');
            } else {

                // apply hover to elements
                $('#app-panel-logo-container').find('[title]').each(function(index, element) {

                    $(element).tooltip({placement:'bottom'});
                });

                $('#selection-detail-container').find('[title]').each(function(index, element) {

                    $(element).tooltip({placement:'bottom'});
                });
                $('#about-modal').find('[title]').each(function(index, element) {

                    $(element).tooltip({placement:'bottom'});
                });

                $('#app-panel-container').find('[title]').each(function(index, element) {

                    $(element).tooltip({placement:'left'});
                });
            }

            // wire up close button for message box
            $('#message-box-container').find('.message-btn').first().on('click', function() {
            	
            	 if($("#filterDataDiv").height()==0){
            		 $('.modal').css("top", "0px");
            	 }
            	 if($("#filterDataDiv").height()==23){
            		 $('.modal').css("top", "25px");
            	 }
            	 if($("#filterDataDiv").height()==46){
            		 $('.modal').css("top", "50px");
            	 }
                $('#app-panel-reports-container .toolbar h4').css("marginTop", "5px");
                $('#app-panel-help-container .toolbar h4').css("marginTop", "5px");
                $('#results-header').css("marginTop", "5px");
                App.hideMessage();
            });

            // wire up save button
            $('#btn-save').on('click', function() {

                App_XBRL.saveFilingToDisk();
            });

            // initialize the rest of the UI
            App_Find.init();
            App_About.init();
            App_Settings.init();
            App_Help.init();
            App_RemoteDocs.init();
        });
    },
    resetUI:function() {

        // reset UI back to original state.
        App.InlineDoc = null;
        App.XBRLDoc = null;
        App_About.resetUI();
        App_Find.resetUI();
    },
    showMessage:function(message, options, callback) {

        options = $.extend({
            hideAfter:null
        }, options);

        $('#message-content').html(message);
        $('#message-box-container').slideDown();
        if($("#filterDataDiv").height()==0){
            $("#message-box-container").css("top", "30px");
            if($("#message-box-container").height()>0){
            $(".modal").css("top","40px");
            $('#app-panel-reports-container .toolbar h4').css("marginTop", "40px");
            $('#app-panel-help-container .toolbar h4').css("marginTop", "40px");
            $('#results-header').css("marginTop", "40px");
            }
            
        }
		else if($("#filterDataDiv").height()==23){
            $("#message-box-container").css("top", "55px");
            $(".modal").css("top","65px");
        }
        else if($("#filterDataDiv").height()==46){
        	$("#message-box-container").css("top", "80px");
        	$(".modal").css("top","90px");
        }else if($("#filterDataDiv").height()==69){
        	$("#message-box-container").css("top", "105px");
        	$(".modal").css("top","115px");
        }else if($("#filterDataDiv").height()==92){
        	$("#message-box-container").css("top", "130px");
        	$(".modal").css("top","140px");
        }else if($("#filterDataDiv").height()==115){
        	$("#message-box-container").css("top", "155px");
        	$(".modal").css("top","165px");
        }
        if (options.hideAfter) {

            setTimeout(function() {

                App.hideMessage();
            }, options.hideAfter);
        }

        if (typeof callback == "function") {

            callback();
        }
    },
    hideMessage:function() {

        $('#message-content').html('');
        $('#message-box-container').slideUp();
    },
    showLoadingDialog:function(options, callback) {

        options = $.extend({
            message:null,
            percent:0
        }, options);

        //$('.progress-bak').css('display', 'block');
        //$('.progress-container').css('display', 'block');

        if (options.message) {

            $('.progress-container').find('h3').html(options.message).css('display', 'block');
        } else {

            $('.progress-container').find('h3').html('').css('display', 'none');
        }
        App.updateLoadingDialogProgress(options.percent);

        if (typeof callback == "function") {

            callback();
        }
    },
    hideLoadingDialog:function() {

        //$('.progress-bak').css('display', 'none');
        $('.progress-container').css('display', 'none');
    },
    showSpinner:function(ele, callback) {

        ele.append('<div class="spinner" style="position:absolute;left:45%;top:43%;zindex:2000000;"><div class="double-bounce1"></div><div class="double-bounce2"></div></div>');
        setTimeout(function() {
        	try
        	{
        		callback();
        	}
        	catch(Error)
        	{
        		
        		App.showMessage("Selected feature has encountered a processing issue.");	
                App.hideSpinner();
        	}
        }, 200);
    },
        showSpinner1:function(ele, callback) {

        ele.append('<div class="spinner" style="position:absolute;top:20%;left:50%;zindex:2000000;"><div class="double-bounce1"></div><div class="double-bounce2"></div></div>');
        setTimeout(function() {
        	try
        	{
        		callback();
        	}
        	catch(Error)
        	{
        		App.showMessage("Selected feature has encountered a processing issue.");
        		App.hideSpinner();
        	}
        }, 200);
    },
	showToolbarSpinner:function(ele, callback) {
        ele.append('<div class="toolbarSpinner" style="position:absolute;top:0%;left:50%;zindex:2000000;"><div class="double-bounce1"></div><div class="double-bounce3"></div></div>');
        setTimeout(function() {
        	try
        	{
        		callback();
        	}
        	catch(Error)
        	{
        		App.showMessage("Selected feature has encountered a processing issue.");
        		App.hideToolbarSpinner();
        	}
        }, 200);
    },
    hideToolbarSpinner:function() {

        $('.toolbarSpinner').remove();
    },
    hideSpinner:function() {

        $('.spinner').remove();
    },
    updateLoadingDialogProgress:function(percent, callback) {

        $('.progress-container').find('.progress-bar').css('width', percent + '%');

        if (typeof callback == "function") {

            callback();
        }
    },
    updateDocStyle:function() {
    	
        var frameHead = App.frame.contents().find('head');
        var style = App.frame.contents().find('#sec-app-style').first();
        var styleStr = '.sec-cbe-highlight-dashed { border-top: 2px solid ' + App_Settings.get('elementBorderColor') + '!important; cursor: pointer; border-bottom: 2px solid ' + App_Settings.get('elementBorderColor') + '!important ; cursor: pointer;}' + 
            '.sec-cbe-highlight-dashed-highlight { border: 0px !important; cursor: pointer; }' +
            '.sec-cbe-highlight-block { display:block;}' +
			'.applydivstyles { clear: none !important; }' +
            '.applyhrstyles { width: 0pt !important; clear: none !important;}' +
            '.sec-cbe-highlight-dashed_block { border-left: 0px solid ' + App_Settings.get('elementBorderColor') + '!important; border-top:0px !important; border-bottom:0px !important;margin-left:6px;margin-bottom:3px;}' +
            '.sec-cbe-highlight-block-continuation { display:block;}' +
            '.sec-cbe-highlight-inline { display:inline }' +
            '.sec-cbe-highlight-hover-content {background-color:' + App_Settings.get('blockHighlightColor') + ' !important; cursor: pointer;border: 2px dotted ' + App_Settings.get('elementBorderColor') + '}' +
            '.sec-cbe-highlight-hover-over-content-selected {border: 2px solid ' + App_Settings.get('focusContentSelectionColor') + '!important; cursor: pointer;}' +
            '.sec-cbe-highlight-content-selected { background-color:' + App_Settings.get('blockHighlightColor') + ' !important ; cursor: pointer;}'+
			'.sec-cbe-highlight-filter-block-content-selected { background-color:' + App_Settings.get('blockHighlightColor') + ' !important ; cursor: pointer;}'+
            '.sec-cbe-highlight-left-border {border-left: 2px dashed ' + App_Settings.get('focusHighlightColor') + ';}'+
            '.sec-cbe-highlight-filter { background-color:' + App_Settings.get('initialHighlightColor') + '!important; }' +
            '.sec-cbe-highlight-filter * { background-color:' + App_Settings.get('initialHighlightColor') + '!important; }' +
             '.sec-cbe-highlight-filter-selected { border: 3px solid ' + App_Settings.get('focusHighlightColor') + '!important; cursor: pointer; }' +
             '.sec-cbe-highlight-filter-selected-block { border-left: 0px solid ' + App_Settings.get('focusHighlightColor') + '!important; background-color:' + App_Settings.get('blockHighlightColor') + '  ;cursor: pointer; }' +
             '.sec-cbe-highlight-filter-selected-nodes { border: 0px solid ' + App_Settings.get('focusHighlightColor') + '!important; cursor: pointer; }' +
             '.sec-cbe-highlight-filter-content-selected {background-color:' + App_Settings.get('blockHighlightColor') + '; cursor: pointer;}' +
           // '.sec-cbe-highlight-content-selected { background-color:#CDCDCD !important ; cursor: pointer;}'+
            '.sec-cbe-highlight-inline-block { display:inline}';
        if (style.length == 0) {

            frameHead.append('<style id="sec-cbe-style" type="text/css">' + styleStr + '</style>');
        } else {

            style.html(styleStr);
        }
    }
};

var App_RemoteDocs = {
    init:function() {

        // parse the url so we can load the instance document
        var uri = URI(window.location.href);
        var queryAry = URI.parseQuery(uri.query());
        var dir;
        var query;
        if (queryAry['file']) {
            query = queryAry['file'];
        } else if (queryAry['doc']) {
            query = queryAry['doc'];
        } else {
        	App.showMessage("Missing ?doc= in "+uri.path());
        	App.hideLoadingDialog();
        	return;
        };
        xbrlStr = queryAry['xbrl'];
        //var docPath = "../documents/"+query;
        var docPath = query;
        query = URI(query);
        var docBasePath = query.filename();
        App.frame = $('#app-inline-xbrl-doc');
        /*App.frame.on('load', function(event) {

            // get an InlineDoc instance so we can query it
            App.InlineDoc = new cbe.InlineDoc(App.frame);

            // add some basic styling available to the document.
            // note - this is as minimal as possible
            App.updateDocStyle();
            
            if (!App.fileSelect.inlineLoaded) {
            	//App.InlineDoc.getMetaLinks();
            	App.hideLoadingDialog();
            }
            
            $($('#app-inline-xbrl-doc').contents()).on('click', function(e){            	
               $("#mainDiv li").removeClass( "dropdown open" ).addClass( "dropdown" )
            });
			$(".fixedMenuBar").css('pointer-events', 'none');
            $(".fixedMenuBar").css('opacity', '0.5');
			//App.showToolbarSpinner($('#mainDiv'), function() {
           // });
            // highlight the tagged elements
			//setTimeout(function() {
            //App_Find.Highlight.highlight();
			//},10000);
            
        });*/
        if (docPath && docPath != '') {

            var filename = docBasePath;
            App.fileNames.filing.inline = filename.substring(0, filename.indexOf('.'));
            App.frame.attr('src', docPath);
			 App.showToolbarSpinner($('#mainDiv'), function() {
            });
        } else {

            App.hideLoadingDialog();
        }
        
        App_RemoteDocs.initSaveAs(docPath,docBasePath);
        
    },
    initSaveAs:function(docPath,docBasePath){
    	
    	var hrefPath = "#";
        var hrefZip = "#";
         
        var dir = docPath.substring(0, docPath.lastIndexOf("/")+1);
        
        // getting _htm.xml file details
        var fileName = docBasePath.substring(0, docBasePath.indexOf('.')) +"_htm.xml";
		var openfileName = docBasePath.substring(0, docBasePath.indexOf('.')) +".htm";
        hrefPath = dir + fileName;
		openhrefPath = dir + openfileName;
        $('#instanceFile').attr('href',hrefPath);
		$("#openAsHtml").attr('href',openhrefPath);
        $('#instanceFileIE').on('click', function() {
                
             var _window = window.open(hrefPath, '_blank');
             _window.document.close();
             _window.document.execCommand('SaveAs', true, fileName || fileURL);
             _window.close();
         });
        
        // getting .zip file details
        var pathElements = dir.replace(/\/$/, '').split('/');
        var lastFolder = pathElements[pathElements.length - 1];
        var zipFileName ="";
        
        if(lastFolder.length==18 && !(isNaN(lastFolder))){
        	
        	zipFileName =  lastFolder.replace(/(\d{10})(\d{2})(\d{6})/, "$1-$2-$3") + "-xbrl.zip";
        }else{
        	
        	zipFileName = docBasePath.substring(0, docBasePath.indexOf('.')) +".zip";
        }
        hrefZip = dir + zipFileName;
        $('#instanceAndCustomFile').attr('href',hrefZip);
        
        
        if(hrefPath=="#"){
               $('#instanceFileIE').on('click', function() {

                      App.showMessage("File does not exist at the specified path");
             });
               $('#instanceFile').on('click', function() {

                      App.showMessage("File does not exist at the specified path");
                      event.preventDefault();
             });
        }
        if(hrefZip=="#"){
               $('#instanceAndCustomFile').on('click', function() {

                      App.showMessage("File does not exist at the specified path");
             });
        }
		 if(openhrefPath=="#"){
            $('#openAsHtml').on('click', function() {

                   App.showMessage("The Inline XBRL document could not be found.");
          });
     }
     },
    initReferenceDocs:function(docBasePath) {

        var ns = App.InlineDoc.nsLookupByKey(App.InlineDoc.standardTaxonomy);
        if (ns) {

            var valAry = ns.split('/');
            //var refBaseFileName = App.InlineDoc.standardTaxonomy+"-" + valAry[valAry.length - 1];

            var refDocs = {
                schema:undefined,
                label:undefined,
                documentation:undefined
            };
            var basePathAry = docBasePath.split('/');
            basePathAry.pop();
            var refBasePath = basePathAry.join("/");
            App_RemoteDocs.loadReferenceDocs(refBasePath, refDocs);
        }
    },
    loadFilingDocs:function(docBasePath) {
    	App.showMessage("loadFilingDocs",null,null);alert("YOU.LOSE - loadFilingDocs");
        // check that this is a gaap document
        if (App.InlineDoc.nsLookupByKey(App.InlineDoc.standardTaxonomy)) {

            var schemaFilename = App.InlineDoc.getSchemaDocRef();
            if (schemaFilename) {

                var gaapDirAry = docBasePath.split('/');
                gaapDirAry.pop();
                var basePath = gaapDirAry.join("/");

                // load the filing documents
                var labelFilename = schemaFilename.replace('.xsd', '_lab.xml');
                var calcFilename = schemaFilename.replace('.xsd', '_cal.xml');

                var docs = {};
                var docsLoadCompleted = {
                    schema:false,
                    label:false,
                    calculation:false
                };

                var setXBRLDoc = function() {

                    if (docsLoadCompleted.schema && docsLoadCompleted.label && docsLoadCompleted.calculation) {

                        App.fileNames.filing.schema = schemaFilename;
                        App.fileNames.filing.label = labelFilename;
                        App.fileNames.filing.calculation = calcFilename;

                        App.XBRLDoc = new cbe.XBRLDoc();
                        App.XBRLDoc.setFilingDocs(docs);
                        App_RemoteDocs.initReferenceDocs(docBasePath)
                    }
                };

                // load the schema document
                App_Utils.loadDocument(docBasePath + "/" + schemaFilename, function(schemaDoc) {

                    if (schemaDoc) {

                        docs.schema = schemaDoc;
                    }
                    docsLoadCompleted.schema = true;
                    setXBRLDoc();
                });

                // load the label document
                App_Utils.loadDocument(docBasePath + "/" + labelFilename, function(labelDoc) {

                    if (labelDoc) {

                        docs.label = labelDoc;
                    }
                    docsLoadCompleted.label = true;
                    setXBRLDoc();
                });

                // load the calculation document
                App_Utils.loadDocument(docBasePath + "/" + calcFilename, function(calcDoc) {

                    if (calcDoc) {

                        docs.calculation = calcDoc;
                    }
                    docsLoadCompleted.calculation = true;
                    setXBRLDoc();
                });
            }
        } else {

            App.hideLoadingDialog();
        }
    },
    loadReferenceDocs:function(refBasePath, refDocs) {

        var filename, docKey;
        for(var k in App.fileNames.refs) {

            if (App.fileNames.refs[k] != '' && refDocs[k] === undefined) {

                docKey = k;
                filename = App.fileNames.refs[k];
                break;
            }
        }

        if (filename) {

            App_Utils.loadDocument(
                refBasePath + '/' + filename,
                function(doc) {

                    if (doc) {

                        refDocs[docKey] = doc;
                    } else {

                        App.fileNames.refs[docKey] = '';
                        refDocs[docKey] = null;
                    }

                    App_RemoteDocs.loadReferenceDocs(refBasePath, refDocs);
                }
            );
        } else {

            App.XBRLDoc.setRefDocs(refDocs);
            App.hideLoadingDialog();
        }
    }
};

/*
 * App_XBRL
 * */
var App_XBRL = {
    saveFilingToDisk:function() {

    	var filename = App.fileNames.filing.inline == '' ? 'filing' : App.fileNames.filing.inline;
        var xmlFilename = App.fileNames.filing.inline == '' ? 'inline' : App.fileNames.filing.inline;
        var zip = new JSZip();
        zip.file(xmlFilename + '_htm.xml', App_XBRL.inlineDocToXML());
        var content = zip.generate({type:"blob"});

        saveAs(content, filename + '.zip');
    },
    inlineDocToXML:function() {

        var processedElements = [];
        var xmlDoc = App.XMLInlineDoc;
        if (!App.XMLInlineDoc) {

            App_Utils.loadDocument(App.frame.attr('src'), function(doc) {

                xmlDoc = doc;
            }, {async:false});
        }

        // initialize the xml document
        var namespaces = App.InlineDoc.getDocumentNamespaces();
        var namespaceStr = '';
        for (var k in namespaces) {

            namespaceStr += 'xmlns:' + k + '="' + namespaces[k] + '" ';
        }
        var p = App.InlineDoc.nsLookupByValue(App.InlineDoc.namespaces.xbrli, true);
        var xmlStr = '<?xml version="1.0" encoding="utf-8"?>' +
            '<!-- Generated By ViewFinder on ' + (new Date()).toDateString() + ' -->' +
            '<' + p + ':xbrl ' + namespaceStr + ' xmlns="http://www.w3.org/1999/xhtml">';


        // references
        var references = xmlDoc.find(App.InlineDoc.inlinePrefix + '\\:references, references');
        xmlStr += references.html();

        // resources
        var resources = xmlDoc.find(App.InlineDoc.inlinePrefix + '\\:resources, resources');

        // remove the relationship tags and create footnotes
        var resourceInstance = resources.clone();
        resourceInstance.find('relationship').each(function(index, element) {

            $(element).remove();
        });
        xmlStr += resourceInstance.html();

        // tagged elements
        var elements = xmlDoc.find('*');
        elements.each(function(index, element) {

            var node = $(element);
            if ($.inArray(node.attr('name'), processedElements) == -1 &&
                (node.attr('name') && element.nodeName.toLowerCase().split(':')[0] == App.InlineDoc.inlinePrefix)) {

                processedElements.push(node.attr('name'));

                // get the XBRL value
                var xbrlValue = node.getXbrlValue();
                if (!xbrlValue) {

                    if (node.attr('format')) {


                        // HF: use ixtFunctions.js module
                        xbrlValue = ixtTransform(node.attr('format'), node.text());
                    } else {

                        // convert html to html entities and remove tagged references
                        var htmlInstance = node.clone();
                        htmlInstance.find('*').each(function (index, element) {

                            if (element.nodeName.toLowerCase().split(':')[0] == App.InlineDoc.inlinePrefix) {

                                $(element).contents().unwrap();
                            }
                        });
                        xbrlValue = htmlEnDeCode.htmlEncode(htmlInstance.html());
                    }
                } else {

                    if (xbrlValue == 'nil') {

                        xbrlValue = "";
                    } else {

                        xbrlValue = xbrlValue.toString().replace(/[^0-9\.]+/g, '');

                        if (xbrlValue == '') {

                            xbrlValue = 0;
                        }
                        if (node.attr('sign')) {

                            xbrlValue = '-' + xbrlValue;
                        }
                    }
                }

                // build attribute string
                var attributeStr = '';
                var excludedAttributes = ["name", "scale", "format", "sign", "escape"];
                var attributes = node[0].attributes;
                for (var j in attributes) {

                    var attribute = attributes[j];
                    if (typeof attribute == 'object' &&
                        $.inArray(attribute.name, excludedAttributes) == -1) {

                        attributeStr += attribute.name + '="' + attribute.value + '" ';
                    }
                }

                // create the tag
                xmlStr += '<' + node.attr('name') + ' ' + attributeStr + '>' + xbrlValue + '</' + node.attr('name') + '>';
            }
        });

        xmlStr += '</' + p  + ':xbrl>';

        return xmlStr;
    }
};

/*
 * App_Utils
 * */
var App_Utils = {
    rPad:function(str, chr, len) {

        len = parseInt(len);
        var paddedStr = str;
        for(var i=0; i<len; i++) {

            paddedStr = paddedStr + chr;
        }
        return paddedStr;
    },
    addCommas:function(nStr) {

        nStr += '';
        x = nStr.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {

            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    },
    applyFormat:function(ele) {
    	var result = ele.text();
    	try {
 			   var format = ele.attr('format').split(':');
 			   var ns = App.InlineDoc.getDocumentNamespaces()[format[0]];
 			   var transformedValue = ixtTransform(ns,format[1],result);
 			   result =  ele.htmlDecode(transformedValue);
 		   } catch (Error) { } // any error in this transformation, return raw string.
 		return result;
    },
    convertToXBRLId:function(name) {

    	if(name){
			return name.replace(':', '_');
		}else{
			return name;
		}
    },
    loadDocument:function(url, callback, options) {

        var _options = $.extend({
            type:'GET',
            dataType:'xml',
            async:true,
            cache:false,
        }, options);

        var xhrFields = {};
        if (_options.async) {

            xhrFields.withCredentials = false;
        }

        $.ajax({
            url:url,
            type:_options.type,
            dataType:_options.dataType,
            cache:_options.cache,
            async:_options.async,
            xhrFields:xhrFields,
            success:function(data) {

                if (callback) {

                    callback($(data));
                }
            },
            error:function(jqXHR, textStatus, errorThrown) {

                console.log(errorThrown);
                if (callback) {

                    callback();
                }
            }
        });
    }
};

var htmlEnDeCode = (function() {
    var charToEntityRegex,
        entityToCharRegex,
        charToEntity,
        entityToChar;

    function resetCharacterEntities() {
        charToEntity = {};
        entityToChar = {};
        // add the default set
        addCharacterEntities({
            '&amp;'     :   '&',
            '&gt;'      :   '>',
            '&lt;'      :   '<',
            '&quot;'    :   '"',
            '&#39;'     :   "'"
        });
    }

    function addCharacterEntities(newEntities) {
        var charKeys = [],
            entityKeys = [],
            key, echar;
        for (key in newEntities) {
            echar = newEntities[key];
            entityToChar[key] = echar;
            charToEntity[echar] = key;
            charKeys.push(echar);
            entityKeys.push(key);
        }
        charToEntityRegex = new RegExp('(' + charKeys.join('|') + ')', 'g');
        entityToCharRegex = new RegExp('(' + entityKeys.join('|') + '|&#[0-9]{1,5};' + ')', 'g');
    }

    function htmlEncode(value){
        var htmlEncodeReplaceFn = function(match, capture) {
            return charToEntity[capture];
        };

        return (!value) ? value : String(value).replace(charToEntityRegex, htmlEncodeReplaceFn);
    }

    function htmlDecode(value) {
        var htmlDecodeReplaceFn = function(match, capture) {
            return (capture in entityToChar) ? entityToChar[capture] : String.fromCharCode(parseInt(capture.substr(2), 10));
        };

        return (!value) ? value : String(value).replace(entityToCharRegex, htmlDecodeReplaceFn);
    }

    resetCharacterEntities();

    return {
        htmlEncode: htmlEncode,
        htmlDecode: htmlDecode
    };
})();

$(window).load(function() {
	App.frame = $('#app-inline-xbrl-doc');
	App.frame.on('load', function(event) {
		// get an InlineDoc instance so we can query it
		App.InlineDoc = new cbe.InlineDoc(App.frame);

		// add some basic styling available to the document.
		// note - this is as minimal as possible
		App.updateDocStyle();

		if (!App.fileSelect.inlineLoaded) {
			App.InlineDoc.getMetaLinks();
			App.hideLoadingDialog();
		}

		$($('#app-inline-xbrl-doc').contents()).on('click', function(e){            	
			$("#mainDiv li").removeClass( "dropdown open" ).addClass( "dropdown" )
		});
	});
    if (($.browser.msie && $.browser.versionNumber >= 10) ||
        ($.browser.mozilla && $.browser.versionNumber >= 22) ||
        ($.browser.chrome && $.browser.versionNumber >= 27) ||
        ($.browser.safari && $.browser.versionNumber >= 7)) {
    	//console.log('navigator.userAgent>>>>'+navigator.userAgent);
    	
        App.init();
    } else if (navigator.userAgent.match('CriOS') && $.browser.versionNumber >= 27){
    	
    	App.init();
	} else {
    	var note = 'Your browser is not compatible with this application.';
    	var browserName = '';
    	//Check if browser is IE or not
        if (navigator.userAgent.search("MSIE") >= 0) {
        	browserName =' Microsoft Internet Explorer';
        }
        //Check if browser is Chrome or not
        else if (navigator.userAgent.search("Chrome") >= 0 && navigator.vendor.indexOf('Google Inc') != 1) {
        	browserName =' Google Chrome';
        }
        //Check if browser is Firefox or not
        else if (navigator.userAgent.search("Firefox") >= 0) {
        	browserName =' Mozilla FireFox';
        }
        //Check if browser is Safari or not
        else if (navigator.userAgent.search("Safari") >= 0 && navigator.userAgent.search("Chrome") < 0 && navigator.vendor.indexOf('Apple Computer') != 1) {
        	browserName =' Apple Safari';
        }        
        //Check if browser is Opera or not
        else if (navigator.userAgent.search("Opera") >= 0) {
        	browserName =' Opera';
        }
        if((null != navigator.userAgent.match('CriOS')) &&  navigator.userAgent.match('CriOS'))
        	browserName =' Google Chrome';
        else if(null != navigator.userAgent.match('CriOS'))
        	browserName ='  Apple Safari';
        
    	//alert("Browser version: " + $.browser.versionNumber);
        note += ' You are currently running '+browserName+' '+$.browser.version+'.';        
        var userAgent = window.navigator.userAgent.toLowerCase();
        
        if(userAgent.indexOf('ipad') != -1 || userAgent.indexOf('iphone') != -1 || userAgent.indexOf('apple') != -1){
        	
        	note += ' <br>Please use a more current version of '+browserName+' in order to use the application.';
        }else if(userAgent.indexOf('android') != -1){
        	
        	note += ' <br>Please use a more current version of Google Chrome or Mozilla Firefox in order to use the application.';
        }else{
        	
        	note += ' <br>Please use a more current version of Microsoft Internet Explorer, Google Chrome or Mozilla Firefox in order to use the application.';
        }
            	
        $('#alert-modal').modal('show');
        document.getElementById('browser-compatibility').innerHTML  =note;
        
    }
});

/*
@author: Mark V Systems Limited (contributed to Arelle open source XBRL platform)
(c) Copyright 2011 Mark V Systems Limited, All rights reserved. 
Provided under the Apache-2 license (see http://arelle.org).
*/

/*
@author: Mark V Systems Limited (contributed to Arelle open source XBRL platform)
(c) Copyright 2011 Mark V Systems Limited, All rights reserved. 
Provided under the Apache-2 license (see http://arelle.org).
*/

function ixtTransform(ns, localName, text) {	
	var ixtFunctions = ixtNamespaceFunctions[ns];
	if (!ixtFunctions) {
		return "no transformations for namespace " + ns;
	} else {
		var ixtFunction = ixtFunctions[localName];
		if (!ixtFunction) {
			return localName + " transformation not implemented in namespace " + ns;
		} else {
			return ixtFunction(text);
		}
	}
}

var dateslashPattern = /^\s*(\d+)\/(\d+)\/(\d+)\s*$/;
var daymonthslashPattern = /^\s*([0-9]{1,2})\/([0-9]{1,2})\s*$/;
var monthdayslashPattern = /^\s*([0-9]{1,2})\/([0-9]{1,2})\s*$/;
var datedotPattern = /^\s*(\d+)\.(\d+)\.(\d+)\s*$/;
var daymonthPattern = /^\s*([0-9]{1,2})[^0-9]+([0-9]{1,2})\s*$/;
var monthdayPattern = /^\s*([0-9]{1,2})[^0-9]+([0-9]{1,2})[A-Za-z]*\s*$/;
var daymonthyearPattern = /^\s*([0-9]{1,2})[^0-9]+([0-9]{1,2})[^0-9]+([0-9]{4}|[0-9]{1,2})\s*$/;
var monthdayyearPattern = /^\s*([0-9]{1,2})[^0-9]+([0-9]{1,2})[^0-9]+([0-9]{4}|[0-9]{1,2})\s*$/;

var dateUsPattern = /^\s*(\w+)\s+(\d+),\s+(\d+)\s*$/;
var dateEuPattern = /^\s*(\d+)\s+(\w+)\s+(\d+)\s*$/;
var daymonthDkPattern = /^\s*([0-9]{1,2})[^0-9]+(jan|feb|mar|apr|maj|jun|jul|aug|sep|okt|nov|dec)([A-Za-z]*)([.]*)\s*$/i;
var daymonthEnPattern = /^\s*([0-9]{1,2})[^0-9]+(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)\s*$/;
var monthdayEnPattern = /^\s*(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)[^0-9]+([0-9]{1,2})[A-Za-z]{0,2}\s*$/;
var daymonthyearDkPattern = /^\s*([0-9]{1,2})[^0-9]+(jan|feb|mar|apr|maj|jun|jul|aug|sep|okt|nov|dec)([A-Za-z]*)([.]*)[^0-9]*([0-9]{4}|[0-9]{1,2})\s*$/i;
var daymonthyearEnPattern = /^\s*([0-9]{1,2})[^0-9]+(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)[^0-9]+([0-9]{4}|[0-9]{1,2})\s*$/;
var daymonthyearInPattern = /^\s*([0-9\u0966-\u096F]{1,2})\s([\u0966-\u096F]{2}|[^\s0-9\u0966-\u096F]+)\s([0-9\u0966-\u096F]{2}|[0-9\u0966-\u096F]{4})\s*$/;
var monthdayyearEnPattern = /^\s*(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)[^0-9]+([0-9]+)[^0-9]+([0-9]{4}|[0-9]{1,2})\s*$/;
var monthyearDkPattern = /^\s*(jan|feb|mar|apr|maj|jun|jul|aug|sep|okt|nov|dec)([A-Za-z]*)([.]*)[^0-9]*([0-9]{4}|[0-9]{1,2})\s*$/i
var monthyearEnPattern = /^\s*(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)[^0-9]+([0-9]{1,2}|[0-9]{4})\s*$/;
var monthyearInPattern = /^\s*([^\s0-9\u0966-\u096F]+)\s([0-9\u0966-\u096F]{4})\s*$/;
var yearmonthEnPattern = /^\s*([0-9]{1,2}|[0-9]{4})[^0-9]+(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)\s*$/;

// TR1-only patterns, only allow space separators, no all-CAPS month name, only 2 or 4 digit years
var daymonthShortEnTR1Pattern = /^\s*([0-9]{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*$/;
var monthdayShortEnTR1Pattern = /^\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+([0-9]{1,2})[A-Za-z]{0,2}\s*$/;
var monthyearShortEnTR1Pattern = /^\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+([0-9]{2}|[0-9]{4})\s*$/;
var monthyearLongEnTR1Pattern = /^\s*(January|February|March|April|May|June|July|August|September|October|November|December)\s+([0-9]{2}|[0-9]{4})\s*$/;
var yearmonthShortEnTR1Pattern = /^\s*([0-9]{2}|[0-9]{4})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*$/;
var yearmonthLongEnTR1Pattern = /^\s*([0-9]{2}|[0-9]{4})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s*$/;

var erayearmonthjpPattern = /^[\s\u00A0]*(\u660E\u6CBB|\u660E|\u5927\u6B63|\u5927|\u662D\u548C|\u662D|\u5E73\u6210|\u5E73)[\s\u00A0]*([0-9]{1,2}|\u5143)[\s\u00A0]*\u5E74[\s\u00A0]*([0-9]{1,2})[\s\u00A0]*\u6708[\s\u00A0]*$/;
var erayearmonthdayjpPattern = /^[\s\u00A0]*(\u660E\u6CBB|\u660E|\u5927\u6B63|\u5927|\u662D\u548C|\u662D|\u5E73\u6210|\u5E73)[\s\u00A0]*([0-9]{1,2}|\u5143)[\s\u00A0]*\u5E74[\s\u00A0]*([0-9]{1,2})[\s\u00A0]*\u6708[\s\u00A0]*([0-9]{1,2})[\s\u00A0]*\u65E5[\s\u00A0]*$/;
var yearmonthcjkPattern = /^[\s\u00A0]*([0-9]{4}|[0-9]{1,2})[\s\u00A0]*\u5E74[\s\u00A0]*([0-9]{1,2})[\s\u00A0]*\u6708\s*$/;
var yearmonthdaycjkPattern = /^[\s\u00A0]*([0-9]{4}|[0-9]{1,2})[\s\u00A0]*\u5E74[\s\u00A0]*([0-9]{1,2})[\s\u00A0]*\u6708[\s\u00A0]*([0-9]{1,2})[\s\u00A0]*\u65E5[\s\u00A0]*$/;

var monthyearPattern = /^[\s\u00A0]*([0-9]{1,2})[^0-9]+([0-9]{4}|[0-9]{1,2})[\s\u00A0]*$/;
var yearmonthdayPattern = /^[\s\u00A0]*([0-9]{4}|[0-9]{1,2})[^0-9]+([0-9]{1,2})[^0-9]+([0-9]{1,2})[\s\u00A0]*$/;

var zeroDashPattern = /^\s*([-]|\u002D|\u002D|\u058A|\u05BE|\u2010|\u2011|\u2012|\u2013|\u2014|\u2015|\uFE58|\uFE63|\uFF0D)\s*$/;
var numDotDecimalPattern = /^\s*[0-9]{1,3}([, \xA0]?[0-9]{3})*(\.[0-9]+)?\s*$/;
var numDotDecimalInPattern = /^(([0-9]{1,2}[, \xA0])?([0-9]{2}[, \xA0])*[0-9]{3})([.][0-9]+)?$|^([0-9]+)([.][0-9]+)?$/;
var numCommaDecimalPattern = /^\s*[0-9]{1,3}([. \xA0]?[0-9]{3})*(,[0-9]+)?\s*$/;
var numUnitDecimalPattern = /^([0]|([1-9][0-9]{0,2}([.,\uFF0C\uFF0E]?[0-9]{3})*))[^0-9,.\uFF0C\uFF0E]+([0-9]{1,2})[^0-9,.\uFF0C\uFF0E]*$/;
var numUnitDecimalInPattern = /^(([0-9]{1,2}[, \xA0])?([0-9]{2}[, \xA0])*[0-9]{3})([^0-9]+)([0-9]{1,2})([^0-9]*)$|^([0-9]+)([^0-9]+)([0-9]{1,2})([^0-9]*)$/;

var monthnumber = {
	           "January":1, "February":2, "March":3, "April":4, "May":5, "June":6, 
               "July":7, "August":8, "September":9, "October":10, "November":11, "December":12, 
               "Jan":1, "Feb":2, "Mar":3, "Apr":4, "May":5, "Jun":6, 
               "Jul":7, "Aug":8, "Sep":9, "Oct":10, "Nov":11, "Dec":12, 
               "JAN":1, "FEB":2, "MAR":3, "APR":4, "MAY":5, "JUN":6, 
               "JUL":7, "AUG":8, "SEP":9, "OCT":10, "NOV":12, "DEC":13, 
               "JANUARY":1, "FEBRUARY":2, "MARCH":3, "APRIL":4, "MAY":5, "JUNE":6, 
               "JULY":7, "AUGUST":8, "SEPTEMBER":9, "OCTOBER":10, "NOVEMBER":11, "DECEMBER":12,
               // danish
               "jan":1, "feb":2, "mar": 3, "apr":4, "maj":5, "jun":6,
               "jul":7, "aug":8, "sep":9, "okt":10, "nov":11, "dec":12
           };

var maxDayInMoTbl = {
	          "01": "30", "02": "29", "03": "31", "04": "30", "05": "31", "06": "30",
              "07": "31", "08": "31", "09": "30", "10": "31", "11": "30", "12":"31",
              1: "30", 2: "29", 3: "31", 4: "30", 5: "31", 6: "30",
              7: "31", 8: "31", 9: "30", 10: "31", 11: "30", 12:"31"};
function maxDayInMo(mo) {
	if (mo in maxDayInMoTbl)
		return maxDayInMoTbl[mo];
	return "00";
}

var gLastMoDay = [31,28,31,30,31,30,31,31,30,31,30,31];

var gregorianHindiMonthNumber = {
                "\u091C\u0928\u0935\u0930\u0940": "01",
                "\u092B\u0930\u0935\u0930\u0940": "02", 
                "\u092E\u093E\u0930\u094D\u091A": "03", 
                "\u0905\u092A\u094D\u0930\u0948\u0932": "04",
                "\u092E\u0908": "05", 
                "\u091C\u0942\u0928": "06",
                "\u091C\u0941\u0932\u093E\u0908": "07", 
                "\u0905\u0917\u0938\u094D\u0924": "08",
                "\u0938\u093F\u0924\u0902\u092C\u0930": "09",
                "\u0905\u0915\u094D\u0924\u0942\u092C\u0930": "10",
                "\u0928\u0935\u092E\u094D\u092C\u0930": "11",
                "\u0926\u093F\u0938\u092E\u094D\u092C\u0930": "12"
            };

var sakaMonthNumber = {
                "Chaitra":1, "\u091A\u0948\u0924\u094D\u0930":1,
                "Vaisakha":2, "Vaishakh":2, "Vai\u015B\u0101kha":2, "\u0935\u0948\u0936\u093E\u0916":2, "\u092C\u0948\u0938\u093E\u0916":2,
                "Jyaishta":3, "Jyaishtha":3, "Jyaistha":3, "Jye\u1E63\u1E6Dha":3, "\u091C\u094D\u092F\u0947\u0937\u094D\u0920":3,
                "Asadha":4, "Ashadha":4, "\u0100\u1E63\u0101\u1E0Dha":4, "\u0906\u0937\u093E\u0922":4, "\u0906\u0937\u093E\u0922\u093C":4,
                "Sravana":5, "Shravana":5, "\u015Ar\u0101va\u1E47a":5, "\u0936\u094D\u0930\u093E\u0935\u0923":5, "\u0938\u093E\u0935\u0928":5,
                "Bhadra":6, "Bhadrapad":6, "Bh\u0101drapada":6, "Bh\u0101dra":6, "Pro\u1E63\u1E6Dhapada":6, "\u092D\u093E\u0926\u094D\u0930\u092A\u0926":6, "\u092D\u093E\u0926\u094B":6,
                "Aswina":7, "Ashwin":7, "Asvina":7, "\u0100\u015Bvina":7, "\u0906\u0936\u094D\u0935\u093F\u0928":7, 
                "Kartiak":8, "Kartik":8, "Kartika":8, "K\u0101rtika":8, "\u0915\u093E\u0930\u094D\u0924\u093F\u0915":8, 
                "Agrahayana":9,"Agrah\u0101ya\u1E47a":9,"Margashirsha":9, "M\u0101rga\u015B\u012Br\u1E63a":9, "\u092E\u093E\u0930\u094D\u0917\u0936\u0940\u0930\u094D\u0937":9, "\u0905\u0917\u0939\u0928":9,
                "Pausa":10, "Pausha":10, "Pau\u1E63a":10, "\u092A\u094C\u0937":10,
                "Magha":11, "Magh":11, "M\u0101gha":11, "\u092E\u093E\u0918":11,
                "Phalguna":12, "Phalgun":12, "Ph\u0101lguna":12, "\u092B\u093E\u0932\u094D\u0917\u0941\u0928":12
            };
var sakaMonthPattern = /(C\S*ait|\u091A\u0948\u0924\u094D\u0930)|(Vai|\u0935\u0948\u0936\u093E\u0916|\u092C\u0948\u0938\u093E\u0916)|(Jy|\u091C\u094D\u092F\u0947\u0937\u094D\u0920)|(dha|\u1E0Dha|\u0906\u0937\u093E\u0922|\u0906\u0937\u093E\u0922\u093C)|(vana|\u015Ar\u0101va\u1E47a|\u0936\u094D\u0930\u093E\u0935\u0923|\u0938\u093E\u0935\u0928)|(Bh\S+dra|Pro\u1E63\u1E6Dhapada|\u092D\u093E\u0926\u094D\u0930\u092A\u0926|\u092D\u093E\u0926\u094B)|(in|\u0906\u0936\u094D\u0935\u093F\u0928)|(K\S+rti|\u0915\u093E\u0930\u094D\u0924\u093F\u0915)|(M\S+rga|Agra|\u092E\u093E\u0930\u094D\u0917\u0936\u0940\u0930\u094D\u0937|\u0905\u0917\u0939\u0928)|(Pau|\u092A\u094C\u0937)|(M\S+gh|\u092E\u093E\u0918)|(Ph\S+lg|\u092B\u093E\u0932\u094D\u0917\u0941\u0928)/;

var sakaMonthLength = [30,31,31,31,31,31,30,30,30,30,30,30]; // Chaitra has 31 days in Gregorian leap year
var sakaMonthOffset = [[3,22,0],[4,21,0],[5,22,0],[6,22,0],[7,23,0],[8,23,0],[9,23,0],[10,23,0],[11,22,0],[12,22,0],[1,21,1],[2,20,1]];

// common helper functions

function isValidDate(d) {
  if ( Object.prototype.toString.call(d) !== "[object Date]" )
    return false;
  return !isNaN(d.getTime());
}

function checkDate(y,m,d) {
	return isValidDate(new Date(Date.parse(yr(y) + "-" + z2(m) + "-" + z2(d))));
}

function z2(arg) {   // zero pad to 2 digits
	if (typeof(arg) == "number")
		arg = arg.toString();
    if (arg.length == 1)
        return '0' + arg;
    return arg;
}

function yr(arg) {   // zero pad to 4 digits
	if (typeof(arg) == "number")
		arg = arg.toString();
    if (arg.length == 1)
        return '200' + arg;
    else if (arg.length == 2)
        return '20' + arg;
    return arg;
}

function yrin(arg, _mo, _day) {   // zero pad to 4 digits
	if (typeof(arg) == "number")
		arg = arg.toString();
    if (arg.length == 2)
        if (arg > '21' || (arg == '21' && _mo >= 10 && _day >= 11))
            return '19' + arg;
        else
            return '20' + arg;
    return arg;
}

function devanagariDigitsToNormal(devanagariDigits) {
    var normal = '';
    for (var i=0; i<devanagariDigits.length; i++) {
    	var d = devanagariDigits[i];
        if ('\u0966' <= d && d <= '\u096F')	
            normal += String.fromCharCode( d.charCodeAt(0) - 0x0966 + '0'.charCodeAt(0) );
        else
            normal += d;
    }
    return normal
}

function jpDigitsToNormal(jpDigits) {
   normal = '';
    for (var i=0; i<jpDigits.length; i++) {
    	var d = jpDigits[i];
        if ('\uFF10' <= d && d <= '\uFF19')
            normal += String.fromCharCode( d.charCodeAt(0) - 0xFF10 + '0'.charCodeAt(0) );
        else
            normal += d;
	}
    return normal;
}
	
function sakaToGregorian(sYr, sMo, sDay) { 
    var gYr = sYr + 78;  // offset from Saka to Gregorian year
    var sStartsInLeapYr = (gYr % 4 == 0 && (gYr % 100 != 0 || gYr % 400 == 0)) // Saka yr starts in leap yr
    if (gYr < 0)
        return "Saka calendar year not supported: " + sYr + " " + sMo + " " + sDay;
    if  (sMo < 1 || sMo > 12)
        return "Saka calendar month error: " + sYr + " " + sMo + " " + sDay;
    var sMoLength = sakaMonthLength[sMo - 1];
    if (sStartsInLeapYr && sMo == 1)
        sMoLength += 1; // Chaitra has 1 extra day when starting in gregorian leap years
    if (sDay < 1 || sDay > sMoLength)
        return "Saka calendar day error: " + sYr + " " + sMo + " " +  sDay;
    var _mdy = sakaMonthOffset[sMo - 1]; // offset Saka to Gregorian by Saka month
    var gMo = _mdy[0], gDayOffset = _mdy[1], gYrOffset =_mdy[2];
    if (sStartsInLeapYr && sMo == 1)
        gDayOffset -= 1; // Chaitra starts 1 day earlier when starting in Gregorian leap years
    gYr += gYrOffset; // later Saka months offset into next Gregorian year
    var gMoLength = gLastMoDay[gMo - 1]; // month length (days in month)
    if (gMo == 2 && gYr % 4 == 0 && (gYr % 100 != 0 || gYr % 400 == 0)) // does Phalguna (Feb) end in a Gregorian leap year?
        gMoLength += 1; // Phalguna (Feb) is in a Gregorian leap year (Feb has 29 days)
    var gDay = gDayOffset + sDay - 1;
    if (gDay > gMoLength) { // overflow from Gregorial month of start of Saka month to next Gregorian month
        gDay -= gMoLength;
        gMo += 1;
        if (gMo == 13) { // overflow from Gregorian year of start of Saka year to following Gregorian year
            gMo = 1;
            gYr += 1;
        }
    }
    return [gYr, gMo, gDay];
}

// see: http://www.i18nguy.com/l10n/emperor-date.html        
eraStart = {'\u5E73\u6210': 1988, 
            '\u5E73': 1988,
            '\u660E\u6CBB': 1867,
            '\u660E': 1867,
            '\u5927\u6B63': 1911,
            '\u5927': 1911,
            '\u662D\u548C': 1925,
            '\u662D': 1925
            }

function eraYear(era,yr) {
    return eraStart[era] + (yr == '\u5143' ? 1 : parseInt(yr));
}

// transforms    

function booleanfalse(arg) {
    return "false";
}
    
function booleantrue(arg) {
    return 'true';
}

function dateslashus(arg) {
    var m = dateslashPattern.exec(arg);
    if (m)
        return yr(m[3]) + '-' + z2(m[1]) + '-' + z2(m[2]);
    return "ixt:dateError";
}
    
function dateslasheu(arg) {
    var m = dateslashPattern.exec(arg);
    if (m)
        return yr(m[3]) + '-' + z2(m[2]) + '-' + z2(m[1]);
    return "ixt:dateError";
}
    
function datedotus(arg) {
    var m = datedotPattern.exec(arg)
    if (m)
        return yr(m[3]) + '-' +  z2(m[1]) + '-' + z2(m[2]);
    return "ixt:dateError";
}
    
function datedoteu(arg) {
    var m = datedotPattern.exec(arg);
    if (m)
        return yr(m[3]) + '-' + z2(m[2]) + '-' + z2(m[1]);
    return "ixt:dateError";
}
    
function datelongus(arg) {
    var m = dateUsPattern.exec(arg);
    if (m)
        return yr(m[3]) + '-' +  z2(monthnumber[m[1]]) + '-' + z2(m[2]);
    return "ixt:dateError";
}
    
function datelongeu(arg) {
    var m = dateEuPattern.exec(arg);
    if (m)
        return yr(m[3]) + '-' + z2(monthnumber[m[2]]) + '-' + z2(m[1]);
    return "ixt:dateError";
}
    
function datedaymonth(arg) {
    var m = daymonthPattern.exec(arg);
    if (m) {
        var mo = z2(m[2]);
        var day = z2(m[1]);
        if ("01" <= day && day <= maxDayInMo(mo)) 
            return '--' + mo + '-' + day;
    }
    return "ixt:dateError";
}
    
function datemonthday(arg) {
    var m = monthdayPattern.exec(arg);
    if (m) {
        var mo = z2(m[1]);
        var day = z2(m[2]);
        if ("01" <= day && day <= maxDayInMo(mo))
            return '--' + mo + '-' + day;
    }
    return "ixt:dateError";
}
    
function datedaymonthSlashTR1(arg) {
    var m = daymonthslashPattern.exec(arg);
    if (m) {
        var mo = z2(m[2]);
        var day = z2(m[1]);
        return '--' + mo + '-' + day;
    }
    return "ixt:dateError";
}
    
function datemonthdaySlashTR1(arg) {
    var m = monthdayslashPattern.exec(arg);
    if (m) {
        var mo = z2(m[1]);
        var day = z2(m[2]);
        return '--' + mo + '-' + day;
    }
    return "ixt:dateError";
}
    
function datedaymonthdk(arg) {
    var m = daymonthDkPattern.exec(arg);
    if (m) {
        var day = z2(m[1]);
        var mon3 = m[2].toLowerCase();
        var mon3 = m[2].toLowerCase();
        var monEnd = m[3];
        var monPer = m[4];
        if (mon3 in monthnumber) {
            var mo = monthnumber[mon3];
            if (((!monEnd && !monPer) ||
                 (!monEnd && monPer) ||
                 (monEnd && !monPer)) &&
                "01" <= day && day <= maxDayInMo(mo))
                return '--' + z2(mo) + '-' + day;
        }
    }
    return "ixt:dateError";
}
    
function datedaymonthen(arg) {
    var m = daymonthEnPattern.exec(arg);
    if (m) {
        var _mo = monthnumber[m[2]];
        var _day = z2(m[1]);
        if ("01" <= _day && _day <= maxDayInMo(_mo))
            return '--' + z2(_mo) + '-' + _day;
    }
    return "ixt:dateError";
}
    
function datedaymonthShortEnTR1(arg) {
    var m = daymonthShortEnTR1Pattern.exec(arg);
    if (m) {
        var _mo = monthnumber[m[2]];
        var _day = z2(m[1]);
    	return "--" + z2(_mo) + "-" + _day;
    }
    return "ixt:dateError";
}
    
function datemonthdayen(arg) {
    var m = monthdayEnPattern.exec(arg);
    if (m) {
        var _mo = monthnumber[m[1]];
        var _day = z2(m[2]);
        if ("01" <= _day && _day <= maxDayInMo(_mo))
            return "--" + z2(_mo) + "-" + _day;
    }
    return "ixt:dateError";
}

function datemonthdayShortEnTR1(arg) {
    var m = monthdayShortEnTR1Pattern.exec(arg);
    if (m) {
        var _mo = monthnumber[m[1]];
        var _day = z2(m[2]);
        return "--" + z2(_mo) + "-" + _day;
    }
    return "ixt:dateError";
}

function datedaymonthyear(arg) {
    var m = daymonthyearPattern.exec(arg);
    if (m && checkDate(yr(m[3]), m[2], m[1]))
        return yr(m[3]) + '-' + z2(m[2]) + '-' + z2(m[1]);
    return "ixt:dateError";
}
    
function datemonthdayyear(arg) { 
   var  m = monthdayyearPattern.exec(arg);
    if (m) {
        var _yr = yr(m[3]);
        var _mo = z2(m[1]);
        var _day = z2(m[2]);
        if (checkDate(_yr, _mo, _day))
            return _yr + '-' + _mo + '-' + _day;
    }
    return "ixt:dateError";
}
    
function datemonthyear(arg) {
    var m = monthyearPattern.exec(arg); // "(M)M*(Y)Y(YY)", with non-numeric separator,
    if (m) {
        var _mo = z2(m[1]);
        if ("01" <= _mo && _mo <= "12")
            return yr(m[2]) + '-' + _mo;
    }
    return "ixt:dateError";
}
    
function datemonthyeardk(arg) {
    var m = monthyearDkPattern.exec(arg);
    if (m) {
        var mon3 = m[1].toLowerCase();
        var monEnd = m[2];
        var monPer = m[3];
        if (mon3 in monthnumber && ((!monEnd && !monPer) ||
                                    (!monEnd && monPer) ||
                                    (monEnd && !monPer)))
            return yr(m[4]) + '-' + z2(monthnumber[mon3]);
    }
    return "ixt:dateError";
}
    
function datemonthyearen(arg) {
    var m = monthyearEnPattern.exec(arg);
    if (m)
        return yr(m[2]) + '-' + z2(monthnumber[m[1]]);
    return "ixt:dateError";
}
    
function datemonthyearShortEnTR1(arg) {
    var m = monthyearShortEnTR1Pattern.exec(arg);
    if (m)
        return yr(m[2]) + '-' + z2(monthnumber[m[1]]);
    return "ixt:dateError";
}
    
function datemonthyearLongEnTR1(arg) {
    var m = monthyearLongEnTR1Pattern.exec(arg);
    if (m)
        return yr(m[2]) + '-' + z2(monthnumber[m[1]]);
    return "ixt:dateError";
}
    
function datemonthyearin(arg) {
    var m = monthyearInPattern.exec(arg);
    if (m[1] in gregorianHindiMonthNumber)
        return yr(devanagariDigitsToNormal(m[2])) + '-' + gregorianHindiMonthNumber[m[1]];
    return "ixt:dateError";
}
    
function dateyearmonthen(arg) {
    var m = yearmonthEnPattern.exec(arg);
    if (m)
        return yr(m[1]) + '-' + z2(monthnumber[m[2]]);
    return "ixt:dateError";
}

function dateyearmonthShortEnTR1(arg) {
    var m = yearmonthShortEnTR1Pattern.exec(arg);
    if (m)
        return yr(m[1]) + '-' + z2(monthnumber[m[2]]);
    return "ixt:dateError";
}

function dateyearmonthLongEnTR1(arg) {
    var m = yearmonthLongEnTR1Pattern.exec(arg);
    if (m)
        return yr(m[1]) + '-' + z2(monthnumber[m[2]])
    return "ixt:dateError";
}

function datedaymonthyeardk(arg) {
    var m = daymonthyearDkPattern.exec(arg);
    if (m) {
        var _yr = yr(m[5]);
        var _day = z2(m[1]);
        var _mon3 = m[2].toLowerCase();
        var _monEnd = m[3];
        var _monPer = m[4];
        if (_mon3 in monthnumber && ((!_monEnd && !_monPer) ||
                                     (!_monEnd && _monPer) ||
        					  		 (_monEnd && !_monPer))) {
            var _mo = monthnumber[_mon3]
            if (checkDate(_yr, _mo, _day))
                return _yr + '-' + z2(_mo) + '-' + _day;
        }
    }
    return "ixt:dateError";
}

function datedaymonthyearen(arg) {
    var m = daymonthyearEnPattern.exec(arg);
    if (m) {
        var _yr = yr(m[3]);
        var _mo = monthnumber[m[2]];
        var _day = z2(m[1]);
        if (checkDate(_yr, _mo, _day))
            return _yr + '-' + z2(_mo) + '-' + _day;
    }
    return "ixt:dateError";
}

function datedaymonthyearin(arg) {
    var m = daymonthyearInPattern.exec(arg);
    if (m) {
        var _yr = yr(devanagariDigitsToNormal(m[3]));
        var _mo = gregorianHindiMonthNumber.get(m[2], devanagariDigitsToNormal(m[2]));
        var _day = z2(devanagariDigitsToNormal(m[1]))
        if (checkDate(_yr, _mo, _day))
            return _yr + '-' + _mo + '-' + _day;
    }
    return "ixt:dateError";
}

function calindaymonthyear(arg) {
    var m = daymonthyearInPattern.exec(arg);
    // Transformation registry 3 requires use of pattern comparisons instead of exact transliterations
    //_mo = _INT(sakaMonthNumber[m[2]])
    // pattern approach
    var _mo = 0;
    var _match = sakaMonthPattern.exec(m[2])
    for (_mo=_match.length-1; _mo >= 0; _mo-=1)
    	if (_match[_mo])
    		break;
    var _day = parseInt(devanagariDigitsToNormal(m[1]))
    var _yr = parseInt(devanagariDigitsToNormal(yrin(m[3], _mo, _day)))
    //sakaDate = [_yr, _mo, _day]
    //for pluginMethod in pluginClassMethods("SakaCalendar.ToGregorian"):  // LGPLv3 plugin (moved to examples/plugin)
    //    gregorianDate = pluginMethod(sakaDate)
    //    return "{0}-{1:02}-{2:02}".format(gregorianDate[0], gregorianDate[1], gregorianDate[2])
    //raise NotImplementedError (_("ixt:calindaymonthyear requires plugin sakaCalendar.py, please install plugin.  "))
    gregorianDate = sakaToGregorian(_yr, _mo, _day); // native implementation for Arelle
    return gregorianDate[0] + "-" + z2(gregorianDate[1]) + "-" + z2(gregorianDate[2]);
}

function datemonthdayyearen(arg) {
    var m = monthdayyearEnPattern.exec(arg);
    if (m) {
        var _yr = yr(m[3]);
        var _mo = monthnumber[m[1]];
        var _day = z2(m[2]);
        if (checkDate(_yr, _mo, _day))
            return _yr + '-' + z2(_mo) + '-' + _day;
    }
    return "ixt:dateError";
}
    
function dateerayearmonthdayjp(arg) {
    var m = erayearmonthdayjpPattern.exec(jpDigitsToNormal(arg));
    if (m) {
        var _yr = eraYear(m[1], m[2]);
        var _mo = z2(m[3]);
        var _day = z2(m[4]);
        if (checkDate(_yr, _mo, _day))
            return _yr + '-' + _mo + '-' + _day;
    }
    return "ixt:dateError";
}

function dateyearmonthday(arg) {
    var m = yearmonthdayPattern.exec(jpDigitsToNormal(arg)); // (Y)Y(YY)*MM*DD with kangu full-width numerals
    if (m) {
        var _yr = yr(m[1]);
        var _mo = z2(m[2]);
        var _day = z2(m[3]);
        if (checkDate(_yr, _mo, _day))
            return _yr + "-" + _mo + "-" + _day;
    }
    return "ixt:dateError";
}

function dateerayearmonthjp(arg) {
    var m = erayearmonthjpPattern.exec(jpDigitsToNormal(arg))
    if (m) {
        var _yr = eraYear(m[1], m[2]);
        var _mo = z2(m[3]);
        if ("01" <= _mo && _mo <= "12")
            return _yr + '-' + _mo;
    }
    return "ixt:dateError";
}

function dateyearmonthdaycjk(arg) {
    var m = yearmonthdaycjkPattern.exec(jpDigitsToNormal(arg))
    if (m) {
        var _yr = yr(m[1]);
        var _mo = z2(m[2]);
        var _day = z2(m[3]);
        if (checkDate(_yr, _mo, _day))
            return _yr + "-" + _mo + "-" + _day;
    }
    return "ixt:dateError";
}

function dateyearmonthcjk(arg) {
    var m = yearmonthcjkPattern.exec(jpDigitsToNormal(arg));
    if (m) {
        var _mo =  z2(m[2]);
        if ("01" <= _mo && _mo <= "12")
            return yr(m[1]) + "-" + _mo;
    }
    return "ixt:dateError";
}

function nocontent(arg) {
    return ''
}

function numcommadecimal(arg) {
    if (numCommaDecimalPattern.exec(arg))
        return arg.replace('.', '').replace(',', '.').replace(' ', '').replace('\u00A0', '');
    return "ixt:numberPatternError";
}

function numcommadot(arg) {
    return arg.replace(',', '');
}

function numdash(arg) {
    return arg.replace('-','0');
}

function numspacedot(arg) {
    return arg.replace(' ', '');
}

function numdotcomma(arg) {
    return arg.replace('.', '').replace(',', '.');
}

function numspacecomma(arg) {
    return arg.replace(' ', '').replace(',', '.');
}

function zerodash(arg) {
    if (zeroDashPattern.exec(arg))
        return '0';
    return "ixt:numberPatternError";
}

function numdotdecimal(arg) {
    if (numDotDecimalPattern.exec(arg))
        return arg.replace(',', '').replace(' ', '').replace('\u00A0', '');
    return "ixt:numberPatternError";
}

function numdotdecimalin(arg) {
    var m = numDotDecimalInPattern.exec(arg), fract;
    if (m) {
    	var lastm = "", fract;
    	for (i=m.length-1; i>=0; i--) {
    		if (m[i]) {
    			lastm = m[i];
    			break;
    		}
    	}
        if (lastm && lastm.charAt(0) == ".")
            fract = m2[-1];
        else
            fract = "";
        return m2[0].replace(',','').replace(' ','').replace('\xa0','') + fract;
    }
    return "ixt:numberPatternError";
}

function numunitdecimal(arg) {
    // remove comma (normal), full-width comma, and stops (periods)
    var m = numUnitDecimalPattern.exec(jpDigitsToNormal(arg));
    if (m)
        return m[1].replace('.','').replace(',','').replace('\uFF0C','').replace('\uFF0E','') + '.' + z2(m[m.length-1]);
    return "ixt:numberPatternError";
}

function numunitdecimalin(arg) {
    var m = numUnitDecimalInPattern.exec(arg);
    if (m) {
        var m2 = [];
        for (var i=0; i<m.length; i++)
        	if (m[i])
	        	m2.push(m[i]);
        return m2[0].replace(',','').replace(' ','').replace('\xa0','') + '.' + z2(m2[m2.length - 2]);
    }
    return "ixt:numberPatternError";
}
    

tr1Functions = {
    // 2010-04-20 functions
    'dateslashus': dateslashus,
    'dateslasheu': dateslasheu,
    'datedotus': datedotus,
    'datedoteu': datedoteu,
    'datelongus': datelongus,
    'dateshortus': datelongus,
    'datelongeu': datelongeu,
    'dateshorteu': datelongeu,
    'datelonguk': datelongeu,
    'dateshortuk': datelongeu,
    'numcommadot': numcommadot,
    'numdash': numdash,
    'numspacedot': numspacedot,
    'numdotcomma': numdotcomma,
    'numcomma': numdotcomma,
    'numspacecomma': numspacecomma,
    'dateshortdaymonthuk': datedaymonthShortEnTR1,
    'dateshortmonthdayus': datemonthdayShortEnTR1,
    'dateslashdaymontheu': datedaymonthSlashTR1,
    'dateslashmonthdayus': datemonthdaySlashTR1,
    'datelongyearmonth': dateyearmonthLongEnTR1,
    'dateshortyearmonth': dateyearmonthShortEnTR1,
    'datelongmonthyear': datemonthyearLongEnTR1,
    'dateshortmonthyear': datemonthyearShortEnTR1
}

tr2Functions = {               
    // 2011-07-31 functions
    'booleanfalse': booleanfalse,
    'booleantrue': booleantrue,
    'datedaymonth': datedaymonth,
    'datedaymonthen': datedaymonthen,
    'datedaymonthyear': datedaymonthyear,
    'datedaymonthyearen': datedaymonthyearen,
    'dateerayearmonthdayjp': dateerayearmonthdayjp,
    'dateerayearmonthjp': dateerayearmonthjp,
    'datemonthday': datemonthday,
    'datemonthdayen': datemonthdayen,
    'datemonthdayyear': datemonthdayyear,
    'datemonthdayyearen': datemonthdayyearen,
    'datemonthyearen': datemonthyearen,
    'dateyearmonthdaycjk': dateyearmonthdaycjk,
    'dateyearmonthen': dateyearmonthen,
    'dateyearmonthcjk': dateyearmonthcjk,
    'nocontent': nocontent,
    'numcommadecimal': numcommadecimal,
    'zerodash': zerodash,
    'numdotdecimal': numdotdecimal,
    'numunitdecimal': numunitdecimal
}
    
    // transformation registry v-3 functions
tr3Functions = ({
    // same as v2: 'booleanfalse': booleanfalse,
    // same as v2: 'booleantrue': booleantrue,
    'calindaymonthyear': calindaymonthyear, // TBD: calindaymonthyear,
    //'calinmonthyear': nocontent, // TBD: calinmonthyear,
    // same as v2: 'datedaymonth': datedaymonth,
    'datedaymonthdk': datedaymonthdk,
    // same as v2: 'datedaymonthen': datedaymonthen,
    // same as v2: 'datedaymonthyear': datedaymonthyear,
    'datedaymonthyeardk': datedaymonthyeardk,
    // same as v2: 'datedaymonthyearen': datedaymonthyearen,
    'datedaymonthyearin': datedaymonthyearin,
    // same as v2: 'dateerayearmonthdayjp': dateerayearmonthdayjp,
    // same as v2: 'dateerayearmonthjp': dateerayearmonthjp,
    // same as v2: 'datemonthday': datemonthday,
    // same as v2: 'datemonthdayen': datemonthdayen,
    // same as v2: 'datemonthdayyear': datemonthdayyear, 
    // same as v2: 'datemonthdayyearen': datemonthdayyearen,
    'datemonthyear': datemonthyear,
    'datemonthyeardk': datemonthyeardk,
    // same as v2: 'datemonthyearen': datemonthyearen,
    'datemonthyearin': datemonthyearin,
    // same as v2: 'dateyearmonthcjk': dateyearmonthcjk,
    'dateyearmonthday': dateyearmonthday, // (Y)Y(YY)*MM*DD allowing kanji full-width numerals
    // same as v2: 'dateyearmonthdaycjk': dateyearmonthdaycjk,
    // same as v2: 'dateyearmonthen': dateyearmonthen,
    // same as v2: 'nocontent': nocontent,
    // same as v2: 'numcommadecimal': numcommadecimal,
    // same as v2: 'numdotdecimal': numdotdecimal,
    'numdotdecimalin': numdotdecimalin,
    // same as v2: 'numunitdecimal': numunitdecimal,
    'numunitdecimalin': numunitdecimalin
    // same as v2: 'zerodash': zerodash,
})
// tr3 starts with tr2 and adds more functions.
for (k in tr2Functions)	tr3Functions[k] = tr2Functions[k];  

deprecatedNamespaceURI = 'http://www.xbrl.org/2008/inlineXBRL/transformation' // the CR/PR pre-REC namespace

ixtNamespaceFunctions = {
    'http://www.xbrl.org/inlineXBRL/transformation/2010-04-20': tr1Functions, // transformation registry v1
    'http://www.xbrl.org/inlineXBRL/transformation/2011-07-31': tr2Functions, // transformation registry v2
    'http://www.xbrl.org/inlineXBRL/transformation/2015-02-26': tr3Functions, // transformation registry v3
    'http://www.xbrl.org/2008/inlineXBRL/transformation': tr1Functions // the CR/PR pre-REC namespace
}



////////

function getDurationValue(arg) {
    var n = parseFloat(arg);
    if (n == NaN) return {sign: null, value: null, error: 'ixt:durationTypeError'};
    var sign = '';
    if (n != NaN && n < 0) sign = '-';
    return {sign: sign, value: Math.abs(n), error: false};
}

function printDurationType(y, m, d, h, sign) {
    // preprocess each value so we don't print P0Y0M0D 
    // in this case, we should print P0Y, and leave out the months and days.
    var empty = true;	
    empty = empty && (y == null || y == 0);
    empty = empty && (m == null || m == 0);
    empty = empty && (d == null || d == 0);
    empty = empty && (h == null || h == 0);
    if (empty) { // zero is a special case.
	sign = '';  // don't need to print -P0Y, just print P0Y
	hitFirstZeroYet = false;
	if (y != null && y ==0) {
	    hitFirstZeroYet = true;
	}
	if (m != null && m == 0) {
	    if (hitFirstZeroYet) {
		m = null;
	    } else {
		hitFirstZeroYet = true;
	    }
	}
	if (d != null && d == 0) {
	    if (hitFirstZeroYet) {
		d = null;
	    } else {
		hitFirstZeroYet = true;
	    }
	}
	if (h != null && h == 0 && hitFirstZeroYet) {
	    if (hitFirstZeroYet) {
		h = null;
	    } else {
		hitFirstZeroYet = true;
	    }
	}
    }
    var output = sign + "P"
    if (y != null) output += y.toString() + 'Y'
    if (m != null) output += m.toString() + 'M'
    if (d != null) output += d.toString() + 'D'
    if (h != null) output += 'T' + h.toString() + 'H'
    return output;
}
   

// if arg is not an integer, the rest can spill into months and days, but nothing lower
function duryear(arg) {
	var n = getDurationValue(arg);
	if (n.error) return n.error;
    var years = Math.floor(n.value);
    var months =  (n.value - years) * 12;
    var days = Math.floor((months - Math.floor(months)) * 30.4375);
    var months = Math.floor(months);
    return printDurationType(years, months, days, null, n.sign);
}
    

// if arg is not an integer, the rest can spill into days, but nothing lower
function durmonth(arg) {
    var n = getDurationValue(arg);
    if (n.error) return n.error;
    var months = Math.floor(n.value);
    var days = Math.floor((n.value - months) * 30.4375);
    return printDurationType(null, months, days, null, n.sign);
}


// the output will only be in days, nothing lower
// xs:durationType doesn't have weeks, only years, months and days, so we display it all in days
function durweek(arg) {
    var n = getDurationValue(arg);
    if (n.error) return n.error;
    var days = Math.floor(n.value * 7);
    return printDurationType(null, null, days, null, n.sign);
}

// if arg is not an integer, the rest can spill into hours, but nothing lower
function durday(arg) {
    var n = getDurationValue(arg);
    if (n.error) return n.error;
    if(n.value){
    days = Math.floor(n.value);
    hours = Math.floor((n.value - days) * 24);
    }
    else{
	days = Math.floor(n.value);
	hours = Math.floor((n.value - days) * 24);	
    }
    return printDurationType(null, null, days, hours, n.sign);
}

// the output will only be in hours, nothing lower
function durhour(arg) {
    var n = getDurationValue(arg);
    if (n.error) return n.error;
    hours = Math.floor(n.value)
    return printDurationType(null, null, null, hours, n.sign);
}

function numinf(arg) {
    return 'INF';
}

function numneginf(arg) {
    return '-INF';
}

function numnan(arg) {
    return 'NaN';
}

numwordsenPattern = /^\s*(((((([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)\s+[Hh]undred(\s+(and\s+)?(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)((-|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))?)|(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)((-|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))\s+[Qq]uintillion(\s*,\s*|\s+|$))?(((([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)\s+[Hh]undred(\s+(and\s+)?(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)((-|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))?)|(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)((-|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))\s+[Qq]uadrillion(\s*,\s*|\s+|$))?(((([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)\s+[Hh]undred(\s+(and\s+)?(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)((-|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))?)|(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)((-|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))\s+[Tt]rillion(\s*,\s*|\s+|$))?(((([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)\s+[Hh]undred(\s+(and\s+)?(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)((-|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))?)|(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)((-|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))\s+[Bb]illion(\s*,\s*|\s+|$))?(((([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)\s+[Hh]undred(\s+(and\s+)?(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)((-|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))?)|(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)((-|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))\s+[Mm]illion(\s*,\s*|\s+|$))?((((([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)\s+[Hh]undred(\s+(and\s+)?(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)((-|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))?)|(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)((-|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))\s+[Tt]housand((\s*,\s*|\s+)((([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)\s+[Hh]undred(\s+(and\s+)?(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)((-|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))?)|(and\s+)?(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)((-|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?)))?)|(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)\s+[Hh]undred(\s+(and\s+)?(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)((-|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))?)|(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)((-|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))?)|[Zz]ero|[Nn]o(ne)?)\s*$/ ;

numwordsNoPattern = /^\s*[Nn]o(ne)?\s*$/ ;

commaAndPattern = /,|\sand\s/ ; // substitute whitespace for comma or and
    
function numwordsen(arg) {
    if (numwordsNoPattern.exec(arg)) {
	return "0";
    } else if (arg.trim().length > 0) {
	var m = numwordsenPattern.exec(arg);
	if (arg.length >0 && m) {
	    var str = arg.trim().toLowerCase().replace(commaAndPattern," ");
	    return text2num(str).toString();	
	}
    }
    return 'Not a number: '+arg.toString();
}

durwordsenPattern = /^\s*((((([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)\s+[Hh]undred(\s+(and\s+)?(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)((-|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))?)|(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)((-|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))|[Zz]ero|[Nn]o|[0-9][0-9]{0,3})\s+[Yy]ears?(,?\s+(and\s+)?|$))?((((([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)\s+[Hh]undred(\s+(and\s+)?(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)((-|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))?)|(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)((-|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))|[Zz]ero|[Nn]o|[0-9][0-9]{0,3})\s+[Mm]onths?(,?\s+(and\s+)?|$))?((((([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)\s+[Hh]undred(\s+(and\s+)?(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)((-|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))?)|(([Oo]ne|[Tt](wo|hree|en|welve|hirteen)|[Ff](our(teen)?|ive|ifteen)|[Ss](ix(teen)?|even(teen)?)|[Ee](ight(een)?|leven)|[Nn]ine(teen)?)|([Tt](wenty|hirty)|[Ff](orty|ifty)|[Ss](ixty|eventy)|[Ee]ighty|[Nn]inety)((-|\s+)([Oo]ne|[Tt](wo|hree)|[Ff](our|ive)|[Ss](ix|even)|[Ee]ight|[Nn]ine))?))|[Zz]ero|[Nn]o|[0-9][0-9]{0,3})\s+[Dd]ays?)?\s*$/ ;

durwordZeroNoPattern = /^\s*([Zz]ero|[Nn]o(ne)?)\s*$/ ;

function durwordsen(arg) {
    var durWordsMatch = durwordsenPattern.exec(arg);
    if (durWordsMatch && arg.trim().length > 0) {
	var dur = 'P';
	var grp = [[1+1,'Y'],[61+1,'M'],[121+1,'D']];
	for (var i = 0; i < grp.length; i++) {
	    var groupIndex = grp[i][0];
	    var groupSuffix = grp[i][1];
	    var groupPart = durWordsMatch[groupIndex];
	    if (groupPart != null) {
		if (durwordZeroNoPattern.exec(groupPart) == null) {
		    if (isNaN(groupPart)) {
			var tmp = groupPart.trim().toLowerCase().replace(commaAndPattern," ");
			dur += text2num(tmp);
		    } else {
			dur += groupPart;
		    }
		    dur += groupSuffix;
		}
	    }
	}
	return (dur.length > 1)?dur:"P0D";
    }
    return 'Not a duration: '+arg.toString();
}


var Small = {
	'zero': 0,
	'one': 1,
	'two': 2,
	'three': 3,
	'four': 4,
	'five': 5,
	'six': 6,
	'seven': 7,
	'eight': 8,
	'nine': 9,
	'ten': 10,
	'eleven': 11,
	'twelve': 12,
	'thirteen': 13,
	'fourteen': 14,
	'fifteen': 15,
	'sixteen': 16,
	'seventeen': 17,
	'eighteen': 18,
	'nineteen': 19,
	'twenty': 20,
	'thirty': 30,
	'forty': 40,
	'fifty': 50,
	'sixty': 60,
	'seventy': 70,
	'eighty': 80,
	'ninety': 90
};


var Magnitude = {
	'thousand':     1000,
	'million':      1000000,
	'billion':      1000000000,
	'trillion':     1000000000000,
	'quadrillion':  1000000000000000,
	'quintillion':  1000000000000000000,
	'sextillion':   1000000000000000000000,
	'septillion':   1000000000000000000000000,
	'octillion':    1000000000000000000000000000,
	'nonillion':    1000000000000000000000000000000,
	'decillion':    1000000000000000000000000000000000,
};

function text2num(s) {
    var wordSplitPattern = /[\s-]+/;
    var a = s.toString().split(wordSplitPattern);
    var n = 0;
    var g = 0;
    for (var i=0;i < a.length; i++) {
	var w = a[i];
	var x = Small[w];
	if (x != null) {
	    g = g + x;
	}
	else if (w == "hundred") {
	    g = g * 100;
	}
	else {
	    x = Magnitude[w];
	    if (x != null) {
		n = n + g * x; 
		g = 0;
	    }
	    else { 
		return 'ixt:text2numError ' + w;
	    }
	}
    }
    return n + g;
}

edgarFunctions = {    
	    'duryear': duryear,
	    'durmonth': durmonth,
	    'durweek': durweek,
	    'durday': durday,
	    'durhour': durhour
	    ,'numinf': numinf
	    ,'numneginf': numneginf
	    ,'numnan': numnan
	    ,'numwordsen': numwordsen
	    ,'durwordsen': durwordsen
	    }

ixtNamespaceFunctions['http://www.sec.gov/inlineXBRL/transformation/2015-08-31'] = edgarFunctions;


/*
 * App_About
 * Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 * */
var App_About = {
    companyInformation:null,
    carouselItems : [ {
		subTitle : 'Company and Document'
	}, {
		subTitle : 'Tags'
	}, 
	{
		subTitle : 'Files'
	}, {
		subTitle : 'Additional Items'
	} ],
    init:function() {
    	var	index;
    	 $('[data-toggle=panel-collapse]').click(function(){
    		 var container = $('#about-modal');
             container.dialog("open"); 
             App_About.load1();
             App_About.load2();
             App_About.load4();
             App_About.load5();
         })
       
       $('#about-carousel').carousel({
            interval:false
        }).on('slide.bs.carousel', function (e) {
            index = $(e.relatedTarget).attr('data-slide-index');
			App_About.carouselGoTo(index);
        });

        $('#show-technical').on('click', function() {

            if ($(this).is(':checked')) {

                App_About.toggleTechnicalNamespaces('show');
            } else {

                App_About.toggleTechnicalNamespaces('hide');
            }
        });
        var informationHeader = $('#about-modal > .about-header');
        informationHeader.find('.btn-copy').on('click', function() {
            App_About.copyToClipboard();
        });
		informationHeader.find('.btn-remove').on(
				'click',
				function() {
					$(this).parents('.about-modal').dialog(
					"close");
					 index=0;
					 
					 $('#about-carousel').carousel(0);
		             App_About.carouselGoTo(0);
                    $('#about-carousel').carousel({
						 number: 0,
						interval:false
					 }
							 );
				});
    },
    carouselGoTo : function(index) {

		index = parseInt(index);
		if (index >= 0 && index < App_About.carouselItems.length) {

			var nextIndex = index + 1;
			var prevIndex = index - 1;
			if (index == 0) {

				nextIndex = 1;
				prevIndex = App_About.carouselItems.length - 1;
			} else if (index >= (App_About.carouselItems.length - 1)) {

				nextIndex = 0;
				prevIndex = App_About.carouselItems.length - 2;
			}

			var currentItem = App_About.carouselItems[index];
			var nextItem = App_About.carouselItems[nextIndex];
			var prevItem = App_About.carouselItems[prevIndex];

			var carousel = $('#about-carousel');
			carousel.find('.carousel-label.left').html(prevItem.subTitle);
			carousel.find('.carousel-label.right').html(nextItem.subTitle);

			var container = $('#about-modal');
			container.find('span[data-content="subtitle"]').html(
					currentItem.subTitle);
			
		}
	},
    resetUI:function() {

        App_About.companyInformation = null;
        var modal = $('#about-modal');
        modal.find('[data-content]').each(function(index, element) {

            var e = $(element);
            if (e.attr('data-content') != 'subtitle') {

                $(element).html('');
            }
        });
        modal.find('[data-slide-content="taxonomies"]').html('');
    },
    toggleTechnicalNamespaces:function(showHide) {

        var display = showHide == 'show' ? 'block' : 'none';
        $('div[data-is-technical="true"]').css('display', display);
    },
    
    load1:function() {
    	 $("#about-modal").dialog({
				autoOpen : true
			});
        if (App_About.companyInformation == null) {

            App_About.loadCompanyInformation();
            console.log(App_About.companyInformation);
            var modal1 = $('#about1-modal');
            modal1.find('span[data-content="companyName"]').html(App_About.companyInformation.name);
            modal1.find('span[data-content="companyCIK"]').html(App_About.companyInformation.cik);
            modal1.find('span[data-content="companyDocument"]').html(App_About.companyInformation.document);
            modal1.find('span[data-content="companyPeriodEndDate"]').html(App_About.companyInformation.periodEndDate);
            modal1.find('span[data-content="companyFiscalYearAndPeriodFocus"]').html(App_About.companyInformation.fiscalYearFocus+" / "+App_About.companyInformation.periodFocus);
            modal1.find('span[data-content="companyFiscalYear"]').html(App_About.companyInformation.fiscalYear);
            modal1.find('span[data-content="companyAmendment"]').html(App_About.companyInformation.amendment);
			var maxValueTextLength = 256;
                        
            var amendmentDescription = '';
            if (App_About.companyInformation.amendment == 'true') {
            	amendmentDescription = App_About.companyInformation.amendmentDescription;
            	
            	if (amendmentDescription.length > maxValueTextLength) {
            	
                    amendmentDescription = amendmentDescription.trim().substring(0, maxValueTextLength) + '...';
                }

                amendmentDescription = ' / ' +amendmentDescription;
            }
            modal1.find('span[data-content="companyAmendmentDescription"]').html(amendmentDescription);

        }
    },
	load2:function() {
		 $("#about-modal").dialog({
				autoOpen : true
			});
            var model2 = $('#about2-model');
            var facts = {
                key_concepts:{
                    standard:0,
                    custom:0
                },
                axis:{
                    standard:0,
                    custom:0
                },
                member:{
                    standard:0,
                    custom:0
                }
            };
            var eleTable = $('#ele-table');
            var elements = App_Find.Highlight.cachedResults.both;
            var elementAry = [];
            $('#total-number-facts').html(elements.length);
            $('#inline-version').html(App.InlineDoc.inlineVersion);
            facts.key_concepts.custom=App.InlineDoc.getMetaData().keyCustom;
			facts.key_concepts.standard=App.InlineDoc.getMetaData().keyStandard;
			facts.axis.custom=App.InlineDoc.getMetaData().axisCustom;
			facts.axis.standard=App.InlineDoc.getMetaData().axisStandard;
			facts.member.custom=App.InlineDoc.getMetaData().memberCustom;
			facts.member.standard=App.InlineDoc.getMetaData().memberStandard;
            var sections = ['key_concepts', 'axis', 'member', 'total'];
            for (var i=0; i<sections.length; i++){

                var sectionName = sections[i];
                var row = eleTable.find('tr[data-ele-type="' + sectionName + '"]');
                if (row) {

                    var tds = row.find('td');
                    if (sectionName == 'total') {

                        var totalStandard = facts.key_concepts.standard + facts.axis.standard + facts.member.standard;
                        var totalCustom = facts.key_concepts.custom + facts.axis.custom + facts.member.custom;
                        var totalAll = totalStandard + totalCustom;
                        $(tds[0]).html(totalStandard);
                        $(tds[2]).html(totalCustom);
                        $(tds[4]).html(totalAll);

                        if (totalStandard > 0) {
                            $(tds[1]).html(Math.round((totalStandard/totalAll)*100) + '%');
                        } else {
                            $(tds[1]).html('0%');
                        }
                        if (totalCustom > 0) {
                            $(tds[3]).html(Math.round((totalCustom/totalAll)*100) + '%');
                        } else {
                            $(tds[3]).html('0%');
                        }
                    } else {

                        var total = facts[sectionName].standard + facts[sectionName].custom;
                        $(tds[0]).html(facts[sectionName].standard);
                        $(tds[2]).html(facts[sectionName].custom);
                        $(tds[4]).html(total);

                        if (facts[sectionName].standard > 0) {
                            $(tds[1]).html(Math.round((facts[sectionName].standard/total)*100) + '%');
                        } else {
                            $(tds[1]).html('0%');
                        }
                        if (facts[sectionName].custom > 0) {
                            $(tds[3]).html(Math.round((facts[sectionName].custom/total)*100) + '%');
                        } else {
                            $(tds[3]).html('0%');
                        }
                    }
                }
            }
            
            var hiddenElements = App.InlineDoc.getHiddenItemDetails();
            $('#total-addition-items').html(hiddenElements['total']);
            var hiddenItemDiv = model2.find('div[hidden-items-content]');
            hiddenItemDiv.html('');
            var hiddenItemDivContent = '<table id="hidden-items-table"><tr><th>Taxonomy</th><th style="text-align:center;">Count</th></tr>' ;
            for (var index in hiddenElements) {
	        		if(index!='total'){
	        			hiddenItemDivContent += '<tr><td width="70%" style="max-width:260px;word-wrap: break-word;">'+index+'</td><td width="30%" style="text-align:right;">'+hiddenElements[index]+'</td></tr>';
		        	}
              	}
            hiddenItemDivContent += '</table>';
		            
		            
		    $('#hidden-items-content').html(hiddenItemDivContent);        

    },
    load3:function() {
            var modal3 = $('#about3-modal');

            var domains = ["w3.org", "xbrl.org"];
            var taxonomiesHtml = '';
            var namespaces = App.InlineDoc.getDocumentNamespaces();
            for (var k in namespaces) {

                var display = 'block';
                var isTechnical = false;
                var a = document.createElement('a');
                a.href = namespaces[k];
                var hostname = a.host.split('.').slice(-2).join(".").replace(/:80/, '');
                var path = a.pathname.charAt(0) == '/' ? a.pathname.split('/')[1] : a.pathname.split('/')[0];
                if ($.inArray(hostname, domains) == -1 &&
                    (hostname != domains[1] ||
                        (hostname == domains[1] && !isNaN(path)))) {

                    display = 'display:none';
                    isTechnical = 'true';
                }
                taxonomiesHtml += '<div data-is-technical="' + isTechnical + '" style="' + display + '">' + k.toUpperCase().replace('-', ' ') + ' (' + namespaces[k] + ')</div>';
            }
            modal3.find('[data-slide-content="taxonomies"]').html(taxonomiesHtml);

            // remove after we get toggle back in
            App_About.toggleTechnicalNamespaces('show');

    },

    load4:function() {



            var modal4 = $('#about4-modal');

            // remove after we get toggle back in
            App_About.toggleTechnicalNamespaces('show');

            // load the file names used to run app
            var fileNamesHTML = '<table border="1" width="100%" class="file-names">';
            var dts = App.InlineDoc.getMetaData().dts;
            var prefix = App.InlineDoc.getMetaData().nsprefix.toUpperCase();
            var nameList = [ // change this static array to modify the display.  i=0 assumed to be "inline".
                	{'inline':'Inline Document'},
                	{'schema':'Schema'},
                	{'labelLink':'Label'},
                	{'calculationLink':'Calculation'},
                	{'presentationLink':'Presentation'},
                	{'definitionLink':'Definition'}
                ];
            for (var i in nameList) {
            	for (var doctype in nameList[i]) {
            		var docpretty = nameList[i][doctype];
            		if (i > 0) {
            			docpretty = prefix + ' ' + docpretty;
            		}
            		if (dts) {
	            		var doclocations = dts[doctype];
	            		if (doclocations) {
	            			var localdocs = doclocations['local'];
	            			for (var j in localdocs) {
	            				var doc = localdocs[j];
	            				fileNamesHTML += '<tr><td>' + docpretty + '</td><td>' + doc + '</td></tr>'; 
	            				if(docpretty=="Inline Document"){
	            					fileNamesHTML += '<tr border="1" ><td> <br/> </td><td> <br/> </td></tr>'; 
	            				}
	            				
	            			}
	            		}
            		} else {
            			fileNamesHTML += '<tr><td>' + docpretty + '</td><td>' + "N/A" + '</td></tr>';
            		}
            	}
            	if (i == 0)  {
            		fileNamesHTML += '<tr><td>Custom Taxonomy</td><td> <br/> </td></tr>';
            	}
            }


            fileNamesHTML += '</table>';
            modal4.find('[data-slide-content="files"]').html(fileNamesHTML);
    },
    load5:function() {



        //var modal5 = $('#about5-modal');

        $("#about-modal").dialog({
			autoOpen : true
		});
        var modal5 = $('#about5-modal');
        var facts = {
            key_concepts:{
                standard:0,
                custom:0
            },
            axis:{
                standard:0,
                custom:0
            },
            member:{
                standard:0,
                custom:0
            }
        };
        var eleTable = $('#ele-table');
        var elements = App_Find.Highlight.cachedResults.both;
        var elementAry = [];
        $('#total-number-facts').html(elements.length);
        $('#inline-version').html(App.InlineDoc.inlineVersion);
        
        facts.key_concepts.custom=App.InlineDoc.getMetaData().keyCustom;
        facts.key_concepts.standard=App.InlineDoc.getMetaData().keyStandard;
        facts.axis.custom=App.InlineDoc.getMetaData().axisCustom;
        facts.axis.standard=App.InlineDoc.getMetaData().axisStandard;
        facts.member.custom=App.InlineDoc.getMetaData().memberCustom;
        facts.member.standard=App.InlineDoc.getMetaData().memberStandard;
        var sections = ['key_concepts', 'axis', 'member', 'total'];
        for (var i=0; i<sections.length; i++){

            var sectionName = sections[i];
            var row = eleTable.find('tr[data-ele-type="' + sectionName + '"]');
            if (row) {

                var tds = row.find('td');
                if (sectionName == 'total') {

                    var totalStandard = facts.key_concepts.standard + facts.axis.standard + facts.member.standard;
                    var totalCustom = facts.key_concepts.custom + facts.axis.custom + facts.member.custom;
                    var totalAll = totalStandard + totalCustom;
                    $(tds[0]).html(totalStandard);
                    $(tds[2]).html(totalCustom);
                    $(tds[4]).html(totalAll);

                    if (totalStandard > 0) {
                        $(tds[1]).html(Math.round((totalStandard/totalAll)*100) + '%');
                    } else {
                        $(tds[1]).html('0%');
                    }
                    if (totalCustom > 0) {
                        $(tds[3]).html(Math.round((totalCustom/totalAll)*100) + '%');
                    } else {
                        $(tds[3]).html('0%');
                    }
                } else {

                    var total = facts[sectionName].standard + facts[sectionName].custom;
                    $(tds[0]).html(facts[sectionName].standard);
                    $(tds[2]).html(facts[sectionName].custom);
                    $(tds[4]).html(total);

                    if (facts[sectionName].standard > 0) {
                        $(tds[1]).html(Math.round((facts[sectionName].standard/total)*100) + '%');
                    } else {
                        $(tds[1]).html('0%');
                    }
                    if (facts[sectionName].custom > 0) {
                        $(tds[3]).html(Math.round((facts[sectionName].custom/total)*100) + '%');
                    } else {
                        $(tds[3]).html('0%');
                    }
                }
            }
        }
        var hiddenElements = App.InlineDoc.getHiddenItemDetails();
        $('#total-addition-items').html(hiddenElements['total']);
        var hiddenItemDiv = modal5.find('div[hidden-items-content]');
        hiddenItemDiv.html('');
        var hiddenItemDivContent = '<table id="hidden-items-table"><tr><th>Taxonomy</th><th style="text-align:center;">Count</th></tr>' ;
        for (var index in hiddenElements) {
        		if(index!='total'){
        			hiddenItemDivContent += '<tr><td width="70%" style="max-width:260px;word-wrap: break-word;">'+index+'</td><td width="30%" style="text-align:right;padding-right:3px;">'+hiddenElements[index]+'</td></tr>';
	        	}
          	}
        hiddenItemDivContent += '<tr><td width="70%" style="max-width:260px;word-wrap: break-word;font-weight:bold;">Total</td><td width="30%" style="text-align:right;font-weight:bold;padding-right:3px;">'+hiddenElements['total']+'</td></tr>';
        hiddenItemDivContent += '</table>';
	            
	    $('#hidden-items-content').html(hiddenItemDivContent);        


},
    loadCompanyInformation:function() {

        App_About.companyInformation = {
            name:'',
            cik:'',
            document:'',
            periodEndDate:'',
            fiscalYearFocus:'',
            periodFocus:'',
            fiscalYear:'',
            amendment:'',
            amendmentDescription:''
        };

        var elements = {
            name:'dei:EntityRegistrantName',
            cik:'dei:EntityCentralIndexKey',
            document:'dei:DocumentType',
            periodEndDate:'dei:DocumentPeriodEndDate',
            fiscalYearFocus:'dei:DocumentFiscalYearFocus',
            periodFocus:'dei:DocumentFiscalPeriodFocus',
            fiscalYear:'dei:CurrentFiscalYearEndDate',
            amendment:'dei:AmendmentFlag',
            amendmentDescription:'dei:AmendmentDescription'
        };
        for (var k in elements) {
            var ele = App.InlineDoc.getElementByNameOriginal(elements[k]);
            console.log(ele);
            if (ele.length == 1) {

                App_About.companyInformation[k] = ele.text();
            }
            else{
            	 App_About.companyInformation[k] = $(ele[0]).text();
            }
        }
    },
copyToClipboard:function() {

    var clipboardText = '';
    var container = $('#about-modal');

    clipboardText +=  "\nCompany and Document \n";

    container.find('div[data-slide-index="0"] tr').each(function(index, element) {
    	var x=0;
        $(this).find('td').each (function(index, element) {
    	    var node = $(element);

    	    var myStr = node.text();

    	    if(node.text().indexOf('...')>-1){
    	        myStr = myStr.replace(/\s{2,}/g,' ');
    	    }
    	    
    	    if(x<1){
    	    	clipboardText +=  myStr;
    	    }else{
    	    	if(node.text()=="debit"){
    	    		clipboardText += ":&nbsp;&nbsp;" +"Debit";
    	    	}else if(node.text()=="credit"){
    	    		clipboardText += ":&nbsp;&nbsp;" +"Credit";
    	    	}else{
    	    		clipboardText +=  ":&nbsp;&nbsp;" +myStr;
    	    	}
    	    	
    	    }
    		x++;
    	});

        clipboardText +=  "\n";
    });
    
    clipboardText +=  "\nTags \n";
    var myStr1= document.getElementById('AboutTable2').textContent;
    myStr1= myStr1.replace(/\s+/g," ").replace(/^\s|\s$/g,"");
    clipboardText+=myStr1+"\n";
    
    var tableID = document.getElementById('ele-table');
    for(var i=0; i<tableID.rows.length; i++){
    	for (var j=0; j<tableID.rows[i].cells.length; j++){
    		var element=tableID.rows[i].cells[j].innerHTML;
    		
    		if(element=="Axis")
    		element+="&nbsp;&nbsp;&nbsp;";
    		
    		clipboardText+=element.replace(/\s+/g," ").replace(/^\s|\s$/g,"");
    		clipboardText+="&nbsp;&nbsp;&nbsp;";
    	}
    	clipboardText+="\n";
    		
    }

        clipboardText +=  "\nFiles \n";
        if($('#about-modal').find('div[data-slide-index="2"]').text() != "No Data"){
            $('#about-modal').find('div[data-slide-index="2"]').find('tr').each(function(index, element) {
            	var x=0;
                $(this).find('td').each (function(index, element) {
                    var node = $(element);
                    if(node.text()){
                        if(x<1){
                        	if(node.text().trim()==""){
                        		clipboardText += node.text();
                        	}
                        	else{
                        	clipboardText += node.text()+":&nbsp;&nbsp;" ;
                        	}
                	    }else{
                	    	
                	    	clipboardText += node.text();
                	    	}
                	   
                    }
            		x++;
                });
                clipboardText+="\n";
            });
        }
        else{
            clipboardText+=" No Data\n";
        }


        clipboardText +=  "\nAdditional Items";
        $('#about-modal').find('div[data-slide-index="3"]').find('tr').each(function(index, element) {
        	var x=0;
            $(this).find('td').each (function(index, element) {
                var node = $(element);
                if(x<1){
                	clipboardText += node.text()+":&nbsp;&nbsp;" ;
        	    }else{
        	    	if(node.text()=="debit"){
        	    		clipboardText += "Debit";
        	    	}else if(node.text()=="credit"){
        	    		clipboardText += "Credit";
        	    	}else{
        	    		clipboardText += node.text();
        	    	}
        	    	
        	    }
        		x++;
            });
            clipboardText+="\n";
        });
    //});

    var myWindow = window.open("", "MsgWindow", "toolbar=no, scrollbars=yes, resizable=yes, top=200, left=500, width=400, height=400");
	
	//myWindow.document.write("<html><head><title>Copy All</title></head><body><textarea id='popTxtArea' rows='25' cols='50'>"+clipboardText+"</textarea></body></html>");
	
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
};
/*
* App_Help
* Created by staff of the U.S. Securities and Exchange Commission.
* Data and content created by government employees within the scope of their employment 
* are not subject to domestic copyright protection. 17 U.S.C. 105.
* */
var App_Help = {
    init:function() {

        $('#btn-help').on('click', function() {

            $('#app-panel-help-container').show('slide');
        });

        $('#app-panel-help-container').find('[data-btn-remove]').on('click', function() {
		$(window).resize();
			if (screen.width < 641) {
				$('#app-panel-help-container').hide('slide');
            	$('#app-panel1').removeClass('visible').animate({'margin-left':'-100%'});
            	$('#app-inline-xbrl-doc').css({'width':'100%'});
			}
			else if(((screen.width > 641) && (screen.width < 768))  && (window.orientation == 0 || window.orientation == 180)) { 
				$('#app-panel-help-container').hide('slide');
            	$('#app-panel1').removeClass('visible').animate({'margin-left':'-100%'});
            	$('#app-inline-xbrl-doc').css({'width':'100%'});
			}
			else{
            	$('#app-panel-help-container').hide('slide');
            	$('#app-panel1').removeClass('visible').animate({'margin-left':'-30%'});
            	$('#app-inline-xbrl-doc').css({'width':'100%'});
            }
        });
    }
};

/*
* Created by staff of the U.S. Securities and Exchange Commission.
* Data and content created by government employees within the scope of their employment 
* are not subject to domestic copyright protection. 17 U.S.C. 105.
* */
var App_Settings = {
    defaults:{
        initialHighlightColor:'#FFD700',
        focusHighlightColor:'#003768',
        focusHighlightSelectionColor:'#003768',
		focusHighlightSelectionColorCode:'003768',
        elementBorderColor:'#FF6600',
        elementBorderColorCode:'ff6600',
        blockHighlightColor:'rgba(249,237,237,0.6)',
        focusContentSelectionColor:"#FF6600"
    },
    initialHighlightColor:null,
    focusHighlightColor:null,
    elementBorderColor:null,
    blockHighlightColor:null,
    init:function() {

        var colorOptions =  {
            boxWidth:'20px',
            cellWidth:15,
            cellHeight:15,
            livePreview:true,
            onSelect:function(color, input) {

                if (input.prop('id') == 'setting-initial-highlight-color') {

                    App_Settings.save('initialHighlightColor', '#' + color);
                } else if (input.prop('id') == 'setting-focus-highlight-color') {

                    App_Settings.save('focusHighlightColor', '#' + color);
					App_Settings.save('focusHighlightSelectionColorCode', color.toLowerCase());
					window.location.reload();
                } else if (input.prop('id') == 'setting-block-highlight-color'){

                    App_Settings.save('blockHighlightColor', '#' + color);
                }
                else {
                    App_Settings.save('elementBorderColor', '#' + color);
                    App_Settings.save('elementBorderColorCode', color.toLowerCase());
                    window.location.reload();
                }
            }
        };
        App_Settings.initialHighlightColor = $('#setting-initial-highlight-color');
        App_Settings.initialHighlightColor.val(App_Settings.get('initialHighlightColor')).simpleColor(colorOptions);
        App_Settings.focusHighlightColor = $('#setting-focus-highlight-color');
        App_Settings.focusHighlightColor.val(App_Settings.get('focusHighlightColor')).simpleColor(colorOptions);
        App_Settings.elementBorderColor = $('#setting-element-border-color');
        App_Settings.elementBorderColor.val(App_Settings.get('elementBorderColor')).simpleColor(colorOptions);
        App_Settings.blockHighlightColor = $('#setting-block-highlight-color');
        App_Settings.blockHighlightColor.val(App_Settings.get('blockHighlightColor')).simpleColor(colorOptions);
    },
    get:function(key) {

        var result;
        if (window.localStorage &&
            (result = window.localStorage.getItem(key)) == null) {

            result = App_Settings.defaults[key];
        }
        return result;
    },
    save:function(key, value) {

        if (window.localStorage) {

            window.localStorage.setItem(key, value);

            var event = jQuery.Event("settingChanged");
            event.settingKey = key;
            event.settingValue = value;
            $("body").trigger(event);
        }
    },
    resetColor:function(key) {

        if (window.localStorage) {

            App_Settings.save(key, App_Settings.defaults[key]);
        }
        App_Settings[key].setColor(App_Settings.defaults[key]);
    },
    /* this code is used to reset the left gutter image color to default value
     * issue no. DE368 and DE369
     * */
    resetBorderColor:function(key) {
        if (window.localStorage) {

            App_Settings.save(key, App_Settings.defaults[key]);
            App_Settings.save('elementBorderColorCode', 'ff6600');
        }
        App_Settings[key].setColor(App_Settings.defaults[key]);
        //DE433
		//window.location = window.location;
		 window.location.reload();
    },
    resetHighlightColor:function(key) {
        if (window.localStorage) {

            App_Settings.save(key, App_Settings.defaults[key]);
            App_Settings.save('focusHighlightSelectionColorCode', '003768');
        }
        App_Settings[key].setColor(App_Settings.defaults[key]);
        //DE433
		//window.location = window.location;
		window.location.reload();
    }
};