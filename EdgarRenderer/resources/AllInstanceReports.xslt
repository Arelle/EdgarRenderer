<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns="http://www.w3.org/1999/xhtml" version="1.0">
  <xsl:output encoding="UTF-8" indent="yes" method="html" doctype-public="-//W3C//DTD HTML 4.01 Transitional//EN"/>
  <xsl:param name="xslt">http://www.sec.gov/include/InstanceReport.xslt</xsl:param>
  <xsl:key name="keyParent" match="Report" use="ParentRole"/>
  <xsl:variable name="majorversion" select="substring-before(/FilingSummary/Version,'.')"/>
  <xsl:variable name="nreports" select="count(/FilingSummary/MyReports/Report)"/>
  <xsl:template match="FilingSummary">
    <html>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <meta http-equiv="Cache-Control" content="no-cache"/>
        <title>All Instance Reports</title>
        <link rel="stylesheet" type="text/css" href="report.css"/>
      </head>
      <body style="margin: 0">
	<xsl:for-each select="/FilingSummary/MyReports/Report">
	   <xsl:variable name="rFile" select="HtmlFileName"/>
	   <xsl:copy-of select="document($rFile)/body/table"/>
	</xsl:for-each>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
