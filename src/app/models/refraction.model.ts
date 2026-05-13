export interface refraction {
    id_refraction?: number;

    ref_sphere_dynamic_od: string;
    ref_cylinder_dynamic_od: string;
    ref_axis_dynamic_od: string;

    ref_sphere_dynamic_oi: string;
    ref_cylinder_dynamic_oi: string;
    ref_axis_dynamic_oi: string;

    ref_sphere_static_od: string;
    ref_cylinder_static_od: string;
    ref_axis_static_od: string;

    ref_sphere_static_oi: string;
    ref_cylinder_static_oi: string;
    ref_axis_static_oi: string;
    
    id_medical_record: number;
    f_creation: string;
    f_update: string;
}