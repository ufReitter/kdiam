var testEmpty = {};
var testFull = {
  test: 99,
  state: { value: 66, input: true },
  figure: {},
};

let removeEmpty = true;

export module Utils {
  var _global =
    typeof self !== 'undefined'
      ? self
      : typeof window !== 'undefined'
      ? window
      : global;

  var _hasOwn = {}.hasOwnProperty;

  function hasOwn(obj, prop) {
    return _hasOwn.call(obj, prop);
  }

  export function sortArrayBy(array, key, order) {
    return array.sort(function (x, y) {
      const a = x[key];
      const b = y[key];
      if (order === 'asc') {
        if (a > b) return 1;
        if (a < b) return -1;
      } else {
        if (a > b) return -1;
        if (a < b) return 1;
      }
    });
  }

  export function notEmpty(obj) {
    let notEmpty = false;

    for (const key in obj) {
      if (hasOwn(obj, key)) {
        notEmpty = true;
      }
    }

    return notEmpty;
  }

  var keys = Object.keys;
  var concat = [].concat;
  export function flatten(a) {
    return concat.apply([], a);
  }

  var intrinsicTypes =
    'Boolean,String,Date,RegExp,Blob,File,FileList,ArrayBuffer,DataView,Uint8ClampedArray,ImageData,Map,Set'
      .split(',')
      .concat(
        flatten(
          [8, 16, 32, 64].map(function (num) {
            return ['Int', 'Uint', 'Float'].map(function (t) {
              return t + num + 'Array';
            });
          }),
        ),
      )
      .filter(function (t) {
        return _global[t];
      })
      .map(function (t) {
        return _global[t];
      });

  var counter = 0;

  export function deepClone(any, removeEmpty?) {
    if (!any || typeof any !== 'object') {
      return any;
    }
    let rv;
    if (Array.isArray(any)) {
      rv = [];
      for (let i = 0, l = any.length; i < l; ++i) {
        rv.push(deepClone(any[i], removeEmpty));
      }
    } else if (intrinsicTypes.indexOf(any.constructor) >= 0) {
      rv = any;
    } else {
      rv = any.constructor ? Object.create(any.constructor.prototype) : {};
      for (const key in any) {
        if (
          Object.prototype.hasOwnProperty.call(any, key) &&
          key !== 'parent'
        ) {
          if (removeEmpty === true) {
            if (notEmpty(any[key]) || typeof any[key] === 'number') {
              rv[key] = deepClone(any[key], false);
            }
          } else {
            rv[key] = deepClone(any[key], removeEmpty);
          }
        }
      }
    }
    return rv;
  }

  export function compareTreeLevel(level) {
    return function (a, b) {
      a = a.elm.num[level];
      b = b.elm.num[level];
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    };
  }
}
