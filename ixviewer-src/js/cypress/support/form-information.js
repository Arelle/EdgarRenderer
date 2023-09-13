'use strict';

export
function formInformation ( env ) {
  
  describe('Main Menu', function ( ) {
    
    it('Open', function ( ) {
      cy.get('[data-test="menu-dropdown-link"]').click();
      cy.get('[data-test="menu-dropdown-link"] + .dropdown-menu').children().should('have.length', 7);
    });
  });
  
  describe('Company and Document Dynamic Content', function ( ) {
    
    it('Modal Title', function ( ) {
      cy.get('[data-test="menu-dropdown-information"]').click();
      cy.get('[data-test="form-information-modal"]').should('be.visible');
      cy.get('[data-test="form-information-modal-title"]').should('have.text', 'Company and Document');
    });
    
    it('Company Name', function ( ) {
      cy.get('[data-test="form-information-modal"] [data-name="Company Name"]').should('have.text',
          Cypress.env()[env]['menu-information']['company']['name']);
    });
    
    it('Central Index key', function ( ) {
      cy.get('[data-test="form-information-modal"] [data-name="Central Index Key"]').should('have.text',
          Cypress.env()[env]['menu-information']['company']['cik']);
    });
    
    it('Document Type', function ( ) {
      cy.get('[data-test="form-information-modal"] [data-name="Document Type"]').should('have.text',
          Cypress.env()[env]['menu-information']['company']['document']);
    });
    
    it('Period End Date', function ( ) {
      cy.get('[data-test="form-information-modal"] [data-name="Period End Date"]').should('have.text',
          Cypress.env()[env]['menu-information']['company']['period']);
    });
    
    it('Fiscal Year/Period Focus', function ( ) {
      cy.get('[data-test="form-information-modal"] [data-name="Fiscal Year/Period Focus"]').should('have.text',
          Cypress.env()[env]['menu-information']['company']['fiscal']);
    });
    
    it('Current Fiscal Year End', function ( ) {
      cy.get('[data-test="form-information-modal"] [data-name="Current Fiscal Year End"]').should('have.text',
          Cypress.env()[env]['menu-information']['company']['fiscal-end']);
    });
    
    it('Amendment/Description', function ( ) {
      cy.get('[data-test="form-information-modal"] [data-name="Amendment/Description"]').should('have.text',
          Cypress.env()[env]['menu-information']['company']['amendment']);
    });
    
  });
  
  describe('Tags Dynamic Content', function ( ) {
    
    it('Modal Title', function ( ) {
      cy.get('[data-test="form-information-next"]').click();
      cy.get('[data-test="form-information-modal"]').should('be.visible');
      cy.get('[data-test="form-information-modal-title"]').should('have.text', 'Tags');
    });
    
    it('Total Facts', function ( ) {
      
      cy.get('[data-test="form-information-modal"] [data-name="Total Facts"]').should('have.text',
          Cypress.env()[env]['menu-information']['tags']['total-facts']);
    });
    
    it('Inline Version', function ( ) {
      cy.get('[data-test="form-information-modal"] [data-name="Inline Version"]').should('have.text',
          Cypress.env()[env]['menu-information']['tags']['version']);
    });
    
    it('Primary', function ( ) {
      
      cy.get('[data-test="form-information-modal"] [data-name="Primary-0"]').should('have.text',
          Cypress.env()[env]['menu-information']['tags']['primary'][0]);
      
      cy.get('[data-test="form-information-modal"] [data-name="Primary-1"]').should('have.text',
          Cypress.env()[env]['menu-information']['tags']['primary'][1]);
      
      cy.get('[data-test="form-information-modal"] [data-name="Primary-2"]').should('have.text',
          Cypress.env()[env]['menu-information']['tags']['primary'][2]);
      
      cy.get('[data-test="form-information-modal"] [data-name="Primary-3"]').should('have.text',
          Cypress.env()[env]['menu-information']['tags']['primary'][3]);
      
      cy.get('[data-test="form-information-modal"] [data-name="Primary-4"]').should('have.text',
          Cypress.env()[env]['menu-information']['tags']['primary'][4]);
      
    });
    
    it('Axis', function ( ) {
      
      cy.get('[data-test="form-information-modal"] [data-name="Axis-0"]').should('have.text',
          Cypress.env()[env]['menu-information']['tags']['axis'][0]);
      
      cy.get('[data-test="form-information-modal"] [data-name="Axis-1"]').should('have.text',
          Cypress.env()[env]['menu-information']['tags']['axis'][1]);
      
      cy.get('[data-test="form-information-modal"] [data-name="Axis-2"]').should('have.text',
          Cypress.env()[env]['menu-information']['tags']['axis'][2]);
      
      cy.get('[data-test="form-information-modal"] [data-name="Axis-3"]').should('have.text',
          Cypress.env()[env]['menu-information']['tags']['axis'][3]);
      
      cy.get('[data-test="form-information-modal"] [data-name="Axis-4"]').should('have.text',
          Cypress.env()[env]['menu-information']['tags']['axis'][4]);
    });
    
    it('Member', function ( ) {
      
      cy.get('[data-test="form-information-modal"] [data-name="Member-0"]').should('have.text',
          Cypress.env()[env]['menu-information']['tags']['member'][0]);
      
      cy.get('[data-test="form-information-modal"] [data-name="Member-1"]').should('have.text',
          Cypress.env()[env]['menu-information']['tags']['member'][1]);
      
      cy.get('[data-test="form-information-modal"] [data-name="Member-2"]').should('have.text',
          Cypress.env()[env]['menu-information']['tags']['member'][2]);
      
      cy.get('[data-test="form-information-modal"] [data-name="Member-3"]').should('have.text',
          Cypress.env()[env]['menu-information']['tags']['member'][3]);
      
      cy.get('[data-test="form-information-modal"] [data-name="Member-4"]').should('have.text',
          Cypress.env()[env]['menu-information']['tags']['member'][4]);
    });
    
    it('Total', function ( ) {
      
      cy.get('[data-test="form-information-modal"] [data-name="Total-0"]').should('have.text',
          Cypress.env()[env]['menu-information']['tags']['total'][0]);
      
      cy.get('[data-test="form-information-modal"] [data-name="Total-1"]').should('have.text',
          Cypress.env()[env]['menu-information']['tags']['total'][1]);
      cy.get('[data-test="form-information-modal"] [data-name="Total-2"]').should('have.text',
          Cypress.env()[env]['menu-information']['tags']['total'][2]);
      
      cy.get('[data-test="form-information-modal"] [data-name="Total-3"]').should('have.text',
          Cypress.env()[env]['menu-information']['tags']['total'][3]);
      
      cy.get('[data-test="form-information-modal"] [data-name="Total-4"]').should('have.text',
          Cypress.env()[env]['menu-information']['tags']['total'][4]);
    });
  });
  
  describe('Files Dynamic Content', function ( ) {
    it('Modal Title', function ( ) {
      cy.get('[data-test="form-information-next"]').click();
      cy.get('[data-test="form-information-modal"]').should('be.visible');
      cy.get('[data-test="form-information-modal-title"]').should('have.text', 'Files');
    });
    
    it('Inline Document', function ( ) {
      Cypress.env()[env]['menu-information']['files']['inline'].forEach(function ( current, index ) {
        cy.get('[data-test="form-information-modal"] [data-name="Inline Document-' + index + '"]').should('have.text',
            current);
        
      });
    });
    
    it('DOW Schema', function ( ) {
      Cypress.env()[env]['menu-information']['files']['schema'].forEach(function ( current, index ) {
        cy.get('[data-test="form-information-modal"] [data-name="DOW Schema-' + index + '"]').should('have.text',
            current);
      });
    });
    
    it('DOW Label', function ( ) {
      Cypress.env()[env]['menu-information']['files']['label'].forEach(function ( current, index ) {
        cy.get('[data-test="form-information-modal"] [data-name="DOW Label-' + index + '"]').should('have.text',
            current);
      });
    });
    
    it('DOW Calculation', function ( ) {
      Cypress.env()[env]['menu-information']['files']['calc'].forEach(function ( current, index ) {
        cy.get('[data-test="form-information-modal"] [data-name="DOW Calculation-' + index + '"]').should('have.text',
            current);
      });
    });
    
    it('DOW Presentation', function ( ) {
      Cypress.env()[env]['menu-information']['files']['pre'].forEach(function ( current, index ) {
        cy.get('[data-test="form-information-modal"] [data-name="DOW Presentation-' + index + '"]').should('have.text',
            current);
      });
    });
    
    it('DOW Definition', function ( ) {
      Cypress.env()[env]['menu-information']['files']['def'].forEach(function ( current, index ) {
        cy.get('[data-test="form-information-modal"] [data-name="DOW Definition-' + index + '"]').should('have.text',
            current);
      });
    });
  });
  
  describe('Additional Items Dynamic Content', function ( ) {
    it('Modal Title', function ( ) {
      cy.get('[data-test="form-information-next"]').click();
      cy.get('[data-test="form-information-modal"]').should('be.visible');
      cy.get('[data-test="form-information-modal-title"]').should('have.text', 'Additional Items');
    });
    
    it('Labels', function ( ) {
      Object.keys(Cypress.env()[env]['menu-information']['additional']).forEach(
          function ( current, index ) {
            cy.get('[data-test="form-information-modal"] [data-name="Additional Items Label-' + index + '"]').should(
                'have.text', current);
          });
    });
    
    it('Value', function ( ) {
      Object.values(Cypress.env()[env]['menu-information']['additional']).forEach(
          function ( current, index ) {
            cy.get('[data-test="form-information-modal"] [data-name="Additional Items Value-' + index + '"]').should(
                'have.text', current);
          });
    });
  });
  
  describe('Close Form Information Modal', function ( ) {
    it('Should Close', function ( ) {
      cy.get('[data-name="Form Information Modal"]').click();
      cy.get('[data-name="Form Information Modal"]').should('not.be.visible');
    });
  });
  
}
