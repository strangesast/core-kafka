import { OnChanges, SimpleChanges, ElementRef, AfterViewInit, ViewChild, Input, Component, OnInit, OnDestroy } from '@angular/core';
import { ScrollDispatcher, CdkScrollable } from '@angular/cdk/scrolling';
import { MatTableDataSource } from '@angular/material/table';
import { of, BehaviorSubject, fromEvent } from 'rxjs';
import { startWith, map, switchMap } from 'rxjs/operators';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { TimeclockShiftDialogComponent } from '../timeclock-shift-dialog/timeclock-shift-dialog.component';


@Component({
  selector: 'app-timeclock-staggered',
  template: `
  <div class="container" #scroller cdkScrollable>
    <div class="labels">
      <div *ngFor="let label of labels$ | async; index as i" class="label" [ngStyle]="{'transform': getTransform(i, 0)}">
        <span>{{ formatLabelText(i) | date:'shortTime' }}</span>
      </div>
    </div>
    <div class="shifts">
      <div
        *ngFor="let value of values$ | async; index as i"
        [ngStyle]="{'transform': getTransform(i, i)}"
        (click)="openDialog(value)"
        class="shift">
        <div class="label">
          <app-pie [value]="20 + i * 10"></app-pie>
          <span>{{value.duration | duration:'h:mm:ss'}}</span>
        </div>
        <div class="component">
          <span>{{value.start | date:'shortTime'}}</span>
          <span>{{value.end | date:'shortTime'}}</span>
        </div>
      </div>
    </div>
  </div>
  `,
  styleUrls: ['./timeclock-staggered.component.scss']
})
export class TimeclockStaggeredComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  @ViewChild(CdkScrollable) scroller: CdkScrollable;

  @Input()
  dataSource: MatTableDataSource<any>;

  values$: BehaviorSubject<any[]>;

  labels$ = of(Array.from(Array(20)));

  constructor(
    public scrollDispatcher: ScrollDispatcher,
    public dialog: MatDialog,
  ) {}

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('dataSource' in changes && changes.dataSource.currentValue != null) {
      this.values$ = this.dataSource.connect();
    }
  }

  ngAfterViewInit() {
    const resize$ = fromEvent(window, 'resize');
    const scrolled$ = this.scroller.elementScrolled();

    {
      const { width, height } = this.getHostElementSize();
      this.scroller.scrollTo({left: width / 2});
    }

    resize$.pipe(
      startWith(null),
      map(() => this.getHostElementSize()),
      switchMap(({width, height}) => scrolled$.pipe(map(() => ({offset: this.scroller.measureScrollOffset('left'), width, height})))),
    ).subscribe(v => console.log(v));
  }

  getHostElementSize(): {width: number, height: number} {
    return this.scroller.getElementRef()
      .nativeElement.getBoundingClientRect();
  }

  ngOnDestroy(): void {
    this.dataSource.disconnect();
  }

  formatLabelText(i) {
    const d = new Date(2000, 0, 1);
    d.setHours(Math.floor(i / 2), i % 2 * 30);
    return d;
  }

  getTransform(i: number, j: number) {
    const x = (i * 100);
    const y = j * 68;
    return `translate(${x}px,${y}px)`;
  }

  openDialog(data): void {
    const dialogRef = this.dialog.open(TimeclockShiftDialogComponent, {
      width: '320px',
      data,
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }
}
