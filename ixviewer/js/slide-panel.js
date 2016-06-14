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
					$('#opener').attr("title", "Expand Facts");
					panel.removeClass('visible').animate({'margin-right':'-30%','width':'30%'});
					panel.css({'width':'100%'});
		      		$('#app-inline-xbrl-doc').css({'width':'100%'});
		      		
				} else {
					if($('#results-count').text()!=0){
						panel.addClass('visible').animate({'margin-right':'0px','width':'30%'});
					    panel.css({'width':'100%'});
						$('#opener').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-right');
						$('#opener').attr("title", "Collapse Facts");
			      		$('#app-inline-xbrl-doc').css({'width':'70%','float':'left'});
			      		if($('#app-panel1').hasClass("visible")) {
							$('#app-panel1').removeClass('visible').animate({'margin-left':'-30%','width':'30%'});
						}
						if($('#app-panel2').hasClass("visible")) {
							$('#app-panel2').removeClass('visible').animate({'margin-left':'-30%','width':'30%'});
							$('#menuBtn-reports').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');
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
				$('#opener').attr("title", "Expand Facts");
				panel.removeClass('visible').animate({'margin-right':'-30%','width':'30%'});
				//panel.css({'width':'100%'});
	      		$('#app-inline-xbrl-doc').css({'width':'100%'});
			} else {
				if($('#results-count').text()!=0){
					panel.addClass('visible').animate({'margin-right':'0px','width':'30%'});
				    //panel.css({'width':'100%'});
					$('#opener').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-right');
					$('#opener').attr("title", "Collapse Facts");
		      		$('#app-inline-xbrl-doc').css({'width':'70%','float':'left'});
		      		if($('#app-panel1').hasClass("visible")) {
						$('#app-panel1').removeClass('visible').animate({'margin-left':'-30%','width':'30%'});
					}
					if($('#app-panel2').hasClass("visible")) {
						$('#app-panel2').removeClass('visible').animate({'margin-left':'-30%','width':'30%'});
						$('#menuBtn-reports').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');
						$('#menuBtn-reports').attr("title", "Expand Tagged Sections");
					}
				}
			}
		}
		return false;	
	});	
	$('#btn-help').on('click', function() {	
		$('#menuIcon').dropdown("toggle");	
		//alert("screen.width"+screen.width);
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
					$('#opener').attr("title", "Expand Facts");
				}
				if($('#app-panel2').hasClass("visible")) {
					$('#app-panel2').removeClass('visible').animate({'margin-left':'-30%','width':'30%'});
					$('#menuBtn-reports').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');
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
			} else {panel.addClass('visible').animate({'margin-left':'0px'});
	      		$('#app-inline-xbrl-doc').css({'width':'70%','float':'right'});
	      		if($('#app-panel').hasClass("visible")) {
					$('#app-panel').removeClass('visible').animate({'margin-right':'-30%','width':'30%'});
					$('#opener').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');
					$('#opener').attr("title", "Expand Facts");
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
				panel.removeClass('visible').animate({'margin-left':'-30%','width':'30%'});
	      		$('#app-inline-xbrl-doc').css({'width':'100%'});
			} else {panel.addClass('visible').animate({'margin-left':'0px'});
				$('#menuBtn-reports').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-right');
				$('#menuBtn-reports').attr("title", "Collapse Tagged Sections");
	      		$('#app-inline-xbrl-doc').css({'width':'70%','float':'right'});
	      		if($('#app-panel').hasClass("visible")) {
					$('#app-panel').removeClass('visible').animate({'margin-right':'-30%','width':'30%'});
					$('#opener').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');
					$('#opener').attr("title", "Expand Facts");
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
			panel.removeClass('visible').animate({'margin-left':'-30%','width':'30%'});
      		$('#app-inline-xbrl-doc').css({'width':'100%'});
		} else {panel.addClass('visible').animate({'margin-left':'0px'});
			$('#menuBtn-reports').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-right');
			$('#menuBtn-reports').attr("title", "Collapse Tagged Sections");
      		$('#app-inline-xbrl-doc').css({'width':'70%','float':'right'});
      		if($('#app-panel').hasClass("visible")) {
				$('#app-panel').removeClass('visible').animate({'margin-right':'-30%','width':'30%'});
				$('#opener').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');
				$('#opener').attr("title", "Expand Facts");
			}
			if($('#app-panel1').hasClass("visible")) {
				$('#app-panel1').removeClass('visible').animate({'margin-left':'-30%','width':'30%'});
			}
		}
		return false;	
	});
});
/*jQuery(function($) {
 
  
  // /////
  // CLEARABLE INPUT
  function tog(v){return v?'addClass':'removeClass';} 
  $(document).on('input', '.clearable', function(){
    $(this)[tog(this.value)]('x');
  }).on('mousemove', '.x', function( e ){
    $(this)[tog(this.offsetWidth-18 < e.clientX-this.getBoundingClientRect().left)]('onX'); 
  }).on('click', '.x', function(){
    App.showSpinner1($('#mainDiv'), function() {
		App_Find.Results.load();
		if($('#app-panel-reports-container').css('display') == 'block'){
			App_Find.TaggedSection.refreshTaggedSection($('#search-input').val());
		}
        App.hideSpinner();
    });
    
    $(this).removeClass('x onX').val('').change();
  }).on('click', '.onX', function(){
    App.showSpinner1($('#mainDiv'), function() {
		App_Find.Results.load();
		if($('#app-panel-reports-container').css('display') == 'block'){
			App_Find.TaggedSection.refreshTaggedSection($('#search-input').val());
		}
        App.hideSpinner();
    });
    $(this).removeClass('x onX').val('').change();
  });
});*/
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
 /* document.getElementById('search-input').addEventListener('input', function () {
	  App.showSpinner1($('#mainDiv'), function() {
			//App_Find.Results.load();
			if($('#app-panel-reports-container').css('display') == 'block'){
				App_Find.TaggedSection.refreshTaggedSection($('#search-input').val());
			}
	        App.hideSpinner();
	    });
	}, false);*/
});