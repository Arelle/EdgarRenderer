
'use strict';

$(document).ready(function() {

    // onClick and onKeyup functions
    $('#dialog-box-close')
        .on('click', function(e) { Modals.close(e.originalEvent, e.delegateTarget); })
        .on('keyup', function(e) { Modals.close(e.originalEvent, e.delegateTarget); });
    $('#dialog-box-copy-content')
        .on('click', function(e) { Modals.copyContent(e.originalEvent, e.delegateTarget, 'form-information-modal-carousel', 'form-information-copy-paste'); })
        .on('keyup', function(e) { Modals.copyContent(e.originalEvent, e.delegateTarget, 'form-information-modal-carousel', 'form-information-copy-paste'); });
    $('#dialog-content-copy-content')
        .on('click', function(e) { Modals.copyContent(e.originalEvent, e.delegateTarget, 'form-information-modal-carousel', 'form-information-copy-paste'); })
        .on('keyup', function(e) { Modals.copyContent(e.originalEvent, e.delegateTarget, 'form-information-modal-carousel', 'form-information-copy-paste'); });
    $('#facts-menu')
        .on('click', function(e) { TaxonomiesMenu.toggle(e.originalEvent, e.delegateTarget); })
        .on('keyup', function(e) { TaxonomiesMenu.toggle(e.originalEvent, e.delegateTarget); });
    $('#form-information-help')
        .on('click', function(e) { Help.toggle(e.originalEvent, e.delegateTarget); })
        .on('keyup', function(e) { Help.toggle(e.originalEvent, e.delegateTarget); });
    $('#menu-dropdown-information')
        .on('click', function(e) { ModalsFormInformation.clickEvent(e.originalEvent, e.delegateTarget); })
        .on('keyup', function(e) { ModalsFormInformation.clickEvent(e.originalEvent, e.delegateTarget); });
    $('#menu-dropdown-link')
        .on('click', function(e) { FormInformation.init(e.originalEvent, e.delegateTarget); })
        .on('keyup', function(e) { FormInformation.init(e.originalEvent, e.delegateTarget); });
    $('#menu-dropdown-settings')
        .on('click', function(e) { ModalsSettings.clickEvent(e.originalEvent, e.delegateTarget); })
        .on('keyup', function(e) { ModalsSettings.clickEvent(e.originalEvent, e.delegateTarget); });
    $('#nested-taxonomy-modal-jump')
        .on('click', function(e) { Pagination.goToTaxonomy(e.originalEvent, e.delegateTarget); })
        .on('keyup', function(e) { Pagination.goToTaxonomy(e.originalEvent, e.delegateTarget); });
    $('#sections-dropdown-link')
        .on('click', function(e) { Sections.toggle(e.originalEvent, e.delegateTarget); })
        .on('keyup', function(e) { Sections.toggle(e.originalEvent, e.delegateTarget); });
    $('#sections-menu-toggle')
        .on('click', function(e) { Sections.toggle(e.originalEvent, e.delegateTarget); })
        .on('keyup', function(e) { Sections.toggle(e.originalEvent, e.delegateTarget); });
    $('#taxonomy-copy-content')
        .on('click', function(e) { Modals.copyContent(e.originalEvent, e.delegateTarget, 'taxonomy-modal-carousel', 'taxonomy-copy-paste'); })
        .on('keyup', function(e) { Modals.copyContent(e.originalEvent, e.delegateTarget, 'taxonomy-modal-carousel', 'taxonomy-copy-paste'); });
    $('#taxonomy-modal-close')
        .on('click', function(e) { Modals.close(e.originalEvent, e.delegateTarget); })
        .on('keyup', function(e) { Modals.close(e.originalEvent, e.delegateTarget); });
    $('#taxonomy-modal-compress')
        .on('click', function(e) { Modals.expandToggle(e.originalEvent, e.delegateTarget, 'taxonomy-modal', 'taxonomy-modal-expand', 'taxonomy-modal-compress'); })
        .on('keyup', function(e) { Modals.expandToggle(e.originalEvent, e.delegateTarget, 'taxonomy-modal', 'taxonomy-modal-expand', 'taxonomy-modal-compress'); });
    $('#taxonomy-modal-copy-content')
        .on('click', function(e) { Modals.copyContent(e.originalEvent, e.delegateTarget, 'taxonomy-modal-carousel', 'taxonomy-copy-paste'); })
        .on('keyup', function(e) { Modals.copyContent(e.originalEvent, e.delegateTarget, 'taxonomy-modal-carousel', 'taxonomy-copy-paste'); });
    $('#taxonomy-modal-expand')
        .on('click', function(e) { Modals.expandToggle(e.originalEvent, e.delegateTarget, 'taxonomy-modal', 'taxonomy-modal-expand', 'taxonomy-modal-compress'); })
        .on('keyup', function(e) { Modals.expandToggle(e.originalEvent, e.delegateTarget, 'taxonomy-modal', 'taxonomy-modal-expand', 'taxonomy-modal-compress'); });
    $('#taxonomy-modal-jump')
        .on('click', function(e) { Pagination.goToTaxonomy(e.originalEvent, e.delegateTarget); })
        .on('keyup', function(e) { Pagination.goToTaxonomy(e.originalEvent, e.delegateTarget); });
    $('#taxonomy-nested-modal-compress')
        .on('click', function(e) { Modals.expandToggle(e.originalEvent, e.delegateTarget, 'taxonomy-nested-modal', 'taxonomy-nested-modal-expand', 'taxonomy-nested-modal-compress'); })
        .on('keyup', function(e) { Modals.expandToggle(e.originalEvent, e.delegateTarget, 'taxonomy-nested-modal', 'taxonomy-nested-modal-expand', 'taxonomy-nested-modal-compress'); });
    $('#taxonomy-nested-copy-content')
        .on('click', function(e) { Modals.copyContent(e.originalEvent, e.delegateTarget, 'modal-taxonomy-nested-content-carousel', 'taxonomy-nested-copy-paste'); })
        .on('keyup', function(e) { Modals.copyContent(e.originalEvent, e.delegateTarget, 'modal-taxonomy-nested-content-carousel', 'taxonomy-nested-copy-paste'); });
    $('#taxonomy-nested-modal-copy-content')
        .on('click', function(e) { Modals.copyContent(e.originalEvent, e.delegateTarget, 'modal-taxonomy-nested-content-carousel', 'taxonomy-nested-copy-paste'); })
        .on('keyup', function(e) { Modals.copyContent(e.originalEvent, e.delegateTarget, 'modal-taxonomy-nested-content-carousel', 'taxonomy-nested-copy-paste'); });
    $('#taxonomy-nested-modal-expand')
        .on('click', function(e) { Modals.expandToggle(e.originalEvent, e.delegateTarget, 'taxonomy-nested-modal', 'taxonomy-nested-modal-expand', 'taxonomy-nested-modal-compress'); })
        .on('keyup', function(e) { Modals.expandToggle(e.originalEvent, e.delegateTarget, 'taxonomy-nested-modal', 'taxonomy-nested-modal-expand', 'taxonomy-nested-modal-compress'); });
    $('#more-filters-accordion')
        .on('click', function(e) { e.stopPropagation(); })
        .on('keyup', function(e) { e.stopPropagation(); });

    // onClick functions
    $('#back-to-top-btn')
        .on('click', function() { Scroll.toTop(); });
    $('#current-filters-reset-all')
        .on('click', function() { UserFiltersDropdown.resetAll(); });
    $('#help-menu-close')
        .on('click', function(e) { Help.toggle(e.originalEvent, e.delegateTarget); });
    $('#nav-filter-more')
        .on('click', function(e) { UserFiltersGeneral.moreFiltersClickEvent(e.originalEvent, e.delegateTarget); });
    $('#search-btn-clear')
        .on('click', function(e) { Search.clear(e.originalEvent, e.delegateTarget); });
    $('#section-menu-search-btn-clear')
        .on('click', function(e) { SectionsSearch.clear(e.originalEvent, e.delegateTarget); });
    $('#taxonomy-menu-secondary-toggle')
        .on('click', function(e) { TaxonomiesMenu.toggle(e.originalEvent, e.delegateTarget); });
    $('#settings-modal-close')
        .on('click', function(e) { Modals.close(e.originalEvent, e.delegateTarget); });
    $('#taxonomy-nested-modal-close')
        .on('click', function(e) { Modals.close(e.delegateTarget); });
    $('#user-filters-balances-credit')
        .on('click', function(e) { UserFiltersMoreFiltersBalances.clickEvent(e.originalEvent, e.delegateTarget, 1); });
    $('#user-filters-balances-debit')
        .on('click', function(e) { UserFiltersMoreFiltersBalances.clickEvent(e.originalEvent, e.delegateTarget, 0); });

    // onChange functions
    $('#nav-filter-dropdown')
        .on('change', function(e) { UserFiltersDataRadios.clickEvent(e.originalEvent, e.delegateTarget); });
    $('#nav-filter-tags-dropdown')
        .on('change', function(e) { UserFiltersTagsRadios.clickEvent(e.originalEvent, e.delegateTarget); });
    $('#scroll-position-select')
        .on('change', function(e) { ModalsSettings.scrollPosition(e.originalEvent, e.delegateTarget); });
    $('#taxonomies-menu-page-select')
        .on('change', function(e) { Pagination.goToPage(e.originalEvent, e.delegateTarget); });
    $('#hover-option-select')
        .on('change', function(e) { ModalsSettings.hoverOption(e.originalEvent, e.delegateTarget); });

    // onSubmit functions
    $('#global-search-form')
        .on('submit', function(e) { Search.submit(e.originalEvent, e.delegateTarget); return false; });
    $('#sections-menu-search-submit')
        .on('submit', function(e) { SectionsSearch.submit(e.originalEvent, e.delegateTarget); return false; });

    // onScroll functions
    $('#dynamic-xbrl-form')
        .on('scroll', function(e) { Scroll.scroll(e.originalEvent, e.delegateTarget); });
});
