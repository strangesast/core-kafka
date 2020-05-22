import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-inventory-page',
  template: `
  <app-page-title>
    <a [routerLink]="['/inventory']">Inventory</a>
  </app-page-title>
  <header>
    <h1>Inventory</h1>
  </header>
  `,
  styleUrls: ['../base.scss', './inventory-page.component.scss']
})
export class InventoryPageComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
