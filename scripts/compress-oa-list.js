// This script is experimental
// It offers a method for compressing OA codes from CSV to a slightly more efficient JSON format

import fs from "fs";
import { csvParse, autoType } from "d3-dsv";

const raw = fs.readFileSync("./static/data/oa21-data.csv", {encoding: 'utf8', flag: 'r'});
const data = csvParse(raw.replace(/\uFEFF/, ''), autoType);

const cols = ["oa", "lsoa", "msoa", "ltla"];

const lkp = {"oa": {}, "lsoa": {}, "msoa": {}, "ltla": {}};

console.log("Compressing oa...");
data.forEach(d => lkp.oa[d.oa21cd] = [d.lng, d.lat, d.population]);

for (let i = 1; i < cols.length; i ++) {
  console.log(`Compressing ${cols[i]}...`);
  for (const row of data) {
    const code = row[`${cols[i]}21cd`];
    const child_code = row[`${cols[i - 1]}21cd`];
    if (!lkp[cols[i]][code]) lkp[cols[i]][code] = {};
    if (!lkp[cols[i]][code][child_code]) lkp[cols[i]][code][child_code] = lkp[cols[i - 1]][child_code];
  }
}

fs.writeFileSync("./static/data/oa21-data.json", JSON.stringify(lkp.ltla));