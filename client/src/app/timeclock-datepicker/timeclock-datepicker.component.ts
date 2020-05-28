import { Input, Output, EventEmitter, Component, OnInit, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-timeclock-datepicker',
  template: `
  <button mat-icon-button (click)="decrement()"><mat-icon>chevron_left</mat-icon></button>
  <button (click)="picker.open()" mat-button>{{ value | date }}</button>
  <button mat-icon-button (click)="increment()"><mat-icon>chevron_right</mat-icon></button>
  <mat-datepicker #picker></mat-datepicker>
  <input matInput [matDatepicker]="picker" placeholder="Choose a date" [(ngModel)]="value">
  `,
  styleUrls: ['./timeclock-datepicker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimeclockDatepickerComponent),
      multi: true
    }
  ]
})
export class TimeclockDatepickerComponent implements OnInit, ControlValueAccessor {
  value = new Date();

  propagateChange = (_: any) => {};

  constructor() { }

  ngOnInit(): void {
  }

  writeValue(value: Date) {
    this.value = value;
  }

  registerOnChange(fn) {
    this.propagateChange = fn;
  }

  registerOnTouched() {}

  setValue(value) {
    this.value = value;
    this.propagateChange(value);
  }

  decrement() {
    const value = new Date(this.value);
    value.setDate(value.getDate() - 1);
    this.value = value;
    this.propagateChange(this.value);
  }

  increment() {
    const value = new Date(this.value);
    value.setDate(value.getDate() + 1);
    this.value = value;
    this.propagateChange(this.value);
  }
}
