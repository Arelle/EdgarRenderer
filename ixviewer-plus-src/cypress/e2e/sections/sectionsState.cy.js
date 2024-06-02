import { filings } from '../../dataPlus/enrichedFilingsPlus'
import { selectors } from '../../utils/selectors'

let filingsSample = filings;
if (Cypress.env('limitNumOfFilingsForTestRun')) {
    filingsSample = filings.slice(0, Cypress.env('limitOfFilingsToTest'));
}

//TODO: this line is unused -- delete?
const multidocFilings = filings.filter(f => f.hasOwnProperty('cases') && f.cases.includes('multi-doc'));
// e.g. http://localhost:3000/ix.xhtml?doc=/Archives/edgar/data/no-cik/0001013762-23-000425/ea185980ex99-1_inspiratech.htm

describe(`Changing instance`, () => {
    //TODO: change this description.  It's the same as in another spec (copy-paste?)
    it(`should be highlight and expaned instance section`, () => {
        cy.visitFiling("wh-sections", "out", `sbsef03exc-20231231.htm`);

        // open sections sidebar
        cy.get(selectors.sectionsHeader).click();

        // select next instance drop instance dropdown
        cy.get(selectors.instanceDropdown).click();
        cy.get(selectors.getNthInstanceLink(2)).click();
        
        // has highlight class
        cy.get(selectors.getNthSection(2)).should('have.class', 'section-active');
        cy.get(selectors.getNthSection(1)).should('not.have.class', 'section-active');
        
        // accordion is expanded
        cy.get(selectors.nthSectionAccordionBody(2)).should('have.class', 'show');
    });
});
