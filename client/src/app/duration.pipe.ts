import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration'
})
export class DurationPipe implements PipeTransform {

  transform(value: number, arg?: string): string {
    if (arg && arg === 'h:mm:ss') {
      const h = Math.floor(value / (60 * 60 * 1000));
      value -= h * 60 * 60 * 1000;
      const m = Math.floor(value / (60 * 1000));
      const mm = `0${m}`.slice(-2);
      value -= m * 60 * 1000;
      const s = Math.floor(value / 1000 / 100) * 100;
      const ss = `0${s}`.slice(-2);
      return `${h}:${mm}:${ss}`;
    } else {
      const h = value / (60 * 60 * 1000);
      return `${Math.round(h * 10) / 10} hours`;
    }
  }

}
