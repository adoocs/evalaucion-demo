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
import { Periodo } from '../../../../domain/periodo.model';
import { PeriodoCreateComponent } from '../periodo-create/periodo-create.component';
import { LocalPeriodoService } from '../../../../services/local-data-container.service';

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
  selector: 'app-periodo-list',
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
    PeriodoCreateComponent
  ],
  providers: [MessageService, MessageToastService, LocalPeriodoService, ConfirmationService],
  templateUrl: './periodo-list.component.html',
  styleUrl: './periodo-list.component.scss'
})

export class PeriodoListComponent implements OnInit {

  @Input() periodoDialog: boolean = false;
  @ViewChild('dt') dt!: Table;

  periodos = computed(() => this.periodoService.data());
  selectedPeriodos!: Periodo[] | null;
  exportColumns!: ExportColumn[];
  cols!: Column[];
  periodo!: Periodo;
  submitted: boolean = false;
  title = '';
  editabled: boolean = false;

  constructor(
    private periodoService: LocalPeriodoService,
    private messageService: MessageToastService,
    private confirmationService: ConfirmationService
  ) { }

  exportCSV() {
    this.dt.exportCSV();
  }

  ngOnInit() {
    this.periodoService.loadInitialData();
    this.loadDataTable();
  }

  loadDataTable() {

    this.cols = [
      { field: 'descripcion', header: 'descripcion', customExportHeader: 'Periodo Descripción' },
      { mw: 30, field: 'id', header: 'Código' },
      { mw: 30, field: 'descripcion', header: 'Descripción' }
    ];

    this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  openNew() {
    this.cleanPeriodo();
    this.submitted = false;
    this.title = 'Crear nuevo tipo de periodo';
    this.periodoDialog = true;
  }

  editPeriodo(periodo: Periodo) {
    this.periodo = { ...periodo };
    this.editabled = true;
    this.title = 'Editar tipo de periodo';
    this.periodoDialog = true;
  }

  submit() {

  }

  deleteSelectedPeriodos() {
    this.confirmationService.confirm({
      message: '¿Deseas eliminar los tipos de periodo seleccionados?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.selectedPeriodos = null;
        this.messageService.successMessageToast('Éxito', 'Periodos eliminados');
      }
    });
  }

  hideDialog(closed: boolean) {
    this.periodoDialog = closed;
    this.submitted = false;
    this.editabled  = false;
    if (!closed) {
      this.loadDataTable();
    }
  }

  deletePeriodo(periodo: Periodo) {
    this.periodo = { ...periodo };
    this.confirmationService.confirm({
      message: '¿Deseas eliminar ' + periodo.descripcion + '?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.messageDelete();
        this.cleanPeriodo();
      }
    });
  }

  messageDelete() {
    this.periodoService.delete(this.periodo.id).subscribe({
      next: () => {
        this.messageService.successMessageToast('Éxito', 'periodo eliminado');
      }
    });
  }

  cleanPeriodo() {
    this.periodo = {id: 0, descripcion: '' };
  }

  messageCreate() {
    this.messageService.successMessageToast('Éxito', 'Periodo creada correctamente');
  }

  messageEdit() {
    this.messageService.successMessageToast('Éxito', 'Periodo editada correctamente');
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
