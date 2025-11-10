import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { timer } from 'rxjs';
import { Elm } from '../../engine/entity';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'kd-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  @ViewChild('input', { static: false }) input;
  show: boolean;
  filter = '';
  searchResults: any[];

  showAutoComplete: boolean;

  featureElm: Elm;
  text: any;

  loading = false;

  @ViewChild('searchMenu') searchMenu;

  constructor(private router: Router, public dS: DataService) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.show = false;
      }
    });
  }

  ngOnInit() {}

  openMenue() {
    let loadElm = '';
    for (const nd of this.dS.selVol.flatTree) {
      if (!this.dS.obj[nd.id]) {
        loadElm = nd.id;
        break;
      }
    }
    if (loadElm) {
      this.loading = true;
      this.prepareSearch(loadElm);
    } else {
      this.input.nativeElement.focus();
      if (this.filter.length > 2) {
        this.dS.searchTerm = this.filter;
        this.dS.subject.search.next(this.dS.searchTerm);
      }
    }
  }
  async prepareSearch(id) {
    await this.dS.loadHttp(this.dS.locale, id, false, false, true);
    this.loading = false;

    let delay = timer(50).subscribe((t) => {
      this.input.nativeElement.focus();
    });
    if (this.filter.length > 2) {
      this.dS.searchTerm = this.filter;
      this.dS.subject.search.next(this.dS.searchTerm);
    }
  }

  clearInput() {
    this.filter = '';
    this.dS.searchTerm = '';
    this.searchResults = [];
    this.dS.subject.search.next(this.dS.searchTerm);
  }

  onInputChange(e) {
    this.searchResults = [];
    this.dS.searchTerm = '';
    if (e.length > 2) {
      this.dS.searchTerm = e;
      this.searchResults = this.search(e);
    }
    this.dS.subject.search.next(this.dS.searchTerm);
  }

  onInputEnter($event) {}

  showSearch() {
    this.show = true;
  }

  hideSearch() {
    this.show = false;
    this.showAutoComplete = false;
  }

  private search(value: string): any[] {
    const filterValue = value.toLowerCase();
    const nodes = this.dS.selVol.flatTree;

    let results = [];

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const elm = nodes[i].elm;
      const res = this.hit(node, filterValue);
      if (res) {
        results.push(res);
      }
    }
    results.sort((x, y) => {
      let a, b;
      a = x.elm.absnum;
      b = y.elm.absnum;
      if (a > b) return 1;
      if (a < b) return -1;
    });
    // results.sort((x, y) => {
    //   let a, b;
    //   a = (x.elm.txts.lbl || '')
    //     .toLowerCase()
    //     .replace(/ä/gi, 'ae')
    //     .replace(/ö/gi, 'oe')
    //     .replace(/ü/gi, 'ue');
    //   b = (y.elm.txts.lbl || '')
    //     .toLowerCase()
    //     .replace(/ä/gi, 'ae')
    //     .replace(/ö/gi, 'oe')
    //     .replace(/ü/gi, 'ue');
    //   if (a > b) return 1;
    //   if (a < b) return -1;
    // });
    return results;
  }

  private hit(node, val) {
    let res, hitNode;
    const elm = this.dS.obj[node.id];
    if (!elm) return;
    if (elm.children?.length) {
      for (const it of elm.children) {
        const elm = it.elm;

        if (elm.txts.lbl?.toLowerCase().includes(val)) {
          hitNode = node;
        }
        if (elm.txts.cpt?.toLowerCase().includes(val)) {
          hitNode = node;
        }
        if (elm.txts.bdy?.toLowerCase().includes(val)) {
          hitNode = node;
        }
      }
    }
    if (elm.txts.lbl?.toLowerCase().includes(val)) {
      hitNode = node;
    }
    if (elm.txts.cpt?.toLowerCase().includes(val)) {
      hitNode = node;
    }
    if (elm.txts.bdy?.toLowerCase().includes(val)) {
      hitNode = node;
    }
    if (hitNode) {
      res = {
        node: hitNode,
        elm: elm,
      };
    }
    return res;
  }

  stopPropagation(event) {
    event.stopPropagation();
  }
}
