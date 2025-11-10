import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Injectable,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
} from '@angular/material/tree';
import { Router } from '@angular/router';
import Dexie from 'dexie';
import { BehaviorSubject, timer } from 'rxjs';
import { ElmNode } from 'src/app/engine/entity';
import { DataService } from 'src/app/services/data.service';
import { ElmFlatNode } from '../../core/interfaces';
import { Elm } from '../../engine/entity';
var deepClone = Dexie.deepClone;

// export class ContentsNode {
//   children: ContentsNode[];
//   item: string;
//   numeration: string;
//   element: any;
// }

// export class ElmFlatNode {
//   item: string;
//   numeration: string;
//   element: any;
//   level: number;
//   expandable: boolean;
// }

/**
 * The Json object for to-do list data.
 */
const TREE_DATA = {
  Groceries: {
    'Almond Meal flour': null,
    'Organic eggs': null,
    'Protein Powder': null,
    Fruits: {
      Apple: null,
      Berries: ['Blueberry', 'Raspberry'],
      Orange: null,
    },
  },
  Reminders: [
    'Cook dinner',
    'Read the Material Design spec',
    'Upgrade Application to Angular',
  ],
};

/**
 * Checklist database, it can build a tree structured Json object.
 * Each node in Json object represents a to-do item or a category.
 * If a node is a category, it has children items and new items can be added under the category.
 */
@Injectable()
export class ChecklistDatabase {
  dataChange = new BehaviorSubject<ElmNode[]>([]);

  get data(): ElmNode[] {
    return this.dataChange.value;
  }

  constructor() {
    this.initialize();
  }

  initialize() {
    // Build the tree nodes from Json object. The result is a list of `ElmNode` with nested
    //     file node as children.
    const data = this.buildFileTree(TREE_DATA, 0);

    // Notify the change.
    this.dataChange.next(data);
  }

  /**
   * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
   * The return value is the list of `ElmNode`.
   */
  buildFileTree(obj: object, level: number): ElmNode[] {
    return Object.keys(obj).reduce<ElmNode[]>((accumulator, key) => {
      const value = obj[key];
      const node = new ElmNode();
      //node.item = key;

      if (value != null) {
        if (typeof value === 'object') {
          node.children = this.buildFileTree(value, level + 1);
        } else {
          //node.item = value;
        }
      }

      return accumulator.concat(node);
    }, []);
  }

  /** Add an item to to-do list */
  insertItem(parent: ElmNode, item: ElmNode): ElmNode {
    if (!parent.children) {
      parent.children = [];
    }
    const newItem: ElmNode = Object.assign({}, item) as ElmNode;
    if (newItem.children) {
      delete newItem.children;
    }
    // newItem.protect = true;

    parent.children.push(newItem);
    // let delay = timer(100).subscribe((t) => {
    //   parent.children.push(newItem);
    //   this.dataChange.next(this.data);
    // });

    this.dataChange.next(this.data);
    return newItem;
  }

  insertItemAbove(node: ElmNode, item: ElmNode): ElmNode {
    const parentNode = this.getParentFromNodes(node);
    const newItem = Object.assign({}, item) as ElmNode;
    if (newItem.children) {
      delete newItem.children;
    }
    if (parentNode != null) {
      parentNode.children.splice(parentNode.children.indexOf(node), 0, newItem);
    } else {
      this.data.splice(this.data.indexOf(node), 0, newItem);
    }
    this.dataChange.next(this.data);
    return newItem;
  }

  insertItemBelow(node: ElmNode, item: ElmNode): ElmNode {
    const parentNode = this.getParentFromNodes(node);
    const newItem = Object.assign({}, item) as ElmNode;
    if (newItem.children) {
      delete newItem.children;
    }
    if (parentNode != null) {
      parentNode.children.splice(
        parentNode.children.indexOf(node) + 1,
        0,
        newItem,
      );
    } else {
      this.data.splice(this.data.indexOf(node) + 1, 0, newItem);
    }
    this.dataChange.next(this.data);
    return newItem;
  }

