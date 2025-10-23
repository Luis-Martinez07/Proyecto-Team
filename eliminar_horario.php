<?php
session_start();
require_once 'config.php';

// Verificar que el usuario esté logueado y sea instructor
if (!isset($_SESSION['usuario_id']) || strtolower(trim($_SESSION['usuario_rol'] ?? '')) !== 'instructor') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'No autorizado']);
    exit;
}

// Obtener datos del POST
$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID de horario no proporcionado']);
    exit;
}

try {
    $pdo = conectarDB();
    $usuario_id = $_SESSION['usuario_id'];
    $horario_id = $data['id'];
    
    // Verificar que el horario pertenece al usuario antes de eliminar
    $sql = "DELETE FROM horarios 
            WHERE id = :id AND usuario_id = :usuario_id";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':id' => $horario_id,
        ':usuario_id' => $usuario_id
    ]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Horario eliminado exitosamente'
        ]);
    } else {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Horario no encontrado o no tienes permiso para eliminarlo'
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al eliminar el horario: ' . $e->getMessage()
    ]);
}
?>