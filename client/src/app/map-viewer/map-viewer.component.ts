import { ViewChild, Component, ElementRef, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  constructor(public http: HttpClient) {}

  ngAfterViewInit(): void {
    const s = d3.select(this.svg.nativeElement);
    const path = d3.geoPath().projection(null);
    const g = s.append('g');
    const zoomed = () => {
      g.selectAll('path') // To prevent stroke width from scaling
        .attr('transform', d3.event.transform);
    };
    const zoom = d3.zoom()
      .scaleExtent([.01, 2])
      .on('zoom', zoomed);
    s.call(zoom);
    this.getAssets().subscribe(
      (json: any) => {
        const center = d3.geoCentroid(json);
        const {width, height} = s.node().getBoundingClientRect();
        const offset: [number, number] = [width / 2, height / 2];
        const feature = topojson.feature(json, json.objects['DF Building - 2019 Q2 190627']);
        g.datum(feature).append('path').attr('fill', 'none').attr('stroke', 'black').attr('d', d => path(d));
      },
    );
  }

  getAssets() {
    return this.http.get('/assets/DF\ Building\ -\ 2019\ Q2\ 190627.json');
  }

}
