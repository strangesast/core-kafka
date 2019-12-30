import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
  <div>{{title}}</div>
  <router-outlet></router-outlet>
  `,
  styles: []
})
export class AppComponent {
  title = 'CORE';
}
