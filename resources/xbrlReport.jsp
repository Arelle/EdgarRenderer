<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
"http://www.w3.org/TR/html4/loose.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<HEAD>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta http-equiv="Cache-control" content="no-cache" />
<TITLE>Previewer: Reports</TITLE>
<script type="text/javascript" src="<%=this.getServletContext().getInitParameter("Style_Sheet_Location")%>/jquery-1.4.3.min.js"> </script>
<script type="text/javascript" src="<%=this.getServletContext().getInitParameter("Style_Sheet_Location")%>/accordionMenu.js"> </script>
<script type="text/javascript" src="<%=this.getServletContext().getInitParameter("Style_Sheet_Location")%>/Show.js"> </script>
<link href="<%=this.getServletContext().getInitParameter("Style_Sheet_Location")%>/interactivedata.css" rel="stylesheet" type="text/css"/>

<link rel="stylesheet" type="text/css" href="<%=this.getServletContext().getInitParameter("Style_Sheet_Location")%>/report.css" />
<link rel="stylesheet" type="text/css" href="<%=this.getServletContext().getInitParameter("Style_Sheet_Location")%>/print.css" media="print" />
<link rel="stylesheet" type="text/css" href="<%=this.getServletContext().getInitParameter("Style_Sheet_Location")%>/xbrlViewerStyle.css" />
<!--[if lt IE 9]>
<style type="text/css">
li.accordion a {display:inline-block;}
li.accordion a {display:block;}
</style>
<![endif]-->
<%@ page import="java.io.*,gov.sec.previewer.Menu,javax.xml.parsers.*,java.util.regex.*,java.util.*,org.w3c.dom.*,javax.servlet.RequestDispatcher" %>
<%! String xbrlReportNames[],xbrlReportFiles[];%>	
<%! List<ArrayList<String>> menuList;%>	
<% String fileLocation = this.getServletContext().getInitParameter("RIVET_FILE_Directory");
   String uri = this.getServletContext().getInitParameter("RIVET_URI");

   //String errorFile = this.getServletContext().getInitParameter("RIVET_ERROR_FILE");
   String filename = fileLocation+File.separator+request.getParameter("rcik")+"."+request.getParameter("rconfirm");

   /** If the report with CIK and confiramtion doesnt exists case1 **/
   String errorFile = filename + File.separator + request.getParameter("rcik")+"."+request.getParameter("rconfirm") + this.getServletContext().getInitParameter("RIVET_ERROR_FILE");

   boolean renderingLogs = false;
   boolean displayError = false;

   //Flag for the Risk Return file
   boolean riskFLag = false;
   /** If the Error report with CIK and confiramtion with exists case2 **/
  
   File xbrlReportDirectory = new File(filename);
   if (xbrlReportDirectory.exists()) {
      File xbrlErrorFile = new File(errorFile);
      if( xbrlErrorFile.exists()) {
         xbrlReportDirectory = null;
         xbrlErrorFile = null;
         displayError = true;
         System.out.println("Error File" + errorFile);
      }
   }
   else {	
      System.out.println( filename + " preview for cik.confirmation does not exist !!! ");
      xbrlReportDirectory = null;
      //response.sendRedirect(request.getContextPath()+"/index.jsp?invalidXBRL=invalid");
      RequestDispatcher dispatcher = getServletContext().getRequestDispatcher("/index.jsp?invalidXBRL=invalidXBRL");
      if (dispatcher != null) dispatcher.forward(request, response);
   } 

   System.out.println("filename--->"+filename);
   Document dom;
   Element docEle=null;
   String filesummary = filename + File.separator + "FilingSummary.xml";

   if (!displayError) {   
      System.out.println( "FileSummary --->"+filesummary);

      try {
         File xbrlFileSummary = new File(filesummary);
         if (!xbrlFileSummary.exists()) {
            RequestDispatcher dispatcher = getServletContext().getRequestDispatcher("/index.jsp?invalidXBRL=invalidXBRL");
            if (dispatcher != null) dispatcher.forward(request, response);
         }

         DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
         DocumentBuilder db = dbf.newDocumentBuilder();
         dom = db.parse("file:///" + filesummary);
         docEle = dom.getDocumentElement();
      }

      catch(ParserConfigurationException pce) { 
         pce.printStackTrace(); 
      }

      NodeList reportNodeList = docEle.getElementsByTagName("Report");

      Element shortNameEl=null, xmlFileNameEl=null, htmlFileNameEl=null, reportElements=null;
      NodeList shortNameNodeList=null, xmlFileNameNodeList=null, htmlFileNameNodeList=null;

      //System.out.println("No of reports"+reportNodeList.getLength());

      xbrlReportNames = new String[reportNodeList.getLength()];
      xbrlReportFiles= new String[reportNodeList.getLength()];

      NodeList longNameNodeList = null;
      NodeList roleNodeList = null;
      String longName = "";
      String shortName = "";
      String role = "";
      String risk = "http://xbrl.sec.gov/rr/";
      Pattern p = Pattern.compile("(?i)^http://xbrl.sec.gov/rr/");

      // Looking for Risk Return filing
      for (int i = 0 ; i < reportNodeList.getLength();i++) {   
         reportElements = (Element) reportNodeList.item(i);
         roleNodeList = reportElements.getElementsByTagName("Role");
         if (roleNodeList != null && roleNodeList.getLength() > 0) {
            Element el = (Element) roleNodeList.item(0);
            if (el.hasChildNodes()) {
               role = el.getFirstChild().getNodeValue();
               if (role != null) {
                  Matcher m = p.matcher(role);
                  riskFLag = m.find();
                  if (riskFLag) {
                     break;
                  }
               }
            }
         }
      }

      Menu menu = new Menu();

      for (int i = 0 ; i < reportNodeList.getLength();i++) {   
         longName = "";
         shortName = "";
         role = "";

         reportElements = (Element) reportNodeList.item(i);

         longNameNodeList = reportElements.getElementsByTagName("LongName");
         if (longNameNodeList != null && longNameNodeList.getLength() > 0) {
            Element el = (Element) longNameNodeList.item(0);
            if (el.hasChildNodes()) {
               longName = el.getFirstChild().getNodeValue();
            }
         }

         roleNodeList = reportElements.getElementsByTagName("Role");
         if (roleNodeList != null && roleNodeList.getLength() > 0) {
            Element el = (Element) roleNodeList.item(0);
            if (el.hasChildNodes()) {
               role = el.getFirstChild().getNodeValue();
            }
         }

         shortNameNodeList = reportElements.getElementsByTagName("ShortName");
         if (shortNameNodeList != null && shortNameNodeList.getLength() > 0) {
            shortNameEl = (Element) shortNameNodeList.item(0);
            xbrlReportNames[i] = shortNameEl.getFirstChild().getNodeValue();
         }

         /* All - <xmlFilename/> and <HtmlFilename/>*/
         if (!shortNameEl.getFirstChild().getNodeValue().equals("All Reports")) {
            htmlFileNameNodeList = reportElements.getElementsByTagName("HtmlFileName");
            xmlFileNameNodeList = reportElements.getElementsByTagName("XmlFileName");
            if (xmlFileNameNodeList != null && xmlFileNameNodeList.getLength() > 0) {
               xmlFileNameEl = (Element) xmlFileNameNodeList.item(0);
               xbrlReportFiles[i]=xmlFileNameEl.getFirstChild().getNodeValue();
            }
            else if (htmlFileNameNodeList != null && htmlFileNameNodeList.getLength() > 0) {
               htmlFileNameEl = (Element) htmlFileNameNodeList.item(0);
               xbrlReportFiles[i]=htmlFileNameEl.getFirstChild().getNodeValue();
            }
         }

         else {
            xbrlReportFiles[i]="All";
         }

         if (longName.length() > 0 && xbrlReportNames[i].length() > 0) {
            if (!xbrlReportNames[i].equals("All Reports")) {
               if (riskFLag) {
                  menu.addToList(risk, longName, xbrlReportNames[i]);
               }

               else {
                  menu.addToList(role, longName, xbrlReportNames[i]);
               }
            }
         }
      }

      // Check to see whether error logs exist 
      NodeList logsNodeList = docEle.getElementsByTagName("Logs");
      if (logsNodeList != null && logsNodeList.getLength() > 0) {
         renderingLogs = true;
      }

      menuList = menu.getList();
   }
  %>

