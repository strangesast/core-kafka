import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-noop',
  template: `
    <p>
      noop works!
    </p>
  `,
  styleUrls: ['./noop.component.scss']
})
export class NoopComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
