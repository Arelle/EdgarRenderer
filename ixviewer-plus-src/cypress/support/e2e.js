// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'
import { selectors } from '../utils/selectors.mjs'

// Alternatively you can use CommonJS syntax:
// require('./commands')

Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
})

Cypress.Commands.add('openSettings', () => {
    cy.get(selectors.menu).click({force: true})
    cy.get(selectors.settings).click({force: true})
})

Cypress.Commands.add('visitFiling', (cik, filingId, htmlFile) =>
{
    const HAS_CIK = !!cik;
    cik = cik || "no-cik";

    const localUrl = `http://localhost:3000/ix.xhtml?doc=/Archives/edgar/data/${cik}/${filingId}/${htmlFile}`;
    const dev1Url = `http://172.18.85.157:8082/ixviewer-ix-dev/ix.xhtml?doc=/Archives/edgar/data/${cik}/${filingId}/${htmlFile}`;
    const dev2Url = dev1Url;    //proceed as if dev2 no longer exists
    const secUrl = HAS_CIK ? `https://www.sec.gov/ix?doc=/Archives/edgar/data/${cik}/${filingId}/${htmlFile}` : dev1Url;
    const testSecUrl = secUrl;

    return cy.visitHost({ localUrl, dev1Url, dev2Url, secUrl, testSecUrl });
});

Cypress.Commands.add('visitHost', (filing, host, timeout=15000) =>
{
    switch(host || Cypress.env('domain'))
    {
        case 'local':
            return cy.visit(filing.localUrl, { timeout });
        case 'sec':
            return cy.visit(filing.secUrl, { timeout });
        case 'dev1':
            return cy.visit(filing.dev1Url, { timeout });
        case 'dev2':
            return cy.visit(filing.dev2Url, { timeout });
        case 'testSec':
            return cy.visit(filing.testSecUrl, { timeout });
        default:
            return cy.visit(filing.localUrl, { timeout });
    }
});

Cypress.Commands.add('requestFilingSummaryPerHost', (filing) => {
    let FilingSummaryUrl
    switch (Cypress.env('domain')) {
        case 'local':
            FilingSummaryUrl = filing.localUrl.replace(filing.docName + '.htm', 'FilingSummary.xml')
            FilingSummaryUrl = FilingSummaryUrl.replace('ix.xhtml?doc=./', '')
            cy.request(FilingSummaryUrl)
            break
        case 'sec':
            FilingSummaryUrl = filing.secUrl.replace(filing.docName + '.htm', 'FilingSummary.xml')
            FilingSummaryUrl = FilingSummaryUrl.replace('ix?doc=/', '')
            cy.request(FilingSummaryUrl)
            break
        case 'testSec':
            FilingSummaryUrl = filing.testSecUrl.replace(filing.docName + '.htm', 'FilingSummary.xml')
            FilingSummaryUrl = FilingSummaryUrl.replace('iy?doc=', '')
            cy.request(FilingSummaryUrl)
            break
        case 'dev1':
            FilingSummaryUrl = filing.dev1Url.replace(filing.docName + '.htm', 'FilingSummary.xml')
            FilingSummaryUrl = FilingSummaryUrl.replace('ix3/ixviewer3/ix.xhtml?doc=../../', '')
            cy.request(FilingSummaryUrl)
            break
        case 'dev2':
            FilingSummaryUrl = filing.dev2Url.replace(filing.docName + '.htm', 'FilingSummary.xml')
            FilingSummaryUrl = FilingSummaryUrl.replace('ix3/ixviewer3/ix.xhtml?doc=../../', '')
            cy.request(FilingSummaryUrl)
            break
        default:
            FilingSummaryUrl = filing.localUrl.replace(filing.docName + '.htm', 'FilingSummary.xml')
            FilingSummaryUrl = FilingSummaryUrl.replace('ix.xhtml?doc=./', '')
            cy.request(FilingSummaryUrl)
    }
})

