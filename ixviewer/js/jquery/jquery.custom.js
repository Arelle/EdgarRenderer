jQuery.fn.selectionHighlight = function() {

    App.frame.contents().find('.sec-cbe-highlight-filter-selected').removeClass('sec-cbe-highlight-filter-selected'); //.unwrap();
    $(this).parent().addClass('sec-cbe-highlight-filter-selected'); //.wrap('<span class="sec-cbe-highlight-filter-selected"></span>');
};
jQuery.fn.selectionHighlightNodes = function() {

    App.frame.contents().find('.sec-cbe-highlight-filter-selected-nodes').removeClass('sec-cbe-highlight-filter-selected-nodes'); //.unwrap();
    $(this).parent().addClass('sec-cbe-highlight-filter-selected-nodes'); //.wrap('<span class="sec-cbe-highlight-filter-selected"></span>');
};
jQuery.fn.removeHighlightNodes = function(allLinkedNodes) {

	for(var i=0;i<allLinkedNodes.length;i++){
    	var cls = 'sec-cbe-highlight-content-selected'; 
    	if(allLinkedNodes[i][0].nodeName.toLowerCase()=="ix:nonnumeric"){
    		$(allLinkedNodes[i]).parent().addClass('sec-cbe-highlight-dashed');
    		$(allLinkedNodes[i]).removeClass(cls);
    	}
    	if ($(allLinkedNodes[i]).children().length > 0) { 
    		$(allLinkedNodes[i]).children().removeClass(cls);
    		if($(allLinkedNodes[i]).children().children().length >0){
			    if(($(allLinkedNodes[i]).children().children()[0].nodeName.toLowerCase()=="span")){
    				$(allLinkedNodes[i]).children().children().removeClass(cls);
        			}
    			if(($(allLinkedNodes[i]).children().children()[0].nodeName.toLowerCase()=="div")){
    				$(allLinkedNodes[i]).children().children().removeClass(cls);
        			}
			   $(allLinkedNodes[i]).children().children().children().children().children().removeClass(cls);
			   $(allLinkedNodes[i]).children().children().children().children().removeClass(cls);
			   $(allLinkedNodes[i]).children().children().removeClass(cls);
    		}
    		
    	}
    	else if(allLinkedNodes[i][0].nodeName.toLowerCase()=="ix:continuation"){
    		$(allLinkedNodes[i]).removeClass(cls);
    	}
        };
	
};
jQuery.fn.removeHighlightSelectionNodes = function(allLinkedNodes) {
	for(var i=0;i<allLinkedNodes.length;i++){
    	var cls = 'sec-cbe-highlight-filter-content-selected'; 
		if(allLinkedNodes[i][0].nodeName.toLowerCase()=="ix:nonnumeric"){
    		//$(allLinkedNodes[i]).parent().removeClass('sec-cbe-highlight-dashed');
    		$(allLinkedNodes[i]).removeClass(cls);
    	}
    	if ($(allLinkedNodes[i]).children().length > 0) { 
    		$(allLinkedNodes[i]).children().removeClass(cls);
    		if($(allLinkedNodes[i]).children().children().length >0){
			    if(($(allLinkedNodes[i]).children().children()[0].nodeName.toLowerCase()=="span")){
    				$(allLinkedNodes[i]).children().children().removeClass(cls);
        			}
    			if(($(allLinkedNodes[i]).children().children()[0].nodeName.toLowerCase()=="div")){
    				$(allLinkedNodes[i]).children().children().removeClass(cls);
        			}
			   $(allLinkedNodes[i]).children().children().children().children().children().removeClass(cls);
			   $(allLinkedNodes[i]).children().children().children().children().removeClass(cls);
			   $(allLinkedNodes[i]).children().children().removeClass(cls);
    		}
    		
    	}
    	else if(allLinkedNodes[i][0].nodeName.toLowerCase()=="ix:continuation"){
    		$(allLinkedNodes[i]).removeClass(cls);
    	}
    };
};
jQuery.fn.filterHighlight = function(index) {

    // make sure node isn't already filtered
    if (!this.parent().hasClass('sec-cbe-highlight-filter')) {

        this.parent().addClass('sec-cbe-highlight-filter').attr('data-result-index',index);
    }
};

jQuery.fn.resultItemHighlight = function() {

    $(this).css('background-color', '#CC0000');
};

