import { Injectable } from '@angular/core';
import { Solicitud } from '../domain/solicitud.model';
import { jsPDF } from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class PrintService {

  constructor() { }

  /**
   * Genera PDF de solicitud directamente
   * @param solicitud La solicitud a imprimir
   */
  async generarPDFSolicitud(solicitud: Solicitud): Promise<void> {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      let yPosition = 20;

      // Header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SOLICITUD DE CRÉDITO', 105, yPosition, { align: 'center' });

      yPosition += 10;
      pdf.setFontSize(14);
      pdf.text(`N° ${solicitud.n_credito}`, 105, yPosition, { align: 'center' });

      yPosition += 20;

      // Datos de la solicitud
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DATOS DE LA SOLICITUD', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');

      const datosSolicitud = [
        ['Fecha:', solicitud.fecha?.toString() || 'No especificado'],
        ['Monto Solicitado:', `S/ ${solicitud.monto?.toLocaleString() || '0'}`],
        ['Plazo:', solicitud.plazo?.toString() || 'No especificado'],
        ['V° Gerencia:', this.getEstadoLabel(solicitud.v_gerencia)]
      ];

      datosSolicitud.forEach(([label, value]) => {
        pdf.setFont('helvetica', 'bold');
        pdf.text(label, 20, yPosition);
        pdf.setFont('helvetica', 'normal');
        pdf.text(value, 70, yPosition);
        yPosition += 7;
      });

      yPosition += 10;

      // Datos del cliente
      if (solicitud.cliente) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('DATOS DEL CLIENTE', 20, yPosition);
        yPosition += 10;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');

        const datosCliente = [
          ['Cliente:', solicitud.cliente?.toString() || 'No especificado'],
          ['Aval:', solicitud.aval?.toString() || 'No especificado'],
          ['Cónyuge:', solicitud.conyugue?.toString() || 'No especificado']
        ];

        datosCliente.forEach(([label, value]) => {
          pdf.setFont('helvetica', 'bold');
          pdf.text(label, 20, yPosition);
          pdf.setFont('helvetica', 'normal');
          pdf.text(value, 70, yPosition);
          yPosition += 7;
        });
      }

      // Footer
      yPosition = 280;
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'italic');
      pdf.text(`Documento generado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}`, 105, yPosition, { align: 'center' });

      // Descargar
      pdf.save(`Solicitud_${solicitud.n_credito}.pdf`);

    } catch (error) {
      console.error('Error al generar PDF de solicitud:', error);
      throw new Error('No se pudo generar el PDF de la solicitud.');
    }
  }

  /**
   * Genera PDF de evaluación directamente
   * @param solicitud La solicitud con evaluación
   */
  async generarPDFEvaluacion(solicitud: Solicitud): Promise<void> {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      let yPosition = 20;

      // Header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('FICHA DE EVALUACIÓN', 105, yPosition, { align: 'center' });

      yPosition += 10;
      pdf.setFontSize(14);
      pdf.text(`Solicitud N° ${solicitud.n_credito}`, 105, yPosition, { align: 'center' });

      yPosition += 20;

      // Información de evaluación
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('INFORMACIÓN DE EVALUACIÓN', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');

      const datosEvaluacion = [
        ['Cliente:', solicitud.cliente?.toString() || 'No especificado'],
        ['Aval:', solicitud.aval?.toString() || 'No especificado'],
        ['Cónyuge:', solicitud.conyugue?.toString() || 'No especificado'],
        ['Puntaje Sentinel:', solicitud.puntaje_sentinel?.toString() || 'No especificado'],
        ['Tiene Negocio:', solicitud.negocio ? 'Sí' : 'No'],
        ['Tiene Ingreso Dependiente:', solicitud.ingreso_dependiente ? 'Sí' : 'No']
      ];

      datosEvaluacion.forEach(([label, value]) => {
        pdf.setFont('helvetica', 'bold');
        pdf.text(label, 20, yPosition);
        pdf.setFont('helvetica', 'normal');
        pdf.text(value, 70, yPosition);
        yPosition += 7;
      });

      // Footer
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'italic');
      pdf.text(`Documento generado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}`, 105, 285, { align: 'center' });

      // Descargar
      pdf.save(`Evaluacion_${solicitud.n_credito}.pdf`);

    } catch (error) {
      console.error('Error al generar PDF de evaluación:', error);
      throw new Error('No se pudo generar el PDF de la evaluación.');
    }
  }

  /**
   * Genera PDF completo (solicitud + evaluación)
   * @param solicitud La solicitud completa
   */
  async generarPDFCompleto(solicitud: Solicitud): Promise<void> {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      let yPosition = 20;

      // Header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SOLICITUD DE CRÉDITO Y EVALUACIÓN', 105, yPosition, { align: 'center' });

      yPosition += 10;
      pdf.setFontSize(14);
      pdf.text(`N° ${solicitud.n_credito}`, 105, yPosition, { align: 'center' });

      yPosition += 20;

      // Datos de la solicitud
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DATOS DE LA SOLICITUD', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');

      const datosSolicitud = [
        ['Fecha:', solicitud.fecha?.toString() || 'No especificado'],
        ['Monto Solicitado:', `S/ ${solicitud.monto?.toLocaleString() || '0'}`],
        ['Plazo:', solicitud.plazo?.toString() || 'No especificado'],
        ['V° Gerencia:', this.getEstadoLabel(solicitud.v_gerencia)]
      ];

      datosSolicitud.forEach(([label, value]) => {
        pdf.setFont('helvetica', 'bold');
        pdf.text(label, 20, yPosition);
        pdf.setFont('helvetica', 'normal');
        pdf.text(value, 70, yPosition);
        yPosition += 7;
      });

      yPosition += 15;

      // Evaluación
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('EVALUACIÓN', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');

      const datosEvaluacion = [
        ['Cliente:', solicitud.cliente?.toString() || 'No especificado'],
        ['Aval:', solicitud.aval?.toString() || 'No especificado'],
        ['Cónyuge:', solicitud.conyugue?.toString() || 'No especificado'],
        ['Puntaje Sentinel:', solicitud.puntaje_sentinel?.toString() || 'No especificado'],
        ['Tiene Negocio:', solicitud.negocio ? 'Sí' : 'No'],
        ['Tiene Ingreso Dependiente:', solicitud.ingreso_dependiente ? 'Sí' : 'No']
      ];

      datosEvaluacion.forEach(([label, value]) => {
        pdf.setFont('helvetica', 'bold');
        pdf.text(label, 20, yPosition);
        pdf.setFont('helvetica', 'normal');
        pdf.text(value, 70, yPosition);
        yPosition += 7;
      });

      // Footer
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'italic');
      pdf.text(`Documento generado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}`, 105, 285, { align: 'center' });

      // Descargar
      pdf.save(`Solicitud_Completa_${solicitud.n_credito}.pdf`);

    } catch (error) {
      console.error('Error al generar PDF completo:', error);
      throw new Error('No se pudo generar el PDF completo.');
    }
  }

  /**
   * Genera el HTML para imprimir solo la solicitud
   * @param solicitud La solicitud a imprimir
   * @returns HTML formateado para impresión
   */
  generarHTMLSolicitud(solicitud: Solicitud): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Solicitud N° ${solicitud.n_credito}</title>
        <style>
          ${this.getEstilosCSS()}
        </style>
      </head>
      <body>
        <div class="documento">
          <div class="header">
            <h1>SOLICITUD DE CRÉDITO</h1>
            <div class="numero-solicitud">N° ${solicitud.n_credito}</div>
          </div>

          <div class="seccion">
            <h2>DATOS DE LA SOLICITUD</h2>
            <div class="grid">
              <div class="campo">
                <label>Fecha:</label>
                <span>${solicitud.fecha}</span>
              </div>
              <div class="campo">
                <label>Monto Solicitado:</label>
                <span>S/ ${solicitud.monto.toLocaleString()}</span>
              </div>
              <div class="campo">
                <label>Plazo:</label>
                <span>${solicitud.plazo}</span>
              </div>
            </div>
          </div>

          <div class="seccion">
            <h2>DATOS DEL CLIENTE</h2>
            <div class="grid">
              <div class="campo">
                <label>Cliente:</label>
                <span>${solicitud.cliente || 'No especificado'}</span>
              </div>
              <div class="campo">
                <label>Aval:</label>
                <span>${solicitud.aval || 'No especificado'}</span>
              </div>
              <div class="campo">
                <label>Cónyuge:</label>
                <span>${solicitud.conyugue || 'No especificado'}</span>
              </div>
            </div>
          </div>

          <div class="seccion">
            <h2>ESTADO DE LA SOLICITUD</h2>
            <div class="grid">
              <div class="campo">
                <label>V° Gerencia:</label>
                <span class="estado ${this.getClaseEstado(solicitud.v_gerencia)}">${this.getEstadoLabel(solicitud.v_gerencia)}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>Documento generado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Genera el HTML para imprimir la evaluación
   * @param solicitud La solicitud con la evaluación
   * @returns HTML formateado para impresión
   */
  generarHTMLEvaluacion(solicitud: Solicitud): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Evaluación - Solicitud N° ${solicitud.n_credito}</title>
        <style>
          ${this.getEstilosCSS()}
        </style>
      </head>
      <body>
        <div class="documento">
          <div class="header">
            <h1>FICHA DE EVALUACIÓN</h1>
            <div class="numero-solicitud">Solicitud N° ${solicitud.n_credito}</div>
          </div>

          <div class="seccion">
            <h2>INFORMACIÓN DE EVALUACIÓN</h2>
            <div class="grid">
              <div class="campo">
                <label>Cliente:</label>
                <span>${solicitud.cliente || 'No especificado'}</span>
              </div>
              <div class="campo">
                <label>Aval:</label>
                <span>${solicitud.aval || 'No especificado'}</span>
              </div>
              <div class="campo">
                <label>Cónyuge:</label>
                <span>${solicitud.conyugue || 'No especificado'}</span>
              </div>
              <div class="campo">
                <label>Puntaje Sentinel:</label>
                <span>${solicitud.puntaje_sentinel || 'No especificado'}</span>
              </div>
              <div class="campo">
                <label>Tiene Negocio:</label>
                <span>${solicitud.negocio ? 'Sí' : 'No'}</span>
              </div>
              <div class="campo">
                <label>Tiene Ingreso Dependiente:</label>
                <span>${solicitud.ingreso_dependiente ? 'Sí' : 'No'}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>Documento generado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Genera el HTML completo (solicitud + evaluación)
   * @param solicitud La solicitud completa
   * @returns HTML formateado para impresión
   */
  generarHTMLCompleto(solicitud: Solicitud): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Documento Completo - Solicitud N° ${solicitud.n_credito}</title>
        <style>
          ${this.getEstilosCSS()}
        </style>
      </head>
      <body>
        <div class="documento">
          <div class="header">
            <h1>SOLICITUD DE CRÉDITO Y EVALUACIÓN</h1>
            <div class="numero-solicitud">N° ${solicitud.n_credito}</div>
          </div>

          <!-- Datos de la Solicitud -->
          <div class="seccion">
            <h2>DATOS DE LA SOLICITUD</h2>
            <div class="grid">
              <div class="campo">
                <label>Fecha:</label>
                <span>${solicitud.fecha}</span>
              </div>
              <div class="campo">
                <label>Monto Solicitado:</label>
                <span>S/ ${solicitud.monto.toLocaleString()}</span>
              </div>
              <div class="campo">
                <label>Plazo:</label>
                <span>${solicitud.plazo}</span>
              </div>
              <div class="campo">
                <label>V° Gerencia:</label>
                <span class="estado ${this.getClaseEstado(solicitud.v_gerencia)}">${this.getEstadoLabel(solicitud.v_gerencia)}</span>
              </div>
            </div>
          </div>

          <!-- Evaluación -->
          <div class="seccion">
            <h2>INFORMACIÓN DE EVALUACIÓN</h2>
            <div class="grid">
              <div class="campo">
                <label>Cliente:</label>
                <span>${solicitud.cliente || 'No especificado'}</span>
              </div>
              <div class="campo">
                <label>Aval:</label>
                <span>${solicitud.aval || 'No especificado'}</span>
              </div>
              <div class="campo">
                <label>Cónyuge:</label>
                <span>${solicitud.conyugue || 'No especificado'}</span>
              </div>
              <div class="campo">
                <label>Puntaje Sentinel:</label>
                <span>${solicitud.puntaje_sentinel || 'No especificado'}</span>
              </div>
              <div class="campo">
                <label>Tiene Negocio:</label>
                <span>${solicitud.negocio ? 'Sí' : 'No'}</span>
              </div>
              <div class="campo">
                <label>Tiene Ingreso Dependiente:</label>
                <span>${solicitud.ingreso_dependiente ? 'Sí' : 'No'}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>Documento generado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // ==================== MÉTODOS AUXILIARES ====================

  /**
   * Obtiene la etiqueta del estado de V° Gerencia
   * @param estado El estado
   * @returns La etiqueta correspondiente
   */
  private getEstadoLabel(estado: string): string {
    switch (estado) {
      case 'aprobado':
        return 'Aprobado';
      case 'observado':
        return 'Observado';
      case 'denegado':
        return 'Denegado';
      case 'pendiente':
        return 'Pendiente';
      default:
        return 'Sin estado';
    }
  }

  /**
   * Obtiene la clase CSS para el estado
   * @param estado El estado
   * @returns La clase CSS correspondiente
   */
  private getClaseEstado(estado: string): string {
    switch (estado) {
      case 'aprobado':
        return 'aprobado';
      case 'observado':
        return 'observado';
      case 'denegado':
        return 'denegado';
      case 'pendiente':
        return 'pendiente';
      default:
        return 'sin-estado';
    }
  }

  /**
   * Obtiene los estilos CSS para la impresión
   * @returns CSS formateado
   */
  private getEstilosCSS(): string {
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: Arial, sans-serif;
        font-size: 12px;
        line-height: 1.4;
        color: #333;
        background: white;
      }

      .documento {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }

      .header {
        text-align: center;
        margin-bottom: 30px;
        border-bottom: 2px solid #333;
        padding-bottom: 15px;
      }

      .header h1 {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 10px;
        color: #2563eb;
      }

      .numero-solicitud {
        font-size: 16px;
        font-weight: bold;
        color: #666;
      }

      .seccion {
        margin-bottom: 25px;
        page-break-inside: avoid;
      }

      .seccion h2 {
        font-size: 16px;
        font-weight: bold;
        color: #1f2937;
        margin-bottom: 15px;
        padding: 8px 12px;
        background-color: #f3f4f6;
        border-left: 4px solid #2563eb;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 12px;
      }

      .campo {
        display: flex;
        flex-direction: column;
        margin-bottom: 8px;
      }

      .campo label {
        font-weight: bold;
        color: #374151;
        margin-bottom: 2px;
        font-size: 11px;
      }

      .campo span {
        color: #1f2937;
        font-size: 12px;
        padding: 4px 8px;
        background-color: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 4px;
      }

      .estado {
        padding: 4px 8px;
        border-radius: 4px;
        font-weight: bold;
        text-align: center;
      }

      .estado.aprobado {
        background-color: #dcfce7;
        color: #166534;
        border: 1px solid #22c55e;
      }

      .estado.observado {
        background-color: #fef3c7;
        color: #92400e;
        border: 1px solid #f59e0b;
      }

      .estado.denegado {
        background-color: #fee2e2;
        color: #991b1b;
        border: 1px solid #ef4444;
      }

      .estado.pendiente {
        background-color: #dbeafe;
        color: #1e40af;
        border: 1px solid #3b82f6;
      }

      .estado.sin-estado {
        background-color: #f3f4f6;
        color: #6b7280;
        border: 1px solid #d1d5db;
      }

      .footer {
        margin-top: 40px;
        text-align: center;
        font-size: 10px;
        color: #666;
        border-top: 1px solid #e5e7eb;
        padding-top: 15px;
      }

      @media print {
        body {
          font-size: 11px;
        }

        .documento {
          padding: 10px;
        }

        .seccion {
          page-break-inside: avoid;
        }
      }
    `;
  }
}
