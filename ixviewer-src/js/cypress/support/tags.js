'use strict';

export
function tags ( env ) {
  describe('Tags Options', function ( ) {
    
    it('Open', function ( ) {
      
      cy.get('[data-test="nav-filter-tags"]').click();
      cy.get('[data-name="tags-dropdown"]').should('be.visible');
      cy.get('[data-test="current-filters-reset"]').should('not.be.visible');
    });
    
    it('Standard Only', function ( ) {
      
      cy.get('[name="tags-radios"]').check('1').should('be.checked');
      cy.get('[data-name="facts-menu"] .taxonomy-total-count').should('have.text', Cypress.env()[env]['tags'][0]);
      cy.get('[data-test="current-filters-reset"]').should('be.visible');
    });
    
    it('Custom Only', function ( ) {
      
      cy.get('[name="tags-radios"]').check('2').should('be.checked');
      cy.get('[data-name="facts-menu"] .taxonomy-total-count').should('have.text', Cypress.env()[env]['tags'][1]);
      cy.get('[data-test="current-filters-reset"]').should('be.visible');
    });
    
    it('Reset All Filters', function ( ) {
      
      cy.get('[data-name="current-filters-reset"]').click();
      cy.get('[data-test="current-filters-reset"]').should('not.be.visible');
    });
  });
}
