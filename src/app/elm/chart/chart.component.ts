import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'kd-chart',
  standalone: false,
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
})
export class ChartComponent implements OnInit {
  period = 'week';
  width = 640;
  height = 370;
  transform = 'scale (1,-1)';
  viewBox = '0 -300 500 350';
  scale = 1;
  gridScale = 10;
  grids = [];
  currentData = [];
  beforeData = [];
  beforePoints = '';
  currentPoints = '';
  userCount = 0;
  sessionCount = 0;
  bounceRate = 0;
  sessionDuration = 0;
  perI = 1;
  constructor(private _httpClient: HttpClient) {}

  ngOnInit(): void {
    this.getData();
  }

  async getData() {
    const requestUrl = `/api/stats?context=chart&period=${this.period}`;

    const data$: any = this._httpClient.get<any>(requestUrl);

    const body: any = await lastValueFrom(data$);
    this.beforeData = body.before;
    this.currentData = body.current;

    this.userCount = body.userCount;

    this.perI = this.width / (body.current.length - 1);
    let maxValue = 0;
    let minValue = 0;

    this.beforePoints = '';
    this.currentPoints = '';

    for (let i = 0; i < body.before.length; i++) {
      const p = body.before[i];
      this.beforePoints += ` ${i * this.perI},${p.value}`;
      maxValue = p.value > maxValue ? p.value : maxValue;
      minValue = p.value < minValue ? p.value : minValue;
    }
    for (let i = 0; i < body.current.length; i++) {
      const p = body.current[i];
      this.currentPoints += ` ${i * this.perI},${p.value}`;
      maxValue = p.value > maxValue ? p.value : maxValue;
      minValue = p.value < minValue ? p.value : minValue;
    }

    let maxGrid = 0;

    for (let i = 1; i < 4; i++) {
      const y = i * this.gridScale;
      this.grids.push(y);
      maxGrid = i * y > maxGrid ? y : maxGrid;
    }

    this.scale = this.height / 1.118 / maxGrid;
    let shift = -330;

    this.viewBox = `0  ${shift} ${this.width} ${this.height}`;
    this.transform = 'scale (1,-' + this.scale + ')';
  }

  changePeriod(val) {
    this.period = val;
    this.getData();
  }
}
