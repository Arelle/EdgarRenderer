<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns="http://www.w3.org/1999/xhtml"
    version="1.0">
    <xsl:output encoding="UTF-8" indent="yes" method="html" doctype-public="-//W3C//DTD HTML 4.01 Transitional//EN" />
    <!-- the purpose of this is to construct a simple approximation of the viewer/previewer menu for RE2 format FilingSummary.xml files. -->
    <xsl:variable name="majorversion" select="substring-before(/FilingSummary/Version,'.')"/>
    <xsl:template match="Report" mode="reportarray">
    <xsl:text>
        reports[</xsl:text><xsl:value-of select="position()-1"/>
        <xsl:text>]="</xsl:text>
        <xsl:choose>
            <xsl:when test="string-length(HtmlFileName) &gt; 0"><xsl:value-of select="HtmlFileName"/></xsl:when>
            <xsl:when test="string-length(XmlFileName) &gt; 0"><xsl:value-of select="XmlFileName"/></xsl:when>
            <xsl:otherwise>all</xsl:otherwise>
        </xsl:choose>
        <xsl:text>";</xsl:text>
    </xsl:template>
    <xsl:template match="FilingSummary">
        <xsl:variable name="nreports" select="count(MyReports/Report)"/>   
        <xsl:variable name="nlogs"><xsl:choose><xsl:when test="count(Logs/*)>0">1</xsl:when><xsl:otherwise>0</xsl:otherwise></xsl:choose></xsl:variable>
        <html>
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                <title>View Filing Data</title>
                <script type="text/javascript" src="http://www.sec.gov/include/jquery-1.4.3.min.js"></script>
                <script type="text/javascript" src="http://www.sec.gov/include/accordionMenu.js"></script>
                <script type="text/javascript" src="Show.js"></script>
                <link rel="stylesheet" type="text/css" href="http://www.sec.gov/include/interactive.css" />
                <link rel="stylesheet" type="text/css" href="report.css" />
                <link rel="stylesheet" type="text/css" href="http://www.sec.gov/include/print.css" media="print" />
                <link rel="stylesheet" type="text/css" href="http://www.sec.gov/include/xbrlViewerStyle.css" />

