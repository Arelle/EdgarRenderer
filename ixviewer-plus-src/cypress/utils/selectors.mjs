export const selectors = {
    webpackOverlay: "webpack-dev-server-client-overlay-div",

    factCountBadge: 'a[id="facts-menu-button"] span.fact-total-count',
    docTab0: 'a[data-cy="inlineDocTab-0"]',
    docTab1: 'a[data-cy="inlineDocTab-1"]',
    intanceTab0factCount: 'a[data-cy="inlineDocTab-0"] > span',
    intanceTab0factCountToolTip: 'a[data-cy="inlineDocTab-0"] > span *',
    tableTab: 'a[data-cy="factTableTab',
    tableTabFactCount: 'a[data-cy="factTableTab > span',
    factCountClock: 'a[id="facts-menu-button"] span.fact-total-count i',

    menu: 'a[data-test="menu-dropdown-link"]',

    taggedSections: '#tagged-sections',
    sectionsHeader: 'a[id="sections-dropdown-link"]',
    sectionActive: 'div.section-active',
    sectionHeaderActive: 'div[id^="section-doc-"].section-active button[data-cy*="instance-header"]',
    sectionsLinks: 'li.section-link',
    getNthSection: (n) => {
        return `div[id="tagged-sections"] > div:nth-child(${n})`;
    },
    nthSectionAccordionBody: (n) => {
        return `div[id="tagged-sections"] > div:nth-child(${n}) > div.accordion-collapse`;
    },
    sectionsFilterBtn: '[data-cy="sections-filter-btn"]',
    allInstnacesFilter: 'div[data-cy="sections-filters"] input[data-cy="all-instances"]',
    currentInstanceFilter: 'div[data-cy="sections-filters"] input[data-cy="current-instance-only"]',

    settings: 'a[data-test="menu-dropdown-settings"]',
    hoverForQuickInfoSelect: 'select[id="hover-option-select"]',
    settingsClose: 'i[id="settings-modal-close"]',

    helpLink: 'a[id="form-information-help"]',
    gettingStarted: 'button[data-bs-target="#help-getting-started"]',

    instanceDropdown: '[data-cy="instance-dropdown"]',
    getNthInstanceLink: (n) => {
        return `#tabs-container [data-cy="instance-dropdown"] > ul > li:nth-child(${n}) > a`;
    },
    
    search: 'input[data-test="global-search"]',
    submitSearchButton: 'form[data-test="global-search-form"] button[type="submit"]',
    searchSettingsGear: 'form[id="global-search-form"] button[data-name="global-search-options"]',
    searchDataTypeCheckboxFilter: 'form[id="global-search-form"] div.form-check',

    dataFiltersButton: 'a[data-test="nav-filter-data"]',
    dataAmountsOnlyFilter: 'form[data-name="data-dropdown"] > div.form-check:nth-child(2) > label > input',

    tagsHeader: 'nav ul > li > a[data-test="nav-filter-tags"]',
    allTagsRadio: 'form[data-name="tags-dropdown"] div input[aria-label*="All"]',
    standardTagsRadio: 'form[data-name="tags-dropdown"] div input[aria-label*="Standard"]',
    customTagsRadio: 'form[data-name="tags-dropdown"] div input[aria-label*="Custom"]',

    moreFiltersHeader: 'a[id="nav-filter-more"]',
    periodFilterTagsDrawer: 'form[data-test="more-filters-form"] a[data-test="Period"]',
    period1Filter: '#user-filters-periods > div > div:nth-child(1) input',
    period2Filter: '#user-filters-periods > div > div:nth-child(3) input',
    period3Filter: '#user-filters-periods > div > div:nth-child(5) input',
    period4Filter: '#user-filters-periods > div > div:nth-child(7) input',
    
    measuresFilterTagsDrawer: 'form a[data-test="Measures"]',
    measure1Filter: '#user-filters-measures > div:nth-child(2) input',
    measure2Filter: '#user-filters-measures > div:nth-child(3) input',
    measure3Filter: '#user-filters-measures > div:nth-child(4) input',

    axisFilterTagDrawer: 'form a[data-test="Axis"]',
    axis1Filter: '#user-filters-axis > div:nth-child(1) a',

    membersFilterTagDrawer: 'form a[data-test="Members"]',
    membersFilter1: 'form input[id="members-all-0"]',

    scaleFilterTagDrawer: 'form a[data-test="Scale"]',
    scaleFilter1: '#user-filters-scales > div:nth-child(2) input',
    scaleFilter2: '#user-filters-scales > div:nth-child(3) input',
    scaleFilter3: '#user-filters-scales > div:nth-child(4) input',
    
    balanceFilterTagDrawer: 'form a[data-test="Balance"]',
    balanceFilter1: '#user-filters-balances > div:nth-child(1) input',
    balanceFilter2: '#user-filters-balances > div:nth-child(2) input',

    resetAllFilters: 'nav a[data-name="current-filters-reset"]',

    taggedDataColorPickerOpen: 'input[id="tagged-data-color-picker"]',
    taggedDataColorPickerSave: 'div[id="tagged-data-color-picker"] div.picker_done button',

    searchResultsColorPicker: 'input[id="search-results-color-picker"]',
    // searchResultsPickerSlider: 'div[id="search-results-color-picker"] .picker_slider.picker_hue',
    searchResultsPickerSlider: 'div[id="search-results-color-picker"] [class*="picker"]',
    searchResultsColorPickerSave: 'div[id="search-results-color-picker"] div.picker_done button',
    
    tagShadingColorPicker: 'input[id="tag-shading-color-picker"]',
    tagShadingPickerSlider: 'div[id="tag-shading-color-picker"] .picker_slider.picker_hue',
    tagShadingColorPickerSave: 'div[id="tag-shading-color-picker"] div.picker_done button',
    
    textBlockPickerSlider: 'div[id="tag-shading-color-picker"] .picker_slider.picker_hue',
    textBlockColorPicker: 'input[id="text-block-color-picker"]',
    textBlockColorPickerSave: 'div[id="text-block-color-picker"] div.picker_done button',
    textBlockIndicator: 'span.text-block-indicator-left',

    factsHeader: 'a[id="facts-menu-button"]',
    factInFactBrowser: 'a[data-id^="fact-identifier-"]',

    factModal: 'div#fact-modal',
    factModalDrag: '#fact-modal-drag',
    factModalToggleCopyContent: 'i[id="fact-modal-copy-content"]',
    factModalExpand: 'i#fact-modal-expand',
    factModalCopyableContent: 'div#fact-copy-content',
    factModalCopyableContentEXP: 'textarea#fact-copy-content-textarea',
    factCloseCopyableContent: 'a#fact-copy-content-close',
    factModalClose: 'i#fact-modal-close',

    factValueInModal: '#fact-modal-carousel-page-1 > tbody > tr:nth-child(2) > td > div',

    factModalCarouselPrevArrow: 'div#fact-modal div.dialog-footer button[data-test="modal-fact-prev"]',
    factModalCarouselNextArrow: 'div#fact-modal div.dialog-footer button[data-test="modal-fact-next"]',
    factModalCarouselPage1Btn: 'li[data-slide-to="0"]',
    factModalCarouselPage2Btn: 'li[data-slide-to="1"]',
    factModalCarouselPage3Btn: 'li[data-slide-to="2"]',
    factModalCarouselPage4Btn: 'li[data-slide-to="3"]',
    factModalCarouselPage1: 'div#fact-modal-carousel > div.carousel-inner > div.carousel-item:nth-child(1)',
    factModalCarouselPage2: 'div#fact-modal-carousel > div.carousel-inner > div.carousel-item:nth-child(2)',
    factModalCarouselPage3: 'div#fact-modal-carousel > div.carousel-inner > div.carousel-item:nth-child(3)',
    factModalCarouselPage4: 'div#fact-modal-carousel > div.carousel-inner > div.carousel-item:nth-child(4)',
    getCarouselPage: (ordinal) => `div.carousel-inner > div.carousel-item:nth-child(${ordinal})`,

    factModalJump: 'div.dialog-header-actions i[id="fact-modal-jump"]',
    factSidebarToggleBtn: '#facts-menu-button',
    showFactInSidebar: 'div.dialog-header-actions i[id="fact-modal-jump"]',
    factSidebar: 'div[id="facts-menu"]',
    factSideBarClose: 'div#facts-menu div.offcanvas-header button.btn-close',
    prevFact: 'div > ul.pagination li:nth-child(1)',
    nextFact: 'div > ul.pagination li:nth-child(2)',
    factModalSubtitle: 'p#fact-modal-subtitle',
    sidebarPaginationInfo: 'div.pagination-info',
    sidebarPaginationSelect: 'select#facts-menu-page-select',
    sidebarPaginationFirst: 'div#facts-menu-list-pagination nav ul.pagination li:nth-child(1)',
    sidebarPaginationPrev: 'div#facts-menu-list-pagination nav ul.pagination li:nth-child(2)',
    sidebarPaginationNext: 'div#facts-menu-list-pagination nav ul.pagination li:nth-child(3)',
    sidebarPaginationLast: 'div#facts-menu-list-pagination nav ul.pagination li:nth-child(4)',

    nestedFactModal: '#fact-nested-modal',
    nestedFactCarouselLabel: '.nested-carousel.active',
    nextNestedFactBtn: '[data-test="modal-fact-nested-next"]',
    nestedPage: 'span[id="nested-page"]',
    nestedCount: 'span[id="nested-count"]',

    // inline doc pagination
    goToTopOfDoc: 'a#to-top-btn',
    goToPrevInlinePage: 'a#to-prev-btn',
    goToNextInlinePage: 'a#to-next-btn',
    goToBtnOfDoc: 'a#to-bottom-btn',
}