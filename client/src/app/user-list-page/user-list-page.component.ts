import { Component, OnInit, OnDestroy } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Subject } from 'rxjs';
import { pluck, takeUntil } from 'rxjs/operators';


export interface UserRecord {
  id: number;
  email: string;
  username: string;
  last_modified: Date;
  color: string;
  employees: {
    id: number;
    first_name: string;
    last_name: string;
  }[];
}

@Component({
  selector: 'app-user-list-page',
  template: `
  <app-page-title>
    <a [routerLink]="['/users']">Users</a>
  </app-page-title>
  <header>
    <h1>All Users</h1>
  </header>
  <table mat-table [dataSource]="dataSource">
    <ng-container matColumnDef="select">
      <th mat-header-cell *matHeaderCellDef>
        <mat-checkbox (change)="$event ? masterToggle() : null"
                      [checked]="selection.hasValue() && isAllSelected()"
                      [indeterminate]="selection.hasValue() && !isAllSelected()"
                      [aria-label]="checkboxLabel()">
        </mat-checkbox>
      </th>
      <td mat-cell *matCellDef="let row">
        <mat-checkbox (click)="$event.stopPropagation()"
                      (change)="$event ? selection.toggle(row) : null"
                      [checked]="selection.isSelected(row)"
                      [aria-label]="checkboxLabel(row)">
        </mat-checkbox>
      </td>
    </ng-container>
    <!-- Position Column -->
    <ng-container matColumnDef="username">
      <th mat-header-cell *matHeaderCellDef> Username </th>
      <td mat-cell *matCellDef="let row"> {{row.username}} </td>
    </ng-container>
    <!-- Name Column -->
    <ng-container matColumnDef="email">
      <th mat-header-cell *matHeaderCellDef> Email </th>
      <td mat-cell *matCellDef="let row"> {{row.email}} </td>
    </ng-container>
    <!-- Weight Column -->
    <ng-container matColumnDef="employee">
      <th mat-header-cell *matHeaderCellDef> Employee </th>
      <td mat-cell *matCellDef="let row"> <a *ngIf="row.employee as empl" [routerLink]="['/people', empl.id]">{{empl.first_name}} {{empl.last_name}}</a> </td>
    </ng-container>
    <!-- Symbol Column -->
    <ng-container matColumnDef="color">
      <th mat-header-cell *matHeaderCellDef> Color </th>
      <td mat-cell *matCellDef="let row"><span class="circle-swatch" [ngStyle]="{'background': row.color}"></span></td>
    </ng-container>
    <ng-container matColumnDef="last_modified">
      <th mat-header-cell *matHeaderCellDef> Last Modified </th>
      <td mat-cell *matCellDef="let row"> {{row.modified}} </td>
    </ng-container>
    <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
    <tr mat-row *matRowDef="let row; columns: displayedColumns;"
        (click)="selection.toggle(row)">
    </tr>
  </table>
  `,
  styleUrls: ['../base.scss', './user-list-page.component.scss']
})
export class UserListPageComponent implements OnInit, OnDestroy {
  destroyed$ = new Subject();
  displayedColumns: string[] = ['select', 'username', 'email', 'color', 'employee', 'last_modified'];
  dataSource = new MatTableDataSource<UserRecord>();
  selection = new SelectionModel<UserRecord>(true, []);

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => this.selection.select(row));
  }

  checkboxLabel(row?: UserRecord): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} user ${row.id}`;
  }

  constructor(public apollo: Apollo) { }

  ngOnInit(): void {
    this.getEmployees().pipe(
      takeUntil(this.destroyed$),
      pluck('data', 'users'),
    ).subscribe((data: any) => {
      data = data.map(datum => {
        const {employees, ...rest} = datum;
        return {...rest, employee: employees.length ? employees[0] : null};
      });
      this.dataSource.data = data;
    });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  getEmployees() {
    const query = gql`
      query MyQuery {
        users {
          email
          employees {
            first_name
            last_name
            id
          }
          id
          username
          last_modified
          color
        }
      }`;
    return this.apollo.query({query});
  }

  addRole() {
    const query = gql`
     mutation MyMutation($role_id: String!, $user_id: Int!) {
       insert_user_roles_one(object: {role_id: $role_id, user_id: $user_id}) {
         user_id
         role_id
       }
     }`;
  }
}
