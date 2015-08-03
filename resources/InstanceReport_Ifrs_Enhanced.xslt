<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:param name="asPage" />
	<xsl:param name="numberDecimalSeparator" select=" '.' " xml:space="preserve" />
	<xsl:param name="numberGroupSeparator" select=" ',' "  xml:space="preserve" />
	<xsl:param name="numberGroupSize" select=" '3' " />
	<xsl:param name="showFlags" />
	<xsl:param name="source" />
	<xsl:param name="otherStandardPrefix">ifrs_</xsl:param>
    <xsl:param name="memberDetails">true</xsl:param>
	<!-- v2.3.0.3 -->
	<xsl:decimal-format name="currency" digit="D" />
	<xsl:output method="html" omit-xml-declaration="yes" />
	<xsl:preserve-space elements="label" />
	<!-- v3.0.0.20140814 -->
	<xsl:variable name="majorversion" select="substring-before(/InstanceReport/Version,'.')"/>
	<xsl:key name="keyElement" match="Row" use="ElementName"/>	
	<xsl:template match="/">
		<xsl:choose>
			<xsl:when test="$asPage = 'true'">
				<html>
					<head>
					    <title></title>
						<link rel="stylesheet" type="text/css" href="report.css" />
						<script type="text/javascript" src="Show.js">/* Do Not Remove This Comment */</script>
						
						<script type="text/javascript">
							function toggleNextSibling (e) {
							if (e.nextSibling.style.display=='none') {
							e.nextSibling.style.display='block';
							} else {
							e.nextSibling.style.display='none';
							}
							}</script>
					</head>
					<body>

						<!-- GET VIEW -->
						<xsl:apply-templates select="InstanceReport" />

					</body>
				</html>
			</xsl:when>
			<xsl:otherwise>

				<!-- GET VIEW -->
				<xsl:apply-templates select="InstanceReport" />

			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	<xsl:template name="notify">
		<xsl:param name="pos" />
		<xsl:param name="type" />
		
		<xsl:if test="count(../../Rows/Row[not(FootnoteIndexer='')]) &gt; 1">0|</xsl:if>
		
		<xsl:if test="$type = '-1' or $type = 0">
			<xsl:if test="not( '' = FootnoteIndexer )"><xsl:value-of select="Id" />|</xsl:if>
		</xsl:if>

		<xsl:if test="$type = '1' or $type = 0">
			<xsl:for-each select="../../Rows/Row/Cells/Cell[ Id = $pos and not( FootnoteIndexer = '' ) ]"><xsl:if test="position() = 1"><xsl:value-of select="Id" />|</xsl:if></xsl:for-each>
		</xsl:if>
			
	</xsl:template>

	<xsl:template match="InstanceReport">
		<!-- if the columns, rows or cells have FootnoteIndexer -->
		<xsl:variable name="hasFootnotes" select="count((Columns/Column | Rows | Rows/Row/Cells/Cell)[not(''=FootnoteIndexer)]) &gt; 0" />

		<xsl:variable name="anyWithNotes">
			<xsl:if test="$hasFootnotes">|<xsl:for-each select="Columns/Column"><xsl:call-template name="notify"><xsl:with-param name="pos" select="Id" /><xsl:with-param name="type" select="0" /></xsl:call-template></xsl:for-each></xsl:if>
		</xsl:variable>
		
		<xsl:variable name="colsWithNotes">
			<xsl:if test="$hasFootnotes">|<xsl:for-each select="Columns/Column"><xsl:call-template name="notify"><xsl:with-param name="pos" select="Id" /><xsl:with-param name="type" select="1" /></xsl:call-template></xsl:for-each></xsl:if>
		</xsl:variable>

		<xsl:variable name="headsWithNotes">
			<xsl:if test="$hasFootnotes">|<xsl:for-each select="Columns/Column"><xsl:call-template name="notify"><xsl:with-param name="pos" select="Id" /><xsl:with-param name="type" select="-1" /></xsl:call-template></xsl:for-each></xsl:if>
		</xsl:variable>

		<xsl:variable name="idx" select="1" />
		<xsl:variable name="isBarChartTable" select="string-length( ../BarChartImageFileName ) = 0" />
		<xsl:variable name="isOuterReport" select=". = /InstanceReport" />
		<xsl:variable name="rounding" select="string-length( RoundingOption ) &gt; 0" />

		<xsl:if test="$isOuterReport">
			<span style="display: none;">v<xsl:value-of select="Version" /></span>
		</xsl:if>

		<xsl:choose>
			<xsl:when test="$isBarChartTable">

				<table class="report" border="0" cellspacing="2">
					<xsl:if test="$isOuterReport">
						<xsl:attribute name="id">
							<xsl:value-of select="generate-id( ReportName )" />
						</xsl:attribute>
					</xsl:if>

					<!-- write the column headers -->
					<xsl:if test="not( HasEmbeddedReports = 'true' )">
						<xsl:call-template name="viewHead">
							<xsl:with-param name="colsWithNotes" select="$anyWithNotes" />
							<xsl:with-param name="hasFootnotes" select="$hasFootnotes" />
							<xsl:with-param name="idx"          select="$idx" />
							<xsl:with-param name="rounding"     select="$rounding" />
						</xsl:call-template>
					</xsl:if>

					<!--
				<tr>
					<td style="background-color: black; color: white;">[<xsl:value-of select="$colsWithNotes" />]</td>
				</tr>
	-->

					<!-- write the table -->
					<xsl:call-template name="viewBody">
						<xsl:with-param name="colsWithNotes" select="$colsWithNotes" />
						<xsl:with-param name="headsWithNotes" select="$headsWithNotes" />

						<xsl:with-param name="hasFootnotes" select="$hasFootnotes" />
						<xsl:with-param name="idx"            select="$idx" />
						<xsl:with-param name="rounding"        select="$rounding" />
					</xsl:call-template>

					<!-- if this report is not embedded write the footnotes on the inside -->
					<xsl:if test="$isOuterReport">
						<xsl:call-template name="innerFootnotes">
							<xsl:with-param name="colsWithNotes" select="$anyWithNotes" />
						</xsl:call-template>
					</xsl:if>
				</table>

				<!-- if this report is embedded write the footnotes on the outside -->
				<xsl:if test="not( $isOuterReport )">
					<xsl:call-template name="outerFootnotes">
					  <xsl:with-param name="colsWithNotes" select="$anyWithNotes"/>
					</xsl:call-template>
				</xsl:if>

				<!-- write the definition and reference lookup table -->
				<xsl:if test="$isOuterReport">
					<div style="display: none;">
						<xsl:for-each select="//Row[generate-id(.)=generate-id(key('keyElement',ElementName)[1])]">
							<xsl:sort order="ascending" select="ElementName"/>
							<xsl:if test="string-length(ElementName) &gt; 0">
								<xsl:call-template name="authRefData" />
							</xsl:if>
						</xsl:for-each>
					  <xsl:if test="$memberDetails='true'">
					  <xsl:for-each select="//Row[ string-length( .//Label[@Id=0]/@Key) &gt; 0 and not(.//Label[@Id=0]/@Key = following::Row/.//Label[@Id=0]/@Key ) ]">
					    <xsl:sort order="ascending" select=".//Label[@Id=0]/@Key"/>
					    <xsl:call-template name="authRefData">
					      <xsl:with-param name="Name" select="translate(.//Label[@Id=0]/@Key,':','=')"/>
					    </xsl:call-template>
					  </xsl:for-each>
					  </xsl:if>
					</div>
				</xsl:if>

			</xsl:when>
			<xsl:otherwise>

			<xsl:variable name="localPath"><xsl:call-template name="basename">
				<xsl:with-param name="path" select="../BarChartImageFileName" />
			</xsl:call-template></xsl:variable>

				<img alt="Bar Chart" src="{$source}{$localPath}" />

				<!-- if this report is embedded write the footnotes on the outside -->
				<xsl:call-template name="outerFootnotes">
					<xsl:with-param name="colsWithNotes" select="$anyWithNotes" />
				</xsl:call-template>

			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>



	<xsl:template name="viewHead">
		<xsl:param name="colsWithNotes" />
		<xsl:param name="hasFootnotes" />
		<xsl:param name="idx" />
		<xsl:param name="rounding" />

		<xsl:variable name="displayLabelColumn" select="string-length( DisplayLabelColumn ) = 0 or DisplayLabelColumn = 'true'" />

		<tr>
			<xsl:variable name="rowSpan" select="1 + ( count( Columns/Column[ Labels/Label[ $idx ][ contains( @Label, ' Ended' ) ] ] ) &gt; 0 )" />

			<xsl:if test="$displayLabelColumn">
				<xsl:variable name="hasLabelFootnotes" select="count( Rows/Row[ string-length( FootnoteIndexer ) &gt; 0 ] )" />

				<th class="tl">
				<xsl:attribute name="colspan"><xsl:value-of select="1 + ( $hasLabelFootnotes &gt; 0 )" /></xsl:attribute>
					
					<xsl:choose>
						<xsl:when test="ShowElementNames = 'true'">Label</xsl:when>
						<xsl:otherwise>
					<xsl:attribute name="rowspan"><xsl:value-of select="$rowSpan" /></xsl:attribute>

					<div style="width: 200px;"><strong>
						<xsl:value-of select="ReportName"/>
									<br />

									<xsl:if test="$rounding">
										<xsl:value-of select="RoundingOption" />
									</xsl:if>

					</strong></div>
				</xsl:otherwise>
					</xsl:choose>
				</th>
			</xsl:if>

			<xsl:if test="ShowElementNames = 'true'">
				<th class="tl">
					<strong>Element</strong>
				</th>
			</xsl:if>

			<xsl:call-template name="promoMgr">
				<xsl:with-param name="colsWithNotes" select="$colsWithNotes" />
				<xsl:with-param name="hasFootnotes" select="$hasFootnotes" />
				<xsl:with-param name="idx"          select="$idx" />
			</xsl:call-template>
		</tr>

		<xsl:if test="string-length( ShowElementNames ) = 0 or ShowElementNames != 'true'">
			<xsl:if test="count( Columns/Column[ Labels/Label[ $idx ][ contains( @Label, ' Ended' ) ] ] ) &gt; 0">
				<tr>
					<xsl:for-each select="Columns/Column[ not( LabelColumn = 'true' )]">

						<xsl:call-template name="header">
							<xsl:with-param name="colsWithNotes" select="$colsWithNotes" />
							<xsl:with-param name="position"     select="Id" />
						</xsl:call-template>

					</xsl:for-each>
				</tr>
			</xsl:if>
		</xsl:if>

	</xsl:template>



	<xsl:template name="promoMgr">
		<xsl:param name="colsWithNotes" />
		<xsl:param name="hasFootnotes" />
		<xsl:param name="idx" />

		<xsl:choose>
			<xsl:when test="ShowElementNames = 'true'">
				<xsl:for-each select="Columns/Column">
					<th class="th">
						<xsl:attribute name="colspan">
							<xsl:call-template name="colCount">
								<xsl:with-param name="colsWithNotes" select="$colsWithNotes" />
								<xsl:with-param name="hasFootnotes"  select="$hasFootnotes" />
								<xsl:with-param name="idx"           select="$idx" />
								<xsl:with-param name="position"      select="position()" />
								<xsl:with-param name="thisLabel"     select="Labels/Label[$idx]/@Label" />
							</xsl:call-template>
						</xsl:attribute>

						<xsl:text>Value</xsl:text>
					</th>
				</xsl:for-each>
			</xsl:when>
			<xsl:when test="count( Columns/Column[ Labels/Label[ $idx ][ contains( @Label, ' Ended' ) ] ] ) &gt; 0">

				<xsl:for-each select="Columns/Column">
					<xsl:if test="not( Labels/Label[$idx]/@Label = preceding-sibling::Column[1]/Labels/Label[$idx]/@Label )">

						<th class="th">
							<xsl:attribute name="colspan">
								<xsl:call-template name="colCount">
									<xsl:with-param name="colsWithNotes" select="$colsWithNotes" />
									<xsl:with-param name="hasFootnotes"  select="$hasFootnotes" />
									<xsl:with-param name="idx"           select="$idx" />
									<xsl:with-param name="position"      select="position()" />
									<xsl:with-param name="thisLabel"     select="Labels/Label[$idx]/@Label" />
								</xsl:call-template>
							</xsl:attribute>

							<xsl:if test="count( Labels/Label[$idx][ contains( @Label, ' Ended' ) ] ) &gt; 0">
								<xsl:value-of select="Labels/Label[$idx]/@Label" />
							</xsl:if>
						</th>

					</xsl:if>
				</xsl:for-each>

			</xsl:when>
			<xsl:otherwise>

				<xsl:for-each select="Columns/Column">
					<xsl:call-template name="header">
						<xsl:with-param name="colsWithNotes" select="$colsWithNotes" />
						<xsl:with-param name="position" select="Id" />
					</xsl:call-template>
				</xsl:for-each>

			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>



	<xsl:template name="colCount">
		<xsl:param name="colsWithNotes" />
		<xsl:param name="hasFootnotes" />
		<xsl:param name="idx" />
		<xsl:param name="position" />
		<xsl:param name="thisLabel" />

		<xsl:variable name="numCols">
			<xsl:call-template name="countContiguous">
				<xsl:with-param name="idx" select="$idx" />
				<xsl:with-param name="position" select="$position" />
				<xsl:with-param name="thisLabel" select="$thisLabel" />
			</xsl:call-template>
		</xsl:variable>

		<xsl:variable name="numIndices">
			<xsl:choose>
				<xsl:when test="$hasFootnotes">
					<xsl:call-template name="countIndices">
						<xsl:with-param name="colsWithNotes" select="$colsWithNotes" />
						<xsl:with-param name="numCols"         select="$numCols" />
						<xsl:with-param name="position"     select="$position" />
					</xsl:call-template>
				</xsl:when>

				<xsl:otherwise>0</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>

		<xsl:value-of select="$numCols + $numIndices" />

	</xsl:template>



	<xsl:template name="countContiguous">
		<xsl:param name="idx" />
		<xsl:param name="position" />
		<xsl:param name="thisLabel" />

		<xsl:choose>
			<xsl:when test="count( following-sibling::Column[ labelColumn = 'true' or not( Labels/Label[$idx]/@Label = $thisLabel ) ] ) &gt; 0">

				<xsl:for-each select="following-sibling::Column[ labelColumn = 'true' or not( Labels/Label[$idx]/@Label = $thisLabel )  ]">
					<xsl:if test="position() = 1">
						<xsl:value-of select="count( preceding-sibling::Column[ position() &gt;= $position ] )" />
					</xsl:if>
				</xsl:for-each>

			</xsl:when>
			<xsl:otherwise>

				<xsl:value-of select="count( following-sibling::Column/Labels/Label[$idx][ @Label = $thisLabel ] ) + 1" />

			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>



	<xsl:template name="countIndices">
		<xsl:param name="colsWithNotes" />
		<xsl:param name="numCols" />
		<xsl:param name="position" />

		<xsl:for-each select="../../Rows/Row">
			<xsl:sort order="descending" select="count( Cells/Cell[
                position() &gt;= $position            and
                position() &lt;  $position + $numCols and
                contains( $colsWithNotes, concat( '|', Id, '|' ) )
            ] )"/>
			<xsl:if test="position() = 1">
				<xsl:value-of select="count( Cells/Cell[
                        position() &gt;= $position            and
                        position() &lt;  $position + $numCols and
                        contains( $colsWithNotes, concat( '|', Id, '|' ) )
                ] )"/>
			</xsl:if>
		</xsl:for-each>

	</xsl:template>



	<xsl:template name="header">
		<xsl:param name="colsWithNotes" />
		<xsl:param name="position" />

		<!-- is there a footnote anywhere in this column? -->
		<xsl:variable name="hasFootnoteColumn" select="contains( $colsWithNotes, concat( '|', $position, '|' ) )" />

		<!-- if so, is there a footnote on THIS column header? -->
		<xsl:variable name="hasFootnoteHeader" select="$hasFootnoteColumn and string-length( FootnoteIndexer ) &gt; 0" />

		<th class="th">
			<xsl:if test="$hasFootnoteColumn and not( $hasFootnoteHeader )">
				<xsl:attribute name="colspan">2</xsl:attribute>
			</xsl:if>

			<xsl:choose>
				<xsl:when test="../../ShowElementNames = 'true'">Value</xsl:when>
				<xsl:otherwise>

				<xsl:for-each select="Labels/Label[ not( contains( @Label, ' Ended' ) ) ]">
					<div>
						<xsl:value-of select="@Label" /><xsl:if test="not( position() = last() )"><xsl:value-of select="../../LabelSeparator" /></xsl:if>
					</div>
				</xsl:for-each>

				</xsl:otherwise>
			</xsl:choose>
		</th>

		<xsl:if test="$hasFootnoteHeader">
		<th class="th">
			<sup><xsl:value-of select="FootnoteIndexer" /></sup>
		</th>
		</xsl:if>
	</xsl:template>



	<xsl:template name="viewBody">
		<xsl:param name="colsWithNotes" />
		<xsl:param name="headsWithNotes" />

		<xsl:param name="hasFootnotes" />
		<xsl:param name="idx" />
		<xsl:param name="rounding" />

		<xsl:variable name="labelPosition" />
		<xsl:variable name="showElementNames" select="ShowElementNames = 'true'" />
		<xsl:variable name="displayLabelColumn" select="string-length( DisplayLabelColumn  ) = 0 or DisplayLabelColumn = 'true'" />
		<xsl:variable name="hasLabelFootnotes" select="count( Rows/Row[ string-length( FootnoteIndexer ) &gt; 0 ] )" />
		<xsl:for-each select="Rows/Row">

			<xsl:choose>
				<xsl:when test="IsReportTitle = 'true'"></xsl:when>
				<xsl:when test="Id = 1 and IsSegmentTitle = 'true' and contains( ReportName, Label )"></xsl:when>
				<xsl:otherwise>

					<tr>
						<xsl:call-template name="rowStyle" />
            <xsl:variable name="custom">
              <xsl:choose>
              <xsl:when test="IsSegmentTitle='true'"/>
              <xsl:when test="IsAbstractGroupTitle='true'"/>
                <xsl:when test="ElementPrefix='us-gaap_'"/>
                <xsl:when test="ElementPrefix='dei_'"/>
                <xsl:when test="ElementPrefix='invest_'"/>
                <xsl:when test="ElementPrefix='rr_'"/>
              	<xsl:when test="ElementPrefix=$otherStandardPrefix"/>
                <xsl:otherwise>custom</xsl:otherwise>
              </xsl:choose>
            </xsl:variable>
						<xsl:if test="$displayLabelColumn">
							<td class="pl {$custom}" style="border-bottom: 0px;"  valign="top">
							  <xsl:call-template name="authRefLink" />
							</td>
							<xsl:if test="$hasLabelFootnotes &gt; 0">
				<td class="th" style="border-bottom: 0px;">
					<sup><xsl:value-of select="FootnoteIndexer" /></sup>
				</td>
							</xsl:if>
						</xsl:if>

						<xsl:if test="$showElementNames">
							<td class="th" style="border-bottom: 0px;">
								<xsl:value-of select="ElementName" />
							</td>
						</xsl:if>

						<xsl:call-template name="perCell">
							<xsl:with-param name="colsWithNotes" select="$colsWithNotes" />
							<xsl:with-param name="headsWithNotes" select="$headsWithNotes" />


							<xsl:with-param name="hasFootnotes" select="$hasFootnotes" />
							<xsl:with-param name="labelPosition" select="$labelPosition" />
							<xsl:with-param name="rounding"     select="$rounding" />
						</xsl:call-template>

					</tr>

				</xsl:otherwise>
			</xsl:choose>

			<xsl:if test="IsSubReportEnd = 'true' and not( position() = last() ) and not( following-sibling::Row[1]/IsSegmentTitle = 'true' )">
				<xsl:call-template name="reportBreak">
					<xsl:with-param name="colsWithNotes" select="$colsWithNotes" />
					<xsl:with-param name="labelPosition" select="$labelPosition" />
				</xsl:call-template>
			</xsl:if>
		</xsl:for-each>

	</xsl:template>



	<xsl:template name="reportBreak">
		<xsl:param name="colsWithNotes" />
		<xsl:param name="labelPosition" />

		<xsl:variable name="idxs" select="count( Columns/Column[ contains( $colsWithNotes, concat( '|', Id, '|' ) ) ] )" />
		<xsl:variable name="cols" select="count( Columns/Column )" />

		<tr>
			<td colspan="{ $cols + $idxs + 1 }" style="height: 1em;"><hr /></td>
		</tr>
	</xsl:template>



	<xsl:template name="rowStyle">
				<xsl:attribute name="class">
						<xsl:choose>
								<xsl:when test="IsReportTitle = 'true' or IsSegmentTitle = 'true'">rh</xsl:when>
								<xsl:when test="IsCalendarTitle = 'true'">rc</xsl:when>
								<xsl:when test="((position() + 1) mod 2 = 0)">re<xsl:if test="IsTotalLabel = 'true'">u</xsl:if></xsl:when>
								<xsl:otherwise>ro<xsl:if test="IsTotalLabel = 'true'">u</xsl:if></xsl:otherwise>
						</xsl:choose>
						<xsl:if test="$showFlags = 'true' and @FlagID > 0"> Flag<xsl:value-of select="@FlagID" /></xsl:if>
				</xsl:attribute>
	</xsl:template>

	<xsl:template name="authRefLink">
		<xsl:choose>
		  <xsl:when test="not(../../../IsTransposed = 'true') and $memberDetails='true' and string-length(.//Label[@Id=0]/@Key)> 0">
		    <a class="a" href="javascript:void(0);" onclick="top.Show.showAR( this, 'defref_{translate(.//Label[@Id=0]/@Key,':','=')}', window );">		      
		      <xsl:choose>
		        <xsl:when test="IsAbstractGroupTitle = 'true'">
		          <strong><xsl:value-of select="normalize-space( Label )" /></strong>
		        </xsl:when>
		        <xsl:otherwise>
		          <xsl:value-of select="normalize-space( Label )" />
		        </xsl:otherwise>
		      </xsl:choose>		      
		    </a>
		  </xsl:when>
		  <xsl:when test="../../../IsTransposed = 'true' or IsReportTitle = 'true' or string-length( ElementName ) = 0">
				<div class="a">
						<xsl:if test="Level != '0'">
							<xsl:attribute name="style">margin-left: <xsl:value-of select="Level" />em;</xsl:attribute>
						</xsl:if>
				  <xsl:choose>
						<xsl:when test="IsAbstractGroupTitle = 'true'">
							<strong><xsl:value-of select="normalize-space( Label )" /></strong>
						</xsl:when>
						<xsl:otherwise>
							<xsl:value-of select="normalize-space( Label )" />
						</xsl:otherwise>
					</xsl:choose>
				</div>
			</xsl:when>
			<xsl:otherwise>
			  <a class="a" href="javascript:void(0);" onclick="top.Show.showAR( this, 'defref_{ElementName}', window );">			    
				<xsl:choose>
						<xsl:when test="IsAbstractGroupTitle = 'true'">
							<strong><xsl:value-of select="normalize-space( Label )" /></strong>
						</xsl:when>
						<xsl:otherwise>
							<xsl:value-of select="normalize-space( Label )" />
						</xsl:otherwise>
					</xsl:choose>
			  </a>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	<xsl:template name="authRefData">
	    <xsl:param name="Name" select="ElementName"/>
		<xsl:variable name="tmp">
					Details
		</xsl:variable>

		<xsl:variable name="first" select="normalize-space( $tmp )" />

		<table border="0" cellpadding="0" cellspacing="0" class="authRefData" style="display: none;">
			<xsl:attribute name="id">defref_<xsl:value-of select="$Name" /></xsl:attribute>
			<tr>
				<td class="hide">
					<a style="color: white;" href="javascript:void(0);" onclick="top.Show.hideAR();">X</a>
				</td>
			</tr>
			<tr>
				<td>
					<div class="body" style="padding: 2px;">
						<xsl:if test="string-length( ElementDefenition ) &gt; 0 and not( ElementDefenition = 'No definition available.' )">
							<a href="javascript:void(0);" onclick="top.Show.toggleNext( this );">
								<xsl:choose>
									<xsl:when test="$first = 'ElementDefenition'">- Definition</xsl:when>
									<xsl:otherwise>+ Definition</xsl:otherwise>
								</xsl:choose>
							</a>
							<div>
								<xsl:if test="not( $first = 'ElementDefenition' )">
									<xsl:attribute name="style">display: none;</xsl:attribute>
								</xsl:if>

							<p><xsl:value-of select="ElementDefenition" /></p>
						</div>
						</xsl:if>

						<xsl:if test="string-length( ElementReferences ) &gt; 0 and not( ElementReferences = 'No authoritative reference available.' )">
							<a href="javascript:void(0);" onclick="top.Show.toggleNext( this );">
								<xsl:choose>
									<xsl:when test="$first = 'ElementReferences'">- References</xsl:when>
									<xsl:otherwise>+ References</xsl:otherwise>
								</xsl:choose>
							</a>
							<div>
								<xsl:if test="not( $first = 'ElementReferences' )">
									<xsl:attribute name="style">display: none;</xsl:attribute>
								</xsl:if>

								<p>
									<xsl:call-template name="nl2br">
										<xsl:with-param name="content" select="ElementReferences" />
									</xsl:call-template>
								</p>
							</div>
						</xsl:if>

						<a href="javascript:void(0);" onclick="top.Show.toggleNext( this );">
							<xsl:choose>
								<xsl:when test="$first = 'Details'">- Details</xsl:when>
								<xsl:otherwise>+ Details</xsl:otherwise>
							</xsl:choose>
						</a>
						<div>
							<xsl:if test="not( $first = 'Details' )">
								<xsl:attribute name="style">display: none;</xsl:attribute>
							</xsl:if>

							<table border="0" cellpadding="0" cellspacing="0">
								<tr>
									<td>
										<strong> Name:</strong>
									</td>
									<td style="white-space:nowrap;">									
											<xsl:value-of select="$Name" />										
									</td>
								</tr>
								<tr>
								  <td style="padding-right: 4px;white-space:nowrap;">										
											<strong> Namespace Prefix:</strong>										
									</td>
									<td>
										<xsl:value-of select="ElementPrefix" />
									</td>
								</tr>
								<tr>
									<td>
										<strong> Data Type:</strong>
									</td>
									<td>
										<xsl:value-of select="ElementDataType" />
									</td>
								</tr>
								<tr>
									<td>
										<strong> Balance Type:</strong>
									</td>
									<td>
										<xsl:value-of select="BalanceType" />
									</td>
								</tr>
								<tr>
									<td>
										<strong> Period Type:</strong>
									</td>
									<td>
										<xsl:value-of select="PeriodType" />
									</td>
								</tr>
							</table>
						</div>
					</div>
				</td>
			</tr>
		</table>
	</xsl:template>




	<xsl:template name="perCell">
		<xsl:param name="colsWithNotes" />
		<xsl:param name="headsWithNotes" />

		<xsl:param name="hasFootnotes" />
		<xsl:param name="labelPosition" />
		<xsl:param name="rounding" />

		<xsl:for-each select="Cells/Cell">
			<td>
				<xsl:if test="contains( $headsWithNotes, concat( '|', Id, '|' ) ) and not( contains( $colsWithNotes, concat( '|', Id, '|' ) ) )">
					<xsl:attribute name="colspan">2</xsl:attribute>
				</xsl:if>

				<xsl:choose>
					<xsl:when test="EmbeddedReport/InstanceReport">
						<xsl:apply-templates select="EmbeddedReport/InstanceReport" />
					</xsl:when>
					<xsl:when test="IsNumeric = 'false'">

						<xsl:choose>
							<xsl:when test="DisplayDateInUSFormat = 'true'">
								<xsl:attribute name="class">text</xsl:attribute>

								<xsl:if test="string-length( NonNumbericText ) &gt; 0">
									<xsl:call-template name="dateFilters" />
								</xsl:if>
							</xsl:when>
							<xsl:otherwise>
								<xsl:attribute name="class">text</xsl:attribute>
								<xsl:call-template name="textFilters" />
							</xsl:otherwise>
						</xsl:choose>

					</xsl:when>
					<xsl:when test="IsNumeric = 'true'">
						<xsl:choose>
							<xsl:when test="DisplayZeroAsNone = 'true' and NumericAmount = 0">
								<xsl:attribute name="class">nump</xsl:attribute>
								none
							</xsl:when>
							<xsl:otherwise>								
								<xsl:call-template name="setCellClass" />				
							  <xsl:variable name="ColumnId" select="Id"/>
							  <xsl:variable name="tmp">
							    <xsl:value-of select="(ancestor::Row[1])/ElementName"/>
