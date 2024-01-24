export const extendFilingObject = (filingObj) => {
	const secBaseUrl = 'https://www.sec.gov/ix?doc='
	const secDocPath = 'https://www.sec.gov/Archives/edgar/data/'
	const devBaseUrl = 'http://172.18.85.157:8080/ixviewer2plus/?doc='
	const devDocPath = './../ixviewer-2-getter/filings/'

	/* typical filing object
	"0001637207-23-000034": {
		"version": "2.2",
		"instance_file": "plnt-20230607.htm",
		"link": "?doc=filings/0001637207-23-000034/plnt-20230607.htm",
		"size": false,
		"sec": "https://www.sec.gov/Archives/edgar/data/1637207/000163720723000034/plnt-20230607.htm"
	},
	*/
	if (filingObj["link"]) {
		filingObj.secUrl = `${secBaseUrl}${filingObj.sec}`
		filingObj.devLink = `${devBaseUrl}${filingObj.link.replace('?doc=', '?doc=./../ixviewer-2-getter/')}`

		// typical
		// https://www.sec.gov/ix?doc=https://www.sec.gov/Archives/edgar/data/4457/000000445723000052/uhal-20230331.htm
		// atypical
		// "https://www.sec.gov/ix?doc=https://www.sec.gov/Archives/edgar/data/880242/000143774923017042/blgo20230609_8k.htm",
		// "https://www.sec.gov/ix?doc=https://www.sec.gov/Archives/edgar/data/67716/000114036123027660/ny20009287x1_8k.htm",
		// "https://www.sec.gov/ix?doc=https://www.sec.gov/Archives/edgar/data/1409493/000115752323000928/a53410499.htm",

		// cik i.e. 4457
		const cikStart = filingObj.sec.substring(filingObj.sec.indexOf('data/') + 5)
		const cik = cikStart.substring(0, cikStart.indexOf('/'))
		filingObj.cik = cik

		// accessionNum i.e. 000000445723000052
		const accessionNumStart = filingObj.sec.substring(filingObj.sec.indexOf(cik) + cik.length + 1)
		const accessionNum = accessionNumStart.substring(0, accessionNumStart.indexOf('/'))
		filingObj.accessionNum = accessionNum

		// ticker i.e. uhal
		const restOfUrl = filingObj.sec.substring(filingObj.sec.indexOf(accessionNum) + accessionNum.length + 1)
		const isTypical = restOfUrl.includes('-')

		if (isTypical) {
			const ticker = restOfUrl.substring(0, restOfUrl.indexOf('-'))
			filingObj.ticker = ticker

			// dateString i.e. 20230331
			const dateStringStart = filingObj.sec.substring(filingObj.sec.indexOf(ticker) + ticker.length + 1)
			const dateString = dateStringStart.substring(0, dateStringStart.indexOf('.'))
			filingObj.dateString = dateString
		} else {
			filingObj.docString = restOfUrl.substring(0, restOfUrl.indexOf('.'))
		}

		// fact count must be acquired by scraping (cypress/e2e/scraping)

	} else {
		console.log(`no link on ${JSON.stringify(filingObj, null, '\t')}`)
	}

	return filingObj
}