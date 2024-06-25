import fs from "fs"
import { extendFilingObject } from './extendFilingObject.mjs' 

// node cypress/utils/buildExtendedFilingsFromInputJson.js

let filingsJson = fs.readFileSync('./src/content/input.json')
filingsJson = JSON.parse(filingsJson)

const extendedFilings = []

for (const filing in filingsJson) {
    // console.log('filing', filingsJson[filing])
	extendedFilings.push(extendFilingObject(filingsJson[filing]))
}

let fileContent = `export const extendedFilings = ${JSON.stringify(extendedFilings, null, '\t')}`

let filePath = './cypress/data/extendedFilings.js'
fs.writeFileSync(filePath, fileContent)

console.log(`done! Array written to ${filePath}`)