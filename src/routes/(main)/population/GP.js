// --------------------
// GP Chart
// --------------------
import * as math from 'mathjs'
// npm i mathjs
// <script src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/6.6.3/math.min.js"></script>

// --------------------
// Mathematical Functions
// --------------------

function m(xs) {
  return math.zeros(len(xs));
}
function linspace(low, high, n) {
  var step = (high - low) / (n - 1);
  return math.range(low, high, step, true);
}
function flip(matrix) {
  var idx = math.range(0, len(matrix));
  var flippedidx = math.subtract(idx.get([len(idx) - 1]), idx);
  return math.subset(matrix,math.index(flippedidx));
  // return matrix.subset(math.index(flippedidx));
}
function len(matrix, axis = 0) {
  if (matrix instanceof Array) {
    var length = matrix.length;
  } else {
    var length = matrix.size()[axis];
  }
  return length;
}
function pairwise_diffenerence(matrix1, matrix2) {
  var pd = math.zeros(len(matrix1), len(matrix2));
  matrix1.forEach(function (m1, idx1) {
    matrix2.forEach(function (m2, idx2) {
      pd._data[idx1][idx2] = m1 - m2;
    });
  });
  return pd;
}

// --------------------
// Gaussian Process Implementation
// --------------------

export class LinearKernel {
  constructor(sigma, sigma_b, c, n_example = 25) {
    this.sigma = sigma;
    this.sigma_b = sigma_b;
    this.c = c;
    this.n_example = n_example;
    this.example_points = linspace(-5, 5, n_example);
  }
  calculate(xs, ys) {
    xs = math.matrix(xs);
    ys = math.matrix(ys);
    var x_less_offset = math.subtract(xs, this.c);
    var y_less_offset = math.subtract(ys, this.c);
    var sigma_square = math.square(this.sigma);
    var sigma_b_square = math.square(this.sigma_b);
    x_less_offset = math.reshape(x_less_offset, [len(x_less_offset), 1]);
    y_less_offset = math.reshape(y_less_offset, [1, len(y_less_offset)]);

    var prod = math.multiply(x_less_offset, y_less_offset);

    return math.add(sigma_b_square, math.multiply(sigma_square, prod));
  }
  updateSigmaA(value) {
    this.sigma = value;
  }
  updateSigmaB(value) {
    this.sigma_b = value;
  }
  updateC(value) {
    this.c = value;
  }
  getVisualization() {
    return this.calculate(this.example_points, this.example_points);
  }
}
export class PeriodicKernel {
  constructor(sigma, length, p, n_example = 25) {
    this.sigma = sigma;
    this.l = length;
    this.p = p;
    this.n_example = n_example;
    this.example_points = linspace(-5, 5, n_example);
  }
  calculate(xs, ys) {
    var xs = math.matrix(xs);
    var ys = math.matrix(ys);
    var d = pairwise_diffenerence(xs, ys);
    var pi_d = math.multiply(Math.PI, d);
    var pi_d_p = math.divide(pi_d, this.p);
    var sin_square = math.square(math.sin(pi_d_p));
    var sin_square_l = math.divide(sin_square, math.square(this.l));
    var e = math.exp(math.multiply(sin_square_l, -2));
    return math.multiply(math.square(this.sigma), e);
  }
  updateSigma(value) {
    this.sigma = value;
  }
  updateL(value) {
    this.l = value;
  }
  updateP(value) {
    this.p = value;

}
getVisualization() {
  return this.calculate(this.example_points, this.example_points);
}}
export class RBF {
  constructor(sigma, l, n_example = 25) {
    this.sigma = sigma;
    this.l = l;
    this.n_example = n_example;
    this.example_points = linspace(-5, 5, n_example);
  }
  calculate(xs, ys) {
    xs = math.matrix(xs);
    ys = math.matrix(ys);
    var d = pairwise_diffenerence(xs, ys);
    var dl = math.divide(math.map(d,math.square), math.square(this.l));
    var e = math.map(math.multiply(dl, -0.5),math.exp);
    return math.multiply(math.square(this.sigma), e);
  }
  updateSigma(value) {
    this.sigma = value;
  }
  updateL(value) {
    this.l = value;
  }
  getVisualization() {
    return this.calculate(this.example_points, this.example_points);
  }
}
export class ActiveKernels {
  constructor(kernels, method) {
    this.kernels = kernels;
    this.method = method;
  }
  calculate(xs, ys) {
    var results = this.kernels[0].calculate(xs, ys);
    var i;
    for (i = 1; i < this.kernels.length; i++) {
      if (method == "add") {
        results = math.add(results, this.kernels[i].calculate(xs, ys));
      } else {
        results = math.multiply(results, this.kernels[i].calculate(xs, ys));
      }
    }
    return results;
  }
}


// 
// MAIN
// 
export function calculateGP(kernel,observations, x_s,sigma_noise = .02) {
  var x_obs = observations[0];
  var y_obs = observations[1];
  var xsobs = [...x_s]

  if (len(observations[0]) == 0) {
    std = math.multiply(kernel.kernels[0].sigma, math.ones(len(x_s)));
    mu_s = m(x_s);
  } else {
    // Calculate kernel components
    var K = kernel.calculate(x_obs, x_obs);
    // Measurement noise
    var identity = math.identity(K.size());
    var noise = math.multiply(math.square(sigma_noise), identity);
    var K_s = kernel.calculate(x_obs, x_s);
    var K_ss = kernel.calculate(x_s, x_s);
    var K_sTKinv = math.multiply(
      math.transpose(K_s),
      math.inv(math.add(K, noise))
    );
    // New mean
    var mu_s = math.add(
      m(x_s),
      math.squeeze(math.multiply(K_sTKinv, math.subtract(y_obs, m(x_obs))))
    );
    var Sigma_s = math.subtract(K_ss, math.multiply(K_sTKinv, K_s));
    // New std
    var std = math.map(Sigma_s.diagonal(),math.sqrt);
  }
  var uncertainty = math.multiply(2, std);
  x_s = math.concat(x_s, flip(x_s));
  var y_s = math.concat(
    math.add(mu_s, uncertainty),
    flip(math.subtract(mu_s, uncertainty))
  );
  console.debug( 'GP' ,math.matrix(xsobs),mu_s, math.matrix(x_s), y_s,'input',x_obs,y_obs);

  return {'x': xsobs.map(d=>d.value),'y':[...mu_s._data]}
  


}





// --------------------
// Main
// --------------------

// var observations = [[], []];





// Initialise GP and HeatMap
// export var x_s = makexPoints(50);

// Variance, Length
var rbfDefaults = [1, 1];
// Variance_a, Variance_b, offset
var linearDefaults = [0.5, 0.5, 0];
// Variance, length, periodicity
var periodicDefaults = [0.5, 1, 3.14];

// rbf object, set initial values from defaults
var rbf = new RBF(rbfDefaults[0], rbfDefaults[1]);

// periodic object, set intial values from defaults
var pdk = new PeriodicKernel(
  periodicDefaults[0],
  periodicDefaults[1],
  periodicDefaults[2]
);

// linear object, set initial values from defaults
var linear = new LinearKernel(
  linearDefaults[0],
  linearDefaults[1],
  linearDefaults[2]
);




const activeKernels = new ActiveKernels([rbf],  "add");


// var observations = [[1,2,3],[1,5,1]]
// var x_s = [2,3,-1,6,2.4]

// console.warn('GP',calculateGP(activeKernels,observations, x_s));


//https://edward-rees.com/gp/