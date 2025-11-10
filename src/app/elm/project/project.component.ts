import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  Component,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import Dexie from 'dexie';
import { Subscription } from 'rxjs';
import { CalcService } from 'src/app/calc/calc.service';
// import { CalcService } from '../../services/calc.service';
import { ElmNode } from 'src/app/engine/entity';
// import { TargetLocator } from "selenium-webdriver";
import { Project } from 'src/app/engine/entity';
import { ProfileService } from 'src/app/services/profile.service';
import { CalculationService } from '../../services/calculation.service';
import { DataService } from '../../services/data.service';
var deepClone = Dexie.deepClone;

function snapShot(c) {
  return c.map((it) => {
    return { id: it.elm._eid.str, state: deepClone(it.set.state) };
  });
}

@Component({
  selector: 'kd-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProjectComponent implements OnInit, AfterViewInit, OnDestroy {
  numeration: string;
  index: number;
  edit: boolean;
  design: string;
  active: number;
  kind: string;
  dirty: boolean;
  defaultDirty: boolean;
  projectDirty: boolean;
  warnDesign: boolean;
  stateSubject: Subscription;
  doSubject: Subscription;
  viewElementSubject: Subscription;
  projSub: Subscription;

  projects: any;

  activeProject: any;

  undoIndex = 0;
  undos: any = [];

  undoLast: any = {
    element_id: '',
    status: {
      value: 1,
      values: [],
    },
  };

  @Input() node: ElmNode;
  @Input() elm: any;
  @Input() parent: any;
  @Input() target: string;

  @ViewChild('canvas') canvasEl;
  canvas: any;
  delay: any;

  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document,
    public pS: ProfileService,
    public dS: DataService,
    public cSOld: CalculationService,
    public cS: CalcService,
  ) {}

  ngOnInit() {
    this.elm = this.node.elm;

    this.undos = this.elm.undos || [];

    this.projSub = this.pS.projSub.subscribe((pr) => {
      if (pr) {
        const defInp = this.getInp();
        if (!this.elm.project) {
          this.elm.project = this.pS.projectsUser.find(
            (pr) => pr._eid?.str === this.elm._eid.str,
          );
          if (this.elm.project) {
            if (!this.elm.project.version) {
              if (this.elm.project.current?.length) {
                for (const it of this.elm.project.current) {
                  if (it.state.input) {
                    this.elm.project.input[it.id] = {
                      val: it.state.val,
                      checked: it.state.checked,
                    };
                  }
                }
              }
              for (const proj of this.elm.project.data) {
                proj.input = proj.input || {};
                for (const it of proj.state || []) {
                  if (it.state.input) {
                    proj.input[it.id] = {
                      val: it.state.val,
                      checked: it.state.checked,
                    };
                  }
                }
              }
              this.elm.project.version = this.elm.calc.version;
            }
            this.pS.projTable.put(this.elm.project.def);

            if (this.elm.project.version !== this.elm.calc.version) {
            }
          }
        }
        if (this.elm.attrib.examples?.length) {
          for (const ex of this.elm.attrib.examples) {
            ex.kind = 'example';
            if (!ex.input) {
              ex.input = {};
              for (const state of ex.state) {
                if (state.state?.input) {
                  ex.input[state.id] = {
                    val: state.state.val,
                    checked: state.state.checked,
                  };
                }
              }

              ex.version = this.elm.calc.version;
            }
          }
        }

        if (!this.elm.project) {
          this.elm.project = new Project(
            {
              _eid: this.elm._eid.str,
              user_id: this.pS.profile._id.str,
              version: this.elm.calc.version,
            },
            this.pS.projTable,
          );
          if (this.pS.isBrowser) {
            // this.dS.table.project.put(this.elm.project.def);
          }
        }

        this.projects = this.elm.project.data;

        let inp;

        if (!this.elm.project.activeIsExample) {
          inp =
            this.projects[this.elm.project.active]?.input ||
            this.elm.project.input;
        } else {
          inp =
            this.elm.attrib.examples[this.elm.project.active]?.input ||
            this.elm.project.input;
        }

        this.activeProject = this.elm.project.activeIsExample
          ? this.elm.attrib.examples[this.elm.project.active]
          : this.projects[this.elm.project.active];

        if (!this.activeProject && this.elm.attrib.examples?.length) {
          this.activeProject = this.elm.attrib.examples[0];
          inp = this.activeProject.input;
        }

        this.setInp(inp);

        if (!this.activeProject) {
          if (!this.compareInp(this.getInp(), defInp)) {
            this.projectDirty = true;
          }
        }

        if (!this.compareInp(this.getInp(), defInp)) {
          this.defaultDirty = true;
          this.dirty = true;
        }
      }
    });
  }

  async ngAfterViewInit() {
    if (!this.elm.job) {
      let offscreen;
      if (this.canvasEl) {
        offscreen = this.canvasEl.nativeElement.transferControlToOffscreen();
      }
      if (this.dS.isBrowser) {
        if (this.elm.attrib.asc) {
          this.elm.job = await this.cS.getJob(this.elm);
        } else {
          this.elm.job = this.cSOld.getJob(this.elm, null, null, offscreen);
        }
      }
    }

    if (this.dS.isBrowser) {
      this.stateSubject = this.elm.job.stateSubject.subscribe((state) => {
        if (state) {
          for (const it of this.elm.children) {
            const child = it.elm;
            const set = it.set;
            if (state[set.name]) {
              for (const key in state[set.name]) {
                if (state[set.name].hasOwnProperty(key)) {
                  // console.log(key)
                  if (key === 'pressed') {
                    state[set.name][key] = false;
                  }
                  it.set.state[key] = state[set.name][key];
                }
              }
            }
          }
        }
      });

      this.doSubject = this.elm.job.doSubject.subscribe((stateElm) => {
        if (stateElm) {
          this.dirty = true;
          this.elm.job.project = stateElm.project;
          if (stateElm === 'reset') {
            if (!this.elm.attrib.asc) {
              this.cSOld.doJob(this.elm.job);
            } else {
              this.cS.inputJob(this.elm.job);
            }
            if (
              this.activeProject?.kind === 'example' &&
              !this.compareInp(this.activeProject?.input, this.getInp())
            ) {
              this.activeProject = null;
            }
            this.elm.project.update({ input: this.getInp() });
            this.defaultDirty = false;
            this.dirty = false;
          } else if (stateElm === 'undoredo') {
            if (!this.elm.attrib.asc) {
              this.cSOld.doJob(this.elm.job);
            } else {
              this.cS.inputJob(this.elm.job);
            }
            if (
              this.activeProject?.kind === 'example' &&
              !this.compareInp(this.activeProject?.input, this.getInp())
            ) {
              this.activeProject = null;
            }
          } else {
            this.projectDirty = true;
            if (
              this.activeProject?.kind === 'example' &&
              !this.pS.profile.role.editor
            ) {
              this.activeProject = null;
            }
            this.defaultDirty = true;
            if (!this.elm.attrib.asc) {
              this.cSOld.doJob(this.elm.job, stateElm);
            } else {
              this.cS.inputJob(this.elm.job);
            }
            if (stateElm.undo) {
              this.undoIndex = this.undos.length;
              this.undos[this.undoIndex] = this.getInp();
              this.elm.project.update({ input: this.undos[this.undoIndex] });
            }
          }
          if (this.delay) clearTimeout(this.delay);
          this.delay = setTimeout(() => {
            const def = this.pS.projTable
              .get({
                _eid: this.elm._eid.str,
                user_id: this.pS.profile._id.str,
              })
              .then((pr) => {
                if (!pr && this.dS.hasIdb) {
                  this.pS.projTable.put(this.elm.project.def);
                  this.pS.projects.pushUnique(this.elm.project);
                  this.pS.projectsUser.pushUnique(this.elm.project);
                }
              });
          }, 1000);
        } else {
          if (!this.elm.attrib.asc) {
            this.delay = setTimeout(() => {
              this.cSOld.doJob(this.elm.job);
            }, 200);
            // this.cSOld.doJob(this.elm.job);
          } else {
            // this.cS.doJob(this.elm.job);
          }
        }
      });

      this.undos[0] = this.getInp();

      // if (!this.elm.attrib.asc) {
      //   this.cSOld.doJob(this.elm.job);
      // } else {
      //   this.cS.doJob(this.elm.job);
      // }
    }
  }

  ngOnDestroy(): void {
    if (this.stateSubject) this.stateSubject.unsubscribe();
    if (this.doSubject) this.doSubject.unsubscribe();
    if (this.viewElementSubject) this.viewElementSubject.unsubscribe();
    if (this.projSub) this.projSub.unsubscribe();
  }

  getInp() {
    const res = {};
    for (const it of this.elm.children) {
      if (it.set.state.input) {
        res[it.id] = {};
        res[it.id].val = it.set.state.val;
        res[it.id].error = it.set.state.error;
        res[it.id].checked = it.set.state.checked;
      }
    }
    return res;
  }

  setInp(inp) {
    for (const key in inp) {
      if (Object.prototype.hasOwnProperty.call(inp, key)) {
        const i = inp[key];
        const child = this.elm.children.find((ch) => ch.id === key);
        if (child?.set) {
          child.set.state.val = i.val;
          child.set.state.checked = i.checked;
        }
      }
    }
  }

  compareInp(inp1, inp2) {
    let res = true;
    for (const key in inp1) {
      if (Object.prototype.hasOwnProperty.call(inp1, key)) {
        if (inp1[key].val !== inp2[key].val) {
          res = false;
        }
      }
      if (Object.prototype.hasOwnProperty.call(inp2, key)) {
        if (inp1[key].val !== inp2[key].val) {
          res = false;
        }
      }
    }
    return res;
  }

  setStateFromProj(state, proj) {
    if (state.input || state.play) {
      state.val = proj.val; // || state.val;
      state.checked = proj.checked || state.checked;
    }
  }
  isInputDirty() {
    let res = false;

    const inp = this.getInp();

    for (const key in inp) {
      if (Object.prototype.hasOwnProperty.call(inp, key)) {
        const state = inp[key];
        let setDef = this.elm.children.find((ch) => ch.id === key).setDef;
        if (state.val !== setDef.state.val) {
          res = true;
        }
      }
    }

    return res;
  }
  isProjDirty() {
    let res = false;
    if (this.activeProject) {
      for (const key in this.activeProject.input) {
        if (
          Object.prototype.hasOwnProperty.call(this.activeProject.input, key)
        ) {
          if (
            this.activeProject?.input[key]?.val !==
            this.elm.project?.input[key]?.val
          ) {
            res = true;
          }
          if (
            this.activeProject?.input[key]?.checked !==
            this.elm.project?.input[key]?.checked
          ) {
            res = true;
          }
        }
      }
    }
    return res;
  }
  projClick() {
    if (!this.elm.project.data.length && !this.elm.attrib.examples?.length) {
      // this.add();
    }
  }
  reset() {
    let elm;
    for (const child of this.elm.children) {
      elm = child.elm;
      if (child.set.state.input || child.set.state.input === 0) {
        if (child.setDef.state.val || child.setDef.state.val === 0) {
          child.set.state.val = child.setDef.state.val;
        } else {
          child.set.state.val = child.elm.state.val || 0;
        }
      }
    }

    if (this.elm.job) {
      this.elm.job.doSubject.next('reset');
    }
    this.projectDirty = this.isProjDirty();
    this.dirty = false;
  }
  undo() {
    this.undoIndex--;
    this.setInp(this.undos[this.undoIndex]);
    // for (const it of this.undos[this.undoIndex]) {
    //   let set = this.elm.children.find(
    //     (child) => child.elm._eid.str === it.id,
    //   ).set;

    //   this.setStateFromProj(set.state, it.state);
    // }
    if (this.elm.job) {
      this.elm.job.doSubject.next('undoredo');
    }
    this.elm.project.update({ current: this.undos[this.undoIndex] });
    this.projectDirty = true;
    this.defaultDirty = true;
  }
  redo() {
    this.undoIndex++;
    this.setInp(this.undos[this.undoIndex]);
    // for (const it of this.undos[this.undoIndex]) {
    //   let set = this.elm.children.find(
    //     (child) => child.elm._eid.str === it.id,
    //   ).set;
    //   this.setStateFromProj(set.state, it.state);
    // }
    if (this.elm.job) {
      this.elm.job.doSubject.next('undoredo');
    }
    this.elm.project.update({ current: this.undos[this.undoIndex] });
    this.projectDirty = true;
    this.defaultDirty = true;
  }

  async add() {
    let design = this.dS.system.txts.NEW_PROJECT;
    let test = design;
    let suffix = 1;
    let exists = true;
    while (exists) {
      let found = this.projects.find((it) => it.design === test);
      if (found) {
        suffix = ++suffix;
        test = design + '-' + suffix;
        exists = true;
      } else {
        exists = false;
        design = test;
      }
    }
    let entry = { design: design, input: this.getInp() };
    this.elm.project.data.push(entry);
    this.change(entry);
    this.projects.sort(function (x, y) {
      let a, b;
      a = x.design.toLowerCase();
      b = y.design.toLowerCase();
      if (a > b) return 1;
      if (a < b) return -1;
    });
    const def = await this.pS.projTable.get({
      _eid: this.elm._eid.str,
      user_id: this.pS.profile._id.str,
    });
    if (!def) {
      await this.pS.projTable.put(this.elm.project.def);

      this.pS.projects.push(this.elm.project);
    }
    this.elm.project.update({ data: this.projects });
    this.projectDirty = false;
  }
  remove() {
    let arr, kind;
    if (this.activeProject.kind === 'example') {
      arr = this.elm.attrib.examples;
      kind = 'example';
    } else {
      arr = this.elm.project.data;
    }

    let index = arr.findIndex((it) => it === this.activeProject);

    arr.splice(index, 1);

    if (index > arr.length - 1) {
      index = arr.length - 1;
    }

    if (!arr.length) {
      if (this.activeProject === 'example' && this.elm.project.data.length) {
        this.change(this.elm.project.data[this.elm.project.data.length - 1]);
      }
      if (
        this.activeProject !== 'example' &&
        this.elm.attrib.examples &&
        this.elm.attrib.examples.length
      ) {
        this.change(this.elm.attrib.examples[0]);
      }
      if (this.activeProject === 'example' && !this.elm.project.data.length) {
        this.activeProject = null;
        this.reset();
      }
      if (
        this.activeProject !== 'example' &&
        this.elm.attrib.examples &&
        !this.elm.attrib.examples.length
      ) {
        this.activeProject = null;
        this.reset();
      }
    } else {
      this.change(arr[index] || arr[0]);
    }
    if (kind === 'example') {
      this.elm.dirty = true;
      this.dS.save(this.elm);
    } else {
      this.elm.project.update({ data: this.projects });
    }
  }

  saveChange() {
    if (
      !this.activeProject ||
      (this.activeProject.kind === 'example' && !this.pS.profile.role.editor)
    ) {
      this.add();
    }

    if (this.activeProject.kind === 'example' && this.pS.profile.role.editor) {
      this.activeProject.input = this.getInp();
      delete this.activeProject.state;
      this.dS.scanForTrouble(this.elm);
      this.elm.dirty = true;
      this.dS.save(this.elm);
    }

    if (this.activeProject.kind !== 'example') {
      this.activeProject.input = this.getInp();
      this.elm.project.update({ data: this.projects });
    }

    this.elm.project.input = this.getInp();
    this.elm.project.update({ input: this.elm.project.input });

    this.projectDirty = false;
  }
  change(it) {
    this.activeProject = it;
    this.setInp(this.activeProject.input);
    // for (const it of this.activeProject.state) {
    //   let set = this.elm.children.find((ch) => ch.id === it.id).set;
    //   this.setStateFromProj(set.state, it.state);
    // }

    this.elm.project.input = this.getInp();

    this.elm.project.update({ input: this.elm.project.input });

    if (!this.elm.attrib.asc) {
      this.cSOld.doJob(this.elm.job);
    } else {
      this.cS.doJob(this.elm.job);
    }

    if (this.activeProject.kind !== 'example') {
      this.elm.project.activeIsExample = false;
      this.elm.project.active = this.projects.findIndex(
        (it) => it === this.activeProject,
      );
    } else {
      this.elm.project.activeIsExample = true;
      this.elm.project.active = this.elm.attrib.examples.findIndex(
        (it) => it === this.activeProject,
      );
    }

    this.undoIndex = this.undos.length;
    this.undos[this.undoIndex] = this.elm.project.input;
    this.elm.project.update({ active: this.elm.project.active });
    this.elm.project.update({
      activeIsExample: this.elm.project.activeIsExample,
    });

    this.projectDirty = false;
    if (this.delay) clearTimeout(this.delay);
    this.delay = setTimeout(() => {
      const def = this.pS.projTable
        .get({
          _eid: this.elm._eid.str,
          user_id: this.pS.profile._id.str,
        })
        .then((pr) => {
          if (!pr && this.dS.hasIdb) {
            this.pS.projTable.put(this.elm.project.def);
            this.pS.projects.pushUnique(this.elm.project);
            this.pS.projectsUser.pushUnique(this.elm.project);
          }
        });
    }, 1000);
  }

  clickSelection(proj) {
    this.change(proj);
    // console.log(proj.design, this.activeProject.design)
  }

  openSelection(e) {
    // console.log(e)
  }

  validateDesign(e) {
    this.warnDesign = false;
    for (const it of this.projects) {
      if (it.design === e && it !== this.activeProject) {
        this.warnDesign = true;
      }
    }
  }
  editDesign() {
    this.edit = true;
    this.design = this.activeProject.design;
  }
  changeDesign(e) {
    if (!this.warnDesign) {
      this.edit = false;
      this.activeProject.design = this.design;

      this.projects.sort(function (x, y) {
        let a, b;
        a = x.design.toLowerCase();
        b = y.design.toLowerCase();
        if (a > b) return 1;
        if (a < b) return -1;
      });

      if (this.activeProject.kind === 'example') {
        this.elm.dirty = true;
        this.dS.save(this.elm);
      } else {
        this.elm.project.update({ data: this.projects });
      }
    }
  }
  exampleStatus() {
    if (!this.elm.attrib.examples) this.elm.attrib.examples = [];
    this.elm.attrib.examples.push(deepClone(this.activeProject));
    this.change(this.elm.attrib.examples[this.elm.attrib.examples.length - 1]);
    this.elm.dirty = true;
    this.dS.save(this.elm);
  }
}
