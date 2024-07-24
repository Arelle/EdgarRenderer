import { Scroll } from "../scroll/scroll";
import { Constants } from "../constants/constants";

const toPrev = () => {
    const currentInstance = Constants.getInstanceFiles.find(element => element.current);
    const currentXHTML = currentInstance?.xhtmls.find(element => element.current);

    // e.g section[filing-url="ea185980-6k_inspiratech.htm"]
    const inlineDocElem = document.querySelector(`section[filing-url="${currentXHTML?.slug}"]`);
    const currentScrollPosition = document.getElementById('dynamic-xbrl-form')?.scrollTop as number;
    // if (!PRODUCTION) console.log('prev 1st currentScrollPosition', currentScrollPosition)
    // [style*="page-break-after"],[style*="break-before"] may need to be handled differently...
    const pageBreakNodes = Array.from(inlineDocElem?.querySelectorAll(`[style*="page-break-after"],[style*="break-before"]`) as NodeList)

    const prevBreak = pageBreakNodes
        .reverse()
        .map((breakElem) => {
            if ((currentScrollPosition - 40 > (breakElem as HTMLElement).offsetTop)) {
                return breakElem;
            }
        }).filter(Boolean)[0];

    if (prevBreak) {
        const prevPage = (prevBreak as HTMLElement);
        // if (!PRODUCTION) console.log('prevPage.offsetTop', prevPage.offsetTop);
        (prevPage).scrollIntoView();
        // if (!PRODUCTION) {
        //     window.setTimeout(() => {
        //         console.log('prev 2md currentScrollPosition', document.getElementById('dynamic-xbrl-form')?.scrollTop)
        //     }, 700)
        // }
    } else {
        toTop();
    }
};

const toNext = () => {
    const currentInstance = Constants.getInstanceFiles.find(element => element.current);
    const currentXHTML = currentInstance?.xhtmls.find(element => element.current);

    const inlineDocElem = document.querySelector(`section[filing-url="${currentXHTML?.slug}"]`);
    const viewHieght = (document.getElementById('dynamic-xbrl-form') as HTMLElement).offsetHeight;
    const currentScrollPosition = document.getElementById('dynamic-xbrl-form')?.scrollTop as number;
    const pageBreakNodes = inlineDocElem?.querySelectorAll(`[style*="page-break-after"],[style*="break-before"]`) as NodeList;
    // if (!PRODUCTION) console.log('next 1st currentScrollPosition', currentScrollPosition);

    const nextBreak = Array.from(pageBreakNodes)
        .map((breakElem) => {
            if (breakElem) {
                // if (!PRODUCTION && breakIndex < 2) console.log(`${(breakElem as HTMLElement).offsetTop} > ${currentScrollPosition}`)
                if ((breakElem as HTMLElement).offsetTop - 5 > currentScrollPosition) {
                    // if (!PRODUCTION) console.log('(breakElem as HTMLElement).offsetTop', (breakElem as HTMLElement).offsetTop)
                    return breakElem;
                }
            }
        }).filter(Boolean)[0];
        // console.log('next nextBreak', nextBreak)

    if (nextBreak) {
        const next = nextBreak as HTMLElement;
        const elemCloseToBtmOfPage = (inlineDocElem as HTMLElement).offsetHeight - viewHieght < next.offsetTop;
        if (elemCloseToBtmOfPage) {
            // if (!PRODUCTION) console.log('close to btm')
            // without this scrollable element (inline form) will shift up if we scroll to top of elem that is too close to bottom of page
            toBottomOfInlineDoc();
        } else {
            next.scrollIntoView(); // top of elem to top of view
            // window.setTimeout(() => {
            //     if (!PRODUCTION) console.log('next 2nd currentScrollPosition', document.getElementById('dynamic-xbrl-form')?.scrollTop);
            // }, 500)
        }
    } else {
        toBottomOfInlineDoc();
    }
}

const toTop = () => {
    const formElement = document.getElementById('dynamic-xbrl-form');
    (formElement as HTMLElement).scrollTop = 0;
    Scroll.removeAnchorTag();
}

export const toBottomOfInlineDoc = () => {
    const formElement = document.getElementById('dynamic-xbrl-form');
    // (formElement as HTMLElement).scrollTop = (formElement as HTMLElement).scrollHeight as number;
    (formElement as HTMLElement).scrollTo({top: (formElement as HTMLElement).scrollHeight, behavior: 'smooth'});
    Scroll.removeAnchorTag();
}

export const buildInlineDocPagination = () => {
    const paginationHtmlString = `<nav class="doc-pagination">
        <ul id="html-pagination" class="pagination pagination-sm mb-0">
            <li class="page-item">
                <a class="page-link text-body" href="#" tabindex="13" id="to-top-btn">
                    <i class="fas fa-lg fa-angle-double-left"></i>
                </a>
            </li>
            <li class="page-item">
                <a class="page-link text-body" href="#" tabindex="13" id="to-prev-btn">
                    <i class="fas fa-lg fa-angle-left"></i>
                </a>
            </li>
            <li class="page-item ">
                <a class="page-link text-body" href="#" tabindex="13" id="to-next-btn">
                    <i class="fas fa-lg fa-angle-right"></i>
                </a>
            </li>
            <li class="page-item ">
                <a class="page-link text-body" href="#" tabindex="13" id="to-bottom-btn">
                    <i class="fas fa-lg fa-angle-double-right"></i>
                </a>
            </li>
        </ul>
    </nav>`;
    const paginationParser = new DOMParser();
    const paginationElemDoc = paginationParser.parseFromString(paginationHtmlString, 'text/html')
    const paginationContents = paginationElemDoc.querySelector('nav') as HTMLElement

    return paginationContents;
}

export const addPaginationListeners = () => {
    document.getElementById('to-top-btn')?.addEventListener("click", () => {
        toTop();
    });
    document.getElementById('to-top-btn')?.addEventListener("keyup", () => {
        toTop();
    });

    document.getElementById('to-prev-btn')?.addEventListener("click", () => {
        toPrev();
    });
    document.getElementById('to-prev-btn')?.addEventListener("keyup", () => {
        toPrev();
    });

    document.getElementById('to-next-btn')?.addEventListener("click", () => {
        toNext();
    });
    document.getElementById('to-next-btn')?.addEventListener("keyup", () => {
        toNext();
    });

    document.getElementById('to-bottom-btn')?.addEventListener("click", () => {
        toBottomOfInlineDoc();
    });
    document.getElementById('to-bottom-btn')?.addEventListener("keyup", () => {
        toBottomOfInlineDoc();
    });
}
