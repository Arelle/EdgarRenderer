import { filings } from '../../dataPlus/enrichedFilingsPlus'
import { selectors } from "../../utils/selectors.mjs"

let filingsSample = filings
if (Cypress.env('limitNumOfFilingsForTestRun')) {
    filingsSample = filings.slice(0, Cypress.env('limitOfFilingsToTest'))
}

describe(`Multi Instance ${filingsSample.length} filings`, () =>
{
    it("should show the doc that was clicked", () =>
    {
        //a multi-doc filing
        cy.visitFiling("1517396", "000121390021056659", "stratasys-991.htm");

        //should have 2 buttons for the 2 docs
        cy.get(`a[data-link="stratasys-6k.htm"]`).should("exist");
        cy.get(`a.nav-link.active[data-cy^="inlineDocTab-"]`).should("exist");

        //one doc should be visible and the other should not
        cy.get(`section[filing-url="stratasys-6k.htm"]`).should("have.class", "d-none");
        cy.get(`section[filing-url="stratasys-991.htm"]`).should("not.have.class", "d-none");


        //click the btn for the invisible doc
        cy.get(`a[data-link="stratasys-6k.htm"]`).click();

        //invisible doc should now be visible
        cy.get(`section[filing-url="stratasys-6k.htm"]`).should("not.have.class", "d-none");
        cy.get(`section[filing-url="stratasys-991.htm"]`).should("have.class", "d-none");
        
        //a btn for the now-invisible doc should exist
        cy.get(`a.nav-link.active[data-cy^="inlineDocTab-"]`).should("exist");
        cy.get(`a[data-link="stratasys-991.htm"]`).should("exist");


        //click the btn for the originally visible doc; it should become visible again
        cy.get(`a[data-link="stratasys-991.htm"]`).click();
        cy.get(`section[filing-url="stratasys-6k.htm"]`).should("have.class", "d-none");
        cy.get(`section[filing-url="stratasys-991.htm"]`).should("not.have.class", "d-none");
    });


    filingsSample.forEach((filing, index) => {
        let initialFactCount = 0
        let newFactCount = 0
        
        it(`[${index}] Tag Filters should filter facts ${filing.ticker || filing.docName} ${filing.formType}`, () => {
            cy.visitHost(filing)
            
            // this assertion forces it to wait for it to be populated with number
            cy.get(selectors.factCountClock).should('not.exist')

            
            cy.get(selectors.factCountBadge).invoke('text').then(text => {
                initialFactCount = Number(text.replace(',', ''))

                // custom count
                cy.get(selectors.tagsHeader).click()
                cy.get(selectors.customTagsRadio).click()
                cy.get(selectors.factCountBadge).then(newfactBadge => {
                    newFactCount = Number(newfactBadge.text().replace(',', ''))
                    cy.expect(newFactCount).to.be.lte(initialFactCount)
                })

                // Standard tags count
                cy.get(selectors.standardTagsRadio).click()
                cy.get(selectors.factCountBadge).then(newfactBadge => {
                    newFactCount = Number(newfactBadge.text().replace(',', ''))
                    cy.expect(newFactCount).to.be.lte(initialFactCount)
                })

                // All tags count
                cy.get(selectors.allTagsRadio).click()
                cy.get(selectors.factCountBadge).then(newfactBadge => {
                    newFactCount = Number(newfactBadge.text().replace(',', ''))
                    cy.expect(newFactCount).to.eq(initialFactCount)
                })
            })
        })
    })
})
