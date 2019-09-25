'use strict';

export
function moreFilters (env) {
  describe('More Filters Options', function () {
    
    it('Open', function () {
      cy.get('[data-test="nav-filter-more"]').click();
      cy.get('[data-test="more-filters-form"]').should('be.visible');
      cy.get('[data-test="current-filters-reset"]').should('not.be.visible');
    });
    
    
    Object.keys(Cypress.env()[env]['more-filters']).forEach((current) => {
      it(current + ' badge count', function () {
        cy.get('[data-test="' + current + '"]').should('be.visible');
        cy.get('[data-test="' + current + '-count"]').should('have.text', Cypress.env()[env]['more-filters'][current]);
      });
    });
    
    it('Close', function () {
      cy.get('[data-test="nav-filter-more"]').click();
      cy.get('[data-test="more-filters-form"]').should('not.be.visible');
    });
  });
}
