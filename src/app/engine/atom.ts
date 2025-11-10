/**
 * @license
 * Copyright 4Ming e.K. All Rights Reserved.
 *
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * LICENSE file at https://kompendia.net/LICENSE.txt
 */

export class Atom {
  value: any;
  element: any;
  keypath: string;
  updated_at: Date;
  constructor(definition) {}
  init() {}
}

export class Figur extends Atom {
  value: any;
  element: any;
  keypath: string;
  size: number;
  width: number;
  height: number;
  svg: string;
  html: string;
  image: boolean;
  ctx: [CanvasRenderingContext2D];
  updated_at: Date;
  constructor(definition) {
    super(definition);
  }
  init() {}
}

export class Table extends Atom {
  value: any;
  element: any;
  keypath: string;
  width: number;
  height: number;
  cols: any;
  data: any;
  updated_at: Date;
  constructor(definition) {
    super(definition);
  }
  init() {}
}

export class Code extends Atom {
  value: any;
  element: any;
  keypath: string;
  language: number;
  onInit: string;
  onChanges: string;
  worker: any;
  updated_at: Date;
  constructor(definition) {
    super(definition);
  }
  init() {}
}
