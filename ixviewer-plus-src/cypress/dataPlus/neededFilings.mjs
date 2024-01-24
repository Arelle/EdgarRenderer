export let neededFilings = [
    {
        docUrl: 'https://www-test.sec.gov/ix.xhtml?doc=/Archives/edgar/data/350001/000035000123903824/GLM4gd-F-SR20081231.htm',
        folderUrl: 'https://www-test.sec.gov/Archives/edgar/data/350001/000035000123903824/',
        label: 'Redline F-SR',
    },
    {
        docUrl: 'https://www.sec.gov/ix?doc=/Archives/edgar/data/1927719/000141057823002103/crgo-20230630x6k.htm',
        label: '6-K Multi',
    },
    {
        docUrl: 'https://www.sec.gov/ix?doc=/Archives/edgar/data/1338940/000117891323003166/zk2330289.htm',
        label: '6-k big',
    },
    {
        docUrl: 'https://www-test.sec.gov/ix.xhtml?doc=/Archives/edgar/data/1314612/000131461219000089/a4q18doc10k.htm',
        label: '10-k very big',
    },
    {
        docUrl: 'https://www-test.sec.gov/ix.xhtml?doc=/Archives/edgar/data/1314610/000035000123800979/e60520006gd-20340331.htm',
        label: 'EX-26',
    },
    {
        docUrl: 'https://www-test.sec.gov/cgi-bin/viewer?action=view&cik=1314610&accession_number=0000350001-23-801056&xbrl_type=v',
        label: '2.01 SD	',
    },
]

let neededFilingsEnriched = []
neededFilings.forEach(filing => {
    let folderUrl = filing.docUrl.replace('ix.xhtml?doc=/', '')
    let lastSlash = folderUrl.lastIndexOf('/')
    folderUrl = folderUrl.substring(0, lastSlash)
    filing.folderUrl = folderUrl
    console.log('filing', filing)
    neededFilingsEnriched.push(filing)
})

console.log('neededFilingsEnriched', neededFilingsEnriched)