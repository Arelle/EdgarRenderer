# -*- coding: utf-8 -*-
"""
:mod:`re.Xlout`
~~~~~~~~~~~~~~~~~~~
Edgar(tm) Renderer was created by staff of the U.S. Securities and Exchange Commission.
Data and content created by government employees within the scope of their employment 
are not subject to domestic copyright protection. 17 U.S.C. 105.
"""
"""
Convert Html Tables into Excel tables
"""

import io, os.path, re, datetime, lxml, decimal, collections, openpyxl.cell, openpyxl.styles, openpyxl.worksheet.dimensions
from . import ErrorMgr

# note that number pattern allows word before number like shares (1,234,567) (but would misfire on same in text block!)
numberPattern = re.compile(r"\s*[_A-Za-z\xC0-\xD6\xD8-\xF6\xF8-\xFF\u0100-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]*"
                           r"\s*([$€¥£]\s*)?[(]?\s*[+-]?[0-9,]+([.][0-9]*)?[)-]?\s*$")
# word in num only allows non-numeric unicode character in first group
# we could change to allow number after first alpha character (like in XmlValidate.py) but not sure it is necessary net
wordInNumPattern = re.compile(r"\s*([_A-Za-z\xC0-\xD6\xD8-\xF6\xF8-\xFF\u0100-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]*)"
                              r"\s*([$€¥£]\s*)?[(]?\s*[+-]?[0-9,]+([.][0-9]*)?[)-]?\s*$")
dateTimePattern = re.compile(r"^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-2][0-9]:[0-6][0-9]:[0-6][0-9]$")
datePattern = re.compile(r"^[0-9]{4}-[0-9]{2}-[0-9]{2}$")
forbiddenChars = re.compile('[\\*?:/\[\]]')

def intCol(elt, attrName, default=None):
    try:
        return int(elt.get(attrName, default))
    except (TypeError, ValueError):
        return default

