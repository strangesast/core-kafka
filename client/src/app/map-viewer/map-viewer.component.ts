import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { group } from 'd3-array';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { combineLatest, BehaviorSubject, Subject, ReplaySubject } from 'rxjs';
import { map, takeUntil, pluck, filter, multicast, refCount } from 'rxjs/operators';
import { animate, trigger, transition, state, style } from '@angular/animations';


const query = gql`
  subscription {
    machines {
      state(limit: 1, order_by: {timestamp: desc, value: asc}) {
        offset
        timestamp
        value
      }
      id
      manufacturer
      name
    }
  }
`;

@Component({
  selector: 'app-map-viewer',
  template: `
  <svg #svg></svg>
  <div *ngIf="dirty" class="controls" @slideIn>
    <button mat-flat-button color="primary" (click)="reset()">Reset</button>
  </div>
  `,
  styles: [`
  :host {
    display: block;
    position: relative;
    overflow: hidden;
  }
  svg {
    width: 100%;
    height: 100%;
    position: absolute;
  }
  .controls {
    position: absolute;
    bottom: 12px;
    right: 12px;
  }
  `],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({transform: 'translateY(200px)'}),
        animate(200, style({transform: 'translateY(0)'})),
      ]),
      transition(':leave', [
        animate(200, style({transform: 'translateY(200px)'})),
      ]),

    ]),
  ],
  styleUrls: ['./map-viewer.component.scss']
})
export class MapViewerComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input()
  machines: any[];

  machines$ = new ReplaySubject(1);

  @ViewChild('svg')
  el: ElementRef;

  svg;
  path;
  width: number;
  height: number;
  assets$ = this.http.get('/assets/df_building.json').pipe(
    multicast(new BehaviorSubject(null)),
    refCount(),
  );
  dirty = false;
  destroyed$ = new Subject();
  lastClicked = '';
  reset = () => null;

  constructor(
    public apollo: Apollo,
    public http: HttpClient,
  ) {}

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    const { width, height } = this.el.nativeElement.getBoundingClientRect();
    this.width = width;
    this.height = height;
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('machines' in changes) {
      this.machines$.next(changes.machines.currentValue);
    }
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  ngAfterViewInit(): void {
    const svg = d3.select(this.el.nativeElement);
    this.svg = svg;

    const path = d3.geoPath().projection(d3.geoIdentity().reflectY(true));

    let first = true;
    const g = svg.append('g');

    const zoom = d3.zoom()
      .scaleExtent([.4, 2])
      .on('start', () => {
        if (first) {
          first = false;
        } else if (this.dirty === false) {
          this.dirty = true;
        }
      })
      .on('zoom', () => {
        g.attr('transform', d3.event.transform);
      });

    svg.call(zoom);

    const gBuilding = g.append('g').classed('building', true).call(s => s.append('path'));

    const assets$ = this.assets$.pipe(filter(assets => assets != null));

    const calcZoom = (feature, scale = true) => {
      const [[x0, y0], [x1, y1]] = path.bounds(feature);

      let z = d3.zoomIdentity.translate(this.width / 2, this.height / 2);
      if (scale) {
        z = z.scale(Math.min(8, 0.9 / Math.max((x1 - x0) / this.width, (y1 - y0) / this.height)));
      }
      z = z.translate(-(x0 + x1) / 2, -(y0 + y1) / 2);

      return z;
    };

    this.apollo.subscribe({query}).pipe(
      takeUntil(this.destroyed$),
      pluck('data', 'machines'),
    ).subscribe(data => console.log(data));

    combineLatest(assets$, this.machines$.pipe(filter(arr => arr != null))).subscribe(([json, machines]: [any, any]) => {
      /* nav changes element size slightly after render, so calculate a bit late */
      const {width, height} = svg.node().getBoundingClientRect();
      this.width = width;
      this.height = height;

      const machinesMap = machines.reduce((acc, value) => ({...acc, [value.machine_id]: value}), {});

      const center = d3.geoCentroid(json);
      const buildingFeature = topojson.feature(json, json.objects.building);

      gBuilding.datum(buildingFeature).select('path')
        .attr('fill', 'none')
        .attr('stroke', 'black')
        .attr('d', path);

      this.reset = () => {
        this.svg.transition().call(zoom.transform, calcZoom(buildingFeature));
        setTimeout(() => this.dirty = false, 500);
      };

      const data = Object.entries(json.objects).filter(d => d[0] !== 'cameras' && d[0] !== 'building');

      g.selectAll('g.object').data(data, d => d[0]).join(
        s => s.append('g').classed('object', true).call(ss => {
          ss.append('path')
            .attr('fill', 'none')
            .attr('stroke', 'black');
          ss.append('rect').attr('fill', 'transparent');
          ss.append('circle').attr('fill', 'green');
        })
      )
      .each(function([machineId, geometry]: any, i: number) {
        const s = d3.select(this);

        const f = topojson.feature(json, geometry);
        const [[x, y], [x1, y1]] = path.bounds(f);
        const [w, h] = [x1 - x, y1 - y];
        const color = getColor(machines, machineId);

        s.select('path').attr('d', path(f));
        s.select('circle')
          .attr('cx', x + w / 2)
          .attr('cy', y + h / 2)
          .attr('r', 20)
          .attr('stroke', 'black')
          .attr('fill', color);
        s.select('rect')
          .attr('width', w)
          .attr('height', h)
          .attr('x', x)
          .attr('y', y);
      })
      .on('mouseenter', function(d) {
        const s = d3.select(this);
        s.select('path').attr('stroke-width', 4);
      })
      .on('mouseleave', function(d) {
        const s = d3.select(this);
        s.select('path').attr('stroke-width', null);
      })
      .on('click', d => {
        if (this.lastClicked === d[0]) {
          this.dirty = false;
          this.lastClicked = '';
          svg.transition().call(zoom.transform, calcZoom(buildingFeature));
        } else {
          this.dirty = true;
          this.lastClicked = d[0];
          svg.transition().call(zoom.transform, calcZoom(topojson.feature(json, d[1]), false));
        }
      });

      svg.call(zoom.transform, calcZoom(buildingFeature));
    });
  }
}

function getColor(machinesMap, id) {
  let machineState;
  if (id in machinesMap) {
    machineState = machinesMap[id].value;
  } else {
    machineState = 'unknown';
  }
  switch (machineState) {
    case 'active': return 'green';
    case 'unavailable': return 'gray';
    case 'stopped': return 'red';
    case 'interrupted': return 'blue';
    default:
      return 'gray';
  }
}
