<?php
session_start();

// Verificar si el usuario está logueado
if (!isset($_SESSION['usuario_id'])) {
    header('Location: index.php?tipo=error&mensaje=' . urlencode('Debes iniciar sesión para acceder'));
    exit;
}

// Verificar que sea instructor
$rol_usuario = strtolower(trim($_SESSION['usuario_rol'] ?? ''));

if ($rol_usuario !== 'instructor') {
    header('Location: panel.php?tipo=error&mensaje=' . urlencode('Acceso no autorizado'));
    exit;
}

// Obtener datos del usuario
$usuario_nombre = $_SESSION['usuario_nombre'];
$usuario_email = $_SESSION['usuario_email'];
?>
<!DOCTYPE html>
<html lang="en">
<head>
   <meta charset="UTF-8">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <link rel="stylesheet" href="reports.css">
   <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
   <title>Dashboard de Reportes - SENA</title>
</head>
<body>
   
<div class="dashboard-container">
   <!-- Header -->
   <div class="header">
     <h1><i class="fas fa-chart-bar"></i> Reportes</h1>
     <p>Sistema de Gestión de Horarios e Instructores - SENA</p>
     <div class="user-info-header">
         <span><i class="fas fa-user"></i> <?php echo htmlspecialchars($usuario_nombre); ?></span>
         <a href="panel.php" class="btn-back"><i class="fas fa-arrow-left"></i> Volver al Panel</a>
     </div>
   </div>

   <div class="filters-panel">
     <h3><i class="fas fa-filter"></i> Filtros de Reportes</h3>
     <div class="filters-grid">
       <div class="filter-group">
         <label>Regional</label>
         <select>
        <option>Todas</option>
        <option>Bogotá D.C.</option>
        <option>Antioquia</option>
        <option>Valle del Cauca</option>
        <option>Cundinamarca</option>
         <option>Amazonas</option>
         </select>
       </div>
       <div class="filter-group">
         <label>Centro</label>
         <select>
           <option>Todos</option>
           <option>CEET</option>
         </select>
       </div>
       <div class="filter-group">
         <label>Fecha Inicio</label>
         <input type="date">
       </div>
       <div class="filter-group">
         <label>Fecha Fin</label>
         <input type="date">
       </div>
       <div class="apply-filters">
         <button class="btn-primary"><i class="fas fa-search"></i> Aplicar</button>
         <button class="btn-secondary"><i class="fas fa-times"></i> Limpiar</button>
       </div>
     </div>
   </div>

<div class="tabs">
 <button class="tab-btn active" onclick="openTab(event, 'instructores')">Instructores</button>
 <button class="tab-btn" onclick="openTab(event, 'horarios')">Horarios</button>
 <button class="tab-btn" onclick="openTab(event, 'fichas')">Fichas</button>
 <button class="tab-btn" onclick="openTab(event, 'actividades')">Actividades</button>
 <button class="tab-btn" onclick="openTab(event, 'estadisticos')">Dashboards</button>
 <button class="tab-btn" onclick="openTab(event, 'administrativos')">Administrativos</button>
</div>

