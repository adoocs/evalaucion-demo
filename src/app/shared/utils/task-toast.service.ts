import { Injectable, Optional } from '@angular/core';
import { MessageService } from 'primeng/api';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Task {
  id: string;
  descripcion: string;
  completada: boolean;
}

// Asegurarnos de que el servicio se proporcione en el módulo raíz
@Injectable({
  providedIn: 'root'
})
export class TaskToastService {
  private static readonly TOAST_KEY = 'task-toast';
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  private toastVisible = false;

  constructor(@Optional() private messageService: MessageService) {
    // Si messageService no está disponible, mostrar una advertencia
    if (!messageService) {
      console.warn('MessageService no está disponible. El toast de tareas no funcionará correctamente.');
    }
  }

  /**
   * Actualiza la lista de tareas pendientes
   * @param tasks Lista de tareas
   */
  updateTasks(tasks: Task[]): void {
    this.tasksSubject.next(tasks);
    this.updateToast();
  }

  /**
   * Obtiene la lista de tareas pendientes como Observable
   */
  getTasks(): Observable<Task[]> {
    return this.tasksSubject.asObservable();
  }

  /**
   * Actualiza el toast con las tareas pendientes
   */
  private updateToast(): void {
    // Si messageService no está disponible, no hacer nada
    if (!this.messageService) {
      console.warn('MessageService no está disponible. No se puede actualizar el toast de tareas.');
      return;
    }

    try {
      // Obtener solo las tareas no completadas
      const pendingTasks = this.tasksSubject.value.filter(task => !task.completada);

      // Si no hay tareas pendientes, ocultar el toast
      if (pendingTasks.length === 0) {
        if (this.toastVisible) {
          this.messageService.clear(TaskToastService.TOAST_KEY);
          this.toastVisible = false;
        }
        return;
      }

      // Crear el mensaje con las tareas pendientes
      const message = this.createTaskMessage(pendingTasks);

      // Mostrar o actualizar el toast
      if (this.toastVisible) {
        this.messageService.clear(TaskToastService.TOAST_KEY);
      }

      this.messageService.add({
        key: TaskToastService.TOAST_KEY,
        severity: 'info',
        summary: 'Tareas pendientes',
        detail: message,
        sticky: true
      });

      this.toastVisible = true;
    } catch (error) {
      console.error('Error al actualizar el toast de tareas:', error);
    }
  }

  /**
   * Crea el mensaje con las tareas pendientes
   * @param tasks Lista de tareas pendientes
   */
  private createTaskMessage(tasks: Task[]): string {
    if (tasks.length === 0) {
      return 'No hay tareas pendientes.';
    }

    // Crear un mensaje con formato de texto plano para evitar problemas con HTML
    return tasks.map(task => `• ${task.descripcion}`).join('\n\n') +
           '\n\n------------------------------\nComplete estas tareas para continuar.';
  }

  /**
   * Cierra el toast de tareas
   */
  clearToast(): void {
    // Si messageService no está disponible, no hacer nada
    if (!this.messageService) {
      console.warn('MessageService no está disponible. No se puede cerrar el toast de tareas.');
      return;
    }

    try {
      this.messageService.clear(TaskToastService.TOAST_KEY);
      this.toastVisible = false;
    } catch (error) {
      console.error('Error al cerrar el toast de tareas:', error);
    }
  }
}
