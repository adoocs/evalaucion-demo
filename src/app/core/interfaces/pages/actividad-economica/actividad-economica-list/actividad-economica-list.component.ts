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
import { ActividadEconomica } from '../../../../domain/actividad-economica.model';
import { ActividadEconomicaCreateComponent } from '../actividad-economica-create/actividad-economica-create.component';
import { SectorEconomico } from '../../../../domain/sector-economico.model';
import { LocalActividadEconomicaService, LocalSectorEconomicoService } from '../../../../services/local-data-container.service';

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
  selector: 'app-actividad-economica-list',
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
    ActividadEconomicaCreateComponent
  ],
  providers: [MessageService, MessageToastService, LocalActividadEconomicaService, ConfirmationService],
  templateUrl: './actividad-economica-list.component.html',
  styleUrl: './actividad-economica-list.component.scss'
})

export class ActividadEconomicaListComponent implements OnInit {

  @Input() actividadEconomicaDialog: boolean = false;
  @ViewChild('dt') dt!: Table;

  actividadEconomicas = signal<ActividadEconomica[]>([]);
  actividadEconomica: ActividadEconomica = { id: 0, descripcion: '', sector_economico: { id: 0, descripcion: '' } };
  selectedActividadEconomicas!: ActividadEconomica[] | null;
  submitted: boolean = false;
  selectedSectorEconomico: SectorEconomico | null = null;
  allActividadEconomicas = computed(() => [...this.actividadEconomicaService.data()]);
  clearOption = computed(() => [...this.sectoreconomicoService.data()]);

  exportColumns!: ExportColumn[];
  cols!: Column[];
  editabled: boolean = false;
  title = '';
  loading: boolean = true;

  constructor(
    private actividadEconomicaService: LocalActividadEconomicaService,
    private sectoreconomicoService: LocalSectorEconomicoService,
    private messageService: MessageToastService,
    private confirmationService: ConfirmationService
  ) { }

  exportCSV() {
    this.dt.exportCSV();
  }

  ngOnInit() {
    this.sectoreconomicosload();
    this.selectedSectorEconomico = this.clearOption()[0];
  }

  sectoreconomicosload() {
    this.sectoreconomicoService.loadInitialData();
    this.actividadEconomicaService.loadInitialData();
    this.loadDataTable();
  }

  loadDataTable() {
    this.cols = [
      { field: 'id', header: 'Codigo', customExportHeader: 'Actividad Economica Codigo' },
      { mw: 30, field: 'descripcion', header: 'Descripcion' },
      { mw: 12, field: 'sector_economico.descripcion', header: 'Sector Económico' }
    ];

    this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  openNew() {
    this.cleanActividadEconomica();
    this.submitted = false;
    this.actividadEconomicaDialog = true;
    this.title = 'Crear nuevo Actividad Económica';
  }

  editActividadEconomica(actividadEconomica: ActividadEconomica) {
    this.editabled = true;
    this.actividadEconomicaService.getById(actividadEconomica.id).subscribe({
      next: (data) => {
        this.actividadEconomica = data;
        this.actividadEconomicaDialog = true;
      }
    }
    )
  }

  submit() {
  }

  deleteSelectedActividadEconomicas() {
    this.confirmationService.confirm({
      message: '¿Deseas eliminar los actividad económica seleccionados?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.actividadEconomicas.set(this.actividadEconomicas().filter((val) => !this.selectedActividadEconomicas?.includes(val)));
        this.selectedActividadEconomicas = null;
        this.messageService.successMessageToast('Éxito', 'Actividades económicas eliminadas');
      }
    });
  }

  hideDialog(closed: boolean) {
    this.submitted = false;
    this.editabled = false;
    if (!closed) {
      this.loadDataTable();
    }
    this.actividadEconomicaDialog = closed;
  }

  onSectorEconomicoChange() {
    if (this.selectedSectorEconomico === null || this.selectedSectorEconomico.descripcion === 'Todos') {
      this.actividadEconomicas.set(this.allActividadEconomicas());
    } else {
      const filtered = this.allActividadEconomicas().filter((emp: any) => emp.sector_economico_id === this.selectedSectorEconomico?.id);
      this.actividadEconomicas.set(filtered);
    }
  }

  clearFilter() {
    this.selectedSectorEconomico = null;
    this.actividadEconomicas.set(this.allActividadEconomicas());
  }

  deleteactividadEconomica(actividadEconomica: ActividadEconomica) {
    this.actividadEconomica = { ...actividadEconomica };
    this.confirmationService.confirm({
      message: '¿Deseas eliminar ' + actividadEconomica.descripcion + '?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.actividadEconomicas.set(this.actividadEconomicas().filter((val) => val.id !== actividadEconomica.id));
        this.messageDelete();
        this.cleanActividadEconomica();
      }
    });
  }

  messageDelete() {
    this.actividadEconomicaService.delete(this.actividadEconomica.id).subscribe({
      next: () => {
        this.messageService.successMessageToast('Éxito', 'actividadEconomica eliminado');
      }
    });
  }

  cleanActividadEconomica() {
    this.actividadEconomica = { id: 0, descripcion: '', sector_economico: { id: 0, descripcion: '' } };
  }

  messageCreate() {
    this.messageService.successMessageToast('Éxito', 'Actividad Económica creada correctamente');
  }

  messageEdit() {
    this.messageService.successMessageToast('Éxito', 'Actividad Económica editada correctamente');
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
