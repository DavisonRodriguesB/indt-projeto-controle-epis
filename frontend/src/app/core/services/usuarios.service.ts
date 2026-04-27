
import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { environment } from "../../../environments/environments";

export type UserRole = "admin" | "almoxarife";

export interface Usuario {
    id: number;
    nome: string;
    email: string;
    role: UserRole;
}

export interface UsuarioPayload {
    nome: string;
    email: string;
    role: UserRole;
    senha?: string;
}

interface ApiResponse<T> {
    data: T;
    meta?: Record<string, unknown>;
}

@Injectable({ providedIn: "root" })
export class UsuariosService {
    private http = inject(HttpClient);
    private baseUrl = environment.apiUrl + "/auth/users";

    list(): Observable<Usuario[]> {
        return this.http
            .get<ApiResponse<Usuario[]>>(this.baseUrl)
            .pipe(map((res) => res.data));
    }

    create(payload: UsuarioPayload): Observable<Usuario> {
        return this.http
            .post<ApiResponse<Usuario>>(this.baseUrl, payload)
            .pipe(map((res) => res.data));
    }

    update(id: number, payload: UsuarioPayload): Observable<Usuario> {
        return this.http
            .put<ApiResponse<Usuario>>(this.baseUrl + "/" + id, payload)
            .pipe(map((res) => res.data));
    }
}