import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetPageComponent } from './timesheet-page.component';

describe('TimesheetPageComponent', () => {
  let component: TimesheetPageComponent;
  let fixture: ComponentFixture<TimesheetPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimesheetPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimesheetPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
