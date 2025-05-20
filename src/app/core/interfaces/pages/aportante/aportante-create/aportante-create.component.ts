import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { Message } from 'primeng/message';
import { Aportante } from '../../../../domain/aportante.model';
import { LocalAportanteService } from '../../../../services/local-data-container.service';

@Component({
  selector: 'app-aportante-create',
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
  templateUrl: './aportante-create.component.html',
  styleUrl: './aportante-create.component.scss',
  providers: [LocalAportanteService, MessageService]
})

export class AportanteCreateComponent {

  @Input() display: boolean = false;
  @Output() closedDialog = new EventEmitter<boolean>();
  @Input() aportante: Aportante = { id: 0, descripcion: '' };
  @Input() title = '';
  @Input() editabled: boolean = false;

  aportantes = signal<Aportante[]>([]);
  selectedaportantes!: Aportante[] | null;
  aportanteForm!: FormGroup;
  submitted: boolean = false;

  constructor(
    private AportanteService: LocalAportanteService,
    private fb: FormBuilder
  ) {
    this.initiateForm();
    this.aportantes();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['aportante']) {
      this.updateFormValues();
    }
  }

  updateFormValues() {
    if (this.aportante) {
      this.aportanteForm.patchValue({
        id: this.aportante.id,
        descripcion: this.aportante.descripcion
      });
    }
  }

  initiateForm() {
    this.aportanteForm = this.fb.group({
      id: [[this.aportante.id], [Validators.required, Validators.minLength(1)]],
      descripcion: [[this.aportante.descripcion], [Validators.required, Validators.min(1)]]
    });
    this.aportanteForm.reset();
  }

  submit() {
    this.submitted = true;
    if (this.aportanteForm.invalid) {
      this.aportanteForm.markAllAsTouched();
      return;
    }

    if (this.aportanteForm.valid) {
      this.aportante = { ...this.aportanteForm.value };
      if (this.editabled) {
        this.editaportante();
      } else {
        this.createaportante();
      }
      this.hideDialog(false);
    }
  }

  createaportante() {
    this.AportanteService.create(this.aportante).subscribe({
      next: () => {
        this.switchMessageHandler('create');
      },
      error: () => {
        this.switchMessageHandler('error');
      }
    });
  }

  editaportante() {
    this.AportanteService.update(this.aportante.id, this.aportante).subscribe({
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
    this.aportanteForm.reset();
    this.closedDialog.emit(this.display)
  }

  hideDialog(display: boolean) {
    this.submitted = false;
    this.aportanteForm.reset();
    this.closedDialog.emit(display)
  }

  get id() {
    return this.aportanteForm.controls['id'];
  }

  get descripcion() {
    return this.aportanteForm.controls['descripcion'];
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
