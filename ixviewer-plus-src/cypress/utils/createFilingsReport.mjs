import fs from "fs"
import { filings as enrichedFilings } from "../dataPlus/staticTestFilings/enrichedFilingsPlus.mjs"
import _ from 'lodash'

// node cypress/utils/createFilingsReport.mjs


const countFilingsFormTypes = (filings) => {
    if (!filings) filings = enrichedFilings

    const formTypesCount = {}

    // 1. foreach
    // 2. readFormType
    // 3. if no formtype prop add, then push filing
    // 4. if formtype prop, push filing
    // 5. after foreach push length data to meta file

    filings.forEach(filing => {
        if (formTypesCount[filing.formType]?.length) {
            formTypesCount[filing.formType].push(filing)
        } else {
            formTypesCount[filing.formType] = [] 
            formTypesCount[filing.formType].push(filing)
        }
    })
    let fileContent = `Num of each Form type in filings\n`
    for (const formType in formTypesCount) {
        console.log(`${formType}: ${formTypesCount[formType].length}`)
        fileContent += `${formType}: ${formTypesCount[formType].length}\n`
    }
    fs.writeFileSync(`cypress/dataPlus/filingsMeta.txt`, fileContent)
}

countFilingsFormTypes()