import { AbstractControl } from '@angular/forms';

export function sameValueValidator(firstControl: AbstractControl) {
  return (secondControl: AbstractControl) => {
    const sameValue = firstControl.value === secondControl.value;
    if (sameValue) {
      return null;
    }
    return { sameValue: 'Passwords do not match.'};
  };
}