<!-- TAB INSTRUCTORES -->
<div class="tab-content active" id="instructores">
           <div class="report-section instructors-reports">
               <div class="section-header">
                   <h3><i class="fas fa-users"></i> Reportes de Instructores</h3>
                   <p>Información detallada sobre el cuerpo docente</p>
               </div>
               <div class="report-list">
                   <div class="report-item" onclick="showReport('instructor-general')">
                       <div class="report-info">
                           <h4>Reporte General de Instructores</h4>
                           <p>Lista completa con información personal y profesional</p>
                       </div>
                       <div class="report-actions">
                           <button class="action-btn btn-view"><i class="fas fa-eye"></i> Ver</button>
                           <button class="action-btn btn-export"><i class="fas fa-download"></i> Excel</button>
                       </div>
                   </div>
                   <div class="report-item" onclick="showReport('carga-academica')">
                       <div class="report-info">
                           <h4>Carga Académica por Instructor</h4>
                           <p>Horas asignadas y distribución semanal</p>
                       </div>
                       <div class="report-actions">
                           <button class="action-btn btn-view"><i class="fas fa-eye"></i> Ver</button>
                           <button class="action-btn btn-export"><i class="fas fa-file-pdf"></i> PDF</button>
                       </div>
                   </div>
                   <div class="report-item" onclick="showReport('competencias-instructor')">
                       <div class="report-info">
                           <h4>Competencias por Instructor</h4>
                           <p>Competencias certificadas y nivel de dominio</p>
                       </div>
                       <div class="report-actions">
                           <button class="action-btn btn-view"><i class="fas fa-eye"></i> Ver</button>
                           <button class="action-btn btn-schedule"><i class="fas fa-clock"></i> Programar</button>
                       </div>
                   </div>
                   <div class="report-item" onclick="showReport('disponibilidad-instructores')">
                       <div class="report-info">
                           <h4>Disponibilidad de Instructores</h4>
                           <p>Horarios libres y capacidad adicional</p>
                       </div>
                       <div class="report-actions">
                           <button class="action-btn btn-view"><i class="fas fa-eye"></i> Ver</button>
                           <button class="action-btn btn-export"><i class="fas fa-calendar-check"></i> Excel</button>
                       </div>
                   </div>
               </div>
           </div>
</div>

<!-- TAB HORARIOS -->
<div class="tab-content" id="horarios">
 <div class="report-section schedules-reports">
               <div class="section-header">
                   <h3><i class="fas fa-calendar-alt"></i> Reportes de Horarios</h3>
                   <p>Gestión y análisis de programación académica</p>
               </div>
               <div class="report-list">
                   <div class="report-item" onclick="showReport('horarios-centro')">
                       <div class="report-info">
                           <h4>Horarios por Centro</h4>
                           <p>Programación completa por centro de formación</p>
                       </div>
                       <div class="report-actions">
                           <button class="action-btn btn-view"><i class="fas fa-eye"></i> Ver</button>
                           <button class="action-btn btn-export"><i class="fas fa-download"></i> Excel</button>
                       </div>
                   </div>
                   <div class="report-item" onclick="showReport('ocupacion-ambientes')">
                       <div class="report-info">
                           <h4>Ocupación de Ambientes</h4>
                           <p>Uso y disponibilidad de espacios físicos</p>
                       </div>
                       <div class="report-actions">
                           <button class="action-btn btn-view"><i class="fas fa-eye"></i> Ver</button>
                           <button class="action-btn btn-export"><i class="fas fa-chart-bar"></i> Gráfico</button>
                       </div>
                   </div>
                   <div class="report-item" onclick="showReport('conflictos-horarios')">
                       <div class="report-info">
                           <h4>Conflictos de Horarios</h4>
                           <p>Identificación de solapamientos y problemas</p>
                       </div>
                       <div class="report-actions">
                           <button class="action-btn btn-view"><i class="fas fa-eye"></i> Ver</button>
                           <button class="action-btn btn-export"><i class="fas fa-exclamation-triangle"></i> Alertas</button>
                       </div>
                   </div>
                   <div class="report-item" onclick="showReport('horarios-instructor')">
                       <div class="report-info">
                           <h4>Horarios por Instructor</h4>
                           <p>Programación individual detallada</p>
                       </div>
                       <div class="report-actions">
                           <button class="action-btn btn-view"><i class="fas fa-eye"></i> Ver</button>
                           <button class="action-btn btn-export"><i class="fas fa-user-clock"></i> PDF</button>
                       </div>
                   </div>
               </div>
           </div>
</div>