<style type="text/css">
li.accordion a {display:inline-block;}
li.accordion a {display:block;}
</style>

                
                <script type="text/javascript" language="javascript"><![CDATA[
var reports = new Array(]]><xsl:value-of select="$nreports + $nlogs"/><![CDATA[);]]>
                    <xsl:apply-templates mode='reportarray' select="MyReports/Report"/>
                    <xsl:if test="$nlogs>0"><xsl:text>
        reports[</xsl:text><xsl:value-of select="$nreports"/>
                        <xsl:text>]="FilingSummary.xml";</xsl:text></xsl:if><xsl:text disable-output-escaping="yes">

                    <![CDATA[  
   function loadXSLDoc(url) {
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
         // doc = jqxhr.responseText;
         doc = jqxhr.responseXML.documentElement;
      }
      
      return doc;
   }
   
   function fixSrcAttr(src) {
      var url_path = "";
      var uri = src.substr(0,5);
      // No change is needed if the 'src' attribute contains an embedded image or
      // it has specified a URI schema
      if (uri == 'data:') {
         return src;
      }
      var idx = src.lastIndexOf('/');
      // Trip out URL path if needed
      if (idx > -1) {
         src = src.substring(idx+1,src.length);
      }
      return url_path + src;
   }
   
   function getReport(url, xsl) {
      var ext = url.substring(url.lastIndexOf('.')+1, url.length);
      jQuery.get(url,
            function(data) {
               if (ext == 'htm') {
                  // Strip out everything between the "TEXT" elements 
                  var idx = data.indexOf('<TEXT>'); 
                  if (idx > -1) {
                     data = data.substring(idx+6,data.length);
                     idx = data.indexOf('</TEXT>'); 
                     if ( idx > -1) {
                        data = data.substring(0,idx);
                     }
                  }
                  // Find all images and prepend the base URL to the src attribute
                  jQuery('#reportDiv').append(jQuery(data)
                                      .find('img')
                                      .attr('src', function(i, val) {
                                                      return fixSrcAttr(val);
                                                   }).end());
               }
               
               else if (ext == 'xml') {
                  var path="/" + url.substring(1, url.lastIndexOf('/')+1);
                  // code for IE
                  if (window.ActiveXObject) {
                     var xslt = new ActiveXObject("Msxml2.XSLTemplate.3.0");
                     xslt.stylesheet = xsl;
                     var xslproc = xslt.createProcessor();
                        var doc = new ActiveXObject("Msxml2.FreeThreadedDOMDocument.3.0");
                   	 data = data.replace(/^\s+|\s+$/g, ''); // leading or trailing whitespace causes problems                  
                     doc.loadXML(data);
                     // var doc = data; 
                     xslproc.input = doc;
                     xslproc.addParameter("source", path );
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
                     xsltProcessor.importStylesheet(xsl);
                     xsltProcessor.setParameter(null,"source",path);
                     var rpt = xsltProcessor.transformToFragment(data, document);
                     document.getElementById("reportDiv").appendChild(rpt);
                     FixNotesForGeckoWebkit( document.getElementById( 'reportDiv' ) );
                     // Find all images and prepend the base URL to the src attribute
                     jQuery('#reportDiv').find('img')
                                         .attr('src', function(i, val) {
                                                         return fixSrcAttr(val);
                                                      });
                  }
                  
                  else {
                     alert('Your browser cannot handle this script');
                  }
               }
            });
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
         if (reports[idx].indexOf('FilingSummary.xml') > -1) {
            unHighlightAllMenuItems();
            xsl=loadXSLDoc("RenderingLogs.xslt");
         } else {
            xsl=loadXSLDoc("http://www.sec.gov/include/InstanceReport.xslt");
         }
         if (reports[idx] == 'all') {
            highlightAllMenuItems();
            jQuery.ajaxSetup({async:false});
            for (var i=0; i<reports.length; i++) {
               if (reports[i] != 'all') {
                  getReport(reports[i], xsl);
               }
            }
         }
         
         else { 
            getReport(reports[idx], xsl);
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
 
 
   window.onload = function () {
      loadReport(0);
   }
]]></xsl:text>
                </script>
            </head>
            <body style="margin: 0">
                <noscript><div style="color:red; font-weight:bold; text-align:center;">This page uses Javascript. Your browser either doesn't support Javascript or you have it turned off. To see this page as it is meant to appear please use a Javascript enabled browser.</div></noscript>
                <div>
                    
                    <table>
                        <tr>
                            <td colspan="2"><a class="xbrlviewer" style="color: black; font-weight: bold;" href="javascript:window.print();">Print Document</a>&#160;<a class="xbrlviewer" href="Financial_Report.xlsx">View Excel Document</a></td>
                        </tr>
                        <tr>
                            <td style="vertical-align: top;">                                
                                <div style="width: 170px; margin-right: 5px;">
                                    <ul id="menu">
                                        <xsl:apply-templates select="MyReports" mode="cat0"/>
<!--                                        
                                        <xsl:apply-templates select="MyReports/Report" mode="cat1"/>
                                        <xsl:apply-templates select="MyReports/Report" mode="cat2"/>
                                        <xsl:apply-templates select="MyReports/Report" mode="cat3"/>
                                        <xsl:apply-templates select="MyReports/Report" mode="cat4"/>
                                        <xsl:apply-templates select="MyReports/Report" mode="cat5"/>
                                        <xsl:apply-templates select="MyReports/Report" mode="cat6"/>
-->
                                    <li class="accordion"> <!-- menu item stands on its own -->
                                        <a><xsl:attribute name="href">
                                            <xsl:text>javascript:loadReport(</xsl:text>
                                            <xsl:value-of select="$nreports - 1"/>
                                            <xsl:text>)</xsl:text>
                                        </xsl:attribute><img src="http://www.sec.gov/images/reports.gif" border="0" height="12" width="9" alt="Reports" />All Reports</a>
                                    </li>              
                                        <xsl:if test="$nlogs>0">
                                            <li class="accordion"> <!-- menu item stands on its own -->
                                                <a><xsl:attribute name="href">
                                                    <xsl:text>javascript:loadReport(</xsl:text>
                                                    <xsl:value-of select="$nreports - 1 + $nlogs"/>
                                                    <xsl:text>)</xsl:text>
                                                </xsl:attribute><img src="http://www.sec.gov/images/reports.gif" border="0" height="12" width="9" alt="Logs" />Rendering Log</a>
                                            </li>
                                        </xsl:if>                                        
                                    </ul>
                                </div>                                
                            </td>
                            <td style="vertical-align: top;">
                                <div id="reportDiv"></div> 
                            </td>
                        </tr>
                    </table>
                </div>
            </body>
        </html>                      
    </xsl:template> 
    <xsl:template match="MyReports" mode="cat0" >
        <li class="accordion">
            <a id="menu_cat0" href="#">Single Reports</a>
            <ul>
                <!-- cat0 will have to be more selective -->                
                <xsl:apply-templates select="Report" mode="menu"/>
            </ul>
        </li>
    </xsl:template>
    <xsl:template match="Report" mode="menu">
        <xsl:if test="not(position()=last())">
        <li class="accordion" >
            <a class="xbrlviewer" onClick="javascript:highlight(this);">
                <xsl:attribute name="href">
                    <xsl:text>javascript:loadReport(</xsl:text>
                    <xsl:value-of select="position()-1"/>
                    <xsl:text>);</xsl:text>                
                </xsl:attribute>
                <xsl:value-of select="ShortName"/>
            </a>
        </li>
        </xsl:if>
    </xsl:template>
</xsl:stylesheet>