import { Logger, ILogObj } from "tslog";
import { Constants } from "../constants/constants";
import { ConstantsFunctions } from "../constants/functions";
import { ErrorsMajor } from "../errors/major";
import { Facts } from "../facts/facts";
import { FetchAndMerge } from "../fetch-merge/fetch-merge";
import { FlexSearch } from "../flex-search/flex-search";
import { HelpersUrl } from "../helpers/url";
import { Links } from "../links/links";
import { SingleFact } from "../interface/fact";
import { Meta } from "../interface/meta";

/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

export const App = {
    init: (loadInstance = false, callback: (arg0: boolean) => void) => {
        console.log('Version:', Constants.version + '\nCSS Mode: ' + (document.compatMode=="CSS1Compat"?"Standards 😎":"Quirks 😢"))
        let xhtmlUrl = ''
        if (loadInstance) {
            ConstantsFunctions.emptyHTMLByID('dynamic-xbrl-form');
            document.getElementById('html-pagination')?.classList.toggle('d-none');
            document.getElementById('xbrl-form-loading')!.classList.remove('d-none');
            document.getElementById('facts-menu')?.classList.remove("hide-during-init");
            document.getElementById('sections-menu')?.classList.remove("hide-during-init");
            const currentInstance = Constants.getInstanceFiles.find(element => element.current);
            xhtmlUrl = currentInstance?.xhtmls.find(element => element.current)?.slug as string;
        }
        HelpersUrl.init(xhtmlUrl, () => {
            if (HelpersUrl.getAllParams && HelpersUrl.getAllParams!["metalinks"] &&
                HelpersUrl.getAllParams!["doc"] &&
                HelpersUrl.getFormAbsoluteURL
            ) {
                if (window.Worker) {
                    const worker = new Worker(
                        new URL('../workers/workers.ts', import.meta.url), { name: 'fetch-merge' }
                    );
                    worker.postMessage({
                        params: HelpersUrl.getAllParams,
                        absolute: HelpersUrl.getFormAbsoluteURL,
                        instance: loadInstance ? Constants.getInstanceFiles : null,
                        std_ref: Constants.getStdRef
                    });
                    worker.onmessage = (event) => {
                        if (event && event.data) {
                            worker.terminate();
                            callback(App.handleFetchAndMerge(event.data.all, loadInstance));
                        }
                    }
                    document.getElementById('facts-menu')?.classList.remove("hide-during-init");
                    document.getElementById('sections-menu')?.classList.remove("hide-during-init");
                } else {
                    // browser does not support web worker
                    if (!PRODUCTION) {
                        const log: Logger<ILogObj> = new Logger();
                        log.debug(`Worker NOT Init`);
                    }
                    const data = {
                        params: HelpersUrl.getAllParams,
                        absolute: HelpersUrl.getFormAbsoluteURL,
                        instance: loadInstance ? Constants.getInstanceFiles : null,
                        std_ref: Constants.getStdRef
                    };
                    const fetchAndMerge = new FetchAndMerge(data);
                    fetchAndMerge.init().then(data => {
                        callback(App.handleFetchAndMerge(data.all, loadInstance));
                    });
                }
            } else {
                document.getElementById('xbrl-form-loading')?.classList.add('d-none');
                // Set Width to 0 with class
                // document.getElementById('facts-menu')?.classList.add("hide-during-init");
                // document.getElementById('sections-menu')?.classList.add("hide-during-init");
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
        Links.init();

        Facts.addEventAttributes();
        const disabledNavs = document.querySelectorAll(
            ".navbar .disabled, [disabled]"
        );
        const disabledNavsArray = Array.prototype.slice.call(disabledNavs);

        disabledNavsArray.forEach((current) => {
            current.classList.remove("disabled");
            current.removeAttribute("disabled");
        });
        Facts.updateFactCount(true);
    },

    additionalSetup: () => {
        Links.updateTabs();
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
        input: {
            error?: boolean;
            message?: Array<string>;
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
            sections?: Array<Report>;
            std_ref?: {}
        },
        multiInstanceLoad = false
    ) => {
        if (input.error) {
            document.getElementById('xbrl-form-loading')!.classList.add('d-none');
            Constants.getInlineFiles = [];
            input.message?.forEach((current: string) => {
                ErrorsMajor.message(current);
            });
            return false;
        } else {
            const currentInstance = input.instance?.filter(element => element.current)[0];
            ConstantsFunctions.setInstanceFiles(input.instance);
            ConstantsFunctions.setInlineFiles(currentInstance.xhtmls);
            if (!multiInstanceLoad) {
                ConstantsFunctions.setMetaReports(input.sections);
                ConstantsFunctions.setStdRef(input.std_ref);
            } else {
                ConstantsFunctions.emptyHTMLByID('dynamic-xbrl-form');
            }
            ConstantsFunctions.setFormInformation(currentInstance.formInformation);
            FlexSearch.init(currentInstance.map);

            document.getElementById('html-pagination')?.classList.toggle('d-none');
            const startPerformance = performance.now();
            currentInstance.xhtmls.forEach((current) => {
                if (current.xhtml) {

                    const parser = new DOMParser();
                    const htmlDoc = parser.parseFromString(current.xhtml, 'text/html');

                    document.getElementById('xbrl-form-loading')!.classList.add('d-none');
                    const section = document.createElement('section');
                    section.setAttribute('filing-url', current.slug);
                    !current.current ? section.classList.add('d-none') : null;
                    if (current.current) {
                        for (let i = 0; i < htmlDoc?.querySelector('html')!.attributes.length; i++) {
                            document.querySelector('html')?.setAttribute(
                                (htmlDoc.querySelector('html')?.attributes[i].name as string),
                                (htmlDoc.querySelector('html')?.attributes[i].value as string));
                        }
                    }
                    section.append(htmlDoc.querySelector('body') as HTMLElement);
                    document.getElementById('dynamic-xbrl-form')?.append(section);
                }
            });
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