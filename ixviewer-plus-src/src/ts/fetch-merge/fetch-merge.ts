import * as cheerio from 'cheerio';
import * as convert from 'xml-js';
import { Meta, Xbrltype, reference } from '../interface/meta';
import { FetchedInstance, UnitsAdditional } from '../interface/instance';
import { Context, DeiAmendmentFlagAttributes, Instance, LinkFootnote, LinkFootnoteArc, LinkLOC, Units } from '../interface/instance';
import { Section } from '../interface/meta';
import { Reference, SingleFact } from '../interface/fact';
import { Logger, ILogObj } from 'tslog';
import { cleanSubstring } from '../helpers/utils';
import { buildSectionsArrayFlatter } from './merge-data-utils';
import { InstanceFile, MetaLinks, MetaLinksResponse } from '../interface/instance-file';
import { FilingSummary, Report } from '../interface/filing-summary';
import { UrlParams } from '../interface/url-params';

/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

/* eslint-disable @typescript-eslint/ban-types */

type ErrorResponse = { error: true, message: string };

export class FetchAndMerge {
    private absolute: string;
    private params: UrlParams;
    private customPrefix: undefined | string;
    private activeInstance: InstanceFile = {} as any;
    private std_ref;
    private sections: Array<Section> = [];
    private metaVersion: string | null = null;
    private instances;
    // private partial: unknown | null;
    // private map: unknown | null;


    constructor(input: {
        absolute: string,
        params: UrlParams,
        instance: number | null,
        // partial?: unknown,
        // map?: unknown,
        customPrefix?: string,
        std_ref: { [key: string]: Reference },
    }) {
        this.absolute = input.absolute;
        // this.partial = input.partial || null;
        // this.map = input.map || null;
        this.params = input.params;
        this.customPrefix = input.customPrefix;
        this.instances = input.instance;
        this.std_ref = input.std_ref;
    }

