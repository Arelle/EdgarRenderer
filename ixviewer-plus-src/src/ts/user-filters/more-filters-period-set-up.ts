/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

import { FactMap } from "../facts/map";
import { UserFiltersMoreFiltersPeriod } from "./more-filters-period";

export const UserFiltersMoreFiltersPeriodSetUp = {

    periodsOptions: [],

    setPeriods: () => {

        const periods = FactMap.getAllPeriods();

        const totalPeriods = Object.keys(periods).reduce((acc, current) => { return acc += periods[current].values.length }, 0);

        document.getElementById('filters-periods-count')!.innerText = `${totalPeriods}`;

        UserFiltersMoreFiltersPeriodSetUp.populateCollapse('user-filters-periods',
            periods);
    },

    populateCollapse: (parentId: string, objectOfInfo) => {
        const parentDiv = document.querySelector('#' + parentId + ' .list-group');
        Object.keys(objectOfInfo).reverse().forEach((current, index) => {
            const div1 = document.createElement('div');
            div1.classList.add('d-flex');
            div1.classList.add('justify-content-between');
            div1.classList.add('align-items-center');
            div1.classList.add('w-100');
            div1.classList.add('px-1');

            const div2 = document.createElement('div');
            div2.classList.add('form-check');

            const label = document.createElement('div');
            label.classList.add('form-check-label');
            label.classList.add('mb-0');

            const input = document.createElement('input');
            input.classList.add('form-check-input');
            input.type = 'checkbox';
            input.tabIndex = 9;
            input.title = 'Select/Deselect all options below.';
            input.setAttribute('name', current.toString());
            input.addEventListener('click', (event: MouseEvent) => {
                UserFiltersMoreFiltersPeriod.parentClick(event, index, objectOfInfo[current].values)
            });
            input.addEventListener('keyup', (event: KeyboardEvent) => {
                UserFiltersMoreFiltersPeriod.parentClick(event, index, objectOfInfo[current].values)
            });
            label.appendChild(input);

            const a = document.createElement('a');
            a.setAttribute('data-bs-target', `#period-filters-accordion-${index}`);
            a.setAttribute('data-bs-toggle', 'collapse');
            a.classList.add('click');
            a.tabIndex = 9;
            const aText = document.createTextNode(current.toString());

            a.appendChild(aText);
            label.appendChild(a);
            div2.appendChild(label);

            const span = document.createElement('span');
            span.classList.add('badge');
            span.classList.add('float-end');
            span.classList.add('text-bg-secondary');

            const spanText = document.createTextNode(objectOfInfo[current].values.length.toString());

            span.appendChild(spanText);
            div1.appendChild(div2);
            div1.appendChild(span);

            const div3 = document.createElement('div');
            div3.classList.add('collapse');
            div3.setAttribute('data-bs-parent', '#user-filters-periods');
            div3.setAttribute('id', `period-filters-accordion-${index}`);

            objectOfInfo[current].values.forEach((nestedCurrent) => {
                const div4 = document.createElement('div');
                div4.classList.add('d-flex');
                div4.classList.add('justify-content-between');
                div4.classList.add('align-items-center');
                div4.classList.add('w-100');
                div4.classList.add('px-2');

                const div5 = document.createElement('div');
                div5.classList.add('form-check');

                const label2 = document.createElement('label');
                label2.classList.add('form-check-label');
                label2.classList.add('mb-0');

                const input2 = document.createElement('input');
                input2.classList.add('form-check-input');
                input2.type = 'checkbox';
                input2.tabIndex = 9;
                input2.title = 'Select/Deselect this option.';
                input2.setAttribute('name', nestedCurrent);
                input2.addEventListener('click', () => {
                    UserFiltersMoreFiltersPeriod.childClick(nestedCurrent);
                });
                input2.addEventListener('keyup', () => {
                    UserFiltersMoreFiltersPeriod.childClick(nestedCurrent);
                });

                label2.appendChild(input2);

                // const label2 = document.createElement('label');
                // label2.classList.add('form-check-label');
                // label2.classList.add('mb-0');

                const labelText = document.createTextNode(nestedCurrent);

                label2.appendChild(labelText);

                div5.appendChild(label2);
                div4.appendChild(div5);

                div3.appendChild(div4);

            });
            parentDiv?.appendChild(div1);
            parentDiv?.appendChild(div3);
        })
    },
};
