import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Elm, ElmNode } from 'src/app/engine/entity';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'kd-elm-legacy',
  standalone: false,
  templateUrl: './elm-legacy.component.html',
  styleUrls: ['./elm-legacy.component.scss'],
})
export class ElmLegacyComponent implements OnInit {
  node: ElmNode;
  html: string;
  @Input() elm: Elm;
  constructor(public router: Router, public dS: DataService) {}

  ngOnInit(): void {
    this.init();
  }

  async init() {
    const eid = '5e0cc2826d1fe51c8f0dae04';
    this.elm =
      this.dS.obj[eid] ||
      (await this.dS.loadHttp('de', eid, false, false, false));
    this.dS.selElm = this.elm;
  }
}
