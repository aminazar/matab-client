import {Component, Inject} from '@angular/core';
import {MdDialogRef, MD_DIALOG_DATA} from "@angular/material";

@Component({
  selector: 'app-modal-dialog',
  templateUrl: './modal-dialog.component.html',
  styleUrls: ['./modal-dialog.component.css']
})
export class ModalDialogComponent {
  constructor(public dialogRef: MdDialogRef<ModalDialogComponent>,@Inject(MD_DIALOG_DATA) public data: any) { }
  close(val) {
    this.dialogRef.close(val);
  }

}
