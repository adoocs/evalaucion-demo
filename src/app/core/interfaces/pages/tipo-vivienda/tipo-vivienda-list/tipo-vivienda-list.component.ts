import { CommonModule } from '@angular/common';
import { Component, computed, Input, OnInit, ViewChild } from '@angular/core';
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
import { TipoVivienda } from '../../../../domain/tipo-vivienda.model';
import { TipoViviendaCreateComponent } from '../tipo-vivienda-create/tipo-vivienda-create.component';
import { LocalTipoViviendaService } from '../../../../services/local-data-container.service';

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
  selector: 'app-tipo-vivienda-list',
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
    TipoViviendaCreateComponent
  ],
  providers: [MessageService, MessageToastService, LocalTipoViviendaService, ConfirmationService],
  templateUrl: './tipo-vivienda-list.component.html',
  styleUrl: './tipo-vivienda-list.component.scss'
})

export class TipoViviendaListComponent implements OnInit {

  @Input() tipoViviendaDialog: boolean = false;
  @ViewChild('dt') dt!: Table;

  tipoViviendas = computed(() => this.tipoViviendaService.data());
  selectedtipoViviendas!: TipoVivienda[] | null;
  exportColumns!: ExportColumn[];
  cols!: Column[];
  tipoVivienda!: TipoVivienda;
  submitted: boolean = false;
  title = '';
  editabled: boolean = false;

  constructor(
    private tipoViviendaService: LocalTipoViviendaService,
    private messageService: MessageToastService,
    private confirmationService: ConfirmationService
  ) { }

  exportCSV() {
    this.dt.exportCSV();
  }

  ngOnInit() {
    this.tipoViviendaService.loadInitialData();
    this.loadDataTable();
  }

  loadDataTable() {
    this.cols = [
      { field: 'descripcion', header: 'descripcion', customExportHeader: 'Tipo Vivienda Descripción' },
      { mw: 30, field: 'id', header: 'Código' },
      { mw: 30, field: 'descripcion', header: 'Descripción' }
    ];

    this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  openNew() {
    this.cleanTipoVivienda();
    this.submitted = false;
    this.title = 'Crear nuevo tipo de vivienda';
    this.tipoViviendaDialog = true;
  }

  editTipoVivienda(tipoVivienda: TipoVivienda) {
    this.tipoVivienda = { ...tipoVivienda };
    this.editabled = true;
    this.title = 'Editar tipo de vivienda';
    this.tipoViviendaDialog = true;
  }

  submit() {

  }

  deleteSelectedTipoViviendas() {
    this.confirmationService.confirm({
      message: '¿Deseas eliminar los tipos de tipo Vivienda seleccionados?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.selectedtipoViviendas = null;
        this.messageService.successMessageToast('Éxito', 'Tipos de viviendas eliminados');
      }
    });
  }

  hideDialog(closed: boolean) {
    this.tipoViviendaDialog = closed;
    this.submitted = false;
    this.editabled  = false;
    if (!closed) {
      this.loadDataTable();
    }
  }

  deleteTipoVivienda(tipoVivienda: TipoVivienda) {
    this.tipoVivienda = { ...tipoVivienda };
    this.confirmationService.confirm({
      message: '¿Deseas eliminar ' + tipoVivienda.descripcion + '?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.messageDelete();
        this.cleanTipoVivienda();
      }
    });
  }

  messageDelete() {
    this.tipoViviendaService.delete(this.tipoVivienda.id).subscribe({
      next: () => {
        this.messageService.successMessageToast('Éxito', 'tipo Vivienda eliminado');
      }
    });
  }

  cleanTipoVivienda() {
    this.tipoVivienda = {id: 0, descripcion: '' };
  }

  messageCreate() {
    this.messageService.successMessageToast('Éxito', 'tipo Vivienda creada correctamente');
  }

  messageEdit() {
    this.messageService.successMessageToast('Éxito', 'tipo Vivienda editada correctamente');
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
