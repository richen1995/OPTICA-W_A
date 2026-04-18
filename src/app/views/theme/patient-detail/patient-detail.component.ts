import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
//import { PatientInfoComponent } from './patient-info/patient-info.component';
import { HistoryListComponent } from './history-list/history-list.component';
import { ApiService } from '../../../services/api.service';
import { fullpersondata } from '../../../models/fullpersondata.model';
import { fullmedicaldata, MedicalRecordExtended } from '../../../models/fullmedicaldata.model';
import { medicalRecord } from '../../../models/medical-record.model';

@Component({
  selector: 'app-patient-detail',
  templateUrl: './patient-detail.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HistoryListComponent, MatProgressSpinnerModule],
})
export class PatientDetailComponent implements OnInit {

  objFullPersonData?:fullpersondata;
  objFullMedicalData?: fullmedicaldata[] = [];
  objMedicalRecords?: medicalRecord[] = [];
  objMedicalRecordsExtended?: MedicalRecordExtended[] = [];
  isLoading: boolean = true;

  constructor(private pesonaService:ApiService) { }
  ngOnInit(): void {
    this.searchHistory();
    //throw new Error('Method not implemented.');
  }

  searchHistory() {
    this.isLoading = true;
   
/*     this.pesonaService.getFullPersonData(44).subscribe({
      next: (data) => {
        this.objFullPersonData = data;
        console.log('Json que viene de FullPersonData: ', this.objFullPersonData);
      },
      error: (error) => {
        console.error('Error al obtener los datos completos de la persona:', error);
      }

    }); */

    this.pesonaService.getMedicalRecords().subscribe({
      next: (data) => {
        this.objMedicalRecords = Array.isArray(data) ? data : [data] ;
        console.log('Json que viene de FullMedicalRecordData: ', this.objMedicalRecords);
        //this.objFullMedicalData = data;
        
      },
      error: (error) => {
        console.error('Error al obtener los datos completos de la historia clínica:', error);
      }
    });

    this.pesonaService.getFullMedicalRecordDataTotal().subscribe({
      next: (data) => {
        this.objMedicalRecordsExtended = Array.isArray(data) ? data : [data] ;
        console.log('Json que viene de FullMedicalRecordData por PersonId: ', this.objFullMedicalData);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al obtener los datos completos de la historia clínica por PersonId:', error);
        this.isLoading = false;
      }
    });
      
  }
}
