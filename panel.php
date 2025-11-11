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
    <link rel="stylesheet" href="public/css/panel.css">
    <link rel="stylesheet" href="public/css/select.css">
    <link rel="stylesheet" href="public/css/mens.css">
    <title>Panel Instructor</title>
</head>
<body>

<!-- Mensaje de bienvenida -->
<div class="welcome-message" id="welcomeMessage">
    <h3>Bienvenido Instructor</h3>
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
    <div class="sidebar-header">
        <div class="user-profile-header">
            <div class="user-avatar-header"><?php echo $iniciales; ?></div>
            <div class="user-info-header">
                <div class="user-name-header"><?php echo htmlspecialchars($usuario_nombre); ?></div>
                <div class="user-role-header">Instructor</div>
            </div>
        </div>
    </div>

    <nav class="sidebar-nav">
        <div class="nav-item active" onclick="showSection('dashboard')">
            <span class="nav-icon"><i class="fa-solid fa-house-user"></i></span>
            <span>Dashboard</span>
        </div>
        
        <div class="nav-item" onclick="showSection('schedules')">
            <span class="nav-icon"><i class="fa-regular fa-calendar"></i></span>
            <span>Horarios</span>
        </div>

        <div class="nav-item" onclick="showSection('classes')">
            <span class="nav-icon"><i class="fa-solid fa-gears"></i></span>
            <span>Configuración</span>
            <span class="nav-badge" id="classesBadge">0</span>
        </div>
        
        <div class="nav-item" onclick="showSection('students')">
            <span class="nav-icon"><i class="fa-solid fa-user-graduate"></i></span>
            <span>Aprendices</span>
            <span class="nav-badge" id="studentsBadge">0</span>
        </div>

        <div class="nav-item" onclick="showSection('messages')">
            <span class="nav-icon"><i class="fas fa-comments"></i></span>
            <span>Mensajes</span>
            <span class="nav-badge" id="messageBadge" style="display: none;">0</span>
        </div>
    </nav>

    <div class="sidebar-footer">
        <div class="divide"></div>
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
        <div class="nav-item theme-toggle" id="theme-toggle" title="Cambiar Tema">
            <i class="fas fa-moon" id="theme-icon"></i>
            <span class="theme-label">Modo Oscuro</span>
        </div>
    </div>
</aside>

