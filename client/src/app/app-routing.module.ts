import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TimesheetPageComponent } from './timesheet-page/timesheet-page.component';
import { TimesheetWeekPageComponent } from './timesheet-week-page/timesheet-week-page.component';
import { TimesheetContainerPageComponent } from './timesheet-container-page/timesheet-container-page.component';
import { LoginPageContainerComponent } from './login-page-container/login-page-container.component';
import { HomePageComponent } from './home-page/home-page.component';
import { UserPageComponent } from './user-page/user-page.component';


const routes: Routes = [
  {path: '', component: HomePageComponent, children: [
    {path: 'timesheet', component: TimesheetContainerPageComponent, children: [
      {path: '', component: TimesheetPageComponent},
      {path: 'week/:weekId', component: TimesheetWeekPageComponent},
    ]},
  ]},
  {path: 'login', component: LoginPageContainerComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
