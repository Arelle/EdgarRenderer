import filings from '../../../fixtures/filings/index.json'

const filing = Object.values(filings)[0];
describe(`6. Search Facts => ${filing.name} - ${filing.form}`, () => {
    beforeEach(() => {
        cy.visit(`http://localhost:3000/ix.xhtml?doc=${filing.local[0].replace(`./src`, `.`)}`);
        // not in love with just waiting as long as possible, but alas (AKA 100 seconds)
        cy.get(`#xbrl-form-loading`, { timeout: 100000 }).should(`not.be.visible`);
    });
    it('should show menu', () => {
        cy.get(`[data-name="global-search-options"]`).click();
        cy.get(`[data-name="global-search-options"] + .dropdown-menu`).should(`be.visible`);
    });

    it('should hide menu', () => {
        cy.get(`[data-name="global-search-options"]`).click();
        cy.get(`[data-name="global-search-options"] + .dropdown-menu`).not(`be.visible`);
    });

    it('should input text', () => {
        cy.get(`#global-search`).type(`smoke test`);
        cy.get(`#global-search`).should(`have.value`, `smoke test`);
    });

    it('should clear input text', () => {
        cy.get(`#global-search`).type(`smoke test`);
        cy.get(`#search-btn-clear`).click();
        cy.get(`#global-search`).should(`have.value`, ``);
    });
});
