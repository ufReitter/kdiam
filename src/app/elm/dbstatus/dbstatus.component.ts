import { Component, Input } from '@angular/core';

@Component({
  selector: 'kd-dbstatus',
  standalone: false,
  templateUrl: './dbstatus.component.html',
  styleUrls: ['./dbstatus.component.scss'],
})
export class DbstatusComponent {
  @Input() elm: any;

  constructor() {}
}
