import { selectors } from '../../utils/selectors'

describe(`Changing instance`, () => {
    it(`should highlight and expand instance section`, () => {
        cy.visitFiling("wh-sections", "out", `sbsef03exc-20231231.htm`);

        // open sections sidebar
        cy.get(selectors.sectionsHeader).click();

        // select only instance filter
        cy.get(selectors.sectionsFilterBtn).click();
        cy.get(selectors.currentInstanceFilter).click();

        // other sections have d-none class
        cy.get(selectors.getNthSection(1)).should('not.have.class', 'd-none');
        cy.get(selectors.getNthSection(2)).should('have.class', 'd-none');
        
        // select show all filter
        // cy.get(selectors.sectionsFilterBtn).click(); // still open for some reason
        cy.get(selectors.allInstnacesFilter).click();
        cy.get(selectors.getNthSection(1)).should('not.have.class', 'd-none');
        cy.get(selectors.getNthSection(2)).should('not.have.class', 'd-none');
    })
});
