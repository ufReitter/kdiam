import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'lastconnected' })
export class LastConnectedPipe implements PipeTransform {
  transform(connectedTime: any, ...args): string {
    if (!connectedTime) {
      connectedTime = new Date(0);
    }
    if (typeof connectedTime === 'string') {
      connectedTime = new Date(connectedTime);
    }

    let time: string = '';

    let elapsed1 =
      new Date(new Date().getTime() - connectedTime.getTime()).getTime() / 1000;
    if (elapsed1 < 60) {
      return Math.round(elapsed1) + ' s ago';
    }

    let elapsed =
      new Date(new Date().getTime() - connectedTime.getTime()).getTime() /
      60000;

    if (elapsed < 60) {
      time = 'm ago';
    } else if ((elapsed /= 60) < 24) {
      time = 'h ago';
    } else if ((elapsed /= 24) < 30) {
      time = 'd ago';
    } else if ((elapsed /= 30) < 12) {
      time = 'mo ago';
    } else return 'no connect';

    return Math.round(elapsed) + ' ' + time;
  }
}
