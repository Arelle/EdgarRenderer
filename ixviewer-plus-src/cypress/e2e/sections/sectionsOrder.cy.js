import { filings } from '../../dataPlus/enrichedFilingsPlus';
import { selectors } from '../../utils/selectors';

let filingsSample = filings;
if (Cypress.env('limitNumOfFilingsForTestRun')) {
    //arbitrarily test against more filings in this spec
    filingsSample = filings.slice(10, Cypress.env('limitOfFilingsToTest') + 15);
}

describe(`Sections Links Order Special Case`, () => {
    it(`should reflect order property value in MetaLinks.json`, () => {
        cy.visitFiling("1045609", "000095017024015979", `pld-20230331.htm`);

        // open sections sidebar
        cy.get(selectors.sectionsHeader).click();
        cy.wait(2);

        let orderTracker = 1;

        cy.get(selectors.sectionsLinks).each((link, indexLink) => {
            // this test can be slow, so just check first 35.
            if (indexLink < 35) {
                cy.get(link).invoke('attr', 'order').then(order => {
                    expect(Number(order)).to.be.gte(orderTracker);
                    orderTracker = Number(order);
                    cy.wait(2);
                });
            }
        });
    });
});

describe(`Sections Links Order Bulk`, () => {
    filingsSample.forEach((filing) => {
        it(`[${filing.id}] should reflect order property value in MetaLinks.json`, () => {
            cy.visitHost(filing);

            // open sections sidebar
            cy.get(selectors.sectionsHeader).click();

            let orderTracker = 0;
            cy.get(selectors.sectionsLinks).each((link) => {
                cy.get(link).invoke('attr', 'order').then(order => {
                    expect(order).to.not.be.null;
                    expect(Number(order)).to.be.gt(orderTracker);
                    orderTracker = Number(order);
                });
            });
        });
    });
});
