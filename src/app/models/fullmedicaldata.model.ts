import { lensometry } from "./lensometry.model";
import { medicalRecord } from "./medical-record.model";
import { person } from "./person.model";
import { refraction } from "./refraction.model";
import { rx } from "./rx.model";
import { visualAcuity } from "./visual-acuity.model";

export interface fullmedicaldata {
    medicalRecords : MedicalRecordExtended[];
}

export interface MedicalRecordExtended extends medicalRecord {
  lensometries: lensometry[];
  visualAcuities: visualAcuity[];
  refractions: refraction[];
  rx: rx[];
  person: person;
}