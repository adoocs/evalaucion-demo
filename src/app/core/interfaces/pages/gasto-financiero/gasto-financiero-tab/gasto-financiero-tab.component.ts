import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, Input, OnInit, Output, signal, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
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
import { GastoFinanciero } from '../../../../domain/gasto-financiero.model';
import { PanelModule } from 'primeng/panel';
import { CheckboxModule } from 'primeng/checkbox';
import { LocalGastoFinancieroService, LocalPeriodoService } from '../../../../services/local-data-container.service';

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
  selector: 'app-gasto-financiero-tab',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    FormsModule,
    ReactiveFormsModule,
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
    PanelModule,
    CheckboxModule
  ],
  providers: [MessageService, MessageToastService, LocalGastoFinancieroService, ConfirmationService, LocalPeriodoService],
  templateUrl: './gasto-financiero-tab.component.html',
  styleUrl: './gasto-financiero-tab.component.scss'
})

export class GastoFinancieroTabComponent implements OnInit {

  @Input() gastoFinancieroDialog: boolean = false;
  @ViewChild('dt') dt!: Table;
  @Output() switchMessage = new EventEmitter<string>();
  @Output() validationChange = new EventEmitter<boolean>();

  periodos = computed(() => this.periodoService.data());
  gastoFinancieros = signal<GastoFinanciero[]>([]);
  selectedGastoFinancieros!: GastoFinanciero[] | null;
  exportColumns!: ExportColumn[];
  cols!: Column[];
  gastoFinanciero!: GastoFinanciero;
  submitted: boolean = false;
  title = '';
  editabled: boolean = false;
  gastoFinancieroList: GastoFinanciero[] = [];

  omitirGastoFinanciero: boolean = false;

  /**
   * Alterna el estado de omisión del gasto financiero
   */
  toggleOmitirGastoFinanciero(): void {
    // Invertir el estado actual
    this.omitirGastoFinanciero = !this.omitirGastoFinanciero;
    this.confirmarOmision();
  }

  errorNCuotas: string = '';
  errorMontoCuota: string = '';
  errorMontoCredito: string = '';

  gastoFinancieroForm: FormGroup;

  constructor(
    private gastoFinancieroService: LocalGastoFinancieroService,
    private messageService: MessageToastService,
    private periodoService: LocalPeriodoService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder
  ) {
    this.gastoFinancieroForm = this.fb.group({
      omitido: [false]
    });
  }

  exportCSV() {
    this.dt.exportCSV();
  }

  ngOnInit() {
    this.loadDataTable();
    this.periodoService.loadInitialData();
  }

  /**
   * Maneja el evento de edición de celda
   * @param event El evento de edición de celda
   */
  onCellEditComplete(event: any) {
    const { data, field } = event;

    // Validar todos los campos después de la edición
    this.validarNCuotas(data);
    this.validarMontoCuota(data);
    this.validarMontoCredito(data);

    switch (field) {
      case 'n_pagadas':
      case 'n_total':
        if (data.n_pagadas > data.n_total) {
          this.messageService.warnMessageToast(
            'Error en Cuotas',
            'El número de cuotas pagadas no puede ser mayor al número total de cuotas'
          );
        }
        break;
      case 'monto_cuota':
        if (data.monto_cuota > data.saldo_credito) {
          this.messageService.warnMessageToast(
            'Error en Monto Cuota',
            'El monto de la cuota no puede ser mayor al saldo del crédito'
          );
        }
        break;
      case 'monto_credito':
      case 'saldo_credito':
        if (data.monto_credito < data.saldo_credito) {
          this.messageService.warnMessageToast(
            'Error en Monto Crédito',
            'El monto del crédito no puede ser menor al saldo del crédito'
          );
        }
        if (data.monto_cuota > data.saldo_credito) {
          this.messageService.warnMessageToast(
            'Error en Monto Cuota',
            'El monto de la cuota no puede ser mayor al saldo del crédito'
          );
        }
        break;
    }
    this.validationChange.emit(this.isFormComplete());
  }

