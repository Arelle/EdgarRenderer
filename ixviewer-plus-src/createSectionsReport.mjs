import fs from 'fs';

const filePath = 'dist/Archives/edgar/data/wh-sections/out/MetaLinksReports.json';
const metalinks = JSON.parse(fs.readFileSync(filePath, "utf8"));

/*
Structure 
"instance": {
    "sbsef03exc-20231231.htm": {
        "report": {
            "R1": {
                "role": "http://xbrl.sec.gov/sbsef/role/ExhC",
                "longName": "995561 - Disclosure - SBSEF Exhibit C, Board Fitness Standards and Composition",
                "shortName": "SBSEF Exhibit C, Board Fitness Standards and Composition",
                "isDefault": "true",
                "groupType": "disclosure",
                "subGroupType": "",
                "menuCat": "Cover",
                "order": "1",
                "firstAnchor": {...},
                "uniqueAnchor": {...}
            },
            ...
        }
    }
}
*/

const sectionsByMenuCategory = {};
const sectionsByInstanceDoc = {};
const allSectionsFlat = [];
for (const instanceDoc in metalinks.instance) {
    if (!(metalinks.instance[instanceDoc] in sectionsByInstanceDoc)) {
        sectionsByInstanceDoc[instanceDoc] = [];
    }
    
    for (const report in metalinks.instance[instanceDoc].report) {
        const section = metalinks.instance[instanceDoc].report[report];
        sectionsByInstanceDoc[instanceDoc].push(section.shortName);
        if (!(section.menuCat in sectionsByMenuCategory)) {
            sectionsByMenuCategory[section.menuCat] = [];
        }
        if (section && section.menuCat && section.order && section.shortName) {
            sectionsByMenuCategory[section.menuCat].push(section.shortName)
        }
        allSectionsFlat.push(section.shortName)
    }
}

console.log('sectionsByInstanceDoc', sectionsByInstanceDoc);

let totalSectsInSectsByCat = 0;
let totalSectsInSectsByDoc = 0;
for (const cat in sectionsByMenuCategory) {
    totalSectsInSectsByCat += sectionsByMenuCategory[cat].length;
}
for (const doc in sectionsByInstanceDoc) {
    totalSectsInSectsByDoc += sectionsByInstanceDoc[doc].length;
}
console.log('allSectionsFlat', allSectionsFlat.length)
console.log('totalSectsInSectsByCat', totalSectsInSectsByCat)
console.log('totalSectsInSectsByDoc', totalSectsInSectsByDoc)

// missing 
// - 13 '... File Info'
// - 1 Cover
// Total 14
// 39 - 25 = 14
// So those are the ones the cypress test is picking up as missing.