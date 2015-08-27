# Improvements to EDGAR® Renderer
** 3.3.0.800 compared 3.2.0.727

Uncategorized Items:  
* For Risk Return filings, all facts filtered out of a bar chart and not used anywhere else in the filing, will appear in an “Uncategorized Items” report.  
* No facts in statements will appear in an “Uncategorized Items” report.

Column and row merging:  
* Fact values will not be overwritten when two columns (rows) have the same members on the same axes, except for the units, and the units are not monetary or monetary per share, and the two columns (rows) have facts on the same rows (columns).

Promotion of headings into the upper left corner of reports:  
* Periods, units, and members of axes assigned to the rows (columns), will now not be promoted if there is only one row (column).  
* Periods will not be promoted if two different durations end at the same time.  
* Default members will not be promoted.

Processing of a linkrole’s definition text:  
* Improvements to the processing of a linkrole’s definition text will change the way Statements of Equity and Cash Flow statements are recognized.  
* A new warning message for malformed definition texts was added.

Display of footnotes:  
* Footnotes on nil facts will now be displayed.
 When there is only one row (column), footnotes in a row (column) will not be promoted to the column (row) header.

Display of content in table cells:  
*  Nil facts will not be scaled.  
*  Facts with the unit type “durationStringItemType” will render.  

Operation inside company firewalls:  
* Use of the “—proxy” command line option is resolved.  
