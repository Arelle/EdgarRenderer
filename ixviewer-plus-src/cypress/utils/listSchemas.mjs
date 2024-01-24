// reads array of objects and keeps track of unique sets of key names
// for example is theres a list of filings but some don't have form type prop that would make 2 schemas

import { enrichedFilings } from "../data/enrichedFilings.js"


export const listSchemas = array => {
    console.log('array.length', array.length)
    const schemas = []
    array.forEach(item => {
        let itemProps = Object.keys(item).join(' ')
        if (!schemas.includes(itemProps)) schemas.push(itemProps)
    })
    console.log('schemas.length', schemas.length)
    console.log('schemas:', schemas)
    return schemas
}

listSchemas(enrichedFilings)