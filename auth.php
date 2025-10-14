<?php
session_start();
require_once 'config.php';

// Solo permitir POST
if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    header('Location: index.php?tipo=error&mensaje=' . urlencode('Acceso no permitido'));
    exit;
}

$accion = $_POST['accion'] ?? '';

if ($accion == 'registro') {
    registrarUsuario();
} elseif ($accion == 'login') {
    iniciarSesion();
} else {
    header('Location: index.php?tipo=error&mensaje=' . urlencode('Acción no válida'));
    exit;
}

function registrarUsuario() {
    $nombre = trim($_POST['nombre'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    
    // Validaciones
    if (empty($nombre) || empty($email) || empty($password)) {
        redirigirConMensaje('error', 'Todos los campos son obligatorios');
        return;
    }
    
    if (strlen($nombre) < 3) {
        redirigirConMensaje('error', 'El nombre debe tener al menos 3 caracteres');
        return;
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        redirigirConMensaje('error', 'El formato del email no es válido');
        return;
    }
    
    if (strlen($password) < 8) {
        redirigirConMensaje('error', 'La contraseña debe tener al menos 8 caracteres');
        return;
    }
    
    try {
        $pdo = conectarDB();
        
        // Verificar si el email ya existe
        $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
        $stmt->execute([$email]);
        
        if ($stmt->fetch()) {
            redirigirConMensaje('error', 'Este correo ya está registrado');
            return;
        }
        
        // Encriptar contraseña
        $password_hash = password_hash($password, PASSWORD_BCRYPT);
        
        // Insertar usuario con rol por defecto 'instructor'
        $stmt = $pdo->prepare("INSERT INTO usuarios (nombre, email, password, rol, fecha_registro, activo) VALUES (?, ?, ?, 'instructor', NOW(), 1)");
        $stmt->execute([$nombre, $email, $password_hash]);
        
        redirigirConMensaje('exito', 'Usuario registrado exitosamente. Ya puedes iniciar sesión.');
        
    } catch (PDOException $e) {
        error_log("Error en registro: " . $e->getMessage());
        redirigirConMensaje('error', 'Error al registrar usuario: ' . $e->getMessage());
    }
}

function iniciarSesion() {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    
    // Validaciones básicas
    if (empty($email) || empty($password)) {
        redirigirConMensaje('error', 'Email y contraseña son obligatorios');
        return;
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        redirigirConMensaje('error', 'El formato del email no es válido');
        return;
    }
    
    try {
        $pdo = conectarDB();
        
        // Buscar usuario activo - IMPORTANTE: usar TRIM en rol
        $stmt = $pdo->prepare("SELECT id, nombre, email, password, TRIM(rol) as rol FROM usuarios WHERE email = ? AND activo = 1");
        $stmt->execute([$email]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Verificar si el usuario existe
        if (!$usuario) {
            redirigirConMensaje('error', 'Credenciales incorrectas o usuario inactivo');
            return;
        }
        
        // Verificar contraseña
        if (!password_verify($password, $usuario['password'])) {
            redirigirConMensaje('error', 'Credenciales incorrectas');
            return;
        }
        
        // Limpiar y normalizar el rol
        $rol_limpio = strtolower(trim($usuario['rol']));
        
        // Crear sesión
        session_regenerate_id(true);
        
        $_SESSION['usuario_id'] = $usuario['id'];
        $_SESSION['usuario_nombre'] = $usuario['nombre'];
        $_SESSION['usuario_email'] = $usuario['email'];
        $_SESSION['usuario_rol'] = $rol_limpio;
        $_SESSION['login_time'] = time();
        
        // Actualizar último acceso
        $stmt = $pdo->prepare("UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = ?");
        $stmt->execute([$usuario['id']]);
        
        // Redirigir según el rol
        if ($rol_limpio === 'coordinador') {
            header('Location: coordinador.php?fromLogin=true');
            exit;
        } elseif ($rol_limpio === 'instructor') {
            header('Location: panel.php?fromLogin=true');
            exit;
        } else {
            // Rol no reconocido - por defecto a instructor
            redirigirConMensaje('advertencia', 'Rol no reconocido, redirigiendo a panel de instructor');
            header('Location: panel.php?fromLogin=true');
            exit;
        }
        
    } catch (PDOException $e) {
        error_log("Error en login: " . $e->getMessage());
        redirigirConMensaje('error', 'Error en el sistema. Intente nuevamente.');
    }
}

function redirigirConMensaje($tipo, $mensaje) {
    header('Location: index.php?tipo=' . $tipo . '&mensaje=' . urlencode($mensaje));
    exit;
}
?>