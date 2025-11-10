import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Observable, Subject, timer } from 'rxjs';
import { ElmNode } from 'src/app/engine/entity';
import { Elm } from '../engine/entity';
import { DataService } from '../services/data.service';
import { ProfileService } from '../services/profile.service';

@Injectable({
  providedIn: 'any',
})
export class ChildResolver implements Resolve<any> {
  elm: Elm;
  subject: Subject<any>;
  vol: Elm;
  info: any;
  node: ElmNode;
  success: boolean;
  result: any = {};
  constructor(
    private router: Router,
    @Inject(ProfileService) private pS: ProfileService,
    @Inject(DataService) private dS: DataService,
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> | Promise<any> | any {
    const id = Number(route.paramMap.get('ident'));

    this.subject = new Subject<any>();
    const obs = this.subject.asObservable();

    this.result.rootElm = this.dS.selElm;
    this.result.index = id;
    this.result.length = this.dS.selElm.children.length;
    if (id === 0) {
      this.result.elm = this.result.rootElm;
    } else {
      this.result.elm = this.dS.selElm.children[id - 1].elm;
    }

    let delay = timer(0).subscribe((t) => {
      this.subject.next(this.result);
      this.subject.complete();
    });

    return obs;
  }
}
