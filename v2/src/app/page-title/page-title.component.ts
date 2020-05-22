import {
  AfterViewInit,
  AfterViewChecked,
  ApplicationRef,
  Component,
  ComponentFactoryResolver,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CdkPortal, DomPortalOutlet, TemplatePortal, PortalHost } from '@angular/cdk/portal';


@Component({
  selector: 'app-page-title',
  template: `
  <ng-template #portal="cdkPortal" cdkPortal>
    <ng-content></ng-content>
  </ng-template>
  `,
  styles: [],
})
export class PageTitleComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {
  private portalHost: PortalHost;

  @ViewChild('portal')
  portal: TemplatePortal<any>;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector,
    private appRef: ApplicationRef
  ) {}

  ngOnInit(): void {
    // Create a portalHost from a DOM element
  }

  ngAfterViewInit() {
  }
  ngAfterViewChecked() {
    const element = document.getElementById('cdkPortalOutlet');
    if (!this.portalHost?.hasAttached()) {
      this.portalHost = new DomPortalOutlet(
        element,
        this.componentFactoryResolver,
        this.appRef,
        this.injector,
      );
      this.portalHost.attach(this.portal);
    }
  }

  ngOnDestroy(): void {
    this.portalHost.detach();
  }

}
