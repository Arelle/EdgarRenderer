import { Logger, ILogObj } from "tslog";
import { Constants } from "../constants/constants";
import { ConstantsFunctions } from "../constants/functions";
import { ErrorsMajor } from "../errors/major";
import { Facts } from "../facts/facts";
import { FetchAndMerge } from "../fetch-merge/fetch-merge";
import { All, ErrorResponse, FetchMergeArgs, FMResponse } from "../interface/fetch-merge";
import { FlexSearch } from "../flex-search/flex-search";
import { HelpersUrl } from "../helpers/url";
import { Tabs } from "../tabs/tabs";
import { buildInlineDocPagination, addPaginationListeners } from "../pagination/inlineDocPagination";
import { Sections } from "../sections/sections";


/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */


/* eslint-disable @typescript-eslint/ban-types */

const DEFAULT_ERROR_MSG = "An error occurred during load.";

export const App = {
    //TODO: make this return a Promise instead?
    init: (changeInstance = true, callback: (arg0: boolean) => void) => {
        let xhtmlUrl = '';
        if (changeInstance) {
            ConstantsFunctions.emptyHTMLByID('dynamic-xbrl-form');
            document.getElementById('html-pagination')?.classList.toggle('d-none');
            document.getElementById('xbrl-form-loading')!.classList.remove('d-none');
            const activeInstance = Constants.getInstanceFiles.find(element => element.current);
            xhtmlUrl = activeInstance?.xhtmls.find(element => element.current)?.slug as string;
        }

        HelpersUrl.init(xhtmlUrl, () => {
            if (HelpersUrl.getAllParams && 
                HelpersUrl.getAllParams!["metalinks"] &&
                HelpersUrl.getAllParams!["doc"] &&
                HelpersUrl.getFormAbsoluteURL)
            {
                const fetchAndMergeArgs: FetchMergeArgs = {
                    params: HelpersUrl.getAllParams,
                    absolute: HelpersUrl.getFormAbsoluteURL,
                    instance: changeInstance ? Constants.getInstanceFiles : null,
                    std_ref: Constants.getStdRef,
                };

                if(typeof window !== 'undefined' && window.Worker)
                {
                    const worker = new Worker(
                        new URL('../workers/workers.ts', import.meta.url), { name: 'fetch-merge' });
                    worker.postMessage(fetchAndMergeArgs);
                    worker.onmessage = (event: MessageEvent<All>) =>
                    {
                        if(event?.data?.all)
                        {
                            worker.terminate();
                            App.handleFetchAndMerge(event.data.all, changeInstance);
                            callback(true);
                        }
                    };
                    worker.onerror = (errorEvent) =>
                    {
                        const errLoc = `${errorEvent.filename} ${errorEvent.lineno}:${errorEvent.colno}`;
                        console.error(errLoc, errorEvent.message);

                        let error = {} as ErrorResponse;
                        try
                        {
                            //The ErrorResponse is buried in the Error's message
                            error = JSON.parse(errorEvent.message.replace("Uncaught Error: ", ""))?.all;
                        }
                        catch(e)
                        {
                            console.error(e);
                            error = { error: true, messages: [DEFAULT_ERROR_MSG] };
                        }
                        finally
                        {
                            App.handleFetchError(error);
                            callback(false);
                            worker.terminate();
                        }
                    };
                }
                else
                {
                    // browser does not support web worker
                    if (!PRODUCTION) {
                        const log: Logger<ILogObj> = new Logger();
                        log.debug(`WebWorkers NOT available`);
                    }

                    const fetchAndMerge = new FetchAndMerge(fetchAndMergeArgs);
                    fetchAndMerge.init()
                        .then((data) => App.handleFetchAndMerge(data.all, changeInstance))
                        .catch((loadingError: ErrorResponse) => App.handleFetchError(loadingError))
                        .then((bool: boolean) => callback(bool));
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
        Facts.updateFactCount();
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
        document.querySelector("#facts-menu-list-pagination *")!.innerHTML = "";
    },

    handleFetchAndMerge: (filingData: FMResponse, multiInstanceLoad = false): true =>
    {
        // TODO: try to divide operations here into state and and dom actions or refactor some other way.

        const activeInstance = filingData.instance?.filter(element => element.current)[0];

        if (filingData.sections?.length) {
            // probably only on initial load
            // const sectionsSorted = filingData.sections.sort((a, b) => {
            //     return Number(a.order) - Number(b.order);
            // });
            Constants.setSections(filingData.sections);
        }

        ConstantsFunctions.setInstanceFiles(filingData.instance);
        ConstantsFunctions.setInlineFiles(activeInstance.xhtmls);

        if (!multiInstanceLoad) {
            ConstantsFunctions.setStdRef(filingData.std_ref);
        } else {
            ConstantsFunctions.emptyHTMLByID('dynamic-xbrl-form');
        }

        ConstantsFunctions.setFormInformation(activeInstance.formInformation);
        FlexSearch.init(activeInstance.map);

        // maybe remove
        document.getElementById('html-pagination')?.classList.toggle('d-none');

        const startPerformance = performance.now();
        activeInstance.xhtmls.forEach((currentInlineDoc) => {
            if (currentInlineDoc.xhtml) {

                const parser = new DOMParser();
                const htmlDoc = parser.parseFromString(currentInlineDoc.xhtml, 'text/html');

                document.getElementById('xbrl-form-loading')!.classList.add('d-none');

                // each .htm file (doc) gets its own section element.  They are children of the xbrl-form
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
        
        ConstantsFunctions.setTitle();

        const endPerformance = performance.now();
        if (LOGPERFORMANCE) {
            const log: Logger<ILogObj> = new Logger();
            log.debug(`Adding XHTML completed in: ${(endPerformance - startPerformance).toFixed(2)}ms`);
        }

        return true;
    },

    handleFetchError(loadingError: ErrorResponse): false
    {
        document.getElementById('xbrl-form-loading')!.classList.add('d-none');
        Constants.getInlineFiles = [];

        if(loadingError.error && loadingError.messages)
        {
            loadingError.messages
                .forEach((current: string) => ErrorsMajor.message(current));
        }
        else
        {
            ErrorsMajor.message(DEFAULT_ERROR_MSG);
            console.error(loadingError);
        }

        // callback(false);
        return false;
    },
};