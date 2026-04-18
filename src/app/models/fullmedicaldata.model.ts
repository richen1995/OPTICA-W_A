import { lensometry } from "./lensometry.model";
import { medicalRecord } from "./medical-record.model";
import { person } from "./person.model";
import { rx } from "./rx.model";
import { visualAcuity } from "./visual-acuity.model";

export interface fullmedicaldata {
    medicalRecords : MedicalRecordExtended[];
}

export interface MedicalRecordExtended extends medicalRecord {
  lensometries: lensometry[];
  visualAcuities: visualAcuity[];
  rx: rx[];
   person: person;
}