<?xml version="1.0" encoding="utf-8"?>
<!-- Local Viewer adaptation of Summarize.xslt
     Prior references to files on www.sec.gov/include and images
     are changed to /include (on current web host).
     Herm Fischer, Mark V Systems Limited, 2015-06-20
     HF: refactored common portions from platform-specific portions 2021-09-14
-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:param name="xslt">/include/InstanceReport.xslt</xsl:param>
  <!-- set processXsltInBrowser='true' to transform report logs in browser hf 12/29/18 -->
  <xsl:param name="processXsltInBrowser">false</xsl:param>
  <xsl:param name="includeLogs">true</xsl:param>
  <xsl:param name="includeExcel">true</xsl:param>
  <xsl:variable name="includeDir">/include</xsl:variable>
  <xsl:variable name="imagesDir">/images</xsl:variable>
  <xsl:variable name="ixHtmlPath">ix.html</xsl:variable>
  <xsl:variable name="fetchprefix"></xsl:variable>
  <xsl:variable name="filingDocUrlPrefix"></xsl:variable>
  <xsl:variable name="filingDocUrlPrefixQuoted"></xsl:variable>
  <xsl:variable name="metaLinksSuffixQuoted"></xsl:variable>
  <xsl:variable name="fetchWrapsXmlInHtml"></xsl:variable>
  <xsl:include href="Summarize_Common.xslt"/>
</xsl:stylesheet>