  getParentFromNodes(node: ElmNode): ElmNode {
    for (let i = 0; i < this.data.length; ++i) {
      const currentRoot = this.data[i];
      const parent = this.getParent(currentRoot, node);
      if (parent != null) {
        return parent;
      }
    }
    return null;
  }

  getParent(currentRoot: ElmNode, node: ElmNode): ElmNode {
    if (currentRoot.children && currentRoot.children.length > 0) {
      for (let i = 0; i < currentRoot.children.length; ++i) {
        const child = currentRoot.children[i];
        if (child === node) {
          return currentRoot;
        } else if (child.children && child.children.length > 0) {
          const parent = this.getParent(child, node);
          if (parent != null) {
            return parent;
          }
        }
      }
    }
    return null;
  }

  updateItem(node: ElmNode, element: Elm) {
    node.elm = element;
    this.dataChange.next(this.data);
  }

  deleteItem(node: ElmNode) {
    this.deleteNode(this.data, node);
    this.dataChange.next(this.data);
  }

  copyPasteItem(from: ElmNode, to: ElmNode): ElmNode {
    const newItem = this.insertItem(to, from);
    if (from.children) {
      from.children.forEach((child) => {
        this.copyPasteItem(child, newItem);
      });
    }
    return newItem;
  }

  copyPasteItemAbove(from: ElmNode, to: ElmNode): ElmNode {
    const newItem = this.insertItemAbove(to, from);
    if (from.children) {
      from.children.forEach((child) => {
        this.copyPasteItem(child, newItem);
      });
    }
    return newItem;
  }

  copyPasteItemBelow(from: ElmNode, to: ElmNode): ElmNode {
    const newItem = this.insertItemBelow(to, from);
    if (from.children) {
      from.children.forEach((child) => {
        this.copyPasteItem(child, newItem);
      });
    }
    return newItem;
  }

  deleteNode(nodes: ElmNode[], nodeToDelete: ElmNode) {
    const index = nodes.indexOf(nodeToDelete, 0);
    if (index > -1) {
      nodes.splice(index, 1);
    } else {
      nodes.forEach((node) => {
        if (node.children && node.children.length > 0) {
          this.deleteNode(node.children, nodeToDelete);
        }
      });
    }
  }
}

