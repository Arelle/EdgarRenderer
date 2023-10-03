import * as bootstrap from "bootstrap";
import * as devJSON from "./input.json";
import * as nomnoml from 'nomnoml';
export class Development {
    constructor() {
        if (!PRODUCTION) {
            this.createTabs();
        }
    }

    createTabs() {
        const container = document.getElementById(`dynamic-xbrl-form`);
        const ul = document.createElement('ul');
        ul.classList.add('nav');
        ul.classList.add('nav-tabs');
        ul.setAttribute('id', 'tabs');
        ul.setAttribute('role', 'tablist');

        const tabs = ['Test Filings', 'Flow Chart(s)'];

        tabs.forEach((current, index) => {
            const li = document.createElement('li');
            li.classList.add('nav-item');
            li.setAttribute('role', 'presentation');

            const button = document.createElement('button');
            button.classList.add('nav-link');
            index === 0 ? button.classList.add('active') : null;
            button.setAttribute('id', `tab-${index}`);
            button.classList.add('nav-link');
            button.setAttribute('data-bs-toggle', 'tab');
            button.setAttribute('data-bs-target', `#tab-${index}-pane`);
            button.setAttribute('type', 'button');

            const buttonText = document.createTextNode(current);

            button.append(buttonText);
            li.append(button);
            ul.append(li);
        });
        const div = document.createElement('div');
        div.classList.add('tab-content');
        div.classList.add('nav-tabs');
        div.setAttribute('id', 'tab-content');
        tabs.forEach((_current, index) => {
            const div2 = document.createElement('div');
            div2.classList.add('tab-pane');
            div2.classList.add('fade');
            index === 0 ? div2.classList.add('show') : null;
            index === 0 ? div2.classList.add('active') : null;
            div2.setAttribute('id', `tab-${index}-pane`);
            div.append(div2);
        });
        container?.append(ul);
        container?.append(div);
        this.createTable('tab-0-pane');
        //this.createFlowChart1('tab-1-pane');
        this.createFlowChart('tab-1-pane');

        const triggerTabList = Array.from(document.querySelectorAll('#tabs button'));
        triggerTabList.forEach((current) => {
            const tabTrigger = new bootstrap.Tab(current);
            current.addEventListener('click', (event: MouseEvent) => {
                event.preventDefault();
                tabTrigger.show();
            })
        });


    }

