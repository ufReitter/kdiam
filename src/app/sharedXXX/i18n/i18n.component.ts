import { Component, Input, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';

@Component({
  selector: '[kdI18n]',
  standalone: false,
  templateUrl: './i18n.component.html',
  styleUrls: ['./i18n.component.scss'],
})
export class I18nComponent implements OnInit {
  ident = '';
  identProp = '';

  @Input() key: any;
  @Input() element_id: any;
  @Input() elm: any;
  @Input() prop: any;

  value = '';

  constructor(public dS: DataService) {}

  ngOnInit() {
    this.ident = this.key || this.element_id || this.elm._eid;
    this.identProp = this.prop || 'lbl';

    this.dS.subject.locale.subscribe((localeInd) => {});
  }
}