@Component({
  selector: 'kd-tree-edit',
  templateUrl: './tree-edit.component.html',
  styleUrls: ['./tree-edit.component.css'],
  providers: [ChecklistDatabase],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeEditComponent
  implements OnInit, OnChanges, AfterViewInit, OnDestroy
{
  @ViewChild('tree') tree;
  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap = new Map<ElmFlatNode, ElmNode>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<ElmNode, ElmFlatNode>();

  /** A selected parent node to be inserted */
  selectedParent: ElmFlatNode | null = null;

  /** The new item's name */
  newItemName = '';

  treeControl: FlatTreeControl<ElmFlatNode>;

  treeFlattener: MatTreeFlattener<ElmNode, ElmFlatNode>;

  dataSource: MatTreeFlatDataSource<ElmNode, ElmFlatNode>;

  opusDirty: boolean;

  /** The selection for checklist */
  checklistSelection = new SelectionModel<ElmFlatNode>(true /* multiple */);

  editNode: any;
  /* Drag and drop */
  dragNode: any;
  dragNodeExpandOverWaitTimeMs = 300;
  dragNodeExpandOverNode: any;
  dragNodeExpandOverTime: number;
  dragNodeExpandOverArea: number;
  @ViewChild('emptyItem') emptyItem: ElementRef;
  volumeSubject: any;
  localeSubject: any;

  @Input() elm: Elm;

  constructor(
    public http: HttpClient,
    private router: Router,
    private cd: ChangeDetectorRef,
    public dS: DataService,
    private database: ChecklistDatabase,
  ) {
    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      this.getLevel,
      this.isExpandable,
      this.getChildren,
    );
    this.treeControl = new FlatTreeControl<ElmFlatNode>(
      this.getLevel,
      this.isExpandable,
    );
    this.dataSource = new MatTreeFlatDataSource(
      this.treeControl,
      this.treeFlattener,
    );

    database.dataChange.subscribe((data) => {
      this.dataSource.data = [];
      this.dataSource.data = data;
    });
  }

  ngOnInit(): void {
    //this.elm = this.dS.selVol;
    this.database.dataChange.next(this.elm.tree || []);
  }
  ngOnChanges() {
    this.database.dataChange.next(this.elm.tree || []);
  }
  ngAfterViewInit(): void {
    this.localeSubject = this.dS.subject.locale.subscribe((locale) => {
      if (locale) {
        this.cd.detectChanges();
      }
    });
  }
  ngOnDestroy() {
    this.localeSubject.unsubscribe();
  }

  //getLevel = (node: ElmFlatNode) => node.level;

  getLevel(node: ElmFlatNode) {
    return node.level;
  }

  isExpandable = (node: ElmFlatNode) => node.expandable;

  getChildren = (node: ElmNode): ElmNode[] => node.children;

  hasChild = (_: number, _nodeData: ElmFlatNode) => _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: ElmFlatNode) => _nodeData.elm === null;

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  transformer = (node: ElmNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode =
      existingNode && existingNode.elm === node.elm
        ? existingNode
        : new ElmFlatNode();
    flatNode.id = node.id;
    flatNode.num = node.num;
    flatNode.elm = node.elm;
    flatNode.slugs = node.slugs;
    flatNode.level = level;
    flatNode.expandable = node.children && node.children.length > 0;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  };

  /** Whether all the descendants of the node are selected */
  descendantsAllSelected(node: ElmFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    return descendants.every((child) =>
      this.checklistSelection.isSelected(child),
    );
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: ElmFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some((child) =>
      this.checklistSelection.isSelected(child),
    );
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  todoItemSelectionToggle(node: ElmFlatNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);
  }

  /** Select the category so we can insert the new item. */
  addNewItem(node: ElmFlatNode) {
    const parentNode = this.flatNodeMap.get(node);
    this.database.insertItem(parentNode, null);
    this.treeControl.expand(node);
  }

  /** Save the node to database */
  saveNode(node: ElmFlatNode, itemValue: Elm) {
    const nestedNode = this.flatNodeMap.get(node);
    this.database.updateItem(nestedNode, itemValue);
  }

  handleDragStart(event, node) {
    // Required by Firefox (https://stackoverflow.com/questions/19055264/why-doesnt-html5-drag-and-drop-work-in-firefox)
    event.dataTransfer.setData('foo', 'bar');
    //event.dataTransfer.setDragImage(this.emptyItem.nativeElement, 0, 0);
    this.dragNode = node;
    this.treeControl.collapse(node);
  }

  handleDragOver(event, node) {
    event.preventDefault();
    // Handle node expand
    if (this.dragNodeExpandOverNode && node === this.dragNodeExpandOverNode) {
      if (
        Date.now() - this.dragNodeExpandOverTime >
        this.dragNodeExpandOverWaitTimeMs
      ) {
        if (!this.treeControl.isExpanded(node)) {
          this.treeControl.expand(node);
          //this.cd.detectChanges();
        }
      }
    } else {
      this.dragNodeExpandOverNode = node;
      this.dragNodeExpandOverTime = new Date().getTime();
    }

    // Handle drag area
    const percentageY = event.offsetY / event.target.clientHeight;
    if (0 <= percentageY && percentageY <= 0.25) {
      this.dragNodeExpandOverArea = 1;
    } else if (1 >= percentageY && percentageY >= 0.75) {
      this.dragNodeExpandOverArea = -1;
    } else {
      this.dragNodeExpandOverArea = 0;
    }
  }

  handleDrop(event, node) {
    if (node !== this.dragNode) {
      let newItem: ElmNode;
      if (this.dragNodeExpandOverArea === 1) {
        newItem = this.database.copyPasteItemAbove(
          this.flatNodeMap.get(this.dragNode),
          this.flatNodeMap.get(node),
        );
      } else if (this.dragNodeExpandOverArea === -1) {
        newItem = this.database.copyPasteItemBelow(
          this.flatNodeMap.get(this.dragNode),
          this.flatNodeMap.get(node),
        );
      } else {
        newItem = this.database.copyPasteItem(
          this.flatNodeMap.get(this.dragNode),
          this.flatNodeMap.get(node),
        );
      }
      this.database.deleteItem(this.flatNodeMap.get(this.dragNode));
      this.treeControl.expandDescendants(this.nestedNodeMap.get(newItem));
    }
    this.handleDragEnd(event, this.dragNode);
  }

  handleDragEnd(event, node) {
    this.dragNode = null;
    this.dragNodeExpandOverNode = null;
    this.dragNodeExpandOverTime = 0;
    this.dragNodeExpandOverArea = NaN;
    event.preventDefault();
    let delay = timer(500).subscribe((t) => {
      this.numeration();
      this.database.dataChange.next(this.dataSource.data);
      this.cd.detectChanges();
      this.elm.defSubject.next(this.elm.def);
      this.elm.dirty = true;
      this.opusDirty = true;
    });
  }

  getStyle(node: ElmFlatNode) {
    if (this.dragNode === node) {
      return 'drag-start';
    } else if (this.dragNodeExpandOverNode === node) {
      switch (this.dragNodeExpandOverArea) {
        case 1:
          return 'drop-above';
        case -1:
          return 'drop-below';
        default:
          return 'drop-center';
      }
    }
  }

  deleteItem(node: ElmFlatNode) {
    this.database.deleteItem(this.flatNodeMap.get(node));
    this.elm.dirty = true;
  }

  numeration() {
    let tree = this.dataSource.data;
    for (let i = 0; i < tree.length; i++) {
      const obj = tree[i];
      obj.num = i.toString();
      obj.elm.num = obj.num;
      allDescendants(obj);
      function allDescendants(node) {
        let cs = node.children;
        if (cs && cs.length) {
          for (let ii = 0; ii < cs.length; ii++) {
            let c = cs[ii];
            c.num = node.num + '.' + (ii + 1).toString();
            c.elm.num = c.num;
            allDescendants(c);
          }
        }
      }
    }

    this.cd.detectChanges();
  }
  async addToTree() {
    if (this.dS.checked.length) {
      for (const it of this.dS.checked) {
        if (!it.parent) {
          it.parent = this.elm;
        }
        if (!this.elm.tree) {
          this.elm.tree = [];
        }
        // if (iterator.key) {
        //   iterator.sets.push({
        //     state: { input: false },
        //     def: { state: { input: false } },
        //     parent: this.elm,
        //     pIndex: this.elm.children.length
        //   });
        // }

        const nd = new ElmNode();
        nd.id = it._eid.str;
        nd.elm = it;
        nd.slugs = {};

        for (const lang of this.dS.locales) {
          nd.slugs[lang] = this.dS.slugSuggest(nd.elm, this.elm, lang);
          this.dS.slug[lang][nd.slugs[lang]] = nd.elm;
        }

        this.elm.tree.push(nd);
      }
      this.dS.clearSelection();
    } else {
      let elm = this.dS.addElement('ipsum');
      if (!this.elm.tree) {
        this.elm.tree = [];
      }
      elm.parent = this.elm;
      const nd = new ElmNode();
      nd.id = elm._eid.str;
      nd.elm = elm;
      this.elm.tree.push(nd);
      // this.dS.save(elm);
    }

    let delay = timer(500).subscribe((t) => {
      this.numeration();
      this.database.dataChange.next(this.dataSource.data);
      this.cd.detectChanges();
      this.elm.defSubject.next(this.elm.def);
    });

    this.opusDirty = true;
  }
  viewElement(event, node) {
    this.editNode = node;
    if (!node.attrib) {
      node.attrib = {};
    }
    this.dS.nav(node);
  }
  async reloadOpus() {
    const vol = await this.dS.rS.save(this.elm, 'tree', this.elm.tree);
    // let body = {
    //   _eid: this.elm._eid,
    //   cmd: 'sitemap',
    //   data: { id: this.elm._eid, origin: this.dS.origin },
    // };

    // const data$: any = this.http.post<any>(`/api/elements/sitemap`, body).pipe(
    //   catchError((e) => {
    //     this.dS.errorMessage = <any>e;
    //     return this.dS.httpError(e);
    //   }),
    // );
    // const res: any = await lastValueFrom(data$);
    // console.log(res);
    this.opusDirty = false;
  }
}
