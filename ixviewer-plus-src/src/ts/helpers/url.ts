/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */
//WS example url:
// https://secws-edgar-janeway.apps.stg.edg.ix.sec.gov/AR/ixviewer/ix-dev.xhtml?doc=../DisplayDocument.do?step=docOnly&accessionNumber=0001684417-23-800279&interpretedFormat=true&redline=false&filename=e62201020gd-20081231.htm&xbrl=true&metalinks=../DisplayDocument.do?step=docOnly&accessionNumber=0001684417-23-800279&interpretedFormat=true&redline=false&filename=MetaLinks.json
import { Constants } from "../constants";
import { ErrorsMajor } from "../errors/major";

export const HelpersUrl: {
  init: (internalUrl: string, callback: (arg0: boolean) => void) => void,
  makeAbsoluteUrlUnlessSimpleAnchorTag: (element: HTMLElement) => void,
  fullURL: undefined | string | null,
  addLinkattributes: (element: HTMLElement) => void,
  returnURLParamsAsObject: (url: string) => void,
  getFormAbsoluteURL: null,
  getURL: null,
  getExternalFile: null,
  getExternalMeta: null,
  getHTMLFileName: null,
  getAnchorTag: null,
  getAllParams: null | {
    doc: string,
    'doc-file': string,
    hostName: string,
    redline: boolean,
    metalinks: string,
    'metalinks-file': string,
    fact: string,
  },
  setParams: (internalUrl: string | boolean) => void,
  getAbsoluteUrl: (url: string) => void,
  getParamsFromString: (name: string, url: string) => void,
  updateURLWithoutReload: () => void,
  ParsedUrl: (url: string) => void,
} = {

  init: (internalUrl: string, callback: (arg0: boolean) => void) => {
    callback(HelpersUrl.setParams(internalUrl));
  },

  makeAbsoluteUrlUnlessSimpleAnchorTag: (element) => {
    if (element.getAttribute('href')?.indexOf('http://') === 0
      || element.getAttribute('href')?.indexOf('https://') === 0) {
      // already absolute URL
      element.setAttribute('tabindex', '18');
    } else {
      if (element.getAttribute('href')?.startsWith('#')) {
        element.setAttribute('tabindex', '18');
        // already simple anchortag

      } else {
        element.setAttribute('tabindex', '18');
        element.setAttribute('href', HelpersUrl.getFormAbsoluteURL + element.getAttribute('href'));
      }
    }
  },

  fullURL: null,

  addLinkattributes: (element) => {
    let attribute = null;
    if (element) {
      if (element.getAttribute('data-link')) {
        attribute = 'data-link';
      } else if (element.getAttribute('href')) {
        attribute = 'href';
      }
    }

    if (attribute && element.getAttribute(attribute).charAt(0) !== '#') {
      const absoluteLinkOfElementAttribute = decodeURIComponent(HelpersUrl
        .getAbsoluteUrl(element.getAttribute(attribute)));
      const url = HelpersUrl.ParsedUrl(absoluteLinkOfElementAttribute);
      if (url.search) {
        const urlParams = HelpersUrl.returnURLParamsAsObject(url.search.substring(1));
        if (Object.prototype.hasOwnProperty.call(urlParams, `doc-file`)
          && Constants.getMetaSourceDocuments.indexOf(urlParams['doc-file']) >= 0) {
          element.setAttribute('data-link', urlParams['doc-file']);
          element.setAttribute('href', urlParams['doc-file']);
          element.setAttribute('onclick', 'Links.clickEventInternal(event, this)');
        } else {
          HelpersUrl.makeAbsoluteUrlUnlessSimpleAnchorTag(element);
        }
      } else {
        if (url.hash) {
          const urlParams = element.getAttribute(attribute).split('#')[0];
          if (urlParams
            && Constants.getMetaSourceDocuments.indexOf(urlParams) >= 0) {
            element.setAttribute('data-link', element.getAttribute(attribute));
            element.setAttribute('href', element.getAttribute(attribute));
            element.setAttribute('onclick', 'Links.clickEventInternal(event, this)');
          }
          else {
            HelpersUrl.makeAbsoluteUrlUnlessSimpleAnchorTag(element);
          }
        } else {
          const index = Constants.getMetaSourceDocuments.indexOf(element.getAttribute(attribute));
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

  returnURLParamsAsObject: (url) => {
    const urlParams = new URLSearchParams(url);
    const objToReturn = {};
    const urlParamsAsObject = Object.fromEntries(urlParams);
    const isWorkStation = Object.prototype.hasOwnProperty.call(urlParamsAsObject, 'accessionNumber') &&
      Object.prototype.hasOwnProperty.call(urlParamsAsObject, 'xbrl') &&
      Object.prototype.hasOwnProperty.call(urlParamsAsObject, 'interpretedFormat');

    for (const entry of urlParams.entries()) {
      if (isWorkStation) {

        const fileUrl = `${urlParamsAsObject['doc']}&accessionNumber=${urlParamsAsObject['accessionNumber']}&interpretedFormat=${urlParamsAsObject['interpretedFormat']}&redline=${urlParamsAsObject['redline']}`;

        if (entry[1].endsWith('.htm') || entry[1].endsWith('.html') || entry[1].endsWith('.xhtml')) {
          objToReturn['doc'] = `${fileUrl}&filename=${entry[1]}`;
          objToReturn['doc-file'] = entry[1];
        } else if (entry[0] === 'metalinks') {
          objToReturn['metalinks'] = `${fileUrl.replace('interpretedFormat=true', 'interpretedFormat=false')}&filename=MetaLinks.json`;
          objToReturn['metalinks-file'] = 'MetaLinks.json';
          objToReturn['summary'] = `${fileUrl.replace('interpretedFormat=true', 'interpretedFormat=false')}&filename=FilingSummary.xml`;
          objToReturn['summary-file'] = 'FilingSummary.xml';
        } else {
          objToReturn[entry[0]] = entry[1];
        }

      } else {
        if (entry[1].endsWith('.htm') || entry[1].endsWith('.html') || entry[1].endsWith('.xhtml')) {
          entry[0] = 'doc';
          entry[1] = decodeURIComponent(entry[1]);
          const docFile = entry[1].substring(entry[1]
            .lastIndexOf('/') + 1);
          objToReturn['doc-file'] = docFile;
        } else if (entry[1].endsWith('.json')) {
          entry[1] = decodeURIComponent(entry[1]);
          entry[1] = entry[1].replace('interpretedFormat=true', 'interpretedFormat=false');
          objToReturn['metalinks-file'] = 'MetaLinks.json';
        }
        objToReturn[entry[0]] = entry[1];
        if (!Object.prototype.hasOwnProperty.call(objToReturn, `metalinks`)) {
          const metalinks = objToReturn['doc'].replace(objToReturn['doc-file'], 'MetaLinks.json');
          objToReturn['metalinks'] = metalinks;
          objToReturn['metalinks-file'] = 'MetaLinks.json';
        }
        if (!Object.prototype.hasOwnProperty.call(objToReturn, `summary`)) {
          const summary = objToReturn['doc'].replace(objToReturn['doc-file'], 'FilingSummary.xml');
          objToReturn['summary'] = summary;
          objToReturn['summary-file'] = 'FilingSummary.xml';
        }
      }
    }
    return objToReturn;

  },

  getFormAbsoluteURL: null,

  getURL: null,

  getExternalFile: null,

  getExternalMeta: null,

  getHTMLFileName: null,

  getAnchorTag: null,

  getAllParams: null,

  setParams: (internalUrl) => {
    if ((internalUrl && typeof internalUrl === 'string') && (internalUrl !== HelpersUrl.getHTMLFileName)) {
      HelpersUrl.fullURL = HelpersUrl.fullURL?.replace(HelpersUrl.getHTMLFileName, internalUrl);
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
      HelpersUrl.getExternalFile = HelpersUrl.getAllParams['doc'];
      if (!HelpersUrl.getHTMLFileName && HelpersUrl.getExternalFile) {
        const splitFormURL = HelpersUrl.getExternalFile.split('/');
        HelpersUrl.getHTMLFileName = splitFormURL[splitFormURL.length - 1];
      }

      if (!HelpersUrl.getExternalMeta && HelpersUrl.getExternalFile) {

        const tempMetaLink = HelpersUrl.getExternalFile.replace(HelpersUrl.getHTMLFileName, 'MetaLinks.json');

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

  ParsedUrl: (url: string) => {
    const parser = document.createElement("a");
    parser.href = url;

    // IE 8 and 9 dont load the attributes "protocol" and "host" in case the
    // source URL
    // is just a pathname, that is, "/example" and not
    // "http://domain.com/example".
    //parser.href = parser.href;

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
        // "/" is inserted before because IE takes it of from pathname
        const currentFolder = ("/" + parser.pathname).match(/.*\//)[0];
        parser.href = newProtocolAndHost + currentFolder + url;
      }
    }

    // copies all the properties to this object
    const properties = ['host', 'hostname', 'hash', 'href', 'port', 'protocol', 'search'];
    const urlInfo: {
      host: string;
      hostname: string;
      hash: string;
      href: string;
      port: string;
      protocol: string;
      search: string;
      pathname: string;
    } = {
      host: "",
      hostname: "",
      hash: "",
      href: "",
      port: "",
      protocol: "",
      search: "",
      pathname: ""
    };
    for (let i = 0, n = properties.length; i < n; i++) {
      urlInfo[properties[i]] = parser[properties[i]];

    }
    urlInfo['pathname'] = (parser.pathname.charAt(0) !== "/" ? "/" : "") + parser.pathname;
    return urlInfo;
  }
};
