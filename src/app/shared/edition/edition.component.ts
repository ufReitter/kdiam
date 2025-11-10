import { HttpClient } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'kd-edition',
  templateUrl: './edition.component.html',
  styleUrls: ['./edition.component.scss'],
})
export class EditionComponent implements OnInit, OnDestroy {
  months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Okt',
    'Nov',
    'Dec',
  ];
  edition: string;
  parts = [];
  dateString = 'Fri Aug 13 2021';
  volumeSubject: Subscription;
  statusSubject: Subscription;
  @Input() role: string;
  constructor(public http: HttpClient, public dS: DataService) {}

  ngOnInit(): void {
    this.volumeSubject = this.dS.subject.volume.subscribe((vol) => {
      this.statusSubject = this.dS.subject.status.subscribe((status) => {
        if (status.editions) {
          const ed = status.editions.find((e) => e._eid === vol?._eid?.str);
          if (ed) {
            this.parts = ed.edition.split('.') || [];

            this.dateString =
              'Fri ' +
              this.months[Number(this.parts[1])] +
              ' 13 ' +
              this.parts[0];
          }
        }
      });
    });
  }
  ngOnDestroy() {
    if (this.volumeSubject) this.volumeSubject.unsubscribe();
  }
  checkChangeLog() {}
  viewElement(e) {}
}
