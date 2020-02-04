import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-documentation-container-page',
  template: `
  <router-outlet></router-outlet>
  `,
  styleUrls: ['./documentation-container-page.component.scss']
})
export class DocumentationContainerPageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
