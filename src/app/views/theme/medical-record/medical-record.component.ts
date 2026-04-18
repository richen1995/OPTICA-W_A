import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { medicalRecord } from '../../../models/medical-record.model';
import { person } from '../../../models/person.model';

@Component({
  selector: 'app-medical-record',
  templateUrl: './medical-record.component.html',
  styleUrl: './medical-record.component.scss',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToastrModule],
})
export class MedicalRecordComponent implements OnInit {
  medicalRecords: medicalRecord[] = [];
  formularioMedicalRecord: FormGroup;
  //objMedicalRecord!: medicalRecord;

  @Input() id_person!: number; // ID de la persona para buscar su última historia
  @Input() id_medical_record!: number; // ID de una historia clínica específica
  @Input() personJSON!: person; 

  @Output() objMedicalRecord = new EventEmitter<string>() // Output para enviar un mensaje al componente padre
  @Output() nextStep = new EventEmitter<void>(); // Evento para avanzar al siguiente tab
  @Output() recordSaved = new EventEmitter<number>(); // Emite el ID cuando se guarda una historia nueva
  
  @Input() hideSaveButton: boolean = false; // Permite ocultar el botón desde el padre


  ngOnInit(): void {
    // Inicialización del componente, como cargar datos o configurar el formulario
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('Detectando cambios en inputs:', changes);
    
    // Si el ID que entra del padre es diferente al que tenemos en sesión, reiniciamos sesión
    // Pero si es el MISMO (ej. acabamos de emitirlo tras crear), lo mantenemos para no ocultar el botón "Siguiente"
    if (changes['id_medical_record'] || changes['id_person']) {
        const newIdMR = changes['id_medical_record']?.currentValue;
        if (newIdMR !== undefined && newIdMR !== this.idMedicalRecordActual) {
            this.idMedicalRecordActual = null;
        }
    }

    console.log('Cargando historia clínica por ID:', this.id_medical_record);
    // Si cambia el id_medical_record, cargamos esa historia específica
    if (changes['id_medical_record'] && this.id_medical_record > 0) {
      console.log('Cargando historia clínica por ID - dentro del IF:', this.id_medical_record);
      this.cargarHistoriaPorId(this.id_medical_record);
    } 
    // Si cambia el id_person (y no se proporcionó un id_medical_record o es 0), buscamos la más reciente
    else if (changes['id_person'] && this.id_person > 0) {
      this.idMedicalRecordActual = null;
      console.log('Buscando última historia clínica para persona:', this.id_person);
      this.buscarUltimaHistoria(this.id_person);
    }
  }

  buscarUltimaHistoria(idPersona: number) {
    console.log('Buscando última historia clínica para persona:', idPersona);
    // Usamos getFullPersonData xq este recibe el ID de la PERSONA y devuelve sus historias
    this.apiService.getFullPersonData(idPersona).subscribe({
      next: (fullData: any) => {
        console.log('Full data:', fullData);
        
        // Si el API devuelve un array, tomamos el primer elemento (la persona)
        const data = Array.isArray(fullData) ? fullData[0] : fullData;

        if (data && data.medicalRecords && data.medicalRecords.length > 0) {
          console.log('Medicals records encontrados:', data.medicalRecords);
          
          // Ordenar por f_creation descendente
          const recordsSorted = [...data.medicalRecords].sort((a, b) => {
            const dateA = a.f_creation ? new Date(a.f_creation).getTime() : 0;
            const dateB = b.f_creation ? new Date(b.f_creation).getTime() : 0;
            return dateB - dateA;
          });

          const latestRecord = recordsSorted[0];
          console.log('Reciclando datos de la historia más actual para la persona:', latestRecord.id_medical_record);
          
          // Reutilizamos datos para una NUEVA historia clínica (Antecedentes)
          this.reutilizarDatos(latestRecord);
          
          // Creamos una copia para el resto de componentes pero LIMPIAMOS los datos de los exámenes
          // para que Lensometría, Agudeza Visual y RX comiencen vacíos en el nuevo examen.
          const cleanRecord = { 
            ...latestRecord, 
            lensometries: [], 
            visualAcuities: [], 
            rx: [] 
          };
          this.objMedicalRecord.emit(JSON.stringify(cleanRecord));
        } else {
          console.log('No se encontraron historias clínicas para reciclar.');
          this.resetForm();
        }
      },
      error: (err) => console.error('Error al buscar historias clínicas de la persona:', err)
    });
  }

  cargarHistoriaPorId(idMedicalRecord: number) {
    // Usamos getMedicalRecordDataExtended xq recibe el ID de la HISTORIA CLINICA
    this.apiService.getMedicalRecordDataExtended(idMedicalRecord).subscribe({
      next: (records) => {
        if (records && records.length > 0) {
          const record = records[0];
          this.patchForm(record);
          this.objMedicalRecord.emit(JSON.stringify(record));
        }
      },
      error: (err) => console.error('Error al cargar la historia clínica por ID:', err)
    });
  }

  reutilizarDatos(record: medicalRecord) {
    this.formularioMedicalRecord.patchValue({
      id_medical_record: null, // Es una nueva historia, no editamos la anterior
      uses_glasses: 'No', // Valor por defecto
      last_checkup: '',
      reasons_for_visit: '',
      previous_illnesses: record.previous_illnesses,
      ph_ocular: record.ph_ocular,
      ph_general: record.ph_general,
      fh_ocular: record.fh_ocular,
      fh_general: record.fh_general,
      f_creation: new Date().toISOString(),
      f_update: new Date().toISOString()
    });
  }

