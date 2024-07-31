import { Report, Section, SectionFact } from '../interface/meta';
import { convertToSelector } from "../helpers/utils";
import { FilingSummary } from '../interface/filing-summary';

/**
 * Description
 * @param {any} filingSummary:any
 * @param {any} metaLinksReports:any
 * @returns {any} => Flatter array of metalinks reports (section items).
 */
export const buildSectionsArrayFlatter = (filingSummary: FilingSummary, metaLinksReports: Report[], metaVersion: string) => {
    // 'sections' and 'reports' are synonymous here
    const filingSummaryReports = filingSummary.MyReports.Report;
    let filingSummaryInputFiles = filingSummary.InputFiles.File;
    if (!Array.isArray(filingSummaryInputFiles)) filingSummaryInputFiles = [filingSummaryInputFiles];
    
    const reportsContainStatements: boolean = filingSummaryReports
        .filter(r => r.MenuCategory)
        .map(r => r.MenuCategory && r.MenuCategory._text.toLowerCase())
        .some((menuCategory: string) => {
            return menuCategory == 'statement' || 'statements';
        })

    const addInstanceProps = (section: Section) => {
        // Get Doc Name for instance header for sections
        const isHtmIsh = (fileName: string) => {
            return fileName.includes('.htm') || fileName.includes('.html') || fileName.includes('.xhtml');
        }
        const reportFileInfo = filingSummaryInputFiles.filter(file => {
            if (file._attributes && file._attributes?.original && isHtmIsh(file._text)) {
                return section.instanceHtm.includes(file._attributes.original)
            }
        });
        if (reportFileInfo.length) {
            section.instanceDocName = reportFileInfo[0]?._attributes?.doctype;
        } else {
            console.error(`Cannot find instance file in FilingsSummary inputfiles`);
        }
        return section;
    }

    const addFactProps = (section: Section) => {
        section.fact = getFactAttrsFromAnchorProps(section) || undefined;
        const mrFact = section.fact;
        if (mrFact?.file  && mrFact?.ancestors && mrFact?.name) {
            // if an ancestor is a fact name eg "sbs:SbsefOrglStrDescTextBlock", need to dress as name attribute
            const handleSpecialAncestors = mrFact.ancestors.map((a: string) => {
                if (a.includes(':')) {
                    if (a.includes('ix:continuation')) return ''; // skip continuation ancestors
                    return `[name="${a}"]`
                } else {
                    return a;
                }
            });
            const ancestorsRelevant = handleSpecialAncestors.reverse().filter((a:string) => a !== "html").join(' ');
            section.inlineFactSelector = `section[filing-url="${mrFact.file}"] > ${ancestorsRelevant} [name="${mrFact.name}"][contextref="${mrFact.contextRef}"]`;
        }
        return section;
    }

    const sectionsArray = metaLinksReports.map((metaReport: Report) => {
        let section: Section = metaReport as unknown as Section;
        if (Number(metaVersion) <= 2.1 || !section.menuCat) {
            section.menuCat = section.subGroupType || section.groupType;
        }
        if (metaReport.menuCat && metaReport.shortName) {
            section = addInstanceProps(section);
            section = addFactProps(section);
            section.menuCatMapped = mapCategoryName(section.menuCat, reportsContainStatements);
            section.domId = `sectionDoc-${convertToSelector(section.instanceDocName, false)}`

            return section;
        } else {
            console.error('Cannot determine Section menuCat');
        }
    })
    .filter((section): section is Section => !!(section?.fact && section.menuCatMapped));

    return sectionsArray || [];
}

const getFactAttrsFromAnchorProps = (section: Section) => {
    let fact: SectionFact | null = {};
    fact.instance = section.instance; // number
    // fact.menuCat = metaReport.menuCat;
    if (section.uniqueAnchor) {
        fact.name = section.uniqueAnchor.name;
        fact.contextRef = section.uniqueAnchor.contextRef;
        fact.file = section.uniqueAnchor.baseRef;
        fact.ancestors = section.uniqueAnchor.ancestors;
    } else if (section.firstAnchor) {
        fact.name = section.firstAnchor.name;
        fact.contextRef = section.firstAnchor.contextRef;
        fact.file = section.firstAnchor.baseRef;
        fact.ancestors = section.firstAnchor.ancestors;
    } else {
        /* DOC: "As I recall, the reason for the anchors computed during rendering was that 
                some internal rendering process detail gets lost that neither filing summary.xml 
                nor metalinks.json could preserve (I think it had to do with how chrome will insert 
                elements like <tbody> if they were missing in the input…?), but since I can’t 
                remember what that might be (it’s certainly not obvious) go ahead and try." -WH email 4/1/2024 
        */
        fact = null;
    }
    return fact;
}

