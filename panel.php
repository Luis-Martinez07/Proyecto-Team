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
    <div id="dashboard-section" class="content-section active">
        <div class="content-header">
            <h1>Bienvenido, <?php echo htmlspecialchars($usuario_nombre); ?></h1>
            <p>Gestiona tus horarios, clases y estudiantes de manera eficiente desde esta plataforma.</p>
        </div>
        
        <!-- Stats Grid -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fa-solid fa-chalkboard-teacher"></i>
                </div>
                <div class="stat-info">
                    <h3 id="totalClasses">0</h3>
                    <p>Clases Activas</p>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fa-solid fa-user-graduate"></i>
                </div>
                <div class="stat-info">
                    <h3 id="totalStudents">0</h3>
                    <p>Estudiantes</p>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fa-regular fa-calendar"></i>
                </div>
                <div class="stat-info">
                    <h3 id="totalSchedules">0</h3>
                    <p>Horarios</p>
                </div>
            </div>
        </div>
    </div>

   <div class="content-header">
<div class="acciones-rapidas">
    <div class="title-acciones">
    <h1>Funciones el Sistema<h1>
</div>
</div>
</div>

</main>

 

<!-- Script JavaScript -->
<script src="panel.js"></script>

</body>
</html>