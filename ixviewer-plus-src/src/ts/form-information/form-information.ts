/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

import { Constants } from "../constants/constants";
import { ConstantsFunctions } from "../constants/functions";
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
    document.getElementById('form-information-instance')?.setAttribute('href', currentInstance.xmlUrls[0]);
  },

  xbrlZip: () => {
    let zip = "";
    let zipFileName: string;
    let adsh: string;
    const url = HelpersUrl.getExternalFile as unknown as string;
    if (HelpersUrl.getAllParams!.hostName.indexOf("edgar.sec.gov") !== -1) {
      adsh = ConstantsFunctions.getUrlconsts(url)["accessionNumber"];
      zipFileName = adsh + '-xbrl.zip';
      const lastIndexOfEqual = url.lastIndexOf("=");
      zip = url.substring(0, lastIndexOfEqual) + "=" + zipFileName;
    } else {
      const index = url.lastIndexOf("/");
      const tempHold = url.substring(index, index - 18);
      adsh = tempHold.substring(0, 10) + "-" + tempHold.substring(10, 12) + "-" + tempHold.substring(12, 18);
      zipFileName = adsh + '-xbrl.zip';
      zip = url.substring(0, index) + "/" + zipFileName;
    }
    document.getElementById('form-information-zip')?.setAttribute('href', zip);

  },

  xbrlHtml: () => {
    const currentXHTML = Constants.getInstanceFiles.find(element => element.current).xhtmls.find(element => element.current);
    document.getElementById('form-information-html')?.setAttribute('href', currentXHTML.url);
  },

  version: () => {
    document.getElementById('form-information-version')!.innerText = 'Version: ' + Constants.version;
  }

};
