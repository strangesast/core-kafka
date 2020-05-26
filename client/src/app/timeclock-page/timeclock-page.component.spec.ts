import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeclockPageComponent } from './timeclock-page.component';

describe('TimeclockPageComponent', () => {
  let component: TimeclockPageComponent;
  let fixture: ComponentFixture<TimeclockPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeclockPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeclockPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
