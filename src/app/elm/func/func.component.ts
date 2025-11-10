import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { Elm } from '../../engine/entity';
import { CalculationService } from '../../services/calculation.service';

@Component({
  selector: 'kd-func',
  templateUrl: './func.component.html',
  styleUrls: ['./func.component.css'],
})
export class FuncComponent implements OnInit {
  @Input() elm: Elm;
  @Input() set: any;
  @Input() src: any;

  job: any;
  args: any;
  keys: any;
  parms: any;
  elmDef: Subscription;

  result: any = 1;

  constructor(public cS: CalculationService, public dS: DataService) {}

  ngOnInit(): void {
    this.job = this.cS.getJob(this.elm, null, this.src.name);
    this.elmDef = this.elm.defSubject.subscribe((def) => {
      let str = this.src.args.replace(/\s/g, '');
      let args = str.split(',');
      this.args = [];
      this.parms = [];
      for (const it of args) {
        let entry = {
          key: it.split('=')[0],
          parm: it.split('=')[1] || 1,
        };
        this.args.push(entry);
        this.parms.push(entry.parm);
      }
      this.cS.doFunc(this.job, this.parms);
    });
  }
  change() {
    this.parms = [];
    for (const it of this.args) {
      this.parms.push(it.parm);
    }
    this.cS.doFunc(this.job, this.parms);
  }
}
