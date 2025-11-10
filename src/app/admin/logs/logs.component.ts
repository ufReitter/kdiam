import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  ViewChild,
} from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MatLegacyPaginator as MatPaginator } from '@angular/material/legacy-paginator';
import { MatSort, SortDirection } from '@angular/material/sort';
import { Router } from '@angular/router';
import {
  lastValueFrom,
  merge,
  Observable,
  of as observableOf,
  Subscription,
  timer,
} from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { DataService } from 'src/app/services/data.service';
import { ProfileService } from 'src/app/services/profile.service';
import { ViewService } from 'src/app/services/view.service';

@Component({
  selector: 'kd-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.css'],
})
export class LogsComponent implements AfterViewInit {
  ipFilter = '';
  @Input() bust: number;
  @Input() palim: boolean;
  @Input() context: string;
  @Input() tabIndex: number;
  href = 'https://api.github.com/search/issues?q=repo:angular/components';
  displayedColumns: string[] = [
    'created_at',
    'msg',
    'user_id',
    'remote_address',
    'os',
    'browser',
  ];
  database: HttpDatabase | null;
  data: AnalyticsItem[] = [];

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;
  sortActive = 'created_at';
  sortDirection = 'desc';
  period = 'week';
  level = 'INFO';
  accessTimer: any;
  latestDate: string;
  cron: any;
  hour: number;
  statusSub: Subscription;
  showElement: any;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  updateEvent = new EventEmitter<boolean>();
  success = 'all';
  showWhoisElement: any = [];
  showErrorItem: any;
  popUpIsShown = false;
  referings = [];

  constructor(
    public router: Router,
    private _httpClient: HttpClient,
    public dialog: MatDialog,
    public vS: ViewService,
    public pS: ProfileService,
    public dS: DataService,
  ) {}

  ngOnInit() {
    if (this.context === 'system') {
      this.context = this.pS.pref.admin?.tabs.system?.context || this.context;
    }
    this.period = this.pS.pref.admin?.tabs[this.context]?.period || this.period;
    this.level = this.pS.pref.admin?.tabs[this.context]?.level || this.level;
    this.success =
      this.pS.pref.admin?.tabs[this.context]?.success || this.success;
  }
  ngOnChanges() {
    if (this.bust) {
      this.updateEvent.emit(true);
    }
    if (
      this.palim === false &&
      (this.context === 'ranking' || this.context === 'webclient')
    ) {
      let delay = timer(500).subscribe((t) => {
        if (this.accessTimer) {
          this.accessTimer.unsubscribe();
          this.accessTimer = null;
        }
        if (this.statusSub) {
          this.statusSub.unsubscribe();
          this.statusSub = null;
        }
        if (this.context === 'ranking') {
          this.displayedColumns = ['impressions', 'route'];
          this.sortActive = this.sort.active = 'impressions';
        }
        if (this.context === 'webclient') {
          this.sortActive = this.sort.active = 'last_active';
        }
        this.period = 'day';
        this.pS.pref.admin.tabs[this.context].period = this.period;
        this.updateEvent.emit(true);
      });
    }
    if (
      this.palim &&
      (this.context === 'ranking' ||
        this.context === 'webclient' ||
        this.context === 'referer')
    ) {
      if (!this.statusSub) {
        this.statusSub = this.dS.subject.status.subscribe((status) => {
          if (status) {
            let delay = timer(500).subscribe((t) => {
              if (status.usersActiveCount) {
                this.pS.pref.admin.tabs[this.context].period = this.period;
                if (this.context === 'ranking') {
                  this.period = 'realtime';
                  this.displayedColumns = ['last_active', 'route'];
                  this.sortActive = this.sort.active = 'last_active';
                }
                if (this.context === 'webclient') {
                  this.sortActive = this.sort.active = 'last_active';
                }
                if (!this.accessTimer) {
                  this.accessTimer = timer(0, 5000).subscribe(async () => {
                    if (!this.popUpIsShown) {
                      this.updateEvent.emit(true);
                    }
                  });
                }
              } else {
                if (this.context === 'ranking') {
                  this.displayedColumns = ['impressions', 'route'];
                  this.sortActive = this.sort.active = 'impressions';
                }
                if (this.context === 'webclient') {
                  this.sortActive = this.sort.active = 'last_active';
                }
                this.period = 'day';
                this.pS.pref.admin.tabs[this.context].period = this.period;
                if (this.accessTimer) {
                  this.accessTimer.unsubscribe();
                  this.accessTimer = null;
                  this.updateEvent.emit(true);
                }
              }
            });
          }
        });
        let delay = timer(500).subscribe((t) => {
          if (this.context === 'ranking') {
            this.displayedColumns = ['impressions', 'route'];
            this.sortActive = this.sort.active = 'impressions';
          }
          this.updateEvent.emit(true);
        });
      }
    } else {
      // let delay = timer(500).subscribe((t) => {
      //   this.changePeriod(
      //     this.pS.pref.admin?.tabs[this.context]?.period || this.period,
      //   );
      // });
      // if (this.statusSub) {
      //   this.statusSub.unsubscribe();
      //   this.statusSub = null;
      // }
      // if (
      //   this.context === 'system' ||
      //   this.context === 'login' ||
      //   this.context === 'client'
      // ) {
      //   if (this.tabIndex === 2) {
      //     this.accessTimer = timer(5, 5000).subscribe(async () => {
      //       this.updateEvent.emit(true);
      //     });
      //   } else {
      //     if (this.accessTimer) {
      //       this.accessTimer.unsubscribe();
      //       this.accessTimer = null;
      //     }
      //   }
      // }
      // if (this.context === 'webclient' || this.context === 'ranking') {
      //   if (this.tabIndex === 0 && this.period === 'realtime') {
      //     this.accessTimer = timer(5, 5000).subscribe(async () => {
      //       this.updateEvent.emit(true);
      //     });
      //   } else {
      //     if (this.accessTimer) {
      //       this.accessTimer.unsubscribe();
      //       this.accessTimer = null;
      //     }
      //   }
      // }
    }
  }

