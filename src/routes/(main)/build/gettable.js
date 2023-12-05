import {csvParse, autoType} from 'd3-dsv';
import {roundCount} from '$lib/util/functions';
import {analyticsEvent} from '$lib/layout/AnalyticsBanner.svelte';

function makeUrl(table, tableCode, codes, compcds) {
  let url = table.cellCode ? `https://www.nomisweb.co.uk/api/v01/dataset/${tableCode}.data.csv?date=${table.date}&geography=MAKE|MyCustomArea|${codes.join(";")},MAKE|ComparisonArea|${compcds.join(";")}&${table.cellCode}=${makeCells(table.categories)}&measures=${table.measures}&select=geography_name,${table.cellCode}_name,obs_value` :
  `https://www.nomisweb.co.uk/api/v01/dataset/${tableCode}.data.csv?date=${table.date}&geography=MAKE|MyCustomArea|${codes.join(";")},MAKE|ComparisonArea|${compcds.join(";")}&measures=${table.measures}&select=geography_name,obs_value`;
  if (table.queryExt) url += table.queryExt;
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

function calcPercent(data) {
  let totals = {};
  data.forEach(d => {
    if (!totals[d.areanm]) {
      totals[d.areanm] = d.value;
    } else {
      totals[d.areanm] += d.value
    }
  });
  let dataNew = JSON.parse(JSON.stringify(data));
  dataNew.forEach(d => d.value = +((d.value / totals[d.areanm]) * 100).toFixed(1));
  return dataNew;
}

function sumData(data1, data2) {
  if (!data1?.[0]) return data2;
  if (!data2?.[0]) return data1;

  let baseData = data2.length > data1.length ? data2 : data1;
  let addData = data2.length > data1.length ? data1 : data2;
  
  for (let i = 0; i < baseData.length; i ++) {
    const match = addData.find(d => d.areanm === baseData[i].areanm && d.category === baseData[i].category);
    if (match) {
      baseData[i].value += match.value;
    }
  }
  return baseData;
}

function filterCodes(codes, level = "none") {
  return level === "none" ? codes :
    level === "lower" ? codes.filter(c => ["01", "02"].includes(c.slice(1, 3))) :
    codes.filter(c => !["01", "02"].includes(c.slice(1, 3)));
}

export default async function (table, state) {
  const codes = table?.geoDate === 2011 ? state.compressed11 : state.compressed;
  const comp = !state.comparison ? [] : table?.geoDate === 2011 ? state.comparison.codes11 : state.comparison.codes;
  // console.log("getTable", state, codes, comp)
  let data;
  for (const tableCode of [table.tableCode].flat()) {
    const filter = typeof table.tableCode === "string" ? "none" :
      tableCode === table.tableCode[0] ? "lower" : "higher";
    const cds = filterCodes(codes, filter);
    const compcds = filterCodes(comp, filter);
    const url = makeUrl(table, tableCode, cds, compcds);
    const res = await fetch(url);
    const str = (await res.text()).replace("GEOGRAPHY_NAME", "areanm").replace("OBS_VALUE", "value").replace(`${table.cellCode}_name`.toUpperCase(), "category");
    data = sumData(data, csvParse(str, autoType));
  }
  if (table.unit === "%" && table.measures === 20100) data = calcPercent(data);
  analyticsEvent({
    event: "topicSelect",
    topicName: table.label,
    topicCode: table.code
  });
  return ["population", "households", "births"].includes(table.code) ? data.map(d => roundCount(d.value)) : data.map(d => d.value);
}