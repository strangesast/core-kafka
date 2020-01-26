import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GraphQLModule } from './graphql.module';
import { MaterialModule } from './material.module';
import { DataTableComponent } from './data-table/data-table.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { TimesheetPageComponent } from './timesheet-page/timesheet-page.component';
import { UserPageComponent } from './user-page/user-page.component';
import { UserCardComponent } from './user-card/user-card.component';
import { TimesheetWeekPageComponent } from './timesheet-week-page/timesheet-week-page.component';
import { TimesheetContainerPageComponent } from './timesheet-container-page/timesheet-container-page.component';
import { HomePageComponent } from './home-page/home-page.component';
import { LoginPageContainerComponent } from './login-page-container/login-page-container.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { SearchComponent } from './search/search.component';

@NgModule({
  declarations: [
    AppComponent,
    DataTableComponent,
    TimesheetPageComponent,
    UserPageComponent,
    UserCardComponent,
    TimesheetWeekPageComponent,
    TimesheetContainerPageComponent,
    HomePageComponent,
    LoginPageContainerComponent,
    LoginPageComponent,
    SideBarComponent,
    SearchComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    GraphQLModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MaterialModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
