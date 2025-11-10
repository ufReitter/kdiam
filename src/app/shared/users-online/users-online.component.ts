import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { ProfileService } from 'src/app/services/profile.service';
import { ViewService } from 'src/app/services/view.service';

@Component({
  selector: 'kd-users-online',
  templateUrl: './users-online.component.html',
  styleUrls: ['./users-online.component.css'],
})
export class UsersOnlineComponent implements OnInit {
  usersByName = [];
  usersAnon = [];
  statusSubject: Subscription;

  constructor(
    public router: Router,
    public vS: ViewService,
    public pS: ProfileService,
    public dS: DataService,
  ) {}

  ngOnInit(): void {
    this.statusSubject = this.dS.subject.status.subscribe((status) => {});
  }
}
