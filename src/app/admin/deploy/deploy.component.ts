import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { catchError, lastValueFrom } from 'rxjs';
import { Elm } from 'src/app/engine/entity';
import { DataService } from 'src/app/services/data.service';
import { ProfileService } from 'src/app/services/profile.service';
import { ViewService } from 'src/app/services/view.service';

@Component({
  selector: 'kd-deploy',
  templateUrl: './deploy.component.html',
  styleUrls: ['./deploy.component.css'],
})
export class DeployComponent implements OnInit {
  editions: any = [];
  contentPending: boolean;
  contentResponse = '';
  flatFilesPending: boolean;
  flatFilesResponse = '';
  editionsTable: any;
  selectedEdition: any;
  sitemapPending: boolean;
  sitemapResponse: string;
  constructor(
    public http: HttpClient,
    public vS: ViewService,
    public pS: ProfileService,
    public dS: DataService,
  ) {
    this.editionsTable = {
      cols: [],
      data: [],
    };
  }
  createdSlugs = [];

  selectedVol: Elm;

  ngOnInit(): void {
    this.selectedVol = this.dS.selVol;
    this.selectedEdition = this.dS.editions.find((e) =>
      this.selectedVol._eid.equals(e._eid),
    );
  }

  showEditions() {
    const last = localStorage.getItem('lastEditionCheck');

    this.http
      .get(
        this.dS.origin +
          '/api/elements/editions/' +
          this.selectedVol._eid.str +
          '?last=' +
          last,
      )
      .subscribe((body: any) => {
        console.log(body);
      });
  }

  backup() {}

  changeVolume(ed) {
    this.selectedEdition = ed;
    this.selectedVol = this.dS.vols.find((v) => v._eid.equals(ed._eid));
    this.contentResponse = '';
    this.flatFilesResponse = '';
  }

  lastmod() {
    const d = new Date();
    this.selectedVol.attrib.lastmod_at = d;
    for (const it of this.selectedVol.flatTree || this.selectedVol.tree) {
      it.elm.attrib.lastmod_at = d;

      it.elm.dirty = true;
      this.dS.save(it.elm);
    }
  }

  createUrls() {
    let urls = '';
    for (const it of this.selectedVol.flatTree || this.selectedVol.tree) {
      urls +=
        this.dS.origin +
        '/' +
        this.dS.locale +
        '/' +
        this.selectedVol.txts.alias +
        '/' +
        it.elm.txts.alias +
        '\n';
    }
    console.log(urls);
  }

  createAliasSlugs() {
    for (const it of this.selectedVol.flatTree) {
      const slug = this.dS.slugify(it.elm.txts.lbl, this.dS.locale);
      if (it.elm.txts.alias !== slug) {
        it.elm.txts.alias = slug;
        it.elm.dirty = true;
        this.dS.save(it.elm);
        this.createdSlugs.push(slug);
      }
    }
  }

  async createSitemap() {
    let body = {
      _eid: this.selectedEdition._eid,
      cmd: 'sitemap',
      data: { id: this.selectedEdition._eid, origin: this.dS.origin },
    };
    this.sitemapPending = true;

    const data$: any = this.http.post<any>(`/api/elements/sitemap`, body).pipe(
      catchError((e) => {
        this.dS.errorMessage = <any>e;
        this.sitemapPending = false;
        this.sitemapResponse = 'Server error';
        return this.dS.httpError(e);
      }),
    );
    const res: any = await lastValueFrom(data$);
    this.sitemapPending = false;
    this.sitemapResponse = res.msg;
    console.log(res.slugs);
  }

  async deployContent() {
    let body = {
      _eid: this.selectedEdition._eid,
      cmd: 'content',
      data: { id: this.selectedEdition._eid, origin: this.dS.origin },
    };
    this.contentPending = true;

    const data$: any = this.http.patch<any>(`/api/elements/publish`, body).pipe(
      catchError((e) => {
        this.dS.errorMessage = <any>e;
        this.contentPending = false;
        this.contentResponse = 'Server error';
        return this.dS.httpError(e);
      }),
    );
    const res: any = await lastValueFrom(data$);
    this.contentPending = false;
    this.contentResponse = res.msg;
  }

  prerender() {
    let body = { cmd: 'prerender', data: this.selectedVol._eid.str };
    this.dS.serverApi('/admin/deploy', body).subscribe(
      (body) => this.deployAction(body),
      (error) => (this.dS.errorMessage = <any>error),
    );
  }

  deploy(cmd) {
    let body = { cmd: cmd, data: '' };
    if (cmd === 'pfile') {
      let txt = `/
/de
/de/typographie
/de/404
/de/kontakt
/de/impressum
/en
/en/typography
/en/404
/en/contact
/en/impress
`;
      for (const l of this.dS.locales) {
        for (const v of this.dS.vols) {
          let vid = v.i18n[l].alias || v._eid.str;
          txt += '/' + l + '/' + vid + '\n';
          for (const c of v.children) {
            let cid = c.elm.i18n[l].alias || c.elm._eid.str;
            txt += '/' + l + '/' + vid + '/' + cid + '\n';
          }
        }
      }
      body.data = txt;
    }
    this.dS.serverApi('/admin/deploy', body).subscribe(
      (body) => this.deployAction(body),
      (error) => (this.dS.errorMessage = <any>error),
    );
  }

  deployAction(body) {
    console.log(body);
  }
}
