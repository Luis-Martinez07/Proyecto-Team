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
    // Si es coordinador, redirigir a su panel
    if ($rol_usuario === 'coordinador') {
        header('Location: coordinador.php?tipo=error&mensaje=' . urlencode('Debes usar el panel de coordinador'));
        exit;
    }
    // Si es otro rol desconocido
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
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link rel="stylesheet" href="panel.css">
    <title>Panel de Control - <?php echo htmlspecialchars($usuario_nombre); ?></title>
    <style>
        .welcome-message {
            background: #0919C8;
            color: #fffff;
            padding: 1.5rem;
            margin: 1rem;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            display: none;
            animation: slideDown 0.5s ease-out;
            position: fixed;
            top: 70px;
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
        }
        
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <button class="hamburger-btn" onclick="toggleSidebar()">
           <i class="fa-solid fa-bars-staggered"></i>
        </button>
        <h1 class="header-title">Bienvenido, <?php echo htmlspecialchars($usuario_nombre); ?></h1>
    </div>

    <!-- Mensaje de bienvenida -->
    <div class="welcome-message" id="welcomeMessage">
        <h3>Sesión iniciada correctamente <i class="fas fa-check-circle"></i></h3>
        <p>Hola <?php echo htmlspecialchars($usuario_nombre); ?>, has accedido exitosamente al panel de instructor.</p>
    </div>

    <!-- Overlay -->
    <div class="overlay" id="overlay" onclick="closeSidebar()"></div>

    <!-- Sidebar -->
    <div class="sidebar" id="sidebar">
        <nav class="sidebar-nav">
            <a href="panel.php" class="nav-item">
                <i class="fas fa-folder"></i>
                <span>Inicio</span>
            </a>
            
            <a href="report.php" class="nav-item">
               <i class="fa-solid fa-file-invoice"></i>
                <span>Reporte</span>
            </a>
            
            <a href="#" class="nav-item">
               <i class="fa-solid fa-calendar-days"></i>
                <span>Horario</span>
            </a>
            
            <div class="divider"></div>


            <button class="nav-item theme-toggle" id="theme-toggle" title="Cambiar Tema">
                <i class="fas fa-moon" id="theme-icon"></i>
                <span class="theme-label">Tema</span>
            </button>
    
            <a href="confi.php" class="nav-item">
                <i class="fas fa-cog"></i>
                <span>Configuración</span>
            </a>
        
            <a href="javascript:void(0)" class="nav-item" onclick="logout()" style="text-decoration: none; color: inherit;">
                <span class="nav-icon"><i class="fa-solid fa-right-from-bracket"></i></span>
                <span>Cerrar Sesión</span>
            </a>
        </nav>

        <div class="user-profile">
            <div class="user-info">
                <div class="user-avatar"><?php echo $iniciales; ?></div>
                <div class="user-details">
                    <h4><?php echo htmlspecialchars($usuario_nombre); ?></h4>
                    <p class="user-email"><?php echo htmlspecialchars($usuario_email); ?></p>
                </div>
            </div>
        </div>
    </div>
    <!-- Main Content -->
<div class="main-content">
    <h3 class="animated-title">
        <span>P</span><span>A</span><span>N</span><span>E</span><span>L</span>
        <span>D</span><span>E</span> <span>C</span><span>O</span><span>N</span><span>T</span><span>R</span><span>O</span><span>L</span>
    </h3>
    <div class="divide"></div>
    <p>Aquí todas las herramientas necesarias para gestionar el sistema.</p>
</div>


<div class="Carrusel">
    <img src="ChatGPT%20Image%207%20oct%202025%2C%2010_38_13.png" alt="Imagen 1" class="active">
    <img src="image_Pippit_202510071032.png" alt="Imagen 2">
    <img src="ChatGPT%20Image%207%20oct%202025%2C%2010_40_30.png" alt="Imagen 3">
</div>
   
        <button class="nav-btn prev">‹</button>
        <button class="nav-btn next">›</button>
        
        <div class="indicators">
            <div class="indicator active" data-index="0"></div>
            <div class="indicator" data-index="1"></div>
            <div class="indicator" data-index="2"></div>
        </div>
    </div>


    <script src="panel.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Obtener parámetros de la URL
            const urlParams = new URLSearchParams(window.location.search);
            const fromLogin = urlParams.get('fromLogin');
            
            console.log('fromLogin:', fromLogin); // Debug
            
            // Si viene de login, mostrar mensaje
            if (fromLogin === 'true') {
                const welcomeMsg = document.getElementById('welcomeMessage');
                welcomeMsg.classList.add('show');
                
                // Ocultar después de 5 segundos
                setTimeout(() => {
                    welcomeMsg.classList.remove('show');
                }, 5000);
                
                // Limpiar el parámetro de la URL sin recargar
                window.history.replaceState({}, document.title, 'panel.php');
            }
        });
    </script>
</body>
</html>