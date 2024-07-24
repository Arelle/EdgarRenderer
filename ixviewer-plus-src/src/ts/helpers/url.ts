/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */
//WS example url:
// https://secws-edgar-janeway.apps.stg.edg.ix.sec.gov/AR/ixviewer/ix-dev.xhtml?doc=../DisplayDocument.do?step=docOnly&accessionNumber=0001684417-23-800279&interpretedFormat=true&redline=false&filename=e62201020gd-20081231.htm&xbrl=true&metalinks=../DisplayDocument.do?step=docOnly&accessionNumber=0001684417-23-800279&interpretedFormat=true&redline=false&filename=MetaLinks.json

import { Constants } from "../constants/constants";
import { ErrorsMajor } from "../errors/major";
import { UrlParams } from "../interface/url-params";

export const HelpersUrl = {
    init: (internalUrl: string, callback: (arg0: boolean | void) => void): void => {
        callback(HelpersUrl.setParams(internalUrl));
    },

    makeAbsoluteUrlUnlessSimpleAnchorTag: (element: HTMLElement): void => {
        if (element.getAttribute('href')?.indexOf('http://') === 0
            || element.getAttribute('href')?.indexOf('https://') === 0) {
            // already absolute URL
            element.setAttribute('tabindex', '18');
        } else {
            if(element.getAttribute('href')?.startsWith('#'))
            {
                element.setAttribute('tabindex', '18');
                // already simple anchor tag
            }
            else if(HelpersUrl.getFormAbsoluteURL && element.getAttribute('href'))
            {
                element.setAttribute('tabindex', '18');
                element.setAttribute('href', HelpersUrl.getFormAbsoluteURL + element.getAttribute('href'));
            }
            else
            {
                console.warn("Unable to set `href` for element:", element);
            }
        }
    },

    fullURL: null as string | null,

    addLinkattributes: (element: HTMLElement): void => {
        let attribute = "";
        if (element?.getAttribute('data-link')) {
            attribute = 'data-link';
        } else if (element?.getAttribute('href')) {
            attribute = 'href';
        }

        if (attribute && element.getAttribute(attribute)?.charAt(0) !== '#') {
            const attributeValue = element.getAttribute(attribute)!;  //won't be null because of check above
            const absoluteLinkOfElementAttribute = decodeURIComponent(HelpersUrl.getAbsoluteUrl(attributeValue));
            const url = HelpersUrl.ParsedUrl(absoluteLinkOfElementAttribute);

            if (url.search) {
                const urlParams = HelpersUrl.returnURLParamsAsObject(url.search.substring(1));
                if (Object.prototype.hasOwnProperty.call(urlParams, `doc-file`)
                    && Constants.getMetaSourceDocuments.indexOf(urlParams['doc-file']) >= 0)
                {
                    element.setAttribute('data-link', urlParams['doc-file']);
                    element.setAttribute('href', urlParams['doc-file']);
                    element.setAttribute('onclick', 'Links.clickEventInternal(event, this)');
                } else {
                    HelpersUrl.makeAbsoluteUrlUnlessSimpleAnchorTag(element);
                }
            } else {
                if (url.hash) {
                    const urlParams = attributeValue.split('#')[0];
                    if (urlParams && Constants.getMetaSourceDocuments.indexOf(urlParams) >= 0) {
                        element.setAttribute('data-link', attributeValue);
                        element.setAttribute('href', attributeValue);
                        element.setAttribute('onclick', 'Links.clickEventInternal(event, this)');
                    }
                    else {
                        HelpersUrl.makeAbsoluteUrlUnlessSimpleAnchorTag(element);
                    }
                } else {
                    const index = Constants.getMetaSourceDocuments.indexOf(attributeValue);
                    if (index >= 0) {
                        // here we add the necessary attributes for multi-form
                        element.setAttribute('data-link', Constants.getMetaSourceDocuments[index]);
                        element.setAttribute('href', Constants.getMetaSourceDocuments[index]);
                        element.setAttribute('onclick', 'Links.clickEventInternal(event, this)');
                    } else {
                        HelpersUrl.makeAbsoluteUrlUnlessSimpleAnchorTag(element);
                    }
                }
            }
        } else {
            HelpersUrl.makeAbsoluteUrlUnlessSimpleAnchorTag(element);
        }
    },

    isWorkstation: (): boolean =>
    {
        const url = window.location.href;
        let isWorkstation = url.includes("DisplayDocument.do?");
        isWorkstation ||= window.location.host.indexOf("edgar.sec.gov") > 0; //originally used in form-information

        //an old implementation:
        // const isWorkStation = Object.prototype.hasOwnProperty.call(urlParamsAsObject, 'accessionNumber') &&
        //   Object.prototype.hasOwnProperty.call(urlParamsAsObject, 'xbrl') &&
        //   Object.prototype.hasOwnProperty.call(urlParamsAsObject, 'interpretedFormat');

        return isWorkstation;
    },

    returnURLParamsAsObject: (url: string): UrlParams => {
        const urlParams = new URLSearchParams(url);
        const objToReturn = {} as UrlParams;
        const urlParamsAsObject = Object.fromEntries(urlParams);
        const isWorkStation = HelpersUrl.isWorkstation();
        const isFEPT = urlParamsAsObject.doc.includes('view.html');

        for (const urlParam of urlParams.entries()) {
            let [paramKey, paramVal] = urlParam;
            /*
              expected entries: {
                doc: '{doc path}'
                xbrl: bool
                metalinks: '{metalinks path}'
              }
            */
            if (isWorkStation) {
                const fileUrl = `${urlParamsAsObject['doc']}&accessionNumber=${urlParamsAsObject['accessionNumber']}&interpretedFormat=${urlParamsAsObject['interpretedFormat']}&redline=${urlParamsAsObject['redline']}`;

                if (paramVal.endsWith('.htm') || paramVal.endsWith('.html') || paramVal.endsWith('.xhtml')) {
                    objToReturn['doc'] = `${fileUrl}&filename=${paramVal}`;
                    objToReturn['doc-file'] = paramVal;
                } else if (paramKey === 'metalinks') {
                    objToReturn['metalinks'] = `${fileUrl.replace('interpretedFormat=true', 'interpretedFormat=false')}&filename=MetaLinks.json`;
                    objToReturn['metalinks-file'] = 'MetaLinks.json';
                    objToReturn['summary'] = `${fileUrl.replace('interpretedFormat=true', 'interpretedFormat=false')}&filename=FilingSummary.xml`;
                    objToReturn['summary-file'] = 'FilingSummary.xml';
                } else if (paramKey === 'redline') {
                    objToReturn[paramKey] = paramVal == 'true';
                } else {
                    objToReturn[paramKey] = paramVal;
                }
            } else {
                if (paramVal.endsWith('.htm') || paramVal.endsWith('.html') || paramVal.endsWith('.xhtml')) {
                    paramKey = 'doc';
                    paramVal = decodeURIComponent(paramVal);
                    if (isFEPT) {
                        const docFile = paramVal.substring(paramVal.lastIndexOf('filename=') + 9);
                        objToReturn['doc-file'] = docFile;
                    } else {
                        const docFile = paramVal.substring(paramVal.lastIndexOf('/') + 1);
                        objToReturn['doc-file'] = docFile;
                    }
                } else if (paramVal.endsWith('.json')) {
                    paramVal = decodeURIComponent(paramVal);
                    paramVal = paramVal.replace('interpretedFormat=true', 'interpretedFormat=false');
                    objToReturn['metalinks-file'] = 'MetaLinks.json';
                }
                if (paramKey === 'redline') {
                    objToReturn[paramKey] = paramVal == 'true';
                } else {
                    objToReturn[paramKey] = paramVal;
                }

                if (!Object.prototype.hasOwnProperty.call(objToReturn, `metalinks`)) {
                    const metalinks = String(objToReturn['doc']).replace(objToReturn['doc-file'].toString(), 'MetaLinks.json');
                    objToReturn['metalinks'] = metalinks;
                    objToReturn['metalinks-file'] = 'MetaLinks.json';
                }
                if (!Object.prototype.hasOwnProperty.call(objToReturn, `summary`)) {
                    const summary = String(objToReturn['doc']).replace(objToReturn['doc-file'].toString(), 'FilingSummary.xml');
                    objToReturn['summary'] = summary;
                    objToReturn['summary-file'] = 'FilingSummary.xml';
                }
            }
        }
        return objToReturn;
    },

    getFormAbsoluteURL: null as string | null,

    getURL: null as string | null,

    getExternalFile: null as string | null,

    getExternalMeta: null as string | null,

    getHTMLFileName: null as string | null,

    getAnchorTag: null as string | null,

    getAllParams: null as UrlParams | null,

    setParams: (internalUrl: string | boolean): boolean => {
        if ((internalUrl && typeof internalUrl === 'string') && (internalUrl !== HelpersUrl.getHTMLFileName)) {
            HelpersUrl.fullURL = HelpersUrl.fullURL?.replace(HelpersUrl.getHTMLFileName || "", internalUrl) || null;
            HelpersUrl.updateURLWithoutReload();
            HelpersUrl.getHTMLFileName = null;
        }

        const url = HelpersUrl.ParsedUrl(window.location.href);
        // here we check for cors
        const tempUrl = HelpersUrl.ParsedUrl(url.search.substring(1).replace(/doc=|file=/, ''));
        const tempUrlHost = tempUrl.protocol + '//' + tempUrl.host;
        const host = url.protocol + '//' + url.host;
        if (tempUrlHost !== host) {
            ErrorsMajor.cors(tempUrl);
            return false;
        }

        HelpersUrl.fullURL = url.href;
        // we are going to set all of the URL Params as a simple object
        if (url.search) {
            HelpersUrl.getAllParams = HelpersUrl.returnURLParamsAsObject(window.location.search);
            HelpersUrl.getAllParams.hostName = window.location.hostname;

            if (Object.prototype.hasOwnProperty.call(HelpersUrl.getAllParams, `metalinks`)) {
                HelpersUrl.getExternalMeta = decodeURIComponent(HelpersUrl.getAllParams['metalinks']);
                HelpersUrl.getExternalMeta = HelpersUrl.getExternalMeta.replace('interpretedFormat=true',
                    'interpretedFormat=false');
            }

            if (Object.prototype.hasOwnProperty.call(HelpersUrl.getAllParams, `doc-file`)) {
                HelpersUrl.getHTMLFileName = HelpersUrl.getAllParams['doc-file'];
            }

            if (url['hash']) {
                if (url['hash'].endsWith('#')) {

                    url['hash'] = url['hash'].substring(0, url['hash'].length - 1);
                }
                HelpersUrl.getAnchorTag = url['hash'];
            }
            HelpersUrl.getExternalFile = HelpersUrl.getAllParams?.doc || null;
            if (!HelpersUrl.getHTMLFileName && HelpersUrl.getExternalFile) {
                const splitFormURL = HelpersUrl.getExternalFile.split('/');
                HelpersUrl.getHTMLFileName = splitFormURL[splitFormURL.length - 1];
            }

            if (!HelpersUrl.getExternalMeta && HelpersUrl.getExternalFile) {
                const tempMetaLink = !!HelpersUrl.getHTMLFileName ? 
                    HelpersUrl.getExternalFile.replace(HelpersUrl.getHTMLFileName, 'MetaLinks.json') :
                    HelpersUrl.getExternalFile;

                HelpersUrl.getExternalMeta = tempMetaLink;
            }
        }
        if (!HelpersUrl.getExternalFile) {
            return false;
        }

        const formUrl = HelpersUrl.getAbsoluteUrl(HelpersUrl.getExternalFile);
        const absoluteURL = formUrl.substr(0, formUrl.lastIndexOf('/') + 1);

        HelpersUrl.getFormAbsoluteURL = absoluteURL;

        return true;
    },

    getAbsoluteUrl: (url: string) => {
        const a = document.createElement('a');
        a.href = url;
        return a.href;
    },

    getParamsFromString: (name: string, url: string) => {
        name = name.replace(/[[\]]/g, '\\$&');
        const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
        const results = regex.exec(url);

        if (!results) {
            return null;
        }
        if (!results[3]) {
            return '';
        }
        return decodeURIComponent(results[3].replace(/\+/g, ' '));
    },

    updateURLWithoutReload: () => {
        window.history.pushState('Next Link', 'Inline XBRL Viewer', HelpersUrl.fullURL);
    },

    //TODO: this is not valid camelCase
    ParsedUrl: (url: string) => {
        const parser = document.createElement("a");
        parser.href = url;

        // IE 8 and 9 don't load the attributes "protocol" and "host" in case the
        // source URL is just a pathname; that is, "/example" and not
        // "http://domain.com/example".

        // IE 7 and 6 wont load "protocol" and "host" even with the above workaround,
        // so we take the protocol/host from window.location and place them manually
        if (parser.host === "") {
            const newProtocolAndHost = window.location.protocol + "//" + window.location.host;
            if (url.charAt(1) === "/") {
                parser.href = newProtocolAndHost + url;
            }
            else {
                // the regex gets everything up to the last "/"
                // /path/takesEverythingUpToAndIncludingTheLastForwardSlash/thisIsIgnored
                // "/" is inserted before because IE takes it of from pathname (???)
                const currentFolder = ("/" + (parser.pathname || "")).match(/.*\//)?.shift() || "";
                parser.href = newProtocolAndHost + currentFolder + url;
            }
        }

        // copies all the properties to this object
        // wouldn't `Object.assign`, or spread operator, be a simpler implementation?
        const urlInfo =
        {
            host: "",
            hostname: "",
            hash: "",
            href: "",
            port: "",
            protocol: "",
            search: "",
            pathname: "",
        };

        const properties: Array<keyof typeof urlInfo> = ['host', 'hostname', 'hash', 'href', 'port', 'protocol', 'search'];

        for(let prop of properties)
        {
            urlInfo[prop] = parser[prop];
        }

        urlInfo['pathname'] = (parser.pathname.charAt(0) !== "/" ? "/" : "") + parser.pathname;
        return urlInfo;
    }
};
