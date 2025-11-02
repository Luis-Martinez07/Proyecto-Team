<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['success' => false, 'message' => 'No autorizado']);
    exit;
}

require_once 'config.php';

try {
    $pdo = conectarDB();
    $usuario_id = $_SESSION['usuario_id'];
    
    $sql = "SELECT cedula, telefono, fecha_nacimiento, especialidad, 
            titulo_profesional, fecha_vinculacion, estado 
            FROM perfiles_instructores 
            WHERE usuario_id = ?";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$usuario_id]);
    $instructor = $stmt->fetch();
    
    if ($instructor) {
        echo json_encode(['success' => true, 'instructor' => $instructor]);
    } else {
        echo json_encode(['success' => true, 'instructor' => null]);
    }
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>