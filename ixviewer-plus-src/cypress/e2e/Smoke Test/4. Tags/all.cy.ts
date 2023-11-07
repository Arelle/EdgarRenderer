import filings from '../../../fixtures/filings/index.json'

Object.values(filings).forEach((filing, index) => {
    describe(`${index + 1} => ${filing.name} - ${filing.form}`, () => {
        beforeEach(() => {
            cy.visit(`http://localhost:3000/ix.xhtml?doc=${filing.local[0].replace(`./src`, `.`)}`);
            // not in love with just waiting as long as possible, but alas (AKA 100 seconds)
            cy.get(`#xbrl-form-loading`, { timeout: 100000 }).should(`not.be.visible`);
        });
        it('should show menu', () => {
            cy.get(`#nav-filter-tags`).click();
            cy.get(`#nav-filter-tags + .dropdown-menu`).should(`be.visible`);
        });

        it('should hide menu', () => {
            cy.get(`#nav-filter-tags`).click();
            cy.get(`#nav-filter-tags + .dropdown-menu`).not(`be.visible`);
        });
    });
});
