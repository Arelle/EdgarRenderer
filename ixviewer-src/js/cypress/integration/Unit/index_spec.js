import {
  formats
} from '../../support/formats';

describe('Unit Test Application Code', function() {

  it('Should render IX Viewer', function() {
    cy.visit(Cypress.config().baseUrl + '/ix-eer230-perf/WebContent/ixviewer/refactor.html');
  });

  context('app/browser.js - Browser', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'Browser');
    });

    it('Browser is allowed', function() {
      cy.window().then(function(win) {
        win.Browser(function(response) {
          expect(response).to.equal(true);
        });
      });
    });
  });

  context('app/init.js - AppInit', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'AppInit');
    });

    it('init()', function() {

      cy.window().then(function(win) {

        win.AppInit.init('', function(response) {
          expect(response).to.equal(false);
        });

        win.AppInit.init(null, function(response) {
          expect(response).to.equal(false);
        });

        win.AppInit.init(123, function(response) {
          expect(response).to.equal(false);
        });

        win.AppInit.init(true, function(response) {
          expect(response).to.equal(false);
        });

        win.AppInit.init('"', function(response) {
          expect(response).to.equal(false);
        });

        win.AppInit.init('should-not-work.htm', function(response) {
          expect(response).to.equal(false);
        });

      });

    });

    it('initialSetup()', function() {

      cy.window().then(function(win) {

        expect(win.AppInit.initialSetup()).to.equal(undefined);

      });

    });

    it('additionalSetup()', function() {

      cy.window().then(function(win) {

        expect(win.AppInit.additionalSetup()).to.equal(undefined);

      });

    });

    it('emptySidebars()', function() {

      cy.window().then(function(win) {

        expect(win.AppInit.additionalSetup()).to.equal(undefined);

      });
    });

  });

  context('app/ajax/form.js - AjaxForm', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'AjaxForm');
    });

    it('init()', function() {

      cy.window().then(function(win) {

        win.AjaxForm.init(function(response) {
          expect(response).to.equal(false);
        });

      });

    });

  });

  context('app/ajax/meta.js - AjaxMeta', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'AjaxMeta');
    });

    it('init()', function() {

      cy.window().then(function(win) {

        win.AjaxMeta.init(function(response) {
          expect(response).to.equal(false);
        });

      });
    });

    it('setInstance()', function() {

      cy.window().then(function(win) {

        win.AjaxMeta.setInstance('', '', function(response) {
          expect(response).to.equal(false);
        });

      });
    });

  });

  context('app/constants/date.js - ConstantsDate', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'ConstantsDate');
    });

    it('getSakaYearPadding()', function() {

      cy.window().then(function(win) {

        expect(win.ConstantsDate.getSakaYearPadding(1921, 11, 11)).to.equal('1921');
        expect(win.ConstantsDate.getSakaYearPadding('1921', null,
          null)).to.equal('1921');
        expect(win.ConstantsDate.getSakaYearPadding(null, 0, 11)).to.equal(null);
        expect(win.ConstantsDate.getSakaYearPadding(true, 0, 11)).to.equal(null);
        expect(win.ConstantsDate.getSakaYearPadding({
          'test': true
        }, 0, 11)).to.equal(null);

      });
    });

    it('getSakaToGregorian()', function() {

      cy.window().then(function(win) {

        expect(win.ConstantsDate.getSakaToGregorian(1921, 10,
          11)).to.equal('2000-1-1');
        expect(win.ConstantsDate.getSakaToGregorian(1921, 11,
          11)).to.equal('2000-1-31');
        expect(win.ConstantsDate.getSakaToGregorian('1921', 11, 11)).to.equal(null);
        expect(win.ConstantsDate.getSakaToGregorian(1921, '11', 11)).to.equal(null);
        expect(win.ConstantsDate.getSakaToGregorian(1921, 11, '11')).to.equal(null);
        expect(win.ConstantsDate.getSakaToGregorian(null, 11, 11)).to.equal(null);
        expect(win.ConstantsDate.getSakaToGregorian(1921, null, 11)).to.equal(null);
        expect(win.ConstantsDate.getSakaToGregorian(1921, 11, null)).to.equal(null);
      });

    });

  });

  context('app/constants/index.js - Constants', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'Constants');
    });

    it('setHTMlAttributes()', function() {

      cy.window().then(function(win) {
        expect(win.Constants.setHTMlAttributes()).to.equal(null);
        expect(win.Constants.setHTMlAttributes([])).to.equal(null);
        expect(win.Constants.setHTMlAttributes([1])).to.equal(null);
        expect(win.Constants.setHTMlAttributes([1, 2])).to.equal(null);
        expect(win.Constants.setHTMlAttributes([1, 'html xmlns="http://www.w3.org/1999/xhtml"'])).to.equal(true);
      });
    });

    it('updateTaxonomyCount()', function() {

      cy.window().then(function(win) {

        expect(win.Constants.updateTaxonomyCount(true, true)).to.equal(0);
        expect(win.Constants.updateTaxonomyCount(true, false)).to.equal(0);
        expect(win.Constants.updateTaxonomyCount(false, true)).to.equal(0);
        expect(win.Constants.updateTaxonomyCount(false, false)).to.equal(0);
      });
    });

    it('loadingTaxonomyCount()', function() {

      cy.window().then(function(win) {
        win.Constants.loadingTaxonomyCount(function(response) {
          expect(response).to.equal(undefined);
        });

      });
    });

    it('setMetaSourceDocumentsThenFixLinks()', function() {

      cy.window().then(function(win) {

        expect(win.Constants.setMetaSourceDocumentsThenFixLinks(true)).to.equal(null);
        expect(win.Constants.setMetaSourceDocumentsThenFixLinks(123)).to.equal(null);
        expect(win.Constants.setMetaSourceDocumentsThenFixLinks({
          'test': 'should fail'
        })).to.equal(null);
        expect(win.Constants.setMetaSourceDocumentsThenFixLinks('should work')).to.equal(undefined);

      });

    });

    it('setHtmlPrefix()', function() {

      cy.window().then(function(win) {

        expect(win.Constants.setHtmlPrefix()).to.equal(undefined);

      });

    });

    it('setMetaTags()', function() {

      cy.window().then(function(win) {

        expect(win.Constants.setMetaTags()).to.equal(null);
        expect(win.Constants.setMetaTags(true)).to.equal(null);
        expect(win.Constants.setMetaTags(123)).to.equal(null);
        expect(win.Constants.setMetaTags('123')).to.equal(null);
        expect(win.Constants.setMetaTags([123])).to.equal(null);
        expect(win.Constants.setMetaTags({
          'test': {
            '123': true
          }
        })).to.equal(undefined);

      });
    });

    it('setMetaCalculationsParentTags()', function() {

      cy.window().then(function(win) {

        expect(win.Constants.setMetaCalculationsParentTags()).to.equal(undefined);

      });
    });

    it('setMetaEntityCounts()', function() {

      cy.window().then(function(win) {

        expect(win.Constants.setMetaEntityCounts()).to.equal(null);
        expect(win.Constants.setMetaEntityCounts(true)).to.equal(null);
        expect(win.Constants.setMetaEntityCounts(123)).to.equal(null);
        expect(win.Constants.setMetaEntityCounts('123')).to.equal(null);
        expect(win.Constants.setMetaEntityCounts([123])).to.equal(null);
        expect(win.Constants.setMetaEntityCounts({
          'test': {
            '123': true
          }
        })).to.equal(undefined);

      });
    });

    it('setMetaReports()', function() {

      cy.window().then(function(win) {

        expect(win.Constants.setMetaReports()).to.equal(null);
        expect(win.Constants.setMetaReports(true)).to.equal(null);
        expect(win.Constants.setMetaReports(123)).to.equal(null);
        expect(win.Constants.setMetaReports('123')).to.equal(null);
        expect(win.Constants.setMetaReports([123])).to.equal(null);
        expect(win.Constants.setMetaReports({
          'test': {
            '123': true
          }
        })).to.equal(undefined);

      });
    });

    it('setMetaStandardReference()', function() {

      cy.window().then(function(win) {

        expect(win.Constants.setMetaStandardReference()).to.equal(null);
        expect(win.Constants.setMetaStandardReference(true)).to.equal(null);
        expect(win.Constants.setMetaStandardReference(123)).to.equal(null);
        expect(win.Constants.setMetaStandardReference('123')).to.equal(null);
        expect(win.Constants.setMetaStandardReference([123])).to.equal(null);
        expect(win.Constants.setMetaStandardReference({
          'test': {
            '123': true
          }
        })).to.equal(undefined);

      });
    });

    it('getSingleMetaStandardReference()', function() {

      cy.window().then(function(win) {

        expect(win.Constants.getSingleMetaStandardReference()).to.equal(null);
        expect(win.Constants.getSingleMetaStandardReference(true)).to.equal(null);
        expect(win.Constants.getSingleMetaStandardReference(123)).to.equal(null);
        expect(win.Constants.getSingleMetaStandardReference([])).to.equal(null);
        expect(win.Constants.getSingleMetaStandardReference({
          'test': {
            '123': true
          }
        })).to.equal(null);
        expect(win.Constants.getSingleMetaStandardReference('123')).to.have.lengthOf(0);

      });
    });

    it('setMetaVersion()', function() {

      cy.window().then(function(win) {

        expect(win.Constants.setMetaVersion()).to.equal(null);
        expect(win.Constants.setMetaVersion(true)).to.equal(null);
        expect(win.Constants.setMetaVersion(123)).to.equal(null);
        expect(win.Constants.setMetaVersion([])).to.equal(null);
        expect(win.Constants.setMetaVersion({
          'test': {
            '123': true
          }
        })).to.equal(null);
        expect(win.Constants.setMetaVersion('123')).to.equal(null);

      });
    });

    it('setMetaCustomPrefix()', function() {

      cy.window().then(function(win) {

        expect(win.Constants.setMetaCustomPrefix()).to.equal(null);
        expect(win.Constants.setMetaCustomPrefix(true)).to.equal(null);
        expect(win.Constants.setMetaCustomPrefix(123)).to.equal(null);
        expect(win.Constants.setMetaCustomPrefix([])).to.equal(null);
        expect(win.Constants.setMetaCustomPrefix('123')).to.equal(null);
        expect(win.Constants.setMetaCustomPrefix({
          'nsprefix': '123'
        })).to.equal(undefined);

      });
    });

    it('setMetaDts()', function() {

      cy.window().then(function(win) {

        expect(win.Constants.setMetaDts()).to.equal(null);
        expect(win.Constants.setMetaDts(true)).to.equal(null);
        expect(win.Constants.setMetaDts(123)).to.equal(null);
        expect(win.Constants.setMetaDts([])).to.equal(null);
        expect(win.Constants.setMetaDts('123')).to.equal(null);
        expect(win.Constants.setMetaDts({
          'test': '123'
        })).to.equal(undefined);

      });

    });

    it('setMetaHidden()', function() {

      cy.window().then(function(win) {

        expect(win.Constants.setMetaHidden()).to.equal(null);
        expect(win.Constants.setMetaHidden(true)).to.equal(null);
        expect(win.Constants.setMetaHidden(123)).to.equal(null);
        expect(win.Constants.setMetaHidden([])).to.equal(null);
        expect(win.Constants.setMetaHidden('123')).to.equal(null);
        expect(win.Constants.setMetaHidden({
          'test': '123'
        })).to.equal(undefined);

      });
    });

    it('getMetaDocuments()', function() {
      cy.window().then(function(win) {

        expect(win.Constants.getMetaDocuments()).to.equal(null);
        expect(win.Constants.getMetaDocuments(true)).to.equal(null);
        expect(win.Constants.getMetaDocuments(123)).to.equal(null);
        expect(win.Constants.getMetaDocuments([])).to.equal(null);
        expect(win.Constants.getMetaDocuments({
          'test': '123'
        })).to.equal(null);

        expect(win.Constants.getMetaDocuments('1921')).to.equal(null);

      });
    });

  });
  context('app/constants/number.js - ConstantsNumber', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'ConstantsNumber');
    });

    it('getDevanagariDigitsToNormal()', function() {
      cy.window().then(function(win) {

        // expect(win.ConstantsNumber.getDevanagariDigitsToNormal()).to.equal(null);
        // expect(win.ConstantsNumber.getDevanagariDigitsToNormal(true)).to.equal(null);
        // expect(win.ConstantsNumber.getDevanagariDigitsToNormal(true)).to.equal(null);
        // expect(win.ConstantsNumber.getDevanagariDigitsToNormal(123)).to.equal(null);
    	  
        // expect(win.ConstantsNumber.getDevanagariDigitsToNormal([])).to.equal(null);

        expect(win.ConstantsNumber.getDevanagariDigitsToNormal('1921')).to.equal('1921');

      });
    });

  });

  context('app/errors/index.js - Errors', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'Errors');
    });

    it('checkPerformanceConcern()', function() {
      cy.window().then(function(win) {

        expect(win.Errors.checkPerformanceConcern()).to.equal(null);
        expect(win.Errors.checkPerformanceConcern(true)).to.equal(null);
        expect(win.Errors.checkPerformanceConcern(true)).to.equal(null);
        expect(win.Errors.checkPerformanceConcern('123')).to.equal(null);
        expect(win.Errors.checkPerformanceConcern([])).to.equal(null);
        expect(win.Errors.checkPerformanceConcern({
          'test': '123'
        })).to.equal(null);

        expect(win.Errors.checkPerformanceConcern(123)).to.equal(undefined);

      });
    });

    it('checkFileSizeForLimits()', function() {

      cy.window().then(function(win) {

        expect(win.Errors.checkFileSizeForLimits()).to.equal(null);
        expect(win.Errors.checkFileSizeForLimits(true)).to.equal(null);
        expect(win.Errors.checkFileSizeForLimits(123)).to.equal(null);
        expect(win.Errors.checkFileSizeForLimits([])).to.equal(null);
        expect(win.Errors.checkFileSizeForLimits({
          'test': '123'
        })).to.equal(null);

        expect(win.Errors.checkFileSizeForLimits('123')).to.equal(undefined);

      });
    });

    it('updateMainContainerHeight()', function() {

      cy.window().then(function(win) {

        expect(win.Errors.updateMainContainerHeight()).to.equal(undefined);

      });

    });

  });

  context('app/errors/major.js - ErrorsMajor', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'ErrorsMajor');
    });

    it('inactive()', function() {

      cy.window().then(function(win) {

        expect(win.ErrorsMajor.inactive()).to.equal(undefined);

      });
    });

    it('formLinksNotFound()', function() {

      cy.window().then(function(win) {

        expect(win.ErrorsMajor.formLinksNotFound()).to.equal(undefined);

      });
    });

    it('urlParams()', function() {

      cy.window().then(function(win) {

        expect(win.ErrorsMajor.urlParams()).to.equal(undefined);

      });
    });

  });

  context('app/errors/minor.js - ErrorsMinor', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'ErrorsMinor');
    });

    it('browserSuggestion()', function() {
      cy.window().then(function(win) {

        expect(win.ErrorsMinor.browserSuggestion()).to.equal(undefined);

      });
    });

    it('continuedAt()', function() {
      cy.window().then(function(win) {

        expect(win.ErrorsMinor.continuedAt()).to.equal(undefined);

      });
    });

    it('fileSize()', function() {
      cy.window().then(function(win) {

        expect(win.ErrorsMinor.fileSize()).to.equal(undefined);

      });
    });

    it('metaLinksNotFound()', function() {
      cy.window().then(function(win) {

        expect(win.ErrorsMinor.metaLinksNotFound()).to.equal(undefined);

      });
    });

    it('metaLinksInstance()', function() {
      cy.window().then(function(win) {

        expect(win.ErrorsMinor.metaLinksInstance()).to.equal(undefined);

      });
    });

  });

  context('app/filters/boolean.js - FiltersBoolean', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'FiltersBoolean');
    });

    it('booleanFalse()', function() {
      cy.window().then(function(win) {

        expect(win.FiltersBoolean.booleanFalse()).to.equal('false');

      });
    });

    it('booleanTrue()', function() {
      cy.window().then(function(win) {

        expect(win.FiltersBoolean.booleanTrue()).to.equal('true');

      });
    });

  });

  context('app/filters/contextref.js - FiltersContextref', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'FiltersContextref');
    });

    it('getDimensions()', function() {

      cy.window().then(function(win) {
        expect(win.FiltersContextref.getDimensions()).to.equal(null);
        expect(win.FiltersContextref.getDimensions(true)).to.equal(null);
        expect(win.FiltersContextref.getDimensions(123)).to.equal(null);
        expect(win.FiltersContextref.getDimensions([])).to.equal(null);
        expect(win.FiltersContextref.getDimensions({
          'test': '123'
        })).to.equal(null);

        expect(win.FiltersContextref.getDimensions('a123')).to.have.lengthOf(0);

      });
    });

    it('getAxis()', function() {

      cy.window().then(function(win) {
        expect(win.FiltersContextref.getAxis()).to.equal(null);
        expect(win.FiltersContextref.getAxis(true)).to.equal(null);
        expect(win.FiltersContextref.getAxis(123)).to.equal(null);
        expect(win.FiltersContextref.getAxis([])).to.equal(null);
        expect(win.FiltersContextref.getAxis({
          'test': '123'
        })).to.equal(null);

        expect(win.FiltersContextref.getAxis('a123')).to.have.lengthOf(0);

      });
    });

    it('getMember()', function() {
      cy.window().then(function(win) {

        expect(win.FiltersContextref.getMember()).to.equal(null);
        expect(win.FiltersContextref.getMember(true)).to.equal(null);
        expect(win.FiltersContextref.getMember(123)).to.equal(null);
        expect(win.FiltersContextref.getMember([])).to.equal(null);
        expect(win.FiltersContextref.getMember({
          'test': '123'
        })).to.equal(null);

        expect(win.FiltersContextref.getMember('a123')).to.have.lengthOf(0);

      });
    });

    it('getPeriod()', function() {
      cy.window().then(function(win) {

        expect(win.FiltersContextref.getPeriod()).to.equal('No period information.');
        expect(win.FiltersContextref.getPeriod(true)).to.equal('No period information.');
        expect(win.FiltersContextref.getPeriod(123)).to.equal('No period information.');
        expect(win.FiltersContextref.getPeriod([])).to.equal('No period information.');
        expect(win.FiltersContextref.getPeriod({
          'test': '123'
        })).to.equal('No period information.');

        expect(win.FiltersContextref.getPeriod('a123')).to.equal('No period information.');

      });
    });

    it('getReports()', function() {
      cy.window().then(function(win) {

        expect(win.FiltersContextref.getReports()).to.equal(null);
        expect(win.FiltersContextref.getReports(true)).to.equal(null);
        expect(win.FiltersContextref.getReports('123')).to.equal(null);

        expect(win.FiltersContextref.getReports(123)).to.equal(null);
        expect(win.FiltersContextref.getReports([])).to.equal(null);
        expect(win.FiltersContextref.getReports({
          'test': '123'
        })).to.equal(null);

        expect(win.FiltersContextref.getReports('a123', 'a234')).to.equal(null);

      });
    });

  });

  context('app/filters/credit.js - FiltersCredit', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'FiltersCredit');
    });

    it('getBalance()', function() {

      cy.window().then(function(win) {

        expect(win.FiltersCredit.getBalance()).to.equal(null);
        expect(win.FiltersCredit.getBalance(true)).to.equal(null);

        expect(win.FiltersCredit.getBalance(123)).to.equal(null);
        expect(win.FiltersCredit.getBalance([])).to.equal(null);
        expect(win.FiltersCredit.getBalance({
          'test': '123'
        })).to.equal(null);

        expect(win.FiltersCredit.getBalance('-123')).to.equal('-123');

      });
    });

  });

  context('app/filters/date.js - FiltersDate', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'FiltersDate');
    });
    it('eraYear()', function() {
      cy.window().then(function(win) {

        expect(win.FiltersDate.eraYear()).to.equal(null);
        expect(win.FiltersDate.eraYear(true)).to.equal(null);

        expect(win.FiltersDate.eraYear(123)).to.equal(null);
        expect(win.FiltersDate.eraYear([])).to.equal(null);
        expect(win.FiltersDate.eraYear({
          'test': '123'
        })).to.equal(null);

        expect(win.FiltersDate.eraYear('-123')).to.equal(null);

        expect(win.FiltersDate.eraYear('\u660E', '1')).to.equal(1868);

      });
    });

    it('calINDayMonthYear()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Cal IN Day Month Year';

        expect(win.FiltersDate.calINDayMonthYear()).to.equal(errMessage);

        expect(win.FiltersDate.calINDayMonthYear(true)).to.equal(errMessage);

        expect(win.FiltersDate.calINDayMonthYear(123)).to.equal(errMessage);

        expect(win.FiltersDate.calINDayMonthYear([])).to.equal(errMessage);

        expect(win.FiltersDate.calINDayMonthYear({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersDate.calINDayMonthYear({
          'innerText': '11 Pausha 1921'
        })).to.equal('2000-01-01');

      });
    });
    it('dateDayMonth()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Date Day Month';

        expect(win.FiltersDate.dateDayMonth()).to.equal(errMessage);

        expect(win.FiltersDate.dateDayMonth(true)).to.equal(errMessage);

        expect(win.FiltersDate.dateDayMonth(123)).to.equal(errMessage);

        expect(win.FiltersDate.dateDayMonth([])).to.equal(errMessage);

        expect(win.FiltersDate.dateDayMonth({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersDate.dateDayMonth({
          'innerText': '03/02'
        })).to.equal('--02-03');

      });
    });
    it('dateDayMonthDK()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Date Day Month DK';

        expect(win.FiltersDate.dateDayMonthDK()).to.equal(errMessage);

        expect(win.FiltersDate.dateDayMonthDK(true)).to.equal(errMessage);

        expect(win.FiltersDate.dateDayMonthDK(123)).to.equal(errMessage);

        expect(win.FiltersDate.dateDayMonthDK([])).to.equal(errMessage);

        expect(win.FiltersDate.dateDayMonthDK({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersDate.dateDayMonthDK({
          'innerText': '27. february'
        })).to.equal('--02-27');

      });
    });
    it('dateDayMonthEN()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Date Day Month EN';

        expect(win.FiltersDate.dateDayMonthEN()).to.equal(errMessage);

        expect(win.FiltersDate.dateDayMonthEN(true)).to.equal(errMessage);

        expect(win.FiltersDate.dateDayMonthEN(123)).to.equal(errMessage);

        expect(win.FiltersDate.dateDayMonthEN([])).to.equal(errMessage);

        expect(win.FiltersDate.dateDayMonthEN({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersDate.dateDayMonthEN({
          'innerText': '30th day of January'
        })).to.equal('--01-30');

      });
    });
    it('dateDayMonthYear()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Date Day Month Year';

        expect(win.FiltersDate.dateDayMonthYear()).to.equal(errMessage);

        expect(win.FiltersDate.dateDayMonthYear(true)).to.equal(errMessage);

        expect(win.FiltersDate.dateDayMonthYear(123)).to.equal(errMessage);

        expect(win.FiltersDate.dateDayMonthYear([])).to.equal(errMessage);

        expect(win.FiltersDate.dateDayMonthYear({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersDate.dateDayMonthYear({
          'innerText': '12.02.09'
        })).to.equal('2009-02-12');

      });
    });
    it('dateDayMonthYearDK()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Date Day Month Year DK';

        expect(win.FiltersDate.dateDayMonthYearDK()).to.equal(errMessage);

        expect(win.FiltersDate.dateDayMonthYearDK(true)).to.equal(errMessage);

        expect(win.FiltersDate.dateDayMonthYearDK(123)).to.equal(errMessage);

        expect(win.FiltersDate.dateDayMonthYearDK([])).to.equal(errMessage);

        expect(win.FiltersDate.dateDayMonthYearDK({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersDate.dateDayMonthYearDK({
          'innerText': '7. feb 2009'
        })).to.equal('2009-02-07');

      });
    });
    it('dateDayMonthYearEN()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Date Day Month Year EN';

        expect(win.FiltersDate.dateDayMonthYearEN()).to.equal(errMessage);

        expect(win.FiltersDate.dateDayMonthYearEN(true)).to.equal(errMessage);

        expect(win.FiltersDate.dateDayMonthYearEN(123)).to.equal(errMessage);

        expect(win.FiltersDate.dateDayMonthYearEN([])).to.equal(errMessage);

        expect(win.FiltersDate.dateDayMonthYearEN({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersDate.dateDayMonthYearEN({
          'innerText': '30th day of January, March and April, 1969'
        })).to.equal('1969-04-30');

      });
    });
    it('dateDayMonthYearIN()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Date Day Month Year IN';

        expect(win.FiltersDate.dateDayMonthYearIN()).to.equal(errMessage);

        expect(win.FiltersDate.dateDayMonthYearIN(true)).to.equal(errMessage);

        expect(win.FiltersDate.dateDayMonthYearIN(123)).to.equal(errMessage);

        expect(win.FiltersDate.dateDayMonthYearIN([])).to.equal(errMessage);

        expect(win.FiltersDate.dateDayMonthYearIN({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersDate.dateDayMonthYearIN({
          'innerText': '19 सितंबर 2012'
        })).to.equal('2012-09-19');

      });
    });
    it('dateDotEU()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Date Dot EU';

        expect(win.FiltersDate.dateDotEU()).to.equal(errMessage);

        expect(win.FiltersDate.dateDotEU(true)).to.equal(errMessage);

        expect(win.FiltersDate.dateDotEU(123)).to.equal(errMessage);

        expect(win.FiltersDate.dateDotEU([])).to.equal(errMessage);

        expect(win.FiltersDate.dateDotEU({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersDate.dateDotEU({
          'innerText': '25.12.2009'
        })).to.equal('2009-12-25');

      });
    });
    it('dateDotUS()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Date Dot US';

        expect(win.FiltersDate.dateDotUS()).to.equal(errMessage);

        expect(win.FiltersDate.dateDotUS(true)).to.equal(errMessage);

        expect(win.FiltersDate.dateDotUS(123)).to.equal(errMessage);

        expect(win.FiltersDate.dateDotUS([])).to.equal(errMessage);

        expect(win.FiltersDate.dateDotUS({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersDate.dateDotUS({
          'innerText': '12.25.2010'
        })).to.equal('2010-12-25');

      });
    });
    it('dateEraYearMonthDayJP()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Date Era Year Month Day JP';

        expect(win.FiltersDate.dateEraYearMonthDayJP()).to.equal(errMessage);

        expect(win.FiltersDate.dateEraYearMonthDayJP(true)).to.equal(errMessage);

        expect(win.FiltersDate.dateEraYearMonthDayJP(123)).to.equal(errMessage);

        expect(win.FiltersDate.dateEraYearMonthDayJP([])).to.equal(errMessage);

        expect(win.FiltersDate.dateEraYearMonthDayJP({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersDate.dateEraYearMonthDayJP({
          'innerText': '平成元年5月31日'
        })).to.equal('1989-05-31');

      });
    });
    it('dateEraYearMonthJP()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Date Era Year Month JP';

        expect(win.FiltersDate.dateEraYearMonthJP()).to.equal(errMessage);

        expect(win.FiltersDate.dateEraYearMonthJP(true)).to.equal(errMessage);

        expect(win.FiltersDate.dateEraYearMonthJP(123)).to.equal(errMessage);

        expect(win.FiltersDate.dateEraYearMonthJP([])).to.equal(errMessage);

        expect(win.FiltersDate.dateEraYearMonthJP({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersDate.dateEraYearMonthJP({
          'innerText': '平成元年5月'
        })).to.equal('1989-05');

      });
    });
    it('dateLongMonthYear()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Date Long Month Year';

        expect(win.FiltersDate.dateLongMonthYear()).to.equal(errMessage);

        expect(win.FiltersDate.dateLongMonthYear(true)).to.equal(errMessage);

        expect(win.FiltersDate.dateLongMonthYear(123)).to.equal(errMessage);

        expect(win.FiltersDate.dateLongMonthYear([])).to.equal(errMessage);

        expect(win.FiltersDate.dateLongMonthYear({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersDate.dateLongMonthYear({
          'innerText': 'January 2012'
        })).to.equal('2012-01');

      });
    });
    it('dateLongUK()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Date Long UK';

        expect(win.FiltersDate.dateLongUK()).to.equal(errMessage);

        expect(win.FiltersDate.dateLongUK(true)).to.equal(errMessage);

        expect(win.FiltersDate.dateLongUK(123)).to.equal(errMessage);

        expect(win.FiltersDate.dateLongUK([])).to.equal(errMessage);

        expect(win.FiltersDate.dateLongUK({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersDate.dateLongUK({
          'innerText': '25 July 07'
        })).to.equal('2007-07-25');

      });
    });
    it('dateLongUS()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Date Long US';

        expect(win.FiltersDate.dateLongUS()).to.equal(errMessage);

        expect(win.FiltersDate.dateLongUS(true)).to.equal(errMessage);

        expect(win.FiltersDate.dateLongUS(123)).to.equal(errMessage);

        expect(win.FiltersDate.dateLongUS([])).to.equal(errMessage);

        expect(win.FiltersDate.dateLongUS({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersDate.dateLongUS({
          'innerText': 'July 21, 08'
        })).to.equal('2008-07-21');

      });
    });
    it('dateLongYearMonth()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Date Long Year Month';

        expect(win.FiltersDate.dateLongYearMonth()).to.equal(errMessage);

        expect(win.FiltersDate.dateLongYearMonth(true)).to.equal(errMessage);

        expect(win.FiltersDate.dateLongYearMonth(123)).to.equal(errMessage);

        expect(win.FiltersDate.dateLongYearMonth([])).to.equal(errMessage);

        expect(win.FiltersDate.dateLongYearMonth({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersDate.dateLongYearMonth({
          'innerText': '09 July'
        })).to.equal('2009-07');

      });
    });
    it('dateMonthDay()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Date Month Day';

        expect(win.FiltersDate.dateMonthDay()).to.equal(errMessage);

        expect(win.FiltersDate.dateMonthDay(true)).to.equal(errMessage);

        expect(win.FiltersDate.dateMonthDay(123)).to.equal(errMessage);

        expect(win.FiltersDate.dateMonthDay([])).to.equal(errMessage);

        expect(win.FiltersDate.dateMonthDay({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersDate.dateMonthDay({
          'innerText': '09/28'
        })).to.equal('--09-28');

      });
    });
    it('dateMonthDayEN()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Date Month Day EN';

        expect(win.FiltersDate.dateMonthDayEN()).to.equal(errMessage);

        expect(win.FiltersDate.dateMonthDayEN(true)).to.equal(errMessage);

        expect(win.FiltersDate.dateMonthDayEN(123)).to.equal(errMessage);

        expect(win.FiltersDate.dateMonthDayEN([])).to.equal(errMessage);

        expect(win.FiltersDate.dateMonthDayEN({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersDate.dateMonthDayEN({
          'innerText': 'Jan 02'
        })).to.equal('--01-02');

      });
    });
    it('dateMonthDayYear()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Date Month Day Year';

        expect(win.FiltersDate.dateMonthDayYear()).to.equal(errMessage);

        expect(win.FiltersDate.dateMonthDayYear(true)).to.equal(errMessage);

        expect(win.FiltersDate.dateMonthDayYear(123)).to.equal(errMessage);

        expect(win.FiltersDate.dateMonthDayYear([])).to.equal(errMessage);

        expect(win.FiltersDate.dateMonthDayYear({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersDate.dateMonthDayYear({
          'innerText': '12.02.09'
        })).to.equal('2009-12-02');

      });
    });
    it('dateMonthDayYearEN()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Date Month Day Year EN';

        expect(win.FiltersDate.dateMonthDayYearEN()).to.equal(errMessage);

        expect(win.FiltersDate.dateMonthDayYearEN(true)).to.equal(errMessage);

        expect(win.FiltersDate.dateMonthDayYearEN(123)).to.equal(errMessage);

        expect(win.FiltersDate.dateMonthDayYearEN([])).to.equal(errMessage);

        expect(win.FiltersDate.dateMonthDayYearEN({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersDate.dateMonthDayYearEN({
          'innerText': 'January, March and April the 30th, 1969'
        })).to.equal('1969-01-30');

      });
    });
    it('dateMonthYear()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Date Month Year';

        expect(win.FiltersDate.dateMonthYear()).to.equal(errMessage);

        expect(win.FiltersDate.dateMonthYear(true)).to.equal(errMessage);

        expect(win.FiltersDate.dateMonthYear(123)).to.equal(errMessage);

        expect(win.FiltersDate.dateMonthYear([])).to.equal(errMessage);

        expect(win.FiltersDate.dateMonthYear({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersDate.dateMonthYear({
          'innerText': '04 2018'
        })).to.equal('2018-04');

      });
    });
    it('dateMonthYearDK()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Date Month Year DK';

        expect(win.FiltersDate.dateMonthYearDK()).to.equal(errMessage);

        expect(win.FiltersDate.dateMonthYearDK(true)).to.equal(errMessage);

        expect(win.FiltersDate.dateMonthYearDK(123)).to.equal(errMessage);

        expect(win.FiltersDate.dateMonthYearDK([])).to.equal(errMessage);

        expect(win.FiltersDate.dateMonthYearDK({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersDate.dateMonthYearDK({
          'innerText': 'Jan 2013'
        })).to.equal('2013-01');

      });
    });
    it('dateMonthYearEN()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Date Month Year EN';

        expect(win.FiltersDate.dateMonthYearEN()).to.equal(errMessage);

        expect(win.FiltersDate.dateMonthYearEN(true)).to.equal(errMessage);

        expect(win.FiltersDate.dateMonthYearEN(123)).to.equal(errMessage);

        expect(win.FiltersDate.dateMonthYearEN([])).to.equal(errMessage);

        expect(win.FiltersDate.dateMonthYearEN({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersDate.dateMonthYearEN({
          'innerText': 'January, March and April, 1969'
        })).to.equal('1969-01');

      });
    });
    it('dateMonthYearIN()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Date Month Year IN';

        expect(win.FiltersDate.dateMonthYearIN()).to.equal(errMessage);

        expect(win.FiltersDate.dateMonthYearIN(true)).to.equal(errMessage);

        expect(win.FiltersDate.dateMonthYearIN(123)).to.equal(errMessage);

        expect(win.FiltersDate.dateMonthYearIN([])).to.equal(errMessage);

        expect(win.FiltersDate.dateMonthYearIN({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersDate.dateMonthYearIN({
          'innerText': 'सितंबर २०१२'
        })).to.equal('2012-09');

      });
    });
    it('dateShortDayMonthUK()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Date Short Day Month UK';

        expect(win.FiltersDate.dateShortDayMonthUK()).to.equal(errMessage);

        expect(win.FiltersDate.dateShortDayMonthUK(true)).to.equal(errMessage);

        expect(win.FiltersDate.dateShortDayMonthUK(123)).to.equal(errMessage);

        expect(win.FiltersDate.dateShortDayMonthUK([])).to.equal(errMessage);

        expect(win.FiltersDate.dateShortDayMonthUK({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersDate.dateShortDayMonthUK({
          'innerText': '08 Feb'
        })).to.equal('--04-08');

      });
    });
    it('dateShortEU()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Date Short EU';

        expect(win.FiltersDate.dateShortEU()).to.equal(errMessage);

        expect(win.FiltersDate.dateShortEU(true)).to.equal(errMessage);

        expect(win.FiltersDate.dateShortEU(123)).to.equal(errMessage);

        expect(win.FiltersDate.dateShortEU([])).to.equal(errMessage);

        expect(win.FiltersDate.dateShortEU({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersDate.dateShortEU({
          'innerText': 'TODO'
        })).to.equal('TODO');

      });
    });
    it('dateShortMonthDayUS()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Date Short Month Day US';

        expect(win.FiltersDate.dateShortMonthDayUS()).to.equal(errMessage);

        expect(win.FiltersDate.dateShortMonthDayUS(true)).to.equal(errMessage);

        expect(win.FiltersDate.dateShortMonthDayUS(123)).to.equal(errMessage);

        expect(win.FiltersDate.dateShortMonthDayUS([])).to.equal(errMessage);

        expect(win.FiltersDate.dateShortMonthDayUS({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersDate.dateShortMonthDayUS({
          'innerText': 'Feb 22'
        })).to.equal('--02-22');

      });
    });
    it('dateShortMonthYear()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Date Short Month Year US';

        expect(win.FiltersDate.dateShortMonthYear()).to.equal(errMessage);

        expect(win.FiltersDate.dateShortMonthYear(true)).to.equal(errMessage);

        expect(win.FiltersDate.dateShortMonthYear(123)).to.equal(errMessage);

        expect(win.FiltersDate.dateShortMonthYear([])).to.equal(errMessage);

        expect(win.FiltersDate.dateShortMonthYear({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersDate.dateShortMonthYear({
          'innerText': 'Feb 08'
        })).to.equal('2008-02');

      });
    });
    it('dateShortUK()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Date Short UK';

        expect(win.FiltersDate.dateShortUK()).to.equal(errMessage);

        expect(win.FiltersDate.dateShortUK(true)).to.equal(errMessage);

        expect(win.FiltersDate.dateShortUK(123)).to.equal(errMessage);

        expect(win.FiltersDate.dateShortUK([])).to.equal(errMessage);

        expect(win.FiltersDate.dateShortUK({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersDate.dateShortUK({
          'innerText': '17 Jun 12'
        })).to.equal('2012-06-17');

      });
    });
    it('dateShortUS()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Date Short US';

        expect(win.FiltersDate.dateShortUS()).to.equal(errMessage);

        expect(win.FiltersDate.dateShortUS(true)).to.equal(errMessage);

        expect(win.FiltersDate.dateShortUS(123)).to.equal(errMessage);

        expect(win.FiltersDate.dateShortUS([])).to.equal(errMessage);

        expect(win.FiltersDate.dateShortUS({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersDate.dateShortUS({
          'innerText': 'Feb 23, 12'
        })).to.equal('2012-02-23');

      });
    });
    it('dateShortYearMonth()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Date Short Year Month';

        expect(win.FiltersDate.dateShortYearMonth()).to.equal(errMessage);

        expect(win.FiltersDate.dateShortYearMonth(true)).to.equal(errMessage);

        expect(win.FiltersDate.dateShortYearMonth(123)).to.equal(errMessage);

        expect(win.FiltersDate.dateShortYearMonth([])).to.equal(errMessage);

        expect(win.FiltersDate.dateShortYearMonth({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersDate.dateShortYearMonth({
          'innerText': '12 Feb'
        })).to.equal('2012-02');

      });
    });
    it('dateSlashDayMonthEU()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Date Slash Day Month EU';

        expect(win.FiltersDate.dateSlashDayMonthEU()).to.equal(errMessage);

        expect(win.FiltersDate.dateSlashDayMonthEU(true)).to.equal(errMessage);

        expect(win.FiltersDate.dateSlashDayMonthEU(123)).to.equal(errMessage);

        expect(win.FiltersDate.dateSlashDayMonthEU([])).to.equal(errMessage);

        expect(win.FiltersDate.dateSlashDayMonthEU({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersDate.dateSlashDayMonthEU({
          'innerText': '23/12'
        })).to.equal('--12-23');

      });
    });
    it('dateSlashEU()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Date Slash EU';

        expect(win.FiltersDate.dateSlashEU()).to.equal(errMessage);

        expect(win.FiltersDate.dateSlashEU(true)).to.equal(errMessage);

        expect(win.FiltersDate.dateSlashEU(123)).to.equal(errMessage);

        expect(win.FiltersDate.dateSlashEU([])).to.equal(errMessage);

        expect(win.FiltersDate.dateSlashEU({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersDate.dateSlashEU({
          'innerText': '8/2/12'
        })).to.equal('2012-02-08');

      });
    });
    it('dateSlashMonthDayUS()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Date Slash Month Day US';

        expect(win.FiltersDate.dateSlashMonthDayUS()).to.equal(errMessage);

        expect(win.FiltersDate.dateSlashMonthDayUS(true)).to.equal(errMessage);

        expect(win.FiltersDate.dateSlashMonthDayUS(123)).to.equal(errMessage);

        expect(win.FiltersDate.dateSlashMonthDayUS([])).to.equal(errMessage);

        expect(win.FiltersDate.dateSlashMonthDayUS({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersDate.dateSlashMonthDayUS({
          'innerText': '2/24'
        })).to.equal('--02-24');

      });
    });
    it('dateSlashUS()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Date Slash EU';

        expect(win.FiltersDate.dateSlashUS()).to.equal(errMessage);

        expect(win.FiltersDate.dateSlashUS(true)).to.equal(errMessage);

        expect(win.FiltersDate.dateSlashUS(123)).to.equal(errMessage);

        expect(win.FiltersDate.dateSlashUS([])).to.equal(errMessage);

        expect(win.FiltersDate.dateSlashUS({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersDate.dateSlashUS({
          'innerText': '12/23/14'
        })).to.equal('2014-12-23');

      });
    });
    it('dateYearMonthCJK()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Date Year Month CJK';

        expect(win.FiltersDate.dateYearMonthCJK()).to.equal(errMessage);

        expect(win.FiltersDate.dateYearMonthCJK(true)).to.equal(errMessage);

        expect(win.FiltersDate.dateYearMonthCJK(123)).to.equal(errMessage);

        expect(win.FiltersDate.dateYearMonthCJK([])).to.equal(errMessage);

        expect(win.FiltersDate.dateYearMonthCJK({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersDate.dateYearMonthCJK({
          'innerText': '2010年5月'
        })).to.equal('2010-05');

      });
    });
    it('dateYearMonthDay()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Date Year Month Day';

        expect(win.FiltersDate.dateYearMonthDay()).to.equal(errMessage);

        expect(win.FiltersDate.dateYearMonthDay(true)).to.equal(errMessage);

        expect(win.FiltersDate.dateYearMonthDay(123)).to.equal(errMessage);

        expect(win.FiltersDate.dateYearMonthDay([])).to.equal(errMessage);

        expect(win.FiltersDate.dateYearMonthDay({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersDate.dateYearMonthDay({
          'innerText': '09 02 21'
        })).to.equal('2009-02-21');

      });
    });
    it('dateYearMonthDayCJK()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Date Year Month Day CJK';

        expect(win.FiltersDate.dateYearMonthDayCJK()).to.equal(errMessage);

        expect(win.FiltersDate.dateYearMonthDayCJK(true)).to.equal(errMessage);

        expect(win.FiltersDate.dateYearMonthDayCJK(123)).to.equal(errMessage);

        expect(win.FiltersDate.dateYearMonthDayCJK([])).to.equal(errMessage);

        expect(win.FiltersDate.dateYearMonthDayCJK({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersDate.dateYearMonthDayCJK({
          'innerText': '2010年5月31日'
        })).to.equal('2010-05-31');

      });
    });
    it('dateYearMonthEN()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Date Year Month EN';

        expect(win.FiltersDate.dateYearMonthEN()).to.equal(errMessage);

        expect(win.FiltersDate.dateYearMonthEN(true)).to.equal(errMessage);

        expect(win.FiltersDate.dateYearMonthEN(123)).to.equal(errMessage);

        expect(win.FiltersDate.dateYearMonthEN([])).to.equal(errMessage);

        expect(win.FiltersDate.dateYearMonthEN({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersDate.dateYearMonthEN({
          'innerText': '1969, January, March and April'
        })).to.equal('1969-04');

      });
    });
    it('durYear()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Dur Year';

        expect(win.FiltersDate.durYear()).to.equal(errMessage);

        expect(win.FiltersDate.durYear(true)).to.equal(errMessage);

        expect(win.FiltersDate.durYear(123)).to.equal(errMessage);

        expect(win.FiltersDate.durYear([])).to.equal(errMessage);

        expect(win.FiltersDate.durYear({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersDate.durYear({
          'innerText': '2015'
        })).to.equal('P2015Y0M0D');

      });
    });
  });

  context('app/filters/format.js - FiltersFormat', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'FiltersFormat');
    });

    it('getFormattedFormat()', function() {
      cy.window().then(function(win) {

        expect(win.FiltersFormat.getFormattedFormat()).to.equal(null);
        expect(win.FiltersFormat.getFormattedFormat(true)).to.equal(null);
        expect(win.FiltersFormat.getFormattedFormat(123)).to.equal(null);
        expect(win.FiltersFormat.getFormattedFormat([])).to.equal(null);
        expect(win.FiltersFormat.getFormattedFormat({
          'test': '123'
        })).to.equal(null);
        expect(win.FiltersFormat.getFormattedFormat('test')).to.equal(null);

        expect(win.FiltersFormat.getFormattedFormat('this:test')).to.equal('test');
      });
    });
  });

  context('app/filters/name.js - FiltersName', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'FiltersName');
    });

    it('getFormattedName()', function() {
      cy.window().then(
        function(win) {

          expect(win.FiltersName.getFormattedName()).to.equal('');
          expect(win.FiltersName.getFormattedName(true)).to.equal('');
          expect(win.FiltersName.getFormattedName(123)).to.equal('');
          expect(win.FiltersName.getFormattedName([])).to.equal('');
          expect(win.FiltersName.getFormattedName({
            'test': '123'
          })).to.equal('');
          expect(win.FiltersName.getFormattedName('test')).to.equal('');

          expect(win.FiltersName.getFormattedName('this:testSomething')).to
            .equal('<span class="font-weight-bold">THIS</span><span class="ms-1">test Something</span>');

        });
    });
    it('getFormattedType()', function() {
      cy.window().then(function(win) {

        expect(win.FiltersName.getFormattedType()).to.equal(null);
        expect(win.FiltersName.getFormattedType(true)).to.equal(null);
        expect(win.FiltersName.getFormattedType(123)).to.equal(null);
        expect(win.FiltersName.getFormattedType([])).to.equal(null);
        expect(win.FiltersName.getFormattedType({
          'test': '123'
        })).to.equal(null);
        expect(win.FiltersName.getFormattedType('test')).to.equal(null);

        expect(win.FiltersName.getFormattedType('this:testSomething')).to.equal(null);

      });
    });
    it('getDefinition()', function() {
      cy.window().then(function(win) {

        expect(win.FiltersName.getDefinition()).to.equal(null);
        expect(win.FiltersName.getDefinition(true)).to.equal(null);
        expect(win.FiltersName.getDefinition(123)).to.equal(null);
        expect(win.FiltersName.getDefinition([])).to.equal(null);
        expect(win.FiltersName.getDefinition({
          'test': '123'
        })).to.equal(null);
        expect(win.FiltersName.getDefinition('test')).to.equal(null);

        expect(win.FiltersName.getDefinition('this:testSomething')).to.equal(null);

      });
    });
    it('getLabel()', function() {
      cy.window().then(function(win) {

        expect(win.FiltersName.getLabel()).to.equal(null);
        expect(win.FiltersName.getLabel(true)).to.equal(null);
        expect(win.FiltersName.getLabel(123)).to.equal(null);
        expect(win.FiltersName.getLabel([])).to.equal(null);
        expect(win.FiltersName.getLabel({
          'test': '123'
        })).to.equal(null);
        expect(win.FiltersName.getLabel('test')).to.equal(null);

        expect(win.FiltersName.getLabel('this:testSomething')).to.equal(null);

      });
    });
    it('getTerseLabel()', function() {
      cy.window().then(function(win) {

        expect(win.FiltersName.getTerseLabel()).to.equal(null);
        expect(win.FiltersName.getTerseLabel(true)).to.equal(null);
        expect(win.FiltersName.getTerseLabel(123)).to.equal(null);
        expect(win.FiltersName.getTerseLabel([])).to.equal(null);
        expect(win.FiltersName.getTerseLabel({
          'test': '123'
        })).to.equal(null);
        expect(win.FiltersName.getTerseLabel('test')).to.equal(null);

        expect(win.FiltersName.getTerseLabel('this:testSomething')).to.equal(null);

      });
    });
    it('getAuthRefs()', function() {
      cy.window().then(function(win) {

        expect(win.FiltersName.getAuthRefs()).to.equal(null);
        expect(win.FiltersName.getAuthRefs(true)).to.equal(null);
        expect(win.FiltersName.getAuthRefs(123)).to.equal(null);
        expect(win.FiltersName.getAuthRefs([])).to.equal(null);
        expect(win.FiltersName.getAuthRefs({
          'test': '123'
        })).to.equal(null);
        expect(win.FiltersName.getAuthRefs('test')).to.equal(null);

        expect(win.FiltersName.getAuthRefs('this:testSomething')).to.equal(null);

      });
    });
    it('getTag()', function() {
      cy.window().then(function(win) {

        expect(win.FiltersName.getTag()).to.equal(undefined);
        expect(win.FiltersName.getTag(true)).to.equal(undefined);
        expect(win.FiltersName.getTag(123)).to.equal(undefined);
        expect(win.FiltersName.getTag([])).to.equal(undefined);
        expect(win.FiltersName.getTag({
          'test': '123'
        })).to.equal(undefined);

        expect(win.FiltersName.getTag('test')).to.not.equal(undefined);

        expect(win.FiltersName.getTag('this:testSomething')).to.not.equal(undefined);
      });
    });

  });

  context('app/filters/number.js - FiltersNumber', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'FiltersNumber');
    });
    it('jpDigitsToNormal()', function() {
      cy.window().then(function(win) {

        expect(win.FiltersNumber.jpDigitsToNormal()).to.equal(null);
        expect(win.FiltersNumber.jpDigitsToNormal(true)).to.equal(null);
        expect(win.FiltersNumber.jpDigitsToNormal(123)).to.equal(null);
        expect(win.FiltersNumber.jpDigitsToNormal([])).to.equal(null);
        expect(win.FiltersNumber.jpDigitsToNormal({
          'test': '123'
        })).to.equal(null);

        expect(win.FiltersNumber.jpDigitsToNormal('平成元年5月')).to.equal('平成元年5月');
      });
    });
    it('numComma()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Num Comma';

        expect(win.FiltersNumber.numComma()).to.equal(errMessage);

        expect(win.FiltersNumber.numComma(true)).to.equal(errMessage);

        expect(win.FiltersNumber.numComma(123)).to.equal(errMessage);

        expect(win.FiltersNumber.numComma([])).to.equal(errMessage);

        expect(win.FiltersNumber.numComma({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersNumber.numComma({
          'innerText': '100000'
        })).to.equal('100,000');

      });

    });

    it('numCommaDecimal()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Num Comma Decimal';

        expect(win.FiltersNumber.numCommaDecimal()).to.equal(errMessage);

        expect(win.FiltersNumber.numCommaDecimal(true)).to.equal(errMessage);

        expect(win.FiltersNumber.numCommaDecimal(123)).to.equal(errMessage);

        expect(win.FiltersNumber.numCommaDecimal([])).to.equal(errMessage);

        expect(win.FiltersNumber.numCommaDecimal({
          'test': 'abc'
        })).to.equal(errMessage);

        expect(win.FiltersNumber.numCommaDecimal({
          'innerText': '1,123'
        })).to.equal('1.123');

      });
    });
    it('numCommaDot()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Num Comma Dot';

        expect(win.FiltersNumber.numCommaDot()).to.equal(errMessage);

        expect(win.FiltersNumber.numCommaDot(true)).to.equal(errMessage);

        expect(win.FiltersNumber.numCommaDot(123)).to.equal(errMessage);

        expect(win.FiltersNumber.numCommaDot([])).to.equal(errMessage);

        expect(win.FiltersNumber.numCommaDot({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersNumber.numCommaDot({
          'innerText': '1,234'
        })).to.equal('1234');

      });
    });
    it('numDash()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Num Dash';

        expect(win.FiltersNumber.numDash()).to.equal(errMessage);

        expect(win.FiltersNumber.numDash(true)).to.equal(errMessage);

        expect(win.FiltersNumber.numDash(123)).to.equal(errMessage);

        expect(win.FiltersNumber.numDash([])).to.equal(errMessage);

        expect(win.FiltersNumber.numDash({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersNumber.numDash({
          'innerText': '-'
        })).to.equal('0');

      });
    });
    it('numDotComma()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Num Dot Comma';

        expect(win.FiltersNumber.numDotComma()).to.equal(errMessage);

        expect(win.FiltersNumber.numDotComma(true)).to.equal(errMessage);

        expect(win.FiltersNumber.numDotComma(123)).to.equal(errMessage);

        expect(win.FiltersNumber.numDotComma([])).to.equal(errMessage);

        expect(win.FiltersNumber.numDotComma({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersNumber.numDotComma({
          'innerText': '1,234.00'
        })).to.equal('1.23400');

      });
    });
    it('numDotDecimal()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Num Dot Decimal';

        expect(win.FiltersNumber.numDotDecimal()).to.equal(errMessage);

        expect(win.FiltersNumber.numDotDecimal(true)).to.equal(errMessage);

        expect(win.FiltersNumber.numDotDecimal(123)).to.equal(errMessage);

        expect(win.FiltersNumber.numDotDecimal([])).to.equal(errMessage);

        expect(win.FiltersNumber.numDotDecimal({
          'test': 'abc'
        })).to.equal(errMessage);

        // expect(win.FiltersNumber.numDotDecimal({
        // 'innerText' : '123,456789.23'
        // })).to.equal('123,456,789.23');

      });
    });
    it('numDotDecimalIN()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Num Dot Decimal IN';

        expect(win.FiltersNumber.numDotDecimalIN()).to.equal(errMessage);

        expect(win.FiltersNumber.numDotDecimalIN(true)).to.equal(errMessage);

        expect(win.FiltersNumber.numDotDecimalIN(123)).to.equal(errMessage);

        expect(win.FiltersNumber.numDotDecimalIN([])).to.equal(errMessage);

        expect(win.FiltersNumber.numDotDecimalIN({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersNumber.numDotDecimalIN({
          'innerText': '1,00,00,000'
        })).to.equal('10000000');

      });
    });
    it('numSpaceComma()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Num Space Comma';

        expect(win.FiltersNumber.numSpaceComma()).to.equal(errMessage);

        expect(win.FiltersNumber.numSpaceComma(true)).to.equal(errMessage);

        expect(win.FiltersNumber.numSpaceComma(123)).to.equal(errMessage);

        expect(win.FiltersNumber.numSpaceComma([])).to.equal(errMessage);

        expect(win.FiltersNumber.numSpaceComma({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersNumber.numSpaceComma({
          'innerText': '123 456'
        })).to.equal('123456');

      });
    });
    it('numSpaceDot()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Num Space Dot';

        expect(win.FiltersNumber.numSpaceDot()).to.equal(errMessage);

        expect(win.FiltersNumber.numSpaceDot(true)).to.equal(errMessage);

        expect(win.FiltersNumber.numSpaceDot(123)).to.equal(errMessage);

        expect(win.FiltersNumber.numSpaceDot([])).to.equal(errMessage);

        expect(win.FiltersNumber.numSpaceDot({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersNumber.numSpaceDot({
          'innerText': '123 456'
        })).to.equal('123456');

      });
    });
    it('numUnitDecimal()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Num Unit Decimal';

        expect(win.FiltersNumber.numUnitDecimal()).to.equal(errMessage);

        expect(win.FiltersNumber.numUnitDecimal(true)).to.equal(errMessage);

        expect(win.FiltersNumber.numUnitDecimal(123)).to.equal(errMessage);

        expect(win.FiltersNumber.numUnitDecimal([])).to.equal(errMessage);

        expect(win.FiltersNumber.numUnitDecimal({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersNumber.numUnitDecimal({
          'innerText': '5,123 - ??? -'
        })).to.equal(errMessage);

      });
    });
    it('numUnitDecimalIN()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Num Unit Decimal IN';

        expect(win.FiltersNumber.numUnitDecimalIN()).to.equal(errMessage);

        expect(win.FiltersNumber.numUnitDecimalIN(true)).to.equal(errMessage);

        expect(win.FiltersNumber.numUnitDecimalIN(123)).to.equal(errMessage);

        expect(win.FiltersNumber.numUnitDecimalIN([])).to.equal(errMessage);

        expect(win.FiltersNumber.numUnitDecimalIN({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersNumber.numUnitDecimalIN({
          'innerText': '1,000 rupees 50 paise'
        })).to.equal('1000.50');

      });
    });
    it('numWordsEn()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Num Words EN';

        expect(win.FiltersNumber.numWordsEn()).to.equal(errMessage);

        expect(win.FiltersNumber.numWordsEn(true)).to.equal(errMessage);

        expect(win.FiltersNumber.numWordsEn(123)).to.equal(errMessage);

        expect(win.FiltersNumber.numWordsEn([])).to.equal(errMessage);

        expect(win.FiltersNumber.numWordsEn({
          'test': '123'
        })).to.equal(errMessage);

        expect(win.FiltersNumber.numWordsEn({
          'innerText': 'forty two'
        })).to.equal('42');

      });
    });
  });

  context('app/filters/other.js - FiltersOther', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'FiltersOther');
    });

    it('noContent()', function() {
      cy.window().then(function(win) {
        expect(win.FiltersOther.noContent({
          'test': '123'
        })).to.equal('');
      });
    });
    it('zeroDash()', function() {
      cy.window().then(function(win) {

        var errMessage = 'Format Error: Zero Dash';

        expect(win.FiltersOther.zeroDash()).to.equal(errMessage);

        expect(win.FiltersOther.zeroDash(true)).to.equal(errMessage);

        expect(win.FiltersOther.zeroDash(123)).to.equal(errMessage);

        expect(win.FiltersOther.zeroDash([])).to.equal(errMessage);

// expect(win.FiltersOther.zeroDash({
// 'test': '123'
// })).to.equal(errMessage);

// expect(win.FiltersOther.zeroDash({
// 'innerHTML': '\u002D'
// })).to.equal('0');

      });
    });
  });

  context('app/filters/reports.js - FiltersReports', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'FiltersReports');
    });

    it('getReportsByGroupType()', function() {
      cy.window().then(function(win) {

        expect(win.FiltersReports.getReportsByGroupType()).to.equal(null);

        expect(win.FiltersReports.getReportsByGroupType(true)).to.equal(null);

        expect(win.FiltersReports.getReportsByGroupType(123)).to.equal(null);

        expect(win.FiltersReports.getReportsByGroupType([])).to.equal(null);

        expect(win.FiltersReports.getReportsByGroupType({
          'test': '123'
        })).to.equal(null);

        expect(win.FiltersReports.getReportsByGroupType('test')).to.not.equal(null);

      });
    });
  });

  context('app/filters/scale.js - FiltersScale', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'FiltersScale');
    });

    it('getScale()', function() {
      cy.window().then(function(win) {

        expect(win.FiltersScale.getScale()).to.equal(null);

        expect(win.FiltersScale.getScale(true)).to.equal(null);

        expect(win.FiltersScale.getScale(123)).to.equal(null);

        expect(win.FiltersScale.getScale([])).to.equal(null);

        expect(win.FiltersScale.getScale({
          'test': '123'
        })).to.equal(null);

        expect(win.FiltersScale.getScale('0')).to.equal('Zero');

      });
    });
  });

  context('app/filters/sign.js - FiltersSign', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'FiltersSign');
    });

    it('getSign()', function() {
      cy.window().then(function(win) {

        expect(win.FiltersSign.getSign()).to.equal(null);

        expect(win.FiltersSign.getSign(true)).to.equal(null);

        expect(win.FiltersSign.getSign(123)).to.equal(null);

        expect(win.FiltersSign.getSign([])).to.equal(null);

        expect(win.FiltersSign.getSign({
          'test': '123'
        })).to.equal(null);

        expect(win.FiltersSign.getSign('-', 'test:nonfraction')).to.equal('Negative');

      });
    });
  });

  context('app/filters/unitref.js - FiltersUnitref', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'FiltersUnitref');
    });

    it('getMeasure()', function() {
      cy.window().then(function(win) {

        expect(win.FiltersUnitref.getMeasure()).to.equal(null);

        expect(win.FiltersUnitref.getMeasure(true)).to.equal(null);

        expect(win.FiltersUnitref.getMeasure(123)).to.equal(null);

        expect(win.FiltersUnitref.getMeasure([])).to.equal(null);

        expect(win.FiltersUnitref.getMeasure({
          'test': '123'
        })).to.equal(null);

        expect(win.FiltersUnitref.getMeasure('123 per 456')).to.not.equal(null);

      });
    });
  });

  context('app/filters/value.js - FiltersValue', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'FiltersValue');
    });

    it('getFormattedValue()', function() {});
    it('getFormattedValueForContinuedAt()', function() {});
    it('recursivelyFixHTML()', function() {});
    it('getFormattedValue()', function() {});
    it('getFormattedValue()', function() {});
    it('getFormattedValue()', function() {});
  });

  context('app/form-information/index.js - FormInformation', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'FormInformation');
    });

    it('init()', function() {});
    it('xbrlInstance()', function() {});
    it('xbrlZip()', function() {});
    it('xbrlHtml()', function() {});
    it('version()', function() {});
  });

  context('app/help/index.js - Help', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'Help');
    });

    it('toggle()', function() {});

  });

  context('app/helpers/url.js - HelpersUrl', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'HelpersUrl');
    });

    it('init()', function() {});
    it('makeAbsoluteUrlUnlessSimpleAnchorTag()', function() {});
    it('getUpdatedHREF()', function() {});
    it('setParams()', function() {});
    it('getParamsFromString()', function() {});
    it('updateURLWithoutReload()', function() {});

  });

  context('app/images/index.js - Images', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'Images');
    });

    it('updateLinks()', function() {});

  });

  context('app/links/index.js - Links', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'Links');
    });

    it('init()', function() {});
    it('updateLinks()', function() {});
    it('absoluteLinks()', function() {});
    it('clickEventInternal()', function() {});
    it('populate()', function() {});

  });

  context('app/menus/state.js - MenusState', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'MenusState');
    });

    it('toggle()', function() {});

  });

  context('app/modals/common.js - ModalsCommon', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'ModalsCommon');
    });

    it('clickEvent()', function() {});
    it('keyboardEvents()', function() {});
    it('carouselData()', function() {});

  });

  context('app/modals/continued-at.js - ModalsContinuedAt', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'ModalsContinuedAt');
    });

    it('dynamicallyFindContextRefForModal()', function() {});
    it('setAllElements()', function() {});
    it('clickEvent()', function() {});
    it('carouselData()', function() {});

  });

  context('app/modals/form-information.js - ModalsFormInformation', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'ModalsFormInformation');
    });

    it('clickEvent()', function() {});
    it('keyboardEvents()', function() {});
    it('carouselData()', function() {});
    it('firstSlide()', function() {});
    it('secondSlide()', function() {});
    it('thirdSlide()', function() {});
    it('fourthSlide()', function() {});

  });

  context('app/modals/index.js - Modals', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'Modals');
    });

    it('renderCarouselIndicators()', function() {});
    it('close()', function() {});
    it('copyContent()', function() {});
    it('closeCopy()', function() {});
    it('expandToggle()', function() {});
    it('initDrag()', function() {});

  });

  context('app/modals/taxonomy-pages.js - TaxonomyPages', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'TaxonomyPages');
    });

    it('firstPage()', function() {});
    it('secondPage()', function() {});
    it('thirdPage()', function() {});
    it('fourthPage()', function() {});

  });

  context('app/pagination/index.js - Pagination', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'Pagination');
    });

    it('init()', function() {});
    it('reset()', function() {});
    it('setArray()', function() {});
    it('getPaginationTemplate()', function() {});
    it('firstPage()', function() {});
    it('lastPage()', function() {});
    it('previousPage()', function() {});
    it('previousTaxonomy()', function() {});
    it('nextTaxonomy()', function() {});
    it('getControlsTemplate()', function() {});

  });

  context('app/scroll/index.js - Scroll', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'Pagination');
    });

    it('toTop()', function() {});
    it('scroll()', function() {});
    it('removeAnchorTag()', function() {});
  });

  context('app/search/functions.js - SearchFunctions', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'SearchFunctions');
    });

    it('elementLabelFromRegex()', function() {});
    it('elementNameFromRegex()', function() {});
    it('elementContentFromRegex()', function() {});
    it('dynamicallyGatherContinuedAtElements()', function() {});
    it('elementDefinitionFromRegex()', function() {});
    it('elementDimensionsFromRegex()', function() {});
    it('elementReferencesFromRegex()', function() {});
    it('searchReferencesForAuthRef()', function() {});
    it('searchObjectOfSingleReferenceForRegex()', function() {});
  });

  context('app/search/index.js - Search', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'Search');
    });

    it('clear()', function() {});
    it('submit()', function() {});
    it('createValueToSearchFor()', function() {});

  });

  context('app/sections/index.js - Sections', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'Sections');
    });

    it('clickEvent()', function() {});
    it('fallbackElementScroll()', function() {});
    it('toggle()', function() {});
    it('formChange()', function() {});
    it('populate()', function() {});
    it('populateParentCollapse()', function() {});
    it('filterGroupType()', function() {});
    it('prepareChildCollapse()', function() {});
    it('populateChildCollapse()', function() {});
    it('emptyChildCollapse()', function() {});

  });

  context('app/sections/search.js - SectionsSearch', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'SectionsSearch');
    });

    it('submit()', function() {});
    it('clear()', function() {});
  });

  context('app/taxonomies/continued-at.js - TaxonomiesContinuedAt', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'TaxonomiesContinuedAt');
    });

    it('addContinuedAtFunctionality()', function() {});
    it('addContinuedAtFunctionalityToSpecificElement()', function() {});
    it('iterateDomForNestedContinuedAt()', function() {});
    it('dynamicallyFindAllContinuedAtElements()', function() {});
    it('dynamicallyFindContextRefForHover()', function() {});
    it('updateHoverEffectOnAllChildren()', function() {});
    it('enterElement()', function() {});
    it('removeAttributes()', function() {});
  });

  context('app/taxonomies/general.js - TaxonomiesGeneral', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'TaxonomiesGeneral');
    });

    it('enterElement()', function() {});
    it('removeAllSelectedTaxonomy()', function() {});
    it('selectedTaxonomy()', function() {});
    it('getElementByNameContextref()', function() {});
    it('goTo()', function() {});
    it('getTaxonomyListTemplate()', function() {});
    it('getTaxonomyBadge()', function() {});
    it('isParentNodeHidden()', function() {});
    it('specialSort()', function() {});

  });

  context('app/taxonomies/index.js - Taxonomies', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'Taxonomies');
    });

    it('fixStyleString()', function() {});
    it('addEventAttributes()', function() {});
    it('setFilterAttributes()', function() {});
    it('isElementContinued()', function() {});
    it('clickEvent()', function() {});
    it('enterElement()', function() {});
    it('leaveElement()', function() {});
    it('resetAllHoverAttributes()', function() {});

  });

  context('app/taxonomies/menu.js - TaxonomiesMenu', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'TaxonomiesMenu');
    });

    it('toggle()', function() {});
    it('formChange()', function() {});
    it('prepareForPagination()', function() {});

  });

  context('app/user-filters/data-radios.js - UserFiltersDataRadios', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'UserFiltersDataRadios');
    });

    it('clickEvent()', function() {});

  });

  context('app/user-filters/dropdown.js - UserFiltersDropdown', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'UserFiltersDropdown');
    });

    it('init()', function() {});
    it('activeFilters()', function() {});
    it('dataRadios()', function() {});
    it('tagsRadios()', function() {});
    it('moreFilters()', function() {});
    it('resetAll()', function() {});
    it('updateFilterActive()', function() {});

  });

  context('app/user-filters/general.js - UserFiltersGeneral', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'UserFiltersGeneral');
    });

    it('moreFiltersClickEvent()', function() {});
    it('setAllFilteredDataTemp()', function() {});
    it('setEnabledTaxonomies()', function() {});
    it('resetAllFilteredData()', function() {});
    it('setAllFilteredData()', function() {});
    it('updateTaxonomyCounts()', function() {});
    it('updateCurrentFiltersDropdown()', function() {});
    it('setCurrentDataFilter()', function() {});
    it('setCurrentTagsFilter()', function() {});
    it('resetDataFilter()', function() {});
    it('resetTagsFilter()', function() {});
    it('resetAllFilters()', function() {});

  });

  context('app/user-filters/more-filters-axes-set-up.js - UserFiltersMoreFiltersAxesSetUp', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'UserFiltersMoreFiltersAxesSetUp');
    });

    it('setAxes()', function() {});
    it('populate()', function() {});

  });

  context('app/user-filters/more-filters-axes.js - UserFiltersMoreFiltersAxes',
    function() {

      it('Object exists', function() {
        cy.window().should('have.property', 'UserFiltersMoreFiltersAxes');
      });

      it('clickEvent()', function() {});
      it('addAxis()', function() {});
      it('removeAxis()', function() {});
    });

  context('app/user-filters/more-filters-balance.js - UserFiltersMoreFiltersBalances', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'UserFiltersMoreFiltersBalances');
    });

    it('clickEvent()', function() {});
    it('addBalance()', function() {});
    it('removeBalance()', function() {});
  });

  context('app/user-filters/more-filters-measure-set-up.js - UserFiltersMoreFiltersMeasureSetUp', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'UserFiltersMoreFiltersMeasureSetUp');
    });

    it('setMeasures()', function() {});
    it('populate()', function() {});
  });

  context('app/user-filters/more-filters-measure.js - UserFiltersMoreFiltersMeasure', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'UserFiltersMoreFiltersMeasure');
    });

    it('clickEvent()', function() {});
    it('addMeasure()', function() {});
    it('removeMeasure()', function() {});

  });

  context('app/user-filters/more-filters-period-set-up.js - UserFiltersMoreFiltersPeriodSetUp', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'UserFiltersMoreFiltersPeriodSetUp');
    });

    it('setPeriods()', function() {});
    it('populateParentCollapse()', function() {});

  });

  context('app/user-filters/more-filters-period-set-up.js - UserFiltersMoreFiltersPeriod', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'UserFiltersMoreFiltersPeriod');
    });

    it('clickEvent()', function() {});
    it('parentClick()', function() {});
    it('childClick()', function() {});
    it('checkToggleAll()', function() {});
    it('checkToggle()', function() {});
    it('setStateFromParent()', function() {});
    it('setStateFromChild()', function() {});

  });

  context('app/user-filters/more-filters-scale-set-up.js - UserFiltersMoreFiltersScaleSetUp', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'UserFiltersMoreFiltersScaleSetUp');
    });

    it('setScales()', function() {});
    it('populate()', function() {});

  });

  context('app/user-filters/more-filters-scale.js - UserFiltersMoreFiltersScale', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'UserFiltersMoreFiltersScale');
    });

    it('clickEvent()', function() {});
    it('addScale()', function() {});
    it('removeScale()', function() {});

  });

  context('app/user-filters/sections.js - UserFiltersSections', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'UserFiltersSections');
    });

    it('clickEvent()', function() {});
  });

  context('app/user-filters/state.js - UserFiltersState', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'UserFiltersState');
    });

    it('setDataRadios()', function() {});
    it('setTagsRadio()', function() {});
    it('setSectionsRadios()', function() {});
    it('setUserSearch()', function() {});
    it('filterUpdates()', function() {});
    it('dataRadios()', function() {});
    it('tagRadios()', function() {});
    it('sections()', function() {});
    it('periods()', function() {});
    it('measures()', function() {});
    it('axes()', function() {});
    it('scales()', function() {});
    it('balances()', function() {});
    it('search()', function() {});
    it('setContinuedAtHighlight()', function() {});
  });

  context('app/user-filters/tag-radios.js - UserFiltersTagsRadios', function() {

    it('Object exists', function() {
      cy.window().should('have.property', 'UserFiltersTagsRadios');
    });

    it('clickEvent()', function() {});
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