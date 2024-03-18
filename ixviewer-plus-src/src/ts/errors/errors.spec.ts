/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment 
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

import { Errors } from "./errors";

describe('/src/ts/errors/index.ts', () => {

  describe('basic checks for updateMainContainerHeight()', () => {
    it('is a function', () => {
      expect(typeof Errors.updateMainContainerHeight).toEqual('function');
    });

    it('returns void', () => {
      expect(Errors.updateMainContainerHeight(false)).toEqual(undefined);
    });
  });

  describe('param checks for updateMainContainerHeight()', () => {
    it('to have been called with => true', () => {
      expect(Errors.updateMainContainerHeight(true)).toEqual(undefined);
    });

    it('to have been called with => false', () => {
      expect(Errors.updateMainContainerHeight(false)).toEqual(undefined);
    });
  });
});