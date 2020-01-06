import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TimesheetPageComponent } from './timesheet-page/timesheet-page.component';


const routes: Routes = [
  {path: 'timesheet', component: TimesheetPageComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
