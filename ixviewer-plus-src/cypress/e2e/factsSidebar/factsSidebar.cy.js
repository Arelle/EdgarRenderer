import { filings } from '../../dataPlus/enrichedFilingsPlus'
import { selectors } from "../../utils/selectors"
let filing = filings[0]

// http://localhost:3000/ix.xhtml?doc=./assets/filings/important/eer230-a10-qq32018-multi/a10-qq32018-a.htm
// http://localhost:3000/ix.xhtml?doc=./assets/filings/0001104659-23-099708/tm2325734d1_8ka.htm

// "sec": "https://www.sec.gov/Archives/edgar/data/4457/000000445723000052/uhal-20230331.htm",
// "secUrl": "https://www.sec.gov/ix?doc=https://www.sec.gov/Archives/edgar/data/4457/000000445723000052/uhal-20230331.htm",
// "devLink": "http://172.18.85.157:8080/ixviewer2plus/?doc=?doc=./../ixviewer-2-getter/filings/0000004457-23-000052/uhal-20230331.htm",

describe(`Fact side bar features`, () => {
    it('prev/next fact nav should work', () => {
        cy.visitHost(filing)

        // click first fact
        cy.get('#fact-identifier-6').click()  // should bring up sidebar
        cy.get(selectors.showFactInSidebar).click() 
        cy.get(selectors.factSidebar).should('be.visible') 
        cy.get('div[id="facts-menu"] a[data-id="fact-identifier-6"]').click()
        cy.get('div[id="facts-menu"] a[data-id="fact-identifier-6"]')
            .should('have.attr', 'selected-fact', 'true')
        // cy.get(selectors.factModalSubtitle).should('contain.text', 'Document Type')

        cy.get(selectors.nextFact).click()
        // first fact should not longer be foucsed
        cy.get('div[id="facts-menu"] a[data-id="fact-identifier-6"]')
            .should('have.attr', 'selected-fact', 'false')
        cy.get('div[id="facts-menu"] a[data-id="fact-identifier-7"]').click()
        // cy.get(selectors.factModalSubtitle).should('contain.text', 'Document Annual Report')
        cy.get('div[id="facts-menu"] a[data-id="fact-identifier-7"]')
            .should('have.attr', 'selected-fact', 'true')

        cy.get(selectors.prevFact).click()
        // first fact should be foucsed again
        cy.wait(300)
        cy.get('div[id="facts-menu"] a[data-id="fact-identifier-6"]')
            .should('have.attr', 'selected-fact', 'true')
        cy.get('div[id="facts-menu"] a[data-id="fact-identifier-7"]')
            .should('have.attr', 'selected-fact', 'false')
        // cy.get(selectors.factModalSubtitle).should('contain.text', 'Document Type')

        cy.get(selectors.factSideBarClose).click()
        cy.get(selectors.factSidebar).should('not.be.visible')
    })

    it('pagination should work', () => {
        cy.visitHost(filing)

        // click first fact (doc type 10-k)
        cy.get('#fact-identifier-6').click()  // should bring up sidebar
        cy.get(selectors.showFactInSidebar).click()
        
        cy.get(selectors.sidebarPaginationInfo).should('contain.text', '1 of')
        cy.get(selectors.sidebarPaginationSelect).should('contain.text', 'Page 1')

        cy.get(selectors.sidebarPaginationNext).click() 
        cy.get(selectors.sidebarPaginationInfo).should('contain.text', '2 of') 
        cy.get(selectors.sidebarPaginationSelect).should('contain.text', 'Page 2')

        cy.get(selectors.sidebarPaginationSelect).select('Page 3')
        cy.get(selectors.sidebarPaginationInfo).should('contain.text', '3 of') 
        cy.get(selectors.sidebarPaginationSelect).should('contain.text', 'Page 3')

        cy.get(selectors.sidebarPaginationPrev).click() 
        cy.get(selectors.sidebarPaginationInfo).should('contain.text', '2 of') 
        cy.get(selectors.sidebarPaginationSelect).should('contain.text', 'Page 2')

        cy.get(selectors.sidebarPaginationFirst).click() 
        cy.get(selectors.sidebarPaginationInfo).should('contain.text', '1 of') 
        cy.get(selectors.sidebarPaginationSelect).should('contain.text', 'Page 1')

        cy.get(selectors.sidebarPaginationLast).click() 
        cy.get(selectors.sidebarPaginationInfo).should('contain.text', '4 of') 
        cy.get(selectors.sidebarPaginationSelect).should('contain.text', 'Page 4')
    })
})
