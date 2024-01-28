import { filings } from '../../dataPlus/enrichedFilingsPlus'
import { selectors } from "../../utils/selectors.mjs"

let filingsSample = filings
if (Cypress.env('limitNumOfFilingsForTestRun')) {
    filingsSample = filings.slice(0, Cypress.env('limitOfFilingsToTest'))
}

const testFilingsIndexUrl = 'http://172.18.85.157:8082/ix3/ixviewer3/ix.xhtml'
const multiInstanceUrlMaybe = 'https://www.sec.gov/ix?doc=https://www.sec.gov/Archives/edgar/data/1855612/000095017023044039/ck0001855612-20230630.htm'

describe(`Multi Instance ${filingsSample.length} filings`, () => {
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
