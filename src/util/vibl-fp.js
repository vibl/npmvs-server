function _i(required) {
  return required && "object" === typeof required && "default" in required ? required.default : required;
}
const _ = _i(require('lodash'));
const R = _i(require('ramda'));
const pMapOrig = _i(require('p-map'));
const deepEql = _i(require("deep-eql"));
/* eslint-disable no-unused-vars*/ 
const {
  F, T, addIndex, all, always, any, append, apply, assoc, assocPath, binary,
  chain, clone, complement, concat, cond, contains, curry, curryN,
  difference, dissoc, drop, evolve, filter, flatten, flip, forEachObjIndexed,
  identity, indexBy, ifElse, infinity, intersection, intersperse,
  juxt, keys, length, lensPath,
  map, match, max, merge, mergeAll, mergeDeepRight, mergeDeepWith, multiply, nth, not,
  objOf, or, path, pick, pipe, prepend, product, prop, props,
  range, reduce, replace,
  slice, sort, split, tap, toPairs, trim, unapply, unless, values,
  when, without, zip, zipObj, zipWith
} = R;
/* eslint-enable no-unused-vars*/

const {
  isArray, isFunction, isNumber, isUndefined,
  isObject, isArrayLike, isObjectLike, isPlainObject, isString, random, toNumber
} = _;

// See alsos Ramda-adjunct https://char0n.github.io/ramda-adjunct

// RamdaSauce README
// // --- Conversions ---
// RS.toDate(1e12)             // a Number to a date Object
// RS.toNumber('5')            // a String to a Number
//
// // --- Object Shenanigans ---
// const x = {a: 1, b: 2, c: {x: [5, 6]}}
// RS.mapKeys(R.toUpper, x)    // transforms the keys of an object by the function
// RS.dotPath('c.x.0', x)      // fetches a value from a nested object by a string path
//
// // --- Finding Things ---
// RS.findByProp('id', 'a', [{id: 'a', id: 'b'}])      // finds an object by propEq
// RS.findIndexByProp('id', 'a', [{id: 'a', id: 'b'}]) // finds the index of an object by propEq
//
// // --- Predicates ---
// RS.isUndefined(qwerty)      // check if something is undefined
// RS.isNotNil(null)           // check if something is not null or undefined
// RS.isNilOrEmpty(null)       // checks if something is null, undefined or R.isEmpty
// RS.isWithin(1, 2, 2)        // is the 3rd parameter within the range of 1st through 2nd?
// RS.isNotWithin(1, 2, 100)   // is the 3rd parameter not within the range of 1st through 2nd?
// RS.eqLength([1,2,3], 'abc') // tests 2 things to see if their length properties are the same

/*
  See also for inspiration:
  https://github.com/ramda/ramda/wiki/Cookbook
  https://github.com/Cottin/ramda-extras/blob/master/src/ramda-extras.coffee
  https://github.com/mediasuitenz/ramda-extended/blob/master/src/ramda-extended.js

  https://github.com/ramda/ramda/wiki/What-Function-Should-I-Use%3F
 */


const ident = x => x;
const isBlank = val => ! val || isEmpty(val);
const notBlank = complement(isBlank);

const isNegative = x => isNumber(x) && x < 0;

const isEmpty = x => x === undefined || R.isEmpty(x);
const notEmpty = complement(isEmpty);
const notMatch = pipe(match, isEmpty);

const concatArray = chain(identity);
const curryFlip = fn => curry2(flip(fn));

const curry2 = curryN(2);
const curry3 = curryN(3);

const concatLeft = flip(concat);
const mergeLeft = flip(merge);

// Store a value into a variable, which can be an object or an array.
const store = dest => source => {
  if (isObjectLike(dest)) {
    Object.assign(dest, source);
  }
  if (isArrayLike(dest)) {
    source.forEach(val => dest.push(val));
  }
  return source;
};

const interleave = pipe(zip, flatten);

const mapIf = curryN(3, (testFn, mapFn, obj) => {
  const testAndMapFn = x => testFn(x) ? mapFn(x, obj) : x;
  let newObj = {};
  for (let prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      newObj[prop] = testAndMapFn(obj[prop]);
    }
  }
  return newObj;
});
const bindAll = mapIf(isFunction, (fn, obj) => fn.bind(obj));

const filterKeys = curry2((condition, obj) => {
  let key, acc = {};
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (condition(key)) {
        acc[key] = obj[key];
      }
    }
  }
  return acc;
});

const flipAll = mapIf(isFunction, flip);

