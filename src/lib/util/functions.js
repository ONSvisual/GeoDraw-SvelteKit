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
// export json2blob = functio
// var file = new Blob([text], {type: type});