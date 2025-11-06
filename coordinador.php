<?php
session_start();

// Verificar que esté logueado
if (!isset($_SESSION['usuario_id'])) {
    header('Location: index.php?tipo=error&mensaje=' . urlencode('Debes iniciar sesión'));
    exit;
}

// Verificar que sea coordinador
$rol_usuario = strtolower(trim($_SESSION['usuario_rol'] ?? ''));

if ($rol_usuario !== 'coordinador') {
    header('Location: panel.php?tipo=error&mensaje=' . urlencode('No tienes permisos para acceder a esta sección'));
    exit;
}

// Obtener datos del usuario
$usuario_nombre = $_SESSION['usuario_nombre'];
$usuario_email = $_SESSION['usuario_email'];
$usuario_rol = $_SESSION['usuario_rol'];

// Manejar logout
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: index.php?tipo=exito&mensaje=' . urlencode('Sesión cerrada exitosamente'));
    exit;
}

// Obtener iniciales para el avatar
$iniciales = '';
$palabras = explode(' ', $usuario_nombre);
foreach($palabras as $palabra) {
    $iniciales .= strtoupper(substr($palabra, 0, 1));
    if(strlen($iniciales) >= 2) break;
}
if(strlen($iniciales) == 0) {
    $iniciales = 'CO';
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="cord.css">
    <link rel="stylesheet" href="mens.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <title>Panel Coordinador - <?php echo htmlspecialchars($usuario_nombre); ?></title>
    <style>
        .welcome-message {
            background: white;
            color: #000000;
            padding: 1.5rem;
            margin: 1rem;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            display: none;
            animation: slideDown 0.5s ease-out;
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            max-width: 400px;
        }
        
        .welcome-message.show {
            display: block;
        }
        
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .welcome-message h3 {
            margin: 0 0 10px 0;
            font-size: 18px;
        }
        
        .welcome-message p {
            margin: 0;
            font-size: 14px;
            opacity: 0.95;
        }
    </style>
</head>
<body>
    <!-- Mensaje de bienvenida -->
    <div class="welcome-message" id="welcomeMessage">
        <h3>Bienvenido Coordinador <i class="fas fa-check-circle"></i></h3>
        <p>Hola <?php echo htmlspecialchars($usuario_nombre); ?>, has accedido exitosamente al panel de coordinación.</p>
    </div>

    <button class="mobile-menu-btn" onclick="toggleSidebar()"><i class="fa-solid fa-bars-staggered"></i></button>

    <aside class="sidebar" id="sidebar">
        <!-- Header con Avatar y Nombre -->
        <div class="sidebar-header">
            <div class="user-profile-header">
                <div class="user-avatar-header"><?php echo $iniciales; ?></div>
                <div class="user-info-header">
                    <div class="user-name-header"><?php echo htmlspecialchars($usuario_nombre); ?></div>
                    <div class="user-role-header">Coordinador</div>
                </div>
            </div>
        </div>

        <!-- Navegación Principal -->
        <nav class="sidebar-nav">
            <div class="nav-item active" onclick="showSection('dashboard', event)">
                <span class="nav-icon"><i class="fa-solid fa-house-user"></i></span>
                <span>Dashboard</span>
            </div>

            <div class="nav-item" onclick="showSection('schedules', event)">
                <span class="nav-icon"><i class="fa-regular fa-calendar"></i></span>
                <span>Horarios</span>
            </div>

            <div class="nav-item" onclick="showSection('instructor', event)">
                <span class="nav-icon"><i class="fa-solid fa-users"></i></span>
                <span>Instructores</span>
                <span class="nav-badge" id="instructorBadge">0</span>
            </div>

            <div class="nav-item" onclick="showSection('environment', event)">
                <span class="nav-icon"><i class="fa-solid fa-building"></i></span>
                <span>Ambientes</span>
                <span class="nav-badge" id="ambienceBadge">0</span>
            </div>

            <div class="nav-item" onclick="showSection('messages', event)">
                <span class="nav-icon"><i class="fas fa-comments"></i></span>
                <span>Mensajes</span>
                <span class="nav-badge" id="messageBadge" style="display: none;">0</span>
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

    <main class="main-content">
        <!-- DASHBOARD SECTION -->
        <div id="dashboard-section" class="content-section active">
            <div class="content-header">
                <h1>Bienvenido, <?php echo htmlspecialchars($usuario_nombre); ?></h1>
                <p>Gestiona horarios, instructores y ambientes de manera eficiente</p>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon purple"><i class="fa-regular fa-calendar"></i></div>
                    <div class="stat-info">
                        <h3 id="totalSchedules">0</h3>
                        <p>Horarios Creados</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon pink"><i class="fa-regular fa-user"></i></div>
                    <div class="stat-info">
                        <h3 id="totalInstructors">0</h3>
                        <p>Instructores Registrados</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon blue"><i class="fa-solid fa-building"></i></div>
                    <div class="stat-info">
                        <h3 id="totalAmbiences">0</h3>
                        <p>Ambientes Disponibles</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon green"><i class="fas fa-check-circle"></i></div>
                    <div class="stat-info">
                        <h3 id="activeClasses">0</h3>
                        <p>Clases Activas</p>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h2>Acciones Rápidas</h2>
                </div>
                <div class="template-grid">
                    <div class="template-card" onclick="showSection('schedules', event)">
                        <span class="icon"><i class="fa-regular fa-calendar"></i></span>
                        <h4>Crear Horario</h4>
                        <p>Diseña un nuevo horario académico</p>
                    </div>

                    <div class="template-card" onclick="showSection('instructor', event)">
                        <span class="icon"><i class="fa-regular fa-user"></i></span>
                        <h4>Registrar Instructor</h4>
                        <p>Añade un nuevo instructor al sistema</p>
                    </div>

                    <div class="template-card" onclick="showSection('environment', event)">
                        <span class="icon"><i class="fa-solid fa-building"></i></span>
                        <h4>Nuevo Ambiente</h4>
                        <p>Configura un espacio académico</p>
                    </div>

                    <div class="template-card" onclick="showSection('messages', event)">
                        <span class="icon"><i class="fas fa-comments"></i></span>
                        <h4>Mensajes</h4>
                        <p>Comunícate con instructores</p>
                        <span class="message-counter" id="messagesCounter" style="display: none;">0</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- MESSAGES SECTION -->
        <div id="messages-section" class="content-section">
            <div class="content-header">
                <h1>Mensajes</h1>
                <p>Comunícate con los instructores de manera directa</p>
            </div>

            <div class="messages-container">
                <!-- Panel izquierdo: Lista de conversaciones -->
                <div class="conversations-panel">
                    <div class="conversations-header">
                        <h3>Conversaciones</h3>
                        <button class="btn btn-primary btn-small" onclick="openNewMessageModal()">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    
                    <div class="conversations-search">
                        <i class="fas fa-search"></i>
                        <input type="text" id="conversationSearch" placeholder="Buscar conversación..." 
                               oninput="searchConversations()">
                    </div>
                    
                    <div class="conversations-list" id="conversationsList">
                        <!-- Se llena dinámicamente -->
                    </div>
                </div>

                <!-- Panel derecho: Chat activo -->
                <div class="chat-panel">
                    <div class="chat-header" id="chatHeader" style="display: none;">
                        <div class="chat-header-info">
                            <div class="chat-avatar">
                                <i class="fa-regular fa-user"></i>
                            </div>
                            <div>
                                <h4 id="chatInstructorName"></h4>
                                <p id="chatInstructorSubject"></p>
                            </div>
                        </div>
                        <button class="btn btn-danger btn-small" onclick="deleteConversation()">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    
                    <div class="chat-messages" id="chatMessages">
                        <div style="text-align: center; padding: 60px 20px; color: var(--text-secondary);">
                            <i class="fas fa-comment-dots" style="font-size: 64px; margin-bottom: 20px; opacity: 0.3;"></i>
                            <h3>Selecciona una conversación</h3>
                            <p>Elige un instructor para comenzar a chatear</p>
                        </div>
                    </div>
                    
                    <div class="chat-input-area" id="chatInputArea" style="display: none;">
                        <input type="text" id="messageInput" placeholder="Escribe un mensaje...">
                        <button class="btn btn-primary" onclick="sendMessage()">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- SCHEDULES SECTION -->
        <div id="schedules-section" class="content-section">
            <div class="content-header">
                <h1>Gestión de Horarios</h1>
                <p>Crea, visualiza y administra todos los horarios académicos</p>
            </div>

            <div class="tabs-container">
                <button class="tab-btn active" onclick="switchTab('create', event)">
                    <i class="fa-solid fa-plus"></i> Crear Nuevo
                </button>
                <button class="tab-btn" onclick="switchTab('manage', event)">
                    <i class="fa-regular fa-calendar-plus"></i> Mis Horarios <span id="scheduleCount">(0)</span>
                </button>
            </div>

            <div id="create-tab" class="tab-content active">
                <div class="card">
                    <div class="card-header">
                        <h2>Datos del Instructor</h2>
                    </div>
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Nombre Completo</label>
                            <input type="text" id="instructorName" placeholder="">
                        </div>
                        <div class="form-group">
                            <label>Materia/Área</label>
                            <input type="text" id="instructorSubject" placeholder="">
                        </div>
                        <div class="form-group">
                            <label>Ficha</label>
                            <input type="text" id="instructorGroup" placeholder="">
                        </div>
                        <div class="form-group">
                            <label>ID del Instructor</label>
                            <input type="text" id="instructorId" placeholder="">
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-primary" onclick="validateInstructor()"><i class="fas fa-check-circle"></i> Validar Datos</button>
                        <button class="btn btn-success" onclick="showSavedInstructors()"><i class="fas fa-users"></i> Usar Instructores Guardados</button>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h2>Selecciona una Plantilla</h2>
                    </div>
                    <div class="template-grid">
                        <div class="template-card" id="template3hours" onclick="selectTemplate('3hours')">
                            <span class="icon"><i class="fa-regular fa-clock"></i></span>
                            <h4>Plantilla 3 Horas</h4>
                            <p>Bloques de 3 horas. Ideal para cursos intensivos y talleres prácticos</p>
                        </div>
                        <div class="template-card" id="templateComplete" onclick="selectTemplate('complete')">
                            <span class="icon"><i class="fa-regular fa-calendar"></i></span>
                            <h4>Horario Completo</h4>
                            <p>6:00 AM - 6:00 PM cada hora. Perfecto para programas académicos regulares</p>
                        </div>
                        <div class="template-card" id="templateUniversity" onclick="selectTemplate('university')">
                            <span class="icon"><i class="fa-solid fa-graduation-cap"></i></span>
                            <h4>Horario Universidad</h4>
                            <p>Materias dinámicas. Flexible para programas universitarios</p>
                        </div>
                        <div class="template-card" id="templateBlocks" onclick="selectTemplate('blocks')">
                            <span class="icon"><i class="fa-regular fa-calendar-days"></i></span>
                            <h4>Horario por Bloques</h4>
                            <p>Bloques predefinidos de 3 horas. Ideal para formación técnica</p>
                        </div>
                    </div>
                </div>

                <div class="card" id="scheduleCard" style="display: none;">
                    <div class="card-header">
                        <h2>Horario: <span id="selectedTemplate"></span></h2>
                        <button class="btn btn-primary" id="addSubjectBtn" style="display: none;" onclick="openModal('universityModal')">➕ Agregar Materia</button>
                    </div>
                    <div class="schedule-container">
                        <table class="schedule-table" id="scheduleTable"></table>
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap;">
                        <button class="btn btn-success" onclick="saveSchedule()"><i class="fa-regular fa-folder-open"></i> Guardar</button>
                        <button class="btn btn-warning" onclick="sendSchedule()"><i class="fa-solid fa-paper-plane"></i> Enviar</button>
                        <button class="btn btn-danger" onclick="clearSchedule()"><i class="fa-solid fa-trash"></i> Limpiar</button>
                    </div>
                </div>
            </div>

            <div id="manage-tab" class="tab-content">
                <div class="card">
                    <div class="card-header">
                        <h2>Horarios Guardados</h2>
                    </div>
                    <div class="items-grid" id="savedSchedulesList">
                        <p style="text-align: center; color: var(--gray); grid-column: 1/-1;">No hay horarios guardados</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- INSTRUCTOR SECTION -->
        <div id="instructor-section" class="content-section">
            <div class="content-header">
                <h1>Gestión de Instructores</h1>
                <p>Registra y administra información de instructores</p>
            </div>

            <div class="card">
                <div class="card-header">
                    <h2>Registrar Nuevo Instructor</h2>
                </div>
                <div class="form-grid">
                    <div class="form-group">
                        <label>Nombre Completo</label>
                        <input type="text" id="newInstructorName" placeholder="">
                    </div>
                    <div class="form-group">
                        <label>Materia/Área</label>
                        <input type="text" id="newInstructorSubject" placeholder="">
                    </div>
                    <div class="form-group">
                        <label>Ficha</label>
                        <input type="text" id="newInstructorGroup" placeholder="">
                    </div>
                    <div class="form-group">
                        <label>ID del Instructor</label>
                        <input type="text" id="newInstructorId" placeholder="">
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="newInstructorEmail" placeholder="">
                    </div>
                    <div class="form-group">
                        <label>Teléfono</label>
                        <input type="tel" id="newInstructorPhone" placeholder="">
                    </div>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-success" onclick="saveNewInstructor()"><i class="fa-regular fa-folder-open"></i> Guardar Instructor</button>
                    <button class="btn btn-warning" onclick="clearInstructorForm()"><i class="fa-solid fa-trash"></i> Limpiar Formulario</button>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h2>Instructores Registrados</h2>
                </div>
                <div class="items-grid" id="savedInstructorsList">
                    <p style="text-align: center; color: var(--gray); grid-column: 1/-1;">No hay instructores registrados</p>
                </div>
            </div>
        </div>

        <!-- ENVIRONMENT SECTION -->
        <div id="environment-section" class="content-section">
            <div class="content-header">
                <h1>Gestión de Ambientes</h1>
                <p>Configura y administra espacios académicos</p>
            </div>

            <div class="card">
                <div class="card-header">
                    <h2>Registrar Nuevo Ambiente</h2>
                </div>
                <div class="form-grid">
                    <div class="form-group">
                        <label>Nombre del Ambiente</label>
                        <input type="text" id="newAmbienceName" placeholder="Ej: Aula 301">
                    </div>
                    <div class="form-group">
                        <label>Tipo de Ambiente</label>
                        <select id="newAmbienceType">
                            <option value="aula">Aula de Clase</option>
                            <option value="laboratorio">Laboratorio</option>
                            <option value="taller">Taller</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Capacidad</label>
                        <input type="number" id="newAmbienceCapacity" placeholder="Número de estudiantes">
                    </div>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-success" onclick="saveNewAmbience()"><i class="fa-solid fa-folder-open"></i> Guardar Ambiente</button>
                    <button class="btn btn-warning" onclick="clearAmbienceForm()"><i class="fa-solid fa-trash"></i> Limpiar Formulario</button>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h2>Ambientes Registrados</h2>
                </div>
                <div class="items-grid" id="savedAmbiencesList">
                    <p style="text-align: center; color: var(--gray); grid-column: 1/-1;">No hay ambientes registrados</p>
                </div>
            </div>
        </div>
    </main>

    <!-- MODALES -->
    <div id="universityModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeModal('universityModal')">&times;</span>
            <h2 style="margin-bottom: 20px;">🎓 Agregar Materia</h2>
            <div class="form-grid">
                <div class="form-group">
                    <label>Nombre de la Materia</label>
                    <input type="text" id="subjectName" placeholder="Ej: Cálculo I">
                </div>
                <div class="form-group">
                    <label>Día</label>
                    <select id="subjectDay">
                        <option value="lunes">Lunes</option>
                        <option value="martes">Martes</option>
                        <option value="miercoles">Miércoles</option>
                        <option value="jueves">Jueves</option>
                        <option value="viernes">Viernes</option>
                        <option value="sabado">Sábado</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Hora de Inicio</label>
                    <input type="time" id="subjectStartTime">
                </div>
                <div class="form-group">
                    <label>Hora de Fin</label>
                    <input type="time" id="subjectEndTime">
                </div>
            </div>
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button class="btn btn-success" onclick="addSubjectToUniversity()"><i class="fa-solid fa-plus"></i> Agregar</button>
                <button class="btn btn-danger" onclick="closeModal('universityModal')">❌ Cancelar</button>
            </div>
        </div>
    </div>

    <div id="instructorModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeModal('instructorModal')">&times;</span>
            <h2 style="margin-bottom: 20px;">👥 Seleccionar Instructor</h2>
            <div id="instructorModalList"></div>
        </div>
    </div>

    <div id="newMessageModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeModal('newMessageModal')">&times;</span>
            <h2 style="margin-bottom: 20px;"><i class="fas fa-user-plus"></i> Nueva Conversación</h2>
            <div id="newMessageModalContent"></div>
        </div>
    </div>

    <script src="cord.js"></script>
    <script src="menss.js"></script>
    <script>
        // Mostrar mensaje de bienvenida al iniciar sesión
        document.addEventListener('DOMContentLoaded', function() {
            const urlParams = new URLSearchParams(window.location.search);
            const fromLogin = urlParams.get('fromLogin');
            
            if (fromLogin === 'true') {
                const welcomeMsg = document.getElementById('welcomeMessage');
                welcomeMsg.classList.add('show');
                
                setTimeout(() => {
                    welcomeMsg.classList.remove('show');
                }, 5000);
                
                window.history.replaceState({}, document.title, 'coordinador.php');
            }
        });

        function toggleDropdown() {
            const menu = document.getElementById('navDropdownMenu');
            menu.classList.toggle('active');
        }

        // Cerrar dropdown al hacer click fuera
        document.addEventListener('click', function(event) {
            const dropdown = document.querySelector('.nav-dropdown-container');
            if (!dropdown.contains(event.target)) {
                document.getElementById('navDropdownMenu').classList.remove('active');
            }
        });

        // Cerrar dropdown al seleccionar una opción
        document.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', function() {
                document.getElementById('navDropdownMenu').classList.remove('active');
            });
        });
    </script>
</body>
</html>