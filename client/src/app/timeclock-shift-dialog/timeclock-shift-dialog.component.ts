import { Inject, Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

interface DialogData {
  employee: {name: string};
  start: Date;
  end: Date;
  duration: number;
}


@Component({
  selector: 'app-timeclock-shift-dialog',
  template: `
  <span>Name:</span>
  <span>{{data?.employee.name}}</span>
  <span>Start:</span>
  <span>{{data?.start | date:'short'}}</span>
  <span>End:</span>
  <span>{{data?.end | date:'short'}}</span>
  <span>Duration:</span>
  <span>{{data?.duration | duration}}</span>
  `,
  styleUrls: ['./timeclock-shift-dialog.component.scss']
})
export class TimeclockShiftDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<TimeclockShiftDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}
