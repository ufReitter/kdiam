import { Elm } from '../engine/entity';

export class ArticleElement {
  public element: any;
  constructor(public definition: any, public changes: any) {
    this.element.kind = 'art';
    this.element.elements = [];
  }
}

export class Set {
  state: any;
  figure: any;
  attrib: any;
  parent: Elm;
  no: number;
}

export class ElmFlatNode {
  id: string;
  elm: Elm;
  lbl: string;
  slugs: any;
  level: number;
  expandable: boolean;
  numeration: string;
  num: string;
  nums: any;
  parents: any;
  descendants: any;
  path: string;
  no: number;
  set: Set;
  setDef: Set;
}

export class ContentsNode {
  id: string;
  elm: Elm;
  slugs: any;
  children: ContentsNode[];
  title: string;
  num: [number];
  numeration: string;
  target: string;
  protect: boolean;
}

export class ContentsFlatNode {
  constructor(
    public id: string,
    public expandable: boolean,
    public elm: Elm,
    public slugs: any,
    public title: string,
    public level: number,
    public num: [number],
    public numeration: string,
    public target: string,
  ) {}
}

declare global {
  function debug(): any;
  interface Window {
    find: any;
  }
  interface Document {
    webkitExitFullscreen: any;
  }
  interface Console {
    prettyPrint(message?: any, ...optionalParams: any[]): void;
  }
}

declare global {
  interface Array<T> {
    pushUnique(item: any): any;
  }
  interface Math {
    sign(x: number): number;
  }
  interface Number {
    runde(dez: number): number;
    round(places: number): number;
    grad(): number;
    sgn(): number;
  }
}

export interface Global {
  PRIM: any;
  FUNC: any;
  ROLE: any;
  OPUS_DIR: any;
  DEBUG: any;
  DINDEX: any;
  TESTARRAY: any;
  mongoObjectId: any;
  setAlpha: any;
  debug: any;
}

export interface Navigator {
  standalone: any;
}
export interface Quill {
  import(target: any): any;
  register(target: any, sources: any): any;
}

export interface ObjectContructor {
  assign(target: any, ...sources: any[]): any;
}

export interface Article {
  id: any;
  dev: boolean;
  vis: boolean;
  parent: number;
  order: number;
  version: string;
  orderAbsolut: number;
  section: any;
  sectionId: number;
  sectionStr: string;
  spacer: string;
  numeration: string;
  numerationIndent: number;
  heading: string;
  elements: any;
  language: any;
  includes: any;
  length: any;
  references: any;
  children: any[];
  foldChildren: boolean;
  favorite: boolean;
}
export interface Variables {
  array: any;
  select: any;
}
export interface ImageFm {
  id: number;
  file: string;
  cachebust: string;
  width: string;
  height: string;
  size: string;
  name: string;
  extension: string;
  numeration: string;
  usedBy: any;
}
export interface ViewFrame {
  x1: number;
  x1in: number;
  x1out: number;
  x2: number;
  x2in: number;
  x2out: number;
  y1: number;
  y1in: number;
  y1out: number;
  y2: number;
  y2in: number;
  y2out: number;
  w: number;
  h: number;
  cX: number;
  cY: number;
  aspect: number;
}
export interface Coord {
  x: number;
  y: number;
}
export interface VarStatus {
  value: number;
}

export interface Login {
  name: string;
  password: string;
}
