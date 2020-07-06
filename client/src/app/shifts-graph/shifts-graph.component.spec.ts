import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftsGraphComponent } from './shifts-graph.component';

describe('ShiftsGraphComponent', () => {
  let component: ShiftsGraphComponent;
  let fixture: ComponentFixture<ShiftsGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShiftsGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShiftsGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
