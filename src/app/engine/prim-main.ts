export module PrimMain {
  export class Prim {
    kind = 'Prim';
    svgc: any;
    def: any;
    id: string;
    theme: any;
    role: string;
    style: any;
    layer: number;
    hidden: boolean;
    key: string;
    unit: string;
    pos: string;
    color: string;
    c: string;
    v: string;
    x: number;
    y: number;
    xy: number;
    r: number;
    r1: number;
    r2: number;
    zrot: number;
    phi: number;
    orient: number;
    turn: number;
    refs: any;
    p0: Pt;
    p1: Pt;
    p2: Pt;
    p3: Pt;
    cPt: Pt;
    dims: Dim[];
    arg1: any;
    arg2: any;
    circle: Circle;
    path: Circle;
    length: number;
    width: number;
    height: number;
    s: number;
    text: string;
    points: Pt[];
    qualities: any;
    featureIndex: number;
    svg: any;
    transform: string;
    log: boolean;
    logs: any[];
    report: any;

    svgns = 'http://www.w3.org/2000/svg';
    constructor(svgc: any, def: any, fig: any) {
      this.kind = def.kind;
      this.svgc = svgc;
      this.def = def;
      this.theme = 'dark';
    }
    init(def) {
      for (const key in def) {
        if (def.hasOwnProperty(key)) {
          this[key] = def[key];
        }
      }
    }
    changes(def) {
      for (const key in def) {
        if (def.hasOwnProperty(key)) {
          this[key] = def[key];
          if (this.report) {
          }
        }
      }
    }
    reporting() {}
    attributes(theme) {
      this.theme = theme;
      let a = PrimMain.attr[this.style] || PrimMain.attr[this.c] || PrimMain.attr.invis;
      this.svg.setAttributeNS(null, 'fill', a[this.theme].fill);
      this.svg.setAttributeNS(null, 'stroke', a[this.theme].stroke);
      for (const key in a) {
        if (a.hasOwnProperty(key)) {
          const element = a[key];
          if (key !== 'dark' && key !== 'light') {
            this.svg.setAttributeNS(null, key, a[key]);
          }
        }
      }
    }
  }
  export class Pt extends Prim {
    constructor(svgc: any, def: any, fig: any) {
      super(svgc, def, fig);
      this.init(def);
    }
    init(def) {
      super.init(def);
      let svg = document.createElementNS(this.svgns, 'use');
      svg.setAttributeNS(null, 'href', '#' + def.style);
      svg.setAttribute('transform', 'translate(' + def.x + ',' + def.y + ')');
      svg.setAttribute('fill', '#f00');
      svg.setAttributeNS(null, 'vector-effect', 'non-scaling-stroke');
      this.svg = svg;
      this.svgc.appendChild(this.svg);
    }
    changes(def) {
      super.changes(def);
      this.svg.setAttribute(
        'transform',
        'translate(' + def.x + ',' + def.y + ')',
      );
    }
  }
  export class Line extends Prim {
    constructor(svgc: any, def: any, fig: any) {
      super(svgc, def, fig);
      this.init(def);
    }
    init(def) {
      super.init(def);
      let svg = document.createElementNS(this.svgns, 'line');
      svg.setAttributeNS(null, 'x1', def.x1);
      svg.setAttributeNS(null, 'y1', def.y1);
      svg.setAttributeNS(null, 'x2', def.x2);
      svg.setAttributeNS(null, 'y2', def.y2);
      svg.setAttributeNS(null, 'vector-effect', 'non-scaling-stroke');
      this.svg = svg;
      this.svgc.appendChild(this.svg);
    }
    changes(def) {
      super.changes(def);
      this.svg.setAttributeNS(null, 'x1', def.x1);
      this.svg.setAttributeNS(null, 'y1', def.y1);
      this.svg.setAttributeNS(null, 'x2', def.x2);
      this.svg.setAttributeNS(null, 'y2', def.y2);
    }
  }
  export class Circle extends Prim {
    constructor(svgc: any, def: any, fig: any) {
      super(svgc, def, fig);
      this.init(def);
    }
    init(def) {
      super.init(def);
      this.svg = document.createElementNS(this.svgns, 'circle');

      this.svgc.appendChild(this.svg);
    }
    changes(def) {
      super.changes(def);
    }
  }
  export class Path extends Prim {
    constructor(svgc: any, def: any, fig: any) {
      super(svgc, def, fig);
      this.init(def);
    }
    init(def) {
      super.init(def);
      let svg = document.createElementNS(this.svgns, 'path');
      svg.setAttributeNS(null, 'd', def.d);
      svg.setAttributeNS(null, 'vector-effect', 'non-scaling-stroke');
      this.svg = svg;
      this.svgc.appendChild(this.svg);
    }
    changes(def) {
      super.changes(def);
      this.svg.setAttributeNS(null, 'd', def.d);
    }
  }
  export class Act extends Prim {
    masvg: any;
    pusvg: any;
    constructor(svgc: any, def: any, fig: any) {
      super(svgc, def, fig);
      this.init(def);
    }
    init(def) {
      super.init(def);
      this.svg = document.createElementNS(this.svgns, 'g');
      this.masvg = document.createElementNS(this.svgns, 'path');
      this.pusvg = document.createElementNS(this.svgns, 'path');
      this.masvg.setAttributeNS(null, 'id', def.id + 'ma');
      const origin = document.createElementNS(this.svgns, 'use');
      origin.setAttributeNS(null, 'href', '#cross');
      this.masvg.appendChild(origin);
      this.pusvg.setAttributeNS(null, 'id', def.id + 'pu');
      this.masvg.setAttributeNS(null, 'd', this.makeD(def.c1));
      this.pusvg.setAttributeNS(null, 'd', this.makeD(def.c2));
      this.masvg.setAttributeNS(null, 'vector-effect', 'non-scaling-stroke');
      this.pusvg.setAttributeNS(null, 'vector-effect', 'non-scaling-stroke');
      const mam = document.createElementNS(this.svgns, 'use');
      const pum = document.createElementNS(this.svgns, 'use');
      mam.setAttributeNS(null, 'href', '#' + def.id + 'ma');
      pum.setAttributeNS(null, 'href', '#' + def.id + 'pu');
      mam.setAttributeNS(null, 'transform', 'scale (-1, 1)');
      pum.setAttributeNS(null, 'transform', 'scale (-1, 1)');
      this.svg.appendChild(this.masvg);
      this.svg.appendChild(this.pusvg);
      this.svg.appendChild(mam);
      this.svg.appendChild(pum);
      this.svgc.appendChild(this.svg);
    }
    changes(def) {
      super.changes(def);
      this.masvg.setAttributeNS(null, 'd', this.makeD(def.c1));
      this.pusvg.setAttributeNS(null, 'd', this.makeD(def.c2));
      this.svg.setAttributeNS(null, 'fill', 'none');
    }
    makeD(co) {
      let d;
      if (co.q === 0) {
        d =
          'M ' +
          (co.cx + co.r) +
          ' ' +
          co.cy +
          ' A ' +
          co.r +
          ' ' +
          co.r +
          ' 0 0 1 ' +
          co.cx +
          ' ' +
          (co.cy + co.r);
      }
      if (co.q === 2) {
        d =
          'M ' +
          co.cx +
          ' ' +
          (co.cy - co.r) +
          ' A ' +
          co.r +
          ' ' +
          co.r +
          ' 0 0 0 ' +
          (co.cx - co.r) +
          ' ' +
          co.cy;
      }
      return d;
    }
  }
  export class Die extends Prim {
    constructor(svgc: any, def: any, fig: any) {
      super(svgc, def, fig);
    }
    init(def) {
      super.init(def);
      this.svg = document.createElementNS(this.svgns, 'g');
      this.svgc.appendChild(this.svg);
    }
    changes(def) {
      super.changes(def);
    }
  }
  export class Sheet extends Prim {
    masvg: any;
    pusvg: any;
    constructor(svgc: any, def: any, fig: any) {
      super(svgc, def, fig);
      this.init(def);
    }
    init(def) {
      super.init(def);
      this.svg = document.createElementNS(this.svgns, 'g');
    }
    changes(def) {
      super.changes(def);
    }
    makeD(co) {
      let d = '';
      return d;
    }
  }
  export class Dim extends Prim {
    constructor(svgc: any, def: any, fig: any) {
      super(svgc, def, fig);
    }
    init(def) {
      super.init(def);
      this.svg = document.createElementNS(this.svgns, 'g');
    }
    changes(def) {}
  }
  export class Report extends Prim {
    constructor(svgc: any, def: any, fig: any) {
      super(svgc, def, fig);
      this.init(def);
    }
    init(def) {
      super.init(def);
      let svg = document.createElementNS(this.svgns, 'text');

      svg.setAttribute('x', '10');
      svg.setAttribute('y', '20');
      svg.textContent = 'xxxxxxxxxxxxx';

      this.svg = svg;
      this.svgc.appendChild(this.svg);
    }
    changes(def) {
      super.changes(def);
      this.svg.svg.textContent = 'yyyyyyyyyyy';
    }
  }
  export class Port extends Prim {
    constructor(svgc: any, def: any, fig: any) {
      super(svgc, def, fig);
    }
    init(def) {
      super.init(def);
      let ys = document.createElementNS(this.svgns, 'line');
      ys.setAttributeNS(null, 'vector-effect', 'non-scaling-stroke');
      ys.setAttributeNS(null, 'stroke-width', '1');
      ys.setAttributeNS(null, 'stroke-linecap', 'round');
      ys.setAttributeNS(null, 'stroke-dasharray', '18,8,4,8');
      this.svgc.appendChild(ys);
    }
    changes(def) {
      super.changes(def);
      this.svg.setAttributeNS(null, 'x1', def.x1);
      this.svg.setAttributeNS(null, 'y1', def.y1);
      this.svg.setAttributeNS(null, 'x2', def.x2);
      this.svg.setAttributeNS(null, 'y2', def.y2);
    }
  }
  export class Input extends Prim {
    constructor(svgc: any, def: any, fig: any) {
      super(svgc, def, fig);
    }
    init(def) {
      super.init(def);
      this.svg = document.createElementNS(this.svgns, 'g');
    }
    changes(def) {
      super.changes(def);
    }

    attributes(theme) {}
  }
  export var attr = {
    viewbox: {
      dark: {
        fill: '#ff7373',
        stroke: '#ff7373',
      },
      light: {
        fill: '#cc1c1c',
        stroke: '#cc1c1c',
      },
      'stroke-width': '5',
      r: '0.001',
      'stroke-dasharray': 'none',
      opacity: '1.0',
    },
    fore: {
      dark: {
        fill: '#e8e8e8',
        stroke: '#e8e8e8',
      },
      light: {
        fill: '#222',
        stroke: '#222',
      },
    },
    primary: {
      dark: {
        fill: '#ffee00',
        stroke: '#ffee00',
      },
      light: {
        fill: '#ff2200',
        stroke: '#ff2200',
      },
    },
    accent: {
      dark: {
        fill: '#ffee00',
        stroke: '#ffee00',
      },
      light: {
        fill: '#ff2200',
        stroke: '#ff2200',
      },
    },
    warn: {
      dark: {
        fill: '#ffee00',
        stroke: '#ffee00',
      },
      light: {
        fill: '#ff2200',
        stroke: '#ff2200',
      },
    },
    line: {
      dark: {
        fill: 'none',
        stroke: '#e8e8e8',
      },
      light: {
        fill: 'none',
        stroke: '#222',
      },
    },
    min: {
      dark: {
        fill: '#11aa22',
        stroke: '#11dd33',
      },
      light: {
        fill: '#0000ff',
        stroke: '#0000ff',
      },
    },
    nrm: {
      dark: {
        fill: '#3355dd',
        stroke: '#335599',
      },
      light: {
        fill: '#00ff00',
        stroke: '#00ff00',
      },
    },
    act: {
      dark: {
        fill: 'none',
        stroke: '#1866db',
      },
      light: {
        fill: 'none',
        stroke: '#1866db',
      },
      'stroke-width': '1',
    },
    max: {
      dark: {
        fill: '#dd1133',
        stroke: '#ff0000',
      },
      light: {
        fill: '#ff0000',
        stroke: '#ff0000',
      },
    },
    ntr: {
      dark: {
        fill: '#666677',
        stroke: '#ff0000',
      },
      light: {
        fill: '#ff0000',
        stroke: '#ff0000',
      },
    },
    dot: {
      dark: {
        fill: '#ff7373',
        stroke: '#ff7373',
      },
      light: {
        fill: '#cc1c1c',
        stroke: '#cc1c1c',
      },
      'stroke-width': '5',
      r: '0.001',
      'stroke-dasharray': 'none',
      opacity: '1.0',
    },
    cross: {
      dark: {
        fill: '#ff7373',
        stroke: '#ff7373',
      },
      light: {
        fill: '#cc1c1c',
        stroke: '#cc1c1c',
      },
      'stroke-width': '5',
      r: '0.001',
      'stroke-dasharray': 'none',
      opacity: '1.0',
    },
    origin: {
      dark: {
        fill: '#ff7373',
        stroke: '#ff7373',
      },
      light: {
        fill: '#cc1c1c',
        stroke: '#cc1c1c',
      },
      'stroke-width': '7',
      r: '0.001',
      'stroke-dasharray': 'none',
      opacity: '1.0',
    },
    edge: {
      dark: {
        fill: '#888',
        stroke: '#eee',
      },
      light: {
        fill: '#888',
        stroke: '#212121',
      },
      'stroke-width': '1.75',
      'stroke-linecap': 'round',
      'stroke-dasharray': 'none',
      opacity: '1.0',
    },
    cut: {
      dark: {
        fill: '#e25',
        stroke: '#e32',
      },
      light: {
        fill: '#888',
        stroke: '#212121',
      },
      'stroke-width': '1.5',
      'stroke-linecap': 'round',
      'stroke-dasharray': 'none',
      opacity: '1.0',
    },
    steel: {
      dark: {
        fill: '#cde',
        stroke: '#3ae',
      },
      light: {
        fill: '#cde',
        stroke: '#29d',
      },
      'stroke-width': '1.5',
      'stroke-linecap': 'round',
      'stroke-dasharray': 'none',
      opacity: '1.0',
    },
    subs: {
      dark: {
        fill: '#888',
        stroke: '#bbb',
      },
      light: {
        fill: '#888',
        stroke: '#444',
      },
      'stroke-width': '1',
      'stroke-linecap': 'round',
      'stroke-dasharray': 'none',
      opacity: '1.0',
    },
    din: {
      dark: {
        fill: '#bbb',
        stroke: '#bbb',
      },
      light: {
        fill: '#888',
        stroke: '#444',
      },
      'stroke-width': '1',
      'stroke-linecap': 'round',
      'stroke-dasharray': 'none',
      opacity: '1.0',
    },
    center: {
      dark: {
        fill: '#888',
        stroke: '#b9c',
      },
      light: {
        fill: '#888',
        stroke: '#98a',
      },
      'stroke-width': '1',
      'stroke-linecap': 'round',
      'stroke-dasharray': '18,8,4,8',
      opacity: '1.0',
    },
    indexCenter: {
      dark: {
        fill: 'none',
        stroke: '#b9c',
      },
      light: {
        fill: 'none',
        stroke: '#98a',
      },
      'stroke-width': '1',
      'stroke-linecap': 'round',
      'stroke-dasharray': '20,8,4,8,4,8',
      opacity: '1.0',
    },
    indexContur: {
      dark: {
        fill: 'none',
        stroke: '#bbb',
      },
      light: {
        fill: 'none',
        stroke: '#888',
      },
      'stroke-width': '1',
      'stroke-linecap': 'round',
      'stroke-dasharray': 'none',
      opacity: '1.0',
    },
    dimension: {
      dark: {
        fill: '#888',
        stroke: '#ccc',
      },
      light: {
        fill: '#888',
        stroke: '#444',
      },
      'stroke-width': '1',
      'stroke-linecap': 'round',
      'stroke-dasharray': 'none',
      opacity: '1.0',
    },
    invis: {
      dark: {
        fill: '#888',
        stroke: '#eee',
      },
      light: {
        fill: '#888',
        stroke: '#212121',
      },
      r: '0.1',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      opacity: '0',
    },
  };
}

