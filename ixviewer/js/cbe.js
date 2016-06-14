/* Created by staff of the U.S. Securities and Exchange Commission.
* Data and content created by government employees within the scope of their employment 
* are not subject to domestic copyright protection. 17 U.S.C. 105.
*/

"use strict";

(function (cbe, $) {

    /**
     * Common namespaces
     */
    var _namespaces = {
        'ixt':'http://www.xbrl.org/inlineXBRL/transformation/2010-04-20',
        'link':'http://www.xbrl.org/2003/linkbase',
        'xml':'http://www.w3.org/XML/1998/namespace',
        'ixtex':'urn:inlinexbrl:transformation:rules:xmlns:ixtex:1.0',
        'xhtml':'http://www.w3.org/1999/xhtml',
        'xbrli':'http://www.xbrl.org/2003/instance',
        'xl':'http://www.xbrl.org/2003/XLink',
        'xlink':'http://www.w3.org/1999/xlink',
        'xsd':'http://www.w3.org/2001/XMLSchema',
        'xsi':'http://www.w3.org/2001/XMLSchema-instance',
        'xbrldt':'http://xbrl.org/2005/xbrldt',
        'xbrldi':'http://xbrl.org/2006/xbrldi',
        label: {
            linkbase:"http://www.w3.org/1999/xlink/properties/linkbase",
            linkbaseRef:"http://www.xbrl.org/2003/role/labelLinkbaseRef",
            label:"http://www.xbrl.org/2003/role/label",
            terse:"http://www.xbrl.org/2003/role/terseLabel",
            documentation:"http://www.xbrl.org/2003/role/documentation"
        },
        'inline':{
            '1.0':'http://www.xbrl.org/2008/inlineXBRL',
            '1.1':'http://www.xbrl.org/2013/inlineXBRL'
        }
    };

    /**
     * CBE Utilities
     */
    if (!cbe.Utils) {

        cbe.Utils = {
            namespaces:_namespaces,
            nsLookupByValue:function(doc, val, prefixOnly) {

                var item = null;
                if (doc && doc.hasAttributes()) {

                    var attributes = doc.attributes;
                    for(var k in attributes) {

                        var attribute = attributes[k];
                        if (typeof attribute == 'object' &&
                            attribute.value == val) {

                            if (prefixOnly) {

                                var nameAry = attribute.name.split(':');
                                if (nameAry.length == 2) {

                                    item = nameAry[1];
                                }
                            } else {

                                item = attribute.name;
                            }
                            break;
                        }
                    }
                }
                return item;
            },
            nsLookupByKey:function(doc, key) {

                var item = null;
                if (doc && doc.attributes) {

                    var attributes = doc.attributes;
                    for(var k in attributes) {

                        var attribute = attributes[k];
                        if (typeof attribute == 'object') {

                            var nameAry = attribute.name.split(':');
                            if (nameAry.length == 2 && nameAry[1] == key) {

                                item = attribute.value;
                                break;
                            } else if (attribute.name == key) {

                                item = attribute.value;
                                break;
                            }
                        }
                    }
                }
                return item;
            },
            getPrefixFromId:function(id) {

                var idAry = id.split('_');
                return idAry.length == 2 ? idAry[0] : id;
            }
        }
    }

    /**
     * CBE Inline API for accessing the inline document information
     */
    if (!cbe.InlineDoc) {

        cbe.InlineDoc = function(inlineDoc) {

            // private //
            var self = this;
            var _inlineDoc;
            var _inlineDocNamespaces = {};
            var _cache = {
                header:$(),
                hidden:$(),
                elements:$(),
                footnotes:$(),
                contextIDs:$(),
                contexts:$(),
                contextIDsForAxis:$(),
                dimensionNameforAxis:$(),
                contextIDsForSearch:$(),
				dimensionNameForSearch:$()
            };
            var _cacheMetaLinks = null;
            var _cacheInstance = null;
            var _cacheMetaRefs = null;
            var _cacheMetaMoreCustom = null;

            var _loadDocumentNamespaces = function() {

                var attributes = _inlineDoc[0].attributes;
                for(var k in attributes) {

                    var attribute = attributes[k];
                    if (typeof attribute == 'object') {

                        var nameAry = attribute.name.split(':');
                        if (nameAry.length == 2) {

                            _inlineDocNamespaces[nameAry[1]] = attribute.value;
                        }
                    }
                }
            };

            /*var _setDocumentCustomPrefix = function() {

                var domains = ["w3.org", "xbrl.org", "fasb.org", "sec.gov", "compsciresources.com"];
                for (var k in _inlineDocNamespaces) {

                    var a = document.createElement('a');
                    a.href = _inlineDocNamespaces[k];
                    var hostname = a.host.replace(':80', '').split('.').slice(-2).join(".");
                    if (domains.indexOf(hostname) == -1) {
                        self.customPrefix = k;
                        break;
                    }
                }
            };*/
            
            var _setDocumentCustomPrefix = function() {

                self.customPrefix = _cacheInstance.nsprefix;
            };

            var _setInstancePrefix = function() {

                var prefix = self.nsLookupByValue(self.namespaces.xbrli, true);
                if (prefix) {

                    self.instancePrefix = prefix;
                }
            };

            var _setInlinePrefix = function() {

                for (var k in _namespaces.inline) {

                    var prefix = self.nsLookupByValue(_namespaces.inline[k], true);
                    if (prefix) {

                        self.inlinePrefix = prefix;
                        self.inlineVersion = k;
                        break;
                    }
                }
            };

            var _initCache = function() {
				
				_cache.contextIDs.empty();
                _cache.contexts.empty();
                _cache.contextIDsForAxis.empty();
                _cache.dimensionNameforAxis.empty();
                _cache.contextIDsForSearch.empty();
				_cache.dimensionNameForSearch.empty();

                _inlineDoc.find('body *').each(function(index, element) {

                    var node = $(element);
                    var nodeName = element.nodeName.toLowerCase();

                    // first make sure it is a tagged item
                    if (nodeName.substring(0, this.nodeName.indexOf(':')) == self.inlinePrefix) {

                        if (nodeName == self.inlinePrefix + ':' + 'header') {

                            _cache.header = node;

                        } else if (nodeName == self.inlinePrefix + ':' + 'hidden') {
                        	_cache.hidden = node.children();
                        	_cache.hidden.each(function(index, element) {
                                 if (element.nodeName.toLowerCase() == 'ix:footnote') {
                                	 _cache.footnotes.push($(element));
                                 }
                             });
                           
                        } else if (node.parents(self.inlinePrefix + '\\:header, header').length == 0) {

                            // numeric and text elements are kept together because there is a requirement to follow the order in the inline document
                            if ((nodeName == self.inlinePrefix + ':nonfraction') ||
                                nodeName == self.inlinePrefix + ':nonnumeric') {

                                _cache.elements.push(node);
                            } else if (nodeName == self.inlinePrefix + ':footnote') {
                                _cache.footnotes.push(node);
                            }
                        }
                    }
                });

            };
            var _initCacheNew = function(parent,cnamegetting,callback) {
            	
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
		        query = URI(query);
		        var filename = query.filename(); 
		        var metalinks = query.filename('MetaLinks.json').toString();
		        //metalinks = "../documents/"+metalinks;
		        $.ajax({
			        url:  metalinks,
			        dataType: "json", 
			        async: false,
			        cache: false,
			        error: function(requestObject, error, errorThrown) {
			            App.showMessage("Could not locate valid <a href='"+metalinks+"'>metadata</a> document.");
			            App.hideLoadingDialog();
			        },
			        success: function (requestObject) {
			        	_cacheMetaLinks = requestObject;
			        	if (requestObject.version == "2.0") {
			        		_cacheInstance = _cacheMetaLinks.instance[filename];
		            		_cacheMetaRefs = _cacheMetaLinks.std_ref;
			        	} else {
			        		App.showMessage("Object found was not a MetaLinks version 2.0 file");
			        	}
			        }
		        });
            };
            var _initCacheNewMore = function(parent,cnamegetting,callback) {
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
		        query = URI(query);
		        var filename = query.filename(); 
		        var metamore = query.filename('MetaMore.json').toString();
		       // metamore = "../documents/"+metamore;
		        $.ajax({
			        url:  metamore,
			        dataType: "json", 
			        async: false,
			        cache: true,
			        error: function(requestObject, error, errorThrown) {
			            //App.showMessage("Could not locate valid <a href='"+metamore+"'>metamore</a> document.");
			            //App.hideLoadingDialog();
			            _cacheMetaMoreCustom="Not Found";
			        },
			        success: function (requestObject) {
			        	var _cacheCustomLinks = requestObject;
			        	if (requestObject.version == "2.0") {
			        		_cacheMetaMoreCustom = _cacheCustomLinks.customLink;
			        	} else {
			        		App.showMessage("Object found was not a Metamore version 2.0 file");
			        	}
			        }
		        
		        });
		        
            };

            // public //
            this.namespaces = _namespaces;
            this.customPrefix = '';
            this.instancePrefix = '';
            this.inlinePrefix = '';
            this.inlineVersion = null;

            this.getElements = function(includeHidden) {

                var results = $.merge($(), _cache.elements);

                if (includeHidden != undefined && includeHidden) {

                    $.merge(results, _cache.hidden);
                }

                return results;
            };

            this.getElementsByType = function(types, includeHidden) {

                var results = $();
                if (types instanceof Array) {

                    var includeNumeric = $.inArray('nonFraction', types) != -1;
                    var includeText = $.inArray('nonNumeric', types) != -1;
                    var includeHiddenOnly = $.inArray('hidden', types) != -1;
                    var includeNegativeOnly = $.inArray('negative', types) != -1;
                    var includeSignOnly = $.inArray('sign', types) != -1;
                    var ixprefix = self.inlinePrefix;
                    if (ixprefix != "") ixprefix += ":";
                    var ixprefixlength = ixprefix.length;

                    // numeric
                    if (includeNumeric && includeText) {

                        $.merge(results, _cache.elements);
                    } else if (includeNumeric && !includeText) {
                    	// internal HTML representation stores localname as prefix:localname.
                        _cache.elements.each(function(index, element) {
                        	var localName = element[0].localName;
                        	if (localName.indexOf(ixprefix)==0 
                        			&& localName.indexOf("nonfraction")==ixprefixlength) {
                        		results.push(element);
                            }
                        });
                    } else if (includeText && !includeNumeric) {
                    	_cache.elements.each(function(index, element) {
                        	var localName = element[0].localName;
                        	if (localName.indexOf(ixprefix)==0 
                        			&& localName.indexOf("nonnumeric")==ixprefixlength) {
                        		results.push(element);
                            }
                        });
                    } else if (includeSignOnly) {
						var signType = "-";
                        $.merge(results, self.getElementsBySign(signType));
                    } else if (includeNegativeOnly) {
                        $.merge(results, self.getElementsByNegative());
                    }  

                    // hidden
                    if (includeHidden != undefined && includeHidden) {

                        $.merge(results, self.getHiddenElementsByType(types));
                    }
                    
                    if (includeHiddenOnly) {
						
						var inlineHighlightTypes = ['nonFraction', 'nonNumeric'];
                        _cache.hidden.each(function(index, element) {
	                        var nodeAry = element.nodeName.split(':');
	                        if(nodeAry.length > 1) {
		                        for(var i=0;i<inlineHighlightTypes.length;i++){
			                        if(nodeAry[1].toLowerCase().indexOf(inlineHighlightTypes[i].toLowerCase())>-1){
				                        results.push($(element));
				                    }
		                        }
	                        }
	                    });
                    } 
                }
                return results;
            };
            
            this.getMetaLinks = function() {
            	if (!_cacheMetaLinks) {_initCacheNew();}
            	return _cacheMetaLinks;
            }
            
            this.getMetaRefs = function() {
            	return this.getMetaLinks().std_ref;
            };
            
            this.getMetaData = function() {
            	if (!_cacheInstance) {_initCacheNew();}
            	return _cacheInstance;
            };
            
            this.getMetaMoreData = function() {
            	if (!_cacheMetaMoreCustom) {
            	//_initCacheNewMore();
            		}
            	return _cacheMetaMoreCustom;
            };
            
            this.getElementByNameOriginal = function(name) {

                return _inlineDoc.find("[name='" + name + "']");
            };
            
            this.getElementByName = function(name) {

                var results = $();

                _cache.elements.each(function(index, element) {

                    if (element.attr('name') == name) {

                        results.push(element);
                    }
                });

                if (results.length == 0) {

                    _cache.hidden.each(function(index, element) {

                        if ($(element).attr('name') == name) {

                            results.push(element);
                        }
                    });
                }

                return results;
            };

            this.getElementByNameAndContext = function(name, context) {

                var results = $();

                _cache.elements.each(function(index, element) {

                    if (element.attr('name') == name && element.attr('contextRef') == context) {

                        results.push(element);
                    }
                });

                if (results.length == 0) {

                    _cache.hidden.each(function(index, element) {

                        var node = $(element);
                        if (node.attr('name') == name && node.attr('contextRef') == context) {

                            results.push(node);
                        }
                    });
                }

                return results;
            };
            
            this.getElementsByContextOriginal = function(context) {

                return _inlineDoc.find("[contextRef='" + context + "']");
            };


            this.getElementsByContext = function(context) {

                var results = $();

                _cache.elements.each(function(index, element) {

                    if (element.attr('contextRef') == context) {

                        results.push(element);
                    }
                });

                return results;
            };

            this.getElementsByUnit = function(unit) {

                var results = $();

                _cache.elements.each(function(index, element) {

                    if (element.attr('unitRef') == unit) {

                        results.push(element);
                    }
                });

                return results;
            };
            
            this.getElementsBySign = function(sign) {

                var results = $();

                _cache.elements.each(function(index, element) {

                    if (element.attr('sign') == sign) {

                        results.push(element);
                    }
                });

                return results;
            };
            
            this.getElementsByNegative = function() {
            	App.showMesssage("getElementsByNegative");alert("getElementsByNegative");
            	var results = $();
				
                _cache.elements.each(function(index, element) {
                
                    if (element.attr('sign') == "-") {
                        var count=0;
                    	var id = element.attr('name');
                		var xbrId = App_Utils.convertToXBRLId(id);
                    	var result = JSON.parse(_cacheMetaLinks);
                        for(var z=0;z<result.MetaLinks_list.MetaLinks.elements.tag.length;z++){
                            if((result.MetaLinks_list.MetaLinks.elements.tag[z]['-id'] == xbrId)&&(result.MetaLinks_list.MetaLinks.elements.tag[z]['-xbrltype']=='xbrli:monetaryItemType')){
                                count++;
                                results.push(element);
                            }
                            if(count>0){
                                break;
                            }
                        }
                    }
                });

                return results;
            };

            this.getHiddenElements = function() {

                return _cache.hidden;
            };

            this.getHiddenElementsByType = function(types) {

                var results = $();
                if (types instanceof Array) {

                    var includeNumeric = $.inArray('nonFraction', types) != -1;
                    var includeText = $.inArray('nonNumeric', types) != -1;

                    _cache.hidden.each(function(index, element) {

                        var nodeAry = element.nodeName.split(':'); 
                        if(nodeAry.length > 1) {

                            var type = nodeAry[1].toLowerCase();
                            if ((includeNumeric &&  type == 'nonfraction') ||
                                (includeText && type == 'nonnumeric')) {

                                results.push($(element));
                            }
                        }
                    });
                }
                return results;
            };

            this.getContexts = function() {

                var results = null;

                var ns = cbe.Utils.nsLookupByValue(_inlineDoc[0], self.namespaces.xbrli, true);
                if (ns) {

                    results = _cache.header.find(ns + '\\:context, context');
                }

                return results;
            };

            this.getContext = function(contextRef) {

                var result = null;

                var ns = cbe.Utils.nsLookupByValue(_inlineDoc[0], self.namespaces.xbrli, true);
                if (ns) {

                    result = _cache.header.find(ns + '\\:context, context').filter(function() {

                        return $(this).attr('id') == contextRef;
                    });
                }

                return result;
            };
            
            this.updateContextPeiod = function(contextid, contexts) {
				_cache.contextIDs.push(contextid);
				_cache.contexts.push(contexts);
            }
            
            this.updateContextAxis = function(contextid, dimensionName) {
				_cache.contextIDsForAxis.push(contextid);
				_cache.dimensionNameforAxis.push(dimensionName);
            }
            
            this.updateContextAxisForSearch = function(contextid, dimensionNameForSearch) {
				_cache.contextIDsForSearch.push(contextid);
				_cache.dimensionNameForSearch.push(dimensionNameForSearch);
            }
            
            this.getContextNormarisedString = function(contextid) {
				var pos = $.inArray(contextid, _cache.contextIDs);
				if(pos == -1){
					return contextid;
				}else{
					return _cache.contexts[pos][0];
				}
		    }
		    
		    this.getContextFromCache = function(contextid) {
		    	var getContextFromCacheArray = [];
			    $.each(_cache.contextIDsForAxis , function(pos, val) { 
			        if(val === contextid){
			            getContextFromCacheArray.push(_cache.dimensionNameforAxis[pos])
			        }
			
			    });
			    return getContextFromCacheArray;
		    
		    }
		    
		    this.getContextFromCacheForSearch = function(contextid) {
				
				var pos = $.inArray(contextid, _cache.contextIDsForSearch);
				if(pos == -1){
					return null;
				}else{
					return _cache.dimensionNameForSearch[pos];
				}
		    }

            this.getSegmentsForContext = function(context) {

                var currentContext = null;
                var segments = null;
                if (context instanceof jQuery) {

                    currentContext = context;
                } else if (typeof context === "string") {

                    currentContext = this.getContext(context);
                }
                if (currentContext) {

                    segments = currentContext.find(self.instancePrefix + "\\:segment, segment");
                }
                return segments;
            };

            this.getAxis = function() {

                var items;
                var checkingall = _cache.header.find('*');

                items = _cache.header.find('*').filter(function() {

                    var xbrlchek = (this.nodeName.toLowerCase()).replace('member','Member');

                    return xbrlchek == "xbrldi" + ":explicitMember";
                });

                return items;
            };

            this.getUnits = function() {

                var items;
                items = _cache.header.find('*').filter(function() {

                    return this.nodeName.toLowerCase() == self.instancePrefix + ":unit";
                });
                return items;

            };
            
            this.getDocumentContent = function() {

                return _inlineDoc;
            };

            this.getUnitById = function(id) {

                return _cache.header.find('*').filter(function() {

                    return $(this).attr('id') == id;
                });
            };

            this.nsLookupByValue = function(key, prefixOnly) {

                return cbe.Utils.nsLookupByValue(_inlineDoc[0], key, prefixOnly);
            };

            this.nsLookupByKey = function(key) {

                return cbe.Utils.nsLookupByKey(_inlineDoc[0], key);
            };

            this.getDocumentNamespaces = function() {

                return _inlineDocNamespaces;
            };

            this.getSchemaDocRef = function() {

                var schemaRef = null;
                var linkPrefix = self.nsLookupByValue(self.namespaces.link, true);
                if (linkPrefix) {

                    _cache.header.find(self.inlinePrefix + "\\:references, references").children().each(function(index, element) {

                        var e = $(element);
                        if (element.nodeName.toLowerCase() == linkPrefix + ':schemaref') {

                            schemaRef = e.attr('xlink:href');
                            return false;
                        }
                    });
                }
                return schemaRef;
            };

            this.getFootnote = function(id) {

                var note = '';
                var relationship = _cache.header.find("relationship[fromRefs='" + id + "']");
                if (relationship.length == 1) {

                    _cache.footnotes.each(function(index, element) {

                        if (element.attr('id') == relationship.attr('toRefs')) {

                            note = element.text().trim();
                            return false;
                        }
                    });
                }
                return note;
            };
            
            this.getStandardLabels = function(parent,callback){
            	var result = this.getMetaData();
                if (!result) return;
                var labelresult = {};
	            var tags = App.InlineDoc.getMetaData().tag;
	        	for (var id in tags) {
	        		if(tags[id].lang){
	        			var label = tags[id].lang['en-US'].role['label'];
		        		if (label) {
		        			labelresult[id] = label;
	        		}else{
	        			labelresult[id] = id.split("_")[1];
	        		}
	        	  }else{
	        			labelresult[id] = id.split("_")[1];
	        		}
              	}
	        	callback.apply(parent,[labelresult]);              
            };
            
            this.getHiddenItemDetails = function(){
            	var result = this.getMetaData();
                if (!result) return;
                var labelresult = {};
	            var hiddenElements = App.InlineDoc.getMetaData().hidden;
	        	return hiddenElements;            
            };
            
            this.getRemoteFileDetails = function(){
            	var result = this.getMetaData();
                if (!result) return;
	            var remoteElements = App.InlineDoc.getMetaData().dts.schema.remote;
	        	return remoteElements;            
            };
            
           this.getSelectedCustomData = function(idgiven,parent,cnamegetting,callback){
             _cacheMetaMoreCustom=null;
             var result = App.InlineDoc.getMetaMoreData();
             if (!result) return;
             if(App.InlineDoc.getMetaMoreData()!=undefined)
            	 {
	             var label = App.InlineDoc.getMetaMoreData();
	             if (label) callback.apply(parent,[label]); 
            	 }
             else
            	 return;
              
           };
           
           this.getSelectedLabel = function(idgiven,parent,cnamegetting,callback){
               var result = App.InlineDoc.getMetaData();
               if (!result) return;
               var label = result.tag[idgiven].lang['en-US'].role['label'];
               if (label) callback.apply(parent,[label]);             
             }; 
           
           this.getReportFromURI = function(uri,parent,callback){
               var result = App.InlineDoc.getMetaData();
               if (!result) return;
        	   var reports = result.report;
        	   for (var report_key in reports) {
        		   var report = reports[report_key];
        		   if (uri == report.role) {
        			   callback.apply(parent,[report]);
        			   break;
        		   }
        	   }
             }; 
           
           this.getRoleShortName = function(role,parent,callback) {    
        	   this.getReportFromURI(role,parent, function (report) {
        		   if (report.shortName && callback) callback.apply(parent,[report.shortName]);
        	   });
           };
           
           this.getRoleLongName = function(role,parent,callback) {    
        	   this.getReportFromURI(role,parent, function (report) {
        		   if (report.longName && callback) callback.apply(parent,[report.longName]);
        	   });
           };
           

           this.getReferencesfromJson = function(cnamegetting,parent,callback) {
        	   if (!this.getMetaData()) return;
        	   	var authrefval = this.getMetaRefs();
        	   	if (authrefval) { callback.apply(parent,[authrefval]);};
           };

           this.getLabelsfromJSON = function(idgiven,parent,callback){
              var labelresult = {};
              var count = 0;
              var result = this.getMetaLInks();
              roles = this.getMetaData().tag[idgiven].lang['en-US'];
              for (var role in roles) {  
            	  labelresult[role] = roles[role]; 
            	  }
              if (labelresult.length()>0) {
            	  callback.apply(parent,[labelresult]);         
              }              
            };            
            
            this.getCalculationJSON = function(idgiven,parent,callback){
              
              var calculationfields = {};
              calculationfields.parent = "N/A";
              calculationfields.section = "N/A";
              calculationfields.weight = "N/A";
              var label = "false";
              var count = 0;
              var result = this.getMetaData();
              if (!result) return;
              var tag = result.tag[idgiven];
              if (tag.crdr){
                  calculationfields.balance = tag.crdr;
                  count++;
              }
              var calculationItems = tag.calculation;
              for (var index in calculationItems) {
            	  count++;
            	  var calculation = calculationItems[index];
            	  switch (calculation.weight) {
            	  case 1.0: 
            		  calculationfields.weight = "Added to parent (1.00)";
            		  break;
            	  case -1.0:
            		  calculationfields.weight = "Subtracted from parent (-1.00)";
            		  break;
            		default:
            			  calculationfields.weight = calculation.weight;
            	  }
            	  calculationfields.parent = calculation.parentTag;
            	  if(calculation.parentTag!=null){
	            	  this.getSelectedLabel(calculation.parentTag,this,null,function(label) {
	            		  calculationfields.parent = label;});
            	  }
            	  calculationfields.section = index;
            	  this.getRoleLongName(index,this,function(longname) {
            		  calculationfields.section = longname;
            	  });
            	  break; // One calculation is enough
              }
              if (count>0) {
              callback.apply(parent,[calculationfields]);
              }
            };
            
            this.getIdTypes = function(idgiven, parent, cnamegetting,callback){
                var result = App.InlineDoc.getMetaLinks();
                if (!result) return;
                var resjson = null;
                resjson = App.InlineDoc.getMetaData().tag[idgiven].xbrltype;
        		if (resjson) {callback.apply(parent,[resjson]);};                
            };

            /* initialize */
            if (inlineDoc instanceof jQuery) {

                _inlineDoc = inlineDoc.contents().find('html');
                _loadDocumentNamespaces();
                //_setDocumentCustomPrefix();
                _setInstancePrefix();
                _setInlinePrefix();
                var fallback = (new RegExp("(doc|file)=([^&]*)", "i").exec(window.location.search))[2];
                if (self.inlinePrefix == "" && self.instancePrefix == "") {
                	App.showMessage("<a href='"+fallback+"' >"+fallback+"</a> was not an inline document.");
                	App.hideLoadingDialog();

                } else {
                	_initCache();
                	_initCacheNew();
                	if (!self.inlineVersion) {
                		App.showMessage("Invalid inline document provided");
                		App.hideLoadingDialog();

                	}
                }
                _setDocumentCustomPrefix();
            } else {

                jQuery.error('inline doc must be provided as a jQuery object');
            }
        }
    }

    /**
     * CBE XBRL API for accessing the reference doc information
     *
     * TODO: remove dependency on jquery for this API
     */
    if (!cbe.XBRLDoc) {

        cbe.XBRLDoc = function() {

            // private //
            var self = this;
            var _filingDocs = {
                schema:undefined,
                label:undefined,
                calculation:undefined
            };
            var _refDocs = {
                schema:undefined,
                label:undefined,
                documentation:undefined
            };
            var _customPrefix = '';
            var _docLoadStatuses = {
                loaded:'loaded',
                loading:'loading',
                failed:'failed'
            };

            var _invalidateRefDocs = function() {

                for (var k in _refDocs) {

                    if (!_refDocs[k]) {

                        _refDocs[k] = null;
                    }
                }
            };

            var _invalidateFilingDocs = function() {

                for (var k in _filingDocs) {

                    if (!_filingDocs[k]) {

                        _filingDocs[k] = null;
                    }
                }
            };

            var _getCustomPrefix = function() {

                var item = null;

                if (_filingDocs.schema) {

                    var doc = _filingDocs.schema.find(':root')[0];
                    var nsTarget = cbe.Utils.nsLookupByKey(doc, "targetNamespace");
                    if (nsTarget) {

                        if (doc && doc.attributes) {

                            var attributes = doc.attributes;
                            for (var k in attributes) {

                                var attribute = attributes[k];
                                if (typeof attribute == 'object' &&
                                    attribute.value == nsTarget &&
                                    attribute.name != 'targetNamespace') {

                                    var nameAry = attribute.name.split(':');
                                    if (nameAry.length == 2) {

                                        item = nameAry[1];
                                    }
                                    break;
                                }
                            }
                        }
                    }
                }

                return item;
            };

            // public //
            this.namespaces = _namespaces;

            this.getLabelsForId = function(id, includeDoc) {

                includeDoc = includeDoc == undefined ? true : includeDoc;
                var items = $(), loc, labelId, arcs, arcId, labels;
                var idPrefix = cbe.Utils.getPrefixFromId(id);

                // get labels from filings label file
                if ((idPrefix == 'us-gaap' || idPrefix == _customPrefix) && _filingDocs.label) {

                    var locEleName = 'loc', labelArcEleName = 'labelArc', labelEleName = 'label';
                    var prefix = cbe.Utils.nsLookupByValue(_filingDocs.label.find(':root')[0], _namespaces.link, true);

                    // find loc
                    loc = _filingDocs.label.find('*').filter(function() {

                        var idStr = '#' + id;
                        var href = $(this).attr('xlink:href');
                        return href &&
                            (this.nodeName == locEleName || this.nodeName == prefix + ':' + locEleName) &&
                            href.indexOf(idStr, href.length - idStr.length) !== -1;
                    });
                    labelId = loc.attr('xlink:label');

                    // find arc(s)
                    arcs = _filingDocs.label.find('*').filter(function() {

                        return (this.nodeName == labelArcEleName || this.nodeName == prefix + ':' + labelArcEleName) &&
                            $(this).attr('xlink:from') == labelId;
                    });
                    arcs.each(function(index, element) {

                        arcId = $(element).attr('xlink:to');

                        // get the labels
                        labels = _filingDocs.label.find('*').filter(function() {

                            return (this.nodeName == labelEleName || this.nodeName == prefix + ':' + labelEleName) &&
                                $(this).attr('xlink:label') == arcId;
                        });
                        if (labels.length > 0) {

                            $.merge(items, labels);
                        }
                    });
                }





                return items;
            };

            this.getLabelWithRoleForId = function(id, role) {

                var item, loc, labelId, arcs, arcId, label;
                var idPrefix = cbe.Utils.getPrefixFromId(id);

                // get labels from filings label file
                if ((idPrefix == 'us-gaap' || idPrefix == _customPrefix) && _filingDocs.label) {

                    // find loc
                    loc = _filingDocs.label.find('loc[xlink\\:href$="#' + id + '"]');
                    labelId = loc.attr('xlink:label');

                    // find arc(s)
                    arcs = _filingDocs.label.find('labelArc[xlink\\:from="' + labelId + '"]');
                    arcs.each(function(index, element) {

                        arcId = $(element).attr('xlink:to');

                        // get the labels
                        label = _filingDocs.label.find('label[xlink\\:label= "' + arcId + '"]').filter(function() {

                            return $(this).attr('xlink:role') == role;
                        });
                        if (label.length == 1) {

                            item = label;
                        }
                    });
                }





                return item;
            };

            this.getDocumentationForId = function(id) {

                var items = $(), loc, labelId, arcs, arcId, docs;
                var idPrefix = cbe.Utils.getPrefixFromId(id);



                return items;
            };
            
            this.getRoleDefForSection = function(section) {

                var item, roleTypeEleName = 'roleType', defEleName = 'definition';

                if (_filingDocs.schema) {

                    var prefix = cbe.Utils.nsLookupByValue(_filingDocs.schema.find(':root')[0], _namespaces.link, true);

                    // find loc
                    var link = _filingDocs.schema.find('*').filter(function() {

                        var sectionStr = '/' + section;
                        var roleURI = $(this).attr('roleURI');
                        return (this.nodeName == roleTypeEleName || this.nodeName == prefix + ':' + roleTypeEleName) &&
                            roleURI.substring(roleURI.length - sectionStr.length) == sectionStr;
                    });
                    if (link.length == 1) {

                        var def = link.find('*').filter(function() {

                            return this.nodeName == defEleName || this.nodeName == prefix + ':' + defEleName;
                        });
                        if (def.length == 1) {

                            item = def.text();
                        }
                    }
                }
                return item;
            };

            this.getRefDocLoadStatuses = function() {

                var statuses = {};

                for (var k in _refDocs) {

                    var status = _docLoadStatuses.loaded;
                    if (_refDocs[k] === undefined) {

                        status = _docLoadStatuses.loading;
                    } else if (_refDocs[k] === null) {

                        status = _docLoadStatuses.failed;
                    }
                    statuses[k + 'DocStatus'] = status;
                }

                return statuses;
            };

            this.getFilingDocLoadStatuses = function() {

                var statuses = {};

                for (var k in _filingDocs) {

                    var status = _docLoadStatuses.loaded;
                    if (_filingDocs[k] === undefined) {

                        status = _docLoadStatuses.loading;
                    } else if (_filingDocs[k] === null) {

                        status = _docLoadStatuses.failed;
                    }
                    statuses[k + 'DocStatus'] = status;
                }

                return statuses;
            };

            this.setRefDocs = function(refDocs) {

                _refDocs = $.extend({
                    schema:undefined,
                    label:undefined,
                    documentation:undefined
                }, refDocs);
                if ((_refDocs.schema || _refDocs.schema instanceof jQuery) &&
                    (_refDocs.label || _refDocs.label instanceof jQuery) &&
                    (_refDocs.documentation || _refDocs.documentation instanceof jQuery) ) {

                    return true;
                } else {

                    _invalidateRefDocs();
                    return false;
                }

            };

            this.setFilingDocs = function(filingDocs) {

                _filingDocs = $.extend({
                    schema:undefined,
                    label:undefined,
                    calculation:undefined
                }, filingDocs);
                if ((_filingDocs.schema || _filingDocs.schema instanceof jQuery) &&
                    (_filingDocs.label || _filingDocs.label instanceof jQuery) &&
                    (_filingDocs.calculation || _filingDocs.calculation instanceof jQuery)) {

                    var prefix = _getCustomPrefix();
                    if (prefix) {

                        _customPrefix = prefix;
                    }
                    return true;
                } else {

                    _invalidateFilingDocs();
                    return false;
                }
            };
        }
    }
})(window.cbe ? window.cbe : window.cbe = new Object(), jQuery);