<script type="text/javascript" language="javascript" >
   var InstanceReportXslt = "<%=this.getServletContext().getInitParameter("Style_Sheet_Location")%>/InstanceReport.xslt";
   var RenderingLogsXslt = "<%=this.getServletContext().getInitParameter("Style_Sheet_Location")%>/RenderingLogs.xslt";
   var url_path = <%out.print("\""+uri+request.getParameter("rcik")+"."+request.getParameter("rconfirm")+"/\"");%>;
       url_path = url_path.substring(1,url_path.length);
   var reports = new Array("",<% 
                    if (!displayError) {
                       for (String xmlFile : xbrlReportFiles) {
                          if (!xmlFile.equals("All"))
                             out.print("\""+request.getContextPath()+uri+request.getParameter("rcik")+"."+request.getParameter("rconfirm")+"/"+xmlFile+"\""+",");
                       }
                       out.print("\""+"all");
                       if (renderingLogs) {
                          out.print("\""+","+"\""+request.getContextPath()+uri+request.getParameter("rcik")+"."+request.getParameter("rconfirm")+"/FilingSummary.xml");
                       }
                       out.print("\"");
                    }%>); 			   	

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
         doc = jqxhr.responseXML.documentElement;
      }
      return doc;
   }

   function fixSrcAttr(src) {
      var uri = src.substr(0,5);
      // No change is needed if the 'src' attribute contains an embedded image
      if (uri == 'data:') {
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
	      if (ext == 'htm') {
	          $.ajax({
	          type: "GET",
	          url: url,
	          dataType: "text",
	          async:false,
	          success: function (data) { jQuery('#reportDiv').append(data)
	                  .find('img').attr('src', function(i, val) { return fixSrcAttr(val);}).end();
	              }
	          });            
	      } else {
	          $.ajax({
	          type: "GET",
	          url: url,
	          dataType: "text",
	          async: false,
	          success: function(data) {
	                  data = data.replace(/^\s+|\s+$/g, ''); // leading or trailing whitespace causes problems
	                  var path="/" + url.substring(1, url.lastIndexOf('/')+1);
	                  
	                  // code for IE
	                  if (window.ActiveXObject) {                  
	                     xsl_doc = loadXSLDoc(xsl_url)
	                     var xslt = new ActiveXObject("Msxml2.XSLTemplate.3.0");   
	                     xslt.stylesheet = xsl_doc;
	                     var xslproc = xslt.createProcessor();
	                     var doc = new ActiveXObject("Msxml2.FreeThreadedDOMDocument.3.0");
	                   	 doc.loadXML(data);
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
	                     xsltProcessor.importStylesheet(loadXSLDoc(xsl_url));                     
	                     xsltProcessor.setParameter(null,"source",path);
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
         report_nodes = document.getElementById("reportDiv").childNodes;
         if (report_nodes) {
            for(var j=report_nodes.length-1;j>=0;j--)
            	document.getElementById("reportDiv").removeChild(report_nodes[j]);
         }
      }
   }

   function loadReport(idx) {
      if (window.XMLHttpRequest || window.ActiveXObject) {
         clearReportDiv();
         xsl_url = null;
         if (reports[idx].indexOf('FilingSummary.xml') > -1) {
            unHighlightAllMenuItems();
            xsl_url=RenderingLogsXslt;
         }
         else {
            xsl_url=InstanceReportXslt;
         }
         if (reports[idx] == 'all') {
            highlightAllMenuItems();
            jQuery.ajaxSetup({async:false});
            for (var i=1; i<reports.length; i++) {
               if (reports[i] != 'all') {
                  getReport(reports[i], xsl_url);
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
   function FixNotesForGeckoWebkit( div ) {
      //textContent is only found in "other" browsers
      //if it exists, search it for our table - there should only be one
      if( div.textContent ) {
         var tables = div.getElementsByTagName( 'table' );
         if( tables.length ) {
           //loop through the tables
           for( var t = 0; t < tables.length; t++ ) {
              var cells = tables[t].getElementsByTagName( 'td' );
              //loop through the cells, checking for class="text" which indicates some kind of text content - this includes HTML for notes
              for( var i = 0; i < cells.length; i++ ) {
                 var curCell = cells[ i ];
                 if( curCell.className == 'text' ) {
                    //<td class="text" found - now check if this HTML had already been rendered - if so, we should not attempt to render it again
                    var nodes = curCell.getElementsByTagName( '*' );
                    if( nodes.length <= 1 ) {
                       //no "nodes" found so perform a secondary check that we have text which resembles HTML
<%! String re = "/<\\/?[a-zA-Z]{1}\\w*[^>]*>/g";%>
                       nodes = curCell.textContent.match( <%=re%> );
                       if( nodes && nodes.length ) {
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
      loadReport(1);
   }
</script>

</HEAD>

<body style="margin : 0px">





<div id="headerTop">
   <div id="Nav"><a href=<%=this.getServletContext().getInitParameter("SEC_HOME")%>>Home</a> |  <a href="javascript:history.back()">Previous Page</a></div>
   <div id="seal"><a href="http://www.sec.gov/index.htm"><img src="images/sealTop.gif" alt="SEC Seal" border="0"/></a></div>
   <div id="secWordGraphic"><img src="images/bannerTitle.gif" alt="SEC Banner"/></div>
</div>
<div id="headerBottom">
   <div id="searchHome"><a href=<%=this.getServletContext().getInitParameter("EDGAR_SEARCH_HOME")%>>Search Home</a></div>
<!-- PAGE TITLE -->
   <div id="PageTitle">XBRL Rendering Preview<br/></div>    
<!-- END PAGE TITLE -->
</div>
<!--  END HEADER -->


<!-- BEGIN BREADCRUMBS -->

<div id="breadCrumbs">
   <ul>
      <li><a href=<%=this.getServletContext().getInitParameter("SEC_HOME")%>> Home </a>&#187;</li>
      <li><a href="<%=request.getContextPath()%>"> Pre-Viewer </a>&#187;</li>
      <li> Current Page &#187;</li> 
   </ul>
</div>
<!-- END BREADCRUMBS -->

<!-- ADDED Risk Text -->
    <%if(riskFLag){ %>
<div id="riskReturnText">  
   <strong style="text-align: center ; color: red; font-weight: bold">
    The information below is derived from the fund's prospectus.
    The prospectus contains additional information about the mutual fund and should be read carefully before investing.
   </strong>
</div> 
    <%} %>
<!-- END ADDED Risk Text -->   
    
<!--   BEGIN CONTENT -->
<% 
   int count = 1;
   boolean captcha = false;
   if ((request.getSession().getAttribute(gov.sec.previewer.XBRLCaptcha.CAPTCHA_KEY)).equals(request.getParameter("j_captcha_response"))) {
      captcha = true;
 %>

<div id="formDivPreviewer" style="float: none;">
  <div id="formHeader">
    <div id="formName">
      <strong>CIK:</strong> <%= request.getParameter("rcik")%><br/>
      <strong>Confirmation Code:</strong> <%= request.getParameter("rconfirm")%>
    </div>
  </div>
</div>

<%} else { 
   response.sendRedirect(request.getContextPath()+"/index.jsp?captcha=invalid");
 } %>				

<% //if(captcha){
   if(!displayError){
%>

<div>
  <table>
    <tr>
      <td colspan="2">
        <div style="position: relative; left: 10px;">
        <a class="xbrlviewer" style="color: black; font-weight: bold;" href="javascript:window.print();" ><Strong> Print Document </Strong></a>&nbsp;
<% 
      if (!riskFLag) {
         //out.println("fileLocation:" + fileLocation);
         //out.println("filename:" + filename);
         String xlsxFilePath = filename + File.separator + "Financial_Report.xlsx";
         File xlsxFile = new File(xlsxFilePath);
         if (xlsxFile.exists()) {
%>
        <a class="xbrlviewer" href="<%=request.getContextPath()%>/rendered/results/<%=request.getParameter("rcik")%>.<%=request.getParameter("rconfirm")%>/Financial_Report.xlsx"> View Excel Documents</a>
<% } else { %>
        <a class="xbrlviewer" href="<%=request.getContextPath()%>/rendered/results/<%=request.getParameter("rcik")%>.<%=request.getParameter("rconfirm")%>/Financial_Report.xls"> View Excel Documents</a>
<%
        }
      }
%>
        </div>
      </td>
    </tr>
    <tr>
      <td style="vertical-align: top;">
        <div id="accordionMenuDiv" style="width: 170px; margin-right: 5px; position: relative; left: 5px;">
          <ul id="menu">
<%
      int idx = 0;
      for (int i=0; i<Menu.TITLE_COUNT; i++) {
         ArrayList<String> tmpList = menuList.get(i);
         if (!tmpList.isEmpty()) {
            //System.out.println(Menu.titles[i]);
%>
            <li class="accordion"> 
              <a id="menu_cat<%=idx%>" href="#"><%=Menu.titles[i]%></a>
              <ul>
<%
            for (String item : tmpList) {
               //System.out.println("   " + item + "----");
%>
                <li class="accordion"><a class="xbrlviewer" onClick="javascript:highlight(this);" href="javascript:loadReport(<%=count %>);"><%=item%></a></li>
<%
               count++;
            }
%>
              </ul>
            </li>
<%
            idx++;
         }
      }

      /* If there was at least on report then show the 'All Reports' item */
      if (count > 1) {
%>
            <li class="accordion"><a href="javascript:loadReport(<%=count %>);"><img src="images/reports.gif" border="0" height="12" width="9" alt="Reports" />All Reports</a></li>
<%
         count++;
      }

      if (renderingLogs) {
%>
            <li class="accordion"><a href="javascript:loadReport(<%=count %>);"><img src="images/reports.gif" border="0" height="12" width="9" alt="Logs" />Rendering Log</a></li>
<%
      }
%>
          </ul>
        </div>
      </td>
      <td style="vertical-align: top;">
        <div id="reportDiv"></div>
      </td>
    </tr>
  </table>
</div>
<% } else { %>
    <div style='width:90%;overflow-x:visible;word-wrap:break-word'><% String rivitErroFile = request.getParameter("rcik") + "." + request.getParameter("rconfirm") + "/" + request.getParameter("rcik") + "." + request.getParameter("rconfirm")+ this.getServletContext().getInitParameter("RIVET_ERROR_FILE"); %>
</div>
	
	<div class="center">
		<div class="renderedRed"> <p> This submission has error(s) please review the details below: </p> </div>
		<iframe frameborder="0" style="overflow:visible;width:80%;height:100%;word-wrap:break-word" src ="<%=request.getContextPath()%>/rendered/results/<%=rivitErroFile%>">
	</iframe>
    </div>  
  <% } %>       
                                     
<div style="clear:both"></div>
<div id="help"></div>   
  
<!--FOOOTER DIV-->

<div id="footer">
  <div class="currentURL"> </div>
        
        <div class="links"><a href=<%=this.getServletContext().getInitParameter("SEC_HOME")%>>Home</a> | <a href="javascript:history.back();">Previous Page</a></div>        
</div>

<noscript>This page uses Javascript. Your browser either doesn't support Javascript or you have it turned off. To see this page as it is meant to appear please use a Javascript enabled browser.</noscript> 
<!--END FOOTER DIV -->

</body>
</html>
