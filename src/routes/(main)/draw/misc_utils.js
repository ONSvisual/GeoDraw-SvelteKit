
// export function getbbox (coords) {
//     var lat = coords.map (p => p[1]);
//     var lng = coords.map (p => p[0]);
  
//     var min_coords = [Math.min.apply (null, lng), Math.min.apply (null, lat)];
//     var max_coords = [Math.max.apply (null, lng), Math.max.apply (null, lat)];
  
//     return [min_coords, max_coords];
//   }

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


// function geomean (c1, c2, thresh = 30) {
//   c1 = get (mapobject).project (c1);
//   c2 = get (mapobject).project (c2);

//   return Math.sqrt ((c1.x - c2.x) ** 2 + (c1.y - c2.y) ** 2) < thresh;
// }

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