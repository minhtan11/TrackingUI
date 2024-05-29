import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatdate'
})
export class FormatdatePipe implements PipeTransform {
  valueFormat:any = '';
  constructor(
    private tranform: DatePipe,
  ){}
  transform(value: any, stringformat:any): any {
    if(value == null || value == '') return '';
    let invalid = Date.parse(value);
    if(isNaN(invalid)) return value;
    this.valueFormat = this.tranform.transform(value,stringformat)?.toString();
    return 'Dự kiến '+this.valueFormat;
  }

}