Cypress.Commands.add('requestMetaLinksPerHost', (filing) => {
    let metalinksUrl
    switch (Cypress.env('domain')) {
        case 'local':
            metalinksUrl = filing.localUrl.replace(filing.docName + '.htm', 'MetaLinks.json')
            metalinksUrl = metalinksUrl.replace('ix.xhtml?doc=./', '')
            return cy.request(metalinksUrl);
            break
        case 'sec':
            metalinksUrl = filing.secUrl.replace(filing.docName + '.htm', 'MetaLinks.json')
            metalinksUrl = metalinksUrl.replace('ix?doc=/', '')
            cy.request(metalinksUrl)
            break
        case 'testSec':
            metalinksUrl = filing.testSecUrl.replace(filing.docName + '.htm', 'MetaLinks.json')
            metalinksUrl = metalinksUrl.replace('iy?doc=', '')
            cy.request(metalinksUrl)
            break
        case 'dev1':
            metalinksUrl = filing.dev1Url.replace(filing.docName + '.htm', 'MetaLinks.json')
            metalinksUrl = metalinksUrl.replace('ix3/ixviewer3/ix.xhtml?doc=../../', '')
            cy.request(metalinksUrl)
            break
        case 'dev2':
            metalinksUrl = filing.dev2Url.replace(filing.docName + '.htm', 'MetaLinks.json')
            metalinksUrl = metalinksUrl.replace('ix3/ixviewer3/ix.xhtml?doc=../../', '')
            cy.request(metalinksUrl)
            break
        default:
            metalinksUrl = filing.localUrl.replace(filing.docName + '.htm', 'MetaLinks.json')
            metalinksUrl = metalinksUrl.replace('ix.xhtml?doc=./', '')
            cy.request(metalinksUrl)
    }
})

Cypress.Commands.add('checkAttr', (selector, attrName, attrVal) => {
    cy.get(selector)
        .invoke('attr', attrName)
        .should('eq', attrVal)
})

/* things to try
[x] retry
[x] recursion
[x] flatter
[x] lots of waits
*/
Cypress.Commands.add('onClickShouldScrollDown', ($clickTarget) => {
    // find scroll pos in viewer elem
    let prevScrollPos = 0;
    cy.log('onClickShouldScrollDown')
    cy.get('div[id="dynamic-xbrl-form"]', {timeout: 2000}).then($viewerElem => {
        prevScrollPos = $viewerElem.scrollTop();
        cy.log('scrollTop')

        cy.get($clickTarget).click().then(() => {
            cy.log('expect')

            cy.expect($viewerElem.scrollTop()).to.be.gt(prevScrollPos)
            prevScrollPos = $viewerElem.scrollTop()
        })
    })
})

Cypress.Commands.add('onClickShouldScrollUp', ($clickTarget) => {
    // find scroll pos in viewer elem
    let prevScrollPos = 0;
    cy.log('onClickShouldScrollUp')
    cy.get('div[id="dynamic-xbrl-form"]', {timeout: 2000}).then($inlineDocElem => {
        prevScrollPos = $inlineDocElem.scrollTop();
        cy.get($clickTarget).click().then(() => {
            cy.expect($inlineDocElem.scrollTop()).to.be.lt(prevScrollPos)
            prevScrollPos = $inlineDocElem.scrollTop()
        })
    })
})

// fails after 5 or so breaks
Cypress.Commands.add('onClickShouldScrollDownRecursive', ($targetCollection, clickSelector) => {
    // find scroll pos in viewer elem
    // let prevScrollPos = 0;
    cy.log('2 onClickShouldScrollDown')
    cy.get('div[id="dynamic-xbrl-form"]', {timeout: 2000}).then($viewerElem => {
        let prevScrollPos = $viewerElem.scrollTop();
        cy.log('3 scrollTop')
        cy.wait(2000)
        // cy.screenshot()
        cy.get(clickSelector).then(($clickTarget) => {
            cy.wait(2000)
            cy.log('$clickTarget', $clickTarget)
            cy.wrap($clickTarget).click().then(() => {
                cy.wait(2000)
                
                cy.log('4 expect')
                
                cy.expect($viewerElem.scrollTop()).to.be.gt(prevScrollPos)
                // prevScrollPos = $viewerElem.scrollTop()
                if ($targetCollection.length > 1) {
                    cy.wait(2000)
                    cy.log('5 recursive!')
                    cy.onClickShouldScrollDownRecursive($targetCollection.slice(1), clickSelector)
                }
            })
        })
    })
})

// fails the same way
Cypress.Commands.add('onClickShouldScrollDownFlat', ($clickTarget, clickSelector) => {
    // find scroll pos in viewer elem
    let prevScrollPos = 0;
    cy.get('div[id="dynamic-xbrl-form"]', {timeout: 2000}).then($viewerElem => {
        prevScrollPos = $viewerElem.scrollTop();
        cy.get(clickSelector).click().then(() => {
            cy.expect($viewerElem.scrollTop()).to.be.gt(prevScrollPos)
            // prevScrollPos = $viewerElem.scrollTop()
        })
    })
})