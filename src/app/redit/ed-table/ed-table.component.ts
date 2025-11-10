import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit } from '@angular/core';
import { Elm } from 'src/app/engine/entity';
import { DataService } from 'src/app/services/data.service';
import { ReditService } from '../redit.service';

@Component({
  selector: 'kd-ed-table',
  templateUrl: './ed-table.component.html',
  styleUrls: ['./ed-table.component.scss'],
})
export class EdTableComponent implements OnInit {
  @Input() elm: Elm;

  constructor(public dS: DataService, public rS: ReditService) {}

  ngOnInit(): void {}

  dropCols(event: CdkDragDrop<string[]>) {
    if (event.isPointerOverContainer) {
      moveItemInArray(
        this.elm.table.cols,
        event.previousIndex,
        event.currentIndex,
      );
    } else {
      this.elm.table.cols.splice(event.previousIndex, 1);
    }

    this.rS.save(this.elm, 'table.cols');
  }

  changeText(e, col) {
    for (const it of this.elm.table.data) {
      if (e) {
        it[col.field] = it[col.field]?.toString() || '';
      } else {
        it[col.field] = parseFloat(it[col.field]) || null;
      }
    }
    col.text = e;

    this.rS.save(this.elm, 'table');
  }

  changeIsArray(e, col) {
    for (const it of this.elm.table.data) {
      if (e) {
        if (!Array.isArray(it[col.field])) {
          if (it[col.field].split) {
            it[col.field] = it[col.field].split(', ');
          } else {
            it[col.field] = [it[col.field]];
          }
        }
      } else {
        if (Array.isArray(it[col.field])) {
          let newItem = '' + it[col.field][0];
          for (let i = 1; i < it[col.field].length; i++) {
            const item = it[col.field][i];
            newItem += ', ' + item;
          }
          it[col.field] = newItem;
        }
      }
    }
    col.array = e;
    this.rS.save(this.elm, 'table');
  }

  changeColFormat(e, col) {
    let numberFormatRegex = /^(\d+)?\.((\d+)(-(\d+))?)?$/;

    let valid = true;
    var parts = e.match(numberFormatRegex);
    if (parts === null) {
      valid = false;
    } else {
      if (parts[3] && parts[5] && parts[3] > parts[5]) {
        valid = false;
      }
    }
    if (valid || e === '') {
      col.format = e;
      this.rS.save(this.elm, 'table.cols');
    }
  }

  onTableImportSelected(event) {
    const input = event.target;
    let reader = new FileReader();
    reader.onload = () => {
      const text = reader.result;
      const lines = String(text).split('\n');
      console.log(lines);

      this.rS.save(this.elm, 'table');
    };
    reader.readAsText(input.files[0]);
  }

  addCol() {
    let col = {
      field: this.createColId(this.elm.table.cols),
    };
    this.elm.table.cols.push(col);
    this.rS.save(this.elm, 'table.cols');
  }

  createColId(cols) {
    let id = this.createRandomString(6);
    if (cols.find((x) => x.field === id)) {
      this.createColId(cols);
    } else {
      return id;
    }
  }

  updateTable() {}

  createRandomString(length) {
    // const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