<main class="main-content">
    <!-- DASHBOARD -->
    <div id="dashboard-section" class="content-section active">
        <div class="content-header">
            <div>
                <h1>Bienvenido, <?php echo htmlspecialchars($usuario_nombre); ?></h1>
                <p>Gestiona tus horarios, clases y estudiantes de manera eficiente desde esta plataforma.</p>
            </div>
        </div>
        <div class="content-fast">
            <div class="title-acciones">
                <h1>Funciones del sistema</h1>
                <div class="divide-small"></div>
                <p>Accede rápidamente a las funciones principales del sistema</p>
            </div>
            <div class="acciones-rapidas">
                <div class="accion-card" onclick="showSection('schedules')">
                    <i class="fa-regular fa-calendar accion-icon"></i> 
                    <div><h3>Gestionar Horarios</h3><p>Administra y organiza tus horarios de clases de manera eficiente.</p></div>
                </div>
                <div class="accion-card" onclick="showSection('messages')">
                    <i class="fas fa-comments accion-icon"></i>
                    <div>
                        <h3>Mensajes</h3>
                        <p>Comunícate con el coordinador académico.</p>
                        <span class="message-counter" id="messagesCounter" style="display: none;">0</span>
                    </div>
                </div>
                <div class="accion-card" onclick="showSection('classes')">
                    <i class="fa-solid fa-gear accion-icon"></i>
                    <div><h3>Configuración</h3><p>Aquí puedes hacer los cambios en tu cuenta.</p></div>
                </div>
                <div class="accion-card" onclick="showSection('students')">
                    <i class="fa-solid fa-user-graduate accion-icon"></i>
                    <div><h3>Administrar Estudiantes</h3><p>Gestiona la información y progreso de tus estudiantes fácilmente.</p></div>
                </div>
            </div>
        </div>
    </div>

    <!-- HORARIOS -->
    <div id="schedules-section" class="content-section">
        <!-- VISTA PRINCIPAL -->
        <div id="schedules-main" class="schedules-view active">
            <div class="content-header">
                <div>
                    <h1>Gestión de Horarios</h1>
                    <p>Crea y administra los horarios académicos para tus clases</p>
                </div>
                <button class="btn btn-primary" onclick="showScheduleView('create')">
                    <i class="fa-solid fa-plus"></i> Crear Nuevo Horario
                </button>
            </div>

            <!-- GRID VACÍO AL INICIO -->
            <div class="schedules-grid" id="schedulesGrid">
                <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                   <i class="fa-regular fa-calendar-xmark" style="font-size: 64px; color: var(--text-secondary); margin-bottom: 20px;"></i>
                    <h3 style="margin-bottom: 10px;">No tienes horarios creados</h3>
                    <p style="color: var(--text-secondary);">Haz clic en "Crear Nuevo Horario" para comenzar</p>
                </div>
            </div>
        </div>

        <!-- CREAR / EDITAR -->
        <div id="schedules-create" class="schedules-view">
            <div class="content-header">
                <button class="btn btn-secondary" onclick="showScheduleView('main')">
                    <i class="fa-solid fa-arrow-left"></i> Volver
                </button>
                <h2 id="createEditTitle">Crear Nuevo Horario</h2>
            </div>
            <div class="schedule-form-container">
                <div class="container">
                    <div class="form-card">
                        <div class="form-card-header">
                            <h3><i class="fa-solid fa-gear"></i> Configuración Básica</h3>
                        </div>
                        <div class="form-card-body">
                            <div class="form-group">
                                <label>Nombre del Horario</label>
                                <input type="text" class="form-control" placeholder="" id="scheduleName">
                            </div>
                             <div class="form-group">
    <label>Selecciona la hora:</label>
    <div class="time-duration-row">
        <div class="time-input-container">
            <input type="time" id="horaInicio" class="time-input" value="09:00" required>
            <span class="time-label" id="horaDisplay">09:00 a.m.</span>
        </div>
        <div class="duration-selector">
            <button type="button" id="durationButton" class="duration-btn">
                <span id="durationText">1 hora</span>
               <i class="fa-regular fa-chevron-down"></i>
            </button>
            <div id="durationMenu" class="duration-menu">
                <div class="duration-option" data-minutes="30">30 minutos</div>
                <div class="duration-option selected" data-minutes="60">1 hora</div>
                <div class="duration-option" data-minutes="120">2 horas</div>
            </div>
        </div>
    </div>
