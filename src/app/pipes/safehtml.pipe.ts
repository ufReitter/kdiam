import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({ name: 'safeHtml', standalone: false })
export class SafeHtmlPipe implements PipeTransform {
  constructor(public sanitized: DomSanitizer) {}
  transform(value) {
    // if (
    //   value.includes('<script') ||
    //   value.includes('<object') ||
    //   value.includes('<embed') ||
    //   value.includes('<link') ||
    //   value.includes('onclick')
    // ) {
    //   console.log('found dangerous html');
    //   value = '';
    // }
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
}
