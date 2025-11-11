import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'kd-users',
  standalone: false,
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  table: any;
  refresh: any;

  constructor(public http: HttpClient, public dS: DataService) {}

  ngOnInit() {
    this.table = {
      full: true,
      rowh: true,
      cols: [
        { field: 'nickname', text: true, sortable: true, width: '25%' },
        { field: 'company', text: true, sortable: true, width: '25%' },
        { field: 'email', text: true, sortable: true, width: '25%' },
        {
          field: 'email_verified',
          header: 'verified',
          mode: 'check',
          text: true,
          sortable: true,
          disabled: true,
          width: '10%',
        },
        {
          field: 'blocked',
          mode: 'check',
          text: true,
          sortable: true,
          width: '10%',
        },
        {
          field: '_id',
          text: true,
          sortable: true,
          mode: 'objectId',
          width: '25%',
        },
      ],
      data: [],
    };

    this.http.get(this.dS.origin + '/api/users/all').subscribe((body) => {
      this.table.data = body;
      this.refresh = new Date().toISOString();
    });
  }
}
