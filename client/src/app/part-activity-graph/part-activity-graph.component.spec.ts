import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartActivityGraphComponent } from './part-activity-graph.component';

describe('PartActivityGraphComponent', () => {
  let component: PartActivityGraphComponent;
  let fixture: ComponentFixture<PartActivityGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartActivityGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartActivityGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
