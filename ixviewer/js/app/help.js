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

