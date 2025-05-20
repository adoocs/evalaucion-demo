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
import { Denominacion } from '../../../../domain/denominacion.model';
import { DenominacionCreateComponent } from '../denominacion-create/denominacion-create.component';

import { SectorEconomico } from '../../../../domain/sector-economico.model';
import { DenominacionService, SectorEconomicoService } from '../../../../services/data-container.service';

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
  selector: 'app-denominacion-list',
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
    DenominacionCreateComponent
  ],
  providers: [MessageService, MessageToastService, DenominacionService, ConfirmationService],
  templateUrl: './denominacion-list.component.html',
  styleUrl: './denominacion-list.component.scss'
})

export class DenominacionListComponent implements OnInit {

  @Input() denominacionDialog: boolean = false;
  @ViewChild('dt') dt!: Table;

  denominacions = signal<Denominacion[]>([]);
  allDenominacions = computed(() => this.denominacionService.data());
  denominacion: Denominacion = { id: 0, descripcion: '', sector_economico: { id: 0, descripcion: '' } };
  selectedDenominacions!: Denominacion[] | null;
  submitted: boolean = false;
  clearOption = computed(() => [{ descripcion: 'Todos', id: 0 }, ...this.sectoreconomicoService.data()]);
  selectedSectorEconomico: SectorEconomico | null = this.clearOption()[0];
  sectorEconomicosList: any[] = [];
  exportColumns!: ExportColumn[];
  cols!: Column[];
  editabled: boolean = false;
  title = '';
  loading: boolean = true;

  constructor(
    private denominacionService: DenominacionService,
    private sectoreconomicoService: SectorEconomicoService,
    private messageService: MessageToastService,
    private confirmationService: ConfirmationService
  ) { }

  exportCSV() {
    this.dt.exportCSV();
  }

  ngOnInit() {
    this.sectoreconomicoService.loadInitialData();
    this.denominacionService.loadInitialData();
    this.loadDataTable();
  }

  loadDataTable() {

    this.cols = [
      { field: 'id', header: 'Codigo', customExportHeader: 'Denominacion Codigo' },
      { mw: 30, field: 'id', header: 'Nombres' },
      { mw: 30, field: 'descripcion', header: 'Descripcion' },
      { mw: 12, field: 'sector_economico.descripcion', header: 'Sector Económico' }
    ];

    this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  openNew() {
    this.cleanDenominacion();
    this.submitted = false;
    this.denominacionDialog = true;
    this.title = 'Crear nuevo denominacion';
  }

  editDenominacion(denominacion: Denominacion) {
    this.editabled  = true;
    this.denominacionService.getById(denominacion.id).subscribe({
      next: (data) => {
        this.denominacion = data;
        this.denominacionDialog = true;
      }
    }
    )
  }

  submit() {
  }

  deleteSelectedDenominacions() {
    this.confirmationService.confirm({
      message: '¿Deseas eliminar los denominaciones seleccionados?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.denominacions.set(this.denominacions().filter((val) => !this.selectedDenominacions?.includes(val)));
        this.selectedDenominacions = null;
        this.messageService.successMessageToast('Éxito', 'Denominaciones eliminadas');
      }
    });
  }

  hideDialog(closed: boolean) {
    this.submitted = false;
    this.editabled  = false;
    if (!closed) {
      this.loadDataTable();
    }
    this.denominacionDialog = closed;
  }

  onSectorEconomicoChange() {
    if (this.selectedSectorEconomico === null || this.selectedSectorEconomico.descripcion === 'Todos') {
      this.denominacions.set(this.allDenominacions());
    } else {
      const filtered = this.allDenominacions().filter(emp => emp.sector_economico?.descripcion === this.selectedSectorEconomico?.descripcion);
      this.denominacions.set(filtered);
    }
  }

  clearFilter() {
    this.selectedSectorEconomico = null;
    this.denominacions.set(this.allDenominacions());
  }

  deletedenominacion(denominacion: Denominacion) {
    this.denominacion = { ...denominacion };
    this.confirmationService.confirm({
      message: '¿Deseas eliminar ' + denominacion.descripcion + '?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.denominacions.set(this.denominacions().filter((val) => val.id !== denominacion.id));
        this.messageDelete();
        this.cleanDenominacion();
      }
    });
  }

  messageDelete() {
    this.denominacionService.delete(this.denominacion.id).subscribe({
      next: () => {
        this.messageService.successMessageToast('Éxito', 'Denominacion eliminada');
      }
    });
  }

  cleanDenominacion() {
    this.denominacion = {id: 0, descripcion: '', sector_economico: {id: 0, descripcion: ''}};
  }

  messageCreate() {
    this.messageService.successMessageToast('Éxito', 'Denominacion creada correctamente');
  }

  messageEdit() {
    this.messageService.successMessageToast('Éxito', 'Denominacion editada correctamente');
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