  loadDataTable() {

    this.cols = [
      { field: 'institucion', header: 'institucion', customExportHeader: 'gastoFinanciero institucion' },
      { mw: 30, field: 'id', header: 'Código' },
      { mw: 30, field: 'institucion', header: 'Institucion' },
      { mw: 30, field: 'monto_credito', header: 'Monto Crédito' },
      { mw: 30, field: 'n_pagadas', header: 'N° Pagadas' },
      { mw: 30, field: 'n_total', header: 'N° Total' },
      { mw: 30, field: 'periodo.descripcion', header: 'Periodo' },
      { mw: 30, field: 'monto_cuota', header: 'Monto Cuota' },
      { mw: 30, field: 'saldo_credito', header: 'Saldo Crédito' },
      { mw: 30, field: 'tarjeta', header: 'Tarjeta' },
      { mw: 30, field: 'comentario', header: 'Comentario' }
    ];

    this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  openNew() {
    this.cleanGastoFinanciero();
    this.submitted = false;
    this.title = 'Crear nuevo gasto financiero';
    this.gastoFinancieroDialog = true;
  }

  submit() {

  }

  deleteSelectedgastoFinancieros() {
    this.confirmationService.confirm({
      message: '¿Deseas eliminar los gastos financieros seleccionados?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.gastoFinancieros.set(this.gastoFinancieros().filter((val) => !this.selectedGastoFinancieros?.includes(val)));
        this.selectedGastoFinancieros = null;
        this.messageService.successMessageToast('Éxito', 'Gasto Financieros eliminados');
      }
    });
  }

  hideDialog(closed: boolean) {
    this.gastoFinancieroDialog = closed;
    this.submitted = false;
    this.editabled = false;
    if (!closed) {
      this.loadDataTable();
    }
  }

