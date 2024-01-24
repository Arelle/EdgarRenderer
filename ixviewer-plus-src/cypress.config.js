import { defineConfig } from "cypress"
import { urls } from './cypress/dataPlus/domains'

const domains = {
  local: 'local',
  sec: 'sec',
  dev1: 'dev1',
  dev2: 'dev2', // more stable, ixviewer-plus branch to deploy there
  mr: 'mr',
  testSec: 'testSec',
}

export default defineConfig({
  env: {
    domain: domains.local,
    skipScrapers: true,
    limitNumOfFilingsForTestRun: false, // Good for doing a health check of all tests
    limitOfFilingsToTest: 3,
    docBaseForCurrentDomain: function() {
      switch(this.host) {
        case domains.dev1:
          return urls.dev1DocRoot
        case domains.local:
          return urls.localDocRoot
        default:
          return urls.dev1DocRoot
      }
    }
  },
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    // Stable url base: http://172.18.85.157:8082/ix3/ixviewer3/ix.xhtml?doc=./assets/filings/important/
    // Stable url: http://172.18.85.157:8082/ix3/ixviewer3/ix.xhtml?doc=./assets/filings/important/mi-01-pri-gd-att-gd/eelo00001gd-20340331.htm
    screenshotOnRunFailure: false,
    numTestsKeptInMemory: 1,
    "browser": 'chrome',
    // baseUrl: env.local,
    experimentalMemoryManagement: true,
    video: false,
    defaultCommandTimeout: 8000,
    requestTimeout: 8000,
    responseTimeout: 8000,
    experimentalRunAllSpecs: true,
    // responseTimeout: 30000,
    pageLoadTimeout: 4000,
    excludeSpecPattern: [
      '**/*.+(todo|skip)*.cy.js',
      '**/*.+(scrape)*.cy.js',
  ], // https://globster.xyz/
    viewportWidth: 1500,
    viewportHeight: 1000,
    chromeWebSecurity: false,
  },
})
