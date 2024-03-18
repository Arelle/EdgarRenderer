import * as cheerio from 'cheerio';
import * as convert from 'xml-js';
import { Meta, Xbrltype, reference } from '../interface/meta';
import { Context, DeiAmendmentFlagAttributes, Instance, LinkFootnote, LinkFootnoteArc, LinkLOC, Units } from '../interface/instance';
import { Reference, SingleFact } from '../interface/fact';
import { Logger, ILogObj } from 'tslog';
import { cleanSubstring } from '../helpers/utils';

/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */
export class FetchAndMerge {
    private absolute: string;
    private params: {
        doc: string,
        'doc-file': string,
        hostName: string,
        redline: boolean,
        metalinks: string,
        'metalinks-file': string,
        fact: string,
        summary: string,
    };
    private customPrefix: undefined | string;
    private currentInstance: Array<{
        current: boolean;
        formInformation: {
            axisCustom: number;
            axisStandard: number;
            baseTaxonomies: { [key: string]: number; };
            contextCount: number;
            dts: { [key: string]: { [key: string]: Array<string>; }; };
            elementCount: number;
            entityCount: 1;
            hidden: { [key: string]: number; };
            keyCustom: number;
            keyStandard: number;
            memberCustom: number;
            memberStandard: number;
            nsprefix: string;
            nsuri: string;
            segmentCount: number;
            unitcount: number;
        };
        instance: number;
        map: Map<string, SingleFact>;
        metaInstance: Meta;
        xhtmls: Array<{
            current: boolean;
            loaded: boolean;
            slug: string;
            url: string;
            xhtml: string;
        }>;
        xmlSlug: Array<string>;
        xmlUrls: Array<string>;
    }> | undefined;
    private std_ref;
    private sections;
    private metaVersion: string | undefined;
    private instance;
    constructor(input: {
        absolute: string,
        params: {
            doc: string,
            'doc-file': string,
            hostName: string,
            redline: boolean,
            metalinks: string,
            'metalinks-file': string,
        },
        instance: number | null,
        std_ref: { [key: string]: Reference }

    }) {
        this.absolute = input.absolute;
        this.partial = input.partial;
        this.map = input.map;
        this.params = input.params;
        this.customPrefix = input.customPrefix;
        this.instance = input.instance;
        this.std_ref = input.std_ref;
    }

    init() {

        const XHTMLandInstance = (instance, addInstance = false) => {
            return Promise.all([
                this.fetchXHTML(),
                this.fetchInstance(),
            ]).then((allResponses) => {
                const errors = allResponses.filter(element => element ? Object.prototype.hasOwnProperty.call(element, 'error') : false);
                if (errors.length) {
                    const errorMessages = errors.map(current => current.message);
                    return {
                        all: { error: true, message: errorMessages }
                    };
                }
                allResponses[0].forEach((current, index) => {
                    this.currentInstance.xhtmls[index].loaded = true;
                    this.currentInstance.xhtmls[index].xhtml = current.xhtml;
                });
                this.currentInstance.xml = (allResponses[1] as Instance);
                this.mergeAllResponses(addInstance);
                return {
                    all: { instance: (addInstance ? instance.instance : instance), sections: this.sections, std_ref: this.std_ref }
                }
            })
        };

        const MetaandSummary = () => {
            return Promise.all([
                this.fetchMeta(),
                this.fetchSummary(),
            ]).then((allResponses) => {
                this.metaVersion = allResponses[0].version;
                this.std_ref = allResponses[0].std_ref;
                if (allResponses.some((element) => element.error)) {
                    const messageIndex = allResponses.find((element) => element.error);
                    return {
                        all: { error: true, message: [messageIndex.message] }
                    }
                } else {
                    this.currentInstance = allResponses[0].instance?.filter(element => element.current)[0];

                    const mapCategoryName = (input: string) => {
                        const options = {
                            "Cover": "Cover",
                            "document": "Document & Entity Information",
                            "statement": "Financial Statements",
                            "Statements": "Financial Statements",
                            "disclosure": "Notes to the Financial Statements",
                            "Notes": "Notes to Financial Statements",
                            "Policies": "Accounting Policies",
                            "Tables": "Notes Tables",
                            "Details": "Notes Details",
                            "Prospectus": "Prospectus",
                            "RR_Summaries": "RR Summaries",
                            "Fee_Exhibit": "RR Summaries",
                            "Risk/Return": "RR Summaries"
                        };
                        if (options[input]) {
                            return options[input];
                        }
                        return 'INCOMPLETE SECTIONS DATA!';
                    };
                    const metaLinksSections = Object.values(allResponses[0].sections);
                    this.sections = allResponses[1].MyReports.Report.reduce((accumulator, current) => {
                        if (current && current.MenuCategory && current.Position && current.ShortName && current._attributes) {
                            let fact = { name: '', contextRef: '', instance: null };
                            const additional = metaLinksSections.find(element => element.shortName === current.ShortName._text);
                            if (additional) {
                                fact.instance = additional.instance;
                                if (additional.uniqueAnchor) {
                                    fact.name = additional.uniqueAnchor.name;
                                    fact.contextRef = additional.uniqueAnchor.contextRef;
                                    fact.file = additional.uniqueAnchor.baseRef;
                                } else if (additional.firstAnchor) {
                                    fact.name = additional.firstAnchor.name;
                                    fact.contextRef = additional.firstAnchor.contextRef;
                                    fact.file = additional.firstAnchor.baseRef;
                                } else {
                                    // MetaLinks.json does NOT have sufficient information for this section category
                                    // we remove it from being used.
                                    fact = null;
                                }
                            }
                            const index = accumulator.findIndex(element => element.name === mapCategoryName(current.MenuCategory._text))
                            if (index !== -1 && fact) {
                                accumulator[index].children.push(
                                    {
                                        sort: +current.Position._text,
                                        name: current.ShortName._text,
                                        fact: fact,
                                    }

                                );
                                accumulator[index].children.sort((first, second) => {
                                    if (first.sort < second.sort) {
                                        return -1;
                                    }
                                    if (first.sort > second.sort) {
                                        return 1;
                                    }
                                    return 0;
                                });
                            } else if (fact) {
                                accumulator.push({
                                    name: mapCategoryName(current.MenuCategory._text),
                                    children: [
                                        {
                                            sort: +current.Position._text,
                                            name: current.ShortName._text,
                                            file: current._attributes.instance,
                                            fact: fact,
                                        }
                                    ]
                                });

                            }
                        }
                        return accumulator;
                    }, []);
                }
                return Promise.all([
                    XHTMLandInstance(allResponses[0], true)
                ]).then(data => {
                    return data[0];
                })
            });
        };

        if (this.instance !== null) {
            this.currentInstance = this.instance.filter(element => element.current)[0];
            return XHTMLandInstance(this.instance);
        } else {
            return MetaandSummary();
        }
    }

