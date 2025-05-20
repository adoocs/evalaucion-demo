import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
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
import { Periodo } from '../../../../domain/periodo.model';
import { LocalPeriodoService } from '../../../../services/local-data-container.service';

@Component({
  selector: 'app-periodo-create',
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
  templateUrl: './periodo-create.component.html',
  styleUrl: './periodo-create.component.scss',
  providers: [LocalPeriodoService, MessageService]
})

export class PeriodoCreateComponent {

  @Input() display: boolean = false;
  @Output() closedDialog = new EventEmitter<boolean>();
  @Input() periodo: Periodo = { id: 0, descripcion: '' };
  @Input() title = '';
  @Input() editabled: boolean = false;

  selectedperiodos!: Periodo[] | null;
  periodoForm!: FormGroup;
  submitted: boolean = false;

  constructor(
    private PeriodoService: LocalPeriodoService,
    private fb: FormBuilder
  ) {
    this.initiateForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['periodo']) {
      this.updateFormValues();
    }
  }

  updateFormValues() {
    if (this.periodo) {
      this.periodoForm.patchValue({
        id: this.periodo.id,
        descripcion: this.periodo.descripcion
      });
    }
  }

  initiateForm() {
    this.periodoForm = this.fb.group({
      id: [[this.periodo.id], [Validators.required, Validators.minLength(1)]],
      descripcion: [[this.periodo.descripcion], [Validators.required, Validators.min(1)]]
    });
    this.periodoForm.reset();
  }

  submit() {
    this.submitted = true;
    if (this.periodoForm.invalid) {
      this.periodoForm.markAllAsTouched();
      return;
    }

    if (this.periodoForm.valid) {
      this.periodo = { ...this.periodoForm.value };
      if (this.editabled) {
        this.editperiodo();
      } else {
        this.createperiodo();
      }
      this.hideDialog(false);
    }
  }

  createperiodo() {
    this.PeriodoService.create(this.periodo).subscribe({
      next: () => {
        this.switchMessageHandler('create');
      },
      error: () => {
        this.switchMessageHandler('error');
      }
    });
  }

  editperiodo() {
    this.PeriodoService.update(this.periodo.id, this.periodo).subscribe({
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
    this.periodoForm.reset();
    this.closedDialog.emit(this.display)
  }

  hideDialog(display: boolean) {
    this.submitted = false;
    this.periodoForm.reset();
    this.closedDialog.emit(display)
  }

  get id() {
    return this.periodoForm.controls['id'];
  }

  get descripcion() {
    return this.periodoForm.controls['descripcion'];
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
