import fs from "fs"
// import { enrichedFilings } from "../data/enrichedFilings.js"
import { filings as enrichedFilings } from "../dataPlus/staticTestFilings/enrichedFilingsPlus.mjs"
import _ from 'lodash'

// node cypress/utils/filterFilings.mjs

console.log('filtering filings...')

const writeToFile = (array, arrayName, filePath) => {
    let fileContent = `export const ${arrayName} = ${JSON.stringify(array, null, '\t')}`
    fs.writeFileSync(filePath, fileContent)
    console.log(`done! ${arrayName} written to ${filePath}`)
}

const filterToXnumOfEachType = (filings, xNum=5) => {
    if (!filings) filings = enrichedFilings

    const filteredFilings = []

    filings.forEach(filing => {
        const numOfTypeAlreadyInFilteredArray = filteredFilings.filter(filteredFiling => filteredFiling.formType == filing.formType).length
        if (numOfTypeAlreadyInFilteredArray < xNum) filteredFilings.push(filing)
    })
    console.log(`array with ${xNum} of each form type has ${filteredFilings.length} filings.`)
    writeToFile(filteredFilings, `max${xNum}OfEachFormType`, `cypress/data/max${xNum}OfEachFormType.js`)
}

filterToXnumOfEachType()
