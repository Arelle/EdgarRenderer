/* Created by staff of the U.S. Securities and Exchange Commission.
* Data and content created by government employees within the scope of their employment 
* are not subject to domestic copyright protection. 17 U.S.C. 105. *
*/

$(document).ready(function(){
	$('#opener').bind('keypress', function(e) {
		var code = e.keyCode || e.which;
		if((code == 13) || (code == 32)) { //Enter keycode
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
				//panel.css({'width':'100%'});
	      		$('#app-inline-xbrl-doc').css({'width':'100%'});
			} else {
				if($('#results-count').text()!=0){
					panel.addClass('visible').animate({'margin-right':'0px','width':'30%'});
				    //panel.css({'width':'100%'});
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
	});	
	$('#information,#instanceFileLi,#instanceFileIELi,#instanceAndCustomFile,#btn-reports,#btn-settings,#btn-help').bind('keydown',function(e)
			{
				var code = e.keyCode || e.which;
				if((code == 27)) {
					$('#menuIcon').focus();
					$('#menuIcon').click();
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
		//var simpleClorCellZeroId= $('.simpleColorCell')[0].id;
		//var hexcode="#"+simpleClorCellZeroId;
		//$('.simpleColorCell').attr("aria-label",hexcode);
		$('.simpleColorCell').attr("aria-label","Inside Selected Fact Color Selector");
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
    $('#menuBtn-reports').on('click', function() {	
		
		$('#about-modal').dialog("close");
		
	});
    $('#menuIcon').on('click', function() {	
    	$('#about-modal').dialog("close");
		
	});
    
	$('#btn-reports').on('click', function() {
		$('#about-modal').dialog("close");
		$('#menuIcon').dropdown("toggle");	
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
		/*else if (((screen.width > 641) && (screen.width < 767))  && (window.orientation) && (window.orientation == 90 || window.orientation == -90)) {
			if (panel.hasClass("visible")) {
			
				panel.removeClass('visible').animate({'margin-left':'-100%','width':'100%'});
	      		$('#app-inline-xbrl-doc').css({'width':'100%'});
			} else {panel.addClass('visible').animate({'margin-left':'0px','width':'100%'});

	      		$('#app-inline-xbrl-doc').css({'width':'0%','float':'right'});
	      		if($('#app-panel').hasClass("visible")) {
					$('#app-panel').removeClass('visible').animate({'margin-right':'-100%','width':'100%'});
					$('#opener').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');
					$('#opener').attr("title", "Expand Facts");
				}
				if($('#app-panel1').hasClass("visible")) {
					$('#app-panel1').removeClass('visible').animate({'margin-left':'-100%','width':'100%'});
				}
				
			}	
		}*/
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