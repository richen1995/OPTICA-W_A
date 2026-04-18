import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../services/api.service';
import { rx } from '../../../models/rx.model';
import { medicalRecord } from '../../../models/medical-record.model';

@Component({
  selector: 'app-rx',
  templateUrl: './rx.component.html',
  styleUrl: './rx.component.scss',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToastrModule],
})
export class RxComponent implements OnInit, OnChanges{

    formularioRx:FormGroup;
    rxs: rx[] = [];

    @Input() 
    id_medical_record!: number; 
    @Input() medicalRecordJSON!: medicalRecord;
    @Input() hideSaveButton: boolean = false; // Nuevo input para ocultar botón

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['medicalRecordJSON']) {
      const record = this.medicalRecordJSON as any;
      if (record && record.rx && record.rx.length > 0) {
        this.patchForm(record.rx[0]);
      } else {
        this.formularioRx.reset();
      }
    }
  }

  patchForm(data: rx) {
    this.formularioRx.patchValue({
      id_rx: data.id_rx,
      od_rx: {
        rx_desc_od: data.rx_desc_od,
        rx_av_vl_od: data.rx_av_vl_od,
        rx_add_od: data.rx_add_od,
        rx_av_vp_od: data.rx_av_vp_od,
        rx_dnp_od: data.rx_dnp_od,
      },
      oi_rx: {
        rx_desc_oi: data.rx_desc_oi,
        rx_av_vl_oi: data.rx_av_vl_oi,
        rx_add_oi: data.rx_add_oi,
        rx_av_vp_oi: data.rx_av_vp_oi,
        rx_dnp_oi: data.rx_dnp_oi,
      },
      observations: data.observations,
      treatment: data.treatment,
      f_creation: data.f_creation,
      f_update: data.f_update
    });
  }

  ngOnInit(): void {}

  constructor(private fb: FormBuilder, private apiService: ApiService, private toastr: ToastrService) {
    this.formularioRx = this.fb.group({
      id_rx: [null], // <--- agrega esto
      od_rx: this.fb.group({
        rx_desc_od: [''],
        rx_av_vl_od: [''],
        rx_add_od: [''],
        rx_av_vp_od: [''],
        rx_dnp_od: [''],
      }),
      oi_rx: this.fb.group({
        rx_desc_oi: [''],
        rx_av_vl_oi: [''],
        rx_add_oi: [''],
        rx_av_vp_oi: [''],
        rx_dnp_oi: [''],
      }),
      observations: [''],
      treatment: [''],
    });
  }

  enviarFormulario() {
    if(this.formularioRx.valid) {
      const formRxValue = this.formularioRx.value;
      const newRx: rx = {
        rx_desc_od: formRxValue.od_rx.rx_desc_od,
        rx_av_vl_od: formRxValue.od_rx.rx_av_vl_od,
        rx_add_od: formRxValue.od_rx.rx_add_od,
        rx_av_vp_od: formRxValue.od_rx.rx_av_vp_od,
        rx_dnp_od: formRxValue.od_rx.rx_dnp_od,

        rx_desc_oi: formRxValue.oi_rx.rx_desc_oi,
        rx_av_vl_oi: formRxValue.oi_rx.rx_av_vl_oi,
        rx_add_oi: formRxValue.oi_rx.rx_add_oi,
        rx_av_vp_oi: formRxValue.oi_rx.rx_av_vp_oi,
        rx_dnp_oi: formRxValue.oi_rx.rx_dnp_oi,

        observations: formRxValue.observations,
        treatment: formRxValue.treatment,

        id_medical_record: this.medicalRecordJSON?.id_medical_record ?? 1,
        f_creation: new Date().toISOString(), // Fecha actual en formato ISO
        f_update: new Date().toISOString() // Fecha actual en formato ISO
      }

      if(formRxValue.id_rx){
        newRx.id_rx = formRxValue.id_rx; // Asignar el ID para la actualización
        this.apiService.updateRx(newRx).subscribe({
          next: (rx) => {
            this.toastr.success('Rx actualizada con éxito', 'Éxito');
          },
          error: (err) => {
            console.error('Error al actualizar Rx:', err);
            this.toastr.error('Error al actualizar Rx', 'Error');
          }
        })
      }else{
      
        this.apiService.createRx(newRx).subscribe({
          next: (rx) => {
            this.toastr.success('Rx creada con éxito', 'Éxito');
            this.rxs.push(rx);
            //this.formularioRx.reset();
            formRxValue.id_rx = rx.id_rx; // Asignar el ID al formulario
            this.formularioRx.patchValue({ id_rx: rx.id_rx });      
          },
          error: (err) => {
            console.error('Error al crear Rx:', err);
            this.toastr.error('Error al crear Rx', 'Error');
          }
        })
      }
    }else{
        // Recorre los controles y muestra los errores
        Object.keys(this.formularioRx.controls).forEach(key => {
          const control = this.formularioRx.get(key);
          if (control && control.invalid) {
            console.log(`Campo con error: ${key}`, control.errors);
          }
        });
        console.log('Formulario inválido');
        this.formularioRx.markAllAsTouched(); // Marca los  s como tocados para mostrar errores
        this.toastr.error('Ocurrió un error', 'Error',{ positionClass: 'toast-top-right' });
    }    
  }

  // Para mostrar errores más fácilmente en plantilla
  campoInvalido(grupo: string, control: string) {
      const formGroup = this.formularioRx.get(grupo) as FormGroup;
      const campo = formGroup.get(control);
      return campo?.invalid && campo?.touched;  
  } 
}

