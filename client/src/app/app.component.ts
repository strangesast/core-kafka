import { OnInit, Component } from '@angular/core';

import { UserService } from './user.service';

@Component({
  selector: 'app-root',
  template: `
  <router-outlet></router-outlet>`,
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(public service: UserService) {}

  ngOnInit() {
  }
}