<!--							    <xsl:for-each select="(ancestor::InstanceReport[1])/Columns/Column[Id=$ColumnId]/Labels/Label[not(starts-with(@Key,'Calendar'))]">
							      <xsl:if test="position()=1"><xsl:text>[</xsl:text></xsl:if>
							      <xsl:if test="position()>1"><xsl:text>;</xsl:text></xsl:if>
							      <xsl:value-of select="concat(substring-before(@Key,':'),'=',substring-after(@Key,':'))"/>
							      <xsl:if test="position()=last()"><xsl:text>]</xsl:text></xsl:if>
							    </xsl:for-each>-->
							  	<xsl:for-each select="((ancestor::InstanceReport)[1]/Columns/Column[Id=$ColumnId]/MCU//DimensionInfo)|((ancestor::Row[1])/preceding-sibling::Row[IsSegmentTitle='true'][1]//DimensionInfo)">		
							  		<xsl:sort data-type="text" select="substring-after(dimensionId,'_')"/>
							  		<xsl:if test="position()=1"><xsl:text>[</xsl:text></xsl:if>
							  		<xsl:if test="position()>1"><xsl:text>;</xsl:text></xsl:if>
							  		<xsl:value-of select="concat(dimensionId,'=',Id)"/>
							  		<xsl:if test="position()=last()"><xsl:text>]</xsl:text></xsl:if>
							  	</xsl:for-each>
