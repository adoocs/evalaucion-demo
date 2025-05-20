import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal, SimpleChanges } from '@angular/core';
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
import { MessageService } from 'primeng/api';
import { FloatLabelModule } from 'primeng/floatlabel';
import { KeyFilterModule } from 'primeng/keyfilter';
import { SectorEconomico } from '../../../../domain/sector-economico.model';
import { LocalSectorEconomicoService } from '../../../../services/local-data-container.service';

@Component({
  selector: 'app-sector-economico-create',
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
    ReactiveFormsModule,
    FloatLabelModule,
    KeyFilterModule,
    Message
  ],
  templateUrl: './sector-economico-create.component.html',
  styleUrl: './sector-economico-create.component.scss',
  providers: [LocalSectorEconomicoService, MessageService]
})

export class SectorEconomicoCreateComponent {

  @Input() display: boolean = false;
  @Output() closedDialog = new EventEmitter<boolean>();
  @Input() sectorEconomico: SectorEconomico = { id: 0, descripcion: '' };
  @Input() title = '';
  @Input() editabled: boolean = false;

  selectedsectorEconomicos!: SectorEconomico[] | null;
  sectorEconomicoForm!: FormGroup;
  submitted: boolean = false;

  constructor(
    private sectorEconomicoService: LocalSectorEconomicoService,
    private fb: FormBuilder
  ) {
    this.initiateForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sectorEconomico']) {
      this.updateFormValues();
    }
  }

  updateFormValues() {
    if (this.sectorEconomico) {
      this.sectorEconomicoForm.patchValue({
        id: this.sectorEconomico.id,
        descripcion: this.sectorEconomico.descripcion
      });
    }
  }

  initiateForm() {
    this.sectorEconomicoForm = this.fb.group({
      id: [[this.sectorEconomico.id], [Validators.required, Validators.minLength(1)]],
      descripcion: [[this.sectorEconomico.descripcion], [Validators.required, Validators.min(1)]]
    });
    this.sectorEconomicoForm.reset();
  }

  submit() {
    this.submitted = true;
    if (this.sectorEconomicoForm.invalid) {
      this.sectorEconomicoForm.markAllAsTouched();
      return;
    }

    if (this.sectorEconomicoForm.valid) {
      this.sectorEconomico = { ...this.sectorEconomicoForm.value };
      if (this.editabled) {
        this.editsectorEconomico();
      } else {
        this.createsectorEconomico();
      }
      this.hideDialog(false);
    }
  }

  createsectorEconomico() {
    this.sectorEconomicoService.create(this.sectorEconomico).subscribe({
      next: () => {
        this.switchMessageHandler('create');
      },
      error: () => {
        this.switchMessageHandler('error');
      }
    });
  }

  editsectorEconomico() {
    this.sectorEconomicoService.update(this.sectorEconomico.id, this.sectorEconomico).subscribe({
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
    this.sectorEconomicoForm.reset();
    this.closedDialog.emit(this.display)
  }

  hideDialog(display: boolean) {
    this.submitted = false;
    this.sectorEconomicoForm.reset();
    this.closedDialog.emit(display)
  }

  get id() {
    return this.sectorEconomicoForm.controls['id'];
  }

  get descripcion() {
    return this.sectorEconomicoForm.controls['descripcion'];
  }

  @Output() switchMessage = new EventEmitter<string>();

  switchMessageHandler(message: string) {
    this.switchMessage.emit(message);
  }

  alpha(event: KeyboardEvent) {
    const pattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]$/;
    const key = event.key;

    if (!pattern.test(key)) {
        event.preventDefault();
    }
  }
}
