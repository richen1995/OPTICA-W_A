import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { fullmedicaldata, MedicalRecordExtended } from '../../../../models/fullmedicaldata.model';
import { ApiService } from '../../../../services/api.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-history-detail',
  standalone: true,
  templateUrl: './history-detail.component.html',
  styleUrls: ['./history-detail.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatButtonModule, MatCardModule, MatExpansionModule]
})
export class HistoryDetailComponent implements OnInit {

  @Input() arrayMedicalRecordsExtended?: MedicalRecordExtended[] = [];
  @Input() id_record?: number;
  objfullmedicaldata?: fullmedicaldata;
  objMedicalRecordsExtended?: MedicalRecordExtended;

  isMobile = false;
  

  constructor(private personaService: ApiService, private router: Router) { }
  ngOnInit(): void {}

  editHistory() {
    if (this.id_record) {
      this.router.navigate(['/theme/patients'], { queryParams: { id_record: this.id_record } });
    }
  }

  calcularEdad(fechaNacimiento: string | undefined): number | string {
    if (!fechaNacimiento) return 'N/A';
    const birthDate = new Date(fechaNacimiento);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  ngOnChanges(changes:SimpleChanges): void{
    if(changes['id_record']){
      console.log('id de historia selecconada: ',this.id_record)
      if(this.id_record){
        this.searchMedicalRecordById(this.id_record);
      }
    }
  }

  searchMedicalRecordById(id: number){

    this.personaService.getMedicalRecordDataExtended(id).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.objMedicalRecordsExtended = data[0];

        } else {
          this.objMedicalRecordsExtended = undefined;
        }
        console.log('___Json que viene de MedicalRecordById: ', data);
        console.log('___Json que viene de MedicalRecordById: person', this.objMedicalRecordsExtended?.person);
        console.log('__MedicalRecordById: person_identificacion', this.objMedicalRecordsExtended?.person.identification);
      },
      error: (error) => {
        console.error('Error al obtener los datos de la historia clínica:', error);
      }
    });
  }

  //IMPRIMIR
  printRxFinal() {
    const printContents = document.getElementById('rx-final-print')?.innerHTML;

    if (!printContents) return;

    const popupWin = window.open('', '_blank', 'width=900,height=650');

    popupWin!.document.open();
    popupWin!.document.write(`
      <html>
        <head>
          <title></title>

          <!-- Bootstrap -->
          <link rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css">

          <style>
            @media print {
              @page {
                size: auto;
                margin: 0; /* Esto elimina los encabezados del navegador (about:blank, fecha, etc) */
              }
              body {
                margin: 1.5cm; /* Margen para que el contenido no pegue al papel */
              }
            }

            body {
              font-family: Arial, sans-serif;
              padding: 0;
            }

            .print-header {
              position: relative;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 5px; /* Reducido espacio debajo de la línea */
              border-bottom: 2px solid #000080;
              padding-bottom: 0px; /* Reducido espacio entre texto y línea */
              min-height: 55px; /* Reducido tamaño total del bloque */
            }

            .print-header img {
              position: absolute;
              left: 0;
              top: 0;
              width: 85px; /* Ligeramente más pequeño */
            }

            .print-header-text {
              text-align: center;
            }

            .print-date {
              position: absolute;
              right: 0;
              top: 0;
              font-size: 11px;
              color: #555;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              table-layout: fixed; 
              margin-top: 5px; /* Reducido */
            }

            th, td {
              border: 1px solid #000;
              padding: 6px;
              font-size: 12px;
              text-align: center;
            }

            th {
              background-color: #f1f5f9;
            }

            h4 {
              margin: 0;
              color: #000080;
              font-weight: bold;
              font-size: 22px;
            }
          </style>
        </head>

        <body onload="window.print();" onafterprint="window.close();">
          <div class="print-header">
            <div class="print-date">Fecha: ${new Date().toLocaleDateString()}</div>
            <img src="assets/images/logo_optica_w.png" alt="Óptica Logo">
            <div class="print-header-text">
              <h4>OR NISSI VISIÓN</h4>
              <p style="margin: 0; font-size: 14px;">Claridad para tu vida</p>
            </div>
          </div>

          <!-- Datos del Paciente -->
          <div style="margin-bottom: 10px; font-size: 12px; border: 1px solid #eee; padding: 5px 10px; border-radius: 5px;">
            <div class="row">
              <div class="col-8"><strong>Paciente:</strong> ${this.objMedicalRecordsExtended?.person.first_name} ${this.objMedicalRecordsExtended?.person.last_name}</div>
              <div class="col-4"><strong>Cédula:</strong> ${this.objMedicalRecordsExtended?.person.identification}</div>
            </div>
            <div class="row">
              <div class="col-8"><strong>Ocupación:</strong> ${this.objMedicalRecordsExtended?.person.ocupation || this.objMedicalRecordsExtended?.person.charge || 'N/A'}</div>
              <div class="col-4"><strong>Teléfono:</strong> ${this.objMedicalRecordsExtended?.person.phone}</div>
            </div>
          </div>

          <h5 style="text-align: center; margin-bottom: 5px; font-weight: bold; color: #000080; font-size: 16px;">RX FINAL</h5>
          ${printContents}
        </body>
      </html>
    `);

    popupWin!.document.close();
  }
}
