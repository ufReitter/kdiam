import {
  AfterViewInit,
  Component,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  PLATFORM_ID,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { EditorChangeContent, EditorChangeSelection } from 'ngx-quill';
import Quill from 'quill';
import { timer } from 'rxjs';
import { ElmNode } from 'src/app/engine/entity';
import { DataService } from 'src/app/services/data.service';
import { ViewService } from 'src/app/services/view.service';

@Component({
  selector: 'kd-text-target',
  templateUrl: './text-target.component.html',
  styleUrls: ['../../../elm/text/text.component.css'],
})
export class TextTargetComponent
  implements OnChanges, AfterViewInit, OnDestroy
{
  @Input() node: ElmNode;
  @Input() elm: any;
  @Input() parent: any;
  @Input() key: any;
  @Input() pos: any;
  @Input() view: string;
  @Input() viewDepth: number;
  @Input() target = 'en';
  @ViewChild('rend', { static: false }) rend;
  editorParentEl: any;

  listenFunc: Function;

  edit: boolean;

  html: string;

  quill: any;

  blurred = false;
  focused = false;
  insertedSubject: any;

  constructor(
    @Inject(PLATFORM_ID) protected platformId: any,
    private renderer: Renderer2,
    public vS: ViewService,
    public dS: DataService,
  ) {}

  ngOnChanges() {
    if (this.node) {
      this.elm = this.node.elm;
    }
  }

  ngAfterViewInit() {
    if (this.dS.isBrowser) {
      this.insertedSubject = this.dS.subject.inserted.subscribe((defs) => {
        if (defs) {
          this.displayRefs();
        }
      });
    }
  }
  ngOnDestroy() {
    if (this.insertedSubject) this.insertedSubject.unsubscribe();
  }
  displayRefs() {
    let delay = timer(0).subscribe((t) => {
      let nodes =
        this.rend.nativeElement.getElementsByClassName('kd-reference');
      for (const it of nodes) {
        let id = it.getAttribute('name');
        if (this.dS.obj[id]) {
          let seNo = this.dS.obj[id].seNo;
          it.innerHTML = seNo || '*';
        } else {
          it.innerHTML = '*';
        }
      }
    });
  }

  updateTags(str) {
    const regex = new RegExp(
      '</span><sub class="kd-variable">(.*?)</sub>',
      'g',
    );
    let matches,
      output = [];
    while ((matches = regex.exec(str))) {
      output.push(matches[1]);
    }
    for (const it of output) {
      str = str.replace(
        '</span><sub class="kd-variable">' + it + '</sub>',
        '<sub>' + it + '</sub></span>',
      );
    }
    return str;
  }
  refsHaveChanged(refs1, refs2) {
    if (refs1.length !== refs2.length) return true;
    for (let i = 0; i < refs1.length; i++) {
      if (refs1[i] !== refs2[i]) return true;
    }
    return false;
  }
  updateRefs() {
    let newrefs = [];

    const html = this.elm.txts.cpt + this.elm.txts.bdy;
    const regex = new RegExp('class="kd-reference" name="(.*?)">', 'g');
    let matches,
      output = [];
    while ((matches = regex.exec(html))) {
      output.push(matches[1]);
    }

    for (const it of output) {
      let refelm = this.dS.obj[it];
      newrefs.pushUnique(refelm);
    }

    for (const it of this.elm.children || []) {
      if (it.elm.refs && it.elm.refs.length) {
        for (const ref of it.elm.refs) {
          newrefs.pushUnique(ref);
        }
      }
    }

    newrefs.sort(function (x, y) {
      let a, b;
      a = x.seNo;
      a = Number(a);
      b = y.seNo;
      b = Number(b);
      if (a > b) return 1;
      if (a < b) return -1;
    });

    if (this.refsHaveChanged(this.elm.refs, newrefs)) {
      this.elm.refs = newrefs;
      this.elm.dirty = true;
      this.dS.save(this.elm);
    }

    if (this.parent) {
      let parent = this.parent;

      let newrefs = [];

      const html = this.parent.txts.cpt + this.parent.txts.bdy || '';
      const regex = new RegExp('class="kd-reference" name="(.*?)">', 'g');
      let matches,
        output = [];
      while ((matches = regex.exec(html))) {
        output.push(matches[1]);
      }

      for (const it of output) {
        let refelm = this.dS.obj[it];
        newrefs.pushUnique(refelm);
      }

      for (const it of parent.children) {
        if (it.elm.refs && it.elm.refs.length) {
          for (const ref of it.elm.refs) {
            newrefs.pushUnique(ref);
          }
        }
      }
      newrefs.sort(function (x, y) {
        let a, b;
        a = x.seNo;
        a = Number(a);
        b = y.seNo;
        b = Number(b);
        if (a > b) return 1;
        if (a < b) return -1;
      });
      if (this.refsHaveChanged(parent.refs, newrefs)) {
        parent.refs = newrefs;
        parent.dirty = true;
        this.dS.save(parent);
      }
    }

    if (this.dS.selVol) {
      const v = this.dS.selVol;
      let newrefs = [];
      let desc = this.dS.allTreeElms(v);
      for (const it of desc) {
        if (it.refs) {
          for (const ref of it.refs) {
            newrefs.pushUnique(ref);
          }
        }
      }
      if (this.refsHaveChanged(v.refs, newrefs) && newrefs.length) {
        v.refs = newrefs;
        v.dirty = true;
      }
      for (let i = 0; i < v.refs.length; i++) {
        const ref = v.refs[i];
        ref.seNo = i + 1;
      }
    }

    for (const it of this.quill.editor.delta.ops) {
      if (it.attributes && it.attributes.kompendia === 'reference') {
        let ref = this.dS.obj[it.attributes.name];
        ref.seNo = ref.seNo || '*';
        it.insert = ref.seNo.toString();
      }
    }
  }
  async setEdit() {
    const success = await this.dS.checkOut(this.elm, this.dS.locale);
    if (success) {
      this.html = this.elm.i18n[this.target].strs[this.pos];
      this.vS.quillModules.toolbar.container =
        this.vS.quillToolbarContainers[this.pos];
      this.edit = true;
      this.vS.quillOpen = true;
    }
  }
  closeEdit($event) {
    if (this.quill.history.stack.undo.length) {
      // this.elm.txts.dirty = true;
    }
    this.quill.setContents(this.quill.editor.delta.ops);

    this.html = this.quill.root.innerHTML;

    this.html = this.updateTags(this.html);

    if (this.html === '<span> </span>') {
      this.html = '';
    }
    if (this.html === '<p> </p>') {
      this.html = '';
    }
    if (this.html === '<p><br></p>') {
      this.html = '';
    }

    this.html = this.html
      .replaceAll(' style="color: rgba(255, 255, 255, 0.9);"', '')
      .replaceAll(' = ', '&nbsp;=&nbsp;')
      .replaceAll(' < ', '&nbsp;<&nbsp;')
      .replaceAll(' > ', '&nbsp;>&nbsp;')
      .replaceAll(' &lt; ', '&nbsp;&lt;&nbsp;')
      .replaceAll(' &gt; ', '&nbsp;&gt;&nbsp;')
      .replaceAll(' &lt;= ', '&nbsp;&lt;=&nbsp;')
      .replaceAll(' &gt;= ', '&nbsp;&gt;=&nbsp;')
      .replaceAll(' ≤ ', '&nbsp;≤&nbsp;')
      .replaceAll(' ≥ ', '&nbsp;≥&nbsp;')
      .replaceAll(' ・ ', '&nbsp;・&nbsp;')
      .replaceAll(' / ', '&nbsp;/&nbsp;')
      .replaceAll(' … ', '&nbsp;…&nbsp;');

    if (this.pos !== 'bdy') {
      this.html = this.html
        .replaceAll('<p>', '<span>')
        .replaceAll('</p>', '</span>');
    }
    if (this.pos === 'cpt') {
      this.html = this.html
        .replaceAll('&nbsp;</sub></span>', '</sub></span>&nbsp;')
        .replaceAll('&nbsp;</sub></span> ', '</sub></span>&nbsp;')
        .replaceAll(' </sub></span>', '</sub></span>&nbsp;')
        .replaceAll('</span> ', '</span>&nbsp;')
        .replaceAll('① ', '①&nbsp;')
        .replaceAll('② ', '②&nbsp;')
        .replaceAll('③ ', '③&nbsp;')
        .replaceAll('④ ', '④&nbsp;')
        .replaceAll('⑤ ', '⑤&nbsp;')
        .replaceAll('&nbsp;&nbsp;', '&nbsp;');
    }

    // if (this.parent && this.parent.dirty) {
    //   this.dS.save(this.parent);
    // }

    // this.updateRefs();

    if (this.elm.i18n[this.target].strs[this.pos] !== this.html) {
      this.elm.i18n[this.target].strs[this.pos] = this.html;
      this.elm.i18n[this.target].strs.dirty = true;
    } else {
      this.elm.i18n[this.target].strs.dirty = false;
    }
    if (this.elm.i18n[this.target].strs.dirty) {
      this.dS.save(this.elm);
    }

    let str;

    if (this.dS.selEditElm) {
      str = this.dS.selEditElm._eid.str;
    }

    if (this.elm !== this.dS.selEditElm) {
      this.dS.checkIn(this.elm);
    }

    this.quill = null;
    this.edit = false;
    this.vS.quillOpen = false;
    this.displayRefs();
  }

  created(event: Quill) {
    this.quill = event;
    this.quill.setSelection(this.quill.getLength(), 0);
  }

  changedEditor(event: EditorChangeContent | EditorChangeSelection) {}

  focus($event) {
    this.focused = true;
    this.blurred = false;
  }

  blur($event) {
    this.focused = false;
    this.blurred = true;
  }
  selection($event) {}
}
