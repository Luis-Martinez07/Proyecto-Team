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
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="confi.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <title>Configuración - <?php echo htmlspecialchars($usuario_nombre); ?></title>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="avatar"><i class="fa-regular fa-user"></i></div>
            <div class="instructor-info">
                <h1><?php echo htmlspecialchars($usuario_nombre); ?></h1>
                <p>Instructor SENA • <?php echo htmlspecialchars($usuario_email); ?></p>
            </div>
            <div class="theme-toggle">
                <div class="toggle-switch">
                    <button id="theme-toggle">
                        <i id="theme-icon" class="fas fa-moon"></i>
                    </button>
                </div>
            </div>
        </div>
       
        <!-- Navigation -->
        <div class="nav-tabs">
            <button class="nav-tab active" onclick="showTab('estadisticas')"> <i class="fa-solid fa-square-poll-vertical"></i> Estadísticas</button>
            <button class="nav-tab" onclick="showTab('perfil')"> <i class="fa-regular fa-user"></i> Perfil</button>
            <button class="nav-tab" onclick="showTab('configuracion')"> <i class="fa-solid fa-gears"></i> Configuración</button>
            <button class="nav-tab" onclick="showTab('cursos')"><i class="fa-solid fa-book"></i> Cursos</button>
            <button class="nav-tab" onclick="showTab('notificaciones')"> <i class="fa-regular fa-bell"></i> Notificaciones</button>
            <a href="panel.php" class="btn-return">
                <i class="fas fa-sign-out-alt" aria-hidden="true"></i> Volver
            </a>
        </div>

        <!-- Content -->
        <div class="content">
            <!-- Estadísticas Tab -->
            <div id="estadisticas-tab" class="tab-content">
                <h2 class="section-title"><i class="fa-solid fa-square-poll-vertical"></i> Estadísticas de Uso</h2>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <span class="stat-number">156</span>
                        <span class="stat-label">Horas de clases impartidas</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number">12</span>
                        <span class="stat-label">Programas formativos</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number">340</span>
                        <span class="stat-label">Estudiantes atendidos</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number">94%</span>
                        <span class="stat-label">Satisfacción promedio</span>
                    </div>
                </div>

                <div class="recent-activity">
                    <div class="activity-header">Actividad Reciente</div>
                    <div class="activity-item">
                        <div class="activity-icon"><i class="fa-solid fa-book"></i></div>
                        <div class="activity-details">
                            <h4>Clase: Programación Java</h4>
                            <p>Hace 2 horas <i class="fa-solid fa-arrow-right"></i> 3 horas académicas</p>
                        </div>
                    </div>
                    <div class="activity-item">
                        <div class="activity-icon"><i class="fa-solid fa-desktop"></i></div>
                        <div class="activity-details">
                            <h4>Clase: Base de Datos</h4>
                            <p>Ayer <i class="fa-solid fa-arrow-right"></i> 2 horas académicas</p>
                        </div>
                    </div>
                    <div class="activity-item">
                        <div class="activity-icon"><i class="fa-solid fa-screwdriver-wrench"></i></div>
                        <div class="activity-details">
                            <h4>Clase: Mantenimiento de PC</h4>
                            <p>Hace 2 días <i class="fa-solid fa-arrow-right"></i> 4 horas académicas</p>
                        </div>
                    </div>
                </div>

                <div style="margin-top: 30px; text-align: center;">
                    <button class="btn-primary" id="Agregar" onclick="agregarActividad()">
                        <i class="fa-solid fa-plus"></i> Agregar Actividad
                    </button>
                </div>
            </div>

            <!-- Perfil Tab -->
            <div id="perfil-tab" class="tab-content hidden">
                <!-- Información Personal -->
                <div class="config-section collapsible">
                    <div class="section-header" onclick="toggleSection(this)">
                        <h3 class="section-title">
                            <i class="fa-regular fa-user"></i> Información Personal
                        </h3>
                        <i class="fa-solid fa-caret-down"></i>
                    </div>
                    <div class="section-content">
                        <div class="profile-photo-section">
                            <div class="current-photo">
                                <div class="avatar-large"><i class="fa-regular fa-user"></i></div>
                                <button class="btn-secondary" onclick="changePhoto()">
                                    <i class="fa-solid fa-camera-retro"></i> Cambiar Foto
                                </button>
                            </div>
                            <input type="file" id="photoInput" accept="image/*" style="display: none;" onchange="handlePhotoChange(event)">
                        </div>

                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label">Nombres</label>
                                <input type="text" class="form-input" id="nombres" value="<?php echo htmlspecialchars($usuario_nombre); ?>" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Apellidos</label>
                                <input type="text" class="form-input" id="apellidos" value="" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Número de Identificación</label>
                                <input type="text" class="form-input" id="cedula" value="">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Fecha de Nacimiento</label>
                                <input type="date" class="form-input" id="fechaNacimiento" value="">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Información de Contacto -->
                <div class="config-section collapsible">
                    <div class="section-header" onclick="toggleSection(this)">
                        <h3 class="section-title">
                            <i class="fa-solid fa-envelope"></i> Información de Contacto
                        </h3>
                        <i class="fa-solid fa-caret-down"></i>
                    </div>
                    <div class="section-content">
                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label">Correo Electrónico Institucional</label>
                                <input type="email" class="form-input" id="emailInstitucional" value="<?php echo htmlspecialchars($usuario_email); ?>" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Correo Electrónico Personal</label>
                                <input type="email" class="form-input" id="emailPersonal" value="">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Teléfono Móvil</label>
                                <input type="tel" class="form-input" id="telefono" value="">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Teléfono Fijo</label>
                                <input type="tel" class="form-input" id="telefonoFijo" value="">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Información Profesional -->
                <div class="config-section collapsible">
                    <div class="section-header" onclick="toggleSection(this)">
                        <h3 class="section-title">
                            <i class="fa-solid fa-graduation-cap"></i> Habilidades técnicas
                        </h3>
                        <i class="fa-solid fa-caret-down"></i>
                    </div>
                    <div class="section-content">
                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label">Título Profesional</label>
                                <input type="text" class="form-input" id="tituloProfesional" value="Ingeniero de Sistemas">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Universidad</label>
                                <input type="text" class="form-input" id="universidad" value="Universidad Nacional de Colombia">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Año de Graduación</label>
                                <input type="number" class="form-input" id="anoGraduacion" value="2008" min="1970" max="2024">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Años de Experiencia Docente</label>
                                <input type="number" class="form-input" id="experienciaDocente" value="12" min="0" max="50">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Especialización/Maestría</label>
                                <input type="text" class="form-input" id="especializacion" value="Especialización en Gestión de TI">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Certificaciones Técnicas</label>
                                <textarea class="form-input" id="certificaciones" rows="3" placeholder="Ej: Oracle Certified Professional, Microsoft Azure, etc."></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Información Laboral -->
                <div class="config-section collapsible">
                    <div class="section-header" onclick="toggleSection(this)">
                        <h3 class="section-title">
                            <i class="fa-solid fa-building"></i> Información Laboral
                        </h3>
                        <i class="fa-solid fa-chevron-down chevron-icon"></i>
                    </div>
                    <div class="section-content">
                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label">Regional SENA</label>
                                <select class="form-select" id="regional">
                                    <option value="bogota" selected>Bogotá D.C.</option>
                                    <option value="antioquia">Antioquia</option>
                                    <option value="valle">Valle del Cauca</option>
                                    <option value="atlantico">Atlántico</option>
                                    <option value="cundinamarca">Cundinamarca</option>
                                    <option value="santander">Santander</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Centro de Formación</label>
                                <select class="form-select" id="centroFormacion">
                                    <option value="cgmlti" selected>CGMLTI - Centro de Gestión de Mercados, Logística y TI</option>
                                    <option value="ceet">CEET - Centro de Electricidad, Electrónica y Telecomunicaciones</option>
                                    <option value="cide">CIDE - Centro de Industria y Desarrollo Empresarial</option>
                                    <option value="cedagro">CEDAGRO - Centro de Desarrollo Agroecológico</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Fecha de Vinculación</label>
                                <input type="date" class="form-input" id="fechaVinculacion" value="2018-02-15">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Tipo de Contrato</label>
                                <select class="form-select" id="tipoContrato">
                                    <option value="planta" selected>Planta</option>
                                    <option value="contrata">Contrata</option>
                                    <option value="honorarios">Honorarios</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Seguridad de la Cuenta -->
                <div class="config-section collapsible">
                    <div class="section-header" onclick="toggleSection(this)">
                        <h3 class="section-title">
                            <i class="fa-solid fa-lock"></i> Seguridad de la Cuenta
                        </h3>
                        <i class="fa-solid fa-chevron-down chevron-icon"></i>
                    </div>
                    <div class="section-content">
                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label">Contraseña Actual</label>
                                <input type="password" class="form-input" id="passwordActual" placeholder="Ingresa tu contraseña actual">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Nueva Contraseña</label>
                                <input type="password" class="form-input" id="passwordNueva" placeholder="Mínimo 8 caracteres">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Confirmar Nueva Contraseña</label>
                                <input type="password" class="form-input" id="passwordConfirmar" placeholder="Repite la nueva contraseña">
                            </div>
                            <div class="form-group">
                                <div class="toggle-switch">
                                    <div class="switch active" onclick="toggleSwitch(this)"></div>
                                    <label>Autenticación de dos factores (2FA)</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Botones de acción -->
                <div style="display: flex; gap: 15px; justify-content: center; margin-top: 30px;">
                    <button class="btn-primary" onclick="updateProfile()">
                        <i class="fa-solid fa-file"></i> Actualizar Perfil
                    </button>
                    <button class="btn-secondary" onclick="resetProfile()">
                        <i class="fa-solid fa-undo"></i> Restaurar Cambios
                    </button>
                </div>
            </div>

            <!-- Configuración Tab -->
            <div id="configuracion-tab" class="tab-content hidden">
                <div class="config-section">
                    <h3 class="section-title"><i class="fa-solid fa-gears"></i> Configuración General</h3>
                    <div class="form-grid">
                        <div class="form-group">
                            <label class="form-label">Modalidad de Formación</label>
                            <select class="form-select">
                                <option>Presencial</option>
                                <option selected>Virtual</option>
                                <option>Bimodal</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Duración de Clase (horas académicas)</label>
                            <input type="number" class="form-input" value="2" min="1" max="8">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Tipo de Programa</label>
                            <select class="form-select">
                                <option>Técnico</option>
                                <option selected>Tecnólogo</option>
                                <option>Especialización</option>
                                <option>Complementario</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Máximo de Aprendices por Ficha</label>
                            <input type="number" class="form-input" value="25" min="15" max="35">
                        </div>
                    </div>
                </div>

                <div class="config-section">
                    <h3 class="section-title">🎯 Preferencias de Evaluación</h3>
                    <div class="form-group">
                        <div class="toggle-switch">
                            <div class="switch active" onclick="toggleSwitch(this)"></div>
                            <label>Sistema de seguimiento de competencias activado</label>
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="toggle-switch">
                            <div class="switch active" onclick="toggleSwitch(this)"></div>
                            <label>Retroalimentación automática de actividades</label>
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="toggle-switch">
                            <div class="switch" onclick="toggleSwitch(this)"></div>
                            <label>Grabación de sesiones virtuales</label>
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="toggle-switch">
                            <div class="switch active" onclick="toggleSwitch(this)"></div>
                            <label>Envío de evidencias por LMS</label>
                        </div>
                    </div>
                </div>

                <div style="margin-top: 30px; text-align: center;">
                    <button class="btn-primary" onclick="saveSettings()"><i class="fa-solid fa-file-import"></i> Guardar Configuración</button>
                </div>
            </div>

            <!-- Cursos Tab -->
            <div id="cursos-tab" class="tab-content hidden">
                <div class="config-section">
                    <h3 class="section-title"><i class="fa-solid fa-book"></i> Gestión de Programas Formativos</h3>
                    <div class="form-grid">
                        <div class="form-group">
                            <label class="form-label">Programa Principal</label>
                            <select class="form-select" id="programa-principal">
                                <option>Análisis y Desarrollo de Software</option>
                                <option selected>Sistemas de Información</option>
                                <option>Mantenimiento de Equipos de Cómputo</option>
                                <option>Gestión de Redes de Datos</option>
                                <option>Animación Digital</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Centro de Formación</label>
                            <select class="form-select">
                                <option>CEET - Centro de Electricidad, Electrónica y Telecomunicaciones</option>
                                <option selected>CGMLTI - Centro de Gestión de Mercados, Logística y TI</option>
                                <option>CIDE - Centro de Industria y Desarrollo Empresarial</option>
                                <option>CEDAGRO - Centro de Desarrollo Agroecológico</option>
                            </select>
                        </div>
                    </div>

                    <div class="competencias-section">
                        <button class="btn-competencias" onclick="toggleCompetenciasCard()">
                            <i class="fa-solid fa-graduation-cap"></i>
                            <span>Competencias Asignadas</span>
                            <i class="fa-solid fa-chevron-down" id="chevron-icon"></i>
                        </button>

                        <div class="competencias-card" id="competencias-card">
                            <div class="card-header">
                                <div class="card-icon">
                                    <i class="fa-solid fa-award"></i>
                                </div>
                                <h4>Gestión de Competencias</h4>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Seleccionar Competencia</label>
                                <select class="form-select" id="competencia-select">
                                    <option value="">-- Seleccione una competencia --</option>
                                    <optgroup label="Análisis y Desarrollo de Software">
                                        <option value="220501001">220501001 - Comprender la lógica de programación</option>
                                        <option value="220501002">220501002 - Programar el sistema según el diseño realizado</option>
                                        <option value="220501003">220501003 - Probar el software de acuerdo con el plan de pruebas</option>
                                        <option value="220501004">220501004 - Desarrollar aplicaciones móviles</option>
                                        <option value="220501005">220501005 - Implementar bases de datos</option>
                                        <option value="220501006">220501006 - Aplicar arquitecturas de software</option>
                                    </optgroup>
                                    <optgroup label="Sistemas de Información">
                                        <option value="228101001">228101001 - Analizar los requerimientos del cliente</option>
                                        <option value="228101002">228101002 - Diseñar sistemas de información</option>
                                        <option value="228101003">228101003 - Desarrollar sistemas de información</option>
                                        <option value="228101004">228101004 - Implementar sistemas de información</option>
                                        <option value="228101005">228101005 - Realizar mantenimiento de sistemas</option>
                                    </optgroup>
                                    <optgroup label="Mantenimiento de Equipos de Cómputo">
                                        <option value="220204001">220204001 - Diagnosticar el estado del equipo</option>
                                        <option value="220204002">220204002 - Realizar mantenimiento preventivo</option>
                                        <option value="220204003">220204003 - Realizar mantenimiento correctivo</option>
                                        <option value="220204004">220204004 - Instalar software y hardware</option>
                                        <option value="220204005">220204005 - Configurar redes locales</option>
                                    </optgroup>
                                    <optgroup label="Gestión de Redes de Datos">
                                        <option value="220502001">220502001 - Diseñar la red según requerimientos</option>
                                        <option value="220502002">220502002 - Implementar la red de acuerdo al diseño</option>
                                        <option value="220502003">220502003 - Verificar el estado de la red</option>
                                        <option value="220502004">220502004 - Realizar mantenimiento de la red</option>
                                        <option value="220502005">220502005 - Implementar seguridad en redes</option>
                                    </optgroup>
                                    <optgroup label="Animación Digital">
                                        <option value="223601001">223601001 - Diseñar productos multimediales</option>
                                        <option value="223601002">223601002 - Desarrollar contenidos multimediales</option>
                                        <option value="223601003">223601003 - Integrar elementos multimediales</option>
                                        <option value="223601004">223601004 - Realizar animaciones 2D y 3D</option>
                                    </optgroup>
                                    <optgroup label="Competencias Transversales">
                                        <option value="240201500">240201500 - Promover la interacción idónea</option>
                                        <option value="240201501">240201501 - Comprender textos en inglés</option>
                                        <option value="240201502">240201502 - Producir textos en inglés</option>
                                        <option value="240201503">240201503 - Aplicar principios éticos</option>
                                        <option value="240201504">240201504 - Ejercer derechos fundamentales</option>
                                    </optgroup>
                                </select>
                                <button class="btn-secondary" onclick="addCompetencia()" style="margin-top: 10px;">
                                    <i class="fa-solid fa-plus"></i> Agregar Competencia
                                </button>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Competencias Asignadas</label>
                                <div class="selected-competencias" id="selected-competencias">
                                    <div class="empty-state">
                                        <i class="fa-solid fa-inbox" style="color: #bdc3c7; font-size: 20px; margin-bottom: 10px;"></i>
                                        <p style="color: #7f8c8d; font-style: italic; margin: 0;">No hay competencias asignadas</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <div class="toggle-switch">
                            <div class="switch active" onclick="toggleSwitch(this)"></div>
                            <label>Disponible para programas complementarios</label>
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="toggle-switch">
                            <div class="switch active" onclick="toggleSwitch(this)"></div>
                            <label>Instructor habilitado para formación virtual</label>
                        </div>
                    </div>
                </div>

                <div style="margin-top: 30px; text-align: center;">
                    <button class="btn-primary" onclick="saveCourses()">
                        <i class="fa-solid fa-floppy-disk"></i> Guardar Programas
                    </button>
                </div>
            </div>

            <!-- Notificaciones Tab -->
            <div id="notificaciones-tab" class="tab-content hidden">
                <div class="config-section">
                    <h3 class="section-title"><i class="fa-regular fa-bell"></i> Configuración de Notificaciones</h3>
                    <div class="form-group">
                        <div class="toggle-switch">
                            <div class="switch active" onclick="toggleSwitch(this)"></div>
                            <label>Notificaciones por correo electrónico</label>
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="toggle-switch">
                            <div class="switch active" onclick="toggleSwitch(this)"></div>
                            <label>Recordatorios de clases programadas</label>
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="toggle-switch">
                            <div class="switch" onclick="toggleSwitch(this)"></div>
                            <label>Notificaciones SMS</label>
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="toggle-switch">
                            <div class="switch active" onclick="toggleSwitch(this)"></div>
                            <label>Reportes mensuales de seguimiento académico</label>
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="toggle-switch">
                            <div class="switch active" onclick="toggleSwitch(this)"></div>
                            <label>Alertas de bitácoras pendientes</label>
                        </div>
                    </div>
                    
                    <div class="form-grid">
                        <div class="form-group">
                            <label class="form-label">Frecuencia de Reportes</label>
                            <select class="form-select">
                                <option>Semanal</option>
                                <option selected>Mensual</option>
                                <option>Trimestral</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Hora Preferida para Notificaciones</label>
                            <input type="time" class="form-input" value="">
                        </div>
                    </div>
                </div>

                <div style="margin-top: 30px; text-align: center;">
                    <button class="btn-primary" onclick="saveNotifications()"><i class="fa-solid fa-file-import"></i> Guardar Notificaciones</button>
                </div>
            </div>
        </div>
    </div>
    
    <script src="confi.js"></script>
</body>
</html>