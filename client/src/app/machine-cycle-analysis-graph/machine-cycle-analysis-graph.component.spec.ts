import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MachineCycleAnalysisGraphComponent } from './machine-cycle-analysis-graph.component';

describe('MachineCycleAnalysisGraphComponent', () => {
  let component: MachineCycleAnalysisGraphComponent;
  let fixture: ComponentFixture<MachineCycleAnalysisGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MachineCycleAnalysisGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MachineCycleAnalysisGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
