/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

import { Constants } from "../constants/constants";
import DOMPurify from "dompurify";

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
        for (let i=0; i<xmlNode.attributes.length; i++) {
            const attr = xmlNode.attributes[i];
            element.setAttributeNS(attr.namespaceURI, attr.nodeName, attr.nodeValue);
        }
        
        // recursively process child nodes
        for (let i=0; i<xmlNode.childNodes.length; i++) {
            const childNode = xmlToDom(xmlNode.childNodes[i]);
            if (childNode) {
                element.appendChild(childNode);
            }
        }

        return element;
    } else if (xmlNode.nodeType === 3) { // Text node
        return document.createTextNode(xmlNode.nodeValue);
    }
    return null;
}

// WIP
export const findAllTagTypeInMarkupString = (markup: string, openTag: string, closeTag: string) => {
    const allTags:string[] = [];

    const startTagRegex = RegExp(openTag, 'gi') 
    let startTagResults = '';
    const footnoteStartIndices:number[] = [];
    while ( (startTagResults = startTagRegex.exec(markup)) ) {
        footnoteStartIndices.push(startTagResults.index);
    }

    const endTagRegex = RegExp(closeTag, 'gi') 
    let endTagResults = '';
    const footnoteEndIndices:number[] = [];
    while ( (endTagResults = endTagRegex.exec(markup)) ) {
        footnoteEndIndices.push(endTagResults.index + closeTag.length);
    }

    footnoteStartIndices.forEach((start, indexInArrayOfStarts) => {
        const pluckedFootnote = markup.substring(start, footnoteEndIndices[indexInArrayOfStarts]);
        allTags.push(pluckedFootnote);
    })
    return allTags;
}

// todo: turn this into a general ixScrollTo() function
export const elemWithinOneVHofBtm = (
    target: HTMLElement,
    parentElem?: HTMLElement, // not the scrollable parent. Probably the first descendent thereof.  Needs to be full-height, nonscrollable.
    scrollableParent?: HTMLElement,
) => {
    if (!parentElem) {
        const currentInstance = Constants.getInstanceFiles.find(element => element.current);
        const currentXHTML = currentInstance?.xhtmls.find(element => element.current);
        if (currentXHTML?.slug) {
            parentElem = document.querySelector<HTMLElement>(`section[filing-url="${currentXHTML?.slug}"]`);
        }
    }
    if (!scrollableParent) {
        const currentInstance = Constants.getInstanceFiles.find(element => element.current);
        const currentXHTML = currentInstance?.xhtmls.find(element => element.current);
        if (currentXHTML?.slug) {
            scrollableParent = document.getElementById('dynamic-xbrl-form') as HTMLElement;
        }
    }

    const viewHieght = scrollableParent?.offsetHeight || 0;
    const parentHt = (parentElem as HTMLElement)?.offsetHeight || 0;

    let distTopOfTargetToTopOfScrollableParent = 0;
    let currentElement = target;

    while (currentElement && currentElement !== parentElem) {
        distTopOfTargetToTopOfScrollableParent += currentElement.offsetTop;
        currentElement = currentElement.offsetParent;
    }

    if (scrollableParent == document.getElementById('dynamic-xbrl-form')) {
        distTopOfTargetToTopOfScrollableParent -= Constants.getNavBarsHeight();
    }

    if (distTopOfTargetToTopOfScrollableParent > parentHt - viewHieght) {
        return true;
    } else {
        return false;
    }
}

