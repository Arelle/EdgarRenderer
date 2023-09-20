/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

export const Scroll = {

  allTextBlocks: [],

  toTop: () => {
    const formElement = document.getElementById('dynamic-xbrl-form');
    (formElement as HTMLElement).scrollTop = 0;
    Scroll.removeAnchorTag();
  },

  toBottom: () => {
    const formElement = document.getElementById('dynamic-xbrl-form');
    (formElement as HTMLElement).scrollTop = (formElement as HTMLElement).scrollHeight as number;
    Scroll.removeAnchorTag();
  },

  toPrev: () => {
    const formElement = document.getElementById('dynamic-xbrl-form');
    const scrollSpots = Array.from(formElement?.querySelectorAll(`[style*="page-break-after"],[style*="break-before"]`) as NodeList).reverse().map((current) => {
      if (((formElement?.scrollTop as number) > (current as HTMLElement).offsetTop)) {
        return current;
      }
    }).filter(Boolean);
    if (scrollSpots[0]) {
      (scrollSpots[0] as HTMLElement).scrollIntoView();
    } else {
      Scroll.toTop();
    }
  },

  toNext: () => {
    const formElement = document.getElementById('dynamic-xbrl-form');
    const scrollSpots = Array.from(formElement?.querySelectorAll(`[style*="page-break-after"],[style*="break-before"]`) as NodeList).map((current) => {
      if (((formElement?.scrollTop as number) < (current as HTMLElement).offsetTop)) {
        return current;
      }
    }).filter(Boolean);

    if (scrollSpots[0]) {
      (scrollSpots[0] as HTMLElement).scrollIntoView();
    } else {
      Scroll.toBottom();
    }
  },

  removeAnchorTag: () => {
    location.hash = '';
  }
};
