import * as cheerio from 'cheerio';
import * as convert from 'xml-js';
import { Meta, Xbrltype, reference } from '../interface/meta';
import { FetchedInstance } from '../interface/instance';
import { Context, DeiAmendmentFlagAttributes, Instance, LinkFootnote, LinkFootnoteArc, LinkLOC, Units } from '../interface/instance';
import { Section } from '../interface/meta';
import { Reference, SingleFact } from '../interface/fact';
import { Logger, ILogObj } from 'tslog';
import { cleanSubstring } from '../helpers/utils';
import { buildSectionsArrayFlatter } from './merge-data-utils';

/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

console.warn("BUILD/DEPLOYMENT TEST: verified to be working");


export class FetchAndMerge
{
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
    private sections: Array<Section>;
    private metaVersion: string | undefined;
    private instances;
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
        this.instances = input.instance;
        this.std_ref = input.std_ref;
    }

    init() {

        /**
         * Description
         * @param {any} instances
         * @param {any} initialLoad=false
         * @returns {
         *  instance: {},
         *  sections: {},
         *  std_ref: string
         * }
         */
        const XHTMLandInstance = (instances, initialLoad = false) => {
            return Promise.all([
                this.fetchXHTML(), // .htm
                this.fetchInstancesXmls(), // .xml(s)
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
                this.mergeAllResponses(initialLoad);

                const all = {
                    instance: (initialLoad ? instances.instance : instances),
                    // sections: this.sections,
                    std_ref: this.std_ref
                }
                if (this.sections) {
                    all.sections = this.sections;
                }

                return {
                    all
                }
            })
        };

        const MetaandSummary = () => {
            return Promise.all([
                this.fetchMeta(),
                this.fetchSummary(),
            ]).then((allResponses) => {
                const metalinks = allResponses[0];
                const filingSummary = allResponses[1];

                this.metaVersion = metalinks.version;
                this.std_ref = metalinks.std_ref;
                if (allResponses.some((element) => element.error)) {
                    const messageIndex = allResponses.find((element) => element.error);
                    return {
                        all: { error: true, message: [messageIndex.message] }
                    }
                } else {
                    this.currentInstance = metalinks.instance?.filter(element => element.current)[0];
                    const metaLinksSections = Object.values(metalinks.sections); // ingoring keys R1, R2, ...

                    // iterate over FilingSummary.xml Reports to build sections, adding data from metalinks
                    this.sections = buildSectionsArrayFlatter(filingSummary, metaLinksSections, this.metaVersion);
                }
                return Promise.all([
                    XHTMLandInstance(metalinks, true)
                ]).then(data => {
                    return data[0];
                })
            });
        };
        if (this.instances !== null) {
            // switching instance
            this.currentInstance = this.instances.filter(element => element.current)[0];
            return XHTMLandInstance(this.instances);
        } else {
            // initial load
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

    /**
     * Description
     * @returns {any} => current .htm file (xhtml file)
     */
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
            let jsonUrl = this.params.metalinks;
            const isWorkstation = jsonUrl.includes("DisplayDocument.do?");
            if (isWorkstation) {
                if (Object.prototype.hasOwnProperty.call(this.params, 'redline') && this.params.redline) {
                    jsonUrl = jsonUrl.replace('MetaLinks.json', 'PrivateMetaLinks.json')
                }
            }
            return fetch(jsonUrl, { credentials: 'include' }).then((response) => {
                if (response.status >= 200 && response.status <= 299) {
                    return response.json();
                } else {
                    throw Error(response.status.toString());
                }
            }).then((data) => {

                let XHTMLSlug = this.params.doc.substring(this.params.doc.lastIndexOf('/') + 1);
                if (XHTMLSlug.startsWith("DisplayDocument.do") || XHTMLSlug.startsWith("view.html")) {
                    XHTMLSlug = this.params.doc.substring(this.params.doc.lastIndexOf('filename=') + 9);
                }
                const instanceFileNames = Object.keys(data.instance).join().split(/[ ,]+/);
                let sections = {}
                if (instanceFileNames.includes(XHTMLSlug)) {
                    const instanceObjects = Object.keys(data.instance).map((currentInstance, instanceIndex) => {

                        // Sections
                        Object.keys(data.instance[currentInstance].report).forEach((report) => {
                            data.instance[currentInstance].report[report].instanceIndex = instanceIndex; // why?
                        });
                        Object.values(data.instance[currentInstance].report).forEach(report => {
                            report.instanceHtm = currentInstance;
                        });
                        sections = Object.assign(sections, data.instance[currentInstance].report);

                        /* 
                            if instance key has space, e.g. 
                                "doc1.htm doc2.htm": {...}, 
                            it is known as multi doc.
                        */
                        const xhtmls = currentInstance.split(' ').map((element) => {
                            return {
                                slug: element,
                                url: this.params.doc.replace(this.params['doc-file'], element),
                                current: currentInstance.split(' ').includes(XHTMLSlug) && element === this.params['doc-file'],
                                loaded: false
                            };
                        });

                        const xmlSlugs = xhtmls.map(element => element.slug.replace('.htm', '_htm.xml'));
                        const xmlUrls = xhtmls.map(element => this.params.metalinks.replace('MetaLinks.json', element.slug.replace('.htm', '_htm.xml')));
                        return {
                            instanceHtm: currentInstance,
                            instance: instanceIndex, // Why?
                            xhtmls: xhtmls,
                            current: currentInstance.split(' ').includes(XHTMLSlug),
                            xmlSlug: xmlSlugs,
                            xmlUrls: xmlUrls,
                            metaInstance: Object.assign(data.instance[currentInstance]),
                            map: new Map()
                        }
                    });
                    delete data.instance;
                    resolve({ instance: instanceObjects, ...data, sections, version: data.version });
                } else {
                    // this may occur when transferring a filing from one domain to another.  Not sure how to fix..
                    if (!PRODUCTION) {
                        console.log('instanceFileNames does not include XHTMLSlug. fetch-merge > fetchMeta())')
                    }
                    throw Error('Incorrect MetaLinks.json Instance');
                }
                resolve(data);
            }).catch((error) => resolve({ error: true, message: `${error}, Could not find "${this.params.metalinks}"` }))
        });
    }

    fetchSummary() {
        return new Promise((resolve) => {
            let xmlUrl = this.params.summary;
            const isWorkstation = xmlUrl.includes("DisplayDocument.do?");
            if (isWorkstation) {
                if (Object.prototype.hasOwnProperty.call(this.params, 'redline') && this.params.redline) {
                    xmlUrl = xmlUrl.replace('FilingSummary.xml', 'PrivateFilingSummary.xml')
                }
            }
            return fetch(xmlUrl, { credentials: 'include' }).then((response) => {
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

    fetchInstancesXmls() {
        const promises = this.currentInstance?.xmlUrls.map((xmlUrl: string) => {
            let _xmlUrl = xmlUrl;
            const isWorkstation = _xmlUrl.includes("DisplayDocument.do?");
            if (isWorkstation) {
                // If methods from HelpersUrl are used here some very strange bugs occur, such as window and localStorage undefined.
                if (Object.prototype.hasOwnProperty.call(this.params, 'redline') && this.params.redline) {
                    _xmlUrl = _xmlUrl.replace('_htm.xml', '_ht2.xml')
                } else {
                    _xmlUrl = _xmlUrl.replace('_htm.xml', '_ht1.xml')
                }
            }
            return new Promise((resolve) =>
                fetch(_xmlUrl).then((response) => {
                    if (response.status >= 200 && response.status <= 299) {
                        return response.text();
                    } else {
                        const indexOf = this.currentInstance.xmlUrls.indexOf(xmlUrl);
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
        return Promise.all(promises).then((xmlInstances: Array<FetchedInstance>) => {
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
                }
                // return instanceXmlAsJsonCompact.xbrl["link:footnoteLink"].asXmlString
                return instanceXmlAsJsonCompact;
            } else {
                return xmlInstances[0];
            }
        });
    }

    mergeAllResponses(
        initialLoad: boolean
    ) {
        this.currentInstance.map = this.buildInitialFactMap(this.currentInstance.xml, this.currentInstance.xhtmls[0].slug);
        if (initialLoad) {
            this.sections = this.extractSections(); // not sure what this was for, except maybe adding .groupType
        }
        this.currentInstance.formInformation = this.extractFormInformation(this.currentInstance.metaInstance);
        this.enrichFactMapWithMetalinksData();
        this.customPrefix = this.currentInstance.metaInstance.nsprefix;
        this.prepareXHTMLForCurrentInstance();
        return;
    }

    buildInitialFactMap(instanceXml: Instance, fileSlug: string) {

        const getInstancePrefix = (instance) => {
            const options = Object.keys(instance).filter(element => element.endsWith(':xbrl'))[0];
            return options ? options.split(':')[0] : false;
        };
        const prefix = getInstancePrefix(instanceXml);

        const xbrlKey = prefix ? `${(prefix as string)}:xbrl` : 'xbrl';
        const contextKey = prefix ? `${(prefix as string)}:context` : 'context';
        const unitKey = prefix ? `${(prefix as string)}:unit` : 'unit';

        const context = instanceXml[xbrlKey][contextKey];
        const unit = instanceXml[xbrlKey][unitKey];
        const footnote = instanceXml[xbrlKey]['link:footnoteLink'];

        delete instanceXml[xbrlKey][contextKey];
        delete instanceXml[xbrlKey][unitKey];
        delete instanceXml[xbrlKey]._attributes;
        delete instanceXml[xbrlKey]['link:schemaRef'];
        delete instanceXml[xbrlKey]['link:footnoteLink'];
        this.setPeriodText(context);
        this.setSegmentData(context);
        this.setMeasureText(unit);
        const map = new Map();
        let factCounter = 0;
        for (const key in instanceXml[xbrlKey]) {
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
            if (Array.isArray(instanceXml[xbrlKey][key])) { // this first block might handle multi instance filings.
                instanceXml[xbrlKey][key].forEach((current: { _attributes: DeiAmendmentFlagAttributes; _text: string; }) => {
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
                        file: fileSlug
                    });
                });
            } else {
                const attributes = { ...instanceXml[xbrlKey][key]._attributes };
                const id = attributes.id ? attributes.id : `fact-identifier-${factCounter}`;
                delete attributes.id;

                map.set(id, {
                    ...attributes,
                    name: key,
                    ix: id,
                    id: `fact-identifier-${factCounter++}`,
                    value: this.isFactHTML(instanceXml[xbrlKey][key]._text) ? this.updateValueToRemoveIDs(instanceXml[xbrlKey][key]._text) : instanceXml[xbrlKey][key]._text,
                    isAmountsOnly: this.isFactAmountsOnly(instanceXml[xbrlKey][key]._text),
                    isTextOnly: !this.isFactAmountsOnly(instanceXml[xbrlKey][key]._text),
                    isNegativeOnly: this.isFactNegativeOnly(instanceXml[xbrlKey][key]._text),
                    isHTML: this.isFactHTML(instanceXml[xbrlKey][key]._text),
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
                        content: this.getTextFromHTML(instanceXml[xbrlKey][key]._text),
                    },
                    file: fileSlug
                });
            }
            // console.log('instanceXml[xbrlKey][key]', key, instanceXml[xbrlKey][key])
        }
        return map;
    }

    extractSections() {
        return this.sections.map((section) => {

            // groupType is used in Metalinks v2.1 (and presumably earlier) and was replaced by menuCat in 2.2
            if (Number(this.metaVersion) >= 2.2) {
                if (section.menuCat) {
                    section.groupType = section.menuCat;
                } 
            } 
            // else {
            //     section.menuCat = section.subGroupType;
            // }
            return section;
        });
    }

    extractFormInformation(meta: Meta) {
        const metaCopy = Object.assign({}, meta);
        delete metaCopy.report;
        delete metaCopy.tag;
        return metaCopy;
    }

    /**
     * Description
     * @returns {any} => updates instance fact map (this.currentInstance.map) with data from meta (this.currentInstance.metaInstance)
     */
    enrichFactMapWithMetalinksData() {
        this.currentInstance?.map.forEach((currentFact: {
            name: string;
            segment: [{ dimension: string, axis: string }];
            references: reference[];
            calculations: [{ label: string, value: string }] | [];
            labels: string[];
            filter: { labels: string; definitions: string; };
            balance: string;
            xbrltype: Xbrltype | null;
            localname: string | null;
            nsuri: string | null;
            presentation: string[] | null | undefined;
        }) => {
            /* 
                @Doc: Fact 'tags' in metalinks.json vs fact 'names' in instance and xhtmls files
                facts are stored in metalinks.json under instance[<instanceName>].tags
                Not sure why they are called 'tags'
                Tags in xbrl speak are 'concepts', which are also qNames.
                Some tag names looke like: 
                    dei_AmendmentDescription
                They have an underscore, but in the instance and xhtml files they have colons. 
                    dei:AmendmentDescription
            */
            const factNameTag = currentFact.name.replace(':', '_');
            const factObjectMl = this.currentInstance.metaInstance.tag[factNameTag]; // Ml being metalinks

            if (factObjectMl) {

                /* add references (if any) to each individual fact
                including references via any dimension [name]
                including references via any member [name] */
                if (factObjectMl.auth_ref) {

                    let references = factObjectMl.auth_ref.map((authRef) => {
                        return authRef;
                    });

                    if (currentFact.segment) {
                        const dimensions = currentFact.segment.map((element: { dimension: string; }) => {
                            if (element.dimension && this.currentInstance.metaInstance.tag[element.dimension.replace(':', '_')]) {
                                return this.currentInstance.metaInstance.tag[element.dimension.replace(':', '_')].auth_ref ? this.currentInstance.metaInstance.tag[element.dimension.replace(':', '_')].auth_ref : null;
                            }
                        }).filter(Boolean)[0];

                        const axis = currentFact.segment.map((element: { dimension: string; axis: string; }) => {
                            if (element.dimension && this.currentInstance.metaInstance.tag[element.axis.replace(':', '_')]) {
                                return this.currentInstance.metaInstance.tag[element.axis.replace(':', '_')].auth_ref ? this.currentInstance.metaInstance.tag[element.axis.replace(':', '_')].auth_ref : null;
                            }
                        }).filter(Boolean)[0];

                        references = references.concat(dimensions).concat(axis);
                    }

                    currentFact.references = [...new Set(references)].map((current) => {
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
                        `Number`,
                        `Exhibit`,
                        `Section`,
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
                    currentFact.references = currentFact.references.map((singleReference) => {
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
                if (factObjectMl.calculation) {
                    // console.log('this.currentInstance.metaInstance', this.currentInstance.metaInstance)
                    const tempFactCalculation = factObjectMl.calculation;
                    currentFact.calculations = [];
                    for (const factCalculationProp in tempFactCalculation) {
                        const result = this.sections?.map(sectionElement => {
                            if (sectionElement.role === factCalculationProp) {
                                /*
                                    Walter comment: "Although I traced the root cause to a problem in entry point sbsef-fex, still, 
                                    user actions can cause this.sections to be unbound when switching from one instance to another via the “instance” menu.  
                                    So, this section should probably make sure that this.sections is at least an empty list:"
                                */
                                return [
                                    {
                                        label: 'Section',
                                        value: sectionElement.longName
                                    },
                                    {
                                        label: 'Weight',
                                        value: this.getCalculationWeight(tempFactCalculation[factCalculationProp].weight)
                                    },
                                    {
                                        'label': 'Parent',
                                        value: this.getCalculationParent(tempFactCalculation[factCalculationProp].parentTag)
                                    }
                                ];
                            }
                        }).filter(Boolean);
                        currentFact.calculations = currentFact.calculations.concat(result);
                    }
                } else {
                    currentFact.calculations = [];
                }

                // add labels (if any) to each individual fact
                if (factObjectMl.lang) {
                    currentFact.labels = Object.keys(factObjectMl.lang).map((current) => {
                        const oldObject = factObjectMl.lang[current].role;
                        const newObject = {};
                        for (const property in oldObject) {

                            const result = property.replace(/([A-Z])/g, ' $1');
                            const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
                            Object.assign(newObject, { [finalResult]: oldObject[property] });
                        }
                        return newObject
                    });

                    currentFact.filter.labels = currentFact.labels.reduce((accumulator: string, current) => {
                        const tempCurrent = { ...current };
                        delete tempCurrent.documentation;
                        return `${accumulator} ${Object.values(tempCurrent).join(' ')}`;

                    }, '');

                    currentFact.filter.definitions = currentFact.labels.reduce((accumulator, current: { Documentation: string; }) => {
                        return `${accumulator} ${current.Documentation}`;
                    }, '');
                }

                // add credit / debit
                if (factObjectMl.crdr) {
                    const balance = factObjectMl.crdr;
                    currentFact.balance = `${balance.charAt(0).toUpperCase()}${balance.slice(1)}`;
                }

                // add xbrltype
                if (factObjectMl.xbrltype) {
                    currentFact.xbrltype = factObjectMl.xbrltype;
                }

                // add additional info to each individual fact
                currentFact.localname = factObjectMl.localname ? factObjectMl.localname : null;
                currentFact.nsuri = factObjectMl.nsuri ? factObjectMl.nsuri : null;
                currentFact.presentation = factObjectMl.presentation ? factObjectMl.presentation : null;
                currentFact.xbrltype = factObjectMl.xbrltype ? factObjectMl.xbrltype : null;
            }
        });
    }

    prepareXHTMLForCurrentInstance() {
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
                    if (current.attribs.href.startsWith('#') 
                        && current.attribs.href.slice(1) 
                        && $(`[id='${current.attribs.href.slice(1)}']`).length === 0
                    ) {
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
        let foundElements = [];
        
        ['redline', 'redact'].forEach((r) => {
            foundElements = Array.from($('[style*="-ix-' + r + '"]'));
            
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
            const items = foundElements?.length;
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