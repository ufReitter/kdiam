import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { Router } from '@angular/router';
import { DataService } from '../services/data.service';

export interface DialogData {
  element: any;
  result: any;
}

@Component({
  selector: 'load-json-dialog',
  templateUrl: './load-json-dialog.component.html',
  styleUrls: ['./load-json-dialog.component.scss'],
})
export class LoadJsonDialogComponent implements OnInit, OnDestroy {
  title: string;
  index: number;
  def: any;
  usedBy = { art: [], calc: [] };
  confirm: boolean;
  constructor(
    private router: Router,
    private dialogRef: MatDialogRef<LoadJsonDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public dS: DataService,
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    this.title = this.data.element;
    this.dS.viewMode.dialog = true;
  }

  ngOnDestroy() {
    this.dS.viewMode.dialog = false;
  }

  cancel(confirmed): void {
    if (!confirmed) {
      this.dialogRef.close(false);
    } else {
      this.dialogRef.close(false);
    }
  }

  execute(): void {
    switch (this.data.result) {
      case 'Variable':
        this.data.result.optionsHtml =
          '<div class="cell-variable-id">' +
            this.data.result.id +
            '</div><div class="cell-description">' +
            this.data.result.description || '' + '</div>';
        break;
      case 'Reference':
        this.data.result.optionsHtml =
          '<div class="cell-id kd-reference">' +
          this.data.result.id +
          '</div><div class="cell-author">' +
          this.data.result.author +
          '</div><div class="cell-title">' +
          this.data.result.title +
          '</div>';
        break;
      case 'Equation':
        this.data.result.optionsHtml =
          '<div class="cell-id">' +
          this.data.result.id +
          '</div><div class="cell-description">' +
          this.data.result.latex +
          '</div>';
        break;
      default:
    }
    this.dialogRef.close(this.data.result);
  }

  navigateTo(ref) {
    this.dialogRef.close({ show: true, model: ref.model, id: ref.id });
  }
}
