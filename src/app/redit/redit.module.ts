import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ElmModule } from '../elm/elm.module';
import { MaterialModule } from '../material.module';
import { PrettyPrintPipe } from '../pipes/prettyprint.pipe';
import { SharedLazyModule } from '../shared-lazy.module';
import { SharedModule } from '../shared.module';
import { AlignComponent } from './align/align.component';
import { ChildItemComponent } from './child-item/child-item.component';
import { CodeComponent } from './code/code.component';
import { EditorComponent } from './editor/editor.component';
import { HistoryComponent } from './history/history.component';
import { JsonComponent } from './json/json.component';
// import { MonacoEditorModule, NgxMonacoEditorConfig } from 'ngx-monaco-editor';
import { HistoryItemComponent } from './history-item/history-item.component';
import { MonacoEditorModule } from './monaco-editor/editor.module';
import { ReditRoutingModule } from './redit-routing.module';
import { ReditwrapComponent } from './reditwrap/reditwrap.component';
import { ScrollItemComponent } from './scroll-item/scroll-item.component';
import { ScrollComponent } from './scroll/scroll.component';
import { StorageComponent } from './storage/storage.component';
import { TranslateComponent } from './translate/translate.component';

import { ReditToolbarComponent } from './redit-toolbar/redit-toolbar.component';
import { ReditToolsComponent } from './redit-tools/redit-tools.component';
import { SnapshotsMenuComponent } from './snapshots-menu/snapshots-menu.component';
import { ChildrenTargetComponent } from './target/children-target/children-target.component';
import { ElmTargetComponent } from './target/elm-target/elm-target.component';
import { EquationTargetComponent } from './target/equation-target/equation-target.component';
import { FigureComponentTarget } from './target/figure-target/figure-target.component';
import { HeaderTargetComponent } from './target/header-target/header-target.component';
import { ProjectTargetComponent } from './target/project-target/project-target.component';
import { TargetWrapperComponent } from './target/target-wrapper/target-wrapper.component';
import { TextTargetComponent } from './target/text-target/text-target.component';

import { monacoConfig } from './monacoConfig';

import { LoadComponent } from './load/load.component';
import './quillConfig';
import { TreeEditComponent } from './tree-edit/tree-edit.component';
import { EdTableComponent } from './ed-table/ed-table.component';

@NgModule({
  declarations: [
    TreeEditComponent,
    PrettyPrintPipe,
    ReditwrapComponent,
    StorageComponent,
    ScrollComponent,
    ScrollItemComponent,
    HistoryComponent,
    TranslateComponent,
    TargetWrapperComponent,
    HeaderTargetComponent,
    ElmTargetComponent,
    TextTargetComponent,
    EquationTargetComponent,
    ChildrenTargetComponent,
    ProjectTargetComponent,
    FigureComponentTarget,
    JsonComponent,
    EditorComponent,
    ChildItemComponent,
    CodeComponent,
    AlignComponent,
    HistoryItemComponent,
    ReditToolsComponent,
    ReditToolbarComponent,
    SnapshotsMenuComponent,
    LoadComponent,
    EdTableComponent,
  ],
  imports: [
    SharedLazyModule,
    FormsModule,
    MonacoEditorModule.forRoot(monacoConfig),
    SharedModule,
    ElmModule,
    MaterialModule,
    ReditRoutingModule,
  ],
  //providers: [ReditService],
})
export class ReditModule {}
