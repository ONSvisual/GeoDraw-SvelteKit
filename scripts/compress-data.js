import fs from "fs";
import { csvParse, autoType } from "d3-dsv";
import { compressData } from "compress-csv-to-json";

const parse = (path) => csvParse(
    fs.readFileSync(path, {encoding: 'utf8', flag: 'r'}).replace(/\uFEFF/, ''),
    autoType
);

const input = (geo) => `./raw_data/${geo}21-data.csv`;
const output = (geo) => `./static/data/${geo}21-lookup.json`;

const oaData = parse(input("oa"))
const lsoaData = parse(input("lsoa"))


const lsoaColumnTypes =[
    {key: 'lsoa21cd', colType: 'string'},
    {key: 'msoa21cd', colType: 'interned_string'},
    {key: 'ltla21cd', colType: 'interned_string'},
    {key: 'rgn21cd', colType: 'interned_string'},
    {key: 'lng', colType: 10_000},
    {key: 'lat', colType: 10_000},
    {key: 'population', colType: 1},
];

const oaColumnTypes = [
    {key: 'oa21cd', colType: 'string'},
    {key: 'lsoa21cd', colType: 'interned_string'},
    {key: 'msoa21cd', colType: 'interned_string'},
    {key: 'ltla21cd', colType: 'interned_string'},
    {key: 'rgn21cd', colType: 'interned_string'},
    {key: 'lng', colType: 10_000},
    {key: 'lat', colType: 10_000},
    {key: 'population', colType: 1},
];






const oaCompressed = compressData(oaData, oaColumnTypes);
const lsoaCompressed = compressData(lsoaData, lsoaColumnTypes);


fs.writeFileSync(output("oa"), JSON.stringify(oaCompressed));
console.log(`Wrote ${output("oa")}`);
fs.writeFileSync(output("lsoa"), JSON.stringify(lsoaCompressed));
console.log(`Wrote ${output("lsoa")}`);