<!--							  	<xsl:for-each select="(ancestor::Row[1])/preceding-sibling::Row[IsSegmentTitle='true'][1]//DimensionInfo">		
							  		<xsl:if test="position()=1"><xsl:text>[</xsl:text></xsl:if>
							  		<xsl:if test="position()>1"><xsl:text>;</xsl:text></xsl:if>
							  		<xsl:value-of select="concat(';',dimensionId,'=',Id)"/>
							  		<xsl:if test="position()=last()"><xsl:text>]</xsl:text></xsl:if>
							  	</xsl:for-each>--> 
							  </xsl:variable>
							  <a>
							    <xsl:if test="string-length($tmp)>0">
							      <xsl:attribute name="title"><xsl:value-of select="$tmp"/></xsl:attribute>
							      <xsl:attribute name="onclick"><xsl:text>toggleNextSibling(this);</xsl:text></xsl:attribute>
							    </xsl:if>							    
								<xsl:call-template name="numFilters">
									<xsl:with-param name="numeric">
										<xsl:choose>
											<xsl:when test="$rounding">
												<xsl:value-of select="RoundedNumericAmount" />
											</xsl:when>
											<xsl:otherwise>
												<xsl:value-of select="NumericAmount" />
											</xsl:otherwise>
										</xsl:choose>
									</xsl:with-param>
								</xsl:call-template>							   
							  </a>
							  <span style='display:none;white-space:normal;text-align:left;'>
							    <xsl:value-of select="(ancestor::Row[1])/ElementName"/>