<!-- TAB FICHAS -->
<div class="tab-content" id="fichas">
 <!-- Reportes de Fichas -->
           <div class="report-section fichas-reports">
               <div class="section-header">
                   <h3><i class="fas fa-graduation-cap"></i> Reportes de Fichas</h3>
                   <p>Seguimiento de programas formativos y aprendices</p>
               </div>
               <div class="report-list">
                   <div class="report-item" onclick="showReport('fichas-activas')">
                       <div class="report-info">
                           <h4>Fichas Activas</h4>
                           <p>Estado actual de todos los programas en ejecución</p>
                       </div>
                       <div class="report-actions">
                           <button class="action-btn btn-view"><i class="fas fa-eye"></i> Ver</button>
                           <button class="action-btn btn-export"><i class="fas fa-download"></i> CSV</button>
                       </div>
                   </div>
                   <div class="report-item" onclick="showReport('avance-competencias')">
                       <div class="report-info">
                           <h4>Avance de Competencias</h4>
                           <p>Progreso de formación por ficha y competencia</p>
                       </div>
                       <div class="report-actions">
                           <button class="action-btn btn-view"><i class="fas fa-eye"></i> Ver</button>
                           <button class="action-btn btn-export"><i class="fas fa-chart-line"></i> Gráfico</button>
                       </div>
                   </div>
                   <div class="report-item" onclick="showReport('programas-formativos')">
                       <div class="report-info">
                           <h4>Programas Formativos</h4>
                           <p>Análisis de programas por demanda y centro</p>
                       </div>
                       <div class="report-actions">
                           <button class="action-btn btn-view"><i class="fas fa-eye"></i> Ver</button>
                           <button class="action-btn btn-export"><i class="fas fa-graduation-cap"></i> Excel</button>
                       </div>
                   </div>
               </div>
           </div>
</div>

<!-- TAB ACTIVIDADES -->
<div class="tab-content" id="actividades">
<!-- Reportes de Actividades -->
           <div class="report-section activities-reports">
               <div class="section-header">
                   <h3><i class="fas fa-tasks"></i> Reportes de Actividades</h3>
                   <p>Seguimiento de bitácoras y productividad</p>
               </div>
               <div class="report-list">
                   <div class="report-item" onclick="showReport('bitacoras')">
                       <div class="report-info">
                           <h4>Bitácoras de Instructores</h4>
                           <p>Registro de actividades ejecutadas por período</p>
                       </div>
                       <div class="report-actions">
                           <button class="action-btn btn-view"><i class="fas fa-eye"></i> Ver</button>
                           <button class="action-btn btn-export"><i class="fas fa-file-pdf"></i> PDF</button>
                       </div>
                   </div>
                   <div class="report-item" onclick="showReport('productividad')">
                       <div class="report-info">
                           <h4>Productividad</h4>
                           <p>Cumplimiento de programación vs. ejecución</p>
                       </div>
                       <div class="report-actions">
                           <button class="action-btn btn-view"><i class="fas fa-eye"></i> Ver</button>
                           <button class="action-btn btn-export"><i class="fas fa-chart-pie"></i> Dashboard</button>
                       </div>
                   </div>
                   <div class="report-item" onclick="showReport('asistencia')">
                       <div class="report-info">
                           <h4>Asistencia y Participación</h4>
                           <p>Análisis de asistencia de aprendices</p>
                       </div>
                       <div class="report-actions">
                           <button class="action-btn btn-view"><i class="fas fa-eye"></i> Ver</button>
                           <button class="action-btn btn-export"><i class="fas fa-users"></i> Excel</button>
                       </div>
                   </div>
               </div>
           </div>
</div>

