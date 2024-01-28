import { filings } from '../../dataPlus/enrichedFilingsPlus'

let filingsSample = filings
if (Cypress.env('limitNumOfFilingsForTestRun')) {
    filingsSample = filings.slice(0, Cypress.env('limitOfFilingsToTest'))
}

describe(`Menu open as xbrl instance`, () => {
    filingsSample.forEach((filing) => {
		it(`${filing.ticker || filing.docName} ${filing.formType}`, () => {
            cy.visitHost(filing)
            cy.get('a[data-test="menu-dropdown-link"]').click()

            cy.get('a[data-test="form-information-instance"]').invoke('attr', 'href').then(href => {
                cy.request(href).then(response => {
                    expect(response.status).to.eq(200)
                })
            })
        })
    })
})