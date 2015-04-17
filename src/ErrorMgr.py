# -*- coding: utf-8 -*-
"""
:mod:`re.ErrorMgr`
~~~~~~~~~~~~~~~~~~~
Edgar(tm) Renderer was created by staff of the U.S. Securities and Exchange Commission.
Data and content created by government employees within the scope of their employment 
are not subject to domestic copyright protection. 17 U.S.C. 105.
"""


errorDict = {
#Cube.py warnings
"STATEMENT_OF_EQUITY_NO_COMPLETE_MOVEMENTS_WARNING" : "The statement of equity, ''{}'', has no durations with matching beginning and ending instants.",
"SKIPPED_FACT_WARNING" : "In ''{}'', fact {} with value {} in context {} and with preferred label {}, was not shown because there are no facts in a duration {} at {}. Change the preferred label role or add facts.",

#Embedding.py errors
"EMBEDDED_COMMANDS_ALL_ROWS_OR_ALL_COLUMNS_ERROR" : "In ''{}''{}, the group of embedded commands has no {} commands. All embedded commands must have both row and column commands. Therefore, this group of embedded commands will not be rendered.",
"EMBEDDED_COMMAND_INVALID_MEMBER_NAME_ERROR" : "In ''{}''{}, the keyword {} is not a valid member qname. Therefore, this group of embedded commands will not be rendered.",

#Embedding.py warnings
"ELEMENTS_USED_PRIMARY_ON_COLUMNS_WARNING" : "In ''{}''{}, an embedded command places the primary pseudo axis on the columns, even though the definition text contains The {{Elements}} qualifier. This command has been changed so that primary is on the rows.",
"PRESENTATION_LINKBASE_UNIT_ORDERING_INCOMPLETE_WARNING" : "In ''{}'', if you intend for the presentation group to order the units: {}, the ordering is incomplete since it does not order these units as well: {}. Therefore, this partial ordering will be ignored and the default unit ordering will be used, which is the order the units are given in the instance document.",
"INSTANT_DURATION_CONFLICT_WARNING" : "In ''{}''{}, the element {} has the label(s) {}, but the context is a duration, not an instant. It will be treated as if it had no label(s).",

"DIMENSION_AXIS_ORDER_WARNING" : "In ''{}''{}, the axis {} was not given an order in the presentation linkbase{}. We arbitrarily chose an order by sorting on its label.",
"LINKROLE_HAS_NO_FACTS" : "In ''{}'', all of the facts have been filtered out. Therefore, it will not be rendered.",
#"EMBEDDED_COMMAND_GROUPED_USED_WARNING_FOR_INVALID_AXIS" : 'In {}, the keyword "grouped" was used on an axis that does not have a default member. The keyword "grouped" will be changed to "compact" for this embedded command.',
#"EMBEDDED_COMMAND_WARNING2_GROUPED_USED_FOR_PRIMARY" : 'In {}, the keyword "grouped" was used on the primary pseudo axis. The keyword "grouped" will be changed to "compact" for this embedded command.',
#"EMBEDDED_COMMAND_WARNING3_GROUPED_USED_FOR_COLUMN" : 'In {}, the keyword "grouped" was used on a column command. The keyword "grouped" will be changed to "compact" for this embedded command.',

#PresentationGroup.py errors
"PRESENTATION_GROUP_DIRECTED_CYCLE_ERROR" : "The presentation group ''{}'' contains a directed cycle, which is a violation of XBRL 2.1 section 5.2.4.2.",

#PresentationGroup.py warnings
"PRESENTATION_GROUP_CHILDLESS_AXIS_FILTERS_OUT_ALL_FACTS_WARNING" : "The presentation group ''{}'' contains an axis that both has no children and is not associated with any of the group's facts, which effectively filters out every fact.",
"PRESENTATION_GROUP_MULTIPLE_ROOT_NODES_WARNING" : "Presentation group ''{}'' has multiple root nodes. This will make the overall ordering of axes and primary items across these multiple root nodes somewhat arbitrary.",

#Report.py warnings
"ROW_WITHOUT_CONTEXT_WARNING" : "In ''{}''{}, row {} has no context.",
"COLUMN_WITHOUT_CONTEXT_WARNING" : "In ''{}''{}, column {} has no context.",
"FIGURE_HAS_NO_FACTS_WARNING" : "''{}''{} is a bar chart figure that has zero facts.",

#Filing.py errors
"EMBEDDED_COMMAND_TOKEN_NOT_ROW_OR_COLUMN_ERROR" : "The token {}, which is number {} in the list of tokens of {} is malformed. An individual command can only start with row or column. These embedded commands will not be rendered.",
"EMBEDDED_COMMAND_INVALID_FIRST_TOKEN_ERROR" : "The token {}, which is number {} in the list of tokens of {} is malformed. The axis name can only be period, unit, primary or have an underscore. These embedded commands will not be rendered.",
"EMBEDDED_COMMAND_INVALID_SECOND_TOKEN_ERROR" : "The token {}, which is number {} in the list of tokens of {} is malformed. The second token can only be compact, grouped, nodisplay or unitcell. These embedded commands will not be rendered.",
"EMBEDDED_COMMAND_INVALID_MEMBER_NAME_ERROR" : "The token {}, which is number {} in the list of tokens of {} is malformed. The member name must either be * or have an underscore, and if there is a list of members for this axis, they all must contain an underscore. These embedded commands will not be rendered.",

#Filing.py warnings
"EMBEDDED_COMMAND_SEPARATOR_USED_WARNING" : "The token {}, which is number {} in the list of tokens of {} is separator. This keyword is not currently supported and was ignored.",
"EMBEDDED_COMMAND_GROUPED_USED_WARNING" : "The token {}, which is number {} in the list of tokens of {} is grouped. This keyword is not currently supported and was replaced with compact.",
"EMBEDDED_COMMAND_UNITCELL_USED_WARNING" : "The token {}, which is number {} in the list of tokens of {} is unitcell. This keyword is not currently supported and was replaced with compact.",






"EFM_BROKEN_AXIS_RELATIONSHIP" : "An Axis-Default Relationship is broken. The Axis is {}, the Linkrole is {} and the Default is {}. The Axis and/or the Relationship itself may be broken. Per EFM guidance, the Relationship will be ignored.",
"BROKEN_RELATIONSHIP" : "A {} Relationship is broken. The From is {}, the To is {} and the Linkrole is {}. The From or To concepts or the Relationship itself may be broken. The Relationship will be ignored.",
"FACT_DECLARATION_BROKEN" : "The Fact or Element declaration for {} is broken. The Element will be ignored.",
"TYPE_DECLARATION_BROKEN" : "The Type declaration for Element {} is either broken or missing. The Element will be ignored.",
"UNSUPPORTED_TUPLE_FOUND" : "A Fact with Qname {} is a Tuple and Tuples are forbidden by the EDGAR Filer Manual. The Fact will be ignored.",
"CONTEXT_BROKEN" : "Either the Context of a Fact with Qname {}, or the reference to the Context in the Fact is broken. The Fact will be ignored. The value of this Fact is {}.",
"IMPROPER_CONTEXT_FOUND" : "The Context {} has a scenario attribute. Such attributes are forbidden by the EDGAR Filer Manual. This filing will not validate, but this should not interfere with rendering",
"XBRL_DIMENSIONS_INVALID_AXIS_BROKEN" : "One of the Axes referenced by the Context {} of Fact {}, or the reference itself, is broken. The Axis will be ignored for this Fact.",
"XBRL_DIMENSIONS_INVALID_AXIS_MEMBER_BROKEN" : "The Member of Axis {} is broken as referenced by the Fact {} with Context {}. The Axis and Member will be ignored for this Fact.",
"AXIS_HAS_NO_DEFAULT" : "Because the axis {} has no default, the fact {} with context {} was filtered in {}.",
"CUBE_BROKEN" : "The cube with linkrole {} is broken.",
"EMBEDDING_OR_REPORT_BROKEN" : "The embedding or report with linkrole {} is broken.",
"FLOWTHROUGH_SUPPRESSION" : "Flow through suppression has removed every row and column from {} so it will not be rendered.",
"DUPLICATE_FACT_SUPPRESSION" : "There are multiple facts with {}. The fact on line {} of the instance document will be rendered, and the rest at line(s) {} will not.",

#EdgarRenderer.py errors
"FOLDER_MUST_BE_EMPTY" : "Folder {} exists and is not empty.", 
"PROBLEM_CREATING_REPORTS_FOLDER" : "Problem creating Reports folder {}.",
"INCORRECT_ARGUMENTS" : "Incorrect arguments, please try python EdgarRenderer.py --help",
"INCORRECT_WEBSRV_ARGUMENTS" : "Incorrect arguments with --webserver, please try python EdgarRenderer.py --help",
"INVALID_CONFIG_REPORTXSLT" : "Cannot find report xslt {}",
"INVALID_CONFIG_SUMMARYXSLT" : "Cannot find summary xslt {}",
"INVALID_CONFIG_EXCELXSLT" : "Cannot find excel xslt {}",
"FILING_MOVE_ERROR" : "Could not remove {}",
"SCHEMA_LOADING_ERROR" : "Failed to load XML schema.",
"DTS_LOADING_ERROR" : "[Exception] Failed to complete request: {0} {1}",
"DTS_LOADING_IMPORT_ERROR" : "Model import errors found: {0} {1}",
"DTS_DIFF_FILE_LOADING_ERROR" : "Model Diff-file loading errors found: {0} {1}",
"XBRL_VALIDATION_ERROR" : "An XBRL validation error has occurred: {0}",
"VALIDATION_ERRORS_EXCEEDED" : "Not attempting to render after {0} validation errors",
"UNDEFINED_SYS_ERROR" : "Undefined error raised: {0}",
"TRACEABLE_ERROR" : "Traceable Error raised during rendering process: {0}",
"SAVE_OUTPUT_ERROR" : "Failed to save output: {0}",
"RE3_STACK_FRAME_ERROR" : "[Exception] Failed to complete request: {0} {1}",
"CANNOT_PROCESS_ZIP_FILE" : "Cannot process zip file {0}; moving to fail folder.",
"CANNOT_PROCESS_INPUT_FILE" : "Cannot process input file {0}.",
"POST_PROCESSING_ERROR" : "Failure: Post-processing I/O or OS error: {0}",

#EdgarRenderer.py warnings
"IGNORE_OTHER_FILE" : "Ignoring file {} of unknown type found in folder or zip.",
"IGNORE_XML_FILE" : "Ignoring Non-DTS xml file {} found in folder or zip.",
"UNABLE_TO_LOAD_ADDON_LINKBASE" : "Unable to load add-on linkbase {0}.",
"UNSUPPORTED_CONFIG_TAG" : "Found value {} for unsupported configuration tag {}",
"INPUT_OUTPUT_SAME" : "Input and output files are the same: {}",

#RootElement.py errors
"OS_ERROR" : "OS ERROR READING {}: {}",
"XML_EXCEPTION" : "XML EXCEPTION ON {}: {}",

#XLout.py errors
"CANNOT_CREATE_SHEET_NAME" : "Cannot convert {} to ASCII. The Excel work sheet will instead be labeled {}.",
"CANNOT_ADJUST_WIDTH" : "{} could not adjust width on column {}: {}",
"DIRECTORY_ERROR" : "{}: directory {} error: {}"}




def errorReport(cntlr, findme):
    #Write all matches to "findme" str
    cntlr.addToLog("Listing " + findme + "(s) reportable by RE3:", messageCode="info")
    for msg in errorDict.values():
        if findme in msg:
            cntlr.addToLog(msg, messageCode="info")

def getError(errorCodeStr):
    try:
        return '[{!s}] {}'.format(errorCodeStr, errorDict[errorCodeStr])
    except KeyError:
        print('Internal rendering bug, error code string not recognized')