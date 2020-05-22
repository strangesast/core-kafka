import { ElementRef, AfterViewInit, ViewChild, Input, Component, OnInit, OnDestroy } from '@angular/core';
import { ScrollDispatcher, CdkScrollable } from '@angular/cdk/scrolling';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject, fromEvent } from 'rxjs';
import { startWith, map, switchMap } from 'rxjs/operators';


@Component({
  selector: 'app-timeclock-staggered',
  template: `
  <div class="container" #scroller cdkScrollable>
    <div *ngFor="let value of values$ | async; index as i" [ngStyle]="{'transform': getTransform(i)}">
      <div class="label">
        <app-pie [value]="20 + i * 10"></app-pie>
        <span>1:42.00</span>
      </div>
      <div class="component"></div>
    </div>
  </div>
  `,
  styleUrls: ['./timeclock-staggered.component.scss']
})
export class TimeclockStaggeredComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(CdkScrollable) scroller: CdkScrollable;

  @Input()
  dataSource: MatTableDataSource<any>;

  values$: BehaviorSubject<any[]>;

  constructor(public scrollDispatcher: ScrollDispatcher) { }

  ngOnInit(): void {
    this.values$ = this.dataSource.connect();
    console.log(this.values$.value);
  }

  ngAfterViewInit() {
    const resize$ = fromEvent(window, 'resize');
    const scrolled$ = this.scroller.elementScrolled();
    resize$.pipe(
      startWith(null),
      map(() => this.scroller.getElementRef().nativeElement.getBoundingClientRect()),
      switchMap(({width, height}) => scrolled$.pipe(map(() => ({offset: this.scroller.measureScrollOffset('left'), width, height})))),
    ).subscribe(v => console.log(v));
  }

  ngOnDestroy(): void {
    this.dataSource.disconnect();
  }

  getTransform(i: number) {
    const x = (i * 100);
    const y = (68 * i);
    return `translate(${x}px,${y}px)`;
  }
}
