import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Message } from 'primeng/message';
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
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DatePickerModule } from 'primeng/datepicker';
import { PanelModule } from 'primeng/panel';
import { ChartModule } from 'primeng/chart';
import { KeyFilterModule } from 'primeng/keyfilter';
import { Solicitud } from '../../../../domain/solicitud.model';
import { LocalSolicitudService, LocalPeriodoService } from '../../../../services/local-data-container.service';

@Component({
  selector: 'app-solicitud-tab',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    ToastModule,
    ToolbarModule,
    InputTextModule,
    SelectModule,
    InputNumberModule,
    DialogModule,
    InputIconModule,
    IconFieldModule,
    DropdownModule,
    ConfirmDialogModule,
    ReactiveFormsModule,
    FloatLabelModule,
    DatePickerModule,
    SelectModule,
    PanelModule,
    KeyFilterModule,
    ChartModule,
    FormsModule,
    Message
  ],
  templateUrl: './solicitud-tab.component.html',
  styleUrl: './solicitud-tab.component.scss',
  providers: [LocalSolicitudService, LocalPeriodoService, MessageService]
})
export class SolicitudTabComponent implements   OnInit, OnChanges {

  @Input() display: boolean = false;
  @Output() closedDialog = new EventEmitter<boolean>();
  @Output() montoChange = new EventEmitter<number>();
  @Input() solicitud: Solicitud = {
    id: 0,
    n_credito: 0,
    fecha: '',
    periodo: { id: 0, descripcion: '' },
    plazo: '',
    monto: 0,
    v_gerencia: 'pendiente',
    fichaTrabajo: {
      id: 0,
      cliente: null,
      aval: null,
      conyuge: null,
      referencia_familiar: null,
      credito_anterior: null,
      gasto_financieros: [],
      ingreso_adicional: null,
      puntaje_sentinel: null,
      detalleEconomico: {
        negocio: null,
        ingreso_dependiente: null
      }
    }
  };
  @Input() title = '';
  @Input() editabled: boolean = false;

  solicituds = computed(() => this.solicitudService.data());
  selectedSolicituds!: Solicitud[] | null;
  periodosList = computed(() => this.periodoService.data());
  solicitudForm!: FormGroup;
  submitted: boolean = false;

  constructor(
    private solicitudService: LocalSolicitudService,
    private periodoService: LocalPeriodoService,
    private fb: FormBuilder
  ) {
    this.initiateForm();
  }

  ngOnInit(): void {
    this.periodoService.loadInitialData();

    // Establecer la fecha actual en formato día/mes/año
    const hoy = new Date();
    const fechaFormateada = `${hoy.getDate().toString().padStart(2, '0')}/${(hoy.getMonth() + 1).toString().padStart(2, '0')}/${hoy.getFullYear()}`;

    this.solicitudForm.patchValue({
      fecha: fechaFormateada
    });
  }

  // ngOnInit() {
  //   this.solicitudForm = this.fb.group({
  //     fecha: ['', Validators.required],
  //     n_credito: ['', Validators.required],
  //     plazo: ['', Validators.required],
  //     periodo: ['', Validators.required],
  //     puntaje_sentinel: [this.solicitud.puntaje_sentinel, [Validators.required]],
  //   });

