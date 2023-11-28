'use strict';

export
function sections (env) {
  
  function checkAccordionTitlesAndCounts(inputObject) {
    describe('Correct Accordion Titles and Counts', () => {
      Object.keys(inputObject).forEach((current, index) => {
      
        it(current, function () {
          if(inputObject[current] > 0) {
            cy.get('[data-test="tagged-sections-' + index + '"]').should('be.visible');
            cy.get('[data-test="tagged-sections-' + index + '"]').contains(current);
            cy.get('[data-test="tagged-sections-' + index + '"] .badge').contains(inputObject[current]);
          } else {
            
            cy.get('[data-test="tagged-sections-' + index + '"]').should('not.be.visible');
          }

        });
      });
    });
    
  }
  
  describe('Sections Menu Open', function () {
    
    it('Open', function () {
      cy.get('[data-test="sections-menu"]').should('not.be.visible');
      cy.get('[data-test="sections-dropdown-link"]').click();
      cy.get('[data-test="sections-menu"]').should('be.visible');
    });
    checkAccordionTitlesAndCounts(Cypress.env()[env]['sections']['options']);
    
    Object.keys(Cypress.env()[env]['sections']['search']).forEach((current, index) => {
      describe('Search Functionality #' + (index+1), function () {
        it('Test Input "' + current + '"', function() {
          cy.get('[data-name="sections-menu-search-clear"]').click();
          cy.get('[data-test="sections-search"]').type(current);
          cy.get('[data-name="sections-menu-search"]').submit();
        });
        checkAccordionTitlesAndCounts(Cypress.env()[env]['sections']['search'][current]);
      });
    });
  });
  describe('Sections Menu Close', function () {
    it('Close', function () {
      cy.get('[data-test="sections-menu"]').should('be.visible');
      cy.get('[data-test="sections-dropdown-link"]').click();
      cy.get('[data-test="sections-menu"]').should('not.be.visible');
    });
  });
}
