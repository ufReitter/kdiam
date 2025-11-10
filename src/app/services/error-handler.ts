import { ErrorHandler, Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
@Injectable({
  providedIn: 'root',
})
export class GlobalErrorHandler implements ErrorHandler {
  constructor(public logger: NGXLogger) {
    // window.onerror = function (msg, url, line, col, error) {
    //   var extra = !col ? '' : '\ncolumn: ' + col;
    //   extra += !error ? '' : '\nerror: ' + error;
    //   alert('Error: ' + msg + '\nurl: ' + url + '\nline: ' + line + extra);
    // };
  }
  handleError(error) {
    this.logger.error(error, error.message, error.stack);
    //throw error;
  }
}
