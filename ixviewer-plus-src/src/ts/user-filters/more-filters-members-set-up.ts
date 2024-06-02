/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

import { FactMap } from "../facts/map";
import { UserFiltersMoreFiltersMembers } from "./more-filters-members";

export const UserFiltersMoreFiltersMembersSetUp = {

    filtersSet: false,

    membersOptions: [],

    setMembers: () => {
        const members = FactMap.getAllMembers();
        document.getElementById("filters-members-count").innerText = members.length;
        UserFiltersMoreFiltersMembersSetUp.populate(members);
    },

    populate: (members: Array<{ type: string, value: string }>) => {
        let typedCount = 0;
        let explicitCount = 0;
        const isContainerBuild = [false, false];
        members.forEach((
            current
        ) => {
            const indexType = current.type === "explicit" ? 0 : 1;
            current.type === "explicit" ? explicitCount++ : typedCount++;
            if (!isContainerBuild[indexType]) {
                const div = document.createElement("div");
                div.setAttribute("data-bs-parent", "#user-filters-members");
                div.setAttribute("id", "members-filters-accordion-" + indexType);
                div.classList.add("collapse");
                isContainerBuild[indexType] = true;

                document.getElementById("user-filters-members")?.children[indexType].append(div);
            }

            const div = document.createElement("div");
            div.classList.add("d-flex");
            div.classList.add("justify-content-between");
            div.classList.add("align-items-center");
            div.classList.add("w-100");
            div.classList.add("px-2");

            const div2 = document.createElement("div");
            div2.classList.add("form-check");

            const label = document.createElement("label");
            label.classList.add("form-check-label");
            label.classList.add("mb-0");

            const input = document.createElement("input");
            input.setAttribute("title", "Select/Deselect this option.");
            input.setAttribute("type", "checkbox");
            input.setAttribute("tabindex", "9");
            input.classList.add("form-check-input");
            input.setAttribute('name', current.value.toString());
            input.addEventListener("click", () => {
                UserFiltersMoreFiltersMembers.clickEvent(current.value);
            });
            input.addEventListener("keyup", () => {
                UserFiltersMoreFiltersMembers.clickEvent(current.value);
            });

            const text = document.createTextNode(current.value);
            label.append(input);
            label.append(text);
            div2.append(label);
            div.append(div2);
            document
                .getElementById(`members-filters-accordion-${indexType}`)?.append(div);
        });
        // update typed / explitic counts
        if (typedCount > 0) {
            document.getElementById("user-filters-members")?.children[1].classList.remove("d-none");
            const typedNode = document.createTextNode(typedCount.toString());
            document.getElementById("members-typed-count")?.append(typedNode);
        }
        if (explicitCount > 0) {
            document.getElementById("user-filters-members")?.children[0].classList.remove("d-none");
            const explicitNode = document.createTextNode(explicitCount.toString());
            document.getElementById("members-explicit-count")?.append(explicitNode);
        }
        // add eventListener(s) to select all typed / explicit options
        document.getElementById("members-all-0")?.addEventListener("click", () => {
            // just explicit
            UserFiltersMoreFiltersMembers.parentClick(
                members.filter(element => element.type === 'explicit'),
                document.getElementById("members-all-0") as HTMLInputElement);
        });
        document.getElementById("members-all-1")?.addEventListener("click", () => {
                // just implicit
                UserFiltersMoreFiltersMembers.parentClick(
                    members.filter(element => element.type === 'implicit'),
                    document.getElementById("members-all-1") as HTMLInputElement
                );
            });
    }
};
