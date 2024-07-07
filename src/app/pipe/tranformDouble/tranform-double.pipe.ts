import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tranformDouble',
  standalone:true
})
export class TranformDoublePipe implements PipeTransform {

  transform(value: any, ...args: any[]): number {
    if (value != null && value != '') {
      let newValue = parseFloat(value);
      return newValue;
    }
    return 0;
  }

}
