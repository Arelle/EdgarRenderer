import { filings } from '../../dataPlus/enrichedFilingsPlus'
import { selectors } from "../../utils/selectors"
import { getFilingsWithHighestFactCount } from '../../utils/helpers'

const filing = filings.filter(f => f.id == "0001096906-23-001883")[0] // 412 facts
const highFactCountFilings = getFilingsWithHighestFactCount(filings, 5)

const testAddingMoreFilterCategories = (categoryHeaderSelector, filters, initialFactCount) => {
    let prevFactCount = 0
    let newFactCount = 0

    cy.get(categoryHeaderSelector).click()

    // toggle filters on one by one and check for increase in fact count
    filters.forEach((filter, index) => {
        cy.get(filter).click()
        cy.get(selectors.factCountBadge).then(newfactBadge => {
            newFactCount = Number(newfactBadge.text().replace(',', ''))
            if (index == 0) {
                cy.expect(newFactCount).to.be.lte(initialFactCount)
            } else {
                cy.expect(Number(newfactBadge.text().replace(',', ''))).to.be.gte(prevFactCount)
                cy.expect(newFactCount).to.be.gte(prevFactCount)
            }
            prevFactCount = newFactCount
        })
    })

    // Clear and check that we're back to original fact count
    filters.forEach(catSel => cy.get(catSel).click())
    cy.get(selectors.factCountBadge).then(newfactBadge => {
        newFactCount = Number(newfactBadge.text().replace(',', ''))
        cy.expect(newFactCount).to.eq(initialFactCount)
    })
}

describe(`More Filters for filings`, () => {

    let initialFactCount = 0

    beforeEach(() => {
        cy.visitHost(filing)
        cy.get(selectors.moreFiltersHeader).click()
        
        highFactCountFilings.forEach(f => {
            cy.log('f.factCount', f.factCount)
        })
    })

    // Periods
    it(`Period Filters should filter facts ${filing.ticker || filing.docName} ${filing.formType}`, () => {
        // this assertion forces it to wait for it to be populated with number
        cy.get(selectors.factCountClock).should('not.exist')


        cy.get(selectors.factCountBadge).invoke('text').then(text => {
            initialFactCount = Number(text.replace(',', ''))
            const filtersArr = [selectors.period1Filter, selectors.period2Filter, selectors.period3Filter]
            // const filtersArr = [selectors.period1Filter] // only 1 period filter for 
            testAddingMoreFilterCategories(selectors.periodFilterTagsDrawer, filtersArr, initialFactCount)
        })
    })

    // Measures
    it(`Measure Filters should filter facts ${filing.ticker || filing.docName} ${filing.formType}`, () => {
        cy.get(selectors.factCountClock).should('not.exist')

        let filtersArr = [selectors.measure1Filter, selectors.measure2Filter, selectors.measure3Filter]

        cy.get(selectors.factCountBadge).invoke('text').then(text => {
            initialFactCount = Number(text.replace(',', ''))
            testAddingMoreFilterCategories(selectors.measuresFilterTagsDrawer, filtersArr, initialFactCount)
        })
    })

    // Axis
    it(`Axis Filters should filter facts ${filing.ticker || filing.docName} ${filing.formType}`, () => {
        cy.get(selectors.factCountClock).should('not.exist')

        let filtersArr = [selectors.axis1Filter]

        cy.get(selectors.factCountBadge).invoke('text').then(text => {
            initialFactCount = Number(text.replace(',', ''))
            testAddingMoreFilterCategories(selectors.axisFilterTagDrawer, filtersArr, initialFactCount)
        })
    })

    // Members
    it(`Members Filters should filter facts ${filing.ticker || filing.docName} ${filing.formType}`, () => {
        cy.get(selectors.factCountClock).should('not.exist')

        let filtersArr = [selectors.membersFilter1]

        cy.get(selectors.factCountBadge).invoke('text').then(text => {
            initialFactCount = Number(text.replace(',', ''))
            testAddingMoreFilterCategories(selectors.membersFilterTagDrawer, filtersArr, initialFactCount)
        })
    })

    // Scale
    it(`Scale Filters should filter facts ${filing.ticker || filing.docName} ${filing.formType}`, () => {
        cy.get(selectors.factCountClock).should('not.exist')

        let filtersArr = [
            selectors.scaleFilter1, 
            selectors.scaleFilter2, 
            // selectors.scaleFilter3
        ]

        cy.get(selectors.factCountBadge).invoke('text').then(text => {
            initialFactCount = Number(text.replace(',', ''))
            testAddingMoreFilterCategories(selectors.scaleFilterTagDrawer, filtersArr, initialFactCount)
        })
    })

    // Balance
    it(`Balance Filters should filter facts ${filing.ticker || filing.docName} ${filing.formType}`, () => {
        cy.get(selectors.factCountClock).should('not.exist')

        let filtersArr = [selectors.balanceFilter1, selectors.balanceFilter2]

        cy.get(selectors.factCountBadge).invoke('text').then(text => {
            initialFactCount = Number(text.replace(',', ''))
            testAddingMoreFilterCategories(selectors.balanceFilterTagDrawer, filtersArr, initialFactCount)
        })
    })
})
