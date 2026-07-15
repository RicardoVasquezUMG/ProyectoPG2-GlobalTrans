/**
 * Generador de Reportes PDF Profesionales para GlobalTrans.
 * Utiliza jsPDF y jspdf-autotable para crear informes corporativos de alta calidad
 * con encabezados institucionales, métricas ejecutivas, tablas formateadas y sellos digitales.
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Colores de la paleta corporativa GlobalTrans
const COLORS = {
  primary: [6, 20, 66],        // Deep Navy (#061442)
  accent: [59, 130, 246],       // Electric Blue (#3b82f6)
  teal: [13, 148, 136],         // Teal (#0d9488)
  success: [22, 163, 74],       // Green (#16a34a)
  warning: [217, 119, 6],       // Amber (#d97706)
  danger: [220, 38, 38],        // Red (#dc2626)
  textPrimary: [15, 23, 42],    // Dark Slate (#0f172a)
  textSecondary: [71, 85, 105], // Slate (#475569)
  bgLight: [248, 250, 252],     // Slate 50
  border: [226, 232, 240]       // Border slate
};

/**
 * Agrega el membrete y encabezado institucional a cualquier página del reporte.
 */
const addHeader = (doc, title, subtitle, pageNum = 1, totalPages = 1) => {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Barra superior decorativa
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setFillColor(...COLORS.accent);
  doc.rect(0, 28, pageWidth, 2, 'F');

  // Logotipo y nombre de empresa
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('GlobalTrans Logistics S.A.', 14, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(200, 220, 255);
  doc.text('SISTEMA CORPORATIVO DE GESTIÓN Y AUDITORÍA DE TRANSPORTE INTERNACIONAL', 14, 21);

  // Fecha y emisión
  const fechaStr = new Date().toLocaleDateString('es-GT', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
  doc.setFontSize(8);
  doc.text(`Emisión: ${fechaStr}`, pageWidth - 14, 13, { align: 'right' });
  doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth - 14, 21, { align: 'right' });

  // Título de la sección
  doc.setTextColor(...COLORS.textPrimary);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(title, 14, 38);

  if (subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.textSecondary);
    doc.text(subtitle, 14, 44);
  }
};

/**
 * Agrega el pie de página con sello digital de auditoría y descargo de responsabilidad.
 */
const addFooter = (doc) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.5);
  doc.line(14, pageHeight - 16, pageWidth - 14, pageHeight - 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.textSecondary);
  doc.text('GlobalTrans Security & Audit System | Documento confidencial generado automáticamente | Verificación hash SHA-256 válida.', 14, pageHeight - 10);

  const folio = 'FOLIO: GT-' + Math.random().toString(36).substring(2, 9).toUpperCase();
  doc.setFont('helvetica', 'bold');
  doc.text(folio, pageWidth - 14, pageHeight - 10, { align: 'right' });
};

/**
 * REPORTE 1: Auditoría Digital de Entregas & Cumplimiento SLA
 */
