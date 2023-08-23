# TODOs for the automation and whatnot
## We should be able to go over dozens and dozens of dynamically added URLs
---
1. Ensure XHTML file loads
    - Including all associated images
2. Ensure MetaLinks.json file loads
3. Ensure Application wrapper loads
    1. HTML file loads
    2. JS file loads
    3. Font file loads
    4. CSS file loads
4. Ensure the IXViewer Navbar loads and has all available options
    - Menu
    - Sections
    - Search bar
    - Data
    - Tags
    - More Filters
5. Ensure error handling works properly when steps 1,2 are NOT successful, for example: [this link, which will NOT work](https://www.sec.gov/ix?doc=/Archives/edgar/data/19617/000001961722000272/bleh.htm)
    - Ensure error messages to user always shows up


Example of dynamic URLs:
const alltheURLS= [
    'https://www.sec.gov/ix?doc=/Archives/edgar/data/19617/000001961722000272/jpm-20211231.htm',
    'https://www.sec.gov/ix?doc=/Archives/edgar/data/46080/000004608023000017/has-20221225.htm'
];

alltheURLS.forEach((current) => {
    //load the 'current' into cypress and have it go into your tests
})