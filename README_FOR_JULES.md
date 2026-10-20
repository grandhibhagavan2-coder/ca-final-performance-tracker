# CA Final Performance Tracker — workbook export for Jules

These CSV files were exported from the original Excel workbook.
Formula cells are preserved as formula text beginning with `=`; CSV does not calculate formulas or preserve formatting.
Use the subject sheets and Consolidated Progress as structural references. Reimplement the intended calculations in JavaScript and flag broken Excel references rather than copying errors into the app.

## Worksheets
- `Consolidated_Progress.csv` — worksheet `Consolidated Progress`, exported range A1:T14.
- `FR.csv` — worksheet `FR`, exported range A1:Q47.
- `AFM.csv` — worksheet `AFM`, exported range A1:Q23.
- `Audit.csv` — worksheet `Audit`, exported range A1:Q30.
- `DT.csv` — worksheet `DT`, exported range A1:Q55.
- `IDT.csv` — worksheet `IDT`, exported range A1:Q48.
- `Test_Papers.csv` — worksheet `Test Papers`, exported range A1:AD935.

## Instructions for Jules
Build the HTML tracker from these exports. Treat the CSVs as reference data, not as executable spreadsheet formulas. Inspect the header/input areas and existing subject structure. Recreate calculations in JavaScript, preserve the useful tracking fields, and do not treat Excel `#REF!` or `#ERROR!` cells as valid data. Make initial data editable and add import/export backup functionality.
