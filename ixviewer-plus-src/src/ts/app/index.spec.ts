/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

import { App } from "./";

describe('/src/ts/app/index.ts', () => {

    // init()
    describe('basic checks for init()', () => {
        it('is a function', () => {
            expect(typeof App.init).toEqual('function');
        });

        it('returns void', () => {
            expect(App.init(false, () => { })).toEqual(undefined);
        });
    });

    // initialSetup()
    //describe('basic checks for initialSetup()', () => { });

    // additionalSetup()
    //describe('basic checks for additionalSetup()', () => { });

    // emptySidebars()
    //describe('basic checks for emptySidebars()', () => { });

    // handleFetchAndMerge()
    //describe('basic checks for handleFetchAndMerge()', () => { });
});