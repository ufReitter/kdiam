// declare var global: any;

console.log('Global Prototypes loaded');

interface Number {
  grad(): number;
  sgn(): number;
  runde(dez: number): number;
  round(places: number): number;
}
interface Array<T> {
  pushUnique(item: any): boolean;
}

Number.prototype.grad = function () {
  return (this * 180) / Math.PI;
};
Number.prototype.sgn = function () {
  if (this > 0) return 1;
  else if (this < 0) return -1;
  else return 0;
};
Number.prototype.runde = function (dez) {
  dez = Math.pow(10, dez);
  return Math.round(this * dez) / dez;
};

Number.prototype.round = function (places) {
  if (this < 0.0000001 && this > -0.0000001) {
    return 0;
  } else {
    let numStr = this + 'e+' + places;
    return Number(Math.round(Number(numStr)) + 'e-' + places);
  }
};
Array.prototype.pushUnique = function (item: any) {
  if (item.id) {
    if (!this.find((it) => it.id === item.id)) {
      this.push(item);
      return true;
    }
  } else {
    if (!this.find((it) => it === item)) {
      this.push(item);
      return true;
    }
  }
  return false;
};
/* 
window.console.prettyPrint = function () {
  for (var i = 0; i < arguments.length; i++) {
    let obj = arguments[i];
    let keys = propertiesToArray(arguments[i]) || [];
    let data = [];
    let str = '';
    const maxLength = Math.max(...keys.map((it) => it.length));
    for (const key of keys) {
      let value;
      const parts = key.split('.');
      switch (parts.length) {
        case 1:
          value = obj[key];
          break;
        case 2:
          value = obj[parts[0]][parts[1]];
          break;
        case 3:
          value = obj[parts[0]][parts[1]][parts[2]];
          break;
        case 4:
          value = obj[parts[0]][parts[1]][parts[2]][parts[3]];
          break;

        default:
          break;
      }

      if (typeof value === 'string') {
        value = value.replace(/==/g, '');
      }
      let missing = maxLength - key.length;
      const entry = {
        key: key,
        viewKey: ' '.repeat(missing) + key,
        value: value,
      };
      data.push(entry);
    }
    for (const it of data) {
      str += `${it.viewKey}: ${it.value}\n`;
    }

    console.log(str);

    let str2 =
      '\n' +
      JSON.stringify(arguments[i])
        .replace(/",/g, '\n')
        .replace(/":"/g, ':  ')
        .replace(/"/g, '')
        .replace(/\{/g, '')
        .replace(/\}/g, '');

    const regex = new RegExp('\n(.*?):  ', 'gi');
    let matches,
      output = [];
    while ((matches = regex.exec(str2))) {
      output.push(matches[1]);
    }

    for (const it of output) {
      let missing = maxLength - it.length;

      str2 = str2.replace(it, ' '.repeat(missing) + it);
    }
  }
}; */

function propertiesToArray(obj: any) {
  const isObject = (val) => typeof val === 'object' && !Array.isArray(val);

  const addDelimiter = (a, b) => (a ? `${a}.${b}` : b);
  const paths = (obj = {}, head = '') => {
    let res = [],
      kill = false;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const element = obj[key];
        res.push(key);
        if (
          element !== 0 &&
          element !== '' &&
          element !== false &&
          (element === null || !element)
        ) {
          obj[key] = 'null';
        } else if (element === '') {
          obj[key] = "''";
        }
        if (key === 'idb') {
          kill = true;
        }
      }
    }
    if (kill) {
      return [];
    }
    return Object.entries(obj).reduce((product, [key, value]) => {
      let fullPath = addDelimiter(head, key);
      return isObject(value)
        ? product.concat(paths(value, fullPath))
        : product.concat(fullPath);
    }, []);
  };

  return paths(obj);
}
