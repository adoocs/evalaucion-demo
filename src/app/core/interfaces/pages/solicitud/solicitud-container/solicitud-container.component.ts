import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { MessageToastService } from '../../../../../shared/utils/message-toast.service';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SolicitudPanelComponent } from '../solicitud-panel/solicitud-panel.component';
import { LocalSolicitudService } from '../../../../services/local-data-container.service';
import { Solicitud } from '../../../../domain/solicitud.model';

@Component({
  selector: 'app-solicitud-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    FormsModule,
    ButtonModule,
    ToastModule,
    ToolbarModule,
    InputTextModule,
    SelectModule,
    InputNumberModule,
    DialogModule,
    InputIconModule,
    IconFieldModule,
    ConfirmDialogModule,
    ToggleSwitchModule,
    SolicitudPanelComponent
  ],
  providers: [MessageService, MessageToastService, ConfirmationService],
  templateUrl: './solicitud-container.component.html',
  styleUrl: './solicitud-container.component.scss'
})

export class SolicitudContainerComponent implements OnInit {
  solicitudes = signal<Solicitud[]>([]);
  selectedSolicitud: Solicitud | null = null;
  displaySolicitudDialog: boolean = false;
  loading: boolean = true;

  constructor(
    private solicitudService: LocalSolicitudService,
    private messageService: MessageToastService
  ) {}

  ngOnInit(): void {
    this.loadSolicitudes();
  }

  loadSolicitudes(): void {
    this.loading = true;
    this.solicitudService.loadInitialData();

    // Esperar un momento para simular la carga
    setTimeout(() => {
      this.solicitudes.set(this.solicitudService.data());
      this.loading = false;

      // Mostrar mensaje de bienvenida
      this.messageService.infoMessageToast(
        'Datos cargados',
        'Se han cargado las solicitudes de ejemplo. Esta es una versión demo con datos locales.'
      );
    }, 1000);
  }

  openNew(): void {
    this.selectedSolicitud = null;
    this.displaySolicitudDialog = true;
  }

  editSolicitud(solicitud: Solicitud): void {
    this.selectedSolicitud = { ...solicitud };
    this.displaySolicitudDialog = true;
  }

  hideDialog(): void {
    this.displaySolicitudDialog = false;
  }
}
