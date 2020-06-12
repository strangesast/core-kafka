import { Input, HostBinding, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-badge',
  template: `<span><span>{{initials}}</span></span>`,
  styleUrls: ['./user-badge.component.scss']
})
export class UserBadgeComponent implements OnInit {
  @Input()
  initials = '?';

  @Input()
  @HostBinding('style.--color')
  color = 'rgb(31, 120, 180)';

  constructor() { }

  ngOnInit(): void {
  }

}
