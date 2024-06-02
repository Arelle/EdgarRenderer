import { filings } from '../../dataPlus/enrichedFilingsPlus'
import { selectors } from "../../utils/selectors"

let filingsSample = filings
if (Cypress.env('limitNumOfFilingsForTestRun')) {
    filingsSample = filings.slice(0, Cypress.env('limitOfFilingsToTest'))
}

describe(`Search for ${filingsSample.length} filings`, () => {
    filingsSample.forEach((filing, index) => {
        let initialFactCount = 0
        let newFactCount = 0
        let expandedFactCount = 0
        
        // just checking for smaller or equal fact count
        it(`[${index + 1}] Search text 'cash' should filter facts ${filing.formType}`, () => {
            cy.visitHost(filing)
            
            // this assertion forces it to wait for it to be populated with number
            cy.get(selectors.factCountClock).should('not.exist')

            
            cy.get(selectors.factCountBadge).invoke('text').then(text => {
                initialFactCount = Number(text.replace(',', ''))

                cy.get(selectors.search).type('cash')
                cy.get(selectors.submitSearchButton).click()

                cy.get(selectors.factCountBadge).then(newfactBadge => {
                    newFactCount = Number(newfactBadge.text())
                    cy.expect(newFactCount).to.be.lt(initialFactCount)
                })
            })
            
            // test that expanding search grows results or keep equal
            cy.get(selectors.searchSettingsGear).click()

            // Check all options except Match Case (These selectors are gross...)
            cy.get('form[id="global-search-form"] div.form-check:nth-child(4) input').click()
            cy.get('form[id="global-search-form"] div.form-check:nth-child(5) input').click()
            cy.get('form[id="global-search-form"] div.form-check:nth-child(6) input').click()
            // Reference Options (outdated?)
            // cy.get('form[id="global-search-form"] div.dropdown-menu div.border div.form-check:nth-child(2) > input').click()
            // cy.get('form[id="global-search-form"] div.dropdown-menu div.border div.form-check:nth-child(3) > input').click()
            // cy.get('form[id="global-search-form"] div.dropdown-menu div.border div.form-check:nth-child(4) > input').click()
            // cy.get('form[id="global-search-form"] div.dropdown-menu div.border div.form-check:nth-child(5) > input').click()
            // cy.get('form[id="global-search-form"] div.dropdown-menu div.border div.form-check:nth-child(6) > input').click()

            cy.get(selectors.submitSearchButton).click()

            cy.get(selectors.factCountBadge).then(newfactBadge => {
                expandedFactCount = Number(newfactBadge.text().replace(',', ''))
                cy.expect(expandedFactCount).to.be.gte(newFactCount)
            })
        })

        it(`[${index + 1}] Search text 'tp' should filter facts ${filing.ticker || filing.docName} ${filing.formType}`, () => {
            // tp means type - Walter suggested this search term during a demo
            cy.visitHost(filing)
            
            // this assertion forces it to wait for it to be populated with number
            cy.get(selectors.factCountClock).should('not.exist')

            
            cy.get(selectors.factCountBadge).invoke('text').then(text => {
                initialFactCount = Number(text.replace(',', ''))

                cy.get(selectors.search).type('tp')
                cy.get(selectors.submitSearchButton).click()

                cy.get(selectors.factCountBadge).then(newfactBadge => {
                    newFactCount = Number(newfactBadge.text().replace(',', ''))
                    cy.expect(newFactCount).to.be.lt(initialFactCount)
                })
            })
        })

        it(`[${index + 1}] Search text 'form' should filter facts ${filing.ticker || filing.docName} ${filing.formType}`, () => {
            cy.visitHost(filing)
            
            // this assertion forces it to wait for it to be populated with number
            cy.get(selectors.factCountClock).should('not.exist')

            
            cy.get(selectors.factCountBadge).invoke('text').then(text => {
                initialFactCount = Number(text.replace(',', ''))

                cy.get(selectors.search).type('form')
                cy.get(selectors.submitSearchButton).click()

                cy.get(selectors.factCountBadge).then(newfactBadge => {
                    newFactCount = Number(newfactBadge.text().replace(',', ''))
                    cy.expect(newFactCount).to.be.lt(initialFactCount)
                })
            })
        })
    })
})
