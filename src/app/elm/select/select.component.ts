import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Elm } from '../../engine/entity';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'kd-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.css'],
})
export class SelectComponent implements OnInit {
  selection: any[];
  selected: any = {};
  tableElm: Elm;
  childElm: Elm;
  set: any;
  @Input() elm: Elm;
  elmDefSubject: Subscription;
  @Input() child: any;
  tableDefSubject: Subscription;

  constructor(public dS: DataService) {}

  ngOnInit(): void {
    // if (this.elm.vals && this.elm.vals.length) {
    //   this.selection = this.elm.vals;
    // }

    this.elmDefSubject = this.elm.defSubject.subscribe((def) => {
      this.set = this.child.set;
      if (this.child.tableElm) {
        this.tableElm = this.child.tableElm;
        this.tableDefSubject = this.tableElm.defSubject.subscribe((def) => {
          this.selection = [];
          for (const it of this.tableElm.table.data) {
            this.selection.push({
              name:
                it[this.child.colNameId] ||
                it.elm?.datarow[this.child.colNameId]?.[0],
              value:
                it[this.child.colValueId] ||
                it.elm?.datarow[this.child.colValueId],
            });
          }
        });
      }
    });
  }

  change(e) {
    if (this.set.parent.job) {
      this.selected = e.value;
      this.set.state.val = e.value.value;
      this.set.parent.job.doSubject.next({
        elm: this.elm,
        name: this.set.name,
        state: this.set.state,
        undo: true,
        project: true,
      });
    }
  }
}
