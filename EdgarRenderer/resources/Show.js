// Edgar(tm) Renderer was created by staff of the U.S. Securities and Exchange Commission.  Data and content created by government employees within the scope of their employment are not subject to domestic copyright protection. 17 U.S.C. 105.
var Show={};Show.LastAR=null,Show.showAR=function(a,r,w){if(Show.LastAR)Show.hideAR();var e=a;while(e&&e.nodeName!='TABLE')e=e.nextSibling;if(!e||e.nodeName!='TABLE'){var ref=((window)?w.document:document).getElementById(r);if(ref){e=ref.cloneNode(!0);
e.removeAttribute('id');a.parentNode.appendChild(e)}}
if(e)e.style.display='block';Show.LastAR=e};Show.hideAR=function(){Show.LastAR.style.display='none'};Show.toggleNext=function(a){var e=a;while(e.nodeName!='DIV')e=e.nextSibling;if(!e.style){}else if(!e.style.display){}else{var d,p_;if(e.style.display=='none'){d='block';p='-'}else{d='none';p='+'}
e.style.display=d;if(a.textContent){a.textContent=p+a.textContent.substring(1)}else{a.innerText=p+a.innerText.substring(1)}}}
