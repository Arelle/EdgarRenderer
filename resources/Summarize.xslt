<?xml version="1.0" encoding="utf-8"?>
<!-- Local Viewer adaptation of Summarize.xslt
     Prior references to files on www.sec.gov/include and images
     are changed to /include (on current web host).
     Herm Fischer, Mark V Systems Limited, 2015-06-20
     HF: refactored common portions from platform-specific portions 2021-09-14
     HF: 
-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:param name="xslt">/include/InstanceReport.xslt</xsl:param>
  <!-- set processXsltInBrowser='true' to transform report logs in browser hf 12/29/18 -->
  <xsl:param name="processXsltInBrowser">false</xsl:param>
  <xsl:param name="includeLogs">true</xsl:param>
  <xsl:param name="includeExcel">true</xsl:param>
  <xsl:param name="title">View Filing Data</xsl:param>
  <xsl:variable name="includeDir">/include</xsl:variable>
  <xsl:variable name="imagesDir">/images</xsl:variable>
  <!--  future direct opening ixviewer-plus 
  <xsl:variable name="ixHtmlPath">/ixviewer-plus/ix.xhtml</xsl:variable>
  -->
  <!--  open "redirector" script used in 24.0.1 to choose 23.2 viewer unless multi-IXDS, multi-doc or fee exhibit -->
  <xsl:variable name="ixHtmlPath">/ix</xsl:variable>
  <!--  end of 24.0.1 temporary changes -->
  <xsl:variable name="docAbsPathPrefix">' + url_filing_dir +'</xsl:variable>
  <xsl:variable name="docAbsPathSuffix">' + '</xsl:variable>
  <xsl:variable name="fetchprefix"></xsl:variable>
  <xsl:variable name="filingDocUrlPrefix"></xsl:variable>
  <xsl:variable name="filingDocUrlPrefixQuoted"></xsl:variable>
  <xsl:variable name="metaLinksSuffixQuoted">
  	<xsl:if test="$title != 'View Filing Data'">
  		<xsl:value-of select="concat('&amp;title=', $title)"/>
  	</xsl:if>
  </xsl:variable>
  <xsl:variable name="fetchWrapsXmlInHtml"></xsl:variable>
  <xsl:include href="Summarize_Common.xslt"/>
</xsl:stylesheet>
