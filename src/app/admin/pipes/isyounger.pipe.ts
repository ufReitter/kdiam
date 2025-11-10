import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'isyounger' })
export class IsYoungerPipe implements PipeTransform {
  transform(testTime: any, ...args): boolean {
    if (!testTime) {
      testTime = new Date(0);
    }
    if (typeof testTime === 'string') {
      testTime = new Date(testTime);
    }

    args[0] = args[0] || 0;

    return testTime.getTime() > new Date().getTime() - args[0] ? true : false;
  }
}
