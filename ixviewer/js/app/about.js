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
    load:function() {
    	 $("#about-modal").dialog({
				autoOpen : true
			});
        if (App_About.companyInformation == null) {

            App_About.loadCompanyInformation();
            
            var modal = $('#about-modal');
            modal.find('span[data-content="companyName"]').html(App_About.companyInformation.name);
            modal.find('span[data-content="companyCIK"]').html(App_About.companyInformation.cik);
            modal.find('span[data-content="companyDocument"]').html(App_About.companyInformation.document);
            modal.find('span[data-content="companyPeriodEndDate"]').html(App_About.companyInformation.periodEndDate);
            modal.find('span[data-content="companyFiscalYearAndPeriodFocus"]').html(App_About.companyInformation.fiscalYearFocus+""+App_About.companyInformation.periodFocus);
            modal.find('span[data-content="companyFiscalYear"]').html(App_About.companyInformation.fiscalYear);
            modal.find('span[data-content="companyAmendment"]').html(App_About.companyInformation.amendment);

            var amendmentDescription = '';
            if (App_About.companyInformation.amendment == 'true') {

                amendmentDescription = ' / ' +App_About.companyInformation.amendmentDescription;
            }
            modal.find('span[data-content="companyAmendmentDescription"]').html(amendmentDescription);

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
            App.showMessage("What are we doing here?",{},null);
            return;
            var dirpath;
            switch((App_About.companyInformation.name).trim()){
              case "GENUINE PARTS CO":  dirpath = "../documents/gpc/MetaLinks.json";
                break;
              case "ETHAN ALLEN INTERIORS INC":  dirpath = "../documents/eth/MetaLinks.json";
                break;
              case "PATTERSON COMPANIES, INC.":  dirpath = "../documents/pdco/MetaLinks.json";
                break;
              case "SYMANTEC CORP":  dirpath = "../documents/symc/MetaLinks.json";
                break;
              case "MENS WEARHOUSE INC":  dirpath = "../documents/menswharehouse/MetaLinks.json";
                break;
              case "BEAZER HOMES USA INC":  dirpath = "../documents/beazerhomes/MetaLinks.json";
                break;
              case "REGIS CORP":  dirpath = "../documents/rgs/MetaLinks.json";
                break;
              case "DOW CHEMICAL CO /DE/":  dirpath = "../documents/dow/MetaLinks.json";
                break;
              case "WELLS FARGO & COMPANY/MN":  dirpath = "../documents/wfc/MetaLinks.json";
                break;
              case "BLUESTAR AIRLINES CO":  dirpath = "../documents/bluestarairlines/MetaLinks.json";
                break;
              case "BEST VALUE FINANCIAL SERVICES LIMITED":  dirpath = "../documents/best-value/MetaLinks.json";
                break;
              case "GOOGLE UK LIMITED":  dirpath = "../documents/google-uk/MetaLinks.json";
                break;
              case "TTPCom Limited":  dirpath = "../documents/ttpcom/MetaLinks.json";
                break;
              case "WILLIS GROUP LIMITED":  dirpath = "../documents/willisgrouplimited/MetaLinks.json";
                break;
              case "WILLIS GROUP SERVICES LIMITED":  dirpath = "../documents/willisoverseasbrokers/MetaLinks.json";
                break;
              case "WILLIS OVERSEAS BROKERS LIMITED":  dirpath = "../documents/willisoverseasbrokers/MetaLinks.json";
                break;
              case "WILLIS STRUCTURED FINANCIAL SOLUTIONS LIMITED":  dirpath = "../documents/willistructured/MetaLinks.json";
                break;
              case "WILLIS FABER LIMITED":  dirpath = "../documents/willisfaber/MetaLinks.json";
                break;

            }

            var eleTable = $('#ele-table');
            var elements = App_Find.Highlight.cachedResults.both;
            var elementAry = [];
            $('#total-number-facts').html(elements.length);
            $('#inline-version').html(App.InlineDoc.inlineVersion);

            var dimensions = [];
            var members = [];
            var sections = ['key_concepts', 'axis', 'member', 'total'];
            var jsonreader = new XMLHttpRequest();
            jsonreader.open("GET",dirpath,true);
            jsonreader.send();
            jsonreader.onreadystatechange = function(){
              if(jsonreader.readyState == 4 && jsonreader.status == 200){
                var response = jsonreader.responseText;
                var result = JSON.parse(response);
                App.showMessage("facts");alert("facts");                
                facts.key_concepts.standard = parseInt(result.MetaLinks_list.MetaLinks.statCount.KeyStandard);
                facts.key_concepts.custom = parseInt(result.MetaLinks_list.MetaLinks.statCount.KeyCustom);
                facts.axis.standard = parseInt(result.MetaLinks_list.MetaLinks.statCount.AxisStandard);
                facts.axis.custom = parseInt(result.MetaLinks_list.MetaLinks.statCount.AxisCustom);
                facts.member.standard = parseInt(result.MetaLinks_list.MetaLinks.statCount.MemberStandard);
                facts.member.custom = parseInt(result.MetaLinks_list.MetaLinks.statCount.MemberCustom);


              }

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
                      $(tds[4]).html(Math.round((totalCustom/totalAll)*100) + '%');
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
            };


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
            modal.find('[data-slide-content="taxonomies"]').html(taxonomiesHtml);

            // remove after we get toggle back in
            App_About.toggleTechnicalNamespaces('show');

            // load the file names used to run app
            var fileNamesHTML = '<table border="0" width="100%" class="file-names">';
            fileNamesHTML += '<tr><td><strong>Inline Document</strong></td><td>' + App.fileNames.filing.inline + '</td></tr>';
            fileNamesHTML += '<tr><td colspan="2"><strong>Custom Taxonomy</strong></td></tr>';

            // custom taxonomy
            var fileName = '';
            var fileNames = App.fileNames.filing;
            for (var k in fileNames) {

                if (k != 'inline') {

                    fileName = fileNames[k] == '' ? '[missing]' : fileNames[k];
                    fileNamesHTML += '<tr><td>' + (App.InlineDoc.customPrefix.toUpperCase() + ' ' + k.charAt(0).toUpperCase() + k.slice(1)) + ':</td><td>' + fileName + '</td></tr>';
                }
            }


            fileNamesHTML += '</table>';
            modal.find('[data-slide-content="files"]').html(fileNamesHTML);
        }
    },
    load1:function() {
    	 $("#about-modal").dialog({
				autoOpen : true
			});
        if (App_About.companyInformation == null) {

            App_About.loadCompanyInformation();
            
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
            elements.each(function() {

                var name = $(this).attr('name');
                if (name && $.inArray(name, elementAry) == -1) {

                    elementAry.push(name);
                    var idAry = name.split(':');
                    if (idAry[0] == App.InlineDoc.customPrefix) {

                        facts.key_concepts.custom++;
                    } else {

                        facts.key_concepts.standard++;
                    }
                }
            });

            var dimensions = [];
            var members = [];
            var contexts = App.InlineDoc.getContexts();
            contexts.each(function() {

                var node = $(this);
                var segments = App.InlineDoc.getSegmentsForContext(node);
                if (segments.length == 1) {

                    segments.children().each(function() {

                        var node = $(this);
                        var dimension = node.attr('dimension');
                        if ($.inArray(dimension, dimensions) == -1) {

                            if (dimension.match(/Axis\b/i)) {

                                var dimensionAry = dimension.split(':');
                                if (dimensionAry[0] == App.InlineDoc.customPrefix) {

                                    facts.axis.custom++;
                                } else {

                                    facts.axis.standard++;
                                }
                            }
                            dimensions.push(dimension);
                        }

                        var member = node.html();
                        if ($.inArray(member, members) == -1) {

                            if (member.match(/Member\b/i)) {

                                var memberAry = member.split(':');
                                if (memberAry[0] == App.InlineDoc.customPrefix) {

                                    facts.member.custom++;
                                } else {

                                    facts.member.standard++;
                                }
                            }
                            members.push(member);
                        }
                    });
                }
            });

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
        elements.each(function() {

            var name = $(this).attr('name');
            if (name && $.inArray(name, elementAry) == -1) {

                elementAry.push(name);
                var idAry = name.split(':');
                if (idAry[0] == App.InlineDoc.customPrefix) {

                    facts.key_concepts.custom++;
                } else {

                    facts.key_concepts.standard++;
                }
            }
        });

        var dimensions = [];
        var members = [];
        var contexts = App.InlineDoc.getContexts();
        contexts.each(function() {

            var node = $(this);
            var segments = App.InlineDoc.getSegmentsForContext(node);
            if (segments.length == 1) {

                segments.children().each(function() {

                    var node = $(this);
                    var dimension = node.attr('dimension');
                    if ($.inArray(dimension, dimensions) == -1) {

                        if (dimension.match(/Axis\b/i)) {

                            var dimensionAry = dimension.split(':');
                            if (dimensionAry[0] == App.InlineDoc.customPrefix) {

                                facts.axis.custom++;
                            } else {

                                facts.axis.standard++;
                            }
                        }
                        dimensions.push(dimension);
                    }

                    var member = node.html();
                    if ($.inArray(member, members) == -1) {

                        if (member.match(/Member\b/i)) {

                            var memberAry = member.split(':');
                            if (memberAry[0] == App.InlineDoc.customPrefix) {

                                facts.member.custom++;
                            } else {

                                facts.member.standard++;
                            }
                        }
                        members.push(member);
                    }
                });
            }
        });

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
            if (ele.length == 1) {

                App_About.companyInformation[k] = ele.text();
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
	
	myWindow.document.write("<html><head><title>Copy All</title></head><body><textarea id='popTxtArea' rows='25' cols='50'>"+clipboardText+"</textarea></body></html>");
	myWindow.focus();
	myWindow.document.getElementById("popTxtArea").focus();
	myWindow.document.getElementById("popTxtArea").select();
}
};