import { filings } from '../../dataPlus/enrichedFilingsPlus'
// import { filings } from '../../dataPlus/filingsWithUrls'
import { selectors } from "../../utils/selectors"

// const filteredFilings = filings.filter(filing => filing.secUrl == 'https://www.sec.gov/ix?doc=https://www.sec.gov/Archives/edgar/data/4457/000000445723000052/uhal-20230331.htm')

const filing = filings[0]

describe(`Reset Filters`, () => {
    let initialFactCount = 0

    // Select
    it(`should clear filters ${filing.ticker || filing.docName} ${filing.formType}`, () => {
        cy.visitHost(filing)
        cy.get(selectors.factCountClock).should('not.exist')

        cy.get(selectors.factCountBadge).invoke('text').then(text => {
            initialFactCount = Number(text.replace(',', ''))
            cy.log('text', text)

            // add amounts filter
            cy.get(selectors.dataFiltersButton).click()
            cy.get(selectors.dataAmountsOnlyFilter).click()
            
            // add standard only filter
            cy.get(selectors.tagsHeader).click()
            cy.get(selectors.standardTagsRadio).click()
            
            // add period filter
            cy.get(selectors.moreFiltersHeader).click()
            cy.get(selectors.periodFilterTagsDrawer).click()
            cy.get(selectors.period1Filter).click()
            
            cy.get(selectors.resetAllFilters).click()
            cy.get(selectors.factCountBadge).then(newfactBadge => {
                let newFactCount = Number(newfactBadge.text().replace(',', ''))
                cy.expect(newFactCount).to.eq(initialFactCount)
            })
        })
    })
})
