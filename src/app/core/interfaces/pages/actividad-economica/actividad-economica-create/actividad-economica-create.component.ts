import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, signal, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { KeyFilterModule } from 'primeng/keyfilter';
import { ActividadEconomica } from '../../../../domain/actividad-economica.model';
import { ActividadEconomicaService, SectorEconomicoService } from '../../../../services/data-container.service';

@Component({
  selector: 'app-actividad-economica-create',
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
    Message
  ],
  templateUrl: './actividad-economica-create.component.html',
  styleUrl: './actividad-economica-create.component.scss',
  providers: [ActividadEconomicaService, SectorEconomicoService, MessageService]
})
export class ActividadEconomicaCreateComponent implements OnChanges {

  @Input() display: boolean = false;
  @Output() closedDialog = new EventEmitter<boolean>();
  @Input() actividadEconomica: ActividadEconomica = { id: 0, descripcion: '', sector_economico: { id: 0, descripcion: '' } };
  @Input() title = '';
  @Input() editabled: boolean = false;

  actividadEconomicas = signal<ActividadEconomica[]>([]);
  selectedActividadEconomicas!: ActividadEconomica[] | null;
  sectorEconomicosList: any[] = [];
  actividadEconomicaForm!: FormGroup;
  submitted: boolean = false;
  displayAffiliation: boolean = false;

  constructor(
    private actividadEconomicaService: ActividadEconomicaService,
    private sectorEconomicoService: SectorEconomicoService,
    private fb: FormBuilder
  ) {
    this.initiateForm();
    this.sectorEconomicos();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['actividadEconomica']) {
      this.updateFormValues();
    }
  }

  updateFormValues() {
    if (this.actividadEconomica) {
      this.actividadEconomicaForm.patchValue({
        id: this.actividadEconomica.id,
        descripcion: this.actividadEconomica.descripcion,        
        sector_economico: this.actividadEconomica.sector_economico?.descripcion
      });
    }
  }

  initiateForm() {
    this.actividadEconomicaForm = this.fb.group({
      id: [[this.actividadEconomica.id], [Validators.required, Validators.minLength(1)]],
      descripcion: [[this.actividadEconomica.descripcion], [Validators.required, Validators.minLength(1)]],      
      sector_economico: [[this.actividadEconomica.sector_economico?.descripcion], [Validators.required]],
    });
    this.actividadEconomicaForm.reset();
  }


  sectorEconomicos() {
    this.sectorEconomicosList = this.sectorEconomicoService.data();
  }

  submit() {
    this.submitted = true;
    if (this.actividadEconomicaForm.invalid) {
      this.actividadEconomicaForm.markAllAsTouched();
      return;
    }

    if (this.actividadEconomicaForm.valid) {
      this.actividadEconomica = {
        ...this.actividadEconomicaForm.value,
      };
      if (this.editabled) {
        this.editactividadEconomica();
      } else {
        this.tabactividadEconomica();
      }
      this.hideDialog(false);
    }
  }

  tabactividadEconomica() {
    this.actividadEconomicaService.create(this.actividadEconomica).subscribe({
      next: () => {
        this.switchMessageHandler('tab');
      },
      error: () => {
        this.switchMessageHandler('error');
      }
    });
  }

  editactividadEconomica() {
    this.actividadEconomicaService.update(this.actividadEconomica.id, this.actividadEconomica).subscribe({
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
    this.actividadEconomicaForm.reset();
    this.closedDialog.emit(this.display)
  }

  hideDialog(display: boolean) {
    this.submitted = false;
    this.editabled = false;
    this.actividadEconomicaForm.reset();
    this.closedDialog.emit(display)
  }

  @Output() switchMessage = new EventEmitter<string>();

  switchMessageHandler(message: string) {
    this.switchMessage.emit(message);
  }

  get id() {
    return this.actividadEconomicaForm.controls['id'];
  }

  get descripcion() {
    return this.actividadEconomicaForm.controls['descripcion'];
  }

  get sector_economico() {
    return this.actividadEconomicaForm.controls['sector_economico'];
  }

  alpha(event: KeyboardEvent) {
    const pattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]$/;
    const key = event.key;

    if (!pattern.test(key)) {
        event.preventDefault();
    }
  }
}