    decodeWorkstationXmlInHtml(isWorkstation: boolean, html: string, closingXml: string) {
        if (!isWorkstation) return html; // not running on SEC EDGAR workstation which encodes xml in HTML
        if (!html.substring(0,100).toLowerCase().includes("<html><head>")) {
             if (html.includes("<title>EDGAR SEC Workstation Login</title>")) {
                  console.error("Workstation requires logging in");
                  window.alert("Workstation requires logging in");
                  return "";
             }
             return html; // it's xml, not html
        }
        // snip extraneous html from beginning and end of resopnse which is present in versions of files on workstation
        // only 5 encodings are used in xml
        html = html.replaceAll('&lt;', '<');
        html = html.replaceAll('&gt;', '>');
        html = html.replaceAll('&quot;', '"');
        html = html.replaceAll('&apos;', '\'');
        html = html.replaceAll('&amp;', '&');
        return html.substring(html.indexOf("<?xml version="), html.indexOf(closingXml) + closingXml.length)
    }

    fetchXHTML() {
        const promises = this.currentInstance?.xhtmls.map((current: { url: string }) => {
            return new Promise((resolve) => {
                const isWorkstation = current.url.includes("DisplayDocument.do?");
                let ixvUrl = current.url;
                if (isWorkstation) {
                    if (Object.prototype.hasOwnProperty.call(this.params, 'redline') && this.params.redline) {
                        ixvUrl = ixvUrl.replace('.htm', '_ix2.htm');
                    } else {
                        ixvUrl = ixvUrl.replace('.htm', '_ix1.htm');
                    }
                }
                fetch(ixvUrl, {
                    headers: {
                        "Content-Type": "application/xhtml+xml"
                    },
                    mode: 'no-cors',
                    credentials: 'include'
                }).then((response) => {
                    if (response.status >= 200 && response.status <= 299) {
                        return response.text();
                    } else {
                        throw Error(`${response.status.toString()}, Could not find "${this.params.doc}"`);
                    }
                }).then((data) => {
                    // on SEC EDGAR workstation xhtml is encoded like this: <HTML><HEAD><TITLE> ... &lt;?xml ...
                    const xhtmlData = this.decodeWorkstationXmlInHtml(isWorkstation, data, "</html>");
                    resolve({ xhtml: xhtmlData });
                }).catch((error) => {
                    resolve({ error: true, message: error });
                })
            });
        });
        return Promise.all(promises).then((allXHTML: Array<{ xhtml: string, index: number }>) => {
            return allXHTML;
        });
    }

    fetchMeta(): Promise<{
        error?: boolean,
        message?: string,
        instance?: Array<{
            current: boolean,
            instance: number,
            xhtmls: Array<{
                slug: string,
                url: string,
                current: boolean,
                loaded: boolean
            }>,
            xmlSlug: Array<string>,
            xmlUrls: Array<string>,
            metaInstance: Array<Instance>
        }>,
        meta?: Meta,
        inlineFiles?: Array<{ slug: string, current: boolean, loaded: boolean }>
    }> {
        return new Promise((resolve) => {
            return fetch(this.params.metalinks, { credentials: 'include' }).then((response) => {
                if (response.status >= 200 && response.status <= 299) {
                    return response.json();
                } else {
                    throw Error(response.status.toString());
                }
            }).then((data) => {

                let XHTMLSlug = this.params.doc.substr(this.params.doc.lastIndexOf('/') + 1);
                if (XHTMLSlug.startsWith("DisplayDocument.do") || XHTMLSlug.startsWith("view.html")) {
                    XHTMLSlug = this.params.doc.substr(this.params.doc.lastIndexOf('filename=') + 9);
                }
                const instanceKeys = Object.keys(data.instance).join().split(/[ ,]+/);
                let sections = {}
                if (instanceKeys.includes(XHTMLSlug)) {
                    const instanceObjects = Object.keys(data.instance).map((current, index) => {

                        Object.keys(data.instance[current].report).forEach((report) => {
                            data.instance[current].report[report].instance = index;
                        });

                        sections = Object.assign(sections, data.instance[current].report);
                        const xhtmls = current.split(' ').map((element) => {
                            return {
                                slug: element,
                                url: this.params.doc.replace(this.params['doc-file'], element),
                                current: current.split(' ').includes(XHTMLSlug) && element === this.params['doc-file'],
                                loaded: false
                            };
                        });
                        // How is this used?
                        const xmlSlugs = xhtmls.map(element => element.slug.replace('.htm', '_htm.xml'));
                        const xmlUrls = xhtmls.map(element => this.params.metalinks.replace('MetaLinks.json', element.slug.replace('.htm', '_htm.xml')));
                        return {
                            instance: index,
                            xhtmls: xhtmls,
                            current: current.split(' ').includes(XHTMLSlug),
                            xmlSlug: xmlSlugs,
                            xmlUrls: xmlUrls,
                            metaInstance: Object.assign(data.instance[current]),
                            map: new Map()
                        }
                    });
                    delete data.instance;
                    resolve({ instance: instanceObjects, ...data, sections, version: data.version });
                } else {
                    throw Error('Incorrect MetaLinks.json Instance');
                }
                resolve(data);
            }).catch((error) => resolve({ error: true, message: `${error}, Could not find "${this.params.metalinks}"` }))
        });
    }

    fetchSummary() {
        return new Promise((resolve) => {
            const isWorkstation = this.params.summary.includes("DisplayDocument.do?");
            return fetch(this.params.summary, { credentials: 'include' }).then((response) => {
                if (response.status >= 200 && response.status <= 299) {
                    return response.text();
                } else {
                    throw Error(response.status.toString());
                }
            }).then((data) => {
                const xmlData = this.decodeWorkstationXmlInHtml(isWorkstation, data, "</FilingSummary>");
                resolve(JSON.parse(convert.xml2json(xmlData as unknown as string, { compact: true })).FilingSummary);
            }).catch((error) => {
                resolve({ error: true, message: `${error}, Could not find "${this.params.summary}"` })
            })
        });
    }

