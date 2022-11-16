import { Buffer } from 'buffer';
import mproj from 'mproj';
import iconv from 'iconv-lite';
import Flatbush from 'flatbush';

var utils = /*#__PURE__*/Object.freeze({
  __proto__: null,
  get default () { return utils; },
  get getUniqueName () { return getUniqueName; },
  get isFunction () { return isFunction; },
  get isObject () { return isObject; },
  get clamp () { return clamp; },
  get isArray () { return isArray; },
  get isNumber () { return isNumber; },
  get isValidNumber () { return isValidNumber; },
  get isFiniteNumber () { return isFiniteNumber; },
  get isNonNegNumber () { return isNonNegNumber; },
  get isInteger () { return isInteger; },
  get isEven () { return isEven; },
  get isOdd () { return isOdd; },
  get isString () { return isString; },
  get isDate () { return isDate; },
  get isBoolean () { return isBoolean; },
  get formatDateISO () { return formatDateISO; },
  get toArray () { return toArray; },
  get isArrayLike () { return isArrayLike; },
  get addslashes () { return addslashes; },
  get regexEscape () { return regexEscape; },
  get htmlEscape () { return htmlEscape; },
  get defaults () { return defaults; },
  get extend () { return extend; },
  get inherit () { return inherit; },
  get reduceAsync () { return reduceAsync; },
  get merge () { return merge; },
  get difference () { return difference; },
  get intersection () { return intersection; },
  get indexOf () { return indexOf; },
  get contains () { return contains; },
  get some () { return some; },
  get every () { return every; },
  get find () { return find; },
  get range () { return range; },
  get repeat () { return repeat; },
  get sum () { return sum; },
  get getArrayBounds () { return getArrayBounds; },
  get uniq () { return uniq; },
  get pluck () { return pluck; },
  get countValues () { return countValues; },
  get indexOn () { return indexOn; },
  get groupBy () { return groupBy; },
  get arrayToIndex () { return arrayToIndex; },
  get forEach () { return forEach; },
  get forEachProperty () { return forEachProperty; },
  get initializeArray () { return initializeArray; },
  get replaceArray () { return replaceArray; },
  get repeatString () { return repeatString; },
  get splitLines () { return splitLines; },
  get pluralSuffix () { return pluralSuffix; },
  get endsWith () { return endsWith; },
  get lpad () { return lpad; },
  get rpad () { return rpad; },
  get trim () { return trim; },
  get ltrim () { return ltrim; },
  get rtrim () { return rtrim; },
  get addThousandsSep () { return addThousandsSep; },
  get numToStr () { return numToStr; },
  get formatNumber () { return formatNumber; },
  get formatIntlNumber () { return formatIntlNumber; },
  get formatNumberForDisplay () { return formatNumberForDisplay; },
  get shuffle () { return shuffle; },
  get sortOn () { return sortOn; },
  get genericSort () { return genericSort; },
  get getSortedIds () { return getSortedIds; },
  get sortArrayIndex () { return sortArrayIndex; },
  get reorderArray () { return reorderArray; },
  get getKeyComparator () { return getKeyComparator; },
  get getGenericComparator () { return getGenericComparator; },
  get quicksort () { return quicksort; },
  get quicksortPartition () { return quicksortPartition; },
  get findRankByValue () { return findRankByValue; },
  get findValueByPct () { return findValueByPct; },
  get findValueByRank () { return findValueByRank; },
  get findMedian () { return findMedian; },
  get findQuantile () { return findQuantile; },
  get mean () { return mean; },
  get format () { return format; },
  get formatter () { return formatter; },
  get wildcardToRegExp () { return wildcardToRegExp; },
  get createBuffer () { return createBuffer; },
  get expandoBuffer () { return expandoBuffer; },
  get copyElements () { return copyElements; },
  get extendBuffer () { return extendBuffer; },
  get mergeNames () { return mergeNames; },
  get findStringPrefix () { return findStringPrefix; },
  get parsePercent () { return parsePercent; },
  get formatVersionedName () { return formatVersionedName; },
  get uniqifyNames () { return uniqifyNames; },
  get parseString () { return parseString; },
  get parseNumber () { return parseNumber; },
  get parseIntlNumber () { return parseIntlNumber; },
  get cleanNumericString () { return cleanNumericString; },
  get trimQuotes () { return trimQuotes; }
});

// This module provides a way for multiple jobs to run together asynchronously
// while keeping job-level context variables (like "defs") separate.

var stash = {};

function getStashedVar(key) {
  if (key in stash === false) {
    return undefined; // to support running commands in tests
    // error('Tried to read a nonexistent variable from the stash:', key);
  }
  return stash[key];
}

// Fall back to browserify's Buffer polyfill
var B = Buffer;

var uniqCount = 0;
function getUniqueName(prefix) {
  return (prefix || "__id_") + (++uniqCount);
}

function isFunction(obj) {
  return typeof obj == 'function';
}

function isObject(obj) {
  return obj === Object(obj); // via underscore
}

function clamp(val, min, max) {
  return val < min ? min : (val > max ? max : val);
}

function isArray(obj) {
  return Array.isArray(obj);
}

// Is obj a valid number or NaN? (test if obj is type number)
function isNumber(obj) {
  return obj != null && obj.constructor == Number;
}

function isValidNumber(val) {
  return isNumber(val) && !isNaN(val);
}

// Similar to isFinite() but does not coerce strings or other types
function isFiniteNumber(val) {
  return isValidNumber(val) && val !== Infinity && val !== -Infinity;
}

// This uses type conversion
// export function isFiniteNumber(val) {
//   return val > -Infinity && val < Infinity;
// }

function isNonNegNumber(val) {
  return isNumber(val) && val >= 0;
}

function isInteger(obj) {
  return isNumber(obj) && ((obj | 0) === obj);
}

function isEven(obj) {
  return (obj % 2) === 0;
}

function isOdd(obj) {
  return (obj % 2) === 1;
}

function isString(obj) {
  return obj != null && obj.toString === String.prototype.toString;
  // TODO: replace w/ something better.
}

function isDate(obj) {
  return !!obj && obj.getTime === Date.prototype.getTime;
}

function isBoolean(obj) {
  return obj === true || obj === false;
}

function formatDateISO(d) {
  if (!isDate(d)) return '';
  return d.toISOString().replace(':00.000Z', 'Z');
}

// Convert an array-like object to an Array, or make a copy if @obj is an Array
function toArray(obj) {
  var arr;
  if (!isArrayLike(obj)) error("toArray() requires an array-like object");
  try {
    arr = Array.prototype.slice.call(obj, 0); // breaks in ie8
  } catch(e) {
    // support ie8
    arr = [];
    for (var i=0, n=obj.length; i<n; i++) {
      arr[i] = obj[i];
    }
  }
  return arr;
}

// Array like: has length property, is numerically indexed and mutable.
// TODO: try to detect objects with length property but no indexed data elements
function isArrayLike(obj) {
  if (!obj) return false;
  if (isArray(obj)) return true;
  if (isString(obj)) return false;
  if (obj.length === 0) return true;
  if (obj.length > 0) return true;
  return false;
}

// See https://raw.github.com/kvz/phpjs/master/functions/strings/addslashes.js
function addslashes(str) {
  return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}

// Escape a literal string to use in a regexp.
// Ref.: http://simonwillison.net/2006/Jan/20/escape/
function regexEscape(str) {
  return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}


// See https://github.com/janl/mustache.js/blob/master/mustache.js
var entityMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;'
};
function htmlEscape(s) {
  return String(s).replace(/[&<>"'/]/g, function(s) {
    return entityMap[s];
  });
}

function defaults(dest) {
  for (var i=1, n=arguments.length; i<n; i++) {
    var src = arguments[i] || {};
    for (var key in src) {
      if (key in dest === false && src.hasOwnProperty(key)) {
        dest[key] = src[key];
      }
    }
  }
  return dest;
}

function extend(o) {
  var dest = o || {},
      n = arguments.length,
      key, i, src;
  for (i=1; i<n; i++) {
    src = arguments[i] || {};
    for (key in src) {
      if (src.hasOwnProperty(key)) {
        dest[key] = src[key];
      }
    }
  }
  return dest;
}

// Pseudoclassical inheritance
//
// Inherit from a Parent function:
//    inherit(Child, Parent);
// Call parent's constructor (inside child constructor):
//    this.__super__([args...]);
function inherit(targ, src) {
  var f = function() {
    if (this.__super__ == f) {
      // add __super__ of parent to front of lookup chain
      // so parent class constructor can call its parent using this.__super__
      this.__super__ = src.prototype.__super__;
      // call parent constructor function. this.__super__ now points to parent-of-parent
      src.apply(this, arguments);
      // remove temp __super__, expose targ.prototype.__super__ again
      delete this.__super__;
    }
  };

  f.prototype = src.prototype || src; // added || src to allow inheriting from objects as well as functions
  // Extend targ prototype instead of wiping it out --
  //   in case inherit() is called after targ.prototype = {stuff}; statement
  targ.prototype = extend(new f(), targ.prototype); //
  targ.prototype.constructor = targ;
  targ.prototype.__super__ = f;
}


// Call @iter on each member of an array (similar to Array#reduce(iter))
//    iter: function(memo, item, callback)
// Call @done when all members have been processed or if an error occurs
//    done: function(err, memo)
// @memo: Initial value
//
function reduceAsync(arr, memo, iter, done) {
  var call = typeof setImmediate == 'undefined' ? setTimeout : setImmediate;
  var i=0;
  next(null, memo);

  function next(err, memo) {
    // Detach next operation from call stack to prevent overflow
    // Don't use setTimeout(, 0) if setImmediate is available
    // (setTimeout() can introduce a long delay if previous operation was slow,
    //    as of Node 0.10.32 -- a bug?)
    if (err) {
      return done(err, null);
    }
    call(function() {
      if (i < arr.length === false) {
        done(null, memo);
      } else {
        iter(memo, arr[i++], next);
      }
    }, 0);
  }
}


// Append elements of @src array to @dest array
function merge(dest, src) {
  if (!isArray(dest) || !isArray(src)) {
    error("Usage: merge(destArray, srcArray);");
  }
  for (var i=0, n=src.length; i<n; i++) {
    dest.push(src[i]);
  }
  return dest;
}

// Returns elements in arr and not in other
// (similar to underscore diff)
function difference(arr, other) {
  var index = arrayToIndex(other);
  return arr.filter(function(el) {
    return !Object.prototype.hasOwnProperty.call(index, el);
  });
}

// Return the intersection of two arrays
function intersection(a, b) {
  return a.filter(function(el) {
    return b.includes(el);
  });
}

function indexOf(arr, item) {
  var nan = item !== item;
  for (var i = 0, len = arr.length || 0; i < len; i++) {
    if (arr[i] === item) return i;
    if (nan && arr[i] !== arr[i]) return i;
  }
  return -1;
}

// Test a string or array-like object for existence of substring or element
function contains(container, item) {
  if (isString(container)) {
    return container.indexOf(item) != -1;
  }
  else if (isArrayLike(container)) {
    return indexOf(container, item) != -1;
  }
  error("Expected Array or String argument");
}

function some(arr, test) {
  return arr.reduce(function(val, item) {
    return val || test(item); // TODO: short-circuit?
  }, false);
}

function every(arr, test) {
  return arr.reduce(function(val, item) {
    return val && test(item);
  }, true);
}

function find(arr, test, ctx) {
  var matches = arr.filter(test, ctx);
  return matches.length === 0 ? null : matches[0];
}

function range(len, start, inc) {
  var arr = [],
      v = start === void 0 ? 0 : start,
      i = inc === void 0 ? 1 : inc;
  while(len--) {
    arr.push(v);
    v += i;
  }
  return arr;
}

function repeat(times, func) {
  var values = [],
      val;
  for (var i=0; i<times; i++) {
    val = func(i);
    if (val !== void 0) {
      values[i] = val;
    }
  }
  return values.length > 0 ? values : void 0;
}

// Calc sum, skip falsy and NaN values
// Assumes: no other non-numeric objects in array
//
function sum(arr, info) {
  if (!isArrayLike(arr)) error ("sum() expects an array, received:", arr);
  var tot = 0,
      nan = 0,
      val;
  for (var i=0, n=arr.length; i<n; i++) {
    val = arr[i];
    if (val) {
      tot += val;
    } else if (isNaN(val)) {
      nan++;
    }
  }
  if (info) {
    info.nan = nan;
  }
  return tot;
}

// Calculate min and max values of an array, ignoring NaN values
function getArrayBounds(arr) {
  var min = Infinity,
    max = -Infinity,
    nan = 0, val;
  for (var i=0, len=arr.length; i<len; i++) {
    val = arr[i];
    if (val !== val) nan++;
    if (val < min) min = val;
    if (val > max) max = val;
  }
  return {
    min: min,
    max: max,
    nan: nan
  };
}

// export function uniq(src) {
//   var index = {};
//   return src.reduce(function(memo, el) {
//     if (el in index === false) {
//       index[el] = true;
//       memo.push(el);
//     }
//     return memo;
//   }, []);
// }

function uniq(src) {
  var index = new Set();
  var arr = [];
  var item;
  for (var i=0, n=src.length; i<n; i++) {
    item = src[i];
    if (!index.has(item)) {
      arr.push(item);
      index.add(item);
    }
  }
  return arr;
}

function pluck(arr, key) {
  return arr.map(function(obj) {
    return obj[key];
  });
}

function countValues(arr) {
  return arr.reduce(function(memo, val) {
    memo[val] = (val in memo) ? memo[val] + 1 : 1;
    return memo;
  }, {});
}

function indexOn(arr, k) {
  return arr.reduce(function(index, o) {
    index[o[k]] = o;
    return index;
  }, {});
}

function groupBy(arr, k) {
  return arr.reduce(function(index, o) {
    var keyval = o[k];
    if (keyval in index) {
      index[keyval].push(o);
    } else {
      index[keyval] = [o];
    }
    return index;
  }, {});
}

function arrayToIndex(arr, val) {
  var init = arguments.length > 1;
  return arr.reduce(function(index, key) {
    index[key] = init ? val : true;
    return index;
  }, {});
}

// Support for iterating over array-like objects, like typed arrays
function forEach(arr, func, ctx) {
  if (!isArrayLike(arr)) {
    throw new Error("#forEach() takes an array-like argument. " + arr);
  }
  for (var i=0, n=arr.length; i < n; i++) {
    func.call(ctx, arr[i], i);
  }
}

function forEachProperty(o, func, ctx) {
  Object.keys(o).forEach(function(key) {
    func.call(ctx, o[key], key);
  });
}

function initializeArray(arr, init) {
  for (var i=0, len=arr.length; i<len; i++) {
    arr[i] = init;
  }
  return arr;
}

function replaceArray(arr, arr2) {
  arr.splice(0, arr.length);
  for (var i=0, n=arr2.length; i<n; i++) {
    arr.push(arr2[i]);
  }
}

function repeatString(src, n) {
  var str = "";
  for (var i=0; i<n; i++)
    str += src;
  return str;
}

function splitLines(str) {
  return str.split(/\r?\n/);
}

function pluralSuffix(count) {
  return count != 1 ? 's' : '';
}

function endsWith(str, ending) {
    return str.indexOf(ending, str.length - ending.length) !== -1;
}

function lpad(str, size, pad) {
  pad = pad || ' ';
  str = String(str);
  return repeatString(pad, size - str.length) + str;
}

function rpad(str, size, pad) {
  pad = pad || ' ';
  str = String(str);
  return str + repeatString(pad, size - str.length);
}

function trim(str) {
  return ltrim(rtrim(str));
}

var ltrimRxp = /^\s+/;
function ltrim(str) {
  return str.replace(ltrimRxp, '');
}

var rtrimRxp = /\s+$/;
function rtrim(str) {
  return str.replace(rtrimRxp, '');
}

function addThousandsSep(str) {
  var fmt = '',
      start = str[0] == '-' ? 1 : 0,
      dec = str.indexOf('.'),
      end = str.length,
      ins = (dec == -1 ? end : dec) - 3;
  while (ins > start) {
    fmt = ',' + str.substring(ins, end) + fmt;
    end = ins;
    ins -= 3;
  }
  return str.substring(0, end) + fmt;
}

function numToStr(num, decimals) {
  return decimals >= 0 ? num.toFixed(decimals) : String(num);
}

function formatNumber(val) {
  return val + '';
}

function formatIntlNumber(val) {
  var str = formatNumber(val);
  return '"' + str.replace('.', ',') + '"'; // need to quote if comma-delimited
}

function formatNumberForDisplay(num, decimals, nullStr, showPos) {
  var fmt;
  if (isNaN(num)) {
    fmt = nullStr || '-';
  } else {
    fmt = numToStr(num, decimals);
    fmt = addThousandsSep(fmt);
    if (showPos && parseFloat(fmt) > 0) {
      fmt = "+" + fmt;
    }
  }
  return fmt;
}

