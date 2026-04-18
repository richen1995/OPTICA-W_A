export interface rx{
    id_rx?: number;

    rx_desc_od: string; // Right eye description
    rx_desc_oi: string; // Left eye description
    rx_av_vl_od: string; // Right eye visual acuity
    rx_av_vl_oi: string; // Left eye visual acuity
    rx_add_od: string; // Right eye addition
    rx_add_oi: string; // Left eye addition
    rx_av_vp_od: string; // Right eye near vision acuity
    rx_av_vp_oi: string; // Left eye near vision acuity
    rx_dnp_od: string; // Right eye pupillary distance
    rx_dnp_oi: string; // Left eye pupillary distance

    observations: string; // Additional observations
    treatment: string; // Treatment details

    id_medical_record: number; // Foreign key to medical record
    f_creation: string; // Creation date as string
    f_update: string; // Update date as string

}