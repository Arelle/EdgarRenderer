// import { enrichedFilingsUniqueFormTypes } from '../data/enrichedFilingsUniqueFormTypes.js'
import { filings } from '../../dataPlus/enrichedFilingsPlus.mjs'
import { selectors } from "../../utils/selectors.mjs"

const filing = filings[0]

/*
npx cypress run --spec 'cypress/e2e/menu/menuHelp.cy.js' --env "domain=dev1"
*/

describe(`Menu Help for ${filing.docName} ${filing.formType}`, () => {
    it('should show help info', () => {
        cy.visitHost(filing)
        cy.get(selectors.menu).click({force: true})
        cy.get(selectors.helpLink).click({force: true})

        cy.get(selectors.gettingStarted).click({force: true})
        cy.get('div[id="help-getting-started"]').should('exist')

        cy.get('button[data-bs-target="#help-fact-review-window"]').click({force: true})
        cy.get('div[id="help-fact-review-window"]').should('exist')

        cy.get('button[data-bs-target="#help-search"]').click({force: true})
        cy.get('div[id="help-search"]').should('exist')

        cy.get('button[data-bs-target="#help-filter"]').click({force: true})
        cy.get('div[id="help-filter"]').should('exist')

        cy.get('button[data-bs-target="#help-facts-results-list"]').click({force: true})
        cy.get('div[id="help-facts-results-list"]').should('exist')

        cy.get('button[data-bs-target="#help-tagged-sections"]').click({force: true})
        cy.get('div[id="help-tagged-sections"]').should('exist')

        cy.get('button[data-bs-target="#help-tagged-menu"]').click({force: true})
        cy.get('div[id="help-tagged-menu"]').should('exist')
    })
})
