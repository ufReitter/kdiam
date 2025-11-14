import { FlatTreeControl } from '@angular/cdk/tree';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
  MatTreeModule,
} from '@angular/material/tree';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription, of as observableOf, timer } from 'rxjs';
import { ElmNode } from 'src/app/engine/entity';
// import { ElmFlatNode } from '../../core/interfaces';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Elm } from '../../engine/entity';
import { ContentManager } from '../content-manager/content-manager';

export class CustomTreeControl<T> extends FlatTreeControl<T> {
  expandParents(node: any) {
    const parent = this.getParent(node);
    this.expand(parent);

    if (parent && this.getLevel(parent) > 0) {
      this.expandParents(parent);
    }
  }
  getParent(node: any) {
    const currentLevel = this.getLevel(node);

    if (currentLevel < 1) {
      return null;
    }

    const startIndex = this.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.dataNodes[i];

      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
  }
}

@Component({
  selector: 'kd-volume-content',
  imports: [CommonModule, MatTreeModule, MatButtonModule, MatIconModule],
  templateUrl: './volume-content.html',
  styleUrls: ['./volume-content.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VolumeContent implements AfterViewInit, OnDestroy {
  vol: Elm;
  altObj: any = {};
  count = 0;
  isExpanded: boolean;
  showGlobal: boolean;
  expansion = 'none';
  treeControlOnChange: any;
  volumeSub: Subscription;
  routeSub: Subscription;
  viewElementSub: Subscription;
  localeSub: Subscription;
  treeControl: CustomTreeControl<ElmNode>;
  treeFlattener: MatTreeFlattener<ElmNode, ElmNode>;
  dataSource: MatTreeFlatDataSource<ElmNode, ElmNode>;
  @ViewChild('tree') tree;
  @ViewChild('scroll') scroll;
  @Input() drawer;
  defSub: Subscription;
  scrollElm: any;
  loadedSubject: any;
  touchtime = 0;
  profileSubject: any;
  showAltSub: Subscription;
  defVolSub: Subscription;
  constructor(
    private cd: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    public cM: ContentManager,
  ) {
    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      this._getLevel,
      this._isExpandable,
      this._getChildren,
    );
    this.treeControl = new CustomTreeControl<ElmNode>(
      this._getLevel,
      this._isExpandable,
    );
    this.dataSource = new MatTreeFlatDataSource(
      this.treeControl,
      this.treeFlattener,
    );
  }
  ngAfterViewInit() {
    this.vol = this.cM.selVol;
    this.scrollElm = this.scroll.nativeElement;
    this.treeControlOnChange =
      this.treeControl.expansionModel.changed.subscribe((data) => {
        data.added.forEach((node) => {
          // if (node?.expandable) {
          //   const keypath = 'contentTree.' + this.vol._eid.str + '.' + node.id;
          //   this.pS.pref.update({ [keypath]: true });
          // }
        });
        data.removed.forEach((node) => {
          // if (node?.expandable) {
          //   const keypath = 'contentTree.' + this.vol._eid.str + '.' + node.id;
          //   this.pS.pref.update({ [keypath]: false });
          // }
        });
      });
    this.defVolSub = this.vol.defSubject.subscribe((def) => {
      if (def) {
        this.dataSource.data = this.vol.tree;
        // this.expandTree();
        this.cd.detectChanges();
        this.count = this.vol.children.length;
      }
    });
    this.volumeSub = this.cM.volumeSubject.subscribe((vol) => {
      if (vol) {
        this.setVolume(vol);
      }
    });
    /* this.showAltSub = this.cM.subject.showAlt.subscribe((show) => {
      let vol, arr;
      if (show) {
        if (show === 'none') {
          arr = this.cM.arr;
        } else {
          arr = this.cM.rS.alts;
        }

        vol = arr.find((x) => x._eid.str === this.vol._eid.str);

        if (vol && this.vol !== vol) {
          this.setVolume(vol);
        } else {
          for (const nd of this.treeControl.dataNodes) {
            const elm = arr.find((x) => x._eid.str === nd.id);
          }
        }

        this.cd.detectChanges();
      }
    }); */

    this.viewElementSub = this.cM.viewElementSubject.subscribe((elm) => {
      if (elm && this.treeControl.dataNodes) {
        // let delay = timer(100).subscribe((t) => {
        let node = this.treeControl.dataNodes.find(
          (nd) => nd.id === elm._eid.str,
        );
        if (node) {
          this.treeControl.expandParents(node);
          this.treeControl.expand(node);
        }
        // });
        this.cd.detectChanges();
      }
    });
    this.localeSub = this.cM.localeSubject.subscribe((lang) => {
      //   if (lang) {
      //     for (const nd of this.treeControl.dataNodes) {
      //       const node = this.vol.flatTree.find((x) => x.id === nd.id);
      //       nd.path = node?.getPath(lang);

      //       nd.lbl = node?.elm.i18n[lang].strs.lbl || this.cM.obj[nd.id].txts.lbl;
      //     }
      let delay = timer(100).subscribe((t) => {
        this.cd.detectChanges();
      });
      //   }
    });
  }

  setVolume(v) {
    const expands = this.treeControl.dataNodes?.filter((nd) =>
      this.treeControl.isExpanded(nd),
    );
    this.vol = v;
    this.dataSource.data = v.tree;
    this.count = v.children.length;
    this.showGlobal = false;
    for (const it of this.treeControl.dataNodes) {
      if (it.expandable) {
        this.showGlobal = true;
      }
    }
    if (this.cM.selElm && this.treeControl.dataNodes && v !== this.cM.system) {
      let node = this.treeControl.dataNodes.find(
        (nd) => nd.id === this.cM.selElm._eid.str,
      );
      if (node) {
        this.treeControl.expandParents(node);
        this.treeControl.expand(node);
      }
    }
    for (const nd of expands || []) {
      const node = this.treeControl.dataNodes.find((x) => x.id === nd.id);
      this.treeControl.expand(node);
    }
  }

  hasChild = (_: number, _nodeData: ElmNode) => _nodeData.expandable;
  // notFlat
  transformer = (node: ElmNode, level: number) => {
    // const flatNode = new ElmNode();
    // flatNode.id = node.id;
    // flatNode.expandable = !!node.children;
    // flatNode.slugs = node.slugs;
    // flatNode.lbl = node.elm.txts.lbl || node.lbls[this.cM.locale];
    // flatNode.level = level;
    // flatNode.num = node.nums[0] ? node.num : '';
    // flatNode.path = node.path;

    node.level = level;
    node.expandable = !!node.children;
    return node;
  };

  private _getLevel = (node: ElmNode) => node.level;
  private _isExpandable = (node: ElmNode) => node.expandable;
  // notFlat
  private _getChildren = (node: ElmNode): Observable<ElmNode[]> =>
    observableOf(node.children);

  ngOnDestroy() {
    this.treeControlOnChange?.unsubscribe();
    this.volumeSub?.unsubscribe();
    this.viewElementSub?.unsubscribe();
    this.localeSub?.unsubscribe();
    this.defSub?.unsubscribe();
    this.defVolSub?.unsubscribe();
    this.showAltSub?.unsubscribe();
  }

  closeDrawer() {
    if (this.drawer._mode === 'over') {
      this.drawer.close();
    }
  }

  numWidth(num) {
    let w = num.length * 7;
    return w;
  }

  navigate(element) {
    this.router.navigate([
      this.cM.locale,
      this.cM.selVol._eid.str,
      element._eid.str,
    ]);
    this.cM.navigate(this.cM.selElm, 'view');
  }

  // expandTree() {
  //   if (this.pS.pref) {
  //     const keypath = 'contentTree.' + this.cM.selVol._eid.str;
  //     const expanded = Dexie.getByKeyPath(this.pS.pref, keypath);
  //     for (const key in expanded) {
  //       if (Object.prototype.hasOwnProperty.call(expanded, key)) {
  //         let node = this.treeControl.dataNodes.find((elem) => elem.id === key);
  //         if (expanded[key] && node && this.treeControl.isExpandable(node)) {
  //           this.treeControl.expand(node);
  //         }
  //       }
  //     }
  //     this.checkExpansion();
  //   }
  // }
  checkExpansion() {
    let countOpen = 0,
      countExpandable = 0;
    for (const it of this.treeControl.dataNodes) {
      if (it.expandable) {
        countExpandable++;
        if (this.treeControl.isExpanded(it)) {
          countOpen++;
        }
      }
    }
    if (countOpen === 0) {
      this.expansion = 'none';
    } else if (countOpen === countExpandable) {
      this.expansion = 'all';
    } else {
      this.expansion = 'some';
    }
  }
  expandAll() {
    let state = false;
    if (this.expansion === 'none') {
      this.treeControl.expandAll();
      state = true;
    } else if (this.expansion === 'some') {
      this.treeControl.collapseAll();
      state = false;
    } else if (this.expansion === 'all') {
      this.scrollElm.scrollTop = 0;
      this.treeControl.collapseAll();
      state = false;
    }

    this.checkExpansion();
  }
  handleExpansion(node) {
    const state = this.treeControl.isExpanded(node);
    if (state) {
      this.router.navigate([node.path]);
    } else {
      const desc = this.treeControl.getDescendants(node);
      for (const nd of desc) {
        if (nd && nd.expandable && this.treeControl.isExpanded(nd)) {
          this.treeControl.collapse(nd);
        }
      }
    }
    this.checkExpansion();
  }
  expander(node) {
    this.treeControl.expand(node);
    this.checkExpansion();
  }
  linkClick(event, node) {
    if (node.expandable) {
      this.expander(node);
    }
  }
}
