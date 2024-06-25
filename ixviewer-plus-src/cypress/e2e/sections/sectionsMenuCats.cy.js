import { selectors } from '../../utils/selectors'

describe(`Menu Categories`, () => {
    it(`should be listed only once per instance`, () => {
        cy.visitFiling("1045609", "000095017024015979", `pld-20230331.htm`);

        // open sections sidebar
        cy.get(selectors.sectionsHeader).click();

        cy.get('div[id="instance-body-sectionDoc-10-Q"]').find('[id^="sectionDoc-10-Q--"]')
            .should('have.length', 6);
    });
});
