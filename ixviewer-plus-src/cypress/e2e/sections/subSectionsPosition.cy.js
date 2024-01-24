import { filings } from '../../dataPlus/enrichedFilingsPlus'
import { selectors } from '../../utils/selectors'

let filingsSample = filings
if (Cypress.env('limitNumOfFilingsForTestRun')) {
    filingsSample = filings.slice(0, Cypress.env('limitOfFilingsToTest'))
}

/* Skipping for now. Data used to build out sections and the elements they link to is not great.  gigo.  
For example, we infer where to link to based on element name and context ref, but the combinations of these 2 attributes is not always unique.
Because the data is not great, the linking of sections is approximate.  Usually, the scroll position scrolls down for subsequent sections, 
but Sometimes it scrolls up. Sometimes it doesn't change... so this isn't really testable at the moment, if we're shooting for all green.
*/
describe(`Subsections for ${filingsSample.length} filings should link to consecutive poisitions`, () => {
    filingsSample.forEach((filing) => {
        it(`${filing.ticker || filing.docName} ${filing.formType}`, () => {
            cy.visitHost(filing)

            cy.get(selectors.sectionsHeader).click()

            // get whole sections sidebar
            let oldScrollY = 0
            cy.get('[id="sections-menu"] div#tagged-sections > div.card[data-test^="tagged-sections-"]').each((sidebarSection) => {                    
                // click section header
                cy.get(sidebarSection).find('button').click()

                // get each subsection
                cy.get(sidebarSection).find('div[id^="tagged-sections-container-"] li').each(subSectLink => {
                    cy.get(subSectLink).click()
                    // subSectLink.click() // this causes a memory leak... be sure to use cy.get().click()

                    // find scroll pos in viewer elem
                    cy.get('div[id="dynamic-xbrl-form"]', {timeout: 2000}).then($viewerElem => {
                        cy.expect($viewerElem.scrollTop()).to.be.gte(oldScrollY)
                        oldScrollY = $viewerElem.scrollTop()
                    })
                })
            })
        })
    })
})