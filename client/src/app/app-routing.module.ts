import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TimesheetPageComponent } from './timesheet-page/timesheet-page.component';
import { TimesheetWeekPageComponent } from './timesheet-week-page/timesheet-week-page.component';
import { TimesheetContainerPageComponent } from './timesheet-container-page/timesheet-container-page.component';
import { LoginPageContainerComponent } from './login-page-container/login-page-container.component';
import { HomePageComponent } from './home-page/home-page.component';
import { UserPageComponent } from './user-page/user-page.component';
import { MachineContainerPageComponent } from './machine-container-page/machine-container-page.component';
import { DocumentationContainerPageComponent } from './documentation-container-page/documentation-container-page.component';
import { DocumentationPageComponent } from './documentation-page/documentation-page.component';


const routes: Routes = [
  { path: '', component: HomePageComponent, children: [
    { path: 'timesheet', component: TimesheetContainerPageComponent, children: [
      { path: 'current', component: TimesheetPageComponent },
      { path: ':period', component: TimesheetPageComponent },
      { path: '', pathMatch: 'full', redirectTo: 'current' },
    ] },
    { path: 'machines', component: MachineContainerPageComponent, children: []},
    { path: 'documentation', component: DocumentationContainerPageComponent, children: [
      { path: ':article', component: DocumentationPageComponent },
    ]},
    { path: '', pathMatch: 'full', redirectTo: 'timesheet' },
  ]},
  { path: 'login', component: LoginPageContainerComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
