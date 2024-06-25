import { filings } from '../../dataPlus/enrichedFilingsPlus'
import { selectors } from '../../utils/selectors'

let filingsSample = filings;
if (Cypress.env('limitNumOfFilingsForTestRun')) {
    filingsSample = filings.slice(60, Cypress.env('limitOfFilingsToTest') + 60);
}

const multidocFilings = filings.filter(f => f.hasOwnProperty('cases') && f.cases.includes('multi-doc'));
// e.g. http://localhost:3000/ix.xhtml?doc=/Archives/edgar/data/0001013762-23-000425/ea185980ex99-1_inspiratech.htm

describe(`Sections Links to different instance`, () => {
    // expected conditions depend on filing, so best to test specific filings
    // for example menuCat be be expanded or collapsed depending on number links contained.
    // clicking links too close to bottom of page will not result in a scroll, so change in position is not mandatory, but should be >=
    // however testing scroll has proved unreliable with Cypress... (see inline pagination tests.)
    it(`should change instances`, () => {
        cy.visitFiling("wh-sections", "out", `sbsef03exc-20231231.htm`);
        cy.get(selectors.sectionsHeader).click();

        // open exd instance section accordion
        cy.get('[id="instance-header-sectionDoc-EX-99-D-SBSEF"]').click();

        // click first section link in exd
        cy.get('li[order="3"]').click();

        // check instance name on tab
        cy.get(selectors.docTab0)
            .should('contain.text', 'sbsef03exd-20231231.htm');
    })
})

describe(`Sections Links multi doc`, () => {
    multidocFilings.forEach((filing) => {
        it(`${filing.ticker || filing.docName} ${filing.formType}`, () => {
            cy.visitHost(filing)
            cy.get(selectors.sectionsHeader).click()

            // first doc tab is active
            cy.get(selectors.docTab0).should('have.class', 'active');
            cy.get(selectors.docTab1).should('not.have.class', 'active');

            // click section link in ex99-1 doc
            cy.get('li.section-link[order="2"]').click();
            cy.get(selectors.docTab0).should('not.have.class', 'active');
            cy.get(selectors.docTab1).should('have.class', 'active');

            //This is a very specific condition, so I don't think it belongs in a general test
            // cy.location('search').should('contain', 'ea185980ex99-1_inspiratech')
        })
    })
})

describe("Section Links link to the correct fact/section", () => {
    filingsSample.forEach((filing) => {
        it(`${filing.ticker || filing.docName} ${filing.formType} - general`, () => {
            cy.visitHost(filing);
            cy.get(selectors.sectionsHeader).click({ timeout: 17500 });

            //Open all the closed Sections (if any)
            if (Cypress.$("menu-cat-header button .fa-chevron-right").length > 0) {
                cy.get("menu-cat-header button .fa-chevron-right").each((button) => {
                    cy.get(button).click();
                });
            }

            let itemCount = 0;
            cy.get(selectors.sectionsLinks).each((link) => {
                itemCount++;

                //This test can get super slow/laggy, so don't check every single Section Link
                if (itemCount < 10 || Math.random() * 100 > itemCount + 25)
                    cy.get(link).invoke("attr", "fact-id").then(id => {
                        cy.get(link).click();

                        //Some Cover sections have no Fact ID and link to the top of the page
                        if (id != null)
                            cy.get(`#${id}`).should("satisfy", Cypress.dom.isVisible);

                        //Should not get an error
                        //Note: the third link in /Archives/edgar/data/no-cik/0001013762-23-000456/fs42023a1_poweranddig2.htm
                        //  fails this check, but that seems to be an issue with the filing and not with IX Viewer
                        if (Cypress.$(".alert.alert-danger").length > 0) {
                            cy.get(".alert.alert-danger button").click();
                            cy.fail("An error should not occur when clicking on a Section");
                        }
                    });
            });
        });
    });
});

describe("Section Links link to the correct fact/section", () => {
    it(`for sbsef multi-instance`, () => {
        cy.visitFiling("wh-sections", "out", `sbsef03exc-20231231.htm`);
        cy.get(selectors.sectionsHeader).click({ timeout: 17500 });

        //Open all the closed Instances (if any)
        cy.get(".accordion-item.section-not-active").each((button) => {
            cy.get(button).click();
        });

        //Open all the closed Sections (if any)
        if (Cypress.$("menu-cat-header button .fa-chevron-right").length > 0) {
            cy.get("menu-cat-header button .fa-chevron-right").each((button) => {
                cy.get(button).click();
            });
        }

        let itemCount = 0;
        cy.get(selectors.sectionsLinks).each((link) => {
            itemCount++;

            cy.get(link).invoke("attr", "inline-fact-selector").then(factSelector => {
                cy.get(link).click();

                //Some Cover sections have no Fact ID and link to the top of the page
                if (factSelector != null) {
                    cy.get(`${factSelector}`).should("satisfy", Cypress.dom.isVisible);
                }

                //Should not get an error
                //Note: the third link in /Archives/edgar/data/no-cik/0001013762-23-000456/fs42023a1_poweranddig2.htm
                //  fails this check, but that seems to be an issue with the filing and not with IX Viewer
                else if (Cypress.$(".alert.alert-danger").length > 0) {
                    cy.get(".alert.alert-danger button").click();
                    cy.fail("An error should not occur when clicking on a Section");
                }
            });
        });
    });
});
