import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileService } from 'src/app/services/profile.service';
import { Elm } from '../../engine/entity';
import { DataService } from '../../services/data.service';

var NUMBER_FORMAT_REGEXP = /^(\d+)?\.((\d+)(-(\d+))?)?$/;

@Component({
  selector: 'kd-child-item',
  templateUrl: './child-item.component.html',
  styleUrls: ['./child-item.component.css'],
})
export class ChildItemComponent implements OnInit {
  warnFormat: boolean;
  ident: string;
  caption = { de: '', en: '' };

  @Input() elm: Elm;
  @Input() child: any;
  @Input() num: any;
  @Input() set: any;
  @Input() attrib: any;
  @Input() setDef: any;
  @Input() parent: Elm;
  @Input() setMode: string;

  constructor(
    private router: Router,
    public pS: ProfileService,
    public dS: DataService,
  ) {}

  ngOnInit(): void {
    if (!this.elm.txts.lbl && this.elm.txts.bdy) {
      this.ident = this.elm.i18n.de.strs.bdy
        .replace(/<(?:.|\n)*?>/gm, '')
        .substring(0, 70);
    }
  }
  ngOnChanges() {
    if (this.parent.attrib.role === 'volume') {
      this.setMode = 'volume';
    }
  }

  viewElement(event, elm) {
    if (event.altKey) {
      this.router.navigate([
        {
          outlets: {
            right: [
              'redit',
              this.pS.pref.edit[elm._eid.str]?.button || 'editor',
              elm._eid.str,
              this.pS.pref.edit[elm._eid.str]?.index || 0,
            ],
          },
        },
      ]);
    } else {
      this.dS.navigate(elm);
    }
  }

  changeNameId(child, e) {
    child.colNameId = e.value;
    if (parent) {
      this.parent.dirty = true;
      this.parent.defSubject.next(this.parent.def);
    }
  }
  changeValueId(child, e) {
    child.colValueId = e.value;
    if (parent) {
      this.parent.dirty = true;
      this.parent.defSubject.next(this.parent.def);
    }
  }

  setAttribChange(query) {
    let parent = this.set.parent;
    for (const key in query) {
      if (query.hasOwnProperty(key)) {
        let value = query[key];
        this.set.attrib[key] = value;
        this.setDef.attrib[key] = value;
      }
    }
    if (parent) {
      parent.dirty = true;
    }
  }

  setGridChange() {
    this.set.cols = this.setDef.cols;
    this.set.rows = this.setDef.rows;
    let parent = this.set.parent;
    if (parent) {
      parent.dirty = true;
    }
  }

  setFigSizeChange(query) {
    for (const key in query) {
      if (query.hasOwnProperty(key)) {
        let value = query[key];
        this.set.figure[key] = value;
        this.setDef.figure[key] = value;
      }
    }

    let parent = this.set.parent;
    if (parent) {
      parent.dirty = true;
    }
  }
  setCptChange(value) {
    this.set.attrib[this.dS.locale] = value;
    this.set.parent.dirty = true;
  }
  setBtnTextChange(value) {
    this.set.attrib.buttonText = value;
    this.set.parent.dirty = true;
  }
  setIdChange(value) {
    this.set.parent.dirty = true;
  }
  setLinkChange(value) {
    this.set.parent.dirty = true;
  }
  setDefChange(query) {
    let parent = this.set.parent;
    for (const key in query) {
      if (query.hasOwnProperty(key)) {
        let value = query[key];
        if (key === 'unit' && value) {
          value = value.replace(/\s\/\s/g, '&#8239;/&#8239;');
        }
        this.set.state[key] = value;
        this.setDef.state[key] = value;
        if (key === 'input' || key === 'play') {
          if (parent) {
            parent.fillGrids();
          }
        }
      }
    }
    if (parent) {
      parent.dirty = true;
    }
  }

  formatChange(target, format) {
    this.warnFormat = false;
    var parts = format.match(NUMBER_FORMAT_REGEXP);
    if (parts === null) {
      this.warnFormat = true;
    } else {
      if (parts[3] && parts[5] && parts[3] > parts[5]) {
        this.warnFormat = true;
      }
    }
    if (!format) {
      this.warnFormat = false;
    }
    if (!this.warnFormat) {
      if (target === 'set') {
        this.set.state.format = format;
        this.setDef.state.format = format;
        let parent = this.set.parent;
        if (parent) {
          parent.dirty = true;
        }
      }
      if (target === 'elm') {
        this.elm.state.format = format;
        this.elm.dirty = true;
      }
    }
  }
}
