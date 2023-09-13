import { ErrorsMinor } from "../errors/minor";
import { Facts, SingleFact } from "../interface/fact";
import { UserFiltersState } from "../user-filters/state";

export const FactMap: {
    map: Map<string, Facts>,
    init: (mapOfFacts: Map<string, unknown>) => void,
    setHighlightedFacts: (arrayOfIDs: Array<string>) => void,
    setEnabledFacts: (arrayOfIDs: Array<string>) => void,
    getAllMeasures: () => Array<string>,
    getAllAxis: () => Array<string>,
    getByID: (id: string) => Facts | void,
    getEnabledFacts: () => Array<{ id: string, isAdditional: boolean }>,
    getEnabledHighlightedFacts: () => Array<{ id: string, isAdditional: boolean }>,
    getFactCountForFile: (input: string, returnAsString: boolean) => string | number,
    getFactCount: () => string,
    getFullFacts: () => Array<SingleFact>,
    getByNameContextRef: () => SingleFact | null,
    getByName: () => string,
    getAllScales: () => Array<string>,
    getAllMembers: () => Array<string>,
    getAllPeriods: () => { [key: string]: [] },
    getTagLine: () => [],
    setIsSelected: (input: string | null) => void
} = {

    map: new Map(),

    init: (mapOfFacts: Map<string, unknown>): void => {

        FactMap.map.clear();

        Array.from(new Map([...mapOfFacts]), (entry) => {
            if (entry[1].id) {
                FactMap.map.delete(entry[0]);
                FactMap.map.set(entry[1].id, entry[1]);
            }
        });
    },

    setHighlightedFacts: (arrayOfIDs) => {
        FactMap.map.forEach((currentValue) => {
            if (arrayOfIDs.includes(currentValue.id)) {
                currentValue.isHighlight = true;
            } else {
                currentValue.isHighlight = false;
            }
        });
    },

    setEnabledFacts: (arrayOfIDs) => {
        FactMap.map.forEach((currentValue) => {
            if (arrayOfIDs.includes(currentValue.id)) {
                currentValue.isEnabled = true;
            } else {
                currentValue.isEnabled = false;
            }
        });
    },

    resetEnabledFacts: () => {
        FactMap.map.forEach((currentValue) => {
            currentValue.isEnabled = true;
        });
    },

    getAllPeriods: () => {
        const periods = Array.from(new Map([...FactMap.map]), (entry) => {
            return entry[1].period;
        }).filter(Boolean).sort((first, second) => {
            return second.slice(-4) - first.slice(-4);
        });

        return [...new Set(periods)].reduce((acc, current) => {
            if (Object.prototype.hasOwnProperty.call(acc, current.slice(-4))) {
                acc[current.slice(-4)].values.push(current);
            } else {
                acc[current.slice(-4)] = {
                    values: [current]
                };
            }
            return acc;
        }, {});
    },

    getAllMeasures: () => {
        const measures = Array.from(new Map([...FactMap.map]), (entry) => {
            return entry[1].measure;
        }).filter(Boolean).sort();
        return [...new Set(measures)]
    },

    getAllAxis: () => {
        const axis = Array.from(new Map([...FactMap.map]), (entry) => {
            return entry[1].segment ? entry[1].segment.map((current) => {
                if (current.type) {
                    return { type: current.type, value: current.axis };
                }
            }).filter(Boolean) : null;
        }).filter(Boolean);
        const unique = [...new Map(axis.flat().map(item => [item['value'], item])).values()].sort((a, b) => {
            if (a.value.split(':')[1] < b.value.split(':')[1]) return -1;
            if (a.value.split(':')[1] > b.value.split(':')[1]) return 1;
            return 0;
        });
        return unique;
    },

    getAllMembers: () => {
        const members = Array.from(new Map([...FactMap.map]), (entry) => {
            return entry[1].segment ? entry[1].segment.map((current) => {
                if (current.dimension) {
                    return { type: current.type, value: current.dimension };
                }
            }).filter(Boolean) : null;
        }).filter(Boolean);
        const unique = [...new Map(members.flat().map(item => [item['value'], item])).values()].sort((a, b) => {
            if (a.value.split(':')[1] < b.value.split(':')[1]) return -1;
            if (a.value.split(':')[1] > b.value.split(':')[1]) return 1;
            return 0;
        });
        return unique;
    },

    getAllScales: () => {
        const scalesOrder = [
            "Trillions",
            "Hundred Billions",
            "Ten Billions",
            "Billions",
            "Hundred Millions",
            "Ten Millions",
            "Millions",
            "Hundred thousands",
            "Ten thousands",
            "Thousands",
            "Hundreds",
            "Tens",
            "Zero",
            "Tenths",
            "Hundredths",
            "Thousandths",
            "Ten Thousandths",
            "Hundred Thousandths",
            "Millionths"
        ];

        const uniqueScales = [...new Set(Array.from(new Map([...FactMap.map]), (entry) => {
            return entry[1].scale;
        }).filter(Boolean))].sort((a, b) => {
            return scalesOrder.indexOf(a) - scalesOrder.indexOf(b);
        });
        return uniqueScales;
    },

    getByID: (id: string) => {
        if (FactMap.map.has(id)) {
            return FactMap.map.get(id);
        } else {
            ErrorsMinor.factNotFound();
            return;
        }

    },

    getByName: (firstName: string, secondName: string | boolean = false) => {
        const names = Array.from(new Map([...FactMap.map]), (entry) => {
            if (entry[1].name === firstName) {

                return entry[1].value;
            }
        }).filter(Boolean);
        if (secondName) {
            return names.length ? `${names[0]} / ${FactMap.getByName(secondName)}` : 'Not Available.'
        }
        return names.length ? names[0] : 'Not Available.'
    },

    getByNameContextRef: (name: string, contextRef: string) => {
        const fact = Array.from(new Map([...FactMap.map]), (entry) => {
            if (entry[1].name === name && entry[1].contextRef === contextRef) {
                return entry[1];
            }
        }).filter(Boolean);

        return fact.length ? fact[0] : null;
    },

    getEnabledFacts: () => {
        return Array.from(new Map([...FactMap.map]), (entry) => {
            if (entry[1].isEnabled) {
                return {
                    id: entry[1].id,
                    isAdditional: entry[1].isAdditional,
                };
            }
        }).filter(Boolean);
    },

    getEnabledHighlightedFacts: () => {
        return Array.from(new Map([...FactMap.map]), (entry) => {
            if (entry[1].isEnabled && entry[1].isHighlight) {
                return {
                    id: entry[1].id,
                    isAdditional: entry[1].isAdditional,
                };
            }
        }).filter(Boolean);
    },

    getFullFacts: () => {
        const includeHighlights = Object.keys(UserFiltersState.getUserSearch).length !== 0;
        return Array.from(new Map([...FactMap.map]), (entry) => {
            if (includeHighlights) {
                if (entry[1].isEnabled && entry[1].isHighlight) {
                    return entry[1];
                }
            } else {
                if (entry[1].isEnabled) {
                    return entry[1];
                }
            }
        }).filter(Boolean);
    },

    getFactCount: () => {
        const includeHighlights = Object.keys(UserFiltersState.getUserSearch).length !== 0;
        const toReturn = Array.from(new Map([...FactMap.map]), (entry) => {
            if (includeHighlights) {
                if (entry[1].isEnabled && entry[1].isHighlight) {
                    return {
                        file: entry[1].file
                    };
                }
            } else {
                if (entry[1].isEnabled) {
                    return {
                        file: entry[1].file
                    };
                }
            }
        }).filter(Boolean)

        return toReturn.length.toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",");


    },

    getFactCountForFile: (input: string, returnAsString = false) => {
        const includeHighlights = Object.keys(UserFiltersState.getUserSearch).length !== 0;
        const toReturn = Array.from(new Map([...FactMap.map]), (entry) => {
            if (entry[1].file === input) {
                if (includeHighlights) {
                    if (entry[1].isEnabled && entry[1].isHighlight) {
                        return {
                            file: entry[1].file
                        };
                    }
                } else {
                    if (entry[1].isEnabled) {
                        return {
                            file: entry[1].file
                        };
                    }
                }
            }
        }).filter(Boolean).length;
        if (returnAsString) {
            return toReturn.toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
        return toReturn;
    },

    setIsSelected: (input: string | null) => {
        const selected = Array.from(document.querySelectorAll(`[selected-fact="true"]`));
        selected.forEach((current) => {
            current.setAttribute('selected-fact', 'false');
        });
        const toSelect = Array.from(document.querySelectorAll(`[data-id="${input}"], [id="${input}"]`));
        toSelect.forEach((current) => {
            current.setAttribute('selected-fact', 'true');
        });
    },


    getTagLine: () => {
        const breakdown = Array.from(new Map([...FactMap.map]), (entry) => {
            if (entry[1].isAmountsOnly) {
                return { name: entry[1].name, period_dates: entry[1].period_dates, value: +entry[1].value };
            }
        }).filter(Boolean).reduce((
            acc: Array<{ name: string, data: Array<{ period_dates: Array<string>, value: number }> }> = [],
            current: { name: string, period_dates: Array<string>, value: number }
        ) => {
            const index = acc.findIndex(element => element.name === current.name);
            if (index > -1) {
                acc[index].data.push({ period_dates: current.period_dates, value: current.value });
            } else {
                acc.push({ name: current.name, data: [{ period_dates: current.period_dates, value: current.value }] });
            }
            return acc;
        }, []).filter(element => {
            return element.data.length > 1 ? element : null;
        }).sort((first, second) => {
            return first.name.localeCompare(second.name);
        });
        return breakdown;
    },

};

