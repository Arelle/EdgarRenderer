import { filings } from '../../dataPlus/enrichedFilingsPlus.mjs';

const filing = filings[0];
// http://localhost:3000/ix.xhtml?doc=/Archives/edgar/data/0000014693-23-000155/bfb-20231002.htm

describe(`Fact Element in ${filing.docName} ${filing.formType}`, () => {
    it('has all attributes needed for interaction', () => {
        cy.visitHost(filing)

        // Check text val and attributes of documentType fact 8-K
        cy.get(`[id="fact-identifier-2"]`).should('have.text', '8-K')
        cy.checkAttr(`[id="fact-identifier-2"]`, 'ix', 'f-1')
        cy.checkAttr(`[id="fact-identifier-2"]`, 'contextref', 'c-1')
        cy.checkAttr(`[id="fact-identifier-2"]`, 'name', 'dei:DocumentType')
        cy.checkAttr(`[id="fact-identifier-2"]`, 'tabindex', '18')
        cy.checkAttr(`[id="fact-identifier-2"]`, 'enabled-fact', 'true')
        cy.checkAttr(`[id="fact-identifier-2"]`, 'continued-fact', 'false')
        cy.checkAttr(`[id="fact-identifier-2"]`, 'selected-fact', 'false')
        cy.checkAttr(`[id="fact-identifier-2"]`, 'hover-fact', 'false')
        cy.checkAttr(`[id="fact-identifier-2"]`, 'inside-table', 'false')
        cy.checkAttr(`[id="fact-identifier-2"]`, 'listeners', 'true')
        cy.checkAttr(`[id="fact-identifier-2"]`, 'highlight-fact', 'false')
    })
})
