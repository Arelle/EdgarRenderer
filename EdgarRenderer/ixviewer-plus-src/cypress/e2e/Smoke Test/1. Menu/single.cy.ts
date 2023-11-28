import filings from '../../../fixtures/filings/index.json'

const filing = Object.values(filings)[0];
describe(`1. Menu => ${filing.name} - ${filing.form}`, () => {
    beforeEach(() => {
        cy.visit(`http://localhost:3000/ix.xhtml?doc=${filing.local[0].replace(`./src`, `.`)}`);
        // not in love with just waiting as long as possible, but alas (AKA 100 seconds)
        cy.get(`#xbrl-form-loading`, { timeout: 100000 }).should(`not.be.visible`);
    });
    it('should show menu dropdown', () => {

        cy.get(`#menu-dropdown-link`).click();
        cy.get(`#menu-dropdown-link + .dropdown-menu`).should(`be.visible`);
    });

    it('should hide menu dropdown', () => {
        cy.get(`#menu-dropdown-link`).click();
        cy.get(`#menu-dropdown-link + .dropdown-menu`).not(`be.visible`);
    });
});
