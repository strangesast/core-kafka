import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-forbidden-page',
  template: `
    <h1>Forbidden</h1>
  `,
  styleUrls: ['./forbidden-page.component.scss']
})
export class ForbiddenPageComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
