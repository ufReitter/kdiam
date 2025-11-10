import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'kd-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit {
  articles: any[] = [];
  notification_at: Date;
  countNew = 0;
  countNewShow: string = '';
  constructor(public pS: ProfileService, public dS: DataService) {}

  ngOnInit(): void {
    this.pS.pref.notification_at = new Date('2024-05-02');
    for (const node of this.dS.selVol.flatTree) {
      const elm = node.elm;
      this.articles.push({
        elm: elm,
        date: elm.published_at || elm.created_at,
      });
    }
    for (const node of this.dS.selVol.flatTree) {
      const elm = node.elm;
      if (elm.txts.changes) {
        for (let i = 0; i < elm.txts.changes.length; i++) {
          const change = elm.txts.changes[i];

          this.articles.push({
            elm: elm,
            date: new Date(change.date),
            i18n: {
              de: elm.i18n.de.strs.changes[i]?.txt,
              en: elm.i18n.de.strs.changes[i]?.txt,
            },
          });
        }
      }
    }
    this.articles.sort((a, b) => {
      return a.date < b.date ? 1 : -1;
    });
    this.notification_at = this.pS.pref.notification_at;
    for (const node of this.articles) {
      if (node.elm.created_at > this.notification_at) {
        this.countNew++;
      }
    }
    if (this.countNew < 9) {
      this.countNewShow = this.countNew.toString();
    } else {
      this.countNewShow = '9+';
    }
  }
  showNotifications() {
    this.pS.pref.notification_at = new Date();
    this.pS.pref.save({ notification_at: this.pS.pref.notification_at });
  }
  closeNotifications() {
    this.countNew = 0;
    this.countNewShow = '';
  }
}
