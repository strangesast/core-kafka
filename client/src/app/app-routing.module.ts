import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// components
import { MainComponent } from './main/main.component';
import { SummaryPageComponent } from './summary-page/summary-page.component';
import {
  MachinesPageComponent,
  MachinesGridComponent,
  MachinesMapComponent,
  MachinesListComponent,
} from './machines-page/machines-page.component';
import { MachinePageComponent } from './machine-page/machine-page.component';
import { TimeclockPageComponent } from './timeclock-page/timeclock-page.component';
import { PersonPageComponent } from './person-page/person-page.component';
import { PersonListPageComponent } from './person-list-page/person-list-page.component';
import { OrderListPageComponent } from './order-list-page/order-list-page.component';
import { OrderPageComponent } from './order-page/order-page.component';
import { PartListPageComponent } from './part-list-page/part-list-page.component';
import { PartPageComponent } from './part-page/part-page.component';
import { CustomerListPageComponent } from './customer-list-page/customer-list-page.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { InventoryPageComponent } from './inventory-page/inventory-page.component';
import { NotificationsPageComponent } from './notifications-page/notifications-page.component';
import { CreateAccountPageComponent } from './create-account-page/create-account-page.component';
import { LoginBasePageComponent } from './login-base-page/login-base-page.component';
import { TimeclockGraphsContainerPageComponent } from './timeclock-graphs-container-page/timeclock-graphs-container-page.component';
import { NoopComponent } from './noop/noop.component';
import { ActiveOrdersPageComponent } from './active-orders-page/active-orders-page.component';
import { CustomerPageComponent } from './customer-page/customer-page.component';
import { TimesheetPageComponent } from './timesheet-page/timesheet-page.component';
import { ForbiddenPageComponent } from './forbidden-page/forbidden-page.component';
import { NotFoundPageComponent } from './not-found-page/not-found-page.component';
import { SettingsPageComponent } from './settings-page/settings-page.component';
import { UserListPageComponent } from './user-list-page/user-list-page.component';
import { TimeclockFullPageComponent } from './timeclock-full-page/timeclock-full-page.component';
import { CameraViewerPageComponent } from './camera-viewer-page/camera-viewer-page.component';
import { MachineStatusGridComponent } from './machine-status-grid/machine-status-grid.component';
import { MachineActivityGraphComponent } from './machine-activity-graph/machine-activity-graph.component';
import { MachineCycleAnalysisGraphComponent } from './machine-cycle-analysis-graph/machine-cycle-analysis-graph.component';
import { MachineLiveGraphComponent } from './machine-live-graph/machine-live-graph.component';

// guards
import { InitGuard } from './init.guard';
import { RolesGuard } from './roles.guard';
import { PersonPageGuard } from './person-page.guard';


const routes: Routes = [
  {path: '', canActivate: [InitGuard], component: MainComponent, children: [
    {path:  '', component: SummaryPageComponent},
    {path: 'timeclock', component: TimeclockPageComponent},
    {path: 'machines', component: MachinesPageComponent, children: [
      {path: '', pathMatch: 'full', redirectTo: 'map'},
      {path: 'map', component: MachinesMapComponent},
      {path: 'list', component: MachinesListComponent},
      {path: 'grid', component: MachinesGridComponent},
    ]},
    {path: 'machines/:id', component: MachinePageComponent},
    {path: 'orders', component: ActiveOrdersPageComponent},
    {path: 'orders/historical', component: OrderListPageComponent},
    {path: 'orders/:id', component: OrderPageComponent},
    {path: 'people', component: PersonListPageComponent},
    {
      path: 'people/:id',
      component: PersonPageComponent,
      canActivate: [PersonPageGuard],
      resolve: {data: PersonPageGuard},
    },
    {path: 'customers', component: CustomerListPageComponent},
    {path: 'customers/:id', component: CustomerPageComponent},
    {path: 'inventory', component: InventoryPageComponent},
    {path: 'parts', component: PartListPageComponent},
    {path: 'parts/:id', component: PartPageComponent},
    /* {path: 'history', component: MachinesPageComponent}, */
    {path: 'notifications', component: NotificationsPageComponent},
    {
      path: 'settings',
      canActivate: [RolesGuard],
      component: SettingsPageComponent,
      data: {roles: []}, // just redirect to /login if no user
    },
    {
      path: 'timesheet',
      canActivate: [RolesGuard],
      component: TimesheetPageComponent,
      data: {roles: ['isPaidHourly']},
    },
    {
      path: 'users',
      canActivate: [RolesGuard],
      component: UserListPageComponent,
      data: {roles: ['isAdmin']},
    },
    {
      path: 'cameras',
      canActivate: [RolesGuard],
      component: CameraViewerPageComponent,
      data: {roles: ['isCameraViewer']},
    },
  ]},
  {path: 'login', component: LoginBasePageComponent, children: [
    {path: '', component: LoginPageComponent},
    {path: 'new', component: CreateAccountPageComponent},
  ]},
  {path: 'graphs', component: TimeclockGraphsContainerPageComponent, children: [
    {path: 'machines/activity', component: MachineActivityGraphComponent },
    {path: 'machines/cycles', component: MachineCycleAnalysisGraphComponent },
    {path: 'machines/live', component: MachineLiveGraphComponent },
    {path: '**', component: NoopComponent},
  ]},
  {path: 'machine-status', component: MachineStatusGridComponent},
  {path: 'timeclock/full', component: TimeclockFullPageComponent},
  {path: 'forbidden', component: ForbiddenPageComponent},
  {path: 'not-found', component: NotFoundPageComponent},
  {path: '**', component: NotFoundPageComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
