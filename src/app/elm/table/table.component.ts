import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { MatSort, MatSortable } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import Dexie from 'dexie';
import { BehaviorSubject, Subscription, timer } from 'rxjs';
import { Elm, ElmNode } from 'src/app/engine/entity';
import { ProfileService } from 'src/app/services/profile.service';
import { ViewService } from 'src/app/services/view.service';
import { DataService } from '../../services/data.service';
var getByKeyPath = Dexie.getByKeyPath;
var setByKeyPath = Dexie.setByKeyPath;
@Component({
  selector: 'kd-table',
  standalone: false,
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent implements OnInit, OnChanges, OnDestroy {
  show = true;
  viewElementSubject: Subscription;
  defSubject: Subscription;
  localeSubject: Subscription;
  cdArticleSub: Subscription;
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: any = [];
  svg: string[] = [];
  latex: string[] = [];
  editIndex = -1;
  editArrayIndex = -1;
  arrayItem = '';
  errorField: string;
  rowHilite: boolean = true;
  editRow: any;
  cols: any;
  glossaryPending = new BehaviorSubject<boolean>(false);
  @Input() node: ElmNode;
  @Input() elm: Elm;
  @Input() parent: Elm;
  @Input() table: any;
  @Input() data: any;
  @Input() selected: any;
  @Input() refresh: string;
  @Output() radioclick = new EventEmitter<any>();
  @Output() rowclick = new EventEmitter<any>();
  @Output() rowenter = new EventEmitter<any>();
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatTable) matTable: MatTable<any>;
  constructor(
    private cd: ChangeDetectorRef,
    public vS: ViewService,
    public pS: ProfileService,
    public dS: DataService,
  ) {
    this.show = true;
  }
  ngOnInit() {
    this.localeSubject = this.dS.subject.locale.subscribe((locale) => {
      this.doRefresh();
    });
    this.cdArticleSub = this.dS.subject.cdArticle.subscribe((doit) => {
      if (doit) {
        this.doRefresh();
        this.cd.detectChanges();
      }
    });
    // this.viewElementSubject = this.dS.subject.viewElement.subscribe((elm) => {
    //   if (elm !== this.elm) {
    //     this.doRefresh(elm);
    //     isFresh = false;
    //   }
    // });
  }
  ngOnChanges() {
    if (this.refresh) {
      //this.doRefresh();
    }
    if (this.data) {
      this.table.data = this.data;
    }
    if (this.node) {
      if (this.elm && this.elm !== this.node.elm) {
        // this.doRefresh(this.node.elm);
      }
      this.elm = this.node.elm;
      // if (this.defSubject) this.defSubject.unsubscribe();
      // this.defSubject = this.elm?.defSubject.subscribe((def) => {
      //   if (def) {
      //     timer(0).subscribe((t) => {
      //       this.doRefresh();
      //     });
      //   }
      // });
    }

    this.doRefresh();
  }
  ngOnDestroy() {
    if (this.viewElementSubject) this.viewElementSubject.unsubscribe();
    if (this.defSubject) this.defSubject.unsubscribe();
    if (this.localeSubject) this.localeSubject.unsubscribe();
    if (this.cdArticleSub) this.cdArticleSub.unsubscribe();
  }
  doRefresh(elm?) {
    this.table = elm?.table || this.node?.elm?.table || this.table;
    timer(100).subscribe((t) => {
      this.cols = this.table.cols;
    });
    this.displayedColumns = [];

    this.rowHilite = this.table.rowh;
    if (this.elm?._eid.str === '6100264be682ad1b0457a727') {
      if (this.dS.locale === 'de') {
        this.displayedColumns.push('de');
        this.displayedColumns.push('en');
        this.displayedColumns.push('signde');
        this.displayedColumns.push('signen');
        this.displayedColumns.push('unitde');
        this.displayedColumns.push('uniten');
      }
      if (this.dS.locale === 'en') {
        this.displayedColumns.push('en');
        this.displayedColumns.push('de');
        this.displayedColumns.push('signen');
        this.displayedColumns.push('signde');
        this.displayedColumns.push('uniten');
        this.displayedColumns.push('unitde');
      }
      for (const elm of this.dS.arr.filter(
        (e) => e.attrib?.glossary || e.i18n.en?.strs?.sign,
      )) {
        if (!this.table.data.find((item) => item.elm === elm)) {
          this.table.data.push({ elm: elm, dynamicUi: true });
        }
      }
    }
    for (var i = 0; i < this.table.cols.length; i++) {
      var col = this.table.cols[i];
      this.displayedColumns.pushUnique(col.field);

      if (col.mode) {
        const firstData = this.table.data[0];
        col.mode = this.dS.getValueType(firstData[col.field]);
      }

      if (col.keyPath) {
        for (const row of this.table.data) {
          if (row.elm && col.text) {
            row[col.field] = getByKeyPath(row.elm, col.keyPath) || '';
          }
          if (row.elm && !col.text) {
            row[col.field] = getByKeyPath(row.elm, col.keyPath) || null;
          }
        }
      }
    }
    // if (
    //   this.elm?._eid.str === '6100264be682ad1b0457a727' &&
    //   !this.displayedColumns.includes('dynamicUi')
    // ) {
    //   this.displayedColumns.push('dynamicUi');
    //   this.table.cols.push({
    //     field: 'dynamicUi',
    //     header: 'UI',
    //     sortable: true,
    //     width: 0,
    //   });
    // }

    if (
      this.table.sortId &&
      (this.sort.direction !== 'asc' || this.sort.active !== this.table.sortId)
    ) {
      this.sort.sort({
        id: this.table.sortId,
        start: 'asc',
      } as MatSortable);
    }

    if (
      this.elm?._eid.str === '6100264be682ad1b0457a727xxx' &&
      (this.sort.direction !== 'asc' ||
        this.sort.active !== this.displayedColumns[0])
    ) {
      this.sort.sort({
        id: this.displayedColumns[0],
        start: 'asc',
      } as MatSortable);
    }

    this.dataSource = new MatTableDataSource(this.table.data);
    this.dataSource.sortingDataAccessor = (
      data: any,
      sortHeaderId: string,
    ): string => {
      if (Array.isArray(data[sortHeaderId])) {
        return data[sortHeaderId].find((el) => el);
      }
      if (typeof data[sortHeaderId] === 'string') {
        return data[sortHeaderId]
          .toLowerCase()
          .replace(/ä/gi, 'ae')
          .replace(/ö/gi, 'oe')
          .replace(/ü/gi, 'ue');
      }

      return data[sortHeaderId];
    };
    this.dataSource.sort = this.sort;

    if (this.elm?.datacols && this.elm?.datacols[0]?.field === 'designs') {
      for (var i = 0; i < this.elm?.datacols.length; i++) {
        var col = this.elm?.datacols[i];
        this.displayedColumns.push(col.field);
      }
      let data = this.elm?.datarows.map((elm) => {
        let row = elm.datarow;
        row._id = elm._eid;
        return row;
      });
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.sort = this.sort;
    }

    this.cd.detectChanges();

    //  });
  }
  includeElms(elms: any[]) {
    for (const it of elms) {
      const item = { _eid: it._eid.str, elm: it };

      this.table.data.push(item);
    }
    this.elm.dirty = true;
    this.doRefresh();
    this.dS.clearSelection();
  }
  setBoolean(e, element, field) {
    element[field] = !element[field];
  }
  onValueChange(e, row, col, cmd?) {
    if (!col.text) {
      e = e.replace(',', '.');
      if (isNaN(e)) {
        this.errorField = col.field;
        if (!e) {
          e = null;
        }
      } else {
        this.errorField = '';
        if (!e) {
          e = null;
        } else {
          e = Number(e);
        }
      }
    }
    if (row.elm) {
      setByKeyPath(row.elm, col.keyPath, e);
    }
  }
  enterValueChange(e, row, col) {
    if (col.text) {
      if (col.keyPath?.includes('.lbl')) {
        row[col.field] =
          row[col.field].charAt(0).toUpperCase() + row[col.field].slice(1);
      }
    }
    if (row.elm) {
      setByKeyPath(row.elm, col.keyPath, row[col.field]);
      let lang = col.field.replace('sign', '').replace('unit', '');
      row.elm.i18n[lang].strs.dirty = true;
      this.dS.save(row.elm);
    } else {
      if (this.elm) {
        this.elm.dirty = true;
        this.dS.save(this.elm);
      }
    }
    this.arrayItem = '';
    this.editIndex = -1;
    this.editArrayIndex = -1;

    this.rowenter.emit(row);
  }
  editArrayItem(e, arr, index) {
    e.stopPropagation();
    this.arrayItem = arr[index];
    this.editArrayIndex = index;
  }
  onEditArrayItem(e, arr, index) {
    arr[index] = e;
  }
  enterEditArrayItem(e, row, col, index) {
    const arr = row[col.field];
    if (col.text && col.field === 'gapi') {
      this.arrayItem = arr[index] =
        this.arrayItem.charAt(0).toUpperCase() + this.arrayItem.slice(1);
    }
    if (this.arrayItem === '' && index !== -1) {
      arr.splice(index, 1);
    }
    if (this.arrayItem && index === -1) {
      arr.push(this.arrayItem);
    }
    if (row.elm) {
      setByKeyPath(row.elm, col.keyPath, [...arr]);
      row.elm.dirty = true;
      this.dS.save(row.elm);
    } else {
      this.elm.dirty = true;
      this.dS.save(this.elm);
    }
    this.arrayItem = '';
    this.editArrayIndex = -1;
    this.editIndex = -1;
  }
  onDynamicUi(row) {
    if (row.elm) {
      this.dS.router.navigate([
        { outlets: { right: ['redit', 'translate', row.elm._eid.str] } },
      ]);
    }
  }
  edit(e, row, i) {
    if (this.table.rowclick) {
      this.rowclick.emit(row);
    }
    if (this.vS.inlineEditor && !e.altKey) {
      this.editIndex = i;
      this.editRow = row;
    }
    if (row.elm && e.altKey) {
      this.dS.edit(row.elm);
    }
  }
  save() {
    if (!this.errorField) {
      for (const col of this.table.cols) {
        const dr = this.table.data[this.editIndex];
        let val = dr[col.field];
        if (!col.text) {
          if (val && isNaN(val)) {
            val = val.replace(',', '.');
          }
          if (!val) {
            val = null;
          } else {
            val = Number(val);
          }
          dr[col.field] = val;
        }
      }

      this.arrayItem = '';
      this.editIndex = -1;
      this.editArrayIndex = -1;
    }
  }
  addRow() {
    this.table.data.push({});
    this.editIndex = this.table.data.length - 1;

    this.dataSource = new MatTableDataSource(this.table.data);
  }
  removeRow() {
    if (this.editRow.elm) {
      this.editRow.elm.attrib.glossary = false;
      this.editRow.elm.dirty = true;
      this.dS.save(this.editRow.elm);
    }
    const index = this.table.data.findIndex((r) => r === this.editRow);
    this.table.data.splice(index, 1);
    this.elm.dirty = true;
    this.dS.save(this.elm);
    this.editIndex = -1;
    this.doRefresh();
  }
  replaceGapiGlossary() {
    const body = {
      cmd: 'cmd',
    };
    let subs: any;
    this.glossaryPending.next(true);

    subs = this.dS.serverApi('/gapi/glossary', body);

    subs.subscribe(
      (body) => this.replaceGapiGlossaryAction(body),
      (error) => (this.dS.errorMessage = <any>error),
    );
  }
  replaceGapiGlossaryAction(body) {
    this.glossaryPending.next(false);
    console.log(body);
  }
}