jQuery.fn.matchesFilter = function(filter) {

    var node = this;
    var matchFound = false;
    
    //var contextsforaxis = App.InlineDoc.getContexts();

    // check to see what type of concept we are interested in
    if (filter.conceptType == 'both' ||
        filter.conceptType == 'custom' && node.attr('name').split(':')[0] == App.InlineDoc.customPrefix ||
        filter.conceptType == 'base' && node.attr('name').split(':')[0] != App.InlineDoc.customPrefix) {

        if (!filter.unitsAreFiltered && !filter.calendarsAreFiltered && !filter.axisAreFiltered && !filter.scaleAreFiltered && !filter.balanceAreFiltered) {

            matchFound = true;
        } else {

            // apply unit filter
            var unitMatched = false;
            if (filter.unitsAreFiltered) {

                for (var i = 0; i < filter.unitsChecked.length; i++) {

                    if (node.attr('unitRef') == $(filter.unitsChecked[i]).val()) {

                        unitMatched = true;
                        break;
                    }
                }
            }

            // apply scale filter
            var scaleMatched = false;
            if (filter.scaleAreFiltered) {

                for (var i = 0; i < filter.scaleChecked.length; i++) {

                    if (node.attr('scale') == $(filter.scaleChecked[i]).val()) {

                        scaleMatched = true;
                        break;
                    }
                }
            }
            
            // apply balance filter
            var balanceMatched = false;
            if (filter.balanceAreFiltered) {
            
            	var balanceStored = App.InlineDoc.getMetaData().tag[node.attr('name').replace(':', '_')].crdr;
				if(balanceStored){
	                
	                for (var i = 0; i < filter.balanceChecked.length; i++) {
	                    
	                    if (balanceStored == $(filter.balanceChecked[i]).val()) {
	                        
	                        balanceMatched = true;
	                        break;
	                    }
	                }
	            }
            }

            //apply axis filter
            
            if (filter.axisAreFiltered) {
            	var axisMatched = false;
            	var axisStored = App.InlineDoc.getContextFromCache(node.attr('contextRef'));
            	 
            	 if(!axisMatched){
            	 	if(axisStored !=null){
            	 		if(axisStored.length<=1){
		           			for (var i = 0; i < filter.axisChecked.length; i++) {
						
								if($(filter.axisChecked[i]).val()==axisStored){
									axisMatched = true;
									break;
								}
		               		}
		               	}else{
		               		for (var i = 0; i < filter.axisChecked.length; i++) {
								for (var j = 0; j < axisStored.length; j++) {
									if($(filter.axisChecked[i]).val()==axisStored[j]){
										axisMatched = true;
										break;
									}
								}
		               		}		               	
		               	}
	               	}
            	 }
            }

            // only apply calendar filter if we haven't already added
            var calendarMatched = false;
            if (filter.calendarsAreFiltered) {

				var contextRef = node.attr('contextRef');
				var normalizedPeriod = App.InlineDoc.getContextNormarisedString(contextRef);
		
                for (var j = 0; j < filter.calendarsChecked.length; j++) {

                    var calendar = $(filter.calendarsChecked[j]).val();
                    if (calendar == normalizedPeriod) {
                        calendarMatched = true;
                        break;
                    }
                }
            }

            if ( ((filter.calendarsAreFiltered && !filter.unitsAreFiltered && !filter.axisAreFiltered && !filter.scaleAreFiltered && !filter.balanceAreFiltered) && calendarMatched) ||
                ((!filter.calendarsAreFiltered && filter.unitsAreFiltered && !filter.axisAreFiltered && !filter.scaleAreFiltered && !filter.balanceAreFiltered) && unitMatched) ||
                ((!filter.calendarsAreFiltered && !filter.unitsAreFiltered && filter.axisAreFiltered && !filter.scaleAreFiltered && !filter.balanceAreFiltered) && axisMatched) ||
                ((!filter.calendarsAreFiltered && !filter.unitsAreFiltered && !filter.axisAreFiltered && filter.scaleAreFiltered && !filter.balanceAreFiltered) && scaleMatched) ||
                ((!filter.calendarsAreFiltered && !filter.unitsAreFiltered && !filter.axisAreFiltered && !filter.scaleAreFiltered && filter.balanceAreFiltered) && balanceMatched) ||
                ((filter.calendarsAreFiltered && filter.unitsAreFiltered && !filter.axisAreFiltered && !filter.scaleAreFiltered && !filter.balanceAreFiltered) && (calendarMatched && unitMatched))||
                ((filter.calendarsAreFiltered && !filter.unitsAreFiltered && !filter.axisAreFiltered && filter.scaleAreFiltered && !filter.balanceAreFiltered) && (calendarMatched && scaleMatched)) ||
                ((filter.calendarsAreFiltered && !filter.unitsAreFiltered && filter.axisAreFiltered && !filter.scaleAreFiltered && !filter.balanceAreFiltered) && (calendarMatched && axisMatched))||
                ((!filter.calendarsAreFiltered && filter.unitsAreFiltered && !filter.axisAreFiltered && filter.scaleAreFiltered && !filter.balanceAreFiltered) && (scaleMatched && unitMatched))||
                ((filter.calendarsAreFiltered && !filter.unitsAreFiltered && !filter.axisAreFiltered && !filter.scaleAreFiltered && filter.balanceAreFiltered) && (balanceMatched && calendarMatched))||
                ((!filter.calendarsAreFiltered && !filter.unitsAreFiltered && !filter.axisAreFiltered && filter.scaleAreFiltered && filter.balanceAreFiltered) && (balanceMatched && scaleMatched)) ||
                ((!filter.calendarsAreFiltered && !filter.unitsAreFiltered && filter.axisAreFiltered && !filter.scaleAreFiltered && filter.balanceAreFiltered) && (balanceMatched && axisMatched))||
                ((!filter.calendarsAreFiltered && filter.unitsAreFiltered && !filter.axisAreFiltered && !filter.scaleAreFiltered && filter.balanceAreFiltered) && (balanceMatched && unitMatched))||
                ((!filter.calendarsAreFiltered && filter.unitsAreFiltered && filter.axisAreFiltered && !filter.scaleAreFiltered && !filter.balanceAreFiltered) && (axisMatched && unitMatched)) ||
                ((!filter.calendarsAreFiltered && !filter.unitsAreFiltered && filter.axisAreFiltered && filter.scaleAreFiltered && !filter.balanceAreFiltered) && (axisMatched && scaleMatched))) {

                     matchFound = true;
             }

            else if((filter.calendarsAreFiltered && filter.unitsAreFiltered && filter.axisAreFiltered && filter.scaleAreFiltered && filter.balanceAreFiltered)&& (calendarMatched && unitMatched && axisMatched && scaleMatched && balanceMatched)){
                matchFound = true;
            }
			
            else if (((filter.calendarsAreFiltered && !filter.unitsAreFiltered && filter.axisAreFiltered && filter.scaleAreFiltered && filter.balanceAreFiltered)&&(calendarMatched && scaleMatched && axisMatched && balanceMatched && !unitMatched))||
                    ((filter.calendarsAreFiltered && filter.unitsAreFiltered && filter.axisAreFiltered && !filter.scaleAreFiltered && filter.balanceAreFiltered)&&(calendarMatched && unitMatched && axisMatched && balanceMatched && !scaleMatched))||
                    ((filter.calendarsAreFiltered && filter.unitsAreFiltered && !filter.axisAreFiltered && filter.scaleAreFiltered && filter.balanceAreFiltered)&&(calendarMatched && unitMatched && scaleMatched && balanceMatched && !axisMatched))||
                    ((filter.calendarsAreFiltered && filter.unitsAreFiltered && filter.axisAreFiltered && filter.scaleAreFiltered && !filter.balanceAreFiltered)&&(calendarMatched && unitMatched && scaleMatched && axisMatched && !balanceMatched))||
                    ((!filter.calendarsAreFiltered && filter.unitsAreFiltered && filter.axisAreFiltered && filter.scaleAreFiltered && filter.balanceAreFiltered)&&(unitMatched && scaleMatched && axisMatched && balanceMatched && !calendarMatched))){
                        matchFound = true;
            }
            
            else if (((filter.calendarsAreFiltered && filter.unitsAreFiltered && filter.axisAreFiltered && !filter.scaleAreFiltered && !filter.balanceAreFiltered) && (calendarMatched && unitMatched && axisMatched))||
                ((filter.calendarsAreFiltered && filter.unitsAreFiltered && !filter.axisAreFiltered && filter.scaleAreFiltered && !filter.balanceAreFiltered) && (calendarMatched && unitMatched && scaleMatched)) ||
                ((filter.calendarsAreFiltered && filter.unitsAreFiltered && !filter.axisAreFiltered && !filter.scaleAreFiltered && filter.balanceAreFiltered) && (calendarMatched && unitMatched && balanceMatched))||
                ((filter.calendarsAreFiltered && !filter.unitsAreFiltered && filter.axisAreFiltered && !filter.scaleAreFiltered && filter.balanceAreFiltered) && (calendarMatched && axisMatched && scaleMatched))||
                ((filter.calendarsAreFiltered && !filter.unitsAreFiltered && !filter.axisAreFiltered && filter.scaleAreFiltered && filter.balanceAreFiltered) && (calendarMatched && scaleMatched && balanceMatched))||
                ((!filter.calendarsAreFiltered && filter.unitsAreFiltered && filter.axisAreFiltered && filter.scaleAreFiltered && !filter.balanceAreFiltered) && (axisMatched && unitMatched && scaleMatched)) ||
                ((!filter.calendarsAreFiltered && filter.unitsAreFiltered && !filter.axisAreFiltered && filter.scaleAreFiltered && filter.balanceAreFiltered) && (unitMatched && scaleMatched && balanceMatched))||
                ((filter.calendarsAreFiltered && !filter.unitsAreFiltered && filter.axisAreFiltered && !filter.scaleAreFiltered && filter.balanceAreFiltered) && (calendarMatched && axisMatched && balanceMatched))||
                ((!filter.calendarsAreFiltered && !filter.unitsAreFiltered && filter.axisAreFiltered && filter.scaleAreFiltered && filter.balanceAreFiltered) && (scaleMatched && axisMatched && balanceMatched))) {

                     matchFound = true;
             }
            
        }
    }

    return matchFound;
};