  //   this.initChart();
  // }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['solicitud']) {
      this.updateFormValues();
    }
  }

  updateFormValues() {
    console.log('=== ACTUALIZANDO FORMULARIO DE SOLICITUD ===');
    console.log('Solicitud recibida:', this.solicitud);

    if (this.solicitud) {
      // Buscar el periodo completo si existe
      let periodoCompleto = null;
      if (this.solicitud.periodo) {
        periodoCompleto = this.periodosList().find(p =>
          p.id === this.solicitud.periodo?.id ||
          p.descripcion === this.solicitud.periodo?.descripcion
        );
        console.log('Periodo encontrado:', periodoCompleto);
      }

      // Manejar la fecha correctamente
      let fechaParaFormulario = this.solicitud.fecha;
      if (this.solicitud.fecha && typeof this.solicitud.fecha === 'string') {
        // Si la fecha está en formato día/mes/año, mantenerla así
        if (this.solicitud.fecha.includes('/')) {
          fechaParaFormulario = this.solicitud.fecha;
        } else {
          // Si está en formato ISO, convertir a día/mes/año
          const fecha = new Date(this.solicitud.fecha + 'T00:00:00');
          fechaParaFormulario = `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth() + 1).toString().padStart(2, '0')}/${fecha.getFullYear()}`;
        }
      }

      // Solo actualizar los campos que pertenecen al modelo Solicitud
      this.solicitudForm.patchValue({
        id: this.solicitud.id,
        n_credito: this.solicitud.n_credito,
        fecha: fechaParaFormulario,
        monto: this.solicitud.monto,
        plazo: this.solicitud.plazo,
        v_gerencia: this.solicitud.v_gerencia,
        periodo: periodoCompleto // Usar el objeto completo del periodo
      });

      console.log('✅ Formulario de solicitud actualizado');
      console.log('Fecha cargada:', this.solicitud.fecha);
      console.log('Periodo cargado:', periodoCompleto);
    }
  }

  initiateForm() {
    // Solo incluir los campos que pertenecen al modelo Solicitud
    this.solicitudForm = this.fb.group({
      id: [this.solicitud.id, [Validators.required, Validators.minLength(1)]],
      n_credito: [this.solicitud.n_credito, [Validators.required, Validators.minLength(1)]],
      fecha: [this.solicitud.fecha, [Validators.required]],
      monto: [this.solicitud.monto, [Validators.required, Validators.min(1)]],
      plazo: [this.solicitud.plazo, [Validators.required]],
      v_gerencia: [this.solicitud.v_gerencia, [Validators.required]],
      periodo: [this.solicitud.periodo, [Validators.required]]
    });
    this.solicitudForm.reset();
  }

  submit() {
    this.submitted = true;
    if (this.solicitudForm.invalid) {
      this.solicitudForm.markAllAsTouched();
      return;
    }

    if (this.solicitudForm.valid) {
      const formValues = this.solicitudForm.value;

      // Convertir fecha a formato día/mes/año si es un objeto Date
      let fechaFormateada = formValues.fecha;
      if (formValues.fecha instanceof Date) {
        const fecha = formValues.fecha;
        fechaFormateada = `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth() + 1).toString().padStart(2, '0')}/${fecha.getFullYear()}`;
      }

      this.solicitud = {
        ...formValues,
        fecha: fechaFormateada
      };

      console.log('Solicitud con fecha formateada:', this.solicitud);

      if (this.editabled) {
        this.editSolicitud();
      } else {
        this.tabSolicitud();
      }
      this.hideDialog(false);
    }
  }

  tabSolicitud() {
    this.solicitudService.create(this.solicitud).subscribe({
      next: () => {
        this.switchMessageHandler('tab');
      },
      error: () => {
        this.switchMessageHandler('error');
      }
    });
  }

  editSolicitud() {
    this.solicitudService.update(this.solicitud.id, this.solicitud).subscribe({
      next: () => {
        this.switchMessageHandler('edit');
      },
      error: () => {
        this.switchMessageHandler('error');
      }
    });
  }

  cancel() {
    this.display = !this.display;
    this.submitted = false;
    this.solicitudForm.reset();
    this.closedDialog.emit(this.display)
  }

  hideDialog(display: boolean) {
    this.submitted = false;
    this.editabled = false;
    this.solicitudForm.reset();
    this.closedDialog.emit(display)
  }

  @Output() switchMessage = new EventEmitter<string>();

  switchMessageHandler(message: string) {
    this.switchMessage.emit(message);
  }

  get id() {
    return this.solicitudForm.controls['id'];
  }

  get n_credito() {
    return this.solicitudForm.controls['n_credito'];
  }

  get fecha() {
    return this.solicitudForm.controls['fecha'];
  }

  get monto() {
    return this.solicitudForm.controls['monto'];
  }

  get plazo() {
    return this.solicitudForm.controls['plazo'];
  }

  get v_gerencia() {
    return this.solicitudForm.controls['v_gerencia'];
  }

  get periodo() {
    return this.solicitudForm.controls['periodo'];
  }

  /**
   * Maneja el evento cuando cambia el monto de la solicitud
   */
  onMontoChange(): void {
    const montoValue = this.monto.value;
    if (montoValue && !isNaN(montoValue)) {
      // Emitir el evento con el monto como número
      this.montoChange.emit(Number(montoValue));
    }
  }

}