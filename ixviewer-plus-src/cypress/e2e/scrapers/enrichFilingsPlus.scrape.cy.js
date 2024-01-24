import { filings } from '../../dataPlus/filingsWithUrls'
import { filterArrayOfOjectsOnKeyValue } from '../../utils/helpers.js'
import _ from 'lodash'

const logProgress = false

/*
output: array of filings enriched with 
	- formType
	- factCount
*/

/* run with
npx cypress run --spec 'cypress/e2e/scrapers/enrichFilingsPlus.scrape.cy.js'
*/

const sampleAmt = filings.length
const filingsSample = filings.slice(0, sampleAmt)
const enrichedFilings = []

describe.skip('enrich filings with formType and FactCount', () => {

	filingsSample.forEach((filing, index, array) => {
		it(`${filing.docName}`, () => {
			cy.visit(filing.secUrl)

			// get formType
			cy.get('[name="dei:DocumentType"]', { timeout: 10000 }).first().then(($elem) => {
				if ($elem.text()) {
					// cy.log($elem.text());
					// console.log($elem.text());
					filing.formType = $elem.text()
				}
			})

			// get ticker (only about 75% of docs have this)
			// cy.get('[name="dei:TradingSymbol"]', { timeout: 1000 }).first().then(($elem) => {
			// 	if ($elem.text()) {
			// 		cy.log($elem.text());
			// 		console.log($elem.text());
			// 		filing.ticker = $elem.text()
			// 	}
			// })

			// get factCount
			// Does this match the 'ElementCount' value found in FilingSummary url in filing.json?
			cy.get('[contextref][enabled-taxonomy="true"]', { timeout: 10000 }).then(($elem) => {
				filing.factCount = $elem.length
				enrichedFilings.push(filing)

				// log status every 10 filings
				if (logProgress && index % 10 == 0) {
					cy.writeFile(`cypress/data/scraperRunStatusPlus.js`, `// status_${index}_of_${sampleAmt}\n` + `const filing: ${JSON.stringify(filing, null, '\t')}`)
				}

				// write arrays to files on last item
				if (index == array.length - 1) {
					const filingsWithUniqueForm = filterArrayOfOjectsOnKeyValue(enrichedFilings, "formType")

					const now = new Date()
					const nowString = now.toDateString().replaceAll(/[\s\/]/g, '_') + '_' + now.getHours().toString() + now.getMinutes().toString()
					const fileContent = 'export const filings = ' + JSON.stringify(enrichedFilings, null, '\t')
					cy.writeFile(`cypress/dataPlus/enrichedFilingsPlus_${sampleAmt}_${nowString}.js`, fileContent)
					cy.writeFile(`cypress/dataPlus/enrichedFilingsPlus.js`, fileContent)
					// cy.writeFile(`cypress/data/enrichedFilingsUniqueFormTypes${sampleAmt}_${nowString}.js`, 'export const enrichedFilingsWithUniqueFormTypes = ' + JSON.stringify(filingsWithUniqueForm, null, '\t'))
				}
			})
		})
	})
})
