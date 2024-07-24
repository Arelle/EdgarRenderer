import { selectors } from "../../utils/selectors"

describe(`Fact Display`, () => {
    it('should not have comma when dei:EntityCentralIndexKey', () => {
        cy.visitFiling(null, "0000014693-23-000155", `bfb-20231002.htm#`);
        cy.get(selectors.factCountClock).should('not.exist')
        cy.get(selectors.factsHeader).click()
        cy.get(selectors.sidebarPaginationNext).click()
        cy.get(selectors.sidebarPaginationNext).click()
        cy.get('a[data-id="fact-identifier-0"]').click()
        cy.get('#fact-modal-carousel-page-1 > tbody > tr:nth-child(2) > td > div')
            .should('have.text', '0000014693') // not 14,693
    })
    
    it('should not have comma when date or year', () => {
        cy.visitFiling(null, "GLM4gd-F-SR20081231", "GLM4gd-F-SR20081231.htm#");
        cy.get(selectors.factCountClock).should('not.exist')
        cy.get(selectors.factsHeader).click()
        cy.get(selectors.sidebarPaginationNext).click()
        cy.get('a[data-id="fact-identifier-3"]').click()
        cy.get(selectors.factValueInModal)
            .should('have.text', '2008') // not 2,008
    })

    it('should not have comma when zip code', () => {
        cy.visitFiling("1517396", "000121390021056659", "stratasys-6k.htm");
        cy.get(selectors.factCountClock).should('not.exist')
        cy.get(selectors.factsHeader).click()
        cy.get('a[data-id="fact-identifier-17"]').click()
        cy.get(selectors.factValueInModal)
            .should('have.text', '76124') // not 76,124
    })

    // TODO: Also, need tests to make sure values are getting commas added when they should.
})