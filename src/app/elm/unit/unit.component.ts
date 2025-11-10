import { Component, OnInit, Input } from '@angular/core';
import { Elm } from '../../engine/entity';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'kd-unit',
  templateUrl: './unit.component.html',
  styleUrls: ['./unit.component.css']
})
export class UnitComponent implements OnInit {
  selection: any[];
  @Input() elm: Elm;
  @Input() set: any;

  constructor(
    public dS: DataService
  ) { }

  ngOnInit(): void {

    if (this.elm.key === 'Rm_max') {

      this.selection = [
        {name: 'aaa', value: 500},
        {name: 'bbb', value: 500},
        {name: 'ccc', value: 500},
        {name: 'ddd', value: 500},
        {name: 'eee', value: 500},
        {name: 'fff', value: 500},
      ];




    }
  }

}
