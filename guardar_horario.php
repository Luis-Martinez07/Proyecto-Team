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

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Datos inválidos']);
    exit;
}

try {
    $pdo = conectarDB();
    
    // Validar datos requeridos
    if (empty($data['nombre_horario'])) {
        throw new Exception('El nombre del horario es requerido');
    }
    
    // Preparar datos JSON para guardar
    $datos_json = json_encode([
        'hora_inicio' => $data['hora_inicio'] ?? '07:00',
        'hora_fin' => $data['hora_fin'] ?? '18:00',
        'duracion_bloque' => $data['duracion_bloque'] ?? 60,
        'descanso' => $data['descanso'] ?? 10,
        'dias_activos' => $data['dias_activos'] ?? ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'],
        'bloques' => $data['bloques'] ?? []
    ]);
    
    $usuario_id = $_SESSION['usuario_id'];
    $nombre_horario = $data['nombre_horario'];
    $template_tipo = $data['template_tipo'] ?? 'semanal';
    $total_clases = isset($data['bloques']) ? count($data['bloques']) : 0;
    
    // Si es actualización (tiene id)
    if (isset($data['id']) && !empty($data['id'])) {
        $sql = "UPDATE horarios 
                SET nombre_horario = :nombre_horario,
                    template_tipo = :template_tipo,
                    datos_json = :datos_json,
                    total_clases = :total_clases
                WHERE id = :id AND usuario_id = :usuario_id";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':nombre_horario' => $nombre_horario,
            ':template_tipo' => $template_tipo,
            ':datos_json' => $datos_json,
            ':total_clases' => $total_clases,
            ':id' => $data['id'],
            ':usuario_id' => $usuario_id
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Horario actualizado exitosamente',
            'horario_id' => $data['id']
        ]);
        
    } else {
        // Insertar nuevo horario
        $sql = "INSERT INTO horarios (usuario_id, template_tipo, nombre_horario, datos_json, total_clases) 
                VALUES (:usuario_id, :template_tipo, :nombre_horario, :datos_json, :total_clases)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':usuario_id' => $usuario_id,
            ':template_tipo' => $template_tipo,
            ':nombre_horario' => $nombre_horario,
            ':datos_json' => $datos_json,
            ':total_clases' => $total_clases
        ]);
        
        $horario_id = $pdo->lastInsertId();
        
        echo json_encode([
            'success' => true,
            'message' => 'Horario creado exitosamente',
            'horario_id' => $horario_id
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al guardar el horario: ' . $e->getMessage()
    ]);
}
?>