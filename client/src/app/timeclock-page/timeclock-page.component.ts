import { ViewChild, Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

const DATE = new Date();
DATE.setHours(0, 0, 0, 0);

const DATA = [
  ...Array.from(Array(10)).map((_, i) => ({
    employee: {name: `Person ${i + 1}`, id: `person-${i}`},
    ...(() => {
      DATE.setHours(DATE.getHours() - 1);
      const start = new Date(DATE);
      DATE.setHours(DATE.getHours() + 2);
      const end = new Date(DATE);
      return {
        start,
        end,
        duration: +end - +start,
        expected_duration: 2 * 60 * 60 * 1000,
      };
    })(),
  })),
];



interface Record {
  employee: { name: string };
  start: Date;
  end: Date;
  total: number;
  duration: number;
  expected_duration: number;
}


@Component({
  selector: 'app-timeclock-page',
  template: `
  <app-page-title>
    <a [routerLink]="['/timeclock']">Timeclock</a>
  </app-page-title>
  <header>
    <h1>3 Clocked In <small>(As of 15:00)</small></h1>
    <p>34 Total Hours Today</p>
    <nav>
      <ul>
        <li><a [routerLink]="['/graphs', 'timeclock', '1']">Employee Shift Characteristic Graph</a></li>
        <li><a [routerLink]="['/graphs', 'timeclock', '2']">Employee Count Trend Graph</a></li>
      </ul>
    </nav>
  </header>
  <div class="controls">
    <app-timeclock-datepicker [(ngModel)]="window"></app-timeclock-datepicker>
    <mat-button-toggle-group [(ngModel)]="activeView">
      <mat-button-toggle value="timeline" aria-label="Timeline" title="Timeline">
        <mat-icon>clear_all</mat-icon>
      </mat-button-toggle>
      <mat-button-toggle value="table" aria-label="Table" title="Table">
        <mat-icon>list</mat-icon>
      </mat-button-toggle>
    </mat-button-toggle-group>
  </div>
  <div class="table-container" [ngSwitch]="activeView">
    <app-timeclock-table [dataSource]="dataSource" *ngSwitchCase="'table'"></app-timeclock-table>
    <app-timeclock-staggered [dataSource]="dataSource" *ngSwitchCase="'timeline'"></app-timeclock-staggered>
  </div>
  `,
  styleUrls: ['../base.scss', './timeclock-page.component.scss'],
})
export class TimeclockPageComponent implements OnInit {
  // @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  activeView = 'table';
  displayedColumns = ['name', 'start', 'end', 'total', 'weekly_total'];
  window = new Date();
  dataSource: MatTableDataSource<any>;
  data = DATA;

  constructor() {
    this.dataSource = new MatTableDataSource(this.data);
  }

  ngOnInit(): void {
    // this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
