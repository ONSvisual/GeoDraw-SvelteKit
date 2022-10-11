class Centroids {
  async initialize({ year, dfd }) {
    this.file = `/oa${year}-data.csv.gz`
    this.oa = `oa${year}cd`;
    var df =  await (await dfd.readCSV(this.file))
    df = df.setIndex({ index: df[this.oa].$data})
    
    this.oalist = new Set(df.$index)
    
    // df.sortIndex({ ascending: true });

    this.lsoa = this.count(df[`lsoa${year}cd`]);
    this.msoa = this.count(df[`msoa${year}cd`]);

    // df = df.drop({ columns: [`msoa${year}cd`], inplace: false });
    this.df = df
    this.df.print();
  }

  count(column) {
    // get count from a series
    var a = column.valueCounts();
    return Object.fromEntries(a.$index.map((_, i) => [_, a.$data[i]]));
  }

  parent(oa) {
    // return this.df.query(this.df[this.oa].eq(oa))["ls" + this.oa].$data[0];
    return this.df.loc({ rows: this.indf([...oa]), columns: ["ls" + this.oa] }).$data[0];

  }


  bounds(oa) {
    // get the bounaries of all selected oas
    return this.getbbox(
      this.df.loc({ rows: this.indf(oa), columns: ["lng", "lat"] }).$data
    );

  }


  indf(oa){
    return oa.filter(d=>this.oalist.has(d))

  }

  async contains(coordinates) {
    // var min_coords = [Math.min.apply (null, lng), Math.min.apply (null, lat)];
    // var max_coords = [Math.max.apply (null, lng), Math.max.apply (null, lat)];

    let bbox = await this.getbbox(coordinates);
    bbox =
      bbox.length == 4
        ? [
            [bbox[0], bbox[1]],
            [bbox[2], bbox[3]],
          ]
        : bbox;



    try {

        /// why has this started failing!?!?!?

      var a, b ,c ,d;
      [a,b] = bbox[1].map(parseFloat);
      [c,d] = bbox[0].map(parseFloat);
      console.debug(a,b,c,d,bbox,bbox[0]);

      var matches = await this.df.query(
            await this.df["lat"].lt(b)
          .and(await this.df["lng"].lt(a))
          .and(await this.df["lat"].gt(d))
          .and(await this.df["lng"].gt(c))
      )
    } catch (err) {
      
      var matches = this.df;
      console.error("BBOX FILTER ERROR:", err);
    }

    console.warn("maa", bbox, this.df.$index.length, matches.$index.length);

    // matches.print();
    console.error("maaa");

    return { bbox: bbox, ...this.inPolygon(coordinates, matches.$data) };
  }


  async simplify(
    name = "Area Name",
    selected
    // options = {simplify_geo: false},
  ) {
    // simplify the codes
    const oa_all = [...selected.oa]//.map(d=>d.toUpperCase());

    var lsoa = await new Set(
      Object.entries(
        selected.parents.reduce(function (acc, curr) {
          return acc[curr] ? ++acc[curr] : (acc[curr] = 1), acc;
        }, {})
      )
        .filter((w) => this.lsoa[w[0]] === w[1])
        .map((d) => d[0])
    );

    var msoa = await new Set(
      Object.entries(
        [...lsoa].reduce(function (acc, curr) {
          return acc[curr] ? ++acc[curr] : (acc[curr] = 1), acc;
        }, {})
      )
        .filter((w) => this.msoa[w[0]] === w[1])
        .map((d) => d[0])
    );

    const cutdf = await this.df.loc({
      rows: oa_all,
      columns: [this.oa, "ls" + this.oa, "ms" + this.oa],
    });

    // get relevant oa's and lsoas before we shorten the collections
    const oa = cutdf.$data.filter((o) => !lsoa.has(o[1])).map((i) => i[0]);

    lsoa = [
      ...new Set(cutdf.$data.filter((o) => !msoa.has(o[1])).map((i) => i[1])),
    ];

    msoa = [...msoa];

    const bbox = this.bounds(oa_all);

    console.debug("simplify", msoa, lsoa);

    var merge = {};
    merge.properties = {
      name,
      bbox,
      oa,
      lsoa,
      msoa,
      oa_all,
      original: oa_all.length,
    };
    console.debug("---merge---", merge);

    return merge;
  }


  ////////////////////////
  // generic function defs
  ////////////////////////
  getbbox(coords) {
    var lat = coords.map((p) => +p[1]);
    var lng = coords.map((p) => +p[0]);

    var min_coords = [Math.min.apply(null, lng), Math.min.apply(null, lat)];
    var max_coords = [Math.max.apply(null, lng), Math.max.apply(null, lat)];

    return [min_coords, max_coords];
  }

  inPolygon(polygon, rows) {
    const insidep = rows.filter((e) => {
      const point = e.slice(3, 5);
    //   console.debug(point,polygon)

      // optimisation: can skip existing ones here in future
      if (!polygon.length) return false;
      var n = polygon.length,
        p = polygon[n - 1],
        [x, y] = point,
        [x0, y0] = p,
        x1,
        y1,
        inside = false;

      for (var i = 0; i < n; ++i) {
        (p = polygon[i]), (x1 = p[0]), (y1 = p[1]);
        if (y1 > y !== y0 > y && x < ((x0 - x1) * (y - y1)) / (y0 - y1) + x1)
          inside = !inside;
        (x0 = x1), (y0 = y1);
      }

      return inside;
    });

    return {
      oa: new Set(insidep.map((d) => d[0])),
      parents: insidep.map((d) => d[1]),
    };
  }
}

// asynchronous factory function
export async function GetCentroids(kwargs) {
  const c = new Centroids();
  await c.initialize(kwargs);
  return c;
}

//   module.exports = {
//     GetCentroids
//   };

// Object.fromEntries(a.$index.map((_, i) => [_, a.$data[i]]))
