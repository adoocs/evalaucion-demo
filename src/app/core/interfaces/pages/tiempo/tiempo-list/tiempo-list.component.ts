import { CommonModule } from '@angular/common';
import { Component, computed, Input, OnInit, signal, ViewChild } from '@angular/core';
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
import { Table, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { MessageToastService } from '../../../../../shared/utils/message-toast.service';
import { Tiempo } from '../../../../domain/tiempo.model';
import { TiempoCreateComponent } from '../tiempo-create/tiempo-create.component';
import { TiempoService } from '../../../../services/data-container.service';

interface Column {
  mw?: number
  field: string;
  header: string;
  customExportHeader?: string;
}

interface ExportColumn {
  title: string;
  dataKey: string;
}
@Component({
  selector: 'app-tiempo-list',
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
    TiempoCreateComponent
  ],
  providers: [MessageService, MessageToastService, TiempoService, ConfirmationService],
  templateUrl: './tiempo-list.component.html',
  styleUrl: './tiempo-list.component.scss'
})

export class TiempoListComponent implements OnInit {

  @Input() tiempoDialog: boolean = false;
  @ViewChild('dt') dt!: Table;

  tiempos = computed(() => this.tiempoService.data());

  selectedTiempos!: Tiempo[] | null;
  exportColumns!: ExportColumn[];
  cols!: Column[];
  tiempo!: Tiempo;
  submitted: boolean = false;
  title = '';
  editabled: boolean = false;

  constructor(
    private tiempoService: TiempoService,
    private messageService: MessageToastService,
    private confirmationService: ConfirmationService
  ) { }

  exportCSV() {
    this.dt.exportCSV();
  }

  ngOnInit() {
    this.tiempoService.loadInitialData();
    this.loadDataTable();
  }

  loadDataTable() {

    this.cols = [
      { field: 'descripcion', header: 'descripcion', customExportHeader: 'Tiempo Descripcion' },
      { mw: 30, field: 'id', header: 'Código' },
      { mw: 30, field: 'descripcion', header: 'Descripción' },
      { mw: 30, field: 'valor', header: 'Valor' }
    ];

    this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  openNew() {
    this.cleanTiempo();
    this.submitted = false;
    this.title = 'Crear nuevo tipo de tiempo';
    this.tiempoDialog = true;
  }

  editTiempo(tiempo: Tiempo) {
    this.tiempo = { ...tiempo };
    this.editabled = true;
    this.title = 'Editar tipo de tiempo';
    this.tiempoDialog = true;
  }

  submit() {

  }

  deleteSelectedTiempos() {
    this.confirmationService.confirm({
      message: '¿Deseas eliminar los tipos de tiempo seleccionados?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.selectedTiempos = null;
        this.messageService.successMessageToast('Éxito', 'Tiempos eliminados');
      }
    });
  }

  hideDialog(closed: boolean) {
    this.tiempoDialog = closed;
    this.submitted = false;
    this.editabled = false;
    if (!closed) {
      this.loadDataTable();
    }
  }

  deleteTiempo(tiempo: Tiempo) {
    this.tiempo = { ...tiempo };
    this.confirmationService.confirm({
      message: '¿Deseas eliminar ' + tiempo.descripcion + '?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.messageDelete();
        this.cleanTiempo();
      }
    });
  }

  messageDelete() {
    this.tiempoService.delete(this.tiempo.id).subscribe({
      next: () => {
        this.messageService.successMessageToast('Éxito', 'tiempo eliminado');
      }
    });
  }

  cleanTiempo() {
    this.tiempo = { id: 0, descripcion: '', valor: 0 };
  }

  messageCreate() {
    this.messageService.successMessageToast('Éxito', 'Tiempo creada correctamente');
  }

  messageEdit() {
    this.messageService.successMessageToast('Éxito', 'Tiempo editada correctamente');
  }

  messageError() {
    this.messageService.errorMessageToast('Error', 'No se pudo completar la acción');
  }

  switchMessageHandler(x: string) {
    switch (x) {
      case 'create': this.messageCreate(); break;
      case 'edit': ; this.messageEdit(); break;
      case 'error': ; this.messageError(); break;
      default: ; break;
    }
    this.loadDataTable();
  }
}
