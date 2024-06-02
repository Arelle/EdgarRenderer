import { Logger, ILogObj } from "tslog";
import { Constants } from "../constants/constants";
import { ConstantsFunctions } from "../constants/functions";
import { ErrorsMajor } from "../errors/major";
import { Facts } from "../facts/facts";
import { FetchAndMerge } from "../fetch-merge/fetch-merge";
import { FlexSearch } from "../flex-search/flex-search";
import { HelpersUrl } from "../helpers/url";
import { Tabs } from "../tabs/tabs";
import { SingleFact } from "../interface/fact";
import { Meta } from "../interface/meta";
import { buildInlineDocPagination, addPaginationListeners } from "../pagination/inlineDocPagination";
import { Sections } from "../sections/sections";
import { Section } from "../interface/meta";


/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

export const App = {
    init: (loadInstance = true, callback: (arg0: boolean) => void) => {
        let xhtmlUrl = ''
        if (loadInstance) {
            ConstantsFunctions.emptyHTMLByID('dynamic-xbrl-form');
            document.getElementById('html-pagination')?.classList.toggle('d-none');
            document.getElementById('xbrl-form-loading')!.classList.remove('d-none');
            const currentInstance = Constants.getInstanceFiles.find(element => element.current);
            xhtmlUrl = currentInstance?.xhtmls.find(element => element.current)?.slug as string;
        }
        HelpersUrl.init(xhtmlUrl, () => {
            if (HelpersUrl.getAllParams && 
                HelpersUrl.getAllParams!["metalinks"] &&
                HelpersUrl.getAllParams!["doc"] &&
                HelpersUrl.getFormAbsoluteURL
            ) {
                const fetchAndMergeArgs = {
                    params: HelpersUrl.getAllParams,
                    absolute: HelpersUrl.getFormAbsoluteURL,
                    instance: loadInstance ? Constants.getInstanceFiles : null,
                    std_ref: Constants.getStdRef
                };
                if (typeof window !== 'undefined' && window.Worker) {
                    const worker = new Worker(
                        new URL('../workers/workers.ts', import.meta.url), { name: 'fetch-merge' }
                    );
                    worker.postMessage(fetchAndMergeArgs);
                    worker.onmessage = (event) => {
                        if (event && event.data) {
                            worker.terminate();
                            callback(App.handleFetchAndMerge(event.data.all, loadInstance));
                        }
                    }
                } else {
                    // browser does not support web worker
                    if (!PRODUCTION) {
                        const log: Logger<ILogObj> = new Logger();
                        log.debug(`Worker NOT Init`);
                    }
                    const fetchAndMerge = new FetchAndMerge(fetchAndMergeArgs);
                    fetchAndMerge.init().then(data => {
                        callback(App.handleFetchAndMerge(data.all, loadInstance));
                    });
                }
            } else {
                document.getElementById('xbrl-form-loading')?.classList.add('d-none');
                Facts.updateFactCount();
                ErrorsMajor.urlParams();

                callback(false);
                if (!PRODUCTION) {
                    import('../development/index.development').then(module => {
                        new module.Development();
                    });
                }
            }
        });
    },

    initialSetup: () => {
        // runs once on startup
        Tabs.init();
        Sections.init();
        App.unDisableNavsEtc();
        Facts.updateFactCount(true);
    },

    unDisableNavsEtc: () => {
        Facts.addEventAttributes();
        const disabledNavsArray = Array.from(document.querySelectorAll(
            ".navbar .disabled, [disabled]"
        ));
        disabledNavsArray.forEach((current) => {
            current.classList.remove("disabled");
            current.removeAttribute("disabled");
        });
    },

    /**
     * Description => updates tabs, instance facts, factCount, global-search-form
     * @returns {void}
     */
    additionalSetup: () => {
        Tabs.updateTabs();
        Facts.addEventAttributes();
        Facts.updateFactCount();
        (document.getElementById('global-search-form') as HTMLFormElement)?.reset();
    },

    emptySidebars: () => {
        document.querySelector(
            "#facts-menu-list-pagination *"
        )!.innerHTML = "";
    },

    handleFetchAndMerge: (
        filingData: {
            instance: Array<{
                current: boolean,
                instance: number,
                map: Map<string, SingleFact>,
                metaInstance: Meta,
                xhtmls: Array<{
                    current: boolean,
                    loaded: boolean,
                    slug: string,
                    url: string,
                    xhtml: string
                }>,
                formInformation?: {}
            }>,
            sections?: Array<Section>;
            message?: Array<string>;
            std_ref?: {}
            error?: boolean;
        },
        multiInstanceLoad = false
    ) => {
        if (filingData.error) {
            document.getElementById('xbrl-form-loading')!.classList.add('d-none');
            Constants.getInlineFiles = [];
            filingData.message?.forEach((current: string) => {
                ErrorsMajor.message(current);
            });
            return false;
        } else {
            // TODO: try to divide operations here into state and and dom actions or refactor some other way.

            const currentInstance = filingData.instance?.filter(element => element.current)[0];

            if (filingData.sections) {
                // probably only on initial load
                // const sectionsSorted = filingData.sections.sort((a, b) => {
                //     return Number(a.order) - Number(b.order);
                // });
                Constants.setSections(filingData.sections);
            }

            ConstantsFunctions.setInstanceFiles(filingData.instance);
            ConstantsFunctions.setInlineFiles(currentInstance.xhtmls);

            if (!multiInstanceLoad) {
                ConstantsFunctions.setStdRef(filingData.std_ref);
            } else {
                ConstantsFunctions.emptyHTMLByID('dynamic-xbrl-form');
            }

            ConstantsFunctions.setFormInformation(currentInstance.formInformation);
            FlexSearch.init(currentInstance.map);

            // maybe remove
            document.getElementById('html-pagination')?.classList.toggle('d-none');

            const startPerformance = performance.now();
            currentInstance.xhtmls.forEach((currentInlineDoc) => {
                if (currentInlineDoc.xhtml) {

                    const parser = new DOMParser();
                    const htmlDoc = parser.parseFromString(currentInlineDoc.xhtml, 'text/html');

                    document.getElementById('xbrl-form-loading')!.classList.add('d-none');

                    // each .htm file (doc) gets it's own section element.  They are childreng of the xbrl-form
                    const docSection = document.createElement('section');

                    docSection.setAttribute('filing-url', currentInlineDoc.slug);
                    !currentInlineDoc.current ? docSection.classList.add('d-none') : null;
                    if (currentInlineDoc.current) {
                        for (let i = 0; i < htmlDoc?.querySelector('html')!.attributes.length; i++) {
                            document.querySelector('html')?.setAttribute(
                                (htmlDoc.querySelector('html')?.attributes[i].name as string),
                                (htmlDoc.querySelector('html')?.attributes[i].value as string));
                        }
                    }
                    
                    docSection.append((htmlDoc.querySelector('body') as HTMLElement));
                    document.getElementById('dynamic-xbrl-form')?.append(docSection);
                }
            });

            const inlineDocPaginationUI = buildInlineDocPagination();
            document.getElementById('dynamic-xbrl-form')?.append(inlineDocPaginationUI);
            addPaginationListeners();

            const endPerformance = performance.now();
            if (LOGPERFORMANCE) {
                const log: Logger<ILogObj> = new Logger();
                log.debug(`Adding XHTML completed in: ${(endPerformance - startPerformance).toFixed(2)}ms`);
            }
            ConstantsFunctions.setTitle();
            if (DEBUGCSS) {
                // ErrorsMajor.debug('A New Error Message');
            }
            return true;
        }
    }
};