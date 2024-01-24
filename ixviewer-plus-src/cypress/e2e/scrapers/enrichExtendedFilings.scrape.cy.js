import { extendedFilings } from '../../data/extendedFilings.js'
// import { enrichedFilingsWithUniqueFormTypes as extendedFilings } from '../../data/enrichedFilingsWithUniqueFormTypes_Mon_Jul_03_20231358.js'
import { filterArrayOfOjectsOnKeyValue } from '../../utils/helpers.js'
import _ from 'lodash'

const logProgress = false

/*
output: array of filings enriched with 
	- formType
	- factCount
*/

/* run with
npx cypress run --spec 'cypress/e2e/scrapers/enrichExtendedFilings.cy.js'
*/

const sampleAmt = extendedFilings.length
const filingsSample = extendedFilings.slice(0, sampleAmt)
const enrichedFilings = []

describe.skip('enrich filings with formType and FactCount', () => {

	filingsSample.forEach((filing, index, array) => {
		it(`${filing.ticker || filing.docName}`, () => {
			cy.visit(filing.secUrl)

			// get formType
			cy.get('[name="dei:DocumentType"]', { timeout: 10000 }).first().then(($elem) => {
				if ($elem.text()) {
					cy.log($elem.text());
					filing.formType = $elem.text()
				}
			})

			// get factCount
			cy.get('[contextref][enabled-taxonomy="true"]', { timeout: 10000 }).then(($elem) => {
				filing.factCount = $elem.length
				enrichedFilings.push(filing)

				// log status every 10 filings
				if (logProgress && index % 10 == 0) {
					cy.writeFile(`cypress/data/scraperRunStatus.js`, `// status_${index}_of_${sampleAmt}\n` + `const filing: ${JSON.stringify(filing, null, '\t')}`)
				}

				// write arrays to files on last item
				if (index == array.length - 1) {
					const filingsWithUniqueForm = filterArrayOfOjectsOnKeyValue(enrichedFilings, "formType")

					const now = new Date()
					const nowString = now.toDateString().replaceAll(/[\s\/]/g, '_') + '_' + now.getHours().toString() + now.getMinutes().toString()
					cy.writeFile(`cypress/data/enrichedFilings${sampleAmt}_${nowString}.js`, 'export const enrichedFilings = ' + JSON.stringify(enrichedFilings, null, '\t'))
					cy.writeFile(`cypress/data/enrichedFilingsUniqueFormTypes${sampleAmt}_${nowString}.js`, 'export const enrichedFilingsWithUniqueFormTypes = ' + JSON.stringify(filingsWithUniqueForm, null, '\t'))
				}
			})
		})
	})
})
