import * as echarts from 'echarts';
import { FactMap } from './map';
import { ConstantsFunctions } from '../constants/functions';
export const FactsChart = {
    toggle: (show: boolean) => {
        if (show) {
            FactsChart.chart1();
            window.addEventListener('resize', () => {
                echarts.getInstanceByDom(document.getElementById(`chart-1`) as HTMLElement)?.resize();
            });
        } else {
            echarts.getInstanceByDom(document.getElementById(`chart-1`) as HTMLElement)?.clear();
            ConstantsFunctions.emptyHTMLByID('chart-title-1');
            ConstantsFunctions.emptyHTMLByID('chart-subtitle-1');
            ConstantsFunctions.emptyHTMLByID('chart-select-1');
        }
    },

    chart1: () => {
        const breakdown = FactMap.getTagLine();

        if (breakdown.length) {
            const chart = document.getElementById(`chart-1`);
            const myChart = echarts.init(chart);
            const createGraph = (input = 0) => {
                const chosenFact: {
                    name: string,
                    data: Array<{
                        period_dates: Array<string>,
                        value: number
                    }>
                } = Object.assign({}, breakdown[input]);
                ConstantsFunctions.emptyHTMLByID('chart-title-1');
                ConstantsFunctions.emptyHTMLByID('chart-subtitle-1');
                const chartTitle = document.createTextNode(chosenFact.name.split(':')[1].replace(/([a-z])([A-Z])/g, '$1 $2')
                    .replace(/\b([A-Z]+)([A-Z])([a-z])/, '$1 $2$3')
                    .replace(/^./, (str: string) => { return str.toUpperCase() }));
                document.getElementById('chart-title-1')?.append(chartTitle);

                const chartSubTitle = document.createTextNode(chosenFact.name);
                document.getElementById('chart-subtitle-1')?.append(chartSubTitle);
                const data = new Set();
                chosenFact.data = chosenFact.data.reduce((accumulator, current, index) => {
                    if (current.period_dates) {
                        if (current.period_dates.length === 1) {
                            accumulator[index] = { period_dates: current.period_dates[0], value: current.value };
                        } else {
                            accumulator = accumulator.concat(current.period_dates.map((currentNested) => {
                                return { period_dates: currentNested, value: current.value };
                            }));
                        }
                    }
                    return accumulator;
                }, []).filter((element) => {
                    if (data.has(element.period_dates)) {
                        return false;
                    }
                    data.add(element.period_dates);
                    return true;
                }).sort((first: { period_dates: string | number | Date; }, second: { period_dates: string | number | Date; }) => {
                    return new Date(first.period_dates) - new Date(second.period_dates);
                });

                const option = {

                    tooltip: {
                        trigger: 'item',
                    },
                    legend: {
                        orient: 'vertical',
                        left: 'left'
                    },
                    xAxis: {
                        type: 'category',
                        data: chosenFact.data.map((current) => {
                            return current.period_dates
                        }),
                    },
                    yAxis: {
                        type: 'value'
                    },
                    series: [
                        {
                            type: 'line',
                            smooth: true,
                            data: chosenFact.data.map((current) => { return current.value }),
                        }
                    ]
                };
                myChart.setOption(option, true);
            };

            const select = document.createElement('select');
            select.classList.add('form-select');
            select.classList.add('mx-2');

            breakdown.forEach((current, index) => {
                const option = document.createElement('option');
                if (index === 0) {
                    option.setAttribute('selected', 'true');
                }
                option.setAttribute('value', index);
                const optionText = document.createTextNode(`${index + 1}: ${current.name.split(':')[1].replace(/([a-z])([A-Z])/g, '$1 $2')
                    .replace(/\b([A-Z]+)([A-Z])([a-z])/, '$1 $2$3')
                    .replace(/^./, (str: string) => { return str.toUpperCase() })}`);
                option.append(optionText);
                select.append(option);
            });

            document.getElementById('chart-select-1')?.append(select);

            select.addEventListener('change', (event) => {
                createGraph(event.target.value as number);
            });

            createGraph();
        }
    }
};