  ngAfterViewInit() {
    if (this.context === 'login') {
      this.href = this.dS.origin + '/api/logs?context=login';
      this.displayedColumns = [
        'created_at',
        'remote_address',
        'os',
        'browser',
        'success',
        'msg',
        'nickname',
        'user_id',
      ];
    } else if (this.context === 'client') {
      this.href = this.dS.origin + '/api/logs?context=client';
      this.displayedColumns = [
        'created_at',
        'level',
        'error',
        'msg',
        'remote_address',
        'os',
        'browser',
        'user_id',
      ];
    } else if (this.context === 'system') {
      this.href = this.dS.origin + '/api/logs?context=system';
      this.displayedColumns = ['created_at', 'level', 'msg'];
      this.period = 'realtime';
    } else if (this.context === 'webclient') {
      this.href = this.dS.origin + '/api/stats?context=webclient';
      this.displayedColumns = [
        'created_at',
        'last_active',
        'impressions',
        'sessions',
        'country',
        'agents',
        'remote_address',
        'ip_range',
        'whois',
        'user_ids',
      ];
      // if (this.period === 'realtime') {
      //   this.accessTimer = timer(0, 5000).subscribe(async () => {
      //     this.updateEvent.emit(true);
      //   });
      // }
      this.cron = setInterval(() => {
        const hour = new Date().getHours();
        if (hour !== this.hour) {
          this.updateEvent.emit(true);
          this.hour = hour;
        }
      }, 60000);
      this.sortActive = this.sort.active = 'last_active';
    } else if (this.context === 'navigation') {
      this.href = this.dS.origin + '/api/stats/navs?context=navigation';
      this.displayedColumns = [
        'created_at',
        'route',
        'remote_address',
        'user_id',
        'nickname',
      ];
    } else if (this.context === 'ranking') {
      this.href = this.dS.origin + '/api/stats?context=ranking';
      if (this.period === 'realtime') {
        this.displayedColumns = ['last_active', 'route'];
        // this.accessTimer = timer(0, 5000).subscribe(async () => {
        //   this.updateEvent.emit(true);
        // });
      } else {
        this.displayedColumns = ['impressions', 'route'];
        this.cron = setInterval(() => {
          const hour = new Date().getHours();
          if (hour !== this.hour) {
            this.updateEvent.emit(true);
            this.hour = hour;
          }
        }, 60000);
      }
      this.sortActive = this.sort.active = 'impressions';
    } else if (this.context === 'referer') {
      this.href = this.dS.origin + '/api/stats?context=referer';
      this.displayedColumns = [
        'created_at',
        'last_active',
        'refered',
        'referer',
        'route',
      ];
      this.cron = setInterval(() => {
        const hour = new Date().getHours();
        if (hour !== this.hour) {
          this.updateEvent.emit(true);
          this.hour = hour;
        }
      }, 60000);

      this.period = 'month';
      this.sortActive = this.sort.active = 'last_active';
    }
    this.database = new HttpDatabase(this._httpClient, this.href);

    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page, this.updateEvent)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.database!.getAnalytics(
            this.href,
            this.period,
            this.sort.active,
            this.sort.direction,
            this.paginator.pageIndex,
            this.paginator.pageSize,
            this.level,
            this.success,
            this.latestDate,
            this.ipFilter,
          ).pipe(catchError(() => observableOf(null)));
        }),
        map((data) => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          this.isRateLimitReached = data === null;

          if (data === null) {
            return this.data;
          }

          if (this.period === 'realtime') {
            this.latestDate =
              data.items[0]?.last_active || data.items[0]?.created_at;
          }

          // Only refresh the result length if there is new data. In case of rate
          // limit errors, we do not want to reset the paginator to zero, as that
          // would prevent users from re-triggering requests.
          this.resultsLength = data.total_count;
          return data.items;
        }),
      )
      .subscribe((data) => {
        this.data = data;
        if (this.context === 'ranking') {
          this.referings = [];
          this.data.forEach((item) => {
            if (item.referer) {
              this.referings.push({ referer: item.referer, route: item.route });
            }
          });
        }
      });
  }
  ngOnDestroy() {
    if (this.accessTimer) {
      this.accessTimer.unsubscribe();
      this.accessTimer = null;
    }
    if (this.statusSub) {
      this.statusSub.unsubscribe();
      this.statusSub = null;
    }
    if (this.cron) {
      clearInterval(this.cron);
    }
  }
  clickRoute(e, route) {
    if (e.altKey) {
      this.vS.copyFromContent(route);
    } else {
      const rs = route.replace('/', '').split('(')[0].split('/');
      this.router.navigate(rs);
    }
  }
  createShowAgents(agents) {
    this.popUpIsShown = true;
    this.showElement = agents.map((agent) => {
      const ua = [];
      for (const key in agent) {
        if (Object.prototype.hasOwnProperty.call(agent, key)) {
          const element = agent[key];
          ua.push({ key: key, value: element });
        }
      }
      return ua;
    });
  }
  createShowWhois(whois) {
    this.popUpIsShown = true;
    this.showWhoisElement = [];
    for (const key in whois) {
      if (Object.prototype.hasOwnProperty.call(whois, key)) {
        const element = whois[key];
        this.showWhoisElement.push({ key: key, value: element });
      }
    }
  }
  changePeriod(val) {
    this.period = val;
    if (this.period === 'realtime') {
      if (this.context === 'ranking') {
        this.displayedColumns = ['last_active', 'route'];
        this.sortActive = this.sort.active = 'last_active';
      }
      if (this.context === 'webclient') {
        this.sortActive = this.sort.active = 'last_active';
      }
      if (!this.accessTimer) {
        this.accessTimer = timer(0, 5000).subscribe(async () => {
          this.updateEvent.emit(true);
        });
      }
    } else {
      this.latestDate = '';
      if (this.accessTimer) {
        this.accessTimer.unsubscribe();
        this.accessTimer = null;
      }

      if (this.context === 'ranking') {
        this.displayedColumns = ['impressions', 'route'];
        this.sortActive = this.sort.active = 'impressions';
      }
      if (this.context === 'webclient') {
        this.sortActive = this.sort.active = 'last_active';
      }
      this.updateEvent.emit(true);
      if (this.accessTimer) {
        this.accessTimer.unsubscribe();
        this.accessTimer = null;
      }
    }
    const keyPath = 'admin.tabs.' + this.context + '.period';
    this.pS.pref.save({ [keyPath]: this.period });
  }
  changeContext(val) {
    this.latestDate = '';
    this.context = val.value;
    switch (this.context) {
      case 'login':
        this.href = this.dS.origin + '/api/logs?context=login';
        this.displayedColumns = [
          'created_at',
          'remote_address',
          'os',
          'browser',
          'success',
          'msg',
          'nickname',
          'user_id',
        ];
        break;
      case 'client':
        this.href = this.dS.origin + '/api/logs?context=client';
        this.displayedColumns = [
          'created_at',
          'level',
          'error',
          'msg',
          'remote_address',
          'os',
          'browser',
          'user_id',
        ];
        break;
      case 'system':
        this.href = this.dS.origin + '/api/logs?context=system';
        this.displayedColumns = ['created_at', 'level', 'msg'];
        break;

      default:
        break;
    }
    this.level = this.pS.pref.admin?.tabs[this.context]?.level;
    this.success = this.pS.pref.admin?.tabs[this.context]?.success;
    this.updateEvent.emit(true);
    const keyPath = 'admin.tabs.system.context';
    this.pS.pref.save({ [keyPath]: this.context });
  }
  changeLevel(val) {
    this.level = val.value;
    this.updateEvent.emit(true);
    const keyPath = 'admin.tabs.' + this.context + '.level';
    this.pS.pref.save({ [keyPath]: this.level });
  }
  changeSuccess(val) {
    this.success = val.value;
    this.updateEvent.emit(true);
    const keyPath = 'admin.tabs.' + this.context + '.success';
    this.pS.pref.save({ [keyPath]: this.success });
  }
  reload() {
    this.updateEvent.emit(true);
  }
  showError(err) {
    console.log(err, err.message);
    // const dialogRef = this.dialog.open(ErrorDialogComponent, {
    //   height: '390px',
    //   width: '600px',
    //   restoreFocus: false,
    //   data: err,
    // });

    // dialogRef.afterClosed().subscribe((res) => {
    //   if (res.data) {
    //   } else {
    //   }
    // });
  }
  logArray(arr) {
    for (const it of arr) {
      console.prettyPrint(it);
    }
  }
  async whois(row) {
    // row.remote_address = '95.223.75.17, 136.228.208.141';
    const parts = row.remote_address.replace(' ', '').split(',');
    for (const ip of parts) {
      const href = this.dS.origin + '/api/status/whois?str=' + ip;
      const data$: any = this._httpClient
        .get<any>(href)
        .pipe(catchError((e) => this.dS.httpError(e)));

      const body: any = await lastValueFrom(data$);

      console.prettyPrint(body.data);
    }
  }
}

