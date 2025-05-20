import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, Input, OnChanges, Output, signal, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { Denominacion } from '../../../../domain/denominacion.model';
import { KeyFilterModule } from 'primeng/keyfilter';
import { LocalDenominacionService, LocalSectorEconomicoService } from '../../../../services/local-data-container.service';

@Component({
  selector: 'app-denominacion-create',
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
  ],
  templateUrl: './denominacion-create.component.html',
  styleUrl: './denominacion-create.component.scss',
  providers: [LocalDenominacionService, LocalSectorEconomicoService, MessageService]
})
export class DenominacionCreateComponent implements OnChanges {

  @Input() display: boolean = false;
  @Output() closedDialog = new EventEmitter<boolean>();
  @Input() denominacion: Denominacion = { id: 0, descripcion: '', sector_economico: { id: 0, descripcion: '' } };
  @Input() title = '';
  @Input() editabled: boolean = false;

  denominacions = computed(() => this.denominacionService.data());
  selectedDenominacions!: Denominacion[] | null;
  sectorEconomicosList = computed(() => this.sectorEconomicoService.data());
  denominacionForm!: FormGroup;
  submitted: boolean = false;
  displayAffiliation: boolean = false;

  constructor(
    private denominacionService: LocalDenominacionService,
    private sectorEconomicoService: LocalSectorEconomicoService,
    private fb: FormBuilder
  ) {
    this.initiateForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['denominacion']) {
      this.updateFormValues();
    }
  }

  updateFormValues() {
    if (this.denominacion) {
      this.denominacionForm.patchValue({
        id: this.denominacion.id,
        descripcion: this.denominacion.descripcion,
        sector_economico: this.denominacion.sector_economico?.descripcion
      });
    }
  }

  initiateForm() {
    this.denominacionForm = this.fb.group({
      id: [[this.denominacion.id], [Validators.required, Validators.minLength(1)]],
      descripcion: [[this.denominacion.descripcion], [Validators.required, Validators.minLength(1)]],
      sector_economico: [[this.denominacion.sector_economico?.descripcion], [Validators.required]],
    });
    this.denominacionForm.reset();
  }

  submit() {
    this.submitted = true;
    if (this.denominacionForm.invalid) {
      this.denominacionForm.markAllAsTouched();
      return;
    }

    if (this.denominacionForm.valid) {
      this.denominacion = {
        ...this.denominacionForm.value,
      };
      if (this.editabled) {
        this.editdenominacion();
      } else {
        this.tabdenominacion();
      }
      this.hideDialog(false);
    }
  }

  tabdenominacion() {
    this.denominacionService.create(this.denominacion).subscribe({
      next: () => {
        this.switchMessageHandler('tab');
      },
      error: () => {
        this.switchMessageHandler('error');
      }
    });
  }

  editdenominacion() {
    this.denominacionService.update(this.denominacion.id, this.denominacion).subscribe({
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
    this.denominacionForm.reset();
    this.closedDialog.emit(this.display)
  }

  hideDialog(display: boolean) {
    this.submitted = false;
    this.editabled = false;
    this.denominacionForm.reset();
    this.closedDialog.emit(display)
  }

  @Output() switchMessage = new EventEmitter<string>();

  switchMessageHandler(message: string) {
    this.switchMessage.emit(message);
  }

  get id() {
    return this.denominacionForm.controls['id'];
  }

  get descripcion() {
    return this.denominacionForm.controls['descripcion'];
  }

  get sector_economico() {
    return this.denominacionForm.controls['sector_economico'];
  }

  alpha(event: KeyboardEvent) {
    const pattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]$/;
    const key = event.key;

    if (!pattern.test(key)) {
        event.preventDefault();
    }
  }

}