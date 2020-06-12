import {
  Input,
  OnChanges,
  SimpleChanges,
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as d3 from 'd3';
import { Selection } from 'd3';
import * as topojson from 'topojson-client';
import { Subject, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


@Component({
  selector: 'app-camera-viewer',
  template: `
  <svg #svg width="100%" height="100%"></svg>
  `,
  styleUrls: ['./camera-viewer.component.scss']
})
export class CameraViewerComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('svg')
  el: ElementRef;

  @Input()
  cameras: any[] = [];

  activeCamera = null;

  g: Selection<any, any, any, any>;
  drag;

  destroyed$ = new Subject();
  cameras$ = new ReplaySubject<any[]>(1);

  constructor(public http: HttpClient) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    const svg = d3.select(this.el.nativeElement);
    const defs = svg.append('defs');

    const path = d3.geoPath().projection(null);
    this.g = svg.append('g');

    const zoomed = () => {
      this.g.attr('transform', d3.event.transform);
    };
    const zoom = d3.zoom()
      .scaleExtent([.01, 2])
      .on('zoom', zoomed);
    svg.call(zoom);

    this.getAssets().subscribe(
      (json: any) => {
        const center = d3.geoCentroid(json);
        const {width, height} = svg.node().getBoundingClientRect();
        const offset: [number, number] = [width / 2, height / 2];
        const feature = topojson.feature(json, json.objects['DF Building - 2019 Q2 190627']);
        this.g.datum(feature).append('path').attr('fill', 'none').attr('stroke', 'black').attr('d', d => path(d));
      },
    );

    const aov = 53; // angle-of-view
    const radius = 100; // approximation of camera view depth
    const oradius = radius / Math.cos(aov / 4);

    const gradients = ['blue', 'red'];

    defs.selectAll('radialGradient').data(gradients).join('radialGradient')
      .attr('id', d => `${d}-gradient`)
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '50%')
      .attr('fx', '50%')
      .attr('fy', '50%')
      .call(s => s.append('stop').attr('offset', '0%').style('stop-color', d => d).style('stop-opacity', 1))
      .call(s => s.append('stop').attr('offset', '100%').style('stop-color', 'rgb(255,255,255)').style('stop-opacity', 0));


    let rotationMode;
    let adjx;
    let adjy;

    function dragstarted(d) {
      const {x, y} = d3.event;
      adjy = (d.radius + 10) * Math.sin(d.rot * Math.PI / 180);
      adjx = (d.radius + 10) * Math.cos(d.rot * Math.PI / 180);
      const el = d3.event.sourceEvent.target.parentElement;
      rotationMode = (el && el.classList.contains('handle')) ? 'rotation' : 'translation';
      d3.select(this).raise().select('circle').attr('fill', `url(#${'red-gradient'})`);
    }

    function dragged(d) {
      const {x, y} = d3.event;
      const s = d3.select(this);

      if (rotationMode === 'rotation') {
        const rot = Math.atan2(y - d.y + adjy, x - d.x + adjx) * 180 / Math.PI;
        s.attr('transform', `translate(${d.x},${d.y}) rotate(${d.rot = rot})`);
      } else {
        s.attr('transform', `translate(${d.x = x},${d.y = y}) rotate(${d.rot})`);
      }
    }

    function dragended(d) {
      d3.select(this).select('circle').attr('fill', `url(#${'blue-gradient'})`);
    }

    this.drag = d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);

    this.cameras$.pipe(takeUntil(this.destroyed$)).subscribe(cameras => {
      this.draw(cameras);
    });
  }

  draw(data: any[]) {
    const component = this;

    this.g.selectAll('g.circle').data(data).join(
      enter => enter.append('g').classed('circle', true).call(s => s.append('clipPath')
        .attr('id', d => `clip-${d.id}`)
        .call(ss => ss.append('polyline')
          .attr('fill', 'black')
          .attr('points', d => [
            [0, 0],
            [-d.radius / Math.cos(d.aov / 4) * Math.sin(d.aov / 4), d.radius / Math.cos(d.aov / 4) * Math.cos(d.aov / 4)].reverse(),
            [d.radius / Math.cos(d.aov / 4) * Math.sin(d.aov / 4), d.radius / Math.cos(d.aov / 4) * Math.cos(d.aov / 4)].reverse(),
            [0, 0]
          ].join(' '))
        )
      )
      .call(s => s.append('circle')
        .attr('clip-path', d => `url(#clip-${d.id})`)
        .attr('r', d => d.radius)
        .attr('fill', `url(#${'blue-gradient'})`)
        .on('click', function(d) {
          // reset other(0+) active circles

          component.g.selectAll('g.circle.active').call(removeHandle, component);
          d3.select(this.parentElement).call(drawHandle);
          console.log(d);

          d3.event.preventDefault();
          d3.event.stopPropagation();
          return false;
        })
      ),
      update => update,
      exit => exit.remove(),
    )
      .attr('transform', d => `translate(${d.x},${d.y}) rotate(${d.rot})`)
      .call(this.drag);

  }

  resetActiveCamera() {

  }

  getAssets() {
    return this.http.get('/assets/DF\ Building\ -\ 2019\ Q2\ 190627.json');
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('cameras' in changes) {
      this.cameras$.next(changes.cameras.currentValue);
    }
  }
}

function drawHandle(s) {
  // .attr('transform', `translate(${d.x = d3.event.x},${d.y = d3.event.y}) rotate(${d.rot})`);
  s.classed('active', true)
    .call(ss => ss.append('g').classed('handle', true)
      .call(sss => sss.append('circle').attr('cx', (d: any) => d.radius + 10).attr('r', 8))
    );
}

function removeHandle(s, component) {
  s.classed('active', false)
    .call(ss => ss.select('.handle').remove());
}
