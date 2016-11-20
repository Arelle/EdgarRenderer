/*
 * Primary Application Object
 * The App object initializes the application and provides
 * standard functionality to the rest of the application pieces (App_Find, App_About etc)
 * Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 * */
var App = {
    Version: '1.0.0.85',
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

            // check for File API support.
            if (window.File && window.FileReader && window.FileList && window.Blob) {

                $('#inline-file-input').on('change', function(evt) {

                    App_LocalDocs.handleInlineFileSelect(evt);
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

        $('.progress-bak').css('display', 'block');
        $('.progress-container').css('display', 'block');

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

        $('.progress-bak').css('display', 'none');
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
        //var styleStr = '.sec-cbe-highlight-dashed { border: 0px dashed ' + App_Settings.get('elementBorderColor') + '!important; cursor: pointer; }' +
        var styleStr = '.sec-cbe-highlight-dashed { border-top: 2px solid ' + App_Settings.get('elementBorderColor') + '!important; cursor: pointer; border-bottom: 2px solid ' + App_Settings.get('elementBorderColor') + '!important ; cursor: pointer;box-shadow: 0 0 10px #ccc;}' + 
            '.sec-cbe-highlight-dashed-highlight { border: 0px dashed ' + App_Settings.get('elementBorderColor') + '!important; cursor: pointer; }' +
            '.sec-cbe-highlight-block { display:block }' +
            '.sec-cbe-highlight-inline { display:inline }' +
           '.sec-cbe-highlight-filter { background-color:' + App_Settings.get('initialHighlightColor') + '!important; }' +
           '.sec-cbe-highlight-filter * { background-color:' + App_Settings.get('initialHighlightColor') + '!important; }' +
            '.sec-cbe-highlight-filter-selected { border: 3px solid ' + App_Settings.get('focusHighlightColor') + '!important; cursor: pointer; }' +
            '.sec-cbe-highlight-filter-selected-nodes { border: 0px solid ' + App_Settings.get('focusHighlightColor') + '!important; cursor: pointer; }' +
            //'.sec-cbe-highlight-filter-content-selected { border: 1px solid ' + App_Settings.get('focusHighlightSelectionColor') + '!important; cursor: pointer; }' +
            '.sec-cbe-highlight-filter-content-selected {background-color:' + App_Settings.get('blockHighlightColor') + ' !important; cursor: pointer;}' +
            '.sec-cbe-highlight-hover-content {background-color:' + App_Settings.get('blockHighlightColor') + ' !important; cursor: pointer;border: 2px dotted ' + App_Settings.get('elementBorderColor') + '}' +
            '.sec-cbe-highlight-hover-over-content-selected {border: 2px solid ' + App_Settings.get('focusContentSelectionColor') + '!important; cursor: pointer;}' +
            '.sec-cbe-highlight-content-selected { background-color:' + App_Settings.get('blockHighlightColor') + ' !important ; cursor: pointer;}'+
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

            // highlight the tagged elements
            App_Find.Highlight.highlight();
            
        });
        if (docPath && docPath != '') {

            var filename = docBasePath;
            App.fileNames.filing.inline = filename.substring(0, filename.indexOf('.'));
            App.frame.attr('src', docPath);
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

        var ns = App.InlineDoc.nsLookupByKey("us-gaap");
        if (ns) {

            var valAry = ns.split('/');
            var refBaseFileName = 'us-gaap-' + valAry[valAry.length - 1];

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
        if (App.InlineDoc.nsLookupByKey('us-gaap')) {

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

var App_LocalDocs = {
    handleInlineFileSelect:function(evt) {

        App.fileNames = {
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
        };

        // close selection detail if necessary
        $('#selection-detail-container').hide();
        $('#about-modal').hide();
        App.showLoadingDialog({
            message:"loading inline document ...",
            percent:100
        }, function() {

            var files = evt.target.files; // FileList object
            if (files.length == 0) {

                App.hideLoadingDialog();
            } else {

                var j = 0, k = files.length;
                for (var i = 0, f; f = files[i]; i++) {

                    var reader = new FileReader();
                    reader.onload = (function (theFile) {
                        return function (e) {

                            j++;

                            try {

                                App.XMLInlineDoc = $($.parseXML(e.target.result));
                                if (cbe.Utils.nsLookupByValue(App.XMLInlineDoc.find(':root')[0], cbe.Utils.namespaces.inline['1.0']) ||
                                    cbe.Utils.nsLookupByValue(App.XMLInlineDoc.find(':root')[0], cbe.Utils.namespaces.inline['1.1'])) {

                                    // reset the app
                                    App.resetUI();
                                    App.fileSelect = { inlineLoaded:true, customLoaded:false, refLoaded:false};
                                    App.fileNames.filing.inline = theFile.name.substring(0, theFile.name.indexOf('.'));

                                    // move on to loading custom files
                                    App.frame[0].contentDocument.open("text/html");
                                    App.frame[0].contentDocument.write(e.target.result);
                                    App.frame[0].contentDocument.close();
                                    App.frame[0].contentWindow.scrollTo(0, 0);
                                } else {

                                    alert('An Inline document was not provided; please select another file.');
                                }
                            } catch (e) {

                                console.log(e);
                                alert('Problem loading inline document: (' + e.message + ')');
                            }
                            App.hideLoadingDialog();
                        };
                    })(f);

                    if (f && f.type == "text/html") {

                        reader.readAsText(f);
                    } else if ((i == (k - 1)) && j == 0) {

                        alert('An Inline document was not provided; please select another file.');
                        App.hideLoadingDialog();
                    }
                }
            }
        });
    },
    handleCustomFilesSelect:function(evt) {

        App.showLoadingDialog({
            message:"loading custom taxonomy files ...",
            percent:100
        }, function() {

            var schemaDoc, labelDoc, calcDoc;
            var files = evt.target.files; // FileList object
            var totalRead = 0;
            var j = 0, k = files.length;
            for (var i = 0, f; f = files[i]; i++) {

                var reader = new FileReader();
                reader.onload = (function(theFile) {
                    return function(e) {

                        j++;

                        var doc = $($.parseXML(e.target.result));
                        if (!schemaDoc && cbe.Utils.nsLookupByValue(doc.find(':root')[0], "http://www.w3.org/2001/XMLSchema")) {

                            App.fileNames.filing.schema = theFile.name;
                            schemaDoc = doc;
                        } else if (!labelDoc && doc.find('link\\:label, label').length > 0) {

                            App.fileNames.filing.label = theFile.name;
                            labelDoc = doc;
                        } else if (!calcDoc && doc.find('link\\:calculationLink, calculationLink').length > 0) {

                            App.fileNames.filing.calculation = theFile.name;
                            calcDoc = doc;
                        }

                        if (j == totalRead) {

                            App.fileSelect.customLoaded = true;
                            App.XBRLDoc = new cbe.XBRLDoc();
                            App.XBRLDoc.setFilingDocs({
                                schema:schemaDoc,
                                label:labelDoc,
                                calculation:calcDoc
                            });

                            App.hideMessage();
                            App.hideLoadingDialog();

                            // prompt to load reference docs
                            App.showMessage(
                                    'Cannot find the standard taxonomy files; click folder icon to select the or close the message to continue. ' +
                                    '<div style="width:24px;height:22px;display: inline-block;position:relative;">' +
                                    '<a href="javascript:void(0);" class="glyphicon glyphicon-folder-open" style="position:absolute;left:0;top:5px;color:#000;">&nbsp;</a>' +
                                    '<input id="ref-file-input" type="file" multiple accept=".xml,.xsd" style="position:absolute;left:0;top:5px;width:inherit;opacity: 0;" />' +
                                    '</div>'
                            );
                            $('#ref-file-input').on('change', function(evt) {

                                App_LocalDocs.handleRefDocFilesSelect(evt);
                            });
                        }
                    };
                })(f);

                if ((f.type == "text/xml" || f.name.indexOf('.xsd') != -1)) {

                    totalRead++;
                    reader.readAsText(f);
                } else if ((i == (k - 1)) && j == 0) {

                    App.hideLoadingDialog();
                }
            }
        });
    },
    handleRefDocFilesSelect:function(evt) {

        App.showLoadingDialog({
            message:"loading standard taxonomy files ...",
            percent:100
        }, function() {

            var schemaDoc, labelDoc, documentationDoc;
            var files = evt.target.files; // FileList object
            var totalRead = 0;
            var j = 0, k = files.length;
            for (var i = 0, f; f = files[i]; i++) {

                var reader = new FileReader();
                reader.onload = (function (theFile) {
                    return function (e) {

                        j++;

                        var doc = $($.parseXML(e.target.result));

                        if (j == totalRead) {

                            App.XBRLDoc.setRefDocs({
                                schema: schemaDoc,
                                label: labelDoc,
                                documentation: documentationDoc
                            });
                            App.hideMessage();
                            App.hideLoadingDialog();
                        }
                    };
                })(f);

                if (f && (f.type == "text/xml" || f.name.indexOf('.xsd') != -1)) {

                    totalRead++;
                    reader.readAsText(f);
                } else if ((i == (k - 1)) && j == 0) {

                    App.hideLoadingDialog();
                }
            }
        });
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