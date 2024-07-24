// var fs = require('fs')
import fs from 'fs'

// node cypress/utils/addUrlsToFilingsDataAndWriteToFile.mjs

// FUNCTIONS:
// - transfers filings objects found in dist/Archives/edgar/data.. to single array then to file)
// - adds host urls and docName

const FILING_PATH = "dist/Archives/edgar/data";

const getFilingDotJsonFiles = (dir) => {
    var filings = [];
    fs.readdirSync(dir).forEach(function(filingFolder) {
        const filingJsonPath = dir+'/'+filingFolder+'/filing.json'
        if (fs.existsSync(dir+'/'+filingFolder+'/filing.json')) {
            let filingJson = dir+'/'+filingFolder+'/filing.json'
            filings.push(filingJson)
        }
    })
    return filings
}

const getDocPath = (filing) => {
    // get path after 'data/'
    // 'https://www.sec.gov/Archives/edgar/data/1967680/000196768023000005/vlto-20230927.htm'
    const html = filing.html[0]
    const startOfDocPath = html.indexOf('data/') + 5
    const docPath = filing.html[0].substring(startOfDocPath)
    return docPath
}

const getDocName = (filing) => {
    // get path after 'data/'
    // 'https://www.sec.gov/Archives/edgar/data/1967680/000196768023000005/vlto-20230927.htm'
    const html = filing.html[0]
    const startOfDocName = html.lastIndexOf('/') + 1
    const endOfDocName = html.indexOf('.htm')
    const docName = html.substring(startOfDocName, endOfDocName)
    return docName
}

const getFolderedDocPath = (filing) => {
    /* 
        input
        "html": [
            "https://www.sec.gov/Archives/edgar/data/55785/000005578523000057/pre-20230913.htm"
        ]
        "id": "0000055785-23-000057",

        output
        '0000055785-23-000057/pre-20230913.htm'
    */
    const html = filing.html[0]
    const lastSlashIndex = html.lastIndexOf('/')
    const folderedDocPath = filing.id + html.substring(lastSlashIndex)
    return folderedDocPath
}

const getLocalUrl = (filing) => {
    const urlbeginning = 'http://localhost:3000/ix.xhtml?doc=/Archives/edgar/data/'
    const localUrl = urlbeginning + filing.folderedDocPath
    return localUrl
}

const getSecUrl = (filing) => {
    const html = filing.html[0]
    // just add 'ix?doc=' after .gov/
    // 'https://www.sec.gov/ix?doc=/Archives/edgar/data/55785/000005578523000057/pre-20230913.htm'
    const indexAfterGovSlash = html.indexOf('.gov/') + 5
    const secUrlBegin = html.substring(0, indexAfterGovSlash)
    const secUrlEnd = html.substring(indexAfterGovSlash)
    const secUrl = secUrlBegin + 'ix?doc=/' + secUrlEnd
    return secUrl
}

const getTestSecUrl = (filing) => {
    // many filings are not in the test.sec archives folder
    const html = filing.html[0]
    let testSec = html.replace('www.sec.gov', 'www-test.sec.gov')
    // just add 'ix?doc=' after .gov/
    // 'https://www.sec.gov/ix?doc=/Archives/edgar/data/55785/000005578523000057/pre-20230913.htm'
    //  https://www-test.sec.gov/iy?doc=
    const indexAfterGovSlash = testSec.indexOf('.gov/') + 5
    const secUrlBegin = testSec.substring(0, indexAfterGovSlash)
    const secUrlEnd = testSec.substring(indexAfterGovSlash)
    const secUrl = secUrlBegin + 'iy?doc=../../' + secUrlEnd
    console.log('secUrl', secUrl)
    return secUrl
}

const getDev1Url = (filing) => {
    // html: 'https://www.sec.gov/Archives/edgar/data/1967680/000196768023000005/vlto-20230927.htm'
    // dev1: 'http://172.18.85.157:8082/ix3/ixviewer3/ix.xhtml?doc=../../ixdocs/WebContent/documents/0001967680-23-000005/vlto-20230927.htm'
    const dev1UrlBase = 'http://172.18.85.157:8082/ix3/ixviewer3/ix.xhtml?doc=../../ixdocs/WebContent/documents/'
    const dev1Url = dev1UrlBase + filing.folderedDocPath
    return dev1Url
}

const getDev2Url = (filing) => {
    const dev1UrlBase = 'http://172.18.85.158:8082/ix3/ixviewer3/ix.xhtml?doc=../../ixdocs/WebContent/documents/'
    const dev1Url = dev1UrlBase + filing.folderedDocPath
    return dev1Url
}

export const parseFilingsAndWriteToFile = () => {
    const filingsFilePathNames = getFilingDotJsonFiles(FILING_PATH)

    // read files and write all filings object to one array 
    let filingsArray = filingsFilePathNames.map(filePath => JSON.parse(fs.readFileSync(filePath, "utf8")))

    // construct and add host urls
    filingsArray.forEach((filing, index) => {
        filing.docPath = getDocPath(filing)
        filing.docName = getDocName(filing)
        filing.folderedDocPath = getFolderedDocPath(filing)
        filing.localUrl = getLocalUrl(filing)
        filing.secUrl = getSecUrl(filing)
        filing.dev1Url = getDev1Url(filing)
        filing.dev2Url = getDev2Url(filing)
        filing.testSecUrl = getTestSecUrl(filing)
        console.log(`${index + 1} got host urls for ${filing.docName}`)
    })

    // then write array to file
    let filingsArrayString = `export const filings = ${JSON.stringify(filingsArray, null, '\t')}`
    fs.writeFileSync('cypress/dataPlus/filingsWithUrls.js', filingsArrayString)
}

parseFilingsAndWriteToFile();