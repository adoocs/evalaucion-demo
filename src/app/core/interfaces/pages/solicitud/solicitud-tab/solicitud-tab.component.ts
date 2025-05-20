import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, Input, OnChanges, OnInit, Output, signal, SimpleChanges } from '@angular/core';
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
import { SolicitudService, PeriodoService } from '../../../../services/data-container.service';

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
  providers: [SolicitudService, PeriodoService, MessageService]
})
export class SolicitudTabComponent implements   OnInit, OnChanges {

  @Input() display: boolean = false;
  @Output() closedDialog = new EventEmitter<boolean>();
  @Output() montoChange = new EventEmitter<number>();
  @Input() solicitud: Solicitud = { id: 0, n_credito: 0, fecha: '', monto: 0, plazo: '', v_gerencia: false, puntaje_sentinel: 0 };
  @Input() title = '';
  @Input() editabled: boolean = false;

  solicituds = computed(() => this.solicitudService.data());
  selectedSolicituds!: Solicitud[] | null;
  periodosList = computed(() => this.periodoService.data());
  solicitudForm!: FormGroup;
  submitted: boolean = false;

  constructor(
    private solicitudService: SolicitudService,
    private periodoService: PeriodoService,
    private fb: FormBuilder
  ) {
    this.initiateForm();
  }

  ngOnInit(): void {
    this.periodoService.loadInitialData();

    // Establecer la fecha actual en el formulario
    const fechaActual = new Date();
    this.solicitudForm.patchValue({
      fecha: fechaActual
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
    if (this.solicitud) {
      this.solicitudForm.patchValue({
        id: this.solicitud.id,
        n_credito: this.solicitud.n_credito,
        fecha: this.solicitud.fecha ? new Date(this.solicitud.fecha + 'T00:00:00') : null,
        monto: this.solicitud.monto,
        plazo: this.solicitud.plazo,
        v_gerencia: this.solicitud.v_gerencia,
        puntaje_sentinel: this.solicitud.puntaje_sentinel,
        cliente: this.solicitud.cliente,
        aval: this.solicitud.aval,
        conyugue: this.solicitud.conyugue,
        gasto_financiero: this.solicitud.gasto_financiero?.id,
        credito_anterior: this.solicitud.credito_anterior?.id,
        referencia_familiar: this.solicitud.referencia_familiar?.id,
        ingreso_adicional: this.solicitud.ingreso_adicional?.id,
        negocio: this.solicitud.negocio?.id,
      });
    }
  }

  initiateForm() {
    this.solicitudForm = this.fb.group({
      id: [[this.solicitud.id], [Validators.required, Validators.minLength(1)]],
      n_credito: [[this.solicitud.n_credito], [Validators.required, Validators.minLength(1)]],
      fecha: [[this.solicitud.fecha], [Validators.required]],
      monto: [[this.solicitud.monto], [Validators.required]],
      plazo: [[this.solicitud.plazo], [Validators.required]],
      v_gerencia: [[this.solicitud.v_gerencia], [Validators.required]],
      cliente: [[this.solicitud.cliente], [Validators.required]],
      aval: [[this.solicitud.aval], [Validators.required]],
      conyugue: [[this.solicitud.conyugue], [Validators.required]],
      periodo: [[this.solicitud.periodo?.descripcion], [Validators.required]],
      gasto_financiero: [[this.solicitud.gasto_financiero?.id], [Validators.required]],
      credito_anterior: [[this.solicitud.credito_anterior?.id], [Validators.required]],
      referencia_familiar: [[this.solicitud.referencia_familiar?.id], [Validators.required]],
      ingreso_adicional: [[this.solicitud.ingreso_adicional?.id], [Validators.required]],
      negocio: [[this.solicitud.negocio?.id], [Validators.required]],
      puntaje_sentinel: [this.solicitud.puntaje_sentinel, [Validators.required]],
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
      this.solicitud = {
        ...this.solicitudForm.value
      };
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

  get puntaje_sentinel() {
    return this.solicitudForm.controls['puntaje_sentinel'];
  }

  get cliente() {
    return this.solicitudForm.controls['cliente'];
  }

  get aval() {
    return this.solicitudForm.controls['aval'];
  }

  get conyugue() {
    return this.solicitudForm.controls['conyugue'];
  }

  get periodo() {
    return this.solicitudForm.controls['periodo'];
  }

  get gasto_financiero() {
    return this.solicitudForm.controls['gasto_financiero'];
  }

  get credito_anterior() {
    return this.solicitudForm.controls['credito_anterior'];
  }

  get referencia_familiar() {
    return this.solicitudForm.controls['referencia_familiar'];
  }

  get ingreso_adicional() {
    return this.solicitudForm.controls['ingreso_adicional'];
  }

  get negocio() {
    return this.solicitudForm.controls['negocio'];
  }

  /**
   * Maneja el evento cuando cambia el monto de la solicitud
   * @param event El evento de cambio
   */
  onMontoChange(event: any): void {
    const montoValue = this.monto.value;
    if (montoValue && !isNaN(montoValue)) {
      // Emitir el evento con el monto como número
      this.montoChange.emit(Number(montoValue));
    }
  }

}