export interface AnalyticsApi {
  items: AnalyticsItem[];
  total_count: number;
}

export interface AnalyticsItem {
  created_at: string;
  last_active: string;
  number: string;
  state: string;
  title: string;
  route: string;
  referer: string;
}

export class HttpDatabase {
  constructor(private _httpClient: HttpClient, private href) {}

  getAnalytics(
    href: string,
    period: string,
    sort: string,
    order: SortDirection,
    page: number,
    size: number,
    level: string,
    success: string,
    latest: string,
    ipFilter: string,
  ): Observable<AnalyticsApi> {
    const cachebust = Math.random();
    let requestUrl = `${href}&period=${period}&level=${level}&success=${success}&sort=${sort}&order=${order}&page=${page}&per_page=${size}&cb=${cachebust}&filter=${ipFilter}`;
    if (latest) {
      requestUrl += '&latest=' + latest;
    }

    return this._httpClient.get<AnalyticsApi>(requestUrl);
  }
}
function ipsBetween(start, end?) {
  if (!end) {
    end = start.split(' - ')[1];
    start = start.split(' - ')[0];
  }
  //TODO
  var startArr = start.split('.');
  var endArr = end.split('.');
  var diffIndex = 0;

  for (var i = 0; i < 4; i++) {
    if (startArr[i] != endArr[i]) {
      diffIndex = i;
      break;
    }
  }

  if (diffIndex == 3) {
    return Number(endArr[3] - startArr[3]);
  } else if (diffIndex == 2) {
    return (Number(endArr[2]) - Number(startArr[2])) * (256 - startArr[3]);
  } else if (diffIndex == 1) {
    let all = endArr[2] === startArr[2] ? Math.pow(2, 16) : 65793;
    return all;
  } else {
    let all = Number(endArr[0]) === 181 ? 16777216 : 67372036;
    return all;
  }
}
