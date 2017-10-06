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
        //'ixt':'http://www.xbrl.org/inlineXBRL/transformation/2010-04-20',
        'link':'http://www.xbrl.org/2003/linkbase',
        'xml':'http://www.w3.org/XML/1998/namespace',
        //'ixtex':'urn:inlinexbrl:transformation:rules:xmlns:ixtex:1.0',
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

                var item = [];
                if (doc && doc.hasAttributes()) {

                    var attributes = doc.attributes;
                    for(var k in attributes) {

                        var attribute = attributes[k];
                        if (typeof attribute == 'object' &&
                            attribute.value == val && attribute.name.lastIndexOf("xmlns:", 0)==0) {

                            if (prefixOnly) {

                                var nameAry = attribute.name.split(':');
                                if (nameAry.length == 2) {

                                	item.push(nameAry[1]);
                                }
                            } else {

                            	item.push(attribute.name);
                            }
                           // break;
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
                        if (typeof attribute == 'object' && attribute.name.lastIndexOf("xmlns:", 0)==0) {

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
				dimensionNameForSearch:$(),
				relationships:$(),
				continuations:$()
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

            var _setDocumentCustomPrefix = function() {
            	if (_cacheInstance != null) {
            		self.customPrefix = _cacheInstance.nsprefix;
            	}
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
                    if (prefix.length) {

                        self.inlinePrefix = prefix;
                        self.inlineVersion = k;
                        break;
                    }
                }
            };
            var _setStandardTaxonomyPrefix = function() {
            	//self.standardTaxonomy=self.nsLookupByValue(self.getDocumentNamespaces()["us-gaap"],true);
            	var inlineNameSpaceElements=Object.keys(self.getDocumentNamespaces());
             	for (var k in inlineNameSpaceElements) {
                    var prefix = self.nsLookupByKey(inlineNameSpaceElements[k]);
                    var regex="^http://fasb.org/us-gaap/\\d{4}-\\d{2}-\\d{2}$";
					if(prefix){
                    if(prefix.match(regex)){
                    	self.standardTaxonomy=inlineNameSpaceElements[k];
                    	break;
                    }
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
                                 if (element.nodeName.toLowerCase() == self.inlinePrefix + ':footnote') {
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
                        
                        if (nodeName == self.inlinePrefix + ':' + 'relationship') {
                        	_cache.relationships.push(node);
                        }
                        if (nodeName == self.inlinePrefix + ':' + 'continuation') {
                        	 _cache.continuations.push(node);

                        }
                       
                    }
                });

            };
            var _initCacheNew = function(parent,cnamegetting,callback) {
            	
            	var uri = URI(window.location.href);
		        var queryAry = URI.parseQuery(uri.query());
		        var dir;
		        var docUrl;
		        var metalinksUrl;		        
		        if (queryAry['metalinks']) {
		        	metalinksUrl = queryAry['metalinks'].toString();
		        	metalinksUrl.replace('interpretedFormat=true','interpretedFormat=false');
		        } 
		        if (queryAry['file']) {
		        	docUrl = queryAry['file'];	
		        } else if (queryAry['doc']) {
		        	docUrl = queryAry['doc'];		        	
		        } else {
		        	App.showMessage("Missing ?doc= in "+uri.path());
		        	App.hideLoadingDialog();
		        	return;
		        };
		        var filename;
		        if (docUrl.indexOf('?')>0) {
		        	var subquery = URI.parseQuery(docUrl);
		        	filename = subquery['filename'].toString();
		        	if (metalinksUrl == null) {
		        		metalinksUrl = (subquery['filename']='MetaLinks.json').toString();
		        	}
		        } else {
		        	var docURI = URI(docUrl);
		        	filename = docURI.filename();
		        	metalinksUrl = docURI.filename('MetaLinks.json').toString();
		        }
		        //metalinksUrl = "../documents/"+metalinksUrl;
		        $.ajax({
			        url:  metalinksUrl,
			        dataType: "json", 
			        async: true,
			        cache: false,
			        error: function(requestObject, error, errorThrown) {
			            App.showMessage("The <a href='"+metalinksUrl+"'>metadata</a> file could not be found.");
			            App.hideLoadingDialog();
			        },
			        success: function (requestObject,status,xhr,data) {
			        	_cacheMetaLinks = requestObject;
			        	if (requestObject.version == "2.0") {
			        		_cacheInstance = _cacheMetaLinks.instance[filename];
		            		_cacheMetaRefs = _cacheMetaLinks.std_ref;
							App_Find.Highlight.highlight();
							App_Find.Settings.init();
		            		_setDocumentCustomPrefix();
		            		
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
		        //metamore = "../documents/"+metamore;
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
            this.standardTaxonomy="";
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
                    	var prefix = self.nsLookupByValue(self.namespaces.xbrli, true);
                        for(var z=0;z<result.MetaLinks_list.MetaLinks.elements.tag.length;z++){
                            if((result.MetaLinks_list.MetaLinks.elements.tag[z]['-id'] == xbrId)&&(result.MetaLinks_list.MetaLinks.elements.tag[z]['-xbrltype']==prefix+':monetaryItemType')){
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
                    var includeSign = $.inArray('sign', types) != -1;

                    _cache.hidden.each(function(index, element) {

                        var nodeAry = element.nodeName.split(':');
                        if(nodeAry.length > 1) {

                            var type = nodeAry[1].toLowerCase();
                            if ((includeNumeric &&  type == 'nonfraction') ||
                                (includeText && type == 'nonnumeric') ) {
                                results.push($(element));
                            }
                            else if($(element).attr('sign')){
                            	if(includeSign && ($(element).attr('sign')=="-")){
                            		results.push($(element));
                            	}
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
                   results = _cache.header.find('*').filter(function() {
                   	for(var i=0;i<ns.length;i++){
                        if(this.nodeName.toLowerCase() == ns[i] + ":context"){
                       return this.nodeName.toLowerCase() == ns[i] + ":context";
                        }
                   	}
                   });
                }
                if(!results.length){
                	
                	results = _cache.header.find('*').filter(function() {
                		return this.nodeName.toLowerCase() == "context";
                	});
                }
                return results;
            };

            this.getContext = function(contextRef) {

                var result = null;

                var ns = cbe.Utils.nsLookupByValue(_inlineDoc[0], self.namespaces.xbrli, true);
                if (ns) {
                	for(var i=0;i<ns.length;i++){
                    result = _cache.header.find(ns[i] + '\\:context, context').filter(function() {

                        return $(this).attr('id') == contextRef;
                    });
                    if(result.length==0){
                    	continue;
                    }
                    else
                    	break;
                	}
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
				var dimensions=[];
				$.each(_cache.contextIDsForSearch , function(pos, val) { 
			        if(val === contextid){
			        	dimensions.push(_cache.dimensionNameForSearch[pos]);
			        }
			
			    });
		    	return dimensions;
				/*var pos = $.inArray(contextid, _cache.contextIDsForSearch);
				if(pos == -1){
					return null;
				}else{
					return _cache.dimensionNameForSearch[pos];
				}*/
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

                var items="";
                items = _cache.header.find('*').filter(function() {
                for(var i=0;i<self.instancePrefix.length;i++){
                     if(this.nodeName.toLowerCase() == self.instancePrefix[i] + ":unit"){
                    return this.nodeName.toLowerCase() == self.instancePrefix[i] + ":unit";
                     }
                	}
                });
                if(items.length){
                    return items;
                    }
                    else{
                    	items = _cache.header.find('*').filter(function() {
                         return this.nodeName.toLowerCase() == "unit";
                    	});
                    }
                return items;
            };
            this.getRelationships = function(){
            	var relationships=[];
            	relationships=_cache.relationships;
	        	return relationships;            
            };
            this.getFootnoteElements = function(){
            	var footnotes=[];
            	footnotes=_cache.footnotes;
	        	return footnotes;            
            };
            this.getContinuations = function(){
            	var continuations=[];
            	continuations=_cache.continuations;
	        	return continuations;            
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
                var prefix = self.nsLookupByValue(self.namespaces.xlink, true);
                if (linkPrefix) {

                    _cache.header.find(self.inlinePrefix + "\\:references, references").children().each(function(index, element) {

                        var e = $(element);
                        if (element.nodeName.toLowerCase() == linkPrefix + ':schemaref') {

                            schemaRef = e.attr(prefix+':href');
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
	        			var label=null;
	        			if(tags[id].lang['en-US']){
	        			label = tags[id].lang['en-US'].role['label'];
	        			}
	        			else{
	        				label = tags[id].lang['en'].role['label'];
	        			}
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
               if(result.tag[idgiven]){
            	   if(result.tag[idgiven].lang['en-US']){
            		   var label = result.tag[idgiven].lang['en-US'].role['label'];
                       if (label) callback.apply(parent,[label]); 
            	   }
				   else if(result.tag[idgiven].lang['en']){
            		   var label = result.tag[idgiven].lang['en'].role['label'];
                       if (label) callback.apply(parent,[label]); 
            	   }
				   else{
            		   return;
            	   }
               }else{
            	   return;
               }             
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
			  var roles=null;
			  if(this.getMetaData().tag[idgiven].lang['en-US'])
			  {
              roles = this.getMetaData().tag[idgiven].lang['en-US'];
			  }
			  else{
			  roles = this.getMetaData().tag[idgiven].lang['en'];
			  }
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
                if(App.InlineDoc.getMetaData()){
                if(App.InlineDoc.getMetaData().tag[idgiven]){
                	resjson = App.InlineDoc.getMetaData().tag[idgiven].xbrltype;
                }
                }
        		if (resjson) {callback.apply(parent,[resjson]);};                  
            };

            /* initialize */
            if (inlineDoc instanceof jQuery) {

                _inlineDoc = inlineDoc.contents().find('html');
                _loadDocumentNamespaces();
                _setStandardTaxonomyPrefix();
                //_setDocumentCustomPrefix();
                _setInstancePrefix();
                _setInlinePrefix();
                var fallback = (new RegExp("(doc|file)=([^&]*)", "i").exec(window.location.search))[2];
                if (self.inlinePrefix == "" && self.instancePrefix == "") {
                	var nodes = document.getElementById("mainDiv").getElementsByTagName('*');
                	for(var i = 0; i < nodes.length; i++){
                	     nodes[i].disabled = true;
                	}
                	App.showMessage("<a href='"+fallback+"' >"+fallback+"</a> was not an inline document.");
                	App.hideLoadingDialog();

                } else {
                	_initCache();
                	//_initCacheNew();
                	if (!self.inlineVersion) {
                		App.showMessage("Invalid inline document provided");
                		App.hideLoadingDialog();

                	}
                }
                 //setTimeout(function() {
               // _setDocumentCustomPrefix();
               // },10000);
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
                var prefix = self.nsLookupByValue(self.namespaces.xlink, true);
                // get labels from filings label file
                if ((idPrefix == self.standardTaxonomy || idPrefix == _customPrefix) && _filingDocs.label) {

                    var locEleName = 'loc', labelArcEleName = 'labelArc', labelEleName = 'label';
                    var prefix = cbe.Utils.nsLookupByValue(_filingDocs.label.find(':root')[0], _namespaces.link, true);

                    // find loc
                    loc = _filingDocs.label.find('*').filter(function() {

                        var idStr = '#' + id;
                        var href = $(this).attr(prefix+':href');
                        return href &&
                            (this.nodeName == locEleName || this.nodeName == prefix + ':' + locEleName) &&
                            href.indexOf(idStr, href.length - idStr.length) !== -1;
                    });
                    labelId = loc.attr(prefix+':label');

                    // find arc(s)
                    arcs = _filingDocs.label.find('*').filter(function() {

                        return (this.nodeName == labelArcEleName || this.nodeName == prefix + ':' + labelArcEleName) &&
                            $(this).attr(prefix+':from') == labelId;
                    });
                    arcs.each(function(index, element) {

                        arcId = $(element).attr(prefix+':to');

                        // get the labels
                        labels = _filingDocs.label.find('*').filter(function() {

                            return (this.nodeName == labelEleName || this.nodeName == prefix + ':' + labelEleName) &&
                                $(this).attr(prefix+':label') == arcId;
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
                var prefix = self.nsLookupByValue(self.namespaces.xlink, true);
                // get labels from filings label file
                if ((idPrefix == self.standardTaxonomy || idPrefix == _customPrefix) && _filingDocs.label) {

                    // find loc
                    loc = _filingDocs.label.find('loc['+prefix+'\\:href$="#' + id + '"]');
                    labelId = loc.attr(prefix+':label');

                    // find arc(s)
                    arcs = _filingDocs.label.find('labelArc['+prefix+'\\:from="' + labelId + '"]');
                    arcs.each(function(index, element) {

                        arcId = $(element).attr(prefix+':to');

                        // get the labels
                        label = _filingDocs.label.find('label['+prefix+'\\:label= "' + arcId + '"]').filter(function() {

                            return $(this).attr(prefix+':role') == role;
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

/* Created by staff of the U.S. Securities and Exchange Commission.
* Data and content created by government employees within the scope of their employment 
* are not subject to domestic copyright protection. 17 U.S.C. 105. *
*/

$(document).ready(function(){
	$('#opener').bind('keypress', function(e) {
		var code = e.keyCode || e.which;
		if((code == 13) || (code == 32)) { //Enter keycode
			App_Find.Results.init();
		  	var panel = $('#app-panel');
			if (screen.width < 641) {
				if (panel.hasClass("visible")) {
					$('#opener').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');
					$('#opener').attr("aria-label", "Expand Facts");
					$('#opener').attr("title", "Expand Facts");
					panel.removeClass('visible').animate({'margin-right':'-100%','width':'100%'});
		      		$('#app-inline-xbrl-doc').css({'width':'100%'});
		      		
		      		if((App_Find.Results._cachescrollDestination!=null)){
		            	App_Find.Results._cachescrollDestination.scrollIntoView();
		            }
			            
				} else {
					if($('#results-count').text()!=0){
						panel.addClass('visible').animate({'margin-right':'0px','width':'100%'});
						$('#opener').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-right');
						$('#opener').attr("aria-label", "Collapse Facts");
						$('#opener').attr("title", "Collapse Facts");
			      		$('#app-inline-xbrl-doc').css({'width':'0%','float':'left'});
			      		if($('#app-panel1').hasClass("visible")) {
							$('#app-panel1').removeClass('visible').animate({'margin-left':'-100%','width':'100%'});
						}
						if($('#app-panel2').hasClass("visible")) {
							$('#app-panel2').removeClass('visible').animate({'margin-left':'-100%','width':'100%'});
						}
					}
				}
			}
			else if (((screen.width > 641) && (screen.width < 768))  && (window.orientation) && (window.orientation == 90 || window.orientation == -90)) {
				if (panel.hasClass("visible")) {
					$('#opener').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');
					$('#opener').attr("aria-label", "Expand Facts");
					$('#opener').attr("title", "Expand Facts");
					panel.removeClass('visible').animate({'margin-right':'-100%','width':'100%'});
		      		$('#app-inline-xbrl-doc').css({'width':'100%'});
		      		
		      		if((App_Find.Results._cachescrollDestination!=null)){
		            	App_Find.Results._cachescrollDestination.scrollIntoView();
		            }
			            
				} else {
					if($('#results-count').text()!=0){
						panel.addClass('visible').animate({'margin-right':'0px','width':'100%'});
						$('#opener').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-right');
						$('#opener').attr("aria-label", "Collapse Facts");
						$('#opener').attr("title", "Collapse Facts");						
			      		$('#app-inline-xbrl-doc').css({'width':'0%','float':'left'});
			      		if($('#app-panel1').hasClass("visible")) {
							$('#app-panel1').removeClass('visible').animate({'margin-left':'-100%','width':'100%'});
						}
						if($('#app-panel2').hasClass("visible")) {
							$('#app-panel2').removeClass('visible').animate({'margin-left':'-100%','width':'100%'});
						}
					}
				}
			}
			else{
				if (panel.hasClass("visible")) {
					$('#opener').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');
					$('#opener').attr("aria-label", "Expand Facts");
					$('#opener').attr("title", "Expand Facts");
					panel.removeClass('visible').animate({'margin-right':'-30%','width':'30%'});
					panel.css({'width':'100%'});
		      		$('#app-inline-xbrl-doc').css({'width':'100%'});
		      		
				} else {
					if($('#results-count').text()!=0){
						panel.addClass('visible').animate({'margin-right':'0px','width':'30%'});
					    panel.css({'width':'100%'});
						$('#opener').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-right');
						$('#opener').attr("aria-label", "Collapse Facts");
						$('#opener').attr("title", "Collapse Facts");
			      		$('#app-inline-xbrl-doc').css({'width':'70%','float':'left'});
			      		if($('#app-panel1').hasClass("visible")) {
							$('#app-panel1').removeClass('visible').animate({'margin-left':'-30%','width':'30%'});
						}
						if($('#app-panel2').hasClass("visible")) {
							$('#app-panel2').removeClass('visible').animate({'margin-left':'-30%','width':'30%'});
							$('#menuBtn-reports').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');
							$('#menuBtn-reports').attr("aria-label", "Expand Tagged Sections");
							$('#menuBtn-reports').attr("title", "Expand Tagged Sections");
						}
					}
				}
			}
			return false;	
		}
	});
	$('#opener').on('click', function() {
		$(window).resize();
		//$('#app-inline-xbrl-doc').resize();
		App_Find.Results.init();
		$('#about-modal').dialog("close");
		var panel = $('#app-panel');
		if (screen.width < 641) {
			if (panel.hasClass("visible")) {
				$('#opener').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');
				$('#opener').attr("aria-label", "Expand Facts");
				$('#opener').attr("title", "Expand Facts");
				panel.removeClass('visible').animate({'margin-right':'-100%','width':'100%'});
	      		$('#app-inline-xbrl-doc').css({'width':'100%'});
	      		if((App_Find.Results._cachescrollDestination!=null)){
	            	App_Find.Results._cachescrollDestination.scrollIntoView();
	            }
			} else {
				if($('#results-count').text()!=0){
					panel.addClass('visible').animate({'margin-right':'0px','width':'100%'});
					$('#opener').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-right');
					$('#opener').attr("aria-label", "Collapse Facts");
					$('#opener').attr("title", "Collapse Facts");
		      		$('#app-inline-xbrl-doc').css({'width':'0%','float':'left'});
		      		if($('#app-panel1').hasClass("visible")) {
						$('#app-panel1').removeClass('visible').animate({'margin-left':'-100%','width':'100%'});
					}
					if($('#app-panel2').hasClass("visible")) {
						$('#app-panel2').removeClass('visible').animate({'margin-left':'-100%','width':'100%'});
					}
				}
			}
		}
		else if (((screen.width > 641) && (screen.width < 768))  && (window.orientation) && (window.orientation == 90 || window.orientation == -90)) {
			if (panel.hasClass("visible")) {
				$('#opener').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');
				$('#opener').attr("aria-label", "Expand Facts");
				$('#opener').attr("title", "Expand Facts");
				panel.removeClass('visible').animate({'margin-right':'-100%','width':'100%'});
	      		$('#app-inline-xbrl-doc').css({'width':'100%'});
	      		if((App_Find.Results._cachescrollDestination!=null)){
	            	App_Find.Results._cachescrollDestination.scrollIntoView();
	            }
			} else {
				if($('#results-count').text()!=0){
					panel.addClass('visible').animate({'margin-right':'0px','width':'100%'});
					$('#opener').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-right');
					$('#opener').attr("aria-label", "Collapse Facts");
					$('#opener').attr("title", "Collapse Facts");					
		      		$('#app-inline-xbrl-doc').css({'width':'0%','float':'left'});
		      		if($('#app-panel1').hasClass("visible")) {
						$('#app-panel1').removeClass('visible').animate({'margin-left':'-100%','width':'100%'});
					}
					if($('#app-panel2').hasClass("visible")) {
						$('#app-panel2').removeClass('visible').animate({'margin-left':'-100%','width':'100%'});
					}
				}
			}
		}else{
			if (panel.hasClass("visible")) {
				$('#opener').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');
				$('#opener').attr("aria-label", "Expand Facts");
				$('#opener').attr("title", "Expand Facts");
				panel.removeClass('visible').animate({'margin-right':'-30%','width':'30%'});
				$('#app-inline-xbrl-doc').css({'width':'100%'});
				if(screen.width>=768 && (((window.orientation=='0') || (window.orientation=='180')))){
					$('#app-inline-xbrl-doc').contents().find('body').css({'zoom':'100%'});
				}
				else if(screen.width>=768 && (((window.orientation=='90') || (window.orientation=='-90')))){
					$('#app-inline-xbrl-doc').contents().find('body').css({'zoom':'100%'});
				}
				/*if(!window.orientation){
					$('#app-inline-xbrl-doc').css({'width':'100%'});
				}*/
				//de364
				if(((App_Find.Results._cachescrollDestination!=null)&&(App_Find.Results._cachescrollDestination.length!=0))){
	            	App_Find.Results._cachescrollDestination.scrollIntoView();
	            }
			} else {
				if($('#results-count').text()!=0){
					panel.addClass('visible').animate({'margin-right':'0px','width':'30%'});
					$('#opener').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-right');
					$('#opener').attr("aria-label", "Collapse Facts");
					$('#opener').attr("title", "Collapse Facts");
					$('#app-inline-xbrl-doc').css({'width':'70%','float':'left'});
					if(screen.width>=768 && (((window.orientation=='0') || (window.orientation=='180')))){
						//var width4=(70/100)*($(document).width());
						$('#app-inline-xbrl-doc').contents().find('body').css({'zoom':'70%'});
						$('#app-inline-xbrl-doc').css({'float':'left'});
					}
					if(screen.width>=768 && (((window.orientation=='90') || (window.orientation=='-90')))){
						//var width2=(70/100)*($(document).width());
						$('#app-inline-xbrl-doc').contents().find('body').css({'zoom':'70%'});
						$('#app-inline-xbrl-doc').css({'float':'left'});
					}		

					window.addEventListener("orientationchange", function() {
						if(screen.width>=768 && (((window.orientation=='0') || (window.orientation=='180')))){
							//var width4=(70/100)*($(document).width());
							$('#app-inline-xbrl-doc').contents().find('body').css({'zoom':'70%'});
							$('#app-inline-xbrl-doc').css({'float':'left'});
						}
						if(screen.width>=768 && (((window.orientation=='90') || (window.orientation=='-90')))){
							//var width2=(70/100)*($(document).width());
							$('#app-inline-xbrl-doc').contents().find('body').css({'zoom':'70%'});
							$('#app-inline-xbrl-doc').css({'float':'left'});
						}
					}, false);

					if(!window.orientation){
						$('#app-inline-xbrl-doc').css({'width':'70%','float':'left'});
					}
		      		if($('#app-panel1').hasClass("visible")) {
						$('#app-panel1').removeClass('visible').animate({'margin-left':'-40%','width':'30%'});
					}
					if($('#app-panel2').hasClass("visible")) {
						$('#app-panel2').removeClass('visible').animate({'margin-left':'-30%','width':'30%'});
						$('#menuBtn-reports').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');
						$('#menuBtn-reports').attr("aria-label", "Expand Tagged Sections");
						$('#menuBtn-reports').attr("title", "Expand Tagged Sections");
					}
				}
			}//de364
			if(((App_Find.Results._cachescrollDestination!=null)&&(App_Find.Results._cachescrollDestination.length!=0))){
            	App_Find.Results._cachescrollDestination.scrollIntoView();
            }
		}
		return false;	
	});	
	$('#information,#instanceFileLi,#instanceFileIELi,#instanceAndCustomFile,#btn-reports,#btn-settings,#btn-help').bind('keydown',function(e)
			{
				var code = e.keyCode || e.which;
				if((code == 27)) {
					$('#menuIcon').focus();
					$('#menuIcon').click();
				}
			});
	$('#menuIcon').on('click', function() {
		if (($('#menudropdown').hasClass("open"))) {
			$('#menuIcon').attr("aria-label", "Expand Menu Button");
			$('#menuIcon').attr("title", "Expand Menu Button");
		}
		else{
				$('#menuIcon').attr("aria-label", "Collapse Menu Button");
				$('#menuIcon').attr("title", "Collapse Menu Button");
		}
		});
	$('#taggedDataResetColor').bind('keydown',function(e)
	{
		var code = e.keyCode || e.which;
		if((code == 13) || (code == 32)) {
			var icons = document.getElementsByClassName("simpleColorDisplay");
			for(var i=0; i<icons.length; i++) {
			$(icons[0]).attr("tabindex",0);
			$(icons[0]).attr("aria-label","Tagged Data Color Selector");
			   icons[0].click();
			}	
		$('.simpleColorChooser').attr("tabindex",0);
		$('.simpleColorCell').attr("tabindex",0);
		//var simpleClorCellZeroId= $('.simpleColorCell')[0].id;
		//var hexcode="#"+simpleClorCellZeroId;
		//$('.simpleColorCell').attr("aria-label",hexcode);
		$('.simpleColorCell').attr("aria-label","Inside Tagged Data Color Selector");
		var count=0;
		$('.simpleColorCell').bind('keydown',function(e){
			var code = e.keyCode || e.which;
			if(code==9){
				count=count+1;
				for(j=0;j<223;j++){
				if(j==(count)){
				//var simpleClorCellIds= $('.simpleColorCell')[j].id;
				//var hexcode="#"+simpleClorCellIds;
				//$('.simpleColorCell').attr("aria-label",hexcode);
				$('.simpleColorCell').attr("aria-label","Inside Tagged Data Color Selector");
				break;
				}
				}
			}
			if((code == 13) || (code == 32)) {
			$(this).click();
			for(var i=0; i<icons.length; i++) {
				   icons[0].click();
				   icons[0].focus();
				}
			}
		});
		}
	});
	$('#setting-border-highlight-color').bind('keydown',function(e)
			{
				var code = e.keyCode || e.which;
				if((code == 13) || (code == 32)) {
					var icons = document.getElementsByClassName("simpleColorDisplay");
					for(var i=0; i<icons.length; i++) {
					$(icons[0]).attr("tabindex",0);
					$(icons[0]).attr("aria-label","Tagged Data Color Selector");
					   icons[0].click();
					}	
				$('.simpleColorChooser').attr("tabindex",0);
				$('.simpleColorCell').attr("tabindex",0);
				//var simpleClorCellZeroId= $('.simpleColorCell')[0].id;
				//var hexcode="#"+simpleClorCellZeroId;
				//$('.simpleColorCell').attr("aria-label",hexcode);
				$('.simpleColorCell').attr("aria-label","Inside Tagged Data Color Selector");
				var count=0;
				$('.simpleColorCell').bind('keydown',function(e){
					var code = e.keyCode || e.which;
					if(code==9){
						count=count+1;
						for(j=0;j<223;j++){
						if(j==(count)){
						//var simpleClorCellIds= $('.simpleColorCell')[j].id;
						//var hexcode="#"+simpleClorCellIds;
						//$('.simpleColorCell').attr("aria-label",hexcode);
						$('.simpleColorCell').attr("aria-label","Inside Tagged Data Color Selector");
						break;
						}
						}
					}
					if((code == 13) || (code == 32)) {
					$(this).click();
					for(var i=0; i<icons.length; i++) {
						   icons[0].click();
						   icons[0].focus();
						}
					}
				});
				}
			});
	$('#searchResultsResetColor').bind('keydown',function(e)
			{
				var code = e.keyCode || e.which;
				if((code == 13) || (code == 32)) {
				var icons = document.getElementsByClassName("simpleColorDisplay");
				for(var i=0; i<icons.length; i++) {
					$(icons[1]).attr("tabindex",0);
					$(icons[1]).attr("aria-label","Search Results Color Selector");
					   icons[1].click();
					}	
				$('.simpleColorChooser').attr("tabindex",0);
				$('.simpleColorCell').attr("tabindex",0);
				//var simpleClorCellZeroId= $('.simpleColorCell')[0].id;
				//var hexcode="#"+simpleClorCellZeroId;
				//$('.simpleColorCell').attr("aria-label",hexcode);
				$('.simpleColorCell').attr("aria-label","Inside Search Results Color Selector");
				var count=0;
				$('.simpleColorCell').bind('keydown',function(e){
					var code = e.keyCode || e.which;
					if(code==9){
						count=count+1;
						for(j=0;j<223;j++){
						if(j==(count)){
						//var simpleClorCellIds= $('.simpleColorCell')[j].id;
						//var hexcode="#"+simpleClorCellIds;
						//$('.simpleColorCell').attr("aria-label",hexcode);
						$('.simpleColorCell').attr("aria-label","Inside Search Results Color Selector");
						break;
						}
						}
					}
					if((code == 13) || (code == 32)) {
					$(this).click();
					for(var i=0; i<icons.length; i++) {
						   icons[1].click();
						   icons[1].focus();
					}
					}
				});
				}
				
			});
	$('#selectedFactResetColor').bind('keydown',function(e)
			{
		var code = e.keyCode || e.which;
		if((code == 13) || (code == 32)) {
		var icons = document.getElementsByClassName("simpleColorDisplay");
		for(var i=0; i<icons.length; i++) {
			$(icons[2]).attr("tabindex",0);
			$(icons[2]).attr("aria-label","Selected Fact Color Selector");
			   icons[2].click();
			}	
		$('.simpleColorChooser').attr("tabindex",0);
		$('.simpleColorCell').attr("tabindex",0);
		$('.simpleColorCell').attr("aria-label","Inside Selected Fact Color Selector");
		var count=0;
		$('.simpleColorCell').bind('keydown',function(e){
			var code = e.keyCode || e.which;
			if(code==9){
				count=count+1;
				for(j=0;j<223;j++){
				if(j==(count)){
				$('.simpleColorCell').attr("aria-label","Inside Selected Fact Color Selector");
				break;
				}
				}
			}
			if((code == 13) || (code == 32)) {
			$(this).click();
			for(var i=0; i<icons.length; i++) {
				   icons[2].click();
				   icons[2].focus();
			}
			}
		});
		}
		
	});
	$('#btn-help').on('click', function() {	
	$(window).resize();
		$('#menuIcon').dropdown("toggle");	
		var panel = $('#app-panel1');
		if (screen.width < 641) {
			if (panel.hasClass("visible")) {
				panel.removeClass('visible').animate({'margin-left':'-100%','width':'100%'});
	      		$('#app-inline-xbrl-doc').css({'width':'100%'});
			} else {panel.addClass('visible').animate({'margin-left':'0px','width':'100%'});
	      		$('#app-inline-xbrl-doc').css({'width':'0%','float':'right'});
	      		if($('#app-panel').hasClass("visible")) {
					$('#app-panel').removeClass('visible').animate({'margin-right':'-100%','width':'100%'});
					$('#opener').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');
					$('#opener').attr("aria-label", "Expand Facts");
					$('#opener').attr("title", "Expand Facts");
				}
				if($('#app-panel2').hasClass("visible")) {
					$('#app-panel2').removeClass('visible').animate({'margin-left':'-100%','width':'100%'});
				}
			}	
		}
		else if (((screen.width > 641) && (screen.width < 768))  && (window.orientation == 0 || window.orientation == 180)) {
			if (panel.hasClass("visible")) {
				panel.removeClass('visible').animate({'margin-left':'-100%','width':'100%'});
	      		$('#app-inline-xbrl-doc').css({'width':'100%'});
			} else {panel.addClass('visible').animate({'margin-left':'0px','width':'100%'});
	      		$('#app-inline-xbrl-doc').css({'width':'0%','float':'right'});
	      		if($('#app-panel').hasClass("visible")) {
					$('#app-panel').removeClass('visible').animate({'margin-right':'-100%','width':'100%'});
					$('#opener').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');
					$('#opener').attr("aria-label", "Expand Facts");
					$('#opener').attr("title", "Expand Facts");
				}
				if($('#app-panel2').hasClass("visible")) {
					$('#app-panel2').removeClass('visible').animate({'margin-left':'-100%','width':'100%'});
				}
			}	
		}
		
		else{
			if (panel.hasClass("visible")) {
				panel.removeClass('visible').animate({'margin-left':'-30%','width':'30%'});
	      		$('#app-inline-xbrl-doc').css({'width':'100%'});
			} else {panel.addClass('visible').animate({'margin-left':'0px'});
	      		$('#app-inline-xbrl-doc').css({'width':'70%','float':'right'});
	      		if($('#app-panel').hasClass("visible")) {
					$('#app-panel').removeClass('visible').animate({'margin-right':'-30%','width':'30%'});
					$('#opener').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');
					$('#opener').attr("aria-label", "Expand Facts");
					$('#opener').attr("title", "Expand Facts");
				}
				if($('#app-panel2').hasClass("visible")) {
					$('#app-panel2').removeClass('visible').animate({'margin-left':'-30%','width':'30%'});
					$('#menuBtn-reports').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');
					$('#menuBtn-reports').attr("aria-label", "Expand Tagged Sections");
					$('#menuBtn-reports').attr("title", "Expand Tagged Sections");
				}
			}
		}
		
		return false;	
	});
	$('.dataSection').on('click', function() {	
		$('#about-modal').dialog("close");
	});
    $('.conceptsSection').on('click', function() {	
		
		$('#about-modal').dialog("close");
		
	});
    $('.moreFiltersSection').on('click', function() {	
		
		$('#about-modal').dialog("close");
		
	});
    $('#menuIcon').on('click', function() {	
    	$('#about-modal').dialog("close");
		
	});
    
	$('#btn-reports').on('click', function() {
		$('#about-modal').dialog("close");
		$('#menuIcon').dropdown("toggle");	
		App_Find.TaggedSection.lazyLoadData();
    	$('#app-panel-reports-container').show('slide');
		App_Find.TaggedSection.loadData();
		var panel = $('#app-panel2');
		if (screen.width < 641) {
			if (panel.hasClass("visible")) {
			
				panel.removeClass('visible').animate({'margin-left':'-100%','width':'100%'});
	      		$('#app-inline-xbrl-doc').css({'width':'100%'});
			} else {panel.addClass('visible').animate({'margin-left':'0px','width':'100%'});

	      		$('#app-inline-xbrl-doc').css({'width':'0%','float':'right'});
	      		if($('#app-panel').hasClass("visible")) {
					$('#app-panel').removeClass('visible').animate({'margin-right':'-100%','width':'100%'});
					$('#opener').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');
					$('#opener').attr("title", "Expand Facts");
					$('#opener').attr("aria-label", "Expand Facts");
				}
				if($('#app-panel1').hasClass("visible")) {
					$('#app-panel1').removeClass('visible').animate({'margin-left':'-100%','width':'100%'});
				}
				
			}	
		}
		else{
			if (panel.hasClass("visible")) {
				panel.removeClass('visible').animate({'margin-left':'-30%','width':'30%'});
	      		$('#app-inline-xbrl-doc').css({'width':'100%'});
	      		$('#menuBtn-reports').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');
				$('#menuBtn-reports').attr("title", "Expand Tagged Sections");
				$('#menuBtn-reports').attr("aria-label", "Expand Tagged Sections");
			} else {panel.addClass('visible').animate({'margin-left':'0px'});
	      		$('#app-inline-xbrl-doc').css({'width':'70%','float':'right'});
	      		if($('#app-panel').hasClass("visible")) {
					$('#app-panel').removeClass('visible').animate({'margin-right':'-30%','width':'30%'});
					$('#opener').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');
					$('#opener').attr("title", "Expand Facts");
					$('#opener').attr("aria-label", "Expand Facts");
				}
				if($('#app-panel1').hasClass("visible")) {
					$('#app-panel1').removeClass('visible').animate({'margin-left':'-30%','width':'30%'});
				}
			}
		}
		return false;	
	});
	
	$('#menuBtn-reports').bind('keypress', function(e) {
		var code = e.keyCode || e.which;
		if((code == 13) || (code == 32)) { //Enter keycode
		  	var panel = $('#app-panel2');
			if (panel.hasClass("visible")) {
				$('#menuBtn-reports').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');
				$('#menuBtn-reports').attr("title", "Expand Tagged Sections");
				$('#menuBtn-reports').attr("aria-label", "Expand Tagged Sections");
				panel.removeClass('visible').animate({'margin-left':'-30%','width':'30%'});
	      		$('#app-inline-xbrl-doc').css({'width':'100%'});
			} else {panel.addClass('visible').animate({'margin-left':'0px'});
				$('#menuBtn-reports').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-right');
				$('#menuBtn-reports').attr("title", "Collapse Tagged Sections");
				$('#menuBtn-reports').attr("aria-label", "Collapse Tagged Sections");
	      		$('#app-inline-xbrl-doc').css({'width':'70%','float':'right'});
	      		if($('#app-panel').hasClass("visible")) {
					$('#app-panel').removeClass('visible').animate({'margin-right':'-30%','width':'30%'});
					$('#opener').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');
					$('#opener').attr("title", "Expand Facts");
					$('#opener').attr("aria-label", "Expand Facts");
				}
				if($('#app-panel1').hasClass("visible")) {
					$('#app-panel1').removeClass('visible').animate({'margin-left':'-30%','width':'30%'});
				}
			}
			return false;			
		}
	});
	$('#menuBtn-reports').on('click', function() {
		$(window).resize();
		var panel = $('#app-panel2');
		if (panel.hasClass("visible")) {
			$('#menuBtn-reports').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');
			$('#menuBtn-reports').attr("title", "Expand Tagged Sections");
			$('#menuBtn-reports').attr("aria-label", "Expand Tagged Sections");
			panel.removeClass('visible').animate({'margin-left':'-30%','width':'30%'});
      		$('#app-inline-xbrl-doc').css({'width':'100%'});
			//DE364
	
      		if(((App_Find.TaggedSection._cachescrollDestination!=null)&&(App_Find.TaggedSection._cachescrollDestination.length!=0))){
      	     	App_Find.TaggedSection._cachescrollDestination.scrollIntoView();
      		
			}
		} else {panel.addClass('visible').animate({'margin-left':'0px'});
			$('#menuBtn-reports').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-right');
			$('#menuBtn-reports').attr("title", "Collapse Tagged Sections");
			$('#menuBtn-reports').attr("aria-label", "Collapse Tagged Sections");
      		$('#app-inline-xbrl-doc').css({'width':'70%','float':'right'});
      		if($('#app-panel').hasClass("visible")) {
				$('#app-panel').removeClass('visible').animate({'margin-right':'-30%','width':'30%'});
				$('#opener').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');
				$('#opener').attr("title", "Expand Facts");
				$('#opener').attr("aria-label", "Expand Facts");
			}
			if($('#app-panel1').hasClass("visible")) {
				$('#app-panel1').removeClass('visible').animate({'margin-left':'-30%','width':'30%'});
			}
			//de364
		if(((App_Find.TaggedSection._cachescrollDestination!=null)&&(App_Find.TaggedSection._cachescrollDestination.length!=0))){
  				App_Find.TaggedSection._cachescrollDestination.scrollIntoView();
        }
		}
		return false;	
	});
});
jQuery(function($) {
 
  
  // /////
  // CLEARABLE INPUT
  function tog(v){return v?'addClass':'removeClass';} 
  $(document).on('click', '#search-input', function(){
	  $('#resetButton').css('display','block');  
      $('#about-modal').dialog("close");
	  
	});
  $(document).on('click', '.close-icon', function(){
    App.showSpinner1($('#mainDiv'), function() {
		App_Find.Results.load();
		if($('#app-panel-reports-container').css('display') == 'block'){
			App_Find.TaggedSection.refreshTaggedSection($('#search-input').val());
		}
		$('#resetButton').css('display','none'); 
        App.hideSpinner();
    });
    
   
  
});

});