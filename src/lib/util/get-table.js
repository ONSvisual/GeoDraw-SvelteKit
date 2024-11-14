import { csvParse, autoType } from 'd3-dsv';
import { roundCount } from '$lib/util/functions';
import { analyticsEvent } from '$lib/layout/AnalyticsBanner.svelte';

function makeUrl(table, codes, comp) {
  let url = `https://www.nomisweb.co.uk/api/v01/dataset/${table.tableCode}.data.csv?date=latest&geography=MAKE|MyCustomArea|${codes.join(";")},MAKE|ComparisonArea|${comp}&${table.cellCode}=${makeCells(table.categories)}&measures=${table.measures}&select=geography_name,${table.cellCode}_name,obs_value`;
  if (table.queryExt) url += table.queryExt;
  console.log(url)
  return url;
}

function makeCells(categories) {
  let cells = [];
  if (categories.map(c => c.cells.length).reduce((a, b) => a + b, 0) > categories.length) {
    categories.forEach(c => {
      cells.push(`MAKE|${c.label}|${c.cells.join(";")}`);
    });
  } else {
    cells = categories.map(c => c.cells[0]);
  }
  return cells.join(",");
};

// function calcPercent(data) {
//   let totals = {};
//   data.forEach(d => {
//     if (!totals[d.areanm]) {
//       totals[d.areanm] = d.value;
//     } else {
//       totals[d.areanm] += d.value
//     }
//   });
//   let dataNew = JSON.parse(JSON.stringify(data));
//   dataNew.forEach(d => {
//     d.count = d.value
//     d.value = +((d.value / totals[d.areanm]) * 100).toFixed(1);
//   });
//   return dataNew;
// }

function processNomiswebData(data, table) {

  const hasBothCountAndPercentage = table.measures.length === 2;

  const processedData = [];

  if(hasBothCountAndPercentage){
    for(let i=1;i<data.length;i+=2){
      processedData.push({
        ...data[i],
        count: data[i-1].value,
        percentage:data[i].value,
        originalValue:data[i].value
      })
    }
    return processedData;
  }else{
    return data.map(d => {
      const count = d.value;
  
      // Conditionally handle rounding for specific types
      const processedCount = ["population", "households"].includes(table.code)
        ? roundCount(count)
        : count;
  
      return { 
        ...d,
        value:processedCount,
        count: processedCount,
        originalValue: count
      };
    })
    };
  }

export default async function fetchNomiswebData(table, state, comp = "K04000001") {
  const codes = table.onlyOA ? state.codes : state.compressed;
  const url = makeUrl(table, codes, comp);
  const res = await fetch(url);
  const str = (await res.text())
    .replace("GEOGRAPHY_NAME", "areanm")
    .replace("OBS_VALUE", "value")
    .replace(`${table.cellCode}_name`.toUpperCase(), "category");
  
  let data = csvParse(str, autoType);

  // Analytical tracking
  analyticsEvent({
    event: "topicSelect",
    topicName: table.label,
    topicCode: table.code
  });

  // If the table is count-based, calculate percentages
  // if (table.unit === "%" && table.measures === 20100) {
    data = processNomiswebData(data, table);
  // }

  return data;
}