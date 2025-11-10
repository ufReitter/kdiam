import { Inject, Injectable } from '@angular/core';

import { ActivatedRouteSnapshot, Resolve } from '@angular/router';

import { ElmNode } from 'src/app/engine/entity';
import { DataService } from '../services/data.service';
import { ReditService } from './redit.service';

@Injectable({
  providedIn: 'root',
})
export class ReditResolver implements Resolve<ElmNode> {
  constructor(
    @Inject(DataService) private dS: DataService,
    @Inject(ReditService) private rS: ReditService,
  ) {}

  resolve(route: ActivatedRouteSnapshot): any {
    const urlSegments = route.url.map((s) => s.path);
    const component = route.paramMap.get('component');
    const id = route.paramMap.get('id');
    const elm = this.rS.getElm(id);
    return elm;
  }
}
