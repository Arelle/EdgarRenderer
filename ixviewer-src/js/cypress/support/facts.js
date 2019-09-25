'use strict';

export
function facts ( env ) {
  describe('Facts', function ( ) {
    
    it('Open', function ( ) {
      cy.get('[data-test="facts-menu"]').click();
      cy.get('[data-test="taxonomies-menu"]').should('be.visible');
      cy.window().then((win) => {
        cy.spy(win.console, 'error');
      });
    });
       
    var numberOfFacts = parseFloat(Cypress.env()[env]['fact-count'].replace(/,/g, ''));
    for(let i = 0; i < numberOfFacts; i++) { 
      it('Press Next ' + (i+1), function ( ) {
        cy.get('[data-test="next-taxonomy"]').click();
      });
      it('Go through all slides', function ( ) {
        for(let k = 0; k < 3; k++) {
          cy.get('[data-test="modal-taxonomy-next"]').click();
        }
      });
    }
    
    it('Close', function ( ) {
      cy.get('[data-test="taxonomy-secondary-toggle"]').click();
      cy.get('[data-test="taxonomies-menu"]').should('not.be.visible');
    });
  });
}