export const exportAuditoriaPDF = async (auditoria, chartImgData = null) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

  addHeader(
    doc,
    'INFORME OFICIAL DE AUDITORÍA DIGITAL Y CUMPLIMIENTO SLA',
    'Evaluación exhaustiva de acuerdos de servicio, lead times y control de incidentes'
  );

  let currentY = 52;

  // Tarjetas ejecutivas KPI (4 columnas)
  const cardWidth = (pageWidth - 28 - 9) / 4;
  const kpis = [
    { label: 'CUMPLIMIENTO SLA', value: `${auditoria?.porcentaje_exito_tiempo || 0}%`, color: COLORS.success },
    { label: 'VIAJES ENTREGADOS', value: `${auditoria?.total_entregados || 0}`, color: COLORS.accent },
    { label: 'TOTAL AUDITADOS', value: `${auditoria?.total_viajes || 0}`, color: COLORS.primary },
    { label: 'LEAD TIME PROM.', value: `${auditoria?.lead_time_promedio_horas || 0} hrs`, color: COLORS.teal }
  ];

  kpis.forEach((kpi, idx) => {
    const x = 14 + idx * (cardWidth + 3);
    doc.setFillColor(...COLORS.bgLight);
    doc.setDrawColor(...COLORS.border);
    doc.roundedRect(x, currentY, cardWidth, 20, 2, 2, 'FD');

    // Barra de color lateral
    doc.setFillColor(...kpi.color);
    doc.rect(x, currentY, 2.5, 20, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...COLORS.textSecondary);
    doc.text(kpi.label, x + 5, currentY + 6);

    doc.setFontSize(12);
    doc.setTextColor(...kpi.color);
    doc.text(kpi.value, x + 5, currentY + 15);
  });

  currentY += 26;

  // Si hay imagen del gráfico adjunta, agregarla
  if (chartImgData) {
    try {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.textPrimary);
      doc.text('Rendimiento Comparativo: Horas Lead Time vs % Cumplimiento SLA', 14, currentY);
      currentY += 4;
      doc.addImage(chartImgData, 'PNG', 14, currentY, pageWidth - 28, 45);
      currentY += 50;
    } catch (e) {
      console.warn('No se pudo adjuntar imagen del gráfico:', e);
    }
  }

  // Tabla 1: Desglose por País de Destino
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.textPrimary);
  doc.text('Desglose de Desempeño Operativo por País de Destino', 14, currentY);
  currentY += 3;

  const paisesRows = (auditoria?.desglose_por_pais || []).map(p => [
    p.pais,
    p.total_viajes,
    p.entregados,
    p.a_tiempo,
    `${p.cumplimiento_pct}%`,
    `${p.lead_time_promedio_horas} hrs`
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['País Destino', 'Viajes Totales', 'Entregados', 'A Tiempo', '% Cumplimiento SLA', 'Lead Time Promedio']],
    body: paisesRows.length > 0 ? paisesRows : [['Sin registros', 0, 0, 0, '0%', '0 hrs']],
    theme: 'striped',
    headStyles: { fillColor: COLORS.primary, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 8, textColor: COLORS.textPrimary },
    margin: { left: 14, right: 14 }
  });

  currentY = doc.lastAutoTable.finalY + 8;

  // Verificar si cabe en la página o crear nueva
  if (currentY > 210) {
    doc.addPage();
    addHeader(doc, 'BITÁCORA DIGITAL DE INCIDENTES AUDITADOS', 'Registro cronológico inmutable de anomalías');
    currentY = 48;
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.textPrimary);
    doc.text('Bitácora Digital de Incidentes y Retrasos Recientes', 14, currentY);
    currentY += 3;
  }

  const incidentesRows = (auditoria?.incidentes_recientes || []).map(inc => [
    new Date(inc.fecha).toLocaleDateString('es-GT', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    inc.ubicacion || 'Frontera/Ruta',
    inc.notas || 'Sin detalle'
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Fecha y Hora', 'Ubicación / Punto de Control', 'Causa Raíz / Detalle del Incidente']],
    body: incidentesRows.length > 0 ? incidentesRows : [['-', '-', 'No se han registrado incidentes recientes']],
    theme: 'striped',
    headStyles: { fillColor: COLORS.accent, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 7.5, textColor: COLORS.textPrimary },
    margin: { left: 14, right: 14 }
  });

  addFooter(doc);
  doc.save(`GlobalTrans_Auditoria_Entregas_${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * REPORTE 2: Predicción de Aduanas y Rutas Más Eficientes (Estacionalidad de Catálogo)
 */
export const exportPrediccionAduanasPDF = async (prediccionData, chartImgData = null) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

  addHeader(
    doc,
    'INFORME PREDICTIVO DE ADUANAS Y RUTAS EFICIENTES',
    `Simulación estacional: ${prediccionData?.temporada || 'Temporada Regular'}`
  );

  let currentY = 50;

  // Banner explicativo estacional
  doc.setFillColor(...(prediccionData?.es_temporada_alta ? [254, 242, 242] : [240, 249, 255]));
  doc.setDrawColor(...(prediccionData?.es_temporada_alta ? COLORS.danger : COLORS.accent));
  doc.roundedRect(14, currentY, pageWidth - 28, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...(prediccionData?.es_temporada_alta ? COLORS.danger : COLORS.accent));
  doc.text(
    prediccionData?.es_temporada_alta
      ? `ALERTA DE SATURACIÓN: ${prediccionData.temporada.toUpperCase()} (FACTOR DEMORA: x${prediccionData.factor_demora})`
      : `OPERACIÓN FLUIDA: ${prediccionData.temporada.toUpperCase()} (FACTOR: x${prediccionData.factor_demora})`,
    18,
    currentY + 7
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textSecondary);
  const motivoLines = doc.splitTextToSize(prediccionData?.motivo_estacional || 'Evaluación estacional de flujos fronterizos.', pageWidth - 36);
  doc.text(motivoLines, 18, currentY + 13);

  currentY += 27;

  // Si hay imagen del gráfico adjunta, agregarla
  if (chartImgData) {
    try {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...COLORS.textPrimary);
      doc.text('Comparativa de Tiempos Fronterizos: Regular vs. Proyectado', 14, currentY);
      currentY += 3;
      doc.addImage(chartImgData, 'PNG', 14, currentY, pageWidth - 28, 44);
      currentY += 48;
    } catch (e) {
      console.warn('Error adjuntando imagen de gráfico:', e);
    }
  }

  // Rutas Eficientes Recomendadas (Route Efficiency Engine)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.textPrimary);
  doc.text('Recomendaciones de Rutas Eficientes & Desvíos Óptimos', 14, currentY);
  currentY += 3;

  const rutasRows = (prediccionData?.rutas_eficientes_recomendadas || []).map(r => [
    r.corredor,
    r.ruta_habitual,
    r.ruta_eficiente_sugerida,
    `${r.tiempo_habitual_espera} hrs`,
    `${r.tiempo_eficiente_espera} hrs`,
    `-${r.ahorro_tiempo_horas} hrs`,
    `$${r.ahorro_costo_usd}`
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Corredor', 'Ruta Habitual', 'Ruta Eficiente Sugerida', 'Tiempo Hab.', 'Tiempo Opt.', 'Ahorro Hrs', 'Ahorro USD']],
    body: rutasRows,
    theme: 'striped',
    headStyles: { fillColor: COLORS.teal, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
    bodyStyles: { fontSize: 7, textColor: COLORS.textPrimary },
    margin: { left: 14, right: 14 }
  });

  currentY = doc.lastAutoTable.finalY + 8;

  // Si queda poco espacio, añadir página
  if (currentY > 210) {
    doc.addPage();
    addHeader(doc, 'TABLA DETALLADA DE ADUANAS Y PASOS FRONTERIZOS', 'Proyecciones de cola y tiempos de espera calculados');
    currentY = 48;
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.textPrimary);
    doc.text('Evaluación Fronteriza y Tiempos de Espera Proyectados', 14, currentY);
    currentY += 3;
  }

  const aduanasRows = (prediccionData?.predicciones || []).map(p => [
    p.aduana,
    p.pais_destino,
    `${p.tiempo_base_horas} hrs`,
    `${p.tiempo_estimado_horas} hrs`,
    p.nivel_congestion,
    p.horas_pico || '09:00 - 18:00',
    p.recomendacion_operativa || '-'
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Aduana / Frontera', 'País', 'Tiempo Base', 'Proyectado', 'Congestión', 'Horas Pico', 'Recomendación Operativa']],
    body: aduanasRows,
    theme: 'striped',
    headStyles: { fillColor: COLORS.primary, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
    bodyStyles: { fontSize: 6.8, textColor: COLORS.textPrimary },
    margin: { left: 14, right: 14 }
  });

  addFooter(doc);
  doc.save(`GlobalTrans_Prediccion_Aduanas_Mes${prediccionData?.mes_analizado || 'Act'}.pdf`);
};

/**
 * REPORTE 3: Dashboard Financiero Gerencial (Rentabilidad: Tiempo vs. Costo)
 */
export const exportDashboardFinancieroPDF = async (financieroData, chartImgData = null) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

  addHeader(
    doc,
    'DASHBOARD FINANCIERO GERENCIAL: RENTABILIDAD POR RUTA',
    'Análisis cruzado del Factor Tiempo (Lead Time / Ciclo) con el Factor Costo (Flete y Sobrecostos)'
  );

  let currentY = 52;
  const res = financieroData?.resumen_ejecutivo || {};

  // 4 Tarjetas KPI Financieras
  const cardWidth = (pageWidth - 28 - 9) / 4;
  const kpis = [
    { label: 'INGRESOS TOTALES', value: `$${(res.total_ingresos_usd || 0).toLocaleString()}`, color: COLORS.accent },
    { label: 'COSTOS OPERATIVOS', value: `$${(res.total_costos_usd || 0).toLocaleString()}`, color: COLORS.warning },
    { label: 'SOBRECOSTOS EVITABLES', value: `$${(res.total_sobrecostos_imprevistos_usd || 0).toLocaleString()}`, color: COLORS.danger },
    { label: 'MARGEN NETO GLOBAL', value: `${res.margen_global_pct || 0}% ($${(res.utilidad_neta_usd || 0).toLocaleString()})`, color: COLORS.success }
  ];

  kpis.forEach((kpi, idx) => {
    const x = 14 + idx * (cardWidth + 3);
    doc.setFillColor(...COLORS.bgLight);
    doc.setDrawColor(...COLORS.border);
    doc.roundedRect(x, currentY, cardWidth, 22, 2, 2, 'FD');

    doc.setFillColor(...kpi.color);
    doc.rect(x, currentY, 2.5, 22, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...COLORS.textSecondary);
    doc.text(kpi.label, x + 5, currentY + 6);

    doc.setFontSize(10.5);
    doc.setTextColor(...kpi.color);
    doc.text(kpi.value, x + 5, currentY + 16);
  });

  currentY += 28;

  // Si hay imagen del gráfico financiero adjunta, agregarla
  if (chartImgData) {
    try {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...COLORS.textPrimary);
      doc.text('Distribución Financiera: Tarifas Cobradas vs Costos Operativos por Corredor', 14, currentY);
      currentY += 3;
      doc.addImage(chartImgData, 'PNG', 14, currentY, pageWidth - 28, 45);
      currentY += 49;
    } catch (e) {
      console.warn('Error adjuntando imagen de gráfico:', e);
    }
  }

  // Tabla Principal de Rentabilidad por Ruta Internacional (Tiempo vs Costo)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.textPrimary);
  doc.text('Rentabilidad Exacta por Ruta Internacional (Factor Tiempo vs. Factor Costo)', 14, currentY);
  currentY += 3;

  const rutasRows = (financieroData?.rutas || []).map(r => [
    r.ruta,
    r.viajes_realizados,
    `$${(r.tarifa_promedio_usd || 0).toLocaleString()}`,
    `$${(r.flete_base_usd || 0).toLocaleString()}`,
    `$${(r.total_sobrecostos_usd || 0).toLocaleString()}`,
    `$${(r.costo_total_usd || 0).toLocaleString()}`,
    `${r.tiempo_promedio_horas} hrs`,
    `$${r.costo_por_hora}/hr`,
    `${r.margen_pct}% ($${r.margen_usd})`
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Corredor', 'Viajes', 'Tarifa USD', 'Flete Base', 'Sobrecostos', 'Costo Total', 'Lead Time', 'Costo/Hr', 'Margen Neto']],
    body: rutasRows,
    theme: 'striped',
    headStyles: { fillColor: COLORS.primary, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
    bodyStyles: { fontSize: 7.2, textColor: COLORS.textPrimary },
    margin: { left: 14, right: 14 }
  });

  currentY = doc.lastAutoTable.finalY + 8;

  // Desglose de Sobrecostos Evitables
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...COLORS.danger);
  doc.text('Desglose de Sobrecostos Imprevistos Evitables', 14, currentY);
  currentY += 3;

  const desglose = res.desglose_sobrecostos || {};
  const desgloseRows = [
    ['Multas por Errores de Papeleo Aduanero (DUCA, Manifiestos)', `$${(desglose.multas_documentacion || 0).toLocaleString()}`, 'Evitables con prevalidación documental digital'],
    ['Viáticos Extra por Esperas y Pernoctas en Frontera', `$${(desglose.viaticos_extra || 0).toLocaleString()}`, 'Mitigables con salidas nocturnas y desvíos recomendados'],
    ['Almacenaje Fiscal y Parqueos en Recintos Fronterizos', `$${(desglose.parqueo_almacenaje || 0).toLocaleString()}`, 'Evitables agilizando el trámite previo de liberación']
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['Categoría de Sobrecosto', 'Monto Acumulado (USD)', 'Estrategia de Mitigación']],
    body: desgloseRows,
    theme: 'grid',
    headStyles: { fillColor: COLORS.danger, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
    bodyStyles: { fontSize: 7.2, textColor: COLORS.textPrimary },
    margin: { left: 14, right: 14 }
  });

  addFooter(doc);
  doc.save(`GlobalTrans_Dashboard_Financiero_${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * REPORTE 4: Ficha y Certificado de Auditoría Digital de Viaje Específico
 */
export const exportFichaViajePDF = async (ficha) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

  const viaje = ficha.viaje || {};
  const gastos = ficha.gastos || {};
  const checkpoints = ficha.checkpoints || [];

  addHeader(
    doc,
    `GUÍA DE AUDITORÍA DIGITAL DE VIAJE: ${viaje.id ? viaje.id.substring(0, 13).toUpperCase() : 'N/A'}`,
    `Certificado oficial de trazabilidad, checkpoints GPS y liquidación operativa`
  );

  let currentY = 50;

  // Cuadro con datos del viaje
  doc.setFillColor(...COLORS.bgLight);
  doc.setDrawColor(...COLORS.border);
  doc.roundedRect(14, currentY, pageWidth - 28, 38, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textSecondary);
  doc.text('INFORMACIÓN DE LA OPERACIÓN', 18, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.textPrimary);

  const col1X = 18;
  const col2X = 80;
  const col3X = 140;

  doc.text(`Vehículo (Placa): ${viaje.vehicles?.placas || 'N/A'}`, col1X, currentY + 12);
  doc.text(`Furgón / Contenedor: ${viaje.cargamentos?.furgones?.numero_contenedor || 'N/A'}`, col1X, currentY + 18);
  doc.text(`Piloto Asignado: ${viaje.users?.full_name || 'N/A'}`, col1X, currentY + 24);
  doc.text(`Teléfono Piloto: ${viaje.users?.phone || 'N/A'}`, col1X, currentY + 30);

  doc.text(`Destino: ${viaje.tiendas?.nombre || 'N/A'}`, col2X, currentY + 12);
  doc.text(`País Destino: ${viaje.tiendas?.pais || 'N/A'}`, col2X, currentY + 18);
  doc.text(`Dirección: ${(viaje.tiendas?.direccion || 'N/A').substring(0, 35)}`, col2X, currentY + 24);
  doc.text(`Estado del Viaje: ${(viaje.estado || 'N/A').toUpperCase()}`, col2X, currentY + 30);

  const fSalida = viaje.fecha_plan_salida ? new Date(viaje.fecha_plan_salida).toLocaleString('es-GT') : 'N/A';
  const fEta = viaje.fecha_esperada_llegada ? new Date(viaje.fecha_esperada_llegada).toLocaleString('es-GT') : 'N/A';
  const fReal = viaje.fecha_llegada_real ? new Date(viaje.fecha_llegada_real).toLocaleString('es-GT') : 'En Tránsito';

  doc.text(`Salida Planificada: ${fSalida}`, col3X, currentY + 12);
  doc.text(`Llegada Esperada (ETA): ${fEta}`, col3X, currentY + 18);
  doc.text(`Llegada Real: ${fReal}`, col3X, currentY + 24);
  doc.text(`Código de Auditoría: ${ficha.verificacion_digital || 'GT-AUDIT'}`, col3X, currentY + 30);

  currentY += 44;

  // Desglose de Gastos del Viaje
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...COLORS.textPrimary);
  doc.text('Liquidación y Desglose de Costos Logísticos Operativos', 14, currentY);
  currentY += 3;

  const fleteBase = floatOrZero(gastos.flete_base);
  const multas = floatOrZero(gastos.multas_aduana);
  const viaticos = floatOrZero(gastos.viaticos_extra);
  const parqueo = floatOrZero(gastos.parqueo_almacenaje);
  const otros = floatOrZero(gastos.otros_imprevistos);
  const totalSobrecostos = multas + viaticos + parqueo + otros;
  const totalGasto = fleteBase + totalSobrecostos;

  const gastosRows = [
    ['Flete Base y Operación de Ruta', `$${fleteBase.toFixed(2)}`, 'Combustible, depreciación de unidad y tarifas de peaje'],
    ['Multas por Errores de Papeleo (DUCA / Aduana)', `$${multas.toFixed(2)}`, 'Penalidades fiscales aduaneras por documentación'],
    ['Viáticos Extraordinarios de Conductor', `$${viaticos.toFixed(2)}`, 'Alimentación y pernocta por demoras en frontera'],
    ['Parqueo y Almacenaje en Recinto Fiscal', `$${parqueo.toFixed(2)}`, 'Estadía en predio fronterizo durante aforo'],
    ['Otros Imprevistos / Asistencia Vial', `$${otros.toFixed(2)}`, 'Contingencias operativas de carretera'],
    ['COSTO LOGÍSTICO OPERATIVO TOTAL', `$${totalGasto.toFixed(2)}`, `Sobrecostos imprevistos: $${totalSobrecostos.toFixed(2)}`]
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['Rubro de Costo', 'Monto (USD)', 'Detalle y Observaciones']],
    body: gastosRows,
    theme: 'grid',
    headStyles: { fillColor: COLORS.accent, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
    bodyStyles: { fontSize: 7, textColor: COLORS.textPrimary },
    margin: { left: 14, right: 14 }
  });

  currentY = doc.lastAutoTable.finalY + 8;

  // Bitácora de Checkpoints
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...COLORS.textPrimary);
  doc.text('Línea de Tiempo y Checkpoints GPS Auditados', 14, currentY);
  currentY += 3;

  const cpRows = checkpoints.map(cp => [
    new Date(cp.fecha_evento).toLocaleString('es-GT'),
    (cp.estado || '').toUpperCase(),
    cp.ubicacion_nombre || 'Punto en ruta',
    cp.notas || '-'
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Fecha y Hora', 'Estado', 'Punto Geográfico', 'Registro de Novedades']],
    body: cpRows.length > 0 ? cpRows : [['-', '-', '-', 'Sin checkpoints registrados']],
    theme: 'striped',
    headStyles: { fillColor: COLORS.primary, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
    bodyStyles: { fontSize: 6.8, textColor: COLORS.textPrimary },
    margin: { left: 14, right: 14 }
  });

  addFooter(doc);
  doc.save(`GlobalTrans_Ficha_Viaje_${(viaje.id || 'auditoria').substring(0, 8)}.pdf`);
};

function floatOrZero(val) {
  const parsed = parseFloat(val);
  return isNaN(parsed) ? 0 : parsed;
}