class XlWriter(object):
    def __init__(self, controller, outputFolderName):
        self.controller = controller
        self.outputFolderName = outputFolderName
        self.simplified_transform = lxml.etree.XSLT(lxml.etree.parse(controller.excelXslt))
        self.wb = openpyxl.Workbook(encoding='utf-8')
        self.sheetNames = set() # prevent duplicates
        self.controller.logDebug(_('Excel writer initialized {}'.format(self.controller.entrypoint)),file=os.path.basename(__file__))
        self.workSheet = None


    def __repr__(self):
        return ("xlWriter(outputFolderName='{}')".format(self.outputFolderName))

    def close(self):
        # dereference openpyxl storage
        del self.wb
        del self.controller
        del self.simplified_transform


    def save(self):
        if len(self.wb.worksheets)>1:
            self.wb.remove_sheet(self.wb.worksheets[0])
        if self.controller.reportZip:
            file = io.BytesIO()
        else:
            file = os.path.join(self.outputFolderName, "Financial_Report.xlsx")
        self.wb.save(file)
        if self.controller.reportZip:
            file.seek(0)
            self.controller.reportZip.writestr("Financial_Report.xlsx", file.read())
            file.close()
            del file  # dereference
        self.controller.logDebug('Excel output saved {}'.format(self.controller.entrypoint),file=os.path.basename(__file__))


    def createWorkSheet(self, reportNum, reportShortName):
        sheetName = reportShortName[:31]  # max length 31 for excel title

        try:
            sheetName = sheetName.encode("ascii", "replace").decode("ascii") # this can throw an exception
            sheetName = re.sub(forbiddenChars, '_', sheetName) # some characters not allowed in Sheet Names, we replace them with '_'
        except Exception:
            sheetName = 'nonAsciiName_' + str(reportNum)
            message = ErrorMgr.getError('CANNOT_CREATE_SHEET_NAME').format(reportShortName, sheetName)
            self.controller.logError(message,file=os.path.basename(__file__))

        # if there are duplicate names, disambiguate them.  we use casefold() because excel's sheet names aren't case sensitive, so
        # it thinks 'Dog' and 'dog' are the same sheet.
        if sheetName.casefold() in self.sheetNames:
            sheetName = sheetName[:31 - len(str(reportNum))] + str(reportNum) # this can overshoot, won't cause an array out of index error

        self.sheetNames.add(sheetName.casefold())
        self.workSheet = self.wb.create_sheet(title=sheetName)


    def buildWorkSheet(self, report):
        ws = self.workSheet
        colsWithCustomDimensions = set()

        try:
            # Need to Handle, not currently handled:
            # rowspan attribute of <td> or <th> - this always occurs in upper leftmost cell of any R.htm
            # colspan attribute (does not seem to actually happen)
            # any <table> element appearing in a textBlock is being dropped.
            # any other html formatting of users' text blocks is pretty much thrown away by this.
            rdoc = self.simplified_transform(report.rootETree,asPage=lxml.etree.XSLT.strparam('true'),method='html')
            row = 0  # openpyxl changed to 1-offset col numbering in version 2
            widthPerCharacter = 1
            maxWidth = 80
            for tableElt in rdoc.iter(tag="table"):
                # handle only top level table of class 'report'
                if (tableElt.xpath("count(ancestor::table)") == 0 and tableElt.xpath("count(ancestor-or-self::table[@class='report'])")>0):
                    def populateCell(col,row,text,tag,fontBold):
                        # TODO Just cut off the text at 32767 the biggest string Excel 2010 can handle.
                        colLetter = openpyxl.cell.get_column_letter(col)
                        if colLetter not in colsWithCustomDimensions:
                            colsWithCustomDimensions.add(colLetter)
                            ws.column_dimensions[colLetter] = openpyxl.worksheet.dimensions.ColumnDimension(colLetter, customWidth=True)
                        cell = ws.cell(row=row,column=col)
                        # default style fields (so we can set the all at once)
                        wrapText = False
                        alignHorizontal = "general"
                        alignVertical = "top"
                        fmt = "General"
                        unitSymbol = ''
                        if dateTimePattern.match(text):
                            cell.value = datetime.datetime(text)
                        elif datePattern.match(text):
                            cell.value = datetime.date(text)
                        elif numberPattern.match(text):
                            if ',' in text:
                                text = text.replace(',', '')
                            isNeg = False
                            for c in '()-':
                                if c in text:
                                    text = text.replace(c, '')
                                    isNeg = True
                            try:
                                mWordInNum = wordInNumPattern.match(text)
                                if mWordInNum and len(mWordInNum.group(1)) > 0:
                                    unitSymbol = mWordInNum.group(1) + ' '
                                    text = text.replace(unitSymbol, '').strip()
                                else:
                                    for c in '$€¥£':
                                        if c in text:
                                            text = text.replace(c, '').strip()
                                            unitSymbol = c + ' '
                                            break
                                value = decimal.Decimal(text)
                                fractPart = value % decimal.Decimal(1)
                                if fractPart:
                                    decimalPlaces = len(str(fractPart)) - 2
                                    fractPattern = '.' + ''.join('0' for ignore in range(decimalPlaces))
                                else:
                                    fractPattern = ''
                                if unitSymbol:
                                    fmt = '_("{0}"#,##0{1}_);_("{0}"(#,##0{1})'.format(unitSymbol, fractPattern)
                                else:
                                    fmt = '#,##0{0}_);(#,##0{0})'.format(fractPattern)
                                if isNeg:
                                    value = -value
                                cell.value = value
                            except (ValueError, decimal.InvalidOperation):
                                cell.value = text
                                fractPattern = ''
                            alignHorizontal = 'right'
                        else:
                            cell.value = text
                            wrapText = True
                        if tag == 'th':
                            alignHorizontal = 'center'
                            alignVertical = 'center'
                            
                        # set style all at once (see http://openpyxl.readthedocs.org/en/latest/styles.html)
                        if (fontBold or wrapText or fmt != "General" or alignHorizontal != "general" or alignVertical != "bottom"):
                            cell.style = openpyxl.styles.Style(font = openpyxl.styles.Font(bold=fontBold),
                                               alignment = openpyxl.styles.Alignment(horizontal=alignHorizontal, vertical=alignVertical, wrap_text=wrapText),
                                               number_format=fmt)
                        try:   
                            currentWidth =  ws.column_dimensions[colLetter].width
                            w = len(text) + 1
                            if unitSymbol:
                                for c, n in collections.Counter(unitSymbol).items():
                                    if c in ('MW_'): w += n * 2
                                    elif c.islower() or c.isdigit() or c in (' .,'): w += n
                                    else: w += n * 1.3
                                w += 2 # assure room for unit negative numbers and padding
                            newWidth = min(int(w) * widthPerCharacter,maxWidth)
                            ws.column_dimensions[colLetter].width = newWidth if currentWidth is None else max(currentWidth,newWidth)                                   
                        except Exception as ex:
                            message = ErrorMgr.getError('CANNOT_ADJUST_WIDTH').format(cell,colLetter, ex)
                            self.controller.logError(self, message,file='Xlout.py')
                            pass
                        return cell
                        
                    mergedAreas = {}  # colNumber: (colspan,lastrow)
                    for rowNum, trElt in enumerate(tableElt.iterchildren(tag="tr")):
                        # remove passed mergedAreas
                        for mergeCol in [col
                                         for col, mergedArea in mergedAreas.items()
                                         if rowNum >= mergedArea[1]]:  # rowNum is 0-based, row is 1-based
                            del mergedAreas[mergeCol]
                        col = 1 # openpyxl 2.0.2 cell A1 row=1 col=1
                        for trTdElt in trElt.iterchildren():
                            if trTdElt.tag in ('th', 'td'):
                                if col == 1:
                                    row += 1 # new row
                                if col in mergedAreas:
                                    col += mergedAreas[col][0]
                                colspan = intCol(trTdElt, "colspan", 1)
                                rowspan = intCol(trTdElt, "rowspan", 1)
                                if rowspan > 1:
                                    mergedAreas[col] = (colspan, row + rowspan - 1)
                                #text = trTdElt.text_content().strip()
                                text = ''.join([s for s in trTdElt.itertext(tag=lxml.etree.Element)])
                                textNodes = tryExtractingTextNodes(text)
                                if textNodes is not None:
                                    text = textNodes
                                if not text == '':
                                    isBold = any(True for ignore in trTdElt.iterdescendants('strong','b'))
                                    ignore = populateCell(col,row,text,trTdElt.tag,isBold)
                                elif rowspan > 1 or colspan > 1:
                                    ws.cell(row=row,column=col)
                                if colspan > 1 or rowspan > 1:
                                    # openpyxl bug in 2.0.2, these row/col are 0 offset, not 1 offset
                                    #ws.merge_cells(start_row=row, end_row=row+rowspan-1, start_column=col, end_column=col+colspan-1)
                                    ws.merge_cells(range_string='%s%s:%s%s' % (openpyxl.cell.get_column_letter(col),
                                                                               row,
                                                                               openpyxl.cell.get_column_letter(col+colspan-1),
                                                                               row+rowspan-1))
                                col += colspan
        except (lxml.etree.LxmlError, lxml.etree.XSLTError) as err:
            self.controller.logError(str(err.args),file='Xlout.py')
        except (Exception) as err:
            self.controller.logError(str(err),file='Xlout.py')
            raise


def tryExtractingTextNodes(text):
    # if the string looks like HTML, and it can be parsed, then
    # strip out all the tags 
    # collapse all whitespace but preserve one newline whenever one appears
    # in whitespace except at the beginning and end.
    # Otherwise return None.
    # This flattening can't be done effectively in XSLT because the quoted text inside the XML element is HTML.
    if '<' in text and '>' in text:
        blank = ' '
        newline = '\n'
        blanks_pat='['+''.join(['\xA0','\x40','\x09',blank])+']+'
        newlines_pat='[ \r\n]*[\r\n][ \r\n]*'
        try:
            tree = lxml.etree.HTML('<body>'+text+'</body>')
            plain = ' '.join([x for x in tree.itertext(tag=lxml.etree.Element,with_tail=False)])
            plain = re.sub(blanks_pat,blank,plain)
            plain = re.sub(newlines_pat,newline,plain)
            plain = plain.strip('\n')
            del tree
            return plain
        except Exception as ignore:
            return None
    return None # from tryExtractingTextNodes

    
