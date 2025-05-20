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
import { SectorEconomico } from '../../../../domain/sector-economico.model';
import { SectorEconomicoCreateComponent } from '../sector-economico-create/sector-economico-create.component';
import { SectorEconomicoService } from '../../../../services/data-container.service';

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
  selector: 'app-sector-economico-list',
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
    SectorEconomicoCreateComponent
  ],
  providers: [MessageService, MessageToastService, SectorEconomicoService, ConfirmationService],
  templateUrl: './sector-economico-list.component.html',
  styleUrl: './sector-economico-list.component.scss'
})

export class SectorEconomicoListComponent implements OnInit {

  @Input() sectorEconomicoDialog: boolean = false;
  @ViewChild('dt') dt!: Table;

  sectorEconomicos = computed(() => this.sectorEconomicoService.data());
  selectedSectorEconomicos!: SectorEconomico[] | null;
  exportColumns!: ExportColumn[];
  cols!: Column[];
  sectorEconomico!: SectorEconomico;
  submitted: boolean = false;
  title = '';
  editabled: boolean = false;

  constructor(
    private sectorEconomicoService: SectorEconomicoService,
    private messageService: MessageToastService,
    private confirmationService: ConfirmationService
  ) { }

  exportCSV() {
    this.dt.exportCSV();
  }

  ngOnInit() {
    this.sectorEconomicoService.loadInitialData();
    this.loadDataTable();
  }

  loadDataTable() {
    this.cols = [
      { field: 'descripcion', header: 'descripcion', customExportHeader: 'sectorEconomico Descripción' },
      { mw: 30, field: 'id', header: 'Código' },
      { mw: 30, field: 'descripcion', header: 'Descripción' }
    ];

    this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  openNew() {
    this.cleanSectorEconomico();
    this.submitted = false;
    this.title = 'Crear nuevo tipo de sector economico';
    this.sectorEconomicoDialog = true;
  }

  editSectorEconomico(sectorEconomico: SectorEconomico) {
    this.sectorEconomico = { ...sectorEconomico };
    this.editabled = true;
    this.title = 'Editar tipo de sector economico';
    this.sectorEconomicoDialog = true;
  }

  submit() {

  }
  
  deleteSelectedsectorEconomicos() {
    this.confirmationService.confirm({
      message: '¿Deseas eliminar los tipos de sector economico seleccionados?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.selectedSectorEconomicos = null;
        this.messageService.successMessageToast('Éxito', 'Sector Economicos eliminados');
      }
    });
  }

  hideDialog(closed: boolean) {
    this.sectorEconomicoDialog = closed;
    this.submitted = false;
    this.editabled  = false;
    if (!closed) {
      this.loadDataTable();
    }
  }

  deleteSectorEconomico(sectorEconomico: SectorEconomico) {
    this.sectorEconomico = { ...sectorEconomico };
    this.confirmationService.confirm({
      message: '¿Deseas eliminar ' + sectorEconomico.descripcion + '?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.messageDelete();
        this.cleanSectorEconomico();
      }
    });
  }

  messageDelete() {
    this.sectorEconomicoService.delete(this.sectorEconomico.id).subscribe({
      next: () => {
        this.messageService.successMessageToast('Éxito', 'sectorEconomico eliminado');
      }
    });
  }

  cleanSectorEconomico() {
    this.sectorEconomico = {id: 0, descripcion: '' };
  }

  messageCreate() {
    this.messageService.successMessageToast('Éxito', 'Sector Económico creado correctamente');
  }

  messageEdit() {
    this.messageService.successMessageToast('Éxito', 'Sector Económico editado correctamente');
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
