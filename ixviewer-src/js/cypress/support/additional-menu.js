'use strict';

export
function additionalMenu ( env ) {
  
  describe('Main Menu', function ( ) {
    
    it('Open', function ( ) {
      cy.get('[data-test="menu-dropdown-link"]').click();
      cy.get('[data-test="menu-dropdown-link"] + .dropdown-menu').children().should('have.length', 6);
    });
  });
  
  describe('Save XBRL Instance', function ( ) {
    
    it('Correct HREF', function ( ) {
      cy.get('[data-test="form-information-instance"]').should('have.attr', 'href');
      cy.get('[data-test="form-information-instance"]').should('have.attr', 'href').and('be',
          Cypress.env()[env]['xbrl-instance']);
    });
  });
  
  describe('Save XBRL Zip File', function ( ) {
    
    it('Correct HREF', function ( ) {
      cy.get('[data-test="form-information-zip"]').should('have.attr', 'href');
      cy.get('[data-test="form-information-zip"]').should('have.attr', 'href')
          .and('be', Cypress.env()[env]['xbrl-zip']);
    });
  });
  
  describe('Open as HTML', function ( ) {
    
    it('Correct HREF', function ( ) {
      cy.get('[data-test="form-information-html"]').should('have.attr', 'href');
      cy.get('[data-test="form-information-html"]').should('have.attr', 'href').and('be', Cypress.env()[env]['html']);
    });
  });
  
  describe('Settings', function ( ) {
    
    it('TODO TODO', function ( ) {
      // TODO
      // cy.get('#form-information-html').should('have.attr', 'href');
      // cy.get('#form-information-html').should('have.attr', 'href').and('be',
      // Cypress.env()[env]['html']);
    });
  });
  
  describe('Help', function ( ) {
    
    it('Open', function ( ) {
      cy.get('[data-test="help-menu"]').should('not.be.visible');
      cy.get('[data-test="form-information-help"]').click();
      cy.get('[data-test="help-menu"]').should('be.visible');
      
    });
    it('Close', function ( ) {
      cy.get('[data-test="help-menu-close"]').click();
      cy.get('[data-test="help-menu"]').should('not.be.visible');
    });
    
  });
  
}
