export interface lensometry {
    id_lensometry?: number;

    lensometry_od_add: string;
    lensometry_av_vl_od: string;
    lensometry_av_vp_od: string;

    lensometry_oi_add: string;
    lensometry_av_vl_oi: string;
    lensometry_av_vp_oi: string;
    
    lensometry_ao_add: string;
    lensometry_av_vl_ao: string;
    lensometry_av_vp_ao: string;

    lens_type: string;
    lens_material: string;
    filter: string;
    time_using_rx: string;
    observation: string;
    id_medical_record: number; /* CLAVE FORANEA FK */
    f_creation: string; /* Date as string */
    f_update: string; /* Date as string */
}