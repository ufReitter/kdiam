import { Component, Input, OnInit } from '@angular/core';
import { Elm } from 'src/app/engine/entity';
import { DataService } from 'src/app/services/data.service';
import { ViewService } from 'src/app/services/view.service';

@Component({
  selector: 'kd-object-id',
  standalone: false,
  templateUrl: './object-id.component.html',
  styleUrls: ['./object-id.component.scss'],
})
export class ObjectIdComponent implements OnInit {
  @Input() str: string = '';
  @Input() toSet: string = '';
  @Input() elm: Elm;
  @Input() set: {};
  @Input() child: any = {};
  @Input() format: string = 'shortened';
  display: string = '';

  constructor(public vS: ViewService, public dS: DataService) {}

  ngOnInit(): void {}
  ngOnChanges(): void {
    this.convert(this.str);
    if (this.toSet === 'tableId' && this.child && this.child.tableId) {
      this.convert(this.child.tableId);
    }
    if (this.toSet === 'colId' && this.child && this.child.colId) {
      this.convert(this.child.colId);
    }
    if (this.toSet === 'rowId' && this.child && this.child.rowId) {
      this.convert(this.child.rowId);
    }
  }
  async insert() {
    let str = await this.vS.pasteFromContent();
    this.convert(str);
    this.child[this.toSet] = str;
    if (this.toSet === 'tableId') {
      this.child.tableElm = this.dS.obj[str];
    }
    this.elm.defSubject.next(this.elm.def);
    this.elm.dirty = true;
  }
  remove() {
    this.display = '';
    this.str = '';
    delete this.child[this.toSet];
    this.elm.defSubject.next(this.elm.def);
    this.elm.dirty = true;
  }
  convert(str: string) {
    if (str.length === 24) {
      this.display =
        this.format === 'full' ? str : (str || '').substring(16, 24);
    } else {
      this.display = str;
    }
    this.str = str;
  }
}