    init() {
        /**
         * Description
         * @param {any} instances
         * @param Boolean initialLoad=false
         * @returns {
         *  instance: {},
         *  sections: {},
         *  std_ref: string
         * }
         */
        const XHTMLandInstance = (instances: { instance: unknown }, initialLoad = false) => {
            return Promise.all([
                this.fetchXHTML(),
                this.fetchInstancesXml()
            ]).then(([xhtml, instXml]) => {
                const errors = [...xhtml, instXml].filter((element): element is ErrorResponse =>
                    element ? Object.prototype.hasOwnProperty.call(element, 'error') : false);

                if (errors.length) {
                    const errorMessages = errors.map(current => current.message);
                    return { all: { error: true, message: errorMessages } };
                }

                //At this point, neither of the responses had errors, so we can safely cast them
                xhtml = xhtml as Array<{ xhtml: string }>;
                instXml = instXml as Instance;

                xhtml.forEach((current: { xhtml: string }, index) => {
                    this.activeInstance.xhtmls[index].loaded = true;
                    this.activeInstance.xhtmls[index].xhtml = current.xhtml;
                });
                this.activeInstance.xml = instXml;
                this.mergeAllResponses(initialLoad);
                const all = {
                    instance: (initialLoad ? instances.instance : instances),
                    sections: this.sections || [],
                    std_ref: this.std_ref
                }

                return { all };
            });
        };

        //TODO: Make this camelCase?
        const MetaandSummary = () => {
            return Promise.all([this.fetchMeta(), this.fetchSummary()])
                .then(([metalinks, filingSummary]) => {
                    // const metalinks = allResponses[0];
                    // const filingSummary = allResponses[1];
                    
                    // if (allResponses.some((element) => element.error)) {
                    //     const messageIndex = allResponses.find((element) => element.error);
                    //     return {
                    //         all: { error: true, message: [messageIndex.message] }
                    //     }
                    // }

                    let error = false;
                    let message = [];
                    for(let response of [metalinks, filingSummary])
                    {
                        if("error" in response && response.error)
                        {
                            message.push(response.message);
                            error = true;
                        }
                    }
                    if(error)
                    {
                        return { all: { error, message } };
                    }

                    //At this point, neither of the responses had errors, so we can safely cast them
                    metalinks = metalinks as MetaLinks;
                    filingSummary = filingSummary as FilingSummary;
                    
                    this.metaVersion = metalinks.version || null;
                    this.std_ref = metalinks.std_ref || {} as any;
                    
                    this.activeInstance = metalinks.instance?.filter(element => element.current)[0];

                    const metaLinksSections = Object.values(metalinks.sections); // ignoring keys R1, R2, ...

                    const getInstancesInfoFromFilingSummary = (filingSummary: FilingSummary) => {
                        const filingSummaryReports = filingSummary.MyReports.Report;
                        const instanceHtmSlugs: string[] = []; // stored in filing summ as foo.htm
                        filingSummaryReports.map((r) => {
                            if (r._attributes && r._attributes.instance) {
                                const reportInstanceHtmSlug = r._attributes.instance;
                                if (!instanceHtmSlugs.includes(reportInstanceHtmSlug)) {
                                    instanceHtmSlugs.push(reportInstanceHtmSlug);

                                    // add xmlUrls to instances
                                    const metaInstanceModel = metalinks.instance?.filter(inst => inst.instanceHtm.includes(reportInstanceHtmSlug))[0];
                                    metaInstanceModel.xmlUrl = this.params.metalinks.replace('MetaLinks.json', reportInstanceHtmSlug.replace('.htm', '_htm.xml'));
                                }
                            }
                        });
                        if (!this.activeInstance?.xmlUrl) {
                            console.error('Could not determine instance url of active instance.');
                        }
                    }
                    getInstancesInfoFromFilingSummary(filingSummary);
                    
                    // iterate over FilingSummary.xml Reports to build sections, adding data from metalinks
                    this.sections = buildSectionsArrayFlatter(filingSummary, metaLinksSections, this.metaVersion || "");

                    return XHTMLandInstance(metalinks, true);
                });
        };

        if (this.instances !== null) {
            // switching instance
            this.activeInstance = this.instances.filter(element => element.current)[0];
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
    fetchXHTML(): Promise<Array<{ xhtml: string } | ErrorResponse>> {
        const promises = this.activeInstance?.xhtmls.map((current: { url: string }) => {
            return new Promise<{ xhtml: string } | ErrorResponse>((resolve) => {
                //TODO: use `HelpersUrl.isWorkstation` instead
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
                    headers: { "Content-Type": "application/xhtml+xml" },
                    mode: 'no-cors',
                    credentials: 'include',
                }).then((response) => {
                    if (response.status >= 200 && response.status <= 299) {
                        return response.text();
                    } else {
                        throw Error(`${response.status.toString()}; could not find "${this.params.doc}"`);
                    }
                }).then((data) => {
                    // on SEC EDGAR workstation xhtml is encoded like this: <HTML><HEAD><TITLE> ... &lt;?xml ...
                    const xhtmlData = this.decodeWorkstationXmlInHtml(isWorkstation, data, "</html>");
                    resolve({ xhtml: xhtmlData });
                }).catch((error) => {
                    resolve({ error: true, message: error });
                })
            });
        }) || [];

        return Promise.all(promises);
    }

