import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MachineActivityGraphComponent } from './machine-activity-graph.component';

describe('MachineActivityGraphComponent', () => {
  let component: MachineActivityGraphComponent;
  let fixture: ComponentFixture<MachineActivityGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MachineActivityGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MachineActivityGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
