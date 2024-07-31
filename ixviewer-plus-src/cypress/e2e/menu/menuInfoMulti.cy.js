// import { enrichedFilingsUniqueFormTypes } from '../data/enrichedFilingsUniqueFormTypes.js'
import { filings } from '../../dataPlus/enrichedFilingsPlus'

/*
npx cypress run --spec 'cypress/e2e/menuInfoMulti.cy.js'
*/

const filingsSample = filings.slice(0, Cypress.env('limitOfFilingsToTest'))

describe(`Menu Info Modal`, () => {
    filingsSample.forEach((filing) => {
		it(`should show correct data for ${filing.ticker || filing.docName} ${filing.formType}`, () => {
            cy.visitHost(filing)
            cy.get('a[data-test="menu-dropdown-link"]').click()
            cy.get('a[id="menu-dropdown-information"]').click()
            cy.get('div[data-test="form-information-modal"]').should('exist')
            
            // some don't have a cik
            // cy.get('td[data-name="Central Index Key"]').should('contain.text', filing.cik)
        })
    })
})