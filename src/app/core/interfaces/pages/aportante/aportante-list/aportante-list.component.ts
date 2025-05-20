import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, signal, ViewChild } from '@angular/core';
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
import { Aportante } from '../../../../domain/aportante.model';
import { AportanteCreateComponent } from '../aportante-create/aportante-create.component';
import { LocalAportanteService } from '../../../../services/local-data-container.service';


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
  selector: 'app-aportante-list',
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
    AportanteCreateComponent
  ],
  providers: [MessageService, MessageToastService, LocalAportanteService, ConfirmationService],
  templateUrl: './aportante-list.component.html',
  styleUrl: './aportante-list.component.scss'
})

export class AportanteListComponent implements OnInit {

  @Input() aportanteDialog: boolean = false;
  @ViewChild('dt') dt!: Table;

  aportantes = signal<Aportante[]>([]);
  selectedAportantes!: Aportante[] | null;
  exportColumns!: ExportColumn[];
  cols!: Column[];
  aportante!: Aportante;
  submitted: boolean = false;
  title = '';
  editabled: boolean = false;

  constructor(
    private AportanteService: LocalAportanteService,
    private messageService: MessageToastService,
    private confirmationService: ConfirmationService
  ) { }

  exportCSV() {
    this.dt.exportCSV();
  }

  ngOnInit() {
    this.loadDataTable();
  }

  loadDataTable() {
    this.AportanteService.loadInitialData();
    this.aportantes.set(this.AportanteService.data());

    this.cols = [
      { field: 'descripcion', header: 'descripcion', customExportHeader: 'Aportante Descripción' },
      { mw: 30, field: 'id', header: 'Código' },
      { mw: 30, field: 'descripcion', header: 'Descripción' }
    ];

    this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  openNew() {
    this.cleanAportante();
    this.submitted = false;
    this.title = 'Crear nuevo tipo de aportante';
    this.aportanteDialog = true;
  }

  editAportante(aportante: Aportante) {
    this.aportante = { ...aportante };
    this.editabled = true;
    this.title = 'Editar tipo de aportante';
    this.aportanteDialog = true;
  }

  submit() {

  }

  deleteSelectedAportantes() {
    this.confirmationService.confirm({
      message: '¿Deseas eliminar los tipos de aportante seleccionados?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.aportantes.set(this.aportantes().filter((val) => !this.selectedAportantes?.includes(val)));
        this.selectedAportantes = null;
        this.messageService.successMessageToast('Éxito', 'Aportantes eliminados');
      }
    });
  }

  hideDialog(closed: boolean) {
    this.aportanteDialog = closed;
    this.submitted = false;
    this.editabled  = false;
    if (!closed) {
      this.loadDataTable();
    }
  }

  deleteAportante(aportante: Aportante) {
    this.aportante = { ...aportante };
    this.confirmationService.confirm({
      message: '¿Deseas eliminar ' + aportante.descripcion + '?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.aportantes.set(this.aportantes().filter((val) => val.id !== aportante.id));
        this.messageDelete();
        this.cleanAportante();
      }
    });
  }

  messageDelete() {
    this.AportanteService.delete(this.aportante.id).subscribe({
      next: () => {
        this.messageService.successMessageToast('Éxito', 'aportante eliminado');
      }
    });
  }

  cleanAportante() {
    this.aportante = {id: 0, descripcion: '' };
  }

  messageCreate() {
    this.messageService.successMessageToast('Éxito', 'Aportante creada correctamente');
  }

  messageEdit() {
    this.messageService.successMessageToast('Éxito', 'Aportante editada correctamente');
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
