import fs from "fs";
import { csvParse, autoType } from "d3-dsv";
import { compressData } from "compress-csv-to-json";

const parse = (path) => csvParse(
    fs.readFileSync(path, {encoding: 'utf8', flag: 'r'}).replace(/\uFEFF/, ''),
    autoType
);
const input = (yr) => `./raw_data/lsoa${yr}-data.csv`;
const output = (yr) => `./static/data/lsoa${yr}-data.json`;

const data11 = parse(input("11"));
const data21 = parse(input("21"));

const compressed11 = compressData(
    data11,
    [
        {key: 'lsoa11cd', colType: 'interned_string'},
        {key: 'lsoa21cd', colType: 'interned_string'},
        {key: 'msoa11cd', colType: 'interned_string'},
        {key: 'ltla11cd', colType: 'interned_string'},
        {key: 'rgn11cd', colType: 'interned_string'},
    ]
);
const compressed21 = compressData(
    data21,
    [
        {key: 'lsoa21cd', colType: 'string'},
        {key: 'msoa21cd', colType: 'interned_string'},
        {key: 'ltla21cd', colType: 'interned_string'},
        {key: 'rgn21cd', colType: 'interned_string'},
        {key: 'lng', colType: 10_000},
        {key: 'lat', colType: 10_000},
        {key: 'population', colType: 1},
    ]
);

fs.writeFileSync(output("11"), JSON.stringify(compressed11));
console.log(`Wrote ${output("11")}`);
fs.writeFileSync(output("21"), JSON.stringify(compressed21));
console.log(`Wrote ${output("21")}`);
