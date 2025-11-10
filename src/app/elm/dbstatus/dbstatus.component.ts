import { Component, Input } from '@angular/core';

@Component({
  selector: 'kd-dbstatus',
  templateUrl: './dbstatus.component.html',
  styleUrls: ['./dbstatus.component.scss'],
})
export class DbstatusComponent {
  @Input() elm: any;

  constructor() {}
}
