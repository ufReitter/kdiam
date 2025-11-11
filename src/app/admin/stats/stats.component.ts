import { Component, Input } from '@angular/core';

@Component({
  selector: 'kd-stats',
  standalone: false,
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss'],
})
export class StatsComponent {
  @Input() bust: number;
  @Input() palim: boolean;
  @Input() tabIndex: number;
  constructor() {}
}
