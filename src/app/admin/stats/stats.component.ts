import { Component, Input } from '@angular/core';

@Component({
  selector: 'kd-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css'],
})
export class StatsComponent {
  @Input() bust: number;
  @Input() palim: boolean;
  @Input() tabIndex: number;
  constructor() {}
}
