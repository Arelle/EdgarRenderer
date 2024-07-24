import { filings } from '../../dataPlus/enrichedFilingsPlus'
import { selectors } from "../../utils/selectors"
const filing = filings[0]

describe(`Nested Fact Modal`, () => {
    it('Should show only fact or nested-fact modal, not both', () => {
        cy.visitFiling(null, "0001013762-23-000425", "ea185980ex99-1_inspiratech.htm#");
        
        // normal fact
        cy.get('#fact-identifier-74').first().click()
        cy.get(selectors.factModal).should('be.visible');
        
        // nested fact parent
        cy.get('#fact-identifier-189').click()
        cy.get(selectors.factModal).should('not.be.visible');
        cy.get(selectors.nestedFactModal).should('be.visible');
        
        // click normal fact again
        cy.get('#fact-identifier-74').first().click()
        cy.get(selectors.factModal).should('be.visible');
        cy.get(selectors.nestedFactModal).should('not.be.visible');
    })

    it('Should not have overlapping concept name text', () => {
        cy.visitFiling(null, "0001013762-23-000425", "ea185980ex99-1_inspiratech.htm#");
        
        // nested fact parent
        cy.get('#fact-identifier-189').click()
        
        // click normal fact again
        cy.get(selectors.nextNestedFactBtn).click()
        cy.get(selectors.nextNestedFactBtn).click()

        // click nested parent again
        cy.get('#fact-identifier-189').click()

        cy.get(selectors.nestedFactCarouselLabel).children().should('have.length', 1);
    })
    it('Should show correct count of nested facts', () => {
        cy.visitFiling(null, "0001013762-23-000425", "ea185980ex99-1_inspiratech.htm#");

        //Click a nested fact
        cy.get('#fact-identifier-189').click()
        cy.get(selectors.nestedPage)
            .should('have.text', '1')
        cy.get(selectors.nestedCount)
            .should('have.text', '11')
    })
})
