import { HostListener, AfterViewInit, OnDestroy, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as d3 from 'd3';
import { Selection } from 'd3';


@Component({ template: `<svg #svg></svg>` })
export class BaseGraphComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('svg') el: ElementRef;
  svg: Selection<any, SVGElement, any, any>;

  destroyed$ = new Subject();

  loading$;
  resized$ = new Subject();

  @HostListener('window:resize', ['$event'])
  resized(event) {
    this.resized$.next(event);
  }

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.svg = d3.select(this.el.nativeElement);
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