  /**
   * Elimina un gasto financiero
   * @param gastoFinanciero El gasto financiero a eliminar
   */
  deleteGastoFinanciero(gastoFinanciero: GastoFinanciero) {
    if (this.omitirGastoFinanciero) {
      this.messageService.warnMessageToast(
        'Atención',
        'No se pueden eliminar gastos financieros cuando se ha marcado la opción de omitir'
      );
      return;
    }

    this.gastoFinanciero = { ...gastoFinanciero };
    this.confirmationService.confirm({
      message: '¿Deseas eliminar ' + (gastoFinanciero.institucion || 'este gasto financiero') + '?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.gastoFinancieros.set(this.gastoFinancieros().filter((val) => val.id !== gastoFinanciero.id));
        this.messageDelete();
        this.cleanGastoFinanciero();
        this.validationChange.emit(this.isFormComplete());
      }
    });
  }

  messageDelete() {
    this.gastoFinancieroService.delete(this.gastoFinanciero.id).subscribe({
      next: () => {
        this.messageService.successMessageToast('Éxito', 'Gasto Financiero eliminado');
      }
    });
  }

  cleanGastoFinanciero() {
    this.gastoFinanciero = { id: 0, institucion: '', monto_credito: 0, n_pagadas: 0, n_total: 0, monto_cuota: 0, saldo_credito: 0, tarjeta: '', comentario: '', periodo: { id: 0, descripcion: '' } };
  }

  messageCreate() {
    this.messageService.successMessageToast('Éxito', 'Gasto Financiero creado correctamente');
  }

  messageEdit() {
    this.messageService.successMessageToast('Éxito', 'Gasto Financiero editado correctamente');
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

  /**
   * Agrega una nueva fila de gasto financiero
   */
  addRowGastos() {
    if (this.omitirGastoFinanciero) {
      this.messageService.warnMessageToast(
        'Atención',
        'No se pueden agregar gastos financieros cuando se ha marcado la opción de omitir'
      );
      return;
    }

    const nuevoGasto = {
      id: 0,
      institucion: '',
      monto_credito: 0,
      n_pagadas: 0,
      n_total: 0,
      monto_cuota: 0,
      saldo_credito: 0,
      tarjeta: '',
      comentario: '',
      periodo: { id: 0, descripcion: '' }
    };

    this.gastoFinancieros().push(nuevoGasto);
    this.validationChange.emit(this.isFormComplete());
  }

  /**
   * Valida que n_cuotas no sea mayor que n_total
   * @param gastoFinanciero El gasto financiero a validar
   * @returns true si la validación es exitosa, false en caso contrario
   */
  validarNCuotas(gastoFinanciero: GastoFinanciero): boolean {
    if (gastoFinanciero.n_pagadas > 0 && gastoFinanciero.n_total > 0) {
      if (gastoFinanciero.n_pagadas > gastoFinanciero.n_total) {
        this.errorNCuotas = 'El número de cuotas pagadas no puede ser mayor al número total de cuotas';
        return false;
      }
    }
    this.errorNCuotas = '';
    return true;
  }

  /**
   * Valida que el monto_cuota no sea mayor que el saldo_credito
   * @param gastoFinanciero El gasto financiero a validar
   * @returns true si la validación es exitosa, false en caso contrario
   */
  validarMontoCuota(gastoFinanciero: GastoFinanciero): boolean {
    if (gastoFinanciero.monto_cuota > 0 && gastoFinanciero.saldo_credito > 0) {
      if (gastoFinanciero.monto_cuota > gastoFinanciero.saldo_credito) {
        this.errorMontoCuota = 'El monto de la cuota no puede ser mayor al saldo del crédito';
        return false;
      }
    }
    this.errorMontoCuota = '';
    return true;
  }

  /**
   * Valida que el monto_credito no sea menor que el saldo_credito
   * @param gastoFinanciero El gasto financiero a validar
   * @returns true si la validación es exitosa, false en caso contrario
   */
  validarMontoCredito(gastoFinanciero: GastoFinanciero): boolean {
    if (gastoFinanciero.monto_credito > 0 && gastoFinanciero.saldo_credito > 0) {
      if (gastoFinanciero.monto_credito < gastoFinanciero.saldo_credito) {
        this.errorMontoCredito = 'El monto del crédito no puede ser menor al saldo del crédito';
        return false;
      }
    }
    this.errorMontoCredito = '';
    return true;
  }

  /**
   * Valida todos los gastos financieros
   * @returns true si todos los gastos financieros son válidos o si se ha omitido el tab, false en caso contrario
   */
  validateForm(markAsTouched: boolean = true): boolean {
    if (this.omitirGastoFinanciero) {
      return true;
    }
    if (this.gastoFinancieros().length === 0) {
      if (markAsTouched) {
        this.messageService.warnMessageToast(
          'Gastos Financieros',
          'Por favor agregue al menos un gasto financiero o marque la opción para omitirlo.'
        );
      }
      return false;
    }

    let isValid = true;
    let errorMessages = [];
    let camposIncompletos = false;
    for (const gastoFinanciero of this.gastoFinancieros()) {
      if (!gastoFinanciero.institucion ||
          !gastoFinanciero.monto_credito ||
          !gastoFinanciero.n_pagadas ||
          !gastoFinanciero.n_total ||
          !gastoFinanciero.monto_cuota ||
          !gastoFinanciero.saldo_credito ||
          !gastoFinanciero.periodo?.id) {
        isValid = false;
        camposIncompletos = true;
      }

      if (!this.validarNCuotas(gastoFinanciero)) {
        isValid = false;
        errorMessages.push('El número de cuotas pagadas no puede ser mayor al número total de cuotas');
      }
      if (!this.validarMontoCuota(gastoFinanciero)) {
        isValid = false;
        errorMessages.push('El monto de la cuota no puede ser mayor al saldo del crédito');
      }
      // if (!this.validarMontoCredito(gastoFinanciero)) {
      //   isValid = false;
      //   errorMessages.push('El monto del crédito no puede ser menor al saldo del crédito');
      // }
    }
    if (!isValid && markAsTouched) {
      if (camposIncompletos) {
        this.messageService.warnMessageToast(
          'Campos incompletos',
          'Por favor complete todos los campos requeridos en los gastos financieros o marque la opción para omitirlos.'
        );
      } else if (errorMessages.length > 0) {
        this.messageService.warnMessageToast(
          'Errores de validación',
          'Por favor corrija los siguientes errores: ' + errorMessages.join(', ')
        );
      }
    }

    return isValid;
  }

  /**
   * Verifica si el formulario está completo y válido
   * @returns true si todos los gastos financieros son válidos o si se ha omitido el tab, false en caso contrario
   */
  isFormComplete(): boolean {
    if (this.omitirGastoFinanciero) {
      return true;
    }
    if (this.gastoFinancieros().length === 0) {
      return false;
    }

    for (const gastoFinanciero of this.gastoFinancieros()) {
      if (!gastoFinanciero.institucion ||
          !gastoFinanciero.monto_credito ||
          !gastoFinanciero.n_pagadas ||
          !gastoFinanciero.n_total ||
          !gastoFinanciero.monto_cuota ||
          !gastoFinanciero.saldo_credito ||
          !gastoFinanciero.periodo?.id) {
        return false;
      }

      if (gastoFinanciero.n_pagadas > gastoFinanciero.n_total ||
          gastoFinanciero.monto_cuota > gastoFinanciero.saldo_credito ||
          gastoFinanciero.monto_credito < gastoFinanciero.saldo_credito) {
        return false;
      }
    }

    return true;
  }

  /**
   * Muestra un mensaje de confirmación cuando se marca la opción de omitir
   * y reinicia el formulario
   */
  confirmarOmision(): void {
    if (this.omitirGastoFinanciero) {
      this.messageService.infoMessageToast(
        'Información',
        'Se omitirán los gastos financieros y el formulario se reiniciará.'
      );
      this.gastoFinancieros.set([]);
      this.validationChange.emit(true);
    } else {
      this.validationChange.emit(this.isFormComplete());
    }
  }

  /**
   * Método público para validar el formulario desde el componente padre
   * @returns true si el formulario es válido, false en caso contrario
   */
  public validateFromParent(): boolean {
    const isValid = this.validateForm(true);
    this.validationChange.emit(isValid);
    return isValid;
  }
}
