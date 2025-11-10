import { HttpClient, HttpEventType } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileService } from 'src/app/services/profile.service';
import { environment } from '../../../environments/environment';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'kd-storage',
  templateUrl: './storage.component.html',
  styleUrls: ['./storage.component.css'],
})
export class StorageComponent {
  environment = environment;
  store: any;
  selection: any;
  selectedFiles: any;
  optionalFilter: any;
  altKeyDown: boolean;

  sortingActiveChanged: boolean;
  sortByIcon = 'edit_attributes';
  sortDirIcon = 'south';

  userId: string;

  constructor(
    public pS: ProfileService,
    public dS: DataService,
    private router: Router,
    private http: HttpClient,
  ) {}
  ngOnInit() {
    this.sortDirIcon =
      this.pS.pref.sorting.direction === 'asc' ? 'south' : 'north';

    this.setSortByIcon();
  }

  onKeydownFilter(event) {
    if (event.key === 'Alt') {
      this.altKeyDown = true;
    }
  }
  onKeyupFilter(event) {
    if (event.key === 'Alt') {
      this.altKeyDown = false;
    }
  }

  toggleSelection() {
    if (!this.dS.checked.length) {
      this.dS.allSelection();
    } else {
      this.dS.clearSelection();
    }
  }

  addToGlossary() {
    for (const it of this.dS.checked) {
      it.attrib.glossary = true;
      it.dirty = true;
      this.dS.save(it);
    }
    const glossary = this.dS.obj['6100264be682ad1b0457a727'];
    glossary.defSubject.next(glossary.def);
    this.dS.clearSelection();
  }

  addElement() {
    let elm = this.dS.addElement('ipsum');
    this.dS.viewNewElement({ selection: true, editor: false });
  }

  filterRadio() {
    let query = this.pS.pref.query;
    query.figure = false;
    query.table = false;
    query.textbody = false;
    query.code = false;
    query.children = false;

    this.dS.filter(this.userId);
  }

  filter() {
    this.dS.filter(this.userId);
  }

  filterWarnings(event) {}

  onFilter(event) {
    if (this.altKeyDown) {
      event.value = [event.source.value];
    }
    this.pS.pref.filter = event.value;
    this.dS.filter(this.userId);
  }
  onFilterDbl(event) {}

  onFilterString() {
    if (
      this.pS.pref.filterString.length >= 3 ||
      this.pS.pref.filterString.length === 0
    ) {
      this.dS.filter(this.userId);
    }
  }

  sortBy(value) {
    if (value !== this.pS.pref.sorting.active) {
      if (value === 'tasksort') {
        this.pS.pref.sorting.direction = 'asc';
      }
      if (value === 'ident') {
        this.pS.pref.sorting.direction = 'asc';
      }
      if (value === 'created_at') {
        this.pS.pref.sorting.direction = 'desc';
      }
      if (value === 'updated_at') {
        this.pS.pref.sorting.direction = 'desc';
      }
      if (value === 'updated_at_de') {
        this.pS.pref.sorting.direction = 'desc';
      }
      if (value === 'updated_at_en') {
        this.pS.pref.sorting.direction = 'desc';
      }
    }

    this.pS.pref.sorting.active = value;
    this.setSortByIcon();

    this.dS.sort();
  }
  setSortByIcon() {
    switch (this.pS.pref.sorting.active) {
      case 'tasksort':
        this.sortByIcon = 'edit_attributes';
        break;
      case 'ident':
        this.sortByIcon = 'sort_by_alpha';
        break;
      case 'created_at':
        this.sortByIcon = 'change_history';
        break;
      case 'updated_at':
        this.sortByIcon = 'change_history';
        break;
      case 'updated_at_de':
        this.sortByIcon = 'change_history';
        break;
      case 'updated_at_en':
        this.sortByIcon = 'change_history';
        break;

      default:
        break;
    }
  }
  sortDirectionToggle() {
    this.pS.pref.sorting.direction =
      this.pS.pref.sorting.direction === 'asc' ? 'desc' : 'asc';
    this.sortDirIcon =
      this.pS.pref.sorting.direction === 'asc' ? 'south' : 'north';
    this.dS.sort();
  }
  onSort(event) {
    this.sortingActiveChanged = true;

    if (event.value !== this.pS.pref.sorting.active) {
      if (event.value === 'tasksort') {
        this.pS.pref.sorting.direction = 'asc';
      }
      if (event.value === 'ident') {
        this.pS.pref.sorting.direction = 'asc';
      }
      if (event.value === 'updated_at') {
        this.pS.pref.sorting.direction = 'desc';
      }
      if (event.value === 'views') {
        this.pS.pref.sorting.direction = 'desc';
      }
    }

    this.pS.pref.sorting.active = event.value;

    this.dS.sort();
  }

