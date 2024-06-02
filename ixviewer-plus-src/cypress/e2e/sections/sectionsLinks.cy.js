import { filings } from '../../dataPlus/enrichedFilingsPlus'
import { selectors } from '../../utils/selectors'

let filingsSample = filings
if (Cypress.env('limitNumOfFilingsForTestRun')) {
    filingsSample = filings.slice(0, Cypress.env('limitOfFilingsToTest'))
}

const multidocFilings = filings.filter(f => f.hasOwnProperty('cases') && f.cases.includes('multi-doc'));
// e.g. http://localhost:3000/ix.xhtml?doc=/Archives/edgar/data/0001013762-23-000425/ea185980ex99-1_inspiratech.htm

describe(`Sections Links to different instance`, () => {
    // expected conditions depend on filing, so best to test specific filings
    // for example menuCat be be expanded or collapsed depending on number links contained.
    // clicking links too close to bottom of page will not result in a scroll, so change in position is not mandatory, but should be >=
    // however testing scroll has proved unreliabel with cypress... (see inline pagination tests.)
    it(`should change instances`, () => {
        cy.visitFiling("wh-sections", "out", `sbsef03exc-20231231.htm`);
        cy.get(selectors.sectionsHeader).click();

        // open exd instance section accordion
        cy.get('[id="instance-header-sectionDoc-EX-99-D-SBSEF"]').click();

        // click first section link in exd
        cy.get('li[order="3"]').click();

        // check instance name on tab
        cy.get(selectors.docTab0)
            .should('contain.text', 'sbsef03exd-20231231.htm');
    })
})
describe(`Sections Links multi doc`, () => {
    multidocFilings.forEach((filing) => {
        it(`${filing.ticker || filing.docName} ${filing.formType}`, () => {
            cy.visitHost(filing)
            cy.get(selectors.sectionsHeader).click()

            // first doc tab is active
            cy.get(selectors.docTab0).should('have.class', 'active');
            cy.get(selectors.docTab1).should('not.have.class', 'active');
            
            // click section link in ex99-1 doc
            cy.get('li.section-link[order="2"]').click();
            cy.get(selectors.docTab0).should('not.have.class', 'active');
            cy.get(selectors.docTab1).should('have.class', 'active');

            cy.location('search').should('contain', 'ea185980ex99-1_inspiratech')
        })
    })
})