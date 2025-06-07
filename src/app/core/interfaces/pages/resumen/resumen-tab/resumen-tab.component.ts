import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanelModule } from 'primeng/panel';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { BadgeModule } from 'primeng/badge';
import { ChipModule } from 'primeng/chip';
import { TimelineModule } from 'primeng/timeline';
import { MessageToastService } from '../../../../../shared/utils/message-toast.service';

@Component({
  selector: 'app-resumen-tab',
  standalone: true,
  imports: [
    CommonModule,
    PanelModule,
    CardModule,
    ButtonModule,
    DividerModule,
    TableModule,
    TagModule,
    TooltipModule,
    AvatarModule,
    AvatarGroupModule,
    BadgeModule,
    ChipModule,
    TimelineModule
  ],
  templateUrl: './resumen-tab.component.html',
  styleUrl: './resumen-tab.component.scss'
})
export class ResumenTabComponent implements OnInit, OnChanges {
  @Input() fichaTrabajo: any;
  @Input() solicitud: any;

  constructor(private messageToastService: MessageToastService) {}

  ngOnInit(): void {
    // Imprimir los datos recibidos para depuración
    console.log('Datos recibidos en ResumenTabComponent:');
    console.log('Solicitud:', this.solicitud);
    console.log('FichaTrabajo:', this.fichaTrabajo);
  }

  /**
   * Este método se llama cada vez que cambian las propiedades de entrada
   * Nos permite actualizar la vista cuando cambian los datos
   */
  ngOnChanges(changes: SimpleChanges): void {
    console.log('📊 Datos actualizados en ResumenTabComponent:');
    console.log('Cambios detectados:', changes);
    console.log('Solicitud actual:', this.solicitud);
    console.log('FichaTrabajo actual:', this.fichaTrabajo);

    // Forzar detección de cambios si es necesario
    if (this.solicitud || this.fichaTrabajo) {
      console.log('✅ Datos disponibles para mostrar en resumen');
    } else {
      console.log('⚠️ No hay datos disponibles para el resumen');
    }
  }



  /**
   * Formatea un valor monetario para mostrarlo con el formato adecuado
   * @param valor Valor a formatear
   * @returns Valor formateado como moneda
   */
  formatoMoneda(valor: number): string {
    if (!valor && valor !== 0) return 'No disponible';
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(valor);
  }

  /**
   * Formatea una fecha para mostrarla con el formato adecuado
   * @param fecha Fecha a formatear
   * @returns Fecha formateada
   */
  formatoFecha(fecha: string): string {
    if (!fecha) return 'No disponible';

    // Si la fecha ya está en formato día/mes/año, devolverla tal como está
    if (fecha.includes('/')) {
      return fecha;
    }

    // Si está en formato ISO, convertirla
    try {
      const date = new Date(fecha);
      return new Intl.DateTimeFormat('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return fecha; // Devolver la fecha original si hay error
    }
  }

  /**
   * Obtiene el color de la etiqueta según el puntaje sentinel
   * @param puntaje Puntaje sentinel
   * @returns Severidad de la etiqueta (success, warn, danger)
   */
  getSeveridadPuntaje(puntaje: number): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
    if (!puntaje) return 'info';
    if (puntaje >= 722) return 'success';
    if (puntaje >= 598) return 'success';
    if (puntaje >= 477) return 'warn';
    if (puntaje >= 147) return 'warn';
    return 'danger';
  }

  /**
   * Obtiene el nombre del rango según el puntaje sentinel
   * @param puntaje Puntaje sentinel
   * @returns Nombre del rango
   */
  getNombreRangoPuntaje(puntaje: number): string {
    if (!puntaje) return 'No disponible';
    if (puntaje >= 722) return 'Excelente';
    if (puntaje >= 598) return 'Bueno';
    if (puntaje >= 477) return 'Medio';
    if (puntaje >= 147) return 'Bajo';
    return 'Muy Bajo';
  }

  /**
   * Obtiene las iniciales de un nombre completo
   * @param nombres Nombres de la persona
   * @param apellidos Apellidos de la persona
   * @returns Iniciales del nombre completo
   */
  getIniciales(nombres?: string, apellidos?: string): string {
    if (!nombres && !apellidos) return 'NA';

    let iniciales = '';

    if (nombres) {
      const nombreArray = nombres.split(' ');
      iniciales += nombreArray[0].charAt(0).toUpperCase();
    }

    if (apellidos) {
      const apellidoArray = apellidos.split(' ');
      iniciales += apellidoArray[0].charAt(0).toUpperCase();
    }

    return iniciales;
  }

  /**
   * Obtiene el color de fondo para un avatar basado en el nombre
   * @param nombre Nombre para generar el color
   * @returns Clase CSS con el color de fondo
   */
  getColorAvatar(nombre?: string): string {
    if (!nombre) return 'bg-blue-100';

    const colores = [
      'bg-blue-100', 'bg-green-100', 'bg-yellow-100',
      'bg-purple-100', 'bg-teal-100', 'bg-pink-100'
    ];

    // Usar la suma de los códigos ASCII de las letras para determinar el color
    const suma = nombre.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colores[suma % colores.length];
  }

  /**
   * Calcula el total de gastos operativos
   * @param gastosOperativos Array de gastos operativos
   * @returns Total de gastos operativos
   */
  calcularTotalGastosOperativos(gastosOperativos: any[]): number {
    if (!gastosOperativos || gastosOperativos.length === 0) return 0;

    return gastosOperativos.reduce((total, gasto) => {
      const cantidad = gasto.cantidad || 0;
      const importe = gasto.importe || 0;
      return total + (cantidad * importe);
    }, 0);
  }

  /**
   * Filtra los miembros de familia que tienen 1 o más hijos
   * @param familiaMiembros Array de miembros de familia
   * @returns Array filtrado con miembros que tienen n_hijos >= 1
   */
  getFamiliaMiembrosConHijos(familiaMiembros: any[]): any[] {
    if (!familiaMiembros || familiaMiembros.length === 0) return [];

    return familiaMiembros.filter(miembro => miembro.n_hijos >= 1);
  }

  /**
   * Verifica si el ingreso adicional está omitido
   * @param ingresoAdicional Objeto de ingreso adicional
   * @returns true si está omitido, false en caso contrario
   */
  isIngresoAdicionalOmitido(ingresoAdicional: any): boolean {
    return ingresoAdicional && (ingresoAdicional as any).omitido === true;
  }

  /**
   * Obtiene el motivo de deselección del ingreso adicional
   * @param ingresoAdicional Objeto de ingreso adicional
   * @returns Motivo de deselección o cadena vacía
   */
  getMotivoDeseleccion(ingresoAdicional: any): string {
    return ingresoAdicional && (ingresoAdicional as any).motivoDeseleccion || '';
  }
}