    fetchMeta(): Promise<ErrorResponse | MetaLinks>
    {
        //TODO: use async/await to simplify this logic
        return new Promise<MetaLinks | ErrorResponse>((resolve) => {
            let jsonUrl = this.params.metalinks;
            //TODO: use `HelpersUrl.isWorkstation` instead
            const isWorkstation = jsonUrl.includes("DisplayDocument.do?");
            if (isWorkstation) {
                if (Object.prototype.hasOwnProperty.call(this.params, 'redline') && this.params.redline) {
                    jsonUrl = jsonUrl.replace('MetaLinks.json', 'PrivateMetaLinks.json');
                }
            }

            return fetch(jsonUrl, { credentials: 'include' }).then((response) => {
                if (response.status >= 200 && response.status <= 299) {
                    return response.json();
                } else {
                    throw Error(response.status.toString());
                }
            }).then((data: MetaLinksResponse) => {
                let XHTMLSlug = this.params.doc.substring(this.params.doc.lastIndexOf('/') + 1);
                if (XHTMLSlug.startsWith("DisplayDocument.do") || XHTMLSlug.startsWith("view.html")) {
                    XHTMLSlug = this.params.doc.substring(this.params.doc.lastIndexOf('filename=') + 9);
                }
                const instanceFileNames = Object.keys(data.instance).join().split(/[ ,]+/);
                let sections = {};
                if (instanceFileNames.includes(XHTMLSlug)) {
                    const instanceObjects: InstanceFile[] = Object.entries(data.instance).map(([currentInstance, instData], instanceIndex) => {
                        // Sections
                        //TODO: combine these using `Object.entries`
                        Object.keys(instData.report).forEach((report) => {
                            instData.report[report].instanceIndex = instanceIndex; // why?
                        });
                        Object.values(instData.report).forEach(report => {
                            report.instanceHtm = currentInstance;
                        });

                        //NOTE: `sections` get reassigned at every step of this loop, is unused in the rest of the logic
                        //  per loop step, and gets returned (the last value to which it's assigned) once the loop ends
                        sections = Object.assign(sections, instData.report);

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

                        return {
                            current: currentInstance.split(' ').includes(XHTMLSlug),
                            instance: instanceIndex, // Why?
                            map: new Map<string, SingleFact>(),
                            metaInstance: Object.assign(instData),
                            instanceHtm: currentInstance,
                            xhtmls: xhtmls,
                        };
                    });

                    resolve({ ...data, instance: instanceObjects, sections, version: data.version });
                } else {
                    // this may occur when transferring a filing from one domain to another.  Not sure how to fix...
                    if (!PRODUCTION) {
                        console.log('instanceFileNames does not include XHTMLSlug. fetch-merge > fetchMeta())')
                    }
                    throw Error('Incorrect MetaLinks.json Instance');
                }

                //I'm not sure what resolving a Promise twice does...  this probably belongs in the `else` block above
                //  but, in that case, an error is thrown so the Promise gets an error state instead of a resolution...
                resolve(data);
            }).catch((error) => resolve({ error: true, message: `${error}; could not find "${this.params.metalinks}"` }))
        });
    }

    fetchSummary(): Promise<FilingSummary | { error: true, message: string }> {
        return new Promise((resolve) => {
            let filingSummXmlUrl = this.params.summary;

            //TODO: use the new `isWorkstation` func in HelpersUrl instead
            const isWorkstation = filingSummXmlUrl.includes("DisplayDocument.do?");
            if (isWorkstation) {
                if (Object.prototype.hasOwnProperty.call(this.params, 'redline') && this.params.redline) {
                    filingSummXmlUrl = filingSummXmlUrl.replace('FilingSummary.xml', 'PrivateFilingSummary.xml')
                }
            }

            return fetch(filingSummXmlUrl, { credentials: 'include' }).then((response) => {
                if (response.status >= 200 && response.status <= 299) {
                    return response.text();
                } else {
                    throw Error(response.status.toString());
                }
            }).then((data) => {
                const xmlData = this.decodeWorkstationXmlInHtml(isWorkstation, data, "</FilingSummary>");
                const convertedXml = convert.xml2json(xmlData, { compact: true });
                resolve(JSON.parse(convertedXml).FilingSummary as FilingSummary);
            }).catch((error) => {
                resolve({ error: true, message: `${error}; could not find "${this.params.summary}"` })
            });
        });
    }

    fetchInstancesXml(): Promise<Instance | ErrorResponse> {
        let _xmlUrl = this.activeInstance?.xmlUrl;
        const isWorkstation = _xmlUrl.includes("DisplayDocument.do?");
        if (isWorkstation) {
            // If methods from HelpersUrl are used here some very strange bugs occur, such as window and localStorage undefined.
            if (Object.prototype.hasOwnProperty.call(this.params, 'redline') && this.params.redline) {
                _xmlUrl = _xmlUrl.replace('_htm.xml', '_ht2.xml')
            } else {
                _xmlUrl = _xmlUrl.replace('_htm.xml', '_ht1.xml')
            }
        }

        const xmlFetchPromise = new Promise<{ instance: string } | ErrorResponse>((resolve) =>
            //TODO: we used to pass `{ credentials: 'include' }` to `.then()` (which is wrong);
            //  should we be passing it to `fetch`??
            fetch(_xmlUrl).then((response) => {
                if (response.status >= 200 && response.status <= 299) {
                    return response.text();
                } else {
                    throw Error(`${response.status.toString()}`);
                }
            }).then((data) => {
                const xmlData = this.decodeWorkstationXmlInHtml(isWorkstation, data, "</xbrl>");
                resolve({ instance: xmlData });
            }).catch((error) => {
                resolve({ error: true, message: `${error}; could not find "XML Instance Data"` });
            }
        ));

        return xmlFetchPromise.then((xmlInstance) => {
            const instance = xmlInstance;
            if (instance) {
                const fetchedXMlString = instance.instance;
                const instanceXmlAsJsonCompact: Instance = JSON.parse(convert.xml2json(fetchedXMlString, { compact: true }));
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
                return xmlInstance;
            }
        });
    }

