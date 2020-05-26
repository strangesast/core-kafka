import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetContainerPageComponent } from './timesheet-container-page.component';

describe('TimesheetContainerPageComponent', () => {
  let component: TimesheetContainerPageComponent;
  let fixture: ComponentFixture<TimesheetContainerPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimesheetContainerPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimesheetContainerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
