/**
 * Rivet Software Inc.
 *
 * @copyright Copyright (c) 2006-2011 Rivet Software, Inc. All rights reserved.
 * Version 2.4.0.3
 *
 */

var Show = {};
Show.LastAR = null,

Show.hideAR = function(){	
	Show.LastAR.style.display = 'none';
};

Show.showAR = function ( link, id, win ){
	if( Show.LastAR ){
		Show.hideAR();
	}
		
	var ref = link;
	do {
		ref = ref.nextSibling;
	} while (ref && ref.nodeName != 'TABLE');

	if (!ref || ref.nodeName != 'TABLE') {
		var tmp = win ?
			win.document.getElementById(id) :
			document.getElementById(id);

		if( tmp ){
			ref = tmp.cloneNode(true);
			ref.id = '';
			link.parentNode.appendChild(ref);
		}
	}

	if( ref ){
		ref.style.display = 'block';
		Show.LastAR = ref;
	}
};
	
Show.toggleNext = function( link ){
	var ref = link;
	
	do{
		ref = ref.nextSibling;	
	}while( ref.nodeName != 'DIV' );

	if( ref.style &&
		ref.style.display &&
		ref.style.display == 'none' ){
		ref.style.display = 'block';

		if( link.textContent ){
			link.textContent = link.textContent.replace( '+', '-' );
		}else{
			link.innerText = link.innerText.replace( '+', '-' );
		}
	}else{
		ref.style.display = 'none';
			
		if( link.textContent ){
			link.textContent = link.textContent.replace( '-', '+' );
		}else{
			link.innerText = link.innerText.replace( '-', '+' );
		}
	}
};