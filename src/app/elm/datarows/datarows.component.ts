import { HttpClient } from '@angular/common/http';
import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  MatTable,
  MatTableDataSource,
} from '@angular/material/table';
import { MatSort, MatSortable } from '@angular/material/sort';
import Dexie from 'dexie';
import { Subscription } from 'rxjs';
import { Elm } from 'src/app/engine/entity';
import { DataService } from 'src/app/services/data.service';
import { ProfileService } from 'src/app/services/profile.service';
import { ViewService } from 'src/app/services/view.service';
var deepClone = Dexie.deepClone;

@Component({
  selector: 'kd-datarows',
  templateUrl: './datarows.component.html',
  styleUrls: ['./datarows.component.scss'],
})
export class DatarowsComponent implements OnInit, OnChanges, OnDestroy {
  filterValue: string;
  scrapeId: string;
  viewElementSubject: Subscription;
  defSubject: Subscription;
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: any = [];
  figures: any = [];
  datacols: any = [];

  @Input() elm: Elm;
  @Input() parent: Elm;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<any>;
  filteredData: any[];

  constructor(
    public pS: ProfileService,
    public vS: ViewService,
    public dS: DataService,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.defSubject = this.elm.defSubject.subscribe((def) => {
      if (def) {
        this.reset();
      }
    });
  }
  ngOnChanges() {
    this.reset();
  }
  reset() {
    let data;

    this.displayedColumns = [];
    if (this.elm._eid.str === '5d440a14f338af0586baf31d') {
      this.displayedColumns[0] = 'svg';
      this.displayedColumns[1] = 'latex';
      for (var i = 0; i < this.elm.datacols.length; i++) {
        var col = this.elm.datacols[i];
        this.datacols.push(col);
        this.displayedColumns.push(col.field);
      }
      data = this.elm.datarows.map((elm) => {
        let row = elm.datarow;
        row.latex = elm.equ.tex;
        row.equ = elm.equ;
        row._eid = elm._eid;
        return row;
      });
      this.sort.sort({ id: 'latex', start: 'asc' } as MatSortable);
    } else {
      this.datacols = [];
      if (this.elm._eid.str === '5d0949f7e37e491e8a1a25bd') {
        this.datacols.push({
          field: 'seNo',
          header: 'n',
          width: 35,
          string: false,
        });
        this.displayedColumns.push('seNo');
        for (let i = 0; i < this.dS.selVol.refs.length; i++) {
          const elm = this.dS.selVol.refs[i].elm;
          if (elm) {
            elm.seNo = (i + 1).toString();
          }
        }
      }
      for (var i = 0; i < this.elm.datacols.length; i++) {
        var col = this.elm.datacols[i];
        this.datacols.push(col);
        this.displayedColumns.push(col.field);
      }
      if (this.elm._eid.str === '5d0949f7e37e491e8a1a25bd') {
        data = this.elm.datarows
          .filter((elm) => elm.seNo)
          .map((elm) => {
            let row = elm.datarow;
            row._eid = elm._eid;
            row.elm = elm;
            row.seNo = Number(elm.seNo) || null;
            return row;
          });
      } else {
        data = this.elm.datarows.map((elm) => {
          let row = elm.datarow;
          row._eid = elm._eid;
          row.elm = elm;
          return row;
        });
      }

      this.sort.sort({
        id: this.displayedColumns[0],
        start: 'asc',
      } as MatSortable);
    }
    this.dataSource = null;
    this.dataSource = new MatTableDataSource(data);
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
    this.filteredData = this.dataSource.filteredData;
  }

  ngOnDestroy() {
    if (this.viewElementSubject) this.viewElementSubject.unsubscribe();
    if (this.defSubject) this.defSubject.unsubscribe();
  }

  edit(row) {
    if (this.pS.profile.role.editor && row.elm) this.dS.edit(row.elm, 4);
  }

  applyFilter(event: Event) {
    this.filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = this.filterValue.trim().toLowerCase();
  }
  applyScrape(event: Event) {
    this.http.get('/api/scrape/rp/' + this.scrapeId).subscribe((event) => {
      console.log(event);
    });
  }
}
