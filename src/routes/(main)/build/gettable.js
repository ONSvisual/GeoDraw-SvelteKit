import {get} from 'svelte/store'
import {base} from '$app/paths';
import {csvParse, autoType} from 'd3-dsv';
import {roundCount} from '$lib/util/functions';
import {centroids} from '$lib/stores/mapstore';
import {analyticsEvent} from '$lib/layout/AnalyticsBanner.svelte';

function makeUrl(table, tableCode, codes, compcds) {
  const geography = `MAKE|MyCustomArea|${codes.join(";")},MAKE|ComparisonArea|${compcds.join(";")}`;
  let url = table.cellCode === "date" ? `https://www.nomisweb.co.uk/api/v01/dataset/${tableCode}.data.csv?date=${makeCells(table)}&geography=${geography}&measures=${table.measures}&select=geography_name,${table.cellCode}_name,obs_value` :
   table.cellCode ? `https://www.nomisweb.co.uk/api/v01/dataset/${tableCode}.data.csv?date=${table.date}&geography=${geography}&${table.cellCode}=${makeCells(table)}&measures=${table.measures}&select=geography_name,${table.cellCode}_name,obs_value` :
    `https://www.nomisweb.co.uk/api/v01/dataset/${tableCode}.data.csv?date=${table.date}&geography=${geography}&measures=${table.measures}&select=geography_name,${table.cellCode}_name,obs_value`;
  if (table.queryExt) url += table.queryExt;
  return url;
}

function makeCells(table) {
  if (table.cellCode === "date") return table.categories.map(c => c.cells[0]).join(",");
  const categories = table.categories;
  let cells = [];
  if (categories.map(c => c.cells.length).reduce((a, b) => a + b, 0) > categories.length) {
    for (const c of categories) {
      cells.push(`MAKE|${c.label}|${c.cells.join(";")}`);
    }
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

  const newData = {};

  for (const data of [data1, data2]) {
    if (Array.isArray(data)) {
      for (const d of data) {
        const key = `${d.areanm}_${d.category}`;
        if (!newData[key]) newData[key] = d;
        else newData[key].value += d.value;
      }
    }
  }
  return Object.keys(newData).map(key => newData[key]);
}

function filterCodes(codes, level = "none") {
  return level === "none" ? codes :
    level === "lower" ? codes.filter(c => ["01", "02"].includes(c.slice(1, 3))) :
    codes.filter(c => !["01", "02"].includes(c.slice(1, 3)));
}

async function fetchData(table, codes, comp) {
  let data;
  for (const tableCode of [table.tableCode].flat()) {
    const filter = typeof table.tableCode === "string" ? "none" :
      tableCode === table.tableCode[0] ? "lower" : "higher";
    const cds = filterCodes(codes, filter);
    const compcds = filterCodes(comp, filter);
    const url = makeUrl(table, tableCode, cds, compcds);
    const res = await fetch(url);
    const str = (await res.text())
      .replace("GEOGRAPHY_NAME", "areanm").replace("OBS_VALUE", "value").replace(`${table.cellCode}_name`.toUpperCase(), "category");
    data = sumData(data, csvParse(str, autoType));
  }
  return data;
}

async function fetchFlatData(table, codes, comp) {
  const all_codes = Array.from(new Set([...codes, ...comp]));
  const oa_codes = all_codes.filter(cd => ["01", "02"].includes(cd.slice(1, 3)));
  const ctrds = get(centroids);
  const regions = Array.from(new Set(oa_codes.map(cd => ctrds.region(cd))));
  if (all_codes.length !== oa_codes.length) regions.push("default");
  
  let raw_data = [];
  let raw_lookup = {};
  for (const region of regions) {
    const str = await (await fetch(`${base}/data/${table.code}/${region}.csv`)).text();
    raw_data = [...raw_data, ...csvParse(str, autoType)];
  }
  for (const d of raw_data) {
    raw_lookup[`${d.areacd}_${d.category}`] = d;
  }

  const dat = {};;
  for (const area of [{nm: "MyCustomArea", cds: codes}, {nm: "ComparisonArea", cds: comp}]) {
    for (const cd of area.cds) {
      const rows = table.categories.map(c => {
        const row = raw_lookup[`${cd}_${c.label}`];
        if (!row) console.log(cd, c, row);
        return row;
      });
      for (const d of rows) {
        const key = `${area.nm}_${d.category}`;
        if (!dat[key]) dat[key] = {areanm: area.nm, category: d.category, value: d.value};
        else dat[key].value += d.value;
      }
    }
  }
  return Object.keys(dat).map(key => dat[key]);
}

export default async function (table, state) {
  const codes = table?.geoDate === 2011 ? state.compressed11 : state.compressed;
  const comp = !state.comparison ? [] : table?.geoDate === 2011 ? state.comparison.codes11 : state.comparison.codes;
  let data = table.flatData ? await fetchFlatData(table, codes, comp) : await fetchData(table, codes, comp);
  if (table.unit === "%" && table.measures === 20100) data = calcPercent(data);
  data = data.sort((a, b) => b.areanm.localeCompare(a.areanm));
  analyticsEvent({
    event: "topicSelect",
    topicName: table.label,
    topicCode: table.code
  });
  console.log("data", data);
  return ["population", "households", "births"].includes(table.code) ? data.map(d => roundCount(d.value)) : data.map(d => d.value);
}