    fetchInstance() {
        const promises = this.currentInstance.xmlUrls.map((current) => {
            const isWorkstation = current.includes("DisplayDocument.do?");
            if (isWorkstation) {
                // If methods from HelpersUrl are used here some very strange bugs occur, such as window and localStorage undefined.
                if (Object.prototype.hasOwnProperty.call(this.params, 'redline') && this.params.redline) {
                    current = current.replace('_htm.xml', '_ht2.xml')
                } else {
                    current = current.replace('_htm.xml', '_ht1.xml')
                }
            }
            return new Promise((resolve) =>
                fetch(current).then((response) => {
                    if (response.status >= 200 && response.status <= 299) {
                        return response.text();
                    } else {
                        const indexOf = this.currentInstance.xmlUrls.indexOf(current);
                        if (indexOf >= 0) {
                            this.currentInstance.xmlUrls.splice(indexOf, 1);
                        }
                        throw Error(`${response.status.toString()}`);
                    }
                }, { credentials: 'include' }).then((data) => {
                    const xmlData = this.decodeWorkstationXmlInHtml(isWorkstation, data, "</xbrl>");
                    resolve({ instance: xmlData });
                }).catch((error) => {
                    resolve({ error: true, message: `${error}, Could not find "XML Instance Data"` });
                }
            ));
        });
        return Promise.all(promises).then((xmlInstances) => {
            const instance = xmlInstances.filter(element => element.instance);
            if (instance && instance[0]) {
                const fetchedXMlString = instance[0].instance;
                const instanceXmlAsJsonCompact = JSON.parse(convert.xml2json(fetchedXMlString as unknown as string, { compact: true }));
                if (instanceXmlAsJsonCompact.xbrl["link:footnoteLink"] && DEBUGJS) {
                    const footnotesNode = instanceXmlAsJsonCompact.xbrl["link:footnoteLink"]
                    // grab xml data as non compact object so element order is preserved.
                    instanceXmlAsJsonCompact.xbrl["link:footnoteLink"].expanded = JSON.parse(convert.xml2json(fetchedXMlString as unknown as string, { compact: false }));
                    instanceXmlAsJsonCompact.xbrl["link:footnoteLink"].orderedFootnoteDivs = footnotesNode.expanded.elements[0].elements;
                    instanceXmlAsJsonCompact.xbrl["link:footnoteLink"].asXmlString = cleanSubstring(fetchedXMlString, '<link:footnoteLink', '</link:footnoteLink>');
                    // footnotesNode.asXmlString = cleanSubstring(fetchedXMlString, '<link:footnoteLink', '</link:footnoteLink>').replaceAll('\n', '');
                    // footnotesNode.renderableXml = this.xmlToDom(fetchedXMlString);
                    console.log('instanceXmlAsJsonCompact', instanceXmlAsJsonCompact);
                }
                // return instanceXmlAsJsonCompact.xbrl["link:footnoteLink"].asXmlString
                return instanceXmlAsJsonCompact;
            } else {
                return xmlInstances[0];
            }
        });
    }

    mergeAllResponses(
        includeSections: boolean
    ) {
        this.currentInstance.map = this.buildInitialMap(this.currentInstance.xml);
        if (includeSections) {
            this.sections = this.extractSections();
        }
        this.currentInstance.formInformation = this.extractFormInformation(this.currentInstance.metaInstance);
        this.mergeMapandMeta();
        this.customPrefix = this.currentInstance.metaInstance.nsprefix;
        this.prepareXHTML();
        return;

    }

    buildInitialMap(instance: Instance) {

        const getInstancePrefix = (instance) => {
            const options = Object.keys(instance).filter(element => element.endsWith(':xbrl'))[0];
            return options ? options.split(':')[0] : false;
        };
        const prefix = getInstancePrefix(instance);

        const xbrlKey = prefix ? `${(prefix as string)}:xbrl` : 'xbrl';
        const contextKey = prefix ? `${(prefix as string)}:context` : 'context';
        const unitKey = prefix ? `${(prefix as string)}:unit` : 'unit';

        const context = instance[xbrlKey][contextKey];
        const unit = instance[xbrlKey][unitKey];
        const footnote = instance[xbrlKey]['link:footnoteLink'];

        delete instance[xbrlKey][contextKey];
        delete instance[xbrlKey][unitKey];
        delete instance[xbrlKey]._attributes;
        delete instance[xbrlKey]['link:schemaRef'];
        delete instance[xbrlKey]['link:footnoteLink'];
        this.setPeriodText(context);
        this.setSegmentData(context);
        this.setMeasureText(unit);
        const map = new Map();
        let factCounter = 0;
        for (const key in instance[xbrlKey]) {
            /* example set of keys on instance.xbrl
                _attributes
                link:schemaRef
                context
                unit
                dei:AmendmentFlag
                dei:DocumentPeriodEndDate
                dei:DocumentFiscalPeriodFocus
                dei:EntityCentralIndexKey
                dei:CurrentFiscalYearEndDate
                dei:EntityEmergingGrowthCompany
                dei:DocumentType
                dei:DocumentFiscalYearFocus
                dei:EntityRegistrantName
                dei:EntityCommonStockSharesOutstanding
                i09203gd:Content4
                link:footnoteLink
            */
            if (Array.isArray(instance[xbrlKey][key])) { // this first block might handle multi instance filings.
                instance[xbrlKey][key].forEach((current: { _attributes: DeiAmendmentFlagAttributes; _text: string; }) => {
                    const attributes = { ...current._attributes };
                    const id = attributes.id ? attributes.id : `fact-identifier-${factCounter}`;
                    delete attributes.id;
                    map.set(id, {
                        ...attributes,
                        name: key,
                        ix: id,
                        id: `fact-identifier-${factCounter++}`,
                        value: this.isFactHTML(current._text) ? this.updateValueToRemoveIDs(current._text) : current._text,
                        isAmountsOnly: this.isFactAmountsOnly(current._text),
                        isTextOnly: !this.isFactAmountsOnly(current._text),
                        isNegativeOnly: this.isFactNegativeOnly(current._text),
                        isHTML: this.isFactHTML(current._text),
                        period: this.setPeriodInfo(attributes.contextRef, context),
                        period_dates: this.setPeriodDatesInfo(attributes.contextRef, context),
                        segment: this.setSegmentInfo(attributes.contextRef, context),
                        measure: this.setMeasureInfo(attributes.unitRef, unit),
                        scale: this.setScaleInfo(attributes.scale),
                        decimals: this.setDecimalsInfo(attributes.decimals),
                        sign: this.setSignInfo(attributes.sign),
                        footnote: this.setFootnoteInfo(id, footnote),
                        isEnabled: true,
                        isHighlight: false,
                        isSelected: false,
                        filter: {
                            content: this.getTextFromHTML(current._text),
                        },
                    });
                });
            } else {
                const attributes = { ...instance[xbrlKey][key]._attributes };
                const id = attributes.id ? attributes.id : `fact-identifier-${factCounter}`;
                delete attributes.id;

                map.set(id, {
                    ...attributes,
                    name: key,
                    ix: id,
                    id: `fact-identifier-${factCounter++}`,
                    value: this.isFactHTML(instance[xbrlKey][key]._text) ? this.updateValueToRemoveIDs(instance[xbrlKey][key]._text) : instance[xbrlKey][key]._text,
                    isAmountsOnly: this.isFactAmountsOnly(instance[xbrlKey][key]._text),
                    isTextOnly: !this.isFactAmountsOnly(instance[xbrlKey][key]._text),
                    isNegativeOnly: this.isFactNegativeOnly(instance[xbrlKey][key]._text),
                    isHTML: this.isFactHTML(instance[xbrlKey][key]._text),
                    period: this.setPeriodInfo(attributes.contextRef, context),
                    period_dates: this.setPeriodDatesInfo(attributes.contextRef, context),
                    segment: this.setSegmentInfo(attributes.contextRef, context),
                    measure: this.setMeasureInfo(attributes.unitRef, unit),
                    scale: this.setScaleInfo(attributes.scale),
                    decimals: this.setDecimalsInfo(attributes.decimals),
                    sign: this.setSignInfo(attributes.sign),
                    footnote: this.setFootnoteInfo(id, footnote),
                    isEnabled: true,
                    isHighlight: false,
                    isSelected: false,
                    filter: {
                        content: this.getTextFromHTML(instance[xbrlKey][key]._text),
                    },
                });
            }
        }
        return map;
    }

