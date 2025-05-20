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
import { TipoVivienda } from '../../../../domain/tipo-vivienda.model';
import { TipoViviendaService } from '../../../../services/data-container.service';

@Component({
  selector: 'app-tipo-vivienda-create',
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
  templateUrl: './tipo-vivienda-create.component.html',
  styleUrl: './tipo-vivienda-create.component.scss',
  providers: [TipoViviendaService, MessageService]
})

export class TipoViviendaCreateComponent {

  @Input() display: boolean = false;
  @Output() closedDialog = new EventEmitter<boolean>();
  @Input() tipoVivienda: TipoVivienda = { id: 0, descripcion: '' };
  @Input() title = '';
  @Input() editabled: boolean = false;

  tipoViviendaForm!: FormGroup;
  submitted: boolean = false;

  constructor(
    private tipoViviendaService: TipoViviendaService,
    private fb: FormBuilder
  ) {
    this.initiateForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tipoVivienda']) {
      this.updateFormValues();
    }
  }

  updateFormValues() {
    if (this.tipoVivienda) {
      this.tipoViviendaForm.patchValue({
        id: this.tipoVivienda.id,
        descripcion: this.tipoVivienda.descripcion
      });
    }
  }

  initiateForm() {
    this.tipoViviendaForm = this.fb.group({
      id: [[this.tipoVivienda.id], [Validators.required, Validators.minLength(1)]],
      descripcion: [[this.tipoVivienda.descripcion], [Validators.required, Validators.min(1)]]
    });
    this.tipoViviendaForm.reset();
  }

  submit() {
    this.submitted = true;
    if (this.tipoViviendaForm.invalid) {
      this.tipoViviendaForm.markAllAsTouched();
      return;
    }

    if (this.tipoViviendaForm.valid) {
      this.tipoVivienda = { ...this.tipoViviendaForm.value };
      if (this.editabled) {
        this.edittipoVivienda();
      } else {
        this.createtipoVivienda();
      }
      this.hideDialog(false);
    }
  }

  createtipoVivienda() {
    this.tipoViviendaService.create(this.tipoVivienda).subscribe({
      next: () => {
        this.switchMessageHandler('create');
      },
      error: () => {
        this.switchMessageHandler('error');
      }
    });
  }

  edittipoVivienda() {
    this.tipoViviendaService.update(this.tipoVivienda.id, this.tipoVivienda).subscribe({
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
    this.tipoViviendaForm.reset();
    this.closedDialog.emit(this.display)
  }

  hideDialog(display: boolean) {
    this.submitted = false;
    this.tipoViviendaForm.reset();
    this.closedDialog.emit(display)
  }

  get id() {
    return this.tipoViviendaForm.controls['id'];
  }

  get descripcion() {
    return this.tipoViviendaForm.controls['descripcion'];
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
