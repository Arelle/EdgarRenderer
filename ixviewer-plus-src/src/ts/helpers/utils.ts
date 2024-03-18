/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

export const cleanSubstring = (orig: string, from: string, to: string) => {
    return orig.substring(orig.search(from), orig.search(to) + to.length);
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