jQuery.fn.matchesSearch = function(search, ele) {
    var id = ele.convertNameToXBRLId();
    //var regex;
    var pattern = "gi";
   
    /*if (search.matchCase) {

        pattern = "g";
    }*/
    var str = search.searchStr;
   
    if(ele.attr('continuedAt')!=null){
 	   var allLinkedNodes=[];
    	   allLinkedNodes=App_Find.Element.groupIxContinuation(ele);
    	   
    	   var xbrlValue=" ";
    	   for(var l=0;l<allLinkedNodes.length;l++){
    		   
    		   xbrlValue=allLinkedNodes[l].text();
    		   if (search.matchCase) {
    			   if(xbrlValue.indexOf(str) >= 0){
        			   isValid = true;
    	               return isValid;
        		   }
	            }else{
	       			if(xbrlValue.toLowerCase().indexOf(str.toLowerCase()) >= 0){
	     			   isValid = true;
	 	               return isValid;
	     		   }
	       		}
    		   
    	   }
    }
    if (str.match(/\|/gi)) {
        //str = str.replace(/\s\|\s/g, "|").split('|').join('|');
        var terms = str.replace(/\s\|\s/g, "|").split('|');
    	for (var k in terms) {
    		if (search.matchCase) {
    			if (this[0].textContent.indexOf(terms[k]) >=0 || (ele.attr('name').indexOf(terms[k]))>=0 ) {
	                isValid = true;
	                return isValid;
	            }
            }
    		else{
    			if (this[0].textContent.toLowerCase().indexOf(terms[k].toLowerCase())>=0 || ele.attr('name').toLowerCase().indexOf(terms[k].toLowerCase())>=0) {
	                isValid = true;
	                return isValid;
	            }
    		}
        }
    }  else if (str.match(/\sOR/g)) {
        //str = str.replace(/\sOR\s/g, "OR").split('OR').join('|');
        var terms = str.replace(/\sOR\s/g, "OR").split('OR');
    	for (var k in terms) {
    		if (search.matchCase) {
    			if (this[0].textContent.indexOf(terms[k]) >=0 || (ele.attr('name').indexOf(terms[k]))>=0 ) {
	                isValid = true;
	                return isValid;
	            }
            }
    		else{
    			if (this[0].textContent.toLowerCase().indexOf(terms[k].toLowerCase())>=0 || ele.attr('name').toLowerCase().indexOf(terms[k].toLowerCase())>=0) {
	                isValid = true;
	                return isValid;
	            }
    		}
        }
    } else if (str.match(/&/gi)) {
        var isValid = true;
        var terms = str.replace(/\s&\s/g, "&").split('&');
        for (var k in terms) {
        	if (search.matchCase) {
	        	if (!((this[0].textContent.indexOf(terms[k]))>=0) && !((ele.attr('name').indexOf(terms[k]))>=0)) {
	                isValid = false;
	                break;
	            }
	        }else{
	           // regex = new RegExp(terms[k], pattern);
	           // if (!regex.test((this[0].textContent)) && !regex.test((ele.attr('name'))) && !regex.test((ele.attr('contextRef')))) {
	            if (!((this[0].textContent.toLowerCase().indexOf(terms[k].toLowerCase()))>=0) && !((ele.attr('name').toLowerCase().indexOf(terms[k].toLowerCase()))>=0)) {
	                isValid = false;
	                break;
	            }
            }
        }

        if(isValid){
        	return isValid;
        }
    } else if (str.match(/\sAND/g)) {
        var isValid = true;
        var terms = str.replace(/\sAND\s/g, "AND").split('AND');
        for (var k in terms) {
        	if (search.matchCase) {
        		if (!((this[0].textContent.indexOf(terms[k]))>=0) && !((ele.attr('name').indexOf(terms[k]))>=0)) {
                    isValid = false;
                    break;
                }
            }else{
            	if (!((this[0].textContent.toLowerCase().indexOf(terms[k].toLowerCase()))>=0) && !((ele.attr('name').toLowerCase().indexOf(terms[k].toLowerCase()))>=0)) {
                    isValid = false;
                    break;
                }
            }
            //regex = new RegExp(terms[k], pattern);
            
        }
        if(isValid){
        	return isValid;
        }
    }
   // var isMatch = regex.test();
    var isMatch=false;
    if (search.matchCase) {
    	if (ele.text().indexOf(str)>=0) {
            isMatch = true;
          }
        }
    else {
    	if (ele.text().toLowerCase().indexOf(str.toLowerCase())>=0) {
        isMatch = true;
       }
    }
    if (search.matchCase) {
    	if(!isMatch){
    		if (ele.attr('name').indexOf(str)>=0) {
    			isMatch = true;
    		}
    	}
    }
    else
    {
    	if(!isMatch){
    		if (ele.attr('name').toLowerCase().indexOf(str.toLowerCase())>=0) {
    			isMatch = true;
    		}
    	}
    }
	
    if (search.includeDefs && id && !isMatch) {
    	if (!App.InlineDoc.getMetaData()) return;
        var roles = App.InlineDoc.getMetaData().tag[id].lang['en-US'].role;
        var definition = roles['documentation'];
        if (str.match(/&/gi)) {
	        var terms = str.replace(/\s&\s/g, "&").split('&');
	        var count = 0;
        	for (var k in terms) {
        		if (search.matchCase) {
        			if(definition && (definition.indexOf(terms[k])>=0)){
    	            	count++;
    	            }
        	    }
        		else{
        			if(definition && (definition.toLowerCase().indexOf(terms[k].toLowerCase())>=0)){
    	            	count++;
    	            }
        		}
	        }
        	if(count == terms.length){
            	isMatch = true;
            	return isMatch;
            }
        } else if (str.match(/\sAND/g)) {
	    	var terms = str.replace(/\sAND\s/g, "AND").split('AND');
	    	var count = 0;
        	for (var k in terms) {
        		var found = false;
        		if (search.matchCase) {
        			if(definition && (definition.indexOf(terms[k])>=0)){
    	            	count++;
    	            }
        	    }
        		else
        		{
        			if(definition && (definition.toLowerCase().indexOf(terms[k].toLowerCase())>=0)){
        				count++;
        			}
        		}
	    		
	        }
        	if(count == terms.length){
            	isMatch = true;
            	return isMatch;
            }
	    }else{
	        		
    		if (str.match(/\|/gi)) {
	            //str = str.replace(/\s\|\s/g, "|").split('|').join('|');
	            var terms = str.replace(/\s\|\s/g, "|").split('|');
	        	for (var k in terms) {
	        		if (search.matchCase) {
	        			if(definition && (definition.indexOf(terms[k])>=0)){
	        				isMatch = true;
	        				return isMatch;
	    	            }
    	            }
	        		else{
	        			if(definition && (definition.toLowerCase().indexOf(terms[k].toLowerCase()))>=0){
	        				isMatch = true;
	        				return isMatch;
	    	            }
	        		}
		        }
	        }  else if (str.match(/\sOR/g)) {
	            //str = str.replace(/\sOR\s/g, "OR").split('OR').join('|');
	            var terms = str.replace(/\sOR\s/g, "OR").split('OR');
	        	for (var k in terms) {
	        		if (search.matchCase) {
	        			if(definition && (definition.indexOf(terms[k])>=0)){
	        				isMatch = true;
	        				return isMatch;
	    	            }
    	            }
	        		else{
	        			
	        			if(definition && (definition.toLowerCase().indexOf(terms[k].toLowerCase())>=0)){
	        				isMatch = true;
	        				return isMatch;
	    	            }
	        		}
		        }
	            
	        }else{
	        	if (search.matchCase) {
	        		if(definition){
	        			if (definition.indexOf(str)>=0) {
	    	                isMatch = true;
	    	            }
	        		}
	            }
	        	else{
        			if(definition && (definition.toLowerCase().indexOf(str.toLowerCase())>=0)) {
    	                isMatch = true;
    	            }
	        		
	        	}
	        	
	        }
	    }
        
        
    }
    if (search.includeDimensions && id && !isMatch) {
        var contextRef = ele.attr('contextRef');
       	var axisStored = App.InlineDoc.getContextFromCacheForSearch(contextRef);
   	 	if(axisStored !=null){
			if (str.match(/&/gi)) {
		        var terms = str.replace(/\s&\s/g, "&").split('&');
		        var count = 0;
	        	for (var k in terms) {
	        		if (search.matchCase) {
	        			if(axisStored.indexOf(terms[k])>=0){
	    	            	count++;
	    	            }
    	            }
	        		else{
	        			if(axisStored.toLowerCase().indexOf(terms[k].toLowerCase())>=0){
	    	            	count++;
	    	            }
	        		}
    	    		
		        }
	        	if(count == terms.length){
	            	isMatch = true;
	            	return isMatch;
	            }
	        } else if (str.match(/\sAND/g)) {
		    	var terms = str.replace(/\sAND\s/g, "AND").split('AND');
		    	var count = 0;
	        	for (var k in terms) {
	        		var found = false;
	        		if (search.matchCase) {
	        			if(axisStored.indexOf(terms[k])>=0){
	    	            	count++;
	    	            }
    	            }
	        		else{
	        			if(axisStored.toLowerCase().indexOf(terms[k].toLowerCase())>=0){
	    	            	count++;
	    	            }
	        		}
    	    		
		        }
	        	if(count == terms.length){
	            	isMatch = true;
	            	return isMatch;
	            }
		    }else{
		        		
        		if (str.match(/\|/gi)) {
    	            //str = str.replace(/\s\|\s/g, "|").split('|').join('|');
    	            var terms = str.replace(/\s\|\s/g, "|").split('|');
    	        	for (var k in terms) {
    	        		if (search.matchCase) {
    	        			if(axisStored.indexOf(terms[k])>=0){
    	        				isMatch = true;
    	        				return isMatch;
    	    	            }
        	            }
    	        		else{
    	        			if(axisStored.toLowerCase().indexOf(terms[k].toLowerCase())>=0){
    	        				isMatch = true;
    	        				return isMatch;
    	    	            }
    	        		}
        	    		
    		        }

    	        }  else if (str.match(/\sOR/g)) {
    	            //str = str.replace(/\sOR\s/g, "OR").split('OR').join('|');
    	            var terms = str.replace(/\sOR\s/g, "OR").split('OR');
    	        	for (var k in terms) {
    	        		if (search.matchCase) {
    	        			if(axisStored.indexOf(terms[k])>=0){
    	        				isMatch = true;
    	        				return isMatch;
    	    	            }
        	            }
    	        		else{
    	        			if(axisStored.toLowerCase().indexOf(terms[k].toLowerCase())>=0){
    	        				isMatch = true;
    	        				return isMatch;
    	    	            }
    	        		}
        	    		
    		        }
    	        }else{
    	        	if (search.matchCase) {
    	        		if (axisStored.indexOf(str)>=0) {
    	        			isMatch = true;
    	        		}
    	        	}
    	        	else
    	        	{
    	        		if (axisStored.toLowerCase().indexOf(str.toLowerCase())>=0) {
    	        			isMatch = true;
    	        		}
    	        	}
    	        }
		    }
       	}
    }
    if (search.includeLabels && id && !isMatch) {
        if (!App.InlineDoc.getMetaData()) return;
        var roles = App.InlineDoc.getMetaData().tag[id].lang['en-US'].role;
        if (str.match(/&/gi)) {
	        var terms = str.replace(/\s&\s/g, "&").split('&');
	        var count = 0;
        	for (var k in terms) {
        		//var found = false;
        		for (role in roles) {
        			if (role != "documentation") {
        				var label = roles[role];
        				if (search.matchCase) {
        					if(label.indexOf(terms[k])>=0){
            	            	//found = true;
            	            	count++;
            	            	break;
            	            }
        	        	}
        				else{
        					if(label.toLowerCase().indexOf(terms[k].toLowerCase())>=0){
            	            	//found = true;
            	            	count++;
            	            	break;
            	            }
        				}
	    	    		
        			}
        		}
	        }
        	if(count == terms.length){
            	isMatch = true;
            	return isMatch;
            }
        } else if (str.match(/\sAND/g)) {
	    	var terms = str.replace(/\sAND\s/g, "AND").split('AND');
	        
	    	var count = 0;
        	for (var k in terms) {
        		var found = false;
        		for (role in roles) {
        			if (role != "documentation") {
        				var label = roles[role];
        				if (search.matchCase) {
        					if(label.indexOf(terms[k])>=0){
        						found = true;
        						count++;
        						break;
        					}
        				}
        				else{
        					if(label.toLowerCase().indexOf(terms[k].toLowerCase())>=0){
        						found = true;
        						count++;
        						break;
        					}
        				}
	    	    		
        			}
        		}
	        }
        	if(count == terms.length){
            	isMatch = true;
            	return isMatch;
            }
	    }else{
	    	for (role in roles) {
	        	if (role != "documentation") {
	        		var label = roles[role];
	        		
	        		if (str.match(/\|/gi)) {
        	           // str = str.replace(/\s\|\s/g, "|").split('|').join('|');
        	            var terms = str.replace(/\s\|\s/g, "|").split('|');
        	        	for (var k in terms) {
        	        		if (search.matchCase) {
        	        			if(label.indexOf(terms[k])>=0){
        	        				isMatch = true;
        	        				return isMatch;
        	    	            }
            	            }
        	        		else{
        	        			if(label.toLowerCase().indexOf(terms[k].toLowerCase())>=0){
        	        				isMatch = true;
        	        				return isMatch;
        	    	            }
        	        		}
        		        }
        	        }  else if (str.match(/\sOR/g)) {
        	            //str = str.replace(/\sOR\s/g, "OR").split('OR').join('|');
        	        	var terms = str.replace(/\sOR\s/g, "OR").split('OR');
        	        	for (var k in terms) {
        	        		if (search.matchCase) {
        	        			if(label.indexOf(terms[k])>=0){
        	        				isMatch = true;
        	        				return isMatch;
        	    	            }
            	            }
        	        		else{
        	        			if(label.toLowerCase().indexOf(terms[k].toLowerCase())>=0){
        	        				isMatch = true;
        	        				return isMatch;
        	    	            }
        	        		}
        		        }
        	            
        	        }else{
        	        	if (search.matchCase) {
        	        		if (label.indexOf(str)>=0) {
        	        			isMatch = true;
        	        		}
        	        	}
        	        	else{
        	        		if (label.toLowerCase().indexOf(str.toLowerCase())>=0) {
        	        			isMatch = true;
        	        		}
        	        	}
        	        }
	        	}
	        }
	    }
    }
    
    if (search.includeReferences && id && !isMatch) {
        if (!App.InlineDoc.getMetaData()) return;
        var auth_refArray = App.InlineDoc.getMetaData().tag[id].auth_ref;
    	var std_refs = App.InlineDoc.getMetaRefs();
    		
    		if (str.match(/&/gi)) {
    	        var terms = str.replace(/\s&\s/g, "&").split('&');
    	        for (var ref_idx in auth_refArray) {
    	        	var count = 0;
    	        	for (var k in terms) {
        	            ref_id = auth_refArray[ref_idx];
    	        		ref_parts = std_refs[ref_id];
    	        		var found = false;
        	            for (ref_key in ref_parts) {
    	    	    		ref_value = ref_parts[ref_key];
    	    	    		var reference = ref_value;
    	        			var firstFourCharacters=reference.substring(0,4);
	        			       if(firstFourCharacters=="http"){
	        				    break;
	        			     }
    	        			if (search.matchCase) {
    	        				if(ref_value.indexOf(terms[k])>=0){
    	        	            	found = true;
    	        	            	count++;
    	        	            	break;
    	        	            }
            	        	}
    	        			else{
    	        				if(ref_value.toLowerCase().indexOf(terms[k].toLowerCase())>=0){
    	        	            	found = true;
    	        	            	count++;
    	        	            	break;
    	        	            }
    	        			}
    	        		}
        	            if(!found){
        	            	break;
        	            }
        	        }
    	        	if(count == terms.length){
    	            	isMatch = true;
    	            	break;
    	            }
    	    	}
    	        
    	    } else if (str.match(/\sAND/g)) {
    	    	var terms = str.replace(/\sAND\s/g, "AND").split('AND');
    	        
    	        for (var ref_idx in auth_refArray) {
    	        	var count = 0;
    	        	for (var k in terms) {
        	            ref_id = auth_refArray[ref_idx];
    	        		ref_parts = std_refs[ref_id];
    	        		var found = false;
        	            for (ref_key in ref_parts) {
    	    	    		ref_value = ref_parts[ref_key];
    	    	    		var reference = ref_value;
    	        			var firstFourCharacters=reference.substring(0,4);
	        			        if(firstFourCharacters=="http"){
	        				    break;
	        			     }
    	        			if (search.matchCase) {
    	        				if(ref_value.indexOf(terms[k])>=0){
    	        	            	found = true;
    	        	            	count++;
    	        	            	break;
    	        	            }
            	        	}
    	        			else{
    	        				if(ref_value.toLowerCase().indexOf(terms[k].toLowerCase())>=0){
    	        	            	found = true;
    	        	            	count++;
    	        	            	break;
    	        	            }
    	        			}
    	    	    		
    	        		}
        	            if(!found){
        	            	break;
        	            }
        	        }
    	        	if(count == terms.length){
    	            	isMatch = true;
    	            	break;
    	            }
    	    	}
    	    }else{
    	    	
    	    	for (var ref_idx in auth_refArray) {
	        		ref_id = auth_refArray[ref_idx];
	        		ref_parts = std_refs[ref_id];
	    	    	for (ref_key in ref_parts) {
	        			ref_value = ref_parts[ref_key];
	        			var reference = ref_value;
	        			var firstFourCharacters=reference.substring(0,4);
	        			if(firstFourCharacters=="http"){
	        				break;
	        			}
	        			if (str.match(/\|/gi)) {
	        	           // str = str.replace(/\s\|\s/g, "|").split('|').join('|');
	        	            var terms = str.replace(/\s\|\s/g, "|").split('|');
	        	        	for (var k in terms) {
	        	        		if (search.matchCase) {
	        	        			if(reference.indexOf(terms[k])>=0){
	        	        				isMatch = true;
	        	        				return isMatch;
	        	    	            }
	            	            }
	        	        		else{
	        	        			if(reference.toLowerCase().indexOf(terms[k].toLowerCase())>=0){
	        	        				isMatch = true;
	        	        				return isMatch;
	        	    	            }
	        	        		}
	        		        }
	        	            
	        	        }  else if (str.match(/\sOR/g)) {
	        	            //str = str.replace(/\sOR\s/g, "OR").split('OR').join('|');
	        	        	var terms = str.replace(/\sOR\s/g, "OR").split('OR');
	        	        	for (var k in terms) {
	        	        		if (search.matchCase) {
	        	        			if(reference.indexOf(terms[k])>=0){
	        	        				isMatch = true;
	        	        				return isMatch;
	        	    	            }
	            	            }
	        	        		else{
	        	        			if(reference.toLowerCase().indexOf(terms[k].toLowerCase())>=0){
	        	        				isMatch = true;
	        	        				return isMatch;
	        	    	            }
	        	        		}
	        		        }
	        	        }else{
	        	        	if (search.matchCase) {
	        	        		if (reference.indexOf(str)>=0) {
			    	                isMatch = true;
			    	            }
            	        	}
	        	        	else{
	        	        		if (reference.toLowerCase().indexOf(str.toLowerCase())>=0) {
			    	                isMatch = true;
			    	            }
	        	        	}
	        	        	
	        	        }
	        			
	        		}
    	    	}
    	    }
    		
    }
    return isMatch;
};

