import { Injectable, Inject } from '@angular/core';

import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { Elm } from '../engine/entity';
import { DataService } from '../services/data.service';
import { Observable, timer } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminResolver  {
  constructor(
    private router: Router,
    @Inject(DataService) private dS: DataService,
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean> {
    const status = new Observable<any>((stat) => {
      stat.next(true);
      stat.complete();
    });

    if (!this.dS.loaded) {
      let delay = timer(100).subscribe((t) => {
        // this.dS.subject.loaded.next(true);
      });
    }

    return status;
  }
}
