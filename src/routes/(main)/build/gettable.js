// age profile
export function get_pop (compressed, area) {
  const ncode = 'NM_1086_1'; //'nm_145_1';

  return dfd
    .readCSV (
      `https://www.nomisweb.co.uk/api/v01/dataset/${ncode}.data.csv?date=latest&&geography=MAKE|${area}|${compressed}&&c_age=MAKE%7C0_4%7C1,MAKE%7C5_9%7C2;3,MAKE%7C10_14%7C4,MAKE%7C15_19%7C5;6;7,MAKE%7C20_24%7C8,MAKE%7C25_29%7C9,MAKE%7C30_34%7C10,MAKE%7C35_39%7C11,MAKE%7C40_44%7C12,MAKE%7C45_49%7C13,MAKE%7C50_54%7C14,MAKE%7C55_59%7C15,MAKE%7C60_64%7C16,MAKE%7C65_69%7C17,MAKE%7C70_74%7C18,MAKE%7C75_79%7C19,MAKE%7C80_84%7C20,MAKE%7C85_plus%7C21&c_residence_type=0&c_sex=0&measures=20100&select=geography_code,c_age_name,obs_value`
    )
    .then (df => {
      var data = df.$data.map (d => d[2] | -0);
      var max = Math.max (...data);
      return [
        data.map (d => parseInt (+d)),
        df.$data.map (d => d[1]),
        data.map (d => parseInt (+d / max * 10000)),
      ];
    })
    .then (async function (previous) {
      var df = await dfd.readCSV (
        `https://www.nomisweb.co.uk/api/v01/dataset/${ncode}.data.csv?date=latest&&geography=MAKE|England and Wales|${'K04000001'}&&c_age=MAKE%7C0_4%7C1,MAKE%7C5_9%7C2;3,MAKE%7C10_14%7C4,MAKE%7C15_19%7C5;6;7,MAKE%7C20_24%7C8,MAKE%7C25_29%7C9,MAKE%7C30_34%7C10,MAKE%7C35_39%7C11,MAKE%7C40_44%7C12,MAKE%7C45_49%7C13,MAKE%7C50_54%7C14,MAKE%7C55_59%7C15,MAKE%7C60_64%7C16,MAKE%7C65_69%7C17,MAKE%7C70_74%7C18,MAKE%7C75_79%7C19,MAKE%7C80_84%7C20,MAKE%7C85_plus%7C21&c_residence_type=0&c_sex=0&measures=20100&select=geography_code,c_age_name,obs_value`
      );
      var data = df.$data.map (d => d[2] | -0);
      var max = Math.max (...data);
      previous.push (data.map (d => parseInt (+d / max * 10000)));
      return previous;
    });
}

async function unpack (d) {
  var ret = await d.json ();
  return ret.obs; //[0].obs_value.value;
}

export async function get_stats (compressed, area) {
  return Object.assign (
    {},
    ...(await Promise.all (
      [
        ['Population', 'NM_2021_1', 0],
        // ['Median Age', 'NM_145_1', 0],// not updated
        ['Population Density', 'NM_2026_1', 0],
      ].map (async function (id) {
        var url = `https://www.nomisweb.co.uk/api/v01/dataset/${id[1].toLowerCase ()}.data.json?date=latest&geography=MAKE|${area}|${compressed}&measures=20100&select=geography_code,obs_value`;

        var url2 = `https://www.nomisweb.co.uk/api/v01/dataset/${id[1]}.data.json?date=latest&geography=MAKE|England and Wales|${'K04000001'}&measures=20100&select=geography_code,obs_value`;

        var key = id[0];
        var value = await Promise.all ([
          fetch (url).then (unpack),
          fetch (url2).then (unpack),
        ]);

        var d = {};
        d[key] = value.map (e => e[id[2]].obs_value.value);
        // console.warn ('uuuuuuu', key, d[key],value);
        return await d;
      })
    ))
  );
  // return Object.assign({}, ...data);
}

console.error ('AGE PROFILE AND MEDIAN AGE STILL USING 2011 DATA');
