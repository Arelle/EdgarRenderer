const requestJsBundlePerHost = () => {
    let metalinksUrl
    switch (Cypress.env('domain')) {
        case 'local':
            cy.request('http://localhost:3000/ix-viewer.bundle.js')
            break
        case 'sec':
            const today = new Date()
            const day = today.getDate()
            const month = today.getMonth() + 1
            const year = today.getFullYear()
            cy.request(`https://www.sec.gov/ixviewer/js/production.min.js?d=${day}-${month}-${year}`).then(resp => {
                expect(resp.status).to.equal(200)
            })
            break
        case 'testSec':
            cy.request('http://localhost:3000/ix-viewer.bundle.js')
            break
        case 'dev1':
            cy.request('http://localhost:3000/ix-viewer.bundle.js')
            break
        case 'dev2':
            cy.request('http://localhost:3000/ix-viewer.bundle.js')
            break
        default:
            cy.request('http://localhost:3000/ix-viewer.bundle.js')
            break
    }
}

describe('Font CSS JS requests', () => {
    it('js file should load', () => {
        requestJsBundlePerHost()
    })

    it('app.css', () => {
        cy.request(`https://www.sec.gov/ixviewer/js/css/app.css`).then(resp => {
            cy.log(resp)
            expect(resp.status).to.equal(200)
        })
    })

    it('font fa-solid-900', () => {
        cy.request(`https://www.sec.gov/ixviewer/js/lib/fontawesome/webfonts/fa-solid-900.woff2`).then(resp => {
            cy.log(resp)
            expect(resp.status).to.equal(200)
        })
    })
})