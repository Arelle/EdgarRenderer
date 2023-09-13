/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

import { Reference, SingleFact } from "../interface/fact";
import { FormInformation } from "../interface/form-information";
import { Meta } from "../interface/meta";

export const Constants: {
  version: string,
  scrollPosition: string,
  hoverOption: boolean,
  getInstanceFiles: Array<{
    current: boolean,
    formInformation: {
      axisCustom: number,
      axisStandard: number,
      baseTaxonomies: { [key: string]: number },
      contextCount: number,
      dts: { [key: string]: { [key: string]: Array<string> } },
      elementCount: number,
      entityCount: 1,
      hidden: { [key: string]: number },
      keyCustom: number,
      keyStandard: number,
      memberCustom: number,
      memberStandard: number,
      nsprefix: string,
      nsuri: string,
      segmentCount: number,
      unitcount: number,
    },
    instance: number,
    map: Map<string, SingleFact>,
    metaInstance: Meta,
    xhtmls: Array<{
      current: boolean,
      loaded: boolean,
      slug: string,
      url: string,
      xhtml: string,
    }>,
    xmlSlug: Array<string>,
    xmlUrls: Array<string>,
  }>,
  getInlineFiles: Array<{
    current: boolean,
    loaded: boolean,
    slug: string,
    dropdown?: boolean,
    table?: boolean
  }>,
  getFormInformation: FormInformation,
  getStdRef: { [key: string]: Reference },

} = {

  version: "23.1",


  scrollPosition: localStorage.getItem("scrollPosition") || "start",

  hoverOption: localStorage.getItem("hoverOption") === "true" || false,

  getHTMLAttributes: {},

  getPaginationPerPage: 10,

  getHtmlOverallFactsCount: null,

  getMetaSourceDocuments: [],

  getFactTypes: [],

  getHTMLPrefix: null,

  getMetaTags: [],

  getMetaCalculationsParentTags: [],

  getMetaCalculations: [],

  getMetaEntityCounts: null,

  getInstanceFiles: [],

  getInlineFiles: [],

  getMetaReports: [],

  getStdRef: {},

  getFormInformation: {},

  getMetaStandardReference: [],

  getMetaVersion: null,

  getMetaCustomPrefix: null,

  getMetaHidden: null,

  getMetaDts: null,

  getMetaDocuments: (input: string) => {
    if (input && typeof input === "string") {
      return Constants.getMetaDts && Constants.getMetaDts[input]
        ? Constants.getMetaDts[input]
        : null;
    }
    return null;
  },

  getFormattingObject: {}
};