const bindAllDeep = obj => {
  const objClone = clone(obj);
  const firstLevelBound = bindAll(objClone);
  return mapIf(isPlainObject, bindAll, firstLevelBound);
};
const rangeStep = curry3((step, start, stop) => {
  if (step === 0) return null
  if (step > 0 && stop < start) return null
  if (step < 0 && stop > start) return null
  return map(
    (n) => start + step * n,
    range(0, (1 + (stop - start) / step) >>> 0)
  )
});
/*
 Logs and returns a value.
 */
const log = (msg) => tap( val => console.log('TAP LOGGING: "', msg, '"', val));
// Logs every step of the pipe
const pipeLog = (...args) => pipe(...intersperse(log, args), log);

const debug = x => {debugger; return x};
const pipeD = (...args) => pipe(...intersperse(debug, args), debug);

const rangeMap = (step, start, end, fn) => {
  const range = rangeStep(step, start, end);
  return map(fn, range);
};
const mapIndex = addIndex(map);
const trimIfString = mapIf(isString, trim);

const mapDeep = curry2((fn, obj) => {
  const deep = value => {
    if (typeof value === 'object') {
      return mapDeep(fn, value);
    } else {
      return fn(value);
    }
  };
  return map(deep, obj);
});

const mapKeys = curry2( (fn, obj) => {
  const acc = {};
  forEachObjIndexed((val, key) => acc[fn(key)] = val)(obj);
  return acc;
});

const mapValues = curry2( (propName, list) => pipe(map(prop(propName)), values)(list) );

const preIntersperse = curry2((element, list) => pipe(intersperse(element), prepend(element))(list));
const splitLinesTrim = pipe(trim, split('\n'), map(trim));

function toIntIfNumber(val) {
  return isNaN(val) ? val : parseInt(val);
}

const dotStringToPath = pipe(split('.'), map(toIntIfNumber));
// Accepts dot-separated strings as path, or an array of dot-separated strings.
let dotPath = () => {};
dotPath = cond([
  [Array.isArray, pipe(chain, dotPath)],
  [_.isString, dotStringToPath]
]);

const lensDotPath = pipe(dotPath, lensPath);

const assocDotPath = curry3((path, val, obj) => assocPath(dotPath(path), val, obj));

const getDotPath = curry2( (str, obj) => path(dotPath(str), obj) );

const colStringToPath = pipe(split(':'), map(toIntIfNumber));
// Accepts col-separated strings as path, or an array of col-separated strings.
let colPath = () => {};
colPath = cond([
  [Array.isArray, pipe(chain, colPath)],
  [_.isString, colStringToPath]
]);

const assocColPath = curry3((path, val, obj) => assocPath(colPath(path), val, obj));

const getColPath = curry2( (str, obj) => path(colPath(str), obj) );


const overlaps = pipe(intersection, notEmpty);

const equalsAny = curry2((ary, val) => {
  for (let i = 0; i < ary.length; i++) {
    if (Object.is(ary[i], val)) {
      return true;
    }
  }
  return false;
});
const prefixLine = replace(/^ */mg);
const appendStr = curry2((suffix, str) => str + suffix);
const lineBreaksToSpace = replace(/\n/g, ' ');

const removeShortest = pipe(sort((a, b) => a.length - b.length), drop(1));
const get = flip(nth);

const doesMatch = regex => pipe(match(regex), notEmpty);

const splitProperties = pipe(toPairs, map(apply(objOf)));

const rest = slice(1, Infinity);

const reduceFirst = curry2((fn, arr) => arr.reduce(fn));

const combine = curry2((arrA, arrB) => {
  let res = [];
  arrA.forEach(a => arrB.forEach(b => res.push([a, b])));
  return res;
});

const filterIndexed = addIndex(filter);

const filterP = (promiseFn) => async (list) => {
  const tests = await Promise.all(map(promiseFn, list));
  return filterIndexed((item, i) => tests[i])(list);
};
const reduceP = (fn, acc) => async (list) => {
  const len = list.length;
  for (let i = 0; i < len; i++) {
    acc = await fn(acc, list[i]);
  }
  return acc;
};

const reduceFirstP = curry2((fn, list) => reduceP(fn, list[0])(rest(list)));

const reverseDifference = flip(difference);

const mergeDeepWithArray = mergeDeepWith((left, right) => isArray(left) && isArray(right) ? [...left, ...right] : right);

const fnOr = curry2((fn1, fn2) => (...args) => fn1(...args) || fn2(...args));

const from = (n) => slice(n, infinity);

const takeLastUntil = curry2((fn, list) => {
  let i = list.length - 1;
  while (i >= 0 && !fn(list[i])) {
    i -= 1;
  }
  if (i === -1) i = 0;
  return slice(i, Infinity, list);
});

