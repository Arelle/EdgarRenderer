'use strict';

export
function loadApplication ( env ) {
  describe('Loading Application', function ( ) {
    it('Loading', function ( ) {
      
      cy.get('[data-test="xbrl-form-loading"]').should('be.visible');
      
      cy.get('[data-test="facts-menu"] .taxonomy-total-count .fa-spin').should('be.visible');
      
    });
  });
  
  describe('Loading Accomplished', function ( ) {
    it('No Loading Bar', function ( ) {
      cy.get('[data-test="xbrl-form-loading"]').should('not.be.visible');
    });
  });
  
  describe('Quick Sanity Checks', function ( ) {
    
    it('Fact Count in Navbar', function ( ) {
      cy.get('[data-test="facts-menu"] .taxonomy-total-count').should('have.text', Cypress.env()[env]['fact-count']);
    });
    
    it('Links Dropdown exists', function ( ) {
      if ( Cypress.env()[env]['links-dropdown-options'].length > 0 ) {
        cy.get('[data-test="links-dropdown"]').should('be.visible');
        // TODO make sure the array list is the same as the HTML options
      }
      else {
        cy.get('[data-test="links-dropdown"]').should('not.be.visible');
      }
    });
  });
}
