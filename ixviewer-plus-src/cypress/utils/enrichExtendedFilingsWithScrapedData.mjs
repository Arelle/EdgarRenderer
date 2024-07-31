import fs from "fs"
import { filingObjects as scrapedFilings } from '../data/allFilingsData_122359.js'
import { extendedFilings } from '../data/extendedFilings.js'
import _ from 'lodash'

// node cypress/utils/enrichExtendedFilingsWithScrapedData.js

const enrichedFilings = []

extendedFilings.forEach(extFiling =>  {
    const scrapedMatch = _.find(scrapedFilings, function(scraped) {
        return scraped.accessionNum == extFiling.accessionNum
    })
    // console.log('scrapedMatch', scrapedMatch)
    if (scrapedMatch?.url) delete scrapedMatch.url // redundant with secUrl
	enrichedFilings.push({ ...extFiling, ...scrapedMatch })
})

let fileContent = `export const enrichedFilings = ${JSON.stringify(enrichedFilings, null, '\t')}`

let filePath = './cypress/data/enrichedFilings.js'
fs.writeFileSync(filePath, fileContent)

console.log(`done! Array written to ${filePath}`)