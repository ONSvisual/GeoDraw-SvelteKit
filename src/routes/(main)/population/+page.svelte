<script>
  // population age
  import {goto} from '$app/navigation';
  import {base} from '$app/paths';
  import Cards from '$lib/layout/Cards.svelte';
  import Card from '$lib/layout/partial/Card.svelte';

  import tooltip from '$lib/ui/tooltip';
  import Icon from '$lib/ui/Icon.svelte';
  import {onMount} from 'svelte';

  import {RBF, ActiveKernels, calculateGP} from './GP.js';
  import {area} from 'd3-shape';
  import {select} from 'd3-selection';
  import {mean, range} from 'mathjs';

  //  age structure
  let store,
    state = {};

  async function init() {
    store = JSON.parse(localStorage.getItem('onsbuild'));
    console.warn('build-', store);

    let props = store.properties;
    state.compressed = Object.values({
      ...props.msoa,
      ...props.lsoa,
      ...props.msoa,
      ...props.oa,
    })
      .flat()
      .join(';');
  }

  onMount(async () => {
    await init();

    // const kcode = 'KS102EW';
    const ncode = 'nm_1086_1'//'nm_145_1';
    console.log(ncode)

    window.d = await dfd
      .readCSV(


        `https://www.nomisweb.co.uk/api/v01/dataset/NM_1086_1.data.csv?date=latest&&geography=MAKE|MyCustomArea|${state.compressed}&&c_age=MAKE%7C0_4%7C1,MAKE%7C5_9%7C2;3,MAKE%7C10_14%7C4,MAKE%7C15_19%7C5;6;7,MAKE%7C20_24%7C8,MAKE%7C25_29%7C9,MAKE%7C30_34%7C10,MAKE%7C35_39%7C11,MAKE%7C40_44%7C12,MAKE%7C45_49%7C13,MAKE%7C50_54%7C14,MAKE%7C55_59%7C15,MAKE%7C60_64%7C16,MAKE%7C65_69%7C17,MAKE%7C70_74%7C18,MAKE%7C75_79%7C19,MAKE%7C80_84%7C20,MAKE%7C85_plus%7C21&c_residence_type=0&c_sex=0&measures=20100&select=geography_code,c_age_name,obs_value`
      )

      .then((d) => d.setIndex({column: 'C_AGE_NAME'}))
      .then((d) => {
        console.log('ed', d.print(), d);
        return d;
      })
      // .then(
      //   (d) =>
      //     d.loc({
      //       rows: d.$index.filter(Boolean),
      //       columns: d.$columns.filter((c) => c.match(/Age.*\d+.*/gi)),
      //     }).T
      // )

     
      .then(async (d) => {


        d['OBS_VALUE'].plot('population').bar();

        console.warn(document.getElementById('population').innerHTML)


		// It seems there is no 'standardised' way of storing age tables... 

		// rx  
		// var rx = d.$index.map((e) =>[e.match(/\d+/g)][0].map(parseFloat))

    //     // mid
    //     var mname = rx.map((e) => mean(e));

    //     // range
    //     var rname = rx.map((num) => num.length > 1 ? num[1] - num[0] : num[0]
    //     );

    //     // normalise data 


    //     d = d.div(rname,{ axis: 0 }) // bywidth
		// d = d.div(d.sum({axis: 0})); // bytotal

    //     var data = {};
    //     d.$columns.forEach((w) => {
          

		// 	let X = []
		// 	let Y = []
			
		// 	var dummy = d[w].$data;

		// 	// add additional datapoints for wide bands
		// 	rx.forEach((q,i)=>{
		// 		if (q.length>1){
		// 			range(q[0],q[1]+.1,1).forEach(r=>
		// 			{X.push(r); Y.push(dummy[i])})
		// 		}else{
		// 			X.push(q[0]); Y.push(dummy[i])
		// 		}


		// 		// q.forEach(w=>{X.push(w); Y.push(dummy[i])})
		// 		// X.push(mean(q)); Y.push(dummy[i])
		// 	})


		// 	// console.error('x',X,'y',Y)


    //       var observations = [X,Y];
    //       var x_s = range(0, 90, 4);

		//   var rbf = new RBF(.1,2); // var , len
		// //   var rbf2 = new RBF(1,3); // var , len

		//   const activeKernels = new ActiveKernels([rbf]);


    //       var out = calculateGP(activeKernels, observations, x_s,.05);
    //       console.warn('GP', out);

    //       var df = new dfd.DataFrame({x: [...out['x']], y: [...out['y']]});
    //       df = df.setIndex({column: 'x'});
    //       df.print();
    //       df['y'].plot('population').bar();

		//   df.sum({ axis: 0 }).print()

          //testing
          // var df = new dfd.DataFrame({
          //   x: mname,
          //   y: dummy,
          //   r: rname,
          //   mp: d.$index.map((e) => [e.match(/\d+/g)]),
          // });
          // df = df.setIndex({column: 'x'});
          // df.print();
          // df['y'].plot('population2').bar();


		  // df.sum({ axis: 0 }).print()
		  // console.log(w)
		  // fdsf=dsf
        });

		

        window.d = d;

        // console.log('----',cname);

        // const X = tf.tensor1d(cname);
        // const Y0 = tf.tensor1d([...d[d.$columns[0]].$data]);

        // const ages = tf.range(0, 100, 10);

        // const model = new Model('x1');
        // model.train(X, Y0, 20);

        // // console.log(model)

        // // console.error(cname,d.print());

        // // console.error([...ages.dataSync()],[...model.predict(ages).dataSync()])

        // console.error(
        //   [...X.dataSync()],
        //   [...Y0.dataSync()],
        //   [...model.predict(X).dataSync()]
        // );

        return d;
      });

    // d.T['MyCustomArea'].plot("population").bar()

    // KS102EW
  // });

  //   class Model {
  //     //   let name = 'polynomial';

  //     constructor(name) {
  //       this.name = name;

  //       this.a = tf.variable(tf.scalar(Math.random()));
  //       this.b = tf.variable(tf.scalar(Math.random()));
  //       this.c = tf.variable(tf.scalar(Math.random()));
  //       this.d = tf.variable(tf.scalar(Math.random()));

  //       //   this.num = 100;
  //       this.learningRate = 0.01;
  //       this.optimizer = tf.train.sgd(this.learningRate);

  // 	  console.log(
  //         `Start a: ${this.a.dataSync()[0]}, b: ${
  //           this.b.dataSync()[0]
  //         }, c: ${this.c.dataSync()[0]}, d: ${this.d.dataSync()[0]}`
  //       );
  //     }
  //     predict(x) {
  //       return tf.tidy(() => {
  //         return this.a
  //           .mul(x.pow(tf.scalar(3)))
  //           .add(this.b.mul(x.square()))
  //           .add(this.c.mul(x))
  //           .add(this.d);
  //       });
  //     }

  //     loss(prediction, expectation) {
  //       const error = prediction.sub(expectation).square().mean();
  //       return error;
  //     }

  //     train(xs, ys, num) {
  //       for (let iter = 0; iter < num; iter++) {
  //         this.optimizer.minimize(() => {
  //           const pred = this.predict(xs);
  //           return this.loss(pred, ys);
  //         });

  //       console.log(
  //         `Epoch ${iter} a: ${this.a.dataSync()[0]}, b: ${
  //           this.b.dataSync()[0]
  //         }, c: ${this.c.dataSync()[0]}, d: ${this.d.dataSync()[0]}`
  //       );
  //     }
  //   }
  // }
</script>

<nav>
  <div class="nav-left">
    <button class="text" on:click={() => goto(`${base}/draw`)}>
      <Icon type="chevron" rotation={180} /><span>Edit area</span>
    </button>
  </div>
  <div class="nav-right" />
</nav>

<div class="container">
  <aside class="topics-box">
    <h2>Name your area</h2>
    <input type="text" placeholder="Type a name" />

    <label>
      <input type="checkbox" name="includemap" />
      Include Map
    </label>
  </aside>
  <article class="profile">
    <h2>Profile preview</h2>

    <div id="population" />
    <div id="population2" />
    <Cards>
      <Card title="Population">
        <svg id="svgpop" />
        jkhsdjkfh
      </Card>
    </Cards>
  </article>
</div>
