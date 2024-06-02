/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

import { Constants } from "./constants";

describe('/src/ts/constants/indeex.ts', () => {

    // version
    describe('basic checks for version', () => {
        it('is a stirng', () => {
            expect(typeof Constants.version).toEqual('string');
        });
    });

    //scrollPosition
    describe('basic checks for scrollPosition', () => {
        it('is a string', () => {
            expect(typeof Constants.scrollPosition).toEqual('string');
        });
    });

    //hoverOption
    describe('basic checks for hoverOption', () => {
        it('is a string', () => {
            expect(typeof Constants.hoverOption).toEqual('boolean');
        });
    });

    //getHTMLAttributes
    describe('basic checks for getHTMLAttributes', () => {
        it('is a object', () => {
            expect(typeof Constants.getHTMLAttributes).toEqual('object');
        });
    });

    //getPaginationPerPage
    describe('basic checks for getPaginationPerPage', () => {
        it('is a number', () => {
            expect(typeof Constants.getPaginationPerPage).toEqual('number');
        });
    });

    //getHtmlOverallFactsCount
    describe('basic checks for getHtmlOverallFactsCount', () => {
        it('is a string', () => {
            expect(typeof Constants.getHtmlOverallFactsCount).toEqual('string');
        });
    });

    //getMetaSourceDocuments
    describe('basic checks for getMetaSourceDocuments', () => {
        it('is a array', () => {
            expect(typeof Constants.getMetaSourceDocuments).toEqual('object');
        });
    });

    //getMetaTags
    describe('basic checks for getMetaTags', () => {
        it('is a array', () => {
            expect(typeof Constants.getMetaTags).toEqual('object');
        });
    });

    //getInstanceFiles
    describe('basic checks for getInstanceFiles', () => {
        it('is a array', () => {
            expect(typeof Constants.getInstanceFiles).toEqual('object');
        });
    });

    //getInlineFiles
    describe('basic checks for getInlineFiles', () => {
        it('is a array', () => {
            expect(typeof Constants.getInlineFiles).toEqual('object');
        });
    });

    //getMetaReports
    describe('basic checks for getMetaReports', () => {
        it('is a array', () => {
            expect(typeof Constants.sections).toEqual('object');
        });
    });

    //getStdRef
    describe('basic checks for getStdRef', () => {
        it('is a array', () => {
            expect(typeof Constants.getStdRef).toEqual('object');
        });
    });

    //getFormInformation
    describe('basic checks for getFormInformation', () => {
        it('is null', () => {
            expect(typeof Constants.getFormInformation).toEqual('undefined');
        });
    });

    //getMetaCustomPrefix
    describe('basic checks for getMetaCustomPrefix', () => {
        it('is a array', () => {
            expect(typeof Constants.getMetaCustomPrefix).toEqual('object');
        });
    });

    //getMetaDts
    describe('basic checks for getMetaDts', () => {
        it('is a array', () => {
            expect(typeof Constants.getMetaDts).toEqual('object');
        });
    });

    //getMetaDocuments
    describe('basic checks for getMetaDocuments', () => {
        it('is a function', () => {
            expect(typeof Constants.getMetaDocuments).toEqual('function');
        });
    });

});