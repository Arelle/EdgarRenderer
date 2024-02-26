import * as bootstrap from "bootstrap";
import { FactMap } from "../facts/map";
import { ConstantsFunctions } from "../constants/functions";
import { Constants } from "../constants/constants";

/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */
export const FactsTable = {

    currentPage: 0,

    maxPage: 100,

    size: 10,

    tableColumns: [
        { key: 'actions', value: 'Actions' },
        { key: 'info', value: 'Info' },
        { key: 'name', value: 'Tag' },
        { key: 'period', value: 'Period' },
        { key: 'xbrltype', value: 'Type' },
        { key: 'format', value: 'Format' }
    ],

    facts: [],

    listeners: () => {

        document.getElementById('fact-table-pagination-size')?.addEventListener('change', (event: HTMLSelectElement) => {
            FactsTable.currentPage = 0;
            FactsTable.size = parseInt(event?.target.value);
            ConstantsFunctions.emptyHTMLByID('fact-table');
            FactsTable.init();
        });

        document.getElementById('fact-table-pagination-first')?.addEventListener('click', () => {
            FactsTable.currentPage = 0;
            ConstantsFunctions.emptyHTMLByID('fact-table');
            FactsTable.init();
        });
        document.getElementById('fact-table-pagination-first')?.addEventListener('keyup', () => {
            FactsTable.currentPage = 0;
            ConstantsFunctions.emptyHTMLByID('fact-table');
            FactsTable.init();
        });

        document.getElementById('fact-table-pagination-prev')?.addEventListener('click', () => {
            FactsTable.currentPage--;
            ConstantsFunctions.emptyHTMLByID('fact-table');
            FactsTable.init();
        });
        document.getElementById('fact-table-pagination-prev')?.addEventListener('keyup', () => {
            FactsTable.currentPage--;
            ConstantsFunctions.emptyHTMLByID('fact-table');
            FactsTable.init();
        });

        document.getElementById('fact-table-pagination-next')?.addEventListener('click', () => {
            FactsTable.currentPage++;
            ConstantsFunctions.emptyHTMLByID('fact-table');
            FactsTable.init();
        });
        document.getElementById('fact-table-pagination-next')?.addEventListener('keyup', () => {
            FactsTable.currentPage++;
            ConstantsFunctions.emptyHTMLByID('fact-table');
            FactsTable.init();
        });

        document.getElementById('fact-table-pagination-last')?.addEventListener('click', () => {
            FactsTable.currentPage = FactsTable.maxPage - 1;
            ConstantsFunctions.emptyHTMLByID('fact-table');
            FactsTable.init();
        });
        document.getElementById('fact-table-pagination-last')?.addEventListener('keyup', () => {
            FactsTable.currentPage = FactsTable.maxPage - 1;
            ConstantsFunctions.emptyHTMLByID('fact-table');
            FactsTable.init();
        });
    },

    updatePagination: () => {
        FactsTable.updatePageInfo();

        if (FactsTable.currentPage === 0) {
            document.getElementById('fact-table-pagination-first')?.classList.add('disabled');
            document.getElementById('fact-table-pagination-prev')?.classList.add('disabled');
        } else {
            document.getElementById('fact-table-pagination-first')?.classList.remove('disabled');
            document.getElementById('fact-table-pagination-prev')?.classList.remove('disabled');
        }
        if (FactsTable.currentPage === FactsTable.maxPage - 1) {
            document.getElementById('fact-table-pagination-next')?.classList.add('disabled');
            document.getElementById('fact-table-pagination-last')?.classList.add('disabled');
        } else {
            document.getElementById('fact-table-pagination-next')?.classList.remove('disabled');
            document.getElementById('fact-table-pagination-last')?.classList.remove('disabled');
        }
    },

    updatePageInfo: () => {
        const span = document.createElement('span');
        const text = document.createTextNode(`Page ${FactsTable.currentPage + 1} of ${FactsTable.maxPage}`);
        span.append(text);
        document.getElementById('fact-table-pagination-info')?.firstElementChild?.replaceWith(span);
    },

    toggle: (show: boolean) => {
        if (show) {
            FactsTable.listeners();
            FactsTable.init();

        } else {
            ConstantsFunctions.emptyHTMLByID('fact-table');
            const tabs = Array.from(document.getElementById('tabs-container')?.querySelectorAll('a.nav-link.active') as NodeList);
            if (tabs.length === 0) {
                // send user to the first XHTML file
                Constants.getInlineFiles[0].current = true;
            }
        }
    },

    init: () => {
        FactsTable.facts = FactMap.getFullFacts();

        FactsTable.maxPage = Math.ceil(FactsTable.facts.length / FactsTable.size);
        FactsTable.updatePagination();
        const table = document.getElementById('fact-table');
        const thead = FactsTable.createThead();
        const tbody = FactsTable.createTbody();

        table?.append(thead);
        table?.append(tbody);

        const popoverTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="popover"]'));
        popoverTriggerList.map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));

    },

    update: () => {
        if (document.getElementById('fact-table-container')?.classList.contains('show')) {
            ConstantsFunctions.emptyHTMLByID('fact-table');
            FactsTable.currentPage = 0;
            FactsTable.init();
        }
    },

    createThead: () => {
        const thead = document.createElement('thead');
        const tr = document.createElement('tr');
        FactsTable.tableColumns.forEach((current) => {
            const th = document.createElement('th');
            const thText = document.createTextNode(current.value);
            th.append(thText);
            tr.append(th);
            thead.append(tr);
        });
        return thead;
    },

    createTbody: () => {
        const pageStart = FactsTable.currentPage * FactsTable.size;
        const pageEnd = pageStart + FactsTable.size;
        const facts = FactsTable.facts.slice(pageStart, pageEnd);
        const tbody = document.createElement('tbody');
        facts.forEach((currentValue, currentIndex) => {
            const tr = document.createElement('tr');
            currentIndex % 2 === 0 ? tr.classList.add('table-light') : null;
            FactsTable.tableColumns.forEach((current) => {
                if (current.key === 'actions') {
                    const actions = FactsTable.createActions(currentIndex);
                    const td = document.createElement('td');
                    td.classList.add('text-break');
                    td.append(actions);
                    tr.append(td);
                } else if (current.key === 'info') {
                    const badges = FactsTable.createBadges(FactMap.getByID(currentValue.id));
                    const td = document.createElement('td');
                    td.classList.add('text-break');
                    td.append(badges);
                    tr.append(td);
                } else if (current.key === 'name') {
                    const td = document.createElement('td');
                    td.classList.add('text-break');
                    const name = FactMap.getByID(currentValue.id)[current.key].split(':');
                    const tdText = document.createTextNode(`(${name[0]}) ${name[1]
                        .replace(/([a-z])([A-Z])/g, '$1 $2')
                        .replace(/\b([A-Z]+)([A-Z])([a-z])/, '$1 $2$3')
                        .replace(/^./, (str: string) => { return str.toUpperCase() })}`)
                    td.append(tdText);
                    tr.append(td);
                } else if (current.key === 'xbrltype') {
                    const td = document.createElement('td');
                    td.classList.add('text-break');
                    //const name = FactMap.getByID(currentValue.id)[current.key].split(':');
                    const tdText = document.createTextNode(`${FactMap.getByID(currentValue.id)[current.key]
                        .replace(/([a-z])([A-Z])/g, '$1 $2')
                        .replace(/\b([A-Z]+)([A-Z])([a-z])/, '$1 $2$3')
                        .replace(/^./, (str: string) => { return str.toUpperCase() })}`)
                    //const tdText = document.createTextNode(FactMap.getByID(currentValue.id)[current.key]);
                    td.append(tdText);
                    tr.append(td);
                } else {
                    const td = document.createElement('td');
                    td.classList.add('text-break');
                    //const name = FactMap.getByID(currentValue.id)[current.key].split(':');
                    const tdText = document.createTextNode(`${FactMap.getByID(currentValue.id)[current.key] ? FactMap.getByID(currentValue.id)[current.key] : ''}`)
                    //const tdText = document.createTextNode(FactMap.getByID(currentValue.id)[current.key]);
                    td.append(tdText);
                    tr.append(td);
                }
            });
            const hiddenTR = FactsTable.createHiddenTR(currentValue, currentIndex);
            tbody.append(tr);
            tbody.append(hiddenTR);
        });
        return tbody;
    },

    createHiddenTR: (value, index) => {
        const hiddenTR = document.createElement('tr');
        hiddenTR.classList.add('d-none');
        hiddenTR.setAttribute('hidden-fact-row', index.toString());
        const hiddenTD = document.createElement('td');
        hiddenTD.setAttribute('colspan', FactsTable.tableColumns.length);

        const valueCard = FactsTable.createValueCard(value.id);
        hiddenTD.append(valueCard);

        const additionalCard = FactsTable.createAdditionalCard(value.id);
        hiddenTD.append(additionalCard);

        const div = document.createElement('div');
        div.classList.add('d-flex');

        const labelCard = FactsTable.createLabelCard(value.id);
        div.append(labelCard);

        const referenceCard = FactsTable.createReferenceCard(value.id);
        div.append(referenceCard);

        hiddenTD.append(div);
        hiddenTR.append(hiddenTD);
        return hiddenTR;
    },

    createValueCard: (id) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.classList.add('w-100');
        card.classList.add('m-1');
        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body');
        const h5 = document.createElement('h5');
        h5.classList.add('card-title');
        h5.classList.add('border-bottom');
        const h5Text = document.createTextNode('Fact Value');
        h5.append(h5Text);
        cardBody.append(h5);
        if (FactMap.getByID(id).isHTML) {
            // Fact values may contain unsafe HTML, so we'll sanitize it before adding to the DOM
            const sanitizedHtml = ConstantsFunctions.sanitizeHtml(FactMap.getByID(id).value);
            const parser = new DOMParser();
            // const htmlDoc = parser.parseFromString(FactMap.getByID(id).value, 'text/html');
            const htmlDoc = parser.parseFromString(sanitizedHtml, 'text/html');
            const htmlContainer = htmlDoc.querySelector('body *') as HTMLElement;
            htmlContainer.classList.add('card-text');
            cardBody.append(htmlContainer);
            card.append(cardBody);
        } else {
            const p = document.createElement('p');
            p.classList.add('card-text');
            p.classList.add('text-center');
            const pValue = document.createTextNode(FactMap.getByID(id).value);
            p.append(pValue);
            cardBody.append(p);
            if (FactMap.getByID(id).format) {
                const p = document.createElement('p');
                p.classList.add('card-text');
                p.classList.add('text-center');
                const pValue = document.createTextNode(`RAW: ${FactMap.getByID(id).raw}`);
                p.append(pValue);
                cardBody.append(p);
                cardBody.append(p);
            }
            card.append(cardBody);
        }
        return card;
    },

    createAdditionalCard: (id) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.classList.add('w-100');
        card.classList.add('m-1');
        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body');
        const h5 = document.createElement('h5');
        h5.classList.add('card-title');
        h5.classList.add('border-bottom');
        const h5Text = document.createTextNode('Additional Information');
        h5.append(h5Text);
        cardBody.append(h5);
        const table = document.createElement('table');
        table.classList.add('table');
        const tbody = document.createElement("tbody");
        const possibleLabels = [
            // decimals
            // file
            // footnote
            // measure
            // localname
            // nsuri
            // presentation
            // scale
            // segment
            // sign 
            { key: 'decimals', value: 'Decimals' },
            { key: 'file', value: 'File' },
            { key: 'footnote', value: 'Footnote' },
            { key: 'measure', value: 'Measure' },
            { key: 'localname', value: 'LocalName' },
        ];
        const additional = FactMap.getByID(id);
        possibleLabels.forEach((current) => {
            if (additional[current.key]) {
                const trElement = document.createElement("tr");

                const thElement = document.createElement("th");

                const thContent = document.createTextNode(current.value);
                thElement.appendChild(thContent);

                const tdElement = document.createElement("td");

                const divElement = document.createElement("div");

                const divContent = document.createTextNode(additional[current.key]);
                divElement.appendChild(divContent);
                tdElement.appendChild(divElement);

                trElement.appendChild(thElement);
                trElement.appendChild(tdElement);
                tbody.appendChild(trElement);
            }
        })
        table.append(tbody);
        cardBody.append(table);
        card.append(cardBody);
        // decimals
        // file
        // footnote
        // measure
        // localname
        // nsuri
        // presentation
        // scale
        // segment
        // sign 
        // if (FactMap.getByID(id).isHTML) {
        //     // Fact values may contain unsafe HTML, so we'll sanitize it before adding to the DOM
        //     const sanitizedHtml = ConstantsFunctions.sanitizeHtml(FactMap.getByID(id).value);
        //     const parser = new DOMParser();
        //     const htmlDoc = parser.parseFromString(sanitizedHtml, 'text/html');
        //     const htmlContainer = htmlDoc.querySelector('body *') as HTMLElement;
        //     htmlContainer.classList.add('card-text');
        //     h5.append(h5Text);
        //     cardBody.append(h5);
        //     cardBody.append(htmlContainer);
        //     card.append(cardBody);
        // } else {
        //     const p = document.createElement('p');
        //     p.classList.add('card-text');
        //     p.classList.add('text-center');
        //     const pValue = document.createTextNode(FactMap.getByID(id).value);
        //     p.append(pValue);
        //     h5.append(h5Text);
        //     cardBody.append(h5);
        //     cardBody.append(p);
        //     card.append(cardBody);
        // }
        return card;
    },

    createLabelCard: (id) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.classList.add('w-50');
        card.classList.add('m-1');
        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body');
        const h5 = document.createElement('h5');
        h5.classList.add('card-title');
        h5.classList.add('border-bottom');
        const h5Text = document.createTextNode('Labels');
        const table = document.createElement('table');
        table.classList.add('table');
        const elementsToReturn = document.createElement("tbody");
        FactMap.getByID(id).labels.forEach((current) => {
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
        table.append(elementsToReturn);
        h5.append(h5Text);
        cardBody.append(h5);
        cardBody.append(table);
        card.append(cardBody);
        return card;
    },

    createReferenceCard: (id) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.classList.add('w-50');
        card.classList.add('m-1');
        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body');
        const h5 = document.createElement('h5');
        h5.classList.add('card-title');
        h5.classList.add('border-bottom');
        const h5Text = document.createTextNode('References');
        const table = document.createElement('table');
        table.classList.add('table');
        const elementsToReturn = document.createElement("tbody");
        // console.log(FactMap.getByID(id).references);
        FactMap.getByID(id).references.forEach((current) => {
            for (const property in current) {

                const trElement = document.createElement("tr");

                const thElement = document.createElement("th");

                const thContent = document.createTextNode(Object.keys(current[property])[0]);
                thElement.appendChild(thContent);

                const tdElement = document.createElement("td");

                const divElement = document.createElement("div");

                const divContent = document.createTextNode(Object.values(current[property])[0]);
                divElement.appendChild(divContent);
                tdElement.appendChild(divElement);

                trElement.appendChild(thElement);
                trElement.appendChild(tdElement);
                elementsToReturn.appendChild(trElement);
            }
        });
        table.append(elementsToReturn);
        h5.append(h5Text);
        cardBody.append(h5);
        cardBody.append(table);
        card.append(cardBody);
        return card;
    },

    createActions: (index: number) => {
        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.classList.add('btn');
        button.classList.add('btn-primary');
        button.classList.add('btn-sm');
        const text = document.createTextNode('Show');
        button.append(text);
        button.addEventListener('click', () => {
            const hiddenFactRow = document.querySelector(`[hidden-fact-row= "${index}"]`);
            hiddenFactRow?.classList.contains('d-none') ? hiddenFactRow?.classList.remove('d-none') : hiddenFactRow?.classList.add('d-none');
            button.textContent = hiddenFactRow?.classList.contains('d-none') ? `Show` : `Hide`;
        });
        return button;
    },

    createBadges: (fact) => {
        const badgeOptions = [
            {
                key: 'isAdditional',
                content: 'This fact is hidden, and considered an Additional Fact',
                value: 'A'
            },
            {
                key: 'isCustom',
                content: 'This fact name is outside the realm of DEI, US-GAAP, etc.',
                value: 'C'
            },
            {
                key: 'isAmountsOnly',
                content: 'This fact has a numerical value',
                value: 'Am'
            },
            {
                key: 'isTextOnly',
                content: 'This fact has a text value',
                value: 'T'
            },
            {
                key: 'isNegativeOnly',
                content: 'This fact value is negative',
                value: 'N'
            },
        ];
        const badgeContainer = document.createElement('div');
        badgeOptions.forEach((current) => {
            if (fact[current.key]) {
                const badge = document.createElement('span');
                badge.classList.add('badge');
                badge.classList.add('bg-secondary');
                badge.classList.add('ms-1');
                badge.setAttribute('data-bs-container', 'body');
                badge.setAttribute('data-bs-toggle', 'popover');
                badge.setAttribute('data-bs-trigger', 'hover focus');
                badge.setAttribute('data-bs-placement', 'right');
                badge.setAttribute('data-bs-content', current.content);

                const text = document.createTextNode(current.value);
                badge.append(text);
                badgeContainer.append(badge);
            }
        });
        return badgeContainer;
    },
};