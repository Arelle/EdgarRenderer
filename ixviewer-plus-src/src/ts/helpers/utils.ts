/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

import DOMPurify from "dompurify";
import { Constants } from "../constants/constants";
import { toBottomOfInlineDoc } from "../pagination/inlineDocPagination";

export const cleanSubstring = (orig: string, from: string, to: string) => {
    return orig.substring(orig.search(from), orig.search(to) + to.length);
}

export const convertToSelector = (input: string, sanitize=true) => {
    const normalizedSelector = input.replaceAll('/', '-')
        .replaceAll(' ', '-')
        .replaceAll('#', '-')
        .replaceAll('.', '-')
    if (sanitize)
        return DOMPurify.sanitize(normalizedSelector);
    else {
        return normalizedSelector;
    }
}

// WIP
export const xmlToDom = (xmlNode: Node): Node | null => {
    
    if (!PRODUCTION) {
        console.log('node.nodeType', xmlNode.nodeType)
        console.log('node', xmlNode)
    }
    if (xmlNode.nodeType === 1) { // Element node
        const element = document.createElement(xmlNode.nodeName)

        // add attributes
        if(xmlNode instanceof Element)
        {
            for(let attr of xmlNode.attributes)
            {
                element.setAttributeNS(attr.namespaceURI, attr.nodeName, attr.nodeValue || "");
            }
        }
        
        // recursively process child nodes
        for(let child of xmlNode.childNodes)
        {
            const childNode = xmlToDom(child);
            if (childNode) {
                element.appendChild(childNode);
            }
        }

        return element;
    } else if (xmlNode.nodeType === 3) { // Text node
        return document.createTextNode(xmlNode.nodeValue || "");
    }
    return null;
}

// WIP
export const findAllTagTypeInMarkupString = (markup: string, openTag: string, closeTag: string) => {
    const allTags: string[] = [];

    const startTagRegex = RegExp(openTag, 'gi') 
    let startTagResults = startTagRegex.exec(markup);
    const footnoteStartIndices: number[] = [];
    while(startTagResults) {
        footnoteStartIndices.push(startTagResults.index);
        startTagResults = startTagRegex.exec(markup);
    }

    const endTagRegex = RegExp(closeTag, 'gi');
    let endTagResults = endTagRegex.exec(markup);
    const footnoteEndIndices: number[] = [];
    while(endTagResults) {
        footnoteEndIndices.push(endTagResults.index + closeTag.length);
        endTagResults = endTagRegex.exec(markup);
    }

    footnoteStartIndices.forEach((start, indexInArrayOfStarts) => {
        const pluckedFootnote = markup.substring(start, footnoteEndIndices[indexInArrayOfStarts]);
        allTags.push(pluckedFootnote);
    });

    return allTags;
}


export function ixScrollTo(sectionElem: HTMLElement): void
{
    if(elemNearBottom(sectionElem))
    {
        toBottomOfInlineDoc();
    }
    else
    {
        sectionElem?.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
    }
}

/**
 * Determine if the provided element is within 1vh of the bottom of the screen.
 * @param target The Element to which we should scroll.
 * @param parentElem Not the scrollable parent. Probably the first descendent thereof.  Needs to be full-height, non-scrollable.
 * @param scrollableParent An ancestor of `target` that scrolls.
 * @returns boolean
 */
function elemNearBottom(target: HTMLElement, parentElem?: HTMLElement, scrollableParent?: HTMLElement): boolean {
    if (!parentElem) {
        const currentInstance = Constants.getInstanceFiles.find(element => element.current);
        const currentXHTML = currentInstance?.xhtmls.find(element => element.current);
        if (currentXHTML?.slug) {
            parentElem = document.querySelector<HTMLElement>(`section[filing-url="${currentXHTML?.slug}"]`) || undefined;
        }
    }
    if (!scrollableParent) {
        const currentInstance = Constants.getInstanceFiles.find(element => element.current);
        const currentXHTML = currentInstance?.xhtmls.find(element => element.current);
        if (currentXHTML?.slug) {
            scrollableParent = document.getElementById('dynamic-xbrl-form') || undefined;
        }
    }

    const viewHeight = scrollableParent?.offsetHeight || 0;
    const parentHt = parentElem?.offsetHeight || 0;

    let distTopOfTargetToTopOfScrollableParent = 0;
    let currentElement = target;

    while (currentElement && currentElement !== parentElem) {
        distTopOfTargetToTopOfScrollableParent += currentElement.offsetTop || 0;
        currentElement = currentElement.offsetParent as HTMLElement;
    }

    if (scrollableParent == document.getElementById('dynamic-xbrl-form')) {
        distTopOfTargetToTopOfScrollableParent -= Constants.getNavBarsHeight();
    }

    return distTopOfTargetToTopOfScrollableParent > parentHt - viewHeight;
}
