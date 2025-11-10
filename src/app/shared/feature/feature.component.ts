import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Elm } from 'src/app/engine/entity';
import { DataService } from 'src/app/services/data.service';
import { ViewService } from 'src/app/services/view.service';

@Component({
  selector: 'kd-feature',
  templateUrl: './feature.component.html',
  styleUrls: ['./feature.component.scss'],
})
export class FeatureComponent implements OnInit, OnDestroy {
  featureElm: Elm;
  text: any;
  news = {
    index: 0,
    array: [
      {
        de: '<div class="kd-xxx">Erstellt mit dem <span class="kd-dark fw700 big">Kompendia.net</span> Redaktionssystem</div><div class="kd-xxx">Anzeige und Editor arbeiten auch offline</div><div class="kd-xxx">Interaktive Inhalte sind im Editor programmierbar</div>',
        en: '<div class="kd-xxx">Made with the <span class="kd-dark fw700 big">Kompendia.net</span> editorial system</div><div class="kd-xxx"> Viewer and editor are fully offline-capable</div><div class="kd-xxx">Interactive content can be programmed in the editor</div>',
      },
    ],
  };
  volumeSubject: Subscription;
  @Input() role: string;
  @Input() pos: string;
  constructor(
    private router: Router,
    public vS: ViewService,
    public dS: DataService,
  ) {}

  ngOnInit(): void {
    this.volumeSubject = this.dS.subject.volume.subscribe((v) => {
      if (v) {
        if (v.attrib.featureElm) {
          // this.featureElm = v.roleElm.feature;
          this.text = this.featureElm?.i18n || {
            de: {
              bdy: '<div class="kd-xxx"><span class="kd-dark fw700 big">4Ming®</span> Prototypen, Werkzeuge, Ziehkissen, Pressen</div><div class="kd-xxx">Unternehmensberatung, Prozessentwicklung & Prozessoptimierung</div><div class="kd-xxx">Interaktives technisches Handbuch zur Blechumformung</div>',
            },
            en: {
              bdy: '<div class="kd-xxx"><span class="kd-dark fw700 big">4Ming®</span> Prototypes, tools, die cushions, presses</div><div class="kd-xxx">Management consulting, process development & process optimization</div><div class="kd-xxx">Interactive Sheet Metal Forming Technical Guide</div>',
            },
          };
        } else {
          // this.text = null;
        }
      }
    });
  }

  ngOnDestroy() {
    this.volumeSubject.unsubscribe();
  }
}
