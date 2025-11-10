import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { ElmNode } from 'src/app/engine/entity';
import { Elm } from '../engine/entity';
import { DataService } from '../services/data.service';

@Injectable({
  providedIn: 'root',
})
export class NodeResolver implements Resolve<ElmNode> {
  subject: Subject<ElmNode>;
  elm: Elm;
  vol: Elm;
  info: any;
  node: ElmNode;
  success: boolean;
  constructor(
    private router: Router,
    @Inject(DataService) private dS: DataService,
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
  ): Observable<ElmNode> | Promise<ElmNode> | ElmNode {
    const urlSegments = route.url.map((s) => s.path);
    const obs = this.dS.getNode(urlSegments);

    return obs;
  }
}