// const toPairsSorted = curry2((arr, obj) => {
//   let res = [];
//   arr.forEach(key => res.push([key, obj[key]]));
//   const firstKeys = intersection(arr, keys(obj));
//   const otherKeys = difference(arr, keys(obj));
//   //TODO Finish
// });

// fn has signature: (acc, currentValue, currentIndex, arr)
const reduceIndexed = curry3((fn, initialValue, arr) => arr.reduce(fn, initialValue));

// Put the first argument of a 3 arguments function as the last argument.
const budge = (fn) => curry3((...args) => {
  args.unshift(args.pop());
  return fn(...args);
});
// Map over promises concurrently (By Sindre Sorhus)
const pMap = flip(pMapOrig);

const keep = curry2((list, arr) => {
  const res = [];
  list.forEach(n => res.push(arr[n]))
});
const randomList = (len, ...args) => {
  const res = [];
  for (let i = 0; i < len; i++) {
    res.push(random(...args));
  }

  return res;
};
const keepRandom = curry2((n, arr) => randomList(n, 0, arr.length - 1).map(i => arr[i]));

const equals = curry2(deepEql);
// Transform an object according to specifications, which are provided with another
// object with a similar structure and only new values and functions (applied to old values)
// Ex: transform({a: 1, b: {c: inc}}, {a:"bye", d:42, b:{c:7}}) === {a:1, d:42, b:{c:8}}
const transform = curry2( (spec, obj) => {
  let res = {}, key, objVal, specVal, specType;
  for( key in obj ) res[key] = obj[key];
  for( key in spec ) {
    if( key.includes('.') ) {
      spec = assocDotPath(key, spec[key], {});
      key = dotStringToPath(key)[0];
    }
    specVal = spec[key];
    objVal = obj[key];
    specType = typeof specVal;
    res[key] = specType === 'function'
      ? specVal(objVal)
      : specType === 'object' && typeof objVal === 'object' && ! isArrayLike(objVal)
        ? transform(specVal, objVal)
        : specVal;
  }
  return res;
});
// Check if all elements of a list are equals.
const areEquals = (list) => all(equals(list[0]), list);
// Check if all arguments are equals.
const allEquals = unapply(areEquals);

// Merges tables (arrays of objects).
const mergeAllTables = reduceFirst(zipWith(merge));
// `unapply` takes a function which takes a single array argument, and returns a function which
// takes any number of positional arguments and passes these arguments as an array.
// `binary` wraps a function of any arity (including nullary) in a function that accepts exactly 2 parameters.
const mergeTables = binary(unapply(mergeAllTables));

const mergeAllTablesNotBlank = pipe(
  filter(notBlank),
  mergeAllTables,
);
const mergeTablesNotBlank = curry2( (t1, t2) => mergeAllTablesNotBlank([t1, t2]) );

// Removes an element from an array.
const discard = curry2( (val, list) => without([val], list) );
// Make a table (array of objects) out of an array, with the key provided as a first argument.
const tablify = curry( (key, obj) =>
  map(objOf(key), obj)
);
// Returns a function that applies arguments to several functions and returns an array of results.
const collect = unapply(juxt);

const updateWhere = curry3( (fn, where, list) => list.map( val => where(val) ? fn(val) : val ) );

const reduceSteps = curry3( (fn, ary, obj) => reduce(flip(fn), obj, ary) );

const dissocAll = reduceSteps(dissoc);

// Reverses the arguments as compared to`difference`.
const added = (b, a) => difference(a, b);
const removed = flip(added);
// Probably not useful: reduces legibility and lacks flexibility.
// const collectFilterMap = pipe(
//   map( fns => pipe(fns[0], map(fns[1])) ),
//   juxt,
// );
const putFirst = curry2( (element, list) => pipe(discard(element), prepend(element))(list) );

const listMax = apply(Math.max);
const listMin = apply(Math.min);

const zipObjMap = curry2( (fn, list) => zipObj(list, map(fn, list)) );

const nthRoot = curry2( (nth, x) => Math.pow(x, 1/nth) );

const geoMean = (list) => pipe(
  product,
  nthRoot(list.length),
)(list);

const round = curry2( (dec, x) => Math.round( x * 10**dec ) / 10**dec);

const percent = curry2(
  (decimal, x) =>
    pipe(
      multiply(100),
      round(decimal),
      concat('%'),
    )(x)
);
// Creates a parser of function names separated py the pipe charater : 'fn1|fn2|fn3'
// These are sometimes called "filters" in template languages.
// fns is an object with functions as properties.
const splitPipe = fns => pipe(
  split('|'),
  map(str => fns[str]),
  filter(isFunction),
  ifElse(isEmpty, always(ident), apply(pipe)),
);

