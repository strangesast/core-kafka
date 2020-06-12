import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-camera-viewer-page',
  template: `
    <app-page-title>
      <a [routerLink]="['/cameras']">Camera Viewer</a>
    </app-page-title>
    <app-camera-viewer [cameras]="cameras"></app-camera-viewer>
    <app-camera-list (create)="cameras = cameras.concat($event)" [cameras]="cameras"></app-camera-list>
  `,
  styleUrls: ['./camera-viewer-page.component.scss']
})
export class CameraViewerPageComponent implements OnInit {
  cameras = [
    {id: 0, name: 'Camera 1', aov: 53, radius: 100, x: 80, y: 80, rot: 0},
    {id: 1, name: 'Camera 2', aov: 53, radius: 100, x: 280, y: 280, rot: 90},
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
