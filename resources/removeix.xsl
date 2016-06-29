<?xml version="1.0" encoding="UTF-8"?>
<!-- apply stylesheet to an Inline XBRL 1.1 document to produce a well formed HTML document, e.g. xsltproc removieix.xsl [INPUT].htm -->
<!-- contributed utility for offline use -->
<!-- Created by staff of the U.S. Securities and Exchange Commission.
Data and content created by government employees within the scope of their employment 
are not subject to domestic copyright protection. 17 U.S.C. 105.-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" exclude-result-prefixes="">
  <xsl:param name="ix">http://www.xbrl.org/2013/inlineXBRL</xsl:param>
  <xsl:output indent="yes" method="xml" omit-xml-declaration="yes"/>
  <xsl:template match="*[starts-with(namespace-uri(), 'http://www.xbrl.org/')]">
    <xsl:choose>
      <xsl:when test="local-name()='header'"/>
      <xsl:when test="contains(namespace-uri(),'inlineXBRL')">
        <xsl:apply-templates select="text() | *"/>
      </xsl:when>
      <xsl:otherwise/>
    </xsl:choose>
  </xsl:template>
  <xsl:template match="@* | text()">
    <!-- keep text and attributes -->
    <xsl:copy/>
  </xsl:template>
  <xsl:template match="node()" priority="-10">
    <!-- Keep everything else -->
    <xsl:element name="{local-name()}">
      <xsl:apply-templates select="@* | node()"/>
    </xsl:element>
  </xsl:template>
</xsl:stylesheet>
