import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainComponent } from './main/main.component';
import { SummaryPageComponent } from './summary-page/summary-page.component';
import { MachinesPageComponent } from './machines-page/machines-page.component';
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


const routes: Routes = [
  {path: '', component: MainComponent, children: [
    {path:  '', component: SummaryPageComponent},
    {path: 'timeclock', component: TimeclockPageComponent},
    {path: 'machines', component: MachinesPageComponent},
    {path: 'machines/:id', component: MachinePageComponent},
    {path: 'orders', component: ActiveOrdersPageComponent},
    {path: 'orders/historical', component: OrderListPageComponent},
    {path: 'orders/:id', component: OrderPageComponent},
    {path: 'people', component: PersonListPageComponent},
    {path: 'people/:id', component: PersonPageComponent},
    {path: 'customers', component: CustomerListPageComponent},
    {path: 'customers/:id', component: CustomerPageComponent},
    {path: 'inventory', component: InventoryPageComponent},
    {path: 'parts', component: PartListPageComponent},
    {path: 'parts/:id', component: PartPageComponent},
    /* {path: 'history', component: MachinesPageComponent}, */
    {path: 'notifications', component: NotificationsPageComponent},
  ] },
  {path: 'login', component: LoginBasePageComponent, children: [
    {path: '', component: LoginPageComponent},
    {path: 'new', component: CreateAccountPageComponent},
  ]},
  {path: 'graphs', component: TimeclockGraphsContainerPageComponent, children: [
    {path: '**', component: NoopComponent},
  ]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
