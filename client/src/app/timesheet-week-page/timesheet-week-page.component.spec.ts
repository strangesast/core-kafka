import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetWeekPageComponent } from './timesheet-week-page.component';

describe('TimesheetWeekPageComponent', () => {
  let component: TimesheetWeekPageComponent;
  let fixture: ComponentFixture<TimesheetWeekPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimesheetWeekPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimesheetWeekPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
