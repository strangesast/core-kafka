import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TimesheetPageComponent } from './timesheet-page/timesheet-page.component';
import { TimesheetWeekPageComponent } from './timesheet-week-page/timesheet-week-page.component';
import { TimesheetContainerPageComponent } from './timesheet-container-page/timesheet-container-page.component';
import { UserPageComponent } from './user-page/user-page.component';


const routes: Routes = [
  {path: 'timesheet', component: TimesheetContainerPageComponent, children: [
    {path: '', component: TimesheetPageComponent},
    {path: 'week/:weekId', component: TimesheetWeekPageComponent},
  ]},
  {path: 'user', component: UserPageComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