    mergeAllResponses(initialLoad: boolean) {
        this.activeInstance.map = this.buildInitialFactMap(this.activeInstance.xml, this.activeInstance.xhtmls[0].slug);
        if (initialLoad) {
            this.sections = this.extractSections(); // not sure what this was for, except maybe adding .groupType
        }
        this.activeInstance.formInformation = this.extractFormInformation(this.activeInstance.metaInstance);
        this.enrichFactMapWithMetalinksData();
        this.customPrefix = this.activeInstance.metaInstance.nsprefix;
        this.prepareXHTMLForCurrentInstance();
        return;
    }

    buildInitialFactMap(instanceXml: Instance, fileSlug: string) {
        const getInstancePrefix = (instance: Instance) => {
            const options = Object.keys(instance).filter(element => element.endsWith(':xbrl'))[0];
            return options ? options.split(':')[0] : false;
        };

        const prefix = getInstancePrefix(instanceXml);
        let instance: Record<string, any> = instanceXml;

        const xbrlKey = prefix ? `${prefix}:xbrl` : 'xbrl';
        const contextKey = prefix ? `${prefix}:context` : 'context';
        const unitKey = prefix ? `${prefix}:unit` : 'unit';

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
        for (let key in instance[xbrlKey]) {
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
                        measure: this.setMeasureInfo(attributes.unitRef || "", unit),
                        scale: this.setScaleInfo(attributes.scale || 0),
                        decimals: this.setDecimalsInfo(attributes.decimals || ""),
                        sign: this.setSignInfo(attributes.sign || ""),
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
     * @returns {any} => updates instance fact map (this.activeInstance.map) with data from meta (this.activeInstance.metaInstance)
     */
    enrichFactMapWithMetalinksData() {
        this.activeInstance?.map.forEach((currentFact: SingleFact) => {
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
            const factObjectMl = this.activeInstance.metaInstance.tag[factNameTag]; // Ml being metalinks

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
                            if (element.dimension && this.activeInstance.metaInstance.tag[element.dimension.replace(':', '_')]) {
                                return this.activeInstance.metaInstance.tag[element.dimension.replace(':', '_')].auth_ref ? this.activeInstance.metaInstance.tag[element.dimension.replace(':', '_')].auth_ref : null;
                            }
                        }).filter(Boolean)[0];

                        const axis = currentFact.segment.map((element: { dimension: string; axis: string; }) => {
                            if (element.dimension && this.activeInstance.metaInstance.tag[element.axis.replace(':', '_')]) {
                                return this.activeInstance.metaInstance.tag[element.axis.replace(':', '_')].auth_ref ? this.activeInstance.metaInstance.tag[element.axis.replace(':', '_')].auth_ref : null;
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
                        return Object.keys(singleReference)
                            .reduce((accumulator, current) => {
                                const index = requiredOrder.findIndex(element => element === current);
                                if (index !== -1) {
                                    const returnObject = {};
                                    returnObject[current] = singleReference[current];
                                    accumulator[index] = returnObject;
                                }
                                return accumulator;
                            }, new Array(Object.keys(singleReference).length).fill(null))
                            .filter(Boolean);
                    });
                }

                // add calculations (if any) to each individual fact
                if (factObjectMl.calculation) {
                    // console.log('this.activeInstance.metaInstance', this.activeInstance.metaInstance)
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
        const isWorkstation = this.params.doc.includes("DisplayDocument.do?");
        this.activeInstance.xhtmls.forEach((current) => {
            if (current.xhtml) {
                let $ = cheerio.load(current.xhtml, {});
                $ = this.hiddenFacts($);
                $ = this.fixImages($, isWorkstation);
                $ = this.fixLinks($);
                $ = this.redLineFacts($);
                $ = this.excludeFacts($);
                const updates = this.attributeFacts($, this.activeInstance.map, current.slug);
                current.xhtml = updates.xhtml;
            }
        });
    }

    fixImages($: cheerio.CheerioAPI, isWorkstation: boolean) {
        const startPerformance = performance.now();
        const foundImagesArray = Array.from($('img'));
        if (isWorkstation) {
            // uncomment next 3 lines and force isWorkstation to true to test on local
            // const exampleMlPath = '../DisplayDocument.do?step=docOnly&accessionNumber=0001314610-24-800735&interpretedFormat=false&redline=true&filename=MetaLinks.json'
            
            const [docName, searchParams] = this.params.doc.split('?');
            let imgParams = new URLSearchParams(searchParams);

            imgParams.set("step", "docOnly");
            imgParams.set("interpretedFormat", "false");
            imgParams.delete("redline");
            imgParams.delete("status");
            imgParams.delete("sequenceNumber");

            foundImagesArray.forEach((imgElem) => {
                // Not sure how to handle Herm's suggestion: 'And if src is a local file (foo.jpg, not /include or http://archives.sec.xxx)'
                // const imgIsLocal = !$(imgElem).attr('src')?.startsWith('/include');
                // const imgIsFileNameOnly = $(imgElem).attr('src') && (!$(imgElem).attr('src')?.startsWith('/') || !$(imgElem).attr('src')?.includes('/', 1));
                           
                const imgSrc = $(imgElem).attr('src');
                if(!imgSrc) return;

                const imgFileName = imgSrc.includes('/') ? imgSrc.substring(imgSrc.lastIndexOf('/') + 1) : imgSrc;
                imgParams.set("filename", imgFileName);

                console.log('params', imgParams.toString());

                $(imgElem).attr('src', `${docName}?${imgParams.toString()}`);
                $(imgElem).attr('loading', 'lazy');
            });
        }
        else 
        {
            foundImagesArray.forEach((imgElem) => {
                const imgSrc = $(imgElem).attr('src');
                if (!imgSrc?.startsWith('data:')) {
                    const imageSlug = imgSrc?.substring(imgSrc!.lastIndexOf('/') + 1);
                    $(imgElem).attr('src', `${this.absolute}${imageSlug}`);
                    $(imgElem).attr('loading', 'lazy');
                }
            })
        }

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
                    for (const [key, value] of map.entries()) {
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

    //WTF is `ix`??  Should this be `id`?
    updateMap(ix: string, element: cheerio.Cheerio<cheerio.Element>, currentSlug: string): string {
        if(!this.activeInstance.map.has(ix))
        {
            console.error("Cannot update map -- missing key:", ix);
            return "";
        }

        this.activeInstance.map.set(
            ix,
            {
                ...this.activeInstance.map.get(ix) as SingleFact,
                raw: element.text(),
                format: element.attr('format') ? element.attr('format') : null,
                isAdditional: element.parents().prop('tagName').toLowerCase().endsWith(':hidden'),
                isCustom: element.attr('name')?.split(':')[0].toLowerCase() === this.customPrefix,
                isAmountsOnly: element.prop('tagName')?.split(':')[1].toLowerCase() === 'nonfraction',
                isTextOnly: element.prop('tagName')?.split(':')[1].toLowerCase() === 'nonnumeric',
                isNegativeOnly: element.attr('sign') === '-',
                file: currentSlug,
                scale: (element.attr('scale') ? this.setScaleInfo(element.attr('scale') as unknown as number) : null) || "",
                continuedIDs: [],
            });

        return this.activeInstance.map.get(ix)!.id;
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
                    current.period._array = [`${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()}`];
                    current.period._text = `As of ${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()}`;

                } else if (current.period.startDate && current.period.endDate) {
                    const startDate = new Date(current.period.startDate._text);
                    const endDate = new Date(current.period.endDate._text);

                    const yearDiff = endDate.getUTCFullYear() - startDate.getUTCFullYear();
                    const monthDiff = endDate.getUTCMonth() - startDate.getUTCMonth() + (yearDiff * 12);
                    current.period._array = [
                        `${startDate.getUTCMonth() + 1}/${startDate.getUTCDate()}/${startDate.getUTCFullYear()}`,
                        `${endDate.getUTCMonth() + 1}/${endDate.getUTCDate()}/${endDate.getUTCFullYear()}`
                    ];
                    if (monthDiff <= 0) {
                        current.period._text = `${startDate.getUTCMonth() + 1}/${startDate.getUTCDate()}/${startDate.getUTCFullYear()} - ${endDate.getUTCMonth() + 1}/${endDate.getUTCDate()}/${endDate.getUTCFullYear()}`;
                    } else {
                        current.period._text = `${monthDiff} months ending ${endDate.getUTCMonth() + 1}/${endDate.getUTCDate()}/${endDate.getUTCFullYear()}`;
                    }
                } else {
                    const log: Logger<ILogObj> = new Logger();
                    log.error(`\nFact Period is NEITHER Instant nor Start / End`);
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
        let context2 = Array.isArray(context) ? context : [context];
        context2.forEach((current) => {
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
        if (factContext?.entity?.segment) {
            return factContext.entity.segment.data;
        }
    }

    setMeasureText(unit: Units[] = []) {
        if (!Array.isArray(unit)) {
            unit = [unit]
        }

        //Note: we need to first trick TS into believing a Units is really a UnitsAdditional
        //TODO: have `setMeasureText` take UnitsAdditional instead
        unit.map(u => u as UnitsAdditional)
            .forEach((current: UnitsAdditional) => {
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
        const scaleOptions: Record<string, string> = {
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
        
        return scaleOptions[scale] || null;
    }

    setDecimalsInfo(decimals: string): string | null {
        const decimalsOptions: Record<string, string> = {
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
            6: "Millionths",
        };

        return decimalsOptions[decimals] || null;
    }

    setSignInfo(sign: string): string | null {
        const signOptions: Record<string, string> = {
            '-': 'Negative',
            '+': 'Positive',
        };
        
        return signOptions[sign];
    }

    /**
     * Description
     * @param {any} ftObj:object
     * @param {any} result?:string|undefined
     * @returns {any} concatenated text from all footnote nodes, joined by a ' '
     */
    accumulateFootnote(ftObj: LinkFootnote | Record<string, unknown>, result = "") {
        const truncateFootnoteTo = 100;

        if (result?.length > truncateFootnoteTo) {
            result = result.substring(0, truncateFootnoteTo).substring(0, result.lastIndexOf(" ") + 1);
            return result += ' ...';
        }

        // let text = ''; //accumulate "mixed-content" text to apply after depth first descent
        // Object.keys(ftObj).forEach(node => {
        Object.entries(ftObj).forEach(([key, value]) =>
        {
            if (key == "_text") {
                result += String(value);
            }
            else if (Array.isArray(value)) {
                value.forEach(childNode => {
                    result = this.accumulateFootnote(childNode, result);
                })
            }
            else if(key.substring(0,6) == "xhtml:") {
                result = this.accumulateFootnote(value, result);
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
                            return this.accumulateFootnote(actualFootnote || {} as Record<string, unknown>);
                        }

                        // Rest of this if block is WIP for rendering all div types in footnote cell

                        // GO FIND PART OF footnotes.xmlString that corresponds to actual footnote
                        // return that substring ... so you can render it in fact-pages.ts
                        // we only need '<link:footnote ... > string for each footnote to render
                        // find all <link:footnote ... > xml strings and put in array
                        // then find the one that matches the xlink:to value with its id

                        const startTagRegex = /<link:footnote /gi; 
                        let startTagResults: RegExpExecArray | null = null;
                        const footnoteStartIndices:number[] = [];
                        while(!!(startTagResults = startTagRegex.exec(footnotes.asXmlString))) {
                            footnoteStartIndices.push(startTagResults.index);
                        }

                        const endTagRegex = /<\/link:footnote>/gi; 
                        let endTagResults: RegExpExecArray | null = null;
                        const footnoteEndIndices:number[] = [];
                        while(!!(endTagResults = endTagRegex.exec(footnotes.asXmlString))) {
                            footnoteEndIndices.push(endTagResults.index + ('</link:footnote>').length);
                        }

                        const footnotesAsXmlStrings: string[] = [];

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
                        //uhh, no we don't, because the first 2 cases cover EVERYTHING
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