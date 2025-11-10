import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'kd-elm-grid',
  templateUrl: './elm-grid.component.html',
  styleUrls: ['./elm-grid.component.css'],
})
export class ElmGridComponent implements OnInit {
  @Input() child: any;

  constructor() {}

  ngOnInit(): void {}

  viewElement() {}
}
