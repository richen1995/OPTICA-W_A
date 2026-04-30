import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule} from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { person } from '../../models/person.model';
import { ApiService } from '../../services/api.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { MedicalRecordComponent } from './medical-record/medical-record.component';
import { LensometryComponent } from './lensometry/lensometry.component';
import { VisualAcuityComponent } from './visual-acuity/visual-acuity.component'; 
import { RxComponent } from './rx/rx.component'; 
import { medicalRecord } from '../../models/medical-record.model';
import { MedicalRecordExtended } from '../../models/fullmedicaldata.model';
import { lensometry } from '../../models/lensometry.model';
import { visualAcuity } from '../../models/visual-acuity.model';
import { rx } from '../../models/rx.model';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-patients',
  templateUrl: './patients.component.html',
  styleUrl: './patients.component.scss',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    ToastrModule, 
    MedicalRecordComponent, 
    LensometryComponent, 
    VisualAcuityComponent, 
    RxComponent,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule
  ],
})

export class PatientsComponent implements OnInit, OnDestroy {

  personas: person[] = [];
  formulario: FormGroup
  idPerson: number = 0; 
  idMedicalRecord: number = 0; 
  objPerson!: person;
  objMedicalRecord!: medicalRecord;
  edad: number | null = null;
  isMedicalRecordCreated: boolean = false; 
  isSaving: boolean = false; 
  isSearching: boolean = false;
  isComplete: boolean = false; 
  isEditMode: boolean = false;
  isLoading: boolean = false;
  maxBirthDate: string;
  private destroy$ = new Subject<void>(); 

  @ViewChild(MedicalRecordComponent) medicalRecordComp!: MedicalRecordComponent;
  @ViewChild(LensometryComponent) lensometryComp!: LensometryComponent;
  @ViewChild(VisualAcuityComponent) visualAcuityComp!: VisualAcuityComponent;
  @ViewChild(RxComponent) rxComp!: RxComponent;
  
  constructor(private fb: FormBuilder, private personaService: ApiService,
              private toastr: ToastrService, private route: ActivatedRoute,
              private cdr: ChangeDetectorRef
  ) {
    // Fecha máxima: hace 2 años (edad mínima del paciente)
    const today = new Date();
    const minAgeDate = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate());
    this.maxBirthDate = minAgeDate.toISOString().split('T')[0];

    this.formulario = this.fb.group({
      id_person: [null], 
      last_name: ['', [Validators.required, Validators.minLength(3)]],
      first_name: ['', [Validators.required, Validators.minLength(3)]],
      place_birth: ['', Validators.required], 
      f_birthdate: ['', Validators.required],
      identification: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(15)]],
      gender: ['Masculino', Validators.required],
      ocupation: ['', Validators.required],
      email: ['', [Validators.email]],
      address: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      provenance: ['Sierra', Validators.required],

