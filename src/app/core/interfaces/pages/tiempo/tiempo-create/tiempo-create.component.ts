import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, Input, Output, signal, SimpleChanges } from '@angular/core';
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
import { Tiempo } from '../../../../domain/tiempo.model';
import { TiempoService } from '../../../../services/data-container.service';

@Component({
  selector: 'app-tiempo-create',
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
  templateUrl: './tiempo-create.component.html',
  styleUrl: './tiempo-create.component.scss',
  providers: [TiempoService, MessageService]
})

export class TiempoCreateComponent {

  @Input() display: boolean = false;
  @Output() closedDialog = new EventEmitter<boolean>();
  @Input() tiempo: Tiempo = { id: 0, descripcion: '', valor: 0 };
  @Input() title = '';
  @Input() editabled: boolean = false;

  selectedtiempos!: Tiempo[] | null;
  tiempoForm!: FormGroup;
  submitted: boolean = false;

  constructor(
    private TiempoService: TiempoService,
    private fb: FormBuilder
  ) {
    this.initiateForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tiempo']) {
      this.updateFormValues();
    }
  }

  updateFormValues() {
    if (this.tiempo) {
      this.tiempoForm.patchValue({
        id: this.tiempo.id,
        descripcion: this.tiempo.descripcion,
        valor: this.tiempo.valor
      });
    }
  }

  initiateForm() {
    this.tiempoForm = this.fb.group({
      id: [[this.tiempo.id], [Validators.required, Validators.minLength(1)]],
      descripcion: [[this.tiempo.descripcion], [Validators.required, Validators.min(1)]],
      valor: [[this.tiempo.valor], [Validators.required, Validators.min(1)]]
    });
    this.tiempoForm.reset();
  }

  submit() {
    this.submitted = true;
    if (this.tiempoForm.invalid) {
      this.tiempoForm.markAllAsTouched();
      return;
    }

    if (this.tiempoForm.valid) {
      this.tiempo = { ...this.tiempoForm.value };
      if (this.editabled) {
        this.edittiempo();
      } else {
        this.createtiempo();
      }
      this.hideDialog(false);
    }
  }

  createtiempo() {
    this.TiempoService.create(this.tiempo).subscribe({
      next: () => {
        this.switchMessageHandler('create');
      },
      error: () => {
        this.switchMessageHandler('error');
      }
    });
  }

  edittiempo() {
    this.TiempoService.update(this.tiempo.id, this.tiempo).subscribe({
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
    this.tiempoForm.reset();
    this.closedDialog.emit(this.display)
  }

  hideDialog(display: boolean) {
    this.submitted = false;
    this.tiempoForm.reset();
    this.closedDialog.emit(display)
  }

  get id() {
    return this.tiempoForm.controls['id'];
  }

  get descripcion() {
    return this.tiempoForm.controls['descripcion'];
  }

  get valor() {
    return this.tiempoForm.controls['valor'];
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
