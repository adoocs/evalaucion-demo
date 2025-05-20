import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class LocalMessageToastService {

  constructor(private messageService: MessageService) { }

  /**
   * Muestra un mensaje de éxito
   * @param summary Título del mensaje
   * @param detail Detalle del mensaje
   */
  success(summary: string, detail: string): void {
    this.messageService.add({
      severity: 'success',
      summary,
      detail
    });
  }

  /**
   * Muestra un mensaje de error
   * @param summary Título del mensaje
   * @param detail Detalle del mensaje
   */
  error(summary: string, detail: string): void {
    this.messageService.add({
      severity: 'error',
      summary,
      detail
    });
  }

  /**
   * Muestra un mensaje de información
   * @param summary Título del mensaje
   * @param detail Detalle del mensaje
   */
  info(summary: string, detail: string): void {
    this.messageService.add({
      severity: 'info',
      summary,
      detail
    });
  }

  /**
   * Muestra un mensaje de advertencia
   * @param summary Título del mensaje
   * @param detail Detalle del mensaje
   */
  warn(summary: string, detail: string): void {
    this.messageService.add({
      severity: 'warn',
      summary,
      detail
    });
  }
}
