/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

import { Reference, SingleFact } from "../interface/fact";
import { FormInformation } from "../interface/form-information";
import { Meta } from "../interface/meta";
import { Section } from "../interface/meta";

export const Constants: {
	version: string,
	featureSet: string,
	scrollPosition: string,
	hoverOption: boolean,
	getHTMLAttributes: object,
	getPaginationPerPage: number,
	getHtmlOverallFactsCount: string | null,
	getMetaSourceDocuments: Array<{}>,
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
	setSections: (sections:Section[]) => void,
	sections: Section[],
	getSectionsFromSessionStorage: () => Section[],
	getMetaReportsArray: Array<{}>,
	getMetaTags: Array<{}>,
	getMetaCustomPrefix: null | string,
	getMetaDts: object,
	getMetaDocuments: () => object,
	getScrollPosition: () => number,
	getNavBarsHeight: () => number | undefined,
} = {

	version: "24.2",
	featureSet: "plus",

	scrollPosition: typeof window !== 'undefined' && window.localStorage.getItem("scrollPosition") || "start",

	hoverOption: typeof window !== 'undefined' && window.localStorage.getItem("hoverOption") === "true" || false,

	getHTMLAttributes: {},

	getPaginationPerPage: 10,

	getHtmlOverallFactsCount: null,

	getMetaSourceDocuments: [],

	getMetaTags: [],

	getInstanceFiles: [],

	getInlineFiles: [],

	setSections: (sections: Array<Section>) => {
		if (sections) {
			Constants.sections = sections;
			sessionStorage.setItem('sections', JSON.stringify(sections));
		}
	},

	sections: [],
	getSectionsFromSessionStorage: () => {
		const sectionsFromLocal = sessionStorage.getItem('sections');
		if (sectionsFromLocal) {
			return JSON.parse(sectionsFromLocal || '[]');
		}
	},

	getStdRef: {},

	getFormInformation: {},

	getMetaCustomPrefix: null,

	getMetaDts: null,

	getMetaDocuments: (input: string) => {
		if (input && typeof input === "string") {
			return Constants.getMetaDts && Constants.getMetaDts[input]
				? Constants.getMetaDts[input]
				: null;
		}
		return null;
	},

	getScrollPosition: () => {
		const currentScrollPosition = document.getElementById('dynamic-xbrl-form')!.scrollTop as number;
		return currentScrollPosition;
	},

	getNavBarsHeight: () => {
		return document.querySelector<HTMLElement>('div[id="topNavs"]')?.offsetHeight || 0;
	}

};
