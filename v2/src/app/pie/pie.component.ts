import { HostBinding, Input, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-pie',
  template: `<span></span>`,
  styleUrls: ['./pie.component.scss']
})
export class PieComponent implements OnInit {
  @HostBinding('style.--pcolor')
  color = 'rgb(31, 120, 180)';


  @HostBinding('style.--bcolor')
  background = 'rgb(166, 206, 227)';


  @HostBinding('style.--p')
  @Input()
  value = 33;

  @HostBinding('style.height.px')
  @HostBinding('style.width.px')
  @Input()
  size = 20;

  constructor() { }

  ngOnInit(): void {
  }

}
