/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

import { App } from "./app";

describe('/src/ts/app/app.ts', () => {

    // init()
    describe('basic checks for init()', () => {
        it('is a function', () => {
            expect(typeof App.init).toEqual('function');
        });

        it('returns void', () => {
            expect(App.init(false, () => {
                // callback
            })).toEqual(undefined);
        });
    });

    // initialSetup()
    describe('basic checks for initialSetup()', () => {
        it('is a function', () => {
            expect(typeof App.initialSetup).toEqual('function');
        });

        it('returns void', () => {
            expect(App.initialSetup()).toEqual(undefined);
        });
    });

    // additionalSetup()
    describe('basic checks for additionalSetup()', () => {
        it('is a function', () => {
            expect(typeof App.additionalSetup).toEqual('function');
        });

        it('returns void', () => {
            expect(App.additionalSetup()).toEqual(undefined);
        });
    });

    // handleFetchAndMerge()
    describe('basic checks for handleFetchAndMerge()', () => {
        it('is a function', () => {
            expect(typeof App.handleFetchAndMerge).toEqual('function');
        });

        it('returns true', () => {
            const input = {
                error: false,
                message: [],
                instance: [{
                    current: true,
                    instance: 0,
                    map: new Map(),
                    metaInstance: {},
                    xhtmls: [{
                        current: true,
                        loaded: true,
                        slug: '',
                        url: '',
                        xhtml: ''
                    }]
                }],
                sections: [],
                std_ref: {},
            };
            const multiInstanceLoad = false;
            expect(App.handleFetchAndMerge(input, multiInstanceLoad)).toEqual(true);
        });
    });
});