jQuery.fn.normalizedPeriodString = function() {

    var result = this.prop('id');
    var start = this.find(App.InlineDoc.instancePrefix + '\\:startDate');
    var instant = this.find(App.InlineDoc.instancePrefix + '\\:instant');

    if (start.length == 1) {
        result = start.html() + "-" + this.find(App.InlineDoc.instancePrefix + '\\:endDate').html();
    } else if (instant.length == 1) {
	result = instant.html();
    }

    return result;
};

jQuery.fn.calendarFriendlyName = function() {

    var friendlyName = this.prop('id');
    var start = this.find(App.InlineDoc.instancePrefix + '\\:startDate');
	if(start.length==0){
    	 start = this.find('startDate');
    }
    var instant = this.find(App.InlineDoc.instancePrefix + '\\:instant');

    if (start.length == 1) {

        var startDateAry = start.html().split('-');
        var startDate = new Date(startDateAry[0], parseInt(startDateAry[1]) - 1, startDateAry[2]);
        //var endDateAry = this.find(App.InlineDoc.instancePrefix + '\\:endDate').html().split('-');
		var end=this.find(App.InlineDoc.instancePrefix + '\\:endDate');
        if(end.length==0){
        	end = this.find('endDate');
       }
        var endDateAry = end.html().split('-');
        var endDate = new Date(endDateAry[0], parseInt(endDateAry[1]) - 1, endDateAry[2]);

        var lastDayOfMonth = new Date(endDate.getFullYear(), endDate.getMonth()+1, 0);
        if (startDate.getDate() == 1 &&
            lastDayOfMonth.getDate() == endDate.getDate()) {

            var totalMonths = (endDate.getFullYear() - startDate.getFullYear())*12 + (endDate.getMonth() - startDate.getMonth()) + 1;
            friendlyName = totalMonths + ' months ending ' + (endDate.getMonth() + 1) + '/' + endDate.getDate() + '/' + endDate.getFullYear()+'';
        } else {

            friendlyName = (startDate.getMonth() + 1) + '/' + startDate.getDate() + '/' + startDate.getFullYear() + ' - ' + (endDate.getMonth() + 1) + '/' + endDate.getDate() + '/' + endDate.getFullYear()+'';
        }

    } else if (instant.length == 1) {

        var instantDateAry = instant.html().split('-');
        var dt = new Date(instantDateAry[0], parseInt(instantDateAry[1]) - 1, instantDateAry[2]);
        friendlyName = 'As of ' + (dt.getMonth() + 1) + '/' + dt.getDate() + '/' + dt.getFullYear()+'';
    }

    return friendlyName;
};

