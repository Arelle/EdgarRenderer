export const results = {
    numOfSpecFails: 13,
    numOfSpecPasses: 253,
    specFails: [
        {
            it: 'Fact Modal',
            should: 'should be able to move with arrow icon',
            command: 'get a[data-id="fact-identifier-6"]',
            reason: 'Timed out retrying after 8000ms: Expected to find element: a[data-id="fact-identifier-6"], but never found it.',
        },
        {
            it: 'Fact Modal',
            should: 'should show copy-able content with copy icon',
            command: 'get a[data-id="fact-identifier-6"]',
            reason: 'Timed out retrying after 8000ms: Expected to find element: a[data-id="fact-identifier-6"], but never found it.',
        },
        {
            it: 'Fact Modal',
            should: 'should be able to expand in size with corners icon',
            command: 'get a[data-id="fact-identifier-6"]',
            reason: 'Timed out retrying after 8000ms: Expected to find element: a[data-id="fact-identifier-6"], but never found it.',
        },
        {
            it: 'Fact Modal',
            should: 'should close when close icon clicked',
            command: 'get a[data-id="fact-identifier-6"]',
            reason: 'Timed out retrying after 8000ms: Expected to find element: a[data-id="fact-identifier-6"], but never found it.',
        },
        {
            it: 'Fact Modal',
            should: 'should be navigable via carousel controls',
            command: 'get a[data-id="fact-identifier-6"]',
            reason: 'Timed out retrying after 8000ms: Expected to find element: a[data-id="fact-identifier-6"], but never found it.',
        },
        {
            it: 'Fact Modal',
            should: 'should be able to click "breadcrumbs" to navigate carousel',
            command: 'get a[data-id="fact-identifier-6"]',
            reason: 'Timed out retrying after 8000ms: Expected to find element: a[data-id="fact-identifier-6"], but never found it.',
        },
        {
            it: 'Menu open as zip',
            should: 'bfb-20231002 8-K',
            command: 'get a[data-id="fact-identifier-6"]',
            reason: '404 not found',
        },
        {
            it: 'Change Fact link and bg colors yohe-20221231 10-K/A',
            should: 'should change Tagged Data colors',
            command: 'expect(greenActual).to.be.gte(greenExpect - moe).and.lte(greenExpect + moe)',
            commandLineNum: 24,
            reason: 'expected undefined to be a number or a date',
        },
        {
            it: 'Change Fact link and bg colors yohe-20221231 10-K/A',
            should: 'should change search Results colors',
        },
        {
            it: 'Change Fact link and bg colors yohe-20221231 10-K/A',
            should: 'should change Tag Shading (hover) colors',

        },
        {
            it: 'Change Fact link and bg colors yohe-20221231 10-K/A',
            should: 'should change text block indicator colors',
        },
    ],
    env: {
        domain: domains.local,
        skipScrapers: true,
        limitNumOfFilingsForTestRun: true,
        limitOfFilingsToTest: 3,
    }
}