const ifDefinedElse = curry3( (fn, value, arg) => arg !== undefined ? fn(arg) : value );

const whenDefined = unless(isUndefined);

const unlessEmpty = unless(isEmpty);

const anyValue = curry2( (condition, obj) => any(condition, values(obj)));

const hsl = (h, s, l) => `hsl(${h},${s}%,${l}%)`;
const gradient = (from, to) => `linear-gradient(${from}, ${to})`;

const reduceTemplate = curry2( (template, iterable) => reduce( (acc, o) => acc + template(o), '', iterable));

const deIndex = curry2( (fieldName, index) => {
  let key, result = [];
  for(key in index) {
    result.push({...index[key], [fieldName]:key});
  }
  return result;
});
const indexByProp = curry2 ( (property, list) => indexBy(prop(property), list) );

const reIndex = curry3( (oldIndexProp, newIndexProp, index) => {
  let key, result = {};
  for(key in index) {
    const obj = index[key];
    const indexValue = obj[newIndexProp];
    result[indexValue] = {...obj, [oldIndexProp]:key};
  }
  return result;
});

const lacks = complement(contains);

const transposeKeys = (obj1) => {
  let acc = {};
  for(const key1 in obj1) {
    const obj2 = obj1[key1];
    for(const key2 in obj2) {
      if( ! acc[key2]) acc[key2] = {};
      acc[key2][key1] = obj2[key2];
    }
  }
  return acc;
};

// Does listB contains all the element of listA?
const lacksElementsOf = curry2( (listA, listB) => {
  for(let a of listA) {
    if (lacks(a, listB)) return true;
  }
  return false;
});

const haveSameElements = curry2( (a, b) => ! lacksElementsOf(a, b) && ! lacksElementsOf(b, a));

const toArray = (obj, fn) => {
  let acc = [], key;
  for(key in obj) {
    if( obj.hasOwnProperty(key) ) {
      const value = obj[key];
      acc.push(fn(value, key));
    }
  }
  return acc;
};
const mapToArray = curry2(flip(toArray));

// `cases` is an array of arrays. Each case has at least two items, the last of witch is the return value.
// The first items of the case are either functions (which will be evaluated as truthy or not) or values.
// If a case is not an array, the evaluation is stopped and this value is returned.
const switchValue = curry2( (cases, val) => {
  let _case;
  for(_case of cases) {
    if( Array.isArray(_case) ) {
      const length = _case.length;
      for(let i=0; i < length - 1; i++) {
        const cond = _case[i];
        const result = _case[length - 1];
        if( typeof cond === 'function' ) {
          if( cond(val) ) return result;
        } else {
          if( val === cond ) return result;
        }
      }
    } else {
      return _case;
    }

  }
  return val;
});

const viblPure = {
  added, allEquals, anyValue, appendStr, assocColPath, assocDotPath, areEquals, haveSameElements,
  bindAll, bindAllDeep, budge,
  collect, colPath, combine, concatArray, concatLeft, curry2, curry3, curryFlip, deIndex,
  discard, dissocAll, doesMatch, dotPath, dotStringToPath, equals, equalsAny,
  fnOr, filterKeys, filterP, flipAll, from,
  geoMean, get, getColPath, getDotPath, gradient, hsl,
  ifDefinedElse, ident, indexByProp, interleave, isBlank, isEmpty, isFunction,
  isNegative, isNumber, isObject, isObjectLike, isPlainObject, isString,
  keep, keepRandom,
  lacksElementsOf, lensDotPath, lineBreaksToSpace, listMax, listMin, log,
  mapDeep, mapIf, mapIndex, mapKeys, mapValues, mergeDeepWithArray, mergeLeft,
  mergeAllTables, mergeAllTablesNotBlank, mergeTables, mergeTablesNotBlank,
  notBlank, notEmpty, notMatch, nthRoot,
  mapToArray, overlaps,
  percent, pipeD, pipeLog, pMap, prefixLine, preIntersperse, putFirst,
  random, rangeMap, rangeStep, reduceFirst, reduceFirstP, reduceIndexed, reduceP,
  reduceSteps, reduceTemplate, reIndex, removed, removeShortest, rest, reverseDifference, round,
  splitLinesTrim, splitPipe, splitProperties, store, switchValue,
  toArray, tablify, takeLastUntil, toNumber, transform, transposeKeys, trimIfString,
  unlessEmpty, updateWhere,
  whenDefined,
  zipObjMap,
};

module.exports = viblPure;
