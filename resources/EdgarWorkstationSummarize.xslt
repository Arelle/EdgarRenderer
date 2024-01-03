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
  <xsl:param name="xslt">https://www.sec.gov/include/InstanceReport.xslt</xsl:param>
  <!-- set processXsltInBrowser='true' to transform report logs in browser hf 12/29/18 -->
  <xsl:param name="processXsltInBrowser">false</xsl:param>
  <xsl:param name="includeLogs">true</xsl:param>
  <xsl:param name="includeExcel">true</xsl:param>
  <xsl:param name="accessionNumber">PROVIDED-BY-ARELLE-FILE-ARGUMENT-OBJECT</xsl:param>
  <xsl:variable name="includeDir">include</xsl:variable>
  <xsl:variable name="imagesDir">Images</xsl:variable>
  <xsl:variable name="ixHtmlPath">/AR/ixyiewer/ix.xhtml</xsl:variable>

  <xsl:variable name="docAbsPathPrefix"></xsl:variable>
  <xsl:variable name="docAbsPathSuffix"></xsl:variable>
  <xsl:variable name="fetchprefix"><![CDATA[DisplayDocument.do?step=docOnly&accessionNumber=]]></xsl:variable>
  <xsl:variable name="fetch_ix_prefixquoted"><![CDATA[../../DisplayDocument.do%3Fstep%3DdocOnly%26accessionNumber%3D]]></xsl:variable>
  <xsl:variable name="fetchsuffix"><![CDATA[&interpretedFormat=true&redline=false&filename=]]></xsl:variable>  
  <xsl:variable name="fetchsuffixquoted"><![CDATA[%26interpretedFormat%3Dfalse%26redline%3Dfalse%26filename%3D]]></xsl:variable>
  <xsl:variable name="fetchraw"><![CDATA[&interpretedFormat=false&redline=false&filename=]]></xsl:variable>
  <xsl:variable name="docRequiresAbsPath">false</xsl:variable>
  <xsl:variable name="filingDocUrlPrefix" select="concat($fetchprefix, $accessionNumber, $fetchsuffix)"/>
  <xsl:variable name="filingDocUrlPrefixQuoted" select="concat($fetch_ix_prefixquoted, $accessionNumber, $fetchsuffixquoted)"/>
  <xsl:variable name="metaLinksSuffixQuoted" select="concat('&amp;metalinks=', $filingDocUrlPrefixQuoted, 'MetaLinks.json')" />
  <xsl:variable name="fetchWrapsXmlInHtml">true</xsl:variable>
  <xsl:include href="Summarize_Common.xslt"/>
</xsl:stylesheet>

