/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

import { ConstantsFunctions } from "./functions";

describe('/src/ts/constants/functions.ts', () => {

    // emptyHTMLByID()
    describe('basic checks for emptyHTMLByID()', () => {
        it('is a function', () => {
            expect(typeof ConstantsFunctions.emptyHTMLByID).toEqual('function');
        });

        it('returns void', () => {
            expect(ConstantsFunctions.emptyHTMLByID(`test`)).toEqual(undefined);
        });
    });

    // setInlineFiles()
    describe('basic checks for setInlineFiles()', () => {
        it('is a function', () => {
            expect(typeof ConstantsFunctions.setInlineFiles).toEqual('function');
        });

        it('returns void', () => {
            expect(ConstantsFunctions.setInlineFiles([])).toEqual(undefined);
        });
    });

    //setMetaReports()
    describe('basic checks for setMetaReports()', () => {
        it('is a function', () => {
            expect(typeof ConstantsFunctions.setSections).toEqual('function');
        });

        it('returns void', () => {
            expect(ConstantsFunctions.setSections([])).toEqual(undefined);
        });
    });

    //setFormInformation()
    describe('basic checks for setFormInformation()', () => {
        it('is a function', () => {
            expect(typeof ConstantsFunctions.setFormInformation).toEqual('function');
        });

        it('returns void', () => {
            expect(ConstantsFunctions.setFormInformation([])).toEqual(undefined);
        });
    });

    //getFactLabel()
    describe('basic checks for getFactLabel()', () => {
        it('is a function', () => {
            expect(typeof ConstantsFunctions.getFactLabel).toEqual('function');
        });

        it('returns "Not Available."', () => {
            expect(ConstantsFunctions.getFactLabel([])).toEqual('Not Available.');
        });

        it('returns "Example."', () => {
            expect(ConstantsFunctions.getFactLabel([{ Label: 'Example.' }])).toEqual('Example.');
        });
    });

    //getCollapseToFactValue()
    describe('basic checks for getCollapseToFactValue()', () => {
        it('is a function', () => {
            expect(typeof ConstantsFunctions.getCollapseToFactValue).toEqual('function');
        });

        it('returns void', () => {
            expect(ConstantsFunctions.getCollapseToFactValue()).toEqual(undefined);
        });
    });

    //changeInlineFiles()
    describe('basic checks for changeInlineFiles()', () => {
        it('is a function', () => {
            expect(typeof ConstantsFunctions.changeInlineFiles).toEqual('function');
        });

        it('returns void', () => {
            expect(ConstantsFunctions.changeInlineFiles('')).toEqual(undefined);
        });
    });
});