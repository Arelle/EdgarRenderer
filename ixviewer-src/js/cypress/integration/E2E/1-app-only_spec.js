describe('Initial Render, no Params', function ( ) {
  it('Should render IX Viewer', function ( ) {
    cy.visit(Cypress.config().baseUrl);
  });
  
  describe('Navbar', function ( ) {
    it('Is visible', function ( ) {
      cy.get('[data-test="main-navbar"]').should('be.visible');
    });
  });
  
  describe('Navbar Actions are disabled', function ( ) {
    
    it('Menu', function ( ) {
      cy.get('[data-test="menu-dropdown-link"]').should('be.visible').should('have.class', 'disabled');
    });
    
    it('Sections', function ( ) {
      cy.get('[data-test="sections-dropdown-link"]').should('be.visible').should('have.class', 'disabled');
    });
    
    it('Search Bar', function ( ) {
      cy.get('[data-test="global-search-form"]').should('be.visible').should('have.class', 'disabled');
    });
    
    it('Data', function ( ) {
      cy.get('[data-test="nav-filter-data"]').should('be.visible').should('have.class', 'disabled');
    });
    
    it('Tags', function ( ) {
      cy.get('[data-test="nav-filter-tags"]').should('be.visible').should('have.class', 'disabled');
    });
    
    it('More Filters', function ( ) {
      cy.get('[data-test="nav-filter-more"]').should('be.visible').should('have.class', 'disabled');
    });
    
    it('Sections', function ( ) {
      cy.get('[data-test="nav-filter-sections"]').should('be.visible').should('have.class', 'disabled');
    });
    
    it('Links', function ( ) {
      cy.get('[data-test="links-dropdown"]').should('have.class', 'd-none');
    });
    
    it('Facts', function ( ) {
      cy.get('[data-test="facts-menu"]').should('be.visible').should('have.class', 'disabled').contains(0);
    });
  });
  
  describe('Major Fail', function ( ) {
    it('Is visible', function ( ) {
      cy.get('[data-test="error-container"] .alert-danger').should('be.visible').contains(
          'Inline XBRL requires a URL param (doc | file) that coorelates to a Financial Report.');
    });
  });
});
