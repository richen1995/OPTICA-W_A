import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../services/api.service';
import { refraction } from '../../../models/refraction.model';
import { medicalRecord } from '../../../models/medical-record.model';

@Component({
  selector: 'app-refraction',
  templateUrl: './refraction.component.html',
  styleUrl: './refraction.component.scss',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToastrModule],
})
export class RefractionComponent implements OnInit, OnChanges {
  formularioRefraction: FormGroup;

  @Input() id_medical_record!: number;
  @Input() medicalRecordJSON!: medicalRecord;
  @Input() hideSaveButton: boolean = false;

  constructor(private fb: FormBuilder, private apiService: ApiService, private toastr: ToastrService) {
    this.formularioRefraction = this.fb.group({
      id_refraction: [null],
      od: this.fb.group({
        ref_sphere_dynamic_od: [''],
        ref_cylinder_dynamic_od: [''],
        ref_axis_dynamic_od: [''],
        ref_sphere_static_od: [''],
        ref_cylinder_static_od: [''],
        ref_axis_static_od: [''],
      }),
      oi: this.fb.group({
        ref_sphere_dynamic_oi: [''],
        ref_cylinder_dynamic_oi: [''],
        ref_axis_dynamic_oi: [''],
        ref_sphere_static_oi: [''],
        ref_cylinder_static_oi: [''],
        ref_axis_static_oi: [''],
      })
    });
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['medicalRecordJSON']) {
      const record = this.medicalRecordJSON as any;
      if (record && record.refractions && record.refractions.length > 0) {
        this.patchForm(record.refractions[0]);
      } else {
        this.formularioRefraction.reset();
      }
    }
  }

  patchForm(data: refraction) {
    this.formularioRefraction.patchValue({
      id_refraction: data.id_refraction,
      od: {
        ref_sphere_dynamic_od: data.ref_sphere_dynamic_od,
        ref_cylinder_dynamic_od: data.ref_cylinder_dynamic_od,
        ref_axis_dynamic_od: data.ref_axis_dynamic_od,
        ref_sphere_static_od: data.ref_sphere_static_od,
        ref_cylinder_static_od: data.ref_cylinder_static_od,
        ref_axis_static_od: data.ref_axis_static_od,
      },
      oi: {
        ref_sphere_dynamic_oi: data.ref_sphere_dynamic_oi,
        ref_cylinder_dynamic_oi: data.ref_cylinder_dynamic_oi,
        ref_axis_dynamic_oi: data.ref_axis_dynamic_oi,
        ref_sphere_static_oi: data.ref_sphere_static_oi,
        ref_cylinder_static_oi: data.ref_cylinder_static_oi,
        ref_axis_static_oi: data.ref_axis_static_oi,
      }
    });
  }

  enviarFormulario() {
    if (this.formularioRefraction.valid) {
      const formValue = this.formularioRefraction.value;
      const newRefraction: refraction = {
        ref_sphere_dynamic_od: formValue.od.ref_sphere_dynamic_od,
        ref_cylinder_dynamic_od: formValue.od.ref_cylinder_dynamic_od,
        ref_axis_dynamic_od: formValue.od.ref_axis_dynamic_od,
        ref_sphere_dynamic_oi: formValue.oi.ref_sphere_dynamic_oi,
        ref_cylinder_dynamic_oi: formValue.oi.ref_cylinder_dynamic_oi,
        ref_axis_dynamic_oi: formValue.oi.ref_axis_dynamic_oi,
        ref_sphere_static_od: formValue.od.ref_sphere_static_od,
        ref_cylinder_static_od: formValue.od.ref_cylinder_static_od,
        ref_axis_static_od: formValue.od.ref_axis_static_od,
        ref_sphere_static_oi: formValue.oi.ref_sphere_static_oi,
        ref_cylinder_static_oi: formValue.oi.ref_cylinder_static_oi,
        ref_axis_static_oi: formValue.oi.ref_axis_static_oi,
        id_medical_record: this.medicalRecordJSON?.id_medical_record ?? this.id_medical_record,
        f_creation: new Date().toISOString(),
        f_update: new Date().toISOString()
      };

      if (formValue.id_refraction) {
        newRefraction.id_refraction = formValue.id_refraction;
        this.apiService.updateRefraction(newRefraction).subscribe({
          next: () => {
            this.toastr.success('Refracción actualizada exitosamente');
          },
          error: (err) => {
            console.error(err);
            this.toastr.error('Error al actualizar refracción');
          }
        });
      } else {
        this.apiService.createRefraction(newRefraction).subscribe({
          next: (res) => {
            this.formularioRefraction.patchValue({ id_refraction: res.id_refraction });
            this.toastr.success('Refracción guardada exitosamente');
          },
          error: (err) => {
            console.error(err);
            this.toastr.error('Error al guardar refracción');
          }
        });
      }
    }
  }
}

