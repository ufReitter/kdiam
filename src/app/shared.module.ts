import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MaterialModule } from './material.module';
import { HighlightSearchPipe } from './pipes/highlight-search.pipe';
import { HighlighterPipe } from './pipes/highliter.pipe';
import { SafeHtmlPipe } from './pipes/safehtml.pipe';
import { SwitchMultiCasePipe } from './pipes/switchMultiCase.pipe';
import { CarouselComponent } from './shared/carousel/carousel.component';
import { EditionComponent } from './shared/edition/edition.component';
import { UsersOnlineComponent } from './shared/users-online/users-online.component';

@NgModule({
  imports: [CommonModule, MaterialModule],
  declarations: [
    SafeHtmlPipe,
    HighlighterPipe,
    HighlightSearchPipe,
    EditionComponent,
    UsersOnlineComponent,
    CarouselComponent,
    SwitchMultiCasePipe,
  ],
  exports: [
    SafeHtmlPipe,
    HighlighterPipe,
    HighlightSearchPipe,
    EditionComponent,
    UsersOnlineComponent,
    CarouselComponent,
    SwitchMultiCasePipe,
  ],
})
export class SharedModule {}
