import { HostListener, ViewChild, Component, ElementRef, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { group } from 'd3-array';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

@Component({
  selector: 'app-map-viewer',
  template: `<svg #svg></svg>`,
  styles: [`
  :host {
    display: block;
  }
  svg {
    width: 100%;
    height: 100%;
  }
  `],
  styleUrls: ['./map-viewer.component.scss']
})
export class MapViewerComponent implements AfterViewInit {
  @ViewChild('svg') svg: ElementRef;

  path;
  width: number;
  height: number;

  lastClicked = '';

  constructor(public http: HttpClient) {}

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    const { width, height } = this.svg.nativeElement.getBoundingClientRect();
    this.width = width;
    this.height = height;
  }

  ngAfterViewInit(): void {
    const svg = d3.select(this.svg.nativeElement);
    const path = d3.geoPath().projection(d3.geoIdentity().reflectY(true));
    this.path = path;

    const g = svg.append('g');
    const zoomed = () => {
      g.attr('transform', d3.event.transform);
    };
    const zoom = d3.zoom()
      .scaleExtent([.01, 2])
      .on('zoom', zoomed);

    svg.call(zoom);

    const gBuilding = g.append('g').classed('building', true).call(s => s.append('path'));

    this.getAssets().subscribe(
      (json: any) => {
        /* nav changes element size slightly after render, so calculate a bit late */
        const {width, height} = svg.node().getBoundingClientRect();
        this.width = width;
        this.height = height;

        const center = d3.geoCentroid(json);
        const offset: [number, number] = [this.width / 2, this.height / 2];

        const buildingFeature = topojson.feature(json, json.objects.building);

        const buildingZoom = this.calculateZoomTransform(buildingFeature);

        gBuilding.datum(buildingFeature).select('path').attr('fill', 'none').attr('stroke', 'black').attr('d', path);

        console.log(json);

        const data = Object.entries(json.objects).filter(d => d[0] !== 'cameras' && d[0] !== 'building');
        //    .map(([id, feat]) => {
        //      const o = topojson.feature(json, feat);
        //      const [[ox0, oy0], [ox1, oy1]] = path.bounds(o);
        //      const [ow, oh] = [ox1 - ox0, oy1 - oy0];
        //      return [id, o, {x: ox0, y: oy0, width: ow, height: oh}];
        //    });

        g.selectAll('g.object').data(data, d => d[0]).join(
          s => s.append('g').classed('object', true)
            .call(ss => {
              ss.append('path')
                .attr('fill', 'none')
                .attr('stroke', 'black');
              ss.append('rect').attr('fill', 'transparent');
              ss.append('circle').attr('fill', 'green');
            })
        )
        .each(function(d: any, i: number) {
          const s = d3.select(this);
          const f = topojson.feature(json, d[1]);
          const [[x, y], [x1, y1]] = path.bounds(f);
          const [w, h] = [x1 - x, y1 - y];

          const [cx, cy] = path.centroid(f);

          s.select('path').datum(f).attr('d', (dd: any) => path(dd));
          s.select('circle')
            .attr('cx', x + w / 2)
            .attr('cy', y + h / 2)
            .attr('r', 20)
            .attr('stroke', 'black')
            .attr('fill', ['green', 'red', 'yellow', 'blue'][i % 4]);
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
            this.lastClicked = '';
            svg.transition().call(zoom.transform, this.calculateZoomTransform(buildingFeature));
          } else {
            this.lastClicked = d[0];
            svg.transition().call(zoom.transform, this.calculateZoomTransform(topojson.feature(json, d[1]), false));
          }
        });

        svg.call(zoom.transform, buildingZoom);
      },
    );
  }
  calculateZoomTransform(feature, scale = true) {
    const [[x0, y0], [x1, y1]] = this.path.bounds(feature);

    let z = d3.zoomIdentity.translate(this.width / 2, this.height / 2);
    if (scale) {
      z = z.scale(Math.min(8, 0.9 / Math.max((x1 - x0) / this.width, (y1 - y0) / this.height)));
    }
    z = z.translate(-(x0 + x1) / 2, -(y0 + y1) / 2);

    return z;
  }

  getAssets() {
    return this.http.get('/assets/df_building.json');
  }

}