<!-- TAB ESTADISTICOS -->
<div class="tab-content" id="estadisticos">
  <div class="report-section stats-reports">
               <div class="section-header">
                   <h3><i class="fas fa-chart-bar"></i> Dashboards Estadísticos</h3>
                   <p>KPIs y métricas de rendimiento</p>
               </div>
               <div class="report-list">
                   <div class="report-item" onclick="showReport('dashboard-ejecutivo')">
                       <div class="report-info">
                           <h4>Dashboard Ejecutivo</h4>
                           <p>Indicadores principales del sistema</p>
                       </div>
                       <div class="report-actions">
                           <button class="action-btn btn-view"><i class="fas fa-eye"></i> Ver</button>
                           <button class="action-btn btn-schedule"><i class="fas fa-envelope"></i> Email</button>
                       </div>
                   </div>
                   <div class="report-item" onclick="showReport('utilizacion-recursos')">
                       <div class="report-info">
                           <h4>Utilización de Recursos</h4>
                           <p>Eficiencia en uso de instructores y ambientes</p>
                       </div>
                       <div class="report-actions">
                           <button class="action-btn btn-view"><i class="fas fa-eye"></i> Ver</button>
                           <button class="action-btn btn-export"><i class="fas fa-chart-area"></i> Gráfico</button>
                       </div>
                   </div>
                   <div class="report-item" onclick="showReport('comparativo-periodos')">
                       <div class="report-info">
                           <h4>Comparativo por Períodos</h4>
                           <p>Análisis de tendencias y crecimiento</p>
                       </div>
                       <div class="report-actions">
                           <button class="action-btn btn-view"><i class="fas fa-eye"></i> Ver</button>
                           <button class="action-btn btn-export"><i class="fas fa-chart-line"></i> Gráfico</button>
                       </div>
                   </div>
               </div>
           </div>
</div>

<!-- TAB ADMINISTRATIVOS -->
<div class="tab-content" id="administrativos">
   <div class="report-section admin-reports">
       <div class="section-header">
           <h3><i class="fas fa-cogs"></i> Reportes Administrativos</h3>
           <p>Información para gestión y auditoría</p>
       </div>
       <div class="report-list">
           <div class="report-item" onclick="showReport('nomina-academica')">
               <div class="report-info">
                   <h4>Nómina Académica</h4>
                   <p>Horas trabajadas para liquidación de honorarios</p>
               </div>
               <div class="report-actions">
                   <button class="action-btn btn-view"><i class="fas fa-eye"></i> Ver</button>
                   <button class="action-btn btn-export"><i class="fas fa-dollar-sign"></i> Excel</button>
               </div>
           </div>
           <div class="report-item" onclick="showReport('cumplimiento-normativo')">
               <div class="report-info">
                   <h4>Cumplimiento Normativo</h4>
                   <p>Verificación de perfiles y certificaciones</p>
               </div>
               <div class="report-actions">
                   <button class="action-btn btn-view"><i class="fas fa-eye"></i> Ver</button>
                   <button class="action-btn btn-export"><i class="fas fa-shield-alt"></i> PDF</button>
               </div>
           </div>
           <div class="report-item" onclick="showReport('auditoria')">
               <div class="report-info">
                   <h4>Auditoría del Sistema</h4>
                   <p>Registro de cambios y accesos al sistema</p>
               </div>
               <div class="report-actions">
                   <button class="action-btn btn-view"><i class="fas fa-eye"></i> Ver</button>
                   <button class="action-btn btn-export"><i class="fas fa-file-alt"></i> Log</button>
               </div>
           </div>
       </div>
   </div>

   <!-- Acciones Rápidas -->
   <div class="quick-actions" style="margin-top: 30px;">
       <h3>Acciones Rápidas</h3>
       <div class="quick-buttons">
           <button class="quick-btn" onclick="generateAllReports()">
               <i class="fas fa-magic"></i> Generar Todos los Reportes
           </button>
           <button class="quick-btn" onclick="scheduleReports()">
               <i class="fas fa-calendar-plus"></i> Programar Reportes
           </button>
           <button class="quick-btn" onclick="exportDashboard()">
               <i class="fas fa-file-export"></i> Exportar Dashboard
           </button>
       </div>
   </div>
</div>

 <!-- Loading Spinner -->
       <div class="loading-spinner" id="loading"></div>
   </div>
 <script src="rs.js"></script>
</body>
</html>