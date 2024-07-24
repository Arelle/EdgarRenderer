// node cypress/utils/helpers

export const filterArrayOfOjectsOnKeyValue = (array, key) => {
    const arrayMapped = array.map(item => [item[key], item])
    const itemsWithUniqueValOnKey = [...new Map(arrayMapped).values()]
    return itemsWithUniqueValOnKey
};

export const getFilingsWithHighestFactCount = (filings, numOfFilings) => {
    const filingsSorted = filings.sort((a, b) => (Number(a.factCount) < Number(b.factCount)) ? 1 : -1)
    const filingsWithMostFacts = filingsSorted.slice(0, numOfFilings)
    return filingsWithMostFacts
};