jQuery.fn.scaleFriendlyName = function() {

    var friendlyName = 'N/A';
    if (this.attr('scale')) {

        friendlyName = this.attr('scale');

        var map = {
            '0':'Zero',
            '1':'Tens',
            '2':'Hundreds',
            '3':'Thousands',
            '4':'Ten thousands',
            '5':'Hundred thousands',
            '6':'Millions',
            '7':'Ten Millions',
            '8':'Hundred Millions',
            '9':'Billions',
            '10':'Ten Billions',
            '11':'Hundred Billions',
            '12':'Trillions',
            '-1':'Tenths',
            '-2':'Hundredths',
            '-3':'Thousandths',
            '-4':'Ten Thousandths',
            '-5':'Hundred Thousandths',
            '-6':'Millionths'
        };
        if (map[friendlyName]) {

            friendlyName = map[friendlyName];
        }
    }
    return friendlyName;
};

jQuery.fn.precisionFriendlyName = function() {

    var friendlyName = 'N/A';
    if (this.attr('decimals')) {

        friendlyName = this.attr('decimals');

        var map = {
            '-1':'Tens',
            '-2':'Hundreds',
            '-3':'Thousands',
            '-4':'Ten thousands',
            '-5':'Hundred thousands',
            '-6':'Millions',
            '-7':'Ten Millions',
            '-8':'Hundred Millions',
            '-9':'Billions',
            '-10':'Ten Billions',
            '-11':'Hundred Billions',
            '-12':'Trillions',
            '1':'Tenths',
            '2':'Hundredths',
            '3':'Thousandths',
            '4':'Ten Thousandths',
            '5':'Hundred Thousandths',
            '6':'Millionths'
        };
        if (map[friendlyName]) {

            friendlyName = map[friendlyName];
        }
    }
    return friendlyName;
};

