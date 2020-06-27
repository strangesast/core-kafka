import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeeklyShiftGraphComponent } from './weekly-shift-graph.component';

describe('WeeklyShiftGraphComponent', () => {
  let component: WeeklyShiftGraphComponent;
  let fixture: ComponentFixture<WeeklyShiftGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeeklyShiftGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeeklyShiftGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