    extractSections() {
        return Object.keys(this.sections).map((current) => {
            if (this.metaVersion >= '2.2') {
                if (this.sections[current].menuCat) {
                    this.sections[current].groupType = this.sections[current].menuCat;
                }
                return this.sections[current];
            }
            return this.sections[current];
        });
    }

    extractFormInformation(meta: Meta) {
        const metaCopy = Object.assign({}, meta);
        delete metaCopy.report;
        delete metaCopy.tag;
        return metaCopy;
    }

    mergeMapandMeta() {

        this.currentInstance.map.forEach((currentValue: {
            name: string;
            segment: [{ dimension: string, axis: string }];
            references: reference[];
            calculations: [{ label: string, value: string }];
            labels: string[];
            filter: { labels: string; definitions: string; };
            balance: string;
            xbrltype: Xbrltype | null;
            localname: string | null;
            nsuri: string | null;
            presentation: string[] | null | undefined;
        }) => {
            if (this.currentInstance.metaInstance.tag[currentValue.name.replace(':', '_')]) {
                // add references (if any) to each individual fact
                // including references via any dimension [name]
                // including references via any member [name]
                if (this.currentInstance.metaInstance.tag[currentValue.name.replace(':', '_')].auth_ref) {

                    let references = this.currentInstance.metaInstance.tag[currentValue.name.replace(':', '_')].auth_ref.map((current) => {
                        return current;
                    });

                    if (currentValue.segment) {

                        const dimensions = currentValue.segment.map((element: { dimension: string; }) => {
                            if (element.dimension && this.currentInstance.metaInstance.tag[element.dimension.replace(':', '_')]) {
                                return this.currentInstance.metaInstance.tag[element.dimension.replace(':', '_')].auth_ref ? this.currentInstance.metaInstance.tag[element.dimension.replace(':', '_')].auth_ref : null;
                            }
                        }).filter(Boolean)[0];

                        const axis = currentValue.segment.map((element: { dimension: string; axis: string; }) => {
                            if (element.dimension && this.currentInstance.metaInstance.tag[element.axis.replace(':', '_')]) {
                                return this.currentInstance.metaInstance.tag[element.axis.replace(':', '_')].auth_ref ? this.currentInstance.metaInstance.tag[element.axis.replace(':', '_')].auth_ref : null;
                            }
                        }).filter(Boolean)[0];

                        references = references.concat(dimensions).concat(axis);
                    }

                    currentValue.references = [...new Set(references)].map((current) => {
                        return this.std_ref[current];
                    }).filter(Boolean);
                    // this order specifically for Fact References
                    // any other key => value will be ignored and not shown to the user
                    const requiredOrder = [
                        `Publisher`,
                        `Name`,
                        `Number`,
                        `Chapter`,
                        `Article`,
                        `Number Exhibit Section`,
                        `Subsection`,
                        `Paragraph`,
                        `Subparagraph`,
                        `Sentence`,
                        `Clause`,
                        `Subclause`,
                        `Example`,
                        `Footnote`,
                        `URI`,
                        `URIDate`,
                    ];

                    currentValue.references = currentValue.references.map((singleReference) => {
                        return Object.keys(singleReference).reduce((accumulator, current) => {
                            const index = requiredOrder.findIndex(element => element === current);
                            if (index !== -1) {
                                const returnObject = {};
                                returnObject[current] = singleReference[current];
                                accumulator[index] = returnObject;
                            }
                            return accumulator;
                        }, new Array(Object.keys(singleReference).length).fill(null)).filter(Boolean);
                    });
                }

                // add calculations (if any) to each individual fact
                if (this.currentInstance.metaInstance.tag[currentValue.name.replace(':', '_')].calculation) {
                    const tempCalculation = this.currentInstance.metaInstance.tag[currentValue.name.replace(':', '_')].calculation;
                    currentValue.calculations = [];
                    for (const property in tempCalculation) {
                        const result = this.sections.map(element => {
                            if (element.role === property) {
                                return [
                                    {
                                        label: 'Section',
                                        value: element.longName
                                    },
                                    {
                                        label: 'Weight',
                                        value: this.getCalculationWeight(tempCalculation[property].weight)
                                    },
                                    {
                                        'label': 'Parent',
                                        value: this.getCalculationParent(tempCalculation[property].parentTag)
                                    }
                                ];
                            }
                        }).filter(Boolean);
                        currentValue.calculations = currentValue.calculations.concat(result);
                    }
                } else {
                    currentValue.calculations = [];
                }

                // add labels (if any) to each individual fact
                if (this.currentInstance.metaInstance.tag[currentValue.name.replace(':', '_')].lang) {
                    currentValue.labels = Object.keys(this.currentInstance.metaInstance.tag[currentValue.name.replace(':', '_')].lang).map((current) => {
                        const oldObject = this.currentInstance.metaInstance.tag[currentValue.name.replace(':', '_')].lang[current].role;
                        const newObject = {};
                        for (const property in oldObject) {

                            const result = property.replace(/([A-Z])/g, ' $1');
                            const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
                            Object.assign(newObject, { [finalResult]: oldObject[property] });
                        }
                        return newObject
                    });

                    currentValue.filter.labels = currentValue.labels.reduce((accumulator: string, current) => {
                        const tempCurrent = { ...current };
                        delete tempCurrent.documentation;
                        return `${accumulator} ${Object.values(tempCurrent).join(' ')}`;

                    }, '');

                    currentValue.filter.definitions = currentValue.labels.reduce((accumulator, current: { Documentation: string; }) => {
                        return `${accumulator} ${current.Documentation}`;
                    }, '');
                }

                // add credit / debit
                if (this.currentInstance.metaInstance.tag[currentValue.name.replace(':', '_')].crdr) {
                    const balance = this.currentInstance.metaInstance.tag[currentValue.name.replace(':', '_')].crdr;
                    currentValue.balance = `${balance.charAt(0).toUpperCase()}${balance.slice(1)}`;
                }

                // add xbrltype
                if (this.currentInstance.metaInstance.tag[currentValue.name.replace(':', '_')].xbrltype) {
                    currentValue.xbrltype = this.currentInstance.metaInstance.tag[currentValue.name.replace(':', '_')].xbrltype;
                }

                // add additional info to each individual fact
                currentValue.localname = this.currentInstance.metaInstance.tag[currentValue.name.replace(':', '_')].localname ? this.currentInstance.metaInstance.tag[currentValue.name.replace(':', '_')].localname : null;
                currentValue.nsuri = this.currentInstance.metaInstance.tag[currentValue.name.replace(':', '_')].nsuri ? this.currentInstance.metaInstance.tag[currentValue.name.replace(':', '_')].nsuri : null;
                currentValue.presentation = this.currentInstance.metaInstance.tag[currentValue.name.replace(':', '_')].presentation ? this.currentInstance.metaInstance.tag[currentValue.name.replace(':', '_')].presentation : null;
                currentValue.xbrltype = this.currentInstance.metaInstance.tag[currentValue.name.replace(':', '_')].xbrltype ? this.currentInstance.metaInstance.tag[currentValue.name.replace(':', '_')].xbrltype : null;
            }
        });
        // return map;
    }

