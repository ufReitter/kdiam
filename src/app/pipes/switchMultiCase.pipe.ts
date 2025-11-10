import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'switchMultiCase',
})
export class SwitchMultiCasePipe implements PipeTransform {
  transform(cases: any[], switchOption: any): any {
    return cases.includes(switchOption) ? switchOption : !switchOption;
  }
}