function shuffle(arr) {
  var tmp, i, j;
  for (i = arr.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
}

// Sort an array of objects based on one or more properties.
// Usage: sortOn(array, key1, asc?[, key2, asc? ...])
//
function sortOn(arr) {
  var comparators = [];
  for (var i=1; i<arguments.length; i+=2) {
    comparators.push(getKeyComparator(arguments[i], arguments[i+1]));
  }
  arr.sort(function(a, b) {
    var cmp = 0,
        i = 0,
        n = comparators.length;
    while (i < n && cmp === 0) {
      cmp = comparators[i](a, b);
      i++;
    }
    return cmp;
  });
  return arr;
}

// Sort array of values that can be compared with < > operators (strings, numbers)
// null, undefined and NaN are sorted to the end of the array
// default order is ascending
//
function genericSort(arr, ascending) {
  var compare = getGenericComparator(ascending);
  Array.prototype.sort.call(arr, compare);
  return arr;
}

function getSortedIds(arr, asc) {
  var ids = range(arr.length);
  sortArrayIndex(ids, arr, asc);
  return ids;
}

function sortArrayIndex(ids, arr, asc) {
  var compare = getGenericComparator(asc);
  ids.sort(function(i, j) {
    // added i, j comparison to guarantee that sort is stable
    var cmp = compare(arr[i], arr[j]);
    return cmp > 0 || cmp === 0 && i > j ? 1 : -1;
  });
}

function reorderArray(arr, idxs) {
  var len = idxs.length;
  var arr2 = [];
  for (var i=0; i<len; i++) {
    var idx = idxs[i];
    if (idx < 0 || idx >= len) error("Out-of-bounds array idx");
    arr2[i] = arr[idx];
  }
  replaceArray(arr, arr2);
}

function getKeyComparator(key, asc) {
  var compare = getGenericComparator(asc);
  return function(a, b) {
    return compare(a[key], b[key]);
  };
}

function getGenericComparator(asc) {
  asc = asc !== false;
  return function(a, b) {
    var retn = 0;
    if (b == null) {
      retn = a == null ? 0 : -1;
    } else if (a == null) {
      retn = 1;
    } else if (a < b) {
      retn = asc ? -1 : 1;
    } else if (a > b) {
      retn = asc ? 1 : -1;
    } else if (a !== a) {
      retn = 1;
    } else if (b !== b) {
      retn = -1;
    }
    return retn;
  };
}


// Generic in-place sort (null, NaN, undefined not handled)
function quicksort(arr, asc) {
  quicksortPartition(arr, 0, arr.length-1);
  if (asc === false) Array.prototype.reverse.call(arr); // Works with typed arrays
  return arr;
}

// Moved out of quicksort() (saw >100% speedup in Chrome with deep recursion)
function quicksortPartition (a, lo, hi) {
  var i = lo,
      j = hi,
      pivot, tmp;
  while (i < hi) {
    pivot = a[lo + hi >> 1]; // avoid n^2 performance on sorted arrays
    while (i <= j) {
      while (a[i] < pivot) i++;
      while (a[j] > pivot) j--;
      if (i <= j) {
        tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
        i++;
        j--;
      }
    }
    if (lo < j) quicksortPartition(a, lo, j);
    lo = i;
    j = hi;
  }
}


function findRankByValue(arr, value) {
  if (isNaN(value)) return arr.length;
  var rank = 1;
  for (var i=0, n=arr.length; i<n; i++) {
    if (value > arr[i]) rank++;
  }
  return rank;
}

function findValueByPct(arr, pct) {
  var rank = Math.ceil((1-pct) * (arr.length));
  return findValueByRank(arr, rank);
}

// See http://ndevilla.free.fr/median/median/src/wirth.c
// Elements of @arr are reordered
//
function findValueByRank(arr, rank) {
  if (!arr.length || rank < 1 || rank > arr.length) error("[findValueByRank()] invalid input");

  rank = clamp(rank | 0, 1, arr.length);
  var k = rank - 1, // conv. rank to array index
      n = arr.length,
      l = 0,
      m = n - 1,
      i, j, val, tmp;

  while (l < m) {
    val = arr[k];
    i = l;
    j = m;
    do {
      while (arr[i] < val) {i++;}
      while (val < arr[j]) {j--;}
      if (i <= j) {
        tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
        i++;
        j--;
      }
    } while (i <= j);
    if (j < k) l = i;
    if (k < i) m = j;
  }
  return arr[k];
}

function findMedian(arr) {
  return findQuantile(arr, 0.5);
}

function findQuantile(arr, k) {
  var n = arr.length,
      i1 = Math.floor((n - 1) * k),
      i2 = Math.ceil((n - 1) * k);
  if (i1 < 0 || i2 >= n) return NaN;
  var v1 = findValueByRank(arr, i1 + 1);
  if (i1 == i2) return v1;
  var v2 = findValueByRank(arr, i2 + 1);
  // use linear interpolation
  var w1 = i2 / (n - 1) - k;
  var w2 = k - i1 / (n - 1);
  var v = (v1 * w1 + v2 * w2) * (n - 1);
  return v;
}

function mean(arr) {
  var count = 0,
      avg = NaN,
      val;
  for (var i=0, n=arr.length; i<n; i++) {
    val = arr[i];
    if (isNaN(val)) continue;
    avg = ++count == 1 ? val : val / count + (count - 1) / count * avg;
  }
  return avg;
}


/*
A simplified version of printf formatting
Format codes: %[flags][width][.precision]type

supported flags:
  +   add '+' before positive numbers
  0   left-pad with '0'
  '   Add thousands separator
width: 1 to many
precision: .(1 to many)
type:
  s     string
  di    integers
  f     decimal numbers
  xX    hexidecimal (unsigned)
  %     literal '%'

Examples:
  code    val    formatted
  %+d     1      '+1'
  %4i     32     '  32'
  %04i    32     '0032'
  %x      255    'ff'
  %.2f    0.125  '0.13'
  %'f     1000   '1,000'
*/

// Usage: format(formatString, [values])
// Tip: When reusing the same format many times, use formatter() for 5x - 10x better performance
//
function format(fmt) {
  var fn = formatter(fmt);
  var str = fn.apply(null, Array.prototype.slice.call(arguments, 1));
  return str;
}

function formatValue(val, matches) {
  var flags = matches[1];
  var padding = matches[2];
  var decimals = matches[3] ? parseInt(matches[3].substr(1)) : void 0;
  var type = matches[4];
  var isString = type == 's',
      isHex = type == 'x' || type == 'X',
      // isInt = type == 'd' || type == 'i',
      // isFloat = type == 'f',
      isNumber = !isString;

  var sign = "",
      padDigits = 0,
      isZero = false,
      isNeg = false;

  var str, padChar, padStr;
  if (isString) {
    str = String(val);
  }
  else if (isHex) {
    str = val.toString(16);
    if (type == 'X')
      str = str.toUpperCase();
  }
  else if (isNumber) {
    // str = formatNumberForDisplay(val, isInt ? 0 : decimals);
    str = numToStr(val, decimals);
    if (str[0] == '-') {
      isNeg = true;
      str = str.substr(1);
    }
    isZero = parseFloat(str) == 0;
    if (flags.indexOf("'") != -1 || flags.indexOf(',') != -1) {
      str = addThousandsSep(str);
    }
    if (!isZero) { // BUG: sign is added when num rounds to 0
      if (isNeg) {
        sign = "\u2212"; // U+2212
      } else if (flags.indexOf('+') != -1) {
        sign = '+';
      }
    }
  }

  if (padding) {
    var strLen = str.length + sign.length;
    var minWidth = parseInt(padding, 10);
    if (strLen < minWidth) {
      padDigits = minWidth - strLen;
      padChar = flags.indexOf('0') == -1 ? ' ' : '0';
      padStr = repeatString(padChar, padDigits);
    }
  }

  if (padDigits == 0) {
    str = sign + str;
  } else if (padChar == '0') {
    str = sign + padStr + str;
  } else {
    str = padStr + sign + str;
  }
  return str;
}

// Get a function for interpolating formatted values into a string.
function formatter(fmt) {
  var codeRxp = /%([',+0]*)([1-9]?)((?:\.[1-9])?)([sdifxX%])/g;
  var literals = [],
      formatCodes = [],
      startIdx = 0,
      prefix = "",
      matches = codeRxp.exec(fmt),
      literal;

  while (matches) {
    literal = fmt.substring(startIdx, codeRxp.lastIndex - matches[0].length);
    if (matches[0] == '%%') {
      prefix += literal + '%';
    } else {
      literals.push(prefix + literal);
      prefix = '';
      formatCodes.push(matches);
    }
    startIdx = codeRxp.lastIndex;
    matches = codeRxp.exec(fmt);
  }
  literals.push(prefix + fmt.substr(startIdx));

  return function() {
    var str = literals[0],
        n = arguments.length;
    if (n != formatCodes.length) {
      error("[format()] Data does not match format string; format:", fmt, "data:", arguments);
    }
    for (var i=0; i<n; i++) {
      str += formatValue(arguments[i], formatCodes[i]) + literals[i+1];
    }
    return str;
  };
}

function wildcardToRegExp(name) {
  var rxp = name.split('*').map(function(str) {
    return regexEscape(str);
  }).join('.*');
  return new RegExp('^' + rxp + '$');
}

function createBuffer(arg, arg2) {
  if (isInteger(arg)) {
    return B.allocUnsafe ? B.allocUnsafe(arg) : new B(arg);
  } else {
    // check allocUnsafe to make sure Buffer.from() will accept strings (it didn't before Node v5.10)
    return B.from && B.allocUnsafe ? B.from(arg, arg2) : new B(arg, arg2);
  }
}

function expandoBuffer(constructor, rate) {
  var capacity = 0,
      k = rate >= 1 ? rate : 1.2,
      buf;
  return function(size) {
    if (size > capacity) {
      capacity = Math.ceil(size * k);
      buf = constructor ? new constructor(capacity) : createBuffer(capacity);
    }
    return buf;
  };
}

function copyElements(src, i, dest, j, n, rev) {
  var same = src == dest || src.buffer && src.buffer == dest.buffer;
  var inc = 1,
      offs = 0,
      k;
  if (rev) {
    if (same) error('copy error');
    inc = -1;
    offs = n - 1;
  }
  if (same && j > i) {
    for (k=n-1; k>=0; k--) {
      dest[j + k] = src[i + k];
    }
  } else {
    for (k=0; k<n; k++, offs += inc) {
      dest[k + j] = src[i + offs];
    }
  }
}

function extendBuffer(src, newLen, copyLen) {
  var len = Math.max(src.length, newLen);
  var n = copyLen || src.length;
  var dest = new src.constructor(len);
  copyElements(src, 0, dest, 0, n);
  return dest;
}

function mergeNames(name1, name2) {
  var merged;
  if (name1 && name2) {
    merged = findStringPrefix(name1, name2).replace(/[-_]$/, '');
  }
  return merged || '';
}

function findStringPrefix(a, b) {
  var i = 0;
  for (var n=a.length; i<n; i++) {
    if (a[i] !== b[i]) break;
  }
  return a.substr(0, i);
}

function parsePercent(o) {
  var str = String(o);
  var isPct = str.indexOf('%') > 0;
  var pct;
  if (isPct) {
    pct = Number(str.replace('%', '')) / 100;
  } else {
    pct = Number(str);
  }
  if (!(pct >= 0 && pct <= 1)) {
    stop(format("Invalid percentage: %s", str));
  }
  return pct;
}

function formatVersionedName(name, i) {
  var suffix = String(i);
  if (/[0-9]$/.test(name)) {
    suffix = '-' + suffix;
  }
  return name + suffix;
}

function uniqifyNames(names, formatter) {
  var counts = countValues(names),
      format = formatter || formatVersionedName,
      names2 = [];

  names.forEach(function(name) {
    var i = 0,
        candidate = name,
        versionedName;
    while (
        names2.indexOf(candidate) > -1 || // candidate name has already been used
        candidate == name && counts[candidate] > 1 || // duplicate unversioned names
        candidate != name && counts[candidate] > 0) { // versioned name is a preexisting name
      i++;
      versionedName = format(name, i);
      if (!versionedName || versionedName == candidate) {
        throw new Error("Naming error"); // catch buggy versioning function
      }
      candidate = versionedName;
    }
    names2.push(candidate);
  });
  return names2;
}


// Assume: @raw is string, undefined or null
function parseString(raw) {
  return raw ? raw : "";
}

// Assume: @raw is string, undefined or null
// Use null instead of NaN for unparsable values
// (in part because if NaN is used, empty strings get converted to "NaN"
// when re-exported).
function parseNumber(raw) {
  return parseToNum(raw, cleanNumericString);
}

function parseIntlNumber(raw) {
  return parseToNum(raw, convertIntlNumString);
}

function parseToNum(raw, clean) {
  var str = String(raw).trim();
  var parsed = str ? Number(clean(str)) : NaN;
  return isNaN(parsed) ? null : parsed;
}

// Remove comma separators from strings
function cleanNumericString(str) {
  return (str.indexOf(',') > 0) ? str.replace(/,([0-9]{3})/g, '$1') : str;
}

function convertIntlNumString(str) {
  str = str.replace(/[ .]([0-9]{3})/g, '$1');
  return str.replace(',', '.');
}

function trimQuotes(raw) {
  var len = raw.length, first, last;
  if (len >= 2) {
    first = raw.charAt(0);
    last = raw.charAt(len-1);
    if (first == '"' && last == '"' && !raw.includes('","') ||
        first == "'" && last == "'" && !raw.includes("','")) {
      return raw.substr(1, len-2);
    }
  }
  return raw;
}

var _error, _stop, _message;

setLoggingForCLI();

function setLoggingForCLI() {
  function stop() {
    throw new UserError(formatLogArgs(arguments));
  }

  function error() {
    var msg = utils.toArray(arguments).join(' ');
    throw new Error(msg);
  }

  function message() {
  }

  setLoggingFunctions(message, error, stop);
}

// Handle an unexpected condition (internal error)
function error() {
  _error.apply(null, utils.toArray(arguments));
}

// Handle an error caused by invalid input or misuse of API
function stop() {
  _stop.apply(null, utils.toArray(arguments));
}

// Print a status message
function message() {
  _message.apply(null, messageArgs(arguments));
}

// A way for the GUI to replace the CLI logging functions
function setLoggingFunctions(message, error, stop) {
  _message = message;
  _error = error;
  _stop = stop;
}

function verbose() {
  // verbose can be set globally with the -verbose command or separately for each command
  if (getStashedVar('VERBOSE')) {
    message.apply(null, arguments);
  }
}

function debug() {
}

function UserError(msg) {
  var err = new Error(msg);
  err.name = 'UserError';
  return err;
}

// expose so GUI can use it
function formatLogArgs(args) {
  return utils.toArray(args).join(' ');
}

function messageArgs(args) {
  var arr = utils.toArray(args);
  var cmd = getStashedVar('current_command');
  if (cmd && cmd != 'help') {
    arr.unshift('[' + cmd + ']');
  }
  return arr;
}

var GeoJSON = {};

GeoJSON.ID_FIELD = "FID"; // default field name of imported *JSON feature ids

GeoJSON.typeLookup = {
  LineString: 'polyline',
  MultiLineString: 'polyline',
  Polygon: 'polygon',
  MultiPolygon: 'polygon',
  Point: 'point',
  MultiPoint: 'point'
};

GeoJSON.translateGeoJSONType = function(type) {
  return GeoJSON.typeLookup[type] || null;
};

GeoJSON.pathIsRing = function(coords) {
  var first = coords[0],
      last = coords[coords.length - 1];
  // TODO: consider detecting collapsed rings
  return coords.length >= 4 && first[0] == last[0] && first[1] == last[1];
};

GeoJSON.toFeature = function(obj, properties) {
  var type = obj ? obj.type : null;
  var feat;
  if (type == 'Feature') {
    feat = obj;
  } else if (type in GeoJSON.typeLookup) {
    feat = {
      type: 'Feature',
      geometry: obj,
      properties: properties || null
    };
  } else {
    feat = {
      type: 'Feature',
      geometry: null,
      properties: properties || null
    };
  }
  return feat;
};

// A matrix class that supports affine transformations (scaling, translation, rotation).
// Elements:
//   a  c  tx
//   b  d  ty
//   0  0  1  (u v w are not used)
//
function Matrix2D() {
  this.a = 1;
  this.c = 0;
  this.tx = 0;
  this.b = 0;
  this.d = 1;
  this.ty = 0;
}

Matrix2D.prototype.transformXY = function(x, y, p) {
  p = p || {};
  p.x = x * this.a + y * this.c + this.tx;
  p.y = x * this.b + y * this.d + this.ty;
  return p;
};

Matrix2D.prototype.translate = function(dx, dy) {
  this.tx += dx;
  this.ty += dy;
};

// x, y: optional origin
Matrix2D.prototype.rotate = function(q, x, y) {
  var cos = Math.cos(q);
  var sin = Math.sin(q);
  x = x || 0;
  y = y || 0;
  this.a = cos;
  this.c = -sin;
  this.b = sin;
  this.d = cos;
  this.tx += x - x * cos + y * sin;
  this.ty += y - x * sin - y * cos;
};

// cx, cy: optional origin
Matrix2D.prototype.scale = function(sx, sy, cx, cy) {
  cx = cx || 0;
  cy = cy || 0;
  this.a *= sx;
  this.c *= sx;
  this.b *= sy;
  this.d *= sy;
  this.tx -= cx * (sx - 1);
  this.ty -= cy * (sy - 1);
};

function Transform() {
  this.mx = this.my = 1;
  this.bx = this.by = 0;
}

Transform.prototype.isNull = function() {
  return !this.mx || !this.my || isNaN(this.bx) || isNaN(this.by);
};

Transform.prototype.invert = function() {
  var inv = new Transform();
  inv.mx = 1 / this.mx;
  inv.my = 1 / this.my;
  //inv.bx = -this.bx * inv.mx;
  //inv.by = -this.by * inv.my;
  inv.bx = -this.bx / this.mx;
  inv.by = -this.by / this.my;
  return inv;
};


Transform.prototype.transform = function(x, y, xy) {
  xy = xy || [];
  xy[0] = x * this.mx + this.bx;
  xy[1] = y * this.my + this.by;
  return xy;
};

Transform.prototype.toString = function() {
  return JSON.stringify(Object.assign({}, this));
};

function Bounds() {
  if (arguments.length > 0) {
    this.setBounds.apply(this, arguments);
  }
}

Bounds.from = function() {
  var b = new Bounds();
  return b.setBounds.apply(b, arguments);
};

Bounds.prototype.toString = function() {
  return JSON.stringify({
    xmin: this.xmin,
    xmax: this.xmax,
    ymin: this.ymin,
    ymax: this.ymax
  });
};

Bounds.prototype.toArray = function() {
  return this.hasBounds() ? [this.xmin, this.ymin, this.xmax, this.ymax] : [];
};

Bounds.prototype.hasBounds = function() {
  return this.xmin <= this.xmax && this.ymin <= this.ymax;
};

Bounds.prototype.sameBounds =
Bounds.prototype.equals = function(bb) {
  return bb && this.xmin === bb.xmin && this.xmax === bb.xmax &&
    this.ymin === bb.ymin && this.ymax === bb.ymax;
};

Bounds.prototype.width = function() {
  return (this.xmax - this.xmin) || 0;
};

Bounds.prototype.height = function() {
  return (this.ymax - this.ymin) || 0;
};

Bounds.prototype.area = function() {
  return this.width() * this.height() || 0;
};

Bounds.prototype.empty = function() {
  this.xmin = this.ymin = this.xmax = this.ymax = void 0;
  return this;
};

Bounds.prototype.setBounds = function(a, b, c, d) {
  if (arguments.length == 1) {
    // assume first arg is a Bounds or array
    if (utils.isArrayLike(a)) {
      b = a[1];
      c = a[2];
      d = a[3];
      a = a[0];
    } else {
      b = a.ymin;
      c = a.xmax;
      d = a.ymax;
      a = a.xmin;
    }
  }

  this.xmin = a;
  this.ymin = b;
  this.xmax = c;
  this.ymax = d;
  if (a > c || b > d) this.update();
  // error("Bounds#setBounds() min/max reversed:", a, b, c, d);
  return this;
};


Bounds.prototype.centerX = function() {
  var x = (this.xmin + this.xmax) * 0.5;
  return x;
};

Bounds.prototype.centerY = function() {
  var y = (this.ymax + this.ymin) * 0.5;
  return y;
};

Bounds.prototype.containsPoint = function(x, y) {
  if (x >= this.xmin && x <= this.xmax &&
    y <= this.ymax && y >= this.ymin) {
    return true;
  }
  return false;
};

// intended to speed up slightly bubble symbol detection; could use intersects() instead
// TODO: fix false positive where circle is just outside a corner of the box
Bounds.prototype.containsBufferedPoint =
Bounds.prototype.containsCircle = function(x, y, buf) {
  if ( x + buf > this.xmin && x - buf < this.xmax ) {
    if ( y - buf < this.ymax && y + buf > this.ymin ) {
      return true;
    }
  }
  return false;
};

Bounds.prototype.intersects = function(bb) {
  if (bb.xmin <= this.xmax && bb.xmax >= this.xmin &&
    bb.ymax >= this.ymin && bb.ymin <= this.ymax) {
    return true;
  }
  return false;
};

Bounds.prototype.contains = function(bb) {
  if (bb.xmin >= this.xmin && bb.ymax <= this.ymax &&
    bb.xmax <= this.xmax && bb.ymin >= this.ymin) {
    return true;
  }
  return false;
};

Bounds.prototype.shift = function(x, y) {
  this.setBounds(this.xmin + x,
    this.ymin + y, this.xmax + x, this.ymax + y);
};

Bounds.prototype.padBounds = function(a, b, c, d) {
  this.xmin -= a;
  this.ymin -= b;
  this.xmax += c;
  this.ymax += d;
};

// Rescale the bounding box by a fraction. TODO: implement focus.
// @param {number} pct Fraction of original extents
// @param {number} pctY Optional amount to scale Y
//
Bounds.prototype.scale = function(pct, pctY) { /*, focusX, focusY*/
  var halfWidth = (this.xmax - this.xmin) * 0.5;
  var halfHeight = (this.ymax - this.ymin) * 0.5;
  var kx = pct - 1;
  var ky = pctY === undefined ? kx : pctY - 1;
  this.xmin -= halfWidth * kx;
  this.ymin -= halfHeight * ky;
  this.xmax += halfWidth * kx;
  this.ymax += halfHeight * ky;
};

// Return a bounding box with the same extent as this one.
Bounds.prototype.cloneBounds = // alias so child classes can override clone()
Bounds.prototype.clone = function() {
  return new Bounds(this.xmin, this.ymin, this.xmax, this.ymax);
};

Bounds.prototype.clearBounds = function() {
  this.setBounds(new Bounds());
};

Bounds.prototype.mergePoint = function(x, y) {
  if (this.xmin === void 0) {
    this.setBounds(x, y, x, y);
  } else {
    // this works even if x,y are NaN
    if (x < this.xmin)  this.xmin = x;
    else if (x > this.xmax)  this.xmax = x;

    if (y < this.ymin) this.ymin = y;
    else if (y > this.ymax) this.ymax = y;
  }
};

// expands either x or y dimension to match @aspect (width/height ratio)
// @focusX, @focusY (optional): expansion focus, as a fraction of width and height
Bounds.prototype.fillOut = function(aspect, focusX, focusY) {
  if (arguments.length < 3) {
    focusX = 0.5;
    focusY = 0.5;
  }
  var w = this.width(),
      h = this.height(),
      currAspect = w / h,
      pad;
  if (isNaN(aspect) || aspect <= 0) ; else if (currAspect < aspect) { // fill out x dimension
    pad = h * aspect - w;
    this.xmin -= (1 - focusX) * pad;
    this.xmax += focusX * pad;
  } else {
    pad = w / aspect - h;
    this.ymin -= (1 - focusY) * pad;
    this.ymax += focusY * pad;
  }
  return this;
};

Bounds.prototype.update = function() {
  var tmp;
  if (this.xmin > this.xmax) {
    tmp = this.xmin;
    this.xmin = this.xmax;
    this.xmax = tmp;
  }
  if (this.ymin > this.ymax) {
    tmp = this.ymin;
    this.ymin = this.ymax;
    this.ymax = tmp;
  }
};

Bounds.prototype.transform = function(t) {
  this.xmin = this.xmin * t.mx + t.bx;
  this.xmax = this.xmax * t.mx + t.bx;
  this.ymin = this.ymin * t.my + t.by;
  this.ymax = this.ymax * t.my + t.by;
  this.update();
  return this;
};

// Returns a Transform object for mapping this onto Bounds @b2
// @flipY (optional) Flip y-axis coords, for converting to/from pixel coords
//
Bounds.prototype.getTransform = function(b2, flipY) {
  var t = new Transform();
  t.mx = b2.width() / this.width() || 1; // TODO: better handling of 0 w,h
  t.bx = b2.xmin - t.mx * this.xmin;
  if (flipY) {
    t.my = -b2.height() / this.height() || 1;
    t.by = b2.ymax - t.my * this.ymin;
  } else {
    t.my = b2.height() / this.height() || 1;
    t.by = b2.ymin - t.my * this.ymin;
  }
  return t;
};

Bounds.prototype.mergeCircle = function(x, y, r) {
  if (r < 0) r = -r;
  this.mergeBounds([x - r, y - r, x + r, y + r]);
};

Bounds.prototype.mergeBounds = function(bb) {
  var a, b, c, d;
  if (bb instanceof Bounds) {
    a = bb.xmin;
    b = bb.ymin;
    c = bb.xmax;
    d = bb.ymax;
  } else if (arguments.length == 4) {
    a = arguments[0];
    b = arguments[1];
    c = arguments[2];
    d = arguments[3];
  } else if (bb.length == 4) {
    // assume array: [xmin, ymin, xmax, ymax]
    a = bb[0];
    b = bb[1];
    c = bb[2];
    d = bb[3];
  } else {
    error("Bounds#mergeBounds() invalid argument:", bb);
  }

  if (this.xmin === void 0) {
    this.setBounds(a, b, c, d);
  } else {
    if (a < this.xmin) this.xmin = a;
    if (b < this.ymin) this.ymin = b;
    if (c > this.xmax) this.xmax = c;
    if (d > this.ymax) this.ymax = d;
  }
  return this;
};

// Several dependencies are loaded via require() ... this module returns a
// stub function when require() does not exist as a global function,
// to avoid runtime errors (this should only happen in some tests when single
// modules are imported)

var mproj$1 = mproj;

// A compound projection, consisting of a default projection and one or more rectangular frames
// that are projected separately and affine transformed.
// @mainParams: parameters for main projection, including:
//    proj: Proj string
//    bbox: lat-lon bounding box
function MixedProjection(mainParams, options) {
  var mainFrame = initFrame(mainParams);
  var mainP = mainFrame.crs;
  var frames = [mainFrame];
  var mixedP = initMixedProjection(mproj$1);

  // This CRS masquerades as the main projection... the version with
  // custom insets is exposed to savvy users
  mainP.__mixed_crs = mixedP;

  // required opts:
  //    origin: [lng, lat] origin of frame (unprojected)
  //    placement: [x, y] location (in projected coordinates) to shift the origin
  //    proj: Proj.4 string for projecting data within the frame
  //    bbox: Lat-long bounding box of frame area
  //
  // optional:
  //    dx: x shift (meters)
  //    dy: y shift (meters)
  //    scale: scale factor (1 = no scaling)
  //    rotation: rotation in degrees (0 = no rotation)
  //
  mainP.addFrame = function(paramsArg) {
    var params = getFrameParams(paramsArg, options); // apply defaults and overrides
    var frame = initFrame(params);
    var m = new Matrix2D();
    //  originXY: the projected coordinates of the frame origin
    var originXY = params.origin ? projectFrameOrigin(params.origin, frame.crs) : [0, 0];
    var placementXY = params.placement || [0, 0];
    var dx = placementXY[0] - originXY[0] + (+params.dx || 0);
    var dy = placementXY[1] - originXY[1] + (+params.dy || 0);

    if (params.rotation) {
      m.rotate(params.rotation * Math.PI / 180.0, originXY[0], originXY[1]);
    }
    if (params.scale) {
      m.scale(params.scale, params.scale, originXY[0], originXY[1]);
    }
    m.translate(dx, dy);

    frame.matrix = m;
    frames.push(frame);
    return this;
  };

  function initFrame(params) {
    return {
      bounds: new Bounds(bboxToRadians(params.bbox)),
      crs:  mproj$1.pj_init(params.proj)
    };
  }

  function bboxToRadians(bbox) {
    var D2R = Math.PI / 180;
    return bbox.map(function(deg) {
      return deg * D2R;
    });
  }

  function projectFrameOrigin(origin, P) {
    var xy = mproj$1.pj_fwd_deg({lam: origin[0], phi: origin[1]}, P);
    return [xy.x, xy.y];
  }

  mixedP.fwd = function(lp, xy) {
    var frame, xy2;
    for (var i=0, n=frames.length; i<n; i++) {
      frame = frames[i];
      if (frame.bounds.containsPoint(lp.lam, lp.phi)) {
        xy2 = mproj$1.pj_fwd(lp, frame.crs);
        if (frame.matrix) {
          frame.matrix.transformXY(xy2.x, xy2.y, xy2);
        }
        break;
      }
    }
    xy.x = xy2 ? xy2.x : Infinity;
    xy.y = xy2 ? xy2.y : Infinity;
  };

  return mainP;
}

function initMixedProjection(mproj) {
  if (!mproj.internal.pj_list.mixed) {
    mproj.pj_add(function(P) {
      P.a = 1;
    }, 'mixed', 'Mapshaper Mixed Projection');
  }
  return mproj.pj_init('+proj=mixed');
}

function getFrameParams (params, options) {
  var opts = options[params.name];
  utils.defaults(params, {scale: 1, dx: 0, dy: 0, rotation: 0}); // add defaults
  if (!opts) return params;
  Object.keys(opts).forEach(function(key) {
    var val = opts[key];
    if (key in params) {
      params[key] = opts[key];
    } else {
      params.proj = replaceProjParam(params.proj, key, val);
    }
  });
  return params;
}

function replaceProjParam(proj, key, val) {
  var param = '+' + key + '=';
  return proj.split(' ').map(function(str) {
    if (str.indexOf(param) === 0) {
      str = str.substr(0, param.length) + val;
    }
    return str;
  }).join(' ');
}

// str: a custom projection string, e.g.: "albersusa +PR"
function parseCustomProjection(str) {
  var parts = str.trim().split(/ +/);
  var params = [];
  var names = parts.filter(function(part) {
    if (/^\+/.test(part)) {
      params.push(part.substr(1)); // strip '+'
      return false;
    }
    return true;
  });
  var name = names[0];
  var opts = parseCustomParams(params);
  if (names.length != 1) return null; // parse error if other than one name found
  return getCustomProjection(name, opts);
}

// returns a custom projection object
function getCustomProjection(name, opts) {
  if (name == 'albersusa') {
    return new AlbersUSA(opts);
  }
  return null;
}

function AlbersUSA(optsArg) {
  var opts = optsArg || {};
  var main = {
    proj: '+proj=aea +lon_0=-96 +lat_0=37.5 +lat_1=29.5 +lat_2=45.5',
    bbox: [-129,23,-62,52]
  };
  var AK = {
    name: 'AK',
    proj: '+proj=aea +lat_1=55 +lat_2=70 +lat_0=65 +lon_0=-148 +x_0=0 +y_0=0',
    bbox: [-172.26,50.89,-127.00,73.21],
    origin: [-152, 63],
    placement: [-1882782,-969242],
    scale: 0.37
  };
  var HI = {
    name: 'HI',
    proj: '+proj=aea +lat_1=19 +lat_2=24 +lat_0=20.9 +lon_0=-156.5 +x_0=0 +y_0=0',
    bbox: [-160.50,18.72,-154.57,22.58],
    origin: [-157, 21],
    placement: [-1050326,-1055362]
  };
  var PR = {
    name: 'PR',
    proj: '+proj=aea +lat_1=18 +lat_2=18.43 +lat_0=17.83 +lon_0=-66.43 +x_0=0 +y_0=0',
    bbox: [-68.092,17.824,-65.151,18.787],
    origin: [-66.431, 18.228],
    placement: [1993101,-1254517]
  };
  var VI = {
    name: 'VI',
    // same projection and origin as PR, so they maintain their true geographical relationship
    proj: '+proj=aea +lat_1=18 +lat_2=18.43 +lat_0=17.83 +lon_0=-66.43 +x_0=0 +y_0=0',
    bbox: [-65.104,17.665,-64.454,18.505],
    origin: [-66.431, 18.228],
    placement: [1993101,-1254517]
  };
  var mixed = new MixedProjection(main, opts)
    .addFrame(AK)
    .addFrame(HI);
  if (opts.PR) {
    mixed.addFrame(PR);
  }
  if (opts.VI) {
    mixed.addFrame(VI);
  }
  return mixed;
}


function parseCustomParams(arr) {
  var opts = {};
  arr.forEach(function(str) {
    parseCustomParam(str, opts);
  });
  return opts;
}

function parseCustomParam(str, opts) {
  var parts = str.split('=');
  var path = parts[0].split('.');
  var key = path.pop();
  var obj = path.reduce(function(memo, name) {
    if (name in memo === false) {
      memo[name] = {};
    } else if (!utils.isObject(memo[name])) {
      return {};// error condition, could display a warning
    }
    return memo[name];
  }, opts);
  if (parts.length > 1) {
    obj[key] = parseCustomParamValue(parts[1]);
  } else if (key in obj === false && !path.length) {
    // e.g. convert string 'PR' into {PR: {}} (empty object),
    // to show PR with default properties
    obj[key] = {};
  }
}

function parseCustomParamValue(str) {
  var val;
  if (str.indexOf(',') > 0) {
    val = str.split(',').map(parseFloat);
    // TODO: validate
    return val;
  }
  val = utils.parseNumber(str);
  if (val === null) {
    val = str;
  }
  return val;
}

var WGS84 = {
  // https://en.wikipedia.org/wiki/Earth_radius
  SEMIMAJOR_AXIS: 6378137,
  SEMIMINOR_AXIS: 6356752.3142,
  AUTHALIC_RADIUS: 6371007.2,
  VOLUMETRIC_RADIUS: 6371000.8
};

// TODO: remove this constant, use actual data from dataset CRS,
// also consider using ellipsoidal formulas where greater accuracy might be important.
var R = WGS84.SEMIMAJOR_AXIS;
var D2R = Math.PI / 180;
var R2D = 180 / Math.PI;

// Equirectangular projection
function degreesToMeters(deg) {
  return deg * D2R * R;
}

function distance3D(ax, ay, az, bx, by, bz) {
  var dx = ax - bx,
    dy = ay - by,
    dz = az - bz;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function distanceSq(ax, ay, bx, by) {
  var dx = ax - bx,
      dy = ay - by;
  return dx * dx + dy * dy;
}

function distance2D(ax, ay, bx, by) {
  var dx = ax - bx,
      dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
}

function distanceSq3D(ax, ay, az, bx, by, bz) {
  var dx = ax - bx,
      dy = ay - by,
      dz = az - bz;
  return dx * dx + dy * dy + dz * dz;
}

// atan2() makes this function fairly slow, replaced by ~2x faster formula
function innerAngle2(ax, ay, bx, by, cx, cy) {
  var a1 = Math.atan2(ay - by, ax - bx),
      a2 = Math.atan2(cy - by, cx - bx),
      a3 = Math.abs(a1 - a2);
  if (a3 > Math.PI) {
    a3 = 2 * Math.PI - a3;
  }
  return a3;
}

// Return angle abc in range [0, 2PI) or NaN if angle is invalid
// (e.g. if length of ab or bc is 0)
/*
function signedAngle2(ax, ay, bx, by, cx, cy) {
  var a1 = Math.atan2(ay - by, ax - bx),
      a2 = Math.atan2(cy - by, cx - bx),
      a3 = a2 - a1;

  if (ax == bx && ay == by || bx == cx && by == cy) {
    a3 = NaN; // Use NaN for invalid angles
  } else if (a3 >= Math.PI * 2) {
    a3 = 2 * Math.PI - a3;
  } else if (a3 < 0) {
    a3 = a3 + 2 * Math.PI;
  }
  return a3;
}
*/

function standardAngle(a) {
  var twoPI = Math.PI * 2;
  while (a < 0) {
    a += twoPI;
  }
  while (a >= twoPI) {
    a -= twoPI;
  }
  return a;
}

function signedAngle(ax, ay, bx, by, cx, cy) {
  if (ax == bx && ay == by || bx == cx && by == cy) {
    return NaN; // Use NaN for invalid angles
  }
  var abx = ax - bx,
      aby = ay - by,
      cbx = cx - bx,
      cby = cy - by,
      dotp = abx * cbx + aby * cby,
      crossp = abx * cby - aby * cbx,
      a = Math.atan2(crossp, dotp);
  return standardAngle(a);
}

function bearing2D(x1, y1, x2, y2) {
  var val = Math.PI/2 - Math.atan2(y2 - y1, x2 - x1);
  return val > Math.PI ? val - 2 * Math.PI : val;
}

// Calc bearing in radians at lng1, lat1
function bearing(lng1, lat1, lng2, lat2) {
  var D2R = Math.PI / 180;
  lng1 *= D2R;
  lng2 *= D2R;
  lat1 *= D2R;
  lat2 *= D2R;
  var y = Math.sin(lng2-lng1) * Math.cos(lat2),
      x = Math.cos(lat1)*Math.sin(lat2) - Math.sin(lat1)*Math.cos(lat2)*Math.cos(lng2-lng1);
  return Math.atan2(y, x);
}

// Calc angle of turn from ab to bc, in range [0, 2PI)
// Receive lat-lng values in degrees
function signedAngleSph(alng, alat, blng, blat, clng, clat) {
  if (alng == blng && alat == blat || blng == clng && blat == clat) {
    return NaN;
  }
  var b1 = bearing(blng, blat, alng, alat), // calc bearing at b
      b2 = bearing(blng, blat, clng, clat),
      a = Math.PI * 2 + b1 - b2;
  return standardAngle(a);
}

/*
// Convert arrays of lng and lat coords (xsrc, ysrc) into
// x, y, z coords (meters) on the most common spherical Earth model.
//
function convLngLatToSph(xsrc, ysrc, xbuf, ybuf, zbuf) {
  var deg2rad = Math.PI / 180,
      r = R;
  for (var i=0, len=xsrc.length; i<len; i++) {
    var lng = xsrc[i] * deg2rad,
        lat = ysrc[i] * deg2rad,
        cosLat = Math.cos(lat);
    xbuf[i] = Math.cos(lng) * cosLat * r;
    ybuf[i] = Math.sin(lng) * cosLat * r;
    zbuf[i] = Math.sin(lat) * r;
  }
}
*/

// Convert arrays of lng and lat coords (xsrc, ysrc) into
// x, y, z coords (meters) on the most common spherical Earth model.
//
function convLngLatToSph(xsrc, ysrc, xbuf, ybuf, zbuf) {
  var p = [];
  for (var i=0, len=xsrc.length; i<len; i++) {
    lngLatToXYZ(xsrc[i], ysrc[i], p);
    xbuf[i] = p[0];
    ybuf[i] = p[1];
    zbuf[i] = p[2];
  }
}

function xyzToLngLat(x, y, z, p) {
  var d = distance3D(0, 0, 0, x, y, z); // normalize
  var lat = Math.asin(z / d) / D2R;
  var lng = Math.atan2(y / d, x / d) / D2R;
  p[0] = lng;
  p[1] = lat;
}

function lngLatToXYZ(lng, lat, p) {
  var cosLat;
  lng *= D2R;
  lat *= D2R;
  cosLat = Math.cos(lat);
  p[0] = Math.cos(lng) * cosLat * R;
  p[1] = Math.sin(lng) * cosLat * R;
  p[2] = Math.sin(lat) * R;
}

// Haversine formula (well conditioned at small distances)
function sphericalDistance(lam1, phi1, lam2, phi2) {
  var dlam = lam2 - lam1,
      dphi = phi2 - phi1,
      a = Math.sin(dphi / 2) * Math.sin(dphi / 2) +
          Math.cos(phi1) * Math.cos(phi2) *
          Math.sin(dlam / 2) * Math.sin(dlam / 2),
      c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return c;
}

// Receive: coords in decimal degrees;
// Return: distance in meters on spherical earth
function greatCircleDistance(lng1, lat1, lng2, lat2) {
  var D2R = Math.PI / 180,
      dist = sphericalDistance(lng1 * D2R, lat1 * D2R, lng2 * D2R, lat2 * D2R);
  return dist * R;
}

// TODO: make this safe for small angles
function innerAngle(ax, ay, bx, by, cx, cy) {
  var ab = distance2D(ax, ay, bx, by),
      bc = distance2D(bx, by, cx, cy),
      theta, dotp;
  if (ab === 0 || bc === 0) {
    theta = 0;
  } else {
    dotp = ((ax - bx) * (cx - bx) + (ay - by) * (cy - by)) / (ab * bc);
    if (dotp >= 1 - 1e-14) {
      theta = 0;
    } else if (dotp <= -1 + 1e-14) {
      theta = Math.PI;
    } else {
      theta = Math.acos(dotp); // consider using other formula at small dp
    }
  }
  return theta;
}

function innerAngle3D(ax, ay, az, bx, by, bz, cx, cy, cz) {
  var ab = distance3D(ax, ay, az, bx, by, bz),
      bc = distance3D(bx, by, bz, cx, cy, cz),
      theta, dotp;
  if (ab === 0 || bc === 0) {
    theta = 0;
  } else {
    dotp = ((ax - bx) * (cx - bx) + (ay - by) * (cy - by) + (az - bz) * (cz - bz)) / (ab * bc);
    if (dotp >= 1) {
      theta = 0;
    } else if (dotp <= -1) {
      theta = Math.PI;
    } else {
      theta = Math.acos(dotp); // consider using other formula at small dp
    }
  }
  return theta;
}

function triangleArea(ax, ay, bx, by, cx, cy) {
  var area = Math.abs(((ay - cy) * (bx - cx) + (by - cy) * (cx - ax)) / 2);
  return area;
}

function detSq(ax, ay, bx, by, cx, cy) {
  var det = ax * by - ax * cy + bx * cy - bx * ay + cx * ay - cx * by;
  return det * det;
}

function cosine(ax, ay, bx, by, cx, cy) {
  var den = distance2D(ax, ay, bx, by) * distance2D(bx, by, cx, cy),
      cos = 0;
  if (den > 0) {
    cos = ((ax - bx) * (cx - bx) + (ay - by) * (cy - by)) / den;
    if (cos > 1) cos = 1; // handle fp rounding error
    else if (cos < -1) cos = -1;
  }
  return cos;
}

function cosine3D(ax, ay, az, bx, by, bz, cx, cy, cz) {
  var den = distance3D(ax, ay, az, bx, by, bz) * distance3D(bx, by, bz, cx, cy, cz),
      cos = 0;
  if (den > 0) {
    cos = ((ax - bx) * (cx - bx) + (ay - by) * (cy - by) + (az - bz) * (cz - bz)) / den;
    if (cos > 1) cos = 1; // handle fp rounding error
    else if (cos < -1) cos = -1;
  }
  return cos;
}

function triangleArea3D(ax, ay, az, bx, by, bz, cx, cy, cz) {
  var area = 0.5 * Math.sqrt(detSq(ax, ay, bx, by, cx, cy) +
    detSq(ax, az, bx, bz, cx, cz) + detSq(ay, az, by, bz, cy, cz));
  return area;
}

// Given point B and segment AC, return the squared distance from B to the
// nearest point on AC
// Receive the squared length of segments AB, BC, AC
// TODO: analyze rounding error. Returns 0 for these coordinates:
//    P: [2, 3 - 1e-8]  AB: [[1, 3], [3, 3]]
//
function apexDistSq(ab2, bc2, ac2) {
  var dist2;
  if (ac2 === 0) {
    dist2 = ab2;
  } else if (ab2 >= bc2 + ac2) {
    dist2 = bc2;
  } else if (bc2 >= ab2 + ac2) {
    dist2 = ab2;
  } else {
    var dval = (ab2 + ac2 - bc2);
    dist2 = ab2 -  dval * dval / ac2  * 0.25;
  }
  if (dist2 < 0) {
    dist2 = 0;
  }
  return dist2;
}

function pointSegDistSq(ax, ay, bx, by, cx, cy) {
  var ab2 = distanceSq(ax, ay, bx, by),
      ac2 = distanceSq(ax, ay, cx, cy),
      bc2 = distanceSq(bx, by, cx, cy);
  return apexDistSq(ab2, ac2, bc2);
}

function pointSegDistSq3D(ax, ay, az, bx, by, bz, cx, cy, cz) {
  var ab2 = distanceSq3D(ax, ay, az, bx, by, bz),
      ac2 = distanceSq3D(ax, ay, az, cx, cy, cz),
      bc2 = distanceSq3D(bx, by, bz, cx, cy, cz);
  return apexDistSq(ab2, ac2, bc2);
}

// Apparently better conditioned for some inputs than pointSegDistSq()
//
function pointSegDistSq2(px, py, ax, ay, bx, by) {
  var ab2 = distanceSq(ax, ay, bx, by);
  var t = ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / ab2;
  if (ab2 === 0) return distanceSq(px, py, ax, ay);
  if (t < 0) t = 0;
  if (t > 1) t = 1;
  return distanceSq(px, py, ax + t * (bx - ax), ay + t * (by - ay));
}


// internal.reversePathCoords = function(arr, start, len) {
//   var i = start,
//       j = start + len - 1,
//       tmp;
//   while (i < j) {
//     tmp = arr[i];
//     arr[i] = arr[j];
//     arr[j] = tmp;
//     i++;
//     j--;
//   }
// };

// merge B into A
// function mergeBounds(a, b) {
//   if (b[0] < a[0]) a[0] = b[0];
//   if (b[1] < a[1]) a[1] = b[1];
//   if (b[2] > a[2]) a[2] = b[2];
//   if (b[3] > a[3]) a[3] = b[3];
// }

function containsBounds(a, b) {
  return a[0] <= b[0] && a[2] >= b[2] && a[1] <= b[1] && a[3] >= b[3];
}

// function boundsArea(b) {
//   return (b[2] - b[0]) * (b[3] - b[1]);
// }

var Geom = /*#__PURE__*/Object.freeze({
  __proto__: null,
  R: R,
  D2R: D2R,
  R2D: R2D,
  degreesToMeters: degreesToMeters,
  distance3D: distance3D,
  distanceSq: distanceSq,
  distance2D: distance2D,
  distanceSq3D: distanceSq3D,
  innerAngle2: innerAngle2,
  standardAngle: standardAngle,
  signedAngle: signedAngle,
  bearing2D: bearing2D,
  bearing: bearing,
  signedAngleSph: signedAngleSph,
  convLngLatToSph: convLngLatToSph,
  xyzToLngLat: xyzToLngLat,
  lngLatToXYZ: lngLatToXYZ,
  sphericalDistance: sphericalDistance,
  greatCircleDistance: greatCircleDistance,
  innerAngle: innerAngle,
  innerAngle3D: innerAngle3D,
  triangleArea: triangleArea,
  cosine: cosine,
  cosine3D: cosine3D,
  triangleArea3D: triangleArea3D,
  pointSegDistSq: pointSegDistSq,
  pointSegDistSq3D: pointSegDistSq3D,
  pointSegDistSq2: pointSegDistSq2,
  containsBounds: containsBounds
});

function pathIsClosed(ids, arcs) {
  var firstArc = ids[0];
  var lastArc = ids[ids.length - 1];
  var p1 = arcs.getVertex(firstArc, 0);
  var p2 = arcs.getVertex(lastArc, -1);
  var closed = p1.x === p2.x && p1.y === p2.y;
  return closed;
}

function getPointToPathDistance(px, py, ids, arcs) {
  return getPointToPathInfo(px, py, ids, arcs).distance;
}

function getPointToPathInfo(px, py, ids, arcs) {
  var iter = arcs.getShapeIter(ids);
  var pPathSq = Infinity;
  var arcId;
  var ax, ay, bx, by, axmin, aymin, bxmin, bymin, pabSq;
  if (iter.hasNext()) {
    ax = axmin = bxmin = iter.x;
    ay = aymin = bymin = iter.y;
  }
  while (iter.hasNext()) {
    bx = iter.x;
    by = iter.y;
    pabSq = pointSegDistSq2(px, py, ax, ay, bx, by);
    if (pabSq < pPathSq) {
      pPathSq = pabSq;
      arcId = iter._ids[iter._i]; // kludge
      axmin = ax;
      aymin = ay;
      bxmin = bx;
      bymin = by;
    }
    ax = bx;
    ay = by;
  }
  if (pPathSq == Infinity) return {distance: Infinity};
  return {
    segment: [[axmin, aymin], [bxmin, bymin]],
    distance: Math.sqrt(pPathSq),
    arcId: arcId
  };
}


// Return unsigned distance of a point to the nearest point on a polygon or polyline path
//
function getPointToShapeDistance(x, y, shp, arcs) {
  var info = getPointToShapeInfo(x, y, shp, arcs);
  return info ? info.distance : Infinity;
}

function getPointToShapeInfo(x, y, shp, arcs) {
  return (shp || []).reduce(function(memo, ids) {
    var pathInfo = getPointToPathInfo(x, y, ids, arcs);
    if (!memo || pathInfo.distance < memo.distance) return pathInfo;
    return memo;
  }, null) || {
    distance: Infinity,
    arcId: -1,
    segment: null
  };
}

// @ids array of arc ids
// @arcs ArcCollection
function getAvgPathXY(ids, arcs) {
  var iter = arcs.getShapeIter(ids);
  if (!iter.hasNext()) return null;
  var x0 = iter.x,
      y0 = iter.y,
      count = 0,
      sumX = 0,
      sumY = 0;
  while (iter.hasNext()) {
    count++;
    sumX += iter.x;
    sumY += iter.y;
  }
  if (count === 0 || iter.x !== x0 || iter.y !== y0) {
    sumX += x0;
    sumY += y0;
    count++;
  }
  return {
    x: sumX / count,
    y: sumY / count
  };
}

// Return path with the largest (area) bounding box
// @shp array of array of arc ids
// @arcs ArcCollection
function getMaxPath(shp, arcs) {
  var maxArea = 0;
  return (shp || []).reduce(function(maxPath, path) {
    var bbArea = arcs.getSimpleShapeBounds(path).area();
    if (bbArea > maxArea) {
      maxArea = bbArea;
      maxPath = path;
    }
    return maxPath;
  }, null);
}

function countVerticesInPath(ids, arcs) {
  var iter = arcs.getShapeIter(ids),
      count = 0;
  while (iter.hasNext()) count++;
  return count;
}

function getPathBounds$1(points) {
  var bounds = new Bounds();
  for (var i=0, n=points.length; i<n; i++) {
    bounds.mergePoint(points[i][0], points[i][1]);
  }
  return bounds;
}

var calcPathLen;
calcPathLen = (function() {
  var len, calcLen;
  function addSegLen(i, j, xx, yy) {
    len += calcLen(xx[i], yy[i], xx[j], yy[j]);
  }
  // @spherical (optional bool) calculate great circle length in meters
  return function(path, arcs, spherical) {
    if (spherical && arcs.isPlanar()) {
      error("Expected lat-long coordinates");
    }
    calcLen = spherical ? greatCircleDistance : distance2D;
    len = 0;
    for (var i=0, n=path.length; i<n; i++) {
      arcs.forEachArcSegment(path[i], addSegLen);
    }
    return len;
  };
}());

var PathGeom = /*#__PURE__*/Object.freeze({
  __proto__: null,
  pathIsClosed: pathIsClosed,
  getPointToPathDistance: getPointToPathDistance,
  getPointToPathInfo: getPointToPathInfo,
  getPointToShapeDistance: getPointToShapeDistance,
  getPointToShapeInfo: getPointToShapeInfo,
  getAvgPathXY: getAvgPathXY,
  getMaxPath: getMaxPath,
  countVerticesInPath: countVerticesInPath,
  getPathBounds: getPathBounds$1,
  get calcPathLen () { return calcPathLen; }
});

// Get the centroid of the largest ring of a polygon
// TODO: Include holes in the calculation
// TODO: Add option to find centroid of all rings, not just the largest
function getShapeCentroid(shp, arcs) {
  var maxPath = getMaxPath(shp, arcs);
  return maxPath ? getPathCentroid(maxPath, arcs) : null;
}

function getPathCentroid(ids, arcs) {
  var iter = arcs.getShapeIter(ids),
      sum = 0,
      sumX = 0,
      sumY = 0,
      dx, dy, ax, ay, bx, by, tmp, area;
  if (!iter.hasNext()) return null;
  // reduce effect of fp errors by shifting shape origin to 0,0 (issue #304)
  ax = 0;
  ay = 0;
  dx = -iter.x;
  dy = -iter.y;
  while (iter.hasNext()) {
    bx = ax;
    by = ay;
    ax = iter.x + dx;
    ay = iter.y + dy;
    tmp = bx * ay - by * ax;
    sum += tmp;
    sumX += tmp * (bx + ax);
    sumY += tmp * (by + ay);
  }
  area = sum / 2;
  if (area === 0) {
    return getAvgPathXY(ids, arcs);
  } else return {
    x: sumX / (6 * area) - dx,
    y: sumY / (6 * area) - dy
  };
}

var PolygonCentroid = /*#__PURE__*/Object.freeze({
  __proto__: null,
  getShapeCentroid: getShapeCentroid,
  getPathCentroid: getPathCentroid
});

function absArcId(arcId) {
  return arcId >= 0 ? arcId : ~arcId;
}

function calcArcBounds(xx, yy, start, len) {
  var i = start | 0,
      n = isNaN(len) ? xx.length - i : len + i,
      x, y, xmin, ymin, xmax, ymax;
  if (n > 0) {
    xmin = xmax = xx[i];
    ymin = ymax = yy[i];
  }
  for (i++; i<n; i++) {
    x = xx[i];
    y = yy[i];
    if (x < xmin) xmin = x;
    if (x > xmax) xmax = x;
    if (y < ymin) ymin = y;
    if (y > ymax) ymax = y;
  }
  return [xmin, ymin, xmax, ymax];
}

function getArcPresenceTest(shapes, arcs) {
  var counts = new Uint8Array(arcs.size());
  countArcsInShapes(shapes, counts);
  return function(id) {
    if (id < 0) id = ~id;
    return counts[id] > 0;
  };
}

// @counts A typed array for accumulating count of each abs arc id
//   (assume it won't overflow)
function countArcsInShapes(shapes, counts) {
  traversePaths(shapes, null, function(obj) {
    var arcs = obj.arcs,
        id;
    for (var i=0; i<arcs.length; i++) {
      id = arcs[i];
      if (id < 0) id = ~id;
      counts[id]++;
    }
  });
}

function getPathBounds(shapes, arcs) {
  var bounds = new Bounds();
  forEachArcId(shapes, function(id) {
    arcs.mergeArcBounds(id, bounds);
  });
  return bounds;
}

function reversePath(ids) {
  ids.reverse();
  for (var i=0, n=ids.length; i<n; i++) {
    ids[i] = ~ids[i];
  }
  return ids;
}

function clampIntervalByPct(z, pct) {
  if (pct <= 0) z = Infinity;
  else if (pct >= 1) z = 0;
  return z;
}

// Visit each arc id in a path, shape or array of shapes
// Use non-undefined return values of callback @cb as replacements.
function forEachArcId(arr, cb) {
  var item;
  for (var i=0; i<arr.length; i++) {
    item = arr[i];
    if (item instanceof Array) {
      forEachArcId(item, cb);
    } else if (utils.isInteger(item)) {
      var val = cb(item);
      if (val !== void 0) {
        arr[i] = val;
      }
    } else if (item) {
      error("Non-integer arc id in:", arr);
    }
  }
}

function forEachSegmentInShape(shape, arcs, cb) {
  for (var i=0, n=shape ? shape.length : 0; i<n; i++) {
    forEachSegmentInPath(shape[i], arcs, cb);
  }
}

function forEachSegmentInPath(ids, arcs, cb) {
  for (var i=0, n=ids.length; i<n; i++) {
    arcs.forEachArcSegment(ids[i], cb);
  }
}

function traversePaths(shapes, cbArc, cbPart, cbShape) {
  var segId = 0;
  shapes.forEach(function(parts, shapeId) {
    if (!parts || parts.length === 0) return; // null shape
    var arcIds, arcId;
    if (cbShape) {
      cbShape(shapeId);
    }
    for (var i=0, m=parts.length; i<m; i++) {
      arcIds = parts[i];
      if (cbPart) {
        cbPart({
          i: i,
          shapeId: shapeId,
          shape: parts,
          arcs: arcIds
        });
      }

      if (cbArc) {
        for (var j=0, n=arcIds.length; j<n; j++, segId++) {
          arcId = arcIds[j];
          cbArc({
            i: j,
            shapeId: shapeId,
            partId: i,
            arcId: arcId,
            segId: segId
          });
        }
      }
    }
  });
}

// A compactness measure designed for testing electoral districts for gerrymandering.
// Returns value in [0-1] range. 1 = perfect circle, 0 = collapsed polygon
function calcPolsbyPopperCompactness(area, perimeter) {
  if (perimeter <= 0) return 0;
  return Math.abs(area) * Math.PI * 4 / (perimeter * perimeter);
}

// Larger values (less severe penalty) than Polsby Popper
function calcSchwartzbergCompactness(area, perimeter) {
  if (perimeter <= 0) return 0;
  return 2 * Math.PI * Math.sqrt(Math.abs(area) / Math.PI) / perimeter;
}

// Returns: 1 if CW, -1 if CCW, 0 if collapsed
function getPathWinding(ids, arcs) {
  var area = getPathArea(ids, arcs);
  return area > 0 && 1 || area < 0 && -1 || 0;
}

function getShapeArea(shp, arcs) {
  // return (arcs.isPlanar() ? geom.getPlanarShapeArea : geom.getSphericalShapeArea)(shp, arcs);
  return (shp || []).reduce(function(area, ids) {
    return area + getPathArea(ids, arcs);
  }, 0);
}

function getPlanarShapeArea(shp, arcs) {
  return (shp || []).reduce(function(area, ids) {
    return area + getPlanarPathArea(ids, arcs);
  }, 0);
}

function getSphericalShapeArea(shp, arcs, R) {
  if (arcs.isPlanar()) {
    error("[getSphericalShapeArea()] Function requires decimal degree coordinates");
  }
  return (shp || []).reduce(function(area, ids) {
    return area + getSphericalPathArea(ids, arcs, R);
  }, 0);
}

// export function getEllipsoidalShapeArea(shp, arcs, crs) {
//   return (shp || []).reduce(function(area, ids) {
//     return area + getEllipsoidalPathArea(ids, arcs, crs);
//   }, 0);
// }

// Return true if point is inside or on boundary of a shape
//
function testPointInPolygon(x, y, shp, arcs) {
  var isIn = false,
      isOn = false;
  if (shp) {
    shp.forEach(function(ids) {
      var inRing = testPointInRing(x, y, ids, arcs);
      if (inRing == 1) {
        isIn = !isIn;
      } else if (inRing == -1) {
        isOn = true;
      }
    });
  }
  return isOn || isIn;
}

function getYIntercept(x, ax, ay, bx, by) {
  return ay + (x - ax) * (by - ay) / (bx - ax);
}

// Test if point (x, y) is inside, outside or on the boundary of a polygon ring
// Return 0: outside; 1: inside; -1: on boundary
//
function testPointInRing(x, y, ids, arcs) {
  /*
  // arcs.getSimpleShapeBounds() doesn't apply simplification, can't use here
  //// wait, why not? simplifcation shoudn't expand bounds, so this test makes sense
  if (!arcs.getSimpleShapeBounds(ids).containsPoint(x, y)) {
    return false;
  }
  */
  var isIn = false,
      isOn = false;
  forEachSegmentInPath(ids, arcs, function(a, b, xx, yy) {
    var result = testRayIntersection(x, y, xx[a], yy[a], xx[b], yy[b]);
    if (result == 1) {
      isIn = !isIn;
    } else if (isNaN(result)) {
      isOn = true;
    }
  });
  return isOn ? -1 : (isIn ? 1 : 0);
}

// test if a vertical ray originating at (x, y) intersects a segment
// returns 1 if intersection, 0 if no intersection, NaN if point touches segment
// (Special rules apply to endpoint intersections, to support point-in-polygon testing.)
function testRayIntersection(x, y, ax, ay, bx, by) {
  var val = getRayIntersection(x, y, ax, ay, bx, by);
  if (val != val) {
    return NaN;
  }
  return val == -Infinity ? 0 : 1;
}

function getRayIntersection(x, y, ax, ay, bx, by) {
  var hit = -Infinity, // default: no hit
      yInt;

  // case: p is entirely above, left or right of segment
  if (x < ax && x < bx || x > ax && x > bx || y > ay && y > by) ;
  // case: px aligned with a segment vertex
  else if (x === ax || x === bx) {
    // case: vertical segment or collapsed segment
    if (x === ax && x === bx) {
      // p is on segment
      if (y == ay || y == by || y > ay != y > by) {
        hit = NaN;
      }
      // else: no hit
    }
    // case: px equal to ax (only)
    else if (x === ax) {
      if (y === ay) {
        hit = NaN;
      } else if (bx < ax && y < ay) {
        // only score hit if px aligned to rightmost endpoint
        hit = ay;
      }
    }
    // case: px equal to bx (only)
    else {
      if (y === by) {
        hit = NaN;
      } else if (ax < bx && y < by) {
        // only score hit if px aligned to rightmost endpoint
        hit = by;
      }
    }
  // case: px is between endpoints
  } else {
    yInt = getYIntercept(x, ax, ay, bx, by);
    if (yInt > y) {
      hit = yInt;
    } else if (yInt == y) {
      hit = NaN;
    }
  }
  return hit;
}

function getPathArea(ids, arcs) {
  return (arcs.isPlanar() ? getPlanarPathArea : getSphericalPathArea)(ids, arcs);
}

function getSphericalPathArea(ids, arcs, R) {
  var iter = arcs.getShapeIter(ids);
  return getSphericalPathArea2(iter, R);
}

function getSphericalPathArea2(iter, R) {
  var sum = 0,
      started = false,
      deg2rad = Math.PI / 180,
      x, y, xp, yp;
  R = R || WGS84.SEMIMAJOR_AXIS;
  while (iter.hasNext()) {
    x = iter.x * deg2rad;
    y = Math.sin(iter.y * deg2rad);
    if (started) {
      sum += (x - xp) * (2 + y + yp);
    } else {
      started = true;
    }
    xp = x;
    yp = y;
  }
  return sum / 2 * R * R;
}

// Get path area from an array of [x, y] points
// TODO: consider removing duplication with getPathArea(), e.g. by
//   wrapping points in an iterator.
//
function getPlanarPathArea2(points) {
  var sum = 0,
      ax, ay, bx, by, dx, dy, p;
  for (var i=0, n=points.length; i<n; i++) {
    p = points[i];
    if (i === 0) {
      ax = 0;
      ay = 0;
      dx = -p[0];
      dy = -p[1];
    } else {
      ax = p[0] + dx;
      ay = p[1] + dy;
      sum += ax * by - bx * ay;
    }
    bx = ax;
    by = ay;
  }
  return sum / 2;
}

function getPlanarPathArea(ids, arcs) {
  var iter = arcs.getShapeIter(ids),
      sum = 0,
      ax, ay, bx, by, dx, dy;
  if (iter.hasNext()) {
    ax = 0;
    ay = 0;
    dx = -iter.x;
    dy = -iter.y;
    while (iter.hasNext()) {
      bx = ax;
      by = ay;
      ax = iter.x + dx;
      ay = iter.y + dy;
      sum += ax * by - bx * ay;
    }
  }
  return sum / 2;
}

function getPathPerimeter(ids, arcs) {
  return (arcs.isPlanar() ? getPlanarPathPerimeter : getSphericalPathPerimeter)(ids, arcs);
}

function getShapePerimeter(shp, arcs) {
  return (shp || []).reduce(function(len, ids) {
    return len + getPathPerimeter(ids, arcs);
  }, 0);
}

function getSphericalShapePerimeter(shp, arcs) {
  if (arcs.isPlanar()) {
    error("[getSphericalShapePerimeter()] Function requires decimal degree coordinates");
  }
  return (shp || []).reduce(function(len, ids) {
    return len + getSphericalPathPerimeter(ids, arcs);
  }, 0);
}

function getPlanarPathPerimeter(ids, arcs) {
  return calcPathLen(ids, arcs, false);
}

function getSphericalPathPerimeter(ids, arcs) {
  return calcPathLen(ids, arcs, true);
}

var PolygonGeom = /*#__PURE__*/Object.freeze({
  __proto__: null,
  calcPolsbyPopperCompactness: calcPolsbyPopperCompactness,
  calcSchwartzbergCompactness: calcSchwartzbergCompactness,
  getPathWinding: getPathWinding,
  getShapeArea: getShapeArea,
  getPlanarShapeArea: getPlanarShapeArea,
  getSphericalShapeArea: getSphericalShapeArea,
  testPointInPolygon: testPointInPolygon,
  testPointInRing: testPointInRing,
  testRayIntersection: testRayIntersection,
  getRayIntersection: getRayIntersection,
  getPathArea: getPathArea,
  getSphericalPathArea: getSphericalPathArea,
  getSphericalPathArea2: getSphericalPathArea2,
  getPlanarPathArea2: getPlanarPathArea2,
  getPlanarPathArea: getPlanarPathArea,
  getPathPerimeter: getPathPerimeter,
  getShapePerimeter: getShapePerimeter,
  getSphericalShapePerimeter: getSphericalShapePerimeter,
  getPlanarPathPerimeter: getPlanarPathPerimeter,
  getSphericalPathPerimeter: getSphericalPathPerimeter
});

// Returns an interval for snapping together coordinates that be co-incident bug
// have diverged because of floating point rounding errors. Intended to be small
// enought not not to snap points that should be distinct.
// This is not a robust method... e.g. some formulas for some inputs may produce
// errors that are larger than this interval.
// @coords: Array of relevant coordinates (e.g. bbox coordinates of vertex coordinates
//   of two intersecting segments).
//
function getHighPrecisionSnapInterval(coords) {
  var maxCoord = Math.max.apply(null, coords.map(Math.abs));
  return maxCoord * 1e-14;
}

function snapCoordsByInterval(arcs, snapDist) {
  if (snapDist > 0 === false) return 0;
  var ids = getCoordinateIds(arcs);
  return snapCoordsInternal(ids, arcs, snapDist);
}

// Snap together points within a small threshold
//
function snapCoordsInternal(ids, arcs, snapDist) {
  var snapCount = 0,
      n = ids.length,
      data = arcs.getVertexData();

  quicksortIds(data.xx, ids, 0, n-1);

  // Consider: speed up sorting -- try bucket sort as first pass.
  for (var i=0; i<n; i++) {
    snapCount += snapPoint(i, snapDist, ids, data.xx, data.yy);
  }
  return snapCount;

  function snapPoint(i, limit, ids, xx, yy) {
    var j = i,
        n = ids.length,
        x = xx[ids[i]],
        y = yy[ids[i]],
        snaps = 0,
        id2, dx, dy;

    while (++j < n) {
      id2 = ids[j];
      dx = xx[id2] - x;
      if (dx > limit) break;
      dy = yy[id2] - y;
      if (dx === 0 && dy === 0 || dx * dx + dy * dy > limit * limit) continue;
      xx[id2] = x;
      yy[id2] = y;
      snaps++;
    }
    return snaps;
  }
}

function getCoordinateIds(arcs) {
  var data = arcs.getVertexData(),
      n = data.xx.length,
      ids = new Uint32Array(n);
  for (var i=0; i<n; i++) {
    ids[i] = i;
  }
  return ids;
}

/*
// Returns array of array ids, in ascending order.
// @a array of numbers
//
utils.sortCoordinateIds = function(a) {
  return utils.bucketSortIds(a);
};

// This speeds up sorting of large datasets (~2x faster for 1e7 values)
// worth the additional code?
utils.bucketSortIds = function(a, n) {
  var len = a.length,
      ids = new Uint32Array(len),
      bounds = utils.getArrayBounds(a),
      buckets = Math.ceil(n > 0 ? n : len / 10),
      counts = new Uint32Array(buckets),
      offsets = new Uint32Array(buckets),
      i, j, offs, count;

  // get bucket sizes
  for (i=0; i<len; i++) {
    j = bucketId(a[i], bounds.min, bounds.max, buckets);
    counts[j]++;
  }

  // convert counts to offsets
  offs = 0;
  for (i=0; i<buckets; i++) {
    offsets[i] = offs;
    offs += counts[i];
  }

  // assign ids to buckets
  for (i=0; i<len; i++) {
    j = bucketId(a[i], bounds.min, bounds.max, buckets);
    offs = offsets[j]++;
    ids[offs] = i;
  }

  // sort each bucket with quicksort
  for (i = 0; i<buckets; i++) {
    count = counts[i];
    if (count > 1) {
      offs = offsets[i] - count;
      utils.quicksortIds(a, ids, offs, offs + count - 1);
    }
  }
  return ids;

  function bucketId(val, min, max, buckets) {
    var id = (buckets * (val - min) / (max - min)) | 0;
    return id < buckets ? id : buckets - 1;
  }
};
*/

function quicksortIds(a, ids, lo, hi) {
  if (hi - lo > 24) {
    var pivot = a[ids[lo + hi >> 1]],
        i = lo,
        j = hi,
        tmp;
    while (i <= j) {
      while (a[ids[i]] < pivot) i++;
      while (a[ids[j]] > pivot) j--;
      if (i <= j) {
        tmp = ids[i];
        ids[i] = ids[j];
        ids[j] = tmp;
        i++;
        j--;
      }
    }
    if (j > lo) quicksortIds(a, ids, lo, j);
    if (i < hi) quicksortIds(a, ids, i, hi);
  } else {
    insertionSortIds(a, ids, lo, hi);
  }
}

function insertionSortIds(arr, ids, start, end) {
  var id, i, j;
  for (j = start + 1; j <= end; j++) {
    id = ids[j];
    for (i = j - 1; i >= start && arr[id] < arr[ids[i]]; i--) {
      ids[i+1] = ids[i];
    }
    ids[i+1] = id;
  }
}

// Find the intersection between two 2D segments
// Returns 0, 1 or 2 [x, y] locations as null, [x, y], or [x1, y1, x2, y2]
// Special cases:
// Endpoint-to-endpoint touches are not treated as intersections.
// If the segments touch at a T-intersection, it is treated as an intersection.
// If the segments are collinear and partially overlapping, each subsumed endpoint
//    is counted as an intersection (there will be either one or two)
//
function segmentIntersection(ax, ay, bx, by, cx, cy, dx, dy, epsArg) {
  // Use a small tolerance interval, so collinear segments and T-intersections
  // are detected (floating point rounding often causes exact functions to fail)
  var eps = epsArg >= 0 ? epsArg :
      getHighPrecisionSnapInterval([ax, ay, bx, by, cx, cy, dx, dy]);
  var epsSq = eps * eps;
  var touches, cross;
  // Detect 0, 1 or 2 'touch' intersections, where a vertex of one segment
  // is very close to the other segment's linear portion.
  // One touch indicates either a T-intersection or two overlapping collinear
  // segments that share an endpoint. Two touches indicates overlapping
  // collinear segments that do not share an endpoint.
  touches = findPointSegTouches(epsSq, ax, ay, bx, by, cx, cy, dx, dy);
  // if (touches) return touches;
  // Ignore endpoint-only intersections
  if (!touches && testEndpointHit(epsSq, ax, ay, bx, by, cx, cy, dx, dy)) {
    return null;
  }
  // Detect cross intersection
  cross = findCrossIntersection(ax, ay, bx, by, cx, cy, dx, dy, eps);
  return touches || cross || null;
}


// Find the intersection point of two segments that cross each other,
// or return null if the segments do not cross.
// Assumes endpoint intersections have already been detected
function findCrossIntersection(ax, ay, bx, by, cx, cy, dx, dy, eps) {
  if (!segmentHit(ax, ay, bx, by, cx, cy, dx, dy)) return null;
  var den = determinant2D(bx - ax, by - ay, dx - cx, dy - cy);
  var m = orient2D(cx, cy, dx, dy, ax, ay) / den;
  var p = [ax + m * (bx - ax), ay + m * (by - ay)];
  if (Math.abs(den) < 1e-18) {
    // assume that collinear and near-collinear segment intersections have been
    // accounted for already.
    // TODO: is this a valid assumption?
    return null;
  }

  // Snap p to a vertex if very close to one
  // This avoids tiny segments caused by T-intersection overshoots and prevents
  //   pathfinder errors related to f-p rounding.
  // (NOTE: this may no longer be needed, since T-intersections are now detected
  // first)
  if (eps > 0) {
    snapIntersectionPoint(p, ax, ay, bx, by, cx, cy, dx, dy, eps);
  }
  // Clamp point to x range and y range of both segments
  // (This may occur due to fp rounding, if one segment is vertical or horizontal)
  clampIntersectionPoint(p, ax, ay, bx, by, cx, cy, dx, dy);
  return p;
}

function testEndpointHit(epsSq, ax, ay, bx, by, cx, cy, dx, dy) {
  return distanceSq(ax, ay, cx, cy) <= epsSq || distanceSq(ax, ay, dx, dy) <= epsSq ||
    distanceSq(bx, by, cx, cy) <= epsSq || distanceSq(bx, by, dx, dy) <= epsSq;
}

function findPointSegTouches(epsSq, ax, ay, bx, by, cx, cy, dx, dy) {
  var touches = [];
  collectPointSegTouch(touches, epsSq, ax, ay, cx, cy, dx, dy);
  collectPointSegTouch(touches, epsSq, bx, by, cx, cy, dx, dy);
  collectPointSegTouch(touches, epsSq, cx, cy, ax, ay, bx, by);
  collectPointSegTouch(touches, epsSq, dx, dy, ax, ay, bx, by);
  if (touches.length === 0) return null;
  if (touches.length > 4) ;
  return touches;
}

function collectPointSegTouch(arr, epsSq, px, py, ax, ay, bx, by) {
  // The original point-seg distance function caused errors in test data.
  // (probably because of large rounding errors with some inputs).
  // var pab = pointSegDistSq(px, py, ax, ay, bx, by);
  var pab = pointSegDistSq2(px, py, ax, ay, bx, by);
  if (pab > epsSq) return; // point is too far from segment to touch
  var pa = distanceSq(ax, ay, px, py);
  var pb = distanceSq(bx, by, px, py);
  if (pa <= epsSq || pb <= epsSq) return; // ignore endpoint hits
  arr.push(px, py); // T intersection at P and AB
}


// Used by mapshaper-undershoots.js
// TODO: make more robust, make sure result is compatible with segmentIntersection()
// (rounding errors currently must be handled downstream)
function findClosestPointOnSeg(px, py, ax, ay, bx, by) {
  var dx = bx - ax,
      dy = by - ay,
      dotp = (px - ax) * dx + (py - ay) * dy,
      abSq = dx * dx + dy * dy,
      k = abSq === 0 ? -1 : dotp / abSq,
      eps = 0.1, // 1e-6, // snap to endpoint
      p;
  if (k <= eps) {
    p = [ax, ay];
  } else if (k >= 1 - eps) {
    p = [bx, by];
  } else {
    p = [ax + k * dx, ay + k * dy];
  }
  return p;
}

function snapIfCloser(p, minDist, x, y, x2, y2) {
  var dist = distance2D(x, y, x2, y2);
  if (dist < minDist) {
    minDist = dist;
    p[0] = x2;
    p[1] = y2;
  }
  return minDist;
}

function snapIntersectionPoint(p, ax, ay, bx, by, cx, cy, dx, dy, eps) {
  var x = p[0],
      y = p[1],
      snapDist = eps;
  snapDist = snapIfCloser(p, snapDist, x, y, ax, ay);
  snapDist = snapIfCloser(p, snapDist, x, y, bx, by);
  snapDist = snapIfCloser(p, snapDist, x, y, cx, cy);
  snapDist = snapIfCloser(p, snapDist, x, y, dx, dy);
}

function clampIntersectionPoint(p, ax, ay, bx, by, cx, cy, dx, dy) {
  // Handle intersection points that fall outside the x-y range of either
  // segment by snapping to nearest endpoint coordinate. Out-of-range
  // intersection points can be caused by floating point rounding errors
  // when a segment is vertical or horizontal. This has caused problems when
  // repeatedly applying bbox clipping along the same segment
  var x = p[0],
      y = p[1];
  // assumes that segment ranges intersect
  x = clampToCloseRange(x, ax, bx);
  x = clampToCloseRange(x, cx, dx);
  y = clampToCloseRange(y, ay, by);
  y = clampToCloseRange(y, cy, dy);
  p[0] = x;
  p[1] = y;
}

// a: coordinate of point
// b: endpoint coordinate of segment
// c: other endpoint of segment
function outsideRange(a, b, c) {
  var out;
  if (b < c) {
    out = a < b || a > c;
  } else if (b > c) {
    out = a > b || a < c;
  } else {
    out = a != b;
  }
  return out;
}

function clampToCloseRange(a, b, c) {
  var lim;
  if (outsideRange(a, b, c)) {
    lim = Math.abs(a - b) < Math.abs(a - c) ? b : c;
    a = lim;
  }
  return a;
}

// Determinant of matrix
//  | a  b |
//  | c  d |
function determinant2D(a, b, c, d) {
  return a * d - b * c;
}

// returns a positive value if the points a, b, and c are arranged in
// counterclockwise order, a negative value if the points are in clockwise
// order, and zero if the points are collinear.
// Source: Jonathan Shewchuk http://www.cs.berkeley.edu/~jrs/meshpapers/robnotes.pdf
function orient2D(ax, ay, bx, by, cx, cy) {
  return determinant2D(ax - cx, ay - cy, bx - cx, by - cy);
}

// Source: Sedgewick, _Algorithms in C_
// (Other functions were tried that were more sensitive to floating point errors
//  than this function)
function segmentHit(ax, ay, bx, by, cx, cy, dx, dy) {
  return orient2D(ax, ay, bx, by, cx, cy) *
      orient2D(ax, ay, bx, by, dx, dy) <= 0 &&
      orient2D(cx, cy, dx, dy, ax, ay) *
      orient2D(cx, cy, dx, dy, bx, by) <= 0;
}

// Useful for determining if a segment that intersects another segment is
// entering or leaving an enclosed buffer area
// returns -1 if angle of p1p2 -> p3p4 is counter-clockwise (left turn)
// returns 1 if angle is clockwise
// return 0 if segments are collinear
function segmentTurn(p1, p2, p3, p4) {
  var ax = p1[0],
      ay = p1[1],
      bx = p2[0],
      by = p2[1],
      // shift p3p4 segment to start at p2
      dx = bx - p3[0],
      dy = by - p3[1],
      cx = p4[0] + dx,
      cy = p4[1] + dy,
      orientation = orient2D(ax, ay, bx, by, cx, cy);
    if (!orientation) return 0;
    return orientation < 0 ? 1 : -1;
}

var SegmentGeom = /*#__PURE__*/Object.freeze({
  __proto__: null,
  segmentIntersection: segmentIntersection,
  findClosestPointOnSeg: findClosestPointOnSeg,
  orient2D: orient2D,
  segmentHit: segmentHit,
  segmentTurn: segmentTurn
});

var geom = Object.assign({}, Geom, PolygonGeom, PathGeom, SegmentGeom, PolygonCentroid);

function getWorldBounds(e) {
  e = utils.isFiniteNumber(e) ? e : 1e-10;
  return [-180 + e, -90 + e, 180 - e, 90 - e];
}

function probablyDecimalDegreeBounds(b) {
  var world = getWorldBounds(-1), // add a bit of excess
      bbox = (b instanceof Bounds) ? b.toArray() : b;
  return geom.containsBounds(world, bbox);
}

function getPointBounds(shapes) {
  var bounds = new Bounds();
  forEachPoint(shapes, function(p) {
    bounds.mergePoint(p[0], p[1]);
  });
  return bounds;
}

// Iterate over each [x,y] point in a layer
// shapes: one layer's "shapes" array
function forEachPoint(shapes, cb) {
  var i, n, j, m, shp;
  for (i=0, n=shapes.length; i<n; i++) {
    shp = shapes[i];
    for (j=0, m=shp ? shp.length : 0; j<m; j++) {
      cb(shp[j], i);
    }
  }
}

function forEachShapePart(paths, cb) {
  editShapeParts(paths, cb);
}

// Updates shapes array in-place.
// editPart: callback function
function editShapes(shapes, editPart) {
  for (var i=0, n=shapes.length; i<n; i++) {
    shapes[i] = editShapeParts(shapes[i], editPart);
  }
}

// @parts: geometry of a feature (array of paths, array of points or null)
// @cb: function(part, i, parts)
//    If @cb returns an array, it replaces the existing value
//    If @cb returns null, the path is removed from the feature
//
function editShapeParts(parts, cb) {
  if (!parts) return null; // null geometry not edited
  if (!utils.isArray(parts)) error("Expected an array, received:", parts);
  var nulls = 0,
      n = parts.length,
      retn;

  for (var i=0; i<n; i++) {
    retn = cb(parts[i], i, parts);
    if (retn === null) {
      nulls++;
      parts[i] = null;
    } else if (utils.isArray(retn)) {
      parts[i] = retn;
    }
  }
  if (nulls == n) {
    return null;
  } else if (nulls > 0) {
    return parts.filter(function(part) {return !!part;});
  } else {
    return parts;
  }
}

// import { createRequire } from "module";

// import iconv from 'iconv-lite';
// import * as iconv from 'iconv-lite';
// import * as iconv from '../../node_modules/iconv-lite/lib/index.js';

// List of encodings supported by iconv-lite:
// https://github.com/ashtuchkin/iconv-lite/wiki/Supported-Encodings

var toUtf8 = getNativeEncoder('utf8');
getNativeDecoder('utf8');

function encodingIsUtf8(enc) {
  // treating utf-8 as default
  return !enc || /^utf-?8$/i.test(String(enc));
}

// Ex. convert UTF-8 to utf8
function standardizeEncodingName(enc) {
  return (enc || '').toLowerCase().replace(/[_-]/g, '');
}

function getNativeEncoder(enc) {
  var encoder = null;
  enc = standardizeEncodingName(enc);
  if (enc != 'utf8') {
    // TODO: support more encodings if TextEncoder is available
    return null;
  }
  if (typeof TextEncoder != 'undefined') {
    encoder = new TextEncoder(enc);
  }
  return function(str) {
    // Convert Uint8Array from encoder to Buffer (fix for issue #216)
    return encoder ? B.from(encoder.encode(str).buffer) : utils.createBuffer(str, enc);
  };
}

function encodeString(str, enc) {
  // TODO: faster ascii encoding?
  var buf;
  if (encodingIsUtf8(enc)) {
    buf = toUtf8(str);
  } else {
    buf = iconv.encode(str, enc);
  }
  return buf;
}

function getNativeDecoder(enc) {
  var decoder = null;
  enc = standardizeEncodingName(enc);
  if (enc != 'utf8') {
    // TODO: support more encodings if TextDecoder is available
    return null;
  }
  if (typeof TextDecoder != 'undefined') {
    decoder = new TextDecoder(enc);
  }
  return function(buf) {
    return decoder ? decoder.decode(buf) : buf.toString(enc);
  };
}

// Not a general-purpose deep copy function
function copyRecord(o) {
  var o2 = {}, key, val;
  if (!o) return null;
  for (key in o) {
    if (o.hasOwnProperty(key)) {
      val = o[key];
      if (val == o) {
        // avoid infinite recursion if val is a circular reference, by copying all properties except key
        val = utils.extend({}, val);
        delete val[key];
      }
      o2[key] = val && val.constructor === Object ? copyRecord(val) : val;
    }
  }
  return o2;
}

function getValueType(val) {
  var type = null;
  if (utils.isString(val)) {
    type = 'string';
  } else if (utils.isNumber(val)) {
    type = 'number';
  } else if (utils.isBoolean(val)) {
    type = 'boolean';
  } else if (utils.isDate(val)) {
    type = 'date';
  } else if (utils.isObject(val)) {
    type = 'object';
  }
  return type;
}

// Fill out a data table with undefined values
// The undefined members will disappear when records are exported as JSON,
// but will show up when fields are listed using Object.keys()
function fixInconsistentFields(records) {
  var fields = findIncompleteFields(records);
  patchMissingFields(records, fields);
}

function findIncompleteFields(records) {
  var counts = {},
      i, j, keys;
  for (i=0; i<records.length; i++) {
    keys = Object.keys(records[i] || {});
    for (j=0; j<keys.length; j++) {
      counts[keys[j]] = (counts[keys[j]] | 0) + 1;
    }
  }
  return Object.keys(counts).filter(function(k) {return counts[k] < records.length;});
}

function patchMissingFields(records, fields) {
  var rec, i, j, f;
  for (i=0; i<records.length; i++) {
    rec = records[i] || (records[i] = {});
    for (j=0; j<fields.length; j++) {
      f = fields[j];
      if (f in rec === false) {
        rec[f] = undefined;
      }
    }
  }
}

function getColumnType(key, records) {
  var type = null,
      rec;
  for (var i=0, n=records.length; i<n; i++) {
    rec = records[i];
    type = rec ? getValueType(rec[key]) : null;
    if (type) break;
  }
  return type;
}

function applyFieldOrder(arr, option) {
  if (option == 'ascending') {
    arr.sort(function(a, b) {
      return a.toLowerCase() < b.toLowerCase() ? -1 : 1;
    });
  }
  return arr;
}

function getFirstNonEmptyRecord(records) {
  for (var i=0, n=records ? records.length : 0; i<n; i++) {
    if (records[i]) return records[i];
  }
  return null;
}

function findFieldNames(records, order) {
  var first = getFirstNonEmptyRecord(records);
  var names = first ? Object.keys(first) : [];
  return applyFieldOrder(names, order);
}

function DataTable(obj) {
  var records;
  if (utils.isArray(obj)) {
    records = obj;
  } else {
    records = [];
    // integer object: create empty records
    if (utils.isInteger(obj)) {
      for (var i=0; i<obj; i++) {
        records.push({});
      }
    } else if (obj) {
      error("Invalid DataTable constructor argument:", obj);
    }
  }

  this.getRecords = function() {
    return records;
  };

  // Same-name method in ShapefileTable doesn't require parsing the entire DBF file
  this.getReadOnlyRecordAt = function(i) {
    return copyRecord(records[i]); // deep-copies plain objects but not other constructed objects
  };
}

DataTable.prototype = {

  fieldExists: function(name) {
    return utils.contains(this.getFields(), name);
  },

  toString: function() {return JSON.stringify(this);},

  toJSON: function() {
    return this.getRecords();
  },

  addField: function(name, init) {
    var useFunction = utils.isFunction(init);
    if (!utils.isNumber(init) && !utils.isString(init) && !useFunction) {
      error("DataTable#addField() requires a string, number or function for initialization");
    }
    if (this.fieldExists(name)) error("DataTable#addField() tried to add a field that already exists:", name);
    // var dataFieldRxp = /^[a-zA-Z_][a-zA-Z_0-9]*$/;
    // if (!dataFieldRxp.test(name)) error("DataTable#addField() invalid field name:", name);

    this.getRecords().forEach(function(obj, i) {
      obj[name] = useFunction ? init(obj, i) : init;
    });
  },

  getRecordAt: function(i) {
    return this.getRecords()[i];
  },

  addIdField: function() {
    this.addField('FID', function(obj, i) {
      return i;
    });
  },

  deleteField: function(f) {
    this.getRecords().forEach(function(o) {
      delete o[f];
    });
  },

  getFields: function() {
    return findFieldNames(this.getRecords());
  },

  isEmpty: function() {
    return this.getFields().length === 0 || this.size() === 0;
  },

  update: function(f) {
    var records = this.getRecords();
    for (var i=0, n=records.length; i<n; i++) {
      records[i] = f(records[i], i);
    }
  },

  clone: function() {
    // TODO: this could be sped up using a record constructor function
    // (see getRecordConstructor() in DbfReader)
    var records2 = this.getRecords().map(copyRecord);
    return new DataTable(records2);
  },

  size: function() {
    return this.getRecords().length;
  }
};

function layerHasPaths(lyr) {
  return (lyr.geometry_type == 'polygon' || lyr.geometry_type == 'polyline') &&
    layerHasNonNullShapes(lyr);
}

function layerHasPoints(lyr) {
  return lyr.geometry_type == 'point' && layerHasNonNullShapes(lyr);
}

function layerHasNonNullShapes(lyr) {
  return utils.some(lyr.shapes || [], function(shp) {
    return !!shp;
  });
}

function getFeatureCount(lyr) {
  var count = 0;
  if (lyr.data) {
    count = lyr.data.size();
  } else if (lyr.shapes) {
    count = lyr.shapes.length;
  }
  return count;
}

function requireDataField(obj, field, msg) {
  var data = obj.fieldExists ? obj : obj.data; // accept layer or DataTable
  if (!field) stop('Missing a field parameter');
  if (!data || !data.fieldExists(field)) {
    stop(msg || 'Missing a field named:', field);
  }
}

function layerTypeMessage(lyr, defaultMsg, customMsg) {
  var msg;
  // check that custom msg is a string (could be an index if require function is called by forEach)
  if (customMsg && utils.isString(customMsg)) {
    msg = customMsg;
  } else {
    msg = defaultMsg + ', ';
    if (!lyr || !lyr.geometry_type) {
      msg += 'received a layer with no geometry';
    } else {
      msg += 'received a ' + lyr.geometry_type + ' layer';
    }
  }
  return msg;
}

function requirePolygonLayer(lyr, msg) {
  if (!lyr || lyr.geometry_type !== 'polygon')
    stop(layerTypeMessage(lyr, "Expected a polygon layer", msg));
}

// Divide a collection of features with mixed types into layers of a single type
// (Used for importing TopoJSON and GeoJSON features)
function divideFeaturesByType(shapes, properties, types) {
  var typeSet = utils.uniq(types);
  var layers = typeSet.map(function(geoType) {
    var p = [],
        s = [],
        dataNulls = 0,
        rec;

    for (var i=0, n=shapes.length; i<n; i++) {
      if (types[i] != geoType) continue;
      if (geoType) s.push(shapes[i]);
      rec = properties[i];
      p.push(rec);
      if (!rec) dataNulls++;
    }
    return {
      geometry_type: geoType,
      shapes: s,
      data: dataNulls < p.length ? new DataTable(p) : null
    };
  });
  return layers;
}

// moving this here from mapshaper-path-utils to avoid circular dependency
function getArcPresenceTest2(layers, arcs) {
  var counts = countArcsInLayers(layers, arcs);
  return function(arcId) {
    return counts[absArcId(arcId)] > 0;
  };
}

// Count arcs in a collection of layers
function countArcsInLayers(layers, arcs) {
  var counts = new Uint32Array(arcs.size());
  layers.filter(layerHasPaths).forEach(function(lyr) {
    countArcsInShapes(lyr.shapes, counts);
  });
  return counts;
}

// Returns a Bounds object
function getLayerBounds(lyr, arcs) {
  var bounds = null;
  if (lyr.geometry_type == 'point') {
    bounds = getPointBounds(lyr.shapes);
  } else if (lyr.geometry_type == 'polygon' || lyr.geometry_type == 'polyline') {
    bounds = getPathBounds(lyr.shapes, arcs);
  } else ;
  return bounds;
}

function initDataTable(lyr) {
  lyr.data = new DataTable(getFeatureCount(lyr));
}

// Constructor takes arrays of coords: xx, yy, zz (optional)
//
function ArcIter(xx, yy) {
  this._i = 0;
  this._n = 0;
  this._inc = 1;
  this._xx = xx;
  this._yy = yy;
  this.i = 0;
  this.x = 0;
  this.y = 0;
}

ArcIter.prototype.init = function(i, len, fw) {
  if (fw) {
    this._i = i;
    this._inc = 1;
  } else {
    this._i = i + len - 1;
    this._inc = -1;
  }
  this._n = len;
  return this;
};

ArcIter.prototype.hasNext = function() {
  var i = this._i;
  if (this._n > 0) {
    this._i = i + this._inc;
    this.x = this._xx[i];
    this.y = this._yy[i];
    this.i = i;
    this._n--;
    return true;
  }
  return false;
};

function FilteredArcIter(xx, yy, zz) {
  var _zlim = 0,
      _i = 0,
      _inc = 1,
      _stop = 0;

  this.init = function(i, len, fw, zlim) {
    _zlim = zlim || 0;
    if (fw) {
      _i = i;
      _inc = 1;
      _stop = i + len;
    } else {
      _i = i + len - 1;
      _inc = -1;
      _stop = i - 1;
    }
    return this;
  };

  this.hasNext = function() {
    // using local vars is significantly faster when skipping many points
    var zarr = zz,
        i = _i,
        j = i,
        zlim = _zlim,
        stop = _stop,
        inc = _inc;
    if (i == stop) return false;
    do {
      j += inc;
    } while (j != stop && zarr[j] < zlim);
    _i = j;
    this.x = xx[i];
    this.y = yy[i];
    this.i = i;
    return true;
  };
}

// Iterate along a path made up of one or more arcs.
//
function ShapeIter(arcs) {
  this._arcs = arcs;
  this._i = 0;
  this._n = 0;
  this.x = 0;
  this.y = 0;
  // this.i = -1;
}

ShapeIter.prototype.hasNext = function() {
  var arc = this._arc;
  if (this._i < this._n === false) {
    return false;
  }
  if (arc.hasNext()) {
    this.x = arc.x;
    this.y = arc.y;
    // this.i = arc.i;
    return true;
  }
  this.nextArc();
  return this.hasNext();
};

ShapeIter.prototype.init = function(ids) {
  this._ids = ids;
  this._n = ids.length;
  this.reset();
  return this;
};

ShapeIter.prototype.nextArc = function() {
  var i = this._i + 1;
  if (i < this._n) {
    this._arc = this._arcs.getArcIter(this._ids[i]);
    if (i > 0) this._arc.hasNext(); // skip first point
  }
  this._i = i;
};

ShapeIter.prototype.reset = function() {
  this._i = -1;
  this.nextArc();
};

// Return integer rank of n (1-indexed) or 0 if pct <= 0 or n+1 if pct >= 1
function retainedPctToRank(pct, n) {
  var rank;
  if (n === 0 || pct >= 1) {
    rank = 0;
  } else if (pct <= 0) {
    rank = n + 1;
  } else {
    rank = Math.floor((1 - pct) * (n + 2));
  }
  return rank;
}

// nth (optional): sample every nth threshold (use estimate for speed)
function getThresholdByPct(pct, arcs, nth) {
  var tmp = arcs.getRemovableThresholds(nth),
      rank = retainedPctToRank(pct, tmp.length);
  if (rank < 1) return 0;
  if (rank > tmp.length) return Infinity;
  return utils.findValueByRank(tmp, rank);
}

// An interface for managing a collection of paths.
// Constructor signatures:
//
// ArcCollection(arcs)
//    arcs is an array of polyline arcs; each arc is an array of points: [[x0, y0], [x1, y1], ... ]
//
// ArcCollection(nn, xx, yy)
//    nn is an array of arc lengths; xx, yy are arrays of concatenated coords;
function ArcCollection() {
  var _xx, _yy,  // coordinates data
      _ii, _nn,  // indexes, sizes
      _zz, _zlimit = 0, // simplification
      _bb, _allBounds, // bounding boxes
      _arcIter, _filteredArcIter; // path iterators

  if (arguments.length == 1) {
    initLegacyArcs(arguments[0]);  // want to phase this out
  } else if (arguments.length == 3) {
    initXYData.apply(this, arguments);
  } else {
    error("ArcCollection() Invalid arguments");
  }

  function initLegacyArcs(arcs) {
    var xx = [], yy = [];
    var nn = arcs.map(function(points) {
      var n = points ? points.length : 0;
      for (var i=0; i<n; i++) {
        xx.push(points[i][0]);
        yy.push(points[i][1]);
      }
      return n;
    });
    initXYData(nn, xx, yy);
  }

  function initXYData(nn, xx, yy) {
    var size = nn.length;
    if (nn instanceof Array) nn = new Uint32Array(nn);
    if (xx instanceof Array) xx = new Float64Array(xx);
    if (yy instanceof Array) yy = new Float64Array(yy);
    _xx = xx;
    _yy = yy;
    _nn = nn;
    _zz = null;
    _zlimit = 0;
    _filteredArcIter = null;

    // generate array of starting idxs of each arc
    _ii = new Uint32Array(size);
    for (var idx = 0, j=0; j<size; j++) {
      _ii[j] = idx;
      idx += nn[j];
    }

    if (idx != _xx.length || _xx.length != _yy.length) {
      error("ArcCollection#initXYData() Counting error");
    }

    initBounds();
    // Pre-allocate some path iterators for repeated use.
    _arcIter = new ArcIter(_xx, _yy);
    return this;
  }

  function initZData(zz) {
    if (!zz) {
      _zz = null;
      _zlimit = 0;
      _filteredArcIter = null;
    } else {
      if (zz.length != _xx.length) error("ArcCollection#initZData() mismatched arrays");
      if (zz instanceof Array) zz = new Float64Array(zz);
      _zz = zz;
      _filteredArcIter = new FilteredArcIter(_xx, _yy, _zz);
    }
  }

  function initBounds() {
    var data = calcArcBounds2(_xx, _yy, _nn);
    _bb = data.bb;
    _allBounds = data.bounds;
  }

  function calcArcBounds2(xx, yy, nn) {
    var numArcs = nn.length,
        bb = new Float64Array(numArcs * 4),
        bounds = new Bounds(),
        arcOffs = 0,
        arcLen,
        j, b;
    for (var i=0; i<numArcs; i++) {
      arcLen = nn[i];
      if (arcLen > 0) {
        j = i * 4;
        b = calcArcBounds(xx, yy, arcOffs, arcLen);
        bb[j++] = b[0];
        bb[j++] = b[1];
        bb[j++] = b[2];
        bb[j] = b[3];
        arcOffs += arcLen;
        bounds.mergeBounds(b);
      }
    }
    return {
      bb: bb,
      bounds: bounds
    };
  }

  this.updateVertexData = function(nn, xx, yy, zz) {
    initXYData(nn, xx, yy);
    initZData(zz || null);
  };

  // Give access to raw data arrays...
  this.getVertexData = function() {
    return {
      xx: _xx,
      yy: _yy,
      zz: _zz,
      bb: _bb,
      nn: _nn,
      ii: _ii
    };
  };

  this.getCopy = function() {
    var copy = new ArcCollection(new Int32Array(_nn), new Float64Array(_xx),
        new Float64Array(_yy));
    if (_zz) {
      copy.setThresholds(new Float64Array(_zz));
      copy.setRetainedInterval(_zlimit);
    }
    return copy;
  };

  function getFilteredPointCount() {
    var zz = _zz, z = _zlimit;
    if (!zz || !z) return this.getPointCount();
    var count = 0;
    for (var i=0, n = zz.length; i<n; i++) {
      if (zz[i] >= z) count++;
    }
    return count;
  }

  function getFilteredVertexData() {
    var len2 = getFilteredPointCount();
    var arcCount = _nn.length;
    var xx2 = new Float64Array(len2),
        yy2 = new Float64Array(len2),
        zz2 = new Float64Array(len2),
        nn2 = new Int32Array(arcCount),
        i=0, i2 = 0,
        n, n2;

    for (var arcId=0; arcId < arcCount; arcId++) {
      n2 = 0;
      n = _nn[arcId];
      for (var end = i+n; i < end; i++) {
        if (_zz[i] >= _zlimit) {
          xx2[i2] = _xx[i];
          yy2[i2] = _yy[i];
          zz2[i2] = _zz[i];
          i2++;
          n2++;
        }
      }
      if (n2 == 1) {
        error("Collapsed arc");
        // This should not happen (endpoints should be z == Infinity)
        // Could handle like this, instead of throwing an error:
        // n2 = 0;
        // xx2.pop();
        // yy2.pop();
        // zz2.pop();
      }
      nn2[arcId] = n2;
    }
    return {
      xx: xx2,
      yy: yy2,
      zz: zz2,
      nn: nn2
    };
  }

  this.getFilteredCopy = function() {
    if (!_zz || _zlimit === 0) return this.getCopy();
    var data = getFilteredVertexData();
    var copy = new ArcCollection(data.nn, data.xx, data.yy);
    copy.setThresholds(data.zz);
    return copy;
  };

  // Return arcs as arrays of [x, y] points (intended for testing).
  this.toArray = function() {
    var arr = [];
    this.forEach(function(iter) {
      var arc = [];
      while (iter.hasNext()) {
        arc.push([iter.x, iter.y]);
      }
      arr.push(arc);
    });
    return arr;
  };

  this.toJSON = function() {
    return this.toArray();
  };

  // @cb function(i, j, xx, yy)
  this.forEachArcSegment = function(arcId, cb) {
    var fw = arcId >= 0,
        absId = fw ? arcId : ~arcId,
        zlim = this.getRetainedInterval(),
        n = _nn[absId],
        step = fw ? 1 : -1,
        v1 = fw ? _ii[absId] : _ii[absId] + n - 1,
        v2 = v1,
        xx = _xx, yy = _yy, zz = _zz,
        count = 0;

    for (var j = 1; j < n; j++) {
      v2 += step;
      if (zlim === 0 || zz[v2] >= zlim) {
        cb(v1, v2, xx, yy);
        v1 = v2;
        count++;
      }
    }
    return count;
  };

  // @cb function(i, j, xx, yy)
  this.forEachSegment = function(cb) {
    var count = 0;
    for (var i=0, n=this.size(); i<n; i++) {
      count += this.forEachArcSegment(i, cb);
    }
    return count;
  };

  this.transformPoints = function(f) {
    var xx = _xx, yy = _yy, arcId = -1, n = 0, p;
    for (var i=0, len=xx.length; i<len; i++, n--) {
      while (n === 0) {
        n = _nn[++arcId];
      }
      p = f(xx[i], yy[i], arcId);
      if (p) {
        xx[i] = p[0];
        yy[i] = p[1];
      }
    }
    initBounds();
  };

  // Return an ArcIter object for each path in the dataset
  //
  this.forEach = function(cb) {
    for (var i=0, n=this.size(); i<n; i++) {
      cb(this.getArcIter(i), i);
    }
  };

  // Iterate over arcs with access to low-level data
  //
  this.forEach2 = function(cb) {
    for (var arcId=0, n=this.size(); arcId<n; arcId++) {
      cb(_ii[arcId], _nn[arcId], _xx, _yy, _zz, arcId);
    }
  };

  this.forEach3 = function(cb) {
    var start, end, xx, yy, zz;
    for (var arcId=0, n=this.size(); arcId<n; arcId++) {
      start = _ii[arcId];
      end = start + _nn[arcId];
      xx = _xx.subarray(start, end);
      yy = _yy.subarray(start, end);
      if (_zz) zz = _zz.subarray(start, end);
      cb(xx, yy, zz, arcId);
    }
  };

  // Remove arcs that don't pass a filter test and re-index arcs
  // Return array mapping original arc ids to re-indexed ids. If arr[n] == -1
  // then arc n was removed. arr[n] == m indicates that the arc at n was
  // moved to index m.
  // Return null if no arcs were re-indexed (and no arcs were removed)
  //
  this.filter = function(cb) {
    var test = function(i) {
      return cb(this.getArcIter(i), i);
    }.bind(this);
    return this.deleteArcs(test);
  };

  this.deleteArcs = function(test) {
    var n = this.size(),
        map = new Int32Array(n),
        goodArcs = 0,
        goodPoints = 0;
    for (var i=0; i<n; i++) {
      if (test(i)) {
        map[i] = goodArcs++;
        goodPoints += _nn[i];
      } else {
        map[i] = -1;
      }
    }
    if (goodArcs < n) {
      condenseArcs(map);
    }
    return map;
  };

  function condenseArcs(map) {
    var goodPoints = 0,
        goodArcs = 0,
        copyElements = utils.copyElements,
        k, arcLen;
    for (var i=0, n=map.length; i<n; i++) {
      k = map[i];
      arcLen = _nn[i];
      if (k > -1) {
        copyElements(_xx, _ii[i], _xx, goodPoints, arcLen);
        copyElements(_yy, _ii[i], _yy, goodPoints, arcLen);
        if (_zz) copyElements(_zz, _ii[i], _zz, goodPoints, arcLen);
        _nn[k] = arcLen;
        goodPoints += arcLen;
        goodArcs++;
      }
    }

    initXYData(_nn.subarray(0, goodArcs), _xx.subarray(0, goodPoints),
        _yy.subarray(0, goodPoints));
    if (_zz) initZData(_zz.subarray(0, goodPoints));
  }

  this.dedupCoords = function() {
    var arcId = 0, i = 0, i2 = 0,
        arcCount = this.size(),
        zz = _zz,
        arcLen, arcLen2;
    while (arcId < arcCount) {
      arcLen = _nn[arcId];
      arcLen2 = dedupArcCoords(i, i2, arcLen, _xx, _yy, zz);
      _nn[arcId] = arcLen2;
      i += arcLen;
      i2 += arcLen2;
      arcId++;
    }
    if (i > i2) {
      initXYData(_nn, _xx.subarray(0, i2), _yy.subarray(0, i2));
      if (zz) initZData(zz.subarray(0, i2));
    }
    return i - i2;
  };

  this.getVertex = function(arcId, nth) {
    var i = this.indexOfVertex(arcId, nth);
    return {
      x: _xx[i],
      y: _yy[i]
    };
  };

  this.getVertex2 = function(i) {
    return [_xx[i], _yy[i]];
  };

  // @nth: index of vertex. ~(idx) starts from the opposite endpoint
  this.indexOfVertex = function(arcId, nth) {
    var absId = arcId < 0 ? ~arcId : arcId,
        len = _nn[absId];
    if (nth < 0) nth = len + nth;
    if (absId != arcId) nth = len - nth - 1;
    if (nth < 0 || nth >= len) error("[ArcCollection] out-of-range vertex id");
    return _ii[absId] + nth;
  };

  // Tests if arc endpoints have same x, y coords
  // (arc may still have collapsed);
  this.arcIsClosed = function(arcId) {
    var i = this.indexOfVertex(arcId, 0),
        j = this.indexOfVertex(arcId, -1);
    return i != j && _xx[i] == _xx[j] && _yy[i] == _yy[j];
  };

  // Tests if first and last segments mirror each other
  // A 3-vertex arc with same endpoints tests true
  this.arcIsLollipop = function(arcId) {
    var len = this.getArcLength(arcId),
        i, j;
    if (len <= 2 || !this.arcIsClosed(arcId)) return false;
    i = this.indexOfVertex(arcId, 1);
    j = this.indexOfVertex(arcId, -2);
    return _xx[i] == _xx[j] && _yy[i] == _yy[j];
  };

  this.arcIsDegenerate = function(arcId) {
    var iter = this.getArcIter(arcId);
    var i = 0,
        x, y;
    while (iter.hasNext()) {
      if (i > 0) {
        if (x != iter.x || y != iter.y) return false;
      }
      x = iter.x;
      y = iter.y;
      i++;
    }
    return true;
  };

  this.getArcLength = function(arcId) {
    return _nn[absArcId(arcId)];
  };

  this.getArcIter = function(arcId) {
    var fw = arcId >= 0,
        i = fw ? arcId : ~arcId,
        iter = _zz && _zlimit ? _filteredArcIter : _arcIter;
    if (i >= _nn.length) {
      error("#getArcId() out-of-range arc id:", arcId);
    }
    return iter.init(_ii[i], _nn[i], fw, _zlimit);
  };

  this.getShapeIter = function(ids) {
    return new ShapeIter(this).init(ids);
  };

  // Add simplification data to the dataset
  // @thresholds is either a single typed array or an array of arrays of removal thresholds for each arc;
  //
  this.setThresholds = function(thresholds) {
    var n = this.getPointCount(),
        zz = null;
    if (!thresholds) ; else if (thresholds.length == n) {
      zz = thresholds;
    } else if (thresholds.length == this.size()) {
      zz = flattenThresholds(thresholds, n);
    } else {
      error("Invalid threshold data");
    }
    initZData(zz);
    return this;
  };

  function flattenThresholds(arr, n) {
    var zz = new Float64Array(n),
        i = 0;
    arr.forEach(function(arr) {
      for (var j=0, n=arr.length; j<n; i++, j++) {
        zz[i] = arr[j];
      }
    });
    if (i != n) error("Mismatched thresholds");
    return zz;
  }

  // bake in current simplification level, if any
  this.flatten = function() {
    if (_zlimit > 0) {
      var data = getFilteredVertexData();
      this.updateVertexData(data.nn, data.xx, data.yy);
      _zlimit = 0;
    } else {
      _zz = null;
    }
  };

  this.isFlat = function() { return !_zz; };

  this.getRetainedInterval = function() {
    return _zlimit;
  };

  this.setRetainedInterval = function(z) {
    _zlimit = z;
    return this;
  };

  this.getRetainedPct = function() {
    return this.getPctByThreshold(_zlimit);
  };

  this.setRetainedPct = function(pct) {
    if (pct >= 1) {
      _zlimit = 0;
    } else {
      _zlimit = this.getThresholdByPct(pct);
      _zlimit = clampIntervalByPct(_zlimit, pct);
    }
    return this;
  };

  // Return array of z-values that can be removed for simplification
  //
  this.getRemovableThresholds = function(nth) {
    if (!_zz) error("[arcs] Missing simplification data.");
    var skip = nth | 1,
        arr = new Float64Array(Math.ceil(_zz.length / skip)),
        z;
    for (var i=0, j=0, n=this.getPointCount(); i<n; i+=skip) {
      z = _zz[i];
      if (z != Infinity) {
        arr[j++] = z;
      }
    }
    return arr.subarray(0, j);
  };

  this.getArcThresholds = function(arcId) {
    if (!(arcId >= 0 && arcId < this.size())) {
      error("[arcs] Invalid arc id:", arcId);
    }
    var start = _ii[arcId],
        end = start + _nn[arcId];
    return _zz.subarray(start, end);
  };

  // nth (optional): sample every nth threshold (use estimate for speed)
  this.getPctByThreshold = function(val, nth) {
    var arr, rank, pct;
    if (val > 0) {
      arr = this.getRemovableThresholds(nth);
      rank = utils.findRankByValue(arr, val);
      pct = arr.length > 0 ? 1 - (rank - 1) / arr.length : 1;
    } else {
      pct = 1;
    }
    return pct;
  };

  // nth (optional): sample every nth threshold (use estimate for speed)
  this.getThresholdByPct = function(pct, nth) {
    return getThresholdByPct(pct, this, nth);
  };

  this.arcIntersectsBBox = function(i, b1) {
    var b2 = _bb,
        j = i * 4;
    return b2[j] <= b1[2] && b2[j+2] >= b1[0] && b2[j+3] >= b1[1] && b2[j+1] <= b1[3];
  };

  this.arcIsContained = function(i, b1) {
    var b2 = _bb,
        j = i * 4;
    return b2[j] >= b1[0] && b2[j+2] <= b1[2] && b2[j+1] >= b1[1] && b2[j+3] <= b1[3];
  };

  this.arcIsSmaller = function(i, units) {
    var bb = _bb,
        j = i * 4;
    return bb[j+2] - bb[j] < units && bb[j+3] - bb[j+1] < units;
  };

  // TODO: allow datasets in lat-lng coord range to be flagged as planar
  this.isPlanar = function() {
    return !probablyDecimalDegreeBounds(this.getBounds());
  };

  this.size = function() {
    return _ii && _ii.length || 0;
  };

  this.getPointCount = function() {
    return _xx && _xx.length || 0;
  };

  this.getFilteredPointCount = getFilteredPointCount;

  this.getBounds = function() {
    return _allBounds.clone();
  };

  this.getSimpleShapeBounds = function(arcIds, bounds) {
    bounds = bounds || new Bounds();
    for (var i=0, n=arcIds.length; i<n; i++) {
      this.mergeArcBounds(arcIds[i], bounds);
    }
    return bounds;
  };

  this.getSimpleShapeBounds2 = function(arcIds, arr) {
    var bbox = arr || [],
        bb = _bb,
        id = absArcId(arcIds[0]) * 4;
    bbox[0] = bb[id];
    bbox[1] = bb[++id];
    bbox[2] = bb[++id];
    bbox[3] = bb[++id];
    for (var i=1, n=arcIds.length; i<n; i++) {
      id = absArcId(arcIds[i]) * 4;
      if (bb[id] < bbox[0]) bbox[0] = bb[id];
      if (bb[++id] < bbox[1]) bbox[1] = bb[id];
      if (bb[++id] > bbox[2]) bbox[2] = bb[id];
      if (bb[++id] > bbox[3]) bbox[3] = bb[id];
    }
    return bbox;
  };

  // TODO: move this and similar methods out of ArcCollection
  this.getMultiShapeBounds = function(shapeIds, bounds) {
    bounds = bounds || new Bounds();
    if (shapeIds) { // handle null shapes
      for (var i=0, n=shapeIds.length; i<n; i++) {
        this.getSimpleShapeBounds(shapeIds[i], bounds);
      }
    }
    return bounds;
  };

  this.mergeArcBounds = function(arcId, bounds) {
    if (arcId < 0) arcId = ~arcId;
    var offs = arcId * 4;
    bounds.mergeBounds(_bb[offs], _bb[offs+1], _bb[offs+2], _bb[offs+3]);
  };
}

// Remove duplicate coords and NaNs
function dedupArcCoords(src, dest, arcLen, xx, yy, zz) {
  var n = 0, n2 = 0; // counters
  var x, y, i, j, keep;
  while (n < arcLen) {
    j = src + n;
    x = xx[j];
    y = yy[j];
    keep = x == x && y == y && (n2 === 0 || x != xx[j-1] || y != yy[j-1]);
    if (keep) {
      i = dest + n2;
      xx[i] = x;
      yy[i] = y;
      n2++;
    }
    if (zz && n2 > 0 && (keep || zz[j] > zz[i])) {
      zz[i] = zz[j];
    }
    n++;
  }
  return n2 > 1 ? n2 : 0;
}

// Get function to Hash an x, y point to a non-negative integer
function getXYHash(size) {
  var buf = new ArrayBuffer(16),
      floats = new Float64Array(buf),
      uints = new Uint32Array(buf),
      lim = size | 0;
  if (lim > 0 === false) {
    throw new Error("Invalid size param: " + size);
  }

  return function(x, y) {
    var u = uints, h;
    floats[0] = x;
    floats[1] = y;
    h = u[0] ^ u[1];
    h = h << 5 ^ h >> 7 ^ u[2] ^ u[3];
    return (h & 0x7fffffff) % lim;
  };
}

// Used for building topology
//
function ArcIndex(pointCount) {
  var hashTableSize = Math.floor(pointCount * 0.25 + 1),
      hash = getXYHash(hashTableSize),
      hashTable = new Int32Array(hashTableSize),
      chainIds = [],
      arcs = [],
      arcPoints = 0;

  utils.initializeArray(hashTable, -1);

  this.addArc = function(xx, yy) {
    var end = xx.length - 1,
        key = hash(xx[end], yy[end]),
        chainId = hashTable[key],
        arcId = arcs.length;
    hashTable[key] = arcId;
    arcs.push([xx, yy]);
    arcPoints += xx.length;
    chainIds.push(chainId);
    return arcId;
  };

  // Look for a previously generated arc with the same sequence of coords, but in the
  // opposite direction. (This program uses the convention of CW for space-enclosing rings, CCW for holes,
  // so coincident boundaries should contain the same points in reverse sequence).
  //
  this.findDuplicateArc = function(xx, yy, start, end, getNext, getPrev) {
    // First, look for a reverse match
    var arcId = findArcNeighbor(xx, yy, start, end, getNext);
    if (arcId === null) {
      // Look for forward match
      // (Abnormal topology, but we're accepting it because in-the-wild
      // Shapefiles sometimes have duplicate paths)
      arcId = findArcNeighbor(xx, yy, end, start, getPrev);
    } else {
      arcId = ~arcId;
    }
    return arcId;
  };

  function findArcNeighbor(xx, yy, start, end, getNext) {
    var next = getNext(start),
        key = hash(xx[start], yy[start]),
        arcId = hashTable[key],
        arcX, arcY, len;

    while (arcId != -1) {
      // check endpoints and one segment...
      // it would be more rigorous but slower to identify a match
      // by comparing all segments in the coordinate sequence
      arcX = arcs[arcId][0];
      arcY = arcs[arcId][1];
      len = arcX.length;
      if (arcX[0] === xx[end] && arcX[len-1] === xx[start] && arcX[len-2] === xx[next] &&
          arcY[0] === yy[end] && arcY[len-1] === yy[start] && arcY[len-2] === yy[next]) {
        return arcId;
      }
      arcId = chainIds[arcId];
    }
    return null;
  }

  this.getVertexData = function() {
    var xx = new Float64Array(arcPoints),
        yy = new Float64Array(arcPoints),
        nn = new Uint32Array(arcs.length),
        copied = 0,
        arc, len;
    for (var i=0, n=arcs.length; i<n; i++) {
      arc = arcs[i];
      len = arc[0].length;
      utils.copyElements(arc[0], 0, xx, copied, len);
      utils.copyElements(arc[1], 0, yy, copied, len);
      nn[i] = len;
      copied += len;
    }
    return {
      xx: xx,
      yy: yy,
      nn: nn
    };
  };
}

function initPointChains(xx, yy) {
  var chainIds = initHashChains(xx, yy),
      j, next, prevMatchId, prevUnmatchId;

  // disentangle, reverse and close the chains created by initHashChains()
  for (var i = xx.length-1; i>=0; i--) {
    next = chainIds[i];
    if (next >= i) continue;
    prevMatchId = i;
    prevUnmatchId = -1;
    do {
      j = next;
      next = chainIds[j];
      if (yy[j] == yy[i] && xx[j] == xx[i]) {
        chainIds[j] = prevMatchId;
        prevMatchId = j;
      } else {
        if (prevUnmatchId > -1) {
          chainIds[prevUnmatchId] = j;
        }
        prevUnmatchId = j;
      }
    } while (next < j);
    if (prevUnmatchId > -1) {
      // Make sure last unmatched entry is terminated
      chainIds[prevUnmatchId] = prevUnmatchId;
    }
    chainIds[i] = prevMatchId; // close the chain
  }
  return chainIds;
}

function initHashChains(xx, yy) {
  // Performance doesn't improve much above ~1.3 * point count
  var n = xx.length,
      m = Math.floor(n * 1.3) || 1,
      hash = getXYHash(m),
      hashTable = new Int32Array(m),
      chainIds = new Int32Array(n), // Array to be filled with chain data
      key, j, i, x, y;

  for (i=0; i<n; i++) {
    x = xx[i];
    y = yy[i];
    if (x != x || y != y) {
      j = -1; // NaN coord: no hash entry, one-link chain
    } else {
      key = hash(x, y);
      j = hashTable[key] - 1; // coord ids are 1-based in hash table; 0 used as null value.
      hashTable[key] = i + 1;
    }
    chainIds[i] = j >= 0 ? j : i; // first item in a chain points to self
  }
  return chainIds;
}

// Converts all polygon and polyline paths in a dataset to a topological format
// (in-place)
function buildTopology(dataset) {
  if (!dataset.arcs) return;
  var raw = dataset.arcs.getVertexData(),
      cooked = buildPathTopology(raw.nn, raw.xx, raw.yy);
  dataset.arcs.updateVertexData(cooked.nn, cooked.xx, cooked.yy);
  dataset.layers.forEach(function(lyr) {
    if (lyr.geometry_type == 'polyline' || lyr.geometry_type == 'polygon') {
      lyr.shapes = replaceArcIds(lyr.shapes, cooked.paths);
    }
  });
}

// buildPathTopology() converts non-topological paths into
// a topological format
//
// Arguments:
//    xx: [Array|Float64Array],   // x coords of each point in the dataset
//    yy: [Array|Float64Array],   // y coords ...
//    nn: [Array]  // length of each path
//
// (x- and y-coords of all paths are concatenated into two arrays)
//
// Returns:
// {
//    xx, yy (array)   // coordinate data
//    nn: (array)      // points in each arc
//    paths: (array)   // Paths are arrays of one or more arc id.
// }
//
// Negative arc ids in the paths array indicate a reversal of arc -(id + 1)
//
function buildPathTopology(nn, xx, yy) {
  var pointCount = xx.length,
      chainIds = initPointChains(xx, yy),
      pathIds = initPathIds(pointCount, nn),
      index = new ArcIndex(pointCount),
      slice = usingTypedArrays() ? xx.subarray : Array.prototype.slice,
      paths, retn;
  paths = convertPaths(nn);
  retn = index.getVertexData();
  retn.paths = paths;
  return retn;

  function usingTypedArrays() {
    return !!(xx.subarray && yy.subarray);
  }

  function convertPaths(nn) {
    var paths = [],
        pointId = 0,
        pathLen;
    for (var i=0, len=nn.length; i<len; i++) {
      pathLen = nn[i];
      paths.push(pathLen < 2 ? null : convertPath(pointId, pointId + pathLen - 1));
      pointId += pathLen;
    }
    return paths;
  }

  function nextPoint(id) {
    var partId = pathIds[id],
        nextId = id + 1;
    if (nextId < pointCount && pathIds[nextId] === partId) {
      return id + 1;
    }
    var len = nn[partId];
    return sameXY(id, id - len + 1) ? id - len + 2 : -1;
  }

  function prevPoint(id) {
    var partId = pathIds[id],
        prevId = id - 1;
    if (prevId >= 0 && pathIds[prevId] === partId) {
      return id - 1;
    }
    var len = nn[partId];
    return sameXY(id, id + len - 1) ? id + len - 2 : -1;
  }

  function sameXY(a, b) {
    return xx[a] == xx[b] && yy[a] == yy[b];
  }

  // Convert a non-topological path to one or more topological arcs
  // @start, @end are ids of first and last points in the path
  // TODO: don't allow id ~id pairs
  //
  function convertPath(start, end) {
    var arcIds = [],
        firstNodeId = -1,
        arcStartId;

    // Visit each point in the path, up to but not including the last point
    for (var i = start; i < end; i++) {
      if (pointIsArcEndpoint(i)) {
        if (firstNodeId > -1) {
          arcIds.push(addEdge(arcStartId, i));
        } else {
          firstNodeId = i;
        }
        arcStartId = i;
      }
    }

    // Identify the final arc in the path
    if (firstNodeId == -1) {
      // Not in an arc, i.e. no nodes have been found...
      // Assuming that path is either an island or is congruent with one or more rings
      arcIds.push(addRing(start, end));
    }
    else if (firstNodeId == start) {
      // path endpoint is a node;
      if (!pointIsArcEndpoint(end)) {
        error("Topology error"); // TODO: better error handling
      }
      arcIds.push(addEdge(arcStartId, i));
    } else {
      // final arc wraps around
      arcIds.push(addSplitEdge(arcStartId, end, start + 1, firstNodeId));
    }
    return arcIds;
  }

  // Test if a point @id is an endpoint of a topological path
  function pointIsArcEndpoint(id) {
    var id2 = chainIds[id],
        prev = prevPoint(id),
        next = nextPoint(id),
        prev2, next2;
    if (prev == -1 || next == -1) {
      // @id is an endpoint if it is the start or end of an open path
      return true;
    }
    while (id != id2) {
      prev2 = prevPoint(id2);
      next2 = nextPoint(id2);
      if (prev2 == -1 || next2 == -1 || brokenEdge(prev, next, prev2, next2)) {
        // there is a discontinuity at @id -- point is arc endpoint
        return true;
      }
      id2 = chainIds[id2];
    }
    return false;
  }

  // a and b are two vertices with the same x, y coordinates
  // test if the segments on either side of them are also identical
  function brokenEdge(aprev, anext, bprev, bnext) {
    var apx = xx[aprev],
        anx = xx[anext],
        bpx = xx[bprev],
        bnx = xx[bnext],
        apy = yy[aprev],
        any = yy[anext],
        bpy = yy[bprev],
        bny = yy[bnext];
    if (apx == bnx && anx == bpx && apy == bny && any == bpy ||
        apx == bpx && anx == bnx && apy == bpy && any == bny) {
      return false;
    }
    return true;
  }

  function mergeArcParts(src, startId, endId, startId2, endId2) {
    var len = endId - startId + endId2 - startId2 + 2,
        ArrayClass = usingTypedArrays() ? Float64Array : Array,
        dest = new ArrayClass(len),
        j = 0, i;
    for (i=startId; i <= endId; i++) {
      dest[j++] = src[i];
    }
    for (i=startId2; i <= endId2; i++) {
      dest[j++] = src[i];
    }
    return dest;
  }

  function addSplitEdge(start1, end1, start2, end2) {
    var arcId = index.findDuplicateArc(xx, yy, start1, end2, nextPoint, prevPoint);
    if (arcId === null) {
      arcId = index.addArc(mergeArcParts(xx, start1, end1, start2, end2),
          mergeArcParts(yy, start1, end1, start2, end2));
    }
    return arcId;
  }

  function addEdge(start, end) {
    // search for a matching edge that has already been generated
    var arcId = index.findDuplicateArc(xx, yy, start, end, nextPoint, prevPoint);
    if (arcId === null) {
      arcId = index.addArc(slice.call(xx, start, end + 1),
          slice.call(yy, start, end + 1));
    }
    return arcId;
  }

  function addRing(startId, endId) {
    var chainId = chainIds[startId],
        pathId = pathIds[startId],
        arcId;

    while (chainId != startId) {
      if (pathIds[chainId] < pathId) {
        break;
      }
      chainId = chainIds[chainId];
    }

    if (chainId == startId) {
      return addEdge(startId, endId);
    }

    for (var i=startId; i<endId; i++) {
      arcId = index.findDuplicateArc(xx, yy, i, i, nextPoint, prevPoint);
      if (arcId !== null) return arcId;
    }
    error("Unmatched ring; id:", pathId, "len:", nn[pathId]);
  }
}


// Create a lookup table for path ids; path ids are indexed by point id
//
function initPathIds(size, pathSizes) {
  var pathIds = new Int32Array(size),
      j = 0;
  for (var pathId=0, pathCount=pathSizes.length; pathId < pathCount; pathId++) {
    for (var i=0, n=pathSizes[pathId]; i<n; i++, j++) {
      pathIds[j] = pathId;
    }
  }
  return pathIds;
}

function replaceArcIds(src, replacements) {
  return src.map(function(shape) {
    return replaceArcsInShape(shape, replacements);
  });

  function replaceArcsInShape(shape, replacements) {
    if (!shape) return null;
    return shape.map(function(path) {
      return replaceArcsInPath(path, replacements);
    });
  }

  function replaceArcsInPath(path, replacements) {
    return path.reduce(function(memo, id) {
      var abs = absArcId(id);
      var topoPath = replacements[abs];
      if (topoPath) {
        if (id < 0) {
          topoPath = topoPath.concat(); // TODO: need to copy?
          reversePath(topoPath);
        }
        for (var i=0, n=topoPath.length; i<n; i++) {
          memo.push(topoPath[i]);
        }
      }
      return memo;
    }, []);
  }
}

// @arcs ArcCollection
// @filter Optional filter function, arcIds that return false are excluded
//
function NodeCollection(arcs, filter) {
  if (Array.isArray(arcs)) {
    arcs = new ArcCollection(arcs);
  }
  var arcData = arcs.getVertexData(),
      nn = arcData.nn,
      xx = arcData.xx,
      yy = arcData.yy,
      nodeData;

  // Accessor function for arcs
  Object.defineProperty(this, 'arcs', {value: arcs});

  this.toArray = function() {
    var chains = getNodeChains(),
        flags = new Uint8Array(chains.length),
        arr = [];
    utils.forEach(chains, function(nextIdx, thisIdx) {
      var node, p;
      if (flags[thisIdx] == 1) return;
      p = getEndpoint(thisIdx);
      if (!p) return; // endpoints of an excluded arc
      node = {coordinates: p, arcs: []};
      arr.push(node);
      while (flags[thisIdx] != 1) {
        node.arcs.push(chainToArcId(thisIdx));
        flags[thisIdx] = 1;
        thisIdx = chains[thisIdx];
      }
    });
    return arr;
  };

  this.size = function() {
    return this.toArray().length;
  };

  this.findDanglingEndpoints = function() {
    var chains = getNodeChains(),
        arr = [], p;
    for (var i=0, n=chains.length; i<n; i++) {
      if (chains[i] != i) continue; // endpoint attaches to a node
      p = getEndpoint(i);
      if (!p) continue; // endpoint belongs to an excluded arc
      arr.push({
        point: p,
        arc: chainToArcId(i)
      });
    }
    return arr;
  };

  this.detachAcyclicArcs = function() {
    var chains = getNodeChains(),
        count = 0,
        fwd, rev;
    for (var i=0, n=chains.length; i<n; i+= 2) {
      fwd = i == chains[i];
      rev = i + 1 == chains[i + 1];
      // detach arcs that are disconnected at one end or the other
      if ((fwd || rev) && !linkIsDetached(i)) {
        this.detachArc(chainToArcId(i));
        count++;
      }
    }
    if (count > 0) {
      // removing one acyclic arc could expose another -- need another pass
      count += this.detachAcyclicArcs();
    }
    return count;
  };

  this.detachArc = function(arcId) {
    unlinkDirectedArc(arcId);
    unlinkDirectedArc(~arcId);
  };

  this.forEachConnectedArc = function(arcId, cb) {
    var nextId = nextConnectedArc(arcId),
        i = 0;
    while (nextId != arcId) {
      cb(nextId, i++);
      nextId = nextConnectedArc(nextId);
    }
  };

  // Receives an arc id for an arc that enters a node.
  // Returns an array of ids of all other arcs that are connected to the same node.
  //    Returned ids lead into the node (as opposed to outwards from it)
  // An optional filter function receives the directed id (positive or negative)
  //    of each connected arc and excludes arcs for which the filter returns false.
  //    The filter is also applied to the initial arc; if false, no arcs are returned.
  //
  this.getConnectedArcs = function(arcId, filter) {
    var ids = [];
    var filtered = !!filter;
    var nextId = nextConnectedArc(arcId);
    if (filtered && !filter(arcId)) ;
    while (nextId != arcId) {
      if (!filtered || filter(nextId)) {
        ids.push(nextId);
      }
      nextId = nextConnectedArc(nextId);
    }
    return ids;
  };

  // Returns the id of the first identical arc or @arcId if none found
  // TODO: find a better function name
  this.findDuplicateArc = function(arcId) {
    var nextId = nextConnectedArc(arcId),
        match = arcId;
    while (nextId != arcId) {
      if (testArcMatch(arcId, nextId)) {
        if (absArcId(nextId) < absArcId(match)) match = nextId;
      }
      nextId = nextConnectedArc(nextId);
    }
    return match;
  };

  // returns null if link has been removed from node collection
  function getEndpoint(chainId) {
    return linkIsDetached(chainId) ? null : [nodeData.xx[chainId], nodeData.yy[chainId]];
  }

  function linkIsDetached(chainId) {
    return isNaN(nodeData.xx[chainId]);
  }

  function unlinkDirectedArc(arcId) {
    var chainId = arcToChainId(arcId),
        chains = getNodeChains(),
        nextId = chains[chainId],
        prevId = prevChainId(chainId);
    nodeData.xx[chainId] = NaN;
    nodeData.yy[chainId] = NaN;
    chains[chainId] = chainId;
    chains[prevId] = nextId;
  }

  function chainToArcId(chainId) {
    var absId = chainId >> 1;
    return chainId & 1 == 1 ? absId : ~absId;
  }

  function arcToChainId(arcId) {
    var fw = arcId >= 0;
    return fw ? arcId * 2 + 1 : (~arcId) * 2; // if fw, use end, if rev, use start
  }

  function getNodeChains() {
    if (!nodeData) {
      nodeData = findNodeTopology(arcs, filter);
      if (nn.length * 2 != nodeData.chains.length) error("[NodeCollection] count error");
    }
    return nodeData.chains;
  }

  function testArcMatch(a, b) {
    var absA = a >= 0 ? a : ~a,
        absB = b >= 0 ? b : ~b,
        lenA = nn[absA];
    if (lenA < 2) {
      // Don't throw error on collapsed arcs -- assume they will be handled
      //   appropriately downstream.
      // error("[testArcMatch() defective arc; len:", lenA);
      return false;
    }
    if (lenA != nn[absB]) return false;
    if (testVertexMatch(a, b, -1) &&
        testVertexMatch(a, b, 1) &&
        testVertexMatch(a, b, -2)) {
      return true;
    }
    return false;
  }

  function testVertexMatch(a, b, i) {
    var ai = arcs.indexOfVertex(a, i),
        bi = arcs.indexOfVertex(b, i);
    return xx[ai] == xx[bi] && yy[ai] == yy[bi];
  }

  // return arcId of next arc in the chain, pointed towards the shared vertex
  function nextConnectedArc(arcId) {
    var chainId = arcToChainId(arcId),
        chains =  getNodeChains(),
        nextChainId = chains[chainId];
    if (!(nextChainId >= 0 && nextChainId < chains.length)) {
      // console.log('arcId:', arcId, 'chainId:', chainId, 'next chain id:', nextChainId)
      error("out-of-range chain id");
    }
    return chainToArcId(nextChainId);
  }

  function prevChainId(chainId) {
    var chains = getNodeChains(),
        prevId = chainId,
        nextId = chains[chainId];
    while (nextId != chainId) {
      prevId = nextId;
      nextId = chains[nextId];
      if (nextId == prevId) error("Node indexing error");
    }
    return prevId;
  }

  // expose functions for testing
  this.internal = {
    testArcMatch: testArcMatch,
    testVertexMatch: testVertexMatch
  };
}

function findNodeTopology(arcs, filter) {
  var n = arcs.size() * 2,
      xx2 = new Float64Array(n),
      yy2 = new Float64Array(n),
      ids2 = new Int32Array(n);

  arcs.forEach2(function(i, n, xx, yy, zz, arcId) {
    var start = i,
        end = i + n - 1,
        start2 = arcId * 2,
        end2 = start2 + 1,
        ax = xx[start],
        ay = yy[start],
        bx = xx[end],
        by = yy[end];
    if (filter && !filter(arcId)) {
      ax = ay = bx = by = NaN;
    }

    xx2[start2] = ax;
    yy2[start2] = ay;
    ids2[start2] = arcId;
    xx2[end2] = bx;
    yy2[end2] = by;
    ids2[end2] = arcId;
  });

  var chains = initPointChains(xx2, yy2);
  return {
    xx: xx2,
    yy: yy2,
    ids: ids2,
    chains: chains
  };
}

function getDatasetBounds(dataset) {
  var bounds = new Bounds();
  dataset.layers.forEach(function(lyr) {
    var lyrbb = getLayerBounds(lyr, dataset.arcs);
    if (lyrbb) bounds.mergeBounds(lyrbb);
  });
  return bounds;
}

var projectionAliases = {
  robinson: '+proj=robin +datum=WGS84',
  webmercator: '+proj=merc +a=6378137 +b=6378137',
  wgs84: '+proj=longlat +datum=WGS84',
  albersusa: AlbersUSA
};

function isProjAlias(str) {
  return str in projectionAliases;
}

function getProjDefn(str) {
  var defn;
  // prepend '+proj=' to bare proj names
  str = str.replace(/(^| )([\w]+)($| )/, function(a, b, c, d) {
    if (c in mproj.internal.pj_list) {
      return b + '+proj=' + c + d;
    }
    return a;
  });
  if (looksLikeProj4String(str)) {
    defn = str;
  } else if (isProjAlias(str)) {
    defn = projectionAliases[str];
    if (utils.isFunction(defn)) {
      defn = defn();
    }
  } else if (looksLikeInitString(str)) {
    defn = '+init=' + str.toLowerCase();
  } else if (str in (getStashedVar('defs') || {})) {
    // a proj4 alias could be dynamically created in a -calc expression
    defn = getStashedVar('defs')[str];
  } else {
    defn = parseCustomProjection(str);
  }
  if (!defn) {
    stop("Unknown projection definition:", str);
  }
  return defn;
}

function looksLikeInitString(str) {
  return /^(esri|epsg|nad83|nad27):[0-9]+$/i.test(String(str));
}

function looksLikeProj4String(str) {
  return /^(\+[^ ]+ *)+$/.test(str);
}

function getCRS(str) {
  var defn = getProjDefn(str);  // defn is a string or a Proj object
  var P;
  if (!utils.isString(defn)) {
    P = defn;
  } else {
    try {
      P = mproj.pj_init(defn);
    } catch(e) {
      stop('Unable to use projection', defn, '(' + e.message + ')');
    }
  }
  return P || null;
}

function getDatasetCRS(dataset) {
  var info = dataset.info || {},
      P = info.crs;
  if (!P && info.prj) {
    P = getCRS(translatePrj(info.prj));
  }
  if (!P && probablyDecimalDegreeBounds(getDatasetBounds(dataset))) {
    // use wgs84 for probable latlong datasets with unknown datums
    P = getCRS('wgs84');
  }
  return P;
}

function isLatLngCRS(P) {
  return P && P.is_latlong || false;
}

function translatePrj(str) {
  var proj4;
  try {
    proj4 = mproj.internal.wkt_to_proj4(str);
  } catch(e) {
    stop('Unusable .prj file (' + e.message + ')');
  }
  return proj4;
}

var UNITS_LOOKUP = {
  m: 'meters',
  meter: 'meters',
  meters: 'meters',
  mi: 'miles',
  mile: 'miles',
  miles: 'miles',
  km: 'kilometers',
  ft: 'feet',
  feet: 'feet'
};

// From pj_units.js in mapshaper-proj
var TO_METERS = {
  meters: 1,
  kilometers: 1000,
  feet: 0.3048, // International Standard Foot
  miles: 1609.344 // International Statute Mile
};

// Return coeff. for converting a distance measure to dataset coordinates
// @paramUnits: units code of distance param, or null if units are not specified
// @crs: Proj.4 CRS object, or null (unknown latlong CRS);
//
function getIntervalConversionFactor(paramUnits, crs) {
  var fromParam = 0,
      fromCRS = 0,
      k;

  if (crs) {
    if (crs.is_latlong) {
      // calculations on latlong coordinates typically use meters
      fromCRS = 1;
    } else if (crs.to_meter > 0) {
      fromCRS = crs.to_meter;
    } else {
      error('Invalid CRS');
    }
  }
  if (paramUnits) {
    fromParam = TO_METERS[paramUnits];
    if (!fromParam) error('Unknown units:', paramUnits);
  }

  if (fromParam && fromCRS) {
    // known param units, known CRS conversion
    k = fromParam / fromCRS;
  } else if (!fromParam && !fromCRS) {
    // unknown param units, unknown (projected) CRS -- no scaling
    k = 1;
  } else if (fromParam && !fromCRS) {
    // known param units, unknown CRS -- error condition, not convertible
    stop('Unable to convert', paramUnits, 'to unknown coordinates');
  } else if (!fromParam && fromCRS) {
    // unknown param units, known CRS -- assume param in meters (bw compatibility)
    k = 1 / fromCRS;
  }
  return k;
}

// throws an error if measure is non-parsable
function parseMeasure(m) {
  var o = parseMeasure2(m);
  if (isNaN(o.value)) {
    stop('Invalid parameter:', m);
  }
  return o;
}

// returns NaN value if value is non-parsable
function parseMeasure2(m) {
  var s = utils.isString(m) ? m : '';
  var match = /(sq|)([a-z]+)(2|)$/i.exec(s); // units rxp
  var o = {};
  if (utils.isNumber(m)) {
    o.value = m;
  } else if (s === '') {
    o.value = NaN;
  } else if (match) {
    o.units = UNITS_LOOKUP[match[2].toLowerCase()];
    o.areal = !!(match[1] || match[3]);
    o.value = Number(s.substring(0, s.length - match[0].length));
    if (!o.units && !isNaN(o.value)) {
      // throw error if string contains a number followed by unrecognized units string
      stop('Unknown units: ' + match[0]);
    }
  } else {
    o.value = Number(s);
  }
  return o;
}

function convertAreaParam(opt, crs) {
  var o = parseMeasure(opt);
  var k = getIntervalConversionFactor(o.units, crs);
  return o.value * k * k;
}

// Same as convertDistanceParam(), except:
//   in the case of latlong datasets, coordinates are unitless (instead of meters),
//   and parameters with units trigger an error
function convertIntervalParam(opt, crs) {
  var o = parseMeasure(opt);
  var k = getIntervalConversionFactor(o.units, crs);
  if (o.units && crs && crs.is_latlong) {
    stop('Parameter does not support distance units with latlong datasets');
  }
  if (o.areal) {
    stop('Expected a distance, received an area:', opt);
  }
  return o.value * k;
}

// Convert an area measure to a label in sqkm or sqm
function getAreaLabel(area, crs) {
  var sqm = crs && crs.to_meter ? area * crs.to_meter * crs.to_meter : area;
  var sqkm = sqm / 1e6;
  return sqkm < 0.01 ? Math.round(sqm) + ' sqm' : sqkm + ' sqkm';
}

// Keep track of whether positive or negative integer ids are 'used' or not.

function IdTestIndex(n) {
  var index = new Uint8Array(n);
  var setList = [];

  this.setId = function(id) {
    if (!this.hasId(id)) {
      setList.push(id);
    }
    if (id < 0) {
      index[~id] |= 2;
    } else {
      index[id] |= 1;
    }
  };

  this.clear = function() {
    var index = this;
    setList.forEach(function(id) {
      index.clearId(id);
    });
    setList = [];
  };

  this.hasId = function(id) {
    return id < 0 ? (index[~id] & 2) == 2 : (index[id] & 1) == 1;
  };

  // clear a signed id
  this.clearId = function(id) {
    if (id < 0) {
      index[~id] &= 1; // clear reverse arc, preserve fwd arc
    } else {
      index[id] &= 2; // clear fwd arc, preserve rev arc
    }
  };

  this.getIds = function() {
    return setList;
  };

  this.setIds = function(ids) {
    for (var i=0; i<ids.length; i++) {
      this.setId(ids[i]);
    }
  };
}

// Clean polygon or polyline shapes (in-place)
//
function cleanShapes(shapes, arcs, type) {
  for (var i=0, n=shapes.length; i<n; i++) {
    shapes[i] = cleanShape(shapes[i], arcs, type);
  }
}

// Remove defective arcs and zero-area polygon rings
// Remove simple polygon spikes of form: [..., id, ~id, ...]
// Don't remove duplicate points
// Don't check winding order of polygon rings
function cleanShape(shape, arcs, type) {
  return editShapeParts(shape, function(path) {
    var cleaned = cleanPath(path, arcs);
    if (type == 'polygon' && cleaned) {
      removeSpikesInPath(cleaned); // assumed by addIntersectionCuts()
      if (geom.getPlanarPathArea(cleaned, arcs) === 0) {
        cleaned = null;
      }
    }
    return cleaned;
  });
}

function cleanPath(path, arcs) {
  var nulls = 0;
  for (var i=0, n=path.length; i<n; i++) {
    if (arcs.arcIsDegenerate(path[i])) {
      nulls++;
      path[i] = null;
    }
  }
  return nulls > 0 ? path.filter(function(id) {return id !== null;}) : path;
}


// Remove pairs of ids where id[n] == ~id[n+1] or id[0] == ~id[n-1];
// (in place)
function removeSpikesInPath(ids) {
  var n = ids.length;
  if (n >= 2) {
    if (ids[0] == ~ids[n-1]) {
      ids.pop();
      ids.shift();
    } else {
      for (var i=1; i<n; i++) {
        if (ids[i-1] == ~ids[i]) {
          ids.splice(i-1, 2);
          break;
        }
      }
    }
    if (ids.length < n) {
      removeSpikesInPath(ids);
    }
  }
}


// Returns a function for splitting self-intersecting polygon rings
// The splitter function receives a single polygon ring represented as an array
// of arc ids, and returns an array of split-apart rings.
//
// Self-intersections in the input ring are assumed to occur at vertices, not along segments.
// This requires that internal.addIntersectionCuts() has already been run.
//
// The rings output by this function may overlap each other, but each ring will
// be non-self-intersecting. For example, a figure-eight shaped ring will be
// split into two rings that touch each other where the original ring crossed itself.
//
function getSelfIntersectionSplitter(nodes) {
  var pathIndex = new IdTestIndex(nodes.arcs.size(), true);
  var filter = function(arcId) {
    return pathIndex.hasId(~arcId);
  };
  return function(path) {
    pathIndex.setIds(path);
    var paths = dividePath(path);
    pathIndex.clear();
    return paths;
  };

  // Returns array of 0 or more divided paths
  function dividePath(path) {
    var subPaths = null;
    for (var i=0, n=path.length; i < n - 1; i++) { // don't need to check last arc
      subPaths = dividePathAtNode(path, path[i]);
      if (subPaths !== null) {
        return subPaths;
      }
    }
    // indivisible path -- clean it by removing any spikes
    removeSpikesInPath(path);
    return path.length > 0 ? [path] : [];
  }

  // If arc @enterId enters a node with more than one open routes leading out:
  //   return array of sub-paths
  // else return null
  function dividePathAtNode(path, enterId) {
    var nodeIds = nodes.getConnectedArcs(enterId, filter),
        exitArcIndexes, exitArcId, idx;
    if (nodeIds.length < 2) return null;
    exitArcIndexes = [];
    for (var i=0; i<nodeIds.length; i++) {
      exitArcId = ~nodeIds[i];
      idx = indexOf(path, exitArcId);
      if (idx > -1) { // repeated scanning may be bottleneck
        // important optimization (TODO: explain this)
        // TODO: test edge case: exitArcId occurs twice in the path
        pathIndex.clearId(exitArcId);
        exitArcIndexes.push(idx);
      }
    }
    if (exitArcIndexes.length < 2) {
      return null;
    }
    // path forks -- recursively subdivide
    var subPaths = splitPathByIds(path, exitArcIndexes);
    return subPaths.reduce(accumulatePaths, null);
  }

  function accumulatePaths(memo, path) {
    var subPaths = dividePath(path);
    if (memo === null) {
      return subPaths;
    }
    memo.push.apply(memo, subPaths);
    return memo;
  }

  // Added as an optimization -- faster than using Array#indexOf()
  function indexOf(arr, el) {
    for (var i=0, n=arr.length; i<n; i++) {
      if (arr[i] === el) return i;
    }
    return -1;
  }

}

// Function returns an array of split-apart rings
// @path An array of arc ids describing a self-intersecting polygon ring
// @ids An array of two or more indexes of arcs that originate from a single vertex
//      where @path intersects itself -- assumes indexes are in ascending sequence
function splitPathByIds(path, indexes) {
  var subPaths = [];
  utils.genericSort(indexes, true); // sort ascending
  if (indexes[0] > 0) {
    subPaths.push(path.slice(0, indexes[0]));
  }
  for (var i=0, n=indexes.length; i<n; i++) {
    if (i < n-1) {
      subPaths.push(path.slice(indexes[i], indexes[i+1]));
    } else {
      subPaths.push(path.slice(indexes[i]));
    }
  }
  // handle case where first subring is split across endpoint of @path
  if (subPaths.length > indexes.length) {
    utils.merge(subPaths[0], subPaths.pop());
  }
  return subPaths;
}

function roundToSignificantDigits(n, d) {
  return +n.toPrecision(d);
}

// Used in mapshaper-expression-utils.js
// TODO: choose between this and the above function
function roundToDigits2(n, d) {
  var k = 1;
  if (!n && n !== 0) return n; // don't coerce null to 0
  d = d | 0;
  while (d-- > 0) k *= 10;
  return Math.round(n * k) / k;
}

// inc: Rounding increment (e.g. 0.001 rounds to thousandths)
function getRoundingFunction(inc) {
  if (!utils.isNumber(inc) || inc === 0) {
    error("Rounding increment must be a non-zero number.");
  }
  var inv = 1 / inc;
  if (inv > 1) inv = Math.round(inv);
  return function(x) {
    return Math.round(x * inv) / inv;
    // these alternatives show rounding error after JSON.stringify()
    // return Math.round(x / inc) / inv;
    // return Math.round(x / inc) * inc;
    // return Math.round(x * inv) * inc;
  };
}

function pointHasValidCoords(p) {
  // The Shapefile spec states that "measures" less then -1e38 indicate null values
  // This should not apply to coordinate data, but in-the-wild Shapefiles have been
  // seen with large negative values indicating null coordinates.
  // This test catches these and also NaNs, but does not detect other kinds of
  // invalid coords
  return p[0] > -1e38 && p[1] > -1e38;
}

// Accumulates points in buffers until #endPath() is called
// @drain callback: function(xarr, yarr, size) {}
//
function PathImportStream(drain) {
  var buflen = 10000,
      xx = new Float64Array(buflen),
      yy = new Float64Array(buflen),
      i = 0;

  this.endPath = function() {
    drain(xx, yy, i);
    i = 0;
  };

  this.addPoint = function(x, y) {
    if (i >= buflen) {
      buflen = Math.ceil(buflen * 1.3);
      xx = utils.extendBuffer(xx, buflen);
      yy = utils.extendBuffer(yy, buflen);
    }
    xx[i] = x;
    yy[i] = y;
    i++;
  };
}

// Import path data from a non-topological source (Shapefile, GeoJSON, etc)
// in preparation for identifying topology.
// @opts.reserved_points -- estimate of points in dataset, for pre-allocating buffers
//
function PathImporter(opts) {
  var bufSize = opts.reserved_points > 0 ? opts.reserved_points : 20000,
      xx = new Float64Array(bufSize),
      yy = new Float64Array(bufSize),
      shapes = [],
      properties = [],
      nn = [],
      types = [],
      collectionType = opts.type || null, // possible values: polygon, polyline, point
      round = null,
      pathId = -1,
      shapeId = -1,
      pointId = 0,
      dupeCount = 0,
      openRingCount = 0;

  if (opts.precision) {
    round = getRoundingFunction(opts.precision);
  }

  // mix in #addPoint() and #endPath() methods
  utils.extend(this, new PathImportStream(importPathCoords));

  this.startShape = function(d) {
    shapes[++shapeId] = null;
    if (d) properties[shapeId] = d;
  };

  this.importLine = function(points) {
    if (points.length < 2) {
      verbose("Skipping a defective line");
      return;
    }
    setShapeType('polyline');
    this.importPath(points);
  };

  this.importPoints = function(points) {
    setShapeType('point');
    points = points.filter(pointHasValidCoords);
    if (round) {
      points.forEach(function(p) {
        p[0] = round(p[0]);
        p[1] = round(p[1]);
      });
    }
    points.forEach(appendToShape);
  };

  this.importRing = function(points, isHole) {
    var area = geom.getPlanarPathArea2(points);
    if (!area || points.length < 4) {
      verbose("Skipping a defective ring");
      return;
    }
    setShapeType('polygon');
    if (isHole === true && area > 0 || isHole === false && area < 0) {
      // GeoJSON rings may be either direction -- no point in logging reversal
      // verbose("Reversing", isHole ? "a CW hole" : "a CCW ring");
      points.reverse();
    }
    this.importPath(points);
  };

  // Import an array of [x, y] Points
  this.importPath = function importPath(points) {
    var p;
    for (var i=0, n=points.length; i<n; i++) {
      p = points[i];
      this.addPoint(p[0], p[1]);
    }
    this.endPath();
  };

  // Return imported dataset
  // Apply any requested snapping and rounding
  // Remove duplicate points, check for ring inversions
  //
  this.done = function() {
    var arcs;
    var layers;
    var lyr = {name: ''};

    if (dupeCount > 0) {
      verbose(utils.format("Removed %,d duplicate point%s", dupeCount, utils.pluralSuffix(dupeCount)));
    }
    if (openRingCount > 0) {
      message(utils.format("Closed %,d open polygon ring%s", openRingCount, utils.pluralSuffix(openRingCount)));
    }
    if (pointId > 0) {
       if (pointId < xx.length) {
        xx = xx.subarray(0, pointId);
        yy = yy.subarray(0, pointId);
      }
      arcs = new ArcCollection(nn, xx, yy);

      //if (opts.snap || opts.auto_snap || opts.snap_interval) { // auto_snap is older name
      //  internal.snapCoords(arcs, opts.snap_interval);
      //}
    }

    if (collectionType == 'mixed') {
      layers = divideFeaturesByType(shapes, properties, types);

    } else {
      lyr = {geometry_type: collectionType};
      if (collectionType) {
        lyr.shapes = shapes;
      }
      if (properties.length > 0) {
        lyr.data = new DataTable(properties);
      }
      layers = [lyr];
    }

    layers.forEach(function(lyr) {
      //if (internal.layerHasPaths(lyr)) {
        //internal.cleanShapes(lyr.shapes, arcs, lyr.geometry_type);
      //}
      if (lyr.data) {
        fixInconsistentFields(lyr.data.getRecords());
      }
    });

    return {
      arcs: arcs || null,
      info: {},
      layers: layers
    };
  };

  function setShapeType(t) {
    var currType = shapeId < types.length ? types[shapeId] : null;
    if (!currType) {
      types[shapeId] = t;
      if (!collectionType) {
        collectionType = t;
      } else if (t != collectionType) {
        collectionType = 'mixed';
      }
    } else if (currType != t) {
      stop("Unable to import mixed-geometry features");
    }
  }

  function checkBuffers(needed) {
    if (needed > xx.length) {
      var newLen = Math.max(needed, Math.ceil(xx.length * 1.5));
      xx = utils.extendBuffer(xx, newLen, pointId);
      yy = utils.extendBuffer(yy, newLen, pointId);
    }
  }

  function appendToShape(part) {
    var currShape = shapes[shapeId] || (shapes[shapeId] = []);
    currShape.push(part);
  }

  function appendPath(n) {
    pathId++;
    nn[pathId] = n;
    appendToShape([pathId]);
  }

  function importPathCoords(xsrc, ysrc, n) {
    var count = 0;
    var x, y, prevX, prevY;
    checkBuffers(pointId + n);
    for (var i=0; i<n; i++) {
      x = xsrc[i];
      y = ysrc[i];
      if (round) {
        x = round(x);
        y = round(y);
      }
      if (i > 0 && x == prevX && y == prevY) {
        dupeCount++;
      } else {
        xx[pointId] = x;
        yy[pointId] = y;
        pointId++;
        count++;
      }
      prevY = y;
      prevX = x;
    }

    // check for open rings
    if (collectionType == 'polygon' && count > 0) {
      if (xsrc[0] != xsrc[n-1] || ysrc[0] != ysrc[n-1]) {
        checkBuffers(pointId + 1);
        xx[pointId] = xsrc[0];
        yy[pointId] = ysrc[0];
        openRingCount++;
        pointId++;
        count++;
      }
    }

    appendPath(count);
  }
}

function importGeoJSON(src, optsArg) {
  var opts = optsArg || {};
  var supportedGeometries = Object.keys(GeoJSON.pathImporters),
      srcObj = utils.isString(src) ? JSON.parse(src) : src,
      importer = new GeoJSONParser(opts),
      srcCollection, dataset;

  // Convert single feature or geometry into a collection with one member
  if (srcObj.type == 'Feature') {
    srcCollection = {
      type: 'FeatureCollection',
      features: [srcObj]
    };
  } else if (supportedGeometries.includes(srcObj.type)) {
    srcCollection = {
      type: 'GeometryCollection',
      geometries: [srcObj]
    };
  } else {
    srcCollection = srcObj;
  }
  (srcCollection.features || srcCollection.geometries || []).forEach(importer.parseObject);
  dataset = importer.done();
  importCRS(dataset, srcObj); // TODO: remove this
  return dataset;
}

function GeoJSONParser(opts) {
  var idField = opts.id_field || GeoJSON.ID_FIELD,
      importer = new PathImporter(opts);

  this.parseObject = function(o) {
    var geom, rec;
    if (!o || !o.type) {
      // not standard GeoJSON -- importing as null record
      // (useful when parsing GeoJSON generated internally)
      geom = null;
    } else if (o.type == 'Feature') {
      geom = o.geometry;
      rec = o.properties || {};
      if ('id' in o) {
        rec[idField] = o.id;
      }
    } else {
      geom = o;
    }
    // TODO: improve so geometry_type option skips features instead of creating null geometries
    if (geom && geom.type == 'GeometryCollection') {
      GeoJSON.importComplexFeature(importer, geom, rec, opts);
    } else if (opts.single_part && isMultiPartGeometry(geom)) {
      GeoJSON.importMultiAsSingles(importer, geom, rec, opts);
    } else {
      GeoJSON.importSimpleFeature(importer, geom, rec, opts);
    }
  };

  this.done = function() {
    return importer.done();
  };
}

GeoJSON.importComplexFeature = function(importer, geom, rec, opts) {
  var types = divideGeometriesByType(geom.geometries || []);
  if (types.length === 0) {
    importer.startShape(rec); // import a feature with null geometry
    return;
  }
  types.forEach(function(geometries, i) {
    importer.startShape(copyRecord(rec));
    geometries.forEach(function(geom) {
      GeoJSON.importSimpleGeometry(importer, geom, opts);
    });
  });
};

function divideGeometriesByType(geometries, index) {
  index = index || {};
  geometries.forEach(function(geom) {
    if (!geom) return;
    var mtype = GeoJSON.translateGeoJSONType(geom.type);
    if (mtype) {
      if (mtype in index === false) {
        index[mtype] = [];
      }
      index[mtype].push(geom);
    } else if (geom.type == 'GeometryCollection') {
      divideGeometriesByType(geom.geometries || [], index);
    }
  });
  return Object.values(index);
}

function isMultiPartGeometry(geom) {
  return geom && geom.type && geom.type.indexOf('Multi') === 0;
}

GeoJSON.importSimpleFeature = function(importer, geom, rec, opts) {
  importer.startShape(rec);
  GeoJSON.importSimpleGeometry(importer, geom, opts);
};

// Split a multi-part feature into several single features
GeoJSON.importMultiAsSingles = function(importer, geom, rec, opts) {
  geom.coordinates.forEach(function(coords, i) {
    var geom2 = {
      type: geom.type.substr(5),
      coordinates: coords
    };
    var rec2 = i === 0 ? rec : copyRecord(rec);
    GeoJSON.importSimpleFeature(importer, geom2, rec2, opts);
  });
};

GeoJSON.importSimpleGeometry = function(importer, geom, opts) {
  var type = geom ? geom.type : null;
  if (type === null) ; else if (type in GeoJSON.pathImporters) {
    if (opts.geometry_type && opts.geometry_type != GeoJSON.translateGeoJSONType(type)) {
      // kludge to filter out all but one type of geometry
      return;
    }
    GeoJSON.pathImporters[type](geom.coordinates, importer);
  } else {
    verbose("Unsupported geometry type:", geom.type);
  }
};


// Functions for importing geometry coordinates using a PathImporter
//
GeoJSON.pathImporters = {
  LineString: function(coords, importer) {
    importer.importLine(coords);
  },
  MultiLineString: function(coords, importer) {
    for (var i=0; i<coords.length; i++) {
      GeoJSON.pathImporters.LineString(coords[i], importer);
    }
  },
  Polygon: function(coords, importer) {
    for (var i=0; i<coords.length; i++) {
      importer.importRing(coords[i], i > 0);
    }
  },
  MultiPolygon: function(coords, importer) {
    for (var i=0; i<coords.length; i++) {
      GeoJSON.pathImporters.Polygon(coords[i], importer);
    }
  },
  Point: function(coord, importer) {
    importer.importPoints([coord]);
  },
  MultiPoint: function(coords, importer) {
    importer.importPoints(coords);
  }
};


function importCRS(dataset, jsonObj) {
  if ('crs' in jsonObj) {
    dataset.info.input_geojson_crs = jsonObj.crs;
  }
}

// Returns a search function
// Receives array of objects to index; objects must have a 'bounds' member
//    that is a Bounds object.
function getBoundsSearchFunction(boxes) {
  var index;
  if (!boxes.length) {
    // Unlike rbush, flatbush doesn't allow size 0 indexes; workaround
    return function() {return [];};
  }
  index = new Flatbush(boxes.length);
  boxes.forEach(function(ring) {
    var b = ring.bounds;
    index.add(b.xmin, b.ymin, b.xmax, b.ymax);
  });
  index.finish();

  function idxToObj(i) {
    return boxes[i];
  }

  // Receives xmin, ymin, xmax, ymax parameters
  // Returns subset of original @bounds array
  return function(a, b, c, d) {
    return index.search(a, b, c, d).map(idxToObj);
  };
}

// @xx array of x coords
// @ids an array of segment endpoint ids [a0, b0, a1, b1, ...]
// Sort @ids in place so that xx[a(n)] <= xx[b(n)] and xx[a(n)] <= xx[a(n+1)]
function sortSegmentIds(xx, ids) {
  orderSegmentIds(xx, ids);
  quicksortSegmentIds(xx, ids, 0, ids.length-2);
}

function orderSegmentIds(xx, ids, spherical) {
  function swap(i, j) {
    var tmp = ids[i];
    ids[i] = ids[j];
    ids[j] = tmp;
  }
  for (var i=0, n=ids.length; i<n; i+=2) {
    if (xx[ids[i]] > xx[ids[i+1]]) {
      swap(i, i+1);
    }
  }
}

function insertionSortSegmentIds(arr, ids, start, end) {
  var id, id2;
  for (var j = start + 2; j <= end; j+=2) {
    id = ids[j];
    id2 = ids[j+1];
    for (var i = j - 2; i >= start && arr[id] < arr[ids[i]]; i-=2) {
      ids[i+2] = ids[i];
      ids[i+3] = ids[i+1];
    }
    ids[i+2] = id;
    ids[i+3] = id2;
  }
}

function quicksortSegmentIds (a, ids, lo, hi) {
  var i = lo,
      j = hi,
      pivot, tmp;
  while (i < hi) {
    pivot = a[ids[(lo + hi >> 2) << 1]]; // avoid n^2 performance on sorted arrays
    while (i <= j) {
      while (a[ids[i]] < pivot) i+=2;
      while (a[ids[j]] > pivot) j-=2;
      if (i <= j) {
        tmp = ids[i];
        ids[i] = ids[j];
        ids[j] = tmp;
        tmp = ids[i+1];
        ids[i+1] = ids[j+1];
        ids[j+1] = tmp;
        i+=2;
        j-=2;
      }
    }

    if (j - lo < 40) insertionSortSegmentIds(a, ids, lo, j);
    else quicksortSegmentIds(a, ids, lo, j);
    if (hi - i < 40) {
      insertionSortSegmentIds(a, ids, i, hi);
      return;
    }
    lo = i;
    j = hi;
  }
}

// PolygonIndex indexes the coordinates in one polygon feature for efficient
// point-in-polygon tests

function PolygonIndex(shape, arcs, opts) {
  var data = arcs.getVertexData(),
      polygonBounds = arcs.getMultiShapeBounds(shape),
      boundsLeft,
      xminIds, xmaxIds, // vertex ids of segment endpoints
      bucketCount,
      bucketOffsets,
      bucketWidth;

  init();

  // Return 0 if outside, 1 if inside, -1 if on boundary
  this.pointInPolygon = function(x, y) {
    if (!polygonBounds.containsPoint(x, y)) {
      return false;
    }
    var bucketId = getBucketId(x);
    var count = countCrosses(x, y, bucketId);
    if (bucketId > 0) {
      count += countCrosses(x, y, bucketId - 1);
    }
    count += countCrosses(x, y, bucketCount); // check oflo bucket
    if (isNaN(count)) return -1;
    return count % 2 == 1 ? 1 : 0;
  };

  function countCrosses(x, y, bucketId) {
    var offs = bucketOffsets[bucketId],
        count = 0,
        xx = data.xx,
        yy = data.yy,
        n, a, b;
    if (bucketId == bucketCount) { // oflo bucket
      n = xminIds.length - offs;
    } else {
      n = bucketOffsets[bucketId + 1] - offs;
    }
    for (var i=0; i<n; i++) {
      a = xminIds[i + offs];
      b = xmaxIds[i + offs];
      count += geom.testRayIntersection(x, y, xx[a], yy[a], xx[b], yy[b]);
    }
    return count;
  }

  function getBucketId(x) {
    var i = Math.floor((x - boundsLeft) / bucketWidth);
    if (i < 0) i = 0;
    if (i >= bucketCount) i = bucketCount - 1;
    return i;
  }

  function getBucketCount(segCount) {
    // default is this many segs per bucket (average)
    // var buckets = opts && opts.buckets > 0 ? opts.buckets : segCount / 200;
    // using more segs/bucket for more complex shapes, based on trial and error
    var buckets = Math.pow(segCount, 0.75) / 10;
    return Math.ceil(buckets);
  }

  function init() {
    var xx = data.xx,
        segCount = 0,
        segId = 0,
        bucketId = -1,
        prevBucketId,
        segments,
        head, tail,
        a, b, i, j, xmin, xmax;

    // get array of segments as [s0p0, s0p1, s1p0, s1p1, ...], sorted by xmin coordinate
    forEachSegmentInShape(shape, arcs, function() {
      segCount++;
    });
    segments = new Uint32Array(segCount * 2);
    i = 0;
    forEachSegmentInShape(shape, arcs, function(a, b, xx, yy) {
      segments[i++] = a;
      segments[i++] = b;
    });
    sortSegmentIds(xx, segments);

    // assign segments to buckets according to xmin coordinate
    xminIds = new Uint32Array(segCount);
    xmaxIds = new Uint32Array(segCount);
    bucketCount = getBucketCount(segCount);
    bucketOffsets = new Uint32Array(bucketCount + 1); // add an oflo bucket
    boundsLeft = xx[segments[0]]; // xmin of first segment
    bucketWidth = (xx[segments[segments.length - 2]] - boundsLeft) / bucketCount;
    head = 0; // insertion index for next segment in the current bucket
    tail = segCount - 1; // insertion index for next segment in oflo bucket

    while (segId < segCount) {
      j = segId * 2;
      a = segments[j];
      b = segments[j+1];
      xmin = xx[a];
      xmax = xx[b];
      prevBucketId = bucketId;
      bucketId = getBucketId(xmin);

      while (bucketId > prevBucketId) {
        prevBucketId++;
        bucketOffsets[prevBucketId] = head;
      }

      if (xmax - xmin >= 0 === false) error("Invalid segment");
      if (getBucketId(xmax) - bucketId > 1) {
        // if segment extends to more than two buckets, put it in the oflo bucket
        xminIds[tail] = a;
        xmaxIds[tail] = b;
        tail--; // oflo bucket fills from right to left
      } else {
        // else place segment in a bucket based on x coord of leftmost endpoint
        xminIds[head] = a;
        xmaxIds[head] = b;
        head++;
      }
      segId++;
    }
    bucketOffsets[bucketCount] = head;
    if (head != tail + 1) error("Segment indexing error");
  }
}

// PathIndex supports several kinds of spatial query on a layer of polyline or polygon shapes
function PathIndex(shapes, arcs) {
  var boundsQuery = getBoundsSearchFunction(getRingData(shapes, arcs));
  var totalArea = getPathBounds(shapes, arcs).area();

  function getRingData(shapes, arcs) {
    var arr = [];
    shapes.forEach(function(shp, shpId) {
      var n = shp ? shp.length : 0;
      for (var i=0; i<n; i++) {
        arr.push({
          ids: shp[i],
          id: shpId,
          bounds: arcs.getSimpleShapeBounds(shp[i])
        });
      }
    });
    return arr;
  }

  // Returns shape ids of all polygons that intersect point p
  // (p is inside a ring or on the boundary)
  this.findEnclosingShapes = function(p) {
    var ids = [];
    var cands = findPointHitCandidates(p);
    var groups = groupItemsByShapeId(cands);
    groups.forEach(function(group) {
      if (testPointInRings(p, group)) {
        ids.push(group[0].id);
      }
    });
    return ids;
  };

  // Returns shape id of a polygon that intersects p or -1
  // (If multiple intersections, returns one of the polygons)
  this.findEnclosingShape = function(p) {
    var shpId = -1;
    var groups = groupItemsByShapeId(findPointHitCandidates(p));
    groups.forEach(function(group) {
      if (testPointInRings(p, group)) {
        shpId = group[0].id;
      }
    });
    return shpId;
  };

  // Returns shape ids of polygons that contain an arc
  // (arcs that are )
  // Assumes that input arc is either inside, outside or coterminous with indexed
  // arcs (i.e. input arc does not cross an indexed arc)
  this.findShapesEnclosingArc = function(arcId) {
    var p = getTestPoint([arcId]);
    return this.findEnclosingShapes(p);
  };

  this.findPointEnclosureCandidates = function(p, buffer) {
    var items = findPointHitCandidates(p, buffer);
    return utils.pluck(items, 'id');
  };

  this.pointIsEnclosed = function(p) {
    return testPointInRings(p, findPointHitCandidates(p));
  };

  // Finds the polygon containing the smallest ring that entirely contains @ring
  // Assumes ring boundaries do not cross.
  // Unhandled edge case:
  //   two rings share at least one segment but are not congruent.
  // @ring: array of arc ids
  // Returns id of enclosing polygon or -1 if none found
  this.findSmallestEnclosingPolygon = function(ring) {
    var bounds = arcs.getSimpleShapeBounds(ring);
    var p = getTestPoint(ring);
    var smallest;
    var cands = findPointHitCandidates(p);
    cands.forEach(function(cand) {
      if (cand.bounds.contains(bounds) && // skip partially intersecting bboxes (can't be enclosures)
        !cand.bounds.sameBounds(bounds) && // skip self, congruent and reversed-congruent rings
        !(smallest && smallest.bounds.area() < cand.bounds.area())) {
            if (testPointInRing(p, cand)) {
              smallest = cand;
            }
          }
    });

    return smallest ? smallest.id : -1;
  };

  this.arcIsEnclosed = function(arcId) {
    return this.pointIsEnclosed(getTestPoint([arcId]));
  };

  // Test if a polygon ring is contained within an indexed ring
  // Not a true polygon-in-polygon test
  // Assumes that the target ring does not cross an indexed ring at any point
  // or share a segment with an indexed ring. (Intersecting rings should have
  // been detected previously).
  //
  this.pathIsEnclosed = function(pathIds) {
    return this.pointIsEnclosed(getTestPoint(pathIds));
  };

  // return array of paths that are contained within a path, or null if none
  // @pathIds Array of arc ids comprising a closed path
  this.findEnclosedPaths = function(pathIds) {
    var b = arcs.getSimpleShapeBounds(pathIds),
        cands = boundsQuery(b.xmin, b.ymin, b.xmax, b.ymax),
        paths = [],
        index;

    if (cands.length > 6) {
      index = new PolygonIndex([pathIds], arcs);
    }
    cands.forEach(function(cand) {
      var p = getTestPoint(cand.ids);
      var isEnclosed = b.containsPoint(p[0], p[1]) && (index ?
        index.pointInPolygon(p[0], p[1]) : geom.testPointInRing(p[0], p[1], pathIds, arcs));
      if (isEnclosed) {
        paths.push(cand.ids);
      }
    });
    return paths.length > 0 ? paths : null;
  };

  this.findPathsInsideShape = function(shape) {
    var paths = []; // list of enclosed paths
    shape.forEach(function(ids) {
      var enclosed = this.findEnclosedPaths(ids);
      if (enclosed) {
        // any paths that are enclosed by an even number of rings are removed from list
        // (given normal topology, such paths are inside holes)
        paths = xorArrays(paths, enclosed);
      }
    }, this);
    return paths.length > 0 ? paths : null;
  };

  function testPointInRing(p, cand) {
    if (!cand.bounds.containsPoint(p[0], p[1])) return false;
    if (!cand.index && cand.bounds.area() > totalArea * 0.01) {
      // index larger polygons (because they are slower to test via pointInRing()
      //    and they are more likely to be involved in repeated hit tests).
      cand.index = new PolygonIndex([cand.ids], arcs);
    }
    return cand.index ?
        cand.index.pointInPolygon(p[0], p[1]) :
        geom.testPointInRing(p[0], p[1], cand.ids, arcs);
  }

  //
  function testPointInRings(p, cands) {
    var isOn = false,
        isIn = false;
    cands.forEach(function(cand) {
      var inRing = testPointInRing(p, cand);
      if (inRing == -1) {
        isOn = true;
      } else if (inRing == 1) {
        isIn = !isIn;
      }
    });
    return isOn || isIn;
  }

  function groupItemsByShapeId(items) {
    var groups = [],
        group, item;
    if (items.length > 0) {
      items.sort(function(a, b) {return a.id - b.id;});
      for (var i=0; i<items.length; i++) {
        item = items[i];
        if (i === 0 || item.id != items[i-1].id) {
          groups.push(group=[]);
        }
        group.push(item);
      }
    }
    return groups;
  }

  function findPointHitCandidates(p, buffer) {
    var b = buffer > 0 ? buffer : 0;
    p[0]; p[1];
    return boundsQuery(p[0] - b, p[1] - b, p[0] + b, p[1] + b);
  }

  // Find a point on a ring to use for point-in-polygon testing
  function getTestPoint(ring) {
    // Use the point halfway along first segment rather than an endpoint
    // (because ring might still be enclosed if a segment endpoint touches an indexed ring.)
    // The returned point should work for point-in-polygon testing if two rings do not
    // share any common segments (which should be true for topological datasets)
    // TODO: consider alternative of finding an internal point of @ring (slower but
    //   potentially more reliable).
    var arcId = ring[0],
        p0 = arcs.getVertex(arcId, 0),
        p1 = arcs.getVertex(arcId, 1);
    return [(p0.x + p1.x) / 2, (p0.y + p1.y) / 2];
  }

  // concatenate arrays, removing elements that are in both
  function xorArrays(a, b) {
    var xor = [], i;
    for (i=0; i<a.length; i++) {
      if (b.indexOf(a[i]) == -1) xor.push(a[i]);
    }
    for (i=0; i<b.length; i++) {
      if (a.indexOf(b[i]) == -1) xor.push(b[i]);
    }
    return xor;
  }
}

// a, b: two ring data objects (from getPathMetadata);
function testRingInRing(a, b, arcs) {
  if (b.bounds.contains(a.bounds) === false) return false;
  // Don't test with first point -- this may return false if a hole intersects
  // the containing ring at the first vertex.
  // Instead, use the midpoint of the first segment
  var p = getFirstMidpoint(a.ids[0], arcs);
  //// test with first point in the ring
  // var p = arcs.getVertex(a.ids[0], 0);
  return geom.testPointInRing(p.x, p.y, b.ids, arcs) == 1;
}

function getFirstMidpoint(arcId, arcs) {
  var p1 = arcs.getVertex(arcId, 0);
  var p2 = arcs.getVertex(arcId, 1);
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2
  };
}

// Bundle holes with their containing rings for Topo/GeoJSON polygon export.
// Assumes outer rings are CW and inner (hole) rings are CCW, unless
//   the reverseWinding flag is set.
// @paths array of objects with path metadata -- see internal.exportPathData()
//
function groupPolygonRings(paths, arcs, reverseWinding) {
  var holes = [],
      groups = [],
      sign = reverseWinding ? -1 : 1,
      boundsQuery;

  (paths || []).forEach(function(path) {
    if (path.area * sign > 0) {
      groups.push([path]);
    } else if (path.area * sign < 0) {
      holes.push(path);
    } else ;
  });

  if (holes.length === 0) {
    return groups;
  }

  // Using a spatial index to improve performance when the current feature
  // contains many holes and space-filling rings.
  // (Thanks to @simonepri for providing an example implementation in PR #248)
  boundsQuery = getBoundsSearchFunction(groups.map(function(group, i) {
    return {
      bounds: group[0].bounds,
      idx: i
    };
  }));

  // Group each hole with its containing ring
  holes.forEach(function(hole) {
    var containerId = -1,
        containerArea = 0,
        holeArea = hole.area * -sign,
        b = hole.bounds,
        // Find rings that might contain this hole
        candidates = boundsQuery(b.xmin, b.ymin, b.xmax, b.ymax),
        ring, ringId, ringArea, isContained;

    // Group this hole with the smallest-area ring that contains it.
    // (Assumes that if a ring's bbox contains a hole, then the ring also
    //  contains the hole).
    for (var i=0, n=candidates.length; i<n; i++) {
      ringId = candidates[i].idx;
      ring = groups[ringId][0];
      ringArea = ring.area * sign;
      isContained = ring.bounds.contains(hole.bounds) && ringArea > holeArea;
      if (isContained && candidates.length > 1 && !testRingInRing(hole, ring, arcs)) {
        // Using a more precise ring-in-ring test in the unusual case that
        // this hole is contained within the bounding box of multiple rings.
        // TODO: consider doing a ring-in-ring test even when there is only one
        // candidate ring, based on bbox-in-bbox test (this may affect performance
        // with some datasets).
        continue;
      }
      if (isContained && (containerArea === 0 || ringArea < containerArea)) {
        containerArea = ringArea;
        containerId = ringId;
      }
    }
    if (containerId == -1) ; else {
      groups[containerId].push(hole);
    }
  });

  return groups;
}

function exportPointData(points) {
  var data, path;
  if (!points || points.length === 0) {
    data = {partCount: 0, pointCount: 0};
  } else {
    path = {
      points: points,
      pointCount: points.length,
      bounds: geom.getPathBounds(points)
    };
    data = {
      bounds: path.bounds,
      pathData: [path],
      partCount: 1,
      pointCount: path.pointCount
    };
  }
  return data;
}

// TODO: remove duplication with internal.getPathMetadata()
function exportPathData(shape, arcs, type) {
  // kludge until Shapefile exporting is refactored
  if (type == 'point') return exportPointData(shape);

  var pointCount = 0,
      bounds = new Bounds(),
      paths = [];

  if (shape && (type == 'polyline' || type == 'polygon')) {
    shape.forEach(function(arcIds, i) {
      var iter = arcs.getShapeIter(arcIds),
          path = exportPathCoords(iter),
          valid = true;
      path.ids = arcIds;
      if (type == 'polygon') {
        path.area = geom.getPlanarPathArea2(path.points);
        valid = path.pointCount > 3 && path.area !== 0;
      } else if (type == 'polyline') {
        valid = path.pointCount > 1;
      }
      if (valid) {
        pointCount += path.pointCount;
        path.bounds = geom.getPathBounds(path.points);
        bounds.mergeBounds(path.bounds);
        paths.push(path);
      } else {
        verbose("Skipping a collapsed", type, "path");
      }
    });
  }

  return {
    pointCount: pointCount,
    pathData: paths,
    pathCount: paths.length,
    bounds: bounds
  };
}

function exportPathCoords(iter) {
  var points = [],
      i = 0,
      x, y, prevX, prevY;
  while (iter.hasNext()) {
    x = iter.x;
    y = iter.y;
    if (i === 0 || prevX != x || prevY != y) {
      points.push([x, y]);
      i++;
    }
    prevX = x;
    prevY = y;
  }
  return {
    points: points,
    pointCount: points.length
  };
}

function stringifyAsNDJSON(o) {
  var str = JSON.stringify(o);
  return str.replace(/\n/g, '\n').replace(/\r/g, '\r');
}

function getFormattedStringify(numArrayKeys) {
  var keyIndex = utils.arrayToIndex(numArrayKeys);
  var sentinel = '\u1000\u2FD5\u0310';
  var stripRxp = new RegExp('"' + sentinel + '|' + sentinel + '"', 'g');
  var indentChars = '  ';

  function replace(key, val) {
    // We want to format numerical arrays like [1, 2, 3] instead of
    // the way JSON.stringify() behaves when applying indentation.
    // This kludge converts arrays to strings with sentinel strings inside the
    // surrounding quotes. At the end, the sentinel strings and quotes
    // are replaced by array brackets.
    if (key in keyIndex && utils.isArray(val)) {
      var str = JSON.stringify(val);
      // make sure the array does not contain any strings
      if (str.indexOf('"' == -1)) {
        return sentinel + str.replace(/,/g, ', ') + sentinel;
      }
    }
    return val;
  }

  return function(obj) {
    var json = JSON.stringify(obj, replace, indentChars);
    return json.replace(stripRxp, '');
  };
}

// Return id of rightmost connected arc in relation to @arcId
// Return @arcId if no arcs can be found
function getRightmostArc(arcId, nodes, filter) {
  var ids = nodes.getConnectedArcs(arcId);
  if (filter) {
    ids = ids.filter(filter);
  }
  if (ids.length === 0) {
    return arcId; // error condition, handled by caller
  }
  return getRighmostArc2(arcId, ids, nodes.arcs);
}

function getRighmostArc2 (fromId, ids, arcs) {
  var coords = arcs.getVertexData(),
      xx = coords.xx,
      yy = coords.yy,
      inode = arcs.indexOfVertex(fromId, -1),
      nodeX = xx[inode],
      nodeY = yy[inode],
      ifrom = arcs.indexOfVertex(fromId, -2),
      fromX = xx[ifrom],
      fromY = yy[ifrom],
      toId = fromId, // initialize to from-arc -- an error
      ito, candId, icand, code, j;

  /*if (x == ax && y == ay) {
    error("Duplicate point error");
  }*/
  if (ids.length > 0) {
    toId = ids[0];
    ito = arcs.indexOfVertex(toId, -2);
  }

  for (j=1; j<ids.length; j++) {
    candId = ids[j];
    icand = arcs.indexOfVertex(candId, -2);
    code = chooseRighthandPath(fromX, fromY, nodeX, nodeY, xx[ito], yy[ito], xx[icand], yy[icand]);
    // code = internal.chooseRighthandPath(0, 0, nodeX - fromX, nodeY - fromY, xx[ito] - fromX, yy[ito] - fromY, xx[icand] - fromX, yy[icand] - fromY);
    if (code == 2) {
      toId = candId;
      ito = icand;
    }
  }
  if (toId == fromId) {
    // This shouldn't occur, assuming that other arcs are present
    error("Pathfinder error");
  }
  return toId;
}

// TODO: consider using simpler internal.chooseRighthandPath2()
// Returns 1 if node->a, return 2 if node->b, else return 0
// TODO: better handling of identical angles (better -- avoid creating them)
function chooseRighthandPath(fromX, fromY, nodeX, nodeY, ax, ay, bx, by) {
  var angleA = geom.signedAngle(fromX, fromY, nodeX, nodeY, ax, ay);
  var angleB = geom.signedAngle(fromX, fromY, nodeX, nodeY, bx, by);
  var code;
  if (angleA <= 0 || angleB <= 0) {
    if (angleA <= 0) {
      debug('  A orient2D:', geom.orient2D(fromX, fromY, nodeX, nodeY, ax, ay));
    }
    if (angleB <= 0) {
      debug('  B orient2D:', geom.orient2D(fromX, fromY, nodeX, nodeY, bx, by));
    }
    // TODO: test against "from" segment
    if (angleA > 0) {
      code = 1;
    } else if (angleB > 0) {
      code = 2;
    } else {
      code = 0;
    }
  } else if (angleA < angleB) {
    code = 1;
  } else if (angleB < angleA) {
    code = 2;
  } else if (isNaN(angleA) || isNaN(angleB)) {
    // probably a duplicate point, which should not occur
    error('Invalid node geometry');
  } else {
    // Equal angles: use fallback test that is less sensitive to rounding error
    code = chooseRighthandVector(ax - nodeX, ay - nodeY, bx - nodeX, by - nodeY);
  }
  return code;
}

function chooseRighthandVector(ax, ay, bx, by) {
  var orient = geom.orient2D(ax, ay, 0, 0, bx, by);
  var code;
  if (orient > 0) {
    code = 2;
  } else if (orient < 0) {
    code = 1;
  } else {
    code = 0;
  }
  return code;
}

function setRouteBits(arcBits, arcId, routesArr) {
  var idx = absArcId(arcId), // get index of path in
      mask;
  if (idx == arcId) { // arcBits controls fwd path
    mask = ~3; // target fwd bits
  } else { // arcBits controls rev. path
    mask = ~0x30; // target rev bits
    arcBits = arcBits << 4; // shift code to target rev path
  }
  routesArr[idx] &= (arcBits | mask);
}

function getRouteBits(arcId, routesArr) {
  var idx = absArcId(arcId),
      bits = routesArr[idx];
  if (idx != arcId) bits = bits >> 4;
  return bits & 7;
}

// Open arc pathways in a single shape or array of shapes
//
function openArcRoutes(paths, arcColl, routesArr, fwd, rev, dissolve, orBits) {
  forEachArcId(paths, function(arcId) {
    var isInv = arcId < 0,
        idx = isInv ? ~arcId : arcId,
        currBits = routesArr[idx],
        openFwd = isInv ? rev : fwd,
        openRev = isInv ? fwd : rev,
        newBits = currBits;

    // error condition: lollipop arcs can cause problems; ignore these
    if (arcColl.arcIsLollipop(arcId)) {
      newBits = 0; // unset (i.e. make invisible)
    } else {
      if (openFwd) {
        newBits |= 3; // set fwd path to visible and open
      }
      if (openRev) {
        newBits |= 0x30; // set rev. path to visible and open
      }

      // placing this in front of dissolve - dissolve has to be able to hide
      // pathways that are made visible by orBits
      if (orBits > 0) {
        newBits |= orBits;
      }

      // dissolve hides arcs that have both fw and rev pathways open
      // (these arcs represent shared borders and will not be part of the dissolved path)
      //
      if (dissolve && (newBits & 0x22) === 0x22) {
        newBits &= ~0x11; // make invisible
      }
    }

    routesArr[idx] = newBits;
  });
}

function closeArcRoutes(arcIds, arcs, routesArr, fwd, rev, hide) {
  forEachArcId(arcIds, function(arcId) {
    var isInv = arcId < 0,
        idx = isInv ? ~arcId : arcId,
        currBits = routesArr[idx],
        mask = 0xff,
        closeFwd = isInv ? rev : fwd,
        closeRev = isInv ? fwd : rev;

    if (closeFwd) {
      if (hide) mask &= ~1;
      mask ^= 0x2;
    }
    if (closeRev) {
      if (hide) mask &= ~0x10;
      mask ^= 0x20;
    }
    routesArr[idx] = currBits & mask;
  });
}

// Return a function for generating a path across a graph of connected arcs
// useRoute: function(arcId) {}
//           Tries to extend path to the given arc
//           Returns true and extends path by one arc on success
//           Returns false and rejects the entire path on failure
// routeIsUsable (optional): function(arcId) {}
//           An optional filter function; pathfinder ignores the given arc if
//           this function returns false;
// TODO: add option to use spherical geometry for lat-lng coords
//
function getPathFinder(nodes, useRoute, routeIsUsable) {
  var testArc = null;
  if (routeIsUsable) {
    testArc = function(arcId) {
      return routeIsUsable(~arcId); // outward path must be traversable
    };
  }

  function getNextArc(prevId) {
    // reverse arc to point onwards
    return ~getRightmostArc(prevId, nodes, testArc);
  }

  return function(startId) {
    var path = [],
        nextId, candId = startId;

    do {
      if (useRoute(candId)) {
        path.push(candId);
        nextId = candId;
        candId = getNextArc(nextId);
      } else {
        return null;
      }

      if (candId == ~nextId) {
        return null;
      }
    } while (candId != startId);
    return path.length === 0 ? null : path;
  };
}

// Returns a function for flattening or dissolving a collection of rings
// Assumes rings are oriented in CW direction
//
function getRingIntersector(nodes, flagsArr) {
  var arcs = nodes.arcs;
  var findPath = getPathFinder(nodes, useRoute, routeIsActive);
  flagsArr = flagsArr || new Uint8Array(arcs.size());

  // types: "dissolve" "flatten"
  return function(rings, type) {
    var dissolve = type == 'dissolve',
        openFwd = true,
        openRev = type == 'flatten',
        output;
    // even single rings get transformed (e.g. to remove spikes)
    if (rings.length > 0) {
      output = [];
      openArcRoutes(rings, arcs, flagsArr, openFwd, openRev, dissolve);
      forEachShapePart(rings, function(ids) {
        var path;
        for (var i=0, n=ids.length; i<n; i++) {
          path = findPath(ids[i]);
          if (path) {
            output.push(path);
          }
        }
      });
      closeArcRoutes(rings, arcs, flagsArr, openFwd, openRev, true);
    } else {
      output = rings;
    }
    return output;
  };

  function routeIsActive(arcId) {
    var bits = getRouteBits(arcId, flagsArr);
    return (bits & 1) == 1;
  }

  function useRoute(arcId) {
    var route = getRouteBits(arcId, flagsArr),
        isOpen = false;
    if (route == 3) {
      isOpen = true;
      setRouteBits(1, arcId, flagsArr); // close the path, leave visible
    }
    return isOpen;
  }
}

// function debugFlags(flags) {
//   var arr = [];
//   utils.forEach(flags, function(flag) {
//     arr.push(bitsToString(flag));
//   });
//   message(arr);

//   function bitsToString(bits) {
//     var str = "";
//     for (var i=0; i<8; i++) {
//       str += (bits & (1 << i)) > 0 ? "1" : "0";
//       if (i < 7) str += ' ';
//       if (i == 3) str += ' ';
//     }
//     return str;
//   }
// }

// Used by -clean -dissolve2 -filter-slivers -filter-islands to generate area filters
// for removing small polygon rings.
// Assumes lyr is a polygon layer.
function getSliverFilter(lyr, dataset, opts) {
  var areaArg = opts.min_gap_area || opts.min_area || opts.gap_fill_area;
  if (+areaArg == 0) {
    return {
      filter: function() {return false;}, // don't fill any gaps
      threshold: 0
    };
  }
  var sliverControl = opts.sliver_control >= 0 ? opts.sliver_control : 0; // 0 is default
  var crs = getDatasetCRS(dataset);
  var threshold = areaArg ?
      convertAreaParam(areaArg, crs) :
      getDefaultSliverThreshold(lyr, dataset.arcs);
  var filter = sliverControl > 0 ?
      getSliverTest(dataset.arcs, threshold, sliverControl) :
      getMinAreaTest(threshold, dataset);
  var label = getSliverLabel(getAreaLabel(threshold, crs), sliverControl > 0);
  return {
    threshold: threshold,
    filter: filter,
    label: label
  };
}

function getSliverLabel(areaStr, variable) {
  if (variable) {
    areaStr = areaStr.replace(' ', '+ ') + ' variable';
  }
  return areaStr + ' threshold';
}

function getMinAreaTest(minArea, dataset) {
  var pathArea = dataset.arcs.isPlanar() ? geom.getPlanarPathArea : geom.getSphericalPathArea;
  return function(path) {
    var area = pathArea(path, dataset.arcs);
    return Math.abs(area) < minArea;
  };
}

function getSliverTest(arcs, threshold, strength) {
  if (strength >= 0 === false) {
    strength = 1; // default is 1 (full-strength)
  }
  if (strength > 1 || threshold >= 0 === false) {
    error('Invalid parameter');
  }
  var calcEffectiveArea = getSliverAreaFunction(arcs, strength);
  return function(ring) {
    return Math.abs(calcEffectiveArea(ring)) < threshold;
  };
}

// Strength: 0-1
function getSliverAreaFunction(arcs, strength) {
  var k = Math.sqrt(strength); // more sensible than linear weighted avg.
  return function(ring) {
    var area = geom.getPathArea(ring, arcs);
    var perim = geom.getPathPerimeter(ring, arcs);
    var compactness = geom.calcPolsbyPopperCompactness(area, perim);
    var effectiveArea = area * (k * compactness + 1 - k);
    return effectiveArea;
  };
}

// Calculate a default area threshold using average segment length,
// but increase the threshold for high-detail datasets and decrease it for
// low-detail datasets (using segments per ring as a measure of detail).
//
function getDefaultSliverThreshold(lyr, arcs) {
  var ringCount = 0;
  var calcLen = arcs.isPlanar() ? geom.distance2D : geom.greatCircleDistance;
  var avgSegLen = 0;
  var segCount = 0;
  var onSeg = function(i, j, xx, yy) {
    var len = calcLen(xx[i], yy[i], xx[j], yy[j]);
    segCount++;
    avgSegLen += (len - avgSegLen) / segCount;
  };
  editShapes(lyr.shapes, function(path) {
    ringCount++;
    forEachSegmentInPath(path, arcs, onSeg);
  });
  var segPerRing = segCount / ringCount || 0;
  var complexityFactor = Math.pow(segPerRing, 0.75); // use seg/ring as a proxy for complexity
  var threshold = avgSegLen * avgSegLen / 50 * complexityFactor;
  threshold = roundToSignificantDigits(threshold, 2); // round for display
  return threshold;
}

// Returns undefined if not found
function lookupColorName(str) {
  return colors[str.toLowerCase().replace(/[ -]+/g, '')];
}

var colors = {
  aliceblue: '#f0f8ff',
  antiquewhite: '#faebd7',
  aqua: '#00ffff',
  aquamarine: '#7fffd4',
  azure: '#f0ffff',
  beige: '#f5f5dc',
  bisque: '#ffe4c4',
  black: '#000000',
  blanchedalmond: '#ffebcd',
  blue: '#0000ff',
  blueviolet: '#8a2be2',
  brown: '#a52a2a',
  burlywood: '#deb887',
  cadetblue: '#5f9ea0',
  chartreuse: '#7fff00',
  chocolate: '#d2691e',
  coral: '#ff7f50',
  cornflowerblue: '#6495ed',
  cornsilk: '#fff8dc',
  crimson: '#dc143c',
  cyan: '#00ffff',
  darkblue: '#00008b',
  darkcyan: '#008b8b',
  darkgoldenrod: '#b8860b',
  darkgray: '#a9a9a9',
  darkgreen: '#006400',
  darkgrey: '#a9a9a9',
  darkkhaki: '#bdb76b',
  darkmagenta: '#8b008b',
  darkolivegreen: '#556b2f',
  darkorange: '#ff8c00',
  darkorchid: '#9932cc',
  darkred: '#8b0000',
  darksalmon: '#e9967a',
  darkseagreen: '#8fbc8f',
  darkslateblue: '#483d8b',
  darkslategray: '#2f4f4f',
  darkslategrey: '#2f4f4f',
  darkturquoise: '#00ced1',
  darkviolet: '#9400d3',
  deeppink: '#ff1493',
  deepskyblue: '#00bfff',
  dimgray: '#696969',
  dimgrey: '#696969',
  dodgerblue: '#1e90ff',
  firebrick: '#b22222',
  floralwhite: '#fffaf0',
  forestgreen: '#228b22',
  fuchsia: '#ff00ff',
  gainsboro: '#dcdcdc',
  ghostwhite: '#f8f8ff',
  gold: '#ffd700',
  goldenrod: '#daa520',
  gray: '#808080',
  green: '#008000',
  greenyellow: '#adff2f',
  grey: '#808080',
  honeydew: '#f0fff0',
  hotpink: '#ff69b4',
  indianred: '#cd5c5c',
  indigo: '#4b0082',
  ivory: '#fffff0',
  khaki: '#f0e68c',
  lavender: '#e6e6fa',
  lavenderblush: '#fff0f5',
  lawngreen: '#7cfc00',
  lemonchiffon: '#fffacd',
  lightblue: '#add8e6',
  lightcoral: '#f08080',
  lightcyan: '#e0ffff',
  lightgoldenrodyellow: '#fafad2',
  lightgray: '#d3d3d3',
  lightgreen: '#90ee90',
  lightgrey: '#d3d3d3',
  lightpink: '#ffb6c1',
  lightsalmon: '#ffa07a',
  lightseagreen: '#20b2aa',
  lightskyblue: '#87cefa',
  lightslategray: '#778899',
  lightslategrey: '#778899',
  lightsteelblue: '#b0c4de',
  lightyellow: '#ffffe0',
  lime: '#00ff00',
  limegreen: '#32cd32',
  linen: '#faf0e6',
  magenta: '#ff00ff',
  maroon: '#800000',
  mediumaquamarine: '#66cdaa',
  mediumblue: '#0000cd',
  mediumorchid: '#ba55d3',
  mediumpurple: '#9370db',
  mediumseagreen: '#3cb371',
  mediumslateblue: '#7b68ee',
  mediumspringgreen: '#00fa9a',
  mediumturquoise: '#48d1cc',
  mediumvioletred: '#c71585',
  midnightblue: '#191970',
  mintcream: '#f5fffa',
  mistyrose: '#ffe4e1',
  moccasin: '#ffe4b5',
  navajowhite: '#ffdead',
  navy: '#000080',
  oldlace: '#fdf5e6',
  olive: '#808000',
  olivedrab: '#6b8e23',
  orange: '#ffa500',
  orangered: '#ff4500',
  orchid: '#da70d6',
  palegoldenrod: '#eee8aa',
  palegreen: '#98fb98',
  paleturquoise: '#afeeee',
  palevioletred: '#db7093',
  papayawhip: '#ffefd5',
  peachpuff: '#ffdab9',
  peru: '#cd853f',
  pink: '#ffc0cb',
  plum: '#dda0dd',
  powderblue: '#b0e0e6',
  purple: '#800080',
  rebeccapurple: '#663399',
  red: '#ff0000',
  rosybrown: '#bc8f8f',
  royalblue: '#4169e1',
  saddlebrown: '#8b4513',
  salmon: '#fa8072',
  sandybrown: '#f4a460',
  seagreen: '#2e8b57',
  seashell: '#fff5ee',
  sienna: '#a0522d',
  silver: '#c0c0c0',
  skyblue: '#87ceeb',
  slateblue: '#6a5acd',
  slategray: '#708090',
  slategrey: '#708090',
  snow: '#fffafa',
  springgreen: '#00ff7f',
  steelblue: '#4682b4',
  tan: '#d2b48c',
  teal: '#008080',
  thistle: '#d8bfd8',
  tomato: '#ff6347',
  turquoise: '#40e0d0',
  violet: '#ee82ee',
  wheat: '#f5deb3',
  white: '#ffffff',
  whitesmoke: '#f5f5f5',
  yellow: '#ffff00',
  yellowgreen: '#9acd32'
};

var rgbaRxp = /^rgba?\(([^)]+)\)/;
var hexRxp = /^#([a-f0-9]{3,8})/i;

function parseColor(arg) {
  arg = arg ? String(arg) : '';
  var hexStr = hexRxp.test(arg) ? arg : lookupColorName(arg);
  var rgb = null;
  if (hexStr) {
    rgb = parseHexColor(hexStr);
  } else if (rgbaRxp.test(arg)) {
    rgb = parseRGBA(arg);
  }
  if (rgb && !testRGB(rgb)) {
    rgb = null;
  }
  return rgb;
}

function validateColor(arg) {
  if (!parseColor(arg)) {
    stop("Unsupported color:", arg);
  }
  return true;
}

function testRGB(o) {
  return !!o && testChannel(o.r) && testChannel(o.g) && testChannel(o.b) &&
    testAlpha(o.a);
}

function testAlpha(a) {
  return a >= 0 && a <= 1;
}

function testChannel(c) {
  return c >= 0 && c < 256; // allow fractional values
}

function parseRGBA(arg) {
  var str = rgbaRxp.exec(arg)[1];
  var parts = str.split(',').map(function(part) { return parseFloat(part); });
  return {
    r: parts[0],
    g: parts[1],
    b: parts[2],
    a: parts[3] >= 0 ? parts[3] : 1
  };
}

function formatColor(o) {
  return o.a < 1 ? formatRGBA(o) : formatHexColor(o);
}

function formatHexColor(o) {
  return "#" + formatHexChannel(o.r) + formatHexChannel(o.g) + formatHexChannel(o.b);

}

function formatRGBA(o) {
  var rgb = snapHexChannel(o.r) + ',' + snapHexChannel(o.g) + ',' + snapHexChannel(o.b);
  return o.a < 1 ?
    'rgba(' + rgb + ',' + snapAlpha(o.a) + ')' :
    'rgb(' + rgb + ')';
}

function snapAlpha(a) {
  a = +a || 0;
  a = Math.round(a * 1000) / 1000; // round to thousandths
  return utils.clamp(a, 0, 1);
}

function snapHexChannel(arg) {
  return Math.round(utils.clamp(+arg || 0, 0, 255));
}

// arg: should be number in 0-255 range
function formatHexChannel(arg) {
  return snapHexChannel(arg).toString(16).padStart(2, '0');
}

// returns {r, g, b} object
function parseHexColor(str) {
  var hex = hexRxp.exec(str)[1];
  if (hex.length == 3 || hex.length == 4) {
    hex = hex.split('').map(function(c) { return c + c; });
  }
  if (hex.length != 6 && hex.length != 8) return null;
  return {
    r: parseInt(hex.substr(0, 2), 16),
    g: parseInt(hex.substr(2, 2), 16),
    b: parseInt(hex.substr(4, 2), 16),
    a: hex.length == 8 ? parseInt(hex.substr(7, 2), 16) / 255 : 1
  };
}

function blend(a, b) {
  var colors, weights, args;
  if (Array.isArray(a)) {
    colors = a;
    weights = b;
  } else {
    colors = [];
    weights = [];
    args = Array.from(arguments);
    for (var i=0; i<args.length; i+= 2) {
      colors.push(args[i]);
      weights.push(args[i + 1]);
    }
  }
  weights = normalizeWeights(weights);
  if (!weights) return '#eee';
  var blended = colors.reduce(function(memo, col, i) {
    var rgb = validateColor(col) && parseColor(col);
    var w = +weights[i] || 0;
    memo.r += rgb.r * w;
    memo.g += rgb.g * w;
    memo.b += rgb.b * w;
    return memo;
  }, {r: 0, g: 0, b: 0});
  return formatColor(blended);
}


function normalizeWeights(weights) {
  var sum = utils.sum(weights);
  if (sum > 0 === false) {
    return null;
  }
  return weights.map(function(w) {
    return w / sum;
  });
}

function cleanExpression(exp) {
  // workaround for problem in GNU Make v4: end-of-line backslashes inside
  // quoted strings are left in the string (other shell environments remove them)
  return exp.replace(/\\\n/g, ' ');
}

function addFeatureExpressionUtils(env) {
  Object.assign(env, {
    round: roundToDigits2,
    int_median: interpolated_median,
    sprintf: utils.format,
    blend: blend
  });
}

// piecewise linear interpolation (for a special project)
function interpolated_median(counts, breaks) {
  if (!counts || !breaks || counts.length != breaks.length - 1) return null;
  var total = utils.sum(counts);
  var medianIdx = Math.floor(total / 2);
  var lowerCount = 0, upperCount, lowerValue, upperValue, t;
  for (var i=1; i<breaks.length; i++) {
    lowerValue = breaks[i-1];
    upperValue = breaks[i];
    upperCount = lowerCount + counts[i-1];
    if (medianIdx <= upperCount) {
      t = (medianIdx - lowerCount) / (upperCount - lowerCount);
      return lowerValue + t * (upperValue - lowerValue);
    }
    lowerCount = upperCount;
  }
  return null;
}

function addGetters(obj, getters) {
  Object.keys(getters).forEach(function(name) {
    var val = getters[name];
    var o = typeof val == 'function' ?
      {get: val} :
      {value: val, writable: false};
    Object.defineProperty(obj, name, o);
  });
}

function simplifyPolygonFast(shp, arcs, dist) {
  if (!shp || !dist) return null;
  var xx = [],
      yy = [],
      nn = [],
      shp2 = [];

  shp.forEach(function(path) {
    var count = simplifyPathFast(path, arcs, dist, xx, yy);
    while (count < 4 && count > 0) {
      xx.pop();
      yy.pop();
      count--;
    }
    if (count > 0) {
      shp2.push([nn.length]);
      nn.push(count);
    }
  });
  return {
    shape: shp2.length > 0 ? shp2 : null,
    arcs: new ArcCollection(nn, xx, yy)
  };
}

function simplifyPathFast(path, arcs, dist, xx, yy) {
  var iter = arcs.getShapeIter(path),
      count = 0,
      prevX, prevY, x, y;
  while (iter.hasNext()) {
    x = iter.x;
    y = iter.y;
    if (count === 0 || geom.distance2D(x, y, prevX, prevY) > dist) {
      xx.push(x);
      yy.push(y);
      prevX = x;
      prevY = y;
      count++;
    }
  }
  if (x != prevX || y != prevY) {
    xx.push(x);
    yy.push(y);
    count++;
  }
  return count;
}

// Find a point inside a polygon and located away from the polygon edge
// Method:
// - get the largest ring of the polygon
// - get an array of x-values distributed along the horizontal extent of the ring
// - for each x:
//     intersect a vertical line with the polygon at x
//     find midpoints of each intersecting segment
// - for each midpoint:
//     adjust point vertically to maximize weighted distance from polygon edge
// - return the adjusted point having the maximum weighted distance from the edge
//
// (distance is weighted to slightly favor points near centroid)
//
function findAnchorPoint(shp, arcs) {
  var maxPath = shp && geom.getMaxPath(shp, arcs),
      pathBounds = maxPath && arcs.getSimpleShapeBounds(maxPath),
      thresh, simple;
  if (!pathBounds || !pathBounds.hasBounds() || pathBounds.area() === 0) {
    return null;
  }
  // Optimization: quickly simplify using a relatively small distance threshold.
  // (testing multiple candidate points can be very slow for large and detailed
  //   polgons; simplification alleviates this)
  // Caveat: In rare cases this could cause poor point placement, e.g. if
  //   simplification causes small holes to be removed.
  thresh = Math.sqrt(pathBounds.area()) * 0.01;
  simple = simplifyPolygonFast(shp, arcs, thresh);
  if (!simple.shape) {
    return null; // collapsed shape
  }
  return findAnchorPoint2(simple.shape, simple.arcs);
}

// Assumes: shp is a polygon with at least one space-enclosing ring
function findAnchorPoint2(shp, arcs) {
  var maxPath = geom.getMaxPath(shp, arcs);
  var pathBounds = arcs.getSimpleShapeBounds(maxPath);
  var centroid = geom.getPathCentroid(maxPath, arcs);
  var weight = getPointWeightingFunction(centroid, pathBounds);
  var area = geom.getPlanarPathArea(maxPath, arcs);
  var hrange, lbound, rbound, focus, htics, hstep, p, p2;

  // Limit test area if shape is simple and squarish
  if (shp.length == 1 && area * 1.2 > pathBounds.area()) {
    htics = 5;
    focus = 0.2;
  } else if (shp.length == 1 && area * 1.7 > pathBounds.area()) {
    htics = 7;
    focus = 0.4;
  } else {
    htics = 11;
    focus = 0.5;
  }
  hrange = pathBounds.width() * focus;
  lbound = centroid.x - hrange / 2;
  rbound = lbound + hrange;
  hstep = hrange / htics;

  // Find a best-fit point
  p = probeForBestAnchorPoint(shp, arcs, lbound, rbound, htics, weight);
  if (!p) {
    verbose("[points inner] failed, falling back to centroid");
   p = centroid;
  } else {
    // Look for even better fit close to best-fit point
    p2 = probeForBestAnchorPoint(shp, arcs, p.x - hstep / 2,
        p.x + hstep / 2, 2, weight);
    if (p2.distance > p.distance) {
      p = p2;
    }
  }
  return p;
}

function getPointWeightingFunction(centroid, pathBounds) {
  // Get a factor for weighting a candidate point
  // Points closer to the centroid are slightly preferred
  var referenceDist = Math.max(pathBounds.width(), pathBounds.height()) / 2;
  return function(x, y) {
    var offset = geom.distance2D(centroid.x, centroid.y, x, y);
    return 1 - Math.min(0.6 * offset / referenceDist, 0.25);
  };
}

function findAnchorPointCandidates(shp, arcs, xx) {
  var ymin = arcs.getBounds().ymin - 1;
  return xx.reduce(function(memo, x) {
    var cands = findHitCandidates(x, ymin, shp, arcs);
    return memo.concat(cands);
  }, []);
}

function probeForBestAnchorPoint(shp, arcs, lbound, rbound, htics, weight) {
  var tics = getInnerTics(lbound, rbound, htics);
  var interval = (rbound - lbound) / htics;
  // Get candidate points, distributed along x-axis
  var candidates = findAnchorPointCandidates(shp, arcs, tics);
  var bestP, adjustedP, candP;

  // Sort candidates so points at the center of longer segments are tried first
  candidates.forEach(function(p) {
    p.interval *= weight(p.x, p.y);
  });
  candidates.sort(function(a, b) {
    return b.interval - a.interval;
  });

  for (var i=0; i<candidates.length; i++) {
    candP = candidates[i];
    // Optimization: Stop searching if weighted half-segment length of remaining
    //   points is less than the weighted edge distance of the best candidate
    if (bestP && bestP.distance > candP.interval) {
      break;
    }
    adjustedP = getAdjustedPoint(candP.x, candP.y, shp, arcs, interval, weight);

    if (!bestP || adjustedP.distance > bestP.distance) {
      bestP = adjustedP;
    }
  }
  return bestP;
}

// [x, y] is a point assumed to be inside a polygon @shp
// Try to move the point farther from the polygon edge
function getAdjustedPoint(x, y, shp, arcs, vstep, weight) {
  var p = {
    x: x,
    y: y,
    distance: geom.getPointToShapeDistance(x, y, shp, arcs) * weight(x, y)
  };
  scanForBetterPoint(p, shp, arcs, vstep, weight); // scan up
  scanForBetterPoint(p, shp, arcs, -vstep, weight); // scan down
  return p;
}

// Try to find a better-fit point than @p by scanning vertically
// Modify p in-place
function scanForBetterPoint(p, shp, arcs, vstep, weight) {
  var x = p.x,
      y = p.y,
      dmax = p.distance,
      d;

  while (true) {
    y += vstep;
    d = geom.getPointToShapeDistance(x, y, shp, arcs) * weight(x, y);
    // overcome vary small local minima
    if (d > dmax * 0.90 && geom.testPointInPolygon(x, y, shp, arcs)) {
      if (d > dmax) {
        p.distance = dmax = d;
        p.y = y;
      }
    } else {
      break;
    }
  }
}

// Return array of points at the midpoint of each line segment formed by the
//   intersection of a vertical ray at [x, y] and a polygon shape
function findHitCandidates(x, y, shp, arcs) {
  var yy = findRayShapeIntersections(x, y, shp, arcs);
  var cands = [], y1, y2, interval;

  // sorting by y-coord organizes y-intercepts into interior segments
  utils.genericSort(yy);
  for (var i=0; i<yy.length; i+=2) {
    y1 = yy[i];
    y2 = yy[i+1];
    interval = (y2 - y1) / 2;
    if (interval > 0) {
      cands.push({
        y: (y1 + y2) / 2,
        x: x,
        interval: interval
      });
    }
  }
  return cands;
}

// Return array of y-intersections between vertical ray with origin at [x, y]
//   and a polygon
function findRayShapeIntersections(x, y, shp, arcs) {
  if (!shp) return [];
  return shp.reduce(function(memo, path) {
    var yy = findRayRingIntersections(x, y, path, arcs);
    return memo.concat(yy);
  }, []);
}

// Return array of y-intersections between vertical ray and a polygon ring
function findRayRingIntersections(x, y, path, arcs) {
  var yints = [];
  forEachSegmentInPath(path, arcs, function(a, b, xx, yy) {
    var result = geom.getRayIntersection(x, y, xx[a], yy[a], xx[b], yy[b]);
    if (result > -Infinity) {
      yints.push(result);
    }
  });
  // Ignore odd number of intersections -- probably caused by a ray that touches
  //   but doesn't cross the ring
  // TODO: improve method to handle edge case with two touches and no crosses.
  if (yints.length % 2 === 1) {
    yints = [];
  }
  return yints;
}

// TODO: find better home + name for this
function getInnerTics(min, max, steps) {
  var range = max - min,
      step = range / (steps + 1),
      arr = [];
  for (var i = 1; i<=steps; i++) {
    arr.push(min + step * i);
  }
  return arr;
}

// Returns a function for calculating the percentage of a shape's perimeter by length that
// is composed of inner (shared) boundaries
function getInnerPctCalcFunction(arcs, shapes) {
  var calcSegLen = arcs.isPlanar() ? geom.distance2D : geom.greatCircleDistance;
  var arcIndex = new ArcTopologyIndex(arcs, shapes);
  var outerLen, innerLen, arcLen; // temp variables

  return function(shp) {
    outerLen = 0;
    innerLen = 0;
    if (shp) shp.forEach(procRing);
    return innerLen > 0 ? innerLen / (innerLen + outerLen) : 0;
  };

  function procRing(ids) {
    ids.forEach(procArc);
  }

  function procArc(id) {
    arcLen = 0;
    arcs.forEachArcSegment(id, addSegLen);
    if (arcIndex.isInnerArc(id)) {
      innerLen += arcLen;
    } else {
      outerLen += arcLen;
    }
  }

  function addSegLen(i, j, xx, yy) {
    arcLen += calcSegLen(xx[i], yy[i], xx[j], yy[j]);
  }
}

function ArcTopologyIndex(arcs, shapes) {
  var index = new Uint8Array(arcs.size());
  forEachArcId(shapes, function(arcId) {
    if (arcId < 0) index[~arcId] |= 2;
    else (index[arcId] |= 1);
  });

  this.isInnerArc = function(arcId) {
    var i = absArcId(arcId);
    return index[i] == 3;
  };
}

// Returns an object representing a layer in a JS expression
function getLayerProxy(lyr, arcs) {
  var obj = {};
  var records = lyr.data ? lyr.data.getRecords() : null;
  var getters = {
    name: lyr.name,
    data: records,
    type: lyr.geometry_type,
    size: getFeatureCount(lyr),
    empty: getFeatureCount(lyr) === 0,
    bbox: getBBoxGetter(obj, lyr, arcs)
  };
  addGetters(obj, getters);
  obj.field_exists = function(name) {
    return lyr.data && lyr.data.fieldExists(name) ? true : false;
  };
  obj.field_type = function(name) {
    return lyr.data && getColumnType(name, lyr.data.getRecords()) || null;
  };
  obj.field_includes = function(name, val) {
    if (!lyr.data) return false;
    return lyr.data.getRecords().some(function(rec) {
      return rec && (rec[name] === val);
    });
  };
  return obj;
}

function addLayerGetters(ctx, lyr, arcs) {
  var layerProxy;
  addGetters(ctx, {
    layer_name: lyr.name || '', // consider removing this
    layer: function() {
      // init on first access (to avoid overhead if not used)
      if (!layerProxy) layerProxy = getLayerProxy(lyr, arcs);
      return layerProxy;
    }
  });
  return ctx;
}

function getBBoxGetter(obj, lyr, arcs) {
  var bbox;
  return function() {
    if (!bbox) {
      bbox = getBBox(lyr, arcs);
    }
    return bbox;
  };
}

function getBBox(lyr, arcs) {
  var bounds = getLayerBounds(lyr, arcs); // TODO: avoid this overhead if bounds is not used
  if (!bounds) return null;
  var bbox = bounds.toArray();
  Object.assign(bbox, {
    cx: bounds.centerX(),
    cy: bounds.centerY(),
    height: bounds.height(),
    width: bounds.width(),
    left: bounds.xmin,
    bottom: bounds.ymin,
    top: bounds.ymax,
    right: bounds.xmax
  });
  return bbox;
}

// Returns a function to return a feature proxy by id
// (the proxy appears as "this" or "$" in a feature expression)
function initFeatureProxy(lyr, arcs, optsArg) {
  var opts = optsArg || {},
      hasPoints = layerHasPoints(lyr),
      hasPaths = arcs && layerHasPaths(lyr),
      _records = lyr.data ? lyr.data.getRecords() : null,
      _isPlanar = hasPaths && arcs.isPlanar(),
      ctx = {},
      calcInnerPct,
      _bounds, _centroid, _innerXY, _xy, _ids, _id;

  // all contexts have this.id and this.layer
  addGetters(ctx, {
    id: function() { return _id; }
  });
  addLayerGetters(ctx, lyr, arcs);

  if (opts.geojson_editor) {
    Object.defineProperty(ctx, 'geojson', {
      set: function(o) {
        opts.geojson_editor.set(o, _id);
      },
      get: function() {
        return opts.geojson_editor.get(_id);
      }
    });
  }

  if (_records) {
    // add r/w member "properties"
    Object.defineProperty(ctx, 'properties',
      {set: function(obj) {
        if (utils.isObject(obj)) {
          _records[_id] = obj;
        } else {
          stop("Can't assign non-object to $.properties");
        }
      }, get: function() {
        var rec = _records[_id];
        if (!rec) {
          rec = _records[_id] = {};
        }
        return rec;
      }});
  }

  if (hasPaths) {
    addGetters(ctx, {
      // TODO: count hole/s + containing ring as one part
      partCount: function() {
        return _ids ? _ids.length : 0;
      },
      isNull: function() {
        return ctx.partCount === 0;
      },
      bounds: function() {
        return shapeBounds().toArray();
      },
      height: function() {
        return shapeBounds().height();
      },
      width: function() {
        return shapeBounds().width();
      }
    });

    if (lyr.geometry_type == 'polyline') {
      addGetters(ctx, {
        'length': function() {
          return geom.getShapePerimeter(_ids, arcs);
        }
      });
    }

    if (lyr.geometry_type == 'polygon') {
      addGetters(ctx, {
        area: function() {
          return _isPlanar ? ctx.planarArea : geom.getSphericalShapeArea(_ids, arcs);
        },
        // area2: function() {
        //   return _isPlanar ? ctx.planarArea : geom.getSphericalShapeArea(_ids, arcs, WGS84.SEMIMINOR_RADIUS);
        // },
        // area3: function() {
        //   return _isPlanar ? ctx.planarArea : geom.getSphericalShapeArea(_ids, arcs, WGS84.AUTHALIC_RADIUS);
        // },
        perimeter: function() {
          return geom.getShapePerimeter(_ids, arcs);
        },
        compactness: function() {
          return geom.calcPolsbyPopperCompactness(ctx.area, ctx.perimeter);
        },
        planarArea: function() {
          return geom.getPlanarShapeArea(_ids, arcs);
        },
        innerPct: function() {
          if (!calcInnerPct) calcInnerPct = getInnerPctCalcFunction(arcs, lyr.shapes);
          return calcInnerPct(_ids);
        },
        originalArea: function() {
          // Get area
          var i = arcs.getRetainedInterval(),
              area;
          arcs.setRetainedInterval(0);
          area = ctx.area;
          arcs.setRetainedInterval(i);
          return area;
        },
        centroidX: function() {
          var p = centroid();
          return p ? p.x : null;
        },
        centroidY: function() {
          var p = centroid();
          return p ? p.y : null;
        },
        innerX: function() {
          var p = innerXY();
          return p ? p.x : null;
        },
        innerY: function() {
          var p = innerXY();
          return p ? p.y : null;
        }
      });
    }

  } else if (hasPoints) {
    // TODO: add functions like bounds, isNull, pointCount
    Object.defineProperty(ctx, 'coordinates',
      {set: function(obj) {
        if (!obj || utils.isArray(obj)) {
          lyr.shapes[_id] = obj || null;
        } else {
          stop("Can't assign non-array to $.coordinates");
        }
      }, get: function() {
        return lyr.shapes[_id] || null;
      }});
    Object.defineProperty(ctx, 'x', {
      get: function() { xy(); return _xy ? _xy[0] : null;},
      set: function(val) { xy(); if (_xy) _xy[0] = Number(val);}
    });
    Object.defineProperty(ctx, 'y', {
      get: function() { xy(); return _xy ? _xy[1] : null;},
      set: function(val) { xy(); if (_xy) _xy[1] = Number(val);}
    });
  }

  function xy() {
    var shape = lyr.shapes[_id];
    if (!_xy) {
      _xy = shape && shape[0] || null;
    }
  }

  function centroid() {
    _centroid = _centroid || geom.getShapeCentroid(_ids, arcs);
    return _centroid;
  }

  function innerXY() {
    _innerXY = _innerXY || findAnchorPoint(_ids, arcs);
    return _innerXY;
  }

  function shapeBounds() {
    if (!_bounds) {
      _bounds = arcs.getMultiShapeBounds(_ids);
    }
    return _bounds;
  }

  return function(id) {
    _id = id;
    // reset stored values
    if (hasPaths) {
      _bounds = null;
      _centroid = null;
      _innerXY = null;
      _ids = lyr.shapes[id];
    }
    if (hasPoints) {
      _xy = null;
    }
    return ctx;
  };
}

function compileFeatureExpression(rawExp, lyr, arcs, opts_) {
  var opts = utils.extend({}, opts_),
      exp = cleanExpression(rawExp || ''),
      mutable = !opts.no_assign, // block assignment expressions
      vars = getAssignedVars(exp),
      func, records;

  if (mutable && vars.length > 0 && !lyr.data) {
    initDataTable(lyr);
  }

  if (!mutable) {
    // protect global object from assigned values
    opts.context = opts.context || {};
    nullifyUnsetProperties(vars, opts.context);
  }

  records = lyr.data ? lyr.data.getRecords() : [];
  func = getExpressionFunction(exp, lyr, arcs, opts);

  // @destRec (optional) substitute for records[recId] (used by -calc)
  return function(recId, destRec) {
    var record;
    if (destRec) {
      record = destRec;
    } else {
      record = records[recId] || (records[recId] = {});
    }

    // initialize new fields to null so assignments work
    if (mutable) {
      nullifyUnsetProperties(vars, record);
    }
    return func(record, recId);
  };
}

// Return array of variables on the left side of assignment operations
// @hasDot (bool) Return property assignments via dot notation
function getAssignedVars(exp, hasDot) {
  var rxp = /[a-z_$][.a-z0-9_$]*(?= *=[^>=])/ig; // ignore arrow functions and comparisons
  var matches = exp.match(rxp) || [];
  var f = function(s) {
    var i = s.indexOf('.');
    return hasDot ? i > -1 : i == -1;
  };
  var vars = utils.uniq(matches.filter(f));
  return vars;
}

function compileExpressionToFunction(exp, opts) {
  // $$ added to avoid duplication with data field variables (an error condition)
  var functionBody, func;
  if (opts.returns) {
    // functionBody = 'return ' + functionBody;
    functionBody = 'var $$retn = ' + exp + '; return $$retn;';
  } else {
    functionBody = exp;
  }
  functionBody = 'with($$env){with($$record){ ' + functionBody + '}}';
  try {
    func = new Function('$$record,$$env',  functionBody);
  } catch(e) {
    // if (opts.quiet) throw e;
    stop(e.name, 'in expression [' + exp + ']');
  }
  return func;
}

function getExpressionFunction(exp, lyr, arcs, opts) {
  var getFeatureById = initFeatureProxy(lyr, arcs, opts);
  var layerOnlyProxy = addLayerGetters({}, lyr, arcs);
  var ctx = getExpressionContext(lyr, opts.context, opts);
  var func = compileExpressionToFunction(exp, opts);
  return function(rec, i) {
    var val;
    // Assigning feature/layer proxy to '$' -- maybe this should be removed,
    // since it is also exposed as "this".
    // (kludge) i is undefined in calc expressions ... we still
    //   may need layer data (but not single-feature data)
    ctx.$ = i >= 0 ? getFeatureById(i) : layerOnlyProxy;
    ctx._ = ctx; // provide access to functions when masked by variable names
    ctx.d = rec || null; // expose data properties a la d3 (also exposed as this.properties)
    try {
      val = func.call(ctx.$, rec, ctx);
    } catch(e) {
      // if (opts.quiet) throw e;
      stop(e.name, "in expression [" + exp + "]:", e.message);
    }
    return val;
  };
}

function nullifyUnsetProperties(vars, obj) {
  for (var i=0; i<vars.length; i++) {
    if (vars[i] in obj === false) {
      obj[vars[i]] = null;
    }
  }
}

function getExpressionContext(lyr, mixins, opts) {
  var defs = getStashedVar('defs');
  var env = getBaseContext();
  var ctx = {};
  var fields = lyr.data ? lyr.data.getFields() : [];
  opts = opts || {};
  addFeatureExpressionUtils(env); // mix in round(), sprintf(), etc.
  if (fields.length > 0) {
    // default to null values, so assignments to missing data properties
    // are applied to the data record, not the global object
    nullifyUnsetProperties(fields, env);
  }
  // Add global 'defs' to the expression context
  mixins = utils.defaults(mixins || {}, defs);
  // also add defs as 'global' object
  env.global = defs;
  Object.keys(mixins).forEach(function(key) {
    // Catch name collisions between data fields and user-defined functions
    var d = Object.getOwnPropertyDescriptor(mixins, key);
    if (d.get) {
      // copy accessor function from mixins to context
      Object.defineProperty(ctx, key, {get: d.get}); // copy getter function to context
    } else {
      // copy regular property from mixins to context, but make it non-writable
      Object.defineProperty(ctx, key, {value: mixins[key]});
    }
  });
  // make context properties non-writable, so they can't be replaced by an expression
  return Object.keys(env).reduce(function(memo, key) {
    if (key in memo) {
      // property has already been set (probably by a mixin, above): skip
      // "no_warn" option used in calc= expressions
      if (!opts.no_warn) {
        if (typeof memo[key] == 'function' && fields.indexOf(key) > -1) {
          message('Warning: ' + key + '() function is hiding a data field with the same name');
        } else {
          message('Warning: "' + key + '" has multiple definitions');
        }
      }
    } else {
      Object.defineProperty(memo, key, {value: env[key]}); // writable: false is default
    }
    return memo;
  }, ctx);
}

function getBaseContext() {
  // Mask global properties (is this effective/worth doing?)
  var obj = {globalThis: void 0}; // some globals are not iterable
  (function() {
    for (var key in this) {
      obj[key] = void 0;
    }
  }());
  obj.console = console;
  return obj;
}

function getMode(values) {
  var data = getModeData(values);
  return data.modes[0];
}

function getValueCountData(values) {
  var uniqValues = [],
      uniqIndex = {},
      counts = [];
  var i, val;
  for (i=0; i<values.length; i++) {
    val = values[i];
    if (val in uniqIndex === false) {
      uniqIndex[val] = uniqValues.length;
      uniqValues.push(val);
      counts.push(1);
    } else {
      counts[uniqIndex[val]]++;
    }
  }
  return {
    values: uniqValues,
    counts: counts
  };
}

function getMaxValue(values) {
  var max = -Infinity;
  var i;
  for (i=0; i<values.length; i++) {
    if (values[i] > max) max = values[i];
  }
  return max;
}

function getCountDataSummary(o) {
  var counts = o.counts;
  var values = o.values;
  var maxCount = counts.length > 0 ? getMaxValue(counts) : 0;
  var nextCount = 0;
  var modes = [];
  var i, count;
  for (i=0; i<counts.length; i++) {
    count = counts[i];
    if (count === maxCount) {
      modes.push(values[i]);
    } else if (count > nextCount) {
      nextCount = count;
    }
  }
  return {
    modes: modes,
    margin: modes.length > 1 ? 0 : maxCount - nextCount,
    count: maxCount
  };
}

function getModeData(values, verbose) {
  var counts = getValueCountData(values);
  var modes = getCountDataSummary(counts);
  if (verbose) {
    modes.counts = counts.counts;
    modes.values = counts.values;
  }
  return modes;
}

function compileCalcExpression(lyr, arcs, exp) {
  var rowNo = 0, colNo = 0, cols = [];
  var ctx1 = { // context for first phase (capturing values for each feature)
        count: assign,
        sum: captureNum,
        sums: capture,
        average: captureNum,
        mean: captureNum,
        median: captureNum,
        quantile: captureNum,
        iqr: captureNum,
        quartile1: captureNum,
        quartile2: captureNum,
        quartile3: captureNum,
        min: captureNum,
        max: captureNum,
        mode: capture,
        collect: capture,
        first: assignOnce,
        every: every,
        some: some,
        last: assign
      },
      ctx2 = { // context for second phase (calculating results)
        count: wrap(function() {return rowNo;}, 0),
        sum: wrap(utils.sum, 0),
        sums: wrap(sums),
        median: wrap(utils.findMedian),
        quantile: wrap2(utils.findQuantile),
        iqr: wrap(function(arr) {
          return utils.findQuantile(arr, 0.75) - utils.findQuantile(arr, 0.25);
        }),
        quartile1: wrap(function(arr) { return utils.findQuantile(arr, 0.25); }),
        quartile2: wrap(utils.findMedian),
        quartile3: wrap(function(arr) { return utils.findQuantile(arr, 0.75); }),
        min: wrap(min),
        max: wrap(max),
        average: wrap(utils.mean),
        mean: wrap(utils.mean),
        mode: wrap(getMode),
        collect: wrap(pass),
        first: wrap(pass),
        every: wrap(pass, false),
        some: wrap(pass, false),
        last: wrap(pass)
      },
      len = getFeatureCount(lyr),
      calc1, calc2;

  if (lyr.geometry_type) {
    // add functions related to layer geometry (e.g. for subdivide())
    ctx1.width = ctx1.height = noop;
    ctx2.width = function() {return getLayerBounds(lyr, arcs).width();};
    ctx2.height = function() {return getLayerBounds(lyr, arcs).height();};
  }

  calc1 = compileFeatureExpression(exp, lyr, arcs, {context: ctx1,
      no_assign: true, no_warn: true});
  // changed data-only layer to full layer to expose layer geometry, etc
  // (why not do this originally?)
  // calc2 = compileFeatureExpression(exp, {data: lyr.data}, null,
  //     {returns: true, context: ctx2, no_warn: true});
  calc2 = compileFeatureExpression(exp, lyr, arcs,
      {returns: true, context: ctx2, no_warn: true});

  // @destRec: optional destination record for assignments
  return function(ids, destRec) {
    var result;
    // phase 1: capture data
    if (ids) procRecords(ids);
    else procAll();
    // phase 2: calculate
    result = calc2(undefined, destRec);
    reset();
    return result;
  };

  function pass(o) {return o;}

  function max(arr) {
    return utils.getArrayBounds(arr).max;
  }

  function sums(arr) {
    var n = arr && arr.length ? arr[0].length : 0;
    var output = utils.initializeArray(Array(n), 0);
    arr.forEach(function(arr) {
      if (!arr || !arr.length) return;
      for (var i=0; i<n; i++) {
        output[i] += +arr[i] || 0;
      }
    });
    return output;
  }

  function min(arr) {
    return utils.getArrayBounds(arr).min;
  }

  // process captured data, or return nodata value if no records have been captured
  function wrap(proc, nullVal) {
    var nodata = arguments.length > 1 ? nullVal : null;
    return function() {
      var c = colNo++;
      return rowNo > 0 ? proc(cols[c]) : nodata;
    };
  }

  function wrap2(proc) {
    return function(arg1, arg2) {
      var c = colNo++;
      return rowNo > 0 ? proc(cols[c], arg2) : null;
    };
  }

  function procAll() {
    for (var i=0; i<len; i++) {
      procRecord(i);
    }
  }

  function procRecords(ids) {
    ids.forEach(procRecord);
  }

  function procRecord(i) {
    if (i < 0 || i >= len) error("Invalid record index");
    calc1(i);
    rowNo++;
    colNo = 0;
  }

  function noop() {}

  function reset() {
    rowNo = 0;
    colNo = 0;
    cols = [];
  }

  function captureNum(val) {
    if (isNaN(val) && val) { // accepting falsy values (be more strict?)
      stop("Expected a number, received:", val);
    }
    return capture(val);
  }

  function assignOnce(val) {
    if (rowNo === 0) cols[colNo] = val;
    colNo++;
    return val;
  }

  function every(val) {
    val = !!val;
    cols[colNo] = rowNo === 0 ? val : cols[colNo] && val;
    colNo++;
  }

  function some(val) {
    val = !!val;
    cols[colNo] = cols[colNo] || val;
    colNo++;
  }

  function assign(val) {
    cols[colNo++] = val;
    return val;
  }
  /*
  function captureArr(val) {
    capture(val);
    return [];
  }
  */

  function capture(val) {
    var col;
    if (rowNo === 0) {
      cols[colNo] = [];
    }
    col = cols[colNo];
    if (col.length != rowNo) {
      // make sure all functions are called each time
      // (if expression contains a condition, it will throw off the calculation)
      // TODO: allow conditions
      stop("Evaluation failed");
    }
    col.push(val);
    colNo++;
    return val;
  }
}

// get function that returns an object containing calculated values
function getJoinCalc(src, exp) {
  var calc = compileCalcExpression({data: src}, null, exp);
  return function(ids, destRec) {
    if (!ids) ids = [];
    calc(ids, destRec);
  };
}

// Return a function to convert indexes of original features into indexes of grouped features
// Uses categorical classification (a different id for each unique combination of values)
function getCategoryClassifier(fields, data) {
  if (!fields || fields.length === 0) return function() {return 0;};
  fields.forEach(function(f) {
    requireDataField(data, f);
  });
  var index = {},
      count = 0,
      records = data.getRecords(),
      getKey = getMultiFieldKeyFunction(fields);
  return function(i) {
    var key = getKey(records[i]);
    if (key in index === false) {
      index[key] = count++;
    }
    return index[key];
  };
}

function getMultiFieldKeyFunction(fields) {
  return fields.reduce(function(partial, field) {
    // TODO: consider using JSON.stringify for fields that contain objects
    var strval = function(rec) {return String(rec[field]);};
    return partial ? function(rec) {return partial(rec) + '~~' + strval(rec);} : strval;
  }, null);
}

// Performs many-to-one data record aggregation on an array of data records
// Returns an array of data records for a set of aggregated features
//
// @records input records
// @getGroupId()  converts input record id to id of aggregated record
//
function aggregateDataRecords(records, getGroupId, opts) {
  var groups = groupIds(getGroupId, records.length);
  return aggregateDataRecords2(records, groups, opts);
}

function aggregateDataRecords2(records, groups, opts) {
  var sumFields = opts.sum_fields || [],
      copyFields = opts.copy_fields || [],
      calc;

  if (opts.fields) {
    copyFields = copyFields.concat(opts.fields);
  }

  if (opts.calc) {
    calc = getJoinCalc(new DataTable(records), opts.calc);
  }

  function sum(field, group) {
    var tot = 0, rec;
    for (var i=0; i<group.length; i++) {
      rec = records[group[i]];
      tot += rec && rec[field] || 0;
    }
    return tot;
  }

  return groups.map(function(group) {
    var rec = {},
        j, first;
    group = group || [];
    first = records[group[0]];
    for (j=0; j<sumFields.length; j++) {
      rec[sumFields[j]] = sum(sumFields[j], group);
    }
    for (j=0; j<copyFields.length; j++) {
      rec[copyFields[j]] = first ? first[copyFields[j]] : null;
    }
    if (calc) {
      calc(group, rec);
    }
    return rec;
  });
}

// Returns array containing groups of feature indexes
// @getId() (function) converts feature index into group index
// @n number of features
//
function groupIds(getId, n) {
  var groups = [], id;
  for (var i=0; i<n; i++) {
    id = getId(i);
    if (id in groups) {
      groups[id].push(i);
    } else {
      groups[id] = [i];
    }
  }
  return groups;
}

// @lyr: original undissolved layer
// @shapes: dissolved shapes
function composeDissolveLayer(lyr, shapes, getGroupId, opts) {
  var records = null;
  var lyr2;
  if (lyr.data) {
    records = aggregateDataRecords(lyr.data.getRecords(), getGroupId, opts);
    // replace missing shapes with nulls
    for (var i=0, n=records.length; i<n; i++) {
      if (shapes && !shapes[i]) {
        shapes[i] = null;
      }
    }
  }
  lyr2 = {
    name: opts.no_replace ? null : lyr.name,
    shapes: shapes,
    data: records ? new DataTable(records) : null,
    geometry_type: lyr.geometry_type
  };
  if (!opts.silent) {
    printDissolveMessage(lyr, lyr2);
  }
  return lyr2;
}

function printDissolveMessage(pre, post) {
  var n1 = getFeatureCount(pre),
      n2 = getFeatureCount(post),
      msg = utils.format('Dissolved %,d feature%s into %,d feature%s',
        n1, utils.pluralSuffix(n1), n2,
        utils.pluralSuffix(n2));
  message(msg);
}

// Maps tile ids to shape ids (both are non-negative integers). Supports
//    one-to-many mapping (a tile may belong to multiple shapes)
// Also maps shape ids to tile ids. A shape may contain multiple tiles
// Also supports 'flattening' -- removing one-to-many tile-shape mappings by
//    removing all but one shape from a tile.
// Supports one-to-many mapping
function TileShapeIndex(mosaic, opts) {
  // indexes for mapping tile ids to shape ids
  var singleIndex = new Int32Array(mosaic.length);
  utils.initializeArray(singleIndex, -1);
  var multipleIndex = [];
  // index that maps shape ids to tile ids
  var shapeIndex = [];

  this.getTileIdsByShapeId = function(shapeId) {
    var ids = shapeIndex[shapeId];
    // need to filter out tile ids that have been set to -1 (indicating removal)
    return ids ? ids.filter(function(id) {return id >= 0;}) : [];
  };

  // assumes index has been flattened
  this.getShapeIdByTileId = function(id) {
    var shapeId = singleIndex[id];
    return shapeId >= 0 ? shapeId : -1;
  };

  // return ids of all shapes that include a tile
  this.getShapeIdsByTileId = function(id) {
    var singleId = singleIndex[id];
    if (singleId >= 0) {
      return [singleId];
    }
    if (singleId == -1) {
      return [];
    }
    return multipleIndex[id];
  };

  this.indexTileIdsByShapeId = function(shapeId, tileIds, weightFunction) {
    shapeIndex[shapeId] = [];
    for (var i=0; i<tileIds.length; i++) {
      indexShapeIdByTileId(shapeId, tileIds[i], weightFunction);
    }
  };

  // remove many-to-one tile=>shape mappings
  this.flatten = function() {
    multipleIndex.forEach(function(shapeIds, tileId) {
      flattenStackedTile(tileId);
    });
    multipleIndex = [];
  };

  this.getUnusedTileIds = function() {
    var ids = [];
    for (var i=0, n=singleIndex.length; i<n; i++) {
      if (singleIndex[i] == -1) ids.push(i);
    }
    return ids;
  };

  // used by gap fill; assumes that flatten() has been called
  this.addTileToShape = function(shapeId, tileId) {
    if (shapeId in shapeIndex === false || singleIndex[tileId] != -1) {
      error('Internal error');
    }
    singleIndex[tileId] = shapeId;
    shapeIndex[shapeId].push(tileId);
  };

  // add a shape id to a tile
  function indexShapeIdByTileId(shapeId, tileId, weightFunction) {
    var singleId = singleIndex[tileId];
    if (singleId != -1 && opts.flat) {
      // pick the best shape if we have a weight function
      if (weightFunction && weightFunction(shapeId) > weightFunction(singleId)) {
        // replace existing shape reference
        removeTileFromShape(tileId, singleId); // bottleneck when overlaps are many
        singleIndex[tileId] = singleId;
        singleId = -1;
      } else {
        // keep existing shape reference
        return;
      }
    }
    if (singleId == -1) {
      singleIndex[tileId] = shapeId;
    } else if (singleId == -2) {
      multipleIndex[tileId].push(shapeId);
    } else {
      multipleIndex[tileId] = [singleId, shapeId];
      singleIndex[tileId] = -2;
    }
    shapeIndex[shapeId].push(tileId);
  }


  function flattenStackedTile(tileId) {
    // TODO: select the best shape (using some metric)
    var shapeIds = multipleIndex[tileId];
    // if (!shapeIds || shapeIds.length > 1 === false) error('flattening error');
    var selectedId = shapeIds[0];
    var shapeId;
    singleIndex[tileId] = selectedId; // add shape to single index
    // remove tile from other stacked shapes
    for (var i=0; i<shapeIds.length; i++) {
      shapeId = shapeIds[i];
      if (shapeId != selectedId) {
        removeTileFromShape(tileId, shapeId);
      }
    }
  }

  function removeTileFromShape(tileId, shapeId) {
    var tileIds = shapeIndex[shapeId];
    for (var i=0; i<tileIds.length; i++) {
      if (tileIds[i] === tileId) {
        tileIds[i] = -1;
        break;
      }
    }
  }
}

// Returns a function that separates rings in a polygon into space-enclosing rings
// and holes. Also fixes self-intersections.
//
function getHoleDivider(nodes, spherical) {
  var split = getSelfIntersectionSplitter(nodes);
  // var split = internal.getSelfIntersectionSplitter_v1(nodes); console.log('split')

  return function(rings, cw, ccw) {
    var pathArea = spherical ? geom.getSphericalPathArea : geom.getPlanarPathArea;
    forEachShapePart(rings, function(ringIds) {
      var splitRings = split(ringIds);
      if (splitRings.length === 0) ;
      splitRings.forEach(function(ringIds, i) {
        var ringArea = pathArea(ringIds, nodes.arcs);
        if (ringArea > 0) {
          cw.push(ringIds);
        } else if (ringArea < 0) {
          ccw.push(ringIds);
        }
      });
    });
  };
}

// Identify intersecting segments in an ArcCollection
//
// To find all intersections:
// 1. Assign each segment to one or more horizontal stripes/bins
// 2. Find intersections inside each stripe
// 3. Concat and dedup
//
// Re-use buffer for temp data -- Chrome's gc starts bogging down
// if large buffers are repeatedly created.
var buf;
function getUint32Array(count) {
  var bytes = count * 4;
  if (!buf || buf.byteLength < bytes) {
    buf = new ArrayBuffer(bytes);
  }
  return new Uint32Array(buf, 0, count);
}

function findSegmentIntersections(arcs, optArg) {
  var opts = utils.extend({}, optArg),
      bounds = arcs.getBounds();
      // TODO: handle spherical bounds
      !arcs.isPlanar() &&
          geom.containsBounds(getWorldBounds(), bounds.toArray());
      var ymin = bounds.ymin,
      yrange = bounds.ymax - ymin,
      stripeCount = opts.stripes || calcSegmentIntersectionStripeCount(arcs),
      stripeSizes = new Uint32Array(stripeCount),
      stripeId = stripeCount > 1 && yrange > 0 ? multiStripeId : singleStripeId,
      i, j;

  if (opts.tolerance >= 0 === false) {
    // by default, use a small tolerance when detecting segment intersections
    // (intended to overcome the effects of floating point rounding errors in geometrical formulas)
    opts.tolerance = getHighPrecisionSnapInterval(bounds.toArray());
  }

  function multiStripeId(y) {
    return Math.floor((stripeCount-1) * (y - ymin) / yrange);
  }

  function singleStripeId(y) {return 0;}
  // Count segments in each stripe
  arcs.forEachSegment(function(id1, id2, xx, yy) {
    var s1 = stripeId(yy[id1]),
        s2 = stripeId(yy[id2]);
    while (true) {
      stripeSizes[s1] = stripeSizes[s1] + 2;
      if (s1 == s2) break;
      s1 += s2 > s1 ? 1 : -1;
    }
  });

  // Allocate arrays for segments in each stripe
  var stripeData = getUint32Array(utils.sum(stripeSizes)),
      offs = 0;
  var stripes = [];
  utils.forEach(stripeSizes, function(stripeSize) {
    var start = offs;
    offs += stripeSize;
    stripes.push(stripeData.subarray(start, offs));
  });
  // Assign segment ids to each stripe
  utils.initializeArray(stripeSizes, 0);

  arcs.forEachSegment(function(id1, id2, xx, yy) {
    var s1 = stripeId(yy[id1]),
        s2 = stripeId(yy[id2]),
        count, stripe;
    while (true) {
      count = stripeSizes[s1];
      stripeSizes[s1] = count + 2;
      stripe = stripes[s1];
      stripe[count] = id1;
      stripe[count+1] = id2;
      if (s1 == s2) break;
      s1 += s2 > s1 ? 1 : -1;
    }
  });

  // Detect intersections among segments in each stripe.
  var raw = arcs.getVertexData(),
      intersections = [],
      arr;
  for (i=0; i<stripeCount; i++) {
    arr = intersectSegments(stripes[i], raw.xx, raw.yy, opts);
    for (j=0; j<arr.length; j++) {
      intersections.push(arr[j]);
    }
  }
  return dedupIntersections(intersections, opts.unique ? getUniqueIntersectionKey : null);
}



function dedupIntersections(arr, keyFunction) {
  var index = {};
  var getKey = keyFunction || getIntersectionKey;
  return arr.filter(function(o) {
    var key = getKey(o);
    if (key in index) {
      return false;
    }
    index[key] = true;
    return true;
  });
}

// Get an indexable key from an intersection object
// Assumes that vertex ids of o.a and o.b are sorted
function getIntersectionKey(o) {
  return o.a.join(',') + ';' + o.b.join(',');
}

function getUniqueIntersectionKey(o) {
  return o.x + ',' + o.y;
}

// Alternate fast method
function calcSegmentIntersectionStripeCount(arcs) {
  var segs = arcs.getFilteredPointCount() - arcs.size();
  var stripes = Math.ceil(Math.pow(segs * 10, 0.6) / 40);
  return stripes > 0 ? stripes : 1;
}

// Find intersections among a group of line segments
//
// TODO: handle case where a segment starts and ends at the same point (i.e. duplicate coords);
//
// @ids: Array of indexes: [s0p0, s0p1, s1p0, s1p1, ...] where xx[sip0] <= xx[sip1]
// @xx, @yy: Arrays of x- and y-coordinates
//
function intersectSegments(ids, xx, yy, optsArg) {
  var lim = ids.length - 2,
      opts = optsArg || {},
      intersections = [],
      tolerance = opts.tolerance, // may be undefined
      s1p1, s1p2, s2p1, s2p2,
      s1p1x, s1p2x, s2p1x, s2p2x,
      s1p1y, s1p2y, s2p1y, s2p2y,
      hit, seg1, seg2, i, j;

  // Sort segments by xmin, to allow efficient exclusion of segments with
  // non-overlapping x extents.
  sortSegmentIds(xx, ids); // sort by ascending xmin

  i = 0;
  while (i < lim) {
    s1p1 = ids[i];
    s1p2 = ids[i+1];
    s1p1x = xx[s1p1];
    s1p2x = xx[s1p2];
    s1p1y = yy[s1p1];
    s1p2y = yy[s1p2];
    // count++;

    j = i;
    while (j < lim) {
      j += 2;
      s2p1 = ids[j];
      s2p1x = xx[s2p1];

      if (s1p2x < s2p1x) break; // x extent of seg 2 is greater than seg 1: done with seg 1
      //if (s1p2x <= s2p1x) break; // this misses point-segment intersections when s1 or s2 is vertical

      s2p1y = yy[s2p1];
      s2p2 = ids[j+1];
      s2p2x = xx[s2p2];
      s2p2y = yy[s2p2];

      // skip segments with non-overlapping y ranges
      if (s1p1y >= s2p1y) {
        if (s1p1y > s2p2y && s1p2y > s2p1y && s1p2y > s2p2y) continue;
      } else {
        if (s1p1y < s2p2y && s1p2y < s2p1y && s1p2y < s2p2y) continue;
      }

      // skip segments that are adjacent in a path (optimization)
      // TODO: consider if this eliminates some cases that should
      // be detected, e.g. spikes formed by unequal segments
      if (s1p1 == s2p1 || s1p1 == s2p2 || s1p2 == s2p1 || s1p2 == s2p2) {
        continue;
      }

      // test two candidate segments for intersection
      hit = geom.segmentIntersection(s1p1x, s1p1y, s1p2x, s1p2y,
          s2p1x, s2p1y, s2p2x, s2p2y, tolerance);
      if (hit) {
        seg1 = [s1p1, s1p2];
        seg2 = [s2p1, s2p2];
        intersections.push(formatIntersection(hit, seg1, seg2, xx, yy));
        if (hit.length == 4) {
          // two collinear segments may have two endpoint intersections
          intersections.push(formatIntersection(hit.slice(2), seg1, seg2, xx, yy));
        }
      }
    }
    i += 2;
  }
  return intersections;
}

function formatIntersection(xy, s1, s2, xx, yy) {
  var x = xy[0],
      y = xy[1],
      a, b;
  s1 = formatIntersectingSegment(x, y, s1[0], s1[1], xx, yy);
  s2 = formatIntersectingSegment(x, y, s2[0], s2[1], xx, yy);
  a = s1[0] < s2[0] ? s1 : s2;
  b = a == s1 ? s2 : s1;
  return {x: x, y: y, a: a, b: b};
}

// Receives:
//   x, y: coordinates of intersection
//   i, j: two segment endpoints, as indexes in xx and yy arrays
// Returns:
//   if x,y falls within the segment, returns ascending indexes
//   if x,y coincides with an endpoint, returns the id of that endpoint twice
function formatIntersectingSegment(x, y, i, j, xx, yy) {
  if (xx[i] == x && yy[i] == y) {
    return [i, i];
  }
  if (xx[j] == x && yy[j] == y) {
    return [j, j];
  }
  return i < j ? [i, j] : [j, i];
}

// Functions for dividing polygons and polygons at points where arc-segments intersect

// TODO:
//    Consider inserting cut points on import, when building initial topology
//    Improve efficiency (e.g. only update ArcCollection once)
//    Remove junk arcs (collapsed and duplicate arcs) instead of just removing
//       references to them

// Divide a collection of arcs at points where segments intersect
// and re-index the paths of all the layers that reference the arc collection.
// (in-place)
function addIntersectionCuts(dataset, _opts) {
  var opts = _opts || {};
  var arcs = dataset.arcs;
  var arcBounds = arcs && arcs.getBounds();
  var snapDist, nodes;
  if (!arcBounds || !arcBounds.hasBounds()) {
    return new NodeCollection([]);
  }

  if (opts.snap_interval) {
    snapDist = convertIntervalParam(opts.snap_interval, getDatasetCRS(dataset));
  } else if (!opts.no_snap && arcBounds.hasBounds()) {
    snapDist = getHighPrecisionSnapInterval(arcBounds.toArray());
  } else {
    snapDist = 0;
  }

  // bake-in any simplification (bug fix; before, -simplify followed by dissolve2
  // used to reset simplification)
  arcs.flatten();

  var changed = snapAndCut(dataset, snapDist);
  // Detect topology again if coordinates have changed
  if (changed || opts.rebuild_topology) {
    buildTopology(dataset);
  }

  // Clean shapes by removing collapsed arc references, etc.
  // TODO: consider alternative -- avoid creating degenerate arcs
  // in insertCutPoints()
  dataset.layers.forEach(function(lyr) {
    if (layerHasPaths(lyr)) {
      cleanShapes(lyr.shapes, arcs, lyr.geometry_type);
    }
  });

  // Further clean-up -- remove duplicate and missing arcs
  nodes = cleanArcReferences(dataset);
  return nodes;
}

function snapAndCut(dataset, snapDist) {
  var arcs = dataset.arcs;
  var cutOpts = snapDist > 0 ? {} : {tolerance: 0};
  var coordsHaveChanged = false;
  var snapCount, dupeCount, cutCount;
  snapCount = snapCoordsByInterval(arcs, snapDist);
  dupeCount = arcs.dedupCoords();

  // why was topology built here previously????
  // if (snapCount > 0 || dupeCount > 0) {
  //   // Detect topology again if coordinates have changed
  //   internal.buildTopology(dataset);
  // }

  // cut arcs at points where segments intersect
  cutCount = cutPathsAtIntersections(dataset, cutOpts);
  if (cutCount > 0 || snapCount > 0 || dupeCount > 0) {
    coordsHaveChanged = true;
  }
  // perform a second snap + cut pass if needed
  if (cutCount > 0) {
    cutCount = 0;
    snapCount = snapCoordsByInterval(arcs, snapDist);
    arcs.dedupCoords(); // need to do this here?
    if (snapCount > 0) {
      cutCount = cutPathsAtIntersections(dataset, cutOpts);
    }
    if (cutCount > 0) {
      arcs.dedupCoords(); // need to do this here?
    }
  }
  return coordsHaveChanged;
}


// Remap any references to duplicate arcs in paths to use the same arcs
// Remove any unused arcs from the dataset's ArcCollection.
// Return a NodeCollection
function cleanArcReferences(dataset) {
  var nodes = new NodeCollection(dataset.arcs);
  var map = findDuplicateArcs(nodes);
  var dropCount;
  if (map) {
    replaceIndexedArcIds(dataset, map);
  }
  dropCount = deleteUnusedArcs(dataset);
  if (dropCount > 0) {
    // rebuild nodes if arcs have changed
    nodes = new NodeCollection(dataset.arcs);
  }
  return nodes;
}


// @map an Object mapping old to new ids
function replaceIndexedArcIds(dataset, map) {
  var remapPath = function(ids) {
    var arcId, absId, id2;
    for (var i=0; i<ids.length; i++) {
      arcId = ids[i];
      absId = absArcId(arcId);
      id2 = map[absId];
      ids[i] = arcId == absId ? id2 : ~id2;
    }
    return ids;
  };
  dataset.layers.forEach(function(lyr) {
    if (layerHasPaths(lyr)) {
      editShapes(lyr.shapes, remapPath);
    }
  });
}

function findDuplicateArcs(nodes) {
  var map = new Int32Array(nodes.arcs.size()),
      count = 0,
      i2;
  for (var i=0, n=nodes.arcs.size(); i<n; i++) {
    i2 = nodes.findDuplicateArc(i);
    map[i] = i2;
    if (i != i2) count++;
  }
  return count > 0 ? map : null;
}

function deleteUnusedArcs(dataset) {
  var test = getArcPresenceTest2(dataset.layers, dataset.arcs);
  var count1 = dataset.arcs.size();
  var map = dataset.arcs.deleteArcs(test); // condenses arcs
  var count2 = dataset.arcs.size();
  var deleteCount = count1 - count2;
  if (deleteCount > 0) {
    replaceIndexedArcIds(dataset, map);
  }
  return deleteCount;
}

// Return a function for updating a path (array of arc ids)
// @map array generated by insertCutPoints()
// @arcCount number of arcs in divided collection (kludge)
function getDividedArcUpdater(map, arcCount) {
  return function(ids) {
    var ids2 = [];
    for (var j=0; j<ids.length; j++) {
      remapArcId2(ids[j], ids2);
    }
    return ids2;
  };

  function remapArcId2(id, ids) {
    var rev = id < 0,
        absId = rev ? ~id : id,
        min = map[absId],
        max = (absId >= map.length - 1 ? arcCount : map[absId + 1]) - 1,
        id2;
    do {
      if (rev) {
        id2 = ~max;
        max--;
      } else {
        id2 = min;
        min++;
      }
      ids.push(id2);
    } while (max - min >= 0);
  }
}

// Divides a collection of arcs at points where arc paths cross each other
// Returns array for remapping arc ids
function divideArcs(arcs, opts) {
  var points = findClippingPoints(arcs, opts);
  // TODO: avoid the following if no points need to be added
  var map = insertCutPoints(points, arcs);
  // segment-point intersections currently create duplicate points
  // TODO: consider dedup in a later cleanup pass?
  // arcs.dedupCoords();
  return map;
}

function cutPathsAtIntersections(dataset, opts) {
  var n = dataset.arcs.getPointCount();
  var map = divideArcs(dataset.arcs, opts);
  var n2 = dataset.arcs.getPointCount();
  remapDividedArcs(dataset, map);
  return n2 - n;
}

function remapDividedArcs(dataset, map) {
  var remapPath = getDividedArcUpdater(map, dataset.arcs.size());
  dataset.layers.forEach(function(lyr) {
    if (layerHasPaths(lyr)) {
      editShapes(lyr.shapes, remapPath);
    }
  });
}

// Inserts array of cutting points into an ArcCollection
// Returns array for remapping arc ids
function insertCutPoints(unfilteredPoints, arcs) {
  var data = arcs.getVertexData(),
      xx0 = data.xx,
      yy0 = data.yy,
      nn0 = data.nn,
      i0 = 0,
      i1 = 0,
      nn1 = [],
      srcArcTotal = arcs.size(),
      map = new Uint32Array(srcArcTotal),
      points = filterSortedCutPoints(sortCutPoints(unfilteredPoints, xx0, yy0), arcs),
      destPointTotal = arcs.getPointCount() + points.length * 2,
      xx1 = new Float64Array(destPointTotal),
      yy1 = new Float64Array(destPointTotal),
      n0, n1, arcLen, p;

  points.reverse(); // reverse sorted order to use pop()
  p = points.pop();

  for (var srcArcId=0, destArcId=0; srcArcId < srcArcTotal; srcArcId++) {
    // start merging an arc
    arcLen = nn0[srcArcId];
    map[srcArcId] = destArcId;
    n0 = 0;
    n1 = 0;
    while (n0 < arcLen) {
      // copy another point
      xx1[i1] = xx0[i0];
      yy1[i1] = yy0[i0];
      i1++;
      n1++;
      while (p && p.i == i0) {
        // interpolate any clip points that fall within the current segment
        xx1[i1] = p.x;
        yy1[i1] = p.y;
        i1++;
        n1++;
        nn1[destArcId++] = n1; // end current arc at intersection
        n1 = 0; // begin new arc
        xx1[i1] = p.x;
        yy1[i1] = p.y;
        i1++;
        n1++;
        p = points.pop();
      }
      n0++;
      i0++;
    }
    nn1[destArcId++] = n1;
  }

  if (i1 != destPointTotal) error("[insertCutPoints()] Counting error");
  arcs.updateVertexData(nn1, xx1, yy1, null);
  return map;
}

function convertIntersectionsToCutPoints(intersections, xx, yy) {
  var points = [], ix, a, b;
  for (var i=0, n=intersections.length; i<n; i++) {
    ix = intersections[i];
    a = getCutPoint(ix.x, ix.y, ix.a[0], ix.a[1]);
    b = getCutPoint(ix.x, ix.y, ix.b[0], ix.b[1]);
    if (a) points.push(a);
    if (b) points.push(b);
  }
  return points;
}

// i, j: indexes of segment endpoints in xx, yy, or of a single endpoint
//   if point x,y falls on an endpoint
// Assumes: i <= j
function getCutPoint(x, y, i, j, xx, yy) {
  if (j < i || j > i + 1) {
    error("Out-of-sequence arc ids:", i, j);
  }

  // Removed out-of-range check: small out-of-range intersection points are now allowed.
  // (Such points may occur due to fp rounding, when intersections occur along
  // vertical or horizontal segments)
  // if (geom.outsideRange(x, ix, jx) || geom.outsideRange(y, iy, jy)) {
    // return null;
  // }

  // Removed endpoint check: intersecting arcs need to be cut both at vertices
  // and between vertices, so pathfinding functions will work correctly.
  // if (x == ix && y == iy || x == jx && y == jy) {
    // return null;
  // }
  return {x: x, y: y, i: i};
}

// Sort insertion points in order of insertion
// Insertion order: ascending id of first endpoint of containing segment and
//   ascending distance from same endpoint.
function sortCutPoints(points, xx, yy) {
  points.sort(function(a, b) {
    if (a.i != b.i) return a.i - b.i;
    return geom.distanceSq(xx[a.i], yy[a.i], a.x, a.y) - geom.distanceSq(xx[b.i], yy[b.i], b.x, b.y);
    // The old code below is no longer reliable, now that out-of-range intersection
    // points are allowed.
    // return Math.abs(a.x - xx[a.i]) - Math.abs(b.x - xx[b.i]) ||
    // Math.abs(a.y - yy[a.i]) - Math.abs(b.y - yy[b.i]);
  });
  return points;
}

// Removes duplicate points and arc endpoints
function filterSortedCutPoints(points, arcs) {
  var filtered = [],
      pointId = 0;
  arcs.forEach2(function(i, n, xx, yy) {
    var j = i + n - 1,
        x0 = xx[i],
        y0 = yy[i],
        xn = xx[j],
        yn = yy[j],
        p, pp;

    while (pointId < points.length && points[pointId].i <= j) {
      p = points[pointId];
      pp = filtered[filtered.length - 1]; // previous point
      if (p.x == x0 && p.y == y0 || p.x == xn && p.y == yn) ; else if (pp && pp.x == p.x && pp.y == p.y && pp.i == p.i) ; else {
        filtered.push(p);
      }
      pointId++;
    }
  });
  return filtered;
}

function findClippingPoints(arcs, opts) {
  var intersections = findSegmentIntersections(arcs, opts),
      data = arcs.getVertexData();
  return convertIntersectionsToCutPoints(intersections, data.xx, data.yy);
}

// Process arc-node topology to generate a layer of indivisible mosaic "tiles" {mosaic}
//   ... also return a layer of outer-boundary polygons {enclosures}
//   ... also return an array of arcs that were dropped from the mosaic {lostArcs}
//
// Assumes that the arc-node topology of @nodes NodeCollection meets several
//    conditions (expected to be true if addIntersectionCuts() has just been run)
// 1. Arcs only touch at endpoints.
// 2. The angle between any two segments that meet at a node is never zero.
//      (this should follow from 1... but may occur due to FP errors)
// TODO: a better job of handling FP errors
//
function buildPolygonMosaic(nodes) {
  // Detach any acyclic paths (spikes) from arc graph (these would interfere with
  //    the ring finding operation). This modifies @nodes -- a side effect.
  nodes.detachAcyclicArcs();
  var data = findMosaicRings(nodes);

  // Process CW rings: these are indivisible space-enclosing boundaries of mosaic tiles
  var mosaic = data.cw.map(function(ring) {return [ring];});

  // Process CCW rings: these are either holes or enclosure
  // TODO: optimize -- testing CCW path of every island is costly
  var enclosures = [];
  var index = new PathIndex(mosaic, nodes.arcs); // index CW rings to help identify holes
  data.ccw.forEach(function(ring) {
    var id = index.findSmallestEnclosingPolygon(ring);
    if (id > -1) {
      // Enclosed CCW rings are holes in the enclosing mosaic tile
      mosaic[id].push(ring);
    } else {
      // Non-enclosed CCW rings are outer boundaries -- add to enclosures layer
      reversePath(ring);
      enclosures.push([ring]);
    }
  });
  debug(utils.format("Detect holes (holes: %d, enclosures: %d)", data.ccw.length - enclosures.length, enclosures.length));

  return {mosaic: mosaic, enclosures: enclosures, lostArcs: data.lostArcs};
}

function findMosaicRings(nodes) {
  var arcs = nodes.arcs,
      cw = [],
      ccw = [],
      empty = [],
      lostArcs = [];

  var flags = new Uint8Array(arcs.size());
  var findPath = getPathFinder(nodes, useRoute);

  for (var i=0, n=flags.length; i<n; i++) {
    tryPath(i);
    // TODO: consider skipping detection of island ccw paths here (if possible)
    tryPath(~i);
  }
  return {
    cw: cw,
    ccw: ccw,
    empty: empty,
    lostArcs: lostArcs
  };

  function tryPath(arcId) {
    var ring, area;
    if (!routeIsOpen(arcId)) return;
    ring = findPath(arcId);
    if (!ring) {
      // arc is unused, but can not be extended to a complete ring
      lostArcs.push(arcId);
      return;
    }
    area = geom.getPlanarPathArea(ring, arcs);
    if (area > 0) {
      cw.push(ring);
    } else if (area < 0) {
      ccw.push(ring);
    } else {
      empty.push(ring);
    }
  }

  function useRoute(arcId) {
    return routeIsOpen(arcId, true);
  }

  function routeIsOpen(arcId, closeRoute) {
    var absId = absArcId(arcId);
    var bit = absId == arcId ? 1 : 2;
    var isOpen = (flags[absId] & bit) === 0;
    if (closeRoute && isOpen) flags[absId] |= bit;
    return isOpen;
  }
}

// Map positive or negative integer ids to non-negative integer ids
function IdLookupIndex(n, clearable) {
  var fwdIndex = new Int32Array(n);
  var revIndex = new Int32Array(n);
  var index = this;
  var setList = [];
  utils.initializeArray(fwdIndex, -1);
  utils.initializeArray(revIndex, -1);

  this.setId = function(id, val) {
    if (clearable && !index.hasId(id)) {
      setList.push(id);
    }
    if (id < 0) {
      revIndex[~id] = val;
    } else {
      fwdIndex[id] = val;
    }
  };

  this.clear = function() {
    if (!clearable) {
      error('Index is not clearable');
    }
    setList.forEach(function(id) {
      index.setId(id, -1);
    });
    setList = [];
  };

  this.clearId = function(id) {
    if (!index.hasId(id)) {
      error('Tried to clear an unset id');
    }
    index.setId(id, -1);
  };

  this.hasId = function(id) {
    var val = index.getId(id);
    return val > -1;
  };

  this.getId = function(id) {
    var idx = id < 0 ? ~id : id;
    if (idx >= n) {
      return -1; // TODO: consider throwing an error?
    }
    return id < 0 ? revIndex[idx] : fwdIndex[idx];
  };
}

// Associate mosaic tiles with shapes (i.e. identify the groups of tiles that
//   belong to each shape)
//
function PolygonTiler(mosaic, arcTileIndex, nodes, opts) {
  var arcs = nodes.arcs;
  var visitedTileIndex = new IdTestIndex(mosaic.length, true);
  var divide = getHoleDivider(nodes);
  // temp vars
  var currHoles; // arc ids of all holes in shape
  var currRingBbox;
  var tilesInShape; // accumulator for tile ids of tiles in current shape
  var ringIndex = new IdTestIndex(arcs.size(), true);
  var holeIndex = new IdTestIndex(arcs.size(), true);

  // return ids of tiles in shape
  this.getTilesInShape = function(shp, shapeId) {
    var cw = [], ccw = [], retn;
    tilesInShape = [];
    currHoles = [];
    if (opts.no_holes) {
      divide(shp, cw, ccw);
      // ccw.forEach(internal.reversePath);
      // cw = cw.concat(ccw);
    } else {
      // divide shape into rings and holes (splits self-intersecting rings)
      // TODO: rewrite divide() -- it is a performance bottleneck and can convert
      //   space-filling areas into ccw holes
      divide(shp, cw, ccw);
      ccw.forEach(procShapeHole);
      holeIndex.setIds(currHoles);
    }
    cw.forEach(procShapeRing);
    retn = tilesInShape;
    // reset tmp vars, etc
    tilesInShape = null;
    holeIndex.clear();
    currHoles = null;
    return retn;
  };

  function procShapeHole(path) {
    currHoles = currHoles ? currHoles.concat(path) : path;
  }

  function procShapeRing(path) {
    currRingBbox = arcs.getSimpleShapeBounds2(path);
    ringIndex.setIds(path);
    procArcIds(path);
    ringIndex.clear();
    // allow overlapping rings to visit the same tiles
    visitedTileIndex.clear();
  }

  // optimized version: traversal without recursion (to avoid call stack oflo, excessive gc, etc)
  function procArcIds(ids) {
    var stack = ids.concat();
    var arcId, tileId;
    while (stack.length > 0) {
      arcId = stack.pop();
      tileId = procRingArc(arcId);
      if (tileId >= 0) {
        accumulateTraversibleArcIds(stack, mosaic[tileId]);
      }
    }
  }

  function accumulateTraversibleArcIds(ids, tile) {
    var arcId, ring;
    for (var j=0, n=tile.length; j<n; j++) {
      ring = tile[j];
      for (var i=0, m=ring.length; i<m; i++) {
        arcId = ring[i];
        if (arcIsTraversible(arcId)) {
          ids.push(~arcId);
        }
      }
    }
  }

  function arcIsTraversible(tileArc) {
    var neighborArc = ~tileArc;
    var traversible = !(ringIndex.hasId(tileArc) || ringIndex.hasId(neighborArc) || holeIndex.hasId(tileArc) || holeIndex.hasId(neighborArc));
    return traversible;
  }

  function procRingArc(arcId) {
    var tileId = arcTileIndex.getShapeIdByArcId(arcId);
    if (tileId == -1 || visitedTileIndex.hasId(tileId)) return -1;
    if (arcs.arcIsContained(absArcId(arcId), currRingBbox) === false) {
      return -1;
    }
    visitedTileIndex.setId(tileId);
    tilesInShape.push(tileId);
    return tileId;
  }
}

function MosaicIndex(lyr, nodes, optsArg) {
  var opts = optsArg || {};
  var shapes = lyr.shapes;
  getHoleDivider(nodes);
  var mosaic = buildPolygonMosaic(nodes).mosaic;
  // map arc ids to tile ids
  var arcTileIndex = new ShapeArcIndex(mosaic, nodes.arcs);
  // keep track of which tiles have been assigned to shapes
  var fetchedTileIndex = new IdTestIndex(mosaic.length, true);
  // bidirection index of tile ids <=> shape ids
  var tileShapeIndex = new TileShapeIndex(mosaic, opts);
  // assign tiles to shapes
  var shapeTiler = new PolygonTiler(mosaic, arcTileIndex, nodes, opts);
  var weightFunction = null;
  if (!opts.simple && opts.flat) {
    // opts.simple is an optimization when dissolving everything into one polygon
    // using -dissolve2. In this situation, we don't need a weight function.
    // Otherwise, if polygons are being dissolved into multiple groups,
    // we use a function to assign tiles in overlapping areas to a single shape.
    weightFunction = getOverlapPriorityFunction(lyr.shapes, nodes.arcs, opts.overlap_rule);
  }
  this.mosaic = mosaic;
  this.nodes = nodes; // kludge
  this.getSourceIdsByTileId = tileShapeIndex.getShapeIdsByTileId; // expose for -mosaic command
  this.getTileIdsByShapeId = tileShapeIndex.getTileIdsByShapeId;

  // Assign shape ids to mosaic tile shapes.
  shapes.forEach(function(shp, shapeId) {
    var tileIds = shapeTiler.getTilesInShape(shp, shapeId);
    tileShapeIndex.indexTileIdsByShapeId(shapeId, tileIds, weightFunction);
  });

  // ensure each tile is assigned to only one shape
  if (opts.flat) {
    tileShapeIndex.flatten();
  }

  // fill gaps
  // (assumes that tiles have been allocated to shapes and mosaic has been flattened)
  this.removeGaps = function(filter) {
    if (!opts.flat) {
      error('MosaicIndex#removeGaps() should only be called with a flat mosaic');
    }
    var remainingIds = tileShapeIndex.getUnusedTileIds();
    var filledIds = remainingIds.filter(function(tileId) {
      var tile = mosaic[tileId];
      return filter(tile[0]); // test tile ring, ignoring any holes (does this matter?)
    });
    filledIds.forEach(assignTileToAdjacentShape);
    return {
      removed: filledIds.length,
      remaining: remainingIds.length - filledIds.length
    };
  };

  this.getUnusedTiles = function() {
    return tileShapeIndex.getUnusedTileIds().map(tileIdToTile);
  };

  this.getTilesByShapeIds = function(shapeIds) {
    return getTileIdsByShapeIds(shapeIds).map(tileIdToTile);
  };

  function getOverlapPriorityFunction(shapes, arcs, rule) {
    var f;
    if (!rule || rule == 'max-area') {
      f = getAreaWeightFunction(shapes, arcs, false);
    } else if (rule == 'min-area') {
      f = getAreaWeightFunction(shapes, arcs, true);
    } else if (rule == 'max-id') {
      f = function(shapeId) {
        return shapeId; };
    } else if (rule == 'min-id') {
      f = function(shapeId) { return -shapeId; };
    } else {
      stop('Unknown overlap rule:', rule);
    }
    return f;
  }

  function getAreaWeightFunction(shapes, arcs, invert) {
    var index = [];
    var sign = invert ? -1 : 1;
    return function(shpId) {
      var weight;
      if (shpId in index) {
        weight = index[shpId];
      } else {
        weight = sign * Math.abs(geom.getShapeArea(shapes[shpId], arcs));
        index[shpId] = weight;
      }
      return weight;
    };
  }

  function tileIdToTile(id, i) {
    return mosaic[id];
  }

  function assignTileToAdjacentShape(tileId) {
    var ring = mosaic[tileId][0];
    var arcs = nodes.arcs;
    var arcId, neighborShapeId, neighborTileId, arcLen;
    var shapeId = -1, maxArcLen = 0;
    for (var i=0; i<ring.length; i++) {
      arcId = ring[i];
      neighborTileId = arcTileIndex.getShapeIdByArcId(~arcId);
      if (neighborTileId < 0) continue;
      neighborShapeId = tileShapeIndex.getShapeIdByTileId(neighborTileId);
      if (neighborShapeId < 0) continue;
      arcLen = geom.getPathPerimeter([arcId], arcs);
      if (arcLen > maxArcLen) {
        shapeId = neighborShapeId;
        maxArcLen = arcLen;
      }
    }
    if (shapeId > -1) {
      tileShapeIndex.addTileToShape(shapeId, tileId);
    }
  }

  function getTileIdsByShapeIds(shapeIds) {
    var uniqIds = [];
    var tileId, tileIds, i, j;
    for (i=0; i<shapeIds.length; i++) {
      tileIds = tileShapeIndex.getTileIdsByShapeId(shapeIds[i]);
      for (j=0; j<tileIds.length; j++) {
        tileId = tileIds[j];
        // uniqify tile ids (in case the shape contains overlapping rings)
        if (fetchedTileIndex.hasId(tileId)) continue;
        fetchedTileIndex.setId(tileId);
        uniqIds.push(tileId);
      }
    }
    // clearing this index allows duplicate tile ids between calls to this function
    // (should not happen in a typical dissolve)
    fetchedTileIndex.clear();
    return uniqIds;
  }
}

// Map arc ids to shape ids, assuming perfect topology
// (an arcId maps to at most one shape)
// Supports looking up a shape id using an arc id.
function ShapeArcIndex(shapes, arcs) {
  var n = arcs.size();
  var index = new IdLookupIndex(n);
  var shapeId;
  shapes.forEach(onShape);

  function onShape(shp, i) {
    shapeId = i;
    shp.forEach(onPart);
  }
  function onPart(path) {
    var arcId;
    for (var i=0, n=path.length; i<n; i++) {
      arcId = path[i];
      index.setId(arcId, shapeId);
    }
  }

  // returns -1 if shape has not been indexed
  this.getShapeIdByArcId = function(arcId) {
    return index.getId(arcId);
  };
}

// Assumes that arcs do not intersect except at endpoints
function dissolvePolygonLayer2(lyr, dataset, opts) {
  opts = utils.extend({}, opts);
  if (opts.field) {
    opts.fields = [opts.field]; // support old "field" parameter
  }
  var getGroupId = getCategoryClassifier(opts.fields, lyr.data);
  var groups = groupPolygons2(lyr, getGroupId);
  var shapes2 = dissolvePolygonGroups2(groups, lyr, dataset, opts);
  return composeDissolveLayer(lyr, shapes2, getGroupId, opts);
}

function groupPolygons2(lyr, getGroupId) {
  return lyr.shapes.reduce(function(groups, shape, shapeId) {
    var groupId = getGroupId(shapeId);
    if (groupId in groups === false) {
      groups[groupId] = [];
    }
    groups[groupId].push(shapeId);
    return groups;
  }, []);
}

function getGapRemovalMessage(removed, retained, areaLabel) {
  if (removed > 0 === false) return '';
  return utils.format('Removed %,d / %,d sliver%s using %s',
      removed, removed + retained, utils.pluralSuffix(removed), areaLabel);
}

function dissolvePolygonGroups2(groups, lyr, dataset, opts) {
  var arcFilter = getArcPresenceTest(lyr.shapes, dataset.arcs);
  var nodes = new NodeCollection(dataset.arcs, arcFilter);
  var mosaicOpts = {
    flat: !opts.allow_overlaps,
    simple: groups.length == 1,
    overlap_rule: opts.overlap_rule
  };
  var mosaicIndex = new MosaicIndex(lyr, nodes, mosaicOpts);
  var fillGaps = !opts.allow_overlaps; // gap fill doesn't work yet with overlapping shapes
  var cleanupData, filterData;
  if (fillGaps) {
    var sliverOpts = utils.extend({sliver_control: 1}, opts);
    filterData = getSliverFilter(lyr, dataset, sliverOpts);
    cleanupData = mosaicIndex.removeGaps(filterData.filter);
  }
  var pathfind = getRingIntersector(mosaicIndex.nodes);
  var dissolvedShapes = groups.map(function(shapeIds) {
    var tiles = mosaicIndex.getTilesByShapeIds(shapeIds);
    if (opts.tiles) {
      return tiles.reduce(function(memo, tile) {
        return memo.concat(tile);
      }, []);
    }
    return dissolveTileGroup2(tiles, pathfind);
  });
  // convert self-intersecting rings to outer/inner rings, for OGC
  // Simple Features compliance
  dissolvedShapes = fixTangentHoles(dissolvedShapes, pathfind);

  if (fillGaps && !opts.quiet) {
    var msg = getGapRemovalMessage(cleanupData.removed, cleanupData.remaining, filterData.label);
    if (msg) message(msg);
  }
  return dissolvedShapes;
}

function dissolveTileGroup2(tiles, pathfind) {
  var rings = [],
      holes = [],
      dissolved, tile;
  for (var i=0, n=tiles.length; i<n; i++) {
    tile = tiles[i];
    rings.push(tile[0]);
    if (tile.length > 1) {
      holes = holes.concat(tile.slice(1));
    }
  }
  dissolved = pathfind(rings.concat(holes), 'dissolve');
  if (dissolved.length > 1) ;
  return dissolved.length > 0 ? dissolved : null;
}

function fixTangentHoles(shapes, pathfind) {
  var onRing = function(memo, ring) {
    reversePath(ring);
    var fixed = pathfind([ring], 'flatten');
    if (fixed.length > 1) {
      fixed.forEach(reversePath);
      memo = memo.concat(fixed);
    } else {
      memo.push(reversePath(ring));
    }
    return memo;
  };
  return shapes.map(function(rings) {
    if (!rings) return null;
    return rings.reduce(onRing, []);
  });
}

// Return an array of Features or Geometries as objects or strings
//
function exportLayerAsGeoJSON(lyr, dataset, opts, asFeatures, ofmt) {
  var properties = exportProperties(lyr.data, opts),
      shapes = lyr.shapes,
      ids = exportIds(lyr.data, opts),
      stringify;

  if (opts.ndjson) {
    stringify = stringifyAsNDJSON;
  } else if (opts.prettify) {
    stringify = getFormattedStringify(['bbox', 'coordinates']);
  } else {
    stringify = JSON.stringify;
  }

  if (properties && shapes && properties.length !== shapes.length) {
    error("Mismatch between number of properties and number of shapes");
  }

  return (shapes || properties || []).reduce(function(memo, o, i) {
    var shape = shapes ? shapes[i] : null,
        exporter = GeoJSON.exporters[lyr.geometry_type],
        geom = shape ? exporter(shape, dataset.arcs, opts) : null,
        obj = null;
    if (asFeatures) {
      obj = GeoJSON.toFeature(geom, properties ? properties[i] : null);
      if (ids) {
        obj.id = ids[i];
      }
    } else if (!geom) {
      return memo; // don't add null objects to GeometryCollection
    } else {
      obj = geom;
    }
    if (ofmt) {
      // stringify features as soon as they are generated, to reduce the
      // number of JS objects in memory (so larger files can be exported)
      obj = stringify(obj);
      if (ofmt == 'buffer') {
        obj = encodeString(obj, 'utf8');
        // obj = stringToBuffer(obj);
        // obj = new Buffer(obj, 'utf8');
      }
    }
    memo.push(obj);
    return memo;
  }, []);
}

function getDatasetBbox(dataset, rfc7946) {
  var P = getDatasetCRS(dataset),
      wrapped = rfc7946 && P && isLatLngCRS(P),
      westBounds = new Bounds(),
      eastBounds = new Bounds(),
      mergedBounds, gutter, margins, bbox;

  dataset.layers.forEach(function(lyr) {
    if (layerHasPaths(lyr)) {
      traversePaths(lyr.shapes, null, function(o) {
        var bounds = dataset.arcs.getSimpleShapeBounds(o.arcs);
        (bounds.centerX() < 0 ? westBounds : eastBounds).mergeBounds(bounds);
      });
    } else if (layerHasPoints(lyr)) {
      forEachPoint(lyr.shapes, function(p) {
        (p[0] < 0 ? westBounds : eastBounds).mergePoint(p[0], p[1]);
      });
    }
  });
  mergedBounds = (new Bounds()).mergeBounds(eastBounds).mergeBounds(westBounds);
  if (mergedBounds.hasBounds()) {
    bbox = mergedBounds.toArray();
  }
  if (wrapped && eastBounds.hasBounds() && westBounds.hasBounds()) {
    gutter = eastBounds.xmin - westBounds.xmax;
    margins = 360 + westBounds.xmin - eastBounds.xmax;
    if (gutter > 0 && gutter > margins) {
      bbox[0] = eastBounds.xmin;
      bbox[2] = westBounds.xmax;
    }
  }
  return bbox || null;
}

function exportDatasetAsGeoJSON(dataset, opts, ofmt) {
  var geojson = {};
  var layers = dataset.layers;
  var useFeatures = useFeatureCollection(layers, opts);
  var collection, bbox;

  if (useFeatures) {
    geojson.type = 'FeatureCollection';
  } else {
    geojson.type = 'GeometryCollection';
  }

  if (opts.gj2008) {
    preserveOriginalCRS(dataset, geojson);
  }

  if (opts.bbox) {
    bbox = getDatasetBbox(dataset, opts.rfc7946 || opts.v2);
    if (bbox) {
      geojson.bbox = bbox;
    }
  }

  collection = layers.reduce(function(memo, lyr, i) {
    var items = exportLayerAsGeoJSON(lyr, dataset, opts, useFeatures, ofmt);
    return memo.length > 0 ? memo.concat(items) : items;
  }, []);

  if (opts.geojson_type == 'Feature' && collection.length == 1) {
    return collection[0];
  } else if (opts.ndjson) {
    return GeoJSON.formatCollectionAsNDJSON(collection);
  } else if (ofmt) {
    return GeoJSON.formatCollection(geojson, collection);
  } else {
    geojson[collectionName(geojson.type)] = collection;
    return geojson;
  }
}

function collectionName(type) {
  if (type == 'FeatureCollection') return 'features';
  if (type == 'GeometryCollection') return 'geometries';
  error('Invalid collection type:', type);
}

// collection: an array of Buffers, one per feature
GeoJSON.formatCollectionAsNDJSON = function(collection) {
  var delim = utils.createBuffer('\n', 'utf8');
  var parts = collection.reduce(function(memo, buf, i) {
    if (i > 0) memo.push(delim);
    memo.push(buf);
    return memo;
  }, []);
  return B.concat(parts);
};

// collection: an array of individual GeoJSON Features or geometries as strings or buffers
GeoJSON.formatCollection = function(container, collection) {
  var head = JSON.stringify(container).replace(/\}$/, ', "' + collectionName(container.type) + '": [\n');
  var tail = '\n]}';
  if (utils.isString(collection[0])) {
    return head + collection.join(',\n') + tail;
  }
  // assume buffers
  return GeoJSON.joinOutputBuffers(head, tail, collection);
};

GeoJSON.joinOutputBuffers = function(head, tail, collection) {
  var comma = utils.createBuffer(',\n', 'utf8');
  var parts = collection.reduce(function(memo, buf, i) {
    if (i > 0) memo.push(comma);
    memo.push(buf);
    return memo;
  }, [utils.createBuffer(head, 'utf8')]);
  parts.push(utils.createBuffer(tail, 'utf8'));
  return B.concat(parts);
};

// export GeoJSON or TopoJSON point geometry
GeoJSON.exportPointGeom = function(points, arcs) {
  var geom = null;
  if (points.length == 1) {
    geom = {
      type: "Point",
      coordinates: points[0]
    };
  } else if (points.length > 1) {
    geom = {
      type: "MultiPoint",
      coordinates: points
    };
  }
  return geom;
};

GeoJSON.exportLineGeom = function(ids, arcs) {
  var obj = exportPathData(ids, arcs, "polyline");
  if (obj.pointCount === 0) return null;
  var coords = obj.pathData.map(function(path) {
    return path.points;
  });
  return coords.length == 1 ? {
    type: "LineString",
    coordinates: coords[0]
  } : {
    type: "MultiLineString",
    coordinates: coords
  };
};

GeoJSON.exportPolygonGeom = function(ids, arcs, opts) {
  var obj = exportPathData(ids, arcs, "polygon");
  if (obj.pointCount === 0) return null;
  var groups = groupPolygonRings(obj.pathData, arcs, opts.invert_y);
  // invert_y is used internally for SVG generation
  // mapshaper's internal winding order is the opposite of RFC 7946
  var reverse = (opts.rfc7946 || opts.v2) && !opts.invert_y;
  var coords = groups.map(function(paths) {
    return paths.map(function(path) {
      if (reverse) path.points.reverse();
      return path.points;
    });
  });
  return coords.length == 1 ? {
    type: "Polygon",
    coordinates: coords[0]
  } : {
    type: "MultiPolygon",
    coordinates: coords
  };
};

GeoJSON.exporters = {
  polygon: GeoJSON.exportPolygonGeom,
  polyline: GeoJSON.exportLineGeom,
  point: GeoJSON.exportPointGeom
};

// To preserve some backwards compatibility with old-style GeoJSON files,
// pass through any original CRS object if the crs has not been set by mapshaper
// jsonObj: a top-level GeoJSON or TopoJSON object
//
function preserveOriginalCRS(dataset, jsonObj) {
  var info = dataset.info || {};
  if (!info.crs && 'input_geojson_crs' in info) {
    // use input geojson crs if available and coords have not changed
    jsonObj.crs = info.input_geojson_crs;

  }

  // Removing the following (seems ineffectual at best)
  // else if (info.crs && !isLatLngCRS(info.crs)) {
  //   // Setting output crs to null if coords have been projected
  //   // "If the value of CRS is null, no CRS can be assumed"
  //   // source: http://geojson.org/geojson-spec.html#coordinate-reference-system-objects
  //   jsonObj.crs = null;
  // }
}

function useFeatureCollection(layers, opts) {
  var type = opts.geojson_type || '';
  if (type == 'Feature' || type == 'FeatureCollection') {
    return true;
  } else if (type == 'GeometryCollection') {
    return false;
  } else if (type) {
    stop("Unsupported GeoJSON type:", opts.geojson_type);
  }
  // default is true iff layers contain attributes
  return utils.some(layers, function(lyr) {
    var fields = lyr.data ? lyr.data.getFields() : [];
    var haveData = useFeatureProperties(fields, opts);
    var haveId = !!getIdField(fields, opts);
    return haveData || haveId;
  });
}

function useFeatureProperties(fields, opts) {
  return !(opts.drop_table || opts.cut_table || fields.length === 0 ||
      fields.length == 1 && fields[0] == GeoJSON.ID_FIELD);
}

function exportProperties(table, opts) {
  var fields = table ? table.getFields() : [],
      idField = getIdField(fields, opts),
      properties, records;
  if (!useFeatureProperties(fields, opts)) {
    return null;
  }
  records = table.getRecords();
  if (idField == GeoJSON.ID_FIELD) {// delete default id field, not user-set fields
    properties = records.map(function(rec) {
      rec = utils.extend({}, rec); // copy rec;
      delete rec[idField];
      return rec;
    });
  } else {
    properties = records;
  }
  return properties;
}

// @opt value of id-field option (empty, string or array of strings)
// @fields array
function getIdField(fields, opts) {
  var ids = [];
  var opt = opts.id_field;
  if (utils.isString(opt)) {
    ids.push(opt);
  } else if (utils.isArray(opt)) {
    ids = opt;
  }
  ids.push(GeoJSON.ID_FIELD); // default id field
  return utils.find(ids, function(name) {
    return utils.contains(fields, name);
  });
}

function exportIds(table, opts) {
  var fields = table ? table.getFields() : [],
      idField = getIdField(fields, opts);
  if (!idField) return null;
  return table.getRecords().map(function(rec) {
    return idField in rec ? rec[idField] : null;
  });
}

// Removes small gaps and all overlaps
function dissolve2(layers, dataset, opts) {
  layers.forEach(requirePolygonLayer);
  addIntersectionCuts(dataset, opts);
  return layers.map(function(lyr) {
    if (!layerHasPaths(lyr)) return lyr;
    return dissolvePolygonLayer2(lyr, dataset, opts);
  });
}

export function dissolve(geojson) {
  let dataset = importGeoJSON(geojson);
  dataset.layers = dissolve2(dataset.layers, dataset, {gap_fill_area: '1km2'});
  return exportDatasetAsGeoJSON(dataset, { geojson_type: 'Feature' });
}
