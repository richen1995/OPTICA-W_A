export interface User {
    id_user: number;
    username: string;
    email_login: string;
    is_active: boolean; // El campo que gestionaremos
    last_login?: string;
    f_creation: string;
    id_person: number;
}
