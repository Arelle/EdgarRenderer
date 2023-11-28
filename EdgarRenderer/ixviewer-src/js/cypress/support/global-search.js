'use strict';

export
function globalSearch (env) {
  describe('Search Options', function () {
    
    it('Open', function () {
      cy.get('[data-name="global-search-options"]').click();
      cy.get('[name="search-options"]').should('be.visible');
    });
    
    it('Turn all options ON', function () {
      cy.get('[data-test="global-search-form"] [name="search-options"]').each((element) => {
        cy.wrap(element).check().should('be.checked');
      });
    });
    
    it('Close', function () {
      cy.get('[data-name="global-search-options"]').click();
      cy.get('[name="search-options"]').should('not.be.visible');
    });
    
  });
  
  describe('Dynamic Search Terms', function () {
    Object.keys(Cypress.env()[env]['global-search']).forEach((current) => {
      it('Search: ' + current, function () {
        cy.get('[data-name="global-search-clear"]').click();
        cy.get('[data-test="global-search"]').type(current);
        cy.get('[data-test="global-search-form"]').submit();
        cy.get('[data-test="facts-menu"] .taxonomy-total-count').should('have.text', Cypress.env()[env]['global-search'][current]);
      });
    });
  });
  
  describe('Reset Global Search', function () {
    it('Reset', function () {
      cy.get('[data-name="global-search-clear"]').click();
    });
    it('Fact Count', function () {
      cy.get('[data-test="facts-menu"] .taxonomy-total-count').should('have.text', Cypress.env()[env]['fact-count']);
    });
  });
  
}