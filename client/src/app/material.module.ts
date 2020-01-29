import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSidenavModule } from '@angular/material/sidenav';


const components = [
  MatIconModule,
  MatButtonModule,
  MatProgressSpinnerModule,
  MatButtonToggleModule,
  MatSidenavModule,
];

@NgModule({
  imports: [CommonModule, ...components],
  exports: components,
})
export class MaterialModule { }
