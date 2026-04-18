import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../services/api.service';
import { lensometry } from '../../../models/lensometry.model';
import { medicalRecord } from '../../../models/medical-record.model';

@Component({
  selector: 'app-lensometry',
  templateUrl: './lensometry.component.html',
  styleUrl: './lensometry.component.scss',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToastrModule],
})
export class LensometryComponent implements OnInit, OnChanges { 
  formularioLensometry: FormGroup;
  lensometrys: lensometry[] = [];


  @Input() id_medical_record!: number; // Input para recibir un mensaje desde el componente padre
  @Input() medicalRecordJSON!: medicalRecord;
  @Input() hideSaveButton: boolean = false; // Nuevo input para ocultar botón

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['medicalRecordJSON']) {
      const record = this.medicalRecordJSON as any;
      if (record && record.lensometries && record.lensometries.length > 0) {
        this.patchForm(record.lensometries[0]);
      } else {
        this.formularioLensometry.reset();
      }
    }
  }

  patchForm(data: lensometry) {
    this.formularioLensometry.patchValue({
      id_lensometry: data.id_lensometry,
      od: {
        lensometry_od_add: data.lensometry_od_add,
        lensometry_av_vl_od: data.lensometry_av_vl_od,
        lensometry_av_vp_od: data.lensometry_av_vp_od
      },
      oi: {
        lensometry_oi_add: data.lensometry_oi_add,
        lensometry_av_vl_oi: data.lensometry_av_vl_oi,
        lensometry_av_vp_oi: data.lensometry_av_vp_oi
      },
      ao: {
        lensometry_ao_add: data.lensometry_ao_add,
        lensometry_av_vl_ao: data.lensometry_av_vl_ao,
        lensometry_av_vp_ao: data.lensometry_av_vp_ao
      },
      lens_type: data.lens_type,
      lens_material: data.lens_material,
      filter: data.filter,
      time_using_rx: data.time_using_rx,
      observation: data.observation,
      f_creation: data.f_creation,
      f_update: data.f_update
    });
  }

  constructor(private fb: FormBuilder, private apiService: ApiService, private toastr: ToastrService) {
    this.formularioLensometry = this.fb.group({
      id_lensometry: [null],
      od: this.fb.group({
        lensometry_od_add: [''],
        lensometry_av_vl_od: [''],
        lensometry_av_vp_od: ['']
      }),
      oi: this.fb.group({
        lensometry_oi_add: [''],
        lensometry_av_vl_oi: [''],
        lensometry_av_vp_oi: ['']
      }),
      ao: this.fb.group({
        lensometry_ao_add: [''],
        lensometry_av_vl_ao: [''],
        lensometry_av_vp_ao: ['']
      }),
      lens_type: [''],
      lens_material: [''],
      filter: [''],
      time_using_rx: [''],
      observation: [''],
    });
  }

  enviarFormulario() {
    if(this.formularioLensometry.valid) {
      const formLensometryValue = this.formularioLensometry.value;
      const newLensometry: lensometry = {
        lensometry_od_add: formLensometryValue.od.lensometry_od_add,
        lensometry_av_vl_od: formLensometryValue.od.lensometry_av_vl_od,
        lensometry_av_vp_od: formLensometryValue.od.lensometry_av_vp_od,
        lensometry_oi_add: formLensometryValue.oi.lensometry_oi_add,
        lensometry_av_vl_oi: formLensometryValue.oi.lensometry_av_vl_oi,
        lensometry_av_vp_oi: formLensometryValue.oi.lensometry_av_vp_oi,
        lensometry_ao_add: formLensometryValue.ao.lensometry_ao_add,
        lensometry_av_vl_ao: formLensometryValue.ao.lensometry_av_vl_ao,
        lensometry_av_vp_ao: formLensometryValue.ao.lensometry_av_vp_ao,
        lens_type: formLensometryValue.lens_type,
        lens_material: formLensometryValue.lens_material,
        filter: formLensometryValue.filter,
        time_using_rx: formLensometryValue.time_using_rx,
        observation: formLensometryValue.observation,
        id_medical_record: this.medicalRecordJSON?.id_medical_record ?? 1,

        //id_medical_record: this.id_medical_record, // Aquí deberías asignar el ID del registro médico correspondiente
        f_creation: new Date().toISOString(),
        f_update: new Date().toISOString()
      }

      console.log("Datos de Lensometría a enviar: ", newLensometry);

      if(formLensometryValue.id_lensometry){
          newLensometry.id_lensometry = formLensometryValue.id_lensometry;
          this.apiService.updateLensometry(newLensometry).subscribe({
            next: (response) => {
              this.toastr.success('Lensometría actualizada exitosamente', 'Éxito', { positionClass: 'toast-top-right' });
            },
            error: (error) => {
              this.toastr.error('Error al actualizar la lensometría');  
              console.error(error);
            }
          });
      }else{

        this.apiService.createLensometry(newLensometry).subscribe({
          next: (response) => {
            this.lensometrys.push(response);
            //this.formularioLensometry.reset();
            this.toastr.success('Lensometría creada exitosamente', 'Éxito', { positionClass: 'toast-top-right' });
            console.log("Respuesta del Bakend de LENSOMETRÍA: ", response);
            formLensometryValue.id_lensometry = response.id_lensometry; // Asignar el ID al formulario
            this.formularioLensometry.patchValue({ id_lensometry: response.id_lensometry });
 
          },
          error: (error) => {
            this.toastr.error('Error al crear la lensometría');
            console.error(error);
          }
        })
      }
    } else{
      // Recorre los controles y muestra los errores
      Object.keys(this.formularioLensometry.controls).forEach(key => {
        const control = this.formularioLensometry.get(key);
        if (control && control.invalid) {
          console.log(`Campo con error: ${key}`, control.errors);
        }
      });
      console.log('Formulario inválido');
      this.formularioLensometry.markAllAsTouched(); // Marca los  s como tocados para mostrar errores
      this.toastr.error('Ocurrió un error', 'Error',{ positionClass: 'toast-top-right' });
    }

  }

  // Para mostrar errores más fácilmente en plantilla
  campoInvalido(grupo: string, control: string) {
    const formGroup = this.formularioLensometry.get(grupo) as FormGroup;
    const campo = formGroup.get(control);
    return campo?.invalid && campo?.touched;
  }

}