</div>

    
                            <div class="form-group">
                                <button class="btn btn-primary" onclick="generateScheduleGrid()">
                                    <i class="fa-solid fa-table"></i> Generar Tabla de Horario
                                </button>
                            </div>
                        </div>
                    </div>

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
                                    <tbody id="scheduleTableBody"></tbody>
                                </table>
                            </div>
                            <div class="form-actions">
                                <button class="btn btn-secondary" onclick="showScheduleView('main')">
                                    <i class="fa-solid fa-times"></i> Cancelar
                                </button>
                                <button class="btn btn-primary" onclick="saveSchedule()">
                                    <i class="fa-solid fa-save"></i> Guardar Horario
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- VER HORARIO -->
        <div id="schedules-view" class="schedules-view">
            <div class="content-header">
                <button class="btn btn-secondary" onclick="showScheduleView('main')">
                    <i class="fa-solid fa-arrow-left"></i> Volver
                </button>
                <div>
                    <h1 id="viewHorarioNombre">Horario</h1>
                    <p>Visualización completa del horario académico</p>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-secondary" onclick="exportarPDF()">
                        <i class="fa-solid fa-download"></i> Exportar PDF
                    </button>
                    <button class="btn btn-primary" id="btnEditarDesdeVista">
                        <i class="fa-solid fa-edit"></i> Editar
                    </button>
                </div>
            </div>
            <div class="schedule-view-container" id="viewScheduleContainer"></div>
        </div>
    </div>

    <!-- MENSAJES -->
    <div id="messages-section" class="content-section">
        <div class="content-header">
            <div>
                <h1>Mensajes</h1>
                <p>Comunícate directamente con el coordinador académico</p>
            </div>
        </div>

        <div class="messages-container">
            <!-- Panel izquierdo: Lista de conversaciones -->
            <div class="conversations-panel">
                <div class="conversations-header">
                    <h3>Conversaciones</h3>
                </div>
                
                <div class="conversations-search">
                    <i class="fas fa-search"></i>
                    <input type="text" id="conversationSearch" placeholder="Buscar conversación..." 
                           oninput="searchConversations()">
                </div>
                
                <div class="conversations-list" id="conversationsList">
                    <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
                        <i class="fas fa-inbox" style="font-size: 48px; opacity: 0.3; margin-bottom: 15px;"></i>
                        <p>Cargando conversaciones...</p>
                    </div>
                </div>
            </div>

            <!-- Panel derecho: Chat activo -->
            <div class="chat-panel">
                <div class="chat-header" id="chatHeader" style="display: none;">
                    <div class="chat-header-info">
                        <div class="chat-avatar">
                            <i class="fas fa-user-tie"></i>
                        </div>
                        <div>
                            <h4 id="chatInstructorName">Coordinador</h4>
                            <p id="chatInstructorSubject">Coordinación Académica</p>
                        </div>
                    </div>
                </div>
                
                <div class="chat-messages" id="chatMessages">
                    <div style="text-align: center; padding: 60px 20px; color: var(--text-secondary);">
                        <i class="fas fa-comment-dots" style="font-size: 64px; margin-bottom: 20px; opacity: 0.3;"></i>
                        <h3>Selecciona una conversación</h3>
                        <p>Haz clic en una conversación para comenzar a chatear</p>
                    </div>
                </div>
                
                <div class="chat-input-area" id="chatInputArea" style="display: none;">
                    <input type="text" id="messageInput" placeholder="Escribe tu mensaje aquí..." 
                           maxlength="1000">
                    <button class="btn btn-primary" onclick="sendMessage()" title="Enviar mensaje">
                        <i class="fa-regular fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- CONFIGURACIÓN -->
    <div id="classes-section" class="content-section">
        <div id="config-main" class="schedules-view active">
            <div class="content-header">
                <div>
                    <h1>Configuración</h1>
                    <p>Aquí podrás cambiar configuraciones de tu cuenta.</p>
                </div>
                <button class="btn btn-primary" onclick="showConfigView('edit')">
                    <i class="fa-solid fa-user-edit"></i> Editar información personal
                </button>   
            </div>
            <div class="schedules-grid">
                <div class="schedule-card">
                    <div class="schedule-card-header">
                        <div>
                            <h3>Información Personal</h3>
                            <p class="schedule-meta">
                                <i class="fa-regular fa-user"></i> Actualiza tus datos personales
                            </p>
                        </div>
                    </div>
                    <div class="schedule-card-body">
                        <div class="schedule-stats">
                            <div class="stat-item">
                                <i class="fa-regular fa-id-card"></i>
                                <span>Nombre: <?php echo htmlspecialchars($usuario_nombre); ?></span>
                            </div>
                            <div class="stat-item">
                                <i class="fa-regular fa-envelope"></i>
                                <span><?php echo htmlspecialchars($usuario_email); ?></span>
                            </div>
                            <div class="stat-item">
                                <i class="fa-regular fa-user"></i>
                                <span>Instructor</span>
                            </div>
                        </div>
                    </div>
                    <div class="schedule-card-footer">
                        <button class="btn btn-primary btn-sm" onclick="showConfigView('edit')">
                            <i class="fa-solid fa-edit"></i> Editar
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div id="config-edit" class="schedules-view">
            <div class="content-header">
                <button class="btn btn-secondary" onclick="showConfigView('main')">
                    <i class="fa-solid fa-arrow-left"></i> Volver
                </button>
                <h2>Editar Información Personal</h2>
            </div>
            <div class="schedule-form-container">
                <div class="form-card">
                    <div class="form-card-header">
                        <h3><i class="fa-solid fa-user-edit"></i> Información Personal</h3>
                    </div>
                    <div class="form-card-body">
                        <form id="editPersonalInfoForm">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Cédula</label>
                                    <input type="text" class="form-control" id="editCedula" placeholder="" required>
                                </div>
                                <div class="form-group">
                                    <label>Teléfono</label>
                                    <input type="tel" class="form-control" id="editTelefono" placeholder="" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Fecha de Nacimiento</label>
                                    <div style="display: flex; gap: 10px;">
                                        <input type="text" class="form-control" id="editFechaNacimiento" 
                                               placeholder="dd/mm/aaaa" style="flex: 1; cursor: pointer;"
                                               onclick="openDateModal('nacimiento')">
                                        <button type="button" class="btn btn-secondary" onclick="openDateModal('nacimiento')">
                                            <i class="fa-regular fa-calendar"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label>Fecha de Vinculación</label>
                                    <div style="display: flex; gap: 10px;">
                                        <input type="text" class="form-control" id="editFechaVinculacion" 
                                               placeholder="dd/mm/aaaa" style="flex: 1; cursor: pointer;"
                                               onclick="openDateModal('vinculacion')">
                                        <button type="button" class="btn btn-secondary" onclick="openDateModal('vinculacion')">
                                            <i class="fa-regular fa-calendar"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Título Profesional</label>
                                    <input type="text" class="form-control" id="editTituloProfesional" placeholder="">
                                </div>
                                <div class="form-group">
                                    <label>Especialidad</label>
                                    <input type="text" class="form-control" id="editEspecialidad" placeholder="">
                                </div>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" onclick="showConfigView('main')">
                                    <i class="fa-solid fa-times"></i> Cancelar
                                </button>
                                <button type="button" class="btn btn-primary" onclick="savePersonalInfo()">
                                    <i class="fa-solid fa-save"></i> Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- MODAL CALENDARIO -->
        <div class="calendar-modal" id="calendarModal">
            <div class="calendar-modal-overlay" onclick="closeCalendarModal()"></div>
            <div class="calendar-modal-content">
                <div class="calendar-modal-header">
                    <h3 id="calendarModalTitle">Seleccionar Fecha</h3>
                    <button class="calendar-modal-close" onclick="closeCalendarModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="calendar-modal-body">
                    <div class="calendar-controls">
                        <button class="calendar-btn" onclick="previousMonthModal()"><i class="fas fa-chevron-left"></i></button>
                        <span class="calendar-current-month" id="modalCalendarMonth"></span>
                        <button class="calendar-btn" onclick="nextMonthModal()"><i class="fas fa-chevron-right"></i></button>
                    </div>
                    <div class="calendar-weekdays">
                        <div class="calendar-weekday">Dom</div>
                        <div class="calendar-weekday">Lun</div>
                        <div class="calendar-weekday">Mar</div>
                        <div class="calendar-weekday">Mié</div>
                        <div class="calendar-weekday">Jue</div>
                        <div class="calendar-weekday">Vie</div>
                        <div class="calendar-weekday">Sáb</div>
                    </div>
                    <div class="calendar-days-grid" id="modalCalendarDays"></div>
                </div>
                <div class="calendar-modal-footer">
                    <button class="btn btn-secondary" onclick="closeCalendarModal()">Cancelar</button>
                    <button class="btn btn-primary" onclick="selectCurrentModalDate()">Seleccionar</button>
                </div>
            </div>
        </div>
    </div>

    <!-- ESTUDIANTES -->
    <div id="students-section" class="content-section">
        <div class="content-header">
            <div>
                <h1>Administrar Estudiantes</h1>
                <p>Gestiona la información de tus estudiantes</p>
            </div>
            <button class="btn btn-primary" onclick="showStudentView('add')">
                <i class="fa-solid fa-user-plus"></i> Agregar Nuevo Estudiante
            </button>
        </div>
    </div>

    <!-- NOTIFICACIONES -->
</main>

<script src="js/panel.js"></script>
<script src="js/menss.js"></script>
</body>
</html>