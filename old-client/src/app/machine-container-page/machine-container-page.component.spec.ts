import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MachineContainerPageComponent } from './machine-container-page.component';

describe('MachineContainerPageComponent', () => {
  let component: MachineContainerPageComponent;
  let fixture: ComponentFixture<MachineContainerPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MachineContainerPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MachineContainerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
