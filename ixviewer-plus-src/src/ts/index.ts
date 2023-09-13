import "../styles.scss";
import { HelpersUrl } from "./helpers/url";
import { ErrorsMajor } from "./errors/major";
import { Listeners } from "./listeners";
import { SetCustomCSS } from "./settings";
import { FactsGeneral } from "./facts/general";
import { App } from "./app";
import { Logger, ILogObj } from "tslog";
/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

(() => {
    new Listeners();
    new SetCustomCSS();
    const startPerformance = performance.now();
    App.init(false, (formLoaded: boolean) => {
        if (formLoaded) {
            App.initialSetup();
            if (Object.prototype.hasOwnProperty.call(HelpersUrl.getAllParams, `fact`)) {
                setTimeout(() => {
                    const tempDiv = document.createElement('div');
                    tempDiv.setAttribute('data-id', HelpersUrl.getAllParams?.fact as string);
                    FactsGeneral.goTo(new Event(''), tempDiv);
                });
            }
        } else {
            ErrorsMajor.inactive();
        }
        const endPerformance = performance.now();
        if (!PRODUCTION) {
            const log: Logger<ILogObj> = new Logger();
            log.debug(`\nAppInit.init() completed in: ${(endPerformance - startPerformance).toFixed(2)}ms`);
        }
    });
})();
