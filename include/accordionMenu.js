/* 
   Simple JQuery Collapsing menu.
   HTML structure to use:

   <ul id="menu">
     <li><a href="#">Sub menu heading</a>
     <ul>
       <li><a href="http://site.com/">Link</a></li>
       <li><a href="http://site.com/">Link</a></li>
       <li><a href="http://site.com/">Link</a></li>
       ...
       ...
     </ul>
     <li><a href="#">Sub menu heading</a>
     <ul>
       <li><a href="http://site.com/">Link</a></li>
       <li><a href="http://site.com/">Link</a></li>
       <li><a href="http://site.com/">Link</a></li>
       ...
       ...
     </ul>
     ...
     ...
   </ul>

Copyright 2007 by Marco van Hylckama Vlieg

web: http://www.i-marco.nl/weblog/
email: marco@i-marco.nl

Free for non-commercial use
*/

function unHighlightAllMenuItems() {
  $('#menu li ul li a.xbrlviewer').css('background-color', '#F5F5EB');
}

function highlightAllMenuItems() {
  $('#menu li ul li a.xbrlviewer').css('background-color', '#C1CDCD');
}

function initMenu() {
  $('#menu ul').hide();
  $('#menu li a').click(
    function() {
        $(this).next().slideToggle('normal');	
      }
    );
  /*
  ** Set the background of the list item menu 
  */
  $('#menu li ul li a.xbrlviewer').first().css('background-color', '#C1CDCD');

  /*
  ** Expand the first menu items list
  */
  $('#menu_cat0').trigger('click');
  }
$(document).ready(function() {initMenu();});
