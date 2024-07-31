import * as c from "cheerio";
import { Cheerio, CheerioAPI, load } from "cheerio";
import { ILogObj, Logger } from "tslog";
import { setScaleInfo } from "../fetch-merge/merge-data-utils";
import { XhtmlFileMeta } from "../interface/instance-file";
import { SingleFact } from "../interface/fact";
import { UrlParams } from "../interface/url-params";


/* eslint-disable @typescript-eslint/ban-types */

export type XhtmlPrepData =
{
    //important data
    facts: Map<string, SingleFact>;
    current: XhtmlFileMeta;

    //other data that helper functions require
    absolute: string;
    params: UrlParams;
    isWorkstation: boolean;
    customPrefix: string | null;
}

export type XhtmlPrepResponse =
{
    facts: Map<string, SingleFact>;
    xhtml: string;
}



self.onmessage = ({ data }: { data: XhtmlPrepData }) =>
{
    const { current, facts } = data;
    const xhtml = new XhtmlPrepper(data).doWork(current);

    const x: XhtmlPrepResponse = { xhtml, facts };
    self.postMessage(x);
};


/** prepares the XHTML doc for presentation */
class XhtmlPrepper
{
    //important data
    private facts!: Map<string, SingleFact>;
    // private current!: XhtmlFileMeta;  //TODO: might want to refactor these functions to use this reference

    //other data that helper functions require
    private readonly absolute!: string;
    private readonly params!: UrlParams;
    private readonly isWorkstation!: boolean;
    private readonly customPrefix!: string;
    
    constructor(loadData: XhtmlPrepData)
    {
        Object.assign(this, loadData);
    }


    public doWork(current: XhtmlFileMeta)
    {
        let $ = load(current.xhtml, {});
        $ = this.hiddenFacts($);
        $ = this.fixImages($, this.isWorkstation);
        $ = this.fixLinks($);
        $ = this.redLineFacts($);
        $ = this.excludeFacts($);
        $ = this.attributeFacts($, this.facts, current.slug);
        // current.xhtml = $.html();

        return $.html();
    }



    private fixImages($: CheerioAPI, isWorkstation: boolean)
    {
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
                    const imageSlug = imgSrc?.substring(imgSrc.lastIndexOf('/') + 1);
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

    private fixLinks($: CheerioAPI)
    {
        const startPerformance = performance.now();
        const foundLinksArray = Array.from($('[data-link],[href]'));
        foundLinksArray.forEach((current) => {
            if (Object.prototype.hasOwnProperty.call(current.attribs, 'href')) {
                if (current.attribs.href.startsWith('http://') ||
                    current.attribs.href.startsWith('https://') ||
                    current.attribs.href.startsWith('#'))
                {
                    // already an absolute url, just add tabindex=18
                    $(current).attr('tabindex', '18');

                    // this anchor tag does not exsist in the current XHTML file
                    if (current.attribs.href.startsWith('#')  &&
                        current.attribs.href.slice(1) &&
                        $(`[id='${current.attribs.href.slice(1)}']`).length === 0)
                    {
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

    private hiddenFacts($: CheerioAPI)
    {
        const startPerformance = performance.now();
        const foundElements = Array.from($('[style*="-ix-hidden"]')).slice(0, 1000);

        foundElements.forEach((current) => {
            const updatedStyle = Object.values($(current).css(["-sec-ix-hidden", "-esef-ix-hidden"]) || {}).filter(Boolean)[0];
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
     * @param {any} $: CheerioAPI
     * @returns {any}
     */
    private redLineFacts($: CheerioAPI) {
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

    private excludeFacts($: CheerioAPI)
    {
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

    private attributeFacts($: CheerioAPI, map: Map<string, SingleFact>, currentSlug: string)
    {
        const startPerformance = performance.now();

        const foundElements = Array.from($(`[contextRef]`));

        foundElements.forEach((current) => {
            $(current).attr("selected-fact", 'false');
            $(current).attr("hover-fact", 'false');
            $(current).attr("continued-fact", 'false');
            $(current).closest('table').length ? $(current).attr("inside-table", 'true') : $(current).attr("inside-table", 'false');

            if (!$(current).prop('tagName').toLowerCase().endsWith("continuation") && $(current).attr("continuedat")) {
                $(current).attr("continued-main-fact", 'true');
            }


            if ($(current).attr('contextref') && $(current).attr('id')) {
                $(current).attr('ix', $(current).attr('id'));
                $(current).attr('id', this.updateMap($(current).attr('ix') as string, $(current), currentSlug));
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

        const endPerformance = performance.now();
        if (LOGPERFORMANCE) {
            const items = foundElements.length;
            const log: Logger<ILogObj> = new Logger();
            log.debug(`FetchAndMerge.attributeFacts() completed in: ${(endPerformance - startPerformance).toFixed(2)}ms - ${items} items`);
        }

        return $;
    }

    private updateMap(id: string, element: Cheerio<c.Element>, currentSlug: string): string
    {
        const fact = this.facts.get(id);
        if(!fact)
        {
            console.error("Cannot update map -- missing key:", id);
            return "";
        }

        this.facts.set(
            id,
            {
                ...fact,
                raw: element.text(),
                format: element.attr('format') ? element.attr('format') : null,
                isAdditional: element.parents().prop('tagName').toLowerCase().endsWith(':hidden'),
                isCustom: element.attr('name')?.split(':')[0].toLowerCase() === this.customPrefix,
                isAmountsOnly: element.prop('tagName')?.split(':')[1].toLowerCase() === 'nonfraction',
                isTextOnly: element.prop('tagName')?.split(':')[1].toLowerCase() === 'nonnumeric',
                isNegativeOnly: element.attr('sign') === '-',
                file: currentSlug,
                scale: setScaleInfo(element.attr('scale')) || "",
                continuedIDs: [],
            });

        return fact.id;
    }
}
