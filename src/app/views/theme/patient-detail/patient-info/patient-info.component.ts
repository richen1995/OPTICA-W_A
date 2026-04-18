import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-patient-info',
  templateUrl: './patient-info.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class PatientInfoComponent implements OnInit {
  constructor() { }
  ngOnInit(): void {
    //throw new Error('Method not implemented.');
  }

}
