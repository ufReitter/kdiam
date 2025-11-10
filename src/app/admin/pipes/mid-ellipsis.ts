import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'midellipsis' })
export class MidEllipsisPipe implements PipeTransform {
  transform(str: any, ...args): string {
    str = str || '';

    if (str.length > args[0]) {
      return (
        str.substr(0, args[0] / 2 - 2) +
        '...' +
        str.substr(str.length - args[0] / 2, str.length)
      );
    }

    return str;
  }
}
