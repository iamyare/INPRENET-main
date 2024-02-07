export interface AuthTokenResult {
    username: string;
    nombre:   string;
    rol:      Rol;
    iat:      number;
    exp:      number;
}

export interface Rol {
    id_rol:      string;
    nombre_rol:  string;
    descripcion: string;
}

export interface IUseToken {
    username: string;
    rol:      Rol;
    iat:      boolean;
}