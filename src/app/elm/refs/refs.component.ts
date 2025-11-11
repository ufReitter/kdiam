import { Component, Input, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'kd-refs',
  standalone: false,
  templateUrl: './refs.component.html',
  styleUrls: ['./refs.component.scss'],
})
export class RefsComponent implements OnInit {
  @Input() editor: any;

  refs: any[] = [];
  str = '';
  range: any;
  sortingActiveChanged = true;
  sorting: any;

  constructor(public dS: DataService) {}

  ngOnInit(): void {
    this.sorting = { active: 'num', direction: 'asc' };

    this.refs = this.dS.selVol.refs;
  }

  open(e) {
    this.range = this.editor.getSelection();
  }
  close(e) {
    setTimeout(
      () => this.editor.setSelection(this.range.index, this.range.length),
      100,
    );
  }

  insert(ref) {
    let text = ref.elm.seNo || '*';
    var cObj = { text: text, name: ref.elm._eid.str };
    this.editor.insertEmbed(this.range.index, 'ref-link', cObj);
    this.editor.setSelection(this.range.index + 1, this.range.length);
    this.range = this.editor.getSelection();
  }
  search(e) {}

  onSort(event) {
    this.sortingActiveChanged = true;
    if (event.value !== this.sorting.active) {
      this.sorting.direction = 'asc';
      if (event.value === 'num') {
        if (this.sorting.active !== 'num') {
          this.refs = this.dS.selVol.refs;
        }
      }
      if (event.value === 'author' || event.value === 'title') {
        if (this.sorting.active === 'num') {
          this.refs = this.dS.arr.filter((elm) => {
            if (elm.datarow && elm.datarow.author && elm.datarow.title) {
              return elm;
            }
          });
        }
      }
    }

    this.sorting.active = event.value;

    this.sort(this.str);
  }

  onSortClick(event?) {
    if (!this.sortingActiveChanged) {
      this.sorting.direction =
        this.sorting.direction === 'asc' ? 'desc' : 'asc';
      this.sort(this.str);
    }
    this.sortingActiveChanged = false;
  }

  add() {
    let elm = this.dS.addElement();
    elm['host_id'] = '5d0949f7e37e491e8a1a25bd';
    elm.datarow = {};
    elm.dataHost = this.dS.obj['5d0949f7e37e491e8a1a25bd'];
    elm.dataHost.datarows.push(elm);
    elm.dataHost.defSubject.next(elm.dataHost.def);
    elm.task = elm.getTask();
    elm.dirty = true;
    this.insert({ id: elm._eid.str, elm: elm });
  }

  filter(s) {
    if (this.sorting.active === 'num' && this.dS.selVol.refs.length) {
      this.refs = this.dS.selVol.refs || [];
    } else {
      this.refs = this.dS.arr
        .filter((elm) => elm.host_id === '5d0949f7e37e491e8a1a25bd')
        .map((elm) => {
          return { id: elm._eid.str, elm: elm };
        });
    }

    this.refs = this.refs.filter((ref) => {
      if (
        (ref.elm.datarow.author || '').toLowerCase().includes(s) ||
        (ref.elm.datarow.title || '').toLowerCase().includes(s)
      ) {
        return ref;
      }
    });
  }

  sort(s) {
    this.str = s.toLowerCase();
    this.filter(this.str);
    if (this.sorting.active === 'author') {
      this.refs.sort((x, y) => {
        let a, b;
        a = (x.elm.datarow.author || '')
          .toLowerCase()
          .replace(/ä/gi, 'ae')
          .replace(/ö/gi, 'oe')
          .replace(/ü/gi, 'ue');
        b = (y.elm.datarow.author || '')
          .toLowerCase()
          .replace(/ä/gi, 'ae')
          .replace(/ö/gi, 'oe')
          .replace(/ü/gi, 'ue');
        if (this.sorting.direction === 'asc') {
          if (a > b) return 1;
          if (a < b) return -1;
        } else {
          if (a > b) return -1;
          if (a < b) return 1;
        }
      });
    }
    if (this.sorting.active === 'title') {
      this.refs.sort((x, y) => {
        let a, b;
        a = (x.elm.datarow.title || '')
          .toLowerCase()
          .replace(/ä/gi, 'ae')
          .replace(/ö/gi, 'oe')
          .replace(/ü/gi, 'ue');
        b = (y.elm.datarow.title || '')
          .toLowerCase()
          .replace(/ä/gi, 'ae')
          .replace(/ö/gi, 'oe')
          .replace(/ü/gi, 'ue');
        if (this.sorting.direction === 'asc') {
          if (a > b) return 1;
          if (a < b) return -1;
        } else {
          if (a > b) return -1;
          if (a < b) return 1;
        }
      });
    }
  }
}
