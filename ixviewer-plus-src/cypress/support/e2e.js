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

Cypress.Commands.add('visitHost', (filing, timeout=5000) => {
    timeout=15000
    switch (Cypress.env('domain')) {
        case 'local':
            cy.visit(filing.localUrl, {timeout: timeout})
            break
        case 'sec':
            cy.visit(filing.secUrl, {timeout: timeout})
            break
        case 'dev1':
            cy.visit(filing.dev1Url, {timeout: timeout})
            break
        case 'dev2':
            cy.visit(filing.dev2Url, {timeout: timeout})
            break
        case 'testSec':
            cy.visit(filing.testSecUrl, {timeout: timeout})
            break
        default:
            cy.visit(filing.localUrl, {timeout: timeout})
    }
})

Cypress.Commands.add('requestMetaLinksPerHost', (filing) => {
    let metalinksUrl
    switch (Cypress.env('domain')) {
        case 'local':
            metalinksUrl = filing.localUrl.replace(filing.docName + '.htm', 'MetaLinks.json')
            metalinksUrl = metalinksUrl.replace('ix.xhtml?doc=./', '')
            cy.request(metalinksUrl)
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