import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { ElmNode } from 'src/app/engine/entity';
import { Elm } from '../engine/entity';
import { ContentManager } from '../shared/content-manager/content-manager';

@Injectable({
  providedIn: 'root',
})
export class NodeResolver {
  subject: Subject<ElmNode>;
  elm: Elm;
  vol: Elm;
  info: any;
  node: ElmNode;
  success: boolean;
  constructor(
    private router: Router,
    @Inject(ContentManager) private cM: ContentManager,
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
  ): Observable<ElmNode> | Promise<ElmNode> | ElmNode {
    const urlSegments = route.url.map((s) => s.path);
    const obs = this.cM.getNode(urlSegments);

    return obs;
  }
}
