'use strict';

import { loadApplication } from '../../support/load-application';
import { formInformation } from '../../support/form-information';
import { additionalMenu } from '../../support/additional-menu';
import { sections } from '../../support/sections';
import { globalSearch } from '../../support/global-search';
import { data } from '../../support/data';
import { tags } from '../../support/tags';
import { moreFilters } from '../../support/more-filters';
import { facts } from '../../support/facts';


Object.keys(Cypress.env()).forEach(
    function (currentEnvironment) {
      
      describe('Render, Dynamic Params for ' + currentEnvironment.toUpperCase(), function () {
        
        before(function () {
          cy.visit(Cypress.config().baseUrl + Cypress.env()[currentEnvironment]['url']);
        });
        
        loadApplication(currentEnvironment);
                
        formInformation(currentEnvironment);
        
        additionalMenu(currentEnvironment);
       
        sections(currentEnvironment);
        
        globalSearch(currentEnvironment);
        
        data(currentEnvironment);
          
        tags(currentEnvironment);
        
        moreFilters(currentEnvironment);
        
        facts(currentEnvironment);
        
      });
    });
