import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'ago', standalone: false })
export class agoPipe implements PipeTransform {
  transform(timeInput: any, locale): string {
    if (!timeInput) {
      timeInput = new Date(0);
    }
    if (typeof timeInput === 'string') {
      timeInput = new Date(timeInput);
    }

    let time: string = '',
      ago: string = '',
      plural: string = '';

    let elapsedMs = new Date(
      new Date().getTime() - timeInput.getTime(),
    ).getTime();

    let elapsed = elapsedMs / 1000;

    if (locale === 'de') {
      ago = 'vor';
      if (elapsed < 60) {
        time = 'Sekunde';
        plural = 'n';
      } else if ((elapsed /= 60) < 60) {
        time = 'Minute';
        plural = 'n';
      } else if ((elapsed /= 60) < 24) {
        time = 'Stunde';
        plural = 'n';
      } else if ((elapsed /= 24) < 30) {
        time = 'Tag';
        plural = 'en';
      } else if ((elapsed /= 30) < 12) {
        time = 'Monat';
        plural = 'en';
      } else {
        time = 'Jahr';
        plural = 'en';
        elapsed /= 12;
      }

      if (Math.round(elapsed) > 1) {
        time += plural;
      }

      return ago + ' ' + Math.round(elapsed) + ' ' + time;
    }

    if (locale === 'en') {
      ago = 'ago';
      plural = 's';
      if (elapsed < 60) {
        time = 'Second';
      } else if ((elapsed /= 60) < 60) {
        time = 'Minute';
      } else if ((elapsed /= 60) < 24) {
        time = 'Hour';
      } else if ((elapsed /= 24) < 30) {
        time = 'Day';
      } else if ((elapsed /= 30) < 12) {
        time = 'Month';
      } else {
        time = 'Year';
        elapsed /= 12;
      }

      if (Math.round(elapsed) > 1) {
        time += plural;
      }

      return Math.round(elapsed) + ' ' + time + ' ' + ago;
    }

    return Math.round(elapsed) + ' ' + time + ' ' + ago;
  }
}
