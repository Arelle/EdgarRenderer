import { filings } from '../../dataPlus/enrichedFilingsPlus'
import { selectors } from "../../utils/selectors"
const filingWithId = filings.filter(f => {
    return f["id"] == "0001096906-23-001881"
})
const filing = filingWithId[0]
console.log('filing', filing)

const expectColorVals = (actualColorVals, expectedColorVals, moe = 3) => {
    // TODO: removed moe since we're passing in literal vals to invoke now.

    // actualColorVals (array of num strings) = colors queries from style attr of element
    // expectedColorVals (array of nums)
    // moe  (num) = margin of error
    console.log('actualColorVals', actualColorVals)
    console.log('expectedColorVals', expectedColorVals)

    let [redActual, greenActual, blueActual, ...alphaActual] = actualColorVals.map(c => Number(c))
    let [redExpect, greenExpect, blueExpect, ...alphaExpect] = expectedColorVals
    alphaActual = alphaActual[0]
    alphaExpect = alphaExpect[0]

    expect(redActual).to.be.gte(redExpect - moe).and.lte(redExpect + moe)
    expect(greenActual).to.be.gte(greenExpect - moe).and.lte(greenExpect + moe)
    expect(blueActual).to.be.gte(blueExpect - moe).and.lte(blueExpect + moe)

    // alpha channel
    if (alphaActual || alphaExpect) {
        // aphha is dec between 0 and 1
        const alphaMoe = moe/100
        expect(alphaActual).to.be.gte(alphaExpect - alphaMoe).and.lte(alphaExpect + alphaMoe)
    }
}

describe.skip(`Change Fact link and bg colors ${filing.ticker || filing.docName} ${filing.formType}`, () => {
    // Test is highly dependent on screen size so a change in screen size may break these tests.
    // improvement: query expected color from div.picker_sample

    it('should change Tagged Data colors', () => {
        // Tagged Data
        cy.visitHost(filing)
        cy.openSettings()
        // cy.get(selectors.taggedDataColorPickerOpen).click()
        cy.get(selectors.taggedDataColorPickerOpen)
            .invoke('val', 'rgb(0,0,0)')
            .trigger('change')
            // .blur()
        cy.get(selectors.settingsClose).click()
        cy.get('[name="dei:DocumentType"]')
            .should('have.css', 'box-shadow')
            .then(boxShadowProps => {
                console.log('boxShadowProps', boxShadowProps)
                const expectedColorVals = [2, 2, 2]
                const actualColors = boxShadowProps.substring(boxShadowProps.indexOf('(') + 1, boxShadowProps.indexOf(')')).split(', ')
                expectColorVals(actualColors, expectedColorVals)
            })
    })

    it('should change search Results colors', () => {
        // Search Results
        cy.visitHost(filing)
        cy.openSettings()
        // cy.get('.search-results-example-1').should('contain.text', 'Search')
        cy.get(selectors.searchResultsColorPicker)
            .invoke('val', 'rgb(60,60,60)')
            .trigger('change')
        // cy.get(selectors.searchResultsColorPicker).click('center')
        // cy.get(selectors.searchResultsColorPickerSave).click()
        cy.get(selectors.settingsClose).click()
        cy.get(selectors.search).type(filing.formType)
        cy.get(selectors.submitSearchButton).click()

        cy.get('[highlight-fact="true"]')
            .should('have.css', 'background-color')
            .then(color => {
                const actualColors = color.substring(color.indexOf('(') + 1, color.indexOf(')')).split(', ')
                expectColorVals(actualColors, [60,60,60])
        })
    })

    it('should change Tag Shading (hover) colors', () => {
        // Tag Shading (hover)
        cy.visitHost(filing)
        cy.openSettings()
        cy.get(selectors.tagShadingColorPicker)
            .invoke('val', 'rgb(80,250,0)')
            .trigger('change')
        // cy.get(selectors.tagShadingColorPicker).click('right')
        // cy.get(selectors.tagShadingColorPickerSave).click()
        cy.get(selectors.settingsClose).click()
        cy.get('[name="dei:DocumentPeriodEndDate"]').trigger('mouseenter')
            .should('have.css', 'background-color')
            .then(color => {
                const actualColors = color.substring(color.indexOf('(') + 1, color.indexOf(')')).split(', ')
                const expectedColorVals = [80, 250, 0]
                expectColorVals(actualColors, expectedColorVals)
            })
    })

    it('should change text block indicator colors', () => {
        // text block indicator
        cy.visitHost(filing)
        cy.openSettings()
        cy.get(selectors.textBlockColorPicker)
            .invoke('val', 'rgb(10, 20, 255)')
            .trigger('change')
        cy.get(selectors.settingsClose).click()
        // cy.get(selectors.textBlockIndicator).first().trigger('mouseenter')
        cy.get('div[id="dynamic-xbrl-form"]').scrollTo(0, '75%')
        cy.get('div[id="dynamic-xbrl-form"]').scrollTo('bottom', {duration: 2000})
        cy.get(selectors.textBlockIndicator).first()
            .should('have.css', 'border-left')
            .then(borderProps => {
                const actualColors = borderProps.substring(borderProps.indexOf('(') + 1, borderProps.indexOf(')')).split(', ')
                const expectedColorVals = [10, 20, 255]
                expectColorVals(actualColors, expectedColorVals)
            })
    })
})
