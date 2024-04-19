/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

import { Constants } from "./constants";
import { FactsTable } from "../facts/table";
import { FactMap } from "../facts/map";
import * as bootstrap from "bootstrap";
import { App } from "../app/app";
import { HelpersUrl } from "../helpers/url";
import { Modals } from "../modals/modals";
import * as DOMPurify from "dompurify";

export const ConstantsFunctions = {

  setTitle: () => {
    const name = FactMap.getByName('dei:EntityRegistrantName') || '';
    const form = FactMap.getByName('dei:DocumentType') || '';
    const date = FactMap.getByName('dei:DocumentPeriodEndDate') || '';
    let viewType = 'Inline Viewer';
    const searchParams = HelpersUrl.returnURLParamsAsObject(window.location.search);
    // need to test on arelle local gui...
    const iframes = document.querySelectorAll('iframe').length
    const appIsInIframe = (window.parent.document == document) && iframes;
    if (appIsInIframe && searchParams.title) {
      viewType = searchParams.title;
    }
    window.parent.document.title = `${viewType}: ${name} ${form} ${date}`;
  },

  emptyHTMLByID: (id: string) => {
    if (id && document.getElementById(id)) {
      while (
        document.getElementById(id)?.firstChild
      ) {
        document.getElementById(id)?.firstChild?.remove();
      }
    }

  },

  setInstanceFiles: (input) => {
    Constants.getInstanceFiles = input;
  },

  setInlineFiles: (input: Array<{ current: boolean, loaded: boolean, slug: string, table?: boolean, dropdown?: boolean }>) => {
    Constants.getInlineFiles = input;
  },

  setMetaReports: (input) => {
    Constants.getMetaReports = input;
  },

  setStdRef: (input) => {
    Constants.getStdRef = input;
  },

  setFormInformation: (input) => {
    Constants.getFormInformation = input
  },

  getFactLabel: (labels): string => {
    const label = labels.find(element => element.Label);
    return label ? label.Label : 'Not Available.'
  },

  getCollapseToFactValue: () => {
    const factValueModals = Array.from(document.querySelectorAll('.fact-value-modal'));
    factValueModals.forEach((current) => {
      if ((current as HTMLElement)?.offsetHeight && (current as HTMLElement)?.offsetHeight as number > 33) {

        const a = document.createElement('a');
        a.classList.add('ms-1')
        a.setAttribute('aria-expanded', 'false');
        a.setAttribute('aria-controls', 'fact-value-modal');
        a.setAttribute('data-bs-toggle', 'collapse');
        a.setAttribute('data-bs-target', '.fact-value-modal');
        a.setAttribute('href', '#');
        const aText = document.createTextNode(`More/Less`);
        a.append(aText);
        current.parentNode?.parentNode?.querySelector('.fact-collapse')?.append(a);
        current?.classList.add('collapse');
      }

    })
  },

  changeInstance: (instance: number, baseref: string | null, callback: (arg0: boolean) => void) => {
    Modals.close(new Event(''));

    Constants.getInstanceFiles.forEach((current) => {
      current.current = current.instance === instance ? true : false;
      current.xhtmls.forEach((xhtml, index) => {
        if (baseref) {
          if (current.instance === instance && baseref === xhtml.slug) {
            xhtml.current = true;
          } else {
            xhtml.current = false;
          }
        } else {
          xhtml.current = index === 0 ? true : false;
        }
      });
    });
    const needToLoadInstance = Constants.getInstanceFiles[instance].xhtmls.some(element => !element.loaded);
    if (needToLoadInstance) {
      // not loaded, go get the requested instance
      App.init(true, () => {
        App.additionalSetup();
        callback(true);
      });
    } else {
      // already loaded, just update the DOM and update FlexSearch
      const currentInstance = Constants.getInstanceFiles.find(element => element.current);
      HelpersUrl.init(currentInstance?.xhtmls.find(element => element.current)?.slug, () => {
        const input = {
          instance: Constants.getInstanceFiles
        }
        App.handleFetchAndMerge(input, true);
        App.additionalSetup();
        callback(true);
      });
    }

  },

  changeInlineFiles: (fileToChangeTo: string) => {

    const offCanvasElement = document.getElementById('fact-table-container');
    const offCanvas = bootstrap.Offcanvas.getInstance(offCanvasElement as HTMLElement);
    offCanvasElement?.removeEventListener('hidden.bs.offcanvas', () => FactsTable.toggle(false));
    offCanvas?.hide();
    offCanvasElement?.addEventListener('hidden.bs.offcanvas', () => FactsTable.toggle(false));

    HelpersUrl.init(fileToChangeTo, () => {
      const requestedFile = document.querySelector(`#dynamic-xbrl-form [filing-url='${fileToChangeTo}']`);
      if (requestedFile) {
        Array.from(document.querySelectorAll(`#dynamic-xbrl-form [filing-url]`)).forEach((current) => {
          current.getAttribute('filing-url') === fileToChangeTo ? current.classList.remove('d-none') : current.classList.add('d-none');
        });
        Constants.getInlineFiles.forEach((current) => {
          current.slug === fileToChangeTo ? current.current = true : current.current = false;
        });
      } else {
        // throw error, something super strnage has occured
      }
    });
  },

  sanitizeHtml: (unsafeHtml: string) => {
    return DOMPurify.sanitize(unsafeHtml);
  },

}