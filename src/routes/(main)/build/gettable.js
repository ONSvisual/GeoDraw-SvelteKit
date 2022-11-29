import {csvParse, autoType} from 'd3-dsv';
import {roundCount} from '../draw/misc_utils';

function makeUrl(table, codes) {
  let url = `https://www.nomisweb.co.uk/api/v01/dataset/${table.tableCode}.data.csv?date=latest&geography=MAKE|MyCustomArea|${codes},K04000001&${table.cellCode}=${makeCells(table.categories)}&measures=${table.measures}&select=geography_name,${table.cellCode}_name,obs_value`;
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

export default async function (table, codes) {
  let url = makeUrl(table, codes);
  console.log("url", url);
  let res = await fetch(url);
  let str = (await res.text()).replace("GEOGRAPHY_NAME", "areanm").replace("OBS_VALUE", "value").replace(`${table.cellCode}_name`.toUpperCase(), "category");
  let data = csvParse(str, autoType);
  if (table.unit === "%" && table.measures === 20100) data = calcPercent(data);
  return ["population", "households"].includes(table.code) ? data.map(d => roundCount(d.value)) : data.map(d => d.value);
}