import {
  formats
} from '../../support/formats';

describe('Unit Test Application Code', function() {

	  it('Should render IX Viewer', function() {
	    cy.visit(Cypress.config().baseUrl + '/ix-eer230-perf/WebContent/ixviewer/ix-dev.html');
	  });
	  
	  
	  
	  context('Full Format Testing', function() {

		    const objectOfFormats = formats();
		    Object.keys(objectOfFormats).forEach((currentFormat, index) => {
		      it('Testing: ' + currentFormat, function() {
		        cy.window().then(function(win) {

		          Object.keys(win).forEach((current, index) => {

		            if (current.startsWith('Filters')) {
		            	
		              Object.keys(win[current]).forEach((nestedCurrent, nestedIndex) => {

		                if (nestedCurrent.toLowerCase() === currentFormat) {
		                	
		                  // so we will want to do:
		                  // expect(win[current][nestedCurrent]({
		                  // 'innerText' : validInput
		                  // })).to.equal(validValue);
		                	
		                  Object.keys(objectOfFormats[currentFormat]['valid']).forEach((validValue) => {
		                    objectOfFormats[currentFormat]['valid'][validValue].forEach((validInput) => {
		                      expect(win[current][nestedCurrent]({
		                        'innerText': validInput
		                      })).to.equal(validValue);
		                    });
		                  });

		                  Object.keys(objectOfFormats[currentFormat]['invalid']).forEach((validValue) => {
		                    objectOfFormats[currentFormat]['invalid'][validValue].forEach((validInput) => {
		                      expect(win[current][nestedCurrent]({
		                        'innerText': validInput
		                      })).to.contains('Format Error:');
		                    });
		                  });
		                }
		              });
		            }
		          });
		        });
		      });
		    });


		  });
});