<!--							    <xsl:for-each select="(ancestor::InstanceReport[1])/Columns/Column[Id=$ColumnId]/Labels/Label[not(starts-with(@Key,'Calendar'))]">
							      <br/><xsl:text>/ </xsl:text><xsl:value-of select="substring-before(@Key,':')"/>
							      <br/><xsl:text>= </xsl:text><xsl:value-of select="substring-after(@Key,':')"/>
							    </xsl:for-each>-->
							  	<xsl:for-each select="((ancestor::InstanceReport)[1]/Columns/Column[Id=$ColumnId]/MCU//DimensionInfo)|((ancestor::Row[1])/preceding-sibling::Row[IsSegmentTitle='true'][1]//DimensionInfo)">		
							  		<xsl:sort data-type="text" select="substring-after(dimensionId,'_')"/>
							  		<br/><xsl:text>/ </xsl:text>
							  		<xsl:value-of select="dimensionId"/>
							  		<br/><xsl:text>= </xsl:text>
							  		<xsl:value-of select="Id"/>
							  	</xsl:for-each>
<!--							  	<xsl:for-each select="(ancestor::Row[1])/preceding-sibling::Row[IsSegmentTitle='true'][1]//DimensionInfo">		
							  		<br/><xsl:text>/ </xsl:text>
							  		<xsl:value-of select="dimensionId"/>
							  		<br/><xsl:text>= </xsl:text>
							  		<xsl:value-of select="Id"/>
							  	</xsl:for-each>-->
							  </span>
							</xsl:otherwise>
						</xsl:choose>
					</xsl:when>
				</xsl:choose>
				<span> </span>
			</td>

			<xsl:if test="contains( $colsWithNotes, concat( '|', Id, '|' ) )">
				<td class="fn" style="border-bottom: 0px;">
					<xsl:call-template name="indexer" />
				</td>
			</xsl:if>

		</xsl:for-each>
	</xsl:template>



	<xsl:template name="dateFilters">
		<xsl:variable name="year"  select="number( substring-before( NonNumbericText, '-' ) )" />
		<xsl:variable name="month" select="number( substring-before( substring-after( NonNumbericText, '-' ), '-' ) )" />
		<xsl:variable name="day"   select="number( substring-after(  substring-after( NonNumbericText, '-' ), '-' ) )" />

		<xsl:variable name="monthName">
			<xsl:choose>
				<xsl:when test="$month = 1">January</xsl:when>
				<xsl:when test="$month = 2">February</xsl:when>
				<xsl:when test="$month = 3">March</xsl:when>
				<xsl:when test="$month = 4">April</xsl:when>
				<xsl:when test="$month = 5">May</xsl:when>
				<xsl:when test="$month = 6">June</xsl:when>
				<xsl:when test="$month = 7">July</xsl:when>
				<xsl:when test="$month = 8">August</xsl:when>
				<xsl:when test="$month = 9">September</xsl:when>
				<xsl:when test="$month = 10">October</xsl:when>
				<xsl:when test="$month = 11">November</xsl:when>
				<xsl:when test="$month = 12">December</xsl:when>
			</xsl:choose>
		</xsl:variable>

		<xsl:value-of select="substring( $monthName, 1, 3 )" /><xsl:if test="$monthName != 'May'">.</xsl:if>
		<xsl:text> </xsl:text>

		<xsl:choose>
			<xsl:when test="string-length( $day ) = 1">
				0<xsl:value-of select="$day" />,
				<xsl:text> </xsl:text>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="$day" />,
				<xsl:text> </xsl:text>
			</xsl:otherwise>
		</xsl:choose>

		<xsl:value-of select="$year" />
	</xsl:template>



	<xsl:template name="numFilters">
		<!-- the xsl implementations of format-number vary in handling of large numbers, so we don't use it. -->
		<xsl:param name="numeric" />
	  <xsl:if test="ShowCurrencySymbol = 'true'">
	    <!-- the current context is the cell -->
	    <xsl:call-template name="lookupCurrency">
	      <xsl:with-param name="id" select="Id" />
	    </xsl:call-template>
	  </xsl:if>
	  <!-- parse numeric into a 'negative' flag and the entire number -->
	  <xsl:variable name="negative" select="substring($numeric,1,1) = '-'"/>
	  <xsl:variable name="entire">
	    <xsl:choose>
	      <xsl:when test="$negative"><xsl:value-of select="substring($numeric,2)"/></xsl:when>
	      <xsl:otherwise><xsl:value-of select="$numeric"/></xsl:otherwise>
	    </xsl:choose>
	  </xsl:variable>
	  <!-- parse the entire number into (whole)?(\.decimal)? -->
	  <xsl:variable name="decimal" select="substring-after( $entire, '.' )" />
	  <xsl:variable name="whole">
	    <xsl:choose>
	      <xsl:when test="$decimal">
	       <xsl:value-of select="substring-before($entire,'.')"/>
	      </xsl:when>
	      <xsl:otherwise>
	         <xsl:value-of select="$entire"/>
	      </xsl:otherwise>
	    </xsl:choose>			   
	  </xsl:variable>
		<!-- output the value in parts -->
		<xsl:if test="$negative">(</xsl:if>
  		<xsl:choose>
  			<!-- Ratio is always treated as a percentage using format-number -->
  			<xsl:when test="IsRatio = 'true'">
  				<xsl:variable name="absolute" select="number( $entire )" />
  				<xsl:value-of select="format-number( $absolute, '0.00DDD%', 'currency' )" />
  			</xsl:when>
  		  <xsl:otherwise>
  				<xsl:call-template name="numberFormatCulture">
  				  <xsl:with-param name="numberPiece" select="$whole" />
  				</xsl:call-template>
  		    <xsl:if test="string-length($decimal) > 0">
  		      <xsl:value-of select="$numberDecimalSeparator" />
  		      <xsl:value-of select="$decimal" />
  		    </xsl:if>
  			</xsl:otherwise>
  		</xsl:choose>
		<xsl:if test="$negative">)</xsl:if>
	</xsl:template>

	<xsl:template name="numberFormatCulture">
		<xsl:param name="numberPiece" />
		<xsl:variable name="pieceLength" select="string-length( $numberPiece )" />
		<xsl:choose>
			<xsl:when test=" $pieceLength &lt;= $numberGroupSize ">
				<xsl:value-of select="$numberPiece" />
			</xsl:when>
			<xsl:otherwise>
				<xsl:call-template name="numberFormatCulture">
					<xsl:with-param name="numberPiece" select="substring( $numberPiece, 0, ($pieceLength - $numberGroupSize + 1) )" />
				</xsl:call-template>
				<xsl:value-of select="$numberGroupSeparator" />
				<xsl:value-of select="substring( $numberPiece, ($pieceLength - $numberGroupSize + 1) )" />
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	<xsl:template name="setCellClass">
		<xsl:choose>
			<xsl:when test="NumericAmount &gt;= 0 and $showFlags = 'true' and @FlagID > 0">
				<xsl:attribute name="class">nump Flag<xsl:value-of select="@FlagID" /></xsl:attribute>
			</xsl:when>
			<xsl:when test="NumericAmount &gt;= 0">
				<xsl:attribute name="class">nump</xsl:attribute>
			</xsl:when>
			<xsl:when test="$showFlags = 'true' and @FlagID > 0">
				<xsl:attribute name="class">num Flag<xsl:value-of select="@FlagID" /></xsl:attribute>
			</xsl:when>
			<xsl:otherwise>
				<xsl:attribute name="class">num</xsl:attribute>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	<xsl:template name="textFilters">
		<xsl:choose>
			<xsl:when test="string-length( NonNumbericText ) &gt; 0">
				<xsl:choose>
					<xsl:when test="string-length($majorversion) &gt; 0 and number($majorversion) &gt; 2">
						<xsl:value-of disable-output-escaping="yes" select="NonNumbericText" />
					</xsl:when>
					<xsl:when test="starts-with(NonNumbericText, 'us-gaap:Moodys') and contains(NonNumbericText, 'RatingMember')">
						<xsl:value-of  disable-output-escaping="yes" select="substring-before(substring-after(NonNumbericText, 'us-gaap:Moodys'), 'RatingMember')"/>
					</xsl:when>
					<xsl:when test="starts-with(NonNumbericText, 'us-gaap:StandardPoors') and contains(NonNumbericText, 'RatingMember')">
						<xsl:value-of  disable-output-escaping="yes" select="substring-before(substring-after(NonNumbericText, 'us-gaap:StandardPoors'), 'RatingMember')"/>
					</xsl:when>
					<xsl:when test="starts-with(NonNumbericText, 'us-gaap:Fitch') and contains(NonNumbericText, 'RatingMember')">
						<xsl:value-of  disable-output-escaping="yes" select="substring-before(substring-after(NonNumbericText, 'us-gaap:Fitch'), 'RatingMember')"/>
					</xsl:when>
					<xsl:otherwise>
						<xsl:value-of disable-output-escaping="yes" select="NonNumbericText" />
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>&#160;</xsl:otherwise>
		</xsl:choose>
	</xsl:template>


	<xsl:template name="indexer">
		<xsl:if test="( IsNumeric = 'true' or string-length( NonNumbericText ) &gt; 0 ) and string-length( FootnoteIndexer ) &gt; 0">
			<sup>
				<xsl:value-of select="FootnoteIndexer" />
			</sup>
		</xsl:if>
	</xsl:template>


	<xsl:template name="innerFootnotes">
		<xsl:param name="colsWithNotes" />

		<xsl:if test="count( Footnotes/Footnote ) &gt; 0">
			<xsl:variable name="cols" select="count( Columns/Column )" />
			<xsl:variable name="idxs" select="count( Columns/Column[ contains( $colsWithNotes, concat( '|', Id, '|' ) ) ] )" />
			<xsl:variable name="rowidxs">
		    <xsl:choose>
		      	<xsl:when test="starts-with($colsWithNotes,'|0')">2</xsl:when>
		      	<xsl:otherwise>1</xsl:otherwise>
		    </xsl:choose>
			</xsl:variable>

			<tr>
				<td colspan="{ $cols + $idxs + $rowidxs }"></td>
			</tr>
			<tr>
				<td colspan="{ $cols + $idxs + $rowidxs }">
					<xsl:call-template name="outerFootnotes" />
				</td>
			</tr>
		</xsl:if>
	</xsl:template>

	<xsl:template name="outerFootnotes">
    <xsl:param name="colsWithNotes"/>
	  <xsl:if test="count( Footnotes/Footnote ) &gt; 0">
	    <xsl:variable name="cols" select="count( Columns/Column )" />
	    <xsl:variable name="idxs" select="count( Columns/Column[ contains( $colsWithNotes, concat( '|', Id, '|' ) ) ] )" />
	    <xsl:variable name="rowidxs">
	      <xsl:choose>
	        <xsl:when test="starts-with($colsWithNotes,'|0')">2</xsl:when>
	        <xsl:otherwise>1</xsl:otherwise>
	      </xsl:choose>
	    </xsl:variable>
	    <table class="outerFootnotes" width="100%">
				<xsl:for-each select="Footnotes/Footnote">
			<tr class="outerFootnote">
				<td style="vertical-align: top;" valign="top">[<xsl:value-of select="NoteId" />]</td>
				<td style="vertical-align: top;" valign="top"><xsl:value-of disable-output-escaping="yes" select="Note" /></td>
			</tr>
				</xsl:for-each>
			</table>
		</xsl:if>
	</xsl:template>

	<xsl:template name="lookupCurrency">
		<xsl:param name="id" />

		<xsl:choose>
			<xsl:when test="IsIndependantCurrency = 'true'">
				<!--
        <xsl:choose>
          <xsl:when test="string-length( CurrencySymbol ) &gt; 0">
            <xsl:value-of select="CurrencySymbol" disable-output-escaping="yes" />
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="CurrencyCode" disable-output-escaping="yes" />
          </xsl:otherwise>
        </xsl:choose>
