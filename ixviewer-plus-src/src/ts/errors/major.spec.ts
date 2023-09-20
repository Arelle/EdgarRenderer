/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

import { ErrorsMajor } from "./major";

describe('/src/ts/errors/major.ts', () => {
  //inactive()
  describe('basic checks for inactive()', () => {
    it('is a function', () => {
      expect(typeof ErrorsMajor.inactive).toEqual('function');
    });

    it('returns void', () => {
      expect(ErrorsMajor.inactive()).toEqual(undefined);
    });
  });

  describe('param checks for inactive()', () => {
    it('to have been called with => undefined', () => {
      expect(ErrorsMajor.inactive()).toEqual(undefined);
    });
  });

  // formLinksNotFound()
  describe('basic checks for formLinksNotFound()', () => {
    it('is a function', () => {
      expect(typeof ErrorsMajor.formLinksNotFound).toEqual('function');
    });

    it('returns void', () => {
      expect(ErrorsMajor.formLinksNotFound()).toEqual(undefined);
    });
  });

  describe('param checks for formLinksNotFound()', () => {
    it('to have been called with => undefined', () => {
      expect(ErrorsMajor.formLinksNotFound()).toEqual(undefined);
    });
  });

  // urlParams()
  describe('basic checks for urlParams()', () => {
    it('is a function', () => {
      expect(typeof ErrorsMajor.urlParams).toEqual('function');
    });

    it('returns void', () => {
      expect(ErrorsMajor.urlParams()).toEqual(undefined);
    });
  });

  describe('param checks for urlParams()', () => {
    it('to have been called with => undefined', () => {
      expect(ErrorsMajor.urlParams()).toEqual(undefined);
    });
  });

  //cors ()
  describe('basic checks for cors()', () => {
    it('is a function', () => {
      expect(typeof ErrorsMajor.cors).toEqual('function');
    });

    it('returns void', () => {
      expect(ErrorsMajor.cors({ host: 'test' })).toEqual(undefined);
    });
  });

  describe('param checks for cors()', () => {
    it('to have been called with => { host: "test" }', () => {
      expect(ErrorsMajor.cors({ host: 'test' })).toEqual(undefined);
    });
  });
});