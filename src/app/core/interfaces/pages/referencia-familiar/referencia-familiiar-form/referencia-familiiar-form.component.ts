import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { FamiliaMiembrosService } from '../../../../services/familia-miembros.service';

@Component({
  selector: 'app-referencia-familiiar-form',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    InputNumberModule,
    InputTextModule,
    FloatLabelModule,
    ButtonModule,
    SelectModule,
    CheckboxModule,
    ReactiveFormsModule
  ],
  templateUrl: './referencia-familiiar-form.component.html',
  styleUrl: './referencia-familiiar-form.component.scss',
  providers: [FamiliaMiembrosService],
})
export class ReferenciaFamiliarFormComponent implements OnChanges {

  familiaForm!: FormGroup
  @Input() display: boolean = false;
  @Input() familias: any[] = [];
  familiamiebroList: any[] = [];
  @Input() familiaRequest = {id:0, descripcion: '', n_hijos: 1, condicion: false };
  @Output() familiaResponse = new EventEmitter<any>();
  @Output() closedDialog = new EventEmitter<boolean>();

  showMessage: boolean = false;
  submitted: boolean = false;

  isCondicionChecked: boolean = false;

  constructor(
    private fb: FormBuilder, 
    private familiaMiebrosService: FamiliaMiembrosService) {
    this.initForm()
  }
  ngOnChanges(changes: SimpleChanges): void {
    if(changes['familiaRequest']) {
      this.updateFormValues()
    }
  }

  initForm() {
    this.familiaForm = this.fb.group({
      id: [null, [Validators.required]],
      descripcion: [null, [Validators.required]],
      n_hijos: [1, [Validators.required, Validators.min(1)]],
      condicion: [this.isCondicionChecked, [Validators.required, Validators.min(1)]],
    })
    this.familiaForm.reset()
  }

  updateFormValues() {
    this.familiaForm.patchValue({
      id: this.familiaRequest.id,
      descripcion: this.familiaRequest.descripcion,
      n_hijos: this.familiaRequest.n_hijos,
      condicion: this.familiaRequest.condicion
    });
  }

  descripcionList = [
    { name: 'Infantes', code: 'infantes' },
    { name: 'Escolares', code: 'escolares' },
    { name: 'Universitarios', code: 'universitarios' },
    { name: 'Mayores', code: 'mayores' }
  ];
  
  getFamilia(familia: any) {
    let ex = familia.value;
    this.id.setValue(ex.value);
    this.descripcion.setValue(ex.descripcion);
    this.n_hijos.setValue(1);
    this.condicion.setValue(ex.condicion);
  }
  cancel() {
    this.familiaRequest = {id: 0, descripcion: '', n_hijos: 1, condicion: false };
    this.hideDialog(false);
  }

  submit() {
    this.submitted = true;
    if (this.familiaForm.invalid) {
      this.familiaForm.markAllAsTouched()
      return;
    }
    let emit = { 
      ...this.familiaRequest, 
      id: this.id.value.id,
      descripcion: this.descripcion.value.descripcion,
      n_hijos: this.n_hijos.value,
      condicion: this.condicion.value.condicion
    }
    this.familiaResponse.emit(emit);

    this.hideDialog(false);
  }

  familiaMiebrosList() {
    this.familiaMiebrosService.getAll().subscribe({
      next: (familiamiebros) => {
        this.familiamiebroList = familiamiebros;
      }
    });
  }

  hideDialog(display: boolean) {
    this.submitted = false;
    this.closedDialog.emit(display);
    this.familiaForm.reset();
  }
  
  get id() {
    return this.familiaForm.controls['id'];
  }
  
  get descripcion() {
    return this.familiaForm.controls['descripcion'];
  }
  get n_hijos() {
    return this.familiaForm.controls['n_hijos'];
  }

  get condicion() {
    return this.familiaForm.controls['condicion'];
  }
}