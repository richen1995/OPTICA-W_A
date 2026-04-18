export interface medicalRecord {
    id_medical_record?: number;
    uses_glasses: boolean;
    last_checkup: string; // Date as string
    reasons_for_visit: string;
    previous_illnesses: string;
    ph_ocular: string;
    ph_general: string;
    fh_ocular: string;
    fh_general: string;
    id_person: number; /* CLAVE FORANEA FK */
    f_creation: string;/* Date; */
    f_update: string;/* Date; */
}
