/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

import { ConstantsFunctions } from "../constants/functions";
import { xmlToDom } from "../helpers/utils";

// Build the pages for the fact modal
export const FactPages = {

  /**
   * Description
   * @param {any} factInfo
   * @param {any} idToFill:string
   * @returns {any} html table containing all fact "attributes"
   */
  firstPage: (factInfo, idToFill: string) => {
    const possibleLabels = [
      {
        label: "Tag",
        value: factInfo.name
      },
      {
        label: "Fact",
        value: factInfo.value,
        html: factInfo.isHTML
      },
      {
        // TODO
        label: "Fact Language",
        value: factInfo['xml:lang']
      },
      {
        label: "Period",
        value: factInfo.period
      },
      {

        label: "Axis",
        value: factInfo.segment ? factInfo.segment.map(element => element.axis).filter(Boolean).join('<br>') : null,
        //html: true
      },
      {
        label: "Member",
        value: factInfo.segment ? factInfo.segment.map(element => element.dimension).filter(Boolean).join('<br>') : null,
        //html: true
      },
      {
        label: "Typed Member",
        value: factInfo.segment ? factInfo.segment.map(element => element.value).filter(Boolean).join('<br>') : null
      },
      {
        label: "Explicit Member",
        value: factInfo.segment ? factInfo.segment.map(element => {
          return element.type === 'explicit' ? element.dimension : null
        }).filter(Boolean).join(' ') : null,
      },
      {
        label: "Measure",
        value: factInfo.measure
      },
      {
        label: "Scale",
        value: factInfo.scale
      },
      {
        label: "Decimals",
        value: factInfo.decimals
      },
      {
        label: "Balance",
        value: factInfo.balance
      },
      {
        label: "Sign",
        value: factInfo.sign
      },
      {
        label: "Type",
        value: factInfo.xbrltype
      },
      {
        label: "Format",
        value: factInfo.format
      },
      {
        label: "Footnote",
        value: factInfo.footnote
      }
    ];

    const elementsToReturn = document.createElement("tbody");

    possibleLabels.forEach((current) => {
      const debugXmlParsing = false;

      if (current["value"]) {
        const trElement = document.createElement("tr");
        const thElement = document.createElement("th");
        thElement.setAttribute("class", `${current["label"] === 'Fact' ? 'fact-collapse' : ''}`);

        const thContent = document.createTextNode(current["label"]);
        thElement.appendChild(thContent);

        const tdElement = document.createElement("td");
        const tdContentsDiv = document.createElement("div");
        tdContentsDiv.classList.add("word-break");

        const useExperimentalFootnoteRenderer = false;

        // footnotes
        if (useExperimentalFootnoteRenderer && current["label"] == "Footnote") { 
          const parser = new DOMParser();
          console.log('current.value', current.value)
          const xmlDoc = parser.parseFromString(current.value, 'application/xml');

          // Error: Namespace prefix xlink for label on footnote is not defined
          if (xmlDoc.nodeType === 9) { // document type
            for (let i = 0; i < xmlDoc.childNodes.length; i++) {
              const childNode = xmlToDom(xmlDoc.childNodes[i]);
              if (childNode) {
                tdContentsDiv.appendChild(childNode)
              }
            }
          }
          const xmlBody = xmlDoc.querySelector('body') as HTMLElement
          const xmlDom = xmlToDom(xmlDoc);
          if (DEBUGJS && debugXmlParsing) {
            console.log('xmlBody', xmlBody)
            console.log('xmlDom', xmlDom)
          }
          // divElement.append(xmlDom.querySelector('body') as HTMLElement);
          tdElement.appendChild(tdContentsDiv);
        }

        else if (current["html"]) {
          tdContentsDiv.classList.add('fact-value-modal');
          //divElement.setAttribute('id', 'fact-value-modal');
          //divElement.classList.add("h-100");
          tdContentsDiv.classList.add("posittion-relative");
          //divElement.classList.add("overflow-auto");
          const parser = new DOMParser();

          // Fact values may contain unsafe HTML, so we'll sanitize it before adding to the DOM
          // const htmlDoc = parser.parseFromString(current.value, 'text/html');
          const sanitizedHtml = ConstantsFunctions.sanitizeHtml(current.value);
          const htmlDoc = parser.parseFromString(sanitizedHtml, 'text/html');
          tdContentsDiv.append(htmlDoc.querySelector('body') as HTMLElement);
          tdElement.appendChild(tdContentsDiv);
        } else {
          //convert fact string to number to add in formatting
          if(current["label"] === "Fact"){
            const factStringToNumber = Number(current["value"]);
            if(!Number.isNaN(factStringToNumber)){
              current["value"] = factStringToNumber.toLocaleString("en-US", {"maximumFractionDigits": 10});
            } 
          }
          // HF: changed from this -> divElement.innerHTML = current["value"];
          tdContentsDiv.textContent = current["value"];
          tdElement.appendChild(tdContentsDiv);
        }

        trElement.appendChild(thElement);
        trElement.appendChild(tdElement);
        elementsToReturn.append(trElement);
      }
    });

    FactPages.fillCarousel(idToFill, elementsToReturn.firstElementChild ? elementsToReturn : FactPages.noDataCarousel());
  },

  secondPage: (factInfo, idToFill: string) => {
    const elementsToReturn = document.createElement("tbody");
    factInfo.labels.forEach((current) => {
      for (const property in current) {
        const trElement = document.createElement("tr");
        const thElement = document.createElement("th");
        const thContent = document.createTextNode(property);
        thElement.appendChild(thContent);

        const tdElement = document.createElement("td");
        const divElement = document.createElement("div");
        const divContent = document.createTextNode(current[property]);
        divElement.appendChild(divContent);
        tdElement.appendChild(divElement);

        trElement.appendChild(thElement);
        trElement.appendChild(tdElement);
        elementsToReturn.appendChild(trElement);
      }
    });
    FactPages.fillCarousel(idToFill, elementsToReturn.firstElementChild ? elementsToReturn : FactPages.noDataCarousel());
  },

  thirdPage: (factInfo, idToFill: string) => {

    const elementsToReturn = document.createElement("tbody");
    factInfo.references.forEach((current, index, array) => {
      current.forEach((nestedCurrent) => {
        for (const [key, val] of Object.entries(nestedCurrent)) {
          const trElement = document.createElement("tr");

          const thElement = document.createElement("th");

          const aTag = document.createElement('a');
          aTag.setAttribute('href', val);
          aTag.setAttribute('target', '_blank');
          aTag.setAttribute('rel', 'noopener noreferrer');

          if (val === 'URI') {
            const small = document.createElement('small');
            const smallContent = document.createTextNode(' (Will Leave SEC Website)');
            small.appendChild(smallContent);
            const thContent = document.createTextNode(`${key}`);
            thElement.appendChild(thContent);
            thElement.appendChild(small);
          } else {
            const thContent = document.createTextNode(key);
            thElement.appendChild(thContent);
          }

          const tdElement = document.createElement("td");

          const divElement = document.createElement("div");

          if (val === 'URI') {
            const aTag = document.createElement('a');
            aTag.setAttribute('href', val);
            aTag.setAttribute('target', '_blank');
            aTag.setAttribute('rel', 'noopener noreferrer');

            const aContent = document.createTextNode(val);
            aTag.appendChild(aContent);
            tdElement.appendChild(aTag);
          } else {
            const divContent = document.createTextNode(val);
            divElement.appendChild(divContent);
            tdElement.appendChild(divElement);
          }
          trElement.appendChild(thElement);
          trElement.appendChild(tdElement);
          elementsToReturn.appendChild(trElement);
        }
      });
      if (index !== array.length) {
        const trEmptyElement = document.createElement("tr");
        const tdEmptyElement = document.createElement("td");
        tdEmptyElement.setAttribute("class", "blank-table-row");
        tdEmptyElement.setAttribute("colspan", "3");
        trEmptyElement.appendChild(tdEmptyElement);
        elementsToReturn.appendChild(trEmptyElement);
      }

    });
    FactPages.fillCarousel(idToFill, elementsToReturn.firstElementChild ? elementsToReturn : FactPages.noDataCarousel());
  },

  fourthPage: (factInfo, idToFill: string) => {

    const calculations = [...factInfo.calculations];

    calculations.unshift([
      {
        label: 'Balance',
        value: factInfo.balance ? factInfo.balance : 'N/A',
      }
    ])

    const elementsToReturn = document.createElement("tbody");

    calculations.forEach((current, index, array) => {
      current.forEach((nestedCurrent) => {

        const trElement = document.createElement("tr");

        const thElement = document.createElement("th");
        const thContent = document.createTextNode(nestedCurrent.label);
        thElement.appendChild(thContent);

        const tdElement = document.createElement("td");

        const divElement = document.createElement("div");

        const divContent = document.createTextNode(nestedCurrent.value);
        divElement.appendChild(divContent);
        tdElement.appendChild(divElement);

        trElement.appendChild(thElement);
        trElement.appendChild(tdElement);
        elementsToReturn.appendChild(trElement);
      });
      if (index !== array.length) {
        const trEmptyElement = document.createElement("tr");
        const tdEmptyElement = document.createElement("td");
        tdEmptyElement.setAttribute("class", "blank-table-row");
        tdEmptyElement.setAttribute("colspan", "3");
        trEmptyElement.appendChild(tdEmptyElement);
        elementsToReturn.appendChild(trEmptyElement);
      }
    });
    FactPages.fillCarousel(idToFill, elementsToReturn.firstElementChild ? elementsToReturn : FactPages.noDataCarousel());
  },

  noDataCarousel: () => {
    const trElement = document.createElement("tr");

    const tdElement = document.createElement("td");

    const tdContent = document.createTextNode("No Data.");
    tdElement.appendChild(tdContent);

    trElement.appendChild(tdElement);

    return trElement;
  },

  fillCarousel: (idToFill: string, generatedHTML: HTMLElement) => {
    ConstantsFunctions.emptyHTMLByID(idToFill);

    document
      .getElementById(idToFill)?.appendChild(generatedHTML);
  }
};
