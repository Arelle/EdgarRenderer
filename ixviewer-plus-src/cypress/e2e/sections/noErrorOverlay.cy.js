import { filings } from '../../dataPlus/enrichedFilingsPlus';
import { selectors } from '../../utils/selectors';

let filingsSample = filings;
if (Cypress.env('limitNumOfFilingsForTestRun')) {
    filingsSample = filings.slice(0, Cypress.env('limitOfFilingsToTest'));
}

describe(`Load and section click results in no error overlay`, () => {
    it(`Doc with space in name should create valid selectors`, () => {
        cy.visitFiling("1045609", "000119312523079100", "d412709ddef14a.htm");
        cy.get(selectors.sectionsHeader).click()
        cy.get(selectors.webpackOverlay).should('not.exist');

        cy.get(selectors.sectionsLinks).first((sectionLink) => {                    
            cy.get(sectionLink).click();
            cy.get(selectors.webpackOverlay).should('not.exist');
        });
    });

    filingsSample.forEach((filing) => {
        it(`${filing.ticker || filing.docName} ${filing.formType}`, () => {
            cy.visitHost(filing);
            cy.get(selectors.sectionsHeader).click();

            cy.get(selectors.sectionsLinks).first((sectionLink) => {                    
                cy.get(sectionLink).click();
                cy.get(selectors.webpackOverlay).should('not.exist');
            });
        });
    });
});