import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { QuillModule } from 'ngx-quill';
import { MaterialModule } from '../material.module';
import { SharedModule } from '../shared.module';
import { HeaderComponent } from '../shared/header/header.component';
import { AnimationComponent } from './animation/animation.component';
import { ArticleComponent } from './article/article.component';
import { ButtonComponent } from './button/button.component';
import { ChartComponent } from './chart/chart.component';
import { CheckComponent } from './check/check.component';
import { ChildrenComponent } from './children/children.component';
import { DatarowsComponent } from './datarows/datarows.component';
import { DbstatusComponent } from './dbstatus/dbstatus.component';
import { ElmGridComponent } from './elm-grid/elm-grid.component';
import { ElmLegacyComponent } from './elm-legacy/elm-legacy.component';
import { ElmComponent } from './elm/elm.component';
import { EquationComponent } from './equation/equation.component';
import { FigureComponent } from './figure/figure.component';
import { FuncComponent } from './func/func.component';
import { HomepageComponent } from './homepage/homepage.component';
import { NumberComponent } from './number/number.component';
import { NumerationComponent } from './numeration/numeration.component';
import { PlayButtonComponent } from './play-button/play-button.component';
import { ProjectComponent } from './project/project.component';
import { ReferenceComponent } from './reference/reference.component';
import { RefsComponent } from './refs/refs.component';
import { ResultComponent } from './result/result.component';
import { SaveFileComponent } from './save-file/save-file.component';
import { SelectComponent } from './select/select.component';
import { SliderComponent } from './slider/slider.component';
import { TableComponent } from './table/table.component';
import { TextComponent } from './text/text.component';
import { UnitComponent } from './unit/unit.component';
import { VarTrComponent } from './var-tr/var-tr.component';
import { ViewportInputComponent } from './viewport-input/viewport-input.component';
import { ViewportComponent } from './viewport/viewport.component';
import { VolumeViewComponent } from './volume-view/volume-view.component';

@NgModule({
  imports: [
    QuillModule.forRoot({
      suppressGlobalRegisterWarning: true,
    }),
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    SharedModule,
  ],
  declarations: [
    HeaderComponent,
    SaveFileComponent,
    ElmComponent,
    TableComponent,
    FigureComponent,
    ProjectComponent,
    HomepageComponent,
    NumberComponent,
    ViewportInputComponent,
    VolumeViewComponent,
    NumerationComponent,
    DbstatusComponent,
    DatarowsComponent,
    ReferenceComponent,
    UnitComponent,
    ButtonComponent,
    SelectComponent,
    FuncComponent,
    ChildrenComponent,
    RefsComponent,
    ViewportComponent,
    CheckComponent,
    AnimationComponent,
    SliderComponent,
    ResultComponent,
    TextComponent,
    ArticleComponent,
    ElmLegacyComponent,
    VarTrComponent,
    EquationComponent,
    ChartComponent,
    PlayButtonComponent,
    ElmGridComponent,
  ],
  exports: [
    ArticleComponent,
    // QuillModule,
    HeaderComponent,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    MaterialModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    ElmComponent,
    TableComponent,
    FigureComponent,
    ProjectComponent,
    HomepageComponent,
    NumberComponent,
    ViewportInputComponent,
    ViewportComponent,
    DbstatusComponent,
    ElmLegacyComponent,
    ChartComponent,
    ResultComponent,
    VarTrComponent,
    PlayButtonComponent,
    AnimationComponent,
    CheckComponent,
    ButtonComponent,
    SelectComponent,
  ],
})
export class ElmModule {}