jQuery.fn.unitFriendlyName = function() {

    var label = this.attr('id');
    if (this.find(App.InlineDoc.instancePrefix + '\\:measure, measure').length == 1) {

        var measureAry = this.find(App.InlineDoc.instancePrefix + '\\:measure, measure').text().split(':');
        label = measureAry.length == 1 ? measureAry[0] : measureAry[1];
    } else if (this.find(App.InlineDoc.instancePrefix + '\\:divide, divide').length == 1) {

        var numeratorAry = this.find(App.InlineDoc.instancePrefix + '\\:unitNumerator, unitNumerator').text().split(':');
        var denominatorAry = this.find(App.InlineDoc.instancePrefix + '\\:unitDenominator, unitDenominator').text().split(':');
        label = (numeratorAry.length == 1 ? numeratorAry[0] : numeratorAry[1]) + ' / ' + (denominatorAry.length == 1 ? denominatorAry[0] : denominatorAry[1]);
    }

    return label;
};

jQuery.fn.convertNameToXBRLId = function() {

    var id = '';
    if (this.attr('name')) {

        id = this.attr('name').replace(':', '_');
    }
    return id;
};

jQuery.fn.getXbrlValue = function() {

    var xbrlValue = null;
    var e = $(this);
    if (e.text() == '-') {

        xbrlValue = e.text();
    } else if (e.attr('xsi:nil')) {

        xbrlValue = 'nil';
    } else if (this[0].nodeName.toLowerCase() == 'ix:nonfraction') {

        xbrlValue = e.text();
        var scale = parseInt(this.attr('scale'));
        var decimals = parseInt(this.attr('decimals'));
        if (scale > 0) {

            if (xbrlValue.indexOf('.') != -1) {

                var valueAry = xbrlValue.split('.');
                scale = scale - valueAry[1].length;
            }
            xbrlValue = parseInt(App_Utils.rPad(xbrlValue, '0', Math.abs(scale)).replace(/[^0-9]+/g, ''));
        } else if (scale < 0) {

//            xbrlValue = App_Utils.rPad(xbrlValue/Math.pow(10, Math.abs(scale)), '0', Math.abs(scale));
//            xbrlValue = (.235).toFixed(Math.abs(scale));
            var absScale = Math.abs(scale);
            xbrlValue = (Number(Math.round(xbrlValue/100 + 'e' + absScale) + 'e-' + absScale)).toFixed(absScale);
        }

        if (this.attr('sign')) {

            xbrlValue = this.attr('sign') + xbrlValue;
        }
    }
    return xbrlValue;
};

jQuery.fn.htmlEncode = function (value) {
    return $('<div/>').text(value).html();
}

jQuery.fn.htmlDecode = function (value) { 
    return $('<div/>').html(value).text();
}

jQuery.fn.isCustom = function() {
if($(this).attr('name')){
    return App.InlineDoc.customPrefix == $(this).attr('name').split(':')[0];
}
};

jQuery.fn.isHidden = function() {

    return $(this).parents(App.InlineDoc.inlinePrefix + '\\:hidden').length > 0;
};

jQuery.fn.hasDimensions = function() {

    var segments = App.InlineDoc.getSegmentsForContext($(this).attr('contextRef'));
    return segments.length > 0;
};