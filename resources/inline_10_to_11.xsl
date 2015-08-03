<?xml version="1.0" encoding="UTF-8"?>
<!-- Convert an Inline XBRL 1.0 document to XBRL 1.1. -->
<!-- Created by staff of the U.S. Securities and Exchange Commission. -->
<!-- Data and content created by government employees within the scope of their employment are not subject to domestic copyright protection. 17 U.S.C. 105. -->
<stylesheet version="2.0" xmlns="http://www.w3.org/1999/XSL/Transform"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <!-- The presence of @schemaLocation or @version in an input <html> confuses some processors, so they are removed from the output by default. -->
  <!-- Set keep-schema-location to true to preserve them. -->
  <param name="keep-schema-location">false</param>
  <variable name="ix0">http://www.xbrl.org/2008/inlineXBRL</variable>
  <variable name="ix1">http://www.xbrl.org/2013/inlineXBRL</variable>
  <output encoding="US-ASCII" indent="yes" method="xml" standalone="no"
  />   
  <template match="@*|text()">    
    <copy/>
  </template>
  <template match="*[local-name()='resources']">
    <element name="resources" namespace="{$ix1}">
      <apply-templates select="@*|node()"/>
      <apply-templates select="//*[namespace-uri()=$ix0]" mode="relationships"/>
    </element>
  </template>
  <template match="node()" priority="-1">
    <variable name="this" select="generate-id()"/>
    <variable name="ns" select="if (namespace-uri()=$ix0) then $ix1 else namespace-uri()"/>
    <variable name="notxbrl" select="namespace-uri() != $ix0
      and not(starts-with(namespace-uri(),'http://xbrl.org'))
      and not(starts-with(namespace-uri(),'http://www.xbrl.org'))
      "/>
    <element name="{local-name()}" namespace="{$ns}">
      <if test="local-name()='explicitMember' or local-name()='measure'
        and contains(.,':') 
        and not(substring-before(.,':')='') 
        and not(contains(.,' '))
        and not (contains(.,'/'))">
        <variable name="qname" select="resolve-QName(.,/*[1])"/>
        <namespace name="{substring-before(.,':')}" 
          select="namespace-uri-from-QName($qname)"/>
      </if>
      <namespace name="ix" select="$ix1"/>      
      <choose>
        <when test="$notxbrl = true()"/>
        <otherwise>
          <if test="@footnoteID">
            <attribute name="id" select="@footnoteID"/>
          </if>
          <if test="@footnoteRefs">
            <attribute name="id" select="$this"/>
          </if>
        </otherwise>
      </choose> 
      <for-each select="@*">
        <choose>
          <when test="local-name()='schemaLocation' and not($keep-schema-location = 'true')"/>
          <when test="local-name()='version' and not($keep-schema-location = 'true')"/>
          <when test="local-name()='schemaLocation'
            and contains(.,'http://www.xbrl.org/2008/inlineXBRL/xhtml-inlinexbrl-1_0.xsd')
            ">
            <attribute name='schemaLocation' namespace="http://www.w3.org/2001/XMLSchema-instance">
              <value-of 
              select="replace(.,'2008/inlineXBRL/xhtml-inlinexbrl-1_0.xsd'
              ,'2013/inlineXBRL/xhtml-inlinexbrl-1_1.xsd')"/>
            </attribute>
          </when>
          <when test="local-name()='version'
            and contains(.,'DTD XHTML Inline XBRL 1.0')
            ">
            <attribute name='version' namespace="">
              <value-of select="replace(.,'DTD XHTML Inline XBRL 1.0','DTD XHTML Inline XBRL 1.1')" />
            </attribute>              
          </when>
          <when test="$notxbrl = true()"><copy/></when>
          <when test="local-name()='footnoteRefs'"></when>
          <when test="local-name()='footnoteID'"></when>
          <when test="contains(.,':') 
            and not(substring-before(.,':')='') 
            and not(contains(.,' '))
            and not (contains(.,'/'))">
            <variable name="qname" select="resolve-QName(.,/*[1])"/>
            <namespace name="{substring-before(.,':')}" 
              select="namespace-uri-from-QName($qname)"/>
            <copy/>
          </when>
          <otherwise>
            <copy/> 
          </otherwise>
        </choose>               
      </for-each>
      <apply-templates select="node()"/>
    </element>      
  </template>
  <template match="*[namespace-uri()=$ix0]" mode="relationships">
    <variable name="this" select="generate-id()"/>
    <variable name="ns" select="if (namespace-uri()=$ix0) then $ix1 else namespace-uri()"/>
        <for-each select="tokenize(@footnoteRefs,' ')">            
          <element name="relationship" namespace="{$ix1}">
            <attribute name="fromRefs" select="$this"/>
            <attribute name="toRefs" select="."/>
          </element>
        </for-each>
  </template>
</stylesheet>