import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { visualAcuity } from  '../../../models/visual-acuity.model';
import { medicalRecord } from '../../../models/medical-record.model';

@Component({
  selector: 'app-visual-acuity',
  templateUrl: './visual-acuity.component.html',
  styleUrl: './visual-acuity.component.scss',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToastrModule],
})
export class VisualAcuityComponent implements OnInit, OnChanges{
    formularioVisualAcuity: FormGroup;
    visualAcuitys: visualAcuity[] = [];

    @Input() 
    id_medical_record!: number; 
    @Input() medicalRecordJSON!: medicalRecord;
    @Input() hideSaveButton: boolean = false; 

    ngOnChanges(changes: SimpleChanges): void {
      if (changes['medicalRecordJSON']) {
        const record = this.medicalRecordJSON as any;
        if (record && record.visualAcuities && record.visualAcuities.length > 0) {
          this.patchForm(record.visualAcuities[0]);
        } else {
          this.formularioVisualAcuity.reset();
        }
      }
    }

    patchForm(data: visualAcuity) {
      this.formularioVisualAcuity.patchValue({
        id_visual_acuity: data.id_visual_acuity,
        od_av: {
          visual_acuity_vl_sc_od: data.visual_acuity_vl_sc_od,
          visual_acuity_vl_cc_od: data.visual_acuity_vl_cc_od,
          visual_acuity_vp_sc_od: data.visual_acuity_vp_sc_od,
          visual_acuity_vp_cc_od: data.visual_acuity_vp_cc_od,
          ph_od: data.ph_od
        },
        oi_av: {
          visual_acuity_vl_sc_oi: data.visual_acuity_vl_sc_oi,
          visual_acuity_vl_cc_oi: data.visual_acuity_vl_cc_oi,
          visual_acuity_vp_sc_oi: data.visual_acuity_vp_sc_oi,
          visual_acuity_vp_cc_oi: data.visual_acuity_vp_cc_oi,
          ph_oi: data.ph_oi
        },
        ao_av: {
          visual_acuity_vl_sc_ao: data.visual_acuity_vl_sc_ao,
          visual_acuity_vl_cc_ao: data.visual_acuity_vl_cc_ao,
          visual_acuity_vp_sc_ao: data.visual_acuity_vp_sc_ao,
          visual_acuity_vp_cc_ao: data.visual_acuity_vp_cc_ao,
          ph_ao: data.ph_ao
        },
        distancia_vl: data.distancia_vl,
        distancia_vp: data.distancia_vp,
        dominance: data.dominance,
        f_creation: data.f_creation,
        f_update: data.f_update
      });
    }

    ngOnInit(): void {}

    constructor(private fb: FormBuilder, private apiService: ApiService, private toastr: ToastrService) {
      this.formularioVisualAcuity = this.fb.group({
        id_visual_acuity: [null], 
        od_av: this.fb.group({
          visual_acuity_vl_sc_od: [''],
          visual_acuity_vl_cc_od: [''],
          visual_acuity_vp_sc_od: [''],
          visual_acuity_vp_cc_od: [''],
          ph_od: ['']
        }),
        oi_av: this.fb.group({
          visual_acuity_vl_sc_oi: [''],
          visual_acuity_vl_cc_oi: [''],
          visual_acuity_vp_sc_oi: [''],
          visual_acuity_vp_cc_oi: [''],
          ph_oi: ['']
        }),
        ao_av: this.fb.group({
          visual_acuity_vl_sc_ao: [''],
          visual_acuity_vl_cc_ao: [''],
          visual_acuity_vp_sc_ao: [''],
          visual_acuity_vp_cc_ao: [''],
          ph_ao: ['']
        }),
        distancia_vl: ['6m'],
        distancia_vp: ['40cm'],
        dominance: [''],
      });
    }

    enviarFormulario() {
      if(this.formularioVisualAcuity.valid) {
        const fv = this.formularioVisualAcuity.value;
        const newVisualAcuity: visualAcuity = {
          visual_acuity_vl_sc_od: fv.od_av.visual_acuity_vl_sc_od,
          visual_acuity_vl_cc_od: fv.od_av.visual_acuity_vl_cc_od,
          visual_acuity_vl_sc_oi: fv.oi_av.visual_acuity_vl_sc_oi,
          visual_acuity_vl_cc_oi: fv.oi_av.visual_acuity_vl_cc_oi,
          visual_acuity_vl_sc_ao: fv.ao_av.visual_acuity_vl_sc_ao,
          visual_acuity_vl_cc_ao: fv.ao_av.visual_acuity_vl_cc_ao,
          distancia_vl: fv.distancia_vl,

          visual_acuity_vp_sc_od: fv.od_av.visual_acuity_vp_sc_od,
          visual_acuity_vp_cc_od: fv.od_av.visual_acuity_vp_cc_od,
          visual_acuity_vp_sc_oi: fv.oi_av.visual_acuity_vp_sc_oi,
          visual_acuity_vp_cc_oi: fv.oi_av.visual_acuity_vp_cc_oi,
          visual_acuity_vp_sc_ao: fv.ao_av.visual_acuity_vp_sc_ao,
          visual_acuity_vp_cc_ao: fv.ao_av.visual_acuity_vp_cc_ao,
          distancia_vp: fv.distancia_vp,

          ph_od: fv.od_av.ph_od,
          ph_oi: fv.oi_av.ph_oi,
          ph_ao: fv.ao_av.ph_ao,

          dominance: fv.dominance,
          id_medical_record: this.medicalRecordJSON?.id_medical_record ?? 1, 
          f_creation: new Date().toISOString(), 
          f_update: new Date().toISOString() 
        }
        
        if(fv.id_visual_acuity){
          newVisualAcuity.id_visual_acuity = fv.id_visual_acuity;
          this.apiService.updateVisualAcuity(newVisualAcuity).subscribe({
            next: (response) => {
              this.toastr.success('Agudeza visual actualizada exitosamente', '¡Buen trabajo!');
            },
            error: (error) => {
              this.toastr.error('Error al actualizar la agudeza visual');
            }
          })
        }else{
          this.apiService.createVisualAcuity(newVisualAcuity).subscribe({
            next: (response) => {
              this.visualAcuitys.push(response);
              this.toastr.success('Agudeza visual creada exitosamente', '¡Excelente!');
              this.formularioVisualAcuity.patchValue({ id_visual_acuity: response.id_visual_acuity });
            },
            error: (error) => {
              this.toastr.error('Error al crear la agudeza visual');
            }
          })
        }
      } else{
        this.formularioVisualAcuity.markAllAsTouched();
        this.toastr.error('Por favor, revise los campos con errores.', 'Formulario inválido');
      }
    }

    campoInvalido(grupo: string, control: string) {
      const formGroup = this.formularioVisualAcuity.get(grupo) as FormGroup;
      const campo = formGroup.get(control);
      return campo?.invalid && campo?.touched;
    }
}
