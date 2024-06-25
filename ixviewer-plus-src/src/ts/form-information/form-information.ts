/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

import { Constants } from "../constants/constants";
import { HelpersUrl } from "../helpers/url";


export const FormInformation = {
    init: () => {
        FormInformation.xbrlInstance();
        FormInformation.xbrlZip();
        FormInformation.xbrlHtml();
        FormInformation.version();
    },

    xbrlInstance: () => {
        const currentInstance = Constants.getInstanceFiles.find(element => element.current);
        document.getElementById('form-information-instance')?.setAttribute('href', currentInstance?.xmlUrl || "#");
    },

    xbrlZip: () =>
    {
        //Handle Workstation case
        if(HelpersUrl.isWorkstation())
        {
            const url = window.parent.location.href;
            const params = new URLSearchParams(window.parent.location.search);
            const zip = `${params.get("accessionNumber")}-xbrl.zip`;
            params.set("filename", zip);
            params.set("step", "docOnly");
            params.set("interpretedFormat", "false");
            params.delete("status");
            params.delete("sequenceNumber");

            const zipUrl = url.substring(0, url.indexOf("?")+1) + params.toString();
            document.getElementById("form-information-zip")?.setAttribute("href", zipUrl);
            document.getElementById("form-information-zip")?.setAttribute("target", "_blank");
            return;
        }

        const url = HelpersUrl.getExternalFile || "";
        const [_, beginning, CIK, filingID] = [...url.matchAll(/(.*Archives\/edgar\/data)\/([0-9]+|no-cik)\/([0-9-]+)\//g)].shift() || [];

        if(!filingID)
        {
            console.error("Invalid filing path - cannot create zip link");
            document.getElementById('form-information-zip')?.classList.add('disabled');
            return;
        }

        let zipFileName = filingID;
        if(zipFileName?.indexOf('-') < 0)
            zipFileName = filingID.substring(0, 10) + "-" + filingID.substring(10, 12) + "-" + filingID.substring(12, 18);

        zipFileName += "-xbrl.zip";
        const zip = `${beginning}/${CIK}/${filingID}/${zipFileName}`;

        document.getElementById("form-information-zip")?.setAttribute("href", zip);
    },

    xbrlHtml: () => {
        const currentXHTML = Constants.getInstanceFiles.find(element => element.current)?.xhtmls.find(element => element.current);
        document.getElementById('form-information-html')?.setAttribute('href', currentXHTML?.url || "#");
    },

    version: () => {
        document.getElementById('form-information-version')!.innerText = `Version: ${Constants.version} (${Constants.featureSet})`;
    },
};