/**
 * Description
 * @param {any} input:string
 * @returns {any} => (string) mapped menu category name || 'INCOMPLETE SECTIONS DATA!'
 * @description use only when there are no 'statement' menu categories
 */
const mapCategoryName = (input: string, isStandard: boolean) => {
    const lowerCaseKey = input.toLowerCase();
    /*
        'When the FilingSummary does not have any ‘statement’ category reports for an instance, then the following mapping should be used.  
        “Reports” is generic and covers all the other things that don’t need their reports grouped into levels of detail.  
        “Statements” used to be the general case (2008-2020) but now they are becoming the special case.' - WH Mar 29, 2024
    */
    const noStatementCatNameMap = {
        "cover": "Reports",
        "document": "Reports",
        // "statement": n/a
        // "Statements": n/a
        "disclosure": "Reports",
        "notes": "Reports",
        "policies": "Reports", /* very unlikely to happen */
        "tables": "Reports", /* very unlikely to happen */
        "details": "Details", /* example here http://172.18.85.157:8082/ix-wh/oef24/oef05/out/FilingSummary.htm# */
        "prospectus": "Prospectus",
        "rr_summaries": "RR Summaries", /* example here http://172.18.85.157:8082/ix-wh/oef24/oef13/out/FilingSummary.htm we no longer make fancy menus for these */
        "fee_exhibit": "RR Summaries",
        "risk/return": "RR Summaries"
    };
    const standardCatNameMap = {
        "cover": "Cover",
        "document": "Document & Entity Information",
        "statement": "Financial Statements",
        "statements": "Financial Statements",
        "disclosure": "Notes to the Financial Statements",
        "notes": "Notes to Financial Statements",
        "policies": "Accounting Policies",
        "tables": "Notes Tables",
        "details": "Notes Details",
        "prospectus": "Prospectus",
        "rr_summaries": "RR Summaries",
        "fee_exhibit": "RR Summaries",
        "risk/return": "RR Summaries"
    };
    if (isStandard) {
        if (lowerCaseKey in standardCatNameMap) {
            return standardCatNameMap[lowerCaseKey as keyof typeof standardCatNameMap];
        } else {
            console.info(`standardCatNameMap doesn't contain key: %c${lowerCaseKey}`, "color: deepskyblue")
        }
    } else {
        if (lowerCaseKey in noStatementCatNameMap) {
            return noStatementCatNameMap[lowerCaseKey as keyof typeof noStatementCatNameMap];
        } else {
            console.info(`noStatementCatNameMap doesn't contain key: %c${lowerCaseKey}`, "color: deepskyblue")
        }
    }
};


export function fetchText(url: string, init?: RequestInit): Promise<string | never>
{
    return fetch(url, init).then((response) =>
    {
        if(response.status >= 200 && response.status <= 299)
            return response.text();
        else
            throw new Error(response.status.toString());
    });
}
export function fetchJson<T = any>(url: string, init?: RequestInit): Promise<T | never>
{
    return fetch(url, init).then((response) =>
    {
        if(response.status >= 200 && response.status <= 299)
            return response.json();
        else
            throw new Error(response.status.toString());
    });
}



export function setScaleInfo(scale: string | number | undefined): string | null
{
    const scaleOptions: Record<string, string> =
    {
        0: "Zero",
        1: "Tens",
        2: "Hundreds",
        3: "Thousands",
        4: "Ten thousands",
        5: "Hundred thousands",
        6: "Millions",
        7: "Ten Millions",
        8: "Hundred Millions",
        9: "Billions",
        10: "Ten Billions",
        11: "Hundred Billions",
        12: "Trillions",
        "-1": "Tenths",
        "-2": "Hundredths",
        "-3": "Thousandths",
        "-4": "Ten Thousandths",
        "-5": "Hundred Thousandths",
        "-6": "Millionths"
    };
    
    return scaleOptions[scale || ""] || null;
}