    prepareXHTML() {
        this.currentInstance.xhtmls.forEach((current) => {
            if (current.xhtml) {
                let $ = cheerio.load(current.xhtml, {});
                $ = this.hiddenFacts($);
                $ = this.fixImages($);
                $ = this.fixLinks($);
                // $ = this.hiddenFacts($);
                $ = this.redLineFacts($);
                $ = this.excludeFacts($);
                const updates = this.attributeFacts($, this.currentInstance.map, current.slug);
                current.xhtml = updates.xhtml;
            }
        });

    }

    fixImages($: cheerio.CheerioAPI) {
        const startPerformance = performance.now();
        const foundImagesArray = Array.from($('img'));
        foundImagesArray.forEach((current) => {
            if (!$(current).attr('src')?.startsWith('data:')) {
                const imageSlug = $(current).attr('src')?.substr($(current).attr('src')!.lastIndexOf('/') + 1);
                $(current).attr('src', `${this.absolute}${imageSlug}`);
                $(current).attr('loading', 'lazy');
            }
        });
        const endPerformance = performance.now();
        if (LOGPERFORMANCE) {
            const items = foundImagesArray.length;
            const log: Logger<ILogObj> = new Logger();
            log.debug(`FetchAndMerge.fixImages() completed in: ${(endPerformance - startPerformance).toFixed(2)}ms - ${items} items`);
        }
        return $;
    }

    fixLinks($: cheerio.CheerioAPI) {
        const startPerformance = performance.now();
        const foundLinksArray = Array.from($('[data-link],[href]'));
        foundLinksArray.forEach((current) => {
            if (Object.prototype.hasOwnProperty.call(current.attribs, 'href')) {
                if (current.attribs.href.startsWith('http://') ||
                    current.attribs.href.startsWith('https://') ||
                    current.attribs.href.startsWith('#')) {
                    // already an absolute url, just add tabindex=18
                    $(current).attr('tabindex', '18');
                    // this anchor tag does not exsist in the current XHTML file
                    if (current.attribs.href.startsWith('#') && current.attribs.href.slice(1) && $(`#${current.attribs.href.slice(1)}`).length === 0) {
                        $(current).attr('xhtml-change', 'true');
                    }
                } else {
                    // create an absolute url, add tabindex=18
                    $(current).attr('tabindex', '18');
                    $(current).attr('href', `${this.absolute}${current.attribs.href}`);
                }
            }
            if (Object.prototype.hasOwnProperty.call(current.attribs, 'data-link')) {
                $(current).attr('tabindex', '18');
            }
        });
        const endPerformance = performance.now();
        if (LOGPERFORMANCE) {
            const items = foundLinksArray.length;
            const log: Logger<ILogObj> = new Logger();
            log.debug(`FetchAndMerge.fixLinks() completed in: ${(endPerformance - startPerformance).toFixed(2)}ms - ${items} items`);
        }
        return $;
    }