  onSortClick(event?) {
    if (!this.sortingActiveChanged) {
      this.pS.pref.sorting.direction =
        this.pS.pref.sorting.direction === 'asc' ? 'desc' : 'asc';
      this.dS.sort();
    }
    this.sortingActiveChanged = false;
  }

  applyFilter(query?) {}

  onFileSelected(event) {
    this.onUpload(event.target.files);
  }
  onReaderLoad(event) {
    let defs = JSON.parse(event.target.result);

    if (defs) {
      if (this.dS.hasIdb) {
        this.dS.table.elms.bulkPut(defs?.elms || []).catch(function (e) {
          console.error('Database error: ' + e.message);
        });
        this.dS.table.i18ns.bulkPut(defs?.i18ns || []).catch(function (e) {
          console.error('Database error: ' + e.message);
        });
      }
      const success = this.dS.insert(defs);
      this.dS.filter(this.userId);
      for (const it of defs?.elms || []) {
        const elm = this.dS.obj[it._eid];
        if (elm) {
          elm.dirty = true;
          elm.txts.dirty = true;
          this.dS.save(elm);
        }
      }
    }
  }
  onUpload(files) {
    const fd = new FormData();
    let upload;
    for (const it of files) {
      if (it.type === 'application/json') {
        let reader = new FileReader();
        reader.onload = this.onReaderLoad.bind(this);
        reader.readAsText(it);
      }
      if (it.type === 'audio/flac') {
        fd.append('files[]', it);
        upload = true;
      }
      if (it.type === 'image/png') {
        fd.append('files[]', it);
        upload = true;
      }
      if (it.type === 'image/jpg') {
        fd.append('files[]', it);
        upload = true;
      }
    }

    if (upload) {
      this.http
        .post('/upload/figures', fd, {
          reportProgress: true,
          observe: 'events',
        })
        .subscribe((event) => {
          if (event.type === HttpEventType.UploadProgress) {
            console.log(
              'Upload Progress: ' +
                Math.round((event.loaded / event.total) * 100) +
                '%',
            );
          } else if (event.type === HttpEventType.Response) {
            let body: any = event.body;
            console.log(body.message);
            console.log(body.elements);
            if (body.elements && body.elements.length) {
              this.dS.insert(body.elements);
              this.dS.viewNewElement({
                selection: true,
                viewer: true,
                editor: true,
              });

              this.dS.table.elms.bulkPut(body.elements).catch(function (e) {
                // console.error('DatabaseClosed error: ' + e.message);
              });
            }
          }
        });
    }
  }
  haveCheckedChildren() {
    let checked = this.dS.checked;
    for (let it of checked) {
      if (it.children?.length) {
        return true;
      }
      if (it.tree?.length) {
        return true;
      }
    }
    return false;
  }
  saveElements() {
    let sel,
      elms = [],
      defs;
    if (this.dS.checked.length) {
      sel = this.dS.checked;
    } else {
      sel = this.dS.selection;
    }
    for (const it of sel) {
      elms.pushUnique(it);
      let cs = allDesc(it);
      for (const it of cs) {
        elms.pushUnique(it);
      }
    }
    defs = elms.map((elm) => {
      return elm.def;
    });
    for (const it of defs) {
      // if (it.figure && it.figure.ext === 'png') {
      //   var link = document.createElement('a');
      //   link.href = '/images/full/' + it._eid + '.png';
      //   link.download = it._eid + '.png';
      //   document.body.appendChild(link);
      //   link.click();
      //   document.body.removeChild(link);
      // }
      // if (it.figure && it.figure.ext === 'jpg') {
      //   var link = document.createElement('a');
      //   link.href = '/images/full/' + it._eid + '.jpg';
      //   link.download = it._eid + '.jpg';
      //   document.body.appendChild(link);
      //   link.click();
      //   document.body.removeChild(link);
      // }
      // if (it.figure && it.figure.ext === 'flac') {
      //   var link = document.createElement('a');
      //   link.href = '/media/' + it._eid + '.flac';
      //   link.download = it._eid + '.flac';
      //   document.body.appendChild(link);
      //   link.click();
      //   document.body.removeChild(link);
      // }
    }
    this.dS.saveToFileSystem(defs);
  }
}

function allDesc(element) {
  let result = [];
  allDescendants(element);
  function allDescendants(node) {
    let desc = node.children;
    if (desc && desc.length) {
      for (var i = 0; i < desc.length; i++) {
        var child = desc[i].elm;
        allDescendants(child);
        result.push(child);
      }
    }
  }
  return result;
}
