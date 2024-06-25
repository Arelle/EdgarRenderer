/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

import { FetchAndMerge } from '../fetch-merge/fetch-merge';

self.onmessage = ({ data }) => {
    const fetchAndMerge = new FetchAndMerge(data);
    fetchAndMerge.init().then(data => {
        self.postMessage(data);
    });
};