export interface visualAcuity {
    id_visual_acuity?: number;

    visual_acuity_vl_sc_od: string; 
    visual_acuity_vl_cc_od?: string; // Opcional
    visual_acuity_vl_sc_oi: string; 
    visual_acuity_vl_cc_oi?: string; // Opcional
    visual_acuity_vl_sc_ao: string; 
    visual_acuity_vl_cc_ao?: string; // Opcional
    distancia_vl: string; 

    visual_acuity_vp_sc_od: string; 
    visual_acuity_vp_cc_od?: string; // Opcional
    visual_acuity_vp_sc_oi: string; 
    visual_acuity_vp_cc_oi?: string; // Opcional
    visual_acuity_vp_sc_ao: string; 
    visual_acuity_vp_cc_ao?: string; // Opcional
    distancia_vp: string; 

    ph_od: string; 
    ph_oi: string; 
    ph_ao: string; 
    
    dominance: string; 

    id_medical_record: number; 
    f_creation: string; 
    f_update: string; 
}
