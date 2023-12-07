import * as d3 from "d3-dsv";
import { exec, execSync } from "child_process";

export const csvParse = (data, row = d3.autoType) => d3.csvParse(data.replace(/\uFEFF/, ''), row);

export function run(cmd, opts = {maxBuffer: 1024 * 5000}) {
    return new Promise((resolve, reject) => {
        exec(cmd, opts, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(stdout);
        });
    });
}

export async function download(url, dest) {
    await run(`curl -o "${dest}" "${url}"`);
    console.log(`Downloaded ${dest}`);
    return;
}

export async function fetch(url) {
    const data = await run(`curl "${url}"`);
    return data;
}