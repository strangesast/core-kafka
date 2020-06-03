import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeclockFullPageComponent } from './timeclock-full-page.component';

describe('TimeclockFullPageComponent', () => {
  let component: TimeclockFullPageComponent;
  let fixture: ComponentFixture<TimeclockFullPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeclockFullPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeclockFullPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
