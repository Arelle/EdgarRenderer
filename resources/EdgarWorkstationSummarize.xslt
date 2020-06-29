<?xml version="1.0" encoding="UTF-8"?>
<!-- EDGAR Workstation adaptation of Summarize.xslt
     Herm Fischer, Mark V Systems Limited, 2015-08-30
     HF: added dynamic redline parameter, 2020-06-06
     Requires parameter "accessionNumber"
     sec.gov files are part of tomcat workstation's web content of include & Images directory
        include/jquery-1.4.3.min.js
        include/accordionMenu.js
        include/Show.js
        include/interactive.css
        include/report.css
        include/print.css
        Images/reports.gif
     ix files are part of tomcat workstation's web content of ixviewer directory
	ixviewer/ix.html
	ixviewer/css/app.css
	ixviewer/css/bootstrap/bootstrap.css.map
	ixviewer/css/bootstrap/bootstrap.min.css
	ixviewer/css/bootstrap/bootstrap-submenu.css
	ixviewer/css/bootstrap/bootstrap-submenu.css.map
	ixviewer/css/bootstrap/bootstrap-submenu.min.css
	ixviewer/css/bootstrap/bootstrap-theme.css
	ixviewer/css/bootstrap/bootstrap-theme.css.map
	ixviewer/css/bootstrap/bootstrap-theme.min.css
	ixviewer/css/fonts/glyphicons-halflings-regular.eot
	ixviewer/css/fonts/glyphicons-halflings-regular.svg
	ixviewer/css/fonts/glyphicons-halflings-regular.ttf
	ixviewer/css/fonts/glyphicons-halflings-regular.woff
	ixviewer/css/fonts/glyphicons-halflings-regular.woff2
	ixviewer/css/rightNavigation.css
	ixviewer/images/copyold.png
	ixviewer/images/copy.png
	ixviewer/images/file-open.png
	ixviewer/images/Filter.png
	ixviewer/images/help.png
	ixviewer/images/info.png
	ixviewer/images/save-as.png
	ixviewer/images/settings.png
	ixviewer/images/Thumbs.db
	ixviewer/js/app/about.js
	ixviewer/js/app/app.js
	ixviewer/js/app/find.js
	ixviewer/js/app/help.js
	ixviewer/js/app/ixtFunctions.js
	ixviewer/js/app/settings.js
	ixviewer/js/app/uri.js
	ixviewer/js/bootstrap/bootstrap-filestyle.js
	ixviewer/js/bootstrap/bootstrap.min.js
	ixviewer/js/bootstrap/bootstrap-submenu.js
	ixviewer/js/bootstrap/bootstrap-submenu.min.js
	ixviewer/js/bootstrap/tooltip.js
	ixviewer/js/ix.js
	ixviewer/js/FileSaver.js
	ixviewer/js/jquery/jquery-2.1.1.min.js
	ixviewer/js/jquery/jquery.browser.min.js
	ixviewer/js/jquery/jquery.custom.js
	ixviewer/js/jquery/jquery.simple-color.min.js
	ixviewer/js/jquery/jquery-ui.js
	ixviewer/js/jszip.min.js
	ixviewer/js/slide-panel.js
