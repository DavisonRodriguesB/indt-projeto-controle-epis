import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { UsuarioFormComponent } from "../form/form";
import { ApiErrorService } from "../../../../core/http/api-error.service";
import { Usuario, UsuarioPayload, UsuariosService } from "../../../../core/services/usuarios.service";

@Component({
  selector: "app-usuario-list",
  standalone: true,
  imports: [CommonModule, FormsModule, UsuarioFormComponent],
  templateUrl: "./list.html"
})
export class UsuarioListComponent implements OnInit {
  private usuariosService = inject(UsuariosService);
  private apiError = inject(ApiErrorService);

  searchTerm = "";
  selectedRole = "";
  isModalOpen = false;
  selectedUser: Usuario | null = null;

  usuarios: Usuario[] = [];
  loading = signal(false);
  saving = signal(false);
  listErrorMessage = signal<string | null>(null);
  formErrorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadUsers();
  }

  get usuariosFiltrados(): Usuario[] {
    return this.usuarios.filter((user) => {
      const search = this.searchTerm.toLowerCase();
      const matchesSearch =
        user.nome.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search);

      const matchesRole = this.selectedRole ? user.role === this.selectedRole : true;

      return matchesSearch && matchesRole;
    });
  }

  loadUsers(): void {
    this.loading.set(true);
    this.listErrorMessage.set(null);

    this.usuariosService.list().subscribe({
      next: (items) => {
        this.usuarios = items;
        this.loading.set(false);
      },
      error: (err) => {
        this.listErrorMessage.set(this.apiError.getMessage(err, "Nao foi possivel carregar usuarios."));
        this.loading.set(false);
      }
    });
  }

  openModal(): void {
    this.selectedUser = null;
    this.formErrorMessage.set(null);
    this.isModalOpen = true;
  }

  editUser(user: Usuario): void {
    this.selectedUser = { ...user };
    this.formErrorMessage.set(null);
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedUser = null;
    this.formErrorMessage.set(null);
  }

  saveUser(userData: UsuarioPayload): void {
    this.saving.set(true);
    this.formErrorMessage.set(null);

    const request$ = this.selectedUser
      ? this.usuariosService.update(this.selectedUser.id, userData)
      : this.usuariosService.create(userData);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.loadUsers();
      },
      error: (err) => {
        this.saving.set(false);
        this.formErrorMessage.set(this.apiError.getMessage(err, "Nao foi possivel salvar usuario."));
      }
    });
  }
}