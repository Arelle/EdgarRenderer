import { filings } from '../../dataPlus/enrichedFilingsPlus.mjs'
import { urls } from '../../dataPlus/domains'

let filingsSample = filings
if (Cypress.env('limitNumOfFilingsForTestRun')) {
    filingsSample = filings.slice(0, Cypress.env('limitOfFilingsToTest'))
}

describe(`Menu open as zip`, () => {
    filingsSample.forEach((filing) => {
		it(`${filing.ticker || filing.docName} ${filing.formType}`, () => {
            cy.visitHost(filing)
            cy.get('a[data-test="menu-dropdown-link"]').click()

            cy.get('a[data-test="form-information-zip"]').invoke('attr', 'href').then(href => {
                cy.log('href', href)
                // cy.request(urls.dev1DocRoot + href).then(response => {
                cy.request(href).then(response => {
                    // e.g. 
                    // 'http://172.18.85.157:8082/ix3/ixviewer3/ix.xhtml?doc=../../ixdocs/WebContent/documents/0000071691-23-000025/nyt-20230928.htm'
                    // '                                                     ../../ixdocs/WebContent/documents/0000071691-23-000025/00071691-2-3--000025-xbrl.zip'
                    expect(response.status).to.eq(200)
                })
            })
        })
    })
})