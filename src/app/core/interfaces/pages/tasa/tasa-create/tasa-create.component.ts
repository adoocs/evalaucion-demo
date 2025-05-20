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
import { Tasa } from '../../../../domain/tasa.model';
import { TasaService } from '../../../../services/data-container.service';

@Component({
  selector: 'app-tasa-create',
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
  templateUrl: './tasa-create.component.html',
  styleUrl: './tasa-create.component.scss',
  providers: [TasaService, MessageService]
})

export class TasaCreateComponent {

  @Input() display: boolean = false;
  @Output() closedDialog = new EventEmitter<boolean>();
  @Input() tasa: Tasa = { id: 0, porcentaje: 0 };
  @Input() title = '';
  @Input() editabled: boolean = false;

  selectedtasas!: Tasa[] | null;
  tasaForm!: FormGroup;
  submitted: boolean = false;

  constructor(
    private TasaService: TasaService,
    private fb: FormBuilder
  ) {
    this.initiateForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tasa']) {
      this.updateFormValues();
    }
  }

  updateFormValues() {
    if (this.tasa) {
      this.tasaForm.patchValue({
        id: this.tasa.id,
        descripcion: this.tasa.porcentaje
      });
    }
  }

  initiateForm() {
    this.tasaForm = this.fb.group({
      id: [[this.tasa.id], [Validators.required, Validators.minLength(1)]],
      porcentaje: [[this.tasa.porcentaje], [Validators.required, Validators.min(1)]]
    });
    this.tasaForm.reset();
  }

  submit() {
    this.submitted = true;
    if (this.tasaForm.invalid) {
      this.tasaForm.markAllAsTouched();
      return;
    }

    if (this.tasaForm.valid) {
      this.tasa = { ...this.tasaForm.value };
      if (this.editabled) {
        this.edittasa();
      } else {
        this.createtasa();
      }
      this.hideDialog(false);
    }
  }

  createtasa() {
    this.TasaService.create(this.tasa).subscribe({
      next: () => {
        this.switchMessageHandler('create');
      },
      error: () => {
        this.switchMessageHandler('error');
      }
    });
  }

  edittasa() {
    this.TasaService.update(this.tasa.id, this.tasa).subscribe({
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
    this.tasaForm.reset();
    this.closedDialog.emit(this.display)
  }

  hideDialog(display: boolean) {
    this.submitted = false;
    this.tasaForm.reset();
    this.closedDialog.emit(display)
  }

  get id() {
    return this.tasaForm.controls['id'];
  }

  get porcentaje() {
    return this.tasaForm.controls['porcentaje'];
  }

  @Output() switchMessage = new EventEmitter<string>();

  switchMessageHandler(message: string) {
    this.switchMessage.emit(message);
  }
}
