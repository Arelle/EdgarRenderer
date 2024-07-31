import { selectors } from '../../utils/selectors'

describe(`All instances vs current only filter`, () => {
    it(`should work on multi-instance filing`, () => {
        cy.visitFiling("wh-sections", "out", `sbsef03exc-20231231.htm`);

        // open sections sidebar
        cy.get(selectors.sectionsHeader).click();

        // select current instance only filter
        cy.get(selectors.sectionsFilterBtn).click();
        cy.get(selectors.currentInstanceFilter).click();

        // current section should be shown
        cy.get(selectors.getNthSection(1)).should('not.have.class', 'd-none');
        // other sections have d-none class
        cy.get(selectors.getNthSection(2)).should('have.class', 'd-none');
        
        // select show all filter
        // cy.get(selectors.sectionsFilterBtn).click(); // still open for some reason
        cy.get(selectors.allInstnacesFilter).click();
        cy.get(selectors.getNthSection(1)).should('not.have.class', 'd-none');
        cy.get(selectors.getNthSection(2)).should('not.have.class', 'd-none');
    })
    it(`should work on multi-doc filing`, () => {
        cy.visitFiling("no-cik", "0001013762-23-000425", `ea185980-6k_inspiratech.htm`);

        // open sections sidebar
        cy.get(selectors.sectionsHeader).click();

        // select current instance only filter
        cy.get(selectors.sectionsFilterBtn).click();
        cy.get(selectors.currentInstanceFilter).click();

        // current section should be shown
        cy.get(selectors.getNthSection(1)).should('not.have.class', 'd-none');        
        
        // select show all filter
        // cy.get(selectors.sectionsFilterBtn).click(); // still open for some reason
        cy.get(selectors.allInstnacesFilter).click();
        cy.get(selectors.getNthSection(1)).should('not.have.class', 'd-none');
    })
});