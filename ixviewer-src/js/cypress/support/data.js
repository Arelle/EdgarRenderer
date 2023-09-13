'use strict';

export
function data ( env ) {
  describe('Data Options', function ( ) {
    
    it('Open', function ( ) {
      cy.get('[data-test="nav-filter-data"]').click();
      cy.get('[data-name="data-dropdown"]').should('be.visible');
      cy.get('[data-test="current-filters-reset"]').should('not.be.visible');
    });
    
    it('Amounts Only', function ( ) {
      cy.get('[name="data-radios"]').check('1').should('be.checked');
      cy.get('[data-test="facts-menu"] .taxonomy-total-count').should('have.text', Cypress.env()[env]['data'][0]);
      cy.get('[data-test="current-filters-reset"]').should('be.visible');
    });
    
    it('Text Only', function ( ) {
      cy.get('[name="data-radios"]').check('2').should('be.checked');
      cy.get('[data-test="facts-menu"] .taxonomy-total-count').should('have.text', Cypress.env()[env]['data'][1]);
      cy.get('[data-test="current-filters-reset"]').should('be.visible');
    });
    
    it('Calculations Only', function ( ) {
      cy.get('[name="data-radios"]').check('3').should('be.checked');
      cy.get('[data-test="facts-menu"] .taxonomy-total-count').should('have.text', Cypress.env()[env]['data'][2]);
      cy.get('[data-test="current-filters-reset"]').should('be.visible');
    });
    
    it('Negatives Only', function ( ) {
      cy.get('[name="data-radios"]').check('4').should('be.checked');
      cy.get('[data-test="facts-menu"] .taxonomy-total-count').should('have.text', Cypress.env()[env]['data'][3]);
      cy.get('[data-test="current-filters-reset"]').should('be.visible');
    });
    
    it('Additional Items Only', function ( ) {
      cy.get('[name="data-radios"]').check('5').should('be.checked');
      cy.get('[data-test="facts-menu"] .taxonomy-total-count').should('have.text', Cypress.env()[env]['data'][4]);
      cy.get('[data-test="current-filters-reset"]').should('be.visible');
    });
    
    it('Reset All Filters', function ( ) {
      cy.get('[data-name="current-filters-reset"]').click();
      cy.get('[data-test="facts-menu"] .taxonomy-total-count').should('have.text', Cypress.env()[env]['fact-count']);
      cy.get('[data-test="current-filters-reset"]').should('not.be.visible');
      
    });
  });
}
