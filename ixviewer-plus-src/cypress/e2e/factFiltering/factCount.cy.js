// import { enrichedFilings } from "../../data/enrichedFilingsPlus_400_Tue_Sep_26_2023_1758"
import { filings } from '../../dataPlus/enrichedFilingsPlus'
import { selectors } from "../../utils/selectors"

/*
npx cypress run --spec 'cypress/e2e/factCount.cy.js'
*/

let filingsSample = filings
if (Cypress.env('limitNumOfFilingsForTestRun')) {
    filingsSample = filings.slice(0, Cypress.env('limitOfFilingsToTest'))
}

describe(`Fact Count`, () => {
    filingsSample.forEach((filing) => {
		it(`fact count for ${filing.docName} should match`, () => {
            cy.visitHost(filing)
			cy.get(selectors.factCountBadge, {timeout: 15000})
                .should('contain.text', filing.factCount.toLocaleString("en-US"))
        })
    })
})