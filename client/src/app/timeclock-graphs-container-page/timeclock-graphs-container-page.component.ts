import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-timeclock-graphs-container-page',
  template: `
  <mat-toolbar>
    <div>
      <button mat-icon-button (click)="snav.toggle()"><mat-icon>menu</mat-icon></button>
      <app-brand></app-brand>
      <a [routerLink]="['/graphs']">Graphs</a>
    </div>
    <a mat-stroked-button [routerLink]="['/']">Back</a>
  </mat-toolbar>
  <mat-sidenav-container>
    <mat-sidenav mode="side" opened #snav>
      <mat-nav-list>
        <div mat-subheader>Machines</div>
        <a mat-list-item [routerLink]="['./machines', 'activity']">Machine Activity</a>
        <a mat-list-item [routerLink]="['./machines', 'cycles']">Cycles</a>
        <a mat-list-item [routerLink]="['./machines', 'live']">Live</a>
        <mat-divider></mat-divider>
        <div mat-subheader>Timeclock</div>
        <a mat-list-item [routerLink]="['./timeclock', 'shift-calendar']">Shift Calendar</a>
        <a mat-list-item [routerLink]="['./timeclock', 'weekly']">Weekly</a>
      </mat-nav-list>
    </mat-sidenav>
    <mat-sidenav-content>
      <router-outlet></router-outlet>
    </mat-sidenav-content>
  </mat-sidenav-container>
  `,
  styleUrls: ['./timeclock-graphs-container-page.component.scss']
})
export class TimeclockGraphsContainerPageComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
