import { Input, Component, OnInit } from '@angular/core';
const LOCALE = 'en-us';

@Component({
  selector: 'app-mini-date',
  template: `
  <span class="short-name">{{dayShortName}}</span>
  <span>{{date | date:'L/d/yyyy'}}</span>
  `,
  styleUrls: ['./mini-date.component.scss']
})
export class MiniDateComponent implements OnInit {
  private dayShortName: string;
  private d: Date;

  @Input()
  set date(d: Date) {
    this.dayShortName = d.toLocaleDateString(LOCALE, { weekday: 'short' });
    this.d = d;
  }
  get date() {
    return this.d;
  }

  constructor() { }

  ngOnInit() {
  }

}
