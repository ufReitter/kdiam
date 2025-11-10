import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { ReditService } from '../redit.service';

@Component({
  selector: 'kd-history-item',
  templateUrl: './history-item.component.html',
  styleUrls: ['./history-item.component.scss'],
})
export class HistoryItemComponent implements OnInit {
  @Input() item: any;
  @Input() kind: string;
  @Input() index: number;

  constructor(
    private http: HttpClient,
    public dS: DataService,
    public rS: ReditService,
  ) {}

  ngOnInit(): void {}
}
