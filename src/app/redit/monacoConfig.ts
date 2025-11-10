import { NgxMonacoEditorConfig } from './monaco-editor/config';

declare const monaco: any;

export const monacoConfig: NgxMonacoEditorConfig = {
  baseUrl: 'assets',
  defaultOptions: { scrollBeyondLastLine: false },
  onMonacoLoad() {
    monaco.editor.defineTheme('vs-dark-plus', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: '', foreground: '8fd8ff' },
        { token: 'number', foreground: 'e7e79a' },
        // { token: 'keyword', foreground: 'DCDCAA' },
        { token: 'key', foreground: 'f17373' },
        { token: 'variable', foreground: 'f17373' },
        { token: 'meta.definition.variable.name', foreground: 'f17373' },
        { token: 'support.variable', foreground: 'f17373' },
        { token: 'entity.name.variable', foreground: 'f17373' },
      ],
      colors: {
        'editor.foreground': '#FFFFFF',
        'editor.background': '#181818',
      },
    });

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      noLib: false,
      allowNonTsExtensions: true,
      // target: 'esnext',
      // module: 'commonjs',
      // typeRoots: ['types'],
      // types: ['assembly'],
      // lib: ['es2019.array', 'ES2021.String'],
    });

    // Register Latex language
    monaco.languages.register({ id: 'latex' });

    // Register a tokens provider for the language
    monaco.languages.setMonarchTokensProvider('latex', {
      defaultToken: 'invalid',
      // tokenPostfix: '.js',

      keywords: ['left', 'right', 'cdot', 'frac', 'approx'],

      typeKeywords: [
        'any',
        'boolean',
        'number',
        'object',
        'string',
        'undefined',
      ],

      operators: [
        '<=',
        '>=',
        '==',
        '!=',
        '===',
        '!==',
        '=>',
        '+',
        '-',
        '**',
        '*',
        '\\\\',
        '/',
        '%',
        '++',
        '--',
        '<<',
        '</',
        '>>',
        '>>>',
        '&',
        '|',
        '^',
        '!',
        '~',
        '&&',
        '||',
        '?',
        ':',
        '=',
        '+=',
        '-=',
        '*=',
        '**=',
        '/=',
        '%=',
        '<<=',
        '>>=',
        '>>>=',
        '&=',
        '|=',
        '^=',
        '@',
      ],

      // we include these common regular expressions
      symbols: /[=><!~?:&|+\-*\/\^%]+/,
      backslash: /[=><!~?:&|+\-*\\%]+/,
      escapes:
        /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
      digits: /\d+(_+\d+)*/,
      octaldigits: /[0-7]+(_+[0-7]+)*/,
      binarydigits: /[0-1]+(_+[0-1]+)*/,
      hexdigits: /[[0-9a-fA-F]+(_+[0-9a-fA-F]+)*/,

      regexpctl: /[(){}\[\]\$\^|\-*+?\.]/,
      regexpesc:
        /\\(?:[bBdDfnrstvwWn0\\\/]|@regexpctl|c[A-Z]|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4})/,

      // The main tokenizer for our languages
      tokenizer: {
        root: [[/[{}]/, 'delimiter.bracket'], { include: 'common' }],

        common: [
          [/[A-Z][\w\$]*/, ''], // to show class names nicely type.identifier
          // [/[A-Z][\w\$]*/, 'identifier'],

          // whitespace
          { include: '@whitespace' },

          // regular expression: ensure it is terminated before beginning (otherwise it is an opeator)
          [
            /\/(?=([^\\\/]|\\.)+\/([gimsuy]*)(\s*)(\.|;|\/|,|\)|\]|\}|$))/,
            { token: 'regexp', bracket: '@open', next: '@regexp' },
          ],

          // delimiters and operators
          [/[()\[\]]/, '@brackets'],
          [/[<>](?!@symbols)/, '@brackets'],
          [
            /@symbols/,
            {
              cases: {
                '@operators': 'delimiter',
                '@default': '',
              },
            },
          ],

          // numbers
          [/(@digits)[eE]([\-+]?(@digits))?/, 'number.float'],
          [/(@digits)\.(@digits)([eE][\-+]?(@digits))?/, 'number.float'],
          [/0[xX](@hexdigits)/, 'number.hex'],
          [/0[oO]?(@octaldigits)/, 'number.octal'],
          [/0[bB](@binarydigits)/, 'number.binary'],
          [/(@digits)/, 'number'],
          [/(@backslash)/, 'number'],

          // delimiter: after number because of .\d floats
          [/[;,.]/, 'delimiter'],

          // strings
          [/"([^"\\]|\\.)*$/, 'string.invalid'], // non-teminated string
          [/'([^'\\]|\\.)*$/, 'string.invalid'], // non-teminated string
          [/"/, 'string', '@string_double'],
          [/'/, 'string', '@string_single'],
          [/`/, 'string', '@string_backtick'],
          // identifiers and keywords
          [
            /[a-z_$][\w$]*/,
            {
              cases: {
                '@typeKeywords': 'keyword',
                '@keywords': 'keyword',
                '@default': 'identifier',
              },
            },
          ],
        ],

        whitespace: [
          [/[ \t\r\n]+/, ''],
          [/\/\*\*(?!\/)/, 'comment.doc', '@jsdoc'],
          [/\/\*/, 'comment', '@comment'],
          [/\/\/.*$/, 'comment'],
        ],

        comment: [
          [/[^\/*]+/, 'comment'],
          [/\*\//, 'comment', '@pop'],
          [/[\/*]/, 'comment'],
        ],

        jsdoc: [
          [/[^\/*]+/, 'comment.doc'],
          [/\*\//, 'comment.doc', '@pop'],
          [/[\/*]/, 'comment.doc'],
        ],

        // We match regular expression quite precisely
        regexp: [
          [
            /(\{)(\d+(?:,\d*)?)(\})/,
            [
              'regexp.escape.control',
              'regexp.escape.control',
              'regexp.escape.control',
            ],
          ],
          [
            /(\[)(\^?)(?=(?:[^\]\\\/]|\\.)+)/,
            [
              'regexp.escape.control',
              { token: 'regexp.escape.control', next: '@regexrange' },
            ],
          ],
          [
            /(\()(\?:|\?=|\?!)/,
            ['regexp.escape.control', 'regexp.escape.control'],
          ],
          [/[()]/, 'regexp.escape.control'],
          [/@regexpctl/, 'regexp.escape.control'],
          [/[^\\\/]/, 'regexp'],
          [/@regexpesc/, 'regexp.escape'],
          [/\\\./, 'regexp.invalid'],
          [
            /(\/)([gimsuy]*)/,
            [
              { token: 'regexp', bracket: '@close', next: '@pop' },
              'keyword.other',
            ],
          ],
        ],

        regexrange: [
          [/-/, 'regexp.escape.control'],
          [/\^/, 'regexp.invalid'],
          [/@regexpesc/, 'regexp.escape'],
          [/[^\]]/, 'regexp'],
          [
            /\]/,
            { token: 'regexp.escape.control', next: '@pop', bracket: '@close' },
          ],
        ],

        string_double: [
          [/[^\\"]+/, 'string'],
          [/@escapes/, 'string.escape'],
          [/\\./, 'string.escape.invalid'],
          [/"/, 'string', '@pop'],
        ],

        string_single: [
          [/[^\\']+/, 'string'],
          [/@escapes/, 'string.escape'],
          [/\\./, 'string.escape.invalid'],
          [/'/, 'string', '@pop'],
        ],

        string_backtick: [
          [/\$\{/, { token: 'delimiter.bracket', next: '@bracketCounting' }],
          [/[^\\`$]+/, 'string'],
          [/@escapes/, 'string.escape'],
          [/\\./, 'string.escape.invalid'],
          [/`/, 'string', '@pop'],
        ],

        bracketCounting: [
          [/\{/, 'delimiter.bracket', '@bracketCounting'],
          [/\}/, 'delimiter.bracket', '@pop'],
          { include: 'common' },
        ],
      },
    });

    let lines = [
      'class Sum {',
      'constructor(summands: any, sign?: string);',
      '}',
      'class Circle {',
      'r: number;',
      'cPt: Pt;',
      'style: string;',
      'constructor(style: stringm r: any, cPt: Pt);',
      '}',
      'var __: any = {};',
      'interface State {',
      'val: number;',
      'min: number;',
      'max: number;',
      'step: number;',
      'rel: string;',
      'unit: string;',
      'pressed: boolean;',
      'checked: boolean;',
      'warn: boolean;',
      'error: boolean;',
      'format: string;',
      '}',
    ];

    const interf = `
    let u32: any;
    let f64: any;
    let bool: any;
    let vpw = 640;
    let vph = 400;
    let VPW = 640;
    let VPH = 400;
    let combis = [];
    let pts = [];
    let lines = [];
    let arcs = [];
    let trias = [];
    let phlxs = [];
    let dims = [];
    let deltaT: number;
    let log: any;
    let degToRad: any;
    let unchecked: any;
    let displayProps: any;
    class Io {
      val: number;
      min: number,
      max: number,
      step: number,
      pressed: number,
      checked: number,
      constructor(val?: number) {
      }
      combi(ios: io[], op: string): Io {
  
        return this;
      }
    }
    class Dim {
      constructor(kind?: number,posX?: number,posY?: number,io?: Io,pt0?: Pt, pt1?: Pt, pt2?: Pt) {
      }
    }
    class Material {
      design: string = "St50";
      rmMin: number = 100;
      rm: number = 150;
      rmMax: number = 200;
      tensileStrength: number;
    
      constructor(design: string = "St50") {
      }
    
      set(rmMin: number, rm: number, rmMax: number): void {
      }
    }
    class Prim {
      debug: number;
      renderer: number;
      kind: number;
      color: any;
      style: number;
      layer: number;
      order: number;
      phi: number;
      v: number;
      vx: number;
      vy: number;
    }
    class Pt extends Prim {
      x: number;
      y: number;
      size: number;
      animated: bool = false;
    
      constructor(x?: number, y?: number, size?: number) {
        super();
      }
    
      dist(p: Pt): number {
        return 0;
      }
    
      ani(phi: number, velocity: number, opt: Io): Pt {
    
        return this;
      }
      zero(): Pt {
    
        return this;
      }
    
    }
    class Line extends Prim {
      p0: Pt;
      p1: Pt;
      length: number;
      constructor(pt0: Pt = new Pt(), pt1: Pt = new Pt()) {
      }
    }
    class AreaMoment extends Prim {
      cg: Pt;
      area: Pt;
      x: number;
      y: number;
      xy: number;
      constructor() {
      }
    }
    class Tria extends Prim {
      p0: Pt;
      p1: Pt;
      p2: Pt;
      cg: Pt;
      area: number;
      am: AreaMoment;
      constructor(pt0: Pt = new Pt(), pt1: Pt = new Pt(), , pt1: Pt = new Pt()) {
      }
    }
    class Arc extends Prim {
      p0: Pt;
      p1: Pt;
      pc: Pt;
      cg: Pt;
      curve: number;
      chord: Line;
      am: AreaMoment;
      constructor(pt0: Pt = new Pt(), pt1: Pt = new Pt(), curve = 0) {
        super();
      }
    }
    class Phlx extends Prim {
      p0: Pt;
      p1: Pt;
      p2: Pt;
      p3: Pt;
      iLine: Line;
      nLine: Line;
      oLine: Line;
      iArc: Arc;
      nArc: Arc;
      oArc: Arc;
      iTria: Tria;
      oTria: Tria;
      am: AreaMoment;
      constructor(index?: number, gauge?: Io, bent?: number, radius?: Io) {
      }
      make(x: number, y: number, gauge: number, size:number, bent: number = 0, radius: number = 0): Phlx {
        return this;
      }
      log(s:string="") {
      }
      feature() {
      }
    }
    class Sheet extends Prim {
      material: Material;
      thickness: Io;
      roughness: number;
      lubrication: number;
      blank: number = 1;
      width: number = 200;
      depth: number;
      flankAngle: number;
      mass: number;
      temperature: number;
      path: string = "";
      strainMin: number;
      strainMax: number;
      yieldStress: number;
      deformationWork: number;
      trueStrain: number;
      gaugeMin: number;
      gaugeMax: number;
      am: AreaMoment;
      searchRuns: number;
      partWidth: number;
      constructor(
        resolution?: number,
        thickness?: Io,
        blank?: number,
        material?: Material,
        width?: number = 0,
        depth?: number = 0,
        roughness?: number = 0,
        lubrication?: number = 0
      ) {
        super();
      }
      log(s:string="",m: number=1) {
      }
      createPath(impacts: Array<Impact>): string {
        return this.path;
      }
    }
    class Impact extends Prim {
      material: Material = new Material();
      thickness: f64 = 0;
      clearance: f64 = 0;
      width: Io = new Io(100);
      length: Io = new Io(100);
      radiusA: Io = new Io(15);
      radiusB: Io = new Io(15);
      mass: f64 = 0;
      temperature: f64 = 0;
      stroke: f64 = 0;
      maxStroke: f64 = 0;
      force: f64 = 0;
      stress: f64 = 0;
      operation: u8 = 0;
      drawstage: u8 = 0;
      iSharedLine: Line;
      oSharedLine: Line;
      constructor(operation: u8, width: Io, radiusA: Io, length?: Io, act?: Io, clear?: Io) {
        super();
        this.operation = operation;
        this.width = width;
        this.length = length;
        this.radiusA = radiusA;
      }
      feature(): void {}
    }
    
    
    class Forming extends Prim {
      x: number = 0;
      y: number = 0;
      width: number = 0;
      depth: number = 0;
      height0: number = 0;
      height1: number = 0;
      mass: number = 0;
      temperature: number = 0;
      stroke: number = 50;
      maxStroke: number = 100;
      force: number;
      strippingForce: number;
      impacts: Array<Impact> = new Array<Impact>();
      phlxs: Array<Phlx> = new Array<Phlx>();
      sheet: Sheet;
      orient: number = 0;
      legendPos: number = 0;
      evaluation: number = 0;
      hasTrueTangent: boolean = false;
      constructor(impacts: Array<Impact>, sheet: Sheet, stroke: Io, maxStroke: number, blankWidth: Io, blankLength: Io, evaluation: number, epsilon?: Io) {
        super();
      }
      legend(legend: number): Forming {
        return this;
      }
      feature(deltaT: number): void {}
    }
    class ViewPort {
      x1: Io;
      y1: Io;
      x2: Io;
      y2: Io;
      render: number;
      showAxes: number;
      showGrid: number;
      grid: number;
      constructor(orientation?: number, x1?: Io, y1?: Io, x2?: Io, y2?: Io, m0?: number, m1?: number, m2?: number, m3?: number) {}
      geo(orientation?: number, x1?: Io, y1?: Io, x2?: Io, y2?: Io, m0?: number, m1?: number, m2?: number, m3?: number) {}
      attr(render?: number, showAxes?: number, showGrid?: number, grid?: number) {}
    }
    let valZero = new Val();
    let ptZero = new Pt();
    let viewPort: ViewPort = {};
    let sheet: Sheet = {};
    let forming: Forming = {};
    let arrs: any = {};
    `;
    const lib = lines.join('\n') + '\n' + interf;

    var libUri = 'ts:filename/prims.d.ts';
    monaco.languages.typescript.typescriptDefaults.addExtraLib(lib, libUri);
    monaco.editor.createModel(lib, 'typescript', monaco.Uri.parse(libUri));
  },
};