    hiddenFacts($: cheerio.CheerioAPI) {
        const startPerformance = performance.now();
        const foundElements = Array.from($('[style*="-ix-hidden"]')).slice(0, 1000);

        foundElements.forEach((current) => {
            const updatedStyle = Object.values($(current).css(["-sec-ix-hidden", "-esef-ix-hidden"]) as {}).filter(Boolean)[0];
            const hiddenElement = $(`#${updatedStyle}`);
            if ($(hiddenElement).length) {
                // console.log($(hiddenElement));
                // we now create an entirely new element based on the innerHTML
                // of current, and the attributes of hiddenElement
                const cheerioElement = $(`<${$(hiddenElement).prop('tagName')?.toLowerCase().replace(`:`, `\\:`)}>`);
                //const id = $(hiddenElement).attr('id');

                for (const key in $(hiddenElement).attr()) {

                    $(cheerioElement).attr(key, $(hiddenElement).attr(key));
                }
                $(cheerioElement).attr('isadditionalitemsonly', 'true');
                $(cheerioElement).attr('ishiddenelement', 'true');
                $(cheerioElement).html($(current).text());
                $(hiddenElement).removeAttr('id');
                $(hiddenElement).removeAttr('contextref');
                $(hiddenElement).removeAttr('name');

                //console.log($(cheerioElement).attr('id'));
                $(current).html($(cheerioElement));
                if ($(cheerioElement).attr('id') === 'id3VybDovL2RvY3MudjEvZG9jOjU1M2Q3M2I4N2RhYjQ2MzQ5ZjlmNTI3Y2YwNzZjMzlhL3NlYzo1NTNkNzNiODdkYWI0NjM0OWY5ZjUyN2NmMDc2YzM5YV82MS9mcmFnOmI0ZGUyZDM0ZWE4NTRjMTc4NmFjYWIyYzRjZWRiMmQ2L3RleHRyZWdpb246YjRkZTJkMzRlYTg1NGMxNzg2YWNhYjJjNGNlZGIyZDZfNDAwNTE_70ac34fc-cc35-4fb1-ad12-4d0f52202d63') {
                    const log: Logger<ILogObj> = new Logger();
                    log.debug($(current).html());
                }
            } else {
                const log: Logger<ILogObj> = new Logger();
                log.debug('empty!');
            }
        });
        const endPerformance = performance.now();
        if (LOGPERFORMANCE) {
            const items = foundElements.length
            const log: Logger<ILogObj> = new Logger();
            log.debug(`FetchAndMerge.hiddenFacts() completed in: ${(endPerformance - startPerformance).toFixed(2)}ms - ${items} items`);
        }
        return $;
    }

    /**
     * Description
     * @param {any} $:cheerio.CheerioAPI
     * @returns {any}
     */
    redLineFacts($: cheerio.CheerioAPI) {
        const startPerformance = performance.now();
        
        ['redline', 'redact'].forEach((r) => {
            const foundElements = Array.from($('[style*="-ix-' + r + '"]'));
            
            if (Object.prototype.hasOwnProperty.call(this.params, 'redline') && this.params.redline) {
                if (!PRODUCTION) {
                    const log: Logger<ILogObj> = new Logger();
                    log.debug(`ix-${r} styles Found: ${foundElements.length}`);
                }
                foundElements.forEach((current) => {
                    const updatedStyle = Object.values($(current).css(["-sec-ix-" + r, "-esef-ix-" + r]) as {}).filter(Boolean)[0];
                    if (updatedStyle === "true") {
                        $(current).attr(r, 'true');
                    }
                });
            }
        });
        const endPerformance = performance.now();
        if (LOGPERFORMANCE) {
            const items = foundElements.length;
            const log: Logger<ILogObj> = new Logger();
            log.debug(`FetchAndMerge.redLineFacts() completed in: ${(endPerformance - startPerformance).toFixed(2)}ms - ${items} items`);
        }
        return $;
    }

    excludeFacts($: cheerio.CheerioAPI) {
        const startPerformance = performance.now();
        const foundElements = Array.from($('[style*=":exclude"]'));
        foundElements.forEach((current) => {
            $(current).addClass('no-hover');
        });
        const endPerformance = performance.now();
        if (LOGPERFORMANCE) {
            const items = foundElements.length;
            const log: Logger<ILogObj> = new Logger();
            log.debug(`FetchAndMerge.excludeFacts() completed in: ${(endPerformance - startPerformance).toFixed(2)}ms - ${items} items`);
        }
        return $;
    }

    attributeFacts($: cheerio.CheerioAPI, map: Map<string, SingleFact>, currentSlug: string) {
        const startPerformance = performance.now();

        const foundElements = Array.from($(`[contextRef]`));

        foundElements.forEach((current) => {
            $(current).attr("selected-fact", 'false');
            $(current).attr("hover-fact", 'false');
            $(current).attr("continued-fact", 'false');
            $(current).closest('table').length ? $(current).attr("inside-table", 'true') : $(current).attr("inside-table", 'false');

            if ($(current).attr('contextref') && $(current).attr('id')) {

                $(current).attr('ix', $(current).attr('id'));
                $(current).attr('id', this.updateMap($(current)?.attr('ix') as string, $(current), currentSlug));
            }
            if (!$(current).prop('tagName').toLowerCase().endsWith("continuation") &&
                $(current).attr("continuedat")
            ) {
                $(current).attr("continued-main-fact", 'true');
            }

            if ($(current).attr('contextref') && !$(current).attr('id')) {
                // for the facts in the html that have no ids...
                const getByNameAndContextRef = (searchContextref: string | undefined, searchName: string | undefined) => {
                    for (const [key, value] of this.currentInstance.map.entries()) {
                        if (value.contextRef === searchContextref && value.name === searchName) {
                            return key;
                        }
                    }
                };
                const mapKey = getByNameAndContextRef($(current).attr('contextref'), $(current).attr('name'));
                if (mapKey) {

                    $(current).attr('ix', mapKey);
                    $(current).attr('id', mapKey);
                    this.updateMap($(current)?.attr('ix') as string, $(current), currentSlug);
                } else {
                    const log: Logger<ILogObj> = new Logger();
                    log.error(`Fact [name] && [contextRef] could not be located in the Map Object.`);
                }
            }
            $(current).wrap(`<span></span>`);
        });
        // TODO is this a good idea?
        // $(`${namespace}\\:header`).remove();
        const endPerformance = performance.now();
        if (LOGPERFORMANCE) {
            const items = foundElements.length;
            const log: Logger<ILogObj> = new Logger();
            log.debug(`FetchAndMerge.attributeFacts() completed in: ${(endPerformance - startPerformance).toFixed(2)}ms - ${items} items`);
        }

        return { xhtml: $.html(), map };
    }

    updateMap(ix: string, element: cheerio.Cheerio<cheerio.Element>, currentSlug: string) {
        this.currentInstance.map.set(
            ix,
            {
                ...this.currentInstance.map.get(ix),
                raw: element.text(),
                format: element.attr('format') ? element.attr('format') : null,
                isAdditional: element.parents().prop('tagName').toLowerCase().endsWith(':hidden'),
                isCustom: (element.attr('name')?.split(':')[0].toLowerCase() === this.customPrefix),
                isAmountsOnly: element.prop('tagName')?.split(':')[1].toLowerCase() === 'nonfraction',
                isTextOnly: element.prop('tagName')?.split(':')[1].toLowerCase() === 'nonnumeric',
                isNegativeOnly: element.attr('sign') === '-',
                file: currentSlug,
                scale: element.attr('scale') ? this.setScaleInfo(element.attr('scale') as unknown as number) : null,
                continuedIDs: []
            });

        return this.currentInstance.map.get(ix).id;
    }

