import { filings } from '../../dataPlus/enrichedFilingsPlus'
import { selectors } from "../../utils/selectors"
const filing = filings[0]

describe(`Settings Show Popover on Hover`, () => {
    it(`${filing.ticker || filing.docName} ${filing.formType}`, () => {
        cy.visitHost(filing)

        // popover shouldn't show when setting off (default)
        cy.get('[id="fact-identifier-10"]').trigger('mouseenter')
        cy.get('div[id^="popover"]')
            .should('not.exist')

        // popover should show if popover on hover turned on
        cy.openSettings()
        cy.get(selectors.hoverForQuickInfoSelect).select('true')
        cy.get(selectors.hoverForQuickInfoSelect).should('contain.text', 'On')
        cy.get(selectors.settingsClose).click()
        // trigger hover
        cy.get('[id="fact-identifier-10"]').trigger('mouseenter')
        cy.get('div[id^="popover"]')
            .should('exist')
            // .should('contain.text', 'NV')
    })
})
