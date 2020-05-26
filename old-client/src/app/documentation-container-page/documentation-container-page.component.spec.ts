import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentationContainerPageComponent } from './documentation-container-page.component';

describe('DocumentationContainerPageComponent', () => {
  let component: DocumentationContainerPageComponent;
  let fixture: ComponentFixture<DocumentationContainerPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentationContainerPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentationContainerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