    createTable(containerId: string) {
        const arrayOfJSON = Object.entries(devJSON).map((current) => {
            return {
                ...current[1], ...{ id: current[0] }
            }
        });
        arrayOfJSON.pop();
        arrayOfJSON.sort((a, b) => +b.important - +a.important);

        const container = document.getElementById(containerId);

        const table = document.createElement(`table`);
        table.classList.add('table');
        table.classList.add('table-striped-columns');
        table.classList.add('table-hover');
        const thead = document.createElement(`thead`);
        thead.classList.add('sticky-top');
        const tr1 = document.createElement(`tr`);
        const ths = [
            'ID', 'Name', 'Form', 'Version',
            'Important?', 'Multi-File?', 'Multi-Instance?',
            'ContextRefs', 'SEC', 'DEV'];
        ths.forEach((current) => {
            const th = document.createElement(`th`);
            const text = document.createTextNode(current);
            th.append(text)
            tr1.append(th)
        });
        thead.append(tr1);
        table.append(thead)
        const tbody = document.createElement(`tbody`);
        arrayOfJSON.forEach((current) => {
            if (current.id && current.version && current.sec && current.local) {
                const tr = document.createElement('tr');

                const id = document.createElement('td');
                const idText = document.createTextNode(current['id']);
                id.append(idText);
                tr.append(id);

                const name = document.createElement('td');
                const nameText = document.createTextNode(current['name']);
                name.append(nameText);
                tr.append(name);

                const form = document.createElement('td');
                const formText = document.createTextNode(current['form']);
                form.append(formText);
                tr.append(form);

                const version = document.createElement('td');
                const versionText = document.createTextNode(current['version']);
                version.append(versionText);
                tr.append(version);


                const important = document.createElement('td');
                important.classList.add('text-center');
                const importantText = document.createTextNode(
                    current.important ? '\u2714' : ''
                );
                important.append(importantText);
                tr.append(important);


                const multiple = document.createElement('td');
                multiple.classList.add('text-center');
                const multipleText = document.createTextNode(
                    current.local.length > 1 ? '\u2714' : ''
                );
                multiple.append(multipleText);
                tr.append(multiple);

                const instance = document.createElement('td');
                instance.classList.add('text-center');
                const instanceText = document.createTextNode(
                    current.multiple_instance ? '\u2714' : ''
                );
                instance.append(instanceText);
                tr.append(instance);

                const contextrefs = document.createElement('td');
                contextrefs.classList.add('text-center');
                const contextrefsText = document.createTextNode(current['contextrefs'].toLocaleString('en-US'));
                contextrefs.append(contextrefsText);
                tr.append(contextrefs);


                const sec = document.createElement('td');
                if (current['sec'].length) {
                    const asec = document.createElement('a');
                    asec.setAttribute('href', `${current['sec'][0]}`);
                    asec.setAttribute(`target`, `_blank`);
                    const viewerTextsec = document.createTextNode(`Go See`);
                    asec.append(viewerTextsec);
                    sec.append(asec);
                }
                tr.append(sec);


                const local = document.createElement('td');
                if (current['local'].length) {
                    const alocal = document.createElement('a');
                    alocal.setAttribute('href', `${window.location.href}?doc=${current['local'][0].replace('/src', '')}`);
                    alocal.setAttribute(`target`, `_blank`);
                    const viewerTextlocal = document.createTextNode(`Go See`);
                    alocal.append(viewerTextlocal);
                    local.append(alocal);
                }
                tr.append(local);

                tbody.append(tr);
            }
        })
        table.append(tbody);
        container?.append(table);
    }

    createFlowChart(containerId: string) {
        const container = document.getElementById(containerId);
        const rightContainer = document.createElement('div');
        rightContainer.classList.add('w-50');
        rightContainer.classList.add('h-100');
        rightContainer.classList.add('float-start');
        const h3 = document.createElement('h3');
        const h3Text = document.createTextNode(`Simplified Overview`);
        h3.append(h3Text);
        rightContainer.append(h3);
        const canvas = document.createElement('canvas');
        canvas.setAttribute('id', 'target-canvas2');
        canvas.classList.add('h-100');
        canvas.classList.add('overflow-y-auto');
        rightContainer.append(canvas);

        const ul = document.createElement('ul');
        ul.classList.add('list-group');
        const text = [
            `* = This file will only ever be Fetched one time`,
            `** = There are one or many files, all will be Fetched that exsist for the specific Instance`,
            `*** = There are one of these files per Instance, and will be Fetched for each specific Instance`
        ];
        text.forEach((current) => {
            const li = document.createElement('li');
            li.classList.add('list-group-item');
            const liText = document.createTextNode(current);

            li.append(liText);
            ul.append(li);
        });
        rightContainer.append(ul);



        container?.append(rightContainer);

        const canvasElement = document.getElementById('target-canvas2');
        const source = `
        [<start>] -> 
        [<table> Get URL Params | XHTML | MetaLinks] ->
        [Web Worker?] -> [Obtain External Files & Prepare Data Structure(s)]
        [Obtain External Files & Prepare Data Structure(s) |
            [MetaLinks.json*] -> [XHTML(s)**] -> [Extract Sections] -> [Merge Fact Data]
            [MetaLinks.json*] -> [XML Instance***] -> [Extract Sections]-> [Merge Fact Data]
            [Merge Fact Data] -> [Prepare XHTMLs with fact attributes]
        ] -> 
        [<table> Return Instance Data | XHTML(s) | Facts | Sections] -> 
        [<table> Store Data | Add XHTML(s) to DOM | Store Facts & Set FlexSearch | Set Sections]
        [<table> Multi-Instance (User Interaction) | Sections | Tab Bar] -> [Web Worker?]
        `;
        nomnoml.draw(canvasElement as HTMLCanvasElement, source);

    }

}