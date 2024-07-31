import { filings } from '../../dataPlus/enrichedFilingsPlus'
import { selectors } from "../../utils/selectors"
const filing = filings[0]

// describe(`Fact Modal ${filing.ticker || filing.docName} ${filing.formType}`, () => {
describe(`Fact Modal`, () => {
    it('should be able to move with arrow icon', () => {
        cy.visitHost(filing)

        let originalPos = {}
        let subsequentPos = {}

        // cy.get(selectors.search).type('10-k')
        // cy.get(selectors.submitSearchButton).click()
        // cy.get(selectors.factSidebarHeaderNumberBadge).click()
        // cy.get(selectors.factsHeader).then($el => cy.wrap($el).click())
        cy.wait(2000)
        cy.get(selectors.factsHeader).click()

        cy.get('a[data-id="fact-identifier-2"]', {timeout: 10000}).then($el => cy.wrap($el).click())
        cy.get(selectors.factModal).then(($modal) => {
            originalPos = $modal.position()
        })

        cy.get(selectors.factModalDrag)
            .should('exist')
            .trigger('mousedown', { which: 1 }) // which: 1   means mouse1 or left mouse, might be default
            .trigger('mousemove', { which: 1, pageX: -200, pageY: -200 }) // pagex, y are relative to original location, so moves up and left
            .trigger('mouseup', { force: true })

        cy.get(selectors.factModal).then(($modal) => {
            subsequentPos = $modal.position()
            let width = $modal.width()
            cy.log('width', width)
            expect(originalPos).not.deep.eq(subsequentPos)
            // cy.log('originalPos', originalPos)
            // cy.log('subsequentPos', subsequentPos)
        })
    })

    it('should show copy-able content with copy icon', () => {
        cy.visitHost(filing)

        // cy.get(selectors.search).type('10-k')
        // cy.get(selectors.submitSearchButton).click()
        //cy.wait(2000)
        cy.get(selectors.factsHeader).click()

        // cy.get(selectors.factInFactBrowser).click()
        cy.get('a[data-id="fact-identifier-2"]').click()

        // cy.get(selectors.factModalToggleCopyContent).click()
        cy.get(selectors.factModalCopyableContent).should('have.css', 'display', 'none')
        cy.get(selectors.factModalToggleCopyContent).click()
        cy.get(selectors.factModalCopyableContent).should('have.css', 'display', 'block')
        
        // test close 
        cy.get(selectors.factCloseCopyableContent).click()
        cy.get(selectors.factModalCopyableContent).should('have.css', 'display', 'none')

        // test toggle
        cy.get(selectors.factModalToggleCopyContent).click()
        cy.get(selectors.factModalCopyableContent).should('have.css', 'display', 'block')
        cy.get(selectors.factModalToggleCopyContent).click()
        cy.get(selectors.factModalCopyableContent).should('have.css', 'display', 'none')
    })

    it('Fact modal box copy contents should not change if you click the copy button multiple times', () => {
        cy.visitHost(filing)
        cy.get('#fact-identifier-4').click()
        cy.get(selectors.factModalToggleCopyContent).click()
        cy.get(selectors.factModalCopyableContentEXP).then(($copyBox) => {
            const copyText = $copyBox.text()
            for(let n = 0; n < 6; n ++){
                cy.get(selectors.factModalToggleCopyContent).click()
            }
            cy.get(selectors.factModalCopyableContentEXP).should(($newCopy) => {
                expect($newCopy.text()).to.equal(copyText)
            })
        })
    })

    it('should be able to expand in size with corners icon', () => {
        cy.visitHost(filing)

        let originalWidth = {}
        let subsequentWidth = {}
        let originalHeight = {}
        let subsequentHeight = {}

        // cy.get(selectors.search).type('10-k')
        // cy.get(selectors.submitSearchButton).click()
        cy.wait(2000)
        cy.get(selectors.factsHeader).click()

        // cy.get(selectors.factInFactBrowser).click()
        cy.get('a[data-id="fact-identifier-2"]').click()

        cy.get(selectors.factModal)
            .then(($modal) => {
                originalWidth = $modal.width()
                originalHeight = $modal.height()
            })
        
        cy.get(selectors.factModalExpand).click()

        cy.get(selectors.factModal)
            .then(($modal) => {
                subsequentWidth = $modal.width()
                subsequentHeight = $modal.height()
                expect(subsequentWidth).to.be.gt(originalWidth)
                expect(subsequentHeight).to.be.gt(originalHeight)
            })
    })

    it('should close when close icon clicked', () => {
        cy.visitHost(filing)

        // cy.get(selectors.search).type('10-k')
        // cy.get(selectors.submitSearchButton).click()
        cy.wait(2000)
        cy.get(selectors.factsHeader).click()

        cy.get(selectors.factModal).should('have.css', 'display', 'none')
        // cy.get(selectors.factInFactBrowser).click()
        cy.get('a[data-id="fact-identifier-2"]').click()
        
        cy.get(selectors.factModal).should('have.css', 'display', 'block')
        cy.get(selectors.factModalClose).click()
        cy.get(selectors.factModal).should('have.css', 'display', 'none')
    })

    it('should be navigable via carousel controls', () => {
        cy.visitHost(filing)
        // cy.get(selectors.search).type('10-k')
        // cy.get(selectors.submitSearchButton).click()
        cy.wait(2000)
        cy.get(selectors.factsHeader).click()
        // cy.get(selectors.factInFactBrowser).click()
        cy.get('a[data-id="fact-identifier-2"]').click()

        let x = [1, 2, 3, 4]

        x.forEach((num) => {
            let currentPage = num
            cy.get('div#fact-modal-carousel > div.carousel-inner > div.carousel-item').each((page, elemIndex) => {
                let carouselNum = elemIndex + 1
                if (carouselNum > 4) return
                if (carouselNum == currentPage) {
                    cy.get(`div#fact-modal-carousel > div.carousel-inner > div.carousel-item:nth-child(${carouselNum})`).should('have.css', 'display', 'block')
                } else {
                    cy.get(`div#fact-modal-carousel > div.carousel-inner > div.carousel-item:nth-child(${carouselNum})`).should('have.css', 'display', 'none')
                }
            })
            cy.get(selectors.factModalCarouselNextArrow).click({ force: true })
            cy.wait(300)
        })
    
    })

    it('should be able to click "breadcrumbs" to navigate carousel', () => {
        cy.visitHost(filing)
        // cy.get(selectors.search).type('10-k')
        // cy.get(selectors.submitSearchButton).click()
        cy.wait(2000)
        cy.get(selectors.factsHeader).click()
        // cy.get(selectors.factInFactBrowser).click()
        cy.get('a[data-id="fact-identifier-2"]').click()

        let x = [1, 2, 3, 4]

        x.forEach((num) => {
            let currentPage = num
            cy.get(`button[data-bs-slide-to="${num - 1}"]`).click()
            cy.get('div#fact-modal-carousel > div.carousel-inner > div.carousel-item').each((page, elemIndex) => {
                let carouselNum = elemIndex + 1 // 4 of them.  starting with 1.
                if (carouselNum > 4) return
                if (carouselNum == currentPage) {
                    cy.get(`div#fact-modal-carousel > div.carousel-inner > div.carousel-item:nth-child(${carouselNum})`).should('have.css', 'display', 'block')
                } else {
                    cy.get(`div#fact-modal-carousel > div.carousel-inner > div.carousel-item:nth-child(${carouselNum})`).should('have.css', 'display', 'none')
                }
            })
        })
    })

    it('should jump to fact in side bar when header icon clicked', () => {
        cy.visitHost(filing)

        // fact 1
        cy.get('#fact-identifier-2').click()
        cy.get(selectors.factModalJump).click()
        
        cy.get('div[id="facts-menu"] a[data-id="fact-identifier-2"]')
            .should('be.visible')
            .should('have.attr', 'selected-fact', 'true')
        cy.get(selectors.factModalClose).click()

        // fact 2
        cy.get('#fact-identifier-3').click()
        cy.get(selectors.factModalJump).click()
        cy.get('div[id="facts-menu"] a[data-id="fact-identifier-3"]')
            .should('be.visible')
            .should('have.attr', 'selected-fact', 'true')
        cy.get(selectors.factModalClose).click()

        // test 6 more random facts
        // for (let fact =  4; fact < 10; fact += 1) {
        //     cy.get(`#fact-identifier-${fact}`).click()
        //     cy.get(selectors.factSideBarClose).click()
        //     cy.get(selectors.factModalJump).click()
        //     cy.get(`div[id="facts-menu"] a[data-id="fact-identifier-${fact}"]`)
        //         .should('be.visible')
        //         .should('have.attr', 'selected-fact', 'true')
        //     cy.get(selectors.factModalClose).click()
        // }
    })
})
