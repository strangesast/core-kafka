import { Input, Directive } from '@angular/core';
import { AsyncValidator, NG_ASYNC_VALIDATORS, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable, never, of } from 'rxjs';
import { filter, delay, pluck, map, tap, finalize } from 'rxjs/operators';


@Directive({
  selector: '[appPropertyValidator]',
  providers: [{provide: NG_ASYNC_VALIDATORS, useExisting: PropertyValidatorDirective, multi: true}],
})
export class PropertyValidatorDirective implements AsyncValidator {
  @Input('appPropertyValidator')
  value;

  constructor(public http: HttpClient) { }

  validate(control: AbstractControl): Observable<ValidationErrors|null> {
    const value = control.value;
    return value ? this.http.get('/api/check', {params: {[this.value]: value}}).pipe(
      pluck(this.value),
      map(unavailable => unavailable ? {custom: `${this.value} is unavailable.`} : null),
    ) : never();
  }
}
