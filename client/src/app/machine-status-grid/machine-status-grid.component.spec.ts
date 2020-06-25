import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MachineStatusGridComponent } from './machine-status-grid.component';

describe('MachineStatusGridComponent', () => {
  let component: MachineStatusGridComponent;
  let fixture: ComponentFixture<MachineStatusGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MachineStatusGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MachineStatusGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
