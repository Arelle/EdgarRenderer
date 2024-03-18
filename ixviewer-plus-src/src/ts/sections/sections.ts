/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

import { Constants } from "../constants/constants";
import { ConstantsFunctions } from "../constants/functions";
import { ErrorsMinor } from "../errors/minor";
import { FactMap } from "../facts/map";
import { FiltersReports } from "../filters/reports";
import { HelpersUrl } from "../helpers/url";

export const Sections = {

  currentlyOpenChildMenu: {},

  searchObject: {},

  populatedSections: false,

  clickEvent: (event: MouseEvent | KeyboardEvent) => {
    if (
      Object.prototype.hasOwnProperty.call(event, 'key') &&
      !((event as KeyboardEvent).key === 'Enter' || (event as KeyboardEvent).key === 'Space')
    ) {
      return;
    }

    if ((event.target as HTMLElement).getAttribute('fact-id')) {
      // fact exists in this instance
      if ((event.target as HTMLElement).getAttribute('fact-file') === HelpersUrl.getHTMLFileName) {
        Sections.scrollToSection({
          id: (event.target as HTMLElement)?.getAttribute('fact-id') as string,
        });
        Sections.setSelectedAttributes(event.target as HTMLElement);
      } else {
        ConstantsFunctions.changeInlineFiles((event.target as HTMLElement).getAttribute('fact-file') as string);

        setTimeout(() => {
          Sections.formChange();
          Sections.scrollToSection({
            id: (event.target as HTMLElement)?.getAttribute('fact-id') as string,
          });
          Sections.setSelectedAttributes(event.target as HTMLElement);
        });
      }

    } else {
      // gotta change instances?
      ConstantsFunctions.changeInstance(+(event.target as HTMLElement).getAttribute('fact-instance') as number, (event.target as HTMLElement).getAttribute("fact-file") as string, () => {
        setTimeout(() => {
          Sections.formChange();
          Sections.scrollToSection({
            name: (event.target as HTMLElement)?.getAttribute('fact-name') as string,
            contextRef: (event.target as HTMLElement)?.getAttribute('fact-contextRef') as string,
          });
          Sections.setSelectedAttributes(event.target as HTMLElement);
        });
      });
    }
  },

  scrollToSection: (options: { id?: string, name?: string; contextRef?: string }) => {
    console.log( 'scrollToSection')
    let fact = null;
    if (options.id) {
      fact = FactMap.getByID(options.id);
    } else if (options.name && options.contextRef) {
      fact = FactMap.getByNameContextRef(options.name, options.contextRef);
    }

    if (fact) {
      const factElement = document.querySelector(`#dynamic-xbrl-form #${fact.id}`);
      factElement?.scrollIntoView({
        // block: Constants.scrollPosition as ScrollLogicalPosition
        block: 'nearest', // fixes content shift ouf of viewport.
      });
    } else {
      ErrorsMinor.factNotFound();
    }
  },

  fallbackElementScroll: (element: HTMLElement) => {
    console.log( 'fallbackElementScroll')

    Sections.setSelectedAttributes(element);
    const fact = FactMap.getByID(element.getAttribute("fact-id") as string);
    if (fact) {
      const factElement = document.getElementById(element.getAttribute("fact-id") as string);
      factElement?.scrollIntoView({
        block: Constants.scrollPosition as ScrollLogicalPosition
      });
    } else {
      ErrorsMinor.factNotFound();
    }
  },

  toggle: (event: MouseEvent | KeyboardEvent) => {
    if (
      Object.prototype.hasOwnProperty.call(event, 'key') &&
      !((event as KeyboardEvent).key === 'Enter' || (event as KeyboardEvent).key === 'Space')
    ) {
      return;
    }

    if (event.target && (event.target as HTMLElement).classList && (event.target as HTMLElement).classList.contains('disabled')) {
      return;
    }
    if (!Sections.populatedSections) {
      if (Constants.getInstanceFiles.length > 1) {
        document.getElementById("sections-search-additional")?.classList.remove("d-none");
      }
      Sections.populate({}, null);
      Sections.populatedSections = true;
    }
  },

  formChange: () => {
    if (document.getElementById("sections-menu")?.classList.contains('show')) {
      if (
        Object.prototype.hasOwnProperty.call(Sections.currentlyOpenChildMenu, `id`) &&
        Object.prototype.hasOwnProperty.call(Sections.currentlyOpenChildMenu, `group`)
      ) {
        ConstantsFunctions.emptyHTMLByID("tagged-sections");
        // we now want to re-paint all sections, keeping Sections.currentlyOpenChildMenu open
        Sections.populatedSections = false;
        Sections.populate(
          Sections.searchObject,
          Sections.currentlyOpenChildMenu['id']
        );
      }
    }
  },

  populate: (searchObject: object, idToKeepOpen: string | null) => {
    Sections.searchObject = searchObject;
    Constants.getMetaReports.forEach((current, index) => {
      const additionalInfo = {
        parentId: `tagged-sections-${index}`,
        badgeId: `tagged-sections-badge-${index}`,
        containerId: `tagged-sections-container-${index}`,
        open: `tagged-sections-container-${index}` === idToKeepOpen,
      };
      if (!Sections.populatedSections) {
        Sections.populateParentCollapse({ ...current, ...additionalInfo });
      }

      Sections.filterParentCollapse(Sections.searchObject, [{ ...current, ...additionalInfo }]);
      Sections.updateBadgeCount([{ ...current, ...additionalInfo }]);
    });
    Sections.populatedSections = true;
  },

  filterParentCollapse: (searchObject: { type: number, value: string } | {} = {}, setupArray: Array<{
    badgeId: string, containerId: string, groupType: string, label: string, open: boolean, parentId: string
  }>) => {
    setupArray.forEach((current: { containerId: string; }) => {

      const liElementsArray = Array.from(document.querySelectorAll(
        "#" + current.containerId + " li"
      ));

      if (Object.prototype.hasOwnProperty.call(searchObject, `value`)) {
        if (document.getElementById(current.containerId)) {
          liElementsArray.forEach((li) => {
            if (searchObject['type'] === 1) {
              // search all sections
              if (
                Sections.searchObject['value'] &&
                !Sections.searchObject['value'].test(li.textContent)
              ) {
                li.classList.remove("d-flex");
                li.classList.add("d-none");
              } else {
                li.classList.add("d-flex");
                li.classList.remove("d-none");
              }
            } else if (searchObject['type'] === 2 && !li.hasAttribute("fact-instance")) {
              // search internal sections ONLY
              if (
                !li.hasAttribute("baseref") &&
                li.textContent &&
                Sections.searchObject['value'] &&
                !Sections.searchObject['value'].test(li.textContent)
              ) {
                li.classList.remove("d-flex");
                li.classList.add("d-none");
              } else {
                li.classList.add("d-flex");
                li.classList.remove("d-none");
              }
            } else if (searchObject['type'] === 3 && li.hasAttribute("fact-instance")) {
              // search external sections ONLY
              if (
                li.textContent &&
                Sections.searchObject['value'] &&
                !Sections.searchObject['value'].test(li.textContent)
              ) {
                li.classList.remove("d-flex");
                li.classList.add("d-none");
              } else {
                li.classList.add("d-flex");
                li.classList.remove("d-none");
              }
            } else {
              li.classList.remove("d-flex");
              li.classList.add("d-none");
            }
          });
        }
      }

      if (
        !Object.prototype.hasOwnProperty.call(searchObject, `type`) &&
        !Object.prototype.hasOwnProperty.call(searchObject, `value`)
      ) {
        liElementsArray.forEach((li) => {
          li.classList.add("d-flex");
          li.classList.remove("d-none");
        });
      }
    });
  },

  updateBadgeCount: (setupArray: Array<{ containerId: string; badgeId: string; parentId: string; }>) => {
    setupArray.forEach((current) => {
      let badgeCount = 0;
      const liElements = document.querySelectorAll(
        "#" + current.containerId + " li"
      );
      const liElementsArray = Array.prototype.slice.call(liElements);
      liElementsArray.forEach((li) => {
        if (li.classList.contains("d-flex")) {
          badgeCount++;
        }
      });
      const badge = document.getElementById(current.badgeId);
      if (badge) {
        if (badgeCount > 0) {
          document.getElementById(current.parentId)?.classList.remove("d-none");
          badge.innerHTML = badgeCount.toString();
        } else {
          document.getElementById(current.parentId)?.classList.add("d-none");
        }
      }
    });
  },

  populateParentCollapse: (input: {
    parentId: string; containerId: string; label: string; badgeId: string; groupType: string;
    open: boolean; children: Array<{}>
  }) => {
    //const discoveredGroupType = Sections.filterGroupType(input.groupType);
    // if (discoveredGroupType.length > 0) {
    // we generate the HTML for this section
    Sections.generateParentCollapseHTML(input);
    Sections.generateChildCollapseHTML(input);
    // }
  },

  generateParentCollapseHTML: (input: {
    parentId: string; containerId: string; name: string;
    badgeId: string; open: boolean
  }) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.setAttribute("id", input.parentId);
    card.setAttribute("data-test", input.parentId);

    const headerContainer = document.createElement("div");
    headerContainer.classList.add("card-header");
    headerContainer.classList.add("px-0");
    headerContainer.classList.add("py-0");

    const header = document.createElement("h5");
    header.classList.add("mb-0");

    const button = document.createElement("button");
    button.classList.add("btn");
    button.classList.add("d-flex");
    button.classList.add("justify-content-between");
    button.classList.add("align-items-center");
    button.classList.add("align-items-center");
    button.classList.add("w-100");
    button.setAttribute("type", "button");
    button.setAttribute("data-bs-target", `#${input.containerId}`);
    button.setAttribute("tabindex", "2");
    button.setAttribute("data-bs-toggle", "collapse");
    button.addEventListener("click", (event: MouseEvent) => {
      Sections.captureChildCollapse(event, `#${input.parentId}`);
    });
    button.addEventListener("keyup", (event: KeyboardEvent) => {
      Sections.captureChildCollapse(event, `#${input.parentId}`);
    });
    const span = document.createElement("span");
    span.classList.add("font-size-1");

    const text = document.createTextNode(input.name);

    const span2 = document.createElement("span");
    span2.classList.add("badge");
    span2.classList.add("text-bg-secondary");
    span2.setAttribute("id", input.badgeId);
    const text2 = document.createTextNode(input.children.length);

    span.appendChild(text);
    button.appendChild(span);

    span2.appendChild(text2);
    button.appendChild(span2);
    header.appendChild(button);

    headerContainer.appendChild(header);
    card.appendChild(headerContainer);
    document.getElementById("tagged-sections")?.appendChild(card);
  },

  generateChildCollapseHTML: (input: {
    parentId: string; containerId: string; label: string; badgeId: string; open: boolean;
  }) => {
    const card = document.getElementById(input.parentId);
    const collapseContainer = document.createElement("div");
    collapseContainer.classList.add("collapse");
    if (input.open) {
      collapseContainer.classList.add("show");
    }
    collapseContainer.setAttribute("data-parent", "#tagged-sections");
    collapseContainer.setAttribute("id", input.containerId);

    const listGroup = document.createElement("div");
    listGroup.classList.add("list-group");
    listGroup.classList.add("list-group-flush");
    input.children.forEach((current) => {
      const fact = FactMap.getByNameContextRef(current.fact.name, current.fact.contextRef);
      const list = document.createElement("li");
      fact ? list.setAttribute("fact-id", fact.id) : list.setAttribute("fact-name", current.fact.name);
      fact ? list.setAttribute("fact-file", fact.file) : list.setAttribute("fact-contextRef", current.fact.contextRef);
      if (fact ? fact.file !== HelpersUrl.getHTMLFileName : false) {
        const icon = document.createElement("i");
        icon.classList.add("fas");
        icon.classList.add("fa-link");
        icon.classList.add("me-3");
        list.appendChild(icon);
      }
      if (!fact) {
        list.setAttribute("fact-file", current.fact.file);
        list.setAttribute("fact-instance", current.fact.instance);
        const icon = document.createElement("i");
        icon.classList.add("fas");
        icon.classList.add("fa-external-link-alt");
        icon.classList.add("me-3");
        list.appendChild(icon);
      }

      list.classList.add("click");
      list.classList.add("list-group-item");
      list.classList.add("list-group-item-action");
      list.classList.add("d-flex");
      list.classList.add("align-items-center");
      list.setAttribute('selected-fact', 'false');
      list.addEventListener("click", (event) => {
        Sections.clickEvent(event);
      });
      list.addEventListener("keyup", (event) => {
        Sections.clickEvent(event);
      });
      list.setAttribute("tabindex", "2");
      const text = document.createTextNode(current.name);
      list.appendChild(text);
      listGroup.appendChild(list);
    });
    collapseContainer.appendChild(listGroup);
    card?.appendChild(collapseContainer);
  },

  filterGroupType: (groupType: string) => {
    const discoveredGroupType = FiltersReports.getReportsByGroupType(groupType);

    const discoveredGroupTypeArray =
      Array.prototype.slice.call(discoveredGroupType);
    // we sort by Long Name to put it in the correct order.
    discoveredGroupTypeArray.sort((first, second) => {
      return first["longName"].localeCompare(second["longName"]);
    });

    return discoveredGroupTypeArray;
  },

  captureChildCollapse: (event: MouseEvent | KeyboardEvent, groupType: string) => {
    if (
      Object.prototype.hasOwnProperty.call(event, 'key') &&
      !((event as KeyboardEvent).key === 'Enter' || (event as KeyboardEvent).key === 'Space')
    ) {
      return;
    }
    const idToPopulate = (event.target as HTMLElement).getAttribute("data-bs-target")?.substring(1);
    if (document.getElementById(idToPopulate!)?.classList.contains("show")) {
      Sections.currentlyOpenChildMenu = {};
    } else {
      Sections.currentlyOpenChildMenu = {
        id: idToPopulate,
        group: groupType
      };
    }
  },

  setSelectedAttributes: (element: HTMLElement) => {
    const selected = document.getElementById("tagged-sections")?.querySelectorAll("[selected-fact]");
    const selectedArray = Array.prototype.slice.call(selected);
    selectedArray.forEach((current) => {
      current.setAttribute("selected-fact", 'false');
    });
    element.setAttribute("selected-fact", 'true');
  }
};