    updateValueToRemoveIDs(input: string) {
        const $ = cheerio.load(input, { xml: false });
        $('[id]').each(function () {
            $(this).removeAttr('id');
        });
        // we also wrap the entirity of the html in a simple div
        $('body ').wrapInner('<div></div>');
        return $.html('body');
    }

    isFactAmountsOnly(input: string) {
        return /^-?\d+\d*$/.test(input);
    }

    isFactNegativeOnly(input: string) {
        return this.isFactAmountsOnly(input) && input.startsWith('-');
    }

    isFactHTML(input: string) {
        return /<\/?[a-z][\s\S]*>/i.test(input);
    }

    getTextFromHTML(input: string) {
        if (this.isFactHTML(input)) {
            const $ = cheerio.load(input);
            return $.text();
        }
        return input;
    }

    setPeriodText(context: Context[]) {
        context = Array.isArray(context) ? context : [context];
        context?.forEach((current) => {
            if (current.period) {
                if (current.period.instant) {
                    const date = new Date(current.period.instant._text);
                    current.period._array = [`${date.getMonth() + 1}/${date.getUTCDate()}/${date.getFullYear()}`];
                    current.period._text = `As of ${date.getMonth() + 1}/${date.getUTCDate()}/${date.getFullYear()}`;

                } else if (current.period.startDate && current.period.endDate) {
                    const startDate = new Date(current.period.startDate._text);
                    const endDate = new Date(current.period.endDate._text);

                    const yearDiff = endDate.getFullYear() - startDate.getFullYear();
                    const monthDiff = endDate.getMonth() - startDate.getMonth() + (yearDiff * 12);
                    current.period._array = [
                        `${startDate.getMonth() + 1}/${startDate.getUTCDate()}/${startDate.getFullYear()}`,
                        `${endDate.getMonth() + 1}/${endDate.getUTCDate()}/${endDate.getFullYear()}`
                    ];
                    if (monthDiff <= 0) {
                        current.period._text = `${startDate.getMonth() + 1}/${startDate.getUTCDate()}/${startDate.getFullYear()} - ${endDate.getMonth() + 1}/${endDate.getUTCDate()}/${endDate.getFullYear()}`;
                    } else {
                        current.period._text = `${monthDiff} months ending ${endDate.getMonth() + 1}/${endDate.getUTCDate()}/${endDate.getFullYear()}`;
                    }
                } else {
                    const log: Logger<ILogObj> = new Logger();
                    log.error(`\nFact Period is NEITHER Instant or Start / End`);
                }

            }
        });
    }

    setPeriodInfo(contextRef: string, context: [Context]) {
        // we go through and find the 'id' in context that equals contextRef
        context = Array.isArray(context) ? context : [context];
        const factContext = context?.find((element) => {
            return element._attributes.id === contextRef;
        });
        if (factContext && factContext.period) {
            return factContext.period._text;
        }
    }

    setPeriodDatesInfo(contextRef: string, context: [Context]) {
        // we go through and find the 'id' in context that equals contextRef
        context = Array.isArray(context) ? context : [context];
        const factContext = context?.find((element) => {
            return element._attributes.id === contextRef;
        });
        if (factContext && factContext.period) {
            return factContext.period._array;
        }
    }

    setSegmentData(context: Context | undefined) {
        context = Array.isArray(context) ? context : [context];
        context.forEach((current) => {
            if (current.entity && current.entity.segment) {
                current.entity.segment.data = Object.keys(current.entity.segment).map((key) => {
                    if (Array.isArray(current.entity.segment[key])) {
                        return current.entity.segment[key].map((segment: { _attributes: { dimension: string; }; _text: string; }) => {
                            return {
                                axis: segment._attributes.dimension,
                                dimension: segment._text,
                                type: key.endsWith('explicitMember') ? 'explicit' : 'implicit'
                            }
                        });
                    } else {
                        return {
                            axis: current.entity.segment[key]._attributes.dimension,
                            dimension: current.entity.segment[key]._text ?
                                current.entity.segment[key]._text :
                                current.entity.segment[key][Object.keys(current.entity.segment[key]).filter(element => !element.startsWith('_'))[0]]?._text,
                            type: key.endsWith('explicitMember') ?
                                'explicit' :
                                'implicit',
                            value: !key.endsWith('explicitMember') ?
                                current.entity.segment[key][Object.keys(current.entity.segment[key])[1]]._text :
                                null
                        };
                    }
                });
            }

        });
    }

    setSegmentInfo(contextRef: string, context: [Context]) {
        context = Array.isArray(context) ? context : [context];
        const factContext = context?.find((element) => {
            return element._attributes.id === contextRef;
        });
        if (factContext && factContext.entity && factContext.entity.segment) {
            return factContext.entity.segment.data;
        }
    }

    setMeasureText(unit: Units[] | undefined) {
        unit = Array.isArray(unit) ? unit : [unit];
        unit.forEach((current: { measure: { _text: string; }; _text: string; divide: { unitNumerator: { measure: { _text: string; }; }; unitDenominator: { measure: { _text: string; }; }; }; }) => {
            if (current && current.measure) {
                const measure = current.measure._text.includes(':') ?
                    current.measure._text.split(':')[1].toUpperCase() :
                    current.measure._text.toUpperCase();
                current._text = measure;

            } else if (current && current.divide) {
                const numerator = current.divide.unitNumerator.measure._text.includes(':') ?
                    current.divide.unitNumerator.measure._text.split(':')[1].toUpperCase() :
                    current.divide.unitNumerator.measure._text.toUpperCase();

                const denominator = current.divide.unitDenominator.measure._text.includes(':') ?
                    current.divide.unitDenominator.measure._text.split(':')[1].toUpperCase() :
                    current.divide.unitDenominator.measure._text.toUpperCase();

                current._text = `${numerator} / ${denominator}`;
            }

        });
    }

    setMeasureInfo(unitRef: string, unit: Units) {
        if (unit) {
            const factUnit = Array.isArray(unit) ? unit.find((element: { _attributes: { id: string; }; }) => {
                return element._attributes.id === unitRef;
            }) : [unit].find((element: { _attributes: { id: string; }; }) => {
                return element._attributes.id === unitRef;
            });

            if (
                factUnit &&
                (Object.prototype.hasOwnProperty.call(factUnit, 'measure') || Object.prototype.hasOwnProperty.call(factUnit, 'divide'))
            ) {
                return factUnit._text;
            }
        }
    }

