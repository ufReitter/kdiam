import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'kd-changelog',
  templateUrl: './changelog.component.html',
  styleUrls: ['./changelog.component.scss'],
})
export class ChangelogComponent implements OnInit {
  volumeSubject: Subscription;
  changeLogs = [];
  constructor(public http: HttpClient, public dS: DataService) {}

  ngOnInit(): void {
    this.volumeSubject = this.dS.subject.volume.subscribe((vol) => {
      if (this.dS.isBrowser) {
        // const last = localStorage.getItem('lastChangelogCheck');
        //   this.http
        //     .get(
        //       this.dS.origin +
        //         '/api/elements/changelog/?last=' +
        //         last,
        //     )
        //     .subscribe((body: any) => {
        //       if (body.success) {
        //         this.dS.changeLogs = body.data;
        //       }
        //     });
      }
    });
  }
}
