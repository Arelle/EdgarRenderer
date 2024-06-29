// import { enrichedFilings } from "../../data/enrichedFilingsPlus_400_Tue_Sep_26_2023_1758"
import { filings } from '../../dataPlus/enrichedFilingsPlus'
import { selectors } from "../../utils/selectors"

/*
npx cypress run --spec 'cypress/e2e/factCountTooltip.cy.js'
*/

let filingsSample = filings
if (Cypress.env('limitNumOfFilingsForTestRun')) {
    filingsSample = filings.slice(0, Cypress.env('limitOfFilingsToTest'))
}

// skipping b/c can't figure out what the selector is for the tooltip
describe.skip(`Fact Count Tooltip`, () => {
    filingsSample.forEach((filing) => {
		it(`fact count tooltip for ${filing.docName} should appear on hover and disappear off hover`, () => {
            cy.visitHost(filing)
			cy.get(selectors.docTab0factCount, {timeout: 15000})
                .should('contain.text', filing.factCount.toLocaleString("en-US"))
            cy.get(selectors.docTab0factCount).trigger('mouseenter')
            cy.get(selectors.docTab0factCountToolTip)
                .should('exist')
                .should('have.text','Filtered Fact Count')

        })
    })
})