import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-timeclock-full-page',
  template: `<app-timeclock-staggered [dataSource]="dataSource"></app-timeclock-staggered>`,
  styleUrls: ['./timeclock-full-page.component.scss']
})
export class TimeclockFullPageComponent implements OnInit {
  dataSource = new MatTableDataSource();

  constructor() { }

  ngOnInit(): void {
  }

}
