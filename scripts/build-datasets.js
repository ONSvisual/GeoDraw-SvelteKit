import fs from "fs";
import { csvFormat } from "d3-dsv";
import { csvParse, fetch } from "./utils.js";

const topics_path = "./src/lib/config/topics.json";
const lookup_path = (year) => `./raw_data/lsoa${year.slice(-2)}-data.csv`;
const nomis_key = "0x3cfb19ead752b37bb90da0eb3a0fe78baa9fa055";
const nomis_types = {
    "2011": "TYPE298",
    "2021": "TYPE151"
};
const columns = ["areacd", "category", "value"];

function makeUrl(topic, offset = 0) {
    const geoDate = `${topic.geoDate}` || "2021";
    const geography = nomis_types[geoDate];
    let url = topic.cellCode === "date" ? `https://www.nomisweb.co.uk/api/v01/dataset/${topic.tableCode}.data.csv?date=${makeCells(topic)}&geography=${geography}&measures=${topic.measures}&select=geography_code,${topic.cellCode}_name,obs_value` :
        topic.cellCode ? `https://www.nomisweb.co.uk/api/v01/dataset/${topic.tableCode}.data.csv?date=${topic.date}&geography=${geography}&${topic.cellCode}=${makeCells(topic)}&measures=${topic.measures}&select=geography_code,${topic.cellCode}_name,obs_value` :
        `https://www.nomisweb.co.uk/api/v01/dataset/${topic.tableCode}.data.csv?date=${topic.date}&geography=${geography}&measures=${topic.measures}&select=geography_code,${topic.cellCode}_name,obs_value`;
    if (topic.queryExt) url += topic.queryExt;
    if (offset) url += `&recordoffset=${offset}`;
    url += `&recordlimit=100000&uid=${nomis_key}`;
    return url;
}

function makeCells(topic) {
    if (topic.cellCode === "date") return topic.categories.map(c => c.cells[0]).join(",");
    let cells = [];
    for (const c of topic.categories) {
        cells.push(`MAKE|${encodeURIComponent(c.label)}|${c.cells.join(";")}`);
    }
    return cells.join(",");
}

async function makeDatasets() {
    const topics = JSON.parse(
        fs.readFileSync(topics_path, {encoding: 'utf8', flag: 'r'})
    ).filter(t => t.flatData);

    const lookup_arr = {};
    const lookup = {};
    for (const year of ["2011", "2021"]) {
        lookup_arr[year] = csvParse(fs.readFileSync(lookup_path(year), {encoding: 'utf8', flag: 'r'}));
        lookup[year] = {};
        for (const d of lookup_arr[year]) {
            const cd = d[`lsoa${year.slice(-2)}cd`];
            lookup[year][cd] = d;
        }
    }
    const regions = Array.from(new Set(lookup_arr["2011"].map(d => d.rgn11cd)));

    for (const topic of topics) {
        const path = `./static/data/${topic.code}`;
        const raw_path = `./raw_data/${topic.code}.csv`;
        const year = `${topic.geoDate}`;
        const yr = year.slice(-2);

        if (!fs.existsSync(raw_path)) {
            let data = [];
            let offset = 0;
            let complete = false;
            while (!complete) {
                const url = makeUrl(topic, offset);
                console.log(`Fetching ${url}`);
                const str = (await fetch(url))
                    .replace("GEOGRAPHY_CODE", "areacd")
                    .replace(`${topic.cellCode}_name`.toUpperCase(), "category")
                    .replace("OBS_VALUE", "value");
                const dat = csvParse(str);
                data = [...data, ...dat];
                if (dat.length === 100000) offset += 100000;
                else complete = true;
            }
            fs.writeFileSync(raw_path, csvFormat(data, columns));
            console.log(`Wrote ${raw_path}`);
        }
        if (!fs.existsSync(path)) fs.mkdirSync(path);

        const data = csvParse(fs.readFileSync(raw_path, {encoding: 'utf8', flag: 'r'})).map(d => {
            const lkp = lookup[year][d.areacd];
            return {
                ...d,
                msoa: lkp[`msoa${yr}cd`],
                ltla: lkp[`ltla${yr}cd`],
                rgn: lkp[`rgn${yr}cd`],
                ctry: d.areacd[0] === "E" ? "E92000001" : "W92000001"
            };
        });

        const data_lkp = {};
        for (const d of data) {
            data_lkp[d.areacd] = d;
            for (const parent of ["msoa", "ltla", "rgn", "ctry"]) {
                const key = `${d[parent]}_${d.category}`;
                if (!data_lkp[key]) {
                    data_lkp[key] = {...d};
                    data_lkp[key].areacd = d[parent];
                } else {
                    data_lkp[key].value += d.value;
                }
            }
        }
        const summed_data = Object.keys(data_lkp)
            .map(key => data_lkp[key])
            .sort((a, b) => a.areacd.localeCompare(b.areacd));

        const file = `${path}/default.csv`;
        const higher_data = summed_data.filter(d => !["01", "02"].includes(d.areacd.slice(1, 3)));
        fs.writeFileSync(file, csvFormat(higher_data, columns));
        console.log(`Wrote ${file}`);

        const lower_data = summed_data.filter(d => ["01", "02"].includes(d.areacd.slice(1, 3)));
        for (const rgn of regions) {
            const file = `${path}/${rgn}.csv`;
            const filtered = lower_data.filter(d => d.rgn === rgn);
            fs.writeFileSync(file, csvFormat(filtered, columns));
            console.log(`Wrote ${file}`);
        }
    }
}
  
makeDatasets();