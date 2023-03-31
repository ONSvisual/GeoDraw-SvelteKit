import {base} from '$app/paths';
import {csvParse, autoType} from 'd3-dsv';
import {round, roundCount} from '../draw/misc-utils';
import {analyticsEvent} from '$lib/layout/AnalyticsBanner.svelte';

function makeUrl(table, codes, comp) {
  let cd = codes.join(";");
  let compcd = Array.isArray(comp.areacd) ? comp.areacd.join(";") : comp.areacd;
  let url = `https://www.nomisweb.co.uk/api/v01/dataset/${table.tableCode}.data.csv?date=latest&geography=MAKE|MyCustomArea|${cd},MAKE|${comp.areanm}|${compcd}&${table.cellCode}=${makeCells(table.categories)}&measures=${table.measures}&select=geography_name,${table.cellCode}_name,obs_value`;
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

export function aggregateData(data_raw, place, cats) {
  let indexed = {};
  data_raw.forEach(d => indexed[d.areacd] = d);
  const filtered = place.areacd.map(cd => indexed[cd]);
  let merged = {};
  cats.forEach(cat => merged[cat.label] = 0);
  filtered.forEach(row => {
    cats.forEach(cat => merged[cat.label] += row[`${cat.cells[0]}`]);
  });
  let output = [];
  cats.forEach(cat => output.push({areanm: place.areanm, category: cat.label, value: merged[cat.label]}));
  return output;
}

export default async function (table, state, comp, map = null) {
  let data;
  let codes = table.flatData ? state.codes : state.compressed;
  let _comp = {...comp};
  if (table.geo === "lsoa11") {
    codes = codes.map(c => map.lookup[c] ? map.lookup[c] : c).flat();
    _comp.areacd = map.parents[comp.areacd];
  }
  if (table.flatData) {
    const res = await fetch(`${base}/data/topics/${table.tableCode}.csv`);
    const data_raw = csvParse(await res.text(), autoType);
    const data_place = aggregateData(data_raw, {areanm: "MyCustomArea", areacd: codes}, table.categories);
    const data_comp = aggregateData(data_raw, _comp, table.categories);
    data = [...data_place, ...data_comp];
  } else {
    const url = makeUrl(table, codes, _comp);
    const res = await fetch(url);
    const str = (await res.text()).replace("GEOGRAPHY_NAME", "areanm").replace("OBS_VALUE", "value").replace(`${table.cellCode}_name`.toUpperCase(), "category");
    data = csvParse(str, autoType);
  }
  if (table.unit === "%" && table.measures === 20100) data = calcPercent(data);
  analyticsEvent({
    event: "topicSelect",
    topicName: table.label,
    topicCode: table.code
  });
  return ["population", "households"].includes(table.code) ? data.map(d => roundCount(d.value)) :
    ["gva", "gva_timeseries"].includes(table.code) ? data.map(d => round(d.value)) :
    data.map(d => d.value);
}