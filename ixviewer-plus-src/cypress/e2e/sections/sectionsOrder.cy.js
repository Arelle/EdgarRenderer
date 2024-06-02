import { filings } from '../../dataPlus/enrichedFilingsPlus'
import { selectors } from '../../utils/selectors'

let filingsSample = filings
if (Cypress.env('limitNumOfFilingsForTestRun')) {
    filingsSample = filings.slice(0, Cypress.env('limitOfFilingsToTest'))
}

describe(`Sections Links Order Special Case`, () => {
    it(`should reflect order property value in metalinks.json`, () => {
        cy.visitFiling("1045609", "000095017024015979", `pld-20230331.htm`);

        // open sections sidebar
        cy.get(selectors.sectionsHeader).click();
        cy.wait(20);

        let orderTracker = 1;

        cy.get(selectors.sectionsLinks).each((link, indexLink) => {
            // this test can be slow so just check first 15.
            if (indexLink < 15) {
                cy.get(link).invoke('attr', 'order').then(order => {
                    expect(Number(order)).to.be.gte(orderTracker)
                    orderTracker++;
                    cy.wait(20);
                })
            }
        })
    })
})

describe(`Sections Links Order Bulk`, () => {
    filingsSample.forEach((filing) => {

        it(`should reflect order property value in metalinks.json`, () => {
            cy.visitHost(filing);

            // open sections sidebar
            cy.get(selectors.sectionsHeader).click();

            let orderTracker = 1;
            cy.get(selectors.sectionsLinks).each((link) => {
                cy.get(link).invoke('attr', 'order').then(order => {
                    expect(Number(order)).to.be.gte(orderTracker)
                    orderTracker++;
                })
            })
        })
    })
})
