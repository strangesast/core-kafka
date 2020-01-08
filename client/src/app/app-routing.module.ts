import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TimesheetPageComponent } from './timesheet-page/timesheet-page.component';
import { UserPageComponent } from './user-page/user-page.component';


const routes: Routes = [
  {path: 'timesheet', component: TimesheetPageComponent},
  {path: 'user', component: UserPageComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