  patchForm(record: medicalRecord) {
    this.idMedicalRecordActual = record.id_medical_record || null;
    this.formularioMedicalRecord.patchValue({
      id_medical_record: record.id_medical_record,
      uses_glasses: record.uses_glasses ? 'Si' : 'No',
      last_checkup: record.last_checkup,
      reasons_for_visit: record.reasons_for_visit,
      previous_illnesses: record.previous_illnesses,
      ph_ocular: record.ph_ocular,
      ph_general: record.ph_general,
      fh_ocular: record.fh_ocular,
      fh_general: record.fh_general,
      f_creation: record.f_creation,
      f_update: record.f_update
    });
  }

  public resetForm() {
    this.formularioMedicalRecord.reset({
      uses_glasses: 'No',
      f_creation: new Date().toISOString(),
      f_update: new Date().toISOString()
    });
  }

  // Métodos para manejar la lógica del componente, como enviar el formulario o manejar errores
  constructor(private fb: FormBuilder, private apiService: ApiService, private toastr: ToastrService) {
    this.formularioMedicalRecord = this.fb.group({
      id_medical_record: [null], // <--- agrega esto
      uses_glasses: ['', Validators.required],
      last_checkup : ['', [Validators.required, Validators.minLength(5)]],
      reasons_for_visit: ['', [Validators.required, Validators.minLength(5)]],
      previous_illnesses: ['', Validators.required],
      ph_ocular: ['', Validators.required],
      ph_general: ['', Validators.required],
      fh_ocular: ['', Validators.required],
      fh_general: ['', Validators.required],
      f_creation: ['f_creation', Validators.required],
      f_update: ['f_update', Validators.required]
    });
  }

  public idMedicalRecordActual: number | null = null;

  enviarFormulario() {
    if (this.formularioMedicalRecord.valid) {
      const formMedicalValue: medicalRecord = this.formularioMedicalRecord.value;
      const newMedicalRecord: medicalRecord = {
        uses_glasses: formMedicalValue.uses_glasses,
        last_checkup: formMedicalValue.last_checkup,
        reasons_for_visit: formMedicalValue.reasons_for_visit,
        previous_illnesses: formMedicalValue.previous_illnesses,
        ph_ocular: formMedicalValue.ph_ocular,
        ph_general: formMedicalValue.ph_general,
        fh_ocular: formMedicalValue.fh_ocular,
        fh_general: formMedicalValue.fh_general,
        id_person: this.id_person,
        f_creation: this.idMedicalRecordActual ? formMedicalValue.f_creation : new Date().toISOString(),
        f_update: new Date().toISOString()
      };

      // Si ya existe un ID en el formulario (porque se acaba de crear o se cargó para editar)
      // Solo actualizamos si el ID coincide con el que creamos en esta sesión,
      // de lo contrario creamos una nueva historia clínica para no sobrescribir históricas.
      if (formMedicalValue.id_medical_record && formMedicalValue.id_medical_record === this.idMedicalRecordActual) {
        console.log('Actualizando historia clínica actual con ID:', formMedicalValue.id_medical_record);
        newMedicalRecord.id_medical_record = formMedicalValue.id_medical_record;
        
        this.apiService.updateMedicalRecord(newMedicalRecord).subscribe({
          next: (response) => {
            this.toastr.success('Historia clínica actualizada exitosamente', 'Éxito', { positionClass: 'toast-top-right' });
            this.formularioMedicalRecord.markAsPristine(); 
          },
          error: (error) => {
            this.toastr.error('Error al actualizar la historia clínica');
            console.error(error);
          }
        });
      } else {
        // Creación nueva
        console.log('Creando nueva historia clínica:', newMedicalRecord);
        this.apiService.createMedicalRecord(newMedicalRecord).subscribe({
          next: (response) => {
            this.toastr.success('Nueva historia clínica creada exitosamente', 'Éxito', { positionClass: 'toast-top-right' });
            this.medicalRecords.push(response);
            this.objMedicalRecord.emit(JSON.stringify(response));
            
            // Asignamos el ID a la variable de sesión para que si se vuelve a enviar (ej. para corregir), se actualice
            this.idMedicalRecordActual = response.id_medical_record || null;
            this.formularioMedicalRecord.patchValue({ 
              id_medical_record: response.id_medical_record,
              f_creation: response.f_creation // Mantener la fecha de creación original
            });
            this.formularioMedicalRecord.markAsPristine();
            
            // Emisión de guardado exitoso para desbloquear pestañas
            this.recordSaved.emit(response.id_medical_record);
            
            console.log("Respuesta del Backend (Nueva HC): ", response);
          },
          error: (error) => {
            this.toastr.error('Error al crear el registro médico');
            console.error(error);
          }
        });
      }
    } else {
      // Recorre los controles y muestra los errores en consola para depuración
      Object.keys(this.formularioMedicalRecord.controls).forEach(key => {
        const control = this.formularioMedicalRecord.get(key);
        if (control && control.invalid) {
          console.log(`Campo con error: ${key}`, control.errors);
        }
      });
      console.log('Formulario inválido');
      this.formularioMedicalRecord.markAllAsTouched(); 
      this.toastr.error('Por favor complete los campos obligatorios', 'Error',{ positionClass: 'toast-top-right' });
    }
  }

  onNext() {
    this.nextStep.emit();
  }
}
