export module Renderer {
  export var ATTRIBUTES = {
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
      // fill: '#8e9dc0',
      dark: {
        fill: '#8e9dc0',
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
      // fill: '#dd1133',
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
        stroke: '#999',
      },
      light: {
        fill: '#888',
        stroke: '#98a',
      },
      lineWidth: 1,
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
