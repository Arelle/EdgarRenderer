/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

import { FactMap } from "../facts/map";
import { UserFiltersMoreFiltersScale } from "./more-filters-scale";

export const UserFiltersMoreFiltersScaleSetUp = {

    filtersSet: false,

    scaleOptions: [],

    setScales: () => {
        const scales = FactMap.getAllScales();

        document.getElementById('filters-scales-count')!.innerText = scales.length;

        UserFiltersMoreFiltersScaleSetUp.populate(scales);

    },

    populate: (scales: Array<string>) => {

        scales.forEach((current) => {
            const div1 = document.createElement('div');
            div1.classList.add('d-flex');
            div1.classList.add('justify-content-between');
            div1.classList.add('align-items-center');
            div1.classList.add('w-100');
            div1.classList.add('px-2');

            const div2 = document.createElement('div');
            div2.classList.add('form-check');

            const label = document.createElement('label');
            label.classList.add('form-check-label');
            label.classList.add('mb-0');

            const input = document.createElement('input');
            input.classList.add('form-check-input');
            input.type = 'checkbox';
            input.tabIndex = 9;
            input.title = 'Select/Deselect this option.';
            input.setAttribute('name', current.toString());
            input.addEventListener('click', () => {
                UserFiltersMoreFiltersScale.clickEvent(current);
            });
            input.addEventListener('keyup', () => {
                UserFiltersMoreFiltersScale.clickEvent(current);
            });

            const labelText = document.createTextNode(current);
            label.appendChild(input);
            label.appendChild(labelText);
            div2.appendChild(label);
            div1.appendChild(div2);

            document.getElementById('user-filters-scales')?.appendChild(div1);
        });

    }
};
