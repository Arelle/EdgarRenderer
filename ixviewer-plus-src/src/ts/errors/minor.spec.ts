/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

import { ErrorsMinor } from "./minor";

describe('/src/ts/errors/minor.ts', () => {

    //unknownError()
    describe('basic checks for inactive()', () => {
        it('is a function', () => {
            expect(typeof ErrorsMinor.unknownError).toEqual('function');
        });

        it('returns void', () => {
            expect(ErrorsMinor.unknownError()).toEqual(undefined);
        });
    });

    //factNotFound()
    describe('basic checks for factNotFound()', () => {
        it('is a function', () => {
            expect(typeof ErrorsMinor.factNotFound).toEqual('function');
        });

        it('returns void', () => {
            expect(ErrorsMinor.factNotFound()).toEqual(undefined);
        });
    });
});