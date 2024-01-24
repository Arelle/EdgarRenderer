import { filings } from '../../dataPlus/enrichedFilingsPlus'
import { selectors } from '../../utils/selectors'

let filingsSample = filings
if (Cypress.env('limitNumOfFilingsForTestRun')) {
    filingsSample = filings.slice(0, Cypress.env('limitOfFilingsToTest'))
}

/*
npx cypress run --spec 'cypress/e2e/sections/subSectionsCount.cy.js'
*/

describe(`Sub sections count for ${filingsSample.length} filings`, () => {
    filingsSample.forEach((filing) => {
        it(`${filing.ticker || filing.docName} ${filing.formType}`, () => {
            cy.visitHost(filing)

            cy.get(selectors.sectionsHeader).click()
            cy.get('[id="sections-menu"]', { timeout: 10000 })
                .find('div.card[data-test^="tagged-sections-"]').each(elem => {
                    // get number in badge in ui
                    const subSectionsCount = Number(elem.find('span[id^="tagged-sections-badge-"]').text()) || 0

                    // count subsection elements
                    const subSectionsActual = elem.find('div > div > li').length || 0

                    // should be the same
                    expect(subSectionsCount).to.eq(subSectionsActual)
                }
            )

        })
    })
})