-->
				<xsl:variable name="ISOcode" select="CurrencyCode"/>
				<xsl:choose>
					<xsl:when test="$ISOcode = 'USD'">
						<xsl:text disable-output-escaping="yes">$</xsl:text>
					</xsl:when>
					<xsl:when test="$ISOcode = 'EUR'">
						<xsl:text disable-output-escaping="yes">&#x20ac;</xsl:text>
					</xsl:when>
					<xsl:when test="$ISOcode = 'GBP'">
						<xsl:text disable-output-escaping="yes">&#x20a4;</xsl:text>
					</xsl:when>
					<xsl:otherwise>
						<xsl:value-of select="$ISOcode" disable-output-escaping="yes" />
					</xsl:otherwise>
				</xsl:choose>

			</xsl:when>

			<xsl:otherwise>

				<xsl:value-of select="CurrencySymbol" disable-output-escaping="yes" />

				<!--
				<xsl:choose>
          <xsl:when test="string-length( CurrencySymbol ) &gt; 0">
            <xsl:value-of select="CurrencySymbol" disable-output-escaping="yes" />
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="CurrencyCode" />
          </xsl:otherwise>
        </xsl:choose>
				-->

			</xsl:otherwise>
		</xsl:choose>

		<xsl:text> </xsl:text>
	</xsl:template>

	<xsl:template name="nl2br">
		<xsl:param name="content" />
		<xsl:choose>
			<xsl:when test="contains( $content, '&#13;&#10;' )">
				<xsl:value-of select="substring-before($content, '&#13;&#10;')" /><br />&#10;
				<xsl:call-template name="nl2br">
					<xsl:with-param name="content" select="substring-after($content, '&#13;&#10;')" />
				</xsl:call-template>
			</xsl:when>
			<xsl:when test="contains( $content, '&#10;' )">
				<xsl:value-of select="substring-before($content, '&#10;')" /><br />&#10;
				<xsl:call-template name="nl2br">
					<xsl:with-param name="content" select="substring-after($content, '&#10;')" />
				</xsl:call-template>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="$content" />
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	<xsl:template name="basename">
		<xsl:param name="path" />

		<xsl:choose>
			<xsl:when test="substring-after( $path, '\' )">
				<xsl:call-template name="basename">
					<xsl:with-param name="path" select="substring-after( $path, '\' )" />
				</xsl:call-template>
			</xsl:when>
			<xsl:when test="substring-after( $path, '/' )">
				<xsl:call-template name="basename">
					<xsl:with-param name="path" select="substring-after( $path, '/' )" />
				</xsl:call-template>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="$path" />
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
</xsl:stylesheet>
