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
import { Tasa } from '../../../../domain/tasa.model';
import { TasaCreateComponent } from '../tasa-create/tasa-create.component';
import { LocalTasaService } from '../../../../services/local-data-container.service';

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
  selector: 'app-tasa-list',
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
    TasaCreateComponent
  ],
  providers: [MessageService, MessageToastService, LocalTasaService, ConfirmationService],
  templateUrl: './tasa-list.component.html',
  styleUrl: './tasa-list.component.scss'
})

export class TasaListComponent implements OnInit {

  @Input() tasaDialog: boolean = false;
  @ViewChild('dt') dt!: Table;

  tasas = computed(() => this.tasaService.data());
  selectedTasas!: Tasa[] | null;
  exportColumns!: ExportColumn[];
  cols!: Column[];
  tasa!: Tasa;
  submitted: boolean = false;
  title = '';
  editabled: boolean = false;

  constructor(
    private tasaService: LocalTasaService,
    private messageService: MessageToastService,
    private confirmationService: ConfirmationService
  ) { }

  exportCSV() {
    this.dt.exportCSV();
  }

  ngOnInit() {
    this.loadDataTable();
    this.tasaService.loadInitialData();
  }

  loadDataTable() {

    this.cols = [
      { field: 'porcentaje', header: 'porcentaje', customExportHeader: 'Tasa Porcentaje' },
      { mw: 30, field: 'id', header: 'Código' },
      { mw: 30, field: 'porcentaje', header: 'Porcentaje' }
    ];

    this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  openNew() {
    this.cleanTasa();
    this.submitted = false;
    this.title = 'Crear nuevo tipo de tasa';
    this.tasaDialog = true;
  }

  editTasa(tasa: Tasa) {
    this.tasa = { ...tasa };
    this.editabled = true;
    this.title = 'Editar tipo de tasa';
    this.tasaDialog = true;
  }

  submit() {

  }

  deleteSelectedTasas() {
    this.confirmationService.confirm({
      message: '¿Deseas eliminar los tipos de tasa seleccionados?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.selectedTasas = null;
        this.messageService.successMessageToast('Éxito', 'Tasas eliminados');
      }
    });
  }

  hideDialog(closed: boolean) {
    this.tasaDialog = closed;
    this.submitted = false;
    this.editabled  = false;
    if (!closed) {
      this.loadDataTable();
    }
  }

  deleteTasa(tasa: Tasa) {
    this.tasa = { ...tasa };
    this.confirmationService.confirm({
      message: '¿Deseas eliminar ' + tasa.porcentaje + '?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.messageDelete();
        this.cleanTasa();
      }
    });
  }

  messageDelete() {
    this.tasaService.delete(this.tasa.id).subscribe({
      next: () => {
        this.messageService.successMessageToast('Éxito', 'tasa eliminado');
      }
    });
  }

  cleanTasa() {
    this.tasa = {id: 0, porcentaje: 0 };
  }

  messageCreate() {
    this.messageService.successMessageToast('Éxito', 'Tasa creada correctamente');
  }

  messageEdit() {
    this.messageService.successMessageToast('Éxito', 'Tasa editada correctamente');
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
