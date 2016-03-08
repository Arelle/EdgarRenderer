<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
  <xsl:output method="html"/>
  <!-- set asPage='true' to wrap in html header with link to css -->
  <xsl:param name="asPage"/>
  <xsl:variable name="majorversion" select="substring-before(/FilingSummary/Version,'.')"/>
  <xsl:variable name="lower">abcdefghijklmnopqrstuvwxyz</xsl:variable>
  <xsl:variable name="upper">ABCDEFGHIJKLMNOPQRSTUVWXYZ</xsl:variable>
  <xsl:template name="style">
    <style type="text/css">
      .info{ }
      .erro{ background-color:pink; }
      .warn{ background-color:lemonchiffon; }
    </style>
  </xsl:template>
  <xsl:template match="/FilingSummary">
    <xsl:choose>
      <xsl:when test="translate(substring($asPage,1,4),$upper,$lower) != 'true'">
        <xsl:apply-templates select="Logs"/>
      </xsl:when>
      <xsl:otherwise>
        <html>
          <head>
            <title>Rendering Log</title>
            <xsl:call-template name="style"/>
            <link rel="stylesheet" type="text/css" href="report.css"/>
          </head>
          <body>
            <xsl:apply-templates select="Logs"/>
          </body>
        </html>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  <xsl:template match="Logs">
    <table class="report" border="0" cellspacing="2">
      <tr>
        <th class="Info">The rendering log information below will not appear on the EDGAR web site.</th>
      </tr>
      <xsl:variable name="type" select="translate(substring(@type,1,4),$upper,$lower)"/>
      <xsl:apply-templates select="Log[translate(substring(@type,1,4),$upper,$lower)='erro']"/>
      <xsl:apply-templates select="Log[translate(substring(@type,1,4),$upper,$lower)='warn']"/>
      <xsl:apply-templates select="Log[translate(substring(@type,1,4),$upper,$lower)='info']"/>
    </table>
  </xsl:template>
  <xsl:template match="Log">
    <tr class="ro">
      <td>
        <xsl:attribute name="class">text <xsl:value-of select="translate(substring(@type,1,4),$upper,$lower)"/></xsl:attribute>
        <xsl:value-of select="concat(@type,': ')"/>
        <!-- In version 3 output, look in the error message for the pattern '' 
          followed by a shortName followed by '' and
          if found, turn that into a hyperlink back to the offending Report -->
        <xsl:variable name="dq">''</xsl:variable>
        <xsl:variable name="p1" select="substring-before(.,$dq)"/>
        <xsl:variable name="p2" select="substring-after(.,$dq)"/>
        <xsl:variable name="p3" select="substring-before($p2,$dq)"/>
        <xsl:variable name="p4" select="substring-after($p2,$dq)"/>
        <xsl:variable name="pos" select="(//Report[ShortName=$p3])[1]/Position"/>
        <xsl:choose>
          <xsl:when test="$pos > 0">
            <xsl:value-of select="$p1"/>
            <xsl:element name="a">
              <xsl:attribute name="href">
                <xsl:text>javascript:loadReport(</xsl:text>
                <xsl:value-of select="$pos"/>
                <xsl:text>);</xsl:text>
              </xsl:attribute>
              <xsl:value-of select="$p3"/>
            </xsl:element>
            <xsl:value-of select="$p4"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="." disable-output-escaping="no"/>
          </xsl:otherwise>
        </xsl:choose>
      </td>
    </tr>
  </xsl:template>
</xsl:stylesheet>
