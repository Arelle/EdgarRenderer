'use strict';

import { loadApplication } from '../../support/load-application';

Object.keys(Cypress.env()).forEach(

function( currentEnvironment ) {
  
  describe('Render, Dynamic Params for ' + currentEnvironment.toUpperCase(), function( ) {
    
    before(function( ) {
      cy.visit(Cypress.config().baseUrl + Cypress.env()[currentEnvironment]['url']);
    });
    
    loadApplication(currentEnvironment);
    
  });
});