function colorFromValue(value, mode, min, nrm, max) {
  let theme = 'dark';
  let delta, mu, cRes, cDo0, cDo1;

  switch (mode) {
    case 'min':
      if (value >= max) {
        return PrimMain.attr.ntr[theme].fill;
      }
      if (value <= min) {
        return PrimMain.attr.min[theme].fill;
      }

      delta = max - min;
      mu = value - min;
      cDo0 = hexToRgb(PrimMain.attr.ntr[theme].fill);
      cDo1 = hexToRgb(PrimMain.attr.min[theme].fill);
      value = mu / delta;
      value = Math.pow(value, 1);
      break;
    case 'max':
      if (value >= max) {
        return PrimMain.attr.max[theme].fill;
      }
      if (value <= min) {
        return PrimMain.attr.ntr[theme].fill;
      }
      delta = max - min;
      mu = max - value;
      cDo0 = hexToRgb(PrimMain.attr.ntr[theme].fill);
      cDo1 = hexToRgb(PrimMain.attr.max[theme].fill);
      value = mu / delta;
      value = Math.pow(value, 1);
      break;
    default:
      if (value >= max) {
        return PrimMain.attr.max[theme].fill;
      }
      if (value <= min) {
        return PrimMain.attr.min[theme].fill;
      }
      if (value === nrm) {
        return PrimMain.attr.nrm[theme].fill;
      }
      if (value > nrm) {
        delta = max - nrm;
        mu = value - nrm;
        cDo0 = hexToRgb(PrimMain.attr.max[theme].fill);
      }
      if (value < nrm) {
        delta = nrm - min;
        mu = nrm - value;
        cDo0 = hexToRgb(PrimMain.attr.min[theme].fill);
      }
      cDo1 = hexToRgb(PrimMain.attr.nrm[theme].fill);
      value = mu / delta;
      value = Math.pow(value, 1);
      break;
  }

  cRes = {
    r: cDo0.r * value + cDo1.r * (1 - value),
    g: cDo0.g * value + cDo1.g * (1 - value),
    b: cDo0.b * value + cDo1.b * (1 - value),
  };

  return rgbToHex(cRes.r, cRes.g, cRes.b);
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
