import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'kd-users-chart',
  templateUrl: './users-chart.component.html',
  styleUrls: ['./users-chart.component.scss'],
})
export class UsersChartComponent implements OnInit {
  @Input() bust: number;
  show = false;
  period = 'week';
  width = 635;
  height = 381;
  transform = 'scale (1,-1)';
  viewBox = '0 -300 500 381';
  scale = 1;
  gridScale = 1;
  grids = [];
  currentData = [];
  beforeData = [];
  beforePoints = '';
  currentPoints = '';
  userCount = 0;
  userCountChange = 0;
  sessionCount = 0;
  sessionCountChange = 0;
  bounceRate = 0;
  bounceRateChange = 0;
  sessionDuration = 0;
  sessionDurationChange = 0;
  impressions = 0;
  impressionsChange = 0;
  perI = 1;
  cron: any;
  hour: number;
  constructor(
    private _httpClient: HttpClient,
    public pS: ProfileService,
    public dS: DataService,
  ) {}

  ngOnInit(): void {}
  ngOnChanges() {
    this.period = this.pS.pref.admin?.tabs.chart?.period || this.period;
    this.getData();
    if (!this.cron) {
      this.cron = setInterval(() => {
        const hour = new Date().getHours();
        if (hour !== this.hour) {
          this.getData();
          this.hour = hour;
        }
      }, 60000);
    }
  }
  ngOnDestroy() {
    if (this.cron) {
      clearInterval(this.cron);
    }
  }
  async getData() {
    this.hour = new Date().getHours();
    const cachebust = Math.random();
    const requestUrl = `/api/stats?context=chart&period=${this.period}&cb=${cachebust}`;

    const data$: any = this._httpClient.get<any>(requestUrl);
    this.show = false;
    const body: any = await lastValueFrom(data$);
    this.show = true;
    this.beforeData = body.before;
    this.currentData = body.current;
    this.userCount = body.userCount;
    this.userCountChange = body.userCountChange;
    this.sessionCount = body.sessionCount;
    this.sessionCountChange = body.sessionCountChange;
    this.bounceRate = body.bounceRate;
    this.bounceRateChange = body.bounceRateChange;
    this.impressions = body.impressions;
    this.impressionsChange = body.impressionsChange;

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
    for (let i = 1; i < 10000; i++) {
      if (i * 4 * 5 > maxValue) {
        this.gridScale = i;
        break;
      }
    }

    let maxGrid = 0;

    this.grids = [];
    for (let i = 1; i < 5; i++) {
      const y = i * this.gridScale * 5;
      this.grids.push(y);
      maxGrid = i * y > maxGrid ? y : maxGrid;
    }

    this.scale = this.height / 1.118 / maxGrid;
    let shift = -335;

    this.viewBox = `0  ${shift} ${this.width} ${this.height}`;
    this.transform = 'scale (1,-' + this.scale + ')';
    return body;
  }

  changePeriod(val) {
    this.period = val;
    this.getData();
    const keyPath = 'admin.tabs.chart.period';
    this.pS.pref.save({ [keyPath]: this.period });
  }
}
