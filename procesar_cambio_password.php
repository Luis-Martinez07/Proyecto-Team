<?php
require_once 'config.php';
session_start();

if (!isset($_SESSION['usuario_id'])) {
    header("Location: index.php?tipo=error&mensaje=" . urlencode("Sesión expirada"));
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header("Location: cambiar_password.php");
    exit();
}

$usuario_id = $_SESSION['usuario_id'];
$password_actual = $_POST['password_actual'] ?? '';
$password_nueva = $_POST['password_nueva'] ?? '';

if (empty($password_actual) || empty($password_nueva)) {
    header("Location: cambiar_password.php?tipo=error&mensaje=" . urlencode("Los campos no pueden estar vacíos"));
    exit();
}

try {
    $pdo = conectarDB();
    
    // Obtener contraseña actual
    $stmt = $pdo->prepare("SELECT password FROM usuarios WHERE id = ?");
    $stmt->execute([$usuario_id]);
    $usuario = $stmt->fetch();
    
    if (!$usuario) {
        session_destroy();
        header("Location: index.php?tipo=error&mensaje=" . urlencode("Usuario no encontrado"));
        exit();
    }
    
    // Verificar contraseña actual
    if (!password_verify($password_actual, $usuario['password'])) {
        header("Location: cambiar_password.php?tipo=error&mensaje=" . urlencode("La contraseña actual es incorrecta"));
        exit();
    }
    
    // Validar nueva contraseña
    if (strlen($password_nueva) < 8) {
        header("Location: cambiar_password.php?tipo=error&mensaje=" . urlencode("Mínimo 8 caracteres"));
        exit();
    }
    
    if (!preg_match('/[A-Z]/', $password_nueva)) {
        header("Location: cambiar_password.php?tipo=error&mensaje=" . urlencode("Debe contener mayúscula"));
        exit();
    }
    
    if (!preg_match('/[a-z]/', $password_nueva)) {
        header("Location: cambiar_password.php?tipo=error&mensaje=" . urlencode("Debe contener minúscula"));
        exit();
    }
    
    if (!preg_match('/[0-9]/', $password_nueva)) {
        header("Location: cambiar_password.php?tipo=error&mensaje=" . urlencode("Debe contener número"));
        exit();
    }
    
    if ($password_actual === $password_nueva) {
        header("Location: cambiar_password.php?tipo=error&mensaje=" . urlencode("Debe ser diferente a la actual"));
        exit();
    }
    
    // Actualizar contraseña
    $password_hash = password_hash($password_nueva, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("UPDATE usuarios SET password = ? WHERE id = ?");
    $stmt->execute([$password_hash, $usuario_id]);
    
    // Redirigir al coordinador con parámetro de éxito
    header("Location: coordinador.php?passwordChanged=true");
    exit();
    
} catch (PDOException $e) {
    error_log("Error: " . $e->getMessage());
    header("Location: cambiar_password.php?tipo=error&mensaje=" . urlencode("Error del servidor"));
    exit();
}
?>