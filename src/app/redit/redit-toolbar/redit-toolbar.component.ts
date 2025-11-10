import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Elm } from 'src/app/engine/entity';
import { DataService } from 'src/app/services/data.service';
import { ProfileService } from 'src/app/services/profile.service';
import { ViewService } from 'src/app/services/view.service';

@Component({
  selector: 'kd-redit-toolbar',
  templateUrl: './redit-toolbar.component.html',
  styleUrls: ['./redit-toolbar.component.css'],
})
export class ReditToolbarComponent implements OnInit {
  @Input() elm: Elm;
  @Input() elms: Elm[] = [];
  index: number = 0;
  constructor(
    public router: Router,
    public dS: DataService,
    public pS: ProfileService,
    public vS: ViewService,
  ) {}

  ngOnInit(): void {}
  ngOnChanges(): void {}

  viewElement(event, elm) {
    this.dS.navigate(elm);
  }
}
