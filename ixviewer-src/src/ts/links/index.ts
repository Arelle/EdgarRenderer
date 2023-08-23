/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

import { Constants } from "../constants";
import { ConstantsFunctions } from "../constants/functions";
import { FactMap } from "../fact-map";
import { HelpersUrl } from "../helpers/url";

export const Links = {

  init: () => {
    Links.populate();
    Links.absoluteLinks();
  },

  populate: () => {
    const container = document.getElementById('tabs-container');
    Constants.getInlineFiles.forEach((current, index) => {
      // add Instance dropdown
      if (index === 0 && Constants.getInstanceFiles.length > 1) {
        const li = document.createElement('li');
        li.classList.add('nav-item');
        const a = document.createElement('a');
        a.classList.add('nav-link');
        a.setAttribute('aria-current', 'page');
        a.classList.add('dropdown-toggle');
        a.setAttribute('data-bs-toggle', 'dropdown');
        a.setAttribute('aria-expanded', 'false');
        const ul = document.createElement('ul');
        ul.classList.add('dropdown-menu');
        Constants.getInstanceFiles.forEach((current) => {
          const labels = current.xhtmls.map(element =>
            !element.dropdown && !element.table ? element.slug : null).filter(Boolean);
          const li = document.createElement('li');
          const a2 = document.createElement('a');
          a2.classList.add('dropdown-item');
          current.current ? a2.classList.add('active') : null;
          const aText = document.createTextNode(labels.join(', '));
          a2.addEventListener('click', (event: KeyboardEvent) => {
            Links.clickEventInstance(event, current.instance);
          });
          a2.addEventListener('keyup', (event: KeyboardEvent) => {
            Links.clickEventInstance(event, current.instance);
          });
          a2.append(aText);
          li.append(a2);
          ul.append(li);
        });
        const text = document.createTextNode(`Instance`);
        a.append(text);
        a.append(ul);
        li.append(a);
        container?.append(li);
      }
      // END add Instance dropdown

      // Inline Files
      const li = document.createElement('li');
      li.classList.add('nav-item');

      const a = document.createElement('a');
      a.classList.add('nav-link');
      a.setAttribute('aria-current', 'page');
      if (current.current === false) {

        a.setAttribute('href', current.slug);
        a.setAttribute('data-link', current.slug);
        a.addEventListener('click', (event: MouseEvent) => {
          Links.clickEventInternal(event, a);
        });
        a.addEventListener('keyup', (event: KeyboardEvent) => {
          Links.clickEventInternal(event, a);
        });

      } else {
        a.classList.add('active');
      }
      const text = document.createTextNode(current.slug);

      a.append(text);

      const span = document.createElement('span');
      current.table ? span.classList.add('fact-total-count') : span.classList.add('fact-file-total-count');

      span.classList.add('badge');
      current.current ? span.classList.add('text-bg-light') : span.classList.add('bg-sec');
      span.classList.add('ms-1');
      current.table ? null : span.setAttribute('filing-slug', current.slug);

      const factText = document.createTextNode(FactMap.getFactCountForFile(current.slug, true));

      span.append(factText);
      a.append(span);

      li.append(a);
      container?.append(li);
      // END Inline Files

      // Fact Table
      if (index === Constants.getInlineFiles.length - 1) {
        const li = document.createElement('li');
        li.classList.add('nav-item');
        const a = document.createElement('a');
        a.classList.add('nav-link');
        a.setAttribute('href', '#');
        a.setAttribute('data-link', '#fact-table');
        a.setAttribute('data-bs-toggle', 'offcanvas');
        a.setAttribute('data-bs-target', '#fact-table-container');
        a.addEventListener('click', () => {
          a.classList.toggle('active');
          Links.updateCurrent(a.classList.contains('active'));
        });
        a.addEventListener('keyup', () => {
          a.classList.toggle('active');
          Links.updateCurrent(a.classList.contains('active'));
        });
        const text = document.createTextNode(`Fact Table`);
        a.append(text);

        const span = document.createElement('span');
        span.classList.add('fact-total-count');
        span.classList.add('badge');
        span.classList.add('bg-sec');
        span.classList.add('ms-1');

        const factText = document.createTextNode(FactMap.getFactCount(true));

        span.append(factText);
        a.append(span);

        li.append(a);
        container?.append(li);
      }
      // END Fact Table
    });
  },

  update: () => {
    ConstantsFunctions.emptyHTMLByID('tabs-container');
    Links.populate();
  },

  absoluteLinks: () => {
    const foundLinks = document.getElementById('dynamic-xbrl-form')?.querySelectorAll('[data-link],[href]');

    const foundLinksArray = Array.prototype.slice.call(foundLinks);

    foundLinksArray.forEach((current) => {
      HelpersUrl.addLinkattributes(current);

    });

  },

  clickEventInternal: (event: MouseEvent | KeyboardEvent, element: HTMLElement) => {
    // all element hrefs will be an absolute url
    // all element data-link will be the form url
    event.preventDefault();
    ConstantsFunctions.changeInlineFiles(element.getAttribute('data-link') as string);
  },

  clickEventInstance: (event: MouseEvent | KeyboardEvent, instance: number) => {
    event.preventDefault();
    ConstantsFunctions.changeInstance(+instance as number, null, () => {
      //
    });
  },

  updateCurrent: (activeFactTable = false) => {


    // const badge = a.querySelector('.text-bg-light')
    // if (badge) {
    //   badge.classList.remove('text-bg-light');
    //   badge.classList.add('bg-sec');
    // }

    Constants.getInlineFiles.forEach((current) => {
      if (activeFactTable) {
        current.current = false;
      }
    });
    Links.update();

    const tabs = Array.from(document.getElementById('tabs-container')?.querySelectorAll('a.nav-link') as NodeListOf<Element>);
    tabs.forEach((element, index: number) => {
      if (activeFactTable) {
        if (index !== tabs.length - 1) {
          element.classList.remove('active');
          const badge = element.querySelector('.text-bg-light')
          if (badge) {
            badge.classList.remove('text-bg-light');
            badge.classList.add('bg-sec');
          }
        } else {
          // since we remove it, add it back (counterproductive, i know)
          element.classList.add('active');
          const badge = element.querySelector('.text-bg-light')
          if (badge) {
            badge.classList.remove('text-bg-light');
            badge.classList.add('bg-sec');
          }
        }
      }
    });
  },

};
