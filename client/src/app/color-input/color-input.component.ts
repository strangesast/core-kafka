import { HostBinding, forwardRef, Component, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-color-input',
  template: `
    <input id="input" [disabled]="disabled" [value]="value" (change)="setValue(input.value)" #input type="color"/>
    <button [disabled]="disabled" mat-icon-button><label for="input"></label></button>
  `,
  styleUrls: ['./color-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ColorInputComponent),
      multi: true
    },
  ],
})
export class ColorInputComponent implements OnInit, ControlValueAccessor {
  @HostBinding('style.--color')
  value = '';

  disabled = false;

  propagateChange = (_: any) => {};

  writeValue(value: string) {
    this.value = value;
  }

  registerOnChange(fn) {
    this.propagateChange = fn;
  }

  registerOnTouched() {}

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }

  setValue(value) {
    this.value = value;
    this.propagateChange(value);
  }

  constructor() { }

  ngOnInit(): void {
  }

}
