import { Logger, ILogObj } from "tslog";
import { Constants } from "../constants";
import { ConstantsFunctions } from "../constants/functions";
import { Development } from "../development";
import { ErrorsMajor } from "../errors/major";
import { FactMap } from "../fact-map";
import { Facts } from "../facts";
import { FetchAndMerge } from "../fetch-merge";
import { FlexSearch } from "../flex-search";
import { HelpersUrl } from "../helpers/url";
import { Links } from "../links";
import { SingleFact } from "../interface/fact";
//import { FormInformation } from "../interface/form-information";
import { Meta } from "../interface/meta";

/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

export const App = {
    init: (loadInstance = false, callback: (arg0: boolean) => void) => {
        let xhtmlUrl = ''
        if (loadInstance) {

            ConstantsFunctions.emptyHTMLByID('dynamic-xbrl-form');
            document.getElementById('html-pagination')?.classList.toggle('d-none');
            document.getElementById('xbrl-form-loading')!.classList.remove('d-none');
            const currentInstance = Constants.getInstanceFiles.find(element => element.current);
            xhtmlUrl = currentInstance?.xhtmls.find(element => element.current)?.slug;
        }
        HelpersUrl.init(xhtmlUrl, () => {
            if (HelpersUrl.getAllParams && HelpersUrl.getAllParams!["metalinks"] &&
                HelpersUrl.getAllParams!["doc"] &&
                HelpersUrl.getFormAbsoluteURL
            ) {
                if (window.Worker) {
                    if (!PRODUCTION) {
                        const log: Logger<ILogObj> = new Logger();
                        log.debug(`\nWorker Init`);
                    }
                    const worker = new Worker(
                        new URL('../workers/index.ts', import.meta.url), { name: 'fetch-merge' }
                    );
                    worker.postMessage({
                        params: HelpersUrl.getAllParams,
                        absolute: HelpersUrl.getFormAbsoluteURL,
                        instance: loadInstance ? Constants.getInstanceFiles : null,
                        std_ref: Constants.getStdRef
                        // partial: instance ? true : false,
                        // map: instance ? FactMap.map : false,
                        // customPrefix: Constants.getFormInformation.nsPrefix,
                    });
                    worker.onmessage = (event) => {
                        if (event && event.data) {
                            worker.terminate();
                            callback(App.handleFetchAndMerge(event.data.all, loadInstance));
                        }
                    }
                } else {
                    if (!PRODUCTION) {
                        const log: Logger<ILogObj> = new Logger();
                        log.debug(`\nWorker NOT Init`);
                    }
                    // browser does not support web worker
                    const data = {
                        params: HelpersUrl.getAllParams,
                        absolute: HelpersUrl.getFormAbsoluteURL,
                        partial: internalUrl ? true : false,
                        map: internalUrl ? FactMap.map : false,
                        customPrefix: Constants.getFormInformation.nsprefix
                    };

                    const fetchAndMerge = new FetchAndMerge(data);
                    fetchAndMerge.init().then(data => {
                        callback(App.handleFetchAndMerge(data.all, loadInstance));

                    });
                }
            } else {
                document.getElementById('xbrl-form-loading')!.classList.add('d-none');
                Facts.updateFactCount();
                ErrorsMajor.urlParams();

                callback(false);
                if (!PRODUCTION) {
                    new Development();
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
        Facts.updateFactCount();
    },

    additionalSetup: () => {
        Links.update();
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
            input.message.forEach((current: string) => {
                ErrorsMajor.message(current);
            });
            ErrorsMajor.urlParams();
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
            new FlexSearch();
            FlexSearch.init(currentInstance.map);

            document.getElementById('html-pagination')?.classList.toggle('d-none');
            currentInstance.xhtmls.forEach((current) => {
                if (current.xhtml) {
                    const parser = new DOMParser();
                    const htmlDoc = parser.parseFromString(current.xhtml, 'text/html');
                    document.getElementById('xbrl-form-loading')!.classList.add('d-none');
                    const section = document.createElement('section');
                    section.setAttribute('filing-url', current.slug);
                    !current.current ? section.classList.add('d-none') : null;
                    section.append(htmlDoc.querySelector('body') as HTMLElement)
                    document.getElementById('dynamic-xbrl-form')?.append(section);
                }
            });
            ConstantsFunctions.setTitle();
            return true;
        }
    }
};