import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-schedule-page',
  template: `
    <app-page-title>
      <a routerLink="/schedule">Schedule</a>
    </app-page-title>
  `,
  styleUrls: ['./schedule-page.component.scss']
})
export class SchedulePageComponent implements OnInit {
  header = Array.from(Array(12)).map((_, i) => `Header Item ${i + 1}`);
  data = Array.from(Array(12)).map((_, i) => `Item ${i + 1}`);

  constructor() { }

  ngOnInit(): void {
  }

}
