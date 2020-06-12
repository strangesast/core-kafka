import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SlidyTableComponent } from './slidy-table.component';

describe('SlidyTableComponent', () => {
  let component: SlidyTableComponent;
  let fixture: ComponentFixture<SlidyTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SlidyTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SlidyTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
