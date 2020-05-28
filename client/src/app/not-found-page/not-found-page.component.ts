import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-not-found-page',
  template: `
  <h1>Shit!</h1>
  <p>Not found.</p>
  `,
  styleUrls: ['./not-found-page.component.scss']
})
export class NotFoundPageComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
