import { filings } from '../../dataPlus/enrichedFilingsPlus'
import _ from 'lodash'

const logProgress = false
const filingsSample = filings.slice(0, Cypress.env('limitOfFilingsToTest'))

/*
Approach 1
scrape and store fact cases in objects
iterate over objects in test and an check:
    - that the modals show the correct fact
    - that incorrect column facts don't resolve well

Approach 2
just click on each fact link and check that the string above in red font is shown as the fact in the modal

*/

let targetDataFormat = {
    format: 'datequarterend',
    formatIxtSec: 'ixt-sec:datequarterend',
}

describe.skip('enrich filings with formType and FactCount', () => {
    filings.forEach(filing => {
        it(`Srape each format row and test case and write to object then to file`, () => {
            cy.visit(filing.secUrl)
        })
    })
})
