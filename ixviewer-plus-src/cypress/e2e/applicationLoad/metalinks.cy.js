import { filings } from '../../dataPlus/filingsWithUrls'
// import { filings } from '../../dataPlus/enrichedFilingsPlus'

let filingsSample = filings
if (Cypress.env('limitNumOfFilingsForTestRun')) {
    filingsSample = filings.slice(0, Cypress.env('limitOfFilingsToTest'))
}

describe(`Metalinks requests`, () => {
	filingsSample.forEach((filing) => {
		
		it(`metalinks.json should load for ${filing.ticker || filing.docName} ${filing.formType}`, () => {
			cy.requestMetaLinksPerHost(filing).then(resp => {
				expect(resp.status).to.equal(200)
			})
		})
    })
})