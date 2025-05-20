import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class MessageToastService {

  constructor(private messageService: MessageService) { }

  /**
   * Limpia todos los mensajes toast actuales
   */
  clearToasts() {
    this.messageService.clear();
  }

  private baseMessageToast(sev: string, sum: string, det: string) {
    // Limpiar mensajes anteriores para evitar duplicados
    this.clearToasts();
    this.messageService.add({ severity: sev, summary: sum, detail: det, life: 3000 });
  }

  successMessageToast(sum: string, det: string) {
    this.baseMessageToast('success', sum, det);
  }

  infoMessageToast(sum: string, det: string) {
    this.baseMessageToast('info', sum, det);
  }

  warnMessageToast(sum: string, det: string) {
    this.baseMessageToast('warn', sum, det);
  }

  errorMessageToast(sum: string, det: string) {
    this.baseMessageToast('error', sum, det);
  }
}
