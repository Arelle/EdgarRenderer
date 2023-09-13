/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */
import { FactMap } from "./map";

describe('/src/ts/fact-map/index.ts', () => {

    describe('basic checks for init()', () => {
        it('is a function', () => {
            expect(typeof FactMap.init).toEqual('function');
        });

        it('returns void', () => {
            const map = new Map();
            expect(FactMap.init(map)).toEqual(undefined);
        });
    });

    describe('basic checks for getAllPeriods()', () => {
        it('is a function', () => {
            expect(typeof FactMap.getAllPeriods).toEqual('function');
        });

        it('returns empty Object', () => {
            expect(FactMap.getAllPeriods()).toEqual({});
        });
    });

    describe('basic checks for getAllMeasures()', () => {
        it('is a function', () => {
            expect(typeof FactMap.getAllMeasures).toEqual('function');
        });

        it('returns empty Array', () => {

            expect(FactMap.getAllMeasures()).toEqual([]);
        });
    });

    describe('basic checks for getAllAxis()', () => {
        it('is a function', () => {
            expect(typeof FactMap.getAllAxis).toEqual('function');
        });

        it('returns empty Array', () => {

            expect(FactMap.getAllAxis()).toEqual([]);
        });
    });

    describe('basic checks for getAllMembers()', () => {
        it('is a function', () => {
            expect(typeof FactMap.getAllMembers).toEqual('function');
        });

        it('returns empty Array', () => {
            expect(FactMap.getAllMembers()).toEqual([]);
        });
    });

    describe('basic checks for getAllScales()', () => {
        it('is a function', () => {
            expect(typeof FactMap.getAllScales).toEqual('function');
        });

        it('returns void', () => {
            expect(FactMap.getAllScales()).toEqual([]);
        });
    });

    describe('basic checks for getByID()', () => {
        it('is a function', () => {
            expect(typeof FactMap.getByID).toEqual('function');
        });

        it('returns void', () => {

            expect(FactMap.getByID('')).toEqual(undefined);
        });
    });

    describe('basic checks for getByName()', () => {
        it('is a function', () => {
            expect(typeof FactMap.getByName).toEqual('function');
        });

        it('returns "Not Available."', () => {
            expect(FactMap.getByName()).toEqual('Not Available.');
        });
    });

    describe('basic checks for getByNameContextRef()', () => {
        it('is a function', () => {
            expect(typeof FactMap.getByNameContextRef).toEqual('function');
        });

        it('returns null', () => {
            expect(FactMap.getByNameContextRef()).toEqual(null);
        });
    });

    describe('basic checks for getEnabledFacts()', () => {
        it('is a function', () => {
            expect(typeof FactMap.getEnabledFacts).toEqual('function');
        });

        it('returns empty Array', () => {
            expect(FactMap.getEnabledFacts()).toEqual([]);
        });
    });

    describe('basic checks for getEnabledHighlightedFacts()', () => {
        it('is a function', () => {
            expect(typeof FactMap.getEnabledHighlightedFacts).toEqual('function');
        });

        it('returns empty Array', () => {
            expect(FactMap.getEnabledHighlightedFacts()).toEqual([]);
        });
    });

    describe('basic checks for getFullFacts()', () => {
        it('is a function', () => {
            expect(typeof FactMap.getFullFacts).toEqual('function');
        });

        it('returns Empty Array', () => {
            expect(FactMap.getFullFacts()).toEqual([]);
        });
    });

    describe('basic checks for getFactCount()', () => {
        it('is a function', () => {
            expect(typeof FactMap.getFactCount).toEqual('function');
        });

        it('returns "0"', () => {
            expect(FactMap.getFactCount()).toEqual('0');
        });
    });

    describe('basic checks for getFactCountForFile()', () => {
        it('is a function', () => {
            expect(typeof FactMap.getFactCountForFile).toEqual('function');
        });

        it('returns zero', () => {
            expect(FactMap.getFactCountForFile()).toEqual(0);
        });
    });

    describe('basic checks for setIsSelected()', () => {
        it('is a function', () => {
            expect(typeof FactMap.setIsSelected).toEqual('function');
        });

        it('returns undefined', () => {
            expect(FactMap.setIsSelected(null)).toEqual(undefined);
        });
    });

    describe('basic checks for getTagLine()', () => {
        it('is a function', () => {
            expect(typeof FactMap.getTagLine).toEqual('function');
        });

        it('returns empty Array', () => {
            expect(FactMap.getTagLine()).toEqual([]);
        });
    });
});