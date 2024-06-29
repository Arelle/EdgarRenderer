import { selectors } from "../../utils/selectors.mjs";

describe(`Menu open as zip`, () =>
{
    it("should download *something*", () =>
    {
        cy.visitFiling(null, "0000071691-23-000025", "nyt-20230928.htm");
        cy.get(selectors.menu).click();
        
        cy.get('a[data-test="form-information-zip"]').should('exist');

        cy.get('a[data-test="form-information-zip"]').invoke('attr', 'href').then(href =>
        {
            expect(href.endsWith("/0000071691-23-000025-xbrl.zip")).to.be.true;

            // cy.log('href', href);
            cy.request(href).then(response =>
            {
                // e.g. 
                // 'http://172.18.85.157:8082/ix3/ixviewer3/ix.xhtml?doc=../../ixdocs/WebContent/documents/0000071691-23-000025/nyt-20230928.htm'
                // '                                                     ../../ixdocs/WebContent/documents/0000071691-23-000025/00071691-2-3--000025-xbrl.zip'
                expect(response.status).to.eq(200);
            });
        });
    });
    
    it("should gracefully handle non-standard filing URLs", () =>
    {
        cy.visitFiling("wh-sections", "out", "sbsef03exq-20231231.htm");
        cy.get(selectors.menu).click();

        //check for Version because it's unlikely to get removed from Menu
        cy.get("#form-information-version").should('exist');
        cy.get('#form-information-version').invoke('text').should('not.equal', "");
    });
});