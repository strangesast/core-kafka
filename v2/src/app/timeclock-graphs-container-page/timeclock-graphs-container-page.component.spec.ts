import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeclockGraphsContainerPageComponent } from './timeclock-graphs-container-page.component';

describe('TimeclockGraphsContainerPageComponent', () => {
  let component: TimeclockGraphsContainerPageComponent;
  let fixture: ComponentFixture<TimeclockGraphsContainerPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeclockGraphsContainerPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeclockGraphsContainerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