-->
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns="http://www.w3.org/1999/xhtml" version="1.0">
  <xsl:output encoding="UTF-8" indent="yes" method="html" doctype-public="-//W3C//DTD HTML 4.01 Transitional//EN"/>
  <xsl:param name="xslt">http://www.sec.gov/include/InstanceReport.xslt</xsl:param>
  <!-- wch 5/20/2016 parameterized stylesheet -->
  <!-- set processXsltInBrowser='true' to transform report logs in browser hf 12/29/18 -->
  <xsl:param name="processXsltInBrowser">false</xsl:param>
  <xsl:param name="includeLogs">true</xsl:param>
  <xsl:param name="accessionNumber">PROVIDED-BY-ARELLE-FILE-ARGUMENT-OBJECT</xsl:param>
  <xsl:variable name="fetchprefix"><![CDATA[DisplayDocument.do?step=docOnly&accessionNumber=]]></xsl:variable>
  <xsl:variable name="fetch_ix_prefixquoted"><![CDATA[../DisplayDocument.do%3Fstep%3DdocOnly%26accessionNumber%3D]]></xsl:variable>
  <xsl:variable name="fetchsuffix"><![CDATA[&interpretedFormat=true&redline=false&filename=]]></xsl:variable>  
  <xsl:variable name="fetchsuffixquoted"><![CDATA[%26interpretedFormat%3Dtrue%26redline%3Dfalse%26filename%3D]]></xsl:variable>
  <xsl:variable name="fetchraw"><![CDATA[&interpretedFormat=false&redline=false&filename=]]></xsl:variable>
  <xsl:key name="keyParent" match="Report" use="ParentRole"/>
  <xsl:variable name="majorversion" select="substring-before(/FilingSummary/Version,'.')"/>
  <xsl:variable name="nreports" select="count(/FilingSummary/MyReports/Report)"/>
  <xsl:variable name="nbooks" select="count(/FilingSummary/MyReports/Report[ReportType='Book'])"/>
  <xsl:variable name="isrr" select="0 &lt; count(/FilingSummary/MyReports/Report[contains(Role,'http://xbrl.sec.gov/rr')])"/>
  <xsl:variable name="nlogs">
    <xsl:choose>
        <xsl:when test="count(/FilingSummary/Logs/*) > 0 and $includeLogs = 'true'">1</xsl:when>
        <xsl:otherwise>0</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <xsl:template match="Report" mode="reportarray">
    <xsl:text>
        reports[</xsl:text>
    <xsl:value-of select="position()"/>
    <xsl:text>]="</xsl:text>
    <xsl:choose>
      <xsl:when test="string-length(HtmlFileName) &gt; 0">
        <xsl:value-of select="HtmlFileName"/>
      </xsl:when>
      <xsl:when test="string-length(XmlFileName) &gt; 0">
        <xsl:value-of select="XmlFileName"/>
      </xsl:when>
      <xsl:otherwise>all</xsl:otherwise>
    </xsl:choose>
    <xsl:text>";</xsl:text>
  </xsl:template>
  <xsl:template match="Report" mode="parentreportarray">
    <xsl:text>
        parentreport[</xsl:text>
    <xsl:value-of select="position()"/>
    <xsl:text>]=</xsl:text>
    <xsl:variable name="ParentRole" select="ParentRole"/>
    <xsl:variable name="n">
      <xsl:for-each select="../Report">
        <xsl:if test="$ParentRole = Role">
          <xsl:value-of select="position()"/>
        </xsl:if>
      </xsl:for-each>
    </xsl:variable>
    <xsl:choose>
      <xsl:when test="string-length($n)>0">
        <xsl:value-of select="$n"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:text>-1</xsl:text>
      </xsl:otherwise>
    </xsl:choose>
    <xsl:text>;</xsl:text>
  </xsl:template>
  <xsl:template match="FilingSummary">
    <html>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <meta http-equiv="Cache-Control" content="no-cache"/>
        <title>View Filing Data</title>
        <script type="text/javascript" src="include/jquery-1.4.3.min.js"/>
        <script type="text/javascript" src="include/accordionMenu.js"/>
        <script type="text/javascript" src="include/Show.js"/>
        <link rel="stylesheet" type="text/css" href="include/interactive.css"/>
        <link rel="stylesheet" type="text/css" href="include/report.css"/>
        <link rel="stylesheet" type="text/css" href="include/print.css" media="print"/>
        <style type="text/css">
          #menu{
            font-family:Helvetica, Arial, sans-serif;
            font-size:11px;
          }
          
          ul#menu {
          list-style-type:none;
          margin:0;
          padding:0;
          width:15em;
          border:1px solid #333;
          background-color:#F5F5EB;
          }
          
          ul#menu ul{
            list-style-type:none;
            margin:0;
            padding:0;
            width:15em;
            background-color:#F5F5EB; 
          }
          
          ul#menu a{
            display:block;
            text-decoration:none;
          }
          
          ul#menu li{
            margin-top:1px;
          }
          
          ul#menu li a{
            background:#F3D673; 
            color:black;
            padding:0.5em;
          }
          
          ul#menu li a:hover{
            background:#aaa;
          }
          
          ul#menu li ul li a{
            background:#F5F5EB;
            color:#BF0023;
            padding-left:20px;
          }
          
          ul#menu li ul li a:hover{
            background:#aaa;
            border-left:5px #000 solid;
            padding-left:15px;
          }</style>

        <style type="text/css">
          li.accordion a{
            display:inline-block;
          }
          li.accordion a{
            display:block;
          }
          li.octave {border-top: 1px solid black;}
        </style>
        <script type="text/javascript">
          <xsl:text>var InstanceReportXslt = "</xsl:text>
          <xsl:value-of select="$xslt"/>
          <xsl:text>"; var InstanceReportXsltDoc = null; </xsl:text>
          <xsl:text>var accessionNumber = "</xsl:text><xsl:value-of select="$accessionNumber"/><xsl:text>";</xsl:text>
          <xsl:text>var isRedline = (location.href.indexOf("&amp;redline=true") >= 0);</xsl:text>
          <xsl:text>var fetchprefix = "</xsl:text><xsl:value-of select="$fetchprefix"/><xsl:text>";</xsl:text>
          <xsl:text>var fetchsuffix = "</xsl:text><xsl:value-of select="$fetchsuffix"/><xsl:text>";</xsl:text>
          <xsl:text>var fetchraw = "</xsl:text><xsl:value-of select="$fetchraw"/><xsl:text>";</xsl:text>
          <xsl:text>var processXsltInBrowser = "</xsl:text><xsl:value-of select="$processXsltInBrowser"/><xsl:text>";</xsl:text>
          <xsl:text>var reports = new Array();</xsl:text>
          <xsl:apply-templates mode="reportarray" select="MyReports/Report"/>
          <xsl:if test="$nlogs > 0"><xsl:text>
        reports[</xsl:text><xsl:value-of select="$nreports + $nlogs "/>
            <xsl:choose>
               <xsl:when test="$processXsltInBrowser = 'true'">
                 <xsl:text>]="FilingSummary.xml";</xsl:text>
               </xsl:when>
               <xsl:otherwise>
                 <xsl:text>]="RenderingLogs.htm";</xsl:text>
               </xsl:otherwise>
            </xsl:choose>
          </xsl:if><![CDATA[
          var parentreport = new Array();//]]>
                    <xsl:apply-templates mode="parentreportarray" select="MyReports/Report"/>                    
                    <xsl:text disable-output-escaping="yes"><![CDATA[  
   function loadXmlDoc(url) {
      var doc;
      var jqxhr=$.ajax({type: "GET",
                        url: url,
                        async: false});                        
      // code for IE
      if (window.ActiveXObject) {
         doc = new ActiveXObject("Msxml2.FreeThreadedDOMDocument.3.0");
         doc.loadXML(jqxhr.responseText);
      }      
      // code for other browsers
      else if (document.implementation && document.implementation.createDocument) {
         doc=document.implementation.createDocument("","",null);
         doc.async=true;
         doc = jqxhr.responseXML.documentElement;
      }      
      return doc;
   }
   
   function fixSrcAttr(src) {
      var url_path = fetchprefix + accessionNumber + fetchsuffix;
      var uri = src.substr(0,5);
      // No change is needed if the 'src' attribute contains an embedded image
      if (uri == 'data:') {
         return src;
      }
      // EDGAR no change if already a workstation database query format
      if (src.indexOf("DisplayDocument.do")>0) {
         return src;
      }
      // Absolute URL on EDGAR website is unchanged
      var idx = src.lastIndexOf('http://www.sec.gov/Archives/edgar/data/')
      if (idx > -1) {
        return src;
      } // For all other URLs use only basename component
      var idx = src.lastIndexOf('/');
      if (idx > -1) {
         src = src.substring(idx+1,src.length);
      }
      return url_path + src;
   }
   
   function getReport(url, xsl_url) {
      if (xsl_url == null) { xsl_url = InstanceReportXslt; }
      var ext = url.substring(url.lastIndexOf('.')+1, url.length);
      var _url;
      if (ext == 'htm') {
	    _url = fetchprefix + accessionNumber + fetchsuffix + url;
          $.ajax({
          type: "GET",
          url: _url,
          dataType: "text",
          async:false,
          success: function (data) { jQuery('#reportDiv').append(data)
                  .find('img').attr('src', function(i, val) { return fixSrcAttr(val);}).end();
              }
          });       
      } else if (processXsltInBrowser == 'true') {
	  _url = fetchprefix + accessionNumber + fetchraw + url; //causes HTML wrapping of XML
          $.ajax({
          type: "GET",
          url: _url,
          dataType: "text",
          async: false,
          success: function(data) {
		  // remove EDGAR workstation HTML wrpping of XML
		  data = data.replace(/<HTML><HEAD><TITLE>.+<PRE><FONT SIZE = 3>/g, ''); // header
		  data = data.replace(/<\/FONT><\/PRE><\/BODY><\/HTML>/g, ''); // footer
		  data = data.replace(/<P CLASS=\"page\">&nbsp;<\/P>/g, '\n'); // newlines
		  data = data.replace(/&gt;/g, '>'); 
		  data = data.replace(/&lt;/g, '<'); 
		  data = data.replace(/&amp;/g, '&'); 
		  // end of EDGAR HTML wrapping removal
                  data = data.replace(/^\s+|\s+$/g, ''); // leading or trailing whitespace causes problems
                  var path=_url; // not for EDGAR Workstation: "/" + _url.substring(1, _url.lastIndexOf('/')+1);
                  
                  // code for IE
                  if (window.ActiveXObject) {                  
                     xsl_doc = loadXmlDoc(xsl_url)
                     var xslt = new ActiveXObject("Msxml2.XSLTemplate.3.0");   
                     xslt.stylesheet = xsl_doc;
                     var xslproc = xslt.createProcessor();
                     var doc = new ActiveXObject("Msxml2.FreeThreadedDOMDocument.3.0");
                   	 doc.loadXML(data);
                     xslproc.input = doc;
                     xslproc.addParameter("source", path );
                     xslproc.addParameter("asPage", "true" );
                     xslproc.transform();
                     // Find all images and prepend the base URL to the src attribute
                     jQuery('#reportDiv').append(jQuery(xslproc.output)
                                         .find('img')
                                         .attr('src', function(i, val) {
                                                         return fixSrcAttr(val);
                                                      }).end());
                  }                  
                  // code for other browsers
                  else if (document.implementation && document.implementation.createDocument) {
                     xsltProcessor=new XSLTProcessor();
                     xsltProcessor.importStylesheet(loadXmlDoc(xsl_url));                     
                     xsltProcessor.setParameter(null,"source",path);
                     xsltProcessor.setParameter(null,"asPage","true");
                     parser = new DOMParser();
                     xmlDoc = parser.parseFromString(data, "text/xml");
                     var rpt = xsltProcessor.transformToFragment(xmlDoc, document);
                     document.getElementById("reportDiv").appendChild(rpt);
                     FixNotesForGeckoWebkit( document.getElementById( 'reportDiv' ) );
                     // Find all images and prepend the base URL to the src attribute
                     jQuery('#reportDiv').find('img')
                                         .attr('src', function(i, val) {
                                                         return fixSrcAttr(val);
                                                      });
                  } else {
                     alert('Your browser cannot handle this script');
                  }
                }
            });
               }
   }
   
   function clearReportDiv() {
      // code for IE
      if (window.ActiveXObject) {
         document.getElementById("reportDiv").innerHTML='';
      }
      
      // code for Mozilla, Firefox, Opera, etc.
      else if (document.implementation && document.implementation.createDocument) {
         x = document.getElementById("reportDiv").childNodes;
         for (i=x.length-1;i>-1;i--) {
            node = document.getElementById("reportDiv").childNodes[i];
            if (node) {
               document.getElementById("reportDiv").removeChild(node);
            }
         }
      }
   }
   
   function loadReport(idx) {
      if (window.XMLHttpRequest || window.ActiveXObject) {
         clearReportDiv();
         xsl_url = null;
         if (reports[idx].indexOf('FilingSummary.xml') > -1) {
            unHighlightAllMenuItems();
            /* EDGAR Workstation requires database query to obtain a submission rendered file */
            xsl_url = fetchprefix + accessionNumber + fetchsuffix + 'RenderingLogs.xslt';
         } 
         if (reports[idx] == 'all') {
            highlightAllMenuItems();
            jQuery.ajaxSetup({async:false});
            for (var i=1; i<reports.length; i++) {
               if (reports[i] != 'all') {
                  getReport(reports[i], xsl_url);
               } else {
               break;
               }
            }
         }
         else { 
            getReport(reports[idx], xsl_url);
         }
         window.scrollTo(0,0);
      }
      
      else {
         alert('Your browser cannot handle this script');
      }
   }
   
   function highlight(link) {
      var parent = document.getElementById( 'menu' );
      var links = parent.getElementsByTagName( 'a' );
      
      for (var i = 0; i < links.length; i++){
         if (links[i].className == 'xbrlviewer') {
            if (links[i] == link) {
               link.style.background = "#C1CDCD";
            } else {
               links[i].style.background = "#F5F5EB";
            }
         }
      }
   }
   
   //the parameter 'div' represents <div id="reportDiv">
   function FixNotesForGeckoWebkit( div ){
      //textContent is only found in "other" browsers
      //if it exists, search it for our table - there should only be one
      if( div.textContent ){
         var tables = div.getElementsByTagName( 'table' );
         if( tables.length ){
            //loop through the tables
           for( var t = 0; t < tables.length; t++ ){
              var cells = tables[t].getElementsByTagName( 'td' );
              //loop through the cells, checking for class="text" which indicates some kind of text content - this includes HTML for notes
              for( var i = 0; i < cells.length; i++ ){
                 var curCell = cells[ i ];
                 if( curCell.className == 'text' ){
                    //<td class="text" found - now check if this HTML had already been rendered - if so, we should not attempt to render it again
                    var nodes = curCell.getElementsByTagName( '*' );
                    if( nodes.length <= 1 ){
                       //no "nodes" found so perform a secondary check that we have text which resembles HTML
                       nodes = curCell.textContent.match( /<\/?[a-zA-Z]{1}\w*[^>]*>/g );
                       if( nodes && nodes.length ){
                          //this text does resemble HTML, use the textContent as HTML and that will convert the text to HTML content.
                          curCell.innerHTML = curCell.textContent;
                        }
                     }        
                  }
               }
            }
         }
      }
   }
   
   function applyRedline( url ) {
       if (isRedline) {
           return url.replace(/(&redline=|%26redline%3D)false/g,'$1true');
       } else {
           return url;
       }
   }
  
   window.onload = function () {
         if (window.location.href.substring(0,5)=='file:') {
          ableToOpenReportFiles = 0;
          try {$.ajax({type: "GET",url: reports[1],dataType: "text",async:false,
              success: function (data) { if (data != 0) ableToOpenReportFiles = 1; }});
          } catch (err) {}
          if (ableToOpenReportFiles == 0) {
            alert("In this browser environment, opening the url\n"
            +window.location.href
            +"\nprevents individual report files such as "
            +reports[1]+" from opening.");}}
      loadReport(1);
   }
]]></xsl:text>
                </script>
      </head>
      <body style="margin: 0">
        <noscript>
          <div style="color:red; font-weight:bold; text-align:center;">This page uses Javascript. Your browser either doesn't support Javascript or you have it turned off. To see this page as it is meant to appear please use a Javascript enabled browser.</div>
        </noscript>
        <div>
          <table>
            <tr>
              <td colspan="2">
                 <a class="xbrlviewer" style="color: black; font-weight: bold;"
                    href="javascript:window.print();">Print Document</a><xsl:if test="not($isrr)">&#160;<a
                       class="xbrlviewer">
                  <xsl:attribute name="href">
                    <xsl:value-of select="concat($fetchprefix,$accessionNumber,$fetchsuffix,'Financial_Report.xlsx')"/>
                  </xsl:attribute>View Excel Document</a></xsl:if></td>
            </tr>
            <tr>
              <td style="vertical-align: top;">
                <div style="width: 170px; margin-right: 5px;">
                  <ul id="menu">
                    <xsl:call-template name="menuGroups">
                      <xsl:with-param name="depth">0</xsl:with-param>
                      <xsl:with-param name="position">1</xsl:with-param>
                      <xsl:with-param name="menucat">0</xsl:with-param>
                    </xsl:call-template>
                  </ul>
                </div>
              </td>
              <td style="vertical-align: top;">
                <div id="reportDiv"/>
              </td>
            </tr>
          </table>
        </div>
      </body>
    </html>
  </xsl:template>

  <xsl:template name="menuGroups">
    <!-- tail recursive template over myReports, current context FilingSummary -->
    <!-- note that the thing calls menu_cat0, menu_cat1, refers only to the numerical sequence -->
    <!-- the thing called menu_name refers to the symbolic name such as "Cover", "Notes", etc. -->
    <xsl:param name="depth"/>
    <xsl:param name="position"/>
    <xsl:param name="menucat"/>
    <xsl:param name="prev_instance"/>
    <xsl:variable name="instance">
      <xsl:value-of select="(MyReports/Report[position()=$position]/@instance)" />
    </xsl:variable>
    <xsl:choose>
      <xsl:when test="count(MyReports/*[position() >= $position and Role])=0">
        <!-- we reached the very end of the list -->
        <xsl:if test="$nbooks > 0">
          <li class="accordion">
            <!-- final menu items stand on their own -->
            <a><xsl:attribute name="href">
                <xsl:text>javascript:loadReport(</xsl:text>
                <xsl:value-of select="$nreports"/>
                <xsl:text>)</xsl:text>
              </xsl:attribute><img src="Images/reports.gif" border="0" height="12" width="9" alt="Reports"/>All Reports</a>
          </li>
        </xsl:if>
        <xsl:if test="$nlogs > 0">
          <li class="accordion">
            <a><xsl:attribute name="href">
                <xsl:text>javascript:loadReport(</xsl:text>
                <xsl:value-of select="$nreports + $nlogs "/>
                <xsl:text>)</xsl:text>
              </xsl:attribute><img src="Images/reports.gif" border="0" height="12" width="9" alt="Logs"/>Rendering Log</a>
          </li>
        </xsl:if>
      </xsl:when>
      <xsl:when test="$isrr">
        <xsl:if test="$instance != $prev_instance">
          <xsl:variable name="doctype">
            <xsl:value-of select="(/FilingSummary/InputFiles/File[.=$instance]/@doctype)"/>
          </xsl:variable>
          <xsl:variable name="original">
            <xsl:value-of select="(/FilingSummary/InputFiles/File[.=$instance]/@original)"/>
          </xsl:variable>
          <xsl:variable name="instance_is_inline">
            <xsl:value-of select="translate(substring($instance,string-length($instance)-3),'HTM','htm') = '.htm'"/>
          </xsl:variable>
          <xsl:if test="$original != ''">
            <li class="accordion ">
              <xsl:choose>
	          <xsl:when test="$instance_is_inline = 'true'">
	            <xsl:comment>EDGAR workstation requires escaped database query for document retrieval</xsl:comment>
	            <xsl:variable name="htmUrl" select="concat($fetch_ix_prefixquoted,$accessionNumber,$fetchsuffixquoted,$original)"/>
	            <xsl:variable name="metalinksUrl" select="concat($fetch_ix_prefixquoted,$accessionNumber,$fetchsuffixquoted,'MetaLinks.json')"/>
	            <a href="javascript:window.location=applyRedline('ixviewer/ix.html?xbrl=true&amp;doc={$htmUrl}&amp;metalinks={$metalinksUrl}')"><xsl:value-of select="$doctype"/></a>
	          </xsl:when>
	          <xsl:otherwise>
	            <xsl:variable name="htmUrl" select="concat($fetchprefix,$accessionNumber,$fetchsuffix,$original)"/>
	            <a href="{$htmUrl}"><xsl:value-of select="$doctype"/></a>
	          </xsl:otherwise>
              </xsl:choose>             
            </li>              
          </xsl:if>
        </xsl:if>  
        <li class="accordion">
          <a id="menu_cat0" href="#">Risk Return Reports</a>
          <ul>
            <xsl:for-each select="MyReports/Report[Role]">
              <li class="accordion" style="margin-left:{$depth * 2}em">
                <a class="xbrlviewer" onClick="javascript:highlight(this);">
                  <xsl:attribute name="href">
                    <xsl:text>javascript:loadReport(</xsl:text>
                    <xsl:value-of select="(position()) + ($position - 1)"/>
                    <xsl:text>);</xsl:text>
                  </xsl:attribute>
                  <xsl:value-of select="ShortName"/>
                </a>
              </li>
            </xsl:for-each>
          </ul>
        </li>
        <xsl:call-template name="menuGroups">
          <xsl:with-param name="depth" select="$depth"/>
          <xsl:with-param name="position" select="1 + count(MyReports/Report)"/>
          <xsl:with-param name="menucat" select="1"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:when test="true()">
        <xsl:variable name="this_cat">
          <xsl:for-each select="MyReports/Report[position()=$position]">
            <xsl:call-template name="menu_name">
              <xsl:with-param name="atstart">
                <xsl:value-of select="$menucat = 0 or $instance != $prev_instance"/>
              </xsl:with-param>
            </xsl:call-template>
          </xsl:for-each>
        </xsl:variable>
        <xsl:variable name="next_cat_position">
          <xsl:call-template name="next_cat_position">
            <xsl:with-param name="cat" select="$this_cat"/>
            <xsl:with-param name="pos" select="(1 + $position)"/>
          </xsl:call-template>
        </xsl:variable>
        <xsl:if test="$instance != $prev_instance">
          <xsl:variable name="doctype">
            <xsl:value-of select="(/FilingSummary/InputFiles/File[.=$instance]/@doctype)"/>
          </xsl:variable>
          <xsl:variable name="original">
            <xsl:value-of select="(/FilingSummary/InputFiles/File[.=$instance]/@original)"/>
          </xsl:variable>
          <xsl:variable name="instance_is_inline">
            <xsl:value-of select="translate(substring($instance,string-length($instance)-3),'HTM','htm') = '.htm'"/>
          </xsl:variable>
          <xsl:if test="$original != ''">
              <li class="accordion octave">
                <xsl:choose>
                  <xsl:when test="$instance_is_inline = 'true'">
                    <xsl:comment>EDGAR workstation requires escaped database query for document retrieval</xsl:comment>
                    <xsl:variable name="htmUrl" select="concat($fetch_ix_prefixquoted,$accessionNumber,$fetchsuffixquoted,$original)"/>
                    <xsl:variable name="metalinksUrl" select="concat($fetch_ix_prefixquoted,$accessionNumber,$fetchsuffixquoted,'MetaLinks.json')"/>
                    <a href="javascript:window.location=applyRedline('ixviewer/ix.html?xbrl=true&amp;doc={$htmUrl}&amp;metalinks={$metalinksUrl}')"><xsl:value-of select="$doctype"/></a>
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:variable name="htmUrl" select="concat($fetchprefix,$accessionNumber,$fetchsuffix,$original)"/>
                    <a href="{$htmUrl}"><xsl:value-of select="$doctype"/></a>
                  </xsl:otherwise>
                </xsl:choose>                
              </li>              
           </xsl:if>
        </xsl:if>        
        <xsl:variable name="octave_divider">
          <xsl:choose>
            <xsl:when test="$menucat = 0 and not($instance)"> octave</xsl:when>
            <xsl:when test="$instance != $prev_instance and not(/FilingSummary/InputFiles/File[.=$instance]/@original)"> octave</xsl:when>
            <xsl:otherwise></xsl:otherwise>
          </xsl:choose>
        </xsl:variable>
        <li class="accordion{$octave_divider}">
          <a id="menu_cat{$menucat}" href="#">
            <xsl:value-of select="$this_cat"/>
          </a>
          <ul>
            <xsl:for-each select="MyReports/Report[Role and position() >= $position and position() &lt; $next_cat_position]">
              <li class="accordion" style="margin-left:{$depth * 2}em">
                <a class="xbrlviewer" onClick="javascript:highlight(this);">
                  <xsl:attribute name="href">
                    <xsl:text>javascript:loadReport(</xsl:text>
                    <xsl:value-of select="(position()) + ($position - 1)"/>
                    <xsl:text>);</xsl:text>
                  </xsl:attribute>
                  <xsl:value-of select="ShortName"/>
                </a>
              </li>
            </xsl:for-each>
          </ul>
        </li>
        <!-- tail recursion -->
        <xsl:call-template name="menuGroups">
          <xsl:with-param name="depth" select="($depth)"/>
          <xsl:with-param name="position" select="$next_cat_position"/>
          <xsl:with-param name="menucat" select="($menucat + 1)"/>
          <xsl:with-param name="prev_instance" select="$instance"/>
        </xsl:call-template>
      </xsl:when>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="MenuItem">
    <!-- Current context is a Report element -->
    <xsl:param name="Pos"/>
    <xsl:param name="Cat"/>
    <xsl:param name="Depth">0</xsl:param>
    <li class="accordion" style="margin-left:{$Depth * 2}em">
      <a class="xbrlviewer" onClick="javascript:highlight(this);">
        <xsl:attribute name="href">
          <xsl:text>javascript:loadReport(</xsl:text>
          <xsl:value-of select="$Pos"/>
          <xsl:text>);</xsl:text>
        </xsl:attribute>
        <xsl:value-of select="ShortName"/>
      </a>
      <xsl:variable name="ThisRole" select="Role"/>
      <xsl:if test="key('keyParent',$ThisRole)">
        <ul>
          <xsl:for-each select="key('keyParent',$ThisRole)">
            <xsl:sort data-type="text" select="LongName"/>
            <xsl:call-template name="MenuItem">
              <xsl:with-param name="Pos" select="Position"/>
              <xsl:with-param name="Cat" select="MenuCategory"/>
              <xsl:with-param name="Depth" select="1 + $Depth"/>
            </xsl:call-template>
          </xsl:for-each>
        </ul>
      </xsl:if>
    </li>
  </xsl:template>

  <xsl:template name="next_cat_position">
    <!-- current context is FilingSummary -->
    <xsl:param name="pos"/>
    <xsl:param name="cat"/>
    <xsl:variable name="that">
      <xsl:for-each select="MyReports/Report[position() = $pos]">
        <xsl:call-template name="menu_name">
          <xsl:with-param name="atstart">false</xsl:with-param>
        </xsl:call-template>
      </xsl:for-each>
    </xsl:variable>
    <xsl:choose>
      <xsl:when test="$that != $cat">
        <xsl:value-of select="$pos"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:call-template name="next_cat_position">
          <xsl:with-param name="pos" select="($pos + 1)"/>
          <xsl:with-param name="cat" select="$cat"/>
        </xsl:call-template>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="menu_name">
    <xsl:param name="atstart"/>
    <xsl:variable name="is6">
      <xsl:call-template name="isUncategorized"/>
    </xsl:variable>
    <xsl:choose>
      <xsl:when test="$is6='true'">Uncategorized</xsl:when>
      <xsl:otherwise>
        <xsl:variable name="is5">
          <xsl:call-template name="isDetail"/>
        </xsl:variable>
        <xsl:choose>
          <xsl:when test="$is5='true'">Notes Details</xsl:when>
          <xsl:otherwise>
            <xsl:variable name="is4">
              <xsl:call-template name="isTable"/>
            </xsl:variable>
            <xsl:choose>
              <xsl:when test="$is4='true'">Notes Tables</xsl:when>
              <xsl:otherwise>
                <xsl:variable name="is3">
                  <xsl:call-template name="isPolicy"/>
                </xsl:variable>
                <xsl:choose>
                  <xsl:when test="$is3='true'">Accounting Policies</xsl:when>
                  <xsl:otherwise>
                    <xsl:variable name="is2">
                      <xsl:call-template name="isDisclosure"/>
                    </xsl:variable>
                    <xsl:choose>
                      <xsl:when test="$is2='true'">Notes to Financial Statements</xsl:when>
                      <xsl:otherwise>
                        <xsl:variable name="is1">
                          <xsl:call-template name="isStatement"/>
                        </xsl:variable>
                        <xsl:choose>
                          <xsl:when test="$is1='true'">Financial Statements</xsl:when>
                          <xsl:when test="$atstart='true'">Cover</xsl:when>
                          <xsl:otherwise>Other</xsl:otherwise>
                        </xsl:choose>
                      </xsl:otherwise>
                    </xsl:choose>
                  </xsl:otherwise>
                </xsl:choose>
              </xsl:otherwise>
            </xsl:choose>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="isUncategorized">
    <xsl:value-of select="LongName='Uncategorized Items' or Role='http://xbrl.sec.gov/role/uncategorizedFacts'"/>
  </xsl:template>

  <xsl:template name="isStatement">
    <!-- '.* +\- +Statement +\- .*' -->
    <xsl:variable name="p1" select="substring-after(LongName,'- ')"/>
    <xsl:variable name="p2" select="substring-after($p1,'Statement ')"/>
    <xsl:variable name="p3" select="substring-after($p2,'- ')"/>
    <xsl:value-of select="string-length($p3) &gt; 0"/>
  </xsl:template>

  <xsl:template name="isDisclosure">
    <!-- '.* +\- +Disclosure +\- .*' -->
    <xsl:variable name="p1" select="substring-after(LongName,'- ')"/>
    <xsl:variable name="p2" select="substring-after($p1,'Disclosure ')"/>
    <xsl:variable name="p3" select="substring-after($p2,'- ')"/>
    <xsl:value-of select="string-length($p3) &gt; 0"/>
  </xsl:template>

  <xsl:template name="isParenthetical">
    <!-- '.*\-.+-.*Paren.+' -->
    <xsl:variable name="p1" select="substring-after(LongName,'- ')"/>
    <xsl:variable name="p2" select="substring-after($p1,'- ')"/>
    <xsl:variable name="p3" select="substring-after($p2,'Paren')"/>
    <xsl:value-of select="string-length($p3) &gt; 0"/>
  </xsl:template>

  <xsl:template name="isPolicy">
    <!-- '.*\(.*Polic.*\).*' -->
    <xsl:variable name="p1" select="substring-after(LongName,'- ')"/>
    <xsl:variable name="p2" select="substring-after($p1,'- ')"/>
    <xsl:variable name="p3" select="substring-after($p2,'(Polic')"/>
    <xsl:value-of select="string-length($p3) &gt; 0"/>
  </xsl:template>

  <xsl:template name="isTable">
    <!-- '.*\(.*Table.*\).*' -->
    <xsl:variable name="p1" select="substring-after(LongName,'- ')"/>
    <xsl:variable name="p2" select="substring-after($p1,'- ')"/>
    <xsl:variable name="p3" select="substring-after($p2,'(Table')"/>
    <xsl:value-of select="string-length($p3) &gt; 0"/>
  </xsl:template>

  <xsl:template name="isDetail">
    <!-- '.*\(.*Detail.*\).*' -->
    <xsl:variable name="p1" select="substring-after(LongName,'- ')"/>
    <xsl:variable name="p2" select="substring-after($p1,'- ')"/>
    <xsl:variable name="p3" select="substring-after($p2,'(Detail')"/>
    <xsl:value-of select="string-length($p3) &gt; 0"/>
  </xsl:template>
  
</xsl:stylesheet>
