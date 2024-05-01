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

export function round (num, precision = 0) {
  const multiplier = Math.pow (10, precision);
  return Math.round (num * multiplier) / multiplier;
}

// Recursive function to round numbers in a multi-array (used to round coordinates)
export function roundAll (arr, decimals) {
  let newarr = [];
  arr.forEach (d => {
    if (typeof d == 'number') {
      newarr.push (round (d, decimals));
    } else if (Array.isArray (d)) {
      newarr.push (roundAll (d, decimals));
    } else {
      newarr.push (d);
    }
  });
  return newarr;
}

export function roundCount (num) {
  return num > 1000 ? (Math.round(num / 100) * 100) : (Math.round(num / 10) * 10);
}

export function extent (values, valueof) {
  let min;
  let max;
  if (valueof === undefined) {
    for (const value of values) {
      if (value != null) {
        if (min === undefined) {
          if (value >= value) min = max = value;
        } else {
          if (min > value) min = value;
          if (max < value) max = value;
        }
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if ((value = valueof (value, ++index, values)) != null) {
        if (min === undefined) {
          if (value >= value) min = max = value;
        } else {
          if (min > value) min = value;
          if (max < value) max = value;
        }
      }
    }
  }
  return [min, max];
}

export function union(setA, setB) {
  const _union = new Set(setA);
  for (const elem of setB) {
    _union.add(elem);
  }
  return _union;
}

export function difference(setA, setB) {
  const _difference = new Set(setA);
  for (const elem of setB) {
    _difference.delete(elem);
  }
  return _difference;
}

export function groupData(data, key) {
  let dataIndexed = {};
  let keys = [];
  for (const d of data) {
    if (!dataIndexed[d[key]]) {
      dataIndexed[d[key]] = {
        label: d[key],
        values: []
      };
      keys.push(d[key]);
    }
    dataIndexed[d[key]].values.push(d);
  }
  
  let dataGrouped = [];
  keys.forEach(key => {
    dataGrouped.push(dataIndexed[key]);
  });
  
  return dataGrouped;
}

export function stackData(data, key) {
  let dataIndexed = {};
  
  for (const d of data) {
    if (!dataIndexed[d[key]]) {
      dataIndexed[d[key]] = {
        label: d[key],
        values: []
      };
    }
    dataIndexed[d[key]].values.push(d);
  }
  
  let dataStacked = [];
  for (const key in dataIndexed) {
    dataStacked.push(dataIndexed[key]);
  }
  return dataStacked;
}