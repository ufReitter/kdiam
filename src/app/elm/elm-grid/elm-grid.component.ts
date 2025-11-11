import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'kd-elm-grid',
  standalone: false,
  templateUrl: './elm-grid.component.html',
  styleUrls: ['./elm-grid.component.scss'],
})
export class ElmGridComponent implements OnInit {
  @Input() child: any;

  constructor() {}

  ngOnInit(): void {}

  viewElement() {}
}
