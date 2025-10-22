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
    if ($rol_usuario === 'coordinador') {
        header('Location: coordinador.php?tipo=error&mensaje=' . urlencode('Debes usar el panel de coordinador'));
        exit;
    }
    header('Location: index.php?tipo=error&mensaje=' . urlencode('Rol no autorizado'));
    exit;
}

// Manejar logout
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: index.php?tipo=exito&mensaje=' . urlencode('Sesión cerrada exitosamente'));
    exit;
}

// Obtener datos del usuario de la sesión
$usuario_nombre = $_SESSION['usuario_nombre'];
$usuario_email = $_SESSION['usuario_email'];

// Obtener iniciales para el avatar
$iniciales = '';
$nombres = explode(' ', $usuario_nombre);
foreach ($nombres as $nombre) {
    $iniciales .= strtoupper(substr($nombre, 0, 1));
    if (strlen($iniciales) >= 2) break;
}
if (strlen($iniciales) == 0) {
    $iniciales = 'US';
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link rel="stylesheet" href="panel.css">
    <title>Panel Instructor</title>
</head>
<body>

<!-- Mensaje de bienvenida -->
<div class="welcome-message" id="welcomeMessage">
    <h3>Bienvenido Instructor <i class="fas fa-check-circle"></i></h3>
    <p>Hola <?php echo htmlspecialchars($usuario_nombre); ?>, has accedido exitosamente al panel de Instructor.</p>
</div>

<!-- Botón menú móvil -->
<button class="mobile-menu-btn" onclick="toggleSidebar()">
    <i class="fa-solid fa-bars"></i>
</button>

<!-- Overlay para móvil -->
<div class="sidebar-overlay" id="sidebarOverlay" onclick="toggleSidebar()"></div>

<!-- Sidebar -->
<aside class="sidebar" id="sidebar">
    <!-- Header con Avatar y Nombre -->
     <div class="sidebar-header">
        <div class="user-profile-header">
            <div class="user-avatar-header"><?php echo $iniciales; ?></div>
            <div class="user-info-header">
                <div class="user-name-header"><?php echo htmlspecialchars($usuario_nombre); ?></div>
                <div class="user-role-header">Instructor</div>
            </div>
        </div>
    </div>

    <!-- Navegación Principal -->
    <nav class="sidebar-nav">
        <div class="nav-item active" onclick="showSection('dashboard')">
            <span class="nav-icon"><i class="fa-solid fa-house"></i></span>
            <span>Dashboard</span>
        </div>
        
        <div class="nav-item" onclick="showSection('schedules')">
            <span class="nav-icon"><i class="fa-regular fa-calendar"></i></span>
            <span>Horarios</span>
        </div>

        <div class="nav-item" onclick="showSection('classes')">
            <span class="nav-icon"><i class="fa-solid fa-chalkboard-teacher"></i></span>
            <span>Reporte</span>
            <span class="nav-badge" id="classesBadge">0</span>
        </div>
        
        <div class="nav-item" onclick="showSection('students')">
            <span class="nav-icon"><i class="fa-solid fa-user-graduate"></i></span>
            <span>Estudiantes</span>
            <span class="nav-badge" id="studentsBadge">0</span>
        </div>
    </nav>

    <!-- Footer del Sidebar -->
    <div class="sidebar-footer">
        <div class="divide"></div>

        <!-- Dropdown de Usuario -->
        <div class="nav-dropdown-container">
            <div class="nav-dropdown-toggle" onclick="toggleDropdown()">
                <span class="nav-icon"><i class="fa-solid fa-user-circle"></i></span>
                <span>Mi Cuenta</span>
                <i class="fas fa-chevron-down dropdown-arrow"></i>
            </div>
            <div class="nav-dropdown-menu" id="navDropdownMenu">
                <a href="cambiar_password.php" class="dropdown-item">
                    <i class="fa-solid fa-user-lock"></i>
                    <span>Cambiar Contraseña</span>
                </a>
                <a href="javascript:void(0)" class="dropdown-item" onclick="logout()">
                    <i class="fas fa-sign-out-alt"></i>
                    <span>Cerrar Sesión</span>
                </a>
            </div>
        </div>

        <!-- Toggle de Tema -->
        <div class="nav-item theme-toggle" id="theme-toggle" title="Cambiar Tema">
            <i class="fas fa-moon" id="theme-icon"></i>
            <span class="theme-label">Modo Oscuro</span>
        </div>
    </div>
</aside>

<!-- Main Content -->
<main class="main-content">
    <!-- SECCIÓN: DASHBOARD -->
    <div id="dashboard-section" class="content-section active">
        <div class="content-header">
            <div>
                <h1>Bienvenido, <?php echo htmlspecialchars($usuario_nombre); ?></h1>
                <p>Gestiona tus horarios, clases y estudiantes de manera eficiente desde esta plataforma.</p>
            </div>
        </div>
        
        <!-- Acciones Rápidas -->
        <div class="content-fast">
            <div class="title-acciones">
                <h1>Funciones del sistema</h1>
                <div class="divide-small"></div>
                <p>Accede rápidamente a las funciones principales del sistema</p>
            </div>
            
            <div class="acciones-rapidas">
                <div class="accion-card" onclick="showSection('schedules')">
                    <i class="fa-regular fa-calendar-days accion-icon"></i>
                    <div>
                        <h3>Gestionar Horarios</h3>
                        <p>Administra y organiza tus horarios de clases de manera eficiente.</p>
                    </div>
                </div>
                
                <div class="accion-card" onclick="showSection('classes')">
                    <i class="fa-regular fa-file accion-icon"></i>
                    <div>
                        <h3>Ver Reporte</h3>
                        <p>Consulta el reporte detallado de tus clases y su desempeño.</p>
                    </div>
                </div>
                
                <div class="accion-card" onclick="showSection('students')">
                    <i class="fa-solid fa-user-graduate accion-icon"></i>
                    <div>
                        <h3>Administrar Estudiantes</h3>
                        <p>Gestiona la información y progreso de tus estudiantes fácilmente.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- SECCIÓN: HORARIOS -->
    <div id="schedules-section" class="content-section">
        <!-- Vista Principal de Horarios -->
        <div id="schedules-main" class="schedules-view active">
            <div class="content-header">
                <div>
                    <h1>Gestión de Horarios</h1>
                    <p>Crea y administra los horarios académicos para tus clases</p>
                </div>
                <button class="btn btn-primary" onclick="showScheduleView('create')">
                    <i class="fa-solid fa-plus"></i>
                    Crear Nuevo Horario
                </button>
            </div>

            <!-- Lista de Horarios Existentes -->
            <div class="schedules-grid">
                <div class="schedule-card">
                    <div class="schedule-card-header">
                        <div>
                            <h3>Horario</h3>
                            <p class="schedule-meta">
                                <i class="fa-solid fa-calendar-days"></i>
                                Lunes a Viernes • 6:00 AM - 10:00 PM
                            </p>
                        </div>
                        <span class="badge badge-success">Activo</span>
                    </div>
                    <div class="schedule-card-body">
                        <div class="schedule-stats">
                            <div class="stat-item">
                                <i class="fa-solid fa-book"></i>
                                <span>Materias</span>
                            </div>
                            <div class="stat-item">
                                <i class="fa-solid fa-clock"></i>
                                <span>Bloques</span>
                            </div>
                            <div class="stat-item">
                                <i class="fa-solid fa-users"></i>
                                <span> Grupos</span>
                            </div>
                        </div>
                    </div>
                    <div class="schedule-card-footer">
                        <button class="btn btn-secondary btn-sm" onclick="viewSchedule(1)">
                            <i class="fa-solid fa-eye"></i>
                            Ver Horario
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="editSchedule(1)">
                            <i class="fa-solid fa-edit"></i>
                            Editar
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteSchedule(1)">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>

                <div class="schedule-card">
                    <div class="schedule-card-header">
                        <div>
                            <h3>Horario Turno Tarde</h3>
                            <p class="schedule-meta">
                                <i class="fa-solid fa-calendar-days"></i>
                                Lunes a Sábado • 2:00 PM - 8:00 PM
                            </p>
                        </div>
                        <span class="badge badge-warning">Borrador</span>
                    </div>
                    <div class="schedule-card-body">
                        <div class="schedule-stats">
                            <div class="stat-item">
                                <i class="fa-solid fa-book"></i>
                                <span>Materias</span>
                            </div>
                            <div class="stat-item">
                                <i class="fa-solid fa-clock"></i>
                                <span>Bloques</span>
                            </div>
                            <div class="stat-item">
                                <i class="fa-solid fa-users"></i>
                                <span>Grupos</span>
                            </div>
                        </div>
                    </div>
                    <div class="schedule-card-footer">
                        <button class="btn btn-secondary btn-sm" onclick="viewSchedule(2)">
                            <i class="fa-solid fa-eye"></i>
                            Ver Horario
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="editSchedule(2)">
                            <i class="fa-solid fa-edit"></i>
                            Editar
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteSchedule(2)">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Vista Crear/Editar Horario -->
        <div id="schedules-create" class="schedules-view">
            <div class="content-header">
                <button class="btn btn-secondary" onclick="showScheduleView('main')">
                    <i class="fa-solid fa-arrow-left"></i>
                    Volver
                </button>
                <h1>Crear Nuevo Horario</h1>
            </div>

            <div class="schedule-form-container">
                <!-- Paso 1: Configuración Básica -->
                <div class="form-card">
                    <div class="form-card-header">
                        <h3><i class="fa-solid fa-gear"></i> Configuración Básica</h3>
                    </div>
                    <div class="form-card-body">
                        <div class="form-group">
                            <label>Nombre del Horario </label>
                            <input type="text" class="form-control" placeholder="" id="scheduleName">
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>Hora de Inicio </label>
                                <input type="time" class="form-control" value="07:00" id="startTime">
                            </div>
                            <div class="form-group">
                                <label>Hora de Fin </label>
                                <input type="time" class="form-control" value="18:00" id="endTime">
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>Duración por Bloque (minutos) </label>
                                <select class="form-control" id="blockDuration">
                                    <option value="45">45 minutos</option>
                                    <option value="50">50 minutos</option>
                                    <option value="60" selected>60 minutos (1 hora)</option>
                                    <option value="90">90 minutos (1.5 horas)</option>
                                    <option value="120">120 minutos (2 horas)</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Descanso entre Bloques (minutos)</label>
                                <select class="form-control" id="breakDuration">
                                    <option value="0">Sin descanso</option>
                                    <option value="5">5 minutos</option>
                                    <option value="10" selected>10 minutos</option>
                                    <option value="15">15 minutos</option>
                                    <option value="20">20 minutos</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Días Activos </label>
                            <div class="days-selector">
                                <label class="day-checkbox">
                                    <input type="checkbox" checked>
                                    <span>Lun</span>
                                </label>
                                <label class="day-checkbox">
                                    <input type="checkbox" checked>
                                    <span>Mar</span>
                                </label>
                                <label class="day-checkbox">
                                    <input type="checkbox" checked>
                                    <span>Mié</span>
                                </label>
                                <label class="day-checkbox">
                                    <input type="checkbox" checked>
                                    <span>Jue</span>
                                </label>
                                <label class="day-checkbox">
                                    <input type="checkbox" checked>
                                    <span>Vie</span>
                                </label>
                                <label class="day-checkbox">
                                    <input type="checkbox">
                                    <span>Sáb</span>
                                </label>
                            </div>
                        </div>

                        <button class="btn btn-primary" onclick="generateScheduleGrid()">
                            <i class="fa-solid fa-table"></i>
                            Generar Tabla de Horario
                        </button>
                    </div>
                </div>

                <!-- Paso 2: Tabla de Horario -->
                <div class="form-card" id="scheduleGridCard" style="display: none;">
                    <div class="form-card-header">
                        <h3><i class="fa-solid fa-table-cells"></i> Asignación de Clases</h3>
                        <div class="legend">
                            <span class="legend-item"><span class="color-box" style="background: #4285f4;"></span> Matemáticas</span>
                            <span class="legend-item"><span class="color-box" style="background: #34a853;"></span> Ciencias</span>
                            <span class="legend-item"><span class="color-box" style="background: #fbbc04;"></span> Idiomas</span>
                        </div>
                    </div>
                    <div class="form-card-body">
                        <div class="schedule-grid-container">
                            <table class="schedule-table">
                                <thead>
                                    <tr>
                                        <th class="time-column">Hora</th>
                                        <th>Lunes</th>
                                        <th>Martes</th>
                                        <th>Miércoles</th>
                                        <th>Jueves</th>
                                        <th>Viernes</th>
                                    </tr>
                                </thead>
                                <tbody id="scheduleTableBody">
                                    <!-- Se genera dinámicamente -->
                                </tbody>
                            </table>
                        </div>

                        <div class="form-actions">
                            <button class="btn btn-secondary" onclick="showScheduleView('main')">
                                <i class="fa-solid fa-times"></i>
                                Cancelar
                            </button>
                            <button class="btn btn-primary" onclick="saveSchedule()">
                                <i class="fa-solid fa-save"></i>
                                Guardar Horario
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Vista Ver Horario (Solo Lectura) -->
        <div id="schedules-view" class="schedules-view">
            <div class="content-header">
                <button class="btn btn-secondary" onclick="showScheduleView('main')">
                    <i class="fa-solid fa-arrow-left"></i>
                    Volver
                </button>
                <div>
                    <h1>Horario Semestre 2025-1</h1>
                    <p>Visualización completa del horario académico</p>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-secondary">
                        <i class="fa-solid fa-download"></i>
                        Exportar PDF
                    </button>
                    <button class="btn btn-primary" onclick="editSchedule(1)">
                        <i class="fa-solid fa-edit"></i>
                        Editar
                    </button>
                </div>
            </div>

            <div class="schedule-view-container">
                <table class="schedule-table view-mode">
                    <thead>
                        <tr>
                            <th class="time-column">Hora</th>
                            <th>Lunes</th>
                            <th>Martes</th>
                            <th>Miércoles</th>
                            <th>Jueves</th>
                            <th>Viernes</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Contenido generado dinámicamente -->
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- SECCIÓN: CLASES -->
    <div id="classes-section" class="content-section">
        <div class="content-header">
            <div>
                <h1>Reporte de Clases</h1>
                <p>Consulta el reporte detallado de tus clases</p>
            </div>
        </div>
    </div>

    <!-- SECCIÓN: ESTUDIANTES -->
    <div id="students-section" class="content-section">
        <div class="content-header">
            <div>
                <h1>Administrar Estudiantes</h1>
                <p>Gestiona la información de tus estudiantes</p>
            </div>
        </div>
    </div>
</main>

<!-- Modal para Asignar Clase -->
<div class="modal" id="assignModal">
    <div class="modal-content">
        <div class="modal-header">
            <h3>Asignar Clase</h3>
            <button class="modal-close" onclick="closeAssignModal()">
                <i class="fa-solid fa-times"></i>
            </button>
        </div>
        <div class="modal-body">
            <div class="form-group">
                <label>Materia *</label>
                <select class="form-control" id="modalSubject">
                    <option value="">Seleccionar materia...</option>
                    <option value="matematicas">Matemáticas</option>
                    <option value="fisica">Física</option>
                    <option value="quimica">Química</option>
                    <option value="ingles">Inglés</option>
                    <option value="historia">Historia</option>
                </select>
            </div>
            <div class="form-group">
                <label>Instructor *</label>
                <select class="form-control" id="modalInstructor">
                    <option value="">Seleccionar instructor...</option>
                    <option value="1">Prof. Juan García</option>
                    <option value="2">Prof. María Rodríguez</option>
                    <option value="3">Prof. Carlos López</option>
                </select>
            </div>
            <div class="form-group">
                <label>Aula/Salón *</label>
                <input type="text" class="form-control" placeholder="Ej: Aula 101, Lab 2" id="modalRoom">
            </div>
            <div class="form-group">
                <label>Notas (Opcional)</label>
                <textarea class="form-control" rows="2" placeholder="Información adicional..." id="modalNotes"></textarea>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeAssignModal()">Cancelar</button>
            <button class="btn btn-primary" onclick="assignClass()">
                <i class="fa-solid fa-check"></i>
                Asignar
            </button>
        </div>
    </div>
</div>

<!-- Script JavaScript -->
<script src="panel.js"></script>

</body>
</html>