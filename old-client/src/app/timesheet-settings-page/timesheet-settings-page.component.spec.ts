import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetSettingsPageComponent } from './timesheet-settings-page.component';

describe('TimesheetSettingsPageComponent', () => {
  let component: TimesheetSettingsPageComponent;
  let fixture: ComponentFixture<TimesheetSettingsPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimesheetSettingsPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimesheetSettingsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
