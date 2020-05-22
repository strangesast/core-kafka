import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeclockStaggeredComponent } from './timeclock-staggered.component';

describe('TimeclockStaggeredComponent', () => {
  let component: TimeclockStaggeredComponent;
  let fixture: ComponentFixture<TimeclockStaggeredComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeclockStaggeredComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeclockStaggeredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