      f_creation: [new Date().toISOString(), Validators.required],
      f_update: [new Date().toISOString(), Validators.required],
      edad: [{ value: '', disabled: false }],
    });
  }

  ngOnInit(): void {
    this.formulario.get('identification')?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        if (value && value.length >= 5) {
          this.buscarPaciente();
        } else if (!value || value.length === 0) {
          this.limpiarFormularioCompleto();
        }
      });

    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id_record']) {
        this.cargarExamenParaEditar(Number(params['id_record']));
      }
    });

  }



  limpiarFormularioBusqueda() {
    this.idPerson = 0;
    this.idMedicalRecord = 0;
    this.objPerson = {} as any;
    this.objMedicalRecord = {} as any;
    this.isMedicalRecordCreated = false;
    this.isComplete = false;
    this.isSaving = false;
    this.edad = null;
    this.lastSearchedId = '';
    
    this.formulario.reset({}, { emitEvent: false });
    this.formulario.patchValue({
        gender: 'Masculino',
        provenance: 'Sierra',
        f_creation: new Date().toISOString(),
        f_update: new Date().toISOString()
    }, { emitEvent: false });
  }

  limpiarFormularioCompleto() {
    this.desbloquearCampos();
    this.limpiarFormularioBusqueda();
  }

  bloquearCampos() {
    const camposABloquear = ['identification', 'last_name', 'first_name', 'place_birth', 'f_birthdate', 'gender', 'provenance'];
    camposABloquear.forEach(campo => this.formulario.get(campo)?.disable());
  }

  desbloquearCampos() {
    this.formulario.enable();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

    campoInvalido(grupo: string, control: string) {
      const formGroup = this.formulario.get(grupo) as FormGroup;
      const campo = formGroup.get(control);
      return campo?.invalid && campo?.touched;
    }

  enviarFormulario() {
    if (this.formulario.valid) {
      const formValue = this.formulario.getRawValue();
      const nuevaPersona: person = {
        identification: formValue.identification,
        first_name: formValue.first_name, 
        last_name: formValue.last_name,
        place_birth: formValue.place_birth,
        f_birthdate: formValue.f_birthdate,
        phone: formValue.phone,
        email: formValue.email,
        address: formValue.address,
        gender: formValue.gender,
        charge: formValue.ocupation,
        ocupation: formValue.ocupation,
        provenance: formValue.provenance,
        f_creation: formValue.f_creation,
        f_update: formValue.f_update
      };

      if(formValue.id_person){
          if (this.formulario.dirty) {
            nuevaPersona.id_person = formValue.id_person;
            nuevaPersona.f_update = new Date().toISOString(); 
            this.personaService.updatePersona(nuevaPersona).subscribe({
              next: (persona) => {
                this.toastr.success('Persona actualizada correctamente', 'Éxito',{ positionClass: 'toast-top-right' });
                this.formulario.markAsPristine(); 
                this.idPerson = persona.id_person!;
                this.objPerson = persona;
                this.bloquearCampos();
                this.goToTab('tab2-tab'); 
              },
              error: (err) => console.error('Error al actualizar persona:', err),
            });
          } else {
            this.goToTab('tab2-tab');
          }
        } else { 
          this.personaService.createPersona(nuevaPersona).subscribe({
            next: (persona) => {
              this.personas.push(persona);
              this.toastr.success('Persona guardada correctamente', 'Éxito',{ positionClass: 'toast-top-right' });
              this.idPerson = persona.id_person || 1; 
              this.objPerson = persona; 
              this.formulario.patchValue({ id_person: persona.id_person });
              this.goToTab('tab2-tab');
            },
            error: (err) => console.error('Error al guardar persona:', err),
          });
       }
    } else {
      this.formulario.markAllAsTouched(); 
      this.toastr.error('Ocurrió un error', 'Error',{ positionClass: 'toast-top-right' });
    }
  }

  recibirObjMedicalRecord(event: string) {
    const data = JSON.parse(event);
    
    // Si el ID de la historia es 0, significa que es una búsqueda nueva o un examen recién iniciado (reciclado).
    // Nos aseguramos de que los arrays de exámenes estén vacíos para empezar desde cero.
    if (data.id_medical_record === 0) {
      data.lensometries = [];
      data.visualAcuities = [];
      data.rx = [];
    }

    this.objMedicalRecord = data;
    this.idMedicalRecord = this.objMedicalRecord?.id_medical_record ?? 0;
  }

  recibirNuevaHistoria(id: number) {
    this.idMedicalRecord = id;
    this.isMedicalRecordCreated = true; 
  }

  // GETTER para controlar la habilitación del botón de guardado global
  get isRxFormValid(): boolean {
    return this.rxComp?.formularioRx?.valid && this.hasValue(this.rxComp.formularioRx.value);
  }

  guardarConsultaCompleta() {
    if (!this.idPerson) {
      this.toastr.error('Debe seleccionar o guardar un paciente primero', 'Error');
      return;
    }

    if (this.isSaving || this.isComplete) return;

    Swal.fire({
      title: '¿Confirmar Guardado?',
      text: "Se guardarán todos los datos de este examen de forma permanente.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2eb85c',
      cancelButtonColor: '#e55353',
      confirmButtonText: 'Sí, guardar examen',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      customClass: {
        container: 'swal2-backdrop-premium',
        popup: 'premium-swal animate__animated animate__zoomIn',
        title: 'premium-swal-title',
        htmlContainer: 'premium-swal-content',
        confirmButton: 'btn btn-success premium-confirm mx-2',
        cancelButton: 'btn btn-danger premium-cancel mx-2'
      },
      buttonsStyling: false 
    }).then((result) => {
      if (result.isConfirmed) {
        this.procederConGuardado();
      }
    });
  }

  private procederConGuardado() {
    const formMR = this.medicalRecordComp.formularioMedicalRecord;
    const formLens = this.lensometryComp.formularioLensometry;
    const formVA = this.visualAcuityComp.formularioVisualAcuity;
    const formRx = this.rxComp.formularioRx;

    formMR.markAllAsTouched();
    formLens.markAllAsTouched();
    formVA.markAllAsTouched();
    formRx.markAllAsTouched();

    if (formMR.invalid) {
      this.toastr.error('Por favor complete los campos obligatorios de la Historia Clínica', 'Error');
      return;
    }

    if (!this.hasValue(formRx.value)) {
      this.toastr.error('Debe ingresar al menos un dato en RX Final para guardar el examen', 'Error');
      return;
    }

    const medicalData = formMR.getRawValue();
    const lensData = formLens.getRawValue();
    const vaData = formVA.getRawValue();
    const rxData = formRx.getRawValue();

    const fullVisit: MedicalRecordExtended = {
      id_medical_record: this.idMedicalRecord || 0,
      uses_glasses: medicalData.uses_glasses === 'Si',
      last_checkup: medicalData.last_checkup,
      reasons_for_visit: medicalData.reasons_for_visit,
      previous_illnesses: medicalData.previous_illnesses,
      ph_ocular: medicalData.ph_ocular,
      ph_general: medicalData.ph_general,
      fh_ocular: medicalData.fh_ocular,
      fh_general: medicalData.fh_general,
      id_person: this.idPerson,
      f_creation: medicalData.f_creation || new Date().toISOString(),
      f_update: new Date().toISOString(),
      
      lensometries: this.hasValue(lensData) ? [{
        id_lensometry: lensData.id_lensometry || 0,
        id_medical_record: this.idMedicalRecord || 0,
        lensometry_od_add: lensData.od.lensometry_od_add,
        lensometry_av_vl_od: lensData.od.lensometry_av_vl_od,
        lensometry_av_vp_od: lensData.od.lensometry_av_vp_od,
        lensometry_oi_add: lensData.oi.lensometry_oi_add,
        lensometry_av_vl_oi: lensData.oi.lensometry_av_vl_oi,
        lensometry_av_vp_oi: lensData.oi.lensometry_av_vp_oi,
        lensometry_ao_add: lensData.ao.lensometry_ao_add,
        lensometry_av_vl_ao: lensData.ao.lensometry_av_vl_ao,
        lensometry_av_vp_ao: lensData.ao.lensometry_av_vp_ao,
        lens_type: lensData.lens_type,
        lens_material: lensData.lens_material,
        filter: lensData.filter,
        time_using_rx: lensData.time_using_rx,
        observation: lensData.observation,
        f_creation: lensData.f_creation || new Date().toISOString(),
        f_update: new Date().toISOString()
      }] : [] as lensometry[],

      visualAcuities: this.hasValue(vaData) ? [{
        id_visual_acuity: vaData.id_visual_acuity || 0,
        id_medical_record: this.idMedicalRecord || 0,
        visual_acuity_vl_sc_od: vaData.od_av.visual_acuity_vl_sc_od,
        visual_acuity_vl_cc_od: vaData.od_av.visual_acuity_vl_cc_od,
        visual_acuity_vl_sc_oi: vaData.oi_av.visual_acuity_vl_sc_oi,
        visual_acuity_vl_cc_oi: vaData.oi_av.visual_acuity_vl_cc_oi,
        visual_acuity_vl_sc_ao: vaData.ao_av.visual_acuity_vl_sc_ao,
        visual_acuity_vl_cc_ao: vaData.ao_av.visual_acuity_vl_cc_ao,
        distancia_vl: vaData.distancia_vl,
        visual_acuity_vp_sc_od: vaData.od_av.visual_acuity_vp_sc_od,
        visual_acuity_vp_cc_od: vaData.od_av.visual_acuity_vp_cc_od,
        visual_acuity_vp_sc_oi: vaData.oi_av.visual_acuity_vp_sc_oi,
        visual_acuity_vp_cc_oi: vaData.oi_av.visual_acuity_vp_cc_oi,
        visual_acuity_vp_sc_ao: vaData.ao_av.visual_acuity_vp_sc_ao,
        visual_acuity_vp_cc_ao: vaData.ao_av.visual_acuity_vp_cc_ao,
        distancia_vp: vaData.distancia_vp,
        ph_od: vaData.od_av.ph_od,
        ph_oi: vaData.oi_av.ph_oi,
        ph_ao: vaData.ao_av.ph_ao,
        dominance: vaData.dominance,
        f_creation: vaData.f_creation || new Date().toISOString(),
        f_update: new Date().toISOString()
      }] : [] as visualAcuity[],

      rx: this.hasValue(rxData) ? [{
        id_rx: rxData.id_rx || 0,
        id_medical_record: this.idMedicalRecord || 0,
        rx_desc_od: rxData.od_rx.rx_desc_od,
        rx_av_vl_od: rxData.od_rx.rx_av_vl_od,
        rx_add_od: rxData.od_rx.rx_add_od,
        rx_av_vp_od: rxData.od_rx.rx_av_vp_od,
        rx_dnp_od: rxData.od_rx.rx_dnp_od,
        rx_desc_oi: rxData.oi_rx.rx_desc_oi,
        rx_av_vl_oi: rxData.oi_rx.rx_av_vl_oi,
        rx_add_oi: rxData.oi_rx.rx_add_oi,
        rx_av_vp_oi: rxData.oi_rx.rx_av_vp_oi,
        rx_dnp_oi: rxData.oi_rx.rx_dnp_oi,
        observations: rxData.observations,
        treatment: rxData.treatment,
        f_creation: rxData.f_creation || new Date().toISOString(),
        f_update: new Date().toISOString()
      }] : [] as rx[],
      person: this.objPerson
    };

    this.isSaving = true;
    console.log('Enviando examen completo:', fullVisit);

    const request = this.isEditMode 
      ? this.personaService.updateFullMedicalRecord(fullVisit)
      : this.personaService.createFullMedicalRecord(fullVisit);

    request.subscribe({
      next: (response) => {
        this.isSaving = false;
        this.isComplete = true;
        const msg = this.isEditMode ? '¡Examen actualizado exitosamente!' : '¡Examen guardado exitosamente!';
        this.toastr.success(msg, 'Éxito', { positionClass: 'toast-top-right' });
        this.idMedicalRecord = response.id_medical_record!;
        this.isMedicalRecordCreated = true;
        this.medicalRecordComp.idMedicalRecordActual = this.idMedicalRecord;
        formMR.patchValue({ id_medical_record: this.idMedicalRecord });
        formMR.markAsPristine();
      },
      error: (err) => {
        this.isSaving = false;
        this.toastr.error('Ocurrió un error al procesar el examen.', 'Error');
      }
    });
  }

  private hasValue(obj: any): boolean {
    if (!obj) return false;
    return Object.keys(obj).some(key => {
      const val = obj[key];
      if (key === 'id_medical_record' || key === 'f_creation' || key === 'f_update' 
          || key === 'id_visual_acuity' || key === 'id_lensometry' || key === 'id_rx'
          || key === 'distancia_vl' || key === 'distancia_vp') return false;
      
      if (typeof val === 'object' && val !== null) {
        return this.hasValue(val);
      }
      return val !== null && val !== '' && val !== undefined;
    });
  }

  notifyNoPerson() {
    this.toastr.warning('Debe primero crear la persona', 'Atención');
  }

  notifyNoMedicalRecord() {
    this.toastr.warning('Debe primero crear la historia clínica antes de llenar lensometría, agudeza visual y rx final', 'Atención');
  }

  goToTab(tabId: string) {
    const tabTrigger = document.getElementById(tabId);
    if (tabTrigger) {
      tabTrigger.click();
    }
  }

  calcularEdad(): number {
    const fechaNac = this.formulario.get('f_birthdate')?.value;
    if (!fechaNac) return 0;
    const hoy = new Date();
    const nacimiento = new Date(fechaNac);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    this.formulario.patchValue({ edad: edad });
    return edad;
  }

  private lastSearchedId: string = '';

  buscarPaciente() {
    const identificationValue = this.formulario.get('identification')?.value;
    if (identificationValue && identificationValue !== this.lastSearchedId) {
      this.isSearching = true;
      this.lastSearchedId = identificationValue;
      this.personaService.getPersonByIdentification(identificationValue)
      .pipe(finalize(() => this.isSearching = false))
      .subscribe({
        next: (response: any) => {
          const persona = Array.isArray(response) ? response[0] : response;
          if (persona) {
            this.toastr.success('Paciente encontrado, cargando datos...', 'Búsqueda');
            this.objPerson = persona;
            this.idPerson = persona.id_person;
            this.idMedicalRecord = 0; 
            this.objMedicalRecord = {} as any; 
            this.isMedicalRecordCreated = false; 
            this.isComplete = false; 
            this.isSaving = false;
            const genderNormalized = persona.gender === 'MASCULINO' ? 'Masculino' : 
                                    persona.gender === 'FEMENINO'  ? 'Femenino' : persona.gender;
            const provenanceNormalized = persona.provenance ? 
                                        persona.provenance.charAt(0).toUpperCase() + persona.provenance.slice(1).toLowerCase() : 
                                        persona.provenance;
            this.formulario.patchValue({
              id_person: persona.id_person,
              last_name: persona.last_name,
              first_name: persona.first_name,
              place_birth: persona.place_birth,
              f_birthdate: persona.f_birthdate,
              gender: genderNormalized,
              ocupation: persona.ocupation || persona.charge,
              email: persona.email,
              address: persona.address,
              phone: persona.phone,
              provenance: provenanceNormalized
            });
            this.edad = this.calcularEdad();
            this.bloquearCampos();
            this.formulario.markAsPristine();
          } else {
            this.limpiarParaNuevoPaciente(identificationValue);
          }
        },
        error: (err) => this.limpiarParaNuevoPaciente(identificationValue)
      });
    }
  }

  cargarExamenParaEditar(id: number) {
    // Usamos setTimeout para mover la operación fuera del ciclo de detección actual
    setTimeout(() => {
      this.isLoading = true;
      this.cdr.detectChanges(); 
      this.toastr.info('Cargando examen para edición...', 'Edición');
      
      this.personaService.getMedicalRecordDataExtended(id)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data) => {
          if (data && data.length > 0) {
            const record = data[0];
            this.isEditMode = true;
// ... rest of the logic

          this.objPerson = record.person;
          this.idPerson = record.person.id_person!;
          this.idMedicalRecord = record.id_medical_record!;
          this.isMedicalRecordCreated = true;

          const persona = record.person;
          const genderNormalized = persona.gender === 'MASCULINO' ? 'Masculino' : 
                                  persona.gender === 'FEMENINO'  ? 'Femenino' : persona.gender;
          const provenanceNormalized = persona.provenance ? 
                                      persona.provenance.charAt(0).toUpperCase() + persona.provenance.slice(1).toLowerCase() : 
                                      persona.provenance;

          this.formulario.patchValue({
            id_person: persona.id_person,
            identification: persona.identification,
            last_name: persona.last_name,
            first_name: persona.first_name,
            place_birth: persona.place_birth,
            f_birthdate: persona.f_birthdate,
            gender: genderNormalized,
            ocupation: persona.ocupation || persona.charge,
            email: persona.email,
            address: persona.address,
            phone: persona.phone,
            provenance: provenanceNormalized
          });
          this.lastSearchedId = persona.identification;
          this.edad = this.calcularEdad();
          this.bloquearCampos();
          this.formulario.markAsPristine();
          // El objeto record ya viene con lensometries, visualAcuities y rx
          // Al asignar this.idMedicalRecord y this.objMedicalRecord, los @Inputs de los hijos se dispararán
          this.objMedicalRecord = record as any; 
        }
      },
      error: (err) => {
        this.toastr.error('Error al cargar datos del examen', 'Error');
        console.error(err);
      }
    });
   }, 0);
  }

  limpiarParaNuevoPaciente(cedula: string) {
    this.desbloquearCampos();
    this.toastr.warning('Paciente no registrado, puede ingresar los datos', 'Nuevo Paciente');
    this.formulario.reset();
    this.formulario.patchValue({ 
      identification: cedula,
      gender: 'Masculino',
      provenance: 'Sierra',
      f_creation: new Date().toISOString(),
      f_update: new Date().toISOString()
    });
    this.idPerson = 0;
    this.idMedicalRecord = 0; 
    this.isMedicalRecordCreated = false; 
    this.isComplete = false; 
    this.isSaving = false;
    this.edad = null;
    this.objPerson = {} as any;
    this.objMedicalRecord = {} as any;
  }
}
