import { filings } from '../../dataPlus/enrichedFilingsPlus.mjs'
import { selectors } from "../../utils/selectors.mjs"

let filingsSample = filings
if (Cypress.env('limitNumOfFilingsForTestRun')) {
    filingsSample = filings.slice(0, Cypress.env('limitOfFilingsToTest'))
}

describe(`Filter - Amounts Only`, () => {
    for(let f=0; f<filingsSample.length; f++) {
        let filing = filingsSample[f]
        let initialFactCount = 0
        let newFactCount = 0
        
        it(`[${f}] should filter facts for ${filing.docName}`, () => {
            cy.visitHost(filing)
            
            // this assertion forces it to wait for it to be populated with number
            cy.get(selectors.factCountClock).should('not.exist')

            
            cy.get(selectors.factCountBadge).invoke('text').then(text => {
                initialFactCount = Number(text.replace(',', ''))

                cy.get(selectors.dataFiltersButton).click()
                cy.get(selectors.dataAmountsOnlyFilter).click()

                cy.get(selectors.factCountBadge).then(newfactBadge => {
                    newFactCount = Number(newfactBadge.text().replace(',', ''))
                    cy.expect(newFactCount).to.be.lte(initialFactCount)
                })

                // TODO click () All again to see fact count revert
            })
        })
    }
})
