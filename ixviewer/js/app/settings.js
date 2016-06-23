/*
* Created by staff of the U.S. Securities and Exchange Commission.
* Data and content created by government employees within the scope of their employment 
* are not subject to domestic copyright protection. 17 U.S.C. 105.
* */
var App_Settings = {
    defaults:{
        initialHighlightColor:'#FFD700',
        focusHighlightColor:'#003768',
        elementBorderColor:'#FF6600'
    },
    initialHighlightColor:null,
    focusHighlightColor:null,
    elementBorderColor:null,
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
                } else {

                    App_Settings.save('elementBorderColor', '#' + color);
                }
            }
        };
        App_Settings.initialHighlightColor = $('#setting-initial-highlight-color');
        App_Settings.initialHighlightColor.val(App_Settings.get('initialHighlightColor')).simpleColor(colorOptions);
        App_Settings.focusHighlightColor = $('#setting-focus-highlight-color');
        App_Settings.focusHighlightColor.val(App_Settings.get('focusHighlightColor')).simpleColor(colorOptions);
        App_Settings.elementBorderColor = $('#setting-element-border-color');
        App_Settings.elementBorderColor.val(App_Settings.get('elementBorderColor')).simpleColor(colorOptions);
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
    }
};