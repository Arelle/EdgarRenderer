<?xml version="1.0" encoding="UTF-8"?>
<!-- EDGAR Ops Gateway adaptation of Summarize.xslt
     Herm Fischer, Mark V Systems Limited, 2015-08-30
     HF: added dynamic redline parameter, 2020-06-06
     HF: initial Ops Gateway version 2021-09-14
-->
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns="http://www.w3.org/1999/xhtml" version="1.0">
  <xsl:param name="xslt">https://www.sec.gov/include/InstanceReport.xslt</xsl:param>
  <!-- set processXsltInBrowser='true' to transform report logs in browser hf 12/29/18 -->
  <xsl:param name="processXsltInBrowser">false</xsl:param>
  <xsl:param name="includeLogs">true</xsl:param>
  <xsl:param name="includeExcel">true</xsl:param>
  <xsl:param name="title">View Filing Data</xsl:param>
  <xsl:variable name="includeDir">/include</xsl:variable>
  <xsl:variable name="imagesDir">/images</xsl:variable>
  <xsl:variable name="ixHtmlPath">/ixviewer-plus/ix.xhtml</xsl:variable>

  <xsl:variable name="docAbsPathPrefix"></xsl:variable>
  <xsl:variable name="docAbsPathSuffix"></xsl:variable>
  <xsl:variable name="fetchprefix">/ft/viewexhibitfiler.html?filename=</xsl:variable>
  <xsl:variable name="fetch_ix_prefixquoted"><![CDATA[/ft/viewexhibitfiler.html?filename=]]></xsl:variable>
  <xsl:variable name="fetchsuffix"></xsl:variable>
  <xsl:variable name="fetchsuffixquoted"><![CDATA[&amp;redline=false&amp;file=]]></xsl:variable>
  <xsl:variable name="fetchraw"><![CDATA[&amp;redline=false&amp;file=]]></xsl:variable>
  <xsl:variable name="filingDocUrlPrefix" select="$fetchprefix"/>
  <xsl:variable name="filingDocUrlPrefixQuoted" select="$fetch_ix_prefixquoted"/>
  <xsl:variable name="metaLinksSuffixQuoted" select="'&amp;metalinks=/ft/viewexhibitfiler.html?filename=MetaLinks.json'" />
  <xsl:variable name="fetchWrapsXmlInHtml"></xsl:variable>
  <xsl:include href="Summarize_Common.xslt"/>
</xsl:stylesheet>
