<?php
session_start();
require_once 'config.php';

// Verificar que el usuario esté logueado y sea instructor
if (!isset($_SESSION['usuario_id']) || strtolower(trim($_SESSION['usuario_rol'] ?? '')) !== 'instructor') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'No autorizado']);
    exit;
}

// Obtener el ID del horario desde GET
if (!isset($_GET['id']) || empty($_GET['id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID de horario no proporcionado']);
    exit;
}

try {
    $pdo = conectarDB();
    $usuario_id = $_SESSION['usuario_id'];
    $horario_id = $_GET['id'];
    
    // Obtener el horario específico del instructor
    $sql = "SELECT id, nombre_horario, template_tipo, datos_json, total_clases, fecha_creacion 
            FROM horarios 
            WHERE id = :id AND usuario_id = :usuario_id";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':id' => $horario_id,
        ':usuario_id' => $usuario_id
    ]);
    
    $horario = $stmt->fetch();
    
    if (!$horario) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Horario no encontrado'
        ]);
        exit;
    }
    
    // Decodificar el JSON de datos
    $datos = json_decode($horario['datos_json'], true);
    
    // Preparar respuesta con todos los datos
    $horario_completo = [
        'id' => $horario['id'],
        'nombre_horario' => $horario['nombre_horario'],
        'template_tipo' => $horario['template_tipo'],
        'total_clases' => $horario['total_clases'],
        'fecha_creacion' => $horario['fecha_creacion'],
        'hora_inicio' => $datos['hora_inicio'] ?? '07:00',
        'hora_fin' => $datos['hora_fin'] ?? '18:00',
        'duracion_bloque' => $datos['duracion_bloque'] ?? 60,
        'descanso' => $datos['descanso'] ?? 10,
        'dias_activos' => $datos['dias_activos'] ?? [],
        'bloques' => $datos['bloques'] ?? []
    ];
    
    echo json_encode([
        'success' => true,
        'horario' => $horario_completo
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener el horario: ' . $e->getMessage()
    ]);
}
?>