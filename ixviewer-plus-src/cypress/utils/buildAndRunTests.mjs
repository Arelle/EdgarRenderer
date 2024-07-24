import { parseFilingsAndWriteToFile } from './addUrlsToFilingsDataAndWriteToFile.mjs'
import cypress from 'cypress'
import fs from 'fs'

// const { parseFilingsAndWriteToFile } = require('./addUrlsToFilingsDataAndWriteToFile.js')
// const cypress = require('cypress')
// const fs = require('fs')

// node cypress/utils/buildAndRunTests

/*
    If no filigs (dist/Archives/edgar/data) Get filings by running `npm run get-filings-menu` first

    1. elaborate on filings with info in urls
    2. scrape filings via cypress for more data
    3. optionally, run all tests
*/

parseFilingsAndWriteToFile()

// scrape fact count, form type
cypress.run({
    reporter: 'junit',
    browser: 'chrome',
    spec: './cypress/e2e/scrapers/enrichFilingsPlus.scrape.cy.js',
    // excludeSpecPattern: '**/*.+(todo|skip|scrape)*.cy.js/',
    config: {
        screenshotOnRunFailure: false,
        numTestsKeptInMemory: 3,
    }
}).then((results) => {
    console.log('results', results)
}).catch((err) => {
    console.error('err', err)
})

// run all tests
cypress.run({
    reporter: 'junit',
    browser: 'chrome',
    env: {
        // host: 'local', // can override that set in cypress.config
    },
    config: {
        screenshotOnRunFailure: false,
        numTestsKeptInMemory: 3,
        excludeSpecPattern: '**/*.+(todo|skip|scrape)*.cy.js/',
    }
}).then((results) => {
    console.log('results', results)
    console.log('results.endedTestsAt', results.endedTestsAt)
    const formattedDate = new Date(results.endedTestsAt).toLocaleDateString('en-US', {weekday: 'short', day: 'short', month: 'short', year: 'numeric'}).replace('/', '_').replace(',', '')
    console.log('formattedDate', formattedDate)
    const formattedTime = new Date(results.endedTestsAt).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'}).replace(':','')
    let endedTestsAtFormatted = formattedDate + formattedTime

    let resultsWritable = `export const filings = ${JSON.stringify(results, null, '\t')}`
    fs.writeFileSync(`cypress/results/${endedTestsAtFormatted}.js`, resultsWritable)
}).catch((err) => {
    console.error('err', err)
})