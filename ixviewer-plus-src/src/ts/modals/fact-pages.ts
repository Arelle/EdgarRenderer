/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

import { ConstantsFunctions } from "../constants/functions";

export const FactPages = {

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
      if (current["value"]) {
        const trElement = document.createElement("tr");


        const thElement = document.createElement("th");
        thElement.setAttribute("class", `${current["label"] === 'Fact' ? 'fact-collapse' : ''}`);

        const thContent = document.createTextNode(current["label"]);
        thElement.appendChild(thContent);

        const tdElement = document.createElement("td");

        const divElement = document.createElement("div");
        divElement.classList.add("word-break");
        if (current["html"]) {
          divElement.classList.add('fact-value-modal');
          //divElement.setAttribute('id', 'fact-value-modal');
          //divElement.classList.add("h-100");
          divElement.classList.add("posittion-relative");
          //divElement.classList.add("overflow-auto");
          const parser = new DOMParser();
          const htmlDoc = parser.parseFromString(current.value, 'text/html');
          divElement.append(htmlDoc.querySelector('body') as HTMLElement);
          tdElement.appendChild(divElement);
        } else {
          divElement.innerHTML = current["value"];
          tdElement.appendChild(divElement);
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
      for (const property in current) {

        const trElement = document.createElement("tr");

        const thElement = document.createElement("th");

        const aTag = document.createElement('a');
        aTag.setAttribute('href', current[property]);
        aTag.setAttribute('target', '_blank');
        aTag.setAttribute('rel', 'noopener noreferrer');

        if (property === 'URI') {
          const small = document.createElement('small');
          const smallContent = document.createTextNode(' (Will Leave SEC Website)');
          small.appendChild(smallContent);
          const thContent = document.createTextNode(`${property}`);
          thElement.appendChild(thContent);
          thElement.appendChild(small);
        } else {
          const thContent = document.createTextNode(property);
          thElement.appendChild(thContent);
        }

        const tdElement = document.createElement("td");

        const divElement = document.createElement("div");

        if (property === 'URI') {
          const aTag = document.createElement('a');
          aTag.setAttribute('href', current[property]);
          aTag.setAttribute('target', '_blank');
          aTag.setAttribute('rel', 'noopener noreferrer');

          const aContent = document.createTextNode(current[property]);
          aTag.appendChild(aContent);
          tdElement.appendChild(aTag);
        } else {
          const divContent = document.createTextNode(current[property]);
          divElement.appendChild(divContent);
          tdElement.appendChild(divElement);
        }
        trElement.appendChild(thElement);
        trElement.appendChild(tdElement);
        elementsToReturn.appendChild(trElement);
      }
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
