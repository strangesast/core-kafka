import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-timeclock-full-page',
  template: `<app-timeclock-staggered [dataSource]="dataSource"></app-timeclock-staggered>`,
  styleUrls: ['./timeclock-full-page.component.scss']
})
export class TimeclockFullPageComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
