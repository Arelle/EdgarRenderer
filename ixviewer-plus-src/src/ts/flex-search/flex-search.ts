import { Document as FlexSearchDocument } from "flexsearch";
import { FactMap } from "../facts/map";
import { Facts } from "../facts/facts";
import { UserFiltersDropdown } from "../user-filters/dropdown";
import { UserFiltersState } from "../user-filters/state";
import { Fact } from "../interface/instance";
import { SingleFact } from "../interface/fact";

export class FlexSearch {
    static document = {
        id: '',
        field: undefined
    }

    // TODO: look into https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API

    static indexCount: number;


    static init(mapOfFacts: Map<string, SingleFact>): void {
        this.document = new FlexSearchDocument({
            tokenize: 'full',
            document: {
                id: 'id',
                index: [
                    'content', 'raw', 'factname', 'contextRef', 'labels', 'definitions', 'period',
                    'measure', 'axis', 'member', 'scale', 'balance', 'custom', 'amount',
                    'text', 'calculation', 'negative', 'additional', 'dimensions',
                    'topic', 'subtopic', 'paragraph', 'publisher', 'section'
                ]
            }
        });

        FlexSearch.indexCount = mapOfFacts.size;

        FactMap.init(mapOfFacts);

        const references = (input: Fact, term: string) => {
            if (input.references) {
                const potentialReference = input?.references?.reduce((acc, current) => {
                    return `${acc} ${(current && current[term]) ? current[term] : ''}`
                }, '').trim();
                return potentialReference.length === 0 ? null : potentialReference;
            }
            return null;
        };
        FactMap.map.forEach((currentValue, currentIndex) => {
            this.document.add(
                {
                    'id': currentIndex,
                    'content': `${currentValue?.filter?.content}`,
                    'raw': currentValue?.format ? `${currentValue?.raw.toString()}` : null,
                    'factname': currentValue?.name,
                    'contextRef': currentValue?.contentRef,
                    'labels': currentValue.filter?.labels,
                    'definitions': currentValue?.filter?.definitions,
                    'period': currentValue.period,
                    'measure': currentValue.measure,
                    'axis': currentValue?.segment?.map(element => element.axis),
                    'member': currentValue?.segment?.map(element => element.dimension),
                    'scale': currentValue.scale,
                    'balance': currentValue.balance,
                    // tags
                    'custom': currentValue.isCustom?.toString(),
                    // data
                    'amount': currentValue.isAmountsOnly?.toString(),
                    'text': currentValue.isTextOnly?.toString(),
                    'calculation': ((currentValue?.calculations?.length > 0) && (!currentValue?.segment?.map(element => element.dimension).length)).toString(),
                    'negative': currentValue.isNegativeOnly ? currentValue.isNegativeOnly.toString() : null,
                    'additional': currentValue.isAdditional ? currentValue.isAdditional.toString() : null,
                    // references
                    'topic': references(currentValue, 'Topic'),
                    'subtopic': references(currentValue, 'SubTopic'),
                    'paragraph': references(currentValue, 'Paragraph'),
                    'publisher': references(currentValue, 'Publisher'),
                    'section': references(currentValue, 'Section'),
                }
            );
        });
    }

    static searchFacts(searchOptions, suggest = false) {
        const optionFields = [
            null,
            'factname',
            'content',
            'labels',
            'definitions',
            'dimensions',
            'references',
        ];
        const searchObject = searchOptions.options?.reduce((acc: Array<{ field: string, query: string, bool: string, limit: number }>, current) => {
            if (optionFields[current]) {
                if (optionFields[current] === 'content') {
                    acc.push({
                        field: 'raw',
                        query: searchOptions.value as string,
                        bool: 'or',
                        limit: FlexSearch.indexCount,
                    });
                } else if (optionFields[current] === 'references') {
                    // we add multiple
                    acc.push({
                        field: 'topic',
                        query: searchOptions.value as string,
                        bool: 'or',
                        limit: FlexSearch.indexCount,
                    });
                    acc.push({
                        field: 'subtopic',
                        query: searchOptions.value as string,
                        bool: 'or',
                        limit: FlexSearch.indexCount,
                    });
                    acc.push({
                        field: 'paragraph',
                        query: searchOptions.value as string,
                        bool: 'or',
                        limit: FlexSearch.indexCount,
                    });
                    acc.push({
                        field: 'publisher',
                        query: searchOptions.value as string,
                        bool: 'or',
                        limit: FlexSearch.indexCount,
                    });
                    acc.push({
                        field: 'section',
                        query: searchOptions.value as string,
                        bool: 'or',
                        limit: FlexSearch.indexCount,
                    });
                } else {
                    // we add just one
                    acc.push({
                        field: optionFields[current] as string,
                        query: searchOptions.value as string,
                        bool: 'or',
                        limit: FlexSearch.indexCount,
                    });
                }
            }
            return acc;
        }, []);
        const ids = this.document.search(searchObject);
        const uniqueArray = [...new Set([].concat(...ids.map(current => current.result)))];
        if (suggest) {
            return uniqueArray;
        }
        FactMap.setHighlightedFacts(uniqueArray);
        Facts.inViewPort(true);
        Facts.updateFactCount();
    }

    static filterFacts() {

        const dataFields = [
            null, 'amount', 'text', 'calculation', 'negative', 'additional'
        ];

        const filterState = {
            data: dataFields[UserFiltersState.getDataRadios],
            tags: UserFiltersState.getTagsRadios,
            axis: UserFiltersState.getAxes,
            member: UserFiltersState.getMembers,
            balance: UserFiltersState.getBalance,
            measure: UserFiltersState.getMeasure,
            period: UserFiltersState.getPeriod,
            scale: UserFiltersState.getScale,
            type: UserFiltersState.getType,
        };

        const searchObject = Object.keys(filterState).reduce((accumulator: Array<{ field: string, query: string, bool: string, limit: number }>, current) => {
            if (current === 'data') {
                if (filterState[current]) {
                    accumulator.push({
                        field: filterState[current] as string,
                        query: 'true',
                        bool: 'or',
                        limit: FlexSearch.indexCount
                    });
                }
            } else if (current === 'tags') {
                if (filterState[current] === 1 || filterState[current] === 2) {
                    accumulator.push({
                        field: 'custom',
                        query: filterState[current] === 1 ? 'false' : 'true',
                        bool: 'or',
                        limit: FlexSearch.indexCount
                    });
                }
            } else {
                accumulator.push(filterState[current].map((nested) => {
                    return {
                        field: current,
                        query: nested,
                        bool: 'or',
                        limit: FlexSearch.indexCount
                    };
                }));
            }
            return accumulator;
        }, []).flat();

        if (searchObject.length > 0) {
            const ids = this.document.search(searchObject);
            const uniqueArray = [...[].concat(...ids.map(current => current.result))];
            FactMap.setEnabledFacts(uniqueArray);
        } else {
            FactMap.resetEnabledFacts();
        }
        Facts.inViewPort(true);
        UserFiltersDropdown.init();
        Facts.updateFactCount();
    }


}