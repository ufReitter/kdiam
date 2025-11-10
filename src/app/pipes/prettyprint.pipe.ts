import { Pipe, PipeTransform } from '@angular/core';
import Dexie from 'dexie';
var deepClone = Dexie.deepClone;
@Pipe({
  name: 'prettyprint',
})
export class PrettyPrintPipe implements PipeTransform {
  transform(val) {
    let v = deepClone(val);
    if (v.table?.cols) {
      for (const it of v.table?.cols) {
        delete it.elm;
      }
    }
    if (v.figure && v.figure.render) {
      v.figure.render = 'SVG Markup';
    }
    if (v.equ && v.equ.svg) {
      v.equ.svg = 'SVG Markup';
    }
    if (v.bdy) {
      v.bdy = v.bdy.replace(/(<([^>]+)>)/gi, '');
    }
    if (v.cpt) {
      v.cpt = v.cpt.replace(/(<([^>]+)>)/gi, '');
    }
    if (v.svg) {
      v.svg = 'SVG Markup';
    }

    const json = JSON.stringify(v, null, 2);
    const html = json.replace(/\n/g, '</br>').replace(/\s/g, '&nbsp;');
    return html;
  }
}
