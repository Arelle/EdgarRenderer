These files are NOT the ones used by default.  Rather, they are templates
for the actual files.  If not specified on the command line with the -c flag,
the program looks for EdgarRenderer.xml on the PYTHONPATH.

File TaxonomyManagerAddon.xml is the same format used by RE2, but it uses it in a
different way.  RE2 kept local copies of these files in its own subdirectories.
RE3  uses it as a way of mapping a schema file name to the accompanying
doc or ref file name which it assumes is in the same URL location as the schema.
