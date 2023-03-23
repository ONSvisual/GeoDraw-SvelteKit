import { csvParse } from "d3-dsv";

export function download(blob, filename) {
	let url = window.URL || window.webkitURL || window;
	let link = url.createObjectURL(blob);
	let a = document.createElement("a");

	a.download = filename;
	a.href = link;
	document.body.appendChild(a);

	a.click();
	document.body.removeChild(a);
}

export function clip(str, msg) {
  navigator.clipboard.writeText(str).then(() => alert(msg));
}

export function capitalise(str) {
  return str[0].toUpperCase() + str.slice(1);
}

export async function getLsoa2011(lkp_path, pts_path) {
  const ctrys = {E: "E92000001", N: "N92000002", S: "S92000003", W: "W92000004"};
  const pts = csvParse(await (await fetch(pts_path)).text());
  const lookup = await (await fetch(lkp_path)).json();
  let parents = {
    "K02000001": [],
    "K04000001": []
  };
  let pkeys = pts.columns;
  let key = pkeys.shift();
  pts.forEach(d => {
    pkeys.forEach(pkey => {
      if (!parents[d[pkey]]) parents[d[pkey]] = [];
      parents[d[pkey]].push(d[key]);
    });
    const ctry = ctrys[d[key][0]];
    if (!parents[ctry]) parents[ctry] = [];
    parents[ctry].push(d[key]);
    parents["K02000001"].push(d[key]);
    if (["E92000001","W92000004"].includes(ctry)) parents["K04000001"].push(d[key]);
  });
  return {lookup, parents};
}