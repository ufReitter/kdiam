import { Renderer } from '../attributes';
import { Prim } from './prim';
import { ResultsConvention } from './rcon';
const rCon = new ResultsConvention();

const attr = Renderer.ATTRIBUTES;

export class Sheet extends Prim {
  gauge: number;
  strainTerm: number;
  blank: number;
  blankWidth: number;
  blankLength: number;
  partWidth: number;
  partLength: number;
  partHeight: number;
  mass: number;
  temperature: number;
  spCountUsed: number;
  invalid: number;
  sptptr: number;
  constructor(ptr) {
    super(ptr);
  }
  update(res) {
    this.gauge = res[this.ptr];
    this.strainTerm = res[this.ptr + 1];
    this.blank = res[this.ptr + 2];
    this.blankWidth = res[this.ptr + 3];
    this.blankLength = res[this.ptr + 4];
    this.partWidth = res[this.ptr + 5];
    this.partLength = res[this.ptr + 6];
    this.partHeight = res[this.ptr + 7];
    this.mass = res[this.ptr + 8];
    this.temperature = res[this.ptr + 9];
    this.spCountUsed = res[this.ptr + 10];
    this.invalid = res[this.ptr + 11];
    this.sptptr = res.length - res[8] * rCon.sheetPt - res[9] * rCon.dim;
  }
  draw(ctx, res) {
    if (this.opacity === 0) return;
    let alternator = false;
    const ptr = this.sptptr;
    ctx.lineWidth = 0.5;
    for (let i = 0; i < this.spCountUsed - 1; i++) {
      alternator = !alternator;
      // ctx.strokeStyle = alternator ? 'purple' : 'red';
      const x0 = res[ptr + i * rCon.sheetPt + 0];
      const y0 = res[ptr + i * rCon.sheetPt + 1];
      const x1 = res[ptr + i * rCon.sheetPt + 2];
      const y1 = res[ptr + i * rCon.sheetPt + 3];
      const value = res[ptr + i * rCon.sheetPt + 4];
      if (value >= 10000) return;
      const x2 = res[ptr + i * rCon.sheetPt + 7];
      const y2 = res[ptr + i * rCon.sheetPt + 8];
      const x3 = res[ptr + i * rCon.sheetPt + 5];
      const y3 = res[ptr + i * rCon.sheetPt + 6];
      if (res[ptr + i * rCon.sheetPt + 2] === 0) break;
      const color = colorFromValue(
        value || 0,
        'maxxx',
        this.strainTerm,
        0,
        -this.strainTerm,
      );
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x0 * ctx.s, y0 * ctx.s);
      ctx.lineTo(x1 * ctx.s, y1 * ctx.s);
      ctx.lineTo(x2 * ctx.s, y2 * ctx.s);
      ctx.lineTo(x3 * ctx.s, y3 * ctx.s);
      ctx.closePath();
      ctx.stroke();
      ctx.fill();
    }
  }
}

function colorFromValue(value, mode, min, nrm, max) {
  let theme = 'dark';
  let delta, mu, cRes, cDo0, cDo1;

  switch (mode) {
    case 'min':
      if (value >= max) {
        return attr.ntr[theme].fill;
      }
      if (value <= min) {
        return attr.min[theme].fill;
      }

      delta = max - min;
      mu = value - min;
      cDo0 = hexToRgb(attr.ntr[theme].fill);
      cDo1 = hexToRgb(attr.min[theme].fill);
      value = mu / delta;
      value = Math.pow(value, 1);
      break;
    case 'max':
      if (value >= max) {
        return attr.max[theme].fill;
      }
      if (value <= min) {
        return attr.ntr[theme].fill;
      }
      delta = max - min;
      mu = max - value;
      cDo0 = hexToRgb(attr.ntr[theme].fill);
      cDo1 = hexToRgb(attr.max[theme].fill);
      value = mu / delta;
      value = Math.pow(value, 1);
      break;
    default:
      if (value >= max) {
        return attr.max[theme].fill;
      }
      if (value <= min) {
        return attr.min[theme].fill;
      }
      if (value === nrm) {
        return attr.nrm[theme].fill;
      }
      if (value > nrm) {
        delta = max - nrm;
        mu = value - nrm;
        cDo0 = hexToRgb(attr.max[theme].fill);
      }
      if (value < nrm) {
        delta = nrm - min;
        mu = nrm - value;
        cDo0 = hexToRgb(attr.min[theme].fill);
      }
      cDo1 = hexToRgb(attr.nrm[theme].fill);
      value = mu / delta;
      value = Math.pow(value, 1);
      break;
  }

  function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16) / 255,
          g: parseInt(result[2], 16) / 255,
          b: parseInt(result[3], 16) / 255,
        }
      : null;
  }
  function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }
  function rgbToHex(r, g, b) {
    return (
      '#' +
      componentToHex(Math.floor(r * 255)) +
      componentToHex(Math.floor(g * 255)) +
      componentToHex(Math.floor(b * 255))
    );
  }

  cRes = {
    r: cDo0.r * value + cDo1.r * (1 - value),
    g: cDo0.g * value + cDo1.g * (1 - value),
    b: cDo0.b * value + cDo1.b * (1 - value),
  };

  return rgbToHex(cRes.r, cRes.g, cRes.b);
}
