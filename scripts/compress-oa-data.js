import fs from "fs";
import { csvParse, autoType } from "d3-dsv";
import { compressData } from "compress-csv-to-json";

const input = "./raw_data/oa21-data.csv";
const output = "./static/data/oa21-data.json";

const raw = fs.readFileSync(input, {encoding: 'utf8', flag: 'r'});
const data = csvParse(raw.replace(/\uFEFF/, ''), autoType);

const columnTypes = [
    {key: 'oa21cd', colType: 'string'},
    {key: 'lsoa21cd', colType: 'interned_string'},
    {key: 'msoa21cd', colType: 'interned_string'},
    {key: 'ltla21cd', colType: 'interned_string'},
    {key: 'rgn21cd', colType: 'interned_string'},
    {key: 'lng', colType: 10_000},
    {key: 'lat', colType: 10_000},
    {key: 'population', colType: 1},
];

const compressed = compressData(data, columnTypes);

fs.writeFileSync(output, JSON.stringify(compressed));
console.log(`Wrote ${output}`);
