import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hours'
})
export class HoursPipe implements PipeTransform {

  transform(value: number): string {
    return `${(value / 3.6e6).toFixed(1)}`;
  }

}
