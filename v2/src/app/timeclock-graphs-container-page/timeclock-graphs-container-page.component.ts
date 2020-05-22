import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-timeclock-graphs-container-page',
  template: `
  <mat-toolbar>
    <div>
      <button mat-icon-button (click)="snav.toggle()"><mat-icon>menu</mat-icon></button>
      <a [routerLink]="['/graphs']">Graphs</a>
    </div>
    <a mat-stroked-button [routerLink]="['/']">Back</a>
  </mat-toolbar>
  <mat-sidenav-container>
    <mat-sidenav mode="side" opened #snav>
      <mat-nav-list>
        <a mat-list-item [routerLink]="['./timeclock', '1']">Timeclock Graph 1</a>
        <a mat-list-item [routerLink]="['./timeclock', '2']">Timeclock Graph 2</a>
        <a mat-list-item [routerLink]="['./timeclock', '3']">Timeclock Graph 3</a>
        <a mat-list-item [routerLink]="['./timeclock', '4']">Timeclock Graph 4</a>
        <a mat-list-item [routerLink]="['./timeclock', '5']">Timeclock Graph 5</a>
        <a mat-list-item [routerLink]="['./timeclock', '6']">Timeclock Graph 6</a>
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
