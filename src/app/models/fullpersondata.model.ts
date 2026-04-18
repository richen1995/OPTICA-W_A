import { medicalRecord } from "./medical-record.model";
import { lensometry } from "./lensometry.model";
import { visualAcuity } from "./visual-acuity.model";
import { person } from "./person.model";
import { rx } from "./rx.model";

export interface fullpersondata extends person {

    medicalRecords: (medicalRecord & {
        lensometries : lensometry[];
        visualAcuities : visualAcuity[];
        rx:rx[];
    })[];
    
}   