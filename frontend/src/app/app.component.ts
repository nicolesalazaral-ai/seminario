import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Usuario {
  id: number;
  usuario: string;
  rol: 'recepcionista' | 'auxiliar' | 'medico';
  medico_id: number | null;
}

interface Paciente {
  id: number;
  nombre: string;
  celular: string;
  faltas?: number;
}

interface Cita {
  id: number;
  paciente_id: number;
  paciente: string;
  celular: string;
  medico_id: number;
  medico: string;
  fecha_hora_inicio: string;
  motivo: string;
  duracion_min: number;
  estado: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  private readonly api = `http://${window.location.hostname}:3000`;
  token = '';
  usuario: Usuario | null = null;
  mensaje = '';
  fecha = this.fechaLocal(new Date());
  citas: Cita[] = [];
  citasManana: Cita[] = [];
  resultadoPaciente: Paciente | null = null;

  acceso = { usuario: '', contrasena: '' };
  nuevaCita = {
    nombre: '',
    celular: '',
    medico_id: 1,
    fecha_hora_inicio: '',
    motivo: 'control',
  };
  busquedaNombre = '';
  cambiosHora: Record<number, string> = {};

  constructor(private readonly http: HttpClient) {}

  get esPersonal(): boolean {
    return this.usuario?.rol === 'recepcionista' || this.usuario?.rol === 'auxiliar';
  }

  iniciarSesion(): void {
    this.mensaje = '';
    this.http.post<{ token: string; usuario: Usuario }>(`${this.api}/sesiones`, this.acceso)
      .subscribe({
        next: (respuesta) => {
          this.token = respuesta.token;
          this.usuario = respuesta.usuario;
          this.cargarAgendas();
        },
        error: (error: HttpErrorResponse) => this.mostrarError(error),
      });
  }

  cerrarSesion(): void {
    this.token = '';
    this.usuario = null;
    this.citas = [];
    this.citasManana = [];
    this.mensaje = '';
  }

  cargarAgendas(): void {
    if (!this.usuario) return;
    this.cargarCitas(this.fecha, (citas) => this.citas = citas);
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    this.cargarCitas(this.fechaLocal(manana), (citas) => this.citasManana = citas);
  }

  cambiarFecha(): void {
    this.cargarCitas(this.fecha, (citas) => this.citas = citas);
  }

  private cargarCitas(fecha: string, guardar: (citas: Cita[]) => void): void {
    if (!this.usuario) return;
    const url = this.esPersonal
      ? `${this.api}/citas?fecha=${fecha}`
      : `${this.api}/medicos/${this.usuario.medico_id}/citas?fecha=${fecha}`;
    this.http.get<Cita[]>(url, { headers: this.encabezados() }).subscribe({
      next: guardar,
      error: (error: HttpErrorResponse) => this.mostrarError(error),
    });
  }

  agendar(): void {
    this.mensaje = '';
    this.buscarPaciente(this.nuevaCita.nombre, (paciente) => {
      if (paciente) {
        this.enviarCita(paciente.id);
        return;
      }
      this.http.post<Paciente>(`${this.api}/pacientes`, {
        nombre: this.nuevaCita.nombre,
        celular: this.nuevaCita.celular,
      }, { headers: this.encabezados() }).subscribe({
        next: (nuevoPaciente) => this.enviarCita(nuevoPaciente.id),
        error: (error: HttpErrorResponse) => this.mostrarError(error),
      });
    });
  }

  private buscarPaciente(nombre: string, continuar: (paciente: Paciente | null) => void): void {
    this.http.get<Paciente>(`${this.api}/pacientes?nombre=${encodeURIComponent(nombre.trim())}`, {
      headers: this.encabezados(),
    }).subscribe({
      next: (paciente) => continuar(paciente),
      error: (error: HttpErrorResponse) => {
        if (error.status === 404) continuar(null);
        else this.mostrarError(error);
      },
    });
  }

  private enviarCita(pacienteId: number): void {
    const fechaHora = this.nuevaCita.fecha_hora_inicio;
    this.http.post<Cita>(`${this.api}/citas`, {
      paciente_id: pacienteId,
      medico_id: Number(this.nuevaCita.medico_id),
      fecha_hora_inicio: fechaHora,
      motivo: this.nuevaCita.motivo,
    }, { headers: this.encabezados() }).subscribe({
      next: () => {
        this.mensaje = 'Cita agendada correctamente';
        this.nuevaCita = { ...this.nuevaCita, nombre: '', celular: '', fecha_hora_inicio: '' };
        this.cargarAgendas();
      },
      error: (error: HttpErrorResponse) => this.mostrarError(error),
    });
  }

  buscarPorNombre(): void {
    this.resultadoPaciente = null;
    this.http.get<Paciente>(`${this.api}/pacientes?nombre=${encodeURIComponent(this.busquedaNombre.trim())}`, {
      headers: this.encabezados(),
    }).subscribe({
      next: (paciente) => this.resultadoPaciente = paciente,
      error: (error: HttpErrorResponse) => this.mostrarError(error),
    });
  }

  mover(cita: Cita): void {
    const fechaHora = this.cambiosHora[cita.id];
    this.http.patch<Cita>(`${this.api}/citas/${cita.id}`, {
      fecha_hora_inicio: fechaHora,
    }, { headers: this.encabezados() }).subscribe({
      next: () => {
        this.mensaje = 'Cita movida correctamente';
        this.cargarAgendas();
      },
      error: (error: HttpErrorResponse) => this.mostrarError(error),
    });
  }

  cambiarEstado(cita: Cita, estado: string): void {
    this.http.put<Cita>(`${this.api}/citas/${cita.id}/estado`, { estado }, {
      headers: this.encabezados(),
    }).subscribe({
      next: () => {
        this.mensaje = 'Estado actualizado';
        this.cargarAgendas();
      },
      error: (error: HttpErrorResponse) => this.mostrarError(error),
    });
  }

  mostrarHora(valor: string): string {
    return valor.slice(11, 16);
  }

  private encabezados(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.token}` });
  }

  private fechaLocal(fecha: Date): string {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }

  private mostrarError(error: HttpErrorResponse): void {
    this.mensaje = error.error?.mensaje || 'No se pudo completar la solicitud';
  }
}