    setScaleInfo(scale: number) {
        if (scale) {
            const scaleOptions = {
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
            return scaleOptions[scale];
        }
        return null;
    }

    setDecimalsInfo(decimals: string) {
        if (decimals) {
            const decimalsOptions = {
                "-1": "Tens",
                "-2": "Hundreds",
                "-3": "Thousands",
                "-4": "Ten thousands",
                "-5": "Hundred thousands",
                "-6": "Millions",
                "-7": "Ten Millions",
                "-8": "Hundred Millions",
                "-9": "Billions",
                "-10": "Ten Billions",
                "-11": "Hundred Billions",
                "-12": "Trillions",
                1: "Tenths",
                2: "Hundredths",
                3: "Thousandths",
                4: "Ten Thousandths",
                5: "Hundred Thousandths",
                6: "Millionths"
            };
            return decimalsOptions[decimals];
        }
        return null;
    }

    setSignInfo(sign: string) {
        if (sign) {
            const signOptions = {
                '-': 'Negative',
                '+': 'Positive'
            };
            return signOptions[sign];
        }
        return null;
    }

    /**
     * Description
     * @param {any} ftObj:object
     * @param {any} result?:string|undefined
     * @returns {any} concatenated text from all footnote nodes, joined by a ' '
     */
    accumulateFootnote(ftObj: object, result?: string | undefined) {
        if (typeof(result) == "undefined") result = "";
        const truncateFootnoteTo = 100;

        if (result?.length > truncateFootnoteTo) {
            result = result.substring(0, truncateFootnoteTo).substring(0, result.lastIndexOf(" ") + 1);
            return result += ' ...';
        }

        // let text = ''; //accumulate "mixed-content" text to apply after depth first descent
        Object.keys(ftObj).forEach(node => {
            if (node == "_text") {
                result += ftObj[node] + ' ';
            }
            else if (Array.isArray(ftObj[node])) {
                ftObj[node].forEach(childNode => {
                    result = this.accumulateFootnote(childNode, result);
                })
            }
            else if (node.substring(0,6) == "xhtml:") {
                result = this.accumulateFootnote(ftObj[node], result);
            }
        });
        return result;
    }

    /**
     * Description
     * @param {any} id:string
     * @param {any} footnotes:{"link:loc":LinkLOC[]
     * @param {any} "link:footnote":LinkFootnote[];"link:footnoteArc":LinkFootnoteArc[];}
     * @param {string} asXmlString footnotes part of fetched xml text
     * @returns {any} renderable footnote text (or xml string) to be displayed in fact modal
     * todo: handle incoming footnotes.asXmlString or footnotes.xmlExpanded to show all content (in order) instead of just text
     * todo: handle images, tables, ...other html elements (currently just concatenating text content)
     * the above todos are WIP and are handled when useFetchedFootnoteXmlStrings is set to true.
     */
    setFootnoteInfo(id: string, footnotes: {
        "link:loc": LinkLOC[],
        "link:footnote": LinkFootnote[],
        "link:footnoteArc": LinkFootnoteArc[],
        "asXmlString": string,
    }) {
        if (footnotes && footnotes['link:footnoteArc']) {
            const factFootnote = Array.isArray(footnotes['link:footnoteArc']) 
                ? footnotes['link:footnoteArc'].find((element) => element._attributes['xlink:from'] === id ) 
                : [footnotes['link:footnoteArc']].find((element) => element._attributes['xlink:from'] === id )
            if (factFootnote) {
                if (footnotes['link:footnote']) {
                    if (Array.isArray(footnotes['link:footnote'])) {
                        const actualFootnote = footnotes['link:footnote']?.find((element) => {
                            return element._attributes.id === factFootnote._attributes['xlink:to'];
                        });

                        const useFetchedFootnoteXmlStrings = false;
                        const useParsedFootnote = !useFetchedFootnoteXmlStrings;

                        if (useParsedFootnote) {
                            return this.accumulateFootnote(actualFootnote);
                        }

                        // Rest of this if block is WIP for rendering all div types in footnote cell

                        // GO FIND PART OF footnotes.xmlString that corresponds to actual footnote
                        // return that substring ... so you can render it in fact-pages.ts
                        // we only need '<link:footnote ... > string for each footnote to render
                        // find all <link:footnote ... > xml strings and put in array
                        // then find the one that matches the xlink:to value with its id

                        const startTagRegex = /<link:footnote /gi; 
                        let startTagResults = '';
                        const footnoteStartIndices:number[] = [];
                        while ( (startTagResults = startTagRegex.exec(footnotes.asXmlString)) ) {
                            footnoteStartIndices.push(startTagResults.index);
                        }

                        const endTagRegex = /<\/link:footnote>/gi; 
                        let endTagResults = '';
                        const footnoteEndIndices:number[] = [];
                        while ( (endTagResults = endTagRegex.exec(footnotes.asXmlString)) ) {
                            footnoteEndIndices.push(endTagResults.index + ('</link:footnote>').length);
                        }

                        const footnotesAsXmlStrings:string[] = [];

                        footnoteStartIndices.forEach((start, indexInArrayOfStarts) => {
                            const pluckedFootnote = footnotes.asXmlString.substring(start, footnoteEndIndices[indexInArrayOfStarts]);
                            footnotesAsXmlStrings.push(pluckedFootnote);
                        })

                        const relevantFootnoteAsXmlString = footnotesAsXmlStrings.find(fn => {
                            return fn.indexOf(factFootnote._attributes['xlink:to']) != -1;
                        })

                        return relevantFootnoteAsXmlString;
                    } else {
                        // TODO we need way more cases
                        if (!Array.isArray(footnotes['link:footnote']._text)) {
                            return footnotes;
                            // return footnotes['link:footnote']._text;
                        } else if (Array.isArray(footnotes['link:footnote']._text)) {
                            return footnotes['link:footnote']._text.join('');
                        } else if (footnotes['link:footnote']['xhtml:span']) {
                            return footnotes['link:footnote']['xhtml:span']._text;
                        }
                    }
                }
            }
        }
        return null;
    }

    getCalculationWeight(weight: number) {
        if (weight) {
            return weight > 0 ?
                `Added to parent(${weight.toFixed(2)})` :
                `Substracted from parent(${weight.toFixed(2)})`
        }
        return 'Not Available.';
    }

    getCalculationParent(parent: string) {
        if (parent) {
            return parent.replace('_', ':');
        }
        return 'Not Available.';
    }
}