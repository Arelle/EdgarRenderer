/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

import { Errors } from "./errors";
import { HelpersUrl } from "../helpers/url";
import { Logger, ILogObj } from 'tslog';

export const ErrorsMajor: {
  debug: (msg?: string) => void,
  inactive: () => void,
  formLinksNotFound: () => void,
  urlParams: () => void,
  cors: (doc: { host: string; }) => void,
  message: (input: string) => void,
} = {

  debug: (msg?: string) => {
    if (!PRODUCTION && DEBUGCSS) {
      const content = document.createTextNode(msg || 'Showing major errors container for debugging');

      const element = document.createElement('div');
      element.setAttribute('class', 'alert-height alert alert-danger show mb-0');
      element.appendChild(content);
      document.getElementById('error-container')?.appendChild(element);

      Errors.updateMainContainerHeight();
    }
  },

  inactive: () => {
    const content = document.createTextNode('Inline XBRL is not usable in this state.');

    const element = document.createElement('div');
    element.setAttribute('class', 'alert-height alert alert-danger show mb-0');
    element.appendChild(content);
    document.getElementById('error-container')?.appendChild(element);

    Errors.updateMainContainerHeight();

    if (!PRODUCTION) {
      const log: Logger<ILogObj> = new Logger();
      log.debug(`inactive`);
    }
  },

  formLinksNotFound: () => {
    const content = document.createTextNode(`${HelpersUrl.getFormAbsoluteURL + HelpersUrl.getHTMLFileName}`);

    const element = document.createElement('div');
    element.setAttribute('class', 'alert-height alert alert-danger show mb-0');

    const link = document.createElement('a');
    link.setAttribute('href', `${HelpersUrl.getFormAbsoluteURL}`);

    link.appendChild(content);
    element.appendChild(link);
    document.getElementById('error-container')?.appendChild(element);

    // window.location.assign(`${HelpersUrl.getFormAbsoluteURL + HelpersUrl.getHTMLFileName}`);
    Errors.updateMainContainerHeight();

    if (!PRODUCTION) {
      const log: Logger<ILogObj> = new Logger();
      log.debug(`formLinksNotFound`);
    }
  },

  urlParams: () => {
    const content = document
      .createTextNode('Inline XBRL requires a URL param (doc | file) that correlates to a Financial Report.');

    const element = document.createElement('div');
    element.setAttribute('class', 'alert-height alert alert-danger show mb-0');
    element.appendChild(content);
    document.getElementById('error-container')?.appendChild(element);

    Errors.updateMainContainerHeight();

    if (!PRODUCTION) {
      const log: Logger<ILogObj> = new Logger();
      log.debug(`urlParams`);
    }
  },

  cors: (doc) => {
    const host = window.location.protocol + '//' + window.location.host;

    const content = document.createTextNode('The protocol, host name and port number of the "doc" field (' + doc.host
      + '), if provided, must be identical to that of the Inline XBRL viewer(' + host + ')');

    const element = document.createElement('div');
    element.setAttribute('class', 'alert-height alert alert-danger show mb-0');
    element.appendChild(content);
    document.getElementById('error-container')?.appendChild(element);

    Errors.updateMainContainerHeight();

    if (!PRODUCTION) {
      const log: Logger<ILogObj> = new Logger();
      log.debug(`cors`);
    }
  },

  message: (input) => {
    const content = document
      .createTextNode(input);

    const element = document.createElement('div');
    element.setAttribute('class', 'alert-height alert alert-danger show mb-0');
    element.appendChild(content);
    document.getElementById('error-container')?.appendChild(element);

    Errors.updateMainContainerHeight();

    if (!PRODUCTION) {
      const log: Logger<ILogObj> = new Logger();
      log.debug(`message`